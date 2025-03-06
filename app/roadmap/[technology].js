import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { COLORS, FONT, SIZES, SHADOWS } from "../../constants";
import { technologies } from "../../constants/roadmapData";
import RoadmapFlow from "../../components/roadmap/RoadmapFlow";
import { ProgressStore } from "../../utils/progressStore";

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = 280;

const TechnologyRoadmap = () => {
  const { technology } = useLocalSearchParams();
  const router = useRouter();
  const scrollY = new Animated.Value(0);
  const [progress, setProgress] = useState(0);

  // Animated interpolations for header collapse
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 100],
    outputRange: [HEADER_HEIGHT, 100],
    extrapolate: "clamp",
  });

  // Fade out the main header content as user scrolls
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 150, HEADER_HEIGHT - 100],
    outputRange: [1, 1, 0],
    extrapolate: "clamp",
  });

  // Interpolations for the title in the main header
  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 150],
    outputRange: [1, 0.8],
    extrapolate: "clamp",
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 150],
    outputRange: [0, -8],
    extrapolate: "clamp",
  });

  // New interpolation for the sticky header (appears on scroll)
  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 150, HEADER_HEIGHT - 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const tech = technologies.find((t) => t.id === technology);

  // Add callback function that will be passed to RoadmapFlow
  const handleProgressUpdate = useCallback((updatedProgress) => {
    setProgress(updatedProgress);
  }, []);

  useEffect(() => {
    const loadProgress = async () => {
      const { progress } = await ProgressStore.getTechnologyProgress(
        technology
      );
      setProgress(progress);
    };

    loadProgress();
  }, [technology]);

  if (!tech) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Technology not found</Text>
      </SafeAreaView>
    );
  }

  const handleRoadmapItemPress = (item) => {
    router.push(`/roadmap/detail/${item.id}`);
  };

  const handleBackPress = () => {
    router.back();
  };

  // Get roadmap items count
  const totalItems = tech.roadmapItems.length;
  const estimatedTime = totalItems * 2; // Rough estimate: 2 hours per item

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Sticky Header */}
      <Animated.View
        style={[styles.stickyHeader, { opacity: stickyHeaderOpacity }]}
      >
        {/* <TouchableOpacity
          onPress={handleBackPress}
          style={styles.stickyBackButton}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity> */}
        <Text style={styles.stickyTitle}>{tech.name}</Text>
        <View style={styles.stickyProgressBadge}>
          <Text style={styles.stickyProgressText}>{progress}%</Text>
        </View>
      </Animated.View>

      {/* Back Button (visible in the expanded header) */}
      {/* <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
        activeOpacity={0.7}
      >
        <BlurView intensity={30} style={styles.blurView}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </BlurView>
      </TouchableOpacity> */}

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Animated Header */}
        <Animated.View
          style={[styles.headerContainer, { height: headerHeight }]}
        >
          <LinearGradient
            colors={[tech.color || COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Animated.View
              style={[
                styles.headerContent,
                {
                  opacity: headerOpacity,
                  transform: [
                    { scale: titleScale },
                    { translateY: titleTranslateY },
                  ],
                },
              ]}
            >
              <View style={styles.iconContainer}>
                <Image
                  source={{ uri: tech.iconUrl }}
                  style={styles.techIcon}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.title}>{tech.name}</Text>
              <Text style={styles.subtitle}>Learning Path</Text>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <MaterialIcons
                    name="featured-play-list"
                    size={20}
                    color={COLORS.white}
                  />
                  <Text style={styles.statText}>{totalItems} Topics</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <MaterialIcons name="timer" size={20} color={COLORS.white} />
                  <Text style={styles.statText}>{estimatedTime}+ Hours</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color={COLORS.white}
                  />
                  <Text style={styles.statText}>{progress}% Done</Text>
                </View>
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Learning Path</Text>
            <Text style={styles.sectionSubtitle}>
              Follow this step-by-step roadmap to master {tech.name} from the
              basics to advanced concepts.
            </Text>
          </View>

          {/* Path Visualization */}
          <View style={styles.roadmapContainer}>
            <RoadmapFlow
              roadmapItems={tech.roadmapItems}
              onItemPress={handleRoadmapItemPress}
              techId={tech.id}
              onProgressUpdate={handleProgressUpdate} // Pass the callback
            />
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },
  // Sticky Header styles
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.medium,
    zIndex: 11,
  },
  stickyBackButton: {
    padding: 8,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  stickyTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.white,
    marginLeft: 10,
  },
  stickyProgressBadge: {
    marginLeft: "auto",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  stickyProgressText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 18,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  blurView: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContainer: {
    width: "100%",
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 25,
    paddingHorizontal: SIZES.large,
  },
  headerContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.medium,
    backdropFilter: "blur(10px)",
    ...SHADOWS.large,
  },
  techIcon: {
    width: 50,
    height: 50,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge + 4,
    color: COLORS.white,
    marginBottom: SIZES.xSmall,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: FONT.medium,
    fontSize: SIZES.large,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: SIZES.medium,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SIZES.small,
    marginBottom: SIZES.small,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SIZES.xSmall,
  },
  statText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium - 2,
    color: COLORS.white,
    marginLeft: 5,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginHorizontal: SIZES.small,
    marginBottom: 5,
  },
  contentContainer: {
    borderTopLeftRadius: SIZES.large,
    borderTopRightRadius: SIZES.large,
    backgroundColor: COLORS.lightWhite,
    marginTop: -20,
    paddingTop: 5,
  },
  sectionHeader: {
    padding: SIZES.large,
    paddingTop: SIZES.xlarge,
    marginBottom: SIZES.medium,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.primary,
    marginBottom: SIZES.medium,
  },
  sectionSubtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    lineHeight: 22,
  },
  roadmapContainer: {
    paddingHorizontal: SIZES.small,
    paddingBottom: SIZES.xxLarge,
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.large,
    color: COLORS.red,
    textAlign: "center",
    marginTop: SIZES.xxLarge,
  },
});

export default TechnologyRoadmap;
