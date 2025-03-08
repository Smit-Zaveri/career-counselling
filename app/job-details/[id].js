import { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Linking,
  Share,
  ImageBackground,
} from "react-native";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

import {
  Company,
  JobAbout,
  JobTabs,
  ScreenHeaderBtn,
  Specifics,
} from "../../components";
import { COLORS, icons, SIZES, SHADOWS } from "../../constants";
import {
  getJobDetails,
  saveJob,
  unsaveJob,
  checkIfJobSaved,
} from "../../firebase/jobServices";
import { auth } from "../../firebase/config";

const tabs = ["About", "Qualifications", "Responsibilities"];

const JobDetails = () => {
  const params = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [jobSaved, setJobSaved] = useState(false);
  const [jobData, setJobData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);

  // Load job details when component mounts
  useEffect(() => {
    fetchJobDetails();
  }, []);

  // Function to fetch job details
  const fetchJobDetails = async () => {
    try {
      setIsLoading(true);
      const jobId = params.id;

      if (!jobId) {
        setError("Job ID is missing");
        return;
      }

      const response = await getJobDetails(jobId);

      if (response.status && response.data?.length > 0) {
        setJobData(response.data[0]);
        setJobSaved(response.data[0].isSaved);

        // Fetch similar jobs based on job title or category
        if (response.data[0].job_title) {
          fetchSimilarJobs(response.data[0].job_title);
        }
      } else {
        setError("Failed to load job details");
      }
    } catch (err) {
      console.error("Error fetching job details:", err);
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch similar jobs
  const fetchSimilarJobs = async (jobTitle) => {
    try {
      // This is a placeholder - in a real app, you would implement
      // a proper function to fetch similar jobs from your backend
      // For now, let's just keep an empty array
      setSimilarJobs([]);
    } catch (err) {
      console.error("Error fetching similar jobs:", err);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobDetails();
    setRefreshing(false);
  }, []);

  const handleSaveJob = async () => {
    if (!auth.currentUser) {
      Alert.alert("Authentication Required", "Please log in to save jobs", [
        { text: "Cancel", style: "cancel" },
        { text: "Log In", onPress: () => router.push("/login") },
      ]);
      return;
    }

    if (!jobData) {
      Alert.alert("Error", "No job data available");
      return;
    }

    setIsSaving(true);
    try {
      // Optimistically update UI
      setJobSaved(!jobSaved);

      if (jobSaved) {
        await unsaveJob(jobData.job_id);
        console.log("Job unsaved successfully");
      } else {
        await saveJob({
          jobId: jobData.job_id,
          job_title: jobData.job_title,
          employer_name: jobData.employer_name,
          employer_logo: jobData.employer_logo,
          job_country: jobData.job_country,
          job_employment_type: jobData.job_employment_type,
          job_apply_link: jobData.job_apply_link || jobData.job_google_link,
        });
        console.log("Job saved successfully");
      }
    } catch (error) {
      // Revert optimistic update on error
      setJobSaved(!jobSaved);
      Alert.alert("Error", error.message || "Failed to update saved job");
      console.error("Job save/unsave error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyNow = () => {
    if (!jobData) return;

    const url =
      jobData?.job_apply_link ||
      jobData?.job_google_link ||
      "https://careers.google.com/jobs/results/";

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this URL");
      }
    });
  };

  const handleShareJob = async () => {
    if (!jobData) return;

    try {
      const shareUrl = jobData.job_apply_link || jobData.job_google_link || "";
      const message = `Check out this job opportunity: ${jobData.job_title} at ${jobData.employer_name}. ${shareUrl}`;

      await Share.share({
        message: message,
        title: `${jobData.job_title} - ${jobData.employer_name}`,
      });
    } catch (error) {
      console.error("Error sharing job:", error);
    }
  };

  const handleNavigateSavedJobs = () => {
    router.push("/SavedJobs");
  };

  const handleNavigateHome = () => {
    router.push("/home");
  };

  const displayTabContent = () => {
    if (!jobData) return null;

    switch (activeTab) {
      case "Qualifications":
        return (
          <Specifics
            title="Qualifications"
            points={jobData?.job_highlights?.Qualifications ?? ["N/A"]}
          />
        );

      case "About":
        return (
          <JobAbout info={jobData?.job_description ?? "No data provided"} />
        );

      case "Responsibilities":
        return (
          <Specifics
            title="Responsibilities"
            points={jobData?.job_highlights?.Responsibilities ?? ["N/A"]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: COLORS.lightWhite },
          headerShadowVisible: false,
          headerBackVisible: false,
          headerLeft: () => (
            <ScreenHeaderBtn
              iconUrl={icons.left}
              dimension="60%"
              handlePress={() => router.back()}
            />
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveJob}
                disabled={isSaving}
              >
                <Animatable.View
                  animation={jobSaved ? "pulse" : undefined}
                  duration={500}
                >
                  <Ionicons
                    name={jobSaved ? "bookmark" : "bookmark-outline"}
                    size={24}
                    color={jobSaved ? COLORS.primary : COLORS.gray}
                  />
                </Animatable.View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleShareJob}
              >
                <Ionicons name="share-outline" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
          ),
          headerTitle: "",
        }}
      />

      <>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading job details...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={50} color={COLORS.red} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchJobDetails}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  { backgroundColor: COLORS.secondary, marginTop: 10 },
                ]}
                onPress={handleNavigateHome}
              >
                <Text style={styles.retryText}>Return Home</Text>
              </TouchableOpacity>
            </View>
          ) : !jobData ? (
            <View style={styles.errorContainer}>
              <Ionicons name="document" size={50} color={COLORS.gray} />
              <Text style={styles.errorText}>No data available</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleNavigateHome}
              >
                <Text style={styles.retryText}>Browse Jobs</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <View style={styles.headerContainer}>
                {jobSaved && (
                  <Animatable.View animation="fadeIn" style={styles.savedBadge}>
                    <Ionicons name="bookmark" size={14} color={COLORS.white} />
                    <Text style={styles.savedBadgeText}>Saved</Text>
                  </Animatable.View>
                )}

                <Company
                  companyLogo={jobData.employer_logo}
                  jobTitle={jobData.job_title}
                  companyName={jobData.employer_name}
                  location={jobData.job_country}
                />

                {/* Job Quick Info */}
                <View style={styles.quickInfoContainer}>
                  <View style={styles.infoTag}>
                    <Ionicons
                      name="briefcase-outline"
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.infoText}>
                      {jobData.job_employment_type || "Full time"}
                    </Text>
                  </View>

                  {jobData.job_is_remote && (
                    <View style={styles.infoTag}>
                      <Ionicons
                        name="home-outline"
                        size={16}
                        color={COLORS.primary}
                      />
                      <Text style={styles.infoText}>Remote</Text>
                    </View>
                  )}

                  <View style={styles.infoTag}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.infoText}>
                      Apply by{" "}
                      {jobData.job_posted_at_datetime_utc
                        ? new Date(
                            jobData.job_posted_at_datetime_utc
                          ).toLocaleDateString()
                        : "ASAP"}
                    </Text>
                  </View>
                </View>
              </View>

              <JobTabs
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              <View style={styles.tabContent}>{displayTabContent()}</View>

              {/* Similar Jobs Section */}
              {similarJobs.length > 0 && (
                <View style={styles.similarJobsSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Similar Jobs</Text>
                    <TouchableOpacity onPress={() => router.push("/job")}>
                      <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.similarJobsContainer}
                  >
                    {/* Similar jobs would be rendered here */}
                  </ScrollView>
                </View>
              )}

              {/* Call to Action */}
              <View style={styles.ctaContainer}>
                <Text style={styles.ctaText}>
                  Looking for more opportunities like this?
                </Text>
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={handleNavigateSavedJobs}
                >
                  <Text style={styles.ctaButtonText}>View your saved jobs</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {!isLoading && jobData && (
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={[
                styles.saveFooterButton,
                {
                  backgroundColor: jobSaved
                    ? COLORS.lightWhite
                    : COLORS.secondary,
                  borderWidth: jobSaved ? 1 : 0,
                  borderColor: COLORS.primary,
                },
              ]}
              onPress={handleSaveJob}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator
                  size="small"
                  color={jobSaved ? COLORS.primary : COLORS.white}
                />
              ) : (
                <>
                  <Ionicons
                    name={jobSaved ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color={jobSaved ? COLORS.primary : COLORS.white}
                  />
                  {/* <Text
                    style={[
                      styles.saveButtonText,
                      { color: jobSaved ? COLORS.primary : COLORS.white },
                    ]}
                  >
                    {jobSaved ? "Saved" : "Save"}
                  </Text> */}
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyNow}
            >
              <Text style={styles.applyButtonText}>Apply Now</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}
      </>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
    marginBottom: 85,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButton: {
    marginRight: 16,
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: SIZES.medium,
    color: COLORS.primary,
    fontSize: SIZES.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.large,
    paddingVertical: 100,
  },
  errorText: {
    fontSize: SIZES.medium,
    color: COLORS.secondary,
    marginTop: SIZES.small,
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
  contentContainer: {
    padding: SIZES.medium,
    paddingBottom: 100,
  },
  headerContainer: {
    position: "relative",
    marginBottom: SIZES.medium,
  },
  savedBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: SIZES.small,
    gap: 5,
  },
  savedBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: "500",
  },
  quickInfoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SIZES.small,
    gap: 8,
  },
  infoTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightWhite,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: SIZES.small,
    marginRight: 8,
    ...SHADOWS.small,
  },
  infoText: {
    marginLeft: 4,
    color: COLORS.secondary,
    fontSize: SIZES.small,
  },
  tabContent: {
    marginTop: SIZES.small,
  },
  similarJobsSection: {
    marginTop: SIZES.large,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  sectionTitle: {
    fontSize: SIZES.large - 2,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  seeAllText: {
    color: COLORS.secondary,
    fontSize: SIZES.medium - 2,
  },
  similarJobsContainer: {
    paddingVertical: SIZES.medium,
  },
  ctaContainer: {
    marginTop: SIZES.large,
    backgroundColor: COLORS.lightWhite,
    padding: SIZES.medium,
    borderRadius: SIZES.medium,
    alignItems: "center",
    ...SHADOWS.small,
  },
  ctaText: {
    fontSize: SIZES.medium,
    color: COLORS.secondary,
    textAlign: "center",
  },
  ctaButton: {
    marginTop: SIZES.small,
    flexDirection: "row",
    alignItems: "center",
  },
  ctaButtonText: {
    color: COLORS.primary,
    fontWeight: "bold",
    marginRight: 4,
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    // elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    // shadowRadius: 4,
  },
  saveFooterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.medium,
    borderRadius: SIZES.medium,
    marginRight: 10,
  },
  saveButtonText: {
    fontSize: SIZES.medium,
    fontWeight: "500",
    marginLeft: 8,
  },
  applyButton: {
    flex: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.medium,
    gap: 8,
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: "bold",
  },
});

export default JobDetails;
