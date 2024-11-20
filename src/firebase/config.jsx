// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCh_MbRoRH8sVJOkUOHSEskcGx9nvib_4M",
  authDomain: "teleoperation-4cc2c.firebaseapp.com",
  projectId: "teleoperation-4cc2c",
  storageBucket: "teleoperation-4cc2c.firebasestorage.app",
  messagingSenderId: "149297016258",
  appId: "1:149297016258:web:58843cf4caced2cfb03a5b",
  measurementId: "G-R45SLMK941"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;