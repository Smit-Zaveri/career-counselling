// Mock implementation for career guidance
const mockResponses = {
  // Career paths
  career:
    "Based on your interests, consider these career paths:\n\n1. Software Development\n2. Data Science\n3. Product Management\n4. UX/UI Design\n5. Digital Marketing\n\nEach has different skill requirements and growth trajectories. What specific aspect interests you most?",

  // Skills development
  skills:
    "To enhance your employability, focus on these skill areas:\n\n1. Technical: Programming, data analysis, cloud technologies\n2. Soft skills: Communication, leadership, problem-solving\n3. Industry knowledge: Stay updated with trends\n4. Project management: Agile/Scrum methodologies\n\nWhich area would you like specific recommendations for?",

  // Interview preparation
  interview:
    "For interview preparation:\n\n1. Research the company thoroughly\n2. Prepare STAR method stories for behavioral questions\n3. Practice technical questions relevant to your field\n4. Prepare thoughtful questions to ask interviewers\n5. Follow up with a thank-you note\n\nMock interviews with friends can significantly boost your confidence.",

  // Education
  education:
    "For career advancement through education:\n\n1. Degree programs: Consider ROI before committing\n2. Certifications: Industry-recognized credentials can boost your resume\n3. Online courses: Platforms like Coursera and Udemy offer flexible learning\n4. Bootcamps: Intensive, short-term programs for specific skills\n\nWhat's your current educational background?",

  // Default response
  default:
    "I'm your career guidance assistant. I can help with:\n\n• Career path suggestions\n• Skill development advice\n• Job search strategies\n• Interview preparation\n• Résumé and portfolio feedback\n• Networking tips\n\nWhat specific career guidance are you looking for today?",
};

export const careerGuidanceFlow = async (message) => {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple keyword matching for demo purposes
    const lowerMessage = message.toLowerCase();
    let responseText = mockResponses.default;

    // Check if message contains keywords
    if (
      lowerMessage.includes("career") ||
      lowerMessage.includes("job") ||
      lowerMessage.includes("profession")
    ) {
      responseText = mockResponses.career;
    } else if (
      lowerMessage.includes("skill") ||
      lowerMessage.includes("learn") ||
      lowerMessage.includes("improve")
    ) {
      responseText = mockResponses.skills;
    } else if (
      lowerMessage.includes("interview") ||
      lowerMessage.includes("hire")
    ) {
      responseText = mockResponses.interview;
    } else if (
      lowerMessage.includes("education") ||
      lowerMessage.includes("degree") ||
      lowerMessage.includes("study")
    ) {
      responseText = mockResponses.education;
    }

    return {
      success: true,
      text: responseText,
    };
  } catch (error) {
    console.error("AI Generation Error:", error);

    return {
      success: false,
      text: "Sorry, I couldn't process your request. Please try again later.",
    };
  }
};
