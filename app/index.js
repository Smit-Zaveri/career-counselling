import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function Index() {
  const { user, loading } = useAuth();
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          // User is logged in, check if questions are answered
          const userData = JSON.parse(storedUser);
          const userDoc = await getDoc(doc(db, "users", userData.uid));

          if (userDoc.exists() && userDoc.data().questionsAnswered) {
            setInitialRoute("home");
          } else {
            setInitialRoute("question");
          }
        } else {
          setInitialRoute("login");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setInitialRoute("login");
      }
    };

    if (!loading) {
      checkAuth();
    }
  }, [loading]);

  if (loading || !initialRoute) return null;

  return <Redirect href={initialRoute} />;
}
