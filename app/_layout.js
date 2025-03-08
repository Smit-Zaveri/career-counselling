import "../firebase/polyfills";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  BackHandler,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import ScreenBottom from "../components/common/bottom/ScreenBottom";
import { COLORS, icons, images, SIZES } from "../constants";
import ScreenHeaderBtn from "../components/common/header/ScreenHeaderBtn";
import { AuthProvider } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ExitConfirmationPopup from "../components/common/popup/ExitConfirmationPopup";
import { NavigationContainer } from "@react-navigation/native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { Ionicons } from "@expo/vector-icons";

export const unstable_settings = {
  initialRouteName: "home",
};

// Create a custom navigation container that uses expo-router's underlying navigation
const CustomNavigationContainer = ({ children }) => {
  return (
    <NavigationContainer independent={true}>{children}</NavigationContainer>
  );
};

const Layout = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [previousMainScreen, setPreviousMainScreen] = useState("home");
  const currentScreen = pathname?.slice(1) || "home";
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState(["home"]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Define screens that don't require authentication
  const publicScreens = [
    "login",
    "register",
    "forgot-password",
    "question",
    "index",
  ];

  // All other screens require authentication
  const isProtectedRoute = !publicScreens.includes(currentScreen);

  // Update navigation history when path changes
  useEffect(() => {
    if (currentScreen && currentScreen !== navigationHistory[0]) {
      setNavigationHistory((prev) => [currentScreen, ...prev]);
    }
  }, [pathname]);

  // Fetch unread notifications count
  const fetchUnreadNotificationsCount = useCallback(async () => {
    if (!isAuthenticated || !auth.currentUser) return;

    try {
      const userId = auth.currentUser.uid;
      const notificationsRef = collection(db, "notifications");
      const now = new Date();

      const q = query(
        notificationsRef,
        where("userId", "==", userId),
        where("read", "==", false)
      );

      const querySnapshot = await getDocs(q);
      let count = 0;

      // Filter notifications that are still valid based on their showDays
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const startDate = data.startDate?.toDate() || new Date();
        const showDays = data.showDays || 1;

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + showDays);

        if (now <= endDate) {
          count++;
        }
      });

      setUnreadNotificationsCount(count);
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authStatus = await AsyncStorage.getItem("isLoggedIn");
        setIsAuthenticated(authStatus === "true");

        if (isProtectedRoute && authStatus !== "true") {
          router.replace("login");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsAuthenticated(false);
        if (isProtectedRoute) {
          router.replace("login");
        }
      }
    };

    checkAuthStatus();

    // Setup back button handler
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isProtectedRoute && !isAuthenticated) {
          router.replace("login");
          return true;
        }

        // If on home screen, show exit confirmation popup
        if (currentScreen === "home") {
          setShowExitPopup(true);
          return true;
        }
        // If on any other screen, navigate back
        else {
          if (navigationHistory.length > 1) {
            // Navigate to the previous screen in history
            const newHistory = [...navigationHistory];
            newHistory.shift(); // Remove current screen
            const previousScreen = newHistory[0];
            setNavigationHistory(newHistory);
            router.replace(previousScreen);
            return true;
          }
        }
        return false;
      }
    );

    return () => {
      backHandler.remove();
    };
  }, [pathname, isAuthenticated, navigationHistory, currentScreen]);

  // Fetch notifications count when authenticated or when returning to notification screen
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadNotificationsCount();
    }

    // Refresh notification count when returning from notification screen
    if (
      currentScreen !== "notification" &&
      navigationHistory[1] === "notification"
    ) {
      fetchUnreadNotificationsCount();
    }
  }, [
    isAuthenticated,
    fetchUnreadNotificationsCount,
    currentScreen,
    navigationHistory,
  ]);

  useEffect(() => {
    loadProfilePic();
  }, [isAuthenticated]);

  const loadProfilePic = async () => {
    if (!isAuthenticated) return;

    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedData = JSON.parse(userData);
        if (parsedData && parsedData.photoUrl) {
          setUserProfilePic(parsedData.photoUrl);
        }
      }
    } catch (error) {
      console.error("Error loading profile pic:", error);
    }
  };

  // Define main screens
  const mainScreens = ["home", "job", "chat", "community", "roadmap"];

  // Update previous main screen when navigating between main screens
  useEffect(() => {
    if (mainScreens.includes(currentScreen)) {
      setPreviousMainScreen(currentScreen);
    }
  }, [currentScreen]);

  const [fontsLoaded] = useFonts({
    DMBold: require("../assets/fonts/DMSans-Bold.ttf"),
    DMMedium: require("../assets/fonts/DMSans-Medium.ttf"),
    DMRegular: require("../assets/fonts/DMSans-Regular.ttf"),
  });

  const shouldHideNavigation = () => {
    return publicScreens.includes(currentScreen);
  };

  const navigateWithAuthCheck = (screenName) => {
    if (!isAuthenticated && !publicScreens.includes(screenName)) {
      router.replace("login");
    } else {
      router.push(screenName);
    }
  };

  // Handle exit confirmation
  const handleExitCancel = () => {
    setShowExitPopup(false);
  };

  const handleExitConfirm = () => {
    setShowExitPopup(false);
    BackHandler.exitApp();
  };

  // Right header component with improved notification icon
  const HeaderRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => navigateWithAuthCheck("notification")}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconWrapper,
            unreadNotificationsCount > 0 ? styles.activeIconWrapper : {},
          ]}
        >
          <Ionicons
            name={
              currentScreen === "notification"
                ? "notifications"
                : "notifications"
            }
            size={SIZES.xLarge}
            color={
              currentScreen === "notification" ? COLORS.primary : COLORS.gray
            }
          />
          {unreadNotificationsCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {unreadNotificationsCount > 99
                  ? "99+"
                  : unreadNotificationsCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <ScreenHeaderBtn
        iconUrl={userProfilePic ? { uri: userProfilePic } : images.profile}
        dimension="100%"
        handlePress={() => navigateWithAuthCheck("profile")}
      />
    </View>
  );

  if (!fontsLoaded) {
    return null;
  }

  // Determine active screen for bottom navigation
  const activeScreen = mainScreens.includes(currentScreen)
    ? currentScreen
    : previousMainScreen;

  return (
    <AuthProvider>
      <CustomNavigationContainer>
        <Stack
          initialRouteName="home"
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.lightWhite },
            headerShadowVisible: false,
            headerBackVisible: false,
            gestureEnabled: false,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="question"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="account"
            options={{
              headerShown: false,
              presentation: "card", // Added presentation mode for better animation
            }}
          />

          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="register"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="forgot-password"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="EditProfileScreen"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="home"
            options={{
              headerTitle: "Home",
              headerTitleStyle: {
                fontFamily: "DMBold",
                color: COLORS.primary,
                fontSize: SIZES.large,
              },
              headerRight: () => <HeaderRight />,
            }}
          />
          <Stack.Screen
            name="job"
            options={{
              headerTitle: "Jobs",
              headerTitleStyle: {
                fontFamily: "DMBold",
                color: COLORS.primary,
                fontSize: SIZES.large,
              },
              headerRight: () => <HeaderRight />,
            }}
          />
          <Stack.Screen
            name="community"
            options={{
              headerTitle: "Community",
              headerTitleStyle: {
                fontFamily: "DMBold",
                color: COLORS.primary,
                fontSize: SIZES.large,
              },
              headerRight: () => <HeaderRight />,
            }}
          />
          <Stack.Screen
            name="chat"
            options={{
              headerTitle: "Chat",
              headerTitleStyle: {
                fontFamily: "DMBold",
                color: COLORS.primary,
                fontSize: SIZES.large,
              },
              headerRight: () => <HeaderRight />,
            }}
          />
          <Stack.Screen
            name="profile"
            options={{
              headerTitle: "Profile",
              headerTitleStyle: {
                fontFamily: "DMBold",
                color: COLORS.primary,
                fontSize: SIZES.large,
              },
              headerRight: () => <HeaderRight />,
            }}
          />
          <Stack.Screen
            name="roadmap"
            options={{
              headerTitle: "Profile",
              headerTitleStyle: {
                fontFamily: "DMBold",
                color: COLORS.primary,
                fontSize: SIZES.large,
              },
              headerRight: () => <HeaderRight />,
            }}
          />
          <Stack.Screen
            name="notification"
            options={{
              headerTitle: "Notifications",
              headerTitleStyle: {
                fontFamily: "DMBold",
                color: COLORS.primary,
                fontSize: SIZES.large,
              },
              headerRight: () => <HeaderRight />,
            }}
          />
          <Stack.Screen
            name="session"
            options={{
              headerTitle: "Session",
              headerTitleStyle: {
                fontFamily: "DMBold",
                color: COLORS.primary,
                fontSize: SIZES.large,
              },
              headerRight: () => <HeaderRight />,
            }}
          />
          <Stack.Screen
            name="SavedJobs"
            options={{
              headerShown: false,
            }}
          />
        </Stack>

        {!shouldHideNavigation() && isAuthenticated && (
          <ScreenBottom activeScreen={activeScreen} />
        )}

        <ExitConfirmationPopup
          visible={showExitPopup}
          onCancel={handleExitCancel}
          onConfirm={handleExitConfirm}
        />
      </CustomNavigationContainer>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    marginHorizontal: SIZES.medium,
    position: "relative",
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 16,
    // backgroundColor: "rgba(240,245,255,0.8)",
  },
  activeIconWrapper: {
    // backgroundColor: "rgba(230,240,255,0.9)",
  },
  badgeContainer: {
    position: "absolute",
    top: 1,
    right: 2,
    backgroundColor: COLORS.tertiary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontFamily: "DMBold",
    textAlign: "center",
  },
});

export default Layout;
