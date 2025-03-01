import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS, FONT, SIZES, SHADOWS } from "../constants";

const EditProfileScreen = () => {
  const router = useRouter();

  // Sample user data (in a real app, this would come from a prop or context)
  const [userData, setUserData] = useState({
    fullName: "Itunuoluwa Abidoye",
    handle: "itunuoluwa",
    email: "itunuoluwa@example.com",
    phone: "+1 234 567 8900",
    avatarUrl: "https://placehold.co/100x100?text=Avatar",
  });

  const handleSave = () => {
    // Save logic would go here
    Alert.alert("Success", "Profile updated successfully");
    // Navigate back to profile
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: userData.avatarUrl }} style={styles.avatar} />
            <TouchableOpacity style={styles.changePhotoBtn}>
              <Icon name="camera" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formContainer}>
          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={userData.fullName}
              onChangeText={(text) =>
                setUserData({ ...userData, fullName: text })
              }
              placeholder="Enter your full name"
            />
          </View>

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={userData.handle}
              onChangeText={(text) =>
                setUserData({ ...userData, handle: text })
              }
              placeholder="Enter your username"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              placeholder="Enter your email"
              keyboardType="email-address"
            />
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={userData.phone}
              onChangeText={(text) => setUserData({ ...userData, phone: text })}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: COLORS.primary,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  changePhotoBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    padding: 8,
    borderRadius: 20,
    ...SHADOWS.medium,
  },
  formContainer: {
    padding: 16,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.gray,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    marginBottom: 30,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 8,
    ...SHADOWS.medium,
  },
  cancelButton: {
    backgroundColor: COLORS.gray2,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.secondary,
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
  },
  saveButtonText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
  },
});

export default EditProfileScreen;
