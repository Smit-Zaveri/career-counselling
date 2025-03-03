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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

const ActivitySummary = ({ userData, router }) => {
  // Format user activity data or use defaults
  const applications = userData?.applications?.length || 0;
  const savedJobs = userData?.savedJobs?.length || 0;
  const interviews = userData?.interviews?.length || 0;
  const viewedProfile = userData?.profileViews || 0;

  // Define activity metrics
  const activityMetrics = [
    {
      id: "applications",
      title: "Applications",
      icon: <Icon name="document-text" size={20} color={COLORS.white} />,
      value: applications,
      backgroundColor: "#4CAF50",
      route: "applications",
    },
    {
      id: "saved",
      title: "Saved Jobs",
      icon: <Icon name="bookmark" size={20} color={COLORS.white} />,
      value: savedJobs,
      backgroundColor: "#2196F3",
      route: "saved-jobs",
    },
    {
      id: "interviews",
      title: "Interviews",
      icon: (
        <MaterialCommunityIcons
          name="calendar-clock"
          size={20}
          color={COLORS.white}
        />
      ),
      value: interviews,
      backgroundColor: "#FF9800",
      route: "interviews",
    },
    {
      id: "views",
      title: "Profile Views",
      icon: <Icon name="eye" size={20} color={COLORS.white} />,
      value: viewedProfile,
      backgroundColor: "#9C27B0",
      route: "profile-analytics",
    },
  ];

  const handleMetricPress = (route) => {
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Activity</Text>

      <View style={styles.metricsContainer}>
        {activityMetrics.map((metric) => (
          <TouchableOpacity
            key={metric.id}
            style={styles.metricCard}
            onPress={() => handleMetricPress(metric.route)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: metric.backgroundColor },
              ]}
            >
              {metric.icon}
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricTitle}>{metric.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.activityButton}
        onPress={() => router.push("activity")}
        activeOpacity={0.8}
      >
        <Text style={styles.activityButtonText}>View Full Activity</Text>
        <Icon name="arrow-forward" size={16} color={COLORS.tertiary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SIZES.large,
    paddingHorizontal: SIZES.medium,
    paddingBottom: SIZES.medium,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.primary,
    marginBottom: SIZES.medium,
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: (width - SIZES.medium * 2 - SIZES.small) / 2,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  metricValue: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.secondary,
    marginBottom: SIZES.xSmall / 2,
  },
  metricTitle: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small + 2,
    color: COLORS.gray,
    textAlign: "center",
  },
  activityButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(4, 96, 217, 0.1)",
    borderRadius: SIZES.small,
    padding: SIZES.medium,
    marginTop: SIZES.small,
  },
  activityButtonText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium - 2,
    color: COLORS.tertiary,
    marginRight: SIZES.small,
  },
});

export default ActivitySummary;
