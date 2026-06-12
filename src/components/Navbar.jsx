import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ThemeContext } from "../context/ThemeContext";
import {
  Zap,
  ChevronDown,
  Menu,
  X,
  Moon,
  Sun,
  User,
  LogIn,
  UserPlus,
  Shield,
  BookOpen,
  BarChart2,
  Trophy,
  Keyboard,
  Settings,
  Globe,
  Home,
  Brain,
  Star,
  AlertTriangle,
  Flame,
  GraduationCap,
} from "lucide-react";

const LS_KEY = "tc_user_data";
function lsGet(k) {
  try {
    return JSON.parse(localStorage.getItem(k));
  } catch {
    return null;
  }
}

export default function Navbar() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userData] = useState(() => lsGet(LS_KEY));
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target))
        setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleDrop = (id) =>
    setOpenDropdown((prev) => (prev === id ? null : id));

  const adminAlert = () => {
    Swal.fire({
      icon: "warning",
      title: "Restricted Area",
      text: "This area is for authenticated administrators only. Unauthorized access is strictly prohibited and may be logged.",
      confirmButtonText: "Understood",
      confirmButtonColor: "#7c6af7",
      background: isDarkMode ? "#181b25" : "#fff",
      color: isDarkMode ? "#e8eaf6" : "#1a1c2e",
    });
  };

  const NAV_LINKS = [
    { label: "Home", path: "/", icon: Home },
    {
      label: "Practice",
      icon: Keyboard,
      dropdown: [
        { label: "Typing Test", path: "/", icon: Keyboard },
        { label: "Custom Drills", path: "/drills", icon: Brain },
        // { label: "Code Typing", path: "/code", icon: BookOpen },
        { label: "Daily Challenge", path: "/daily", icon: Flame },
      ],
    },
    {
      label: "Progress",
      icon: BarChart2,
      dropdown: [
        { label: "Analytics", path: "/user/analytics", icon: BarChart2 },
        // { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
        // { label: "Achievements", path: "/achievements", icon: Star },
      ],
    },
    { label: "Languages", path: "/languages", icon: Globe },
    { label: "Govt Exams", path: "/exams", icon: GraduationCap },
  ];

  const AUTH_MENU = [
    { label: "Login", path: "/user/auth/login", icon: LogIn },
    { label: "Sign Up", path: "/user/auth/signup", icon: UserPlus },
    { label: "Admin Login", icon: Shield, admin: true },
    { label: "Admin Signup", icon: Shield, admin: true },
  ];

  const isLoggedIn = userData?.guestId || userData?.userId;

  return (
    <nav
      ref={navRef}
      className={`sk-nav ${isDarkMode ? "dark" : "light"} ${scrolled ? "sk-nav-scrolled" : ""}`}
    >
      <div className="sk-nav-inner">
        {/* Logo */}
        <div className="sk-nav-logo" onClick={() => navigate("/")}>
          <div className="sk-logo-icon">
            <Zap size={22} />
          </div>
          <div className="sk-logo-text">
            <span className="sk-logo-name">Typing Guru</span>
            <span className="sk-logo-sub">Typing Coach</span>
          </div>
        </div>

        {/* Desktop links */}
        <div className="sk-nav-links">
          {NAV_LINKS.map((item) => (
            <div key={item.label} className="sk-nav-item">
              {item.dropdown ? (
                <>
                  <button
                    className={`sk-nav-link sk-nav-link-drop ${openDropdown === item.label ? "sk-drop-open" : ""}`}
                    onClick={() => toggleDrop(item.label)}
                  >
                    <item.icon size={15} />
                    {item.label}
                    <ChevronDown size={13} className="sk-chev" />
                  </button>
                  {openDropdown === item.label && (
                    <div className="sk-dropdown">
                      {item.dropdown.map((d) => (
                        <button
                          key={d.label}
                          className="sk-drop-item"
                          onClick={() => {
                            navigate(d.path);
                            setOpenDropdown(null);
                          }}
                        >
                          <d.icon size={14} />
                          {d.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  className="sk-nav-link"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon size={15} />
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Right actions */}
        <div className="sk-nav-right">
          <button
            className="sk-icon-btn"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Auth dropdown */}
          {/* <div className="sk-nav-item">
            <button
              className={`sk-auth-btn ${openDropdown === "auth" ? "sk-drop-open" : ""}`}
              onClick={() => toggleDrop("auth")}
            >
              <User size={15} />
              {isLoggedIn ? userData?.name || "Guest" : "Account"}
              <ChevronDown size={13} className="sk-chev" />
            </button>
            {openDropdown === "auth" && (
              <div className="sk-dropdown sk-dropdown-right">
                {isLoggedIn && (
                  <div className="sk-drop-user-info">
                    <span className="sk-drop-greeting">
                      Hello, {userData?.name || "Guest"} 👋
                    </span>
                    {userData?.guestId && (
                      <span className="sk-drop-guest-tag">Guest Mode</span>
                    )}
                  </div>
                )}
                {AUTH_MENU.map((a) => (
                  <button
                    key={a.label}
                    className={`sk-drop-item ${a.admin ? "sk-drop-admin" : ""}`}
                    onClick={() => {
                      if (a.admin) {
                        adminAlert();
                      } else {
                        navigate(a.path);
                      }
                      setOpenDropdown(null);
                    }}
                  >
                    <a.icon size={14} />
                    {a.label}
                    {a.admin && <span className="sk-admin-tag">Admin</span>}
                  </button>
                ))}
              </div>
            )}
          </div> */}

          {/* Mobile toggle */}
          <button
            className="sk-mobile-toggle"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sk-mobile-menu ${mobileOpen ? "sk-mobile-open" : ""}`}>
        {NAV_LINKS.map((item) => (
          <div key={item.label}>
            {item.dropdown ? (
              <>
                <button
                  className="sk-mob-link sk-mob-link-head"
                  onClick={() => toggleDrop("mob_" + item.label)}
                >
                  <item.icon size={15} /> {item.label}
                  <ChevronDown
                    size={13}
                    className={`sk-chev ${openDropdown === "mob_" + item.label ? "sk-chev-up" : ""}`}
                  />
                </button>
                {openDropdown === "mob_" + item.label &&
                  item.dropdown.map((d) => (
                    <button
                      key={d.label}
                      className="sk-mob-link sk-mob-sub"
                      onClick={() => {
                        navigate(d.path);
                        setMobileOpen(false);
                        setOpenDropdown(null);
                      }}
                    >
                      <d.icon size={14} /> {d.label}
                    </button>
                  ))}
              </>
            ) : (
              <button
                className="sk-mob-link"
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
              >
                <item.icon size={15} /> {item.label}
              </button>
            )}
          </div>
        ))}
        <div className="sk-mob-divider" />
        {AUTH_MENU.map((a) => (
          <button
            key={a.label}
            className={`sk-mob-link ${a.admin ? "sk-mob-admin" : ""}`}
            onClick={() => {
              if (a.admin) adminAlert();
              else navigate(a.path);
              setMobileOpen(false);
            }}
          >
            <a.icon size={14} /> {a.label}
            {a.admin && <span className="sk-admin-tag">Admin</span>}
          </button>
        ))}
        <button className="sk-mob-link" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </nav>
  );
}
