import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from "react-native";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS } from "../constants";
import { ScreenHeaderBtn } from "../components";
import JobCard from "../components/common/cards/JobCard";
import {
  getPopularJobs,
  getNearbyJobs,
  saveJob,
  unsaveJob,
} from "../firebase/jobServices";
import { auth } from "../firebase/config";

const JOBS_PER_PAGE = 10;

const AllJobs = () => {
  const router = useRouter();
  const params = useSearchParams();
  const { title = "All Jobs", filter = "popular" } = params;

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  const [isSavingId, setIsSavingId] = useState(null);

  const fetchJobs = useCallback(
    async (pageNum = 0, shouldRefresh = false) => {
      try {
        if (shouldRefresh) {
          setRefreshing(true);
          setPage(0);
          pageNum = 0;
        } else if (pageNum === 0) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        let response;
        const limit = JOBS_PER_PAGE;
        const offset = pageNum * JOBS_PER_PAGE;

        if (filter === "popular") {
          response = await getPopularJobs(limit, offset);
        } else if (filter === "remote") {
          // Get nearby jobs and filter for remote ones
          const nearbyResponse = await getNearbyJobs(limit * 2, offset); // Get more to ensure we have enough after filtering
          if (nearbyResponse.status) {
            const remoteJobs = nearbyResponse.data.filter(
              (job) =>
                job.job_is_remote ||
                job.job_title?.toLowerCase().includes("remote") ||
                job.job_description?.toLowerCase().includes("remote")
            );
            response = { data: remoteJobs.slice(0, limit), status: true };
          } else {
            response = { data: [], status: false, error: nearbyResponse.error };
          }
        } else {
          // Default to recent jobs
          response = await getNearbyJobs(limit, offset);
        }

        if (response.status) {
          const newJobs = response.data || [];

          if (shouldRefresh || pageNum === 0) {
            setJobs(newJobs);
          } else {
            setJobs((prevJobs) => [...prevJobs, ...newJobs]);
          }

          setHasMoreJobs(newJobs.length === limit);
          setError(null);
        } else {
          setError(response.error || "Failed to load jobs");
        }
      } catch (err) {
        console.error(`Error fetching ${filter} jobs:`, err);
        setError(`Failed to load jobs. ${err.message}`);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    fetchJobs(0, false);
  }, [fetchJobs]);

  const handleLoadMore = useCallback(() => {
    if (hasMoreJobs && !loadingMore && !loading && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchJobs(nextPage, false);
    }
  }, [hasMoreJobs, loadingMore, loading, refreshing, page, fetchJobs]);

  const handleRefresh = useCallback(() => {
    fetchJobs(0, true);
  }, [fetchJobs]);

  const handleJobPress = useCallback(
    (jobId) => {
      router.push(`/job-details/${jobId}`);
    },
    [router]
  );

  const handleSaveJob = useCallback(
    async (job) => {
      if (!auth.currentUser) {
        router.push("/login");
        return;
      }

      setIsSavingId(job.job_id);

      try {
        if (job.isSaved) {
          await unsaveJob(job.job_id);

          setJobs((prevJobs) =>
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

          setJobs((prevJobs) =>
            prevJobs.map((j) =>
              j.job_id === job.job_id ? { ...j, isSaved: true } : j
            )
          );
        }
      } catch (error) {
        console.error("Error saving/unsaving job:", error);
      } finally {
        setIsSavingId(null);
      }
    },
    [router]
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingMoreText}>Loading more jobs...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          headerTitle: title,
          headerTitleStyle: {
            color: COLORS.primary,
            fontWeight: "bold",
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <ScreenHeaderBtn
              marginHorizontal={10}
              iconUrl={require("../assets/icons/left.png")}
              dimension="60%"
              handlePress={() => router.back()}
            />
          ),
        }}
      />

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={50} color={COLORS.red} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchJobs(0, false)}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item, index) => `${item.job_id || index}`}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              handleNavigate={() => handleJobPress(item.job_id)}
              handleUnsave={() => handleSaveJob(item)}
              showUnsaveButton={item.isSaved}
              isRemoving={isSavingId === item.job_id}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Ionicons
                name="briefcase-outline"
                size={60}
                color={COLORS.gray}
              />
              <Text style={styles.emptyStateText}>No jobs found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.large,
  },
  loadingText: {
    marginTop: SIZES.medium,
    color: COLORS.secondary,
    fontSize: SIZES.medium,
  },
  loadingMoreText: {
    marginTop: 5,
    color: COLORS.primary,
  },
  errorText: {
    marginTop: SIZES.medium,
    color: COLORS.red,
    fontSize: SIZES.medium,
    textAlign: "center",
  },
  retryButton: {
    marginTop: SIZES.medium,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: SIZES.small,
  },
  retryText: {
    color: COLORS.white,
    fontSize: SIZES.medium - 2,
    fontWeight: "bold",
  },
  listContainer: {
    padding: SIZES.medium,
    paddingBottom: 100, // Extra space at bottom for loading indicator
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyStateContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.xxLarge,
  },
  emptyStateText: {
    marginTop: SIZES.medium,
    color: COLORS.gray,
    fontSize: SIZES.medium,
    textAlign: "center",
  },
});

export default AllJobs;
