// This file implements OpenAI API integration for the career guidance chatbot

const OPENAI_API_KEY =
  "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"; // Replace with your actual API key
const API_URL = "https://api.openai.com/v1/chat/completions";

export const getCareerGuidance = async (message) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional career counselor specializing in helping people with career guidance, skill development, and job search strategies.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return {
      success: true,
      text: data.choices[0]?.message?.content || "No response available.",
    };
  } catch (error) {
    console.error("OpenAI Error:", error);
    return {
      success: false,
      text: "Sorry, I couldn't process your request. Please try again later.",
    };
  }
};
