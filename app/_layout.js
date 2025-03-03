import React, { useState, useEffect, useCallback } from "react";
import { View, Text, BackHandler } from "react-native";
import { Stack, useRouter, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import ScreenBottom from "../components/common/bottom/ScreenBottom";
import { COLORS, icons, images, SIZES } from "../constants";
import ScreenHeaderBtn from "../components/common/header/ScreenHeaderBtn";
import Icons from "../components/common/icons/icons";
import { AuthProvider } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ExitConfirmationPopup from "../components/common/popup/ExitConfirmationPopup";

export const unstable_settings = {
  initialRouteName: "home",
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
  const mainScreens = ["home", "job", "chat", "community", "profile"];

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

  // Right header component
  const HeaderRight = () => (
    <View style={{ flexDirection: "row" }}>
      <Icons
        iconUrl={icons.notification}
        dimension="100%"
        handlePress={() => navigateWithAuthCheck("notification")}
        marginHorizontal={SIZES.medium}
      />
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
      </Stack>

      {!shouldHideNavigation() && isAuthenticated && (
        <ScreenBottom activeScreen={activeScreen} />
      )}

      <ExitConfirmationPopup
        visible={showExitPopup}
        onCancel={handleExitCancel}
        onConfirm={handleExitConfirm}
      />
    </AuthProvider>
  );
};

export default Layout;
