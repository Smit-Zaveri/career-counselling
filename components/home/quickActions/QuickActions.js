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
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { LinearGradient } from "expo-linear-gradient";
import { MaskedView } from "@react-native-masked-view/masked-view";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - SIZES.medium * 2 - SIZES.medium) / 2;

const QuickActions = ({ router }) => {
  // Animation values for staggered card animations
  const fadeAnim1 = React.useRef(new Animated.Value(0)).current;
  const fadeAnim2 = React.useRef(new Animated.Value(0)).current;
  const fadeAnim3 = React.useRef(new Animated.Value(0)).current;
  const fadeAnim4 = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.stagger(100, [
      Animated.spring(fadeAnim1, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(fadeAnim2, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(fadeAnim3, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(fadeAnim4, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const actions = [
    {
      id: "career",
      title: "Career Advice",
      icon: <Icon name="chatbubbles-outline" size={24} color={COLORS.white} />,
      gradientColors: ["#6C63FF", "#574adb"],
      route: "chat",
      animation: fadeAnim1,
      iconShape: "circle",
    },
    {
      id: "jobs",
      title: "Find Jobs",
      icon: <Icon name="search" size={24} color={COLORS.white} />,
      gradientColors: ["#FF6584", "#ec3b63"],
      route: "job",
      animation: fadeAnim2,
      iconShape: "diamond",
    },
    {
      id: "community",
      title: "Community",
      icon: <Icon name="people" size={24} color={COLORS.white} />,
      gradientColors: ["#4CAF50", "#388E3C"],
      route: "community",
      animation: fadeAnim3,
      iconShape: "hexagon",
    },
    {
      id: "session",
      title: "Session",
      icon: <Icon name="person" size={24} color={COLORS.white} />,
      gradientColors: ["#FF9800", "#F57C00"],
      route: "session",
      animation: fadeAnim4,
      iconShape: "square",
    },
  ];

  const handleActionPress = (route) => {
    router.push(route);
  };

  const renderIconShape = (shape, colors, icon) => {
    switch (shape) {
      case "diamond":
        return (
          <View style={styles.iconShapeWrapper}>
            <LinearGradient
              colors={colors}
              style={[styles.iconContainer, styles.diamondShape]}
            >
              {icon}
            </LinearGradient>
            <View style={styles.iconShadow} />
          </View>
        );
      case "hexagon":
        return (
          <View style={styles.iconShapeWrapper}>
            <LinearGradient
              colors={colors}
              style={[styles.iconContainer, styles.hexagonShape]}
            >
              {icon}
            </LinearGradient>
            <View style={styles.iconShadow} />
          </View>
        );
      case "square":
        return (
          <View style={styles.iconShapeWrapper}>
            <LinearGradient
              colors={colors}
              style={[styles.iconContainer, styles.squareShape]}
            >
              {icon}
            </LinearGradient>
            <View style={styles.iconShadow} />
          </View>
        );
      default:
        return (
          <View style={styles.iconShapeWrapper}>
            <LinearGradient
              colors={colors}
              style={[styles.iconContainer, styles.circleShape]}
            >
              {icon}
            </LinearGradient>
            <View style={styles.iconShadow} />
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>

      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <Animated.View
            key={action.id}
            style={[
              styles.cardAnimationWrapper,
              {
                opacity: action.animation,
                transform: [
                  {
                    translateY: action.animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                  { scale: action.animation },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleActionPress(action.route)}
              activeOpacity={0.9}
            >
              <View style={styles.cardInner}>
                {renderIconShape(
                  action.iconShape,
                  action.gradientColors,
                  action.icon
                )}

                <View style={styles.titleWrapper}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <View style={styles.arrowContainer}>
                    <LinearGradient
                      colors={action.gradientColors}
                      style={styles.arrowBackground}
                    >
                      <Icon name="chevron-forward" size={14} color="#fff" />
                    </LinearGradient>
                  </View>
                </View>
              </View>

              <View style={styles.glassEffect} />
              <View
                style={[
                  styles.cardDecoration,
                  { backgroundColor: action.gradientColors[0] },
                ]}
              />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.medium,
    paddingTop: SIZES.small,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.medium + 4,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardAnimationWrapper: {
    width: CARD_WIDTH,
    height: 130,
    marginBottom: SIZES.medium + 4,
  },
  actionCard: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.large,
    padding: SIZES.medium,
    position: "relative",
    overflow: "hidden",
    // shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  cardInner: {
    height: "100%",
    justifyContent: "space-between",
    zIndex: 2,
  },
  iconShapeWrapper: {
    position: "relative",
    marginBottom: SIZES.small,
    alignSelf: "flex-start",
  },
  iconContainer: {
    width: 54,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
  },
  circleShape: {
    borderRadius: 27,
  },
  diamondShape: {
    borderRadius: 27,
  },
  hexagonShape: {
    borderRadius: 27,
  },
  squareShape: {
    borderRadius: 27,
  },
  iconShadow: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 54,
    height: 54,
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: -1,
    borderRadius: 27, // Default circle shadow
  },
  glassEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderTopLeftRadius: SIZES.large,
    borderTopRightRadius: SIZES.large,
  },
  cardDecoration: {
    position: "absolute",
    top: -15,
    right: -15,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.15,
    zIndex: 0,
  },
  titleWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.secondary,
    textAlign: "left",
  },
  arrowContainer: {
    marginLeft: SIZES.small,
  },
  arrowBackground: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default QuickActions;
