// components/errors/Error503Page.jsx
import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Home, RefreshCw, Clock, Wrench, Server, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Error503Page = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 30,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        if (totalSeconds <= 0) {
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleStatusUpdate = () => {
    Swal.fire({
      title: 'Maintenance Status',
      html: `
        <div style="text-align: left;">
          <p><strong>Current Status:</strong> Planned Maintenance</p>
          <p><strong>Started:</strong> ${new Date().toLocaleTimeString()}</p>
          <p><strong>Expected Completion:</strong> ${new Date(Date.now() + 2.5 * 60 * 60 * 1000).toLocaleTimeString()}</p>
          <p><strong>Impact:</strong> Reduced functionality, some features unavailable</p>
          <p><strong>Updates:</strong> Follow our status page for real-time updates</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Got It',
      confirmButtonColor: '#667eea',
      background: isDarkMode ? '#2d3748' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#2d3748',
    });
  };

  const handleSubscribe = () => {
    Swal.fire({
      title: 'Get Notified',
      input: 'email',
      inputPlaceholder: 'your@email.com',
      inputLabel: 'We\'ll notify you when we\'re back online',
      showCancelButton: true,
      confirmButtonText: 'Subscribe',
      confirmButtonColor: '#667eea',
      background: isDarkMode ? '#2d3748' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#2d3748',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Subscribed!',
          text: 'You\'ll receive a notification when maintenance is complete.',
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
          <div className="authnest-error-page-status authnest-error-page-status-maintenance">
            <Wrench size={16} />
            Maintenance in Progress
          </div>
          <h1 className="authnest-error-page-title">503</h1>
          <h2 className="authnest-error-page-subtitle">Service Unavailable</h2>
          <p className="authnest-error-page-description">
            We're currently performing scheduled maintenance to improve your experience. 
            Our services will be back online shortly. Thank you for your patience.
          </p>

          <div className="authnest-error-page-details">
            <h3 className="authnest-error-page-details-title">Estimated Time Remaining</h3>
            <div className="authnest-error-page-countdown">
              <div className="authnest-error-page-countdown-item">
                <div className="authnest-error-page-countdown-number">{timeLeft.hours.toString().padStart(2, '0')}</div>
                <div className="authnest-error-page-countdown-label">HOURS</div>
              </div>
              <div className="authnest-error-page-countdown-item">
                <div className="authnest-error-page-countdown-number">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                <div className="authnest-error-page-countdown-label">MINUTES</div>
              </div>
              <div className="authnest-error-page-countdown-item">
                <div className="authnest-error-page-countdown-number">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                <div className="authnest-error-page-countdown-label">SECONDS</div>
              </div>
            </div>
          </div>

          <div className="authnest-error-page-actions">
            <button 
              className="authnest-error-page-button authnest-error-page-button-primary"
              onClick={handleRefresh}
            >
              <RefreshCw size={20} />
              Check Status
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
              onClick={handleStatusUpdate}
            >
              <Server size={20} />
              Status Update
            </button>
            <button 
              className="authnest-error-page-button authnest-error-page-button-secondary"
              onClick={handleSubscribe}
            >
              <Mail size={20} />
              Get Notified
            </button>
          </div>
        </div>

        <div className="authnest-error-page-visual">
          <div className="authnest-error-page-floating-elements">
            <div className="authnest-error-page-floating-element authnest-error-page-gear">⚙️</div>
            <div className="authnest-error-page-floating-element authnest-error-page-gear-reverse">🔧</div>
            <div className="authnest-error-page-floating-element">🛠️</div>
            <div className="authnest-error-page-cube">
              <div className="authnest-error-page-face authnest-error-page-face-front">5</div>
              <div className="authnest-error-page-face authnest-error-page-face-back">0</div>
              <div className="authnest-error-page-face authnest-error-page-face-right">3</div>
              <div className="authnest-error-page-face authnest-error-page-face-left">🔄</div>
              <div className="authnest-error-page-face authnest-error-page-face-top">
                <Wrench className="authnest-error-page-gear" size={40} />
              </div>
              <div className="authnest-error-page-face authnest-error-page-face-bottom">
                <Clock size={40} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error503Page;