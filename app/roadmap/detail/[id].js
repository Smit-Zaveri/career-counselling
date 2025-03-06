import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONT, SIZES, SHADOWS } from "../../../constants";
import { findRoadmapItemById } from "../../../constants/roadmapData";

const RoadmapDetail = () => {
  const { id } = useLocalSearchParams();
  const item = findRoadmapItemById(id);

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={80} color={COLORS.red} />
          <Text style={styles.errorText}>Item not found</Text>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleOpenResource = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't open the URL: ", err)
    );
  };

  // Get icon based on category (can be expanded)
  const getCategoryIcon = () => {
    const iconMap = {
      frontend: "code-slash",
      backend: "server",
      mobile: "phone-portrait",
      design: "color-palette",
      devops: "git-branch",
    };

    // Default icon if category not found
    return iconMap[item.category?.toLowerCase()] || "school";
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerTransparent: true,
          headerTintColor: COLORS.white,
        }}
      />

      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[
            item.color || COLORS.primary,
            item.color ? adjustColor(item.color, -40) : COLORS.tertiary,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={getCategoryIcon()} size={40} color={COLORS.white} />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>

          <View style={styles.headerBottom}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{item.level || "Beginner"}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="information-circle"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.sectionTitle}>Overview</Text>
            </View>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="bulb" size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Key Concepts</Text>
            </View>
            {item.concepts.map((concept, index) => (
              <View key={index} style={styles.conceptItem}>
                <View style={styles.conceptBullet}>
                  <Text style={styles.conceptBulletText}>{index + 1}</Text>
                </View>
                <Text style={styles.conceptText}>{concept}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="library" size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Learning Resources</Text>
            </View>
            {item.resources.map((resource, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resourceItem}
                onPress={() => handleOpenResource(resource.url)}
                activeOpacity={0.7}
              >
                <View style={styles.resourceContent}>
                  <View style={styles.resourceIconContainer}>
                    <Ionicons
                      name={
                        resource.type === "video"
                          ? "videocam"
                          : resource.type === "book"
                          ? "book"
                          : "document-text"
                      }
                      size={18}
                      color={COLORS.white}
                    />
                  </View>
                  <Text style={styles.resourceText}>{resource.title}</Text>
                </View>
                <View style={styles.resourceArrow}>
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color={COLORS.primary}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Utility function to darken/lighten colors
const adjustColor = (color, amount) => {
  return (
    "#" +
    color
      .replace(/^#/, "")
      .replace(/../g, (color) =>
        (
          "0" +
          Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)
        ).substr(-2)
      )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  contentContainer: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 25,
    paddingBottom: 40,
    paddingHorizontal: SIZES.large,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 28,
    color: COLORS.white,
    marginBottom: SIZES.xSmall,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.lightWhite,
  },
  headerBottom: {
    flexDirection: "row",
    marginTop: SIZES.large,
  },
  badgeContainer: {
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.xSmall,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
  },
  content: {
    marginTop: -20,
    paddingHorizontal: SIZES.medium,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: SIZES.large,
    padding: SIZES.large,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginLeft: SIZES.small,
  },
  description: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    lineHeight: 24,
  },
  conceptItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SIZES.medium,
  },
  conceptBullet: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.small,
    marginTop: 2,
  },
  conceptBulletText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.small,
    color: COLORS.white,
  },
  conceptText: {
    flex: 1,
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.secondary,
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.lightWhite,
    borderRadius: 12,
    marginBottom: SIZES.medium,
    overflow: "hidden",
    ...SHADOWS.small,
  },
  resourceContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  resourceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    margin: SIZES.small,
  },
  resourceText: {
    flex: 1,
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.secondary,
    paddingVertical: SIZES.medium,
  },
  resourceArrow: {
    padding: SIZES.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.xxLarge,
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: 18,
    color: COLORS.red,
    textAlign: "center",
    marginTop: SIZES.medium,
    marginBottom: SIZES.large,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.large,
    borderRadius: SIZES.medium,
    ...SHADOWS.small,
  },
  backButtonText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
});

export default RoadmapDetail;
