import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Animated,
  StatusBar,
  Image,
  RefreshControl,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import TechnologyCard from "../../components/roadmap/TechnologyCard";
import { COLORS, SIZES, FONT, SHADOWS } from "../../constants";
import { technologies } from "../../constants/roadmapData";
import { ProgressStore } from "../../utils/progressStore";

const Roadmap = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [technologiesData, setTechnologiesData] = useState(technologies);
  const listOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(listOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Load initial data with progress info
    loadTechnologiesWithProgress();
  }, []);

  const loadTechnologiesWithProgress = async () => {
    try {
      // Create a copy of technologies with updated progress information
      const updatedTechnologies = await Promise.all(
        technologies.map(async (tech) => {
          const { progress } = await ProgressStore.getTechnologyProgress(
            tech.id
          );
          return { ...tech, currentProgress: progress };
        })
      );
      setTechnologiesData(updatedTechnologies);
    } catch (error) {
      console.error("Error loading technologies with progress:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    // Reload all data
    await loadTechnologiesWithProgress();

    // Finish refreshing
    setRefreshing(false);
  };

  const handleTechnologyPress = (tech) => {
    router.push(`/roadmap/${tech.id}`);
  };

  const ListHeader = () => (
    <Animated.View
      style={{
        transform: [{ translateY: headerTranslateY }],
        opacity: listOpacity,
      }}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.tertiary || "#4A00E0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="rocket" size={28} color={COLORS.white} />
          </View>
          <Text style={styles.headerTitleText}>Your Learning Journey</Text>
          <Text style={styles.headerSubtitle}>
            Master new technologies with structured learning paths
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{technologies.length}</Text>
              <Text style={styles.statLabel}>Paths</Text>
            </View>
            <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>120+</Text>
                <Text style={styles.statLabel}>Resources</Text>
              </View>
            <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>10K+</Text>
                  <Text style={styles.statLabel}>Learners</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
      <View style={styles.listHeaderContainer}>
        <Text style={styles.listHeaderTitle}>Technology Paths</Text>
        <Text style={styles.listHeaderSubtitle}>
          Select a path to begin your journey
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          headerTitle: "Learning Paths",
          headerTitleStyle: styles.headerTitle,
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: COLORS.lightWhite },
          headerShadowVisible: false,
        }}
      />
      <Animated.View style={{ flex: 1, opacity: listOpacity }}>
        <FlatList
          data={technologiesData}
          renderItem={({ item, index }) => (
            <TechnologyCard
              technology={item}
              onPress={() => handleTechnologyPress(item)}
              index={index}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.cardsContainer}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary, COLORS.secondary]}
              progressBackgroundColor="#ffffff"
            />
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
    marginBottom: 40,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
  },
  headerContainer: {
    padding: SIZES.large,
    paddingTop: SIZES.xxLarge,
    paddingBottom: SIZES.xLarge,
    borderBottomLeftRadius: SIZES.large,
    borderBottomRightRadius: SIZES.large,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 12,
    marginBottom: SIZES.large,
  },
  headerContent: {
    alignItems: "center",
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  headerTitleText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge + 2,
    color: COLORS.white,
    marginBottom: SIZES.small,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.lightWhite,
    textAlign: "center",
    marginBottom: SIZES.large,
    maxWidth: "85%",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: SIZES.medium,
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
    marginTop: SIZES.small,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: SIZES.medium,
  },
  statNumber: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.white,
  },
  statLabel: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.lightWhite,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: SIZES.small,
  },
  listHeaderContainer: {
    paddingHorizontal: SIZES.large,
    paddingTop: SIZES.large,
    paddingBottom: SIZES.small,
  },
  listHeaderTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large + 2,
    color: COLORS.primary,
  },
  listHeaderSubtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium - 2,
    color: COLORS.gray,
    marginTop: 4,
  },
  cardsContainer: {
    paddingHorizontal: SIZES.medium,
    paddingBottom: SIZES.xxLarge * 1.5,
  },
});

export default Roadmap;
