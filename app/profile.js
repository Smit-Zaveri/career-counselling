import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  BackHandler,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONT, SIZES } from "../constants";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";
import { getSavedJobsCount } from "../firebase/jobServices";

import styles from "./style/profileStyle";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;

// Data-specific skeleton components
const SkeletonUserInfo = () => (
  <View style={styles.profileImageSection}>
    <View style={styles.skeletonAvatar} />
    <View style={styles.skeletonNameContainer}>
      <View style={styles.skeletonName} />
      <View style={styles.skeletonEmail} />
      <View style={styles.skeletonMember} />
    </View>
  </View>
);

const SkeletonProfileCompletion = () => (
  <View style={styles.completionContainer}>
    <View style={styles.completionTextContainer}>
      <View style={styles.skeletonCompletionText} />
      <View style={styles.skeletonCompletionPercentage} />
    </View>
    <View style={styles.skeletonProgressBar} />
  </View>
);

const SkeletonStatsItem = () => (
  <View style={styles.statItem}>
    <View style={styles.skeletonStatIcon} />
    <View style={styles.skeletonStatNumber} />
    <View style={styles.skeletonStatLabel} />
  </View>
);

const ProfileScreen = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [profileDataLoading, setProfileDataLoading] = useState(true);
  const [savedJobsCount, setSavedJobsCount] = useState(0);

  // Check authentication status on screen focus
  useFocusEffect(
    React.useCallback(() => {
      const checkAuthStatus = async () => {
        const authStatus = await AsyncStorage.getItem("isLoggedIn");
        if (authStatus !== "true") {
          router.replace("login");
          return;
        }
        setIsAuthenticated(true);
      };

      checkAuthStatus();

      // Handle hardware back button to prevent navigating back after logout
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (!isAuthenticated) {
            // If not authenticated, don't allow going back
            router.replace("login");
            return true;
          }
          return false;
        }
      );

      return () => {
        backHandler.remove();
      };
    }, [isAuthenticated])
  );

  // Add useFocusEffect to refresh data when profile is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log("Profile screen focused, reloading data");
      loadUserData();
      loadSavedJobsCount();
      return () => {
        // Any cleanup needed
      };
    }, [])
  );

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setProfileDataLoading(true);
    setStatsLoading(true);
    try {
      // Check if user is authenticated first
      const authStatus = await AsyncStorage.getItem("isLoggedIn");
      if (authStatus !== "true") {
        setIsAuthenticated(false);
        router.replace("login");
        return;
      }

      const userId = auth.currentUser?.uid;
      if (!userId) {
        setIsAuthenticated(false);
        router.replace("login");
        return;
      }

      const cachedData = await AsyncStorage.getItem("userData");
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        // Temporarily set cached data while fetching latest
        setUserData(parsed);
        // Basic profile data can be shown from cache immediately
        setProfileDataLoading(false);
      }

      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const userData = {
          name: data.name || "User Name",
          email: auth.currentUser.email || "email@example.com",
          photoUrl: data.photoUrl,
          createdAt: data.createdAt,
          jobsApplied: data.jobsApplied || 0,
          savedJobs: data.savedJobs || 0,
          interviews: data.interviews || 0,
          completedProfile:
            data.completedProfile || calculateProfileCompletion(data),
          jobPreferences: data.jobPreferences || [],
          skills: data.skills || [],
          experience: data.experience || "Not specified",
          education: data.education || "Not specified",
        };

        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        setUserData(userData);
        setProfileDataLoading(false);

        // Give stats a bit more time to simulate real-world network conditions
        setTimeout(() => {
          setStatsLoading(false);
          setIsLoading(false);
        }, 300);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      const storedData = await AsyncStorage.getItem("userData");
      if (storedData) {
        setUserData(JSON.parse(storedData));
      }
      setProfileDataLoading(false);
      setStatsLoading(false);
      setIsLoading(false);
    }
  };

  // Add a function to load saved jobs count
  const loadSavedJobsCount = async () => {
    try {
      const count = await getSavedJobsCount();
      setSavedJobsCount(count);
      console.log("Saved jobs count:", count);
    } catch (error) {
      console.error("Error getting saved jobs count:", error);
    }
  };

  // Updated profile completion calculation to match EditProfileScreen
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

  const goToEditProfile = () => {
    if (!isAuthenticated) {
      router.replace("login");
      return;
    }
    router.push("EditProfileScreen");
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    setTimeout(async () => {
      try {
        // Set authentication status to false first to prevent back navigation
        setIsAuthenticated(false);
        await AsyncStorage.setItem("isLoggedIn", "false");

        await signOut(auth);
        await AsyncStorage.multiRemove([
          "user",
          "userData",
          "hasCompletedQuestions",
        ]);

        // Clear navigation history and replace with login screen
        router.replace("login");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }, 300); // Small delay for modal animation
  };

  // Navigation with auth check
  const navigateToScreen = (screenName) => {
    if (!isAuthenticated) {
      router.replace("login");
      return;
    }

    console.log(`Navigating to: ${screenName}`);

    // Ensure we use the correct path format for navigation
    try {
      router.push(`/${screenName}`);
    } catch (error) {
      console.error(`Navigation error to ${screenName}:`, error);
      // Try alternative path format if the first one fails
      router.push(screenName);
    }
  };

  const navigateToSavedJobs = () => {
    if (!isAuthenticated) {
      router.replace("login");
      return;
    }

    console.log("Navigating to saved jobs");

    // Try different navigation approaches to ensure it works
    try {
      router.push("SavedJobs"); // First attempt without slash
    } catch (error) {
      console.error("First navigation attempt failed:", error);
      try {
        router.push("/SavedJobs"); // Second attempt with slash
      } catch (error2) {
        console.error("Second navigation attempt failed:", error2);
        try {
          // Third attempt using the navigate method if available
          router.navigate("SavedJobs");
        } catch (error3) {
          console.error("All navigation attempts failed:", error3);
          Alert.alert("Navigation Error", "Could not navigate to Saved Jobs");
        }
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Custom Logout Modal Component
  const LogoutModal = () => {
    return (
      <Modal
        transparent={true}
        visible={showLogoutModal}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowLogoutModal(false)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />

          <View style={styles.modalContent}>
            <View style={styles.logoutIconContainer}>
              <Icon name="log-out-outline" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.logoutHeaderText}>Logout</Text>
            <Text style={styles.logoutDescriptionText}>
              Are you sure you want to logout from your account?
            </Text>

            <View style={styles.logoutButtonsContainer}>
              <TouchableOpacity
                style={[styles.logoutButton, styles.cancelButton]}
                activeOpacity={0.7}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.logoutButton, styles.confirmButton]}
                activeOpacity={0.7}
                onPress={handleLogout}
              >
                <Text style={styles.confirmButtonText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // If not authenticated, don't render the profile content
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[COLORS.primary, "#396AFC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>My Profile</Text>
          </LinearGradient>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* User basic info - show skeleton while loading */}
          {profileDataLoading ? (
            <SkeletonUserInfo />
          ) : (
            <>
              <View style={styles.profileImageSection}>
                {userData?.photoUrl ? (
                  <Image
                    source={{ uri: userData.photoUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Icon name="person" size={40} color={COLORS.white} />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={goToEditProfile}
                >
                  <Icon name="pencil" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <Text style={styles.fullName}>
                {userData?.name || "User Name"}
              </Text>
              <Text style={styles.email}>{userData?.email || ""}</Text>

              <Text style={styles.memberSince}>
                Member since{" "}
                {userData?.createdAt ? formatDate(userData.createdAt) : "N/A"}
              </Text>
            </>
          )}

          {/* Profile Completion - show skeleton while loading */}
          {profileDataLoading ? (
            <SkeletonProfileCompletion />
          ) : (
            <View style={styles.completionContainer}>
              <View style={styles.completionTextContainer}>
                <Text style={styles.completionText}>Profile Completion</Text>
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
                  Complete your profile to improve visibility to employers
                </Text>
              )}
            </View>
          )}

          {/* Stats Container - show skeleton while loading */}
          <View style={styles.statsContainer}>
            {statsLoading ? (
              <>
                <SkeletonStatsItem />
                <View style={styles.verticalDivider} />
                <SkeletonStatsItem />
                <View style={styles.verticalDivider} />
                <SkeletonStatsItem />
              </>
            ) : (
              <>
                <View style={styles.statItem}>
                  <View
                    style={[
                      styles.statIconCircle,
                      { backgroundColor: "rgba(90, 24, 154, 0.1)" },
                    ]}
                  >
                    <Icon name="briefcase-outline" size={18} color="#5A189A" />
                  </View>
                  <Text style={styles.statNumber}>
                    {userData?.jobsApplied || 0}
                  </Text>
                  <Text style={styles.statLabel}>Jobs Applied</Text>
                </View>

                <View style={styles.verticalDivider} />

                <TouchableOpacity
                  style={styles.statItem}
                  onPress={navigateToSavedJobs}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.statIconCircle,
                      { backgroundColor: "rgba(0, 119, 182, 0.1)" },
                    ]}
                  >
                    <Icon name="bookmark-outline" size={18} color="#0077B6" />
                  </View>
                  <Text style={styles.statNumber}>{savedJobsCount}</Text>
                  <Text style={styles.statLabel}>Saved Jobs</Text>
                </TouchableOpacity>

                <View style={styles.verticalDivider} />

                <View style={styles.statItem}>
                  <View
                    style={[
                      styles.statIconCircle,
                      { backgroundColor: "rgba(39, 174, 96, 0.1)" },
                    ]}
                  >
                    <Icon name="calendar-outline" size={18} color="#27AE60" />
                  </View>
                  <Text style={styles.statNumber}>
                    {userData?.interviews || 0}
                  </Text>
                  <Text style={styles.statLabel}>Interviews</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* My Account */}
          <TouchableOpacity
            style={styles.optionRow}
            activeOpacity={0.7}
            onPress={() => navigateToScreen("account")}
          >
            <View style={styles.optionLeft}>
              <View
                style={[styles.iconBackground, { backgroundColor: "#6C63FF" }]}
              >
                <Icon
                  name="person-circle-outline"
                  size={22}
                  color={COLORS.white}
                />
              </View>
              <Text style={styles.optionText}>My Account</Text>
            </View>
            <View style={styles.arrowContainer}>
              <Icon name="chevron-forward" size={18} color={COLORS.white} />
            </View>
          </TouchableOpacity>

          {/* Activity History */}
          <TouchableOpacity
            style={styles.optionRow}
            activeOpacity={0.7}
            onPress={() => navigateToScreen("history")}
          >
            <View style={styles.optionLeft}>
              <View
                style={[styles.iconBackground, { backgroundColor: "#47B5FF" }]}
              >
                <Icon name="time-outline" size={22} color={COLORS.white} />
              </View>
              <Text style={styles.optionText}>Activity History</Text>
            </View>
            <View style={styles.arrowContainer}>
              <Icon name="chevron-forward" size={18} color={COLORS.white} />
            </View>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={styles.optionRow}
            activeOpacity={0.7}
            onPress={() => navigateToScreen("settings")}
          >
            <View style={styles.optionLeft}>
              <View
                style={[styles.iconBackground, { backgroundColor: "#38E54D" }]}
              >
                <Icon name="settings-outline" size={22} color={COLORS.white} />
              </View>
              <Text style={styles.optionText}>Settings</Text>
            </View>
            <View style={styles.arrowContainer}>
              <Icon name="chevron-forward" size={18} color={COLORS.white} />
            </View>
          </TouchableOpacity>

          {/* Log out */}
          <TouchableOpacity
            style={[styles.optionRow, styles.logoutRow]}
            activeOpacity={0.7}
            onPress={() => setShowLogoutModal(true)}
          >
            <View style={styles.optionLeft}>
              <View
                style={[styles.iconBackground, { backgroundColor: "#FF6464" }]}
              >
                <Icon name="log-out-outline" size={22} color={COLORS.white} />
              </View>
              <Text style={[styles.optionText, styles.logoutText]}>
                Log out
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Render the logout modal */}
      <LogoutModal />
    </SafeAreaView>
  );
};

export default ProfileScreen;
