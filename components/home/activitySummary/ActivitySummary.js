import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { COLORS, FONT, SIZES } from "../../../constants";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const ActivitySummary = ({ userData, router }) => {
  // Format user activity data or use defaults
  const applications = userData?.applications?.length || 0;
  const savedJobs = userData?.savedJobs?.length || 0;
  const interviews = userData?.interviews?.length || 0;
  const viewedProfile = userData?.profileViews || 0;

  // Animation values for metrics
  const scaleAnim1 = React.useRef(new Animated.Value(0.6)).current;
  const scaleAnim2 = React.useRef(new Animated.Value(0.6)).current;
  const scaleAnim3 = React.useRef(new Animated.Value(0.6)).current;
  const scaleAnim4 = React.useRef(new Animated.Value(0.6)).current;

  React.useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(scaleAnim1, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim2, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim3, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim4, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Define activity metrics with enhanced styling
  const activityMetrics = [
    {
      id: "applications",
      title: "Applications",
      icon: <Icon name="document-text" size={22} color={COLORS.white} />,
      value: applications,
      gradientColors: ["#4CAF50", "#388E3C", "#2E7D32"],
      route: "applications",
      animation: scaleAnim1,
    },
    {
      id: "saved",
      title: "Saved Jobs",
      icon: <Icon name="bookmark" size={22} color={COLORS.white} />,
      value: savedJobs,
      gradientColors: ["#2196F3", "#1E88E5", "#1976D2"],
      route: "saved-jobs",
      animation: scaleAnim2,
    },
    {
      id: "interviews",
      title: "Interviews",
      icon: (
        <MaterialCommunityIcons
          name="calendar-clock"
          size={22}
          color={COLORS.white}
        />
      ),
      value: interviews,
      gradientColors: ["#FF9800", "#FB8C00", "#F57C00"],
      route: "interviews",
      animation: scaleAnim3,
    },
    {
      id: "views",
      title: "Profile Views",
      icon: <Icon name="eye" size={22} color={COLORS.white} />,
      value: viewedProfile,
      gradientColors: ["#9C27B0", "#8E24AA", "#7B1FA2"],
      route: "profile-analytics",
      animation: scaleAnim4,
    },
  ];

  const handleMetricPress = (route) => {
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Your Activity</Text>
      </View>

      <View style={styles.metricsContainer}>
        {activityMetrics.map((metric) => (
          <Animated.View
            key={metric.id}
            style={[
              styles.metricCardWrapper,
              {
                opacity: metric.animation,
                transform: [{ scale: metric.animation }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => handleMetricPress(metric.route)}
              activeOpacity={0.9}
            >
              <View style={styles.cardBackground}>
                <View style={styles.decorCircle} />
                <View style={[styles.decorDot, { top: "60%", left: "15%" }]} />
                <View style={[styles.decorDot, { top: "20%", right: "15%" }]} />
              </View>

              <View style={styles.metricContent}>
                <View style={styles.iconWrapper}>
                  <LinearGradient
                    colors={metric.gradientColors}
                    style={styles.iconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {metric.icon}
                  </LinearGradient>
                </View>

                <View style={styles.metricInfo}>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                  <Text style={styles.metricTitle}>{metric.title}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SIZES.large,
    paddingHorizontal: SIZES.medium,
    paddingBottom: SIZES.medium,
  },
  headerContainer: {
    marginBottom: SIZES.medium + 4,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCardWrapper: {
    width: (width - SIZES.medium * 2 - SIZES.medium) / 2,
    marginBottom: SIZES.medium,
    height: 130,
  },
  metricCard: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.large,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  cardBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorCircle: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.02)",
    bottom: -30,
    right: -30,
  },
  decorDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  metricContent: {
    padding: SIZES.medium,
    flex: 1,
    justifyContent: "space-between",
  },
  iconWrapper: {
    alignSelf: "flex-start",
    marginBottom: SIZES.small / 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  metricInfo: {
    alignItems: "flex-start",
  },
  metricValue: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.secondary,
    marginBottom: 2,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  metricTitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 2,
    color: COLORS.gray,
  },
});

export default ActivitySummary;
