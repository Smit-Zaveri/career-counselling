import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, SHADOWS } from "../constants";
import { ScreenHeaderBtn } from "../components";
import {
  getSavedJobsCount,
  saveJob,
  unsaveJob,
  getPopularJobs,
  getNearbyJobs,
  getJobCategories,
  getJobsByCategory,
} from "../firebase/jobServices";
import { getApplicationCount } from "../firebase/applicationServices";
import { auth } from "../firebase/config";

// Skeleton loaders for various components
const SkeletonCategoryCard = () => (
  <View style={[styles.categoryCard, { opacity: 0.7 }]}>
    <View
      style={[styles.categoryIconContainer, { backgroundColor: COLORS.gray2 }]}
    />
    <View style={[styles.skeletonText, { width: 70, marginTop: 10 }]} />
    <View style={[styles.skeletonText, { width: 50, marginTop: 5 }]} />
  </View>
);

const SkeletonPopularJobCard = () => (
  <View style={[styles.popularJobCard, { opacity: 0.7 }]}>
    <View style={styles.popularJobHeader}>
      <View
        style={[styles.companyLogoContainer, { backgroundColor: COLORS.gray2 }]}
      />
      <View
        style={[styles.remoteTag, { backgroundColor: COLORS.gray2, width: 50 }]}
      />
    </View>
    <View
      style={[styles.skeletonText, { width: 150, height: 20, marginTop: 10 }]}
    />
    <View style={[styles.skeletonText, { width: 100, marginTop: 5 }]} />
    <View style={styles.locationContainer}>
      <View style={[styles.skeletonText, { width: 120, marginTop: 10 }]} />
    </View>
  </View>
);

const SkeletonRecentJobCard = () => (
  <View style={[styles.recentJobCard, { opacity: 0.7 }]}>
    <View style={styles.recentJobHeader}>
      <View
        style={[styles.companyLogoSmall, { backgroundColor: COLORS.gray2 }]}
      />
      <View style={styles.jobDetails}>
        <View
          style={[
            styles.skeletonText,
            { width: 150, height: 16, marginBottom: 5 },
          ]}
        />
        <View style={[styles.skeletonText, { width: 100 }]} />
      </View>
    </View>
    <View style={styles.jobFooter}>
      <View
        style={[styles.jobDetail, { backgroundColor: COLORS.gray2, width: 80 }]}
      />
      <View
        style={[styles.jobDetail, { backgroundColor: COLORS.gray2, width: 90 }]}
      />
      <View
        style={[styles.jobDetail, { backgroundColor: COLORS.gray2, width: 70 }]}
      />
    </View>
  </View>
);

