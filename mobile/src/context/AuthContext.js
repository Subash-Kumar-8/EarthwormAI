import React, { createContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Automatically detect login/logout state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log("Auth Changed:", firebaseUser);
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();

          // Read farmer profile from Firestore
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          setToken(idToken);

          if (userSnap.exists()) {
            setUser({
              uid: firebaseUser.uid,
              ...userSnap.data(),
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            });
          }

          setIsAuthenticated(true);
        } else {
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log("Auth State Error:", error);
      } finally {
        console.log("Setting loading false");
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Login
  const login = async (email, password) => {
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = result.user;

      const idToken = await firebaseUser.getIdToken();

      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      setToken(idToken);

      if (userSnap.exists()) {
        setUser({
          uid: firebaseUser.uid,
          ...userSnap.data(),
        });
      } else {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        });
      }

      setIsAuthenticated(true);

      return firebaseUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (farmerData) => {
    setLoading(true);

    try {
      const {
        name,
        email,
        password,
        phone,
        district,
        state,
        language,
      } = farmerData;

      // Create Firebase Authentication account
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = result.user;

      await setDoc(doc(db, "users", firebaseUser.uid), {
        name,
        email,
        phone,
        createdAt: serverTimestamp(),
      });

      const idToken = await firebaseUser.getIdToken();

      setToken(idToken);

      setUser({
        uid: firebaseUser.uid,
        name,
        email,
        phone,
      });

      setIsAuthenticated(true);

      return firebaseUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Logout
  const logout = async () => {
    await signOut(auth);

    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};