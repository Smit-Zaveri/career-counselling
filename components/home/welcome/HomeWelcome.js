import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { COLORS, FONT, SIZES } from "../../../constants";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

const HomeWelcome = ({ userData }) => {
  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Get first name only
  const getFirstName = () => {
    if (!userData || !userData.name) return "there";
    return userData.name.split(" ")[0];
  };

  // Format profile completion as text
  const getProfileCompletionText = () => {
    const completion = userData?.completedProfile || 0;
    if (completion < 50) return "Let's complete your profile!";
    if (completion < 85) return "Your profile is coming along nicely!";
    if (completion < 100) return "Your profile is almost complete!";
    return "Your profile is 100% complete!";
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, "#396AFC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.welcomeCard}
      >
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{getFirstName()}</Text>

            <View style={styles.profileCompletionContainer}>
              <Text style={styles.profileCompletionText}>
                {getProfileCompletionText()}
              </Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${userData?.completedProfile || 0}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressPercentage}>
                  {userData?.completedProfile || 0}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.imageContainer}>
            {userData?.photoUrl ? (
              <Image
                source={{ uri: userData.photoUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Icon name="person" size={30} color={COLORS.white} />
              </View>
            )}
            <View style={styles.imageBadge}>
              <Icon name="star" size={14} color="#FFF" />
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.small,
    paddingBottom: SIZES.small / 2,
  },
  welcomeCard: {
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
  },
  name: {
    color: COLORS.white,
    fontSize: SIZES.xLarge,
    fontFamily: FONT.bold,
    marginBottom: SIZES.medium,
  },
  profileCompletionContainer: {
    marginTop: SIZES.small,
  },
  profileCompletionText: {
    color: COLORS.white,
    fontSize: SIZES.small + 2,
    fontFamily: FONT.medium,
    marginBottom: SIZES.xSmall,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    marginRight: SIZES.small,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
  progressPercentage: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.small + 2,
  },
  imageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  profileImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  imageBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFB800",
    width: 25,
    height: 25,
    borderRadius: 12.5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});

export default HomeWelcome;
