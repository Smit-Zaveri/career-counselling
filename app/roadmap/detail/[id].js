import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONT, SIZES, SHADOWS } from "../../../constants";
import { findRoadmapItemById } from "../../../constants/roadmapData";

const RoadmapDetail = () => {
  const { id } = useLocalSearchParams();
  const item = findRoadmapItemById(id);

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Item not found</Text>
      </SafeAreaView>
    );
  }

  const handleOpenResource = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't open the URL: ", err)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Topic Details",
        }}
      />

      <ScrollView style={styles.contentContainer}>
        <View
          style={[
            styles.header,
            { backgroundColor: item.color || COLORS.primary },
          ]}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Concepts</Text>
          {item.concepts.map((concept, index) => (
            <View key={index} style={styles.conceptItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.conceptText}>{concept}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Resources</Text>
          {item.resources.map((resource, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resourceItem}
              onPress={() => handleOpenResource(resource.url)}
            >
              <Ionicons name="link" size={18} color={COLORS.primary} />
              <Text style={styles.resourceText}>{resource.title}</Text>
              <Ionicons name="open-outline" size={16} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginBottom: 70,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    padding: SIZES.large,
    borderBottomLeftRadius: SIZES.medium,
    borderBottomRightRadius: SIZES.medium,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.white,
    marginBottom: SIZES.small,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.lightWhite,
  },
  section: {
    padding: SIZES.large,
    marginBottom: SIZES.small,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginBottom: SIZES.medium,
  },
  description: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.secondary,
    lineHeight: 24,
  },
  conceptItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  conceptText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.secondary,
    marginLeft: SIZES.small,
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.small,
    backgroundColor: COLORS.lightWhite,
    borderRadius: SIZES.small,
    marginBottom: SIZES.small,
    ...SHADOWS.small,
  },
  resourceText: {
    flex: 1,
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginLeft: SIZES.small,
    marginRight: SIZES.small,
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.large,
    color: COLORS.red,
    textAlign: "center",
    marginTop: SIZES.xxLarge,
  },
});

export default RoadmapDetail;
