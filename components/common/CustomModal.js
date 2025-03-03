import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { COLORS, FONT, SIZES } from "../../constants";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const CustomModal = ({
  visible,
  title,
  message,
  type = "error", // "error", "success", "info"
  onClose,
  buttonText = "OK",
  onButtonPress,
  showSecondaryButton = false,
  secondaryButtonText = "",
  onSecondaryButtonPress,
}) => {
  const getIconName = () => {
    switch (type) {
      case "success":
        return "check-circle";
      case "info":
        return "info";
      case "error":
      default:
        return "error";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "info":
        return "#2196F3";
      case "error":
      default:
        return "#F44336";
    }
  };

  const handleButtonPress = () => {
    onClose();
    if (onButtonPress) {
      onButtonPress();
    }
  };

  const handleSecondaryButtonPress = () => {
    onClose();
    if (onSecondaryButtonPress) {
      onSecondaryButtonPress();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback>
            <View style={styles.modalView}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${getIconColor()}20` },
                ]}
              >
                <MaterialIcons
                  name={getIconName()}
                  size={40}
                  color={getIconColor()}
                />
              </View>

              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalText}>{message}</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={handleButtonPress}
                  style={[
                    styles.buttonWrapper,
                    showSecondaryButton
                      ? styles.primaryButton
                      : styles.singleButton,
                  ]}
                >
                  <LinearGradient
                    colors={["#f0f0f0", "#e0e0e0"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.grayButton}
                  >
                    <Text style={styles.grayButtonText}>{buttonText}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {showSecondaryButton && (
                  <TouchableOpacity
                    onPress={handleSecondaryButtonPress}
                    style={styles.buttonWrapper}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, "#4080ff"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.button}
                    >
                      <Text style={styles.buttonText}>
                        {secondaryButtonText}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: width * 0.85,
    backgroundColor: "white",
    borderRadius: SIZES.large,
    padding: SIZES.xLarge,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  modalTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginBottom: SIZES.small,
    textAlign: "center",
  },
  modalText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginBottom: SIZES.xLarge,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  buttonWrapper: {
    flex: 1,
  },
  primaryButton: {
    marginRight: SIZES.small / 2,
  },
  singleButton: {
    marginRight: 0,
  },
  button: {
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.medium,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
  },
  grayButton: {
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.medium,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  grayButtonText: {
    color: COLORS.gray,
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
  },
});

export default CustomModal;
