import { useState, useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Mail,
  Phone,
  CheckCircle,
  Send,
  ShieldCheck,
  ArrowRight,
  Edit2,
  User,
} from "lucide-react";
import Swal from "sweetalert2";
import { ThemeContext } from "../../../context/ThemeContext";

function OtpModule({
  id,
  icon: Icon,
  title,
  hint,
  apiSend,
  apiVerify,
  isDarkMode,
  userEmail,
  userPhone,
  onVerified,
}) {
  const bg = isDarkMode ? "#0d1117" : "#fff";
  const col = isDarkMode ? "#e6edf3" : "#0d1117";

  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  // Use props OR manual input - props take priority
  const email = userEmail || manualEmail;
  const phone = userPhone || manualPhone;

  // Check if we have identifier from ANY source
  const hasIdentifier =
    id === "email"
      ? email && email.trim() !== ""
      : phone && phone.trim() !== "";

  const startTimer = () => {
    setTimer(60);
    const t = setInterval(() => {
      setTimer((p) => {
        if (p <= 1) {
          clearInterval(t);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
  };

  const sendCode = async () => {
    // Only show manual input if NO identifier exists
    if (!hasIdentifier) {
      setShowManualInput(true);
      return;
    }

    setLoading(true);
    try {
      const body = id === "email" ? { email } : { phone };
      const res = await fetch(apiSend, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send code");
      setSent(true);
      startTimer();
      Swal.fire({
        icon: "success",
        title: "Code sent!",
        timer: 1500,
        showConfirmButton: false,
        background: bg,
        color: col,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
        background: bg,
        color: col,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5)
      document.getElementById(`${id}-otp-${idx + 1}`)?.focus();
  };

  const handleKey = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      document.getElementById(`${id}-otp-${idx - 1}`)?.focus();
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (paste.length === 6) setOtp(paste.split(""));
    e.preventDefault();
  };

  const verify = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      return Swal.fire({
        icon: "warning",
        title: "Enter complete code",
        background: bg,
        color: col,
      });
    }

    setLoading(true);
    try {
      const body = id === "email" ? { email, otp: code } : { phone, otp: code };

      const res = await fetch(apiVerify, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid code");
      setVerified(true);
      if (onVerified) onVerified(id, true);
      Swal.fire({
        icon: "success",
        title: `${title} verified!`,
        timer: 1800,
        showConfirmButton: false,
        background: bg,
        color: col,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Verification failed",
        text: err.message,
        background: bg,
        color: col,
      });
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="teh-verify-module teh-verify-module-done">
        <div className="teh-verify-mod-head">
          <div className="teh-verify-mod-icon teh-verify-mod-icon-done">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="teh-verify-mod-title">{title}</div>
            <div className="teh-verify-mod-sub teh-verify-done-sub">
              Verified successfully ✓
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teh-verify-module">
      <div className="teh-verify-mod-head">
        <div className="teh-verify-mod-icon">
          <Icon size={18} />
        </div>
        <div>
          <div className="teh-verify-mod-title">{title}</div>
          <div className="teh-verify-mod-sub">{hint}</div>
        </div>
        {/* Show send button only if we have identifier and not sent */}
        {!sent && hasIdentifier && !showManualInput && (
          <button
            className="teh-verify-send-btn"
            onClick={sendCode}
            disabled={loading}
          >
            {loading ? (
              <span className="teh-auth-spinner teh-spinner-sm" />
            ) : (
              <>
                <Send size={13} /> Send
              </>
            )}
          </button>
        )}
      </div>

      {/* Manual input - only shown when NO identifier exists */}
      {showManualInput && !sent && (
        <div className="teh-verify-input-group">
          <label className="teh-auth-label">
            {id === "email" ? "Email Address" : "Phone Number"}
          </label>
          <div className="teh-auth-input-wrap">
            <input
              type={id === "email" ? "email" : "tel"}
              className="teh-auth-input"
              placeholder={
                id === "email" ? "you@example.com" : "+91 98765 43210"
              }
              value={id === "email" ? manualEmail : manualPhone}
              onChange={(e) => {
                if (id === "email") setManualEmail(e.target.value);
                else setManualPhone(e.target.value);
              }}
              autoComplete={id === "email" ? "email" : "tel"}
            />
            {id === "email" ? <Mail size={15} /> : <Phone size={15} />}
          </div>
          <button
            className="teh-verify-update-btn"
            onClick={() => {
              if (
                (id === "email" && manualEmail) ||
                (id === "phone" && manualPhone)
              ) {
                setShowManualInput(false);
                sendCode();
              } else {
                Swal.fire({
                  icon: "warning",
                  title: id === "email" ? "Email Required" : "Phone Required",
                  text: `Please enter your ${id === "email" ? "email address" : "phone number"}.`,
                  background: bg,
                  color: col,
                });
              }
            }}
          >
            Submit & Send Code
          </button>
        </div>
      )}

      {/* Show existing identifier info - only when we have it and not in manual mode */}
      {hasIdentifier && !sent && !showManualInput && (
        <div className="teh-verify-info">
          <User size={14} />
          <span>{id === "email" ? email : phone}</span>
          <button
            className="teh-verify-edit-btn"
            onClick={() => setShowManualInput(true)}
          >
            <Edit2 size={12} /> Change
          </button>
        </div>
      )}

      {/* OTP Form - shown after code sent */}
      {sent && (
        <form className="teh-verify-otp-form" onSubmit={verify} noValidate>
          <div className="teh-otp-row teh-otp-row-sm" onPaste={handlePaste}>
            {otp.map((v, i) => (
              <input
                key={i}
                id={`${id}-otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="teh-otp-box teh-otp-box-sm"
                value={v}
                onChange={(e) => handleOtp(e.target.value, i)}
                onKeyDown={(e) => handleKey(e, i)}
              />
            ))}
          </div>
          <div className="teh-verify-otp-actions">
            <button
              type="submit"
              className="teh-verify-confirm-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="teh-auth-spinner teh-spinner-sm" />
              ) : (
                <>
                  <ShieldCheck size={13} /> Verify
                </>
              )}
            </button>
            <button
              type="button"
              className={`teh-auth-resend ${timer > 0 ? "teh-resend-wait" : ""}`}
              onClick={sendCode}
              disabled={timer > 0 || loading}
            >
              {timer > 0 ? `Resend ${timer}s` : "Resend"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function Verify() {
  const { isDarkMode } = useContext(ThemeContext);
  const location = useLocation();

  const [userData, setUserData] = useState({
    email: "",
    phone: "",
    userId: null,
  });

  useEffect(() => {
    // Get data from navigation state or localStorage
    const stateData = location.state || {};
    const storedUser = localStorage.getItem("pendingVerification");

    let email = stateData.email || "";
    let phone = stateData.phone || "";
    let userId = stateData.userId || null;

    if (storedUser && !email) {
      try {
        const parsed = JSON.parse(storedUser);
        email = parsed.email || "";
        phone = parsed.phone || "";
        userId = parsed.userId || null;
      } catch (e) {
        console.error("Failed to parse stored user:", e);
      }
    }

    setUserData({ email, phone, userId });

    // Clear stored data after loading
    if (storedUser && email) {
      localStorage.removeItem("pendingVerification");
    }
  }, [location]);

  const handleVerification = (type, verified) => {
    if (type === "email" && verified) {
      const updated = { ...userData, emailVerified: true };
      setUserData(updated);
      localStorage.setItem("verificationStatus", JSON.stringify(updated));
    }
    if (type === "phone" && verified) {
      const updated = { ...userData, phoneVerified: true };
      setUserData(updated);
      localStorage.setItem("verificationStatus", JSON.stringify(updated));
    }
  };

  return (
    <div className={`teh-auth-root ${isDarkMode ? "dark" : "light"}`}>
      <div className="teh-auth-card teh-auth-card-lg">
        <div className="teh-auth-brand">
          <div className="teh-auth-logo">
            <ShieldCheck size={20} />
          </div>
          <span>Typing Exam Hub</span>
        </div>

        <div className="teh-auth-header">
          <h1 className="teh-auth-title">Verify Your Account</h1>
          <p className="teh-auth-sub">
            Verify your email and/or phone number independently
          </p>
        </div>

        <div className="teh-verify-modules">
          <OtpModule
            id="email"
            icon={Mail}
            title="Email Verification"
            hint="We'll send a 6-digit code to your registered email"
            apiSend="/api/user/auth/send-email-otp"
            apiVerify="/api/user/auth/verify-email"
            isDarkMode={isDarkMode}
            userEmail={userData.email}
            onVerified={handleVerification}
          />

          <div className="teh-verify-divider">
            <span>or</span>
          </div>

          <OtpModule
            id="phone"
            icon={Phone}
            title="Phone Verification"
            hint="We'll send a 6-digit code via SMS"
            apiSend="/api/user/auth/send-phone-otp"
            apiVerify="/api/user/auth/verify-phone"
            isDarkMode={isDarkMode}
            userPhone={userData.phone}
            onVerified={handleVerification}
          />
        </div>

        <div className="teh-verify-footer">
          <Link to="/user/auth/login" className="teh-auth-link">
            <ArrowRight size={13} /> Continue to login
          </Link>
          <span className="teh-verify-skip">
            You can also verify later from your profile settings.
          </span>
        </div>
      </div>

      <div className="teh-auth-keys-bg" aria-hidden="true">
        {["A", "S", "D", "F", "J", "K", "L", ";", "Q", "W", "E", "R"].map(
          (k, i) => (
            <span
              key={i}
              className="teh-auth-key"
              style={{ "--d": `${i * 0.22}s` }}
            >
              {k}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
