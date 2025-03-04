import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { COLORS, SIZES, FONT } from "../../constants";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../../firebase/config";
import JobCard from "../../components/common/cards/JobCard";

const CategoryJobs = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryId = params?.id;
  const categoryName = params?.name || "Category Jobs";

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    fetchJobsByCategory();
  }, [categoryId]);

  const fetchJobsByCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo(null);

      // Validate categoryId before using it in query
      if (!categoryId) {
        setError("Missing category ID");
        setLoading(false);
        return;
      }

      console.log(`Fetching jobs for category ID: ${categoryId}`);

      // First try to get all jobs to see what's available
      const jobsRef = collection(db, "jobs");
      const allJobsSnapshot = await getDocs(query(jobsRef, limit(5)));

      let sampleJob = null;
      if (!allJobsSnapshot.empty) {
        sampleJob = allJobsSnapshot.docs[0].data();
        console.log("Sample job fields:", Object.keys(sampleJob));

        // Record debug info
        setDebugInfo({
          sampleJobFields: Object.keys(sampleJob),
          categoryIdType: typeof categoryId,
          categoryIdValue: categoryId,
        });
      }

      // Try different field names that might contain category information
      const possibleCategoryFields = [
        "job_category",
        "category",
        "job_category_id",
        "categoryId",
        "jobCategory",
      ];

      let jobsFound = false;
      let jobsData = [];

      for (const fieldName of possibleCategoryFields) {
        try {
          console.log(`Trying field name: ${fieldName}`);

          // Try string comparison
          const stringQuery = query(
            jobsRef,
            where(fieldName, "==", categoryId),
            limit(20)
          );

          const querySnapshot = await getDocs(stringQuery);

          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              jobsData.push({ id: doc.id, ...doc.data() });
            });

            console.log(
              `Found ${jobsData.length} jobs using field ${fieldName}`
            );
            jobsFound = true;
            break;
          }

          // If string comparison failed, try numeric comparison if categoryId looks like a number
          if (!isNaN(Number(categoryId))) {
            const numQuery = query(
              jobsRef,
              where(fieldName, "==", Number(categoryId)),
              limit(20)
            );

            const numQuerySnapshot = await getDocs(numQuery);

            if (!numQuerySnapshot.empty) {
              numQuerySnapshot.forEach((doc) => {
                jobsData.push({ id: doc.id, ...doc.data() });
              });

              console.log(
                `Found ${jobsData.length} jobs using numeric field ${fieldName}`
              );
              jobsFound = true;
              break;
            }
          }
        } catch (fieldError) {
          console.log(`Error with field ${fieldName}:`, fieldError.message);
        }
      }

      // If no specific category jobs found, fall back to a simple query that might work
      if (!jobsFound) {
        // Try a simple query to get any jobs, then filter client-side
        const simpleSnapshot = await getDocs(query(jobsRef, limit(50)));

        // Client-side filtering - check all job fields for the category value
        simpleSnapshot.forEach((doc) => {
          const jobData = doc.data();

          // Check if any field contains the category ID
          const containsCategory = Object.values(jobData).some((value) => {
            if (typeof value === "string") {
              return value.toLowerCase().includes(categoryId.toLowerCase());
            }
            return false;
          });

          if (containsCategory) {
            jobsData.push({ id: doc.id, ...jobData });
          }
        });
      }

      setJobs(jobsData);

      if (jobsData.length === 0) {
        setError(`No jobs found in category: ${categoryName}`);
      }
    } catch (err) {
      console.error("Error fetching jobs by category:", err);
      setError(`Failed to load jobs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: categoryName,
          headerTintColor: COLORS.primary,
          headerBackVisible: true,
          headerStyle: {
            backgroundColor: COLORS.lightWhite,
          },
        }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={COLORS.red} />
          <Text style={styles.errorText}>{error}</Text>

          {debugInfo && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Information:</Text>
              <Text style={styles.debugText}>
                Category ID: {debugInfo.categoryIdValue}
              </Text>
              <Text style={styles.debugText}>
                Type: {debugInfo.categoryIdType}
              </Text>
              {debugInfo.sampleJobFields && (
                <Text style={styles.debugText}>
                  Available fields: {debugInfo.sampleJobFields.join(", ")}
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchJobsByCategory}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.browseButton, { marginTop: SIZES.small }]}
            onPress={() => router.push("/job")}
          >
            <Text style={styles.browseText}>Browse All Jobs</Text>
          </TouchableOpacity>
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={60} color={COLORS.gray} />
          <Text style={styles.emptyText}>No jobs found in this category</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push("/job")}
          >
            <Text style={styles.browseText}>Browse All Jobs</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              handleNavigate={() => router.push(`/job-details/${item.id}`)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.jobsList}
          showsVerticalScrollIndicator={false}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SIZES.medium,
    color: COLORS.primary,
    fontFamily: FONT.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.large,
  },
  errorText: {
    marginTop: SIZES.small,
    textAlign: "center",
    color: COLORS.secondary,
    fontFamily: FONT.medium,
    marginBottom: SIZES.medium,
  },
  debugContainer: {
    backgroundColor: COLORS.lightWhite,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    marginVertical: SIZES.medium,
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.gray2,
  },
  debugTitle: {
    fontFamily: FONT.bold,
    color: COLORS.tertiary,
    marginBottom: SIZES.small,
  },
  debugText: {
    fontFamily: FONT.regular,
    color: COLORS.gray,
    fontSize: SIZES.small + 2,
    marginBottom: 2,
  },
  retryButton: {
    marginTop: SIZES.medium,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.small,
  },
  retryText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.large,
  },
  emptyText: {
    marginTop: SIZES.small,
    textAlign: "center",
    color: COLORS.secondary,
    fontFamily: FONT.medium,
    marginBottom: SIZES.medium,
  },
  browseButton: {
    marginTop: SIZES.medium,
    backgroundColor: COLORS.secondary,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.small,
  },
  browseText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
  },
  jobsList: {
    paddingHorizontal: SIZES.medium,

    gap: SIZES.medium,
  },
});

export default CategoryJobs;
