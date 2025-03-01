import React from "react";
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
  const activeScreen = pathname.slice(1) || "home";
  const pageTitle =
    activeScreen.charAt(0).toUpperCase() + activeScreen.slice(1);

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
              {pageTitle}
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
                handlePress={() => router.push("profile")}
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
      </Stack>
      <ScreenBottom activeScreen={activeScreen} />
    </>
  );
};

export default Layout;
