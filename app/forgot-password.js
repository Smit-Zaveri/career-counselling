import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS, FONT, SIZES } from "../constants";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Success",
        "Password reset email sent. Please check your inbox.",
        [{ text: "OK", onPress: () => router.push("login") }]
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email to receive reset instructions
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetPassword}
          >
            <Text style={styles.resetButtonText}>Reset Password</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },
  innerContainer: {
    flex: 1,
    padding: SIZES.medium,
    justifyContent: "center",
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.primary,
    marginBottom: SIZES.small,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginBottom: SIZES.xLarge,
  },
  form: {
    gap: SIZES.medium,
  },
  input: {
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    borderWidth: 1,
    borderColor: COLORS.gray2,
    fontFamily: FONT.regular,
  },
  resetButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    alignItems: "center",
  },
  resetButtonText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
  },
  backButton: {
    marginTop: SIZES.xLarge,
    alignItems: "center",
  },
  backButtonText: {
    color: COLORS.tertiary,
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
  },
});

export default ForgotPassword;
