import React from "react";
import { View, TouchableOpacity, Text, Animated } from "react-native";
import { useRouter } from "expo-router";
import styles from "./screenbottom.style";
import { icons } from "../../../constants";
import Icons from "../icons/icons";

const ScreenBottom = ({ activeScreen }) => {
  const router = useRouter();
  const scaleValue = new Animated.Value(1);

  const navigateWithAnimation = (screenName) => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => router.push(screenName));
  };

  const renderButton = (screenName, icon, label) => {
    const isActive = activeScreen === screenName;
    const activeColor = "#312651";
    const inactiveColor = "#B3AEC6";

    return (
      <TouchableOpacity
        style={styles.buttonWrapper1}
        onPress={() => navigateWithAnimation(screenName)}
      >
        <Animated.View
          style={[
            {
              transform: [{ scale: isActive ? scaleValue : 1 }],
            },
          ]}
        >
          <Icons
            iconUrl={icon}
            dimension="80%"
            handlePress={() => navigateWithAnimation(screenName)}
            backgroundColor="transparent"
            iconColor={isActive ? activeColor : inactiveColor}
          />
        </Animated.View>
        <Text
          style={[
            styles.btn1Text,
            isActive && {
              color: activeColor,
              fontFamily: "DMBold",
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderButton("home", icons.home, "Home")}
      {renderButton("job", icons.job, "Jobs")}
      {renderButton("chat", icons.chat, "Chat")}
      {renderButton("community", icons.community, "Community")}
      {renderButton("profile", icons.profile, "Profile")}
    </View>
  );
};

export default ScreenBottom;
