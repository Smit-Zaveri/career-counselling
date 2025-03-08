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
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const HomeWelcome = ({ userData }) => {
  const router = useRouter();
  
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

  const handleProfilePress = () => {
    router.push('profile');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, "#396AFC", "#2948ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeCard}
      >
        <View style={styles.decorativeCircle} />
        <View style={styles.decorativeCircle2} />

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
                  >
                    <LinearGradient
                      colors={[
                        "rgba(255,255,255,0.8)",
                        "rgba(255,255,255,0.5)",
                      ]}
                      style={styles.progressBarGlow}
                    />
                  </View>
                </View>
                <Text style={styles.progressPercentage}>
                  {userData?.completedProfile || 0}%
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.imageContainer} onPress={handleProfilePress}>
            {userData?.photoUrl ? (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: userData.photoUrl }}
                  style={styles.profileImage}
                />
              </View>
            ) : (
              <View style={styles.imageWrapper}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
                  style={styles.profileImagePlaceholder}
                >
                  <Icon name="person" size={32} color={COLORS.white} />
                </LinearGradient>
              </View>
            )}
            <View style={styles.imageBadge}>
              <Icon name="star" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
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
    borderRadius: SIZES.large,
    padding: SIZES.medium + 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
    position: "relative",
  },
  decorativeCircle: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.07)",
    bottom: -30,
    left: 20,
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
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  name: {
    color: COLORS.white,
    fontSize: SIZES.xLarge + 2,
    fontFamily: FONT.bold,
    marginBottom: SIZES.medium,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  profileCompletionContainer: {
    marginTop: SIZES.small,
  },
  profileCompletionText: {
    color: COLORS.white,
    fontSize: SIZES.small + 2,
    fontFamily: FONT.medium,
    marginBottom: SIZES.xSmall,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
    marginRight: SIZES.small,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    position: "relative",
    overflow: "hidden",
  },
  progressBarGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
  progressPercentage: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.medium - 1,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  imageContainer: {
    position: "relative",
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFB800",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default HomeWelcome;
