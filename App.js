import React, { useEffect } from "react";
import { Platform } from "react-native";
import { registerRootComponent } from "expo";
import { LogBox } from "react-native";
import ErrorHandler from "./utils/ErrorHandler";

// Ignore specific warnings that might be causing issues
LogBox.ignoreLogs([
  "Warning: Failed prop type",
  "Non-serializable values were found in the navigation state",
  "ViewPropTypes will be removed",
]);

// This is necessary for Hermes and Expo Router compatibility
if (global.HermesInternal) {
  // Add necessary polyfills for Hermes
  if (!global.BigInt) {
    try {
      global.BigInt = require("big-integer");
    } catch (e) {
      console.warn("Failed to load big-integer polyfill", e);
    }
  }

  if (!global.TextEncoder) {
    try {
      const textEncoding = require("text-encoding");
      global.TextEncoder = textEncoding.TextEncoder;
      global.TextDecoder = textEncoding.TextDecoder;
    } catch (e) {
      console.warn("Failed to load text-encoding polyfill", e);
    }
  }

  // Add error handler for uncaught errors
  global.ErrorUtils &&
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.log("Global error handler:", error);
      if (isFatal) {
        console.log("Fatal error occurred:", error);
      }
    });
}

export default function App(props) {
  useEffect(() => {
    // Initialize the global error handler
    ErrorHandler.init();

    // Add specific handler for unhandled promise rejections
    const unhandledRejectionHandler = (event) => {
      if (__DEV__) {
        console.warn("Unhandled promise rejection:", event.reason);
      }
    };

    // Add event listener for unhandled rejections
    if (global.addEventListener) {
      global.addEventListener("unhandledrejection", unhandledRejectionHandler);
    }

    // Cleanup
    return () => {
      if (global.removeEventListener) {
        global.removeEventListener(
          "unhandledrejection",
          unhandledRejectionHandler
        );
      }
    };
  }, []);

  return props.children;
}

// If registerRootComponent is available, use it (important for Expo)
if (registerRootComponent) {
  // This helps with Expo Router initialization
  registerRootComponent(App);
}
