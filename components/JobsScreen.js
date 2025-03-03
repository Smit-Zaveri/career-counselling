import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import useJobs from "../hooks/useJobs";
// OR use the job service directly
// import jobService from '../firebase/jobService';

const JobsScreen = () => {
  const { jobs, loading, error, fetchJobs } = useJobs();

  // If using job service directly instead of hook:
  /*
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const jobData = await jobService.getJobs();
        setJobs(jobData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadJobs();
  }, []);
  */

  // Handle potential undefined error with safe checks
  const handleRetry = () => {
    if (fetchJobs && typeof fetchJobs === "function") {
      fetchJobs().catch((err) =>
        console.error("Error retrying job fetch:", err)
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>
          Error: {error.message || "Unknown error occurred"}
        </Text>
        <TouchableOpacity onPress={handleRetry}>
          <Text style={styles.retry}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Jobs</Text>
      {jobs && jobs.length > 0 ? (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item?.id || Math.random().toString()}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <Text style={styles.title}>{item?.title || "No title"}</Text>
              <Text style={styles.employer}>
                {item?.employer || "Unknown employer"}
              </Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noJobs}>No jobs available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  jobCard: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  employer: {
    fontSize: 16,
    color: "#555",
    marginTop: 8,
  },
  error: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
  },
  retry: {
    color: "blue",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  noJobs: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default JobsScreen;
