import React from "react";
import { TouchableOpacity, Image } from "react-native";

import styles from "./icons.style";

const Icons = ({ iconUrl, dimension, handlePress, backgroundColor, iconColor }) => {
  return (
    <TouchableOpacity
      style={[styles.btnContainer, { backgroundColor: backgroundColor }]}
      onPress={handlePress}
    >
      <Image
        source={iconUrl}
        resizeMode="cover"
        style={[
          styles.btnImg(dimension),
          iconColor && { tintColor: iconColor }
        ]}
      />
    </TouchableOpacity>
  );
};

export default Icons;
