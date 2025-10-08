import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../firebase'; // Import auth and db from your config

function RegistrationForm({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    accountNumber: '',
    username: '', // Used as the primary identifier (like an email prefix) for Firebase
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    if (errors[name]) {
        setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // Password Security Check (must be at least 8 chars and include a number)
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
      isValid = false;
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number (0-9).";
      isValid = false;
    }

    // Basic required field checks
    if (formData.fullName.trim().length === 0) {
        newErrors.fullName = "Full Name is required.";
        isValid = false;
    }
    if (formData.idNumber.trim().length === 0) {
        newErrors.idNumber = "ID Number is required.";
        isValid = false;
    }
    if (formData.accountNumber.trim().length === 0) {
        newErrors.accountNumber = "Account Number is required.";
        isValid = false;
    }
    if (formData.username.trim().length === 0) {
        newErrors.username = "Username is required.";
        isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
        try {
            // 1. REGISTER USER IN FIREBASE AUTH
            // We append a custom domain to the username to make it look like an email for Firebase Auth.
            const emailForAuth = formData.username + "@bankportal.com"; 

            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                emailForAuth,
                formData.password
            );
            const user = userCredential.user;

            // 2. SAVE ADDITIONAL FIELDS TO FIRESTORE DB
            // Store the sensitive, bank-specific data under the user's secure UID
            await setDoc(doc(db, "customers", user.uid), {
                fullName: formData.fullName,
                idNumber: formData.idNumber,
                accountNumber: formData.accountNumber,
                username: formData.username, // Save username for easy reference
                createdAt: new Date()
            });

            alert("Registration Successful! Please log in.");
            onRegisterSuccess();
        } catch (error) {
            // Handle specific Firebase errors (e.g., email already in use)
            let errorMessage = "Registration failed. Please try again.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "That Username is already taken. Please choose another.";
            }
            alert(errorMessage);
            console.error("Firebase Registration Error:", error);
        }
    }
  };

  return (
    <div className="form-box">
      <h2>Customer Registration</h2>
      <form onSubmit={handleSubmit}>
        
        {/* Full Name */}
        <input 
          type="text" 
          name="fullName" 
          placeholder="Full Name" 
          value={formData.fullName} 
          onChange={handleChange} 
          required 
        />
        {errors.fullName && <p className="error">{errors.fullName}</p>} 
        
        {/* Username (NEW) */}
        <input 
          type="text" 
          name="username" 
          placeholder="Username" 
          value={formData.username} 
          onChange={handleChange} 
          required 
        />
        {errors.username && <p className="error">{errors.username}</p>}

        {/* ID Number */}
        <input 
          type="text" 
          name="idNumber" 
          placeholder="ID Number" 
          value={formData.idNumber} 
          onChange={handleChange} 
          required 
        />
        {errors.idNumber && <p className="error">{errors.idNumber}</p>}
        
        {/* Account Number */}
        <input 
          type="text" 
          name="accountNumber" 
          placeholder="Account Number" 
          value={formData.accountNumber} 
          onChange={handleChange} 
          required 
        />
        {errors.accountNumber && <p className="error">{errors.accountNumber}</p>}

        {/* Password */}
        <input 
          type="password" 
          name="password" 
          placeholder="Password (min 8 chars, 1 number)" 
          value={formData.password} 
          onChange={handleChange} 
          required 
        />
        {errors.password && <p className="error">{errors.password}</p>}

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegistrationForm;