import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { COLORS, SIZES } from "../../constants";
import * as ImagePicker from "expo-image-picker";

export default function CreateCommunity() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your media library"
        );
        return;
      }

      // Launch image picker with smaller image size
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.5,
        maxWidth: 1000,
        maxHeight: 1000,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        // Validate the URI before setting the image
        if (selectedImage.uri && selectedImage.uri.trim() !== "") {
          console.log("Selected image:", selectedImage.uri);
          setImage(selectedImage);
        } else {
          console.error("Invalid image URI");
          Alert.alert(
            "Error",
            "Selected image is invalid. Please try another image."
          );
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const isImageValid = () => {
    return image && image.uri && image.uri.trim() !== "";
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isImageValid()) {
      Alert.alert("Error", "Please select a valid image for the community");
      return;
    }

    if (!auth.currentUser) {
      Alert.alert(
        "Authentication Required",
        "Please log in to create a community"
      );
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const communityData = {
        title: title.trim(),
        description: description.trim(),
        image: image.uri,
        imageWidth: image.width || 0,
        imageHeight: image.height || 0,
        localImage: true,
        createdAt: new Date(),
        createdBy: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        bannedMembers: [],
        isDeleted: false,
      };

      await addDoc(collection(db, "communities"), communityData);
      Alert.alert("Success", "Community created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error creating community:", error);
      Alert.alert("Error", "Failed to create community. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Community Name</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter community name"
          maxLength={50}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="What is this community about?"
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        <Text style={styles.label}>Cover Image</Text>
        <TouchableOpacity
          style={styles.imagePicker}
          onPress={pickImage}
          disabled={loading}
        >
          <Text style={styles.imagePickerText}>
            {isImageValid() ? "Change Image" : "Select Image"}
          </Text>
        </TouchableOpacity>

        {isImageValid() ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            <Text style={styles.imageInfoText}>
              Note: This image will be stored locally and may not be accessible
              across all devices.
            </Text>
          </View>
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No image selected</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleCreate}
          disabled={loading || !isImageValid()}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Create Community</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  formContainer: {
    padding: SIZES.medium,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePicker: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  imagePickerText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  noImageContainer: {
    height: 100,
    backgroundColor: "#eee",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  noImageText: {
    color: "#999",
    fontSize: 16,
  },
  imagePreviewContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  imageInfoText: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
