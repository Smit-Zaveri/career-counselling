import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Stack, useRouter, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import ScreenBottom from "../components/common/bottom/ScreenBottom";
import { COLORS, icons, images, SIZES } from "../constants";
import ScreenHeaderBtn from "../components/common/header/ScreenHeaderBtn";
import Icons from "../components/common/icons/icons";

export const unstable_settings = {
  initialRouteName: "home",
};

const Layout = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [previousMainScreen, setPreviousMainScreen] = useState("home");
  const currentScreen = pathname.slice(1) || "home";

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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Stack
        initialRouteName="home"
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.lightWhite },
          headerBackVisible: false,
          // headerShadowVisible: false,
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
                handlePress={() => {
                  router.push("notification");
                }}
                marginHorizontal={SIZES.medium}
              />
              <ScreenHeaderBtn
                iconUrl={images.profile}
                dimension="100%"
                handlePress={() => router.push("profile")}
              />
            </View>
          ),
        }}
      >
        <Stack.Screen name="home" />
        <Stack.Screen name="job" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="community" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="notification" />
      </Stack>
      <ScreenBottom activeScreen={activeScreen} />
    </>
  );
};

export default Layout;
