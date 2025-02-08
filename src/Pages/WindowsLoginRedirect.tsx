import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./WindowsLoginRedirect.scss";

const WindowsLoginRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate redirection to a Windows login
    setTimeout(() => {
      // This is where the actual Windows login API would be integrated.
      // Simulating successful login after 2 seconds
      alert("Redirecting to Windows login...");
      navigate("/chat"); // Replace with your chatbot page route after successful login
    }, 2000);
  }, [navigate]);

  return (
    <div className="windows-login-container">
      <h2>Windows Login</h2>
      <p>Redirecting you to log in through your Windows account...</p>
      <div className="loading-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default WindowsLoginRedirect;
