import { db } from "./config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

export const getApplicationCount = async () => {
  try {
    const snapshot = await getDocs(collection(db, "applications"));
    return snapshot.size;
  } catch (error) {
    console.error("Error in getApplicationCount:", error);
    throw error;
  }
};

// Function to submit a new job application
export const submitApplication = async (applicationData) => {
  try {
    const applicationsRef = collection(db, "applications");
    const docRef = await addDoc(applicationsRef, {
      ...applicationData,
      createdAt: new Date(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error submitting application:", error);
    return { success: false, error: error.message };
  }
};

// Function to get applications by user ID
export const getUserApplications = async (userId) => {
  try {
    const applicationsRef = collection(db, "applications");
    const q = query(applicationsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const applications = [];
    querySnapshot.forEach((doc) => {
      applications.push({ id: doc.id, ...doc.data() });
    });
    return applications;
  } catch (error) {
    console.error("Error fetching user applications:", error);
    throw error;
  }
};

// Function to delete an application
export const deleteApplication = async (applicationId) => {
  try {
    await deleteDoc(doc(db, "applications", applicationId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting application:", error);
    return { success: false, error: error.message };
  }
};

// Function to update application status
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const applicationRef = doc(db, "applications", applicationId);
    await updateDoc(applicationRef, {
      status: status,
      updatedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating application status:", error);
    return { success: false, error: error.message };
  }
};
