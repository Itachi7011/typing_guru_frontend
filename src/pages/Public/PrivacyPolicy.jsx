import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import {
  Zap,
  Sun,
  Moon,
  Shield,
  Eye,
  Database,
  Lock,
  Mail,
  Cookie,
  RefreshCw,
  Clock,
  FileText,
} from "lucide-react";

export default function PrivacyPolicy() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();

  return (
    <div className={`sk-root ${isDarkMode ? "dark" : "light"}`}>


      {/* HERO */}
      <div className="sk-hero">
        <div className="sk-hero-badge">
          <Shield size={12} /> Privacy Policy
        </div>
        <h1 className="sk-hero-title">
          Your Privacy, <span>Protected</span>
        </h1>
        <p className="sk-hero-sub">
          We believe in full transparency. Here's exactly what we collect, why
          we need it, and how you stay in control.
        </p>
      </div>

      {/* CONTENT */}
      <div className="sk-content">
        <div className="sk-meta">
          <span>
            <Clock size={13} /> Last updated: <strong>June 2025</strong>
          </span>
          <span>
            <FileText size={13} /> Version <strong>2.0</strong>
          </span>
          <span>
            Applies to: <strong>swiftkeys.app</strong>
          </span>
        </div>

        <div className="sk-section">
          <div className="sk-section-head">
            <div className="sk-section-icon">
              <Eye size={15} />
            </div>
            <div className="sk-section-title">What We Collect</div>
            <span className="sk-section-num">01</span>
          </div>
          <p>
            We collect only what's necessary to provide and improve SwiftKeys.
            Here's a breakdown of the data we handle:
          </p>
          <ul>
            <li>
              Account information — email address, display name, and password
              (encrypted)
            </li>
            <li>
              Typing test results — WPM, accuracy, consistency scores, and test
              history
            </li>
            <li>
              Usage data — features used, session duration, and preferred
              settings
            </li>
            <li>
              Device info — browser type, operating system, and screen
              resolution for optimization
            </li>
          </ul>
          <p>
            Guest users' data is stored only in their browser's local storage
            and never sent to our servers.
          </p>
        </div>

        <div className="sk-section">
          <div className="sk-section-head">
            <div className="sk-section-icon">
              <Database size={15} />
            </div>
            <div className="sk-section-title">How We Use Your Data</div>
            <span className="sk-section-num">02</span>
          </div>
          <p>
            Your data powers the core SwiftKeys experience and nothing else.
            Specifically:
          </p>
          <ul>
            <li>
              Displaying your personal stats, progress charts, and achievement
              history
            </li>
            <li>
              Generating personalized AI coaching tips and drill recommendations
            </li>
            <li>Maintaining your streak, XP level, and leaderboard position</li>
            <li>
              Syncing your settings and progress across devices when logged in
            </li>
            <li>
              Sending optional weekly progress summaries via email (opt-in only)
            </li>
          </ul>
          <div className="sk-highlight">
            <p>
              We do not sell, rent, or share your personal data with third
              parties for advertising purposes. Ever.
            </p>
          </div>
        </div>

        <div className="sk-section">
          <div className="sk-section-head">
            <div className="sk-section-icon">
              <Cookie size={15} />
            </div>
            <div className="sk-section-title">Cookies & Local Storage</div>
            <span className="sk-section-num">03</span>
          </div>
          <p>
            We use minimal cookies required for authentication and preferences.
            No tracking cookies or third-party ad cookies are used.
          </p>
          <ul>
            <li>
              <strong>Auth token</strong> — keeps you logged in securely
              (expires in 30 days)
            </li>
            <li>
              <strong>Theme preference</strong> — remembers your dark/light mode
              selection
            </li>
            <li>
              <strong>Guest data</strong> — stored locally in your browser, not
              on our servers
            </li>
          </ul>
          <p>
            You can clear all local data at any time via your browser settings
            or from the SwiftKeys settings panel.
          </p>
        </div>

        <div className="sk-section">
          <div className="sk-section-head">
            <div className="sk-section-icon">
              <Lock size={15} />
            </div>
            <div className="sk-section-title">Security & Retention</div>
            <span className="sk-section-num">04</span>
          </div>
          <p>Security is built into every layer of SwiftKeys:</p>
          <ul>
            <li>
              Passwords are hashed with bcrypt — we never store plaintext
              credentials
            </li>
            <li>All data is transmitted over HTTPS with TLS 1.3 encryption</li>
            <li>Databases are encrypted at rest using AES-256</li>
            <li>
              We retain your account data for as long as your account is active
            </li>
            <li>Inactive accounts (2+ years) are automatically anonymized</li>
          </ul>
        </div>

        <div className="sk-section">
          <div className="sk-section-head">
            <div className="sk-section-icon">
              <RefreshCw size={15} />
            </div>
            <div className="sk-section-title">Your Rights</div>
            <span className="sk-section-num">05</span>
          </div>
          <p>
            You have full control over your data under GDPR, CCPA, and
            applicable privacy laws:
          </p>
          <ul>
            <li>Request a full export of all your data in JSON format</li>
            <li>Delete your account and all associated data permanently</li>
            <li>Correct any inaccurate information in your profile</li>
            <li>
              Opt out of optional emails from your account settings at any time
            </li>
            <li>Lodge a complaint with your local data protection authority</li>
          </ul>
        </div>

        <div className="sk-cta">
          <div className="sk-cta-title">Questions about your privacy?</div>
          <p className="sk-cta-sub">
            We respond to all privacy inquiries within 48 hours.
          </p>
          <a href="mailto:privacy@swiftkeys.app" className="sk-cta-btn">
            <Mail size={15} /> Contact Privacy Team
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="sk-footer">
        <div className="sk-footer-inner">
          <Link to="/" className="sk-footer-brand">
            <Zap size={14} /> SwiftKeys
          </Link>
          <div className="sk-footer-links">
            <Link
              to="/privacy"
              className={`sk-footer-link${location.pathname === "/privacy" ? " active" : ""}`}
            >
              Privacy
            </Link>
            <Link to="/terms" className="sk-footer-link">
              Terms
            </Link>
            <Link to="/languages" className="sk-footer-link">
              Languages
            </Link>
            <a href="mailto:hello@swiftkeys.app" className="sk-footer-link">
              Contact
            </a>
          </div>
          <span className="sk-footer-copy">
            © 2025 SwiftKeys. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
