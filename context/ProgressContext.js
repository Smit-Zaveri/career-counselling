import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { technologies } from "../constants/roadmapData";

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const [completedItems, setCompletedItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load progress data from AsyncStorage
  useEffect(() => {
    const loadProgressData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("roadmapProgress");
        if (storedData) {
          setCompletedItems(JSON.parse(storedData));
        }
      } catch (error) {
        console.error("Failed to load progress data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgressData();
  }, []);

  // Save progress data to AsyncStorage whenever it changes
  useEffect(() => {
    const saveProgressData = async () => {
      try {
        if (!isLoading) {
          await AsyncStorage.setItem(
            "roadmapProgress",
            JSON.stringify(completedItems)
          );
        }
      } catch (error) {
        console.error("Failed to save progress data", error);
      }
    };

    saveProgressData();
  }, [completedItems, isLoading]);

  // Check if an item is completed
  const isItemCompleted = (itemId) => {
    return completedItems[itemId] === true;
  };

  // Toggle the completion status of an item
  const toggleItemCompletion = (techId, itemId) => {
    setCompletedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Calculate progress percentage for a technology
  const getProgressForTechnology = (techId) => {
    const tech = technologies.find((t) => t.id === techId);
    if (!tech) return { completed: 0, total: 0, percentage: 0 };

    const items = tech.roadmapItems;
    const total = items.length;
    const completed = items.filter((item) => completedItems[item.id]).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  // Calculate overall progress
  const getOverallProgress = () => {
    let totalItems = 0;
    let completedItemsCount = 0;

    technologies.forEach((tech) => {
      const { completed, total } = getProgressForTechnology(tech.id);
      totalItems += total;
      completedItemsCount += completed;
    });

    const percentage =
      totalItems > 0 ? Math.round((completedItemsCount / totalItems) * 100) : 0;

    return { completed: completedItemsCount, total: totalItems, percentage };
  };

  return (
    <ProgressContext.Provider
      value={{
        isItemCompleted,
        toggleItemCompletion,
        getProgressForTechnology,
        getOverallProgress,
        isLoading,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgressContext = () => useContext(ProgressContext);
