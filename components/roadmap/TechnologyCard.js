import React, { useRef, useEffect, useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, FONT, SHADOWS } from "../../constants";
import { ProgressStore } from "../../utils/progressStore";

const TechnologyCard = ({ technology, onPress, index }) => {
  const [progress, setProgress] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Load actual saved progress
    const loadProgress = async () => {
      const { progress } = await ProgressStore.getTechnologyProgress(
        technology.id
      );
      setProgress(progress);
    };

    loadProgress();

    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 600,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 700,
        delay: index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const isStarted = progress > 0;
  const isCompleted = progress === 100;

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: scaleAnim }, { translateY: translateY }],
          opacity: cardOpacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        <LinearGradient
          colors={[
            technology.color || COLORS.primary,
            technology.secondaryColor || COLORS.secondary,
          ]}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: technology.iconUrl }}
                style={styles.image}
                resizeMode="contain"
              />
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.white}
                  />
                </View>
              )}
            </View>

            <View style={styles.textSection}>
              <Text style={styles.title}>{technology.name}</Text>
              <Text style={styles.subtitle}>
                {isCompleted
                  ? "Completed"
                  : isStarted
                  ? "Continue learning"
                  : "Start learning"}
              </Text>

              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
            </View>

            <View style={styles.bottomSection}>
              {isCompleted ? (
                <View style={[styles.badge, styles.completedBadge]}>
                  <Text style={styles.badgeText}>Completed</Text>
                </View>
              ) : isStarted ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>In progress</Text>
                </View>
              ) : (
                <View style={[styles.badge, styles.newBadge]}>
                  <Text style={styles.badgeText}>New</Text>
                </View>
              )}
              <Ionicons
                name="chevron-forward-circle"
                size={24}
                color="rgba(255,255,255,0.8)"
                style={styles.icon}
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    margin: SIZES.medium / 2,
    borderRadius: SIZES.large,
    overflow: "hidden",
    ...SHADOWS.medium,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  touchable: {
    flex: 1,
  },
  cardGradient: {
    flex: 1,
    borderRadius: SIZES.large,
  },
  cardContent: {
    padding: SIZES.medium,
    paddingTop: SIZES.large,
    height: 220, // Fixed height for consistent layout
    justifyContent: "space-between",
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.small,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    position: "relative",
  },
  image: {
    width: 40,
    height: 40,
  },
  checkmarkIcon: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  textSection: {
    marginVertical: SIZES.small,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium + 2,
    color: COLORS.white,
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small + 2,
    color: "rgba(255,255,255,0.8)",
    marginBottom: SIZES.small,
  },
  progressContainer: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    marginTop: SIZES.small,
    marginBottom: 4,
    position: "relative",
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 3,
  },
  progressText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small - 2,
    color: COLORS.white,
    position: "absolute",
    right: 0,
    top: 8,
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SIZES.small,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: SIZES.small,
  },
  newBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  completedBadge: {
    backgroundColor: "#4CAF50",
  },
  badgeText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small - 2,
    color: COLORS.white,
  },
  icon: {
    marginRight: 4,
  },
});

export default TechnologyCard;
