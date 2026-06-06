import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import {
  Zap,
  Target,
  Brain,
  Users,
  Star,
  Shield,
  ArrowLeft,
  Sun,
  Moon,
  Keyboard,
  TrendingUp,
  Heart,
  Globe,
  Award,
  Sparkles,
} from "lucide-react";

const TEAM = [
  {
    name: "Aryan Sharma",
    role: "Lead Developer",
    avatar: "AS",
    color: "#7c6af7",
  },
  { name: "Meera Joshi", role: "UX Designer", avatar: "MJ", color: "#5eead4" },
  { name: "Rohan Das", role: "ML Engineer", avatar: "RD", color: "#f59e0b" },
  { name: "Priya Nair", role: "Content Lead", avatar: "PN", color: "#10b981" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Real-time Speed Tracking",
    desc: "Instant WPM feedback as you type. See your speed evolve character by character.",
    color: "blue",
  },
  {
    icon: Target,
    title: "Accuracy Analysis",
    desc: "Detailed breakdown of your error patterns, weak keys, and finger analytics.",
    color: "green",
  },
  {
    icon: Brain,
    title: "AI Coaching",
    desc: "Smart drills generated from your personal weaknesses, powered by adaptive AI.",
    color: "purple",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    desc: "Long-term charts, skill trees, and milestones to keep you motivated.",
    color: "orange",
  },
  {
    icon: Globe,
    title: "Multi-language Support",
    desc: "Practice in English, Spanish, French, German, and more.",
    color: "teal",
  },
  {
    icon: Shield,
    title: "Privacy First",
    desc: "Your data stays on your device by default. Zero tracking without consent.",
    color: "red",
  },
];

const STATS_ROW = [
  { value: "50K+", label: "Active Typists" },
  { value: "2M+", label: "Tests Completed" },
  { value: "4.9★", label: "User Rating" },
  { value: "15+", label: "Languages" },
];

export default function AboutUs() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <div className={`au-root ${isDarkMode ? "dark" : "light"}`}>
      {/* Navbar */}
      <nav className="au-nav">
        <div className="au-nav-inner">
          <button className="au-nav-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back
          </button>
          <div className="au-nav-logo">
            <Zap size={17} /> SwiftKeys
          </div>
          <div className="au-nav-links">
            <button className="au-nav-link" onClick={() => navigate("/about")}>
              About
            </button>
            <button
              className="au-nav-link"
              onClick={() => navigate("/contact")}
            >
              Contact
            </button>
          </div>
          <button className="au-icon-btn" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </nav>

      <main className="au-main">
        {/* Hero */}
        <section className="au-hero">
          <div className="au-hero-badge">
            <Sparkles size={13} /> About SwiftKeys
          </div>
          <h1 className="au-hero-title">
            Built for Typists Who{" "}
            <span className="au-accent-text">Never Stop Improving</span>
          </h1>
          <p className="au-hero-desc">
            SwiftKeys is a modern typing coach designed to help you build speed,
            accuracy, and consistency — with real-time feedback, AI-powered
            drills, and beautiful analytics.
          </p>
          <div className="au-hero-actions">
            <button
              className="au-btn au-btn-primary"
              onClick={() => navigate("/typing-coach")}
            >
              <Keyboard size={16} /> Start Typing
            </button>
            <button
              className="au-btn au-btn-sec"
              onClick={() => navigate("/contact")}
            >
              <Heart size={16} /> Get in Touch
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="au-stats-row">
          {STATS_ROW.map((s, i) => (
            <div key={i} className="au-stat-item">
              <div className="au-stat-val">{s.value}</div>
              <div className="au-stat-lbl">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Mission */}
        <section className="au-section">
          <div className="au-section-tag">Our Mission</div>
          <h2 className="au-section-title">Why We Built SwiftKeys</h2>
          <div className="au-mission-grid">
            <div className="au-mission-text">
              <p>
                Typing is a foundational skill for everyone in the digital age —
                yet most tools to improve it are outdated, boring, or lack real
                feedback. We set out to change that.
              </p>
              <p>
                SwiftKeys combines <strong>gamification</strong>,{" "}
                <strong>data-driven coaching</strong>, and a{" "}
                <strong>clean, focused interface</strong> to make deliberate
                practice actually enjoyable. Whether you're a developer, writer,
                student, or professional — every keystroke should feel like
                progress.
              </p>
              <p>
                We believe the best tool is one you <em>want</em> to use every
                day.
              </p>
            </div>
            <div className="au-mission-values">
              {[
                {
                  icon: "🎯",
                  title: "Deliberate Practice",
                  desc: "Focused drills targeting your exact weaknesses.",
                },
                {
                  icon: "📊",
                  title: "Data-Driven",
                  desc: "Every metric that matters, nothing that doesn't.",
                },
                {
                  icon: "🔒",
                  title: "User Privacy",
                  desc: "Your progress, your data, your control.",
                },
                {
                  icon: "✨",
                  title: "Joyful Design",
                  desc: "Beautiful interfaces that make practice enjoyable.",
                },
              ].map((v, i) => (
                <div key={i} className="au-value-card">
                  <span className="au-value-icon">{v.icon}</span>
                  <div>
                    <div className="au-value-title">{v.title}</div>
                    <div className="au-value-desc">{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="au-section">
          <div className="au-section-tag">Features</div>
          <h2 className="au-section-title">
            Everything You Need to Type Faster
          </h2>
          <div className="au-features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className={`au-feature-card au-fc-${f.color}`}>
                <div className="au-feature-icon">
                  <f.icon size={22} />
                </div>
                <div className="au-feature-title">{f.title}</div>
                <div className="au-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="au-section">
          <div className="au-section-tag">Our Team</div>
          <h2 className="au-section-title">Built with Passion</h2>
          <div className="au-team-grid">
            {TEAM.map((m, i) => (
              <div key={i} className="au-team-card">
                <div className="au-avatar" style={{ background: m.color }}>
                  {m.avatar}
                </div>
                <div className="au-team-name">{m.name}</div>
                <div className="au-team-role">{m.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="au-cta">
          <Award size={28} className="au-cta-icon" />
          <h2 className="au-cta-title">Ready to Type Faster?</h2>
          <p className="au-cta-desc">
            Join thousands of typists improving their speed every day.
          </p>
          <button
            className="au-btn au-btn-primary au-btn-lg"
            onClick={() => navigate("/typing-coach")}
          >
            <Zap size={18} /> Start Free — No Login Required
          </button>
        </section>
      </main>
    </div>
  );
}
