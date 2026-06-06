import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import {
  Zap,
  Sun,
  Moon,
  Globe,
  CheckCircle,
  Clock,
  Keyboard,
  Users,
  BookOpen,
} from "lucide-react";

const LIVE_LANGS = [
  {
    flag: "🇺🇸",
    name: "English",
    native: "English",
    desc: "The most widely used language on SwiftKeys. Includes 10,000+ word pools, common phrases, code snippets, and literature excerpts for all skill levels.",
    speakers: "1.5B",
    words: "10K+",
    tests: "2M+",
  },
  {
    flag: "🇮🇳",
    name: "Hindi",
    native: "हिन्दी",
    desc: "Full Devanagari script support with carefully curated word lists for casual and professional practice. Optimized for Indian keyboard layouts.",
    speakers: "600M",
    words: "5K+",
    tests: "320K+",
  },
  {
    flag: "🇪🇸",
    name: "Spanish",
    native: "Español",
    desc: "Covers Latin American and European Spanish variants. Includes accented characters, common vocabulary, and professional writing content.",
    speakers: "500M",
    words: "7K+",
    tests: "480K+",
  },
];

const SOON_LANGS = [
  { flag: "🇫🇷", name: "French" },
  { flag: "🇩🇪", name: "German" },
  { flag: "🇯🇵", name: "Japanese" },
  { flag: "🇵🇹", name: "Portuguese" },
  { flag: "🇨🇳", name: "Chinese" },
  { flag: "🇰🇷", name: "Korean" },
  { flag: "🇮🇹", name: "Italian" },
  { flag: "🇷🇺", name: "Russian" },
  { flag: "🇸🇦", name: "Arabic" },
  { flag: "🇳🇱", name: "Dutch" },
];

export default function Languages() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();

  return (
    <div className={`sk-root ${isDarkMode ? "dark" : "light"}`}>


      {/* HERO */}
      <div className="sk-hero">
        <div className="sk-hero-badge">
          <Globe size={12} /> Language Support
        </div>
        <h1 className="sk-hero-title">
          Type in Your <span>Language</span>
        </h1>
        <p className="sk-hero-sub">
          SwiftKeys supports multiple languages with native word pools, script
          optimization, and localized content for authentic practice.
        </p>
      </div>

      {/* CONTENT */}
      <div className="sk-content">
        {/* Stats */}
        <div className="sk-stats-row">
          <div className="sk-stat-block">
            <div className="sk-stat-block-val">3</div>
            <div className="sk-stat-block-lbl">Live Languages</div>
          </div>
          <div className="sk-stat-block">
            <div className="sk-stat-block-val">10+</div>
            <div className="sk-stat-block-lbl">Coming Soon</div>
          </div>
          <div className="sk-stat-block">
            <div className="sk-stat-block-val">2.8M+</div>
            <div className="sk-stat-block-lbl">Tests Completed</div>
          </div>
        </div>

        {/* Live Languages */}
        <div className="sk-section-head" style={{ marginBottom: "1.25rem" }}>
          <div className="sk-section-icon">
            <CheckCircle size={15} />
          </div>
          <div className="sk-section-title">Currently Supported</div>
        </div>

        <div className="sk-lang-grid">
          {LIVE_LANGS.map((lang) => (
            <div key={lang.name} className="sk-lang-card active">
              <div className="sk-lang-flag">{lang.flag}</div>
              <div className="sk-lang-name">{lang.name}</div>
              <div className="sk-lang-native">{lang.native}</div>
              <p className="sk-lang-desc">{lang.desc}</p>
              <span className="sk-lang-badge live">
                <CheckCircle size={10} /> Live
              </span>
              <div className="sk-lang-stats">
                <div className="sk-lang-stat">
                  <strong>{lang.speakers}</strong>
                  Speakers
                </div>
                <div className="sk-lang-stat">
                  <strong>{lang.words}</strong>
                  Words
                </div>
                <div className="sk-lang-stat">
                  <strong>{lang.tests}</strong>
                  Tests
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features section */}
        <div className="sk-section" style={{ marginTop: "1.25rem" }}>
          <div className="sk-section-head">
            <div className="sk-section-icon">
              <Keyboard size={15} />
            </div>
            <div className="sk-section-title">Language Features</div>
          </div>
          <ul>
            <li>
              Native character rendering with proper font stacks for each script
            </li>
            <li>
              Language-specific word frequency lists for realistic practice
            </li>
            <li>
              Punctuation and capitalization rules matched to each language
            </li>
            <li>
              Localized code snippets using region-appropriate variable naming
            </li>
            <li>
              Separate accuracy tracking to account for diacritic characters
            </li>
          </ul>
        </div>

        {/* Coming Soon */}
        <div className="sk-section" style={{ marginTop: "1.25rem" }}>
          <div className="sk-section-head">
            <div className="sk-section-icon">
              <Clock size={15} />
            </div>
            <div className="sk-section-title">Coming Soon</div>
            <span className="sk-section-num">10 languages</span>
          </div>
          <p>
            We're actively working on expanding language support. These are
            planned for upcoming releases:
          </p>
          <div className="sk-soon-grid">
            {SOON_LANGS.map((lang) => (
              <div key={lang.name} className="sk-soon-item">
                <span className="sk-soon-flag">{lang.flag}</span>
                <span>{lang.name}</span>
                <span
                  className="sk-lang-badge soon"
                  style={{ marginLeft: "auto", fontSize: "0.6rem" }}
                >
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Request a language CTA */}
        <div className="sk-section" style={{ marginTop: "1.25rem" }}>
          <div className="sk-section-head">
            <div className="sk-section-icon">
              <Users size={15} />
            </div>
            <div className="sk-section-title">Request a Language</div>
          </div>
          <p>
            Don't see your language? Community requests directly influence our
            roadmap. Languages with the most votes get prioritized for the next
            release cycle.
          </p>
          <div className="sk-highlight">
            <p>
              Vote for your language or suggest a new one — we read every
              submission.
            </p>
          </div>
        </div>

        <div className="sk-cta">
          <div className="sk-cta-title">Want to contribute?</div>
          <p className="sk-cta-sub">
            Help us build word lists, review translations, or test new language
            modes.
          </p>
          <a href="mailto:languages@swiftkeys.app" className="sk-cta-btn">
            <BookOpen size={15} /> Contribute a Language
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
            <Link to="/terms" className="sk-footer-link">
              Terms
            </Link>
            <Link
              to="/languages"
              className={`sk-footer-link${location.pathname === "/languages" ? " active" : ""}`}
            >
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