const JobHeader = ({ activeTab, setActiveTab, tabs }) => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerTitle}>Find Your Perfect Job</Text>
    <Text style={styles.headerSubtitle}>
      Explore opportunities that match your skills
    </Text>

    <View style={styles.tabsContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabButton,
            activeTab === tab.id && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText,
            ]}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const JobStats = ({ savedJobsCount, applicationsCount, onSavedJobsPress }) => (
  <View style={styles.statsContainer}>
    <LinearGradient
      colors={[COLORS.primary, "#396AFC"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.statsCard}
    >
      <View style={styles.statItem}>
        <View style={styles.statIconContainer}>
          <Ionicons name="briefcase-outline" size={22} color="#FFF" />
        </View>
        <Text style={styles.statNumber}>{applicationsCount}</Text>
        <Text style={styles.statLabel}>Applied</Text>
      </View>

      <View style={styles.statDivider} />

      <TouchableOpacity style={styles.statItem} onPress={onSavedJobsPress}>
        <View style={styles.statIconContainer}>
          <Ionicons name="bookmark-outline" size={22} color="#FFF" />
        </View>
        <Text style={styles.statNumber}>{savedJobsCount}</Text>
        <Text style={styles.statLabel}>Saved</Text>
      </TouchableOpacity>
    </LinearGradient>
  </View>
);

const JobCategoryCard = ({ category, onPress }) => (
  <TouchableOpacity
    style={styles.categoryCard}
    onPress={() => onPress(category)}
  >
    <View
      style={[
        styles.categoryIconContainer,
        { backgroundColor: category.color || COLORS.primary },
      ]}
    >
      <Ionicons name={category.icon || "grid-outline"} size={22} color="#FFF" />
    </View>
    <Text style={styles.categoryTitle}>{category.name}</Text>
    <Text style={styles.categoryCount}>{category.jobCount || 0} jobs</Text>
  </TouchableOpacity>
);

const PopularJobCard = ({ job, onPress }) => (
  <TouchableOpacity style={styles.popularJobCard} onPress={() => onPress(job)}>
    <View style={styles.popularJobHeader}>
      <View style={styles.companyLogoContainer}>
        {job.employer_logo ? (
          <Image
            source={{ uri: job.employer_logo }}
            style={styles.companyLogo}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderLogo}>
            <Text style={styles.placeholderText}>
              {job.employer_name?.charAt(0) || "J"}
            </Text>
          </View>
        )}
      </View>
      {job.job_is_remote && (
        <View style={styles.remoteTag}>
          <Text style={styles.remoteTagText}>Remote</Text>
        </View>
      )}
    </View>

    <Text style={styles.jobTitle} numberOfLines={2}>
      {job.job_title || "Job Title"}
    </Text>
    <Text style={styles.companyName} numberOfLines={1}>
      {job.employer_name || "Company"}
    </Text>

    <View style={styles.locationContainer}>
      <Ionicons name="location-outline" size={14} color={COLORS.gray} />
      <Text style={styles.locationText} numberOfLines={1}>
        {job.job_country || "Location"}
      </Text>
    </View>
  </TouchableOpacity>
);

