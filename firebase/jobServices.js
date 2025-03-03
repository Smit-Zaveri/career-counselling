import { db, auth } from "./config";
import {
  collection,
  query,
  getDocs,
  where,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  limit,
  orderBy,
  startAt,
  endAt,
  setDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth } from "firebase/auth";

// Get popular jobs - modified to simply get all jobs without complex filtering
export const getPopularJobs = async () => {
  try {
    console.log("Fetching popular jobs from Firebase...");
    const jobsRef = collection(db, "jobs");

    // Simple query without orderBy to avoid index issues
    // Just get all jobs
    const q = query(jobsRef);
    const querySnapshot = await getDocs(q);

    const jobs = [];
    querySnapshot.forEach((doc) => {
      console.log(
        `Found job: ${doc.id} - ${doc.data().job_title || "Untitled"}`
      );
      jobs.push({
        job_id: doc.id,
        ...doc.data(),
      });
    });

    console.log(`Retrieved ${jobs.length} jobs for popular section`);
    return { data: jobs, status: jobs.length > 0 };
  } catch (error) {
    console.error("Popular jobs error:", error);
    return { data: [], status: false, error: error.message };
  }
};

// Get nearby jobs based on location
export const getNearbyJobs = async () => {
  try {
    console.log("Fetching nearby jobs...");
    const jobsRef = collection(db, "jobs");
    // For simplicity, we're just getting jobs without location filtering
    // In a real app, you would filter by user's location
    const q = query(jobsRef, limit(20));
    const querySnapshot = await getDocs(q);

    const jobs = [];
    querySnapshot.forEach((doc) => {
      jobs.push({
        job_id: doc.id,
        ...doc.data(),
      });
    });

    console.log(`Retrieved ${jobs.length} nearby jobs`);
    return { data: jobs, status: true };
  } catch (error) {
    console.error("Nearby jobs error:", error);
    return { data: [], status: false, error: error.message };
  }
};

// Search jobs by query
export const searchJobs = async (searchQuery) => {
  try {
    console.log(`Searching jobs with query: ${searchQuery}`);
    const jobsRef = collection(db, "jobs");

    // Basic text search - in a production app, you might want to use Firebase Extensions
    // like Algolia for better search capabilities
    const q = query(
      jobsRef,
      orderBy("job_title"),
      startAt(searchQuery),
      endAt(searchQuery + "\uf8ff"),
      limit(20)
    );

    const querySnapshot = await getDocs(q);

    const jobs = [];
    querySnapshot.forEach((doc) => {
      jobs.push({
        job_id: doc.id,
        ...doc.data(),
      });
    });

    console.log(`Found ${jobs.length} jobs matching the search`);
    return { data: jobs, status: true };
  } catch (error) {
    console.error("Search jobs error:", error);
    return { data: [], status: false, error: error.message };
  }
};

// Get job details
export const getJobDetails = async (jobId) => {
  try {
    console.log(`Fetching details for job: ${jobId}`);
    const jobDoc = await getDoc(doc(db, "jobs", jobId));

    if (jobDoc.exists()) {
      // Check if user has saved this job
      const isSaved = await checkIfJobSaved(jobId);

      return {
        data: [
          {
            job_id: jobDoc.id,
            ...jobDoc.data(),
            isSaved,
          },
        ],
        status: true,
      };
    } else {
      console.log("Job not found");
      return { data: [], status: false };
    }
  } catch (error) {
    console.error("Job details error:", error);
    return { data: [], status: false, error: error.message };
  }
};

// Check if a job is saved by the current user
export const checkIfJobSaved = async (jobId) => {
  try {
    if (!auth.currentUser) return false;

    const userId = auth.currentUser.uid;
    const userRef = doc(db, "users", userId);
    const jobRef = doc(userRef, "savedJobs", jobId);
    const jobDoc = await getDoc(jobRef);

    return jobDoc.exists();
  } catch (error) {
    console.error("Error checking if job is saved:", error);
    return false;
  }
};

// Save a job
export const saveJob = async (jobData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const savedJobsRef = collection(db, "saved_jobs");
    const docRef = await addDoc(savedJobsRef, {
      ...jobData,
      userId: user.uid,
      savedAt: new Date(),
    });
    console.log("Job saved successfully with ID:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving job:", error);
    throw error;
  }
};

// Unsave a job
export const unsaveJob = async (jobId) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const savedJobsRef = collection(db, "saved_jobs");
    const q = query(
      savedJobsRef,
      where("jobId", "==", jobId),
      where("userId", "==", user.uid)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Job not found in saved jobs");
    }

    // Delete the first matching document
    const docToDelete = querySnapshot.docs[0];
    await deleteDoc(doc(db, "saved_jobs", docToDelete.id));

    console.log("Job unsaved successfully");
    return { success: true };
  } catch (error) {
    console.error("Error unsaving job:", error);
    throw error;
  }
};

// Get count of saved jobs
export const getSavedJobsCount = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.log("No authenticated user found");
      return 0;
    }

    const savedJobsRef = collection(db, "saved_jobs");
    const q = query(savedJobsRef, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error getting saved jobs count:", error);
    return 0;
  }
};

// Get all saved jobs
export const getSavedJobs = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const savedJobsRef = collection(db, "saved_jobs");
    const q = query(savedJobsRef, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    const savedJobs = [];
    querySnapshot.forEach((doc) => {
      savedJobs.push({ id: doc.id, ...doc.data() });
    });

    return savedJobs;
  } catch (error) {
    console.error("Error getting saved jobs:", error);
    throw error;
  }
};
