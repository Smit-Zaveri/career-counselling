import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Platform,
  PixelRatio,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONT, SIZES, SHADOWS } from "../../constants";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Scale factor for responsive sizing (based on standard iPhone width)
const scale = SCREEN_WIDTH / 375;
const normalize = (size) => {
  const newSize = size * scale;
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

const RoadmapFlow = ({ roadmapItems, onItemPress }) => {
  // Animation references for each item
  const animatedValues = useRef(
    roadmapItems.map(() => new Animated.Value(0))
  ).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Run animations when component mounts
  useEffect(() => {
    // Fade in the entire component
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Animate each item with a stagger effect
    const animations = animatedValues.map((anim, index) => {
      return Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: 120 * index,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      });
    });

    Animated.stagger(80, animations).start();
  }, []);

  // This connector doesn't animate height, only opacity and scale
  const renderConnector = (index) => {
    if (index < roadmapItems.length - 1) {
      const nextNodeAppeared = animatedValues[index + 1];

      return (
        <View style={styles.connectorContainer}>
          <View style={styles.connectorLine} />
          <Animated.View
            style={{
              opacity: nextNodeAppeared,
              transform: [{ scale: nextNodeAppeared }],
            }}
          >
            <MaterialCommunityIcons
              name="chevron-down-circle"
              size={normalize(24)}
              color={COLORS.primary}
            />
          </Animated.View>
        </View>
      );
    }
    return null;
  };

  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim }]}
      testID="roadmap-flow-container"
    >
      {roadmapItems.map((item, index) => {
        // Create animations for each item
        const translateY = animatedValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
          extrapolate: "clamp",
        });

        const scale = animatedValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0.85, 1],
          extrapolate: "clamp",
        });

        const opacity = animatedValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: "clamp",
        });

        // Handle long titles
        const title = item.title;
        const subtitle = item.subtitle;

        return (
          <View
            key={item.id || index}
            style={styles.itemOuterContainer}
            testID={`roadmap-item-${index}`}
          >
            <Animated.View
              style={[
                styles.itemContainer,
                {
                  transform: [{ translateY }, { scale }],
                  opacity,
                },
              ]}
            >
              <LinearGradient
                colors={[
                  item.color || COLORS.primary,
                  darkenColor(item.color || COLORS.primary, 15),
                ]}
                start={{ x: 0.1, y: 0.1 }}
                end={{ x: 0.9, y: 0.9 }}
                style={styles.item}
              >
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>

                <TouchableOpacity
                  style={styles.itemContent}
                  onPress={() => onItemPress(item)}
                  activeOpacity={0.85}
                  testID={`roadmap-item-button-${index}`}
                >
                  <View style={styles.titleContainer}>
                    <Text
                      style={styles.itemTitle}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {title}
                    </Text>
                    <Text
                      style={styles.itemSubtitle}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {subtitle}
                    </Text>

                    {/* Tags row for key concepts */}
                    <View style={styles.tagsContainer}>
                      {item.concepts &&
                        item.concepts
                          .slice(0, SCREEN_WIDTH < 360 ? 1 : 2)
                          .map((concept, idx) => (
                            <View key={idx} style={styles.conceptTag}>
                              <Text
                                style={styles.tagText}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                {concept.length > (SCREEN_WIDTH < 360 ? 15 : 18)
                                  ? concept.substring(
                                      0,
                                      SCREEN_WIDTH < 360 ? 15 : 18
                                    ) + "..."
                                  : concept}
                              </Text>
                            </View>
                          ))}
                      {item.concepts &&
                        item.concepts.length > (SCREEN_WIDTH < 360 ? 1 : 2) && (
                          <View style={styles.moreTag}>
                            <Text style={styles.moreTagText}>
                              +
                              {item.concepts.length -
                                (SCREEN_WIDTH < 360 ? 1 : 2)}
                            </Text>
                          </View>
                        )}
                    </View>
                  </View>

                  <View style={styles.arrowContainer}>
                    <View style={styles.arrowIconContainer}>
                      <Ionicons
                        name="arrow-forward"
                        size={normalize(18)}
                        color={COLORS.white}
                      />
                    </View>
                    <Text style={styles.viewDetailsText}>View</Text>
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>

            {renderConnector(index)}
          </View>
        );
      })}
    </Animated.View>
  );
};

// Helper function to darken a color by percentage
const darkenColor = (color, percent) => {
  if (!color) return COLORS.secondary;

  // Simple darkening - in production you would use a proper color library
  // This is a placeholder that just returns the original color to avoid errors
  return color;
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: SIZES.medium,
    width: "100%",
    maxWidth: 600, // Maximum width for larger tablets
    alignSelf: "center",
    marginBottom: 40,
  },
  itemOuterContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  itemContainer: {
    width: "100%",
    alignItems: "center",
  },
  item: {
    width: "92%", // Slightly narrower for better proportions
    borderRadius: SIZES.medium,
    ...SHADOWS.large,
    overflow: "hidden",
    position: "relative",
  },
  stepBadge: {
    position: "absolute",
    top: SIZES.medium,
    left: SIZES.small,
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  stepNumber: {
    fontFamily: FONT.bold,
    color: COLORS.white,
    fontSize: normalize(SIZES.medium - 2),
  },
  itemContent: {
    padding: SIZES.medium,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: normalize(SIZES.large * 2 + 5), // Badge width + padding
    minHeight: normalize(100), // Minimum height for consistency
  },
  titleContainer: {
    flex: 1,
    paddingRight: SIZES.small,
  },
  itemTitle: {
    fontFamily: FONT.bold,
    fontSize: normalize(SIZES.medium + 1),
    color: COLORS.white,
    marginBottom: SIZES.xSmall / 2,
  },
  itemSubtitle: {
    fontFamily: FONT.regular,
    fontSize: normalize(SIZES.small + 1),
    color: "rgba(255,255,255,0.85)",
    marginBottom: SIZES.small,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  conceptTag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: SIZES.xSmall,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 4,
    maxWidth: SCREEN_WIDTH * 0.35, // Ensure tags don't get too wide
  },
  tagText: {
    color: COLORS.white,
    fontFamily: FONT.medium,
    fontSize: normalize(SIZES.xSmall + 1),
  },
  moreTag: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: SIZES.xSmall,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  moreTagText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: normalize(SIZES.xSmall + 1),
  },
  arrowContainer: {
    alignItems: "center",
    // zIndex: 5,
  },
  arrowIconContainer: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  viewDetailsText: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: FONT.medium,
    fontSize: normalize(SIZES.xSmall + 1),
  },
  connectorContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: normalize(40), // Responsive fixed height
    width: normalize(26),
    zIndex: -10,
  },
  connectorLine: {
    width: 2,
    height: normalize(20), // Responsive fixed height
    backgroundColor: "rgba(0,0,0,0.08)",
    marginBottom: -2,
  },
});

export default RoadmapFlow;
