import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
  FlatList,
  BackHandler,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Add AsyncStorage import
import { useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { COLORS, SIZES, FONTS } from "../../constants";
import { Stack } from "expo-router";
import ScreenHeaderBtn from "../../components/common/header/ScreenHeaderBtn";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ViolationReportModal from "./components/ViolationReportModal";
import { styles } from "./styles/mainComponentStyles";

// Import MemberItem component - Add this import!

// Import MemberItem component - Add this import!
import MemberItem from "./components/MemberItem";

// Chat message component
const ChatMessage = ({ message, isOwnMessage }) => {
  const formattedDate = new Date(message.timestamp?.toDate()).toLocaleString();

  return (
    <View
      style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      {!isOwnMessage && (
        <Image
          source={
            message.userPhoto
              ? { uri: message.userPhoto }
              : require("../../assets/images/profile.png")
          }
          style={styles.messageAvatar}
        />
      )}
      <View
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
        ]}
      >
        {!isOwnMessage && (
          <Text style={styles.messageAuthor}>
            {message.userName || "Anonymous"}
          </Text>
        )}
        <Text style={[styles.messageText, isOwnMessage && { color: "#fff" }]}>
          {message.content}
        </Text>
        <Text
          style={[
            styles.messageTime,
            isOwnMessage && { color: "rgba(255,255,255,0.7)" },
          ]}
        >
          {formattedDate}
        </Text>
      </View>
    </View>
  );
};

