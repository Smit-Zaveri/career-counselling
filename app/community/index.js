import React, { useState, useEffect, useRef } from "react";
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
  TextInput,
  Animated,
  StatusBar,
  Platform,
  RefreshControl,
} from "react-native";
import {
  AntDesign,
  Ionicons,
  MaterialIcons,
  Feather,
  FontAwesome5,
} from "@expo/vector-icons";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES } from "../../constants";
import { BlurView } from "expo-blur";

const CommunityCard = ({
  id,
  title,
  description,
  image,
  memberCount,
  isDeleted,
  onPress,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.card, isDeleted && styles.deletedCard]}
        onPress={() => onPress(id, title, description, image)}
        activeOpacity={0.9}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Image
          source={{ uri: image }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.9)"]}
          style={styles.cardGradient}
        />
        <View style={styles.cardOverlay}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {title} {isDeleted && "(Deleted)"}
          </Text>
          <View style={styles.cardMemberInfo}>
            <Ionicons name="people" size={16} color="#fff" />
            <Text style={styles.cardMemberCount}>
              {memberCount || 0} members
            </Text>
          </View>
        </View>
        {isDeleted && (
          <View style={styles.deletedBadge}>
            <Text style={styles.deletedBadgeText}>Deleted</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

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
    activeOpacity={0.8}
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
          <FontAwesome5 name="users" size={12} color={COLORS.gray} />
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
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showAllJoined, setShowAllJoined] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    fetchCommunities();

    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Filter communities based on search
  const filteredJoinedCommunities = joinedCommunities.filter(
    (community) =>
      community.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (community.description &&
        community.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  const filteredUnjoinedCommunities = unjoinedCommunities.filter(
    (community) =>
      community.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (community.description &&
        community.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Determine which joined communities to show based on showAllJoined state
  const visibleJoinedCommunities = searchText
    ? filteredJoinedCommunities
    : showAllJoined
    ? joinedCommunities
    : joinedCommunities.slice(0, 5);

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
      setShowAllJoined(false);
    } catch (error) {
      console.error("Error fetching communities:", error);
      Alert.alert(
        "Error",
        "Failed to load communities. Pull down to try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Header animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 100],
    outputRange: [0, 0.85, 1],
    extrapolate: "clamp",
  });

  const handleCommunityPress = (id, title, description, image) => {
    try {
      const safeImageUrl = image.startsWith("file://")
        ? image.replace(/[^\w\s/.-]/g, "")
        : image;

      // Use replace instead of push for consistent navigation
      router.replace({
        pathname: `/community/${id}`,
        params: {
          id,
          title: encodeURIComponent(title),
          description: encodeURIComponent(description),
          image: encodeURIComponent(safeImageUrl),
        },
      });
    } catch (error) {
      console.error("Navigation error:", error);
      router.replace(`/community/${id}`);
    }
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
        // Leave community logic
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
        // Join community logic
        // Check if user is banned
        const bannedMembers = communityData.bannedMembers || [];
        if (bannedMembers.includes(auth.currentUser.uid)) {
          Alert.alert(
            "Unable to Join",
            "You cannot join this community because you have been banned."
          );
          return;
        }

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
    // Visual feedback animation for refresh button
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setRefreshing(true);
    setSearchText("");
    fetchCommunities();
  };

  const handleCreateCommunity = () => {
    router.replace("/community/create");
  };

  const toggleShowAllJoined = () => {
    setShowAllJoined((prev) => !prev);
  };

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        { opacity: fadeAnim, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Communities</Text>
        <TouchableOpacity
          onPress={handleRefresh}
          style={styles.refreshButton}
          activeOpacity={0.7}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: refreshing
                    ? scrollY.interpolate({
                        inputRange: [0, 1000],
                        outputRange: ["0deg", "360deg"],
                      })
                    : "0deg",
                },
              ],
            }}
          >
            <Ionicons
              name={refreshing ? "sync" : "refresh"}
              size={22}
              color={COLORS.primary}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
          <Feather
            name="search"
            size={18}
            color={isFocused ? COLORS.primary : "#999"}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search communities..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {searchText !== "" && (
            <TouchableOpacity
              onPress={() => setSearchText("")}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading communities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Floating header for scroll effect */}
      <Animated.View
        style={[
          styles.floatingHeader,
          {
            transform: [{ translateY: headerHeight }],
            opacity: headerOpacity,
          },
        ]}
      >
        <BlurView intensity={80} style={styles.blurView}>
          <View style={styles.floatingHeaderContent}>
            <Text style={styles.floatingHeaderTitle}>Communities</Text>
            <View style={styles.floatingSearchBar}>
              <Feather name="search" size={16} color="#777" />
              <TextInput
                style={styles.floatingSearchInput}
                placeholder="Search communities..."
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText !== "" && (
                <TouchableOpacity
                  onPress={() => setSearchText("")}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Feather name="x" size={14} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </BlurView>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Pull to refresh"
            titleColor={COLORS.primary}
          />
        }
      >
        {renderHeader()}

        {/* Your Communities Section */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(translateY, 0.8) }],
          }}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Communities</Text>
            {!searchText && joinedCommunities.length > 5 && (
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={toggleShowAllJoined}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>
                  {showAllJoined ? "Show Less" : "See All"}
                </Text>
                <Ionicons
                  name={showAllJoined ? "chevron-up" : "chevron-forward"}
                  size={16}
                  color={COLORS.primary}
                  style={{ marginLeft: 2 }}
                />
              </TouchableOpacity>
            )}
          </View>

          {searchText && filteredJoinedCommunities.length === 0 ? (
            <View style={styles.emptySearchContainer}>
              <MaterialIcons name="search-off" size={32} color="#ccc" />
              <Text style={styles.emptySearchText}>
                No joined communities match your search
              </Text>
            </View>
          ) : joinedCommunities.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <MaterialIcons name="group-add" size={48} color="#ddd" />
              <Text style={styles.emptyStateText}>
                You haven't joined any communities yet
              </Text>
              <Text style={styles.emptyStateSubText}>
                Join communities below to get started!
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.cardsContainer,
                showAllJoined && { height: null, paddingBottom: 15 },
              ]}
            >
              <ScrollView
                horizontal={!showAllJoined}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                  styles.cardsScroll,
                  showAllJoined && styles.cardsScrollGrid,
                ]}
              >
                {visibleJoinedCommunities.map((community) => (
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
        </Animated.View>

        {/* Discover Communities Section */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(translateY, 0.6) }],
          }}
        >
          <View style={styles.discoverSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Discover Communities</Text>
              {refreshing && (
                <View style={styles.refreshingIndicator}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.refreshingText}>Refreshing...</Text>
                </View>
              )}
            </View>

            {searchText && filteredUnjoinedCommunities.length === 0 && (
              <View style={styles.emptySearchContainer}>
                <MaterialIcons name="search-off" size={32} color="#ccc" />
                <Text style={styles.emptySearchText}>
                  No communities match your search
                </Text>
              </View>
            )}

            {(searchText ? filteredUnjoinedCommunities : unjoinedCommunities)
              .length > 0 ? (
              <View style={styles.listContainer}>
                {(searchText
                  ? filteredUnjoinedCommunities
                  : unjoinedCommunities
                ).map((item) => (
                  <CommunityListItem
                    key={item.id}
                    {...item}
                    memberCount={item.memberCount}
                    isMember={false}
                    onPress={handleCommunityPress}
                    onJoinLeave={handleJoinLeave}
                  />
                ))}
              </View>
            ) : (
              !searchText && (
                <View style={styles.emptyStateContainer}>
                  <MaterialIcons name="groups" size={48} color="#ddd" />
                  <Text style={styles.emptyStateText}>
                    No communities to discover right now
                  </Text>
                </View>
              )
            )}
          </View>
        </Animated.View>

        {/* Extra bottom spacing to account for bottom navigation and FAB */}
        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateCommunity}
        activeOpacity={0.85}
      >

          <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const { width, height } = Dimensions.get("window");
