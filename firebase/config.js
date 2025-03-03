import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
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
    // If auth is already initialized, get the existing instance
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

// Helper functions for community chat
const communityRef = (communityId) =>
  collection(db, `communities/${communityId}/messages`);


export const subscribeToMessages = (communityId, callback) => {
  const q = query(communityRef(communityId), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
      });
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
