import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "@roadmap_progress";

/**
 * Progress utility for managing technology roadmap progress
 */
export const ProgressStore = {
  /**
   * Get all saved progress data
   */
  getAllProgress: async () => {
    try {
      const progressData = await AsyncStorage.getItem(PROGRESS_KEY);
      return progressData ? JSON.parse(progressData) : {};
    } catch (error) {
      console.error("Error getting progress data:", error);
      return {};
    }
  },

  /**
   * Get progress for a specific technology
   */
  getTechnologyProgress: async (techId) => {
    try {
      const progressData = await ProgressStore.getAllProgress();
      return progressData[techId] || { completedItems: [], progress: 0 };
    } catch (error) {
      console.error(`Error getting progress for ${techId}:`, error);
      return { completedItems: [], progress: 0 };
    }
  },

  /**
   * Save progress for a specific technology
   */
  saveTechnologyProgress: async (techId, completedItems, totalItems) => {
    try {
      const progressData = await ProgressStore.getAllProgress();
      const progress =
        totalItems > 0
          ? Math.round((completedItems.length / totalItems) * 100)
          : 0;

      progressData[techId] = {
        completedItems,
        progress,
        lastUpdated: new Date().toISOString(),
      };

      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progressData));
      return progress;
    } catch (error) {
      console.error(`Error saving progress for ${techId}:`, error);
      return 0;
    }
  },

  /**
   * Toggle completion status of a specific roadmap item
   */
  toggleItemCompletion: async (techId, itemId, totalItems) => {
    try {
      const { completedItems } = await ProgressStore.getTechnologyProgress(
        techId
      );

      let updatedItems;
      if (completedItems.includes(itemId)) {
        updatedItems = completedItems.filter((id) => id !== itemId);
      } else {
        updatedItems = [...completedItems, itemId];
      }

      // Calculate progress directly here for consistency
      const progress =
        totalItems > 0
          ? Math.round((updatedItems.length / totalItems) * 100)
          : 0;

      // Save to AsyncStorage
      await ProgressStore.saveTechnologyProgress(
        techId,
        updatedItems,
        totalItems
      );

      // Return the updated values
      return { completedItems: updatedItems, progress };
    } catch (error) {
      console.error(`Error toggling item ${itemId} for ${techId}:`, error);
      return { completedItems: [], progress: 0 };
    }
  },

  /**
   * Reset all progress data
   */
  resetAllProgress: async () => {
    try {
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({}));
    } catch (error) {
      console.error("Error resetting progress data:", error);
    }
  },

  /**
   * Reset progress for a specific technology
   */
  resetTechnologyProgress: async (techId) => {
    try {
      const progressData = await ProgressStore.getAllProgress();
      delete progressData[techId];
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progressData));
      return { completedItems: [], progress: 0 }; // Return explicit values after reset
    } catch (error) {
      console.error(`Error resetting progress for ${techId}:`, error);
      return { completedItems: [], progress: 0 };
    }
  },
};
