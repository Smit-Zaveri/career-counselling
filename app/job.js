import { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, icons, SIZES } from "../constants";
import { ScreenHeaderBtn, Popularjobs, JobsList } from "../components";
import { getSavedJobsCount } from "../firebase/jobServices";
import { getApplicationCount } from "../firebase/applicationServices";
import { checkFirestoreCollections } from "../utils/debug";

const Job = () => {
  const router = useRouter();
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [dbStatus, setDbStatus] = useState(null);

  useEffect(() => {
    // Run diagnostics when component mounts
    const runDiagnostics = async () => {
      try {
        const status = await checkFirestoreCollections();
        setDbStatus(status);
      } catch (error) {
        console.error("Error in runDiagnostics:", error);
      }
    };

    if (__DEV__) {
      runDiagnostics();
    }

    // Fetch counts
    const fetchCounts = async () => {
      try {
        if (typeof getSavedJobsCount !== "function") {
          throw new Error(
            "getSavedJobsCount is not defined or not a function."
          );
        }
        if (typeof getApplicationCount !== "function") {
          throw new Error(
            "getApplicationCount is not defined or not a function."
          );
        }
        const savedCount = await getSavedJobsCount();
        const appCount = await getApplicationCount();
        setSavedJobsCount(savedCount);
        setApplicationsCount(appCount);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();

    // Update counts periodically
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: COLORS.lightWhite },
          headerShadowVisible: false,
          headerLeft: () => (
            <ScreenHeaderBtn iconUrl={icons.menu} dimension="60%" />
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ marginRight: 15 }}>
                <TouchableOpacity
                  style={{
                    padding: 5,
                    position: "relative",
                  }}
                  onPress={() => router.push("/saved-jobs")}
                >
                  <Ionicons name="heart" size={24} color={COLORS.primary} />
                  {savedJobsCount > 0 && (
                    <View
                      style={{
                        position: "absolute",
                        right: -5,
                        top: -5,
                        backgroundColor: COLORS.tertiary,
                        borderRadius: 10,
                        width: 18,
                        height: 18,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: COLORS.lightWhite, fontSize: 12 }}>
                        {savedJobsCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{
                  padding: 5,
                  position: "relative",
                }}
                onPress={() => router.push("/profile")}
              >
                <Ionicons name="person" size={24} color={COLORS.primary} />
                {applicationsCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      right: -5,
                      top: -5,
                      backgroundColor: COLORS.tertiary,
                      borderRadius: 10,
                      width: 18,
                      height: 18,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: COLORS.lightWhite, fontSize: 12 }}>
                      {applicationsCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ),
          headerTitle: "",
        }}
      />

      {/* Use a regular View instead of ScrollView */}
      <View style={{ flex: 1, padding: SIZES.medium }}>
        {/* Show diagnostic info */}
        {__DEV__ && dbStatus && dbStatus.jobs === 0 && (
          <View
            style={{
              backgroundColor: "#ffe6e6",
              padding: SIZES.medium,
              borderRadius: SIZES.small,
              marginBottom: SIZES.medium,
            }}
          >
            <Text style={{ color: COLORS.tertiary, fontWeight: "bold" }}>
              No jobs found in database!
            </Text>
            <Text>
              Make sure you've seeded the Firebase database with job data.
            </Text>
          </View>
        )}

        {/* Show popular jobs horizontally */}
        {/* <Popularjobs /> */}

        {/* Let JobsList handle its own scrolling */}
        <JobsList />
      </View>
    </SafeAreaView>
  );
};

export default Job;
