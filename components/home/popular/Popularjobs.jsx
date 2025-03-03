import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { db } from "../../../firebase/config";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import styles from "./popularjobs.style";
import { COLORS, SIZES } from "../../../constants";
import PopularJobCard from "../../common/cards/popular/PopularJobCard";
import { Ionicons } from "@expo/vector-icons";

const Popularjobs = () => {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  // Fetch popular jobs - modified to use applications count if available
  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching popular jobs...");
      const jobsCollection = collection(db, "jobs");
      // Try to get jobs ordered by application count if the field exists
      const popularJobsQuery = query(
        jobsCollection,
        orderBy("applications", "desc"),
        limit(10)
      );

      let jobsSnapshot;
      try {
        jobsSnapshot = await getDocs(popularJobsQuery);
      } catch (indexError) {
        // If ordering by applications fails (missing index), get any jobs
        console.log("Falling back to unordered jobs query");
        const fallbackQuery = query(jobsCollection, limit(10));
        jobsSnapshot = await getDocs(fallbackQuery);
      }

      const jobsList = [];
      jobsSnapshot.forEach((doc) => {
        jobsList.push({
          job_id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`Retrieved ${jobsList.length} jobs`);
      if (jobsList.length > 0) {
        setData(jobsList);
      } else {
        setError("No jobs found");
      }
    } catch (error) {
      console.error("Error fetching popular jobs:", error);
      setError(error.message || "Failed to fetch jobs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCardPress = (item) => {
    router.push(`/job-details/${item.job_id}`);
    setSelectedJob(item.job_id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons
            name="star"
            size={20}
            color={COLORS.primary}
            style={styles.titleIcon}
          />
          <Text style={styles.headerTitle}>Popular Jobs</Text>
        </View>
        <TouchableOpacity onPress={fetchJobs}>
          <Text style={styles.headerBtn}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchJobs}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : data.length === 0 ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No jobs found</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchJobs}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={data}
            renderItem={({ item }) => (
              <PopularJobCard
                item={item}
                selectedJob={selectedJob}
                handleCardPress={handleCardPress}
              />
            )}
            keyExtractor={(item) => item.job_id}
            contentContainerStyle={{ columnGap: SIZES.medium }}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

export default Popularjobs;
