import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Animated,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS, FONT, SIZES, SHADOWS } from "../constants";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/config"; // Add db to the import
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";

const ProfileScreen = () => {
  const router = useRouter();
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const scaleValue = new Animated.Value(1);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const userData = {
          name: data.name,
          email: auth.currentUser.email,
          photoUrl: data.photoUrl,
          createdAt: data.createdAt,
          // Add any other fields you want to display
        };

        // Store in local storage for faster access
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        setUserData(userData);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // Fallback to local storage if Firebase fetch fails
      const storedData = await AsyncStorage.getItem("userData");
      if (storedData) {
        setUserData(JSON.parse(storedData));
      }
    }
  };

  const navigateWithAnimation = (screenName) => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => router.push(screenName));
  };

  const onToggleFaceId = () => {
    setFaceIdEnabled(!faceIdEnabled);
  };

  const goToEditProfile = () => {
    router.push("EditProfileScreen");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear all stored data
      await AsyncStorage.multiRemove([
        "user",
        "isLoggedIn",
        "hasCompletedQuestions",
        "userName",
      ]);
      router.replace("login");
    } catch (error) {
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header / User Info */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            {userData?.photoUrl ? (
              <Image
                source={{ uri: userData.photoUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="person" size={30} color={COLORS.white} />
              </View>
            )}
            <View style={styles.nameContainer}>
              <Text style={styles.fullName}>
                {userData?.name || "User Name"}
              </Text>
              <Text style={styles.handle}>{userData?.email || ""}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editIcon} onPress={goToEditProfile}>
            <Icon name="pencil" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          {/* My Account */}
          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Icon
                name="person-circle-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.optionText}>My Account</Text>
            </View>
            {/* Alert icon if needed */}
            <Icon name="alert-circle" size={20} color="red" />
          </TouchableOpacity>

          {/* Saved Beneficiary */}
          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Icon name="people-outline" size={24} color={COLORS.primary} />
              <Text style={styles.optionText}>Saved Beneficiary</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Face ID / Touch ID */}
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Icon
                name="finger-print-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.optionText}>Face ID / Touch ID</Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: COLORS.primary }}
              thumbColor={faceIdEnabled ? COLORS.white : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={onToggleFaceId}
              value={faceIdEnabled}
            />
          </View>

          {/* Two-Factor Authentication */}
          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Icon
                name="shield-checkmark-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.optionText}>Two-Factor Authentication</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Log out */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => {
              Alert.alert("Logout", "Are you sure you want to logout?", [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", onPress: handleLogout, style: "destructive" },
              ]);
            }}
          >
            <View style={styles.optionLeft}>
              <Icon name="log-out-outline" size={24} color={COLORS.primary} />
              <Text style={styles.optionText}>Log out</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        {/* More Section */}
        <View style={styles.moreContainer}>
          <Text style={styles.moreHeading}>More</Text>
          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Icon
                name="help-circle-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.optionText}>Help & Support</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Icon
                name="information-circle-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.optionText}>About App</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: COLORS.primary, // or your preferred color
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.gray2,
    justifyContent: "center",
    alignItems: "center",
  },
  nameContainer: {
    flexDirection: "column",
  },
  fullName: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    marginBottom: 2,
  },
  handle: {
    color: COLORS.white,
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
  },
  editIcon: {
    padding: 6,
  },
  optionsContainer: {
    marginTop: 10,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray2,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    marginLeft: 8,
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.primary,
  },
  moreContainer: {
    marginTop: 20,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 8,
  },
  moreHeading: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.primary,
    marginBottom: 10,
    marginLeft: 4,
  },
});
