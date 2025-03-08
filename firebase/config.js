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
  addDoc,
  serverTimestamp,
  setDoc,
  deleteDoc,
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
    // Simplified auth initialization to avoid accessing undefined properties
    auth = getAuth(app);
    
    // Only initialize auth with persistence if we don't already have it
    if (!auth.currentUser && !auth._canUseIndexedDBPromise) {
      // Re-initialize with persistence
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    }
  } catch (error) {
    console.log("Auth initialization error:", error.message);
    // Fallback to basic auth
    auth = getAuth(app);
  }
} else {
  auth = getAuth(app);
}

// Ensure auth is always valid
if (!auth) {
  console.warn("Auth initialization failed, falling back to default auth");
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

// Chat history functions
export const createChatSession = async (
  userId,
  title = "New Conversation",
  persistImmediately = false
) => {
  try {
    if (!db || !userId) throw new Error("Database or user ID not available");

    // When persistImmediately is false, just return a temporary ID
    // This prevents empty chats from being added to history
    if (!persistImmediately) {
      return `temp_${Date.now()}`;
    }

    try {
      // First, ensure user document exists
      console.log(`Creating/verifying user document for ${userId}`);
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.log("User document doesn't exist, creating now");
        await setDoc(userRef, {
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
          email: auth.currentUser?.email || null,
          displayName: auth.currentUser?.displayName || null,
        });
      }

      // Now create the chat session
      console.log("Creating chat session");
      const chatSessionRef = collection(db, "users", userId, "chats");
      const newChatSession = await addDoc(chatSessionRef, {
        title,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messages: [],
      });

      console.log(`Chat session created with ID: ${newChatSession.id}`);
      return newChatSession.id;
    } catch (error) {
      console.warn(`Firebase permission error: ${error.message}`);
      console.warn("Request details:", { userId, title });

      if (error.code === "permission-denied") {
        console.error("PERMISSION DENIED - Check Firebase security rules");
      }

      // Fall back to local storage
      console.warn("Using local storage fallback");
      // Fallback to AsyncStorage for offline or permission denied scenarios
      const storedChats = await AsyncStorage.getItem(`chats_${userId}`);
      const chats = storedChats ? JSON.parse(storedChats) : [];

      const newChatId = `local_${Date.now()}`;
      const newChat = {
        id: newChatId,
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };

      // Add to local storage
      await AsyncStorage.setItem(
        `chats_${userId}`,
        JSON.stringify([newChat, ...chats])
      );
      return newChatId;
    }
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw error;
  }
};

