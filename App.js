import React, { useEffect } from 'react';
import 'react-native-get-random-values';
import { Platform } from 'react-native';
// Import other necessary components for your app
import ErrorHandler from './utils/ErrorHandler';

// Add TextEncoder polyfill for Hermes
if (Platform.OS !== 'web') {
  // Use JSBI for BigInt support
  global.BigInt = require('big-integer');

  // Add TextEncoder polyfill
  global.TextEncoder = require('text-encoding').TextEncoder;
  global.TextDecoder = require('text-encoding').TextDecoder;
}

export default function App() {
  useEffect(() => {
    // Initialize the global error handler
    ErrorHandler.init();

    // Add specific handler for unhandled promise rejections
    const unhandledRejectionHandler = event => {
      if (__DEV__) {
        console.warn(
          'Unhandled promise rejection:',
          event.reason
        );
      }
    };

    // Add event listener for unhandled rejections
    if (global.addEventListener) {
      global.addEventListener('unhandledrejection', unhandledRejectionHandler);
    }

    // Cleanup
    return () => {
      if (global.removeEventListener) {
        global.removeEventListener('unhandledrejection', unhandledRejectionHandler);
      }
    };
  }, []);

  return (
    // Your existing app component structure
    // ...
  );
}
