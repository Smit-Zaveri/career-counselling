import { useState, useEffect, useCallback } from "react";
import { getJobs, getJobById, subscribeToJobs } from "../firebase/config";

const useJobs = (initialFilters = {}, autoFetch = true) => {
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  // Function to safely execute async operations
  const safeExecute = useCallback(async (operation, errorMessage) => {
    try {
      return await operation();
    } catch (err) {
      console.error(errorMessage, err);
      setError(err);
      return null;
    }
  }, []);

  // Function to fetch jobs with error handling
  const fetchJobs = useCallback(
    async (jobFilters = filters) => {
      if (typeof getJobs !== "function") {
        const error = new Error("Jobs functionality not available");
        setError(error);
        return Promise.reject(error);
      }

      setLoading(true);
      setError(null);

      try {
        const jobsData = await getJobs(jobFilters);
        setJobs(jobsData || []);
        setLoading(false);
        return jobsData;
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(err);
        setLoading(false);
        return [];
      }
    },
    [filters]
  );

  // Function to fetch a single job by ID with error handling
  const fetchJobById = useCallback(async (jobId) => {
    if (typeof getJobById !== "function") {
      const error = new Error("Job fetch functionality not available");
      setError(error);
      return Promise.reject(error);
    }

    setLoading(true);
    setError(null);

    try {
      const jobData = await getJobById(jobId);
      setJob(jobData);
      setLoading(false);
      return jobData;
    } catch (err) {
      console.error(`Error fetching job with ID ${jobId}:`, err);
      setError(err);
      setLoading(false);
      return null;
    }
  }, []);

  // Subscribe to real-time job updates with additional error handling
  const subscribeToJobUpdates = useCallback(
    (callback, jobFilters = filters) => {
      if (typeof subscribeToJobs !== "function") {
        const error = new Error("Job subscription functionality not available");
        setError(error);
        if (callback && typeof callback === "function") {
          callback([], error);
        }
        return () => {};
      }

      try {
        // Using the subscribeToJobs function from firebase config
        const unsubscribe = subscribeToJobs((jobsData, err) => {
          if (!err) {
            setJobs(jobsData || []);
          } else {
            setError(err);
          }

          if (callback && typeof callback === "function") {
            callback(jobsData, err);
          }
        }, jobFilters);

        return typeof unsubscribe === "function" ? unsubscribe : () => {};
      } catch (err) {
        console.error("Error subscribing to jobs:", err);
        setError(err);
        if (callback && typeof callback === "function") {
          callback([], err);
        }
        return () => {};
      }
    },
    [filters]
  );

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...(newFilters || {}),
    }));
  }, []);

  // Auto-fetch jobs on mount or when filters change if autoFetch is true
  useEffect(() => {
    let isMounted = true;

    if (autoFetch) {
      fetchJobs().catch((err) => {
        if (isMounted) {
          console.error("Error in auto-fetch:", err);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [autoFetch, fetchJobs]);

  return {
    jobs,
    job,
    loading,
    error,
    filters,
    fetchJobs,
    fetchJobById,
    subscribeToJobUpdates,
    updateFilters,
  };
};

export default useJobs;
