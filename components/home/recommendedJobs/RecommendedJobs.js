import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { COLORS, FONT, SIZES, icons } from "../../../constants";
import Icon from "react-native-vector-icons/Ionicons";
import { checkImageURL } from "../../../utils";

// Sample job data (replace with API call in production)
const sampleJobs = [
  {
    id: "1",
    job_title: "Frontend Developer",
    employer_name: "Tech Innovations Inc.",
    job_employment_type: "Full-time",
    job_country: "Remote",
    employer_logo: "https://randomuser.me/api/portraits/men/41.jpg",
    job_apply_link: "https://example.com/apply",
    job_salary: "$90K-$120K",
    job_is_remote: true,
  },
  {
    id: "2",
    job_title: "UX/UI Designer",
    employer_name: "Creative Solutions",
    job_employment_type: "Contract",
    job_country: "United States",
    employer_logo: "https://randomuser.me/api/portraits/women/44.jpg",
    job_apply_link: "https://example.com/apply",
    job_salary: "$70K-$90K",
    job_is_remote: false,
  },
  {
    id: "3",
    job_title: "Backend Engineer",
    employer_name: "Data Systems Corp",
    job_employment_type: "Full-time",
    job_country: "Canada",
    employer_logo: "https://randomuser.me/api/portraits/men/38.jpg",
    job_apply_link: "https://example.com/apply",
    job_salary: "$100K-$130K",
    job_is_remote: true,
  },
  {
    id: "4",
    job_title: "Product Manager",
    employer_name: "InnoTech Solutions",
    job_employment_type: "Full-time",
    job_country: "United Kingdom",
    employer_logo: "https://randomuser.me/api/portraits/women/62.jpg",
    job_apply_link: "https://example.com/apply",
    job_salary: "$85K-$110K",
    job_is_remote: false,
  },
];

const RecommendedJobs = ({ router }) => {
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        // In a real app, fetch from API here
        // const response = await fetch('your-api-endpoint');
        // const data = await response.json();

        // Using sample data for now
        setTimeout(() => {
          setRecommendedJobs(sampleJobs);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        setError("Something went wrong");
        console.log(error);
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleSeeAllPress = () => {
    router.push("job");
  };

  const handleJobPress = (job) => {
    router.push(`job-details/${job.id}`);
  };

  const renderJobCard = ({ item }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => handleJobPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.jobHeader}>
        <View style={styles.companyImageContainer}>
          <Image
            source={{
              uri: checkImageURL(item.employer_logo)
                ? item.employer_logo
                : "https://t4.ftcdn.net/jpg/05/05/61/73/360_F_505617309_NN1CW7diNmGXJfMicpY9eXHKV4sqzO5H.jpg",
            }}
            resizeMode="contain"
            style={styles.companyImage}
          />
        </View>

        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {item.job_title}
          </Text>
          <Text style={styles.companyName} numberOfLines={1}>
            {item.employer_name}
          </Text>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Icon name="bookmark-outline" size={20} color={COLORS.tertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.jobDetails}>
        <View style={styles.detailItem}>
          <Icon name="briefcase-outline" size={14} color={COLORS.gray} />
          <Text style={styles.detailText}>{item.job_employment_type}</Text>
        </View>

        <View style={styles.detailItem}>
          <Icon name="location-outline" size={14} color={COLORS.gray} />
          <Text style={styles.detailText}>
            {item.job_is_remote ? "Remote" : item.job_country}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Icon name="cash-outline" size={14} color={COLORS.gray} />
          <Text style={styles.detailText}>{item.job_salary}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.applyButton}>
        <Text style={styles.applyButtonText}>View Job</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recommended Jobs</Text>
        <TouchableOpacity onPress={handleSeeAllPress}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={recommendedJobs}
          renderItem={renderJobCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.jobsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SIZES.small,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.medium,
    marginBottom: SIZES.small,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  seeAllText: {
    fontSize: SIZES.medium - 2,
    fontFamily: FONT.medium,
    color: COLORS.tertiary,
  },
  jobsList: {
    paddingLeft: SIZES.medium,
    paddingRight: SIZES.small,
  },
  jobCard: {
    width: 280,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginRight: SIZES.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  companyImageContainer: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray2,
  },
  companyImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  jobInfo: {
    flex: 1,
    marginLeft: SIZES.small,
  },
  jobTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  companyName: {
    fontSize: SIZES.small + 2,
    fontFamily: FONT.medium,
    color: COLORS.gray,
    marginTop: 2,
  },
  saveButton: {
    width: 35,
    height: 35,
    borderRadius: 8,
    backgroundColor: "rgba(4, 96, 217, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  jobDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: SIZES.small,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightWhite,
    paddingHorizontal: SIZES.medium - 2,
    paddingVertical: SIZES.small / 2,
    borderRadius: SIZES.small,
    marginRight: SIZES.small,
    marginBottom: SIZES.small,
  },
  detailText: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.gray,
    marginLeft: 4,
  },
  applyButton: {
    backgroundColor: COLORS.tertiary,
    borderRadius: SIZES.small,
    paddingVertical: SIZES.small + 2,
    alignItems: "center",
    marginTop: SIZES.small / 2,
  },
  applyButtonText: {
    fontSize: SIZES.medium - 2,
    fontFamily: FONT.bold,
    color: COLORS.white,
  },
  loadingContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    textAlign: "center",
    fontFamily: FONT.medium,
    color: "red",
    marginVertical: SIZES.medium,
  },
});

export default RecommendedJobs;
