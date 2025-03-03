import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { COLORS, FONT, SIZES } from "../../../constants";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.7;

const CareerGrowth = ({ router }) => {
  const careerTips = [
    {
      id: "1",
      title: "Perfecting Your Resume",
      description: "Learn essential tips to make your resume stand out in 2023",
      icon: "document-text",
      color: ["#FF9800", "#F57C00"],
      image: require("../../../assets/images/resume_tips.png"),
      route: "chat",
      routeParams: { topic: "resume_tips" },
    },
    {
      id: "2",
      title: "Interview Preparation",
      description: "Key strategies to ace your job interviews",
      icon: "people",
      color: ["#4CAF50", "#388E3C"],
      image: require("../../../assets/images/interview_prep.png"),
      route: "chat",
      routeParams: { topic: "interview_tips" },
    },
    {
      id: "3",
      title: "Salary Negotiation",
      description: "How to negotiate the salary you deserve",
      icon: "cash",
      color: ["#2196F3", "#1976D2"],
      image: require("../../../assets/images/salary_negotiation.png"),
      route: "chat",
      routeParams: { topic: "salary_negotiation" },
    },
  ];

  const handleCardPress = (item) => {
    router.push({
      pathname: item.route,
      params: item.routeParams,
    });
  };

  const renderCareerCard = ({ item }) => (
    <TouchableOpacity
      style={styles.careerCard}
      onPress={() => handleCardPress(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={item.color}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardIconContainer}>
            <Icon name={item.icon} size={24} color="white" />
          </View>

          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.learnMoreText}>Learn more</Text>
          <MaterialIcons name="arrow-forward" size={16} color="white" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Career Growth</Text>
        <TouchableOpacity onPress={() => router.push("career-tips")}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={careerTips}
        renderItem={renderCareerCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.careerList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SIZES.small,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.medium,
    marginBottom: SIZES.small,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  seeAllText: {
    fontSize: SIZES.medium - 2,
    fontFamily: FONT.medium,
    color: COLORS.tertiary,
  },
  careerList: {
    paddingLeft: SIZES.medium,
    paddingRight: SIZES.small,
    paddingBottom: SIZES.small,
  },
  careerCard: {
    width: CARD_WIDTH,
    height: 150,
    marginRight: SIZES.medium,
    borderRadius: SIZES.medium,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardGradient: {
    flex: 1,
    padding: SIZES.medium,
    justifyContent: "space-between",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: SIZES.medium,
  },
  cardTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.white,
    marginBottom: SIZES.xSmall,
  },
  cardDescription: {
    fontSize: SIZES.small + 2,
    fontFamily: FONT.regular,
    color: "rgba(255, 255, 255, 0.9)",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  learnMoreText: {
    fontSize: SIZES.medium - 2,
    fontFamily: FONT.medium,
    color: COLORS.white,
    marginRight: SIZES.xSmall,
  },
});

export default CareerGrowth;
