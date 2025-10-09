// src/components/PaymentForm.jsx
import React, { useState } from "react";
import DOMPurify from "dompurify";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const SWIFT_REGEX   = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const ACCOUNT_REGEX = /^[0-9]{6,12}$/;
const AMOUNT_REGEX  = /^(?:0|[1-9]\d{0,8})(?:\.\d{2})$/;
const CURRENCIES    = new Set(["USD","ZAR","EUR","GBP","TRY","AED","CAD","AUD","JPY","CHF","CNY"]);

function PaymentForm({ onLogout }) {
  const [paymentData, setPaymentData] = useState({
    amount: "",
    currency: "USD",
    payeeAccount: "",
    swiftCode: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false); // NEW

  const handleChange = (e) => {
    const { name, value } = e.target;
    const normalised =
      name === "currency" ? value.toUpperCase()
    : name === "swiftCode" ? value.toUpperCase()
    : value;

    setPaymentData((prev) => ({ ...prev, [name]: normalised }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validatePayment = () => {
    const newErrors = {};

    if (!AMOUNT_REGEX.test(String(paymentData.amount))) {
      newErrors.amount = "Amount must be positive with 2 decimals (e.g., 125.00)";
    }
    if (!CURRENCIES.has(paymentData.currency.toUpperCase())) {
      newErrors.currency = "Unsupported currency";
    }
    if (!ACCOUNT_REGEX.test(paymentData.payeeAccount.trim())) {
      newErrors.payeeAccount = "Account number must be 6–12 digits";
    }
    if (!SWIFT_REGEX.test(paymentData.swiftCode.trim().toUpperCase())) {
      newErrors.swiftCode = "SWIFT/BIC must be 8 or 11 characters (e.g., ABSAZAJJ or ABSAZAJJXXX)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayNow = async () => {
    if (submitting) return; // NEW: block double click
    if (!validatePayment()) return;

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to make a payment.");
      onLogout && onLogout();
      return;
    }

    const clean = {
      amount: DOMPurify.sanitize(String(paymentData.amount)).trim(),
      currency: DOMPurify.sanitize(paymentData.currency.toUpperCase()),
      payeeAccount: DOMPurify.sanitize(paymentData.payeeAccount.trim()),
      swiftCode: DOMPurify.sanitize(paymentData.swiftCode.toUpperCase().trim()),
    };

    try {
      setSubmitting(true); // NEW
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        ...clean,
        status: "Pending SWIFT Verification",
        createdAt: serverTimestamp(),
      });

      alert("Payment successfully queued for processing. Data saved to Firestore!");
      setPaymentData({ amount: "", currency: "USD", payeeAccount: "", swiftCode: "" });
    } catch (error) {
      console.error("Payment Submission Error:", error);
      alert("Payment failed to submit: " + error.message);
    } finally {
      setSubmitting(false); // NEW
    }
  };

  return (
    <div className="payment-area">
      <h1>International Payment</h1>
      <button onClick={onLogout} style={{ float: "right" }}>Log Out</button>

      <h3>Payment Details</h3>
      <input
        type="text"
        name="amount"
        placeholder="Amount (e.g., 100.00)"
        onChange={handleChange}
        value={paymentData.amount}
        inputMode="decimal"
        autoComplete="off"
        maxLength={12}                     // NEW: cap length
        aria-invalid={!!errors.amount}     // NEW: a11y
      />
      {errors.amount && <p className="error">{errors.amount}</p>}

      <select
        name="currency"
        onChange={handleChange}
        value={paymentData.currency}
        aria-invalid={!!errors.currency}   // NEW
      >
        {[...CURRENCIES].map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      {errors.currency && <p className="error">{errors.currency}</p>}

      <h3>Payee Information</h3>
      <input
        type="text"
        name="payeeAccount"
        placeholder="Payee Account Number"
        onChange={handleChange}
        value={paymentData.payeeAccount}
        inputMode="numeric"
        autoComplete="off"
        maxLength={12}                     // NEW
        aria-invalid={!!errors.payeeAccount}
      />
      {errors.payeeAccount && <p className="error">{errors.payeeAccount}</p>}

      <input
        type="text"
        name="swiftCode"
        placeholder="SWIFT/BIC (8 or 11 chars)"
        onChange={handleChange}
        value={paymentData.swiftCode}
        autoComplete="off"
        maxLength={11}                     // NEW
        aria-invalid={!!errors.swiftCode}
      />
      {errors.swiftCode && <p className="error">{errors.swiftCode}</p>}

      <button onClick={handlePayNow} className="pay-button" disabled={submitting}>
        {submitting ? "Submitting…" : "Pay Now"}
      </button>
    </div>
  );
}

export default PaymentForm;
