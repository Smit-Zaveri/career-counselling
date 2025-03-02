import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS, FONT, SIZES } from "../constants";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";

const EditProfileScreen = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedData = JSON.parse(userData);
        setName(parsedData.name || "");
        setEmail(parsedData.email || "");
        setPhoto(parsedData.photoUrl || null);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "You need to allow access to your photos to change profile picture"
        );
        return;
      }

      // Updated options with correct mediaTypes value
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (
        !pickerResult.canceled &&
        pickerResult.assets &&
        pickerResult.assets.length > 0
      ) {
        const selectedImage = pickerResult.assets[0];
        console.log("Selected image:", selectedImage);
        setPhoto(selectedImage.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, "users", userId);

      const userData = {
        name,
        photoUrl: photo,
        updatedAt: new Date().toISOString(),
      };

      // Update Firestore
      await updateDoc(userRef, userData);

      // Update local storage with all user data
      const updatedUserData = {
        ...userData,
        email: auth.currentUser.email,
      };
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));

      Alert.alert("Success", "Profile updated successfully", [
        {
          text: "OK",
          onPress: () => {
            // Force a full refresh when going back
            router.push({
              pathname: "home",
              params: { refresh: Date.now() },
            });
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Icon name="camera" size={40} color={COLORS.gray} />
            </View>
          )}
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>

        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, { color: COLORS.gray }]}
            value={email}
            editable={false}
          />

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },
  content: {
    padding: SIZES.medium,
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: SIZES.xLarge,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray2,
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoText: {
    marginTop: SIZES.small,
    color: COLORS.primary,
    fontFamily: FONT.medium,
  },
  form: {
    gap: SIZES.small,
  },
  label: {
    fontFamily: FONT.medium,
    color: COLORS.gray,
  },
  input: {
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    borderWidth: 1,
    borderColor: COLORS.gray2,
    fontFamily: FONT.regular,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    alignItems: "center",
    marginTop: SIZES.large,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
  },
});

export default EditProfileScreen;
