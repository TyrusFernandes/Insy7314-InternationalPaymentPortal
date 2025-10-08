import React, { useState } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from '../firebase'; // Import auth for user ID, db for Firestore

function PaymentForm({ onLogout }) {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    currency: 'USD',
    payeeAccount: '',
    swiftCode: '', // The key SWIFT field
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prevData => ({ ...prevData, [name]: value }));
    if (errors[name]) setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
  };

  const validatePayment = () => {
    let newErrors = {};
    let isValid = true;

    if (!paymentData.amount || Number(paymentData.amount) <= 0) {
        newErrors.amount = "Enter a valid amount.";
        isValid = false;
    }
    if (paymentData.payeeAccount.trim().length === 0) {
        newErrors.payeeAccount = "Payee Account is required.";
        isValid = false;
    }
    
    // SWIFT Code Validation (Regex Whitelisting - Requirement #2)
    // SWIFT/BIC codes are 8 or 11 characters, usually uppercase letters and numbers.
    const swiftRegex = /^[A-Z0-9]{8}([A-Z0-9]{3})?$/;
    if (!swiftRegex.test(paymentData.swiftCode.toUpperCase())) {
        newErrors.swiftCode = "Invalid SWIFT Code format (must be 8 or 11 characters).";
        isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handlePayNow = async () => {
    if (!validatePayment()) {
        return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
        alert("Error: You must be logged in to make a payment.");
        onLogout();
        return;
    }

    try {
        // Add transaction data to the 'transactions' collection in Firestore
        await addDoc(collection(db, "transactions"), {
            userId: currentUser.uid, // Links transaction to the user
            ...paymentData,
            status: 'Pending SWIFT Verification',
            timestamp: new Date()
        });
        
        alert('Payment successfully queued for processing. Data saved to Firestore!');
        // Clear the form and log out, or show a success message
        setPaymentData({ amount: '', currency: 'USD', payeeAccount: '', swiftCode: '' });
        // Instead of logging out, let's keep the user on the page
    } catch (error) {
        alert("Payment failed to submit: " + error.message);
        console.error("Payment Submission Error:", error);
    }
  };

  return (
    <div className="payment-area">
      <h1>International Payment</h1>
      <button onClick={onLogout} style={{ float: 'right' }}>Log Out</button>

      <h3>Payment Details</h3>
      <input type="number" name="amount" placeholder="Amount to Pay" onChange={handleChange} value={paymentData.amount} required />
      {errors.amount && <p className="error">{errors.amount}</p>}
      
      <select name="currency" onChange={handleChange} value={paymentData.currency}>
        <option value="USD">USD</option>
        <option value="ZAR">ZAR (South Africa)</option>
        <option value="EUR">EUR</option>
        {/* ...other currencies */}
      </select>

      <h3>Payee Information</h3>
      <input type="text" name="payeeAccount" placeholder="Payee Account Number" onChange={handleChange} value={paymentData.payeeAccount} required />
      {errors.payeeAccount && <p className="error">{errors.payeeAccount}</p>}

      <input type="text" name="swiftCode" placeholder="SWIFT Code (8 or 11 chars)" onChange={handleChange} value={paymentData.swiftCode} required />
      {errors.swiftCode && <p className="error">{errors.swiftCode}</p>}

      <button onClick={handlePayNow} className="pay-button">
        Pay Now
      </button>
    </div>
  );
}

export default PaymentForm;