import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import styles from "./popularjobcard.style";
import { COLORS } from "../../../../constants";

const PopularJobCard = ({ item, selectedJob, handleCardPress }) => {
  // Default image for when employer_logo is invalid
  const defaultImage =
    "https://t4.ftcdn.net/jpg/05/05/61/73/360_F_505617309_NN1CW7diNmGXJfMicpY9eXHKV4sqzO5H.jpg";

  // Safe check for item
  if (!item) {
    console.error("Missing item in PopularJobCard");
    return null;
  }

  // Simple function to check image URL validity
  const isValidImageUrl = (url) => {
    if (!url) return false;
    return true; // For simplicity, accept any URL for now
  };

  return (
    <TouchableOpacity
      style={styles.container(selectedJob, item)}
      onPress={() => handleCardPress(item)}
    >
      <TouchableOpacity style={styles.logoContainer(selectedJob, item)}>
        <Image
          source={{
            uri: isValidImageUrl(item.employer_logo)
              ? item.employer_logo
              : defaultImage,
          }}
          resizeMode="contain"
          style={styles.logoImage}
        />
      </TouchableOpacity>

      <Text style={styles.companyName} numberOfLines={1}>
        {item.employer_name || "Company Name"}
      </Text>

      <View style={styles.infoContainer}>
        <Text style={styles.jobName(selectedJob, item)} numberOfLines={1}>
          {item.job_title || "Job Title"}
        </Text>

        <View style={styles.infoWrapper}>
          <Text style={styles.publisher(selectedJob, item)}>
            {item.job_publisher || "Publisher"} -
          </Text>
          <Text style={styles.location}> {item.job_country || "Location"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PopularJobCard;
