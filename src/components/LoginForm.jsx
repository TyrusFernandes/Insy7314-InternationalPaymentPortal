// src/components/LoginForm.jsx
import React, { useState, useRef } from "react";
import DOMPurify from "dompurify";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

// same patterns as Registration
const USERNAME_REGEX  = /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/; // 3–20, start letter
const ACCOUNT_REGEX   = /^[0-9]{6,12}$/;                  // 6–12 digits
const AUTH_DOMAIN     = "@bankportal.local";              // keep consistent with Registration

export default function LoginForm({ onLoginSuccess }) {
  const [loginData, setLoginData] = useState({
    username: "",
    accountNumber: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // simple client back-off after failures
  const failCount = useRef(0);

  const setField = (name, value) => {
    setLoginData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (!USERNAME_REGEX.test(loginData.username.trim())) {
      e.username = "Username 3–20 chars, letters first; letters/digits/_/- only.";
    }
    if (!ACCOUNT_REGEX.test(loginData.accountNumber.trim())) {
      e.accountNumber = "Account number must be 6–12 digits.";
    }
    if (!loginData.password) {
      e.password = "Password required.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);

    // back-off delay (exponential-ish)
    const delayMs = Math.min(2000 * failCount.current, 8000);
    if (delayMs) await new Promise(r => setTimeout(r, delayMs));

    try {
      // normalise + sanitise
      const username = DOMPurify.sanitize(loginData.username.trim().toLowerCase());
      const account  = DOMPurify.sanitize(loginData.accountNumber.trim());
      const emailForAuth = `${username}${AUTH_DOMAIN}`;

      // 1) Auth
      const cred = await signInWithEmailAndPassword(auth, emailForAuth, loginData.password);
      const user = cred.user;

      // 2) Check account number matches customer profile
      const snap = await getDoc(doc(db, "customers", user.uid));
      if (snap.exists() && snap.data().accountNumber === account) {
        failCount.current = 0; // reset on success
        alert("Login successful. Welcome!");
        onLoginSuccess && onLoginSuccess();
      } else {
        // mismatch: sign out to avoid an authenticated session with wrong account binding
        await signOut(auth);
        failCount.current += 1;
        alert("Login failed. Please check your credentials."); // generic anti-enumeration
      }
    } catch (err) {
      // generic message to avoid user enumeration
      console.error("Login error:", err);
      failCount.current += 1;
      alert("Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-box">
      <h2>Customer Login</h2>
      <form onSubmit={handleSubmit} autoComplete="off" noValidate>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={loginData.username}
          onChange={(e) => setField("username", e.target.value)}
        />
        {errors.username && <p className="error">{errors.username}</p>}

        <input
          type="text"
          name="accountNumber"
          placeholder="Account Number"
          inputMode="numeric"
          value={loginData.accountNumber}
          onChange={(e) => setField("accountNumber", e.target.value)}
        />
        {errors.accountNumber && <p className="error">{errors.accountNumber}</p>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={loginData.password}
          onChange={(e) => setField("password", e.target.value)}
        />
        {errors.password && <p className="error">{errors.password}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Log In"}
        </button>
      </form>
    </div>
  );
}
