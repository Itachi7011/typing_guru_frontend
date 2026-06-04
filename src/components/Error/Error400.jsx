// components/errors/Error400Page.jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Home, RefreshCw, AlertTriangle, HelpCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Error400Page = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCommonIssues = () => {
    Swal.fire({
      title: 'Common Causes',
      html: `
        <div style="text-align: left;">
          <p><strong>This error typically occurs when:</strong></p>
          <ul>
            <li>• Invalid characters in the URL</li>
            <li>• Malformed request syntax</li>
            <li>• Deceptive request routing</li>
            <li>• Size limits exceeded</li>
            <li>• Invalid form data submitted</li>
            <li>• Cookie or cache issues</li>
          </ul>
          <p><strong>Try these solutions:</strong></p>
          <ul>
            <li>• Clear your browser cache and cookies</li>
            <li>• Check the URL for errors</li>
            <li>• Refresh the page</li>
            <li>• Use the back button to return</li>
          </ul>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Understand',
      confirmButtonColor: '#667eea',
      background: isDarkMode ? '#2d3748' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#2d3748',
      width: '600px'
    });
  };

  const handleValidateRequest = () => {
    Swal.fire({
      title: 'Request Validation',
      html: `
        <div style="text-align: left;">
          <p>Your request couldn't be processed due to validation issues.</p>
          <div style="background: rgba(0,0,0,0.1); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
            <p><strong>Request ID:</strong> BR-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            <p><strong>Issue Type:</strong> Client-side validation error</p>
            <p><strong>Recommended Action:</strong> Review input data and retry</p>
          </div>
        </div>
      `,
      icon: 'warning',
      confirmButtonText: 'Retry Request',
      confirmButtonColor: '#667eea',
      background: isDarkMode ? '#2d3748' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#2d3748',
    });
  };

  return (
    <div className={`authnest-error-page-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="authnest-error-page-content">
        <div className="authnest-error-page-text">
          <div className="authnest-error-page-status authnest-error-page-status-info">
            <AlertTriangle size={16} />
            Client Error Detected
          </div>
          <h1 className="authnest-error-page-title">400</h1>
          <h2 className="authnest-error-page-subtitle">Bad Request</h2>
          <p className="authnest-error-page-description">
            The server couldn't understand your request due to invalid syntax. 
            This might be caused by an issue with your browser, cookies, or the way the request was formatted.
          </p>

          <div className="authnest-error-page-details">
            <h3 className="authnest-error-page-details-title">Quick Fixes</h3>
            <ul className="authnest-error-page-details-list">
              <li className="authnest-error-page-details-item">
                <RefreshCw size={18} />
                Refresh the page and try again
              </li>
              <li className="authnest-error-page-details-item">
                <ArrowLeft size={18} />
                Go back to the previous page
              </li>
              <li className="authnest-error-page-details-item">
                <Home size={18} />
                Return to the homepage and navigate again
              </li>
              <li className="authnest-error-page-details-item">
                <HelpCircle size={18} />
                Clear your browser cache and cookies
              </li>
            </ul>
          </div>

          <div className="authnest-error-page-actions">
            <button 
              className="authnest-error-page-button authnest-error-page-button-primary"
              onClick={handleValidateRequest}
            >
              <RefreshCw size={20} />
              Retry Request
            </button>
            <button 
              className="authnest-error-page-button authnest-error-page-button-secondary"
              onClick={handleGoBack}
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
            <button 
              className="authnest-error-page-button authnest-error-page-button-secondary"
              onClick={handleGoHome}
            >
              <Home size={20} />
              Go Home
            </button>
            <button 
              className="authnest-error-page-button authnest-error-page-button-secondary"
              onClick={handleCommonIssues}
            >
              <HelpCircle size={20} />
              Common Issues
            </button>
          </div>
        </div>

        <div className="authnest-error-page-visual">
          <div className="authnest-error-page-floating-elements">
            <div className="authnest-error-page-floating-element"></div>
            <div className="authnest-error-page-floating-element"></div>
            <div className="authnest-error-page-floating-element"></div>
            <div className="authnest-error-page-cube">
              <div className="authnest-error-page-face authnest-error-page-face-front">4</div>
              <div className="authnest-error-page-face authnest-error-page-face-back">0</div>
              <div className="authnest-error-page-face authnest-error-page-face-right">0</div>
              <div className="authnest-error-page-face authnest-error-page-face-left">❌</div>
              <div className="authnest-error-page-face authnest-error-page-face-top">
                <AlertTriangle className="authnest-error-page-warning" size={40} />
              </div>
              <div className="authnest-error-page-face authnest-error-page-face-bottom">⚠️</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error400Page;