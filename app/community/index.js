import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  runTransaction,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES } from "../../constants";

const CommunityCard = ({
  id,
  title,
  description,
  image,
  memberCount,
  isDeleted,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.card, isDeleted && styles.deletedCard]}
    onPress={() => onPress(id, title, description, image)}
    activeOpacity={0.9}
  >
    <Image
      source={{ uri: image }}
      style={styles.cardImage}
      resizeMode="cover"
    />
    <LinearGradient
      colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.8)"]}
      style={styles.cardGradient}
    />
    <View style={styles.cardOverlay}>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {title} {isDeleted && "(Deleted)"}
      </Text>
      <View style={styles.cardMemberInfo}>
        <Ionicons name="people-outline" size={14} color="#fff" />
        <Text style={styles.cardMemberCount}>{memberCount || 0} members</Text>
      </View>
    </View>
    {isDeleted && (
      <View style={styles.deletedBadge}>
        <Text style={styles.deletedBadgeText}>Deleted</Text>
      </View>
    )}
  </TouchableOpacity>
);

const CommunityListItem = ({
  id,
  title,
  description,
  image,
  memberCount,
  isMember,
  onPress,
  onJoinLeave,
}) => (
  <TouchableOpacity
    style={styles.listItem}
    onPress={() => onPress(id, title, description, image)}
    activeOpacity={0.7}
  >
    <Image
      source={{ uri: image }}
      style={styles.listItemImage}
      resizeMode="cover"
    />
    <View style={styles.listItemContent}>
      <Text style={styles.listItemTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.listItemDescription} numberOfLines={2}>
        {description}
      </Text>
      <View style={styles.listItemFooter}>
        <View style={styles.listItemMemberInfo}>
          <Ionicons name="people-outline" size={14} color={COLORS.gray} />
          <Text style={styles.listItemMemberCount}>
            {memberCount || 0} members
          </Text>
        </View>
      </View>
    </View>
    <TouchableOpacity
      style={[
        styles.joinButton,
        isMember ? styles.leaveButton : styles.joinButtonActive,
      ]}
      onPress={() => onJoinLeave(id, isMember)}
    >
      <Text
        style={[
          styles.joinButtonText,
          isMember ? styles.leaveButtonText : styles.joinButtonActiveText,
        ]}
      >
        {isMember ? "Leave" : "Join"}
      </Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function Community() {
  const router = useRouter();
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [unjoinedCommunities, setUnjoinedCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const communitiesRef = collection(db, "communities");
      const querySnapshot = await getDocs(communitiesRef);

      const joined = [];
      const unjoined = [];

      querySnapshot.forEach((doc) => {
        const community = { id: doc.id, ...doc.data() };
        community.memberCount = community.members?.length || 0;

        // Only display communities that aren't deleted
        // or that the current user has joined (even if deleted)
        const userHasJoined =
          auth.currentUser && community.members?.includes(auth.currentUser.uid);

        if (community.isDeleted && !userHasJoined) {
          // Skip deleted communities that user hasn't joined
          return;
        }

        if (userHasJoined) {
          joined.push(community);
        } else if (!community.isDeleted) {
          unjoined.push(community);
        }
      });

      // Sort by member count for better discoverability
      joined.sort((a, b) => b.memberCount - a.memberCount);
      unjoined.sort((a, b) => b.memberCount - a.memberCount);

      setJoinedCommunities(joined);
      setUnjoinedCommunities(unjoined);
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCommunityPress = (id, title, description, image) => {
    router.push({
      pathname: `/community/${id}`,
      params: {
        id,
        title,
        description,
        image,
      },
    });
  };

  const handleJoinLeave = async (communityId, isMember) => {
    if (!auth.currentUser) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const communityRef = doc(db, "communities", communityId);
      const communityDoc = await getDoc(communityRef);

      if (!communityDoc.exists()) {
        Alert.alert("Error", "Community not found");
        return;
      }

      const communityData = communityDoc.data();

      if (isMember) {
        // Leave community - direct update instead of transaction
        try {
          const currentMembers = communityData.members || [];
          const updatedMembers = currentMembers.filter(
            (uid) => uid !== auth.currentUser.uid
          );

          await updateDoc(communityRef, {
            members: updatedMembers,
          });
        } catch (error) {
          console.error("Error leaving community:", error);
          Alert.alert(
            "Error",
            "Failed to leave community. " +
              (error.code === "permission-denied"
                ? "You don't have permission to perform this action."
                : "Please try again later.")
          );
          return;
        }
      } else {
        // Check if user is banned
        const bannedMembers = communityData.bannedMembers || [];
        if (bannedMembers.includes(auth.currentUser.uid)) {
          Alert.alert(
            "Unable to Join",
            "You cannot join this community because you have been banned."
          );
          return;
        }

        // Join community - direct update instead of transaction
        try {
          const currentMembers = communityData.members || [];
          if (!currentMembers.includes(auth.currentUser.uid)) {
            await updateDoc(communityRef, {
              members: [...currentMembers, auth.currentUser.uid],
            });
          }
        } catch (error) {
          console.error("Error joining community:", error);
          Alert.alert(
            "Error",
            "Failed to join community. " +
              (error.code === "permission-denied"
                ? "You don't have permission to join this community."
                : "Please try again later.")
          );
          return;
        }
      }

      // Refresh communities
      fetchCommunities();
    } catch (error) {
      console.error("Error updating membership:", error);
      Alert.alert(
        "Error",
        "Failed to update membership. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCommunities();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading communities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Your Communities Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Communities</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {joinedCommunities.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons name="group-add" size={40} color="#ccc" />
          <Text style={styles.emptyStateText}>
            You haven't joined any communities yet.
          </Text>
          <Text style={styles.emptyStateSubText}>
            Join communities below to get started!
          </Text>
        </View>
      ) : (
        <View style={styles.cardsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsScroll}
          >
            {joinedCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                {...community}
                memberCount={community.memberCount}
                isDeleted={community.isDeleted}
                onPress={handleCommunityPress}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Discover Communities Section */}
      <View style={styles.discoverSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Discover Communities</Text>
        </View>
        <FlatList
          data={unjoinedCommunities}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.discoveryList}
          renderItem={({ item }) => (
            <CommunityListItem
              {...item}
              memberCount={item.memberCount}
              isMember={false}
              onPress={handleCommunityPress}
              onJoinLeave={handleJoinLeave}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <MaterialIcons name="groups" size={40} color="#ccc" />
              <Text style={styles.emptyStateText}>
                No communities to discover right now.
              </Text>
            </View>
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/community/create")}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get("window");
const cardWidth = width * 0.7;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingBottom: 85, // Account for bottom tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.gray,
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  // Your Communities - Card Style
  cardsContainer: {
    height: 180,
    marginBottom: 8,
  },
  cardsScroll: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  card: {
    width: cardWidth,
    height: 160,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
  cardOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  cardMemberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardMemberCount: {
    color: "white",
    fontSize: 12,
    marginLeft: 5,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  deletedCard: {
    opacity: 0.7,
  },
  deletedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 59, 48, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deletedBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Discover Communities - List Style
  discoverSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  discoveryList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: "row",
    backgroundColor: "white",
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  listItemImage: {
    width: 80,
    height: "100%",
  },
  listItemContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  listItemDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  listItemFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  listItemMemberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  listItemMemberCount: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
  },
  joinButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 4,
    marginRight: 12,
  },
  joinButtonActive: {
    backgroundColor: COLORS.primary,
  },
  leaveButton: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  joinButtonActiveText: {
    color: "white",
  },
  leaveButtonText: {
    color: "#666",
  },

  // Empty States
  emptyStateContainer: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#888",
    marginTop: 10,
    textAlign: "center",
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginTop: 5,
  },

  // Create Community FAB
  fab: {
    position: "absolute",
    bottom: 105, // Position above bottom nav
    right: 20,
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
