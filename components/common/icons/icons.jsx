import { Image, TouchableOpacity } from "react-native";

import styles from "./icons.style";

const Icons = ({ iconUrl, dimension, handlePress, marginHorizontal, iconColor, backgroundColor = "transparent" }) => {
  return (
    <TouchableOpacity
      style={[
        styles.btnContainer,
        { marginRight: marginHorizontal },
        backgroundColor && { backgroundColor }
      ]}
      onPress={handlePress}
    >
      <Image
        source={iconUrl}
        resizeMode='cover'
        style={[
          styles.btnImg(dimension),
          iconColor && { tintColor: iconColor }
        ]}
      />
    </TouchableOpacity>
  );
};

export default Icons;
