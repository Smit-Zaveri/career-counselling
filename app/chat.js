import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { COLORS, SIZES } from "../constants";
import { careerGuidanceFlow } from "../utils/aiHelper";
import { initializeChat, sendMessageToGemini } from "../utils/geminiHelper";
// Import markdown renderer
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
  const scrollViewRef = useRef();

  useEffect(() => {
    initializeChat();

    setMessages([
      {
        text: "Hi! I'm your career guidance assistant. How can I help you today?",
        isUser: false,
      },
    ]);
  }, []);

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;

    try {
      setIsLoading(true);
      setMessages((prev) => [...prev, { text, isUser: true }]);
      setInput("");

      let response;
      try {
        response = await sendMessageToGemini(text);

        if (!response.success) {
          throw new Error(response.error || "Gemini API failed");
        }
      } catch (error) {
        console.log("Gemini API failed, falling back to mock:", error);
        response = await careerGuidanceFlow(text);
      }

      setMessages((prev) => [
        ...prev,
        {
          text: response.text,
          isUser: false,
        },
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
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  const renderMessageContent = (message) => {
    if (message.isUser) {
      return <Text style={styles.userMessageText}>{message.text}</Text>;
    } else {
      return (
        <Markdown
          style={{
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
          }}
        >
          {message.text}
        </Markdown>
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {messages.map((message, index) => (
          <View
            key={index}
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
      </ScrollView>

      {messages.length === 1 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Try asking:</Text>
          {suggestedQuestions.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionButton}
              onPress={() => sendMessage(question)}
            >
              <Text style={styles.suggestionText}>{question}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
    marginBottom: 100,
  },
  messagesContainer: {
    flex: 1,
    padding: SIZES.medium,
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
  messageText: {
    fontSize: SIZES.small + 2,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.white,
  },
  aiMessageText: {
    color: COLORS.white,
  },
  inputContainer: {
    flexDirection: "row",
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
    color: COLORS.white,
    fontSize: SIZES.small + 2,
  },
  markdownH1: {
    color: COLORS.white,
    fontSize: SIZES.large + 2,
    fontWeight: "bold",
    marginVertical: SIZES.small,
  },
  markdownH2: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: "bold",
    marginVertical: SIZES.small / 2,
  },
  markdownH3: {
    color: COLORS.white,
    fontSize: SIZES.medium + 2,
    fontWeight: "bold",
    marginVertical: SIZES.small / 2,
  },
  markdownParagraph: {
    color: COLORS.white,
    fontSize: SIZES.small + 2,
    lineHeight: 22,
    marginVertical: SIZES.small / 2,
  },
  markdownList: {
    color: COLORS.white,
    marginVertical: SIZES.small / 2,
  },
  markdownListItem: {
    color: COLORS.white,
    fontSize: SIZES.small + 2,
    lineHeight: 22,
  },
  markdownCode: {
    backgroundColor: "rgba(0,0,0,0.2)",
    color: COLORS.white,
    padding: SIZES.small / 2,
    borderRadius: SIZES.small / 2,
  },
  markdownLink: {
    color: COLORS.tertiary,
    textDecorationLine: "underline",
  },
  markdownStrong: {
    fontWeight: "bold",
    color: COLORS.white,
  },
  markdownEm: {
    fontStyle: "italic",
    color: COLORS.white,
  },
});

export default Chat;
