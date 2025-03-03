import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { COLORS, FONT, SIZES } from "../../../constants";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - SIZES.medium * 2 - SIZES.medium) / 2;

const QuickActions = ({ router }) => {
  const actions = [
    {
      id: "career",
      title: "Career Advice",
      icon: <Icon name="chatbubbles-outline" size={24} color={COLORS.white} />,
      color: "#6C63FF",
      route: "chat",
    },
    {
      id: "jobs",
      title: "Find Jobs",
      icon: <Icon name="search" size={24} color={COLORS.white} />,
      color: "#FF6584",
      route: "job",
    },
    {
      id: "community",
      title: "Community",
      icon: <Icon name="people" size={24} color={COLORS.white} />,
      color: "#4CAF50",
      route: "community",
    },
    {
      id: "profile",
      title: "My Profile",
      icon: <Icon name="person" size={24} color={COLORS.white} />,
      color: "#FF9800",
      route: "profile",
    },
  ];

  const handleActionPress = (route) => {
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.actionsContainer}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionCard}
            onPress={() => handleActionPress(action.route)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: action.color }]}
            >
              {action.icon}
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.medium,
    paddingTop: SIZES.small,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.primary,
    marginBottom: SIZES.medium,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: CARD_WIDTH,
    height: 120,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SIZES.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  actionTitle: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium - 2,
    color: COLORS.secondary,
    textAlign: "center",
  },
});

export default QuickActions;
