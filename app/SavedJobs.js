import React, { useState, useEffect } from "react";
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
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES } from "../constants";
import { getSavedJobs, unsaveJob } from "../firebase/jobServices";
import JobCard from "../components/common/cards/JobCard";

const SavedJobs = () => {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const jobs = await getSavedJobs();
      console.log(`Fetched ${jobs.length} saved jobs`);
      setSavedJobs(jobs);
      setError(null);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      setError("Failed to load your saved jobs. Please try again.");
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchSavedJobs(true);
  };

  const handleJobPress = (jobId) => {
    router.push(`/job-details/${jobId}`);
  };

  const handleUnsaveJob = async (jobId, documentId) => {
    try {
      // Show loading state
      setSavedJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.jobId === jobId ? { ...job, removing: true } : job
        )
      );

      // Use document ID if available, otherwise use job ID
      const idToUse = documentId || jobId;
      console.log(`Attempting to unsave job with ID: ${idToUse}`);

      // Call the unsaveJob function with proper error handling
      await unsaveJob(idToUse);

      // Remove job from the list if successful
      setSavedJobs((prevJobs) => prevJobs.filter((job) => job.jobId !== jobId));
    } catch (error) {
      console.error("Error unsaving job:", error);
      Alert.alert(
        "Error",
        "Failed to remove job from saved list. Please try again later."
      );

      // Reset loading state on error
      setSavedJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.jobId === jobId ? { ...job, removing: false } : job
        )
      );
    }
  };

  const renderJobItem = ({ item }) => (
    <JobCard
      job={item}
      handleNavigate={() => handleJobPress(item.jobId)}
      handleUnsave={() => handleUnsaveJob(item.jobId, item.id)}
      isRemoving={item.removing}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <LinearGradient
        colors={[COLORS.primary, "#396AFC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Jobs</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading saved jobs...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={50} color={COLORS.red} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchSavedJobs()}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : savedJobs.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="bookmark-outline" size={70} color={COLORS.gray} />
          <Text style={styles.noJobsTitle}>No saved jobs</Text>
          <Text style={styles.noJobsText}>Jobs you save will appear here</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push("/job")}
          >
            <Text style={styles.browseButtonText}>Browse Jobs</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedJobs}
          keyExtractor={(item) => item.id}
          renderItem={renderJobItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
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
    marginBottom: 65,
  },
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 15,

    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: SIZES.large,
    color: COLORS.white,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
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
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: "500",
  },
  noJobsTitle: {
    marginTop: SIZES.large,
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.secondary,
  },
  noJobsText: {
    marginTop: SIZES.small,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: SIZES.medium,
  },
  browseButton: {
    marginTop: SIZES.medium,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: "bold",
  },
  listContainer: {
    padding: SIZES.medium,
  },
});

export default SavedJobs;
