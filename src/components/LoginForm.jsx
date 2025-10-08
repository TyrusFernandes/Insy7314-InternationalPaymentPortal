import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Needed to verify the account number
import { auth, db } from '../firebase'; 

function LoginForm({ onLoginSuccess }) {
  const [loginData, setLoginData] = useState({
    username: '', 
    accountNumber: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loginData.username || !loginData.accountNumber || !loginData.password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        // 1. FIREBASE AUTHENTICATION
        const emailForAuth = loginData.username + "@bankportal.com";

        const userCredential = await signInWithEmailAndPassword(
            auth, 
            emailForAuth,
            loginData.password
        );

        const user = userCredential.user;

        // 2. FIREBASE FIRESTORE CHECK (Verify Account Number)
        // This is a crucial security step: we check the DB to ensure the provided account number matches the authenticated user's record.
        const docRef = doc(db, "customers", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().accountNumber === loginData.accountNumber) {
            alert("Login Successful! Welcome to the Payment Portal.");
            onLoginSuccess();
        } else {
            // This case handles a valid username/password but an incorrect account number
            alert("Login Failed: Invalid Account Number.");
            // OPTIONAL: You may want to sign the user out immediately here if the password was correct but the account was wrong
        }
        
    } catch (error) {
        // Handle failed login errors from Firebase (e.g., 'auth/invalid-credential')
        alert("Login Failed: Invalid Username or Password.");
        console.error("Firebase Login Error:", error);
    }
  };

  return (
    <div className="form-box">
      <h2>Customer Login</h2>
      <form onSubmit={handleSubmit}>
        
        {/* Username */}
        <input type="text" name="username" placeholder="Username" value={loginData.username} onChange={handleChange} required />
        
        {/* Account Number */}
        <input type="text" name="accountNumber" placeholder="Account Number" value={loginData.accountNumber} onChange={handleChange} required />
        
        {/* Password */}
        <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleChange} required />
        
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}

export default LoginForm;