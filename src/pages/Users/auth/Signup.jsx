import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Keyboard, Check, X } from "lucide-react";
import Swal from "sweetalert2";
import { ThemeContext } from "../../../context/ThemeContext";

const rules = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Number", test: (p) => /\d/.test(p) },
];

export default function Signup() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [show, setShow] = useState({ password: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleShow = (field) => setShow({ ...show, [field]: !show[field] });

  const submit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirm } = form;
    if (!name || !email || !password || !confirm) {
      return Swal.fire({
        icon: "warning",
        title: "Fill required fields",
        background: isDarkMode ? "#0d1117" : "#fff",
        color: isDarkMode ? "#e6edf3" : "#0d1117",
      });
    }
    if (password !== confirm) {
      return Swal.fire({
        icon: "error",
        title: "Passwords don't match",
        background: isDarkMode ? "#0d1117" : "#fff",
        color: isDarkMode ? "#e6edf3" : "#0d1117",
      });
    }
    if (!rules.every((r) => r.test(password))) {
      return Swal.fire({
        icon: "warning",
        title: "Weak password",
        text: "Meet all password requirements.",
        background: isDarkMode ? "#0d1117" : "#fff",
        color: isDarkMode ? "#e6edf3" : "#0d1117",
      });
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      // Store user data for verification page
      localStorage.setItem(
        "pendingVerification",
        JSON.stringify({
          email: email,
          phone: phone,
          userId: data.userId,
        }),
      );

      Swal.fire({
        icon: "success",
        title: "Account created!",
        text: "Check your email & phone to verify.",
        background: isDarkMode ? "#0d1117" : "#fff",
        color: isDarkMode ? "#e6edf3" : "#0d1117",
      });
      // Navigate to verify page with user data
      navigate("/user/auth/verification", {
        state: {
          email: email,
          phone: phone,
          userId: data.userId,
        },
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Signup failed",
        text: err.message,
        background: isDarkMode ? "#0d1117" : "#fff",
        color: isDarkMode ? "#e6edf3" : "#0d1117",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      // Redirect to Google OAuth endpoint
      window.location.href = "/api/user/auth/google";
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Google Signup Failed",
        text: err.message,
        background: isDarkMode ? "#0d1117" : "#fff",
        color: isDarkMode ? "#e6edf3" : "#0d1117",
      });
      setGoogleLoading(false);
    }
  };

  const pwStrength = rules.filter((r) => r.test(form.password)).length;
  const strengthLabel = ["", "Weak", "Fair", "Strong"][pwStrength];
  const strengthClass = ["", "teh-str-weak", "teh-str-fair", "teh-str-strong"][
    pwStrength
  ];

  return (
    <div className={`teh-auth-root ${isDarkMode ? "dark" : "light"}`}>
      <div className="teh-auth-card teh-auth-card-lg">
        {/* <div className="teh-auth-brand">
          <div className="teh-auth-logo">
            <Keyboard size={20} />
          </div>
          <span>Typing Exam Hub</span>
        </div> */}

        <div className="teh-auth-header">
          <h1 className="teh-auth-title">Create Account</h1>
          <p className="teh-auth-sub">Start mastering your typing speed</p>
        </div>

        <form className="teh-auth-form" onSubmit={submit} noValidate>
          <div className="teh-auth-row-2">
            <div className="teh-auth-field">
              <label className="teh-auth-label">
                Full Name <span className="teh-auth-req">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="teh-auth-input"
                placeholder="Rahul Sharma"
                value={form.name}
                onChange={change}
                autoComplete="name"
              />
            </div>
            <div className="teh-auth-field">
              <label className="teh-auth-label">
                Phone <span className="teh-auth-opt">(optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                className="teh-auth-input"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={change}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="teh-auth-field">
            <label className="teh-auth-label">
              Email <span className="teh-auth-req">*</span>
            </label>
            <input
              type="email"
              name="email"
              className="teh-auth-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={change}
              autoComplete="email"
            />
          </div>

          <div className="teh-auth-row-2">
            <div className="teh-auth-field">
              <label className="teh-auth-label">
                Password <span className="teh-auth-req">*</span>
              </label>
              <div className="teh-auth-input-wrap">
                <input
                  type={show.password ? "text" : "password"}
                  name="password"
                  className="teh-auth-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={change}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="teh-auth-eye"
                  onClick={() => toggleShow("password")}
                  tabIndex={-1}
                >
                  {show.password ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="teh-auth-field">
              <label className="teh-auth-label">
                Confirm Password <span className="teh-auth-req">*</span>
              </label>
              <div className="teh-auth-input-wrap">
                <input
                  type={show.confirm ? "text" : "password"}
                  name="confirm"
                  className="teh-auth-input"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={change}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="teh-auth-eye"
                  onClick={() => toggleShow("confirm")}
                  tabIndex={-1}
                >
                  {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {form.password && (
            <div className="teh-auth-pw-meter">
              <div className="teh-auth-str-bars">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`teh-auth-str-bar ${i < pwStrength ? strengthClass : ""}`}
                  />
                ))}
              </div>
              <span className={`teh-auth-str-lbl ${strengthClass}`}>
                {strengthLabel}
              </span>
              <div className="teh-auth-pw-rules">
                {rules.map((r, i) => (
                  <span
                    key={i}
                    className={`teh-auth-rule ${r.test(form.password) ? "teh-rule-ok" : "teh-rule-no"}`}
                  >
                    {r.test(form.password) ? (
                      <Check size={11} />
                    ) : (
                      <X size={11} />
                    )}{" "}
                    {r.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="teh-auth-btn" disabled={loading}>
            {loading ? (
              <span className="teh-auth-spinner" />
            ) : (
              <>
                <UserPlus size={16} /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="teh-auth-divider">
          <span>or continue with</span>
        </div>

        <button
          type="button"
          className="teh-auth-google-btn"
          onClick={handleGoogleSignup}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <span className="teh-auth-spinner" />
          ) : (
            <>
              <svg
                className="teh-google-icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign up with Google
            </>
          )}
        </button>

        <p className="teh-auth-footer-text">
          Already have an account?{" "}
          <Link to="/auth/login" className="teh-auth-link">
            Sign in
          </Link>
        </p>
      </div>

      <div className="teh-auth-keys-bg" aria-hidden="true">
        {[
          "A",
          "S",
          "D",
          "F",
          "J",
          "K",
          "L",
          ";",
          "Q",
          "W",
          "E",
          "R",
          "T",
          "Y",
          "U",
          "I",
          "O",
          "P",
          "Z",
          "X",
          "C",
          "V",
          "B",
          "N",
          "M",
        ].map((k, i) => (
          <span
            key={i}
            className="teh-auth-key"
            style={{ "--d": `${i * 0.18}s` }}
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
