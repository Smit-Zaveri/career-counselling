import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS, FONT } from "../../../constants";
import { getPopularJobs } from "../../../firebase/jobServices";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";

const PopularJobCard = ({ job, onPress, index }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.jobCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => onPress(job)}
        activeOpacity={0.7}
        style={styles.cardTouchable}
      >
        <LinearGradient
          colors={[COLORS.white, "#f8fafc"]}
          style={styles.cardGradient}
        >
          <View style={styles.jobCardHeader}>
            <View style={styles.companyLogoContainer}>
              <LinearGradient
                colors={["#f1f5f9", COLORS.white]}
                style={styles.companyLogo}
              >
                {job.employer_logo ? (
                  <Image
                    source={{ uri: job.employer_logo }}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.placeholderLogo}>
                    <Text style={styles.placeholderLogoText}>
                      {job.employer_name?.charAt(0) || "J"}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </View>

            <View style={styles.badgesContainer}>
              {job.job_is_remote && (
                <LinearGradient
                  colors={["#e0f2fe", "#f0f9ff"]}
                  style={styles.badge}
                >
                  <Ionicons name="wifi" size={12} color="#0284c7" />
                  <Text style={styles.badgeText}>Remote</Text>
                </LinearGradient>
              )}
            </View>
          </View>

          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle} numberOfLines={2}>
              {job.job_title}
            </Text>
            <Text style={styles.companyName} numberOfLines={1}>
              {job.employer_name}
            </Text>

            <View style={styles.jobFooter}>
              <View style={styles.locationContainer}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={COLORS.gray}
                />
                <Text style={styles.locationText}>{job.job_country}</Text>
              </View>
              <LinearGradient
                colors={[COLORS.primary + "20", COLORS.primary + "10"]}
                style={styles.applyButton}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={COLORS.primary}
                />
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const PopularJobs = ({ router }) => {
  const [popularJobs, setPopularJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPopularJobs();
  }, []);

  const fetchPopularJobs = async () => {
    try {
      setIsLoading(true);
      const response = await getPopularJobs(6); // Fetch up to 6 popular jobs
      if (response.data && response.data.length > 0) {
        setPopularJobs(response.data);
      }
    } catch (error) {
      console.error("Error fetching popular jobs:", error);
      setError(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobPress = (job) => {
    router.push(`/job-details/${job.job_id}`);
  };

  const handleSeeAllPress = () => {
    router.push({
      pathname: "/all-jobs",
      params: { title: "Popular Jobs", filter: "popular" },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#f9fafc", "#f8fafc"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Popular Jobs</Text>
            <Text style={styles.headerSubtitle}>Find your perfect role</Text>
          </View>
          <TouchableOpacity
            onPress={handleSeeAllPress}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.cardsContainer}>
        {isLoading ? (
          <FlatList
            data={[1, 2, 3]}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <ShimmerPlaceholder
                style={styles.shimmer}
                LinearGradient={LinearGradient}
              />
            )}
            keyExtractor={(item) => item.toString()}
          />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color={COLORS.red} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={popularJobs}
            renderItem={({ item, index }) => (
              <PopularJobCard
                job={item}
                onPress={handleJobPress}
                index={index}
              />
            )}
            keyExtractor={(item) => item.job_id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.medium,
  },
  headerGradient: {
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.medium,
    marginHorizontal: SIZES.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: SIZES.xLarge,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.gray,
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "10",
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small - 2,
    borderRadius: SIZES.large,
  },
  viewAllText: {
    marginRight: 4,
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },
  cardsContainer: {
    marginTop: SIZES.medium,
    marginHorizontal: SIZES.medium,
  },
  flatListContent: {
    paddingRight: SIZES.medium,
  },
  shimmer: {
    width: 280,
    height: 200,
    borderRadius: SIZES.medium,
    marginRight: SIZES.medium,
  },
  jobCard: {
    width: 280,
    marginRight: SIZES.medium,
    borderRadius: SIZES.large,
    // ...SHADOWS.medium,
  },
  cardTouchable: {
    borderRadius: SIZES.large,
    overflow: "hidden",
  },
  cardGradient: {
    padding: SIZES.medium,
  },
  jobCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  companyLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: SIZES.medium,
    overflow: "hidden",
  },
  companyLogo: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: "80%",
    height: "80%",
  },
  placeholderLogo: {
    width: 50,
    height: 50,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderLogoText: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: "bold",
  },
  badgesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.xSmall,
    paddingVertical: 4,
    borderRadius: SIZES.small,
  },
  badgeText: {
    fontSize: SIZES.small - 2,
    color: "#0284c7",
    fontFamily: FONT.medium,
    marginLeft: 4,
  },
  jobInfo: {
    marginTop: SIZES.small,
  },
  jobTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  companyName: {
    fontSize: SIZES.small + 2,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginTop: SIZES.xSmall / 2,
  },
  jobFooter: {
    marginTop: SIZES.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginLeft: 2,
  },
  applyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.small,
    paddingVertical: SIZES.xSmall,
    borderRadius: SIZES.small,
  },
  applyButtonText: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.primary,
    marginRight: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: SIZES.medium,
  },
  errorText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.red,
    textAlign: "center",
    marginLeft: SIZES.small,
  },
  noDataText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    textAlign: "center",
  },
});

export default PopularJobs;
