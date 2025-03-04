// Import polyfills first to ensure they're loaded before Firebase
import "./polyfills";

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  where,
  limit,
} from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAd4H9qAq7HMhOre9AmgOQpNRxQyFmZjS4",
  authDomain: "career-counselling-4c5e6.firebaseapp.com",
  databaseURL: "https://career-counselling-4c5e6-default-rtdb.firebaseio.com",
  projectId: "career-counselling-4c5e6",
  storageBucket: "career-counselling-4c5e6.firebasestorage.app",
  messagingSenderId: "114334936254",
  appId: "1:114334936254:web:472475503b50a54c3982ef",
  measurementId: "G-LJZ8J70L3T",
};

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence
let auth;
if (Platform.OS !== "web") {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    auth = getAuth(app);
    console.log("Using existing auth instance");
  }
} else {
  auth = getAuth(app);
}

// Initialize Firestore with singleton pattern
let db;
try {
  db = getFirestore(app);
} catch (error) {
  if (Platform.OS !== "web") {
    db = initializeFirestore(app, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    });
  } else {
    db = getFirestore(app);
  }
}

// Helper functions for job features with additional error handling
const safeDbOperation = async (operation, fallback = null) => {
  try {
    if (!db) {
      throw new Error("Firestore not initialized");
    }
    return await operation();
  } catch (error) {
    console.error("Database operation failed:", error);
    return fallback;
  }
};

const getJobsRef = () => {
  if (!db) throw new Error("Firestore not initialized");
  return collection(db, "jobs");
};

export const getJobById = async (jobId) => {
  return safeDbOperation(async () => {
    if (!jobId) throw new Error("Job ID is required");

    const docRef = doc(db, "jobs", jobId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error(`Job with ID ${jobId} not found`);
    }
  }, null);
};

export const getJobs = async (filters = {}, maxResults = 10) => {
  return safeDbOperation(async () => {
    try {
      const jobsRef = collection(db, "jobs");
      let jobQuery = query(jobsRef, limit(maxResults));

      // Apply filters if provided
      if (filters.employer) {
        jobQuery = query(jobQuery, where("employer", "==", filters.employer));
      }

      if (filters.title) {
        jobQuery = query(jobQuery, where("title", "==", filters.title));
      }

      const querySnapshot = await getDocs(jobQuery);
      const jobs = [];

      querySnapshot.forEach((doc) => {
        jobs.push({ id: doc.id, ...doc.data() });
      });

      return jobs;
    } catch (error) {
      console.error("Error in getJobs:", error);
      throw error; // Re-throw for the outer safeDbOperation to handle
    }
  }, []);
};

export const subscribeToJobs = (callback, filters = {}, maxResults = 10) => {
  if (!db) {
    console.error("Firestore not initialized");
    callback([], new Error("Firestore not initialized"));
    return () => {};
  }

  try {
    const jobsRef = collection(db, "jobs");
    let jobQuery = query(jobsRef, limit(maxResults));

    // Apply filters if provided
    if (filters.employer) {
      jobQuery = query(jobQuery, where("employer", "==", filters.employer));
    }

    if (filters.title) {
      jobQuery = query(jobQuery, where("title", "==", filters.title));
    }

    return onSnapshot(
      jobQuery,
      (snapshot) => {
        const jobs = [];
        snapshot.forEach((doc) => {
          jobs.push({ id: doc.id, ...doc.data() });
        });
        if (typeof callback === "function") {
          callback(jobs);
        }
      },
      (error) => {
        console.error("Jobs snapshot error:", error);
        if (typeof callback === "function") {
          callback([], error);
        }
      }
    );
  } catch (error) {
    console.error("Error setting up jobs subscription:", error);
    if (typeof callback === "function") {
      callback([], error);
    }
    return () => {};
  }
};

// Helper functions for community features
const getCommunityRef = (communityId) =>
  collection(db, `communities/${communityId}/messages`);

export const subscribeToMessages = (communityId, callback) => {
  const q = query(getCommunityRef(communityId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages);
  });
};

export const getCommunityDetails = async (communityId) => {
  try {
    const docRef = doc(db, "communities", communityId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Community not found");
    }
  } catch (error) {
    console.error("Error fetching community:", error);
    throw error;
  }
};

export const toggleCommunityMembership = async (
  communityId,
  userId,
  join = true
) => {
  if (!db || !auth.currentUser) {
    throw new Error("User must be logged in");
  }

  try {
    const communityRef = doc(db, "communities", communityId);
    await updateDoc(communityRef, {
      members: join ? arrayUnion(userId) : arrayRemove(userId),
    });
  } catch (error) {
    console.error("Error updating membership:", error);
    throw error;
  }
};

export const checkCommunityMembership = async (communityId, userId) => {
  try {
    const docRef = doc(db, "communities", communityId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const members = docSnap.data()?.members || [];
      return members.includes(userId);
    }
    return false;
  } catch (error) {
    console.error("Error checking membership:", error);
    throw error;
  }
};

export { auth, db };
