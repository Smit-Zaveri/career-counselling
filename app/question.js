import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  StatusBar,
  BackHandler,
  Keyboard,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS, FONT, SIZES } from "../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

const questions = [
  {
    id: 0,
    title: "What are you most passionate about?",
    subtitle: "You can select more than 1.",
    type: "multi-select",
    options: [
      {
        title: "Technology and innovation",
        description: "Coding, gadgets",
      },
      {
        title: "Finance",
        description: "Solving puzzles to improve business health",
      },
      {
        title: "Strategy and Operations",
        description: "Making plans and putting them into action",
      },
      {
        title: "Sales and Marketing",
        description: "Creating brands and influencing growth",
      },
    ],
  },
  {
    id: 1,
    title: "What's your goal for using CareerGenie",
    subtitle: "We will build personazined based on this goal.",
    type: "single-select",
    options: [
      "Start My Career",
      "Get Promoted",
      "Make a career change",
      "Just Exploring",
    ],
  },
  {
    id: 2,
    title: "What role do you want to be?",
    subtitle:
      "Add the job titles you're interested in to better customize your plan.",
    type: "job-search",
    searchPlaceholder: "Search Job Title",
    suggestedJobs: [
      "Portfolio Manager",
      "Account Manager",
      "Business Development Manager",
      "Financial Analyst",
      "Cybersecurity",
      "Web Developer",
      "Machine Learning Engineer",
      "Network Engineer",
      "Sales Manager",
      "QA Engineer",
    ],
  },
  {
    id: 3,
    title: "What is your work experience?",
    type: "experience-level",
    options: [
      {
        level: "Internship",
        description: "No experience",
      },
      {
        level: "Entry Level",
        description: "0-2 years experience",
      },
      {
        level: "Mid Level",
        description: "3-5 years experience",
      },
      {
        level: "Senior Level",
        description: "+5 years experience",
      },
    ],
  },
];

