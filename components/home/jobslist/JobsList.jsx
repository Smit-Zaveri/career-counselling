import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { COLORS, SIZES, FONT, icons } from "../../../constants";
import NearbyJobCard from "../../common/cards/nearby/NearbyJobCard";
import { Ionicons } from "@expo/vector-icons";

const JobsList = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAllJobs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching all jobs from Firestore...");
      const jobsCollection = collection(db, "jobs");
      const jobsSnapshot = await getDocs(jobsCollection);

      const jobsList = [];
      jobsSnapshot.forEach((doc) => {
        jobsList.push({
          job_id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`Retrieved ${jobsList.length} jobs from Firestore`);
      setAllJobs(jobsList);
      setFilteredJobs(jobsList);
    } catch (error) {
      console.error("Error fetching all jobs:", error);
      setError(error.message || "Failed to fetch jobs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  // Filter jobs based on search term
  const handleSearch = (text) => {
    setSearchTerm(text);

    if (!text.trim()) {
      setFilteredJobs(allJobs);
      return;
    }

    const filtered = allJobs.filter(
      (job) =>
        job.job_title?.toLowerCase().includes(text.toLowerCase()) ||
        job.employer_name?.toLowerCase().includes(text.toLowerCase()) ||
        job.job_country?.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredJobs(filtered);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Available Jobs</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchAllJobs}>
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar - Enhanced */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.gray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={handleSearch}
            placeholder="Search by title, company or location"
            placeholderTextColor={COLORS.gray}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.jobCount}>
        {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
      </Text>

      <View style={styles.jobsContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchAllJobs}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredJobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={50} color={COLORS.gray2} />
            <Text style={styles.emptyText}>
              {searchTerm ? "No jobs match your search" : "No jobs available"}
            </Text>
            {searchTerm && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => handleSearch("")}
              >
                <Text style={styles.clearButtonText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredJobs}
            renderItem={({ item }) => (
              <JobCard
                job={item}
                handleNavigate={() =>
                  router.push(`/job-details/${item.job_id}`)
                }
              />
            )}
            keyExtractor={(item) => item.job_id}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

// Job card without apply button - just view details
const JobCard = ({ job, handleNavigate }) => {
  const defaultImage =
    "https://t4.ftcdn.net/jpg/05/05/61/73/360_F_505617309_NN1CW7diNmGXJfMicpY9eXHKV4sqzO5H.jpg";

  return (
    <TouchableOpacity style={styles.jobCard} onPress={handleNavigate}>
      <View style={styles.cardHeader}>
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: job.employer_logo || defaultImage,
            }}
            resizeMode="contain"
            style={styles.logoImage}
          />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {job.job_title || "Job Title"}
          </Text>
          <Text style={styles.companyName} numberOfLines={1}>
            {job.employer_name || "Company Name"}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.gray} />
          <Text style={styles.infoText}>{job.job_country || "Location"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={COLORS.gray} />
          <Text style={styles.infoText}>
            {job.job_employment_type || "Full-time"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={handleNavigate}
      >
        <Text style={styles.viewDetailsText}>View Details</Text>
        <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: SIZES.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  refreshButton: {
    padding: SIZES.small,
  },
  searchContainer: {
    marginVertical: SIZES.medium,
  },
  searchWrapper: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.medium,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.gray2,
  },
  searchIcon: {
    marginRight: SIZES.small,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT.regular,
    height: "100%",
  },
  jobCount: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium - 2,
    color: COLORS.secondary,
    marginBottom: SIZES.small,
  },
  jobsContainer: {
    flex: 1,
    marginTop: SIZES.small,
  },
  errorContainer: {
    alignItems: "center",
    padding: SIZES.medium,
  },
  errorText: {
    fontFamily: FONT.medium,
    color: COLORS.gray,
    marginBottom: SIZES.small,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.small,
  },
  retryButtonText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.small,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.xxLarge,
  },
  emptyText: {
    fontFamily: FONT.medium,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: SIZES.medium,
  },
  clearButton: {
    marginTop: SIZES.medium,
    padding: SIZES.small,
  },
  clearButtonText: {
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },
  // Enhanced Job Card styles
  jobCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    ...SIZES.shadow,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray2,
  },
  logoImage: {
    width: "80%",
    height: "80%",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: SIZES.medium,
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
    marginTop: 2,
  },
  cardDetails: {
    marginTop: SIZES.small,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  infoText: {
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginLeft: SIZES.small,
    fontSize: SIZES.small + 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SIZES.medium,
  },
  detailsButton: {
    flex: 1,
    paddingVertical: SIZES.small,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.small,
    marginRight: SIZES.small,
  },
  detailsButtonText: {
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: SIZES.small,
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.small,
  },
  applyButtonText: {
    fontFamily: FONT.medium,
    color: COLORS.white,
  },
  // Modified button styles
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SIZES.medium,
    paddingVertical: SIZES.small,
    backgroundColor: COLORS.lightWhite,
    borderRadius: SIZES.small,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  viewDetailsText: {
    fontFamily: FONT.medium,
    color: COLORS.primary,
    marginRight: SIZES.small,
  },
});

export default JobsList;
