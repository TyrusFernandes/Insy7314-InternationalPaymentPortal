// src/components/RegistrationForm.jsx
import React, { useState } from "react";
import DOMPurify from "dompurify";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

// ---- REGEX WHITELISTS ----
const NAME_REGEX      = /^[A-Za-z][A-Za-z\s'-]{1,49}$/;     // 2–50 chars, letters/space/'/-
const SA_ID_REGEX     = /^[0-9]{13}$/;                      // ZA ID: 13 digits (adjust if needed)
const ACCOUNT_REGEX   = /^[0-9]{6,12}$/;                    // 6–12 digits
const USERNAME_REGEX  = /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/;    // 3–20, start letter
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

function RegistrationForm({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    fullName: "",
    idNumber: "",
    accountNumber: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const setField = (name, value) => {
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: null }));
  };

  const validateForm = () => {
    const e = {};

    if (!NAME_REGEX.test(formData.fullName.trim()))
      e.fullName = "Full Name: letters/space/'/- (2–50 chars).";

    if (!SA_ID_REGEX.test(formData.idNumber.trim()))
      e.idNumber = "ID Number must be 13 digits (ZA).";

    if (!ACCOUNT_REGEX.test(formData.accountNumber.trim()))
      e.accountNumber = "Account Number must be 6–12 digits.";

    if (!USERNAME_REGEX.test(formData.username.trim()))
      e.username = "Username 3–20 chars, letters first; letters/digits/_/- allowed.";

    if (!STRONG_PASSWORD.test(formData.password))
      e.password = "Min 8 chars incl. upper, lower, number & special (!@#$%^&*).";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;

    try {
      // Create synthetic email from username (normalise + sanitise)
      const username = DOMPurify.sanitize(formData.username.trim().toLowerCase());
      const emailForAuth = `${username}@bankportal.local`;

      const cred = await createUserWithEmailAndPassword(auth, emailForAuth, formData.password);
      const user = cred.user;

      // Prepare clean values (sanitise & trim)
      const clean = {
        fullName:      DOMPurify.sanitize(formData.fullName.trim()),
        idNumber:      DOMPurify.sanitize(formData.idNumber.trim()),
        accountNumber: DOMPurify.sanitize(formData.accountNumber.trim()),
        username, // already normalised
        createdAt:     serverTimestamp()
      };

      // Store one customer doc under the auth UID
      await setDoc(doc(db, "customers", user.uid), clean, { merge: false });

      alert("Registration successful! Please log in.");
      onRegisterSuccess && onRegisterSuccess();
    } catch (error) {
      console.error("Registration error:", error);
      // Avoid user-enumeration style messages; keep it generic
      alert("Registration failed. Please try again or choose a different username.");
    }
  };

  return (
    <div className="form-box">
      <h2>Customer Registration</h2>
      <form onSubmit={handleSubmit} autoComplete="off" noValidate>
        <input
          type="text" name="fullName" placeholder="Full Name"
          value={formData.fullName} onChange={(e)=>setField("fullName", e.target.value)}
        />
        {errors.fullName && <p className="error">{errors.fullName}</p>}

        <input
          type="text" name="username" placeholder="Username"
          value={formData.username} onChange={(e)=>setField("username", e.target.value)}
        />
        {errors.username && <p className="error">{errors.username}</p>}

        <input
          type="text" name="idNumber" placeholder="ID Number (13 digits)"
          value={formData.idNumber} onChange={(e)=>setField("idNumber", e.target.value)}
          inputMode="numeric"
        />
        {errors.idNumber && <p className="error">{errors.idNumber}</p>}

        <input
          type="text" name="accountNumber" placeholder="Account Number"
          value={formData.accountNumber} onChange={(e)=>setField("accountNumber", e.target.value)}
          inputMode="numeric"
        />
        {errors.accountNumber && <p className="error">{errors.accountNumber}</p>}

        <input
          type="password" name="password"
          placeholder="Password (Upper+lower+number+special, ≥8)"
          value={formData.password} onChange={(e)=>setField("password", e.target.value)}
        />
        {errors.password && <p className="error">{errors.password}</p>}

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegistrationForm;
