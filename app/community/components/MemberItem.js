import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../constants";

const MemberItem = ({
  item,
  userIsCreator,
  currentUserId,
  onReport,
  onRemove,
}) => {
  const isCreator = item.isCreator;
  const isCurrentUser = item.id === currentUserId;

  return (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: item.profilePicture || "https://via.placeholder.com/50",
            }}
            style={styles.memberAvatar}
          />
          {isCreator && (
            <View style={styles.creatorBadge}>
              <Ionicons name="star" size={10} color="#fff" />
            </View>
          )}
          {isCurrentUser && (
            <View style={styles.currentUserBadge}>
              <Ionicons name="person" size={10} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.memberName} numberOfLines={1}>
              {item.displayName || "Anonymous"}
            </Text>
            {isCreator && <Text style={styles.creatorTag}>Creator</Text>}
            {isCurrentUser && <Text style={styles.youTag}>You</Text>}
          </View>

          {item.email && (
            <Text style={styles.memberEmail} numberOfLines={1}>
              {item.email}
            </Text>
          )}
        </View>
      </View>

      {userIsCreator && !isCurrentUser && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => (onReport ? onReport(item) : onRemove(item.id))}
        >
          <MaterialIcons name="remove-circle" size={16} color="#ff3b30" />
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "white",
  },
  memberInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  memberAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "#eee",
  },
  creatorBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "white",
  },
  currentUserBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "white",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginRight: 6,
    flex: 1,
  },
  memberEmail: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  creatorTag: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "600",
    backgroundColor: "rgba(0, 120, 255, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  youTag: {
    fontSize: 11,
    color: "#007AFF",
    fontWeight: "600",
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
    marginLeft: 6,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff0f0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffdddd",
  },
  removeButtonText: {
    color: "#ff3b30",
    fontWeight: "500",
    marginLeft: 4,
    fontSize: 13,
  },
});

export default MemberItem;
