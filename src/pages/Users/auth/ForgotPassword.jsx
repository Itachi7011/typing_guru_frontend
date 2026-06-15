import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Mail, KeyRound, Eye, EyeOff, ArrowLeft, CheckCircle, Send, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";
import { ThemeContext } from "../../../context/ThemeContext";

// Steps: 0 = enter email, 1 = enter OTP, 2 = new password, 3 = done
export default function ForgotPassword() {
  const { isDarkMode } = useContext(ThemeContext);
  const bg = isDarkMode ? "#0d1117" : "#fff";
  const col = isDarkMode ? "#e6edf3" : "#0d1117";

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [passwords, setPasswords] = useState({ pw: "", confirm: "" });
  const [show, setShow] = useState({ pw: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // ── Step 0: Send OTP ──────────────────────────────────────────
  const sendOtp = async (e) => {
    e.preventDefault();
    if (!email) return Swal.fire({ icon: "warning", title: "Enter your email", background: bg, color: col });
    setLoading(true);
    try {
      const res = await fetch("/api/user/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setStep(1);
      startResendTimer();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, background: bg, color: col });
    } finally {
      setLoading(false);
    }
  };

  // ── Resend timer ─────────────────────────────────────────────
  const startResendTimer = () => {
    setResendTimer(60);
    const t = setInterval(() => {
      setResendTimer((p) => {
        if (p <= 1) { clearInterval(t); return 0; }
        return p - 1;
      });
    }, 1000);
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      Swal.fire({ icon: "success", title: "OTP resent!", timer: 1500, showConfirmButton: false, background: bg, color: col });
      startResendTimer();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, background: bg, color: col });
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handling ───────────────────────────────────────
  const handleOtp = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) document.getElementById(`teh-otp-${idx + 1}`)?.focus();
  };
  const handleOtpKey = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      document.getElementById(`teh-otp-${idx - 1}`)?.focus();
  };
  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) setOtp(paste.split(""));
    e.preventDefault();
  };

  // ── Step 1: Verify OTP ───────────────────────────────────────
  const verifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return Swal.fire({ icon: "warning", title: "Enter full 6-digit OTP", background: bg, color: col });
    setLoading(true);
    try {
      const res = await fetch("/api/user/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");
      setStep(2);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Wrong OTP", text: err.message, background: bg, color: col });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Reset password ────────────────────────────────────
  const resetPassword = async (e) => {
    e.preventDefault();
    const { pw, confirm } = passwords;
    if (!pw || !confirm) return Swal.fire({ icon: "warning", title: "Fill both fields", background: bg, color: col });
    if (pw !== confirm) return Swal.fire({ icon: "error", title: "Passwords don't match", background: bg, color: col });
    if (pw.length < 8) return Swal.fire({ icon: "warning", title: "Password too short", text: "Minimum 8 characters.", background: bg, color: col });
    setLoading(true);
    try {
      const res = await fetch("/api/user/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), newPassword: pw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      setStep(3);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Reset failed", text: err.message, background: bg, color: col });
    } finally {
      setLoading(false);
    }
  };

  // ── Step indicator ───────────────────────────────────────────
  const STEPS = ["Email", "Verify OTP", "New Password"];

  return (
    <div className={`teh-auth-root ${isDarkMode ? "dark" : "light"}`}>
      <div className="teh-auth-card">

        {step < 3 && (
          <>
            <div className="teh-auth-brand">
              <div className="teh-auth-logo"><ShieldCheck size={20} /></div>
              <span>Typing Exam Hub</span>
            </div>
            <div className="teh-auth-header">
              <h1 className="teh-auth-title">Reset Password</h1>
              <p className="teh-auth-sub">We'll verify your identity first</p>
            </div>

            {/* Step pills */}
            <div className="teh-fp-steps">
              {STEPS.map((s, i) => (
                <div key={i} className={`teh-fp-step ${i === step ? "teh-fp-step-active" : i < step ? "teh-fp-step-done" : ""}`}>
                  <div className="teh-fp-dot">{i < step ? <CheckCircle size={12} /> : i + 1}</div>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Step 0 ── */}
        {step === 0 && (
          <form className="teh-auth-form" onSubmit={sendOtp} noValidate>
            <div className="teh-auth-field">
              <label className="teh-auth-label">Registered Email</label>
              <div className="teh-auth-input-wrap">
                <input type="email" className="teh-auth-input teh-input-icon-left" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                <Mail size={15} className="teh-auth-input-icon-left-ic" />
              </div>
            </div>
            <button type="submit" className="teh-auth-btn" disabled={loading}>
              {loading ? <span className="teh-auth-spinner" /> : <><Send size={15} /> Send OTP</>}
            </button>
            <Link to="/auth/login" className="teh-auth-back-link"><ArrowLeft size={14} /> Back to login</Link>
          </form>
        )}

        {/* ── Step 1 ── */}
        {step === 1 && (
          <form className="teh-auth-form" onSubmit={verifyOtp} noValidate>
            <p className="teh-auth-hint">Enter the 6-digit code sent to <strong>{email}</strong></p>
            <div className="teh-otp-row" onPaste={handleOtpPaste}>
              {otp.map((v, i) => (
                <input
                  key={i}
                  id={`teh-otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="teh-otp-box"
                  value={v}
                  onChange={(e) => handleOtp(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKey(e, i)}
                />
              ))}
            </div>
            <button type="submit" className="teh-auth-btn" disabled={loading}>
              {loading ? <span className="teh-auth-spinner" /> : <><KeyRound size={15} /> Verify OTP</>}
            </button>
            <button type="button" className={`teh-auth-resend ${resendTimer > 0 ? "teh-resend-wait" : ""}`} onClick={resendOtp} disabled={resendTimer > 0 || loading}>
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
            </button>
          </form>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <form className="teh-auth-form" onSubmit={resetPassword} noValidate>
            <div className="teh-auth-field">
              <label className="teh-auth-label">New Password</label>
              <div className="teh-auth-input-wrap">
                <input type={show.pw ? "text" : "password"} className="teh-auth-input" placeholder="••••••••" value={passwords.pw} onChange={(e) => setPasswords({ ...passwords, pw: e.target.value })} autoComplete="new-password" />
                <button type="button" className="teh-auth-eye" onClick={() => setShow({ ...show, pw: !show.pw })} tabIndex={-1}>
                  {show.pw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="teh-auth-field">
              <label className="teh-auth-label">Confirm New Password</label>
              <div className="teh-auth-input-wrap">
                <input type={show.confirm ? "text" : "password"} className="teh-auth-input" placeholder="••••••••" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} autoComplete="new-password" />
                <button type="button" className="teh-auth-eye" onClick={() => setShow({ ...show, confirm: !show.confirm })} tabIndex={-1}>
                  {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="teh-auth-btn" disabled={loading}>
              {loading ? <span className="teh-auth-spinner" /> : <><ShieldCheck size={15} /> Reset Password</>}
            </button>
          </form>
        )}

        {/* ── Step 3: Done ── */}
        {step === 3 && (
          <div className="teh-fp-done">
            <div className="teh-fp-done-icon"><CheckCircle size={44} /></div>
            <h2 className="teh-fp-done-title">Password Reset!</h2>
            <p className="teh-fp-done-sub">Your password has been updated successfully.</p>
            <Link to="/auth/login" className="teh-auth-btn teh-auth-btn-link">Sign In Now</Link>
          </div>
        )}
      </div>

      <div className="teh-auth-keys-bg" aria-hidden="true">
        {["A","S","D","F","J","K","L",";","Q","W","E","R"].map((k,i) => (
          <span key={i} className="teh-auth-key" style={{"--d": `${i * 0.22}s`}}>{k}</span>
        ))}
      </div>
    </div>
  );
}