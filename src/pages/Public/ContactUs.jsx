import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import {
  ArrowLeft,
  Sun,
  Moon,
  Zap,
  Mail,
  MessageSquare,
  Bug,
  Lightbulb,
  HelpCircle,
  Send,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

const TOPICS = [
  { id: "general", label: "General Inquiry", icon: MessageSquare },
  { id: "bug", label: "Report a Bug", icon: Bug },
  { id: "feature", label: "Feature Request", icon: Lightbulb },
  { id: "support", label: "Support", icon: HelpCircle },
  { id: "other", label: "Other", icon: Mail },
];

const FAQ = [
  {
    q: "Is SwiftKeys free to use?",
    a: "Yes! SwiftKeys is completely free. Your progress is saved locally. Create an account to sync across devices.",
  },
  {
    q: "How is my data handled?",
    a: "By default all data is stored in your browser. We never sell or share personal data.",
  },
  {
    q: "Can I use SwiftKeys on mobile?",
    a: "Absolutely. SwiftKeys is fully responsive and works on phones and tablets.",
  },
  {
    q: "How do I reset my progress?",
    a: "Go to Settings and click 'Clear Local Data'. This will erase all locally stored progress.",
  },
  {
    q: "Are there keyboard shortcuts?",
    a: "Press Tab to reset a test, and Escape to cancel an ongoing test mid-way.",
  },
];

export default function ContactUs() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "general",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("success");
  };

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
              className="au-nav-link au-nav-link-active"
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
        {/* Header */}
        <section className="au-hero au-hero-sm">
          <div className="au-hero-badge">
            <Mail size={13} /> Contact Us
          </div>
          <h1 className="au-hero-title">
            We'd Love to <span className="au-accent-text">Hear From You</span>
          </h1>
          <p className="au-hero-desc">
            Got a question, bug report, or feature idea? Drop us a message — we
            typically respond within 24 hours.
          </p>
        </section>

        <div className="au-contact-layout">
          {/* Form */}
          <div className="au-form-card">
            <div className="au-form-title">
              <MessageSquare size={16} /> Send a Message
            </div>

            {status === "success" ? (
              <div className="au-success-msg">
                <CheckCircle size={32} className="au-success-icon" />
                <h3>Message Sent!</h3>
                <p>
                  Thanks for reaching out. We'll get back to you at{" "}
                  <strong>{form.email}</strong> shortly.
                </p>
                <button
                  className="au-btn au-btn-sec"
                  onClick={() => setStatus("idle")}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form className="au-form" onSubmit={handleSubmit}>
                <div className="au-field-row">
                  <div className="au-field">
                    <label className="au-label">Name</label>
                    <input
                      className="au-input"
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="au-field">
                    <label className="au-label">Email</label>
                    <input
                      className="au-input"
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="au-field">
                  <label className="au-label">Topic</label>
                  <div className="au-topic-pills">
                    {TOPICS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={`au-topic-pill${form.topic === t.id ? " au-topic-on" : ""}`}
                        onClick={() => setForm((f) => ({ ...f, topic: t.id }))}
                      >
                        <t.icon size={12} /> {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="au-field">
                  <label className="au-label">Message</label>
                  <textarea
                    className="au-input au-textarea"
                    name="message"
                    placeholder="Tell us what's on your mind…"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    required
                  />
                </div>

                {status === "error" && (
                  <div className="au-error-msg">
                    <AlertCircle size={14} /> Something went wrong. Please try
                    again.
                  </div>
                )}

                <button
                  className="au-btn au-btn-primary au-submit-btn"
                  type="submit"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? (
                    <>
                      <span className="au-spinner" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar info */}
          <div className="au-contact-sidebar">
            <div className="au-info-card">
              <div className="au-info-title">Other Ways to Reach Us</div>
              <div className="au-info-item">
                <Mail size={15} />
                <div>
                  <div className="au-info-label">Email</div>
                  <a href="mailto:hello@swiftkeys.app" className="au-info-link">
                    hello@swiftkeys.app
                  </a>
                </div>
              </div>
              <div className="au-info-item">
                <ExternalLink size={15} />
                <div>
                  <div className="au-info-label">GitHub</div>
                  <a
                    href="https://github.com/swiftkeys"
                    className="au-info-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    github.com/swiftkeys
                  </a>
                </div>
              </div>
              <div className="au-response-note">
                <CheckCircle size={13} /> Typical response time:{" "}
                <strong>under 24 hours</strong>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <section className="au-section au-faq-section">
          <div className="au-section-tag">FAQ</div>
          <h2 className="au-section-title">Frequently Asked Questions</h2>
          <div className="au-faq-list">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className={`au-faq-item${openFaq === i ? " au-faq-open" : ""}`}
              >
                <button
                  className="au-faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="au-faq-chev">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && <div className="au-faq-a">{item.a}</div>}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
