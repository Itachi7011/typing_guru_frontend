import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ThemeContext } from "../../context/ThemeContext";
import {
  ArrowLeft,
  Camera,
  User,
  Mail,
  Phone,
  Shield,
  Settings2,
  Trophy,
  Flame,
  Zap,
  Target,
  Award,
  Star,
  Save,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Keyboard,
  Bell,
  Sun,
  Moon,
  Monitor,
  CheckCircle,
  Loader2,
  Sparkles,
  Lock,
  Download,
  Trash2,
  AlertCircle,
  Database,
  RefreshCw,
  FileJson,
  FileSpreadsheet,
  UserX,
  UserCheck,
} from "lucide-react";

/* ── Mock fetch helpers — replace with real API calls later ──────
   Endpoints (per spec, prefix /api/user/profile/ added by app.js):
   GET  /me
   POST /change-name
   POST /change-avatar
   POST /change-phone
   POST /change-preferences
   POST /change-password
*/

const TABS = [
  { id: "overview", label: "Overview", icon: Trophy },
  { id: "account", label: "Account", icon: User },
  { id: "preferences", label: "Preferences", icon: Settings2 },
  { id: "security", label: "Security", icon: Shield },
];

const LEVEL_BADGE_ICONS = {
  Newbie: "🌱",
  "Rising Star": "⭐",
  "Typing Enthusiast": "⌨️",
  "Speed Demon": "⚡",
  "Typing Master": "🏆",
  "Legendary Typist": "👑",
  "Speed Record": "🚀",
  "Perfect Typist": "💎",
  "Weekly Warrior": "🔥",
  "Drill Master": "🎯",
};

