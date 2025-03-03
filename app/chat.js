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
} from "react-native";
import { COLORS, SIZES } from "../constants";
import { careerGuidanceFlow } from "../utils/aiHelper";
import { initializeChat, sendMessageToGemini } from "../utils/geminiHelper";
import Markdown from "react-native-markdown-display";

const suggestedQuestions = [
  "What skills are most in-demand for software developers?",
  "How to prepare for a job interview?",
  "Should I pursue a master's degree?",
  "How to transition to a tech career?",
];

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef(null);

  // Initialize a new chat session
  const startNewChat = useCallback(() => {
    initializeChat();
    setMessages([
      {
        text: "Hi! I'm your career guidance assistant. How can I help you today?",
        isUser: false,
      },
    ]);
  }, []);

  useEffect(() => {
    startNewChat();
  }, [startNewChat]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    startNewChat();
    setRefreshing(false);
  }, [startNewChat]);

  const sendMessage = useCallback(
    async (textParam) => {
      const messageText = textParam || input;
      if (!messageText.trim()) return;

      try {
        setIsLoading(true);
        setMessages((prev) => [...prev, { text: messageText, isUser: true }]);
        setInput("");

        let response;
        try {
          response = await sendMessageToGemini(messageText);
          if (!response.success) {
            throw new Error(response.error || "Gemini API failed");
          }
        } catch (error) {
          console.log("Gemini API failed, falling back to mock:", error);
          response = await careerGuidanceFlow(messageText);
        }

        setMessages((prev) => [
          ...prev,
          { text: response.text, isUser: false },
        ]);
      } catch (error) {
        console.error("Chat Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, I couldn't process your request. Please try again.",
            isUser: false,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input]
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={{ paddingBottom: 20 }}
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
          {messages.map((message, index) => (
            <View
              key={index.toString()}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userMessage : styles.aiMessage,
              ]}
            >
              {renderMessageContent(message)}
            </View>
          ))}
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

        <View style={styles.inputContainer}>
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
            <Text style={styles.sendButtonText}>
              {isLoading ? "..." : "Send"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
    marginBottom: 84,
  },
  messagesContainer: {
    flex: 1,
    padding: SIZES.medium,
    marginBottom: 84,
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
  inputContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.lightWhite,
    padding: SIZES.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray2,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.small,
    borderRadius: SIZES.small,
    marginRight: SIZES.small,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    justifyContent: "center",
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
});

export default Chat;
