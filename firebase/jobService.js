import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";

/**
 * Job service with protected functions in case Firebase methods aren't fully loaded
 */
class JobService {
  constructor() {
    this.db = db;
    this.jobsCollection = "jobs";
  }

  /**
   * Safely execute a Firestore operation with error handling
   */
  async _safeExecute(operation, errorMessage) {
    try {
      if (!this.db) {
        throw new Error("Firestore not initialized");
      }
      return await operation();
    } catch (error) {
      console.error(`${errorMessage}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get job by ID
   */
  async getJobById(jobId) {
    return this._safeExecute(async () => {
      const docRef = doc(this.db, this.jobsCollection, jobId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      throw new Error(`Job with ID ${jobId} not found`);
    }, `Error fetching job with ID ${jobId}`);
  }

  /**
   * Get jobs with optional filters
   */
  async getJobs(filters = {}, maxResults = 10) {
    return this._safeExecute(async () => {
      const jobsRef = collection(this.db, this.jobsCollection);
      let jobQuery = query(jobsRef, limit(maxResults));

      if (filters.employer) {
        jobQuery = query(jobQuery, where("employer", "==", filters.employer));
      }

      if (filters.title) {
        jobQuery = query(jobQuery, where("title", "==", filters.title));
      }

      if (filters.orderBy) {
        jobQuery = query(
          jobQuery,
          orderBy(filters.orderBy, filters.orderDirection || "asc")
        );
      }

      const querySnapshot = await getDocs(jobQuery);
      const jobs = [];

      querySnapshot.forEach((doc) => {
        jobs.push({ id: doc.id, ...doc.data() });
      });

      return jobs;
    }, "Error fetching jobs");
  }

  /**
   * Subscribe to job updates
   */
  subscribeToJobs(callback, filters = {}, maxResults = 10) {
    try {
      if (!this.db) {
        throw new Error("Firestore not initialized");
      }

      const jobsRef = collection(this.db, this.jobsCollection);
      let jobQuery = query(jobsRef, limit(maxResults));

      if (filters.employer) {
        jobQuery = query(jobQuery, where("employer", "==", filters.employer));
      }

      if (filters.title) {
        jobQuery = query(jobQuery, where("title", "==", filters.title));
      }

      if (filters.orderBy) {
        jobQuery = query(
          jobQuery,
          orderBy(filters.orderBy, filters.orderDirection || "asc")
        );
      }

      return onSnapshot(
        jobQuery,
        (snapshot) => {
          const jobs = [];
          snapshot.forEach((doc) => {
            jobs.push({ id: doc.id, ...doc.data() });
          });
          callback(jobs);
        },
        (error) => {
          console.error("Error in jobs subscription:", error);
          callback([], error);
        }
      );
    } catch (error) {
      console.error("Failed to subscribe to jobs:", error);
      callback([], error);
      // Return a no-op unsubscribe function
      return () => {};
    }
  }
}

export const jobService = new JobService();
export default jobService;
