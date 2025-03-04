import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { COLORS, SIZES } from "../../../constants";
import { Ionicons } from "@expo/vector-icons";

const JobCard = ({
  job,
  handleNavigate,
  handleUnsave,
  showUnsaveButton = false,
  isRemoving = false,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={handleNavigate}>
      <View style={styles.headerSection}>
        <View style={styles.logoContainer}>
          {job.employer_logo ? (
            <Image
              source={{ uri: job.employer_logo }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="business-outline" size={24} color={COLORS.gray} />
            </View>
          )}
        </View>

        <View style={styles.jobMainInfo}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {job.job_title || "Job Title"}
          </Text>
          <Text style={styles.companyName} numberOfLines={1}>
            {job.employer_name || "Company Name"}
          </Text>
        </View>
      </View>

      <View style={styles.detailsSection}>
        {/* Location */}
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailText} numberOfLines={1}>
            {job.job_country || "Location not specified"}
          </Text>
        </View>

        {/* Job Type */}
        <View style={styles.detailRow}>
          <Ionicons name="briefcase-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailText} numberOfLines={1}>
            {job.job_employment_type || "Employment type not specified"}
          </Text>
        </View>

        {/* Saved Date */}
        {job.savedAt && (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailText} numberOfLines={1}>
              Saved {formatDate(job.savedAt)}
            </Text>
          </View>
        )}
      </View>

      {showUnsaveButton && (
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={handleNavigate}
            disabled={isRemoving}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.unsaveButton, isRemoving && { opacity: 0.7 }]}
            onPress={handleUnsave}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={16} color={COLORS.white} />
                <Text style={styles.unsaveButtonText}>Remove</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const formatDate = (timestamp) => {
  if (!timestamp) return "";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 3,
    marginBottom: 16,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.lightWhite,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  logo: {
    width: 40,
    height: 40,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  jobMainInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: SIZES.medium + 2,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  companyName: {
    fontSize: SIZES.small + 2,
    color: COLORS.secondary,
  },
  detailsSection: {
    marginTop: 8,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: SIZES.small + 2,
    color: COLORS.gray,
    flex: 1,
  },
  buttonSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 8,
  },
  viewButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  viewButtonText: {
    color: COLORS.white,
    fontWeight: "500",
  },
  unsaveButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.red,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  unsaveButtonText: {
    color: COLORS.white,
    fontWeight: "500",
  },
});

export default JobCard;
