// src/App.js
import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import PaymentForm from "./components/PaymentForm";
import EmployeeDashboard from "./components/EmployeeDashboard";
import "./App.css";

// Define all available views
const VIEWS = {
  LOGIN: "login",
  PAYMENT: "payment",
  EMPLOYEE: "employee",
};

function App() {
  const [currentView, setCurrentView] = useState(VIEWS.LOGIN);
  const [isEmployee, setIsEmployee] = useState(false);

  // Handle user login success
  const handleLoginSuccess = (role = "customer") => {
    if (role === "employee") {
      setIsEmployee(true);
      setCurrentView(VIEWS.EMPLOYEE);
    } else {
      setIsEmployee(false);
      setCurrentView(VIEWS.PAYMENT);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentView(VIEWS.LOGIN);
    setIsEmployee(false);
  };

  // Decide which screen to render
  const renderView = () => {
    switch (currentView) {
      case VIEWS.PAYMENT:
        return <PaymentForm onLogout={handleLogout} />;

      case VIEWS.EMPLOYEE:
        return <EmployeeDashboard onLogout={handleLogout} />;

      case VIEWS.LOGIN:
      default:
        return (
          <LoginForm
            onLoginSuccess={(role) => handleLoginSuccess(role)}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <nav>
        {currentView === VIEWS.LOGIN && (
          <button onClick={() => setCurrentView(VIEWS.LOGIN)}>Login</button>
        )}
      </nav>

      <main className="content">{renderView()}</main>

      <footer className="footer">
        <p>International Bank Portal — Secure Payments</p>
      </footer>
    </div>
  );
}

export default App;
