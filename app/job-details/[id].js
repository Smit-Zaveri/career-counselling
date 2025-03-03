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
} from "react-native";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import {
  Company,
  JobAbout,
  JobFooter,
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

  const { data, isLoading, error, refetch } = useFetch("job-details", {
    job_id: params.id,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  }, []);

  const handleSaveJob = async () => {
    if (!auth.currentUser) {
      Alert.alert("Error", "Please login to save jobs");
      return;
    }

    if (!data || data.length === 0) {
      Alert.alert("Error", "No job data available");
      return;
    }

    setIsSaving(true);
    try {
      const job = data[0];

      if (job.isSaved) {
        await unsaveJob(job.job_id);
        Alert.alert("Success", "Job removed from saved jobs");
      } else {
        await saveJob(job.job_id);
        Alert.alert("Success", "Job saved successfully");
      }

      // Wait for refetch to complete
      await refetch();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update saved job");
      console.error("Job save/unsave error:", error);
    } finally {
      setIsSaving(false);
    }
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
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                style={{ marginRight: 16 }}
                onPress={handleSaveJob}
                disabled={isSaving}
              >
                <MaterialIcons
                  name={data[0]?.isSaved ? "bookmark" : "bookmark-outline"}
                  size={24}
                  color={data[0]?.isSaved ? COLORS.primary : COLORS.gray}
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
        >
          {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : error ? (
            <Text>Something went wrong</Text>
          ) : data.length === 0 ? (
            <Text>No data available</Text>
          ) : (
            <View style={{ padding: SIZES.medium, paddingBottom: 100 }}>
              <Company
                companyLogo={data[0].employer_logo}
                jobTitle={data[0].job_title}
                companyName={data[0].employer_name}
                location={data[0].job_country}
              />

              <JobTabs
                style={{ marginBottom: SIZES.medium }}
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              {displayTabContent()}
            </View>
          )}
        </ScrollView>

        <JobFooter
          url={
            data[0]?.job_apply_link ||
            data[0]?.job_google_link ||
            "https://careers.google.com/jobs/results/"
          }
        />
      </>
    </SafeAreaView>
  );
};

export default JobDetails;
