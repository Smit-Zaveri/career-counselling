import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, FONT, SHADOWS } from "../../constants";
import { ProgressStore } from "../../utils/progressStore";
import LottieView from "lottie-react-native";

// Enable layout animations on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH =
  SCREEN_WIDTH > 500 ? SCREEN_WIDTH * 0.8 : SCREEN_WIDTH - SIZES.large * 2;

const RoadmapFlow = ({
  roadmapItems,
  onItemPress,
  techId,
  onProgressUpdate,
}) => {
  const [completedItems, setCompletedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const progressFillAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProgress();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (onProgressUpdate && !loading) {
      onProgressUpdate(progress);
    }

    // Animate progress bar filling
    Animated.timing(progressFillAnimation, {
      toValue: progress / 100,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress, onProgressUpdate, loading]);

  const loadProgress = async () => {
    setLoading(true);
    const { completedItems, progress } =
      await ProgressStore.getTechnologyProgress(techId);
    setCompletedItems(completedItems);
    setProgress(progress);
    setLoading(false);
  };

  const handleToggleCompletion = async (itemId) => {
    // Display a subtle layout animation when toggling items
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const result = await ProgressStore.toggleItemCompletion(
      techId,
      itemId,
      roadmapItems.length
    );

    setCompletedItems(result.completedItems);
    setProgress(result.progress);
  };

  const handleResetProgress = async () => {
    await ProgressStore.resetTechnologyProgress(techId);

    // Use layout animation for smoother transition when resetting
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);

    await loadProgress();
  };

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const renderRoadmapItem = (item, index) => {
    const isCompleted = completedItems.includes(item.id);
    const isFirst = index === 0;
    const isLast = index === roadmapItems.length - 1;
    const isEven = index % 2 === 0;
    const progressPercent = Math.round(
      (index / (roadmapItems.length - 1)) * 100
    );
    const isPast = progress >= progressPercent && progress > 0;
    const isCurrent = !isCompleted && isPast;

    // Animation values per item
    const itemFade = useRef(new Animated.Value(0)).current;
    const itemSlide = useRef(new Animated.Value(20)).current;

    useEffect(() => {
      // Stagger animation for each item
      Animated.parallel([
        Animated.timing(itemFade, {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(itemSlide, {
          toValue: 0,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.itemContainer,
          { opacity: itemFade, transform: [{ translateY: itemSlide }] },
        ]}
      >
        {!isFirst && (
          <View
            style={[styles.connector, isPast && styles.connectorCompleted]}
          />
        )}

        <View style={styles.itemContent}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              isCurrent && styles.checkboxCurrent,
              isCompleted && styles.checkboxCompleted,
            ]}
            onPress={() => handleToggleCompletion(item.id)}
            activeOpacity={0.7}
          >
            {isCompleted ? (
              <Ionicons name="checkmark" size={20} color={COLORS.white} />
            ) : (
              <Text style={styles.checkboxNumber}>{index + 1}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.itemCard,
              isCurrent && styles.itemCardCurrent,
              isCompleted && styles.itemCardCompleted,
            ]}
            onPress={() => onItemPress(item)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.itemTitle,
                  isCompleted && styles.itemTitleCompleted,
                ]}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              {isCompleted && (
                <View style={styles.completedBanner}>
                  <Text style={styles.completedText}>DONE</Text>
                </View>
              )}
            </View>

            <Text style={styles.itemSubtitle} numberOfLines={2}>
              {item.subtitle || "Learn this topic"}
            </Text>

            <View style={styles.itemFooter}>
              <View
                style={[
                  styles.difficultyContainer,
                  item.difficulty === "Advanced" && styles.advancedDifficulty,
                  item.difficulty === "Intermediate" &&
                    styles.intermediateDifficulty,
                ]}
              >
                <Text style={styles.difficultyLabel}>
                  {item.difficulty || "Beginner"}
                </Text>
              </View>

              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={14} color={COLORS.gray} />
                <Text style={styles.timeLabel}>
                  {item.estimatedTime || "30m"}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={isCompleted ? COLORS.primary : COLORS.gray}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* {!isLast && (
          <View
            style={[styles.connector, isPast && styles.connectorCompleted]}
          />
        )} */}
      </Animated.View>
    );
  };

  // Calculate width for progress bar fill based on animation
  const progressBarWidth = progressFillAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.progressHeader}>
        <View style={styles.progressHeaderTop}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={toggleExpanded}
          >
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={22}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.progressBarOuterContainer}>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[styles.progressBar, { width: progressBarWidth }]}
            />
          </View>
          <Text style={styles.progressText}>{progress}% Complete</Text>
        </View>

        {progress === 100 && (
          <View style={styles.congratsContainer}>
            <Text style={styles.congratsText}>
              🎉 Congratulations! You've completed this path!
            </Text>
          </View>
        )}

        {expanded && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedItems.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {roadmapItems.length - completedItems.length}
              </Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{roadmapItems.length}</Text>
              <Text style={styles.statLabel}>Total Steps</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.resetButton, expanded && styles.resetButtonExpanded]}
          onPress={() => {
            Alert.alert(
              "Reset Progress",
              "Are you sure you want to reset your progress for this technology?",
              [
                { text: "Cancel" },
                {
                  text: "Reset",
                  onPress: handleResetProgress,
                  style: "destructive",
                },
              ]
            );
          }}
        >
          <Ionicons name="refresh" size={14} color={COLORS.red} />
          <Text style={styles.resetText}>Reset Progress</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.roadmapContainer}>
        {roadmapItems.map(renderRoadmapItem)}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SIZES.medium,
    width: "100%",
    marginBottom: SIZES.large,
  },
  progressHeader: {
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    borderRadius: SIZES.large,
    marginBottom: SIZES.large,
    ...SHADOWS.medium,
  },
  progressHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  progressTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
  },
  expandButton: {
    padding: SIZES.xSmall,
  },
  progressBarOuterContainer: {
    marginBottom: SIZES.small,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: COLORS.lightWhite,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  progressText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.gray,
    alignSelf: "flex-end",
  },
  congratsContainer: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: SIZES.small,
    padding: SIZES.medium,
    marginVertical: SIZES.small,
    alignItems: "center",
  },
  congratsText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: "#4CAF50",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.lightWhite,
    borderRadius: SIZES.medium,
    marginVertical: SIZES.medium,
    padding: SIZES.medium,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
  },
  statLabel: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray2,
    height: "80%",
    alignSelf: "center",
  },
  roadmapContainer: {
    paddingVertical: SIZES.small,
    alignItems: "center",
  },
  itemContainer: {
    alignItems: "center",
    marginBottom: SIZES.medium,
    width: ITEM_WIDTH,
  },
  connector: {
    marginTop: -15,
    width: 3,
    height: 30,
    backgroundColor: COLORS.gray2,
  },
  connectorCompleted: {
    backgroundColor: COLORS.primary,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  checkbox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: COLORS.gray2,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    ...SHADOWS.small,
  },
  checkboxNumber: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium - 2,
    color: COLORS.gray,
  },
  checkboxCurrent: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  itemCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    paddingLeft: SIZES.large,
    paddingRight: SIZES.medium,
    marginLeft: -16, // Overlap checkbox
    ...SHADOWS.small,
  },
  itemCardCurrent: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    backgroundColor: "rgba(0, 120, 255, 0.05)",
  },
  itemCardCompleted: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  itemTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium + 1,
    color: COLORS.tertiary || COLORS.primary,
    marginBottom: 4,
    flex: 1,
    paddingRight: SIZES.small,
  },
  itemTitleCompleted: {
    color: COLORS.primary,
  },
  itemSubtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 1,
    color: COLORS.gray,
    marginBottom: SIZES.medium,
    lineHeight: 18,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficultyContainer: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#E8F5E9", // Light green for beginner
    borderRadius: SIZES.small,
  },
  intermediateDifficulty: {
    backgroundColor: "#FFF3E0", // Light orange for intermediate
  },
  advancedDifficulty: {
    backgroundColor: "#FFEBEE", // Light red for advanced
  },
  difficultyLabel: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small - 1,
    color: COLORS.gray,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeLabel: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small - 1,
    color: COLORS.gray,
    marginLeft: 4,
  },
  completedBanner: {
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.small,
    flexShrink: 0,
  },
  completedText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.small - 2,
    color: COLORS.white,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.2)",
    borderRadius: SIZES.small,
    marginTop: SIZES.small,
  },
  resetButtonExpanded: {
    marginTop: SIZES.medium,
  },
  resetText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.red,
    marginLeft: 4,
  },
});

export default RoadmapFlow;
