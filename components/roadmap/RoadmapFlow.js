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
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, FONT, SHADOWS } from "../../constants";
import { ProgressStore } from "../../utils/progressStore";
import Svg, { Circle } from "react-native-svg";

// Enable layout animations on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH =
  SCREEN_WIDTH > 500 ? SCREEN_WIDTH * 0.85 : SCREEN_WIDTH - SIZES.medium;
const CIRCLE_SIZE = 120;
const CIRCLE_THICKNESS = 12;

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    loadProgress();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (onProgressUpdate && !loading) {
      onProgressUpdate(progress);
    }

    // Animate progress circle
    Animated.timing(progressAnimation, {
      toValue: progress / 100,
      duration: 1000,
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
    LayoutAnimation.configureNext(
      LayoutAnimation.create(300, "easeInEaseOut", "opacity")
    );

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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    await loadProgress();
  };

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  // Animation values for circular progress indicator
  const circumference = 2 * Math.PI * ((CIRCLE_SIZE - CIRCLE_THICKNESS) / 2);
  const strokeDashoffset = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const renderProgressCircle = () => {
    const radius = (CIRCLE_SIZE - CIRCLE_THICKNESS) / 2;
    const centerOffset = CIRCLE_SIZE / 2;

    return (
      <View style={styles.progressCircleContainer}>
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
          {/* Background Circle */}
          <Circle
            cx={centerOffset}
            cy={centerOffset}
            r={radius}
            stroke="#E0E0E0"
            strokeWidth={CIRCLE_THICKNESS}
            fill="transparent"
          />
          {/* Progress Circle */}
          <Animated.View>
            <Circle
              cx={centerOffset}
              cy={centerOffset}
              r={radius}
              stroke={progress === 100 ? "#4CAF50" : COLORS.primary}
              strokeWidth={CIRCLE_THICKNESS}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </Animated.View>
        </Svg>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressPercentage}>{progress}%</Text>
          <Text style={styles.progressLabel}>Completed</Text>
        </View>
      </View>
    );
  };

  const renderRoadmapItem = (item, index) => {
    const isCompleted = completedItems.includes(item.id);
    const isFirst = index === 0;
    const isLast = index === roadmapItems.length - 1;
    const isPast = completedItems.length > index;
    const isCurrent = completedItems.length === index;

    // Animate each item
    const itemFade = useRef(new Animated.Value(0)).current;
    const itemSlide = useRef(new Animated.Value(50)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(itemFade, {
          toValue: 1,
          duration: 600,
          delay: index * 120 + 200,
          useNativeDriver: true,
        }),
        Animated.timing(itemSlide, {
          toValue: 0,
          duration: 500,
          delay: index * 120 + 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    // Getting the color for the step to create a consistent visual style
    const getStepColor = () => {
      if (isCompleted) return COLORS.primary;
      if (isCurrent) return "#FF9800"; // Orange for current step
      return "#BDBDBD"; // Gray for future steps
    };

    // Get appropriate icon based on item type/category
    const getItemIcon = () => {
      const iconMap = {
        fundamentals: "code-outline",
        design: "color-palette-outline",
        frontend: "layers-outline",
        backend: "server-outline",
        mobile: "phone-portrait-outline",
        data: "analytics-outline",
        devops: "git-branch-outline",
        security: "shield-outline",
      };

      return iconMap[item.category?.toLowerCase()] || "school-outline";
    };

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.itemContainer,
          { opacity: itemFade, transform: [{ translateY: itemSlide }] },
        ]}
      >
        <View style={styles.timelineSection}>
          <View
            style={[styles.timelineDot, { backgroundColor: getStepColor() }]}
          >
            {isCompleted && (
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
            )}
            {!isCompleted && (
              <Text style={styles.timelineNumber}>{index + 1}</Text>
            )}
          </View>

          {!isLast && (
            <View style={styles.timelineConnector}>
              <View
                style={[
                  styles.timelineConnectorInner,
                  isPast && { backgroundColor: COLORS.primary },
                ]}
              />
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.itemCard,
            isCurrent && styles.itemCardCurrent,
            isCompleted && styles.itemCardCompleted,
          ]}
          onPress={() => onItemPress(item)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[
              isCompleted
                ? "rgba(0, 120, 255, 0.08)"
                : "rgba(245, 245, 245, 0.9)",
              isCompleted
                ? "rgba(0, 120, 255, 0.03)"
                : "rgba(255, 255, 255, 0.95)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleSection}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: getStepColor() },
                  ]}
                >
                  <Ionicons
                    name={getItemIcon()}
                    size={18}
                    color={COLORS.white}
                  />
                </View>
                <Text
                  style={[
                    styles.itemTitle,
                    isCompleted && styles.itemTitleCompleted,
                  ]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
              </View>

              {isCompleted && (
                <View style={styles.statusBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.primary}
                  />
                  <Text style={styles.statusText}>Completed</Text>
                </View>
              )}

              {isCurrent && (
                <View style={[styles.statusBadge, styles.currentBadge]}>
                  <Ionicons name="time-outline" size={16} color="#FF9800" />
                  <Text style={[styles.statusText, styles.currentText]}>
                    Current
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.itemDescription} numberOfLines={2}>
              {item.subtitle || "Learn this topic in detail"}
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.tagRow}>
                <View
                  style={[
                    styles.difficultyTag,
                    item.difficulty === "Advanced" && styles.advancedTag,
                    item.difficulty === "Intermediate" &&
                      styles.intermediateTag,
                  ]}
                >
                  <Text style={styles.tagText}>
                    {item.difficulty || "Beginner"}
                  </Text>
                </View>

                {item.estimatedTime && (
                  <View style={styles.timeTag}>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color={COLORS.gray}
                    />
                    <Text style={styles.tagText}>{item.estimatedTime}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.completionToggle}
                onPress={() => handleToggleCompletion(item.id)}
              >
                <View
                  style={[
                    styles.toggleCheckbox,
                    isCompleted && styles.toggleChecked,
                  ]}
                >
                  {isCompleted && (
                    <Ionicons name="checkmark" size={12} color={COLORS.white} />
                  )}
                </View>
                <Text style={styles.toggleText}>
                  {isCompleted ? "Completed" : "Mark Complete"}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Your Learning Progress</Text>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={toggleExpanded}
          >
            <Ionicons
              name={expanded ? "chevron-up-circle" : "chevron-down-circle"}
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {expanded && (
          <View style={styles.progressDetailsContainer}>
            {renderProgressCircle()}

            <View style={styles.statsOuterContainer}>
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
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>

              {progress === 100 && (
                <View style={styles.congratsContainer}>
                  <Ionicons name="trophy" size={20} color="#FFD700" />
                  <Text style={styles.congratsText}>
                    Path completed! Great work!
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  Alert.alert(
                    "Reset Progress",
                    "Are you sure you want to reset all progress for this path?",
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
                <Ionicons
                  name="refresh-outline"
                  size={16}
                  color={COLORS.white}
                />
                <Text style={styles.resetText}>Reset Progress</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.roadmapTitle}>Learning Path</Text>

      <View style={styles.roadmapContainer}>
        {roadmapItems.map(renderRoadmapItem)}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: SIZES.large,
    width: "100%",
  },
  progressContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: SIZES.large,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.medium,
  },
  progressTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.tertiary,
  },
  expandButton: {
    padding: SIZES.xSmall,
  },
  progressDetailsContainer: {
    backgroundColor: "rgba(245, 247, 250, 0.5)",
    padding: SIZES.medium,
    paddingBottom: SIZES.large,
  },
  progressCircleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: SIZES.small,
  },
  progressTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  progressPercentage: {
    fontFamily: FONT.bold,
    fontSize: 28,
    color: COLORS.tertiary,
  },
  progressLabel: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  statsOuterContainer: {
    marginTop: SIZES.medium,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: SIZES.medium,
    ...SHADOWS.small,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large + 2,
    color: COLORS.primary,
  },
  statLabel: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    height: "70%",
    alignSelf: "center",
  },
  congratsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 12,
    padding: SIZES.medium,
    marginTop: SIZES.medium,
  },
  congratsText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: "#4CAF50",
    marginLeft: SIZES.small,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
    borderRadius: 12,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    marginTop: SIZES.medium,
    alignSelf: "center",
    ...SHADOWS.small,
  },
  resetText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
    marginLeft: 8,
  },
  roadmapTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.tertiary,
    marginBottom: SIZES.medium,
    paddingHorizontal: SIZES.medium,
  },
  roadmapContainer: {
    paddingHorizontal: SIZES.small,
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: SIZES.medium,
    width: "100%",
  },
  timelineSection: {
    alignItems: "center",
    marginRight: SIZES.small,
    width: 40,
  },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    ...SHADOWS.small,
  },
  timelineNumber: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium - 4,
    color: COLORS.white,
  },
  timelineConnector: {
    height: "100%",
    width: 20,
    alignItems: "center",
    position: "absolute",
    top: 36,
    bottom: 0,
  },
  timelineConnectorInner: {
    height: "100%",
    width: 2,
    backgroundColor: "#BDBDBD",
  },
  itemCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardGradient: {
    borderRadius: 16,
    padding: SIZES.medium,
  },
  itemCardCurrent: {
    borderWidth: 2,
    borderColor: "#FF9800",
  },
  itemCardCompleted: {
    borderLeftWidth: 0,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SIZES.small,
  },
  cardTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: SIZES.small,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.small,
  },
  itemTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.tertiary,
    flex: 1,
  },
  itemTitleCompleted: {
    color: COLORS.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 120, 255, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  currentBadge: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
  },
  statusText: {
    fontFamily: FONT.medium,
    fontSize: 10,
    color: COLORS.primary,
    marginLeft: 4,
  },
  currentText: {
    color: "#FF9800",
  },
  itemDescription: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 1,
    color: COLORS.gray,
    lineHeight: 20,
    marginBottom: SIZES.medium,
  },
  cardFooter: {
    marginTop: SIZES.small,
  },
  tagRow: {
    flexDirection: "row",
    marginBottom: SIZES.small,
  },
  difficultyTag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    marginRight: SIZES.small,
  },
  intermediateTag: {
    backgroundColor: "#FFF3E0",
  },
  advancedTag: {
    backgroundColor: "#FFEBEE",
  },
  timeTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#E3F2FD",
    borderRadius: 10,
    gap: 4,
  },
  tagText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small - 2,
    color: COLORS.gray,
  },
  completionToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SIZES.small,
  },
  toggleCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gray2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.small / 2,
  },
  toggleChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
});

export default RoadmapFlow;
