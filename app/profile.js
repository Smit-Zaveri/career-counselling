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

                <View style={styles.statItem}>
                  <View
                    style={[
                      styles.statIconCircle,
                      { backgroundColor: "rgba(0, 119, 182, 0.1)" },
                    ]}
                  >
                    <Icon name="bookmark-outline" size={18} color="#0077B6" />
                  </View>
                  <Text style={styles.statNumber}>
                    {userData?.savedJobs || 0}
                  </Text>
                  <Text style={styles.statLabel}>Saved Jobs</Text>
                </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
    marginBottom: 35,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    overflow: "hidden",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 30,
    paddingBottom: 70,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge + 2,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: -50,
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 24,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  profileImageSection: {
    position: "relative",
    marginBottom: 18,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: COLORS.white,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: COLORS.white,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fullName: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large + 4,
    color: COLORS.primary,
    marginTop: 10,
    textAlign: "center",
  },
  email: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginTop: 6,
    textAlign: "center",
  },
  memberSince: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small + 1,
    color: COLORS.secondary,
    marginTop: 15,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
  },
  completionContainer: {
    width: "100%",
    marginTop: 25,
    paddingHorizontal: 8,
  },
  completionTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  completionText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  completionPercentage: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.primary,
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
  completionTip: {
    marginTop: 8,
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 1,
    color: COLORS.secondary,
    fontStyle: "italic",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 30,
    paddingVertical: 22,
    paddingHorizontal: 15,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  verticalDivider: {
    width: 1.5,
    height: "80%",
    backgroundColor: "rgba(0, 0, 0, 0.06)",
  },
  statNumber: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large + 2,
    color: COLORS.primary,
  },
  statLabel: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 1,
    color: COLORS.gray,
    marginTop: 6,
    textAlign: "center",
  },
  optionsContainer: {
    marginTop: 25,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  logoutRow: {
    borderBottomWidth: 0,
    marginTop: 5,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  optionText: {
    fontSize: SIZES.medium + 2,
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },
  logoutText: {
    color: "#FF5252",
    fontFamily: FONT.bold,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    marginTop: 15,
    alignItems: "center",
    paddingBottom: 15,
  },
  versionText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 1,
    color: COLORS.gray,
  },
  // Modal styles
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    opacity: 0.5,
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingBottom: 45,
    paddingHorizontal: 22,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  modalHandle: {
    width: 45,
    height: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 24,
  },
  modalContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  logoutIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF5252",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    elevation: 5,
    shadowColor: "#FF5252",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logoutHeaderText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large + 6,
    color: COLORS.primary,
    marginBottom: 15,
  },
  logoutDescriptionText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium + 1,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 15,
    lineHeight: 22,
  },
  logoutButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  logoutButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  cancelButton: {
    backgroundColor: "#F3F3F3",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  confirmButton: {
    backgroundColor: "#FF5252",
  },
  cancelButtonText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium + 1,
    color: COLORS.primary,
  },
  confirmButtonText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium + 1,
    color: COLORS.white,
  },
  // Skeleton styles
  skeletonAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray2,
    marginBottom: 18,
  },
  skeletonNameContainer: {
    alignItems: "center",
  },
  skeletonName: {
    width: 100,
    height: 20,
    backgroundColor: COLORS.gray2,
    borderRadius: 10,
    marginBottom: 6,
  },
  skeletonEmail: {
    width: 150,
    height: 16,
    backgroundColor: COLORS.gray2,
    borderRadius: 8,
    marginBottom: 15,
  },
  skeletonMember: {
    width: 120,
    height: 16,
    backgroundColor: COLORS.gray2,
    borderRadius: 8,
  },
  skeletonCompletionText: {
    width: 120,
    height: 16,
    backgroundColor: COLORS.gray2,
    borderRadius: 8,
  },
  skeletonCompletionPercentage: {
    width: 40,
    height: 16,
    backgroundColor: COLORS.gray2,
    borderRadius: 8,
  },
  skeletonProgressBar: {
    width: "100%",
    height: 10,
    backgroundColor: COLORS.gray2,
    borderRadius: 5,
  },
  skeletonStatIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.gray2,
    marginBottom: 12,
  },
  skeletonStatNumber: {
    width: 30,
    height: 20,
    backgroundColor: COLORS.gray2,
    borderRadius: 10,
    marginBottom: 6,
  },
  skeletonStatLabel: {
    width: 60,
    height: 16,
    backgroundColor: COLORS.gray2,
    borderRadius: 8,
  },
});
