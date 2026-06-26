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
  LogOut,
  UserCircle,
  History,
} from "lucide-react";

const LS_KEY = "tc_user_data";

function lsGet(k) {
  try {
    return JSON.parse(localStorage.getItem(k));
  } catch {
    return null;
  }
}

function lsRemove(k) {
  try {
    localStorage.removeItem(k);
  } catch {}
}

export default function Navbar() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navRef = useRef(null);

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    checkAuthStatus();

    // Listen for storage changes (for cross-tab sync)
    window.addEventListener("storage", checkAuthStatus);
    return () => window.removeEventListener("storage", checkAuthStatus);
  }, []);

  const checkAuthStatus = () => {
    // Check for logged-in user from localStorage (set during login)
    const loggedInUser = localStorage.getItem("user");
    const isLoggedInFlag = localStorage.getItem("isLoggedIn") === "true";

    if (loggedInUser && isLoggedInFlag) {
      try {
        const user = JSON.parse(loggedInUser);
        setUserData(user);
        setIsLoggedIn(true);
      } catch (e) {
        setUserData(null);
        setIsLoggedIn(false);
      }
    } else {
      // Fallback to guest data
      const guestData = lsGet(LS_KEY);
      if (guestData?.guestId) {
        setUserData(guestData);
        setIsLoggedIn(false);
      } else {
        setUserData(null);
        setIsLoggedIn(false);
      }
    }
  };

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

  const handleLogout = async () => {
    Swal.fire({
      icon: "question",
      title: "Logout?",
      text: "Are you sure you want to logout?",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      background: isDarkMode ? "#181b25" : "#fff",
      color: isDarkMode ? "#e8eaf6" : "#1a1c2e",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Call logout API to clear cookies
          await fetch("/api/user/auth/logout", {
            method: "POST",
            credentials: "include",
          });
        } catch (err) {
          console.error("Logout API error:", err);
        } finally {
          // Clear local storage
          localStorage.removeItem("user");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("verificationStatus");

          // Reset state
          setUserData(null);
          setIsLoggedIn(false);

          Swal.fire({
            icon: "success",
            title: "Logged Out",
            text: "You have been successfully logged out.",
            timer: 1500,
            showConfirmButton: false,
            background: isDarkMode ? "#181b25" : "#fff",
            color: isDarkMode ? "#e8eaf6" : "#1a1c2e",
          });

          navigate("/");
        }
      }
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
        { label: "Daily Challenge", path: "/daily", icon: Flame },
      ],
    },
    {
      label: "Progress",
      icon: BarChart2,
      dropdown: [
        { label: "Analytics", path: "/user/analytics", icon: BarChart2 },
      ],
    },
    { label: "Languages", path: "/languages", icon: Globe },
    { label: "Govt Exams", path: "/exams", icon: GraduationCap },
  ];

  // Different menu for logged in vs logged out users
  const getAuthMenu = () => {
    if (isLoggedIn) {
      return [
        { label: "My Profile", path: "/user/profile", icon: UserCircle },
        { label: "Analytics", path: "/user/analytics", icon: History },
        // { label: "Settings", path: "/user/settings", icon: Settings },
        { label: "Logout", action: handleLogout, icon: LogOut, isLogout: true }, 
      ]; 
    } else {
      return [
        { label: "Login", path: "/user/auth/login", icon: LogIn },
        { label: "Sign Up", path: "/user/auth/signup", icon: UserPlus },
      ];
    }
  };

  const getDisplayName = () => {
    if (isLoggedIn && userData?.name) {
      return userData.name.split(" ")[0]; // Show first name only
    }
    if (userData?.guestId) {
      return "Guest";
    }
    return "Account";
  };

  const getInitials = () => {
    if (isLoggedIn && userData?.name) {
      const names = userData.name.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    return "👤";
  };

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
            <span className="sk-logo-name">Typing Exam Hub</span>
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
          <div className="sk-nav-item">
            <button
              className={`sk-auth-btn ${openDropdown === "auth" ? "sk-drop-open" : ""}`}
              onClick={() => toggleDrop("auth")}
            >
              {isLoggedIn ? (
                <span className="sk-auth-avatar">{getInitials()}</span>
              ) : (
                <User size={15} />
              )}
              {getDisplayName()}
              <ChevronDown size={13} className="sk-chev" />
            </button>
            {openDropdown === "auth" && (
              <div className="sk-dropdown sk-dropdown-right">
                {isLoggedIn && userData && (
                  <div className="sk-drop-user-info">
                    <span className="sk-drop-greeting">
                      👋 Hello, {userData.name}
                    </span>
                    {userData.email && (
                      <span className="sk-drop-email">{userData.email}</span>
                    )}
                    {userData.usertype === "User" && (
                      <span className="sk-drop-badge">✨ Member</span>
                    )}
                  </div>
                )}
                {getAuthMenu().map((item) => (
                  <button
                    key={item.label}
                    className={`sk-drop-item ${item.isLogout ? "sk-drop-logout" : ""}`}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else if (item.path) {
                        navigate(item.path);
                      }
                      setOpenDropdown(null);
                    }}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

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
        {getAuthMenu().map((item) => (
          <button
            key={item.label}
            className={`sk-mob-link ${item.isLogout ? "sk-mob-logout" : ""}`}
            onClick={() => {
              if (item.action) {
                item.action();
              } else if (item.path) {
                navigate(item.path);
              }
              setMobileOpen(false);
              setOpenDropdown(null);
            }}
          >
            <item.icon size={14} /> {item.label}
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