export default function Profile() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── User state (populated from /me) ──────────────────────────
  const [user, setUser] = useState(null);

  // ── Editable form states ──────────────────────────────────────
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [localDataExists, setLocalDataExists] = useState(false);
  const [localDataPreview, setLocalDataPreview] = useState(null);

  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [selectedStats, setSelectedStats] = useState([]);

  const resetOptions = [
    {
      id: "typingStats",
      label: "Typing Statistics",
      description: "Reset all WPM, accuracy, and test records",
    },
    {
      id: "gamification",
      label: "Gamification Data",
      description: "Reset XP, level, points, and streak",
    },
    {
      id: "badges",
      label: "Badges & Achievements",
      description: "Remove all earned badges except Newbie",
    },
    {
      id: "examHistory",
      label: "Exam History",
      description: "Clear all exam participation records",
    },
    {
      id: "gameStats",
      label: "Game Statistics",
      description: "Reset typing rush, word hunter scores",
    },
    {
      id: "drillProgress",
      label: "Drill Progress",
      description: "Reset all drill completions",
    },
  ];

  const [prefs, setPrefs] = useState({
    ui: {
      theme: "auto",
      soundEffects: true,
      keyboardSound: false,
      showLiveWpm: true,
    },
    typing: {
      fontSize: 16,
      highlightErrors: true,
      showKeyboard: true,
      practiceMode: "timed",
    },
    communication: {
      dailyReminders: true,
      challengeReminders: true,
      productUpdates: false,
      marketingEmails: false,
    },
  });

  const [pwForm, setPwForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  // ── Load profile ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await fetch("/api/user/profile/me", {
          method: "GET",
          credentials: "include", // sends the httpOnly accessToken cookie
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load profile");
        }

        if (cancelled) return;

        // Merge user + typing stats (allTime) into one object the UI uses
        const merged = {
          ...data.user,
          stats: {
            avgWpm: data.stats?.overall?.averageWPM ?? 0,
            avgAccuracy: data.stats?.overall?.averageAccuracy ?? 0,
            consistency: data.stats?.overall?.consistency ?? 0,
            totalTimeTyped: (data.stats?.overall?.totalTime ?? 0) / 3600, // seconds -> hours
          },
        };

        setUser(merged);
        setNameInput(merged.name || "");
        setPhoneInput(merged.phone || "");
        if (merged.preferences) setPrefs(merged.preferences);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Couldn't load profile",
          text: err.message || "Please try again in a moment.",
          background: "var(--pf-bg2)",
          color: "var(--pf-text)",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Check if local storage has typing data
    const checkLocalData = () => {
      const lsKey = "tc_user_data";
      const localData = localStorage.getItem(lsKey);

      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setLocalDataExists(true);
          setLocalDataPreview({
            totalTests: parsed.totalTests || 0,
            bestWPM: parsed.bestWPM || 0,
            bestAccuracy: parsed.bestAccuracy || 0,
            xp: parsed.xp || 0,
            points: parsed.points || 0,
            streak: parsed.streak?.current || 0,
          });
        } catch (e) {
          console.error("Failed to parse local data:", e);
        }
      } else {
        setLocalDataExists(false);
        setLocalDataPreview(null);
      }
    };

    checkLocalData();
  }, []);

  const handleResetStats = async () => {
    if (selectedStats.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No options selected",
        text: "Please select at least one statistic to reset",
        background: isDarkMode ? "#0d1117" : "#fff",
        color: isDarkMode ? "#e6edf3" : "#0d1117",
      });
      return;
    }

    Swal.fire({
      icon: "warning",
      title: "⚠️ Irreversible Action!",
      html: `
      <div style="text-align: left;">
        <p>You are about to reset the following:</p>
        <ul style="margin-top: 10px;">
          ${selectedStats
            .map((id) => {
              const option = resetOptions.find((o) => o.id === id);
              return `<li><strong>${option?.label}</strong> - ${option?.description}</li>`;
            })
            .join("")}
        </ul>
        <p style="color: #dc2626; margin-top: 15px;"><strong>This action cannot be undone!</strong></p>
        <p>Type <strong style="color: #ef4444;">CONFIRM RESET</strong> to proceed.</p>
      </div>
    `,
      input: "text",
      inputPlaceholder: "Type CONFIRM RESET here",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, Reset Stats",
      cancelButtonText: "Cancel",
      background: isDarkMode ? "#0d1117" : "#fff",
      color: isDarkMode ? "#e6edf3" : "#0d1117",
      preConfirm: (input) => {
        if (input !== "CONFIRM RESET") {
          Swal.showValidationMessage("Please type CONFIRM RESET correctly");
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        setResetting(true);
        try {
          const res = await fetch("/api/user/profile/reset-stats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ statsToReset: selectedStats }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message);

          Swal.fire({
            icon: "success",
            title: "Stats Reset Successfully",
            text: data.message,
            background: isDarkMode ? "#0d1117" : "#fff",
            color: isDarkMode ? "#e6edf3" : "#0d1117",
          });

          // Refresh user data
          setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Reset Failed",
            text: err.message,
            background: isDarkMode ? "#0d1117" : "#fff",
            color: isDarkMode ? "#e6edf3" : "#0d1117",
          });
        } finally {
          setResetting(false);
          setShowResetModal(false);
          setSelectedStats([]);
        }
      }
    });
  };

  const handleDeactivateAccount = async () => {
    Swal.fire({
      icon: "warning",
      title: "⚠️ Deactivate Account",
      html: `
      <div style="text-align: left;">
        <p><strong>What happens when you deactivate?</strong></p>
        <ul style="margin: 10px 0;">
          <li>Your profile will be hidden</li>
          <li>You won't be able to take tests</li>
          <li>Your data will be preserved for 30 days</li>
        </ul>
        <p><strong>⚠️ Important:</strong> You can reactivate within 30 days. After 30 days, your account and ALL data will be permanently deleted.</p>
        <p style="color: #dc2626; margin-top: 15px;">Type <strong>DEACTIVATE MY ACCOUNT</strong> to proceed.</p>
      </div>
    `,
      input: "text",
      inputPlaceholder: "Type DEACTIVATE MY ACCOUNT here",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Deactivate Account",
      cancelButtonText: "Cancel",
      background: isDarkMode ? "#0d1117" : "#fff",
      color: isDarkMode ? "#e6edf3" : "#0d1117",
      preConfirm: (input) => {
        if (input !== "DEACTIVATE MY ACCOUNT") {
          Swal.showValidationMessage(
            "Please type DEACTIVATE MY ACCOUNT correctly",
          );
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch("/api/user/profile/deactivate-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message);

          Swal.fire({
            icon: "success",
            title: "Account Deactivated",
            html: `
            Your account has been deactivated.<br/>
            You have 30 days to reactivate before permanent deletion.<br/>
            <strong>We'll miss you! ❤️</strong>
          `,
            background: isDarkMode ? "#0d1117" : "#fff",
            color: isDarkMode ? "#e6edf3" : "#0d1117",
          }).then(() => {
            // Clear local storage and redirect to home
            localStorage.removeItem("user");
            localStorage.removeItem("isLoggedIn");
            window.location.href = "/";
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Deactivation Failed",
            text: err.message,
            background: isDarkMode ? "#0d1117" : "#fff",
            color: isDarkMode ? "#e6edf3" : "#0d1117",
          });
        }
      }
    });
  };

  const handleExportData = async (format) => {
    try {
      window.location.href = `/api/user/profile/export-data?format=${format}`;

      Swal.fire({
        icon: "success",
        title: "Export Started",
        text: `Your data is being exported in ${format.toUpperCase()} format. Download should start shortly.`,
        timer: 3000,
        showConfirmButton: false,
        background: isDarkMode ? "#0d1117" : "#fff",
        color: isDarkMode ? "#e6edf3" : "#0d1117",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: err.message,
        background: isDarkMode ? "#0d1117" : "#fff",
        color: isDarkMode ? "#e6edf3" : "#0d1117",
      });
    }
  };

  const syncLocalData = async () => {
    const lsKey = "tc_user_data";
    const localData = localStorage.getItem(lsKey);

    if (!localData) {
      Swal.fire({
        icon: "info",
        title: "No Local Data Found",
        text: "No local typing data found to sync.",
        background: isDarkMode ? "#0d1117" : "#fff",
        color: isDarkMode ? "#e6edf3" : "#0d1117",
      });
      return;
    }

    setSyncing(true);
    try {
      const res = await fetch("/api/user/profile/sync-local-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ localData: JSON.parse(localData) }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Sync failed");

      Swal.fire({
        icon: "success",
        title: "Data Synced Successfully!",
        html: `
        <div style="text-align: left;">
          <p>Your local typing data has been merged with your profile.</p>
          <p><strong>Synced fields:</strong> ${data.syncedFields.join(", ")}</p>
        </div>
      `,
        background: isDarkMode ? "#0d1117" : "#fff",
        color: isDarkMode ? "#e6edf3" : "#0d1117",
        confirmButtonText: "Great!",
      });

      // Refresh user data
      const meRes = await fetch("/api/user/profile/me", {
        credentials: "include",
      });
      const meData = await meRes.json();
      if (meData.success) {
        const merged = {
          ...meData.user,
          stats: {
            avgWpm: meData.stats?.overall?.averageWPM ?? 0,
            avgAccuracy: meData.stats?.overall?.averageAccuracy ?? 0,
            consistency: meData.stats?.overall?.consistency ?? 0,
            totalTimeTyped: (meData.stats?.overall?.totalTime ?? 0) / 3600,
          },
        };
        setUser(merged);
      }

      setShowSyncModal(false);
      setLocalDataExists(false);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Sync Failed",
        text: err.message,
        background: isDarkMode ? "#0d1117" : "#fff",
        color: isDarkMode ? "#e6edf3" : "#0d1117",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Add function to clear local storage
  const clearLocalData = () => {
    Swal.fire({
      icon: "warning",
      title: "Clear Local Data?",
      text: "This will remove your typing data from local storage. Make sure you've synced it to your profile first!",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, clear it",
      cancelButtonText: "Cancel",
      background: isDarkMode ? "#0d1117" : "#fff",
      color: isDarkMode ? "#e6edf3" : "#0d1117",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("tc_user_data");
        setLocalDataExists(false);
        setLocalDataPreview(null);
        Swal.fire({
          icon: "success",
          title: "Cleared!",
          text: "Local storage data has been cleared.",
          timer: 1500,
          showConfirmButton: false,
          background: isDarkMode ? "#0d1117" : "#fff",
          color: isDarkMode ? "#e6edf3" : "#0d1117",
        });
      }
    });
  };

  // ── XP progress for ring/bar ─────────────────────────────────
  const calculateRequiredXp = (level) => Math.floor(100 + (level - 1) * 50);
  const xpProgress = (() => {
    if (!user) return 0;
    const currentLevelXp = calculateRequiredXp(user.level);
    const nextLevelXp = calculateRequiredXp(user.level + 1);
    const xpIntoLevel = user.xp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;
    return Math.min(100, Math.max(0, (xpIntoLevel / xpNeeded) * 100));
  })();
  const nextLevelXpNeeded = user
    ? calculateRequiredXp(user.level + 1) - calculateRequiredXp(user.level)
    : 0;
  const xpIntoLevel = user ? user.xp - calculateRequiredXp(user.level) : 0;

  // ── Handlers ──────────────────────────────────────────────────
  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "Invalid file",
        text: "Please choose an image file.",
        background: "var(--pf-bg2)",
        color: "var(--pf-text)",
      });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "File too large",
        text: "Avatar must be under 4MB.",
        background: "var(--pf-bg2)",
        color: "var(--pf-text)",
      });
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function saveAvatar() {
    if (!avatarFile) return;
    setSaving(true);
    try {
      // const formData = new FormData();
      // formData.append("avatar", avatarFile);
      // await fetch("/api/user/profile/change-avatar", {
      //   method: "POST",
      //   headers: { Authorization: `Bearer ${token}` },
      //   body: formData,
      // });
      await new Promise((r) => setTimeout(r, 700));
      setUser((u) => ({ ...u, avatar: { data: avatarPreview } }));
      setAvatarFile(null);
      Swal.fire({
        icon: "success",
        title: "Avatar updated",
        timer: 1400,
        showConfirmButton: false,
        background: "var(--pf-bg2)",
        color: "var(--pf-text)",
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Upload failed",
        text: "Couldn't update your avatar. Try again.",
        background: "var(--pf-bg2)",
        color: "var(--pf-text)",
      });
    } finally {
      setSaving(false);
    }
  }

  async function saveName() {
    if (!nameInput.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Name can't be empty",
        background: "var(--pf-bg2)",
        color: "var(--pf-text)",
      });
      return;
    }
    setSaving(true);
    try {
      // await fetch("/api/user/profile/change-name", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      //   body: JSON.stringify({ name: nameInput.trim() }),
      // });
      await new Promise((r) => setTimeout(r, 600));
      setUser((u) => ({ ...u, name: nameInput.trim() }));
      Swal.fire({
        icon: "success",
        title: "Name updated",
        timer: 1400,
        showConfirmButton: false,
        background: "var(--pf-bg2)",
        color: "var(--pf-text)",
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        background: "var(--pf-bg2)",
        color: "var(--pf-text)",
      });
    } finally {
      setSaving(false);
    }
  }

  async function savePhone() {
    setSaving(true);
    try {
      // await fetch("/api/user/profile/change-phone", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      //   body: JSON.stringify({ phone: phoneInput.trim() }),
      // });
      await new Promise((r) => setTimeout(r, 600));
      setUser((u) => ({ ...u, phone: phoneInput.trim() }));
      Swal.fire({
        icon: "success",
        title: "Phone number updated",
        timer: 1400,
        showConfirmButton: false,
        background: "var(--pf-bg2)",
        color: "var(--pf-text)",
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        background: "var(--pf-bg2)",
        color: "var(--pf-text)",
      });
    } finally {
      setSaving(false);
    }
  }

  function togglePref(section, key) {
    setPrefs((p) => ({
      ...p,
      [section]: { ...p[section], [key]: !p[section][key] },
    }));
  }

  function setPrefValue(section, key, value) {
    setPrefs((p) => ({
      ...p,
      [section]: { ...p[section], [key]: value },
    }));
  }

  async function savePreferences() {
    setSaving(true);
    try {
      // await fetch("/api/user/profile/change-preferences", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      //   body: JSON.stringify({ preferences: prefs }),
      // });
      await new Promise((r) => setTimeout(r, 600));
      setUser((u) => ({ ...u, preferences: prefs }));
      Swal.fire({
        icon: "success",
        title: "Preferences saved",
        timer: 1400,
        showConfirmButton: false,
        background: "var(--pf-bg2)",
        color: "var(--pf-text)",
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Save failed",
        background: "var(--pf-bg2)",
        color: "var(--pf-text)",
      });
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      Swal.fire({
        icon: "warning",
        title: "Fill in all fields",
        background: "var(--pf-bg2)",
        color: "var(--pf-text)",
      });
      return;
    }
    if (pwForm.next.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "Password too short",
        text: "Use at least 8 characters.",
        background: "var(--pf-bg2)",
        color: "var(--pf-text)",
      });
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      Swal.fire({
        icon: "warning",
        title: "Passwords don't match",
        background: "var(--pf-bg2)",
        color: "var(--pf-text)",
      });
      return;
    }
    setSaving(true);
    try {
      // await fetch("/api/user/profile/change-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      //   body: JSON.stringify({
      //     currentPassword: pwForm.current,
      //     newPassword: pwForm.next,
      //   }),
      // });
      await new Promise((r) => setTimeout(r, 700));
      setPwForm({ current: "", next: "", confirm: "" });
      Swal.fire({
        icon: "success",
        title: "Password changed",
        timer: 1400,
        showConfirmButton: false,
        background: "var(--pf-bg2)",
        color: "var(--pf-text)",
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Couldn't change password",
        text: "Check your current password and try again.",
        background: "var(--pf-bg2)",
        color: "var(--pf-text)",
      });
    } finally {
      setSaving(false);
    }
  }

  // ── Loading state ────────────────────────────────────────────
  if (loading || !user) {
    return (
      <div className={`pf-root ${isDarkMode ? "dark" : "light"}`}>
        <div className="pf-loading">
          <Loader2 className="pf-spin" size={28} />
          <span>Loading your profile…</span>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`pf-root ${isDarkMode ? "dark" : "light"}`}>
      {/* ── Header ── */}
      {/* <header className="pf-header">
        <div className="pf-header-inner">
          <button className="pf-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back
          </button>
          <div className="pf-header-title">
            <Keyboard size={17} /> Your Profile
          </div>
          <button
            className="pf-icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header> */}

      <main className="pf-main">
        {/* ── Hero / identity card ── */}
        <section className="pf-hero">
          <div className="pf-avatar-wrap">
            <div className="pf-avatar">
              {avatarPreview || user.avatar?.data ? (
                <img
                  src={avatarPreview || user.avatar.data}
                  alt="Your avatar"
                  className="pf-avatar-img"
                />
              ) : (
                <span className="pf-avatar-initials">{initials}</span>
              )}
            </div>
            <button
              className="pf-avatar-edit"
              onClick={handleAvatarClick}
              aria-label="Change avatar"
              title="Change avatar"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="pf-file-input"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="pf-hero-info">
            <div className="pf-hero-name-row">
              <h1 className="pf-hero-name">{user.name}</h1>
              <span className="pf-level-chip">
                <Sparkles size={12} /> Level {user.level}
              </span>
            </div>
            <p className="pf-hero-email">{user.email}</p>

            <div className="pf-xp-bar-wrap">
              <div className="pf-xp-bar">
                <div
                  className="pf-xp-fill"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <span className="pf-xp-label">
                {Math.max(0, xpIntoLevel)} / {nextLevelXpNeeded} XP to level{" "}
                {user.level + 1}
              </span>
            </div>
          </div>

          {avatarFile && (
            <div className="pf-avatar-save-bar">
              <span>New avatar selected</span>
              <div className="pf-avatar-save-actions">
                <button
                  className="pf-btn pf-btn-sec pf-btn-sm"
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="pf-btn pf-btn-acc pf-btn-sm"
                  onClick={saveAvatar}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="pf-spin" size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  Save
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Add this after the pf-hero section */}
        {localDataExists && (
          <div className="pf-sync-banner">
            <div className="pf-sync-banner-content">
              <div className="pf-sync-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 12.5A7.5 7.5 0 0 1 8 15m0 0L5 12m3 3-3-3M4 6.5A7.5 7.5 0 0 1 16 3m0 0 3 3-3 3m3-3h-6" />
                </svg>
              </div>
              <div className="pf-sync-info">
                <h4>Local Typing Data Found</h4>
                <p>
                  You have {localDataPreview?.totalTests || 0} tests,{" "}
                  {localDataPreview?.bestWPM || 0} WPM best, and{" "}
                  {localDataPreview?.xp || 0} XP stored locally. Sync to your
                  profile to save permanently.
                </p>
              </div>
              <div className="pf-sync-actions">
                <button
                  className="pf-btn pf-btn-primary"
                  onClick={() => setShowSyncModal(true)}
                  disabled={syncing}
                >
                  {syncing ? (
                    <Loader2 className="pf-spin" size={16} />
                  ) : (
                    "Sync Now"
                  )}
                </button>
                <button
                  className="pf-btn pf-btn-secondary"
                  onClick={clearLocalData}
                >
                  Clear Local
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sync Confirmation Modal */}
        {showSyncModal && (
          <div
            className="pf-modal-overlay"
            onClick={() => !syncing && setShowSyncModal(false)}
          >
            <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
              <div className="pf-modal-header">
                <h3>Sync Local Data?</h3>
                <button
                  className="pf-modal-close"
                  onClick={() => setShowSyncModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="pf-modal-body">
                <p>This will merge your local typing data with your profile:</p>
                <ul className="pf-sync-list">
                  <li>
                    📊 <strong>{localDataPreview?.totalTests || 0}</strong>{" "}
                    total tests
                  </li>
                  <li>
                    ⚡ <strong>{localDataPreview?.bestWPM || 0}</strong> WPM
                    best speed
                  </li>
                  <li>
                    🎯 <strong>{localDataPreview?.bestAccuracy || 0}%</strong>{" "}
                    best accuracy
                  </li>
                  <li>
                    ⭐ <strong>{localDataPreview?.xp || 0}</strong> XP earned
                  </li>
                  <li>
                    🏆 <strong>{localDataPreview?.points || 0}</strong> points
                  </li>
                  <li>
                    🔥 <strong>{localDataPreview?.streak || 0}</strong> day
                    streak
                  </li>
                </ul>
                <p className="pf-sync-warning">
                  ⚠️ This will merge data (keep the highest values). Your
                  profile data will be preserved.
                </p>
              </div>
              <div className="pf-modal-footer">
                <button
                  className="pf-btn pf-btn-secondary"
                  onClick={() => setShowSyncModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="pf-btn pf-btn-primary"
                  onClick={syncLocalData}
                  disabled={syncing}
                >
                  {syncing ? (
                    <Loader2 className="pf-spin" size={16} />
                  ) : (
                    "Confirm Sync"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Quick stats row ── */}
        <section className="pf-quickstats">
          <div className="pf-qstat">
            <Zap size={16} className="pf-qicon pf-qicon-blue" />
            <div>
              <div className="pf-qval">{user.bestWPM}</div>
              <div className="pf-qlabel">Best WPM</div>
            </div>
          </div>
          <div className="pf-qstat">
            <Target size={16} className="pf-qicon pf-qicon-green" />
            <div>
              <div className="pf-qval">{user.bestAccuracy}%</div>
              <div className="pf-qlabel">Best Accuracy</div>
            </div>
          </div>
          <div className="pf-qstat">
            <Flame size={16} className="pf-qicon pf-qicon-orange" />
            <div>
              <div className="pf-qval">{user.streak.current}</div>
              <div className="pf-qlabel">Day Streak</div>
            </div>
          </div>
          <div className="pf-qstat">
            <Trophy size={16} className="pf-qicon pf-qicon-purple" />
            <div>
              <div className="pf-qval">{user.totalTests}</div>
              <div className="pf-qlabel">Total Tests</div>
            </div>
          </div>
        </section>

        {/* ── Tabs ── */}
        <nav className="pf-tabs" role="tablist">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={activeTab === t.id}
                className={`pf-tab${activeTab === t.id ? " pf-tab-active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* ── Tab content ── */}
        <section className="pf-panel">
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="pf-tabpanel">
              <div className="pf-card">
                <div className="pf-card-title">
                  <Award size={14} /> Badges Earned
                </div>
                <div className="pf-badge-grid">
                  {user.badges.map((b, i) => (
                    <div className="pf-badge" key={i}>
                      <span className="pf-badge-icon">
                        {LEVEL_BADGE_ICONS[b.name] || "🏷️"}
                      </span>
                      <div>
                        <div className="pf-badge-name">{b.name}</div>
                        <div className="pf-badge-desc">{b.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pf-two-col">
                <div className="pf-card">
                  <div className="pf-card-title">
                    <Star size={14} /> All-Time Performance
                  </div>
                  <div className="pf-stat-row">
                    <span>Average WPM</span>
                    <strong>{user.stats.avgWpm.toFixed(1)}</strong>
                  </div>
                  <div className="pf-stat-row">
                    <span>Average Accuracy</span>
                    <strong>{user.stats.avgAccuracy.toFixed(1)}%</strong>
                  </div>
                  <div className="pf-stat-row">
                    <span>Consistency</span>
                    <strong>{user.stats.consistency}%</strong>
                  </div>
                  <div className="pf-stat-row">
                    <span>Total Time Typed</span>
                    <strong>{user.stats.totalTimeTyped.toFixed(1)} hrs</strong>
                  </div>
                </div>

                <div className="pf-card">
                  <div className="pf-card-title">
                    <Flame size={14} /> Streak
                  </div>
                  <div className="pf-streak-display">
                    <div className="pf-streak-current">
                      <Flame size={28} className="pf-streak-flame" />
                      <div>
                        <div className="pf-streak-num">
                          {user.streak.current}
                        </div>
                        <div className="pf-streak-lbl">day streak</div>
                      </div>
                    </div>
                    <div className="pf-streak-longest">
                      Longest streak:{" "}
                      <strong>{user.streak.longest} days</strong>
                    </div>
                  </div>
                  <div className="pf-points-display">
                    <span>Total Points</span>
                    <strong className="pf-points-val">
                      {user.points.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT */}
          {activeTab === "account" && (
            <div className="pf-tabpanel">
              <div className="pf-card">
                <div className="pf-card-title">
                  <User size={14} /> Display Name
                </div>
                <div className="pf-field-row">
                  <input
                    className="pf-input"
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Your name"
                    maxLength={40}
                  />
                  <button
                    className="pf-btn pf-btn-acc"
                    onClick={saveName}
                    disabled={saving || nameInput.trim() === user.name}
                  >
                    {saving ? (
                      <Loader2 className="pf-spin" size={14} />
                    ) : (
                      <Save size={14} />
                    )}
                    Save
                  </button>
                </div>
              </div>

              <div className="pf-card">
                <div className="pf-card-title">
                  <Mail size={14} /> Email Address
                </div>
                <div className="pf-field-row">
                  <input
                    className="pf-input"
                    type="email"
                    value={user.email}
                    disabled
                  />
                  <span className="pf-locked-chip">
                    <Lock size={12} /> Verified
                  </span>
                </div>
                <p className="pf-hint">
                  Contact support to change your email address.
                </p>
              </div>

              <div className="pf-card">
                <div className="pf-card-title">
                  <Phone size={14} /> Phone Number
                </div>
                <div className="pf-field-row">
                  <input
                    className="pf-input"
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+91 00000 00000"
                  />
                  <button
                    className="pf-btn pf-btn-acc"
                    onClick={savePhone}
                    disabled={saving || phoneInput === (user.phone || "")}
                  >
                    {saving ? (
                      <Loader2 className="pf-spin" size={14} />
                    ) : (
                      <Save size={14} />
                    )}
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="pf-tabpanel">
              <div className="pf-card">
                <div className="pf-card-title">
                  <Monitor size={14} /> Appearance
                </div>
                <div className="pf-pref-row">
                  <div className="pf-pref-text">
                    <span className="pf-pref-name">Theme</span>
                    <span className="pf-pref-desc">
                      Choose how SwiftKeys looks
                    </span>
                  </div>
                  <div className="pf-segment">
                    {["light", "dark", "auto"].map((opt) => (
                      <button
                        key={opt}
                        className={`pf-segment-btn${prefs.ui.theme === opt ? " pf-segment-active" : ""}`}
                        onClick={() => setPrefValue("ui", "theme", opt)}
                      >
                        {opt === "light" && <Sun size={13} />}
                        {opt === "dark" && <Moon size={13} />}
                        {opt === "auto" && <Monitor size={13} />}
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pf-pref-row">
                  <div className="pf-pref-text">
                    <span className="pf-pref-name">Sound Effects</span>
                    <span className="pf-pref-desc">
                      Play clicks while typing
                    </span>
                  </div>
                  <button
                    className={`pf-toggle${prefs.ui.soundEffects ? " pf-toggle-on" : ""}`}
                    onClick={() => togglePref("ui", "soundEffects")}
                    role="switch"
                    aria-checked={prefs.ui.soundEffects}
                  />
                </div>

                <div className="pf-pref-row">
                  <div className="pf-pref-text">
                    <span className="pf-pref-name">Keyboard Sound</span>
                    <span className="pf-pref-desc">
                      Mechanical keyboard sound on keypress
                    </span>
                  </div>
                  <button
                    className={`pf-toggle${prefs.ui.keyboardSound ? " pf-toggle-on" : ""}`}
                    onClick={() => togglePref("ui", "keyboardSound")}
                    role="switch"
                    aria-checked={prefs.ui.keyboardSound}
                  />
                </div>

                <div className="pf-pref-row">
                  <div className="pf-pref-text">
                    <span className="pf-pref-name">Show Live WPM</span>
                    <span className="pf-pref-desc">
                      Display real-time speed while typing
                    </span>
                  </div>
                  <button
                    className={`pf-toggle${prefs.ui.showLiveWpm ? " pf-toggle-on" : ""}`}
                    onClick={() => togglePref("ui", "showLiveWpm")}
                    role="switch"
                    aria-checked={prefs.ui.showLiveWpm}
                  />
                </div>
              </div>

              <div className="pf-card">
                <div className="pf-card-title">
                  <Keyboard size={14} /> Typing Experience
                </div>

                {/* <div className="pf-pref-row">
                  <div className="pf-pref-text">
                    <span className="pf-pref-name">Font Size</span>
                    <span className="pf-pref-desc">
                      Size of the typing text
                    </span>
                  </div>
                  <div className="pf-slider-wrap">
                    <input
                      type="range"
                      min="12"
                      max="24"
                      step="1"
                      value={prefs.typing.fontSize}
                      onChange={(e) =>
                        setPrefValue(
                          "typing",
                          "fontSize",
                          Number(e.target.value),
                        )
                      }
                      className="pf-slider"
                    />
                    <span className="pf-slider-val">
                      {prefs.typing.fontSize}px
                    </span>
                  </div>
                </div> */}

                <div className="pf-pref-row">
                  <div className="pf-pref-text">
                    <span className="pf-pref-name">Highlight Errors</span>
                    <span className="pf-pref-desc">
                      Mark mistakes in red as you type
                    </span>
                  </div>
                  <button
                    className={`pf-toggle${prefs.typing.highlightErrors ? " pf-toggle-on" : ""}`}
                    onClick={() => togglePref("typing", "highlightErrors")}
                    role="switch"
                    aria-checked={prefs.typing.highlightErrors}
                  />
                </div>

                <div className="pf-pref-row">
                  <div className="pf-pref-text">
                    <span className="pf-pref-name">Show Hand Guide</span>
                    <span className="pf-pref-desc">
                      Visual hand placement helper
                    </span>
                  </div>
                  <button
                    className={`pf-toggle${prefs.typing.showKeyboard ? " pf-toggle-on" : ""}`}
                    onClick={() => togglePref("typing", "showKeyboard")}
                    role="switch"
                    aria-checked={prefs.typing.showKeyboard}
                  />
                </div>

                <div className="pf-pref-row">
                  <div className="pf-pref-text">
                    <span className="pf-pref-name">Default Practice Mode</span>
                    <span className="pf-pref-desc">
                      Mode selected when starting a test
                    </span>
                  </div>
                  <div className="pf-segment">
                    {["timed", "words", "custom"].map((opt) => (
                      <button
                        key={opt}
                        className={`pf-segment-btn${prefs.typing.practiceMode === opt ? " pf-segment-active" : ""}`}
                        onClick={() =>
                          setPrefValue("typing", "practiceMode", opt)
                        }
                      >
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pf-card">
                <div className="pf-card-title">
                  <Bell size={14} /> Notifications
                </div>

                <div className="pf-pref-row">
                  <div className="pf-pref-text">
                    <span className="pf-pref-name">Daily Reminders</span>
                    <span className="pf-pref-desc">
                      Nudge me to keep my streak alive
                    </span>
                  </div>
                  <button
                    className={`pf-toggle${prefs.communication.dailyReminders ? " pf-toggle-on" : ""}`}
                    onClick={() =>
                      togglePref("communication", "dailyReminders")
                    }
                    role="switch"
                    aria-checked={prefs.communication.dailyReminders}
                  />
                </div>

                <div className="pf-pref-row">
                  <div className="pf-pref-text">
                    <span className="pf-pref-name">Challenge Reminders</span>
                    <span className="pf-pref-desc">
                      Notify me about new daily challenges
                    </span>
                  </div>
                  <button
                    className={`pf-toggle${prefs.communication.challengeReminders ? " pf-toggle-on" : ""}`}
                    onClick={() =>
                      togglePref("communication", "challengeReminders")
                    }
                    role="switch"
                    aria-checked={prefs.communication.challengeReminders}
                  />
                </div>

                <div className="pf-pref-row">
                  <div className="pf-pref-text">
                    <span className="pf-pref-name">Product Updates</span>
                    <span className="pf-pref-desc">
                      New features and announcements
                    </span>
                  </div>
                  <button
                    className={`pf-toggle${prefs.communication.productUpdates ? " pf-toggle-on" : ""}`}
                    onClick={() =>
                      togglePref("communication", "productUpdates")
                    }
                    role="switch"
                    aria-checked={prefs.communication.productUpdates}
                  />
                </div>

                <div className="pf-pref-row">
                  <div className="pf-pref-text">
                    <span className="pf-pref-name">Marketing Emails</span>
                    <span className="pf-pref-desc">
                      Occasional offers and tips
                    </span>
                  </div>
                  <button
                    className={`pf-toggle${prefs.communication.marketingEmails ? " pf-toggle-on" : ""}`}
                    onClick={() =>
                      togglePref("communication", "marketingEmails")
                    }
                    role="switch"
                    aria-checked={prefs.communication.marketingEmails}
                  />
                </div>
              </div>

              <div className="pf-save-bar">
                <button
                  className="pf-btn pf-btn-acc pf-btn-lg"
                  onClick={savePreferences}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="pf-spin" size={16} />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <div className="pf-tabpanel">
              <div className="pf-card">
                <div className="pf-card-title">
                  <Shield size={14} /> Change Password
                </div>

                {["current", "next", "confirm"].map((field) => (
                  <div className="pf-pw-row" key={field}>
                    <label className="pf-pw-label">
                      {field === "current"
                        ? "Current Password"
                        : field === "next"
                          ? "New Password"
                          : "Confirm New Password"}
                    </label>
                    <div className="pf-pw-input-wrap">
                      <input
                        className="pf-input"
                        type={showPw[field] ? "text" : "password"}
                        value={pwForm[field]}
                        onChange={(e) =>
                          setPwForm((p) => ({
                            ...p,
                            [field]: e.target.value,
                          }))
                        }
                        placeholder={
                          field === "current"
                            ? "Enter current password"
                            : field === "next"
                              ? "At least 8 characters"
                              : "Re-enter new password"
                        }
                      />
                      <button
                        className="pf-pw-eye"
                        onClick={() =>
                          setShowPw((s) => ({ ...s, [field]: !s[field] }))
                        }
                        aria-label="Toggle password visibility"
                        type="button"
                      >
                        {showPw[field] ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pf-save-bar pf-save-bar-tight">
                  <button
                    className="pf-btn pf-btn-acc"
                    onClick={changePassword}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="pf-spin" size={14} />
                    ) : (
                      <Lock size={14} />
                    )}
                    Update Password
                  </button>
                </div>
              </div>

              <div className="pf-card pf-card-info">
                <div className="pf-card-title">
                  <Shield size={14} /> Account Status
                </div>
                <div className="pf-stat-row">
                  <span>Account Type</span>
                  <strong>{user.usertype}</strong>
                </div>
                <div className="pf-stat-row">
                  <span>Member Since</span>
                  <strong>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </strong>
                </div>
                {user.lastLogin && (
                  <div className="pf-stat-row">
                    <span>Last Login</span>
                    <strong>
                      {new Date(user.lastLogin).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(user.lastLogin).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </strong>
                  </div>
                )}
              </div>

              <div className="pf-card">
                <div className="pf-card-title">
                  <Database size={14} /> Data Management
                </div>

                {/* Export Data */}
                <div className="pf-management-item">
                  <div className="pf-management-info">
                    <FileJson size={18} />
                    <div>
                      <div className="pf-management-title">
                        Export Your Data
                      </div>
                      <div className="pf-management-desc">
                        Download all your typing data in JSON or CSV format
                        (GDPR Compliant)
                      </div>
                    </div>
                  </div>
                  <div className="pf-management-actions">
                    <button
                      className="pf-btn pf-btn-sm"
                      onClick={() => handleExportData("json")}
                    >
                      <FileJson size={14} /> JSON
                    </button>
                    <button
                      className="pf-btn pf-btn-sm"
                      onClick={() => handleExportData("csv")}
                    >
                      <FileSpreadsheet size={14} /> CSV
                    </button>
                  </div>
                </div>

                {/* Reset Stats */}
                <div className="pf-management-item">
                  <div className="pf-management-info">
                    <RefreshCw size={18} />
                    <div>
                      <div className="pf-management-title">
                        Reset Statistics
                      </div>
                      <div className="pf-management-desc">
                        Reset specific typing stats, gamification data, or
                        achievements
                      </div>
                    </div>
                  </div>
                  <button
                    className="pf-btn pf-btn-warning pf-btn-sm"
                    onClick={() => setShowResetModal(true)}
                  >
                    <RefreshCw size={14} /> Reset Stats
                  </button>
                </div>

                {/* Clear History */}
                <div className="pf-management-item">
                  <div className="pf-management-info">
                    <Trash2 size={18} />
                    <div>
                      <div className="pf-management-title">
                        Clear Test History
                      </div>
                      <div className="pf-management-desc">
                        Remove all test history while keeping your stats intact
                      </div>
                    </div>
                  </div>
                  <button
                    className="pf-btn pf-btn-warning pf-btn-sm"
                    onClick={async () => {
                      const result = await Swal.fire({
                        icon: "warning",
                        title: "Clear Test History?",
                        text: "This will remove all your test records but keep your best stats. This action cannot be undone.",
                        showCancelButton: true,
                        confirmButtonColor: "#dc2626",
                        confirmButtonText: "Yes, Clear History",
                        background: isDarkMode ? "#0d1117" : "#fff",
                        color: isDarkMode ? "#e6edf3" : "#0d1117",
                      });

                      if (result.isConfirmed) {
                        try {
                          const res = await fetch(
                            "/api/user/profile/clear-history",
                            {
                              method: "POST",
                              credentials: "include",
                            },
                          );
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.message);

                          Swal.fire({
                            icon: "success",
                            title: "History Cleared",
                            text: "Your test history has been cleared.",
                            background: isDarkMode ? "#0d1117" : "#fff",
                            color: isDarkMode ? "#e6edf3" : "#0d1117",
                          }).then(() => window.location.reload());
                        } catch (err) {
                          Swal.fire({
                            icon: "error",
                            title: "Failed",
                            text: err.message,
                            background: isDarkMode ? "#0d1117" : "#fff",
                            color: isDarkMode ? "#e6edf3" : "#0d1117",
                          });
                        }
                      }
                    }}
                  >
                    <Trash2 size={14} /> Clear History
                  </button>
                </div>
              </div>

              {/* Account Actions Section */}
              <div className="pf-card pf-card-danger">
                <div className="pf-card-title">
                  <AlertCircle size={14} /> Account Actions
                </div>

                {/* Deactivate Account */}
                <div className="pf-management-item">
                  <div className="pf-management-info">
                    <UserX size={18} />
                    <div>
                      <div className="pf-management-title">
                        Deactivate Account
                      </div>
                      <div className="pf-management-desc">
                        Temporarily disable your account. Data preserved for 30
                        days.
                      </div>
                    </div>
                  </div>
                  <button
                    className="pf-btn pf-btn-danger pf-btn-sm"
                    onClick={handleDeactivateAccount}
                  >
                    <UserX size={14} /> Deactivate
                  </button>
                </div>

                {/* GDPR Compliance Note */}
                <div className="pf-gdpr-note">
                  <Shield size={14} />
                  <span>
                    We comply with international data protection regulations
                    including GDPR (EU), CCPA (California), and similar laws
                    worldwide. You have the right to access, export, and delete
                    your data at any time.
                  </span>
                </div>
              </div>

              {/* Reset Stats Modal */}
              {showResetModal && (
                <div
                  className="pf-modal-overlay"
                  onClick={() => setShowResetModal(false)}
                >
                  <div
                    className="pf-modal pf-modal-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="pf-modal-header">
                      <h3>Reset Statistics</h3>
                      <button
                        className="pf-modal-close"
                        onClick={() => setShowResetModal(false)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="pf-modal-body">
                      <p className="pf-reset-warning">
                        ⚠️ Select the statistics you want to reset. This action
                        cannot be undone!
                      </p>
                      <div className="pf-reset-options">
                        {resetOptions.map((option) => (
                          <label key={option.id} className="pf-reset-option">
                            <input
                              type="checkbox"
                              checked={selectedStats.includes(option.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStats([
                                    ...selectedStats,
                                    option.id,
                                  ]);
                                } else {
                                  setSelectedStats(
                                    selectedStats.filter(
                                      (s) => s !== option.id,
                                    ),
                                  );
                                }
                              }}
                            />
                            <div>
                              <strong>{option.label}</strong>
                              <span>{option.description}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="pf-modal-footer">
                      <button
                        className="pf-btn pf-btn-secondary"
                        onClick={() => setShowResetModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="pf-btn pf-btn-danger"
                        onClick={handleResetStats}
                        disabled={selectedStats.length === 0 || resetting}
                      >
                        {resetting ? (
                          <Loader2 className="pf-spin" size={16} />
                        ) : (
                          "Reset Selected"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
