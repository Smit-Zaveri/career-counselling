import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { auth, db, sendMessage, subscribeToMessages } from "../firebase/config";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

const CommunityDetails = ({ params }) => {
  const { id, title, image, description } = params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    getUserData();
    checkMembership();
    const unsubscribe = subscribeToMessages(id, (updatedMessages) => {
      setMessages(updatedMessages);
    });

    return () => unsubscribe();
  }, [id]);

  const getUserData = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setUserName(userData.name);
      } else {
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

  const checkMembership = async () => {
    try {
      const docRef = doc(db, "communities", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const members = docSnap.data()?.members || [];
        setIsMember(members.includes(auth.currentUser?.uid));
      }
    } catch (error) {
      console.error("Error checking membership:", error);
    }
  };

  const toggleMembership = async () => {
    try {
      const communityRef = doc(db, "communities", id);
      if (isMember) {
        await updateDoc(communityRef, {
          members: arrayRemove(auth.currentUser.uid),
        });
      } else {
        await updateDoc(communityRef, {
          members: arrayUnion(auth.currentUser.uid),
        });
      }
      setIsMember(!isMember);
    } catch (error) {
      console.error("Error updating membership:", error);
    }
  };

  const handleSend = async () => {
    if (newMessage.trim()) {
      try {
        await sendMessage(id, newMessage, auth.currentUser);
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.userId === auth.currentUser?.uid
          ? styles.myMessage
          : styles.otherMessage,
      ]}
    >
      <Text style={styles.userName}>{item.userName}</Text>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {item.createdAt?.toDate().toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Image source={{ uri: image }} style={styles.communityImage} />
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              style={[styles.joinButton, isMember && styles.joinedButton]}
              onPress={toggleMembership}
            >
              <Text style={styles.joinButtonText}>
                {isMember ? "Leave" : "Join"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        style={styles.chatContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <AntDesign name="right" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginBottom: 85,
  },
  header: {
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  communityImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  headerInfo: {
    padding: 10,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  chatContainer: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
  },
  userName: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    alignSelf: "flex-end",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "white",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  joinButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinedButton: {
    backgroundColor: "#FF3B30",
  },
  joinButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default CommunityDetails;
