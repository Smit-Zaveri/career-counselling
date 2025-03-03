import { StyleSheet } from "react-native";
import { COLORS, FONT, SIZES } from "../../../constants";

const styles = StyleSheet.create({
  container: {
    marginTop: SIZES.xLarge,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  headerBtn: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.gray,
  },
  jobCount: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium - 2,
    color: COLORS.secondary,
    marginBottom: SIZES.small,
  },
  jobsContainer: {
    marginTop: SIZES.medium,
    paddingBottom: SIZES.large * 5, // Add extra padding to accommodate all jobs
  },
  errorContainer: {
    alignItems: "center",
    padding: SIZES.medium,
  },
  errorText: {
    fontFamily: FONT.medium,
    color: COLORS.gray,
    marginBottom: SIZES.small,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.small,
  },
  retryButtonText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.small,
  },
});

export default styles;
