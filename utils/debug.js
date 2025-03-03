import { db } from "../firebase/config";
import { collection, getDocs, query, limit } from "firebase/firestore";

// Helper function to print document counts in each collection
export const checkFirestoreCollections = async () => {
  try {
    console.log("===== FIRESTORE COLLECTIONS CHECK =====");

    // Check jobs collection
    const jobsRef = collection(db, "jobs");
    const jobsQuery = query(jobsRef, limit(100));
    const jobsSnap = await getDocs(jobsQuery);
    console.log(`Jobs collection: ${jobsSnap.size} documents found`);

    // Log first job details if any exist
    if (jobsSnap.size > 0) {
      const firstJob = jobsSnap.docs[0].data();
      console.log("Sample job:", {
        id: jobsSnap.docs[0].id,
        title: firstJob.job_title,
        employer: firstJob.employer_name,
      });
    } else {
      console.log("NO JOBS FOUND! Make sure to seed your database.");
    }

    return {
      jobs: jobsSnap.size,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to check Firestore collections:", error);
    return {
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

// Function to check if a specific job exists
export const checkJobExists = async (jobId) => {
  if (!jobId) {
    console.log("No job ID provided for check");
    return false;
  }

  try {
    console.log(`Checking if job ${jobId} exists...`);
    const jobsRef = collection(db, "jobs");
    const jobsSnap = await getDocs(jobsRef);

    let found = false;
    jobsSnap.forEach((doc) => {
      if (doc.id === jobId) {
        console.log(`Found job: ${doc.id}`);
        found = true;
      }
    });

    if (!found) {
      console.log(`Job ${jobId} not found in Firestore`);
    }

    return found;
  } catch (error) {
    console.error(`Error checking job ${jobId}:`, error);
    return false;
  }
};
