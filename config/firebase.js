import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAd4H9qAq7HMhOre9AmgOQpNRxQyFmZjS4",
  authDomain: "career-counselling-4c5e6.firebaseapp.com",
  databaseURL: "https://career-counselling-4c5e6-default-rtdb.firebaseio.com",
  projectId: "career-counselling-4c5e6",
  storageBucket: "career-counselling-4c5e6.firebasestorage.app",
  messagingSenderId: "114334936254",
  appId: "1:114334936254:web:472475503b50a54c3982ef",
  measurementId: "G-LJZ8J70L3T",
};

const app = initializeApp(firebaseConfig);
initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
