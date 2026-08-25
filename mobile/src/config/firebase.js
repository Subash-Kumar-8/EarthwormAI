import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "earthwormai.firebaseapp.com",
  projectId: "earthwormai",
  storageBucket: "earthwormai.firebasestorage.app",
  messagingSenderId: "91155649099",
  appId: "1:91155649099:web:03e62ee47609c4cbe073ce",
  measurementId: "G-JKTK2X89X7"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);
