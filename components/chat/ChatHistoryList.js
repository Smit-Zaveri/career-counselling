import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../constants";
import { formatRelativeTime } from "../../utils/dateUtils";

const ChatHistoryList = ({
  chatSessions,
  onSelectChat,
  onNewChat,
  onDeleteChat, // Add this prop
  isLoading,
  currentChatId,
}) => {
  const confirmDelete = (chatId, chatTitle) => {
    Alert.alert(
      "Delete Chat",
      `Are you sure you want to delete "${chatTitle || "this conversation"}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDeleteChat(chatId),
        },
      ]
    );
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.chatItem,
        currentChatId === item.id && styles.activeChatItem,
      ]}
      onPress={() => onSelectChat(item.id)}
    >
      <Ionicons
        name="chatbubble-ellipses-outline"
        size={24}
        color={COLORS.tertiary}
        style={styles.chatIcon}
      />
      <View style={styles.chatDetails}>
        <Text style={styles.chatTitle} numberOfLines={1} ellipsizeMode="tail">
          {item.title || "New Conversation"}
        </Text>
        <Text style={styles.chatTime}>
          {formatRelativeTime(item.updatedAt)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          confirmDelete(item.id, item.title);
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name="trash-outline"
          size={20}
          color={COLORS.error || "#ff3b30"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat History</Text>
          <TouchableOpacity style={styles.newChatButton} onPress={onNewChat}>
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading conversations...</Text>
          </View>
        ) : chatSessions.length > 0 ? (
          <FlatList
            data={chatSessions}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversation history yet</Text>
            <TouchableOpacity
              style={styles.startChatButton}
              onPress={onNewChat}
            >
              <Text style={styles.startChatText}>Start a new chat</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray2,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  newChatButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: SIZES.small,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.small,
    padding: SIZES.medium,
    marginBottom: SIZES.small,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  activeChatItem: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  chatIcon: {
    marginRight: SIZES.small,
  },
  chatDetails: {
    flex: 1,
  },
  chatTitle: {
    fontSize: SIZES.medium,
    fontWeight: "500",
    color: COLORS.tertiary,
  },
  chatTime: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.large,
  },
  emptyText: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginBottom: SIZES.medium,
    textAlign: "center",
  },
  startChatButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
  },
  startChatText: {
    color: COLORS.white,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SIZES.small,
    color: COLORS.gray,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatHistoryList;
