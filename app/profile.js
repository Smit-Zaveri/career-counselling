import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS, FONT, SIZES, SHADOWS } from "../constants";

const ProfileScreen = () => {
  const router = useRouter();
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const scaleValue = new Animated.Value(1);

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

  // Example user data
  const user = {
    fullName: "Itunuoluwa Abidoye",
    handle: "@itunuoluwa",
    avatarUrl: "https://placehold.co/100x100?text=Avatar",
  };

  const onToggleFaceId = () => {
    setFaceIdEnabled(!faceIdEnabled);
  };

  const goToEditProfile = () => {
    router.push("EditProfileScreen");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header / User Info */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image surce={{ uri: user.avatarUrl }} style={styles.aatar} />
            <View style={styles.nameContainer}>
              <Text style={styles.fullName}>{user.fullName}</Text>
              <Text style={styles.handle}>{user.handle}</Text>
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
          <TouchableOpacity style={styles.optionRow}>
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
    </View>
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
