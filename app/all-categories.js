import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from "react-native";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS } from "../constants";
import { ScreenHeaderBtn } from "../components";
import { getJobCategories } from "../firebase/jobServices";

const AllCategories = () => {
  const router = useRouter();
  const params = useSearchParams();
  const { title = "All Categories" } = params;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const categoryColors = [
    "#6C63FF",
    "#FF6584",
    "#38E54D",
    "#FF7F50",
    "#4B7BE5",
    "#F24976",
    "#FF9E00",
    "#8250DF",
    "#E35D6A",
    "#40B5AD",
    "#8E44AD",
    "#F1C40F",
  ];

  const categoryIcons = [
    "laptop-outline",
    "business-outline",
    "cash-outline",
    "medkit-outline",
    "code-slash-outline",
    "briefcase-outline",
    "cart-outline",
    "construct-outline",
    "school-outline",
    "fitness-outline",
    "restaurant-outline",
    "car-outline",
  ];

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const categoriesData = await getJobCategories();

      // Add colors and icons to categories
      const enhancedCategories = categoriesData.map((category, index) => ({
        ...category,
        color: categoryColors[index % categoryColors.length],
        icon: categoryIcons[index % categoryIcons.length],
      }));

      setCategories(enhancedCategories);
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  }, [fetchCategories]);

  const handleCategoryPress = useCallback(
    (category) => {
      router.push({
        pathname: `/category/${category.id}`,
        params: {
          categoryName: category.name,
          categoryId: category.id,
        },
      });
    },
    [router]
  );

  const renderCategoryCard = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(item)}
      >
        <View
          style={[
            styles.categoryIconContainer,
            { backgroundColor: item.color },
          ]}
        >
          <Ionicons name={item.icon || "grid-outline"} size={26} color="#FFF" />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.jobCount}>{item.jobCount || 0} jobs</Text>
      </TouchableOpacity>
    ),
    [handleCategoryPress]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          headerTitle: title,
          headerTitleStyle: {
            color: COLORS.primary,
            fontWeight: "bold",
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <ScreenHeaderBtn
              marginHorizontal={10}
              iconUrl={require("../assets/icons/left.png")}
              dimension="60%"
              handlePress={() => router.back()}
            />
          ),
        }}
      />

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={50} color={COLORS.red} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchCategories}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryCard}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Ionicons name="grid-outline" size={60} color={COLORS.gray} />
              <Text style={styles.emptyStateText}>No categories found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.large,
  },
  loadingText: {
    marginTop: SIZES.medium,
    color: COLORS.secondary,
    fontSize: SIZES.medium,
  },
  errorText: {
    marginTop: SIZES.medium,
    color: COLORS.red,
    fontSize: SIZES.medium,
    textAlign: "center",
  },
  retryButton: {
    marginTop: SIZES.medium,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: SIZES.small,
  },
  retryText: {
    color: COLORS.white,
    fontSize: SIZES.medium - 2,
    fontWeight: "bold",
  },
  listContainer: {
    padding: SIZES.medium,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    margin: 8,
    alignItems: "center",
    ...SHADOWS.small,
    maxWidth: "46%",
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  categoryName: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: SIZES.small,
  },
  jobCount: {
    fontSize: SIZES.small + 2,
    color: COLORS.gray,
    marginTop: SIZES.small - 2,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.xxLarge,
  },
  emptyStateText: {
    marginTop: SIZES.medium,
    color: COLORS.gray,
    fontSize: SIZES.medium,
    textAlign: "center",
  },
});

export default AllCategories;
