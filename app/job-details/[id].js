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
} from "react-native";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Company,
  JobAbout,
  JobTabs,
  ScreenHeaderBtn,
  Specifics,
} from "../../components";
import { COLORS, icons, SIZES } from "../../constants";
import useFetch from "../../hook/useFetch";
import { saveJob, unsaveJob } from "../../firebase/jobServices";
import { auth } from "../../firebase/config";

const tabs = ["About", "Qualifications", "Responsibilities"];

const JobDetails = () => {
  const params = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [jobSaved, setJobSaved] = useState(false);

  const { data, isLoading, error, refetch } = useFetch("job-details", {
    job_id: params.id,
  });

  // Effect to update local state when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      setJobSaved(data[0].isSaved);
    }
  }, [data]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
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

    if (!data || data.length === 0) {
      Alert.alert("Error", "No job data available");
      return;
    }

    setIsSaving(true);
    try {
      const job = data[0];

      // Optimistically update UI
      setJobSaved(!jobSaved);

      if (jobSaved) {
        await unsaveJob(job.job_id);
        console.log("Job unsaved successfully");
      } else {
        await saveJob({
          jobId: job.job_id,
          job_title: job.job_title,
          employer_name: job.employer_name,
          employer_logo: job.employer_logo,
          job_country: job.job_country,
          job_employment_type: job.job_employment_type,
          job_apply_link: job.job_apply_link || job.job_google_link,
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
    if (!data || data.length === 0) return;

    const url =
      data[0]?.job_apply_link ||
      data[0]?.job_google_link ||
      "https://careers.google.com/jobs/results/";

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this URL");
      }
    });
  };

  const displayTabContent = () => {
    switch (activeTab) {
      case "Qualifications":
        return (
          <Specifics
            title="Qualifications"
            points={data[0]?.job_highlights?.Qualifications ?? ["N/A"]}
          />
        );

      case "About":
        return (
          <JobAbout info={data[0]?.job_description ?? "No data provided"} />
        );

      case "Responsibilities":
        return (
          <Specifics
            title="Responsibilities"
            points={data[0]?.job_highlights?.Responsibilities ?? ["N/A"]}
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
                <Ionicons
                  name={jobSaved ? "bookmark" : "bookmark-outline"}
                  size={24}
                  color={jobSaved ? COLORS.primary : COLORS.gray}
                />
              </TouchableOpacity>
              <ScreenHeaderBtn iconUrl={icons.share} dimension="60%" />
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
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={styles.loader}
            />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={50} color={COLORS.red} />
              <Text style={styles.errorText}>Something went wrong</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : data.length === 0 ? (
            <View style={styles.errorContainer}>
              <Ionicons name="document" size={50} color={COLORS.gray} />
              <Text style={styles.errorText}>No data available</Text>
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <View style={styles.headerContainer}>
                {jobSaved && (
                  <View style={styles.savedBadge}>
                    <Ionicons name="bookmark" size={14} color={COLORS.white} />
                    <Text style={styles.savedBadgeText}>Saved</Text>
                  </View>
                )}

                <Company
                  companyLogo={data[0].employer_logo}
                  jobTitle={data[0].job_title}
                  companyName={data[0].employer_name}
                  location={data[0].job_country}
                />
              </View>

              <JobTabs
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              {displayTabContent()}
            </View>
          )}
        </ScrollView>

        {!isLoading && data && data.length > 0 && (
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
              <Ionicons
                name={jobSaved ? "bookmark" : "bookmark-outline"}
                size={20}
                color={jobSaved ? COLORS.primary : COLORS.white}
              />
              <Text
                style={[
                  styles.saveButtonText,
                  { color: jobSaved ? COLORS.primary : COLORS.white },
                ]}
              >
                {jobSaved ? "Saved" : "Save"}
              </Text>
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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.large,
    marginTop: 50,
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
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    flex: 2,
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
