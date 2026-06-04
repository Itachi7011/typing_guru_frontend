// components/errors/Error403Page.jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Home, RefreshCw, Shield, AlertTriangle, User, Mail, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Error403Page = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleRequestAccess = () => {
    Swal.fire({
      title: 'Request Access',
      html: `
        <div style="text-align: left;">
          <p>To request access to this resource, please provide:</p>
          <div style="margin: 1rem 0;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Reason for access</label>
            <textarea 
              style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 0.5rem; background: rgba(255,255,255,0.1); color: inherit; min-height: 100px;" 
              placeholder="Explain why you need access to this resource..."
            ></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Submit Request',
      confirmButtonColor: '#667eea',
      background: isDarkMode ? '#2d3748' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#2d3748',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Request Submitted',
          text: 'Your access request has been sent to the administrator. You will be notified once it\'s reviewed.',
          icon: 'success',
          confirmButtonColor: '#667eea',
          background: isDarkMode ? '#2d3748' : '#ffffff',
          color: isDarkMode ? '#e2e8f0' : '#2d3748',
        });
      }
    });
  };

  const handleCheckPermissions = () => {
    Swal.fire({
      title: 'Your Current Permissions',
      html: `
        <div style="text-align: left;">
          <p><strong>User Role:</strong> Basic User</p>
          <p><strong>Access Level:</strong> Standard</p>
          <p><strong>Available Actions:</strong></p>
          <ul>
            <li>✅ View public content</li>
            <li>✅ Access basic features</li>
            <li>❌ Access admin areas</li>
            <li>❌ Modify system settings</li>
            <li>❌ View sensitive data</li>
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
          <div className="authnest-error-page-status authnest-error-page-status-critical">
            <Shield size={16} />
            Access Denied
          </div>
          <h1 className="authnest-error-page-title">403</h1>
          <h2 className="authnest-error-page-subtitle">Forbidden</h2>
          <p className="authnest-error-page-description">
            You don't have permission to access this resource. This area requires 
            specific privileges or roles that your current account doesn't possess.
          </p>

          <div className="authnest-error-page-details">
            <h3 className="authnest-error-page-details-title">Required Permissions</h3>
            <div className="authnest-error-page-permissions">
              <div className="authnest-error-page-permission-item">
                <div className="authnest-error-page-permission-icon">👑</div>
                <div className="authnest-error-page-permission-text">Admin Role</div>
              </div>
              <div className="authnest-error-page-permission-item">
                <div className="authnest-error-page-permission-icon">🔧</div>
                <div className="authnest-error-page-permission-text">Manager Access</div>
              </div>
              <div className="authnest-error-page-permission-item">
                <div className="authnest-error-page-permission-icon">📊</div>
                <div className="authnest-error-page-permission-text">Data Privileges</div>
              </div>
              <div className="authnest-error-page-permission-item">
                <div className="authnest-error-page-permission-icon">⚙️</div>
                <div className="authnest-error-page-permission-text">System Settings</div>
              </div>
            </div>
          </div>

          <div className="authnest-error-page-actions">
            <button 
              className="authnest-error-page-button authnest-error-page-button-primary"
              onClick={handleRequestAccess}
            >
              <Mail size={20} />
              Request Access
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
              onClick={handleCheckPermissions}
            >
              <User size={20} />
              Check Permissions
            </button>
            <button 
              className="authnest-error-page-button authnest-error-page-button-secondary"
              onClick={handleRefresh}
            >
              <RefreshCw size={20} />
              Try Again
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
                <Shield className="authnest-error-page-shield" size={60} />
              </div>
              <div className="authnest-error-page-face authnest-error-page-face-back">4</div>
              <div className="authnest-error-page-face authnest-error-page-face-right">0</div>
              <div className="authnest-error-page-face authnest-error-page-face-left">3</div>
              <div className="authnest-error-page-face authnest-error-page-face-top">
                <AlertTriangle className="authnest-error-page-warning" size={40} />
              </div>
              <div className="authnest-error-page-face authnest-error-page-face-bottom">🚫</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error403Page;