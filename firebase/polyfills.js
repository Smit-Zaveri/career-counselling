import { Buffer } from "buffer";

// TextEncoder/TextDecoder polyfills for React Native
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = class TextEncoder {
    encode(str) {
      return Buffer.from(str, "utf-8");
    }
  };
}

if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = class TextDecoder {
    decode(bytes) {
      return Buffer.from(bytes).toString("utf-8");
    }
  };
}

// Export something (not required, but good practice)
export const polyfillsLoaded = true;
