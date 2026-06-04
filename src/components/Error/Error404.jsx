// components/errors/Error404Page.jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Home, RefreshCw, Search, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Error404Page = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleReportIssue = () => {
    Swal.fire({
      title: 'Report Missing Page',
      text: 'Let us know what you were looking for',
      input: 'text',
      inputPlaceholder: 'Describe the page or feature you were trying to access...',
      showCancelButton: true,
      confirmButtonText: 'Send Report',
      confirmButtonColor: '#667eea',
      background: isDarkMode ? '#2d3748' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#2d3748',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Thank You!',
          text: 'We\'ve received your report and will look into it.',
          icon: 'success',
          confirmButtonColor: '#667eea',
          background: isDarkMode ? '#2d3748' : '#ffffff',
          color: isDarkMode ? '#e2e8f0' : '#2d3748',
        });
      }
    });
  };

  return (
    <div className={`authnest-error-page-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="authnest-error-page-content">
        <div className="authnest-error-page-text">
          <h1 className="authnest-error-page-title">404</h1>
          <h2 className="authnest-error-page-subtitle">Page Not Found</h2>
          <p className="authnest-error-page-description">
            Oops! The page you're looking for seems to have wandered off into the digital void. 
            It might have been moved, deleted, or you may have entered an incorrect URL.
          </p>

          <div className="authnest-error-page-details">
            <h3 className="authnest-error-page-details-title">What could have happened?</h3>
            <ul className="authnest-error-page-details-list">
              <li className="authnest-error-page-details-item">
                <Search size={18} />
                The page may have been moved or renamed
              </li>
              <li className="authnest-error-page-details-item">
                <AlertTriangle size={18} />
                You might have typed the URL incorrectly
              </li>
              <li className="authnest-error-page-details-item">
                <RefreshCw size={18} />
                The page could be temporarily unavailable
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
              Refresh Page
            </button>
            <button 
              className="authnest-error-page-button authnest-error-page-button-secondary"
              onClick={handleReportIssue}
            >
              <AlertTriangle size={20} />
              Report Issue
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
              <div className="authnest-error-page-face authnest-error-page-face-right">4</div>
              <div className="authnest-error-page-face authnest-error-page-face-left">?</div>
              <div className="authnest-error-page-face authnest-error-page-face-top">!</div>
              <div className="authnest-error-page-face authnest-error-page-face-bottom">?</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error404Page;