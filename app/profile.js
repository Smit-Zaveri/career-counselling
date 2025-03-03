import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
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
import { COLORS, FONT, SIZES, SHADOWS } from "../constants";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;

const ProfileScreen = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const modalAnimation = new Animated.Value(0);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Animations
  const headerOpacity = new Animated.Value(0);
  const profileScale = new Animated.Value(0.9);
  const optionsTranslateY = new Animated.Value(50);

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

  useEffect(() => {
    loadUserData();
    animateContent();
  }, []);

  useEffect(() => {
    if (showLogoutModal) {
      Animated.spring(modalAnimation, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showLogoutModal]);

  const animateContent = () => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(profileScale, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(optionsTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadUserData = async () => {
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

      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const userData = {
          name: data.name,
          email: auth.currentUser.email,
          photoUrl: data.photoUrl,
          createdAt: data.createdAt,
          jobsApplied: data.jobsApplied || 0,
          savedJobs: data.savedJobs || 0,
          interviews: data.interviews || 0,
          completedProfile: data.completedProfile || 70, // Profile completion percentage
        };

        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        setUserData(userData);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      const storedData = await AsyncStorage.getItem("userData");
      if (storedData) {
        setUserData(JSON.parse(storedData));
      }
    }
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
          // Don't remove isLoggedIn here as we've already set it to "false"
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
    router.push(screenName);
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

  // Interpolate animation values
  const modalTranslateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const backdropOpacity = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  // Custom Logout Modal Component
  const LogoutModal = () => {
    return (
      <Modal
        transparent={true}
        visible={showLogoutModal}
        animationType="none"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowLogoutModal(false)}>
          <Animated.View
            style={[styles.modalBackdrop, { opacity: backdropOpacity }]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: modalTranslateY }] },
          ]}
        >
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
        </Animated.View>
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
        {/* Animated Header with Gradient */}
        <Animated.View
          style={[styles.headerContainer, { opacity: headerOpacity }]}
        >
          <LinearGradient
            colors={[COLORS.primary, "#396AFC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>My Profile</Text>
          </LinearGradient>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View
          style={[styles.profileCard, { transform: [{ scale: profileScale }] }]}
        >
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

          <Text style={styles.fullName}>{userData?.name || "User Name"}</Text>
          <Text style={styles.email}>{userData?.email || ""}</Text>

          <Text style={styles.memberSince}>
            Member since{" "}
            {userData?.createdAt ? formatDate(userData.createdAt) : "N/A"}
          </Text>

          {/* Profile Completion */}
          <View style={styles.completionContainer}>
            <View style={styles.completionTextContainer}>
              <Text style={styles.completionText}>Profile Completion</Text>
              <Text style={styles.completionPercentage}>
                {userData?.completedProfile || 70}%
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${userData?.completedProfile || 70}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.statsContainer}>
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

            <View style={styles.verticalDivider}></View>

            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIconCircle,
                  { backgroundColor: "rgba(0, 119, 182, 0.1)" },
                ]}
              >
                <Icon name="bookmark-outline" size={18} color="#0077B6" />
              </View>
              <Text style={styles.statNumber}>{userData?.savedJobs || 0}</Text>
              <Text style={styles.statLabel}>Saved Jobs</Text>
            </View>

            <View style={styles.verticalDivider}></View>

            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIconCircle,
                  { backgroundColor: "rgba(39, 174, 96, 0.1)" },
                ]}
              >
                <Icon name="calendar-outline" size={18} color="#27AE60" />
              </View>
              <Text style={styles.statNumber}>{userData?.interviews || 0}</Text>
              <Text style={styles.statLabel}>Interviews</Text>
            </View>
          </View>
        </Animated.View>

        {/* Options */}
        <Animated.View
          style={[
            styles.optionsContainer,
            { transform: [{ translateY: optionsTranslateY }] },
          ]}
        >
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
        </Animated.View>

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
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    overflow: "hidden",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    ...SHADOWS.medium,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 60,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    marginTop: 10,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 20,
    ...SHADOWS.medium,
    elevation: 8,
    shadowColor: COLORS.primary,
  },
  profileImageSection: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.gray2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.small,
  },
  fullName: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large + 2,
    color: COLORS.primary,
    marginTop: 8,
  },
  email: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 2,
    color: COLORS.gray,
    marginTop: 5,
  },
  memberSince: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.secondary,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
  },
  completionContainer: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 5,
  },
  completionTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  completionText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small + 2,
    color: COLORS.primary,
  },
  completionPercentage: {
    fontFamily: FONT.bold,
    fontSize: SIZES.small + 2,
    color: COLORS.primary,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 25,
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    borderRadius: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  verticalDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  statNumber: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
  },
  statLabel: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 5,
  },
  optionsContainer: {
    marginTop: 25,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 15,
    ...SHADOWS.medium,
    shadowColor: "#000",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 10,
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
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    ...SHADOWS.small,
  },
  optionText: {
    fontSize: SIZES.medium + 1,
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },
  logoutText: {
    color: "#FF6464",
    fontFamily: FONT.bold,
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    marginTop: 30,
    alignItems: "center",
    paddingBottom: 10,
  },
  versionText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
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
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
    ...SHADOWS.medium,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalContent: {
    alignItems: "center",
    paddingVertical: 15,
  },
  logoutIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FF6464",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    ...SHADOWS.small,
  },
  logoutHeaderText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large + 4,
    color: COLORS.primary,
    marginBottom: 15,
  },
  logoutDescriptionText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  logoutButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  logoutButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    ...SHADOWS.small,
  },
  cancelButton: {
    backgroundColor: "rgb(225, 225, 225)",
  },
  confirmButton: {
    backgroundColor: "#FF6464",
  },
  cancelButtonText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  confirmButtonText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
});
