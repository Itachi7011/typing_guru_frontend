// components/errors/Error401Page.jsx
import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Home, RefreshCw, LogIn, Key, Shield, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Error401Page = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login attempt
    Swal.fire({
      title: 'Redirecting to Login',
      text: 'Taking you to the secure login page...',
      icon: 'info',
      timer: 2000,
      showConfirmButton: false,
      background: isDarkMode ? '#2d3748' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#2d3748',
    }).then(() => {
      navigate('/login');
    });
  };

  const handleLearnMore = () => {
    Swal.fire({
      title: 'About Authentication',
      html: `
        <div style="text-align: left;">
          <p>This page requires you to be logged in with valid credentials.</p>
          <p><strong>Why you're seeing this:</strong></p>
          <ul>
            <li>Your session may have expired</li>
            <li>You need to log in to access this resource</li>
            <li>This is a protected area of the application</li>
          </ul>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Understand',
      confirmButtonColor: '#667eea',
      background: isDarkMode ? '#2d3748' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#2d3748',
    });
  };

  return (
    <div className={`authnest-error-page-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="authnest-error-page-content">
        <div className="authnest-error-page-text">
          <div className="authnest-error-page-status authnest-error-page-status-warning">
            <AlertCircle size={16} />
            Authentication Required
          </div>
          <h1 className="authnest-error-page-title">401</h1>
          <h2 className="authnest-error-page-subtitle">Unauthorized Access</h2>
          <p className="authnest-error-page-description">
            You need to be logged in to access this page. This area requires valid 
            authentication credentials to ensure the security of your data and our platform.
          </p>

        

          <div className="authnest-error-page-actions">
            {/* <button 
              className="authnest-error-page-button authnest-error-page-button-primary"
              onClick={() => navigate('/client/login')}
            >
              <LogIn size={20} />
              Go to Login
            </button> */}
            <button 
              className="authnest-error-page-button authnest-error-page-button-secondary"
              onClick={handleGoHome}
            >
              <Home size={20} />
              Back to Home
            </button>
            <button 
              className="authnest-error-page-button authnest-error-page-button-secondary"
              onClick={handleLearnMore}
            >
              <Key size={20} />
              Learn More
            </button>
          </div>
        </div>

        <div className="authnest-error-page-visual">
          <div className="authnest-error-page-floating-elements">
            <div className="authnest-error-page-floating-element"></div>
            <div className="authnest-error-page-floating-element"></div>
            <div className="authnest-error-page-floating-element"></div>
            <div className="authnest-error-page-cube">
              <div className="authnest-error-page-face authnest-error-page-face-front">
                <Key className="authnest-error-page-key" size={60} />
              </div>
              <div className="authnest-error-page-face authnest-error-page-face-back">4</div>
              <div className="authnest-error-page-face authnest-error-page-face-right">0</div>
              <div className="authnest-error-page-face authnest-error-page-face-left">1</div>
              <div className="authnest-error-page-face authnest-error-page-face-top">
                <Shield size={40} />
              </div>
              <div className="authnest-error-page-face authnest-error-page-face-bottom">🔒</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error401Page;