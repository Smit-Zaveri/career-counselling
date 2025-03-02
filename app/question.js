import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS, FONT, SIZES } from "../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";

const questions = [
  {
    id: 0,
    text: "What's your name?",
    type: "name",
    placeholder: "Enter your full name",
  },
  {
    id: 1,
    text: "What's your current career stage?",
    type: "options",
    options: [
      "Student",
      "Fresh Graduate",
      "Early Career",
      "Mid Career",
      "Senior Professional",
    ],
  },
  {
    id: 2,
    text: "What industry interests you the most?",
    type: "options",
    options: ["Technology", "Healthcare", "Finance", "Education", "Other"],
  },
  {
    id: 3,
    text: "What's your primary career goal?",
    type: "options",
    options: [
      "Skill Development",
      "Job Change",
      "Career Switch",
      "Leadership Role",
      "Start Business",
    ],
  },
];

const Question = () => {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState("");

  const handleAnswer = async (answer) => {
    let newAnswers = { ...answers };

    if (currentQuestion === 0) {
      // Store name locally
      await AsyncStorage.setItem("userName", answer);
      newAnswers[currentQuestion] = answer;
    } else {
      newAnswers[currentQuestion] = answer;
    }

    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      try {
        // Save all answers to Firebase
        const userId = auth.currentUser.uid;
        const userRef = doc(db, "users", userId);

        await updateDoc(userRef, {
          questionsAnswered: true,
          answers: newAnswers,
          updatedAt: new Date().toISOString(),
        });

        router.replace("home");
      } catch (error) {
        console.error("Error saving answers:", error);
        Alert.alert("Error", "Failed to save your answers. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <Text style={styles.questionText}>
          {questions[currentQuestion].text}
        </Text>

        <View style={styles.optionsContainer}>
          {questions[currentQuestion].type === "name" ? (
            <View>
              <TextInput
                style={styles.nameInput}
                placeholder={questions[currentQuestion].placeholder}
                value={name}
                onChangeText={setName}
              />
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => handleAnswer(name)}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          ) : (
            questions[currentQuestion].options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleAnswer(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
    paddingTop: 50,
  },
  scrollContent: {
    padding: SIZES.medium,
  },
  progressContainer: {
    marginBottom: SIZES.xLarge,
  },
  progressText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.secondary,
    marginBottom: SIZES.small,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray2,
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  questionText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.primary,
    marginBottom: SIZES.large,
  },
  optionsContainer: {
    gap: SIZES.medium,
  },
  optionButton: {
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    borderRadius: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.gray2,
  },
  optionText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    textAlign: "center",
  },
  nameInput: {
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    borderWidth: 1,
    borderColor: COLORS.gray2,
    fontFamily: FONT.regular,
    marginBottom: SIZES.medium,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    alignItems: "center",
  },
  nextButtonText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
  },
});

export default Question;
