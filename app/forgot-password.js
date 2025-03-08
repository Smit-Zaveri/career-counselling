import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS, FONT, SIZES } from "../constants";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import CustomModal from "../components/common/CustomModal";

const { width } = Dimensions.get("window");

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    message: "",
    type: "error",
    onButtonPress: null,
  });

  const showModal = (title, message, type = "error", onButtonPress = null) => {
    setModalData({
      title,
      message,
      type,
      onButtonPress,
    });
    setModalVisible(true);
  };

  const handleResetPassword = async () => {
    if (!email) {
      showModal("Input Error", "Please enter your email");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showModal(
        "Success",
        "Password reset email sent. Please check your inbox.",
        "success",
        () => router.push("login")
      );
    } catch (error) {
      showModal("Reset Failed", error.message);
    }
  };

  return (
    <LinearGradient
      colors={["#f0f8ff", "#e6f2ff", "#d9eaff"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.innerContainer}>
            <View style={styles.companyContainer}>
                                      <View style={styles.logoContainer}>
                                        
                                          <Image
                                            source={require("../assets/images/logo.png")}
                                            style={styles.logoImage}
                                          />
                                      </View>
                                      <View style={styles.companyNameContainer}>
                                        <Text style={styles.companyNameFirst}>Career</Text>
                                        <Text style={styles.companyNameSecond}>Conn</Text>
                                        <Text style={styles.companyNameThird}>ect</Text>
                                      </View>
                                      <Text style={styles.companyTagline}>
                                      Where Dreams Inspire the Future
                                      </Text>
                                    </View>

            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  Enter your email to receive reset instructions
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <MaterialIcons name="email" size={20} color={COLORS.gray} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor={COLORS.gray2}
                    />
                  </View>
                </View>

                <TouchableOpacity onPress={handleResetPassword}>
                  <LinearGradient
                    colors={[COLORS.primary, "#4080ff"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.resetButton}
                  >
                    <Text style={styles.resetButtonText}>Reset Password</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButtonContainer}
                  onPress={() => router.back()}
                >
                  <MaterialIcons
                    name="arrow-back"
                    size={18}
                    color={COLORS.tertiary}
                    style={styles.backIcon}
                  />
                  <Text style={styles.backButtonText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.decorationCircle1} />
            <View style={styles.decorationCircle2} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Custom Modal */}
      <CustomModal
        visible={modalVisible}
        title={modalData.title}
        message={modalData.message}
        type={modalData.type}
        onClose={() => setModalVisible(false)}
        onButtonPress={modalData.onButtonPress}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: SIZES.large,
    position: "relative",
  },
  decorationCircle1: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(128, 170, 255, 0.2)",
    position: "absolute",
    top: -50,
    right: -50,
    zIndex: -1,
  },
  decorationCircle2: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(128, 170, 255, 0.15)",
    position: "absolute",
    bottom: -20,
    left: -20,
    zIndex: -1,
  },
  companyContainer: {
    alignItems: "center",
    marginBottom: SIZES.xLarge * 2,
  },
  logoContainer: {
    marginBottom: SIZES.medium,
  },
  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 65,
    justifyContent: "center",
    alignItems: "center",
  },
  companyNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  companyNameFirst: {
    fontFamily: FONT.bold,
    fontSize: 35,
    color: "#312651",
    letterSpacing: 1,
  },
  companyNameSecond: {
    fontFamily: FONT.bold,
    fontSize: 35,
    color: "#72bb9d",
    letterSpacing: 1,
  },
  companyNameThird: {
    fontFamily: FONT.bold,
    fontSize: 35,
    color: "#e99841",
    letterSpacing: 1,
  },
  companyTagline: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: SIZES.xSmall / 2,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.large,
    padding: SIZES.large,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  formHeader: {
    alignItems: "center",
    marginBottom: SIZES.large,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.primary,
    marginBottom: SIZES.xSmall / 2,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    textAlign: "center",
  },
  form: {
    gap: SIZES.medium,
  },
  inputContainer: {
    marginVertical: SIZES.small,
  },
  inputIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightWhite,
    borderRadius: SIZES.small,
    borderWidth: 1,
    borderColor: COLORS.gray2,
    paddingHorizontal: SIZES.medium,
  },
  input: {
    flex: 1,
    fontFamily: FONT.regular,
    padding: SIZES.medium,
    color: COLORS.gray,
  },
  resetButton: {
    padding: SIZES.medium,
    borderRadius: SIZES.medium,
    alignItems: "center",
    marginTop: SIZES.medium,
  },
  resetButtonText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
  },
  backButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SIZES.large,
    alignSelf: "center",
  },
  backIcon: {
    marginRight: SIZES.xSmall,
  },
  backButtonText: {
    color: COLORS.tertiary,
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
  },
});

export default ForgotPassword;
