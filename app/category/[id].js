import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES } from "../../constants";
import { getJobsByCategory } from "../../firebase/jobServices";
import JobCard from "../../components/common/cards/JobCard";

const CategoryJobs = () => {
  const params = useSearchParams();
  const { id: categoryId, categoryName } = params;
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const jobsList = await getJobsByCategory(categoryId);
      setJobs(jobsList);
      setError(null);
    } catch (err) {
      console.error("Error fetching category jobs:", err);
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  }, [fetchJobs]);

  const handleJobPress = (jobId) => {
    router.push(`/job-details/${jobId}`);
  };

  const handleUnsave = async (jobId) => {
    try {
      await unsaveJob(jobId);
      setJobs((prevJobs) => prevJobs.filter((job) => job.job_id !== jobId));
    } catch (error) {
      console.error("Error unsaving job:", error);
      Alert.alert("Error", "Failed to unsave job. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
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
        <Text style={styles.headerTitle}>
          {categoryName || "Category Jobs"}
        </Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={50} color={COLORS.red} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchJobs}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="business-outline" size={70} color={COLORS.gray} />
          <Text style={styles.noJobsTitle}>No jobs found</Text>
          <Text style={styles.noJobsText}>
            No jobs available in this category at the moment.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push("/job")}
          >
            <Text style={styles.browseButtonText}>Browse All Jobs</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.job_id}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              handleNavigate={() => handleJobPress(item.job_id)}
              handleUnsave={() => handleUnsave(item.job_id)}
              showUnsaveButton={item.isSaved}
            />
          )}
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

export default CategoryJobs;
