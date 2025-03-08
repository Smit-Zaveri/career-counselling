import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { COLORS, SIZES } from "../constants";
import { careerGuidanceFlow } from "../utils/aiHelper";
import {
  initializeChat,
  sendMessageToGemini,
  clearChatContext,
  sendSingleMessageToGemini,
} from "../utils/geminiHelper";
import Markdown from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../firebase/config";
import {
  createChatSession,
  saveChatMessage,
  getChatSessions,
  getChatById,
  deleteChatSession, // Add this import
} from "../firebase/config";
import ChatHistoryList from "../components/chat/ChatHistoryList";
import { useRouter, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";

const suggestedQuestions = [
  "What skills are most in-demand for software developers?",
  "How to prepare for a job interview?",
  "Should I pursue a master's degree?",
  "How to transition to a tech career?",
];

const screenWidth = Dimensions.get("window").width;

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const scrollViewRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(-screenWidth)).current;
  const [errorState, setErrorState] = useState(null);
  const [emptyChatText, setEmptyChatText] = useState(
    "Start a new conversation or select from your history"
  );

  const userId = auth.currentUser?.uid;
  const router = useRouter();
  const pathname = usePathname();

  // Load chat sessions from Firestore
  const loadChatSessions = useCallback(async () => {
    if (!userId) {
      setEmptyChatText("Please log in to use the chat feature");
      return;
    }

    try {
      setLoadingChats(true);
      setErrorState(null);
      const sessions = await getChatSessions(userId);
      setChatSessions(sessions);
    } catch (error) {
      console.error("Error loading chat sessions:", error);
      setErrorState("Failed to load chat history");
      setChatSessions([]);
    } finally {
      setLoadingChats(false);
    }
  }, [userId]);

  // Initialize on component mount
  useEffect(() => {
    if (userId) {
      loadChatSessions();
    }
    return () => {};
  }, [userId, loadChatSessions, pathname]);

  // Create a new chat session - modified to use temporary IDs
  const startNewChat = useCallback(async () => {
    try {
      setMessages([]);
      setIsLoading(true);
      setErrorState(null);

      // Always start with a temporary chat ID - it will be converted to permanent when a message is sent
      const chatId = `temp_${Date.now()}`;
      setCurrentChatId(chatId);

      initializeChat(chatId);

      const welcomeMessage = {
        text: "Hi! I'm your career guidance assistant. How can I help you today?",
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setMessages([welcomeMessage]);

      // Don't save welcome message to Firestore yet - it will be saved with the first user message

      // Toggle history panel off when starting a new chat
      if (showHistory) {
        toggleHistoryPanel();
      }
    } catch (error) {
      console.error("Error starting new chat:", error);
      setErrorState("Failed to start a new chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [showHistory]);

  // Load a specific chat by ID
  const loadChat = useCallback(
    async (chatId) => {
      if (!userId || !chatId) return;

      try {
        setIsLoading(true);

        // Clear old chat context and initialize new one
        clearChatContext(currentChatId);
        initializeChat(chatId);

        const chatData = await getChatById(userId, chatId);
        if (chatData && chatData.messages) {
          setMessages(chatData.messages);
          setCurrentChatId(chatId);

          // Toggle history panel off after selecting a chat
          if (showHistory) {
            toggleHistoryPanel();
          }
        }
      } catch (error) {
        console.error("Error loading chat:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, currentChatId, showHistory]
  );

  // Toggle history panel with improved animation logic
  const toggleHistoryPanel = useCallback(() => {
    const newShowHistory = !showHistory;
    setShowHistory(newShowHistory);

    // Animate panel in or out based on newShowHistory (not the old state)
    Animated.timing(slideAnim, {
      toValue: newShowHistory ? 0 : -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showHistory, slideAnim]);

  useEffect(() => {
    // Start a new chat if we don't have one and there's no history
    if (!currentChatId && chatSessions.length === 0 && !loadingChats) {
      startNewChat();
    }
    // Load the latest chat if we have history but no current chat
    else if (!currentChatId && chatSessions.length > 0 && !loadingChats) {
      loadChat(chatSessions[0].id);
    }
  }, [currentChatId, chatSessions, loadingChats, startNewChat, loadChat]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    startNewChat();
    setRefreshing(false);
  }, [startNewChat]);

  // Send message - modified to handle temporary chat IDs
  const sendMessage = useCallback(
    async (textParam) => {
      const messageText = textParam || input;
      if (!messageText.trim()) return;

      try {
        setIsLoading(true);
        setErrorState(null);

        // Create a user message object
        const userMessage = {
          text: messageText,
          isUser: true,
          timestamp: new Date().toISOString(),
        };

        // Update UI immediately
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        // Use existing chat ID or create a temporary one
        let chatId = currentChatId || `temp_${Date.now()}`;

        // Save user message to Firestore - this will convert temporary ID to permanent if needed
        if (userId) {
          try {
            const saveResult = await saveChatMessage(
              userId,
              chatId,
              messageText,
              true
            );

            // If the chat ID changed (temp converted to permanent), update our state
            if (saveResult.success && saveResult.chatId !== chatId) {
              chatId = saveResult.chatId;
              setCurrentChatId(chatId);
            }
          } catch (error) {
            console.error("Failed to save user message:", error);
            // Continue anyway as we have the message in UI
          }
        }

        // Get response from Gemini - first try chat method
        let response;
        try {
          response = await sendMessageToGemini(messageText, chatId);
          if (!response.success) {
            throw new Error(response.error || "Gemini chat API failed");
          }
        } catch (error) {
          console.log(
            "Gemini chat API failed, trying single message method:",
            error
          );
          // Try the alternative single message method
          try {
            response = await sendSingleMessageToGemini(messageText);
            if (!response.success) {
              throw new Error(response.error || "Gemini API failed");
            }
          } catch (error2) {
            console.log(
              "All Gemini methods failed, falling back to mock:",
              error2
            );
            response = await careerGuidanceFlow(messageText);
          }
        }

        // Create assistant message object
        const assistantMessage = {
          text: response.text,
          isUser: false,
          timestamp: new Date().toISOString(),
        };

        // Update UI with assistant response
        setMessages((prev) => [...prev, assistantMessage]);

        // Save assistant response to Firestore
        if (userId && chatId) {
          try {
            await saveChatMessage(userId, chatId, response.text, false);
            // Refresh chat list to show updated titles
            loadChatSessions();
          } catch (error) {
            console.error("Failed to save assistant message:", error);
          }
        }
      } catch (error) {
        console.error("Chat Error:", error);
        setErrorState("An error occurred. Please try again.");
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, I couldn't process your request. Please try again.",
            isUser: false,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, currentChatId, userId, loadChatSessions]
  );

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  // Memoize markdown styles to avoid recreating the object on every render
  const markdownStyles = useMemo(
    () => ({
      body: styles.markdownBody,
      heading1: styles.markdownH1,
      heading2: styles.markdownH2,
      heading3: styles.markdownH3,
      paragraph: styles.markdownParagraph,
      bullet_list: styles.markdownList,
      ordered_list: styles.markdownList,
      bullet_list_item: styles.markdownListItem,
      ordered_list_item: styles.markdownListItem,
      code_block: styles.markdownCode,
      fence: styles.markdownCode,
      link: styles.markdownLink,
      strong: styles.markdownStrong,
      em: styles.markdownEm,
    }),
    []
  );

  const renderMessageContent = useCallback(
    (message) => {
      if (message.isUser) {
        return <Text style={styles.userMessageText}>{message.text}</Text>;
      }
      return <Markdown style={markdownStyles}>{message.text}</Markdown>;
    },
    [markdownStyles]
  );

  // Add the delete handler function
  const handleDeleteChat = useCallback(
    async (chatId) => {
      try {
        if (!userId) return;

        setIsLoading(true);
        const result = await deleteChatSession(userId, chatId);

        if (result.success) {
          // If we're deleting the current chat, start a new one
          if (currentChatId === chatId) {
            startNewChat();
          }

          // Refresh the chat list
          await loadChatSessions();
        } else {
          setErrorState("Failed to delete chat");
        }
      } catch (error) {
        console.error("Error deleting chat:", error);
        setErrorState("Failed to delete chat");
      } finally {
        setIsLoading(false);
      }
    },
    [userId, currentChatId, startNewChat, loadChatSessions]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={toggleHistoryPanel}
        >
          <Ionicons name="menu" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Career Assistant</Text>
        <TouchableOpacity style={styles.newChatButton} onPress={startNewChat}>
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContainer}>
        <View style={styles.container}>
          {/* Backdrop overlay when history is shown */}
          {showHistory && (
            <TouchableOpacity
              style={styles.historyBackdrop}
              activeOpacity={1}
              onPress={toggleHistoryPanel}
            />
          )}

          {/* Chat History Panel with fixed animation */}
          <Animated.View
            style={[
              styles.historyPanel,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <ChatHistoryList
              chatSessions={chatSessions}
              onSelectChat={loadChat}
              onNewChat={startNewChat}
              onDeleteChat={handleDeleteChat}
              isLoading={loadingChats}
              currentChatId={currentChatId}
            />
          </Animated.View>

          {/* Error Banner */}
          {errorState && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={COLORS.white} />
              <Text style={styles.errorText}>{errorState}</Text>
              <TouchableOpacity onPress={() => setErrorState(null)}>
                <Ionicons name="close" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}

          {/* Main Chat Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContentContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
                title="Pull to restart chat"
                titleColor={COLORS.gray}
              />
            }
          >
            {messages.length === 0 && !isLoading ? (
              <View style={styles.emptyChatContainer}>
                <Ionicons name="chatbubbles" size={60} color={COLORS.gray2} />
                <Text style={styles.emptyChatText}>{emptyChatText}</Text>
                {!userId ? (
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => router.push("login")}
                  >
                    <Text style={styles.loginButtonText}>Log In</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.startNewChatButton}
                    onPress={startNewChat}
                  >
                    <Text style={styles.startNewChatText}>Start a New Chat</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              messages.map((message, index) => (
                <View
                  key={index.toString()}
                  style={[
                    styles.messageBubble,
                    message.isUser ? styles.userMessage : styles.aiMessage,
                  ]}
                >
                  {renderMessageContent(message)}
                  {message.timestamp && (
                    <Text style={styles.messageTime}>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  )}
                </View>
              ))
            )}

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.primary} size="small" />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            )}

            {messages.length === 1 && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Try asking:</Text>
                {suggestedQuestions.map((question, index) => (
                  <TouchableOpacity
                    key={index.toString()}
                    style={styles.suggestionButton}
                    onPress={() => sendMessage(question)}
                  >
                    <Text style={styles.suggestionText}>{question}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 85}
          style={[
            styles.keyboardAvoidView,
            Platform.OS === "android" && { position: "relative" }
          ]}
        >
          <View style={[
            styles.inputContainer,
            Platform.OS === "android" && { position: "relative" }
          ]}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask about career advice..."
              placeholderTextColor={COLORS.gray}
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
              onPress={() => sendMessage()}
              disabled={isLoading}
            >
              <Ionicons name="send" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SIZES.small,
    backgroundColor: COLORS.lightWhite,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray2,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  historyButton: {
    padding: SIZES.small,
  },
  newChatButton: {
    padding: SIZES.small,
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },
  messagesContainer: {
    flex: 1,
    padding: SIZES.medium,
    paddingBottom: 80, // Increased from original
  },
  messageBubble: {
    maxWidth: "80%",
    padding: SIZES.medium,
    marginVertical: SIZES.small,
    borderRadius: SIZES.small,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.gray2,
  },
  userMessageText: {
    color: COLORS.white,
    fontSize: SIZES.small + 2,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: SIZES.small - 2,
    color: COLORS.gray,
    alignSelf: "flex-end",
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: "row",
    padding: SIZES.medium,
    paddingBottom: Platform.OS === "ios" ? SIZES.medium : SIZES.medium,
    backgroundColor: COLORS.lightWhite,
    zIndex: 1000,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.small,
    borderRadius: SIZES.large,
    marginRight: SIZES.small,
    maxHeight: 100,
    paddingLeft: SIZES.medium,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: COLORS.white,
  },
  suggestionsContainer: {
    position: "relative",
    alignSelf: "flex-end",
    borderRadius: SIZES.small,
    padding: SIZES.medium,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  suggestionsTitle: {
    fontWeight: "bold",
    marginBottom: SIZES.small,
    color: COLORS.secondary,
  },
  suggestionButton: {
    backgroundColor: COLORS.lightWhite,
    padding: SIZES.small,
    borderRadius: SIZES.small,
    marginBottom: SIZES.small,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  suggestionText: {
    color: COLORS.primary,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    padding: SIZES.small,
    marginLeft: SIZES.small,
  },
  loadingText: {
    marginLeft: 10,
    color: COLORS.gray,
  },
  markdownBody: {
    color: "black",
    fontSize: SIZES.small + 2,
  },
  markdownH1: {
    color: "black",
    fontSize: SIZES.large + 2,
    fontWeight: "bold",
    marginVertical: SIZES.small,
  },
  markdownH2: {
    color: "black",
    fontSize: SIZES.large,
    fontWeight: "bold",
    marginVertical: SIZES.small / 2,
  },
  markdownH3: {
    color: "black",
    fontSize: SIZES.medium + 2,
    fontWeight: "bold",
    marginVertical: SIZES.small / 2,
  },
  markdownParagraph: {
    color: "black",
    fontSize: SIZES.small + 2,
    lineHeight: 22,
    marginVertical: SIZES.small / 2,
  },
  markdownList: {
    color: "black",
    marginVertical: SIZES.small / 2,
  },
  markdownListItem: {
    color: "black",
    fontSize: SIZES.small + 2,
    lineHeight: 22,
  },
  markdownCode: {
    backgroundColor: "rgba(0,0,0,0.2)",
    color: "black",
    padding: SIZES.small / 2,
    borderRadius: SIZES.small / 2,
  },
  markdownLink: {
    color: COLORS.tertiary,
    textDecorationLine: "underline",
  },
  markdownStrong: {
    fontWeight: "bold",
    color: "black",
  },
  markdownEm: {
    fontStyle: "italic",
    color: "black",
  },
  errorBanner: {
    backgroundColor: COLORS.error || "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: SIZES.medium,
  },
  errorText: {
    color: COLORS.white,
    flex: 1,
    marginHorizontal: 10,
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.large,
    marginTop: 120,
  },
  emptyChatText: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    textAlign: "center",
    marginVertical: SIZES.medium,
  },
  startNewChatButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.large,
    borderRadius: SIZES.medium,
    marginTop: SIZES.small,
  },
  startNewChatText: {
    color: COLORS.white,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: COLORS.tertiary || COLORS.primary,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.large,
    borderRadius: SIZES.medium,
    marginTop: SIZES.small,
  },
  loginButtonText: {
    color: COLORS.white,
    fontWeight: "500",
  },
  historyBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 5,
  },

  historyPanel: {
    position: "absolute",
    top: 0,
    left: 0, // Changed from -screenWidth to 0
    width: screenWidth * 0.7, // Increased from 0.75 to 0.8 for better visibility
    height: "100%",
    backgroundColor: "transparent",
    zIndex: 15, // Increased z-index to ensure it's above the backdrop
    // shadowColor: "#000",
    // shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // elevation: 8, // Increased elevation for better shadow on Android
  },
  keyboardAvoidView: {
    backgroundColor: COLORS.lightWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray2,
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
    marginBottom: Platform.OS === "ios" ? 60 : 85, // Increased bottom margin for Android
  },
  messagesContentContainer: {
    flexGrow: 1,
    paddingBottom: 120, // Adjusted padding to prevent content from being hidden
  },
});

export default Chat;
