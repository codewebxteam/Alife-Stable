import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState("guest"); // Default to guest
  const [loading, setLoading] = useState(true);

  // --- ATOMIC SIGNUP WITH ROLLBACK PROTECTION ---
  const signup = async (email, password, additionalData) => {
    console.log("DEBUG: Signup process started for:", email);
    let userCredential;

    try {
      // 1. Create Auth User
      userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log(
        "DEBUG: Auth user created successfully. UID:",
        userCredential.user.uid,
      );

      // 2. Create Firestore Document in the central 'users' collection
      // This is the source of truth for the 'admin' check
      const userRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        email: email,
        ...additionalData,
        role: "user", // Default role for new signups
        createdAt: serverTimestamp(),
      });
      console.log("DEBUG: Firestore document created successfully.");

      return userCredential;
    } catch (error) {
      console.error("DEBUG ERROR during signup:", error.code, error.message);

      // ROLLBACK: If Firestore fails, delete the Auth user to prevent "ghost" accounts
      if (userCredential?.user) {
        console.warn("DEBUG: Firestore failed. Rolling back Auth user...");
        await deleteUser(userCredential.user);
        console.log("DEBUG: Auth user rolled back.");
      }
      throw error;
    }
  };

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const logout = () => {
    setUserRole("guest");
    return signOut(auth);
  };

  // --- ROLE-BASED SESSION INITIALIZATION ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("DEBUG: Auth state changed. User detected:", user.uid);

        // Always check the Firestore 'users' collection for the role
        const userRef = doc(db, "users", user.uid);
        try {
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            console.log("DEBUG: User role found:", data.role);
            setUserRole(data.role); // Sets 'admin' or 'user'
            setCurrentUser({ ...user, ...data });
          } else {
            console.warn("DEBUG: No Firestore document for this user.");
            setUserRole("user");
            setCurrentUser(user);
          }
        } catch (e) {
          console.error("DEBUG: Error fetching user role:", e);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
        setUserRole("guest");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    resetPassword,
    logout,
    loading,
    db, // Exported for Modal Firestore calls
    auth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
