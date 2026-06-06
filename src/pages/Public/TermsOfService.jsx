import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import {
  Zap,
  Sun,
  Moon,
  FileText,
  Users,
  Ban,
  AlertTriangle,
  RefreshCw,
  Scale,
  Clock,
  Mail,
  CheckCircle,
} from "lucide-react";

export default function TermsOfService() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();

  return (
    <div className={`sk-root ${isDarkMode ? "dark" : "light"}`}>


      {/* HERO */}
      <div className="sk-hero">
        <div className="sk-hero-badge">
          <Scale size={12} /> Terms of Service
        </div>
        <h1 className="sk-hero-title">
          Fair Rules, <span>Clear Terms</span>
        </h1>
        <p className="sk-hero-sub">
          Straightforward terms written in plain language. By using SwiftKeys,
          you agree to these conditions.
        </p>
      </div>

      {/* CONTENT */}
      <div className="sk-content">
        <div className="sk-meta">
          <span>
            <Clock size={13} /> Last updated: <strong>June 2025</strong>
          </span>
          <span>
            <FileText size={13} /> Version <strong>1.4</strong>
          </span>
          <span>
            Effective: <strong>Immediately upon use</strong>
          </span>
        </div>

        <div className="sk-section">
          <div className="sk-section-head">
            <div className="sk-section-icon">
              <CheckCircle size={15} />
            </div>
            <div className="sk-section-title">Acceptance of Terms</div>
            <span className="sk-section-num">01</span>
          </div>
          <p>
            By accessing or using SwiftKeys ("the Service"), you agree to be
            bound by these Terms of Service. If you do not agree to any part of
            these terms, you may not use the Service.
          </p>
          <p>
            These terms apply to all users, including guests, registered users,
            and visitors. We reserve the right to update these terms with 14
            days notice via email or in-app notification.
          </p>
          <div className="sk-highlight">
            <p>
              Continuing to use SwiftKeys after changes are posted constitutes
              your acceptance of the updated terms.
            </p>
          </div>
        </div>

        <div className="sk-section">
          <div className="sk-section-head">
            <div className="sk-section-icon">
              <Users size={15} />
            </div>
            <div className="sk-section-title">Account Responsibilities</div>
            <span className="sk-section-num">02</span>
          </div>
          <p>When you create a SwiftKeys account, you are responsible for:</p>
          <ul>
            <li>Keeping your login credentials confidential and secure</li>
            <li>All activity that occurs under your account</li>
            <li>Providing accurate information during registration</li>
            <li>Notifying us immediately of any unauthorized account access</li>
            <li>
              Being at least 13 years old (or the minimum age in your
              jurisdiction)
            </li>
          </ul>
          <p>
            You may not create accounts using automated means or register
            multiple accounts to manipulate leaderboards or achievements.
          </p>
        </div>

        <div className="sk-section">
          <div className="sk-section-head">
            <div className="sk-section-icon">
              <CheckCircle size={15} />
            </div>
            <div className="sk-section-title">Permitted Use</div>
            <span className="sk-section-num">03</span>
          </div>
          <p>
            SwiftKeys is designed for personal typing practice and improvement.
            You are welcome to:
          </p>
          <ul>
            <li>
              Use all features for personal skill development and practice
            </li>
            <li>Share your WPM scores and achievements on social media</li>
            <li>
              Use SwiftKeys in educational settings (schools, coding bootcamps)
            </li>
            <li>
              Embed public leaderboard widgets on personal or educational sites
            </li>
          </ul>
        </div>

        <div className="sk-section">
          <div className="sk-section-head">
            <div className="sk-section-icon">
              <Ban size={15} />
            </div>
            <div className="sk-section-title">Prohibited Activities</div>
            <span className="sk-section-num">04</span>
          </div>
          <p>
            The following activities are strictly prohibited and may result in
            immediate account termination:
          </p>
          <ul>
            <li>
              Using bots, macros, or automation tools to manipulate typing
              scores
            </li>
            <li>
              Attempting to reverse-engineer, decompile, or extract source code
            </li>
            <li>
              Exploiting bugs or vulnerabilities — please report them instead
            </li>
            <li>Harassing other users or submitting offensive content</li>
            <li>
              Reselling, sublicensing, or commercially redistributing the
              Service
            </li>
            <li>
              Circumventing rate limits, security measures, or access controls
            </li>
          </ul>
        </div>

        <div className="sk-section">
          <div className="sk-section-head">
            <div className="sk-section-icon">
              <AlertTriangle size={15} />
            </div>
            <div className="sk-section-title">Disclaimers & Limitations</div>
            <span className="sk-section-num">05</span>
          </div>
          <p>
            SwiftKeys is provided "as is" without warranties of any kind. We
            strive for 99.9% uptime but cannot guarantee uninterrupted service.
          </p>
          <ul>
            <li>
              We are not liable for any loss of data due to technical failures
            </li>
            <li>
              AI coaching tips are suggestive only, not professional instruction
            </li>
            <li>
              Leaderboard rankings are for fun — they do not carry real-world
              value
            </li>
            <li>
              Our liability is limited to the amount paid (if any) in the prior
              3 months
            </li>
          </ul>
        </div>

        <div className="sk-section">
          <div className="sk-section-head">
            <div className="sk-section-icon">
              <RefreshCw size={15} />
            </div>
            <div className="sk-section-title">Termination & Changes</div>
            <span className="sk-section-num">06</span>
          </div>
          <p>
            You may delete your account at any time from your profile settings.
            We may suspend or terminate accounts that violate these terms
            without prior notice for severe violations.
          </p>
          <p>
            We reserve the right to modify, suspend, or discontinue any feature
            of SwiftKeys at any time. For significant changes, we'll provide at
            least 30 days notice to registered users.
          </p>
        </div>

        <div className="sk-cta">
          <div className="sk-cta-title">Questions about our terms?</div>
          <p className="sk-cta-sub">
            Our team is happy to clarify anything in plain language.
          </p>
          <a href="mailto:legal@swiftkeys.app" className="sk-cta-btn">
            <Mail size={15} /> Contact Legal Team
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
            <Link to="/privacy" className="sk-footer-link">
              Privacy
            </Link>
            <Link
              to="/terms"
              className={`sk-footer-link${location.pathname === "/terms" ? " active" : ""}`}
            >
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
