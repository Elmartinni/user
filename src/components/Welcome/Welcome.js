import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

function Welcome() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <h1>Welcome to Dating App</h1>
        <p>Find your perfect match today</p>
        <button onClick={handleGetStarted} className="get-started-btn">
          Get Started
        </button>
      </div>
    </div>
  );
}

export default Welcome; 