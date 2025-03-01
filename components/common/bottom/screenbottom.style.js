import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 8,
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonWrapper1: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: width / 5,
    paddingVertical: 5,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: "#E6E4E6",
    transform: [{ scale: 1.1 }],
    shadowColor: "#312651",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  btn1Text: {
    fontSize: 12,
    color: "#83829A",
    fontFamily: "DMRegular",
    textAlign: "center",
  },
  activeText: {
    color: "#312651",
    fontFamily: "DMBold",
    transform: [{ scale: 1.05 }],
  },
});

export default styles;
