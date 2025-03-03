import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase/config";

/**
 * Debug utility to check if the current user has permission to modify a community
 * @param {string} communityId - The ID of the community to check
 * @returns {Promise<Object>} - Object containing permission info and details
 */
export async function checkCommunityPermissions(communityId) {
  try {
    // Get current auth state
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return {
        hasPermission: false,
        reason: "User not authenticated",
        details: null,
      };
    }

    // Fetch the community data
    const communityRef = doc(db, "communities", communityId);
    const communitySnap = await getDoc(communityRef);

    if (!communitySnap.exists()) {
      return {
        hasPermission: false,
        reason: "Community not found",
        details: null,
      };
    }

    const communityData = communitySnap.data();

    // Check if user is creator
    const isCreator = communityData.createdBy === currentUser.uid;

    // Check if user is member
    const isMember = communityData.members?.includes(currentUser.uid) || false;

    return {
      hasPermission: isCreator,
      reason: isCreator ? "User is creator" : "User is not creator",
      details: {
        communityId,
        userId: currentUser.uid,
        isCreator,
        isMember,
        creatorId: communityData.createdBy,
        memberCount: communityData.members?.length || 0,
        isDeleted: communityData.isDeleted || false,
      },
    };
  } catch (error) {
    return {
      hasPermission: false,
      reason: `Error checking permissions: ${error.message}`,
      details: { error },
    };
  }
}
