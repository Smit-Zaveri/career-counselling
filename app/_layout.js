import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Stack, useRouter, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import ScreenBottom from "../components/common/bottom/ScreenBottom";
import { COLORS, icons, images, SIZES } from "../constants";
import ScreenHeaderBtn from "../components/common/header/ScreenHeaderBtn";
import Icons from "../components/common/icons/icons";
import { AuthProvider } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const unstable_settings = {
  initialRouteName: "home",
};

const Layout = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [previousMainScreen, setPreviousMainScreen] = useState("home");
  const currentScreen = pathname.slice(1) || "home";
  const [userProfilePic, setUserProfilePic] = useState(null);

  useEffect(() => {
    loadProfilePic();
  }, []);

  const loadProfilePic = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const { photoUrl } = JSON.parse(userData);
        setUserProfilePic(photoUrl);
      }
    } catch (error) {
      console.error("Error loading profile pic:", error);
    }
  };

  // Define main screens and secondary screens
  const mainScreens = ["home", "job", "chat", "community", "profile"];
  const secondaryScreens = ["notification", "job-details", "search"];

  // Determine which screen should be active in the bottom bar
  const activeScreen = mainScreens.includes(currentScreen)
    ? currentScreen
    : previousMainScreen;

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
    return (
      pathname === "/question" ||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgot-password"
    );
  };

  const defaultScreenOptions = {
    headerStyle: { backgroundColor: COLORS.lightWhite },
    headerBackVisible: false,
    headerTitle: () => (
      <Text
        style={{
          fontSize: SIZES.large,
          color: COLORS.primary,
          fontFamily: "DMBold",
        }}
      >
        {currentScreen.charAt(0).toUpperCase() + currentScreen.slice(1)}
      </Text>
    ),
    // headerLeft: () => (
    //   <ScreenHeaderBtn
    //     iconUrl={icons.menu}
    //     dimension="60%"
    //     handlePress={() => router.push("home")}
    //   />
    // ),
    headerRight: () => (
      <View style={{ flexDirection: "row" }}>
        <Icons
          iconUrl={icons.notification}
          dimension="100%"
          handlePress={() => router.push("notification")}
          marginHorizontal={SIZES.medium}
        />
        <ScreenHeaderBtn
          iconUrl={userProfilePic ? { uri: userProfilePic } : images.profile}
          dimension="100%"
          handlePress={() => router.push("profile")}
        />
      </View>
    ),
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack
        initialRouteName="home"
        screenOptions={{
          gestureEnabled: false, // Disable swipe back gesture
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="question"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="home"
          options={{
            headerShown: true, // Make sure header is shown
            ...defaultScreenOptions,
            gestureEnabled: false,
            headerLeft: () => null, // Remove back button
          }}
        />
        <Stack.Screen name="job" options={defaultScreenOptions} />
        <Stack.Screen name="community" options={defaultScreenOptions} />
        <Stack.Screen name="chat" options={defaultScreenOptions} />
        <Stack.Screen name="profile" options={defaultScreenOptions} />
        <Stack.Screen name="notification" options={defaultScreenOptions} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      </Stack>
      {!shouldHideNavigation() && <ScreenBottom activeScreen={activeScreen} />}
    </AuthProvider>
  );
};

export default Layout;