const Question = () => {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [buttonOpacity] = useState(new Animated.Value(1));

  // Handle back button hardware press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Handle the back button press within the question flow
        if (currentQuestion > 0) {
          goToPreviousQuestion();
          return true; // Prevent default behavior
        }
        // Allow normal back behavior if on the first question
        return false;
      }
    );

    return () => backHandler.remove();
  }, [currentQuestion]);

  // Handle keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        Animated.timing(buttonOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Filter jobs based on search text
  useEffect(() => {
    if (questions[currentQuestion].type === "job-search") {
      const filtered = questions[currentQuestion].suggestedJobs.filter((job) =>
        job.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [searchText, currentQuestion]);

  // Reset selected options when changing questions
  useEffect(() => {
    if (questions[currentQuestion].type === "multi-select") {
      setSelectedOptions(answers[currentQuestion] || []);
    } else if (questions[currentQuestion].type === "job-search") {
      setSelectedJobs(answers[currentQuestion] || []);
    }
  }, [currentQuestion]);

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleContinue = async () => {
    let newAnswers = { ...answers };

    switch (questions[currentQuestion].type) {
      case "multi-select":
        if (selectedOptions.length === 0) {
          Alert.alert("Please select at least one option");
          return;
        }
        newAnswers[currentQuestion] = selectedOptions;
        break;
      case "job-search":
        if (selectedJobs.length === 0) {
          Alert.alert("Please select at least one job");
          return;
        }
        newAnswers[currentQuestion] = selectedJobs;
        break;
      default:
        if (!newAnswers[currentQuestion]) {
          Alert.alert("Please make a selection");
          return;
        }
    }

    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSearchText("");
    } else {
      try {
        // Save all answers to Firebase
        const userId = auth.currentUser.uid;
        const userRef = doc(db, "users", userId);

        await updateDoc(userRef, {
          questionsAnswered: true, // Updated variable name to match account.js
          answers: newAnswers,
          updatedAt: new Date().toISOString(),
        });

        // Also update in AsyncStorage
        await AsyncStorage.setItem("questionsAnswered", "true");

        router.replace("home");
      } catch (error) {
        console.error("Error saving answers:", error);
        Alert.alert("Error", "Failed to save your answers. Please try again.");
      }
    }
  };

  const toggleOption = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const selectSingleOption = (option) => {
    let newAnswers = { ...answers };
    newAnswers[currentQuestion] = option;
    setAnswers(newAnswers);
  };

  const toggleJob = (job) => {
    if (selectedJobs.includes(job)) {
      setSelectedJobs(selectedJobs.filter((item) => item !== job));
    } else {
      setSelectedJobs([...selectedJobs, job]);
    }
  };

  const renderQuestionContent = () => {
    const question = questions[currentQuestion];

    switch (question.type) {
      case "multi-select":
        return (
          <>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  selectedOptions.includes(option.title) &&
                    styles.selectedOption,
                ]}
                onPress={() => toggleOption(option.title)}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
                <View style={styles.checkboxContainer}>
                  {selectedOptions.includes(option.title) ? (
                    <View style={styles.checkboxChecked}>
                      <Icon name="checkmark" size={16} color={COLORS.white} />
                    </View>
                  ) : (
                    <View style={styles.checkboxUnchecked} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </>
        );

      case "single-select":
        return (
          <>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  answers[currentQuestion] === option &&
                    styles.selectedOptionButton,
                ]}
                onPress={() => selectSingleOption(option)}
              >
                <Text
                  style={[
                    styles.singleOptionText,
                    answers[currentQuestion] === option &&
                      styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
                <View style={styles.radioContainer}>
                  <View style={styles.radioOuter}>
                    {answers[currentQuestion] === option && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        );

      case "job-search":
        return (
          <>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Icon
                  name="search"
                  size={20}
                  color={COLORS.gray}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search or enter job title"
                  value={searchText}
                  onChangeText={setSearchText}
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchText("")}>
                    <Icon name="close-circle" size={20} color={COLORS.gray} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Selected Jobs Section */}
            <View style={styles.selectedJobsSection}>
              {selectedJobs.length > 0 ? (
                <>
                  <Text style={styles.selectedJobsTitle}>Selected Jobs:</Text>
                  <View style={styles.jobsChipContainer}>
                    {selectedJobs.map((job, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.selectedJobChip}
                        onPress={() => toggleJob(job)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.selectedJobChipText}>{job}</Text>
                        <View style={styles.chipRemoveIcon}>
                          <Icon name="close" size={16} color={COLORS.white} />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : (
                <Text style={styles.noJobsSelectedText}>
                  Tap on a job title below to select it
                </Text>
              )}
            </View>

            {/* Job Categories */}
            <View style={styles.jobCategoriesContainer}>
              <Text style={styles.suggestedJobsTitle}>
                <Icon
                  name="briefcase-outline"
                  size={18}
                  color={COLORS.secondary}
                />{" "}
                Top Job Titles
              </Text>

              <View style={styles.jobChipsGrid}>
                {(searchText ? filteredJobs : question.suggestedJobs).map(
                  (job, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.jobChipChoice,
                        selectedJobs.includes(job) &&
                          styles.jobChipChoiceSelected,
                      ]}
                      onPress={() => toggleJob(job)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.jobChipText,
                          selectedJobs.includes(job) &&
                            styles.jobChipTextSelected,
                        ]}
                      >
                        {job}
                      </Text>
                      {selectedJobs.includes(job) && (
                        <View style={styles.selectedChipIcon}>
                          <Icon
                            name="checkmark"
                            size={12}
                            color={COLORS.white}
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  )
                )}

                {searchText && filteredJobs.length === 0 && (
                  <TouchableOpacity
                    style={styles.addCustomJobChip}
                    onPress={() => toggleJob(searchText)}
                    activeOpacity={0.7}
                  >
                    <Icon name="add-circle" size={16} color={COLORS.primary} />
                    <Text style={styles.addCustomJobText}>
                      Add "{searchText}"
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Info tip that replaces the no experience option */}
            <View style={styles.jobInfoTip}>
              <Icon
                name="information-circle-outline"
                size={20}
                color={COLORS.secondary}
              />
              <Text style={styles.jobInfoTipText}>
                Select jobs you're interested in, even if you have no experience
                yet
              </Text>
            </View>
          </>
        );

      case "experience-level":
        return (
          <>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.experienceLevelCard,
                  answers[currentQuestion] === option.level &&
                    styles.selectedExperienceLevel,
                ]}
                onPress={() => selectSingleOption(option.level)}
                activeOpacity={0.8}
              >
                <View style={styles.experienceIconContainer}>
                  <View
                    style={[
                      styles.expLevelIcon,
                      { backgroundColor: getExperienceBgColor(index) },
                    ]}
                  >
                    {getExperienceIcon(index)}
                  </View>
                </View>
                <View style={styles.experienceContent}>
                  <Text style={styles.experienceLevel}>{option.level}</Text>
                  <Text style={styles.experienceDescription}>
                    {option.description}
                  </Text>
                </View>
                <View style={styles.expRadioContainer}>
                  <View
                    style={[
                      styles.expRadioOuter,
                      answers[currentQuestion] === option.level &&
                        styles.expRadioOuterSelected,
                    ]}
                  >
                    {answers[currentQuestion] === option.level && (
                      <View style={styles.expRadioInner} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        );

      default:
        return null;
    }
  };

  // Helper function to get experience level icon
  const getExperienceIcon = (index) => {
    switch (index) {
      case 0: // Internship
        return <Icon name="school-outline" size={20} color="#fff" />;
      case 1: // Entry Level
        return <Icon name="trending-up" size={20} color="#fff" />;
      case 2: // Mid Level
        return <Icon name="git-branch-outline" size={20} color="#fff" />;
      case 3: // Senior Level
        return <Icon name="star-outline" size={20} color="#fff" />;
      default:
        return <Icon name="briefcase-outline" size={20} color="#fff" />;
    }
  };

  // Helper function to get experience level background color
  const getExperienceBgColor = (index) => {
    switch (index) {
      case 0:
        return "#6C63FF"; // Internship - Purple
      case 1:
        return "#3498db"; // Entry Level - Blue
      case 2:
        return "#f39c12"; // Mid Level - Orange
      case 3:
        return "#16a085"; // Senior Level - Teal
      default:
        return COLORS.primary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lightWhite} />
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          {currentQuestion > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={goToPreviousQuestion}
            >
              <Icon name="chevron-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Question {currentQuestion + 1} of {questions.length}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      ((currentQuestion + 1) / questions.length) * 100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>
            {questions[currentQuestion].title}
          </Text>
          {questions[currentQuestion].subtitle && (
            <Text style={styles.questionSubtitle}>
              {questions[currentQuestion].subtitle}
            </Text>
          )}
        </View>

        <View style={styles.optionsContainer}>{renderQuestionContent()}</View>
      </ScrollView>

      <Animated.View
        style={[
          styles.bottomButtonContainer,
          {
            opacity: buttonOpacity,
            transform: [
              {
                translateY: buttonOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, "#396AFC"]}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Icon name="arrow-forward" size={24} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  progressContainer: {
    flex: 1,
    marginVertical: SIZES.small,
  },
  progressText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small + 2,
    color: COLORS.secondary,
    marginBottom: SIZES.xSmall,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  scrollContent: {
    paddingHorizontal: SIZES.medium,
    paddingBottom: SIZES.xLarge * 4,
  },
  questionContainer: {
    marginTop: SIZES.large * 1.5,
    marginBottom: SIZES.medium,
  },
  questionTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge + 2,
    color: COLORS.primary,
    marginBottom: SIZES.small,
    lineHeight: 36,
  },
  questionSubtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    lineHeight: 22,
  },
  optionsContainer: {
    marginTop: SIZES.small,
  },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: "rgba(51, 102, 255, 0.05)",
  },
  optionContent: {
    flex: 1,
    paddingRight: SIZES.medium,
  },
  optionTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium + 1,
    color: COLORS.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 2,
    color: COLORS.gray,
  },
  checkboxContainer: {
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.2)",
  },
  checkboxChecked: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  optionButton: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  selectedOptionButton: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: "rgba(51, 102, 255, 0.05)",
  },
  singleOptionText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium + 2,
    color: COLORS.secondary,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontFamily: FONT.bold,
  },
  radioContainer: {
    padding: 2,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
  },
  continueButton: {
    marginTop: SIZES.large,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    paddingVertical: SIZES.medium + 2,
    alignItems: "center",
    borderRadius: 12,
  },
  continueButtonText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium + 2,
    color: COLORS.white,
  },
  searchContainer: {
    marginBottom: SIZES.medium,
  },
  searchInputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.medium,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    paddingVertical: 14,
    color: COLORS.primary,
  },
  selectedJobsSection: {
    marginBottom: SIZES.medium + 5,
    padding: SIZES.small + 2,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 12,
    minHeight: 60,
    justifyContent: "center",
  },
  selectedJobsTitle: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small + 2,
    color: COLORS.secondary,
    marginBottom: SIZES.small,
  },
  noJobsSelectedText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    textAlign: "center",
    fontStyle: "italic",
  },
  jobsChipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  selectedJobChip: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingLeft: SIZES.small + 1,
    paddingRight: SIZES.small,
    paddingVertical: 8,
    marginRight: SIZES.small,
    marginBottom: SIZES.xSmall,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  selectedJobChipText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium - 1,
    color: COLORS.white,
    marginRight: 8,
  },
  chipRemoveIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  jobCategoriesContainer: {
    marginVertical: SIZES.xSmall,
  },
  suggestedJobsTitle: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.secondary,
    marginBottom: SIZES.medium,
    flexDirection: "row",
    alignItems: "center",
  },
  jobChipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.small / 90,
  },
  jobChipChoice: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: SIZES.small - 1,
    marginBottom: SIZES.small,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  jobChipChoiceSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(51, 102, 255, 0.08)",
  },
  jobChipText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium - 1,
    color: COLORS.gray,
  },
  jobChipTextSelected: {
    color: COLORS.primary,
    fontFamily: FONT.bold,
  },
  selectedChipIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  addCustomJobChip: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: SIZES.small,
    marginBottom: SIZES.small,
    backgroundColor: "rgba(51, 102, 255, 0.05)",
    flexDirection: "row",
    alignItems: "center",
  },
  addCustomJobText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium - 1,
    color: COLORS.primary,
    marginLeft: 6,
  },
  jobInfoTip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(51, 102, 255, 0.05)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: SIZES.medium,
    marginBottom: SIZES.medium,
    borderWidth: 1,
    borderColor: "rgba(51, 102, 255, 0.2)",
  },
  jobInfoTipText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 2,
    color: COLORS.secondary,
    marginLeft: 10,
    flex: 1,
  },
  experienceLevelCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.medium + 2,
    marginBottom: SIZES.medium,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  selectedExperienceLevel: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: "rgba(51, 102, 255, 0.05)",
  },
  experienceIconContainer: {
    marginRight: SIZES.medium,
  },
  expLevelIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  experienceContent: {
    flex: 1,
  },
  experienceLevel: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium + 2,
    color: COLORS.primary,
    marginBottom: 4,
  },
  experienceDescription: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  expRadioContainer: {
    marginLeft: SIZES.small,
  },
  expRadioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  expRadioOuterSelected: {
    borderColor: COLORS.primary,
  },
  expRadioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.medium,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  continueButton: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gradientButton: {
    paddingVertical: SIZES.medium + 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  continueButtonText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium + 2,
    color: COLORS.white,
    marginRight: SIZES.small,
  },
});

export default Question;
