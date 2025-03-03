import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { db, auth } from "../../../firebase/config";
import { COLORS, SIZES } from "../../../constants";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import ScreenHeaderBtn from "../../../components/common/header/ScreenHeaderBtn";

// Custom Message Bubble component
const MessageBubble = ({ message, isOwnMessage }) => {
  const formattedTime =
    message.createdAt instanceof Date
      ? message.createdAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <View
      style={[
        styles.messageBubble,
        isOwnMessage
          ? styles.ownMessageContainer
          : styles.otherMessageContainer,
      ]}
    >
      {!isOwnMessage && (
        <Image
          source={{
            uri: message.user?.avatar || "https://via.placeholder.com/40",
          }}
          style={styles.avatar}
        />
      )}
      <View
        style={[
          styles.messageContent,
          isOwnMessage ? styles.ownMessageContent : styles.otherMessageContent,
        ]}
      >
        {!isOwnMessage && (
          <Text style={styles.messageSender}>
            {message.user?.user || "Anonymous"}
          </Text>
        )}
        <Text
          style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.timeText,
            isOwnMessage ? styles.ownTimeText : styles.otherTimeText,
          ]}
        >
          {formattedTime}
        </Text>
      </View>
    </View>
  );
};

// System Message component
const SystemMessage = ({ message }) => (
  <View style={styles.systemMessageContainer}>
    <View style={styles.systemMessageLine}>
      <View style={styles.systemMessageDivider} />
      <Text style={styles.systemMessageText}>{message.text}</Text>
      <View style={styles.systemMessageDivider} />
    </View>
  </View>
);

export default function CommunityChat() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const flatListRef = useRef();
  const [messages, setMessages] = useState([]);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [userNam, setUserName] = useState("");

  useEffect(() => {
    const getUserData = async () => {
      try {
        // Get Firestore user data
        const userDataStr = await AsyncStorage.getItem("userData");
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          setUserName(userData.name);
          console.log("User data from Firestore:", userData);
        } else {
          // Fallback to auth user
          const authUserStr = await AsyncStorage.getItem("authUser");
          if (authUserStr) {
            const authUser = JSON.parse(authUserStr);
            setUserName(authUser.email.split("@")[0]);
          }
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
        setUserName("User");
      }
    };

    getUserData();
  }, []);

  useLayoutEffect(() => {
    fetchCommunityDetails();
  }, []);

  useEffect(() => {
    if (!community) return;

    // If community is deleted, show warning but still allow viewing messages
    if (community.isDeleted) {
      Alert.alert(
        "Community Deleted",
        "This community has been deleted by its creator. You can view previous messages but cannot send new ones."
      );
    }

    // Subscribe to messages
    const messagesRef = collection(db, "communityMessages");
    const q = query(
      messagesRef,
      where("communityId", "==", id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => {
        const data = doc.data();

        // Format message data
        return {
          _id: doc.id,
          text: data.text || data.content,
          createdAt: data.createdAt?.toDate() || new Date(),
          system: !!data.isSystem,
          user: data.isSystem
            ? null
            : {
                _id: data.userId,
                name: data.userName || "Anonymous",
                avatar: data.userAvatar || data.userPhoto,
              },
        };
      });

      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [community]);

  const fetchCommunityDetails = async () => {
    try {
      const communityRef = doc(db, "communities", id);
      const communitySnap = await getDoc(communityRef);

      if (communitySnap.exists()) {
        setCommunity(communitySnap.data());
      } else {
        Alert.alert("Error", "Community not found", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error("Error fetching community:", error);
      Alert.alert("Error", "Failed to load community details");
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Don't allow sending messages if community is deleted
    if (community?.isDeleted) {
      Alert.alert(
        "Cannot Send Message",
        "This community has been deleted by its creator."
      );
      return;
    }

    // Check if user is a member of the community
    if (!community?.members?.includes(auth.currentUser?.uid)) {
      Alert.alert("Access Denied", "You must be a member to send messages");
      return;
    }

    try {
      setSending(true);
      const messagesRef = collection(db, "communityMessages");
      await addDoc(messagesRef, {
        text: inputText.trim(),
        communityId: id,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
        userName: userNam,
        userAvatar:
          auth.currentUser.photoURL || "https://via.placeholder.com/100",
      });

      setInputText("");
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    if (item.system) {
      return <SystemMessage message={item} />;
    }

    const isOwnMessage = item.user?._id === auth.currentUser?.uid;
    return <MessageBubble message={item} isOwnMessage={isOwnMessage} />;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {community?.title || "Chat"}
              </Text>
              {community?.isDeleted && (
                <View style={styles.deletedBadge}>
                  <Text style={styles.deletedBadgeText}>Deleted</Text>
                </View>
              )}
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => router.push(`/community/${id}`)}
            >
              <MaterialIcons
                name="info-outline"
                size={24}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {community?.isDeleted && (
          <View style={styles.deletedBanner}>
            <MaterialIcons
              name="info"
              size={20}
              color="#ff3b30"
              style={styles.deletedIcon}
            />
            <Text style={styles.deletedText}>
              This community is deleted. You can view previous messages only.
            </Text>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          inverted={true}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={60} color="#ddd" />
              <Text style={styles.emptyMessage}>No messages yet!</Text>
              <Text style={styles.emptySubMessage}>
                Be the first to start the conversation
              </Text>
            </View>
          }
        />

        <View
          style={[
            styles.inputContainer,
            community?.isDeleted && styles.disabledInputContainer,
          ]}
        >
          <TextInput
            style={[styles.input, community?.isDeleted && styles.disabledInput]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={
              community?.isDeleted
                ? "Messaging unavailable"
                : "Type a message..."
            }
            multiline
            maxHeight={100}
            editable={!community?.isDeleted}
            placeholderTextColor={community?.isDeleted ? "#aaa" : "#777"}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || community?.isDeleted) &&
                styles.disabledButton,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending || community?.isDeleted}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={
                  !inputText.trim() || community?.isDeleted ? "#aaa" : "#fff"
                }
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 200,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  deletedBadge: {
    backgroundColor: "#ff3b30",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deletedBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  infoButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deletedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff0f0",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ffcccc",
  },
  deletedIcon: {
    marginRight: 8,
  },
  deletedText: {
    flex: 1,
    color: "#ff3b30",
    fontWeight: "500",
    fontSize: 14,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 10,
  },
  messageBubble: {
    flexDirection: "row",
    marginVertical: 5,
    maxWidth: "85%",
  },
  ownMessageContainer: {
    alignSelf: "flex-end",
    marginLeft: 50,
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
    marginRight: 50,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
    alignSelf: "flex-end",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#eee",
  },
  messageContent: {
    borderRadius: 18,
    padding: 12,
  },
  ownMessageContent: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageContent: {
    backgroundColor: "white",
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: "white",
  },
  otherMessageText: {
    color: "#333",
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  ownTimeText: {
    color: "rgba(255,255,255,0.7)",
  },
  otherTimeText: {
    color: "#999",
  },
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  systemMessageLine: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  systemMessageDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  systemMessageText: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "flex-end",
  },
  disabledInputContainer: {
    backgroundColor: "#f9f9f9",
    borderTopColor: "#eaeaea",
  },
  input: {
    flex: 1,
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 120,
    backgroundColor: "#f8f8f8",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ddd",
    color: "#999",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  disabledButton: {
    backgroundColor: "#e0e0e0",
    elevation: 0,
    shadowOpacity: 0,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyMessage: {
    marginTop: 16,
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
  },
  emptySubMessage: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
