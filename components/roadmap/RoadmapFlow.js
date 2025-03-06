import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, FONT, SHADOWS } from "../../constants";
import { ProgressStore } from "../../utils/progressStore";

const RoadmapFlow = ({
  roadmapItems,
  onItemPress,
  techId,
  onProgressUpdate,
}) => {
  const [completedItems, setCompletedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    if (onProgressUpdate && !loading) {
      onProgressUpdate(progress);
    }
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
    await loadProgress();
  };

  const renderRoadmapItem = (item, index) => {
    const isCompleted = completedItems.includes(item.id);
    const isFirst = index === 0;
    const isLast = index === roadmapItems.length - 1;

    return (
      <View key={item.id} style={styles.itemContainer}>
        {!isFirst && <View style={styles.connector} />}

        <View style={styles.itemContent}>
          <TouchableOpacity
            style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
            onPress={() => handleToggleCompletion(item.id)}
            activeOpacity={0.7}
          >
            {isCompleted && (
              <Ionicons name="checkmark" size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.itemCard, isCompleted && styles.itemCardCompleted]}
            onPress={() => onItemPress(item)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.itemTitle,
                isCompleted && styles.itemTitleCompleted,
              ]}
            >
              {item.title}
            </Text>
            <Text style={styles.itemSubtitle}>
              {item.subtitle || "Learn this topic"}
            </Text>

            {isCompleted && (
              <View style={styles.completedBanner}>
                <Text style={styles.completedText}>COMPLETED</Text>
              </View>
            )}

            <View style={styles.itemFooter}>
              <View style={styles.difficultyContainer}>
                <Text style={styles.difficultyLabel}>
                  {item.difficulty || "Beginner"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
            </View>
          </TouchableOpacity>
        </View>

        {!isLast && <View style={styles.connector} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Your Progress</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
          <Text style={styles.progressText}>{progress}% Complete</Text>
        </View>

        <TouchableOpacity
          style={styles.resetButton}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SIZES.medium,
  },
  progressHeader: {
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    borderRadius: SIZES.medium,
    marginBottom: SIZES.large,
    ...SHADOWS.medium,
  },
  progressTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginBottom: SIZES.small,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: COLORS.lightWhite,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: SIZES.small,
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
    marginTop: 5,
  },
  roadmapContainer: {
    paddingVertical: SIZES.small,
  },
  itemContainer: {
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  connector: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.gray2,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    marginRight: SIZES.small,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.primary,
  },
  itemCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    ...SHADOWS.small,
    marginLeft: -14, // Overlap checkbox
    paddingLeft: SIZES.large + 10,
  },
  itemCardCompleted: {
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
  },
  itemTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginBottom: 4,
  },
  itemTitleCompleted: {
    color: COLORS.tertiary || COLORS.primary,
  },
  itemSubtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: SIZES.small,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SIZES.small,
  },
  difficultyContainer: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: COLORS.lightWhite,
    borderRadius: SIZES.small,
  },
  difficultyLabel: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small - 2,
    color: COLORS.gray,
  },
  completedBanner: {
    position: "absolute",
    top: 10,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderTopLeftRadius: SIZES.small,
    borderBottomLeftRadius: SIZES.small,
  },
  completedText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.small - 3,
    color: COLORS.white,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: SIZES.small,
  },
  resetText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.red,
    marginLeft: 4,
  },
});

export default RoadmapFlow;