const RecentJobCard = ({ job, onPress, onSave, isSavingId }) => (
  <TouchableOpacity style={styles.recentJobCard} onPress={() => onPress(job)}>
    <View style={styles.recentJobHeader}>
      <View style={styles.companyLogoSmall}>
        {job.employer_logo ? (
          <Image
            source={{ uri: job.employer_logo }}
            style={styles.companyLogoSmall}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.placeholderTextSmall}>
            {job.employer_name?.charAt(0) || "J"}
          </Text>
        )}
      </View>
      <View style={styles.jobDetails}>
        <Text style={styles.recentJobTitle} numberOfLines={1}>
          {job.job_title}
        </Text>
        <Text style={styles.recentCompanyName} numberOfLines={1}>
          {job.employer_name}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onSave(job)}
        disabled={isSavingId === job.job_id}
        style={styles.bookmarkContainer}
      >
        {isSavingId === job.job_id ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons
            name={job.isSaved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={job.isSaved ? COLORS.primary : COLORS.gray}
            style={styles.bookmarkIcon}
          />
        )}
      </TouchableOpacity>
    </View>

    <View style={styles.jobFooter}>
      <View style={styles.jobDetail}>
        <Ionicons name="location-outline" size={14} color={COLORS.gray} />
        <Text style={styles.jobDetailText}>
          {job.job_country || "Location not specified"}
        </Text>
      </View>
      <View style={styles.jobDetail}>
        <Ionicons name="time-outline" size={14} color={COLORS.gray} />
        <Text style={styles.jobDetailText}>
          {job.job_employment_type || "Not specified"}
        </Text>
      </View>
      {job.job_salary && (
        <View style={styles.jobDetail}>
          <Ionicons name="cash-outline" size={14} color={COLORS.gray} />
          <Text style={styles.jobDetailText}>{job.job_salary}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

const Job = () => {
  const router = useRouter();
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("popular");
  const [isSavingId, setIsSavingId] = useState(null); // Track which job is being saved

  // Data states
  const [popularJobs, setPopularJobs] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryJobs, setCategoryJobs] = useState({});

  // Loading states
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Default tabs
  const tabs = useMemo(
    () => [
      { id: "popular", name: "Popular" },
      { id: "recent", name: "Recent" },
      { id: "remote", name: "Remote" },
    ],
    []
  );

  // Load initial data in parallel using Promise.all for better performance
  const loadInitialData = useCallback(async () => {
    try {
      // Start loading states
      setLoadingPopular(true);
      setLoadingRecent(true);
      setLoadingCategories(true);

      // Load counts and categories in parallel
      const [savedCount, appCount, categoriesData] = await Promise.all([
        getSavedJobsCount().catch((err) => {
          console.error("Error getting saved jobs count:", err);
          return 0;
        }),
        getApplicationCount().catch((err) => {
          console.error("Error getting application count:", err);
          return 0;
        }),
        getJobCategories().catch((err) => {
          console.error("Error getting job categories:", err);
          return [];
        }),
      ]);

      setSavedJobsCount(savedCount);
      setApplicationsCount(appCount);

      // Process categories data
      const categoryColors = [
        "#6C63FF",
        "#FF6584",
        "#38E54D",
        "#FF7F50",
        "#4B7BE5",
        "#F24976",
      ];
      const categoryIcons = [
        "laptop-outline",
        "business-outline",
        "cash-outline",
        "medkit-outline",
        "code-slash-outline",
        "briefcase-outline",
      ];

      const enhancedCategories = categoriesData.map((category, index) => ({
        ...category,
        color: categoryColors[index % categoryColors.length],
        icon: categoryIcons[index % categoryIcons.length],
      }));

      setCategories(enhancedCategories);
      setLoadingCategories(false);

      // Start loading jobs for active tab
      loadJobsByTab(activeTab);
    } catch (error) {
      console.error("Error loading initial data:", error);
      setLoadingPopular(false);
      setLoadingRecent(false);
      setLoadingCategories(false);
    }
  }, [activeTab]);

  const loadJobsByTab = useCallback(async (tabId) => {
    try {
      if (tabId === "popular") {
        setLoadingPopular(true);
        const { data } = await getPopularJobs();
        setPopularJobs(data);
        setLoadingPopular(false);
      } else if (tabId === "recent") {
        setLoadingRecent(true);
        const { data } = await getNearbyJobs();
        setRecentJobs(data);
        setLoadingRecent(false);
      } else if (tabId === "remote") {
        setLoadingRecent(true);
        const { data } = await getNearbyJobs();
        // Filter remote jobs
        const remoteJobs = data.filter(
          (job) =>
            job.job_is_remote ||
            job.job_title?.toLowerCase().includes("remote") ||
            job.job_description?.toLowerCase().includes("remote")
        );
        setRecentJobs(remoteJobs);
        setLoadingRecent(false);
      }
    } catch (error) {
      console.error("Error loading jobs by tab:", error);
      setLoadingPopular(false);
      setLoadingRecent(false);
    }
  }, []);

  // Use useEffect to load initial data and set up tab listener
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadJobsByTab(activeTab);
  }, [activeTab, loadJobsByTab]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, [loadInitialData]);

  const handleJobPress = useCallback(
    (job) => {
      router.push(`/job-details/${job.job_id}`);
    },
    [router]
  );

  const handleCategoryPress = useCallback(
    (category) => {
      router.push({
        pathname: `/category/${category.id}`,
        params: {
          categoryName: category.name,
          categoryId: category.id,
        },
      });
    },
    [router]
  );

  // Fix the save job functionality
  const handleSaveJob = useCallback(
    async (job) => {
      if (!auth.currentUser) {
        router.push("/login");
        return;
      }

      // Set saving state for this specific job
      setIsSavingId(job.job_id);

      try {
        if (job.isSaved) {
          await unsaveJob(job.job_id);

          // Update the state to reflect the change
          setRecentJobs((prevJobs) =>
            prevJobs.map((j) =>
              j.job_id === job.job_id ? { ...j, isSaved: false } : j
            )
          );
        } else {
          const jobData = {
            jobId: job.job_id,
            job_title: job.job_title,
            employer_name: job.employer_name,
            employer_logo: job.employer_logo,
            job_country: job.job_country,
            job_employment_type: job.job_employment_type,
            job_apply_link: job.job_apply_link,
          };

          await saveJob(jobData);

          // Update the state to reflect the change
          setRecentJobs((prevJobs) =>
            prevJobs.map((j) =>
              j.job_id === job.job_id ? { ...j, isSaved: true } : j
            )
          );
        }

        // Refresh saved jobs count
        const newCount = await getSavedJobsCount();
        setSavedJobsCount(newCount);
      } catch (error) {
        console.error("Error saving/unsaving job:", error);
      } finally {
        // Clear saving state
        setIsSavingId(null);
      }
    },
    [router]
  );

  const navigateToSavedJobs = useCallback(() => {
    router.push("/SavedJobs");
  }, [router]);

  // Add these two new functions for "See All" navigation
  const handleSeeAllCategories = () => {
    router.push({
      pathname: "/all-categories",
      params: {
        title: "All Categories",
        source: "categories",
      },
    });
  };

  const handleSeeAllJobs = () => {
    // Send different parameters based on the active tab
    let params = {
      title:
        activeTab === "popular"
          ? "Popular Jobs"
          : activeTab === "remote"
          ? "Remote Jobs"
          : "Recent Jobs",
      filter: activeTab,
    };

    router.push({
      pathname: "/all-jobs",
      params: params,
    });
  };

  // Render skeleton loaders for categories
  const renderCategorySkeletons = () => (
    <FlatList
      data={Array(4).fill(null)}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(_, index) => `category-skeleton-${index}`}
      contentContainerStyle={styles.categoriesList}
      renderItem={() => <SkeletonCategoryCard />}
    />
  );

  // Render skeleton loaders for popular jobs
  const renderPopularJobSkeletons = () => (
    <FlatList
      data={Array(3).fill(null)}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(_, index) => `job-skeleton-${index}`}
      contentContainerStyle={styles.popularJobsList}
      renderItem={() => <SkeletonPopularJobCard />}
    />
  );

  // Render skeleton loaders for recent jobs
  const renderRecentJobSkeletons = () => (
    <>
      {Array(3)
        .fill(null)
        .map((_, index) => (
          <SkeletonRecentJobCard key={`recent-job-skeleton-${index}`} />
        ))}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="light-content" /> */}
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          headerTitle: "",
          headerStyle: { backgroundColor: COLORS.lightWhite },
          headerShadowVisible: false,
          headerLeft: () => null,
        }}
      />

      <FlatList
        data={[]} // Empty array because we're using ListHeaderComponent for content
        keyExtractor={(item) => item.id}
        renderItem={null}
        initialNumToRender={4}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        ListHeaderComponent={
          <>
            <JobHeader
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabs={tabs}
            />

            <JobStats
              savedJobsCount={savedJobsCount}
              applicationsCount={applicationsCount}
              onSavedJobsPress={navigateToSavedJobs}
            />

            {/* Job Categories */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Job Categories</Text>
                <TouchableOpacity onPress={handleSeeAllCategories}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              {loadingCategories ? (
                renderCategorySkeletons()
              ) : (
                <FlatList
                  data={categories}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.categoriesList}
                  renderItem={({ item }) => (
                    <JobCategoryCard
                      category={item}
                      onPress={handleCategoryPress}
                    />
                  )}
                />
              )}
            </View>

            {/* Popular Jobs or Jobs for Active Tab */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {activeTab === "popular"
                    ? "Popular Jobs"
                    : activeTab === "recent"
                    ? "Recent Jobs"
                    : "Remote Jobs"}
                </Text>
                <TouchableOpacity onPress={handleSeeAllJobs}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              {loadingPopular && activeTab === "popular" ? (
                renderPopularJobSkeletons()
              ) : activeTab === "popular" ? (
                <FlatList
                  data={popularJobs}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.job_id}
                  contentContainerStyle={styles.popularJobsList}
                  initialNumToRender={5}
                  maxToRenderPerBatch={5}
                  renderItem={({ item }) => (
                    <PopularJobCard job={item} onPress={handleJobPress} />
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyStateContainer}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={40}
                        color={COLORS.gray}
                      />
                      <Text style={styles.emptyStateText}>
                        No popular jobs found
                      </Text>
                    </View>
                  }
                />
              ) : // Show loading or job content for recent/remote tabs
              loadingRecent ? (
                renderRecentJobSkeletons()
              ) : (
                recentJobs.map((job) => (
                  <RecentJobCard
                    key={job.job_id}
                    job={job}
                    onPress={handleJobPress}
                    onSave={handleSaveJob}
                    isSavingId={isSavingId}
                  />
                ))
              )}

              {!loadingRecent &&
                activeTab !== "popular" &&
                recentJobs.length === 0 && (
                  <View style={styles.emptyStateContainer}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={40}
                      color={COLORS.gray}
                    />
                    <Text style={styles.emptyStateText}>
                      {activeTab === "remote"
                        ? "No remote jobs found"
                        : "No recent jobs found"}
                    </Text>
                  </View>
                )}
            </View>
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
    marginBottom: 85,
  },
  headerContainer: {
    padding: SIZES.medium,
    paddingTop: 0,
  },
  headerTitle: {
    fontSize: SIZES.xLarge,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: SIZES.small + 2,
    color: COLORS.gray,
    marginTop: 4,
    marginBottom: SIZES.medium,
  },
  tabsContainer: {
    flexDirection: "row",
    marginTop: SIZES.small,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.lightWhite,
    ...SHADOWS.small,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.small + 1,
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  statsContainer: {
    paddingHorizontal: SIZES.medium,
    marginTop: SIZES.small,
  },
  statsCard: {
    flexDirection: "row",
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    ...SHADOWS.medium,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.white,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: SIZES.small,
  },
  sectionContainer: {
    marginTop: SIZES.large,
    paddingHorizontal: SIZES.medium,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  sectionTitle: {
    fontSize: SIZES.large - 2,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  seeAllText: {
    fontSize: SIZES.small + 1,
    color: COLORS.secondary,
  },
  categoriesList: {
    paddingRight: SIZES.medium,
  },
  categoryCard: {
    width: 110,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.small,
    marginRight: SIZES.medium,
    alignItems: "center",
    // ...SHADOWS.small,
  },
  categoryIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: SIZES.small + 1,
    fontWeight: "600",
    marginTop: 4,
    color: COLORS.secondary,
  },
  categoryCount: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 2,
  },
  popularJobsList: {
    paddingRight: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  popularJobCard: {
    width: 200,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginRight: SIZES.medium,
    // ...SHADOWS.small,
  },
  popularJobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  companyLogoContainer: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.lightWhite,
    borderRadius: SIZES.small,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  companyLogo: {
    width: 35,
    height: 35,
  },
  placeholderLogo: {
    width: 40,
    height: 40,
    borderRadius: SIZES.small,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
  },
  remoteTag: {
    backgroundColor: "rgba(106, 90, 205, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.small,
  },
  remoteTagText: {
    fontSize: SIZES.small - 2,
    color: "#6A5ACD",
    fontWeight: "500",
  },
  jobTitle: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: SIZES.small,
  },
  companyName: {
    fontSize: SIZES.small + 1,
    color: COLORS.gray,
    marginVertical: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginLeft: 4,
  },
  recentJobCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    ...SHADOWS.small,
  },
  recentJobHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  companyLogoSmall: {
    width: 40,
    height: 40,
    borderRadius: SIZES.small,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderTextSmall: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
  jobDetails: {
    flex: 1,
    marginLeft: SIZES.small,
  },
  recentJobTitle: {
    fontSize: SIZES.medium - 1,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  recentCompanyName: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 2,
  },
  bookmarkIcon: {
    padding: 4, // Reduced padding for better touch experience
  },
  jobFooter: {
    flexDirection: "row",
    marginTop: SIZES.small,
    flexWrap: "wrap",
  },
  jobDetail: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightWhite,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.small,
    marginRight: 8,
    marginBottom: 4,
  },
  jobDetailText: {
    fontSize: SIZES.small - 1,
    color: COLORS.gray,
    marginLeft: 4,
  },
  loadingContainer: {
    padding: SIZES.medium,
    alignItems: "center",
  },
  emptyStateContainer: {
    padding: SIZES.large,
    alignItems: "center",
    backgroundColor: COLORS.lightWhite,
    borderRadius: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  emptyStateText: {
    marginTop: SIZES.small,
    color: COLORS.gray,
    fontSize: SIZES.medium,
  },
  skeletonText: {
    height: 14,
    backgroundColor: COLORS.gray2,
    borderRadius: 4,
  },
  bookmarkContainer: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Job;
