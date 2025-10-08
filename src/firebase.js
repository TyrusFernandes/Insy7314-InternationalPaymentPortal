// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBazQV5NBvWdOh7CaFbz1zSgtq_U__G6Ek",
  authDomain: "insy7314-paymentport-group2.firebaseapp.com",
  projectId: "insy7314-paymentport-group2",
  storageBucket: "insy7314-paymentport-group2.firebasestorage.app",
  messagingSenderId: "280280617497",
  appId: "1:280280617497:web:9c530700baf6e26865d088",
  measurementId: "G-2PW72C37J0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app); // Exports 'auth'
export const db = getFirestore(app); // Exports 'db'