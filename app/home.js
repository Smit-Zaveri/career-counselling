import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS, FONT, SIZES, icons } from "../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import HomeWelcome from "../components/home/welcome/HomeWelcome";
import QuickActions from "../components/home/quickActions/QuickActions";
import RecommendedJobs from "../components/home/recommendedJobs/RecommendedJobs";
import CareerGrowth from "../components/home/careerGrowth/CareerGrowth";
import CommunityHighlights from "../components/home/communityHighlights/CommunityHighlights";
import ActivitySummary from "../components/home/activitySummary/ActivitySummary";
import PopularJobs from "../components/home/popularJobs/PopularJobs";

const { width } = Dimensions.get("window");

const Home = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Try to get from local storage first for immediate display
      const cachedUser = await AsyncStorage.getItem("userData");
      if (cachedUser) {
        setUserData(JSON.parse(cachedUser));
      }

      // If user is authenticated, get fresh data
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const freshUserData = userDoc.data();
          setUserData(freshUserData);

          // Update cache with fresh data
          await AsyncStorage.setItem("userData", JSON.stringify(freshUserData));
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    // Start animations after data is loaded
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  // Initialize header animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -60],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.3, 0],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateY }],
          }}
        >
          {/* Welcome Section */}
          <HomeWelcome userData={userData} />

          {/* Quick Actions Section */}
          <QuickActions router={router} />

          {/* Popular Jobs Section */}
          <PopularJobs router={router} />

          {/* Career Growth Section */}
          <CareerGrowth router={router} />

          {/* Community Highlights Section */}
          <CommunityHighlights router={router} />

          {/* Activity Summary Section */}
          <ActivitySummary userData={userData} router={router} />

          {/* Extra bottom spacing to account for bottom navigation */}
          <View style={{ height: 80 }} />
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightWhite,
  },
  loadingText: {
    marginTop: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: COLORS.white,
    zIndex: 100,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.62,
  },
  floatingHeaderTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
  },
});

export default Home;