const cardWidth = width * 0.7;
const HEADER_HEIGHT = Platform.OS === "ios" ? 90 : 70;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 15,
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: "600",
  },

  // Header styles
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 10,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.03)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Search styles
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 48,
    borderWidth: 1,
    borderColor: "transparent",
  },
  searchBarFocused: {
    backgroundColor: "#fff",
    borderColor: "rgba(66,102,245,0.3)",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
  },
  clearButton: {
    padding: 5,
  },

  // Floating Header
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 1000,
    overflow: "hidden",
  },
  blurView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  floatingHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  floatingHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  floatingSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    flex: 1,
    marginLeft: 15,
  },
  floatingSearchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    color: "#333",
  },

  // Section headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    letterSpacing: 0.2,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(66,102,245,0.08)",
    borderRadius: 20,
  },
  seeAllText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  refreshingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshingText: {
    color: COLORS.primary,
    fontSize: 12,
    marginLeft: 5,
    fontWeight: "500",
  },

  // Your Communities - Card Style
  cardsContainer: {
    height: 220,
    marginBottom: 15,
  },
  cardsScroll: {
    paddingLeft: 20,
    paddingRight: 12,
    paddingVertical: 8,
  },
  cardsScrollGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: cardWidth,
    height: 200,
    marginRight: 16,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
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
    padding: 18,
  },
  cardTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 12,
    letterSpacing: 0.5,
    lineHeight: 28,
  },
  cardMemberInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cardMemberCount: {
    color: "white",
    fontSize: 13,
    marginLeft: 6,
    fontWeight: "600",
  },
  deletedCard: {
    opacity: 0.8,
  },
  deletedBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(255, 59, 48, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  deletedBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  // Discover Communities - List Style
  discoverSection: {
    flex: 1,
    paddingBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  listItem: {
    flexDirection: "row",
    backgroundColor: "white",
    marginBottom: 15,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  listItemImage: {
    width: 110,
    height: 110,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  listItemContent: {
    flex: 1,
    padding: 15,
    justifyContent: "space-between",
  },
  listItemTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  listItemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    lineHeight: 19,
  },
  listItemFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  listItemMemberInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  listItemMemberCount: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
    fontWeight: "500",
  },
  joinButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 25,
    marginRight: 15,
    minWidth: 80,
    textAlign: "center",
  },
  joinButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  leaveButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  joinButtonText: {
    fontSize: 15,
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
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.02)",
    marginHorizontal: 20,
    borderRadius: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
    maxWidth: "80%",
  },
  emptyStateSubText: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
    maxWidth: "80%",
    lineHeight: 22,
  },
  emptySearchContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.02)",
    marginHorizontal: 20,
    borderRadius: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  emptySearchText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
    maxWidth: "80%",
  },

  // Create Community FAB
  fab: {
    position: "absolute",
    bottom: 105, // Position above bottom nav
    right: 20,
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  fabGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },
});
