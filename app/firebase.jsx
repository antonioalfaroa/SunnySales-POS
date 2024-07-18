// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Import getAuth from firebase/auth
import { getFirestore } from "firebase/firestore"; // Import getFirestore from firebase/firestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWCdR8bjilG_5WJyEYYK6IQ4xp4wdaKvg",
  authDomain: "sunnysales-pos.firebaseapp.com",
  projectId: "sunnysales-pos",
  storageBucket: "sunnysales-pos.appspot.com",
  messagingSenderId: "498456385819",
  appId: "1:498456385819:web:78668e08c58435717edbbe",
  measurementId: "G-J03B07Q6HN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize auth using getAuth
const firestore = getFirestore(app); // Initialize firestore using getFirestore

export { auth, firestore };