import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/env";

// Initialize the Gemini API with your key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Set generation config
const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1024,
};

// Store active chat sessions
const activeChatSessions = new Map();

// Career counselor instruction - will be used as first message instead of system instruction
const CAREER_COUNSELOR_PROMPT =
  "You are a helpful career counselor assistant. Provide guidance on career paths, job searching, skill development, interview preparation, and professional development. Keep responses focused, practical, and supportive.";

export const initializeChat = (chatId = null) => {
  try {
    // Create a chat session with the model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig,
    });

    // Initialize the chat without using systemInstruction
    const chatSession = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            { text: "Please act as a career counselor for this conversation." },
          ],
        },
        {
          role: "model",
          parts: [{ text: CAREER_COUNSELOR_PROMPT }],
        },
      ],
    });

    if (chatId) {
      activeChatSessions.set(chatId, chatSession);
    }

    return chatSession;
  } catch (error) {
    console.error("Failed to initialize chat:", error);
    return null;
  }
};

export const sendMessageToGemini = async (message, chatId = null) => {
  try {
    let chatSession;

    // Use existing chat session or create a new one
    if (chatId && activeChatSessions.has(chatId)) {
      chatSession = activeChatSessions.get(chatId);
    } else {
      chatSession = initializeChat(chatId);
    }

    // Send the message to the model
    const result = await chatSession.sendMessage(message);
    const response = result.response;

    return {
      success: true,
      text: response.text(),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);

    return {
      success: false,
      text: "Sorry, I couldn't process your request. Please try again later.",
      error: error.message,
    };
  }
};

// Alternative approach without using startChat
export const sendSingleMessageToGemini = async (message) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig,
    });

    // Include the career counselor context in the prompt
    const fullPrompt = `As a career counselor: ${CAREER_COUNSELOR_PROMPT}\n\nUser question: ${message}`;

    // Send a single message
    const result = await model.generateContent(fullPrompt);
    const response = result.response;

    return {
      success: true,
      text: response.text(),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      success: false,
      text: "Sorry, I couldn't process your request. Please try again later.",
      error: error.message,
    };
  }
};

export const clearChatContext = (chatId) => {
  if (chatId && activeChatSessions.has(chatId)) {
    activeChatSessions.delete(chatId);
  }
};