export const saveChatMessage = async (userId, chatId, message, isUser) => {
  try {
    if (!db || !userId || !chatId)
      throw new Error("Missing required parameters");

    // For temporary chat IDs, create a permanent chat first
    if (chatId.startsWith("temp_")) {
      try {
        // Create a new permanent chat with this message's content as title (if it's from user)
        const title =
          isUser && message.length < 30 ? message : "New Conversation";
        const newChatId = await createChatSession(userId, title, true);

        // Use the new ID for saving the message
        chatId = newChatId;
      } catch (error) {
        console.error("Error converting temporary chat to permanent:", error);
        // Fall back to local storage if Firestore fails
        return saveMessageToLocalStorage(userId, chatId, message, isUser);
      }
    }

    // Check if this is a local chat ID (fallback storage)
    if (chatId.startsWith("local_")) {
      return saveMessageToLocalStorage(userId, chatId, message, isUser);
    }

    // Normal Firebase storage
    const chatDocRef = doc(db, "users", userId, "chats", chatId);

    await updateDoc(chatDocRef, {
      messages: arrayUnion({
        text: message,
        isUser,
        timestamp: new Date().toISOString(),
      }),
      updatedAt: serverTimestamp(),
      // Update title if it's the first user message
      ...(isUser && message.length < 30 ? { title: message } : {}),
    });

    return { success: true, chatId };
  } catch (error) {
    console.error("Error saving chat message:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to save messages to local storage
const saveMessageToLocalStorage = async (userId, chatId, message, isUser) => {
  try {
    const storedChats = await AsyncStorage.getItem(`chats_${userId}`);
    const chats = storedChats ? JSON.parse(storedChats) : [];

    let existingChatIndex = chats.findIndex((chat) => chat.id === chatId);

    // If this is a temp chat ID but we're using local storage, create a new local_ ID
    if (chatId.startsWith("temp_")) {
      chatId = `local_${Date.now()}`;
      existingChatIndex = -1; // Force creation of new chat
    }

    if (existingChatIndex !== -1) {
      // Chat found, add message
      chats[existingChatIndex].messages.push({
        text: message,
        isUser,
        timestamp: new Date().toISOString(),
      });
      chats[existingChatIndex].updatedAt = new Date().toISOString();

      // Update title if needed
      if (
        isUser &&
        message.length < 30 &&
        chats[existingChatIndex].messages.length <= 2
      ) {
        chats[existingChatIndex].title = message;
      }
    } else {
      // Create new chat with this message
      const newChat = {
        id: chatId,
        title: isUser && message.length < 30 ? message : "New Conversation",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            text: message,
            isUser,
            timestamp: new Date().toISOString(),
          },
        ],
      };
      chats.unshift(newChat); // Add to beginning of array
    }

    // Save back to AsyncStorage
    await AsyncStorage.setItem(`chats_${userId}`, JSON.stringify(chats));
    return { success: true, chatId };
  } catch (error) {
    console.error("Error saving to local storage:", error);
    return { success: false, error: error.message };
  }
};

export const getChatSessions = async (userId) => {
  try {
    if (!db || !userId) throw new Error("Database or user ID not available");

    try {
      // Try to get from Firestore first
      const chatSessionsRef = collection(db, "users", userId, "chats");
      const q = query(chatSessionsRef, orderBy("updatedAt", "desc"));

      const querySnapshot = await getDocs(q);
      const sessions = [];

      querySnapshot.forEach((doc) => {
        sessions.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Also check local storage for offline chats
      const storedChats = await AsyncStorage.getItem(`chats_${userId}`);
      if (storedChats) {
        const localChats = JSON.parse(storedChats);
        // Merge but avoid duplicates (prefer Firestore versions)
        const allSessionIds = new Set(sessions.map((s) => s.id));
        const uniqueLocalChats = localChats.filter(
          (chat) => !allSessionIds.has(chat.id)
        );

        return [...sessions, ...uniqueLocalChats].sort((a, b) => {
          const dateA = new Date(a.updatedAt?.toDate?.() || a.updatedAt);
          const dateB = new Date(b.updatedAt?.toDate?.() || b.updatedAt);
          return dateB - dateA;
        });
      }

      return sessions;
    } catch (error) {
      // If Firestore fails, fall back to local storage
      console.warn("Firebase error, using local storage fallback:", error);
      const storedChats = await AsyncStorage.getItem(`chats_${userId}`);
      return storedChats ? JSON.parse(storedChats) : [];
    }
  } catch (error) {
    console.error("Error getting chat sessions:", error);
    throw error;
  }
};

export const getChatById = async (userId, chatId) => {
  try {
    if (!userId || !chatId) throw new Error("Missing required parameters");

    // Check if this is a local chat ID
    if (chatId.startsWith("local_")) {
      const storedChats = await AsyncStorage.getItem(`chats_${userId}`);
      const chats = storedChats ? JSON.parse(storedChats) : [];

      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        return chat;
      }
      throw new Error("Local chat not found");
    }

    // Try to get from Firestore
    if (!db) throw new Error("Database not available");

    const chatDocRef = doc(db, "users", userId, "chats", chatId);
    const chatDoc = await getDoc(chatDocRef);

    if (chatDoc.exists()) {
      return { id: chatDoc.id, ...chatDoc.data() };
    } else {
      throw new Error("Chat not found");
    }
  } catch (error) {
    console.error("Error getting chat by ID:", error);
    throw error;
  }
};

// Add this function to delete chat sessions
export const deleteChatSession = async (userId, chatId) => {
  try {
    if (!userId || !chatId) throw new Error("Missing required parameters");

    // If this is a local chat ID
    if (chatId.startsWith("local_")) {
      const storedChats = await AsyncStorage.getItem(`chats_${userId}`);
      if (storedChats) {
        const chats = JSON.parse(storedChats);
        const filteredChats = chats.filter((chat) => chat.id !== chatId);
        await AsyncStorage.setItem(
          `chats_${userId}`,
          JSON.stringify(filteredChats)
        );
      }
      return { success: true };
    }

    // For Firestore chats
    if (!db) throw new Error("Database not available");

    const chatDocRef = doc(db, "users", userId, "chats", chatId);
    await deleteDoc(chatDocRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting chat:", error);
    return { success: false, error: error.message };
  }
};

export { auth, db };
