import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { COLORS, FONT, SIZES } from "../constants";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import CustomModal from "../components/common/CustomModal";

const { width } = Dimensions.get("window");

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    message: "",
    type: "error",
    onButtonPress: null,
    showSecondaryButton: false,
    secondaryButtonText: "",
    onSecondaryButtonPress: null,
  });

  const showModal = (
    title,
    message,
    type = "error",
    onButtonPress = null,
    showSecondaryButton = false,
    secondaryButtonText = "",
    onSecondaryButtonPress = null
  ) => {
    setModalData({
      title,
      message,
      type,
      onButtonPress,
      showSecondaryButton,
      secondaryButtonText,
      onSecondaryButtonPress,
    });
    setModalVisible(true);
  };

  const navigateToRegister = () => {
    // Navigate to register and pass the email as a param
    router.push({
      pathname: "register",
      params: { email: email },
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showModal("Input Error", "Please fill in all fields");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Store auth user data
      await AsyncStorage.setItem(
        "authUser",
        JSON.stringify(userCredential.user)
      );

      // Get and store Firestore user data separately
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (userDoc.exists()) {
        await AsyncStorage.setItem("userData", JSON.stringify(userDoc.data()));
      }

      await AsyncStorage.setItem("isLoggedIn", "true");

      if (userDoc.exists() && userDoc.data().questionsAnswered) {
        router.replace("home");
      } else {
        router.replace("question");
      }
    } catch (error) {
      console.log("Login error code:", error.code);

      // Check if the error is about user not found
      if (error.code === "auth/user-not-found") {
        showModal(
          "Account Not Found",
          `No account exists with email ${email}. Would you like to create an account?`,
          "info",
          null,
          true,
          "Create Account",
          navigateToRegister
        );
      } else if (error.code === "auth/wrong-password") {
        showModal("Login Error", "Incorrect password. Please try again.");
      } else {
        showModal("Login Failed", error.message);
      }
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
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>
                  Sign in to continue your journey
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

                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <MaterialIcons name="lock" size={20} color={COLORS.gray} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholderTextColor={COLORS.gray2}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <MaterialIcons
                        name={showPassword ? "visibility" : "visibility-off"}
                        size={20}
                        color={COLORS.gray}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => router.push("forgot-password")}
                >
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogin}>
                  <LinearGradient
                    colors={[COLORS.primary, "#4080ff"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginButton}
                  >
                    <Text style={styles.loginButtonText}>Login</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("register")}>
                  <Text style={styles.registerLink}>Register</Text>
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
        buttonText="Cancel"
        showSecondaryButton={modalData.showSecondaryButton}
        secondaryButtonText={modalData.secondaryButtonText}
        onSecondaryButtonPress={modalData.onSecondaryButtonPress}
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
    marginBottom: SIZES.medium,
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
    marginBottom: SIZES.medium,
  },
  form: {
    gap: SIZES.medium,
  },
  inputContainer: {
    marginVertical: SIZES.xSmall / 2,
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
  eyeIcon: {
    padding: SIZES.xSmall,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: SIZES.xSmall / 2,
  },
  forgotPasswordText: {
    color: COLORS.tertiary,
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
  },
  loginButton: {
    padding: SIZES.medium,
    borderRadius: SIZES.medium,
    alignItems: "center",
    marginTop: SIZES.small,
  },
  loginButtonText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SIZES.large,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray2,
  },
  dividerText: {
    paddingHorizontal: SIZES.medium,
    color: COLORS.gray,
    fontFamily: FONT.medium,
  },
  socialLoginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: SIZES.large,
    gap: SIZES.large,
  },
  socialButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightWhite,
    borderWidth: 1,
    borderColor: COLORS.gray2,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SIZES.small,
  },
  registerText: {
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  registerLink: {
    fontFamily: FONT.bold,
    color: COLORS.tertiary,
  },
});

export default Login;
