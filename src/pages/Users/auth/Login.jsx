import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Keyboard } from "lucide-react";
import Swal from "sweetalert2";
import { ThemeContext } from "../../../context/ThemeContext";

export default function Login() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      Swal.fire({ icon: "warning", title: "Fill all fields", background: isDarkMode ? "#0d1117" : "#fff", color: isDarkMode ? "#e6edf3" : "#0d1117" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      Swal.fire({ icon: "success", title: "Welcome back!", timer: 1500, showConfirmButton: false, background: isDarkMode ? "#0d1117" : "#fff", color: isDarkMode ? "#e6edf3" : "#0d1117" });
      setTimeout(() => navigate("/dashboard"), 1600);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Login failed", text: err.message, background: isDarkMode ? "#0d1117" : "#fff", color: isDarkMode ? "#e6edf3" : "#0d1117" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`teh-auth-root ${isDarkMode ? "dark" : "light"}`}>
      <div className="teh-auth-card">
        <div className="teh-auth-brand">
          <div className="teh-auth-logo"><Keyboard size={20} /></div>
          <span>Typing Exam Hub</span>
        </div>

        <div className="teh-auth-header">
          <h1 className="teh-auth-title">Sign In</h1>
          <p className="teh-auth-sub">Continue your typing journey</p>
        </div>

        <form className="teh-auth-form" onSubmit={submit} noValidate>
          <div className="teh-auth-field">
            <label className="teh-auth-label">Email</label>
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

          <div className="teh-auth-field">
            <div className="teh-auth-label-row">
              <label className="teh-auth-label">Password</label>
              <Link to="/auth/forgot-password" className="teh-auth-link teh-auth-link-sm">Forgot password?</Link>
            </div>
            <div className="teh-auth-input-wrap">
              <input
                type={show ? "text" : "password"}
                name="password"
                className="teh-auth-input"
                placeholder="••••••••"
                value={form.password}
                onChange={change}
                autoComplete="current-password"
              />
              <button type="button" className="teh-auth-eye" onClick={() => setShow(!show)} tabIndex={-1}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="teh-auth-btn" disabled={loading}>
            {loading ? <span className="teh-auth-spinner" /> : <><LogIn size={16} /> Sign In</>}
          </button>
        </form>

        <p className="teh-auth-footer-text">
          No account? <Link to="/auth/signup" className="teh-auth-link">Create one</Link>
        </p>
      </div>

      <div className="teh-auth-keys-bg" aria-hidden="true">
        {["A","S","D","F","J","K","L",";","Q","W","E","R","T","Y","U","I","O","P","Z","X","C","V","B","N","M"].map((k,i) => (
          <span key={i} className="teh-auth-key" style={{"--d": `${i * 0.18}s`}}>{k}</span>
        ))}
      </div>
    </div>
  );
}