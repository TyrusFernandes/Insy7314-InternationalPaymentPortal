// src/firebase.js

// Core SDKs
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// App Check (anti-bot/abuse)
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// (Optional) Analytics guarded for browser support
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";

// ---- Firebase project config (public; apiKey is NOT a secret) ----
const firebaseConfig = {
  apiKey: "AIzaSyBazQV5NBvWdOh7CaFbz1zSgtq_U__G6Ek",
  authDomain: "insy7314-paymentport-group2.firebaseapp.com",
  projectId: "insy7314-paymentport-group2",
  storageBucket: "insy7314-paymentport-group2.firebasestorage.app",
  messagingSenderId: "280280617497",
  appId: "1:280280617497:web:9c530700baf6e26865d088",
  measurementId: "G-2PW72C37J0",
};

// ---- Initialize app once ----
export const app = initializeApp(firebaseConfig);

// ---- App Check FIRST (right after initializeApp) ----
// Replace with your real site key (looks like you have one already).
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6LesE-QrAAAAAF7h-maJ-VWEs62g_zHxgjLRhCRA"),
  isTokenAutoRefreshEnabled: true,
});

// ---- Then other services ----
export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence);

export const db = getFirestore(app);

// ---- (Optional) Analytics only if supported/in browser ----
if (typeof window !== "undefined") {
  analyticsIsSupported()
    .then((ok) => { if (ok) getAnalytics(app); })
    .catch(() => {});
}
