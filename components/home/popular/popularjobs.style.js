import { StyleSheet } from "react-native";

import { COLORS, FONT, SIZES } from "../../../constants";

const styles = StyleSheet.create({
  // ...existing code...

  // Add these new styles
  errorContainer: {
    width: "100%",
    padding: SIZES.medium,
    alignItems: "center",
    justifyContent: "center",
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
    fontFamily: FONT.bold,
    color: COLORS.white,
  },
});

export default styles;