export default function CommunityDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // Safely decode URL parameters
  const id = params.id;
  const title = decodeURIComponent(params.title || "");
  const description = decodeURIComponent(params.description || "");
  const image = decodeURIComponent(params.image || "");

  const scrollViewRef = useRef();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [userIsCreator, setUserIsCreator] = useState(false);
  const [userIsDeleted, setUserIsDeleted] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const getUserData = async () => {
      try {
        // Get Firestore user data
        const userDataStr = await AsyncStorage.getItem("userData");
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          setUserName(userData.name || "User");
        } else {
          // Fallback to auth user
          const authUserStr = await AsyncStorage.getItem("authUser");
          if (authUserStr) {
            const authUser = JSON.parse(authUserStr);
            setUserName(authUser.email?.split("@")[0] || "User");
          } else if (auth.currentUser?.displayName) {
            // Direct fallback to Firebase auth object
            setUserName(auth.currentUser.displayName);
          } else if (auth.currentUser?.email) {
            setUserName(auth.currentUser.email.split("@")[0]);
          } else {
            setUserName("User");
          }
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
        // Default fallback if everything fails
        setUserName(auth.currentUser?.displayName || "User");
      }
    };

    getUserData();
  }, []);

  // Add hardware back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/community");
        return true; // Prevent default behavior
      }
    );

    return () => backHandler.remove();
  }, []);

  // Listen for messages and community info
  useEffect(() => {
    let unsubscribe = () => {};

    const setup = async () => {
      try {
        await fetchCommunityDetails();
        unsubscribe = listenForMessages();
      } catch (error) {
        console.error("Setup error:", error);
      }
    };

    setup();

    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    };
  }, [id]);

  // Fetch community details
  const fetchCommunityDetails = async () => {
    try {
      const communityRef = doc(db, "communities", id);
      const communityDoc = await getDoc(communityRef);

      if (communityDoc.exists()) {
        const communityData = { id: communityDoc.id, ...communityDoc.data() };
        setCommunity(communityData);

        // Set member count
        setMemberCount(communityData.members?.length || 0);

        // Check if current user is a member
        const userIsMember = communityData.members?.includes(
          auth.currentUser?.uid
        );
        setIsMember(userIsMember);

        // Check if current user is the creator
        const isCreator = auth.currentUser?.uid === communityData.createdBy;
        setUserIsCreator(isCreator);

        // Check if community is deleted
        setUserIsDeleted(communityData.isDeleted || false);

        // Get member details
        const memberDetails = await fetchMemberDetails(
          communityData.members || []
        );
        setCommunity({
          ...communityData,
          memberDetails,
        });
      }
    } catch (error) {
      console.error("Error fetching community details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberDetails = async (memberIds) => {
    try {
      const memberDetails = [];

      for (const memberId of memberIds) {
        const userRef = doc(db, "users", memberId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          memberDetails.push({
            id: memberId,
            ...userSnap.data(),
          });
        }
      }

      return memberDetails;
    } catch (error) {
      console.error("Error fetching member details:", error);
      return [];
    }
  };

  // Listen for messages with better error handling
  const listenForMessages = () => {
    try {
      // Create two query references - one for regular messages, one for system messages
      const messagesRef = collection(db, "communityMessages");
      const systemMessagesRef = collection(db, "systemMessages");
      let unsubscribeMessages = () => {};
      let unsubscribeSystemMessages = () => {};

      const setupListener = async () => {
        try {
          // Query for regular messages
          const q = query(
            messagesRef,
            where("communityId", "==", id),
            orderBy("timestamp", "asc")
          );

          // Query for system messages
          const systemQ = query(
            systemMessagesRef,
            where("communityId", "==", id),
            orderBy("timestamp", "asc")
          );

          // Store all messages in one array
          let allMessages = [];

          // Listen for regular messages
          unsubscribeMessages = onSnapshot(q, {
            next: (snapshot) => {
              const fetchedMessages = [];
              snapshot.forEach((doc) => {
                fetchedMessages.push({ id: doc.id, ...doc.data() });
              });

              // Update the regular messages portion
              allMessages = [
                ...allMessages.filter((msg) => msg.isSystem),
                ...fetchedMessages,
              ];

              // Sort combined messages by timestamp
              allMessages.sort((a, b) => {
                const timestampA = a.timestamp?.toDate?.() || new Date(0);
                const timestampB = b.timestamp?.toDate?.() || new Date(0);
                return timestampA - timestampB;
              });

              setMessages(allMessages);

              // Scroll to bottom when new messages arrive
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            },
            error: (error) => {
              console.error("Message listener error:", error);
            },
          });

          // Listen for system messages
          unsubscribeSystemMessages = onSnapshot(systemQ, {
            next: (snapshot) => {
              const fetchedSystemMessages = [];
              snapshot.forEach((doc) => {
                fetchedSystemMessages.push({ id: doc.id, ...doc.data() });
              });

              // Update the system messages portion
              allMessages = [
                ...allMessages.filter((msg) => !msg.isSystem),
                ...fetchedSystemMessages,
              ];

              // Sort combined messages by timestamp
              allMessages.sort((a, b) => {
                const timestampA = a.timestamp?.toDate?.() || new Date(0);
                const timestampB = b.timestamp?.toDate?.() || new Date(0);
                return timestampA - timestampB;
              });

              setMessages(allMessages);

              // Scroll to bottom when new messages arrive
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            },
            error: (error) => {
              console.error("System message listener error:", error);
            },
          });
        } catch (error) {
          console.log("Error setting up initial listener:", error);
          // Fall back to simple message listener if complex one fails
          unsubscribeMessages = setupSimpleMessageListener();
        }
      };

      setupListener();

      // Return combined unsubscribe function
      return () => {
        unsubscribeMessages();
        unsubscribeSystemMessages();
      };
    } catch (error) {
      console.error("Error in listenForMessages:", error);
      return () => {};
    }
  };

  // Simple message listener with better error handling
  const setupSimpleMessageListener = () => {
    try {
      const messagesRef = collection(db, "communityMessages");
      const systemMessagesRef = collection(db, "systemMessages");

      const simpleQuery = query(messagesRef, where("communityId", "==", id));
      const simpleSystemQuery = query(
        systemMessagesRef,
        where("communityId", "==", id)
      );

      let allMessages = [];

      // Set up listeners for both collections
      const unsubMessages = onSnapshot(simpleQuery, {
        next: (snapshot) => {
          try {
            const fetchedMessages = [];
            snapshot.forEach((doc) => {
              fetchedMessages.push({ id: doc.id, ...doc.data() });
            });

            // Update regular messages
            allMessages = [
              ...allMessages.filter((msg) => msg.isSystem),
              ...fetchedMessages,
            ];
            combineAndSortMessages();
          } catch (error) {
            console.error("Error processing messages:", error);
          }
        },
        error: (error) => {
          console.error("Simple listener error:", error);
        },
      });

      const unsubSystemMessages = onSnapshot(simpleSystemQuery, {
        next: (snapshot) => {
          try {
            const fetchedSystemMessages = [];
            snapshot.forEach((doc) => {
              fetchedSystemMessages.push({ id: doc.id, ...doc.data() });
            });

            // Update system messages
            allMessages = [
              ...allMessages.filter((msg) => !msg.isSystem),
              ...fetchedSystemMessages,
            ];
            combineAndSortMessages();
          } catch (error) {
            console.error("Error processing system messages:", error);
          }
        },
        error: (error) => {
          console.error("Simple system listener error:", error);
        },
      });

      // Helper function to combine and sort messages
      const combineAndSortMessages = () => {
        // Sort all messages by timestamp
        allMessages.sort((a, b) => {
          const timestampA = a.timestamp?.toDate?.() || new Date(0);
          const timestampB = b.timestamp?.toDate?.() || new Date(0);
          return timestampA - timestampB;
        });

        setMessages(allMessages);

        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      };

      // Return combined unsubscribe function
      return () => {
        unsubMessages();
        unsubSystemMessages();
      };
    } catch (error) {
      console.error("Error in simple listener setup:", error);
      return () => {};
    }
  };

  // Join/leave community
  const handleJoinLeave = async () => {
    if (!auth.currentUser) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const communityRef = doc(db, "communities", id);
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

          setIsMember(false);

          // Add system message about leaving
          await addSystemMessage(
            `${
              auth.currentUser.displayName || userName || "A user"
            } left the community`
          );
        } catch (error) {
          console.error("Error leaving community:", error);
          Alert.alert(
            "Error",
            "Failed to leave community. " +
              (error.code === "permission-denied"
                ? "You may not have permission to perform this action."
                : "Please try again later.")
          );
          return;
        }
      } else {
        // Check if user is banned before allowing them to join
        const bannedMembers = communityData.bannedMembers || [];
        if (bannedMembers.includes(auth.currentUser.uid)) {
          Alert.alert(
            "Unable to Join",
            "You cannot join this community because you have been banned by the community administrator."
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

          setIsMember(true);

          // Add system message about joining
          await addSystemMessage(
            `${
              auth.currentUser.displayName || userName || "A new user"
            } joined the community`
          );
        } catch (error) {
          console.error("Error joining community:", error);
          Alert.alert(
            "Error",
            "Failed to join community. " +
              (error.code === "permission-denied"
                ? "You may not have permission to join this community."
                : "Please try again later.")
          );
          return;
        }
      }

      // Refresh community details
      fetchCommunityDetails();
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

  // Add system message
  const addSystemMessage = async (content) => {
    try {
      const messageData = {
        content,
        communityId: id,
        timestamp: serverTimestamp(),
        isSystem: true,
      };

      // Use the systemMessages collection instead of communityMessages
      await addDoc(collection(db, "systemMessages"), messageData);
    } catch (error) {
      console.error("Error adding system message:", error);
    }
  };

  // Send message with improved auth checking
  const sendMessage = async () => {
    if (!messageText.trim()) {
      return;
    }

    // Check authentication
    if (!auth.currentUser) {
      alert("You need to be logged in to send messages");
      router.push("/login");
      return;
    }

    // Verify auth token is not expired
    const user = auth.currentUser;
    const token = await user.getIdToken(true);

    if (!token) {
      alert("Authentication error. Please log in again.");
      router.push("/login");
      return;
    }

    if (!isMember) {
      alert("You must be a member to send messages");
      return;
    }

    try {
      setSendingMessage(true);

      const { uid, displayName, photoURL } = auth.currentUser;

      const messageData = {
        content: messageText.trim(),
        userId: uid,
        userName: userName,
        userPhoto: photoURL || null,
        communityId: id,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        clientTimestamp: Date.now(), // Add this to ensure uniqueness
      };

      await addDoc(collection(db, "communityMessages"), messageData);
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);

      if (error.code === "permission-denied") {
        alert(
          "Permission denied. Make sure you are logged in and have joined the community."
        );
      } else if (error.code === "unauthenticated") {
        alert("Your login session has expired. Please log in again.");
        router.push("/login");
      } else {
        alert("Failed to send message: " + error.message);
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Community",
      "Are you sure you want to delete this community?\n\n• Data will remain intact\n• Members won't be able to chat further\n• You can restore the community later",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const communityRef = doc(db, "communities", id);

      // Mark as deleted rather than actually deleting
      await updateDoc(communityRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: auth.currentUser.uid,
      });

      // Add system message about deletion
      await addSystemMessage(
        "This community has been deleted by the creator. Messages are now read-only."
      );

      Alert.alert(
        "Community Deleted",
        "This community has been marked as deleted. All data remains intact, but members can no longer chat.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Error deleting community:", error);
      Alert.alert("Error", "Failed to delete community");
    } finally {
      setLoading(false);
    }
  };

  // Add restoration capability for creators
  const handleRestoreCommunity = async () => {
    try {
      setLoading(true);
      const communityRef = doc(db, "communities", id);

      await updateDoc(communityRef, {
        isDeleted: false,
        restoredAt: serverTimestamp(),
      });

      await addSystemMessage(
        "This community has been restored by the creator."
      );

      fetchCommunityDetails();
      Alert.alert("Success", "Community has been restored");
    } catch (error) {
      console.error("Error restoring community:", error);
      Alert.alert("Error", "Failed to restore community");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = (user) => {
    // Add permission check
    if (!userIsCreator) {
      Alert.alert(
        "Permission Denied",
        "Only community creators can remove members."
      );
      return;
    }

    // Update to store the user and show report modal
    setSelectedUser(user);
    setShowReportModal(true);
  };

  const handleSubmitViolation = async (violationData) => {
    if (!selectedUser) return;

    try {
      setReportLoading(true);

      // Check if user is still the creator (security check)
      const communityRef = doc(db, "communities", id);
      const communitySnap = await getDoc(communityRef);

      if (
        !communitySnap.exists() ||
        communitySnap.data().createdBy !== auth.currentUser.uid
      ) {
        Alert.alert(
          "Error",
          "You don't have permission to remove members from this community"
        );
        setReportLoading(false);
        return;
      }

      // 1. Add violation report to database
      const reportsRef = collection(db, "communityReports");
      await addDoc(reportsRef, {
        communityId: id,
        communityTitle: community.title,
        userId: selectedUser.id,
        userName: selectedUser.displayName || "Anonymous",
        reportedBy: auth.currentUser.uid,
        reportedAt: serverTimestamp(),
        ...violationData,
      });

      // 2. Remove user from community with error handling
      try {
        await updateDoc(communityRef, {
          members: arrayRemove(selectedUser.id),
          bannedMembers: arrayUnion(selectedUser.id),
        });
      } catch (removeError) {
        console.error("Error removing user:", removeError);

        // Show specific error message and possible solution
        if (removeError.code === "permission-denied") {
          Alert.alert(
            "Permission Error",
            "You don't have permission to remove this user. This might be because:\n\n" +
              "• The security rules have changed\n" +
              "• You're no longer the community creator\n" +
              "• There's a network or authentication issue\n\n" +
              "Try refreshing the community or logging in again."
          );
        } else {
          Alert.alert("Error", `Failed to remove user: ${removeError.message}`);
        }
        setReportLoading(false);
        return;
      }

      // 3. Add system message about user removal
      await addSystemMessage(
        `${
          selectedUser.displayName || "A user"
        } was removed from the community for rule violation`
      );

      // 4. Close modal and refresh data
      setShowReportModal(false);
      setSelectedUser(null);

      Alert.alert("Success", "User has been removed for rule violation");
      fetchCommunityDetails();
    } catch (error) {
      console.error("Error during removal process:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while removing the user"
      );
    } finally {
      setReportLoading(false);
    }
  };

  const handleBackPress = () => {
    router.replace("/community"); // Replace 'back()' with explicit navigation to community index
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "chat" && styles.activeTab]}
        onPress={() => setActiveTab("chat")}
      >
        <Text
          style={[styles.tabText, activeTab === "chat" && styles.activeTabText]}
        >
          Chat
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "about" && styles.activeTab]}
        onPress={() => setActiveTab("about")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "about" && styles.activeTabText,
          ]}
        >
          About
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderChatContent = () => (
    <View style={styles.chatContainer}>
      {community?.isDeleted && (
        <View style={styles.deletedBanner}>
          <MaterialIcons
            name="info"
            size={20}
            color="#ff3b30"
            style={styles.deletedIcon}
          />
          <Text style={styles.deletedText}>
            This community has been deleted by its creator. Messages are
            view-only.
          </Text>
        </View>
      )}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: false })
        }
      >
        {messages.length === 0 ? (
          <View style={styles.emptyChatContainer}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={60}
              color="#ddd"
            />
            <Text style={styles.emptyStateText}>
              No messages yet. Start the conversation!
            </Text>
          </View>
        ) : (
          messages.map((message) => {
            if (message.isSystem) {
              return (
                <View
                  key={`${message.id}_${
                    message.clientTimestamp || Date.now()
                  }_${Math.random().toString(36).substr(2, 9)}`}
                  style={styles.systemMessageContainer}
                >
                  <Text style={styles.systemMessageText}>
                    {message.content}
                  </Text>
                </View>
              );
            }

            const isOwnMessage = message.userId === auth.currentUser?.uid;
            return (
              <ChatMessage
                key={`${message.id}_${
                  message.clientTimestamp || Date.now()
                }_${Math.random().toString(36).substr(2, 9)}`}
                message={message}
                isOwnMessage={isOwnMessage}
              />
            );
          })
        )}
      </ScrollView>
      {!isMember ? (
        <View style={styles.joinToChatContainer}>
          <Ionicons
            name="lock-closed"
            size={20}
            color="#888"
            style={styles.lockIcon}
          />
          <Text style={styles.joinToChatText}>
            Join this community to participate in the chat
          </Text>
          <TouchableOpacity style={styles.joinButton} onPress={handleJoinLeave}>
            <Text style={styles.joinButtonText}>Join Community</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={100}
          style={styles.chatInputWrapper}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
              editable={!sendingMessage && !community?.isDeleted}
              placeholderTextColor={community?.isDeleted ? "#bbb" : "#999"}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!messageText.trim() ||
                  sendingMessage ||
                  community?.isDeleted) &&
                  styles.disabledButton,
              ]}
              onPress={sendMessage}
              disabled={
                !messageText.trim() || sendingMessage || community?.isDeleted
              }
            >
              {sendingMessage ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );

  const renderAboutContent = () => (
    <ScrollView style={styles.aboutContainer}>
      {/* Community stats card */}
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{memberCount}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {messages.filter((msg) => !msg.isSystem).length || 0}
            </Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
          {community?.createdAt && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {community.createdAt &&
                    new Date(
                      community.createdAt.seconds * 1000
                    ).toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })}
                </Text>
                <Text style={styles.statLabel}>Created</Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Show deletion notice if community is deleted */}
      {community?.isDeleted && (
        <View style={styles.deletedInfoCard}>
          <MaterialIcons
            name="warning"
            size={24}
            color="#ff3b30"
            style={styles.deletedInfoIcon}
          />
          <Text style={styles.deletedInfoTitle}>This community is deleted</Text>
          <Text style={styles.deletedInfoText}>
            This community was deleted by its creator. All data remains intact,
            but members can no longer send messages.
          </Text>
          {/* Show restore option for the creator */}
          {userIsCreator && (
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestoreCommunity}
            >
              <MaterialIcons
                name="restore"
                size={18}
                color={COLORS.primary}
                style={styles.buttonIcon}
              />
              <Text style={styles.restoreButtonText}>Restore Community</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* About section */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionHeading}>About this community</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {/* Membership section */}
      {auth.currentUser && (
        <View style={styles.membershipCard}>
          <Text style={styles.membershipTitle}>
            {isMember ? "You are a member" : "Join this community"}
          </Text>
          <Text style={styles.membershipDescription}>
            {isMember
              ? "You can participate in discussions and receive updates."
              : "Join this community to participate in discussions and connect with other members."}
          </Text>
          <View style={styles.membershipButtonContainer}>
            {isMember ? (
              <TouchableOpacity
                style={styles.leaveCommunityButton}
                onPress={handleJoinLeave}
              >
                <Ionicons name="exit-outline" size={18} color="white" />
                <Text style={styles.leaveCommunityButtonText}>
                  Leave Community
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.joinCommunityButton}
                onPress={handleJoinLeave}
              >
                <Ionicons name="enter-outline" size={18} color="white" />
                <Text style={styles.joinCommunityButtonText}>
                  Join Community
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Admin controls - only show if not deleted or user is creator */}
      {userIsCreator && (
        <View style={styles.adminCard}>
          <Text style={styles.sectionHeading}>
            {community?.isDeleted ? "Admin Options" : "Admin Controls"}
          </Text>

          <TouchableOpacity
            style={styles.adminButtonNew}
            onPress={() => setShowUsersModal(true)}
          >
            <View style={styles.adminButtonIconContainer}>
              <MaterialIcons name="people" size={20} color="white" />
            </View>
            <View style={styles.adminButtonContent}>
              <Text style={styles.adminButtonTitle}>Manage Members</Text>
              <Text style={styles.adminButtonDescription}>
                View and remove members who violate community rules
                {community?.bannedMembers?.length > 0 &&
                  ` (${community.bannedMembers.length} banned)`}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          {!community?.isDeleted && (
            <TouchableOpacity
              style={[styles.adminButtonNew, styles.deleteButtonNew]}
              onPress={handleDelete}
            >
              <View
                style={[
                  styles.adminButtonIconContainer,
                  styles.deleteIconContainer,
                ]}
              >
                <MaterialIcons name="delete" size={20} color="white" />
              </View>
              <View style={styles.adminButtonContent}>
                <Text style={styles.deleteButtonTitle}>Delete Community</Text>
                <Text style={styles.adminButtonDescription}>
                  Mark this community as deleted (data will be preserved)
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "chat":
        return renderChatContent();
      case "about":
        return renderAboutContent();
      default:
        return null;
    }
  };

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <Image
          source={{
            uri: item.profilePicture || "https://via.placeholder.com/50",
          }}
          style={styles.memberAvatar}
        />
        <Text style={styles.memberName}>{item.displayName || "Anonymous"}</Text>
      </View>
      {userIsCreator && item.id !== auth.currentUser?.uid && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveUser(item.id)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen />
      <View style={styles.container}>
        <View style={styles.coverImageContainer}>
          <View style={styles.communityInfoOverlay}>
            <Text style={styles.communityTitle}>{title}</Text>
            <View style={styles.memberCountContainer}>
              <Ionicons name="people-outline" size={16} color="black" />
              <Text style={styles.memberCountText}>{memberCount} members</Text>
            </View>
          </View>
        </View>
        {renderTabs()}
        <View style={styles.contentContainer}>{renderContent()}</View>
      </View>

      {/* Members Modal */}
      <Modal
        visible={showUsersModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUsersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Text style={styles.modalTitle}>Community Members</Text>
                <Text style={styles.modalSubtitle}>
                  {community?.memberDetails?.length || 0} members
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowUsersModal(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {community?.isDeleted && (
              <View style={styles.modalNotice}>
                <MaterialIcons
                  name="info"
                  size={20}
                  color="#ff9500"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.modalNoticeText}>
                  This community has been deleted. You cannot add new members,
                  but you can still remove violating users.
                </Text>
              </View>
            )}
            <View style={styles.modalDivider} />
            <FlatList
              data={community?.memberDetails || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MemberItem
                  item={{
                    ...item,
                    isCreator: item.id === community?.createdBy,
                  }}
                  userIsCreator={userIsCreator}
                  currentUserId={auth.currentUser?.uid}
                  onReport={handleRemoveUser}
                />
              )}
              contentContainerStyle={styles.membersList}
              ListEmptyComponent={
                <View style={styles.emptyStateContainer}>
                  <MaterialIcons name="people-alt" size={48} color="#ddd" />
                  <Text style={styles.emptyText}>No members found</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Violation Report Modal */}
      <ViolationReportModal
        visible={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedUser(null);
        }}
        onSubmit={handleSubmitViolation}
        userName={selectedUser?.displayName || "this user"}
        loading={reportLoading}
      />
    </>
  );
}

const { width } = Dimensions.get("window");
