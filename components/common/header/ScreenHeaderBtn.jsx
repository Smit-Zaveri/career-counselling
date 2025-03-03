import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import styles from "./screenheader.style";
import { COLORS } from "../../../constants";

const ScreenHeaderBtn = ({
  iconUrl,
  dimension,
  handlePress,
  marginHorizontal,
  badgeCount,
}) => {
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    loadProfilePhoto();
    // Add listener for storage changes
    const checkProfileUpdates = setInterval(loadProfilePhoto, 1000);
    return () => clearInterval(checkProfileUpdates);
  }, []);

  const loadProfilePhoto = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const { photoUrl } = JSON.parse(userData);
        if (photoUrl !== profilePhoto) {
          setProfilePhoto(photoUrl);
        }
      }
    } catch (error) {
      console.error("Error loading profile photo:", error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.btnContainer, { marginRight: marginHorizontal }]}
      onPress={handlePress}
    >
      {iconUrl.uri ? ( // Check if it's a profile picture icon
        profilePhoto ? (
          <Image
            source={{ uri: profilePhoto }}
            resizeMode="cover"
            style={styles.btnImg(dimension)}
          />
        ) : (
          <View style={[styles.btnImg(dimension), styles.placeholderContainer]}>
            <Icon name="person" size={24} color={COLORS.gray} />
          </View>
        )
      ) : (
        <Image
          source={iconUrl}
          resizeMode="cover"
          style={styles.btnImg(dimension)}
        />
      )}

      {/* Badge for saved jobs count */}
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ScreenHeaderBtn;
