import { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Safe version of onAuthStateChanged that handles errors
  const safeAuthStateChange = () => {
    try {
      // Verify auth is properly initialized before using
      if (!auth) {
        console.error("Auth object is not initialized");
        setLoading(false);
        return () => {};
      }

      // Use error callback parameter in onAuthStateChanged
      return onAuthStateChanged(
        auth,
        async (userObj) => {
          try {
            if (userObj) {
              // Safely extract user data to avoid serialization issues
              const userData = {
                uid: userObj?.uid,
                email: userObj?.email,
                displayName: userObj?.displayName,
                photoURL: userObj?.photoURL,
                emailVerified: userObj?.emailVerified,
              };
              
              // Ensure we're not saving undefined values
              Object.keys(userData).forEach(key => {
                if (userData[key] === undefined) {
                  userData[key] = null;
                }
              });
              
              await AsyncStorage.setItem("user", JSON.stringify(userData));
              setUser(userData);
            } else {
              await AsyncStorage.removeItem("user");
              setUser(null);
            }
          } catch (error) {
            console.error("Error in auth state change handler:", error);
            setAuthError(error.message);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Auth state change error:", error);
          setAuthError(error.message);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Error setting up auth state listener:", error);
      setAuthError(error.message);
      setLoading(false);
      return () => {};
    }
  };

  // Main auth state listener
  useEffect(() => {
    const unsubscribe = safeAuthStateChange();
    
    // Cleanup function
    return () => {
      try {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      } catch (error) {
        console.error("Error unsubscribing from auth state:", error);
      }
    };
  }, []);

  // Fallback to storage if authentication fails
  useEffect(() => {
    const recoverUserFromStorage = async () => {
      try {
        // Only attempt recovery if no user and not loading
        if (!user && !loading) {
          const storedUser = await AsyncStorage.getItem("user");
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
            } catch (parseError) {
              console.error("Error parsing stored user:", parseError);
              // Clear invalid data
              await AsyncStorage.removeItem("user");
            }
          }
        }
      } catch (error) {
        console.error("Error recovering user from storage:", error);
      }
    };

    recoverUserFromStorage();
  }, [user, loading]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      authError,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
