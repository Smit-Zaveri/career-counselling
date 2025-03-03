import { Alert } from "react-native";

/**
 * Global error handler to catch and display unhandled promises
 */
class ErrorHandler {
  static init() {
    // Handle unhandled promise rejections globally
    const originalSetPromiseUnhandledRejectionTracker =
      global.setPromiseUnhandledRejectionTracker;

    if (global.setPromiseUnhandledRejectionTracker) {
      global.setPromiseUnhandledRejectionTracker = (promise, info) => {
        // Call the original tracker
        if (originalSetPromiseUnhandledRejectionTracker) {
          originalSetPromiseUnhandledRejectionTracker(promise, info);
        }

        // Add our custom handling
        console.warn("Unhandled Promise Rejection:", info && info.reason);
      };
    }

    // Set up error handler for regular JS errors
    const originalErrorHandler = ErrorUtils.getGlobalHandler();

    ErrorUtils.setGlobalHandler((error, isFatal) => {
      // Log the error
      console.error("Global JS Error:", error);

      // Call the original handler
      originalErrorHandler(error, isFatal);
    });
  }

  static showError(message, title = "Error") {
    console.error(message);

    Alert.alert(title, message, [{ text: "OK" }], { cancelable: false });
  }
}

export default ErrorHandler;
