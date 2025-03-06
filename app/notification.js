import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { COLORS, SIZES, FONTS } from "../constants";
import { auth, db } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to fetch notifications
  const fetchNotifications = async () => {
    try {
      if (!auth.currentUser) return;

      const userId = auth.currentUser.uid;
      const notificationsRef = collection(db, "notifications");

      // Get current date for filtering
      const now = new Date();

      const q = query(
        notificationsRef,
        where("userId", "==", userId),
        orderBy("startDate", "desc")
      );

      const querySnapshot = await getDocs(q);
      const notificationsList = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const startDate = data.startDate?.toDate() || new Date();
        const showDays = data.showDays || 1;

        // Calculate end date for showing notification
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + showDays);

        // Only include notifications that are still valid
        if (now <= endDate) {
          notificationsList.push({
            id: doc.id,
            ...data,
            startDate,
            endDate,
          });
        }
      });

      setNotifications(notificationsList);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mark notification as read with fix for BloomFilter error
  const markAsRead = async (notificationId) => {
    try {
      // Update local state first for immediate user feedback
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      // Get reference to the notification document
      const notificationRef = doc(db, "notifications", notificationId);

      try {
        // Use setDoc with merge instead of updateDoc to prevent BloomFilter errors
        await setDoc(
          notificationRef,
          {
            read: true,
            lastUpdated: serverTimestamp(),
          },
          { merge: true }
        );

        // Refresh notifications to update the badge count
        setTimeout(() => {
          fetchNotifications();
        }, 500);
      } catch (firestoreError) {
        console.error("Firebase error:", firestoreError);

        // If first attempt fails, try alternative approach
        try {
          // Get the full document first
          const docSnap = await getDoc(notificationRef);
          if (docSnap.exists()) {
            // Create a complete document update
            const data = docSnap.data();
            await setDoc(notificationRef, {
              ...data,
              read: true,
              lastUpdated: new Date().toISOString(), // Use string timestamp as fallback
            });
          }
        } catch (fallbackError) {
          console.error("Fallback update also failed:", fallbackError);

          // Last resort - try basic updateDoc with minimal fields
          try {
            await updateDoc(notificationRef, {
              read: true,
            });
          } catch (lastError) {
            // Re-throw the error to be caught by the outer try-catch
            throw lastError;
          }
        }
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);

      // Revert the optimistic update in the UI if all update attempts failed
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: false }
            : notification
        )
      );
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Format date function
  const formatDate = (date) => {
    if (!date) return "Unknown";

    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Render notification item
  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        item.read ? styles.readNotification : styles.unreadNotification,
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationDate}>
          {formatDate(item.startDate)}
        </Text>
      </View>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      {!item.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  // Empty state component
  const EmptyNotifications = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="notifications-none" size={64} color={COLORS.gray} />
      <Text style={styles.emptyText}>No notifications</Text>
      <Text style={styles.emptySubtext}>
        When you receive notifications, they will appear here
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={[
          styles.listContainer,
          notifications.length === 0 && styles.emptyListContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={!loading && <EmptyNotifications />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightWhite,
  },
  listContainer: {
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.small,
    paddingBottom: 100, // extra space at bottom
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
  },
  notificationItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.small,
    padding: SIZES.medium,
    marginBottom: SIZES.small,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
  },
  unreadNotification: {
    borderLeftColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  readNotification: {
    borderLeftColor: COLORS.gray2,
    backgroundColor: COLORS.lightWhite,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.xSmall,
  },
  notificationTitle: {
    fontFamily: "DMBold",
    fontSize: SIZES.medium,
    color: COLORS.primary,
    flex: 1,
  },
  notificationDate: {
    fontFamily: "DMRegular",
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  notificationMessage: {
    fontFamily: "DMRegular",
    fontSize: SIZES.small,
    color: COLORS.secondary,
    lineHeight: 22,
  },
  unreadIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontFamily: "DMBold",
    fontSize: SIZES.large,
    color: COLORS.gray,
    marginVertical: SIZES.small,
  },
  emptySubtext: {
    fontFamily: "DMRegular",
    fontSize: SIZES.small,
    color: COLORS.gray,
    textAlign: "center",
    paddingHorizontal: SIZES.large,
  },
});

export default Notification;
