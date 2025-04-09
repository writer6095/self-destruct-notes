import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "self-destruct-notes.firebaseapp.com",
  projectId: "self-destruct-notes",
  storageBucket: "self-destruct-notes.firebasestorage.app",
  messagingSenderId: "296467217734",
  appId: "1:296467217734:web:d802e2ac8af7801afdf947",
  measurementId: "G-EXY8N9LCHL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, setDoc, getDoc, deleteDoc, updateDoc };