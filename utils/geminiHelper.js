import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/env";

// Initialize the Gemini API with your key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Configure the model - using gemini-pro which is more widely available
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro", // Updated model name
  // System instruction will be applied in the prompt instead
});

// Set generation config
const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1024,
};

// Chat history to maintain context
let chatSession = null;

export const initializeChat = () => {
  try {
    // Initialize a new chat session with simplified approach
    return model;
  } catch (error) {
    console.error("Failed to initialize chat:", error);
    return null;
  }
};

export const sendMessageToGemini = async (message) => {
  try {
    // Use simple generate content approach
    const prompt = `As a career guidance counselor, please provide helpful advice about: ${message}`;

    const result = await model.generateContent(prompt);
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
