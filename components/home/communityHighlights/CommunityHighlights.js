import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { COLORS, FONT, SIZES } from "../../../constants";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width - SIZES.medium * 2;

// Sample data - replace with API call in production
const samplePosts = [
  {
    id: "1",
    author: {
      name: "Jane Smith",
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
      title: "Product Manager at Tech Solutions",
    },
    content:
      "Just landed my dream job after following the interview tips from this community! So grateful for all the support and advice.",
    likes: 128,
    comments: 24,
    timeAgo: "2h ago",
    tags: ["Success Story", "Interview"],
  },
  {
    id: "2",
    author: {
      name: "Mike Johnson",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      title: "Frontend Developer",
    },
    content:
      "I'm hosting a virtual meetup for junior developers looking to break into the tech industry. We'll cover portfolio building and networking. DM me if interested!",
    likes: 95,
    comments: 42,
    timeAgo: "5h ago",
    tags: ["Event", "Networking"],
  },
  {
    id: "3",
    author: {
      name: "Sarah Williams",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
      title: "HR Manager",
    },
    content:
      "Pro tip: Always research the company culture before your interview. It shows genuine interest and helps you determine if the workplace is right for you.",
    likes: 215,
    comments: 31,
    timeAgo: "1d ago",
    tags: ["Career Tip", "Interview"],
  },
];

const CommunityHighlights = ({ router }) => {
  const [communityPosts, setCommunityPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchCommunityPosts = async () => {
      try {
        setIsLoading(true);
        // In a real app, fetch from API here
        // const response = await fetch('your-api-endpoint');
        // const data = await response.json();

        // Using sample data for now
        setTimeout(() => {
          setCommunityPosts(samplePosts);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        setError("Failed to load community posts");
        console.log(error);
        setIsLoading(false);
      }
    };

    fetchCommunityPosts();
  }, []);

  const handleSeeAllPress = () => {
    router.push("community");
  };

  const handlePostPress = (post) => {
    router.push(`community-post/${post.id}`);
  };

  const renderPostItem = ({ item }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => handlePostPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.postHeader}>
        <Image
          source={{ uri: item.author.avatar }}
          style={styles.authorAvatar}
        />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{item.author.name}</Text>
          <Text style={styles.authorTitle} numberOfLines={1}>
            {item.author.title}
          </Text>
        </View>
        <Text style={styles.timeAgo}>{item.timeAgo}</Text>
      </View>

      <Text style={styles.postContent} numberOfLines={3}>
        {item.content}
      </Text>

      <View style={styles.tagsContainer}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.postFooter}>
        <View style={styles.footerAction}>
          <Icon name="heart-outline" size={18} color={COLORS.gray} />
          <Text style={styles.actionCount}>{item.likes}</Text>
        </View>
        <View style={styles.footerAction}>
          <Icon name="chatbubble-outline" size={18} color={COLORS.gray} />
          <Text style={styles.actionCount}>{item.comments}</Text>
        </View>
        <TouchableOpacity style={styles.shareButton}>
          <Icon name="share-social-outline" size={18} color={COLORS.tertiary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Community Highlights</Text>
        <TouchableOpacity onPress={handleSeeAllPress}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={communityPosts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.postsList}
          snapToInterval={ITEM_WIDTH + SIZES.medium}
          decelerationRate="fast"
          snapToAlignment="center"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SIZES.large,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.medium,
    marginBottom: SIZES.small,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  seeAllText: {
    fontSize: SIZES.medium - 2,
    fontFamily: FONT.medium,
    color: COLORS.tertiary,
  },
  loadingContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    textAlign: "center",
    fontFamily: FONT.medium,
    color: "red",
    marginVertical: SIZES.medium,
  },
  postsList: {
    paddingLeft: SIZES.medium,
    paddingRight: SIZES.small,
  },
  postCard: {
    width: ITEM_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginRight: SIZES.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorInfo: {
    flex: 1,
    marginLeft: SIZES.small,
  },
  authorName: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  authorTitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  timeAgo: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small - 2,
    color: COLORS.gray,
  },
  postContent: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 2,
    color: COLORS.secondary,
    lineHeight: 20,
    marginBottom: SIZES.small,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: SIZES.small,
  },
  tag: {
    backgroundColor: COLORS.lightWhite,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.small,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small - 2,
    color: COLORS.tertiary,
  },
  postFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    borderTopWidth: 1,
    borderTopColor: COLORS.lightWhite,
    paddingTop: SIZES.small,
  },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SIZES.large,
  },
  actionCount: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginLeft: 4,
  },
  shareButton: {
    marginLeft: "auto",
  },
});

export default CommunityHighlights;
