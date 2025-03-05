import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, SIZES } from "../../../constants";
import { useState, useRef, useEffect } from "react";

const ScreenBottom = ({ activeScreen }) => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create a subtle pulse animation for the active icon
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

  const renderIcon = (screenName, iconActive, iconInactive) => {
    const isActive = activeScreen === screenName;
    const iconColor = isActive ? COLORS.primary : COLORS.gray;
    const iconStyle = isActive ? { transform: [{ scale: scaleAnim }] } : {};

    return (
      <TouchableOpacity
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
        {isActive && <View style={styles.activeIndicator} />}
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
    backgroundColor: COLORS.white,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray2,
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
    fontWeight: "500",
  },
  activeIndicator: {
    height: 3,
    width: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    position: "absolute",
    top: -10,
  },
});

export default ScreenBottom;
