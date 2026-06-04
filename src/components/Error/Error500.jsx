// components/errors/Error500Page.jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Home, RefreshCw, Server, AlertTriangle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Error500Page = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleContactSupport = () => {
    Swal.fire({
      title: 'Contact Support',
      html: `
        <div style="text-align: left;">
          <p>Our technical team has been notified about this issue.</p>
          <p>If the problem persists, please contact our support team:</p>
          <ul>
            <li>Email: support@authnest.com</li>
            <li>Phone: +1 (555) 123-HELP</li>
          </ul>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Got It',
      confirmButtonColor: '#667eea',
      background: isDarkMode ? '#2d3748' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#2d3748',
    });
  };

  const handleTechnicalDetails = () => {
    Swal.fire({
      title: 'Technical Information',
      html: `
        <div style="text-align: left; font-family: monospace; font-size: 0.9rem;">
          <p><strong>Error Code:</strong> 500 - Internal Server Error</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Request ID:</strong> AN-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          <p><strong>Status:</strong> Our engineering team has been alerted</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Close',
      confirmButtonColor: '#667eea',
      background: isDarkMode ? '#2d3748' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#2d3748',
    });
  };

  return (
    <div className={`authnest-error-page-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="authnest-error-page-content">
        <div className="authnest-error-page-text">
          <h1 className="authnest-error-page-title">500</h1>
          <h2 className="authnest-error-page-subtitle">Internal Server Error</h2>
          <p className="authnest-error-page-description">
            Something unexpected happened on our servers. Our technical team has been notified 
            and is working to resolve the issue. Please try again in a few moments.
          </p>

          <div className="authnest-error-page-details">
            <h3 className="authnest-error-page-details-title">What's happening?</h3>
            <ul className="authnest-error-page-details-list">
              <li className="authnest-error-page-details-item">
                <Server size={18} />
                Our servers encountered an unexpected condition
              </li>
              <li className="authnest-error-page-details-item">
                <AlertTriangle size={18} />
                This is usually temporary and will be resolved shortly
              </li>
              <li className="authnest-error-page-details-item">
                <RefreshCw size={18} />
                Automatic recovery processes are running
              </li>
              <li className="authnest-error-page-details-item">
                <Mail size={18} />
                Our team has been automatically notified
              </li>
            </ul>
          </div>

          <div className="authnest-error-page-actions">
            <button 
              className="authnest-error-page-button authnest-error-page-button-primary"
              onClick={handleGoHome}
            >
              <Home size={20} />
              Go Home
            </button>
            <button 
              className="authnest-error-page-button authnest-error-page-button-secondary"
              onClick={handleRefresh}
            >
              <RefreshCw size={20} />
              Try Again
            </button>
            <button 
              className="authnest-error-page-button authnest-error-page-button-secondary"
              onClick={handleContactSupport}
            >
              <Mail size={20} />
              Contact Support
            </button>
            <button 
              className="authnest-error-page-button authnest-error-page-button-secondary"
              onClick={handleTechnicalDetails}
            >
              <Server size={20} />
              Technical Info
            </button>
          </div>
        </div>

        <div className="authnest-error-page-visual">
          <div className="authnest-error-page-floating-elements">
            <div className="authnest-error-page-floating-element authnest-error-page-pulse"></div>
            <div className="authnest-error-page-floating-element authnest-error-page-pulse"></div>
            <div className="authnest-error-page-floating-element authnest-error-page-pulse"></div>
            <div className="authnest-error-page-cube">
              <div className="authnest-error-page-face authnest-error-page-face-front">5</div>
              <div className="authnest-error-page-face authnest-error-page-face-back">0</div>
              <div className="authnest-error-page-face authnest-error-page-face-right">0</div>
              <div className="authnest-error-page-face authnest-error-page-face-left">!</div>
              <div className="authnest-error-page-face authnest-error-page-face-top">⚡</div>
              <div className="authnest-error-page-face authnest-error-page-face-bottom">🔧</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error500Page;