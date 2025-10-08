import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import PaymentForm from './components/PaymentForm';
import './App.css'; 

// Define the different "screens" or views
const VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register',
  PAYMENT: 'payment',
};

function App() {
  // State to track the current view (defaults to Login)
  const [currentView, setCurrentView] = useState(VIEWS.LOGIN);

  // Function to render the correct component based on the currentView state
  const renderView = () => {
    switch (currentView) {
      case VIEWS.REGISTER:
        return (
          <RegistrationForm
            // On successful registration, move back to the Login screen
            onRegisterSuccess={() => setCurrentView(VIEWS.LOGIN)}
          />
        );
      case VIEWS.PAYMENT:
        return (
          <PaymentForm
            // On Log Out, move back to the Login screen
            onLogout={() => setCurrentView(VIEWS.LOGIN)}
          />
        );
      case VIEWS.LOGIN:
      default:
        return (
          <LoginForm
            // On successful login, move to the Payment screen
            onLoginSuccess={() => setCurrentView(VIEWS.PAYMENT)}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <nav>
        {/* CONDITIONAL RENDERING: Login/Register buttons only appear if 
            the user is NOT on the payment screen. */}
        {currentView !== VIEWS.PAYMENT && (
          <>
            <button onClick={() => setCurrentView(VIEWS.LOGIN)}>Login</button>
            <button onClick={() => setCurrentView(VIEWS.REGISTER)}>Register</button>
          </>
        )}
      </nav>

      {/* Render the selected component */}
      {renderView()}

      <footer>
        <p>International Bank Portal - Secure Payments</p>
      </footer>
    </div>
  );
}

export default App;