import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { COLORS } from "../../../constants";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const violations = [
  { id: "spam", label: "Spam or Unwanted Content" },
  { id: "harassment", label: "Harassment or Bullying" },
  { id: "inappropriate", label: "Inappropriate Content" },
  { id: "hate", label: "Hate Speech" },
  { id: "misinformation", label: "Misinformation" },
  { id: "other", label: "Other Violation" },
];

export default function ViolationReportModal({
  visible,
  onClose,
  onSubmit,
  userName = "this user",
  loading,
}) {
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!selectedViolation) {
      return;
    }

    // Get the violation label from the selected id
    const violationType =
      violations.find((v) => v.id === selectedViolation)?.label ||
      selectedViolation;

    onSubmit({
      violationType,
      notes: notes.trim(),
      timestamp: new Date(),
    });
  };

  const handleClose = () => {
    setSelectedViolation(null);
    setNotes("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Report Rule Violation</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Why are you removing <Text style={styles.userName}>{userName}</Text>
            ? This information will be recorded for moderation purposes.
          </Text>

          <Text style={styles.sectionTitle}>Violation Type</Text>
          <View style={styles.violationList}>
            {violations.map((violation) => (
              <TouchableOpacity
                key={violation.id}
                style={[
                  styles.violationOption,
                  selectedViolation === violation.id &&
                    styles.selectedViolation,
                ]}
                onPress={() => setSelectedViolation(violation.id)}
              >
                <Text
                  style={[
                    styles.violationLabel,
                    selectedViolation === violation.id &&
                      styles.selectedViolationLabel,
                  ]}
                >
                  {violation.label}
                </Text>
                {selectedViolation === violation.id && (
                  <MaterialIcons name="check" size={18} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add specific details about the violation..."
            multiline={true}
            numberOfLines={3}
            maxLength={200}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                !selectedViolation && styles.submitButtonDisabled,
              ]}
              disabled={!selectedViolation || loading}
              onPress={handleSubmit}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitText}>Remove User</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "white",
    width: "90%",
    borderRadius: 12,
    maxHeight: "80%",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  userName: {
    fontWeight: "bold",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  violationList: {
    marginBottom: 16,
  },
  violationOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    marginVertical: 4,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectedViolation: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  violationLabel: {
    color: "#333",
    fontSize: 14,
  },
  selectedViolationLabel: {
    color: "white",
    fontWeight: "500",
  },
  notesInput: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 12,
    height: 100,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  submitButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#ffcccb",
  },
  cancelText: {
    color: "#666",
    fontWeight: "500",
  },
  submitText: {
    color: "white",
    fontWeight: "600",
  },
});
