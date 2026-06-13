// Footer.jsx — Typing Exam Hub Global Footer
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import {
  Zap,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  Globe,
  Mail,
  Heart,
  Star,
  Flame,
} from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";

const githubUrl = import.meta.env.VITE_Github_Name;
const twitterUrl = import.meta.env.VITE_Twitter_Name;
const linkedinUrl = import.meta.env.VITE_LinkedIn_Name;
const email = import.meta.env.VITE_Mail_Name;

const FOOTER_LINKS = {
  Practice: [
    { label: "Typing Test", path: "/" },
    { label: "Custom Drills", path: "/drills" },
    // { label: "Code Typing", path: "/code" },
    { label: "Daily Challenge", path: "/daily" },
    { label: "Number & Symbol Practice", path: "/" },
  ],
  // Progress: [
  //   { label: "Analytics Dashboard", path: "/analytics" },
  //   { label: "Leaderboard", path: "/leaderboard" },
  //   { label: "Achievements", path: "/achievements" },
  //   { label: "Skill Tree", path: "/skills" },
  // ],
  Languages: [
    { label: "English", path: "/languages" },
    { label: "Hindi", path: "/languages" },
    { label: "Español", path: "/languages" },
  ],
  Company: [
    { label: "About Us", path: "/about" },
    // { label: "Blog", path: "/blog" },
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" },
    { label: "Contact", path: "/contact" },
  ],
};

export default function Footer() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {showTop && (
        <button
          className={`sk-footer-totop ${isDarkMode ? "dark" : "light"}`}
          onClick={scrollTop}
          title="Back to top"
        >
          <ArrowUp size={18} />
        </button>
      )}

      <footer
        className={`skg-footer ${isDarkMode ? "dark" : "light"} ${
          collapsed ? "sk-footer-collapsed" : ""
        }`}
      >
        <button
          className="sk-footer-toggle"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand footer" : "Collapse footer"}
        >
          {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {collapsed ? "Show Footer" : "Hide Footer"}
        </button>

        <div className="sk-footer-body">
          <div className="skg-footer-brand">
            <div className="sk-footer-logo" onClick={() => navigate("/")}>
              <div className="sk-footer-logo-icon">
                <Zap size={20} />
              </div>

              <div>
                <span className="sk-footer-logo-name">Typing Exam Hub</span>
                <span className="sk-footer-logo-sub">Typing Coach</span>
              </div>
            </div>

            <p className="sk-footer-desc">
              Master your typing speed, accuracy, and consistency with
              AI-powered coaching, real-time analytics, and personalized drills.
              Supporting English, Hindi & Spanish.
            </p>

            <div className="sk-footer-socials">
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="sk-social-btn"
              >
                <FaGithub size={17} />
              </a>

              <a
                href={twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="sk-social-btn"
              >
                <FaXTwitter size={17} />
              </a>

              <a
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="sk-social-btn"
              >
                <FaLinkedin size={17} />
              </a>

              <a href={`mailto:${email}`} className="sk-social-btn">
                <Mail size={17} />
              </a>
            </div>

            <div className="sk-footer-stats">
              <div className="sk-fstat">
                <Flame size={14} />
                <span>50K+ Typists</span>
              </div>
              <div className="sk-fstat">
                <Star size={14} />
                <span>4.9 ★ Rating</span>
              </div>
              <div className="sk-fstat">
                <Globe size={14} />
                <span>3 Languages</span>
              </div>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section} className="sk-footer-col">
              <div className="sk-footer-col-title">{section}</div>

              {links.map((l) => (
                <button
                  key={l.label}
                  className="skg-footer-link"
                  onClick={() => navigate(l.path)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          ))}

          <div className="sk-footer-col sk-footer-newsletter">
            <div className="sk-footer-col-title">Stay Updated</div>

            <p className="sk-footer-nl-desc">
              Get weekly typing tips, challenges and progress reports.
            </p>

            <div className="sk-footer-nl-form">
              <input
                className="sk-footer-nl-input"
                type="email"
                placeholder="your@email.com"
              />

              <button className="sk-footer-nl-btn">Subscribe</button>
            </div>
          </div>
        </div>

        <div className="sk-footer-bottom">
          <span>
            © {new Date().getFullYear()} Typing Exam Hub. All rights reserved.
          </span>

          <span className="sk-footer-made">
            Made with <Heart size={12} className="sk-heart" /> for typists
            worldwide
          </span>

          <div className="sk-footer-badges">
            <span className="sk-fbadge">🔒 Secure</span>
            <span className="sk-fbadge">⚡ Fast</span>
            <span className="sk-fbadge">🌍 Multilingual</span>
          </div>
        </div>
      </footer>
    </>
  );
}
