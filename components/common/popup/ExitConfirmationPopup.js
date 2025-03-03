import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../../constants";

const ExitConfirmationPopup = ({ visible, onCancel, onConfirm }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        <View style={styles.popup}>
          <Text style={styles.title}>Exit App</Text>
          <Text style={styles.message}>
            Are you sure you want to close the application?
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={[styles.buttonText, styles.confirmText]}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popup: {
    width: "80%",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.large,
    alignItems: "center",
    elevation: 5,
  },
  title: {
    fontFamily: "DMBold",
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginBottom: SIZES.small,
  },
  message: {
    fontFamily: "DMRegular",
    fontSize: SIZES.medium,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: SIZES.large,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.large,
    borderRadius: SIZES.small,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.lightWhite,
    borderWidth: 1,
    borderColor: COLORS.gray2,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontFamily: "DMBold",
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  confirmText: {
    color: COLORS.white,
  },
});

export default ExitConfirmationPopup;
