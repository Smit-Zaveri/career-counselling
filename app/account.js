import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS, FONT, SIZES } from "../constants";
import { auth, db } from "../firebase/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const AccountScreen = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Add useFocusEffect to reload data whenever screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log("Account screen focused, reloading data");
      loadUserData();
      return () => {
        // Cleanup if needed when screen loses focus
      };
    }, [])
  );

  useEffect(() => {
    console.log("AccountScreen mounted");
    // Initial load happens via useFocusEffect

    return () => {
      // Cleanup animations when component unmounts
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    };
  }, []);

  // Separate effect for animations to ensure they run after data loading
  useEffect(() => {
    if (!isLoading && userData) {
      console.log("Starting animations");
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, userData]);

  // Helper function to calculate profile completion
  const calculateProfileCompletion = (data) => {
    let totalScore = 0;
    let maxScore = 100; // Total possible score

    // Basic information - 40%
    if (data.name && data.name.trim().length > 0) totalScore += 10;
    if (data.email && data.email.trim().length > 0) totalScore += 5;
    if (data.photoUrl) totalScore += 15;
    if (data.phone && data.phone.trim().length > 0) totalScore += 10;

    // Education & Experience - 30%
    if (data.education && data.education.trim().length > 0) totalScore += 15;
    if (data.experience && data.experience.trim().length > 0) totalScore += 15;

    // Skills - 15%
    if (data.skills && data.skills.length > 0) {
      // More skills, higher score (up to 15%)
      totalScore += Math.min(data.skills.length * 3, 15);
    }

    // Job preferences - 15%
    if (data.jobPreferences && data.jobPreferences.length > 0) {
      // More preferences, higher score (up to 15%)
      totalScore += Math.min(data.jobPreferences.length * 5, 15);
    }

    // Calculate final percentage
    return Math.round((totalScore / maxScore) * 100);
  };

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      console.log("Loading user data");

      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.log("No current user ID found");
        router.replace("login");
        return;
      }

      // Try to load data from AsyncStorage first for a quick display
      try {
        const cachedData = await AsyncStorage.getItem("userData");
        if (cachedData) {
          const parsedCache = JSON.parse(cachedData);
          // Show cached data while we fetch the latest
          setUserData({
            ...parsedCache,
            phone: parsedCache.phone || "Not provided",
            jobPreferences: parsedCache.jobPreferences || [],
            skills: parsedCache.skills || [],
            experience: parsedCache.experience || "Not specified",
            education: parsedCache.education || "Not specified",
            questionsAnswered: parsedCache.questionsAnswered || false,
            // Recalculate completion percentage to ensure it's updated
            completedProfile: parsedCache.completedProfile || 0,
          });
        }
      } catch (cacheError) {
        console.log("Error loading from cache:", cacheError);
      }

      // Now load from Firestore for latest data
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log("Firestore data fetched successfully");

        // Calculate profile completion using the updated method
        const profileCompletion =
          data.completedProfile || calculateProfileCompletion(data);

        const updatedUserData = {
          name: data.name || "User Name",
          email: auth.currentUser.email || "Not available",
          photoUrl: data.photoUrl,
          phone: data.phone || "Not provided",
          jobPreferences: data.jobPreferences || [],
          skills: data.skills || [],
          experience: data.experience || "Not specified",
          education: data.education || "Not specified",
          questionsAnswered: data.questionsAnswered || false,
          completedProfile: profileCompletion,
        };

        // Update AsyncStorage cache with latest completion percentage
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
      } else {
        console.log("No user document found");
        setUserData({
          name: "User",
          email: auth.currentUser.email || "Not available",
          photoUrl: null,
          phone: "Not provided",
          jobPreferences: [],
          skills: [],
          experience: "Not specified",
          education: "Not specified",
          questionsAnswered: false,
          completedProfile: 0,
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert(
        "Error",
        "Failed to load account information. Please try again."
      );
    } finally {
      setIsLoading(false);
      console.log("Finished loading user data");
    }
  };

  const handleResetQuestions = () => {
    Alert.alert(
      "Reset Profile Questions",
      "Would you like to re-answer all profile setup questions? This will help improve your job recommendations.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset & Continue", onPress: resetQuestionsAndNavigate },
      ]
    );
  };

  const resetQuestionsAndNavigate = async () => {
    try {
      setIsLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert("Error", "User not authenticated");
        setIsLoading(false);
        return;
      }

      // Update user document to mark questions as not completed
      await updateDoc(doc(db, "users", userId), {
        questionsAnswered: false, // Updated from hasCompletedQuestions to questionsAnswered
      });

      // Remove the question completion flag from AsyncStorage
      await AsyncStorage.removeItem("questionsAnswered"); // Updated from hasCompletedQuestions

      // Navigate to the questions screen
      console.log("Navigating to questions screen");
      router.push("/question");
    } catch (error) {
      console.error("Error resetting questions:", error);
      Alert.alert(
        "Error",
        "Failed to reset profile questions. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading account information...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, "#396AFC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Account</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Profile Summary */}
          <View style={styles.profileSummary}>
            <View style={styles.profileImageContainer}>
              {userData?.photoUrl ? (
                <Image
                  source={{ uri: userData.photoUrl }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Icon name="person" size={40} color={COLORS.white} />
                </View>
              )}
            </View>

            <View style={styles.profileTextContainer}>
              <Text style={styles.profileName}>{userData?.name}</Text>
              <Text style={styles.profileEmail}>{userData?.email}</Text>
              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={() => router.push("EditProfileScreen")}
              >
                <Text style={styles.editProfileButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Completion Indicator */}
          <View style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionTitle}>Profile Completion</Text>
              <Text style={styles.completionPercentage}>
                {userData?.completedProfile || 0}%
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${userData?.completedProfile || 0}%` },
                ]}
              />
            </View>
            {userData?.completedProfile < 70 && (
              <Text style={styles.completionTip}>
                Complete your profile to improve job match recommendations
              </Text>
            )}
          </View>

          {/* Account Info Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Account Information</Text>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="call-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{userData?.phone}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="school-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Education</Text>
                <Text style={styles.infoValue}>{userData?.education}</Text>
              </View>
            </View>

            <View
              style={[
                styles.infoItem,
                { borderBottomWidth: 0, marginBottom: -10 },
              ]}
            >
              <View style={styles.infoIconContainer}>
                <Icon
                  name="briefcase-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Experience</Text>
                <Text style={styles.infoValue}>{userData?.experience}</Text>
              </View>
            </View>
          </View>

          {/* Job Preferences Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Job Preferences</Text>

            <View style={styles.tagsContainer}>
              {userData?.jobPreferences &&
              userData.jobPreferences.length > 0 ? (
                userData.jobPreferences.map((preference, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{preference}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>
                  No job preferences specified
                </Text>
              )}
            </View>
          </View>

          {/* Skills Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Skills</Text>

            <View style={styles.tagsContainer}>
              {userData?.skills && userData.skills.length > 0 ? (
                userData.skills.map((skill, index) => (
                  <View key={index} style={[styles.tag, styles.skillTag]}>
                    <Text style={styles.tagText}>{skill}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No skills specified</Text>
              )}
            </View>
          </View>

          {/* Profile Questions Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.questionsHeaderRow}>
              <Text style={styles.sectionTitle}>Profile Setup Questions</Text>
              <View
                style={[
                  styles.statusBadge,
                  userData?.questionsAnswered
                    ? styles.completedBadge
                    : styles.incompleteBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    userData?.questionsAnswered
                      ? styles.completedText
                      : styles.incompleteText,
                  ]}
                >
                  {userData?.questionsAnswered ? "Completed" : "Incomplete"}
                </Text>
              </View>
            </View>

            <Text style={styles.questionDescription}>
              Answer profile questions to help us personalize your job
              recommendations and improve your profile completeness score.
            </Text>

            <TouchableOpacity
              style={styles.resetQuestionsButton}
              onPress={handleResetQuestions}
            >
              <Icon name="refresh" size={20} color={COLORS.white} />
              <Text style={styles.resetButtonText}>
                {userData?.questionsAnswered
                  ? "Re-Answer Questions"
                  : "Answer Questions"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
    marginBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightWhite,
  },
  loadingText: {
    marginTop: 10,
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 10,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: SIZES.large + 2,
    fontFamily: FONT.bold,
    color: COLORS.white,
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  mainContent: {
    padding: 16,
  },
  profileSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  completionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  completionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  completionPercentage: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  completionTip: {
    marginTop: 10,
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 1,
    color: COLORS.secondary,
    fontStyle: "italic",
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray2, // Fallback background
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray2,
    justifyContent: "center",
    alignItems: "center",
  },
  profileTextContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: SIZES.small + 2,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginBottom: 12,
  },
  editProfileButton: {
    backgroundColor: "rgba(0, 112, 243, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  editProfileButtonText: {
    fontSize: SIZES.small + 1,
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },
  sectionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  sectionTitle: {
    fontSize: SIZES.medium + 2,
    fontFamily: FONT.bold,
    color: COLORS.primary,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 112, 243, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: SIZES.small + 2,
    fontFamily: FONT.medium,
    color: COLORS.gray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.primary,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "rgba(0, 112, 243, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  skillTag: {
    backgroundColor: "rgba(39, 174, 96, 0.1)",
  },
  tagText: {
    fontSize: SIZES.small + 1,
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },
  noDataText: {
    fontSize: SIZES.medium - 1,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    fontStyle: "italic",
  },
  questionsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  completedBadge: {
    backgroundColor: "rgba(39, 174, 96, 0.1)",
  },
  incompleteBadge: {
    backgroundColor: "rgba(255, 100, 100, 0.1)",
  },
  statusText: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
  },
  completedText: {
    color: "#27AE60",
  },
  incompleteText: {
    color: "#FF6464",
  },
  questionDescription: {
    fontSize: SIZES.small + 2,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    lineHeight: 22,
    marginBottom: 20,
  },
  resetQuestionsButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
  },
  resetButtonText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.white,
    marginLeft: 8,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
});
