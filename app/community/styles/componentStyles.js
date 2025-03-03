import { StyleSheet } from "react-native";
import { COLORS } from "../../../constants";

export const styles = StyleSheet.create({
  // Member Item styles
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  memberName: {
    fontSize: 16,
    color: "#333",
  },
  creatorTag: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
    marginTop: 2,
  },
  removeButton: {
    backgroundColor: "#ffebeb",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#ff3b30",
    fontWeight: "500",
  },
});
