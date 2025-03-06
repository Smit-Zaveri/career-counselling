import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, SIZES } from "../../../constants";
import { LinearGradient } from "expo-linear-gradient";

const ScreenBottom = ({ activeScreen }) => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Define the order of screens
  const screensOrder = ["home", "job", "chat", "community", "roadmap"];
  const screenWidth = Dimensions.get("window").width;
  const tabWidth = screenWidth / screensOrder.length;
  const indicatorWidth = 40;
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
    Animated.spring(indicatorTranslateX, {
      // Fixed typo here
      toValue: targetX,
      duration: 300,
      friction: 10,
      tension: 60,
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
          // Always navigate to the selected screen using replace
          // This ensures we can go back to home from profile screen
          router.replace(screenName);
        }}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            isActive && styles.activeIconContainer,
            iconStyle,
          ]}
        >
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
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {renderIcon("home", "home", "home-outline")}
        {renderIcon("job", "briefcase", "briefcase-outline")}
        {/* Fixed icon name */}
        {renderIcon("chat", "chatbubbles", "chatbubbles-outline")}
        {renderIcon("community", "people", "people-outline")}
        {renderIcon("roadmap", "map", "map-outline")}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
    backgroundColor: "transparent",
  },
  container: {
    width: "92%",
    height: 75,
    backgroundColor: COLORS.lightWhite,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(230,230,230,0.5)",
  },
  navItemContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 16,
  },
  activeIconContainer: {
    backgroundColor: "rgba(240,245,255,0.8)",
  },
  navItemText: {
    fontSize: 11,
    marginTop: 2,
    color: COLORS.gray,
    fontWeight: "500",
  },
  activeNavText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  indicator: {
    position: "absolute",
    bottom: 8,
    height: 4,
    width: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
});

export default ScreenBottom;
