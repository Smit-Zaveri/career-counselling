import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS, FONT, SIZES } from "../constants";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

// Profile Completion Guide Component
const ProfileCompletionGuide = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={guideStyles.modalContainer}>
        <View style={guideStyles.modalContent}>
          <View style={guideStyles.header}>
            <Text style={guideStyles.headerText}>Complete Your Profile</Text>
            <TouchableOpacity style={guideStyles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={guideStyles.subtitle}>
              Here's what you need for a 100% complete profile
            </Text>

            <View style={guideStyles.sectionContainer}>
              <Text style={guideStyles.sectionTitle}>
                Basic Information (40%)
              </Text>
              <View style={guideStyles.requirementRow}>
                <Icon name="person" size={18} color={COLORS.primary} />
                <Text style={guideStyles.requirementText}>Name (10%)</Text>
              </View>
              <View style={guideStyles.requirementRow}>
                <Icon name="mail" size={18} color={COLORS.primary} />
                <Text style={guideStyles.requirementText}>Email (5%)</Text>
              </View>
              <View style={guideStyles.requirementRow}>
                <Icon name="image" size={18} color={COLORS.primary} />
                <Text style={guideStyles.requirementText}>
                  Profile Photo (15%)
                </Text>
              </View>
              <View style={guideStyles.requirementRow}>
                <Icon name="call" size={18} color={COLORS.primary} />
                <Text style={guideStyles.requirementText}>
                  Phone Number (10%)
                </Text>
              </View>
            </View>

            <View style={guideStyles.sectionContainer}>
              <Text style={guideStyles.sectionTitle}>
                Education & Experience (30%)
              </Text>
              <View style={guideStyles.requirementRow}>
                <Icon name="school" size={18} color={COLORS.primary} />
                <Text style={guideStyles.requirementText}>
                  Education Details (15%)
                </Text>
              </View>
              <View style={guideStyles.requirementRow}>
                <Icon name="briefcase" size={18} color={COLORS.primary} />
                <Text style={guideStyles.requirementText}>
                  Work Experience (15%)
                </Text>
              </View>
            </View>

            <View style={guideStyles.sectionContainer}>
              <Text style={guideStyles.sectionTitle}>Skills (15%)</Text>
              <View style={guideStyles.requirementRow}>
                <Icon name="code-working" size={18} color={COLORS.primary} />
                <Text style={guideStyles.requirementText}>
                  At least 5 skills (3% each, max 15%)
                </Text>
              </View>
            </View>

            <View style={guideStyles.sectionContainer}>
              <Text style={guideStyles.sectionTitle}>
                Job Preferences (15%)
              </Text>
              <View style={guideStyles.requirementRow}>
                <Icon name="briefcase" size={18} color={COLORS.primary} />
                <Text style={guideStyles.requirementText}>
                  At least 3 job preferences (5% each, max 15%)
                </Text>
              </View>
            </View>

            <View style={guideStyles.tipContainer}>
              <Icon name="bulb" size={24} color="#F9A826" />
              <Text style={guideStyles.tipText}>
                Profiles with 100% completion are 3x more likely to be noticed
                by employers!
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={guideStyles.button} onPress={onClose}>
            <Text style={guideStyles.buttonText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const EducationModal = ({ visible, onClose, onSave, initialData = null }) => {
  // Initialize with empty data instead of trying to use initialData here
  // This was causing the issue as initialData could be null on first render
  const [educationData, setEducationData] = useState({
    id: Date.now().toString(),
    degree: "",
    institution: "",
    field: "",
    startYear: "",
    endYear: "",
    percentage: "",
    grade: "",
    location: "",
    isOngoing: false,
  });

  const [errors, setErrors] = useState({});

  // More robust useEffect to handle initialData changes
  useEffect(() => {
    // Only update form when modal is visible and initialData exists
    if (visible) {
      if (initialData) {
        console.log("Initializing form with data:", initialData);
        // Set a small delay to ensure proper state update
        setTimeout(() => {
          setEducationData({
            id: initialData.id || Date.now().toString(),
            degree: initialData.degree || "",
            institution: initialData.institution || "",
            field: initialData.field || "",
            startYear: initialData.startYear || "",
            endYear: initialData.endYear || "",
            percentage: initialData.percentage || "",
            grade: initialData.grade || "",
            location: initialData.location || "",
            isOngoing: initialData.isOngoing || false,
          });
        }, 50);
      } else {
        // Reset form for new entries
        setEducationData({
          id: Date.now().toString(),
          degree: "",
          institution: "",
          field: "",
          startYear: "",
          endYear: "",
          percentage: "",
          grade: "",
          location: "",
          isOngoing: false,
        });
      }
      // Reset errors when modal opens
      setErrors({});
    }
  }, [visible, initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!educationData.degree.trim()) newErrors.degree = "Degree is required";
    if (!educationData.institution.trim())
      newErrors.institution = "Institution is required";
    if (!educationData.startYear)
      newErrors.startYear = "Start year is required";
    if (!educationData.isOngoing && !educationData.endYear) {
      newErrors.endYear = "End year is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(educationData);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.content}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>
              {initialData ? "Edit Education" : "Add Education"}
            </Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Icon name="close" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.form}>
            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>Degree/Qualification*</Text>
              <TextInput
                style={[
                  modalStyles.input,
                  errors.degree && modalStyles.inputError,
                ]}
                value={educationData.degree}
                onChangeText={(text) =>
                  setEducationData({ ...educationData, degree: text })
                }
                placeholder="e.g., Bachelor of Science, High School"
              />
              {errors.degree && (
                <Text style={modalStyles.errorText}>{errors.degree}</Text>
              )}
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>Institution/School*</Text>
              <TextInput
                style={[
                  modalStyles.input,
                  errors.institution && modalStyles.inputError,
                ]}
                value={educationData.institution}
                onChangeText={(text) =>
                  setEducationData({ ...educationData, institution: text })
                }
                placeholder="Name of institution"
              />
              {errors.institution && (
                <Text style={modalStyles.errorText}>{errors.institution}</Text>
              )}
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>
                Field of Study/Specialization
              </Text>
              <TextInput
                style={modalStyles.input}
                value={educationData.field}
                onChangeText={(text) =>
                  setEducationData({ ...educationData, field: text })
                }
                placeholder="e.g., Computer Science"
              />
            </View>

            <View style={modalStyles.row}>
              <View style={[modalStyles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={modalStyles.label}>Start Year*</Text>
                <TextInput
                  style={[
                    modalStyles.input,
                    errors.startYear && modalStyles.inputError,
                  ]}
                  value={educationData.startYear}
                  onChangeText={(text) =>
                    setEducationData({
                      ...educationData,
                      startYear: text.replace(/[^0-9]/g, ""),
                    })
                  }
                  placeholder="YYYY"
                  keyboardType="numeric"
                  maxLength={4}
                />
                {errors.startYear && (
                  <Text style={modalStyles.errorText}>{errors.startYear}</Text>
                )}
              </View>

              <View style={[modalStyles.field, { flex: 1, marginLeft: 8 }]}>
                <Text style={modalStyles.label}>End Year</Text>
                <TextInput
                  style={[
                    modalStyles.input,
                    errors.endYear && modalStyles.inputError,
                  ]}
                  value={
                    educationData.isOngoing ? "Present" : educationData.endYear
                  }
                  onChangeText={(text) =>
                    setEducationData({
                      ...educationData,
                      endYear: text.replace(/[^0-9]/g, ""),
                    })
                  }
                  placeholder="YYYY"
                  keyboardType="numeric"
                  maxLength={4}
                  editable={!educationData.isOngoing}
                />
                {errors.endYear && (
                  <Text style={modalStyles.errorText}>{errors.endYear}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={modalStyles.checkbox}
              onPress={() =>
                setEducationData({
                  ...educationData,
                  isOngoing: !educationData.isOngoing,
                })
              }
            >
              <View
                style={[
                  modalStyles.checkboxBox,
                  educationData.isOngoing && modalStyles.checkboxChecked,
                ]}
              >
                {educationData.isOngoing && (
                  <Icon name="checkmark" size={16} color={COLORS.white} />
                )}
              </View>
              <Text style={modalStyles.checkboxLabel}>Currently Studying</Text>
            </TouchableOpacity>

            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>Percentage/CGPA</Text>
              <TextInput
                style={modalStyles.input}
                value={educationData.percentage}
                onChangeText={(text) =>
                  setEducationData({ ...educationData, percentage: text })
                }
                placeholder="e.g., 85% or 3.8"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>Grade/Division</Text>
              <TextInput
                style={modalStyles.input}
                value={educationData.grade}
                onChangeText={(text) =>
                  setEducationData({ ...educationData, grade: text })
                }
                placeholder="e.g., First Class, A+"
              />
            </View>

            <View style={[modalStyles.field, { paddingBottom: 16 }]}>
              <Text style={modalStyles.label}>Location</Text>
              <TextInput
                style={modalStyles.input}
                value={educationData.location}
                onChangeText={(text) =>
                  setEducationData({ ...educationData, location: text })
                }
                placeholder="City, Country"
              />
            </View>
          </ScrollView>

          <View style={modalStyles.actions}>
            <TouchableOpacity
              style={modalStyles.cancelButton}
              onPress={onClose}
            >
              <Text style={modalStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.saveButton}
              onPress={handleSave}
            >
              <Text style={modalStyles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const EditProfileScreen = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    photoUrl: null,
    phone: "",
    education: [],
    experience: "",
    skills: [],
    jobPreferences: [],
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [skillInput, setSkillInput] = useState("");
  const [jobPreferenceInput, setJobPreferenceInput] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [completionBreakdown, setCompletionBreakdown] = useState({
    basic: 0,
    education: 0,
    skills: 0,
    preferences: 0,
  });
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  // Calculate profile completion percentage - improved calculation
  const calculateCompletionPercentage = () => {
    let basicScore = 0;
    let educationScore = 0;
    let skillsScore = 0;
    let preferencesScore = 0;

    // Basic information - 40%
    if (userData.name && userData.name.trim().length > 0) basicScore += 10;
    if (userData.email && userData.email.trim().length > 0) basicScore += 5;
    if (userData.photoUrl) basicScore += 15;
    if (userData.phone && userData.phone.trim().length > 0) basicScore += 10;

    // Education & Experience - 30%
    if (userData.education && userData.education.length > 0)
      educationScore += 15;
    if (userData.experience && userData.experience.trim().length > 0)
      educationScore += 15;

    // Skills - 15%
    if (userData.skills && userData.skills.length > 0) {
      // More skills, higher score (up to 15%)
      skillsScore += Math.min(userData.skills.length * 3, 15);
    }

    // Job preferences - 15%
    if (userData.jobPreferences && userData.jobPreferences.length > 0) {
      // More preferences, higher score (up to 15%)
      preferencesScore += Math.min(userData.jobPreferences.length * 5, 15);
    }

    // Store breakdown for UI
    setCompletionBreakdown({
      basic: basicScore,
      education: educationScore,
      skills: skillsScore,
      preferences: preferencesScore,
    });

    // Calculate final percentage
    const totalScore =
      basicScore + educationScore + skillsScore + preferencesScore;
    const percentage = Math.round(totalScore);
    setCompletionPercentage(percentage);
    return percentage;
  };

  // Update the completion percentage whenever user data changes
  useEffect(() => {
    if (userData) {
      calculateCompletionPercentage();
    }
  }, [
    userData.name,
    userData.photoUrl,
    userData.phone,
    userData.education,
    userData.experience,
    userData.skills.length,
    userData.jobPreferences.length,
  ]);

  const loadUserData = async () => {
    setInitialLoading(true);
    try {
      // Try to load from AsyncStorage first for faster display
      const storedData = await AsyncStorage.getItem("userData");
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setUserData({
          name: parsed.name || "",
          email: parsed.email || "",
          photoUrl: parsed.photoUrl || null,
          phone: parsed.phone || "",
          education: Array.isArray(parsed.education) ? parsed.education : [],
          experience: parsed.experience || "",
          skills: Array.isArray(parsed.skills) ? parsed.skills : [],
          jobPreferences: Array.isArray(parsed.jobPreferences)
            ? parsed.jobPreferences
            : [],
        });
      }

      // Then get the latest from Firestore
      const userId = auth.currentUser?.uid;
      if (!userId) {
        router.replace("login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          name: data.name || "",
          email: auth.currentUser.email || "",
          photoUrl: data.photoUrl || null,
          phone: data.phone || "",
          education: Array.isArray(data.education) ? data.education : [],
          experience: data.experience || "",
          skills: Array.isArray(data.skills) ? data.skills : [],
          jobPreferences: Array.isArray(data.jobPreferences)
            ? data.jobPreferences
            : [],
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load profile data. Please try again.");
    } finally {
      setInitialLoading(false);
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
        setUserData({ ...userData, photoUrl: selectedImage.uri });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const addSkill = () => {
    if (skillInput.trim() === "") return;
    if (userData.skills.includes(skillInput.trim())) {
      Alert.alert("Duplicate", "This skill is already in your list.");
      return;
    }
    setUserData({
      ...userData,
      skills: [...userData.skills, skillInput.trim()],
    });
    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    setUserData({
      ...userData,
      skills: userData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const addJobPreference = () => {
    if (jobPreferenceInput.trim() === "") return;
    if (userData.jobPreferences.includes(jobPreferenceInput.trim())) {
      Alert.alert("Duplicate", "This job preference is already in your list.");
      return;
    }
    setUserData({
      ...userData,
      jobPreferences: [...userData.jobPreferences, jobPreferenceInput.trim()],
    });
    setJobPreferenceInput("");
  };

  const removeJobPreference = (prefToRemove) => {
    setUserData({
      ...userData,
      jobPreferences: userData.jobPreferences.filter(
        (pref) => pref !== prefToRemove
      ),
    });
  };

  const handleSave = async () => {
    if (!userData.name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, "users", userId);

      // Calculate final completion percentage
      const finalCompletionPercentage = calculateCompletionPercentage();

      const updatedUserData = {
        name: userData.name,
        photoUrl: userData.photoUrl,
        phone: userData.phone,
        education: userData.education,
        experience: userData.experience,
        skills: userData.skills,
        jobPreferences: userData.jobPreferences,
        updatedAt: new Date().toISOString(),
        completedProfile: finalCompletionPercentage,
      };

      // Update Firestore
      await updateDoc(userRef, updatedUserData);

      // Update local storage with all user data
      const fullUserData = {
        ...updatedUserData,
        email: auth.currentUser.email,
      };

      // Update AsyncStorage
      await AsyncStorage.setItem("userData", JSON.stringify(fullUserData));

      // Show success message
      Alert.alert(
        "Success",
        `Profile updated successfully! Profile completion: ${finalCompletionPercentage}%`,
        [
          {
            text: "OK",
            onPress: () => {
              // Go back to previous screen with refresh indicator
              router.back({
                params: { refresh: Date.now() },
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  // Get appropriate color based on completion percentage
  const getCompletionColor = (percentage) => {
    if (percentage < 30) return "#FF5252";
    if (percentage < 70) return "#FFA726";
    return "#66BB6A";
  };

  // Get remaining items message
  const getRemainingItemsMessage = () => {
    const messages = [];

    if (completionBreakdown.basic < 40) {
      const remaining = [];
      if (!userData.name) remaining.push("name");
      if (!userData.photoUrl) remaining.push("photo");
      if (!userData.phone) remaining.push("phone number");
      if (remaining.length > 0) {
        messages.push(`Add your ${remaining.join(", ")}`);
      }
    }

    if (completionBreakdown.education < 30) {
      const remaining = [];
      if (!userData.education) remaining.push("education");
      if (!userData.experience) remaining.push("experience");
      if (remaining.length > 0) {
        messages.push(`Add your ${remaining.join(" and ")}`);
      }
    }

    if (completionBreakdown.skills < 15) {
      const skillsNeeded = Math.ceil((15 - completionBreakdown.skills) / 3);
      if (skillsNeeded > 0) {
        messages.push(
          `Add ${skillsNeeded} more skill${skillsNeeded > 1 ? "s" : ""}`
        );
      }
    }

    if (completionBreakdown.preferences < 15) {
      const prefsNeeded = Math.ceil((15 - completionBreakdown.preferences) / 5);
      if (prefsNeeded > 0) {
        messages.push(
          `Add ${prefsNeeded} more job preference${prefsNeeded > 1 ? "s" : ""}`
        );
      }
    }

    if (messages.length === 0) return "Your profile is complete! 🎉";
    return messages.join(" • ");
  };

  const handleSaveEducation = (educationData) => {
    try {
      if (editingEducation) {
        // Update existing education
        const updatedEducation = userData.education.map((edu) =>
          edu.id === educationData.id ? educationData : edu
        );
        setUserData({
          ...userData,
          education: updatedEducation,
        });
        console.log("Updated education:", educationData);
      } else {
        // Add new education
        setUserData({
          ...userData,
          education: [
            ...userData.education,
            { ...educationData, id: Date.now().toString() },
          ],
        });
        console.log("Added new education:", educationData);
      }
      setShowEducationModal(false);
      setEditingEducation(null);
    } catch (error) {
      console.error("Error saving education:", error);
      Alert.alert("Error", "Failed to save education details");
    }
  };

  const handleEditEducation = (educationData) => {
    try {
      // First set the modal to visible to ensure it's ready to receive data
      setShowEducationModal(true);

      // Clone the data to avoid reference issues
      const educationToEdit = { ...educationData };

      console.log("Editing education with data:", educationToEdit);

      // Set with a slight delay to ensure the modal is fully rendered
      setTimeout(() => {
        setEditingEducation(educationToEdit);
      }, 100);
    } catch (error) {
      console.error("Error editing education:", error);
      Alert.alert("Error", "Failed to edit education details");
    }
  };

  const handleDeleteEducation = (educationId) => {
    try {
      Alert.alert(
        "Delete Education",
        "Are you sure you want to delete this education entry?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              setUserData((prev) => ({
                ...prev,
                education: prev.education.filter(
                  (edu) => edu.id !== educationId
                ),
              }));
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error deleting education:", error);
      Alert.alert("Error", "Failed to delete education entry");
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile information...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Profile Completion Guide Modal */}
      <ProfileCompletionGuide
        visible={showGuide}
        onClose={() => setShowGuide(false)}
      />

      {/* Education Modal */}
      <EducationModal
        visible={showEducationModal}
        onClose={() => {
          // Clear editing state before closing the modal
          setEditingEducation(null);
          setShowEducationModal(false);
        }}
        onSave={handleSaveEducation}
        initialData={editingEducation}
      />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, "#396AFC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }} // Extra padding at bottom to ensure save button is visible
        >
          <View style={styles.content}>
            {/* Profile completion status */}
            <View style={styles.completionContainer}>
              <View style={styles.completionHeader}>
                <Text style={styles.completionTitle}>Profile Completion</Text>
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={() => setShowGuide(true)}
                >
                  <Icon
                    name="information-circle"
                    size={22}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.completionCircleContainer}>
                <View style={styles.completionCircleOuter}>
                  <View style={styles.completionCircleInner}>
                    <Text style={styles.completionPercentageNumber}>
                      {completionPercentage}%
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.completionArc,
                      {
                        borderColor: getCompletionColor(completionPercentage),
                        transform: [
                          { rotate: `${3.6 * completionPercentage - 90}deg` },
                        ],
                      },
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.remainingItemsText}>
                {getRemainingItemsMessage()}
              </Text>

              <View style={styles.breakdownContainer}>
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownHeader}>
                    <Icon name="person" size={16} color={COLORS.primary} />
                    <Text style={styles.breakdownTitle}>Basic</Text>
                  </View>
                  <Text style={styles.breakdownValue}>
                    {completionBreakdown.basic}/40%
                  </Text>
                </View>

                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownHeader}>
                    <Icon name="school" size={16} color={COLORS.primary} />
                    <Text style={styles.breakdownTitle}>Education</Text>
                  </View>
                  <Text style={styles.breakdownValue}>
                    {completionBreakdown.education}/30%
                  </Text>
                </View>

                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownHeader}>
                    <Icon
                      name="code-working"
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.breakdownTitle}>Skills</Text>
                  </View>
                  <Text style={styles.breakdownValue}>
                    {completionBreakdown.skills}/15%
                  </Text>
                </View>

                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownHeader}>
                    <Icon name="briefcase" size={16} color={COLORS.primary} />
                    <Text style={styles.breakdownTitle}>Jobs</Text>
                  </View>
                  <Text style={styles.breakdownValue}>
                    {completionBreakdown.preferences}/15%
                  </Text>
                </View>
              </View>
            </View>

            {/* Photo Section */}
            <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
              {userData.photoUrl ? (
                <Image
                  source={{ uri: userData.photoUrl }}
                  style={styles.photo}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Icon name="camera" size={40} color={COLORS.gray} />
                </View>
              )}
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>

            <View style={styles.form}>
              {/* Basic Info Section */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Basic Information</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      {completionBreakdown.basic}/40%
                    </Text>
                  </View>
                </View>

                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={userData.name}
                  onChangeText={(text) =>
                    setUserData({ ...userData, name: text })
                  }
                  placeholder="Enter your name"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, { color: COLORS.gray }]}
                  value={userData.email}
                  editable={false}
                />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={userData.phone}
                  onChangeText={(text) =>
                    setUserData({ ...userData, phone: text })
                  }
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Education & Experience Section */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Education</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowEducationModal(true)}
                  >
                    <Icon name="add" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                </View>

                {userData.education.length > 0 ? (
                  <View style={styles.educationList}>
                    {userData.education.map((edu, index) => (
                      <View key={edu.id || index} style={styles.educationCard}>
                        <View style={styles.educationHeader}>
                          <Text style={styles.degreeName}>{edu.degree}</Text>
                          <View style={styles.educationActions}>
                            <TouchableOpacity
                              onPress={() => handleEditEducation(edu)}
                            >
                              <Icon
                                name="create-outline"
                                size={20}
                                color={COLORS.primary}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDeleteEducation(edu.id)}
                            >
                              <Icon
                                name="trash-outline"
                                size={20}
                                color="#FF6464"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <Text style={styles.institutionName}>
                          {edu.institution}
                        </Text>
                        {edu.field && (
                          <Text style={styles.fieldName}>{edu.field}</Text>
                        )}

                        <View style={styles.educationDetails}>
                          <Text style={styles.yearText}>
                            {edu.startYear} -{" "}
                            {edu.isOngoing ? "Present" : edu.endYear}
                          </Text>
                          {edu.percentage && (
                            <Text style={styles.percentageText}>
                              {edu.percentage}
                            </Text>
                          )}
                        </View>

                        {edu.location && (
                          <Text style={styles.locationText}>
                            {edu.location}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noDataText}>
                    No education details added
                  </Text>
                )}
              </View>

              {/* Skills Section */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Skills</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      {completionBreakdown.skills}/15%
                    </Text>
                  </View>
                </View>

                <Text style={styles.requiredText}>
                  Add at least 5 skills (3% each)
                </Text>

                <View style={styles.addItemContainer}>
                  <TextInput
                    style={styles.addItemInput}
                    value={skillInput}
                    onChangeText={setSkillInput}
                    placeholder="Add a skill"
                  />
                  <TouchableOpacity style={styles.addButton} onPress={addSkill}>
                    <Icon name="add" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                </View>

                <View style={styles.tagsContainer}>
                  {userData.skills.map((skill, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{skill}</Text>
                      <TouchableOpacity onPress={() => removeSkill(skill)}>
                        <Icon
                          name="close-circle"
                          size={18}
                          color={COLORS.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {userData.skills.length === 0 && (
                    <Text style={styles.noItemsText}>No skills added yet</Text>
                  )}
                </View>
              </View>

              {/* Job Preferences Section */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Job Preferences</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      {completionBreakdown.preferences}/15%
                    </Text>
                  </View>
                </View>

                <Text style={styles.requiredText}>
                  Add at least 3 preferences (5% each)
                </Text>

                <View style={styles.addItemContainer}>
                  <TextInput
                    style={styles.addItemInput}
                    value={jobPreferenceInput}
                    onChangeText={setJobPreferenceInput}
                    placeholder="Add a job preference"
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={addJobPreference}
                  >
                    <Icon name="add" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                </View>

                <View style={styles.tagsContainer}>
                  {userData.jobPreferences.map((pref, index) => (
                    <View key={index} style={[styles.tag, styles.jobTag]}>
                      <Text style={styles.tagText}>{pref}</Text>
                      <TouchableOpacity
                        onPress={() => removeJobPreference(pref)}
                      >
                        <Icon
                          name="close-circle"
                          size={18}
                          color={COLORS.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {userData.jobPreferences.length === 0 && (
                    <Text style={styles.noItemsText}>
                      No job preferences added yet
                    </Text>
                  )}
                </View>
              </View>

              {/* Fixed the positioning to ensure the save button is always visible */}
              <View style={styles.saveButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    loading && styles.saveButtonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating save button for better visibility */}
      <View style={styles.floatingSaveButtonContainer}>
        <TouchableOpacity
          style={[
            styles.floatingSaveButton,
            loading && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Icon name="save-outline" size={20} color={COLORS.white} />
              <Text style={styles.floatingSaveButtonText}>Save</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Guide Modal Styles
const guideStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
    height: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large + 2,
    color: COLORS.primary,
  },
  closeButton: {
    padding: 5,
  },
  subtitle: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginBottom: 20,
  },
  sectionContainer: {
    backgroundColor: COLORS.lightWhite,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginBottom: 10,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requirementText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 2,
    color: COLORS.gray,
    marginLeft: 10,
  },
  tipContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(249,168,38,0.1)",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    alignItems: "center",
  },
  tipText: {
    flex: 1,
    fontFamily: FONT.medium,
    fontSize: SIZES.small + 2,
    color: "#F9A826",
    marginLeft: 10,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray2,
  },
  title: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: SIZES.small + 2,
    fontFamily: FONT.medium,
    color: COLORS.gray,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
  },
  inputError: {
    borderColor: "#FF6464",
  },
  errorText: {
    color: "#FF6464",
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  actions: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray2,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    textAlign: "center",
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    textAlign: "center",
  },
});

const styles = StyleSheet.create({
  // ...existing styles...
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightWhite,
  },
  loadingText: {
    marginTop: 10,
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 10,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: SIZES.large + 2,
    fontFamily: FONT.bold,
    color: COLORS.white,
    textAlign: "center",
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    padding: SIZES.medium,
  },
  completionContainer: {
    width: "100%",
    marginBottom: 25,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  completionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  completionTitle: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  infoButton: {
    padding: 5,
  },
  completionCircleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  completionCircleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 10,
    borderColor: COLORS.gray2,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  completionCircleInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.lightWhite,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  completionPercentageNumber: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.primary,
  },
  completionArc: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 10,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
    transform: [{ rotate: "0deg" }],
  },
  remainingItemsText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small + 1,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  breakdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    flexWrap: "wrap",
  },
  breakdownItem: {
    width: "48%",
    backgroundColor: COLORS.lightWhite,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  breakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  breakdownTitle: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small + 1,
    color: COLORS.primary,
    marginLeft: 5,
  },
  breakdownValue: {
    fontFamily: FONT.bold,
    fontSize: SIZES.small + 1,
    color: COLORS.primary,
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
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 5,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
  },
  sectionBadge: {
    backgroundColor: COLORS.lightWhite,
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  sectionBadgeText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.small + 1,
    color: COLORS.primary,
  },
  label: {
    fontFamily: FONT.medium,
    color: COLORS.gray,
    marginBottom: 5,
  },
  input: {
    backgroundColor: COLORS.white,
    height: 45,
    padding: SIZES.small,
    borderRadius: SIZES.small,
    borderWidth: 1,
    borderColor: COLORS.gray2,
    fontFamily: FONT.regular,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  addItemContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  addItemInput: {
    flex: 1,
    height: 45,
    backgroundColor: COLORS.white,
    padding: SIZES.small,
    borderRadius: SIZES.small,
    borderWidth: 1,
    borderColor: COLORS.gray2,
    fontFamily: FONT.regular,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 0,
    minHeight: 30,
  },
  tag: {
    backgroundColor: "rgba(51, 102, 255, 0.1)",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  jobTag: {
    backgroundColor: "rgba(39, 174, 96, 0.1)",
  },
  tagText: {
    fontFamily: FONT.medium,
    color: COLORS.primary,
    marginRight: 5,
  },
  noItemsText: {
    fontFamily: FONT.regular,
    color: COLORS.gray,
    fontStyle: "italic",
    padding: 10,
  },
  saveButtonContainer: {
    //marginBottom: 80, // Extra space for floating button
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    alignItems: "center",
    marginTop: SIZES.large,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
  },
  floatingSaveButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  floatingSaveButton: {
    backgroundColor: COLORS.primary,
    width: 120,
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  floatingSaveButtonText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    marginLeft: 8,
  },
  requiredText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small + 1,
    color: COLORS.gray,
    marginBottom: 10,
  },
  educationList: {
    marginTop: 10,
  },
  educationCard: {
    backgroundColor: COLORS.lightWhite,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  degreeName: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  educationActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  institutionName: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small + 1,
    color: COLORS.gray,
  },
  fieldName: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 1,
    color: COLORS.gray,
    marginBottom: 5,
  },
  educationDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  yearText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 1,
    color: COLORS.gray,
  },
  percentageText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 1,
    color: COLORS.gray,
  },
  locationText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 1,
    color: COLORS.gray,
  },
  noDataText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small + 1,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 10,
  },
});

export default EditProfileScreen;
