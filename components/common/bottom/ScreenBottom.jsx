import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, SIZES } from "../../../constants";

const ScreenBottom = ({ activeScreen }) => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Define the order of screens
  const screensOrder = ["home", "job", "chat", "community", "profile"];
  const screenWidth = Dimensions.get("window").width;
  const tabWidth = screenWidth / screensOrder.length;
  const indicatorWidth = 25;
  const initialIndex = screensOrder.indexOf(activeScreen);
  const initialX = initialIndex * tabWidth + (tabWidth - indicatorWidth) / 2;
  const indicatorTranslateX = useRef(new Animated.Value(initialX)).current;

  useEffect(() => {
    // Pulse animation for the active icon
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeScreen]);

  useEffect(() => {
    // Animate sliding indicator to the active tab's center
    const index = screensOrder.indexOf(activeScreen);
    const targetX = index * tabWidth + (tabWidth - indicatorWidth) / 2;
    Animated.timing(indicatorTranslateX, {
      toValue: targetX,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeScreen]);

  const renderIcon = (screenName, iconActive, iconInactive) => {
    const isActive = activeScreen === screenName;
    const iconColor = isActive ? COLORS.primary : COLORS.gray;
    // Apply the pulse animation only on the active icon
    const iconStyle = isActive ? { transform: [{ scale: scaleAnim }] } : {};

    return (
      <TouchableOpacity
        key={screenName}
        style={styles.navItemContainer}
        onPress={() => {
          if (screenName !== activeScreen) {
            router.push(screenName);
          }
        }}
      >
        <Animated.View style={iconStyle}>
          <Ionicons
            name={isActive ? iconActive : iconInactive}
            size={SIZES.xLarge}
            color={iconColor}
          />
        </Animated.View>
        <Text style={[styles.navItemText, isActive && styles.activeNavText]}>
          {screenName.charAt(0).toUpperCase() + screenName.slice(1)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderIcon("home", "home", "home-outline")}
      {renderIcon("job", "briefcase", "briefcase-outline")}
      {renderIcon("chat", "chatbubbles", "chatbubbles-outline")}
      {renderIcon("community", "people", "people-outline")}
      {renderIcon("profile", "person", "person-outline")}

      <Animated.View
        style={[
          styles.indicator,
          { transform: [{ translateX: indicatorTranslateX }] },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    backgroundColor: "rgba(255,255,255,0.95)",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#e0e0e0",
    paddingBottom: 10,
  },
  navItemContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navItemText: {
    fontSize: 12,
    marginTop: 4,
    color: COLORS.gray,
  },
  activeNavText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  indicator: {
    position: "absolute",
    bottom: 10, // Adjust as needed
    height: 4,
    width: 25,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});

export default ScreenBottom;
