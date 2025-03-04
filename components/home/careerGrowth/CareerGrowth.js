import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { COLORS, FONT, SIZES } from "../../../constants";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;

const careerTips = [
  {
    id: "1",
    title: "Perfecting Resume",
    description: "Learn essential tips to make your resume stand out in 2023",
    icon: "document-text",
    color: ["#4158D0", "#C850C0"],
    image: require("../../../assets/images/resume_tips.png"),
    route: "chat",
    routeParams: { topic: "resume_tips" },
  },
  {
    id: "2",
    title: "Interview Preparation",
    description: "Key strategies to ace your job interviews",
    icon: "people",
    color: ["#0093E9", "#80D0C7"],
    image: require("../../../assets/images/interview_prep.png"),
    route: "chat",
    routeParams: { topic: "interview_tips" },
  },
  {
    id: "3",
    title: "Salary Negotiation",
    description: "How to negotiate the salary you deserve",
    icon: "cash",
    color: ["#8EC5FC", "#E0C3FC"],
    image: require("../../../assets/images/salary_negotiation.png"),
    route: "chat",
    routeParams: { topic: "salary_negotiation" },
  },
];

const CareerCard = ({ item, index, onPress }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.careerCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => onPress(item)}
        activeOpacity={0.95}
        style={styles.cardTouchable}
      >
        <LinearGradient
          colors={item.color}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardIconContainer}>
              <Icon name={item.icon} size={26} color="white" />
            </View>

            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <LinearGradient
              colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
              style={styles.learnMoreButton}
            >
              <Text style={styles.learnMoreText}>Learn more</Text>
              <Icon name="arrow-forward" size={16} color="white" />
            </LinearGradient>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CareerGrowth = ({ router }) => {
  const handleCardPress = (item) => {
    router.push({
      pathname: item.route,
      params: item.routeParams,
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#f9fafc", "#f8fafc"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.sectionTitle}>Career Growth</Text>
            <Text style={styles.sectionSubtitle}>
              Boost your career journey
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("career-tips")}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Icon name="arrow-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={careerTips}
        renderItem={({ item, index }) => (
          <CareerCard item={item} index={index} onPress={handleCardPress} />
        )}
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
    marginTop: SIZES.medium,
  },
  headerGradient: {
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    marginHorizontal: SIZES.medium,
    borderRadius: SIZES.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: SIZES.xLarge,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  sectionSubtitle: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.gray,
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "10",
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small - 2,
    borderRadius: SIZES.large,
  },
  viewAllText: {
    marginRight: 4,
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },
  careerList: {
    paddingLeft: SIZES.medium,
    paddingRight: SIZES.small,
    paddingVertical: SIZES.small,
  },
  careerCard: {
    width: CARD_WIDTH,
    height: 160,
    marginRight: SIZES.medium,
  },
  cardTouchable: {
    flex: 1,
    borderRadius: SIZES.medium,
    overflow: "hidden",
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
    width: 54,
    height: 54,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: SIZES.medium,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: SIZES.medium,
  },
  cardTitle: {
    fontSize: SIZES.medium + 2,
    fontFamily: FONT.bold,
    color: COLORS.white,
    marginBottom: SIZES.xSmall,
  },
  cardDescription: {
    fontSize: SIZES.small + 2,
    fontFamily: FONT.regular,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
  cardFooter: {
    alignItems: "flex-start",
  },
  learnMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small - 2,
    borderRadius: SIZES.large,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  learnMoreText: {
    fontSize: SIZES.small + 1,
    fontFamily: FONT.medium,
    color: COLORS.white,
    marginRight: SIZES.xSmall,
  },
});

export default CareerGrowth;
