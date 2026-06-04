import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import {
  Zap,
  Target,
  Clock,
  TrendingUp,
  BarChart2,
  Keyboard,
  Star,
  Shield,
  Code,
  FileText,
  Heart,
  Flame,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Globe,
  Accessibility,
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  Smartphone,
  Monitor,
  TreePine,
  Trophy,
  Swords,
  Brain,
  Lightbulb,
  ArrowUp,
  RefreshCw,
  Lock,
  Unlock,
  List,
  Cpu,
  Book,
  AlignLeft,
  Hash,
  Type,
  Layers,
  Maximize2,
  X,
  User,
  LogIn,
  CaseSensitive,
  Hand,
  PanelLeftClose,
  PanelLeft,
  Dumbbell,
  CalendarDays,
} from "lucide-react";

import {
  FB,
  DURATIONS,
  CONTENT_MODES,
  LANGS,
  CODE_LANGS,
  ACHIEVEMENTS_DEF,
  SKILL_TREE,
  LS_KEY,
  ALPHABETIC_MODES,
  lsGet,
  lsSet,
  uid,
  shuffle,
  calcWPM,
  calcAccuracy,
  countCorrect,
  generateText,
  apiGet,
  apiPost,
} from "../../components/Fallback";

import { FINGER_KEY_MAP } from "../../components/Fallback";

import HandVisualizer from "../../components/Handvisualizer";

// ── Virtual keyboard layout ────────────────────────────────────────────────
const VKBD = {
  english: [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "⌫"],
    ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "↵"],
    ["⇧", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "⇧"],
    ["Space"],
  ],
};

// ── Sub-components ──────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className={`tc-stat-card tc-c-${color}`}>
    <div className="tc-stat-icon">
      <Icon size={18} />
    </div>
    <div className="tc-stat-body">
      <div className="tc-stat-val">{value}</div>
      <div className="tc-stat-label">{label}</div>
      {sub && <div className="tc-stat-sub">{sub}</div>}
    </div>
  </div>
);

const ProgressRing = ({ value, max = 100, size = 72, stroke = 7, color }) => {
  const r = (size - stroke) / 2,
    circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value, 0) / max, 1);
  return (
    <svg width={size} height={size} className="tc-pring">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        className="tc-pring-bg"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        stroke={color || "var(--tc-accent)"}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text
        x={size / 2}
        y={size / 2 + 5}
        textAnchor="middle"
        className="tc-pring-txt"
      >
        {Math.round(pct * max)}
      </text>
    </svg>
  );
};

const HeatKey = ({ ch, intensity }) => {
  const alpha = Math.min(intensity, 1);
  const bg =
    alpha > 0.6
      ? "#dc2626"
      : alpha > 0.3
        ? "#f97316"
        : alpha > 0
          ? "#f59e0b"
          : "var(--tc-bg3)";
  return (
    <div
      className="tc-hkey"
      style={{ background: bg }}
      title={`${ch}: ${Math.round(alpha * 100)}% err`}
    >
      {ch}
    </div>
  );
};

const KbdHeatmap = ({ errMap }) => {
  const rows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    [" z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
  ];
  return (
    <div className="tc-kbd-hmap">
      {rows.map((r, ri) => (
        <div key={ri} className="tc-hmap-row">
          {r.map((k) => (
            <HeatKey
              key={k}
              ch={k.trim()}
              intensity={(errMap[k.trim()] || 0) / 5}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const DecayCurve = ({ wpmHist }) => {
  if (!wpmHist?.length)
    return <div className="tc-empty-s">Run a longer test to see curve</div>;
  const W = 320,
    H = 100,
    P = 24,
    maxW = Math.max(...wpmHist, 1);
  const pts = wpmHist.map((v, i) => ({
    x: P + (i / (wpmHist.length - 1 || 1)) * (W - P * 2),
    y: H - P - (v / maxW) * (H - P * 2),
  }));
  return (
    <svg
      width={W}
      height={H}
      className="tc-decay-svg"
      viewBox={`0 0 ${W} ${H}`}
    >
      <polyline
        points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke="var(--tc-accent)"
        strokeWidth="2.5"
      />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--tc-accent)" />
      ))}
      <text x={P} y={H - 4} fontSize="9" fill="var(--tc-text3)">
        start
      </text>
      <text
        x={W - P}
        y={H - 4}
        fontSize="9"
        fill="var(--tc-text3)"
        textAnchor="end"
      >
        end
      </text>
    </svg>
  );
};

// Virtual Keyboard overlay
function VirtualKeyboard({ lang, pressedKey, visible, onClose }) {
  const [pos, setPos] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ w: 680, h: 200 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragStart = useRef(null),
    resizeStart = useRef(null);
  const rows = VKBD[lang] || VKBD.english;
  const onMouseDown = (e) => {
    setDragging(true);
    dragStart.current = { mx: e.clientX - pos.x, my: e.clientY - pos.y };
  };
  const onResizeDown = (e) => {
    e.stopPropagation();
    setResizing(true);
    resizeStart.current = {
      mx: e.clientX,
      my: e.clientY,
      w: size.w,
      h: size.h,
    };
  };
  useEffect(() => {
    const mm = (e) => {
      if (dragging && dragStart.current)
        setPos({
          x: e.clientX - dragStart.current.mx,
          y: e.clientY - dragStart.current.my,
        });
      if (resizing && resizeStart.current)
        setSize({
          w: Math.max(
            320,
            resizeStart.current.w + (e.clientX - resizeStart.current.mx),
          ),
          h: Math.max(
            140,
            resizeStart.current.h + (e.clientY - resizeStart.current.my),
          ),
        });
    };
    const mu = () => {
      setDragging(false);
      setResizing(false);
    };
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
    };
  }, [dragging, resizing]);
  if (!visible) return null;
  const scale = size.w / 680;
  return (
    <div
      className="tc-vkbd-wrap"
      style={{ left: pos.x, top: pos.y, width: size.w }}
    >
      <div className="tc-vkbd-header" onMouseDown={onMouseDown}>
        <div className="tc-vkbd-title">
          <Keyboard size={13} /> Virtual Keyboard — {lang}
        </div>
        <button className="tc-vkbd-close" onClick={onClose}>
          <X size={14} />
        </button>
      </div>
      <div
        className="tc-vkbd-keys"
        style={{ fontSize: `${Math.max(0.6, scale) * 0.8}rem` }}
      >
        {rows.map((row, ri) => (
          <div key={ri} className="tc-vkbd-row">
            {row.map((k) => {
              const isSpace = k === "Space";
              const isPressed =
                pressedKey?.toLowerCase() === k.toLowerCase() ||
                (isSpace && pressedKey === " ");
              return (
                <div
                  key={k}
                  className={`tc-vkey${isSpace ? " tc-vkey-space" : ""}${isPressed ? " tc-vkey-active" : ""}${["⌫", "Tab", "Caps", "↵", "⇧"].includes(k) ? " tc-vkey-mod" : ""}`}
                >
                  {isSpace ? "SPACE" : k}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="tc-vkbd-resize" onMouseDown={onResizeDown}>
        <Maximize2 size={12} />
      </div>
    </div>
  );
}

// Accessibility Panel
const A11yPanel = ({ settings, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`tc-a11y-float${open ? " tc-a11y-open" : ""}`}>
      <button
        className="tc-a11y-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Accessibility options"
      >
        <Accessibility size={20} />
      </button>
      {open && (
        <div className="tc-a11y-panel">
          <div className="tc-a11y-title">Accessibility</div>
          {[
            { k: "dyslexia", l: "Dyslexia Font" },
            { k: "highContrast", l: "High Contrast" },
            { k: "screenReader", l: "Screen Reader" },
            { k: "oneHanded", l: "One-Handed" },
          ].map((o) => (
            <label key={o.k} className="tc-a11y-opt">
              <span>{o.l}</span>
              <div
                className={`tc-toggle${settings[o.k] ? " tc-toggle-on" : ""}`}
                onClick={() => onChange(o.k, !settings[o.k])}
                role="switch"
                aria-checked={settings[o.k]}
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && onChange(o.k, !settings[o.k])
                }
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// Guest Modal
const GuestModal = ({ onGuest, onLogin }) => {
  const navigate = useNavigate();
  return (
    <div className="tc-guest-overlay">
      <div className="tc-guest-modal">
        <div className="tc-guest-logo">
          <Zap size={32} />
        </div>
        <h2 className="tc-guest-title">Welcome to SwiftKeys</h2>
        <p className="tc-guest-desc">
          The ultimate typing coach. Track speed, accuracy, and improve with
          AI-powered drills.
        </p>
        <div className="tc-guest-actions">
          <button
            className="tc-guest-btn-primary"
            onClick={() => navigate("/user/auth/login")}
          >
            <LogIn size={16} /> Login / Sign Up
          </button>
          <button className="tc-guest-btn-secondary" onClick={onGuest}>
            <User size={16} /> Continue as Guest
          </button>
        </div>
        <p className="tc-guest-note">
          Guest progress is saved locally. Login to sync across devices.
        </p>
      </div>
    </div>
  );
};

// Sidebar Section (collapsible group)
const SideSection = ({ label, icon: Icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="tc-sb-section">
      <button
        className={`tc-sb-sec-head${open ? " tc-sb-sec-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon size={13} />
        <span>{label}</span>
        <ChevronDown
          size={12}
          className={`tc-sb-chev${open ? " tc-sb-chev-up" : ""}`}
        />
      </button>
      {open && <div className="tc-sb-sec-body">{children}</div>}
    </div>
  );
};

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function TypingCoach() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [showGuestModal, setShowGuestModal] = useState(false);
  useEffect(() => {
    const ex = lsGet(LS_KEY);
    if (!ex) setShowGuestModal(true);
  }, []);
  const handleGuest = () => {
    const g = {
      guestId: uid(),
      name: "Guest",
      xp: 0,
      level: 1,
      points: 0,
      badges: ["Newbie"],
      streak: { current: 0, longest: 0, lastDate: null },
      bestWPM: 0,
      totalTests: 0,
      totalWords: 0,
      totalTime: 0,
      achievements: [],
      weeklyGoal: { target: 7, done: 0 },
      testHistory: [],
      errorPatterns: {},
      createdAt: new Date().toISOString(),
    };
    lsSet(LS_KEY, g);
    setUserData(g);
    setShowGuestModal(false);
  };

  // Page tab
  const [tab, setTab] = useState("test");

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Test config
  const [lang, setLang] = useState("english");
  const [mode, setMode] = useState("words");
  const [codeLang, setCodeLang] = useState("javascript");
  const [duration, setDuration] = useState(60);
  const [deviceMode, setDeviceMode] = useState("keyboard");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [capsMode, setCapsMode] = useState(false);
  const [handVisualizerOn, setHandVisualizerOn] = useState(true);

  // Test state
  const [testWords, setTestWords] = useState("");
  const [userInput, setUserInput] = useState("");
  const [testRunning, setTestRunning] = useState(false);
  const [testDone, setTestDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [startTime, setStartTime] = useState(null);
  const [wpmHist, setWpmHist] = useState([]);
  const [accHist, setAccHist] = useState([]);
  const [errorMap, setErrorMap] = useState({});
  const [fingerErrors, setFingerErrors] = useState({});
  const [pairErrors, setPairErrors] = useState({});
  const [pressedKey, setPressedKey] = useState("");
  const [results, setResults] = useState(null);
  const [drills, setDrills] = useState([]);
  const [drillMode, setDrillMode] = useState(false);
  const [vkbdVisible, setVkbdVisible] = useState(false);
  const [userData, setUserData] = useState(() => lsGet(LS_KEY) || null);
  const [coachingTips, setCoachingTips] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [learningPath, setLearningPath] = useState("personalized");
  const [a11y, setA11y] = useState({
    dyslexia: false,
    highContrast: false,
    screenReader: false,
    oneHanded: false,
  });

  useEffect(() => {
    if (userData) lsSet(LS_KEY, userData);
  }, [userData]);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const wpmTickRef = useRef(null);
  const audioCtx = useRef(null);
  const userInputRef = useRef("");
  const testWordsRef = useRef("");
  const wpmHistRef = useRef([]);
  const startTimeRef = useRef(null);
  const errorMapRef = useRef({});
  const fingerErrorsRef = useRef({});
  const pairErrorsRef = useRef({});
  const endTestCalledRef = useRef(false);

  useEffect(() => {
    userInputRef.current = userInput;
  }, [userInput]);
  useEffect(() => {
    testWordsRef.current = testWords;
  }, [testWords]);
  useEffect(() => {
    wpmHistRef.current = wpmHist;
  }, [wpmHist]);
  useEffect(() => {
    startTimeRef.current = startTime;
  }, [startTime]);
  useEffect(() => {
    errorMapRef.current = errorMap;
  }, [errorMap]);
  useEffect(() => {
    fingerErrorsRef.current = fingerErrors;
  }, [fingerErrors]);
  useEffect(() => {
    pairErrorsRef.current = pairErrors;
  }, [pairErrors]);

  // next char for hand visualizer
  const nextChar = useMemo(() => {
    if (!testRunning || testDone) return null;
    return testWords[userInput.length] || null;
  }, [testRunning, testDone, testWords, userInput]);

  // Show whether caps option is relevant for current mode
  const showCapsOption =
    ALPHABETIC_MODES.includes(mode) &&
    mode !== "numbers" &&
    mode !== "symbols" &&
    mode !== "numbersSymbols";

  // Live stats
  let liveWPM, liveAcc, liveMistakes, liveConsistency;
  if (testDone && results) {
    liveWPM = results.wpm;
    liveAcc = results.accuracy;
    liveMistakes = results.mistakes;
    liveConsistency = results.consistency;
  } else if (testRunning && startTimeRef.current) {
    const el = (Date.now() - startTimeRef.current) / 1000;
    const lc = countCorrect(userInputRef.current, testWordsRef.current);
    liveWPM = calcWPM(lc, el);
    liveAcc = calcAccuracy(lc, userInputRef.current.length);
    liveMistakes = userInputRef.current.length - lc;
    const h = wpmHistRef.current;
    liveConsistency =
      h.length > 1
        ? Math.round(
            100 -
              ((Math.max(...h) - Math.min(...h)) / (Math.max(...h) || 1)) * 100,
          )
        : 100;
  } else {
    liveWPM = 0;
    liveAcc = 0;
    liveMistakes = 0;
    liveConsistency = 100;
  }

  // Timer
  useEffect(() => {
    if (testRunning && !testDone) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (wpmTickRef.current) clearInterval(wpmTickRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            clearInterval(wpmTickRef.current);
            timerRef.current = null;
            wpmTickRef.current = null;
            endTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      wpmTickRef.current = setInterval(() => {
        if (testRunning && !testDone && startTimeRef.current) {
          const el = (Date.now() - startTimeRef.current) / 1000;
          const wpm = calcWPM(
            countCorrect(userInputRef.current, testWordsRef.current),
            el,
          );
          const acc = calcAccuracy(
            countCorrect(userInputRef.current, testWordsRef.current),
            userInputRef.current.length || 1,
          );
          setWpmHist((h) => [...h, wpm]);
          setAccHist((a) => [...a, acc]);
        }
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (wpmTickRef.current) clearInterval(wpmTickRef.current);
    };
  }, [testRunning, testDone]);

  // Helper function to apply mixed-case capitalization
  const applyMixedCase = (text) => {
    // Split into words and apply random/smart capitalization
    const words = text.split(/(\s+)/);
    const processedWords = words.map((word, index) => {
      // Keep spaces as-is
      if (word.trim().length === 0) return word;

      // Capitalize first word of each sentence or random words
      const isStartOfSentence =
        index === 0 || (index > 0 && words[index - 1].trim().endsWith("."));

      if (isStartOfSentence) {
        // Capitalize first letter of sentence
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      } else {
        // Randomly capitalize some words for natural variation (20% chance)
        // Also capitalize proper nouns (simulated by words that are typically names)
        const properNouns = [
          "I",
          "JavaScript",
          "React",
          "Python",
          "Swift",
          "TypeScript",
          "CSS",
          "HTML",
          "Node",
          "Express",
        ];
        const shouldCapitalize =
          properNouns.includes(word) || Math.random() < 0.15;

        if (shouldCapitalize) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        } else {
          return word.toLowerCase();
        }
      }
    });

    return processedWords.join("");
  };

  // Helper function to apply all-caps (for when user wants all caps)
  const applyAllCaps = (text) => {
    return text.toUpperCase();
  };

  const generateTest = useCallback(async () => {
    let text = "";
    try {
      if (mode === "code") {
        const data = await apiGet(`/texts/code/${codeLang}`, null);
        text =
          data?.[0]?.content || generateText(lang, "code", codeLang, 80, false);
      } else {
        const data = await apiGet(`/texts?lang=${lang}&mode=${mode}`, null);
        if (data?.length) {
          text = data[Math.floor(Math.random() * data.length)].content;
        } else {
          text = generateText(lang, mode, codeLang, 80, false);
        }
      }

      // Apply capitalization based on capsMode
      if (showCapsOption && capsMode && mode !== "code") {
        // Use mixed case for realistic typing practice
        text = applyMixedCase(text);
      }

      setTestWords(text);
      setUserInput("");
      setTestDone(false);
      setResults(null);
      setWpmHist([]);
      setAccHist([]);
      setErrorMap({});
      setFingerErrors({});
      setPairErrors({});
      setTimeLeft(duration);
      setTestRunning(false);
      setDrillMode(false);
      endTestCalledRef.current = false;

      // Focus the input after state updates
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (error) {
      console.error("Error generating test:", error);
      // Fallback to a simple text
      text = generateText(lang, mode, codeLang, 80, false);
      if (showCapsOption && capsMode && mode !== "code") {
        text = applyMixedCase(text);
      }
      setTestWords(text);
      setUserInput("");
      setTestDone(false);
      setResults(null);
      setWpmHist([]);
      setAccHist([]);
      setErrorMap({});
      setFingerErrors({});
      setPairErrors({});
      setTimeLeft(duration);
      setTestRunning(false);
      setDrillMode(false);
      endTestCalledRef.current = false;
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [lang, mode, codeLang, duration, capsMode, showCapsOption]); // Dependencies are correct

  useEffect(() => {
    generateTest();
  }, [lang, mode, codeLang, duration, generateTest]);

  function playClick() {
    if (!soundEnabled) return;
    try {
      if (!audioCtx.current)
        audioCtx.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      const o = audioCtx.current.createOscillator(),
        g = audioCtx.current.createGain();
      o.connect(g);
      g.connect(audioCtx.current.destination);
      o.frequency.value = 900;
      g.gain.value = 0.04;
      o.start();
      o.stop(audioCtx.current.currentTime + 0.025);
    } catch {}
  }

  function handleInput(e) {
    const val = e.target.value;
    if (testDone) return;
    if (!testRunning && !testDone) {
      setTestRunning(true);
      setStartTime(Date.now());
      endTestCalledRef.current = false;
    }
    setUserInput(val);
    const lastChar = val[val.length - 1],
      expected = testWords[val.length - 1];
    if (lastChar !== undefined) {
      setPressedKey(lastChar);
      playClick();
      if (lastChar !== expected && expected) {
        setErrorMap((m) => ({ ...m, [expected]: (m[expected] || 0) + 1 }));
        setFingerErrors((f) => {
          // Use the imported FINGER_KEY_MAP
          let finger = "other";
          const ek = (expected || "").toLowerCase();
          for (const [fn, keys] of Object.entries(FINGER_KEY_MAP))
            if (keys.includes(ek)) {
              finger = fn;
              break;
            }
          return { ...f, [finger]: (f[finger] || 0) + 1 };
        });
        if (val.length >= 2) {
          const pair = testWords.slice(val.length - 2, val.length);
          setPairErrors((p) => ({ ...p, [pair]: (p[pair] || 0) + 1 }));
        }
      }
    }
    userInputRef.current = val;
    if (
      val.length >= testWords.length &&
      !testDone &&
      !endTestCalledRef.current
    )
      endTest();
  }

  function handleKeyDown(e) {
    setPressedKey(e.key === " " ? " " : e.key);
  }

  function endTest() {
    if (endTestCalledRef.current) return;
    endTestCalledRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (wpmTickRef.current) clearInterval(wpmTickRef.current);
    timerRef.current = null;
    wpmTickRef.current = null;
    const fi = userInputRef.current,
      ft = testWordsRef.current,
      fs = startTimeRef.current;
    const fh = [...wpmHistRef.current],
      fem = errorMapRef.current,
      ffe = fingerErrorsRef.current,
      fpe = pairErrorsRef.current;
    const el = fs ? (Date.now() - fs) / 1000 : duration;
    const correct = countCorrect(fi, ft),
      wpm = calcWPM(correct, el),
      rawWpm = calcWPM(fi.length, el);
    const acc = calcAccuracy(correct, fi.length || 1);
    const cons =
      fh.length > 1
        ? Math.round(
            100 -
              ((Math.max(...fh) - Math.min(...fh)) / (Math.max(...fh) || 1)) *
                100,
          )
        : 100;
    const fatigue =
      fh.length > 2
        ? Math.max(
            0,
            Math.round(100 - (fh[fh.length - 1] / (fh[0] || 1)) * 100),
          )
        : 0;
    const focus = Math.round((acc / 100) * cons);
    const topFinger = Object.entries(ffe).sort((a, b) => b[1] - a[1])[0];
    const topPair = Object.entries(fpe).sort((a, b) => b[1] - a[1])[0];
    const res = {
      wpm: Math.max(0, wpm),
      rawWpm: Math.max(0, rawWpm),
      accuracy: Math.max(0, Math.min(100, acc)),
      consistency: Math.max(0, Math.min(100, cons)),
      mistakes: fi.length - correct,
      elapsed: Math.round(el),
      fatigue: Math.max(0, Math.min(100, fatigue)),
      focus: Math.max(0, Math.min(100, focus)),
      topFinger: topFinger
        ? `${topFinger[0].replace(/_/g, " ")} (${topFinger[1]} err)`
        : null,
      topPair: topPair ? topPair[0] : null,
      topFingerRaw: topFinger ? topFinger[0] : null,
      wordsTyped: Math.round(correct / 5),
      charsTyped: correct,
    };
    setTestDone(true);
    setTestRunning(false);
    setResults(res);
    setStartTime(null);
    const errKeys = Object.entries(fem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k);
    const pool = FB[lang]?.words || FB.english.words;
    const drillWords = [
      ...new Set([
        ...errKeys.flatMap((k) =>
          pool.filter((w) => w.includes(k)).slice(0, 4),
        ),
        ...shuffle(pool).slice(0, 10),
      ]),
    ].slice(0, 24);
    setDrills(drillWords);
    updateUser(res);
    apiPost("/tests", {
      mode,
      language: lang,
      duration,
      wpm,
      rawWpm,
      accuracy: acc,
      consistency: cons,
      mistakes: res.mistakes,
      wordsTyped: res.wordsTyped,
      charactersTyped: correct,
      completed: true,
      deviceType: deviceMode,
    });
  }

  function updateUser(res) {
    setUserData((prev) => {
      if (!prev) return prev;
      const newXP = prev.xp + Math.round((res.wpm * res.accuracy) / 100);
      const newLevel = Math.floor(newXP / 1000) + 1;
      const newBest = Math.max(prev.bestWPM, res.wpm);
      const today = new Date().toDateString(),
        last = prev.streak?.lastDate;
      let streak = { ...prev.streak };
      if (last !== today) {
        const diff = last
          ? Math.round((new Date(today) - new Date(last)) / 864e5)
          : 2;
        streak.current = diff === 1 ? streak.current + 1 : 1;
        streak.longest = Math.max(streak.longest, streak.current);
        streak.lastDate = today;
      }
      const achs = [...(prev.achievements || [])];
      ACHIEVEMENTS_DEF.forEach((a) => {
        if (achs.includes(a.id)) return;
        if (a.id === "first_test" && prev.totalTests === 0) achs.push(a.id);
        if (a.id === "wpm_50" && res.wpm >= 50) achs.push(a.id);
        if (a.id === "wpm_80" && res.wpm >= 80) achs.push(a.id);
        if (a.id === "wpm_100" && res.wpm >= 100) achs.push(a.id);
        if (a.id === "accuracy_95" && res.accuracy >= 95) achs.push(a.id);
        if (a.id === "streak_7" && streak.current >= 7) achs.push(a.id);
        if (a.id === "tests_10" && prev.totalTests + 1 >= 10) achs.push(a.id);
      });
      const snap = {
        date: new Date().toISOString(),
        wpm: res.wpm,
        accuracy: res.accuracy,
        duration: res.elapsed,
        mode,
        lang,
      };
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        bestWPM: newBest,
        totalTests: prev.totalTests + 1,
        totalWords: prev.totalWords + res.wordsTyped,
        totalTime: prev.totalTime + res.elapsed,
        streak,
        achievements: achs,
        testHistory: [snap, ...(prev.testHistory || [])].slice(0, 100),
        weeklyGoal: {
          ...prev.weeklyGoal,
          done: Math.min(
            (prev.weeklyGoal?.done || 0) + 1,
            prev.weeklyGoal?.target || 7,
          ),
        },
      };
    });
  }

  function resetTest() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (wpmTickRef.current) clearInterval(wpmTickRef.current);
    timerRef.current = null;
    wpmTickRef.current = null;
    setTestRunning(false);
    setTestDone(false);
    setResults(null);
    setUserInput("");
    setWpmHist([]);
    setAccHist([]);
    setErrorMap({});
    setFingerErrors({});
    setPairErrors({});
    setDrillMode(false);
    setTimeLeft(duration);
    endTestCalledRef.current = false;
    generateTest();
  }

  function startDrill() {
    const text = drills.join(" ");
    setTestWords(text);
    setUserInput("");
    setTestDone(false);
    setResults(null);
    setWpmHist([]);
    setErrorMap({});
    setFingerErrors({});
    setPairErrors({});
    setTimeLeft(duration);
    setTestRunning(false);
    setDrillMode(true);
    setTab("test");
    endTestCalledRef.current = false;
    setTimeout(() => inputRef.current?.focus(), 60);
  }

  function goToDrills() {
    const state = {};
    if (results?.topPair) state.weakPair = results.topPair;
    if (results?.topFingerRaw) state.weakFinger = results.topFingerRaw;
    navigate("/drills", { state });
  }

  useEffect(() => {
    (async () => {
      const tips = await apiGet("/coaching/me", [
        {
          title: "Focus on 'th' combos",
          description:
            "42% of your errors come from right-hand ring finger combos.",
          priority: 1,
          generatedByAI: true,
          status: "active",
        },
        {
          title: "Build endurance",
          description:
            "Your WPM drops after 2 min. Use the 5-min test more often.",
          priority: 2,
          generatedByAI: true,
          status: "active",
        },
        {
          title: "Common words drill",
          description: "Practice top-100 words daily for 10 minutes.",
          priority: 3,
          generatedByAI: false,
          status: "pending",
        },
      ]);
      setCoachingTips(tips || []);
      const lb = await apiGet(
        "/leaderboard/global",
        Array.from({ length: 10 }, (_, i) => ({
          rank: i + 1,
          name: [
            "TypeMaster",
            "KeyWizard",
            "SwiftFinger",
            "CodeTyper",
            "QuickKeys",
            "SpeedDemon",
            "AccuPro",
            "EliteKeys",
            "RapidFire",
            "FastHands",
          ][i],
          wpm: 145 - i * 8,
          accuracy: 98 - i,
        })),
      );
      setLeaderboard(lb || []);
      const pred = await apiGet("/predictions/me", {
        predictedWPM: Math.round(((lsGet(LS_KEY) || {}).bestWPM || 40) * 1.25),
        predictedAccuracy: 95,
        targetDate: new Date(Date.now() + 30 * 864e5).toISOString(),
        confidenceScore: 78,
      });
      setPredictions(pred);
    })();
  }, []);

  const a11yCls = [
    a11y.dyslexia ? "tc-dyslexia" : "",
    a11y.highContrast ? "tc-hc" : "",
    a11y.oneHanded ? "tc-onehanded" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const timerPct = (timeLeft / duration) * 100;
  const timerColor =
    timerPct > 50 ? "#10b981" : timerPct > 20 ? "#f59e0b" : "#ef4444";
  const plateauDetected = useMemo(() => {
    const h = (userData?.testHistory || []).slice(0, 5).map((x) => x.wpm);
    if (h.length < 4) return false;
    const avg = h.reduce((a, b) => a + b, 0) / h.length;
    return Math.max(...h) - Math.min(...h) < avg * 0.05;
  }, [userData]);

  const renderedText = useMemo(() => {
    const chars = (testWords || "").split("").slice(0, 400);
    return chars.map((ch, i) => {
      let cls = "tc-ch-pend";
      if (i < userInput.length)
        cls = userInput[i] === ch ? "tc-ch-ok" : "tc-ch-err";
      const isCursor = i === userInput.length;
      return (
        <span key={i} className={`${cls}${isCursor ? " tc-ch-cur" : ""}`}>
          {ch === "\n" ? "↵\n" : ch}
        </span>
      );
    });
  }, [testWords, userInput]);

  const MODE_GROUPS = [
    {
      label: "Text Modes",
      icon: AlignLeft,
      modes: CONTENT_MODES.filter((m) => m.group === "text"),
    },
    {
      label: "Professional",
      icon: Shield,
      modes: CONTENT_MODES.filter((m) => m.group === "professional"),
    },
    {
      label: "Special Chars",
      icon: Hash,
      modes: CONTENT_MODES.filter((m) => m.group === "special"),
    },
    {
      label: "Code Typing",
      icon: Cpu,
      modes: CONTENT_MODES.filter((m) => m.group === "code"),
    },
  ];

  const sidebarBlurred = testRunning && !testDone && handVisualizerOn;

  console.log("HandVisualizer conditions:", {
    handVisualizerOn,
    testRunning,
    testDone,
    nextChar,
  });

  return (
    <div className={`tc-root ${isDarkMode ? "dark" : "light"} ${a11yCls}`}>
      {showGuestModal && (
        <GuestModal
          onGuest={handleGuest}
          onLogin={() => navigate("/user/auth/login")}
        />
      )}

      {/* ── PAGE NAV BAR ── */}
      <div className="tc-pagebar">
        <div className="tc-pagebar-inner">
          {/* Sidebar toggle */}
          <button
            className="tc-pb-icon"
            onClick={() => setSidebarCollapsed((s) => !s)}
            title="Toggle Sidebar"
            style={{ marginRight: "0.3rem" }}
          >
            {sidebarCollapsed ? (
              <PanelLeft size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </button>
          {[
            { id: "test", label: "Test", icon: Keyboard },
            { id: "analytics", label: "Stats", icon: BarChart2 },
            { id: "coach", label: "Coach", icon: Brain },
            { id: "achievements", label: "Awards", icon: Trophy },
            { id: "leaderboard", label: "Ranks", icon: Swords },
          ].map((t) => (
            <button
              key={t.id}
              className={`tc-pb-btn${tab === t.id ? " tc-pb-active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <t.icon size={15} />
              <span>{t.label}</span>
            </button>
          ))}
          {/* Navigate to Drills & Daily Challenge */}
          <button className="tc-pb-btn" onClick={() => navigate("/drills")}>
            <Dumbbell size={15} />
            <span>Drills</span>
          </button>
          <button
            className="tc-pb-btn"
            onClick={() => navigate("/daily-challenge")}
          >
            <CalendarDays size={15} />
            <span>Daily</span>
          </button>
          <div className="tc-pb-right">
            <button
              className="tc-pb-icon"
              onClick={() => setSoundEnabled((s) => !s)}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button className="tc-pb-icon" onClick={toggleTheme}>
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {userData && (
              <div className="tc-pb-chip">
                <Flame size={13} className="tc-pb-flame" />
                {userData.streak?.current || 0}d{" "}
                <Star size={13} className="tc-pb-star" /> Lv{userData.level}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BODY: SIDEBAR + MAIN ── */}
      <div className="tc-body-layout">
        {!sidebarCollapsed && (
          <button
            className="tc-sidebar-toggle-main"
            onClick={() => setSidebarCollapsed(true)}
            title="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {sidebarCollapsed && (
          <button
            className="tc-sidebar-toggle-float tc-sidebar-toggle-expand"
            onClick={() => setSidebarCollapsed(false)}
            title="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* ── SIDEBAR ── */}
        <aside
          className={`tc-sidebar ${sidebarCollapsed ? "tc-sb-collapsed" : ""} ${sidebarBlurred ? "tc-sidebar-blurred" : ""}`}
        >
          {!sidebarCollapsed && (
            <div className="tc-sb-inner">
              <SideSection label="Language" icon={Globe}>
                <div className="tc-sb-pills">
                  {LANGS.map((l) => (
                    <button
                      key={l.id}
                      className={`tc-sb-pill${lang === l.id ? " tc-sb-pill-on" : ""}`}
                      onClick={() => {
                        setLang(l.id);
                        resetTest();
                      }}
                    >
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              </SideSection>

              <SideSection label="Duration" icon={Clock}>
                <div className="tc-sb-pills">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      className={`tc-sb-pill${duration === d.value ? " tc-sb-pill-on" : ""}`}
                      onClick={() => {
                        setDuration(d.value);
                        setTimeLeft(d.value);
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </SideSection>

              <SideSection label="Content Mode" icon={Layers}>
                {MODE_GROUPS.map((g) => (
                  <div key={g.label} className="tc-sb-mode-group">
                    <div className="tc-sb-mg-label">
                      <g.icon size={11} />
                      {g.label}
                    </div>
                    <div className="tc-sb-pills">
                      {g.modes.map((m) => (
                        <button
                          key={m.id}
                          className={`tc-sb-pill${mode === m.id ? " tc-sb-pill-on" : ""}`}
                          onClick={() => {
                            setMode(m.id);
                            resetTest();
                          }}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                    {mode === "code" && g.label === "Code Typing" && (
                      <div
                        className="tc-sb-pills"
                        style={{ marginTop: "0.3rem" }}
                      >
                        {CODE_LANGS.map((cl) => (
                          <button
                            key={cl}
                            className={`tc-sb-pill tc-sb-pill-xs${codeLang === cl ? " tc-sb-pill-on" : ""}`}
                            onClick={() => {
                              setCodeLang(cl);
                              resetTest();
                            }}
                          >
                            {cl}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </SideSection>

              <SideSection label="Options" icon={Monitor} defaultOpen={true}>
                <div className="tc-sb-opts-list">
                  {/* Caps Lock toggle — only for alphabetic modes */}
                  {showCapsOption && (
                    <div className="tc-sb-opt-row">
                      <div className="tc-sb-opt-label">
                        <CaseSensitive size={13} />
                        <span>Capital Letters</span>
                      </div>
                      <div
                        className={`tc-toggle${capsMode ? " tc-toggle-on" : ""}`}
                        onClick={() => {
                          setCapsMode((c) => !c);
                          resetTest();
                        }}
                        role="switch"
                        aria-checked={capsMode}
                        tabIndex={0}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setCapsMode((c) => !c)
                        }
                      />
                    </div>
                  )}
                  {/* Hand Visualizer toggle */}
                  <div className="tc-sb-opt-row">
                    <div className="tc-sb-opt-label">
                      <Hand size={13} />
                      <span>Hand Guide</span>
                    </div>
                    <div
                      className={`tc-toggle${handVisualizerOn ? " tc-toggle-on" : ""}`}
                      onClick={() => setHandVisualizerOn((h) => !h)}
                      role="switch"
                      aria-checked={handVisualizerOn}
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setHandVisualizerOn((h) => !h)
                      }
                    />
                  </div>
                  {/* Virtual Keyboard */}
                  <div className="tc-sb-opt-row">
                    <div className="tc-sb-opt-label">
                      <Keyboard size={13} />
                      <span>Virtual KBD</span>
                    </div>
                    <div
                      className={`tc-toggle${vkbdVisible ? " tc-toggle-on" : ""}`}
                      onClick={() => setVkbdVisible((v) => !v)}
                      role="switch"
                      aria-checked={vkbdVisible}
                      tabIndex={0}
                    />
                  </div>
                  {/* Device */}
                  <div className="tc-sb-opt-row">
                    <div className="tc-sb-opt-label">
                      <Monitor size={13} />
                      <span>Device</span>
                    </div>
                    <div
                      className="tc-sb-pills"
                      style={{ flexDirection: "row", gap: 4 }}
                    >
                      <button
                        className={`tc-sb-pill-xs tc-sb-pill${deviceMode === "keyboard" ? " tc-sb-pill-on" : ""}`}
                        onClick={() => setDeviceMode("keyboard")}
                      >
                        <Monitor size={10} />
                      </button>
                      <button
                        className={`tc-sb-pill-xs tc-sb-pill${deviceMode === "mobile" ? " tc-sb-pill-on" : ""}`}
                        onClick={() => setDeviceMode("mobile")}
                      >
                        <Smartphone size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              </SideSection>

              {/* Quick nav */}
              <div className="tc-sb-quicknav">
                <button
                  className="tc-sb-navbtn"
                  onClick={() => navigate("/drills")}
                >
                  <Dumbbell size={13} /> Drill Room
                </button>
                <button
                  className="tc-sb-navbtn"
                  onClick={() => navigate("/daily-challenge")}
                >
                  <CalendarDays size={13} /> Daily Challenge
                </button>
              </div>
            </div>
          )}

          {sidebarCollapsed && (
            <div className="tc-sb-mini">
              <button className="tc-sb-mini-icon" title="Language">
                <Globe size={15} />
              </button>
              <button className="tc-sb-mini-icon" title="Duration">
                <Clock size={15} />
              </button>
              <button className="tc-sb-mini-icon" title="Mode">
                <Layers size={15} />
              </button>
              <button className="tc-sb-mini-icon" title="Options">
                <Monitor size={15} />
              </button>
              <div className="tc-sb-mini-sep" />
              <button
                className="tc-sb-mini-icon"
                title="Drills"
                onClick={() => navigate("/drills")}
              >
                <Dumbbell size={15} />
              </button>
              <button
                className="tc-sb-mini-icon"
                title="Daily"
                onClick={() => navigate("/daily-challenge")}
              >
                <CalendarDays size={15} />
              </button>
            </div>
          )}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="tc-main">
          {/* ══ TEST TAB ══ */}
          {tab === "test" && (
            <div className="tc-test-panel">
              {/* Live stats bar */}
              <div className="tc-live-bar">
                <div className="tc-live-stat">
                  <Zap size={15} />
                  <span className="tc-live-val">{liveWPM}</span>
                  <span className="tc-live-lbl">WPM</span>
                </div>
                <div className="tc-live-stat">
                  <Target size={15} />
                  <span className="tc-live-val">{liveAcc}%</span>
                  <span className="tc-live-lbl">Accuracy</span>
                </div>
                <div className="tc-timer-wrap">
                  <ProgressRing
                    value={timeLeft}
                    max={duration}
                    size={68}
                    stroke={6}
                    color={timerColor}
                  />
                </div>
                <div className="tc-live-stat">
                  <Activity size={15} />
                  <span className="tc-live-val">{liveConsistency}%</span>
                  <span className="tc-live-lbl">Consistency</span>
                </div>
                <div className="tc-live-stat">
                  <AlertCircle size={15} />
                  <span className="tc-live-val">{liveMistakes}</span>
                  <span className="tc-live-lbl">Mistakes</span>
                </div>
                {/* Active mode badges */}
                <div className="tc-live-badges">
                  {capsMode && showCapsOption && (
                    <span className="tc-live-badge">
                      <CaseSensitive size={11} /> CAPS
                    </span>
                  )}
                  {handVisualizerOn && (
                    <span
                      className="tc-live-badge"
                      style={{
                        borderColor: "var(--tc-accent2)",
                        color: "var(--tc-accent2)",
                      }}
                    >
                      <Hand size={11} /> GUIDE
                    </span>
                  )}
                  {drillMode && (
                    <span
                      className="tc-live-badge"
                      style={{
                        borderColor: "var(--tc-yellow)",
                        color: "var(--tc-yellow)",
                      }}
                    >
                      🎯 DRILL
                    </span>
                  )}
                </div>
              </div>

              {/* Typing area */}
              <div
                className={`tc-type-area${mode === "code" ? " tc-code-area" : ""}`}
              >
                <div
                  className="tc-text-disp"
                  aria-live={a11y.screenReader ? "polite" : "off"}
                >
                  {renderedText}
                </div>
                <textarea
                  ref={inputRef}
                  className="tc-input"
                  value={userInput}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Start typing to begin the test…"
                  disabled={testDone}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  rows={mode === "code" ? 8 : 3}
                />
              </div>

              {/* Actions */}
              <div className="tc-action-row">
                <button className="tc-btn tc-btn-sec" onClick={resetTest}>
                  <RefreshCw size={15} /> New Test
                </button>
                {testDone && drills.length > 0 && (
                  <button className="tc-btn tc-btn-acc" onClick={startDrill}>
                    <Brain size={15} /> Drill ({drills.length})
                  </button>
                )}
                {testDone && (results?.topPair || results?.topFingerRaw) && (
                  <button
                    className="tc-btn tc-btn-drill-nav"
                    onClick={goToDrills}
                  >
                    <Dumbbell size={15} /> Go to Drill Room
                  </button>
                )}
              </div>

              {/* Results */}
              {testDone && results && (
                <div className="tc-results">
                  <div className="tc-res-title">
                    <CheckCircle size={18} /> Test Complete
                  </div>
                  <div className="tc-stat-grid">
                    <StatCard
                      icon={Zap}
                      label="WPM"
                      value={results.wpm}
                      sub={`Raw ${results.rawWpm}`}
                      color="blue"
                    />
                    <StatCard
                      icon={Target}
                      label="Accuracy"
                      value={`${results.accuracy}%`}
                      color="green"
                    />
                    <StatCard
                      icon={Activity}
                      label="Consistency"
                      value={`${results.consistency}%`}
                      color="purple"
                    />
                    <StatCard
                      icon={AlertCircle}
                      label="Mistakes"
                      value={results.mistakes}
                      color="red"
                    />
                    <StatCard
                      icon={Clock}
                      label="Time"
                      value={`${results.elapsed}s`}
                      color="yellow"
                    />
                    <StatCard
                      icon={BarChart2}
                      label="Fatigue"
                      value={`${results.fatigue}%`}
                      color="orange"
                    />
                    <StatCard
                      icon={Brain}
                      label="Focus"
                      value={`${results.focus}%`}
                      color="teal"
                    />
                    <StatCard
                      icon={AlignLeft}
                      label="Words"
                      value={results.wordsTyped}
                      color="indigo"
                    />
                  </div>

                  {/* Weakness insights with drill CTA */}
                  {(results.topPair || results.topFinger) && (
                    <div className="tc-weakness-box">
                      <div className="tc-wb-title">
                        <AlertCircle size={14} /> Weak Points Detected
                      </div>
                      {results.topPair && (
                        <div className="tc-insight">
                          <Info size={14} />
                          Weakest pair: <strong>"{results.topPair}"</strong> —
                          drill recommended
                        </div>
                      )}
                      {results.topFinger && (
                        <div className="tc-insight tc-insight-w">
                          <AlertCircle size={14} />
                          Most errors: <strong>{results.topFinger}</strong>
                        </div>
                      )}
                      <button
                        className="tc-btn tc-btn-drill-nav"
                        style={{ marginTop: "0.5rem" }}
                        onClick={goToDrills}
                      >
                        <Dumbbell size={14} /> Open Drill Room with these
                        targets
                      </button>
                    </div>
                  )}

                  <div className="tc-charts-row">
                    <div className="tc-chart-card">
                      <div className="tc-chart-ttl">
                        <TrendingUp size={13} /> Speed Decay
                      </div>
                      <DecayCurve wpmHist={wpmHist} />
                    </div>
                    <div className="tc-chart-card">
                      <div className="tc-chart-ttl">
                        <Keyboard size={13} /> Error Heatmap
                      </div>
                      <KbdHeatmap errMap={errorMap} />
                    </div>
                  </div>

                  {Object.keys(fingerErrors).length > 0 && (
                    <div className="tc-finger-sec">
                      <div className="tc-chart-ttl">
                        <Activity size={13} /> Finger Error Analysis
                      </div>
                      {Object.entries(fingerErrors)
                        .sort((a, b) => b[1] - a[1])
                        .map(([f, c]) => (
                          <div key={f} className="tc-fbar">
                            <span className="tc-fname">
                              {f.replace(/_/g, " ")}
                            </span>
                            <div className="tc-ftrack">
                              <div
                                className="tc-ffill"
                                style={{ width: `${Math.min(c * 8, 100)}%` }}
                              />
                            </div>
                            <span className="tc-fcnt">{c}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="tc-mile-row">
                    <div className="tc-mile">
                      <TrendingUp size={13} /> In 30 days:{" "}
                      <strong>
                        {predictions?.predictedWPM ||
                          Math.round(results.wpm * 1.15)}{" "}
                        WPM
                      </strong>
                    </div>
                    {plateauDetected && (
                      <div className="tc-mile tc-mile-warn">
                        <AlertCircle size={13} /> Plateau detected — switch
                        mode!
                      </div>
                    )}
                    {(userData?.testHistory?.length || 0) > 1 && (
                      <div className="tc-mile">
                        <ArrowUp size={13} />+
                        {(userData.testHistory[0]?.wpm || 0) -
                          (userData.testHistory[userData.testHistory.length - 1]
                            ?.wpm || 0)}{" "}
                        WPM overall
                      </div>
                    )}
                  </div>
                  <div className="tc-xp-row">
                    <Zap size={15} />+
                    {Math.round((results.wpm * results.accuracy) / 100)} XP •
                    Level {userData?.level || 1}
                    <div className="tc-xpbar">
                      <div
                        className="tc-xpfill"
                        style={{
                          width: `${((userData?.xp || 0) % 1000) / 10}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ ANALYTICS TAB ══ */}
          {tab === "analytics" && (
            <div className="tc-analytics-panel">
              <div className="tc-panel-ttl">
                <BarChart2 size={19} /> Analytics Dashboard
              </div>
              <div className="tc-stat-grid">
                <StatCard
                  icon={Zap}
                  label="Best WPM"
                  value={userData?.bestWPM || 0}
                  sub="All time"
                  color="blue"
                />
                <StatCard
                  icon={Target}
                  label="Tests Done"
                  value={userData?.totalTests || 0}
                  color="green"
                />
                <StatCard
                  icon={AlignLeft}
                  label="Words Typed"
                  value={(userData?.totalWords || 0).toLocaleString()}
                  color="purple"
                />
                <StatCard
                  icon={Clock}
                  label="Practice"
                  value={`${Math.round((userData?.totalTime || 0) / 60)}m`}
                  color="yellow"
                />
                <StatCard
                  icon={Flame}
                  label="Streak"
                  value={`${userData?.streak?.current || 0}d`}
                  sub={`Best:${userData?.streak?.longest || 0}d`}
                  color="orange"
                />
                <StatCard
                  icon={Star}
                  label="Level"
                  value={userData?.level || 1}
                  sub={`${userData?.xp || 0} XP`}
                  color="indigo"
                />
              </div>
              <div className="tc-chart-card" style={{ marginBottom: "1rem" }}>
                <div className="tc-chart-ttl">
                  <TrendingUp size={13} /> Progress — Last 20 Tests
                </div>
                <DecayCurve
                  wpmHist={(userData?.testHistory || [])
                    .slice(0, 20)
                    .reverse()
                    .map((h) => h.wpm)}
                />
              </div>
              <div className="tc-arow">
                <div className="tc-chart-card">
                  <div className="tc-chart-ttl">
                    <Activity size={13} /> Last Test Metrics
                  </div>
                  {results ? (
                    <div className="tc-rings-row">
                      <div className="tc-ring-w">
                        <ProgressRing
                          value={results.fatigue}
                          max={100}
                          color="#ef4444"
                        />
                        <div className="tc-ring-l">Fatigue</div>
                      </div>
                      <div className="tc-ring-w">
                        <ProgressRing
                          value={results.focus}
                          max={100}
                          color="#10b981"
                        />
                        <div className="tc-ring-l">Focus</div>
                      </div>
                      <div className="tc-ring-w">
                        <ProgressRing
                          value={results.consistency}
                          max={100}
                          color="#6366f1"
                        />
                        <div className="tc-ring-l">Consistency</div>
                      </div>
                    </div>
                  ) : (
                    <div className="tc-empty-s">Run a test first</div>
                  )}
                </div>
                <div className="tc-chart-card">
                  <div className="tc-chart-ttl">
                    <Keyboard size={13} /> Error Heatmap
                  </div>
                  <KbdHeatmap errMap={errorMap} />
                </div>
              </div>
              <div className="tc-skill-sec">
                <div className="tc-chart-ttl">
                  <TreePine size={13} /> Skill Tree
                </div>
                <div className="tc-skill-tree">
                  {SKILL_TREE.map((s) => {
                    const ok = (userData?.xp || 0) >= s.xpReq;
                    return (
                      <div
                        key={s.id}
                        className={`tc-snode${ok ? " tc-snode-on" : " tc-snode-off"}`}
                      >
                        {ok ? <Unlock size={14} /> : <Lock size={14} />}
                        <span>{s.name}</span>
                        <span className="tc-sxp">{s.xpReq}xp</span>
                        {!ok && (
                          <div className="tc-spbar">
                            <div
                              style={{
                                width: `${Math.min(((userData?.xp || 0) / s.xpReq) * 100, 100)}%`,
                              }}
                              className="tc-spfill"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="tc-goal-sec">
                <div className="tc-chart-ttl">
                  <Target size={13} /> Weekly Goal
                </div>
                <div className="tc-goal-info">
                  <span>
                    {userData?.weeklyGoal?.done || 0}/
                    {userData?.weeklyGoal?.target || 7} sessions
                  </span>
                  <span>
                    {Math.round(
                      ((userData?.weeklyGoal?.done || 0) /
                        (userData?.weeklyGoal?.target || 7)) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <div className="tc-gtrack">
                  <div
                    className="tc-gfill"
                    style={{
                      width: `${Math.min(((userData?.weeklyGoal?.done || 0) / (userData?.weeklyGoal?.target || 7)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="tc-chart-ttl">
                  <List size={13} /> Recent Tests
                </div>
                <div className="tc-hist-table">
                  <div className="tc-hist-head">
                    <span>Date</span>
                    <span>WPM</span>
                    <span>Accuracy</span>
                    <span>Mode</span>
                  </div>
                  {(userData?.testHistory || []).slice(0, 10).map((h, i) => (
                    <div key={i} className="tc-hist-row">
                      <span>{new Date(h.date).toLocaleDateString()}</span>
                      <span className="tc-hwpm">{h.wpm}</span>
                      <span>{h.accuracy}%</span>
                      <span>{h.mode}</span>
                    </div>
                  ))}
                  {!userData?.testHistory?.length && (
                    <div className="tc-empty-s">No tests yet</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ COACH TAB ══ */}
          {tab === "coach" && (
            <div className="tc-coach-panel">
              <div className="tc-panel-ttl">
                <Brain size={19} /> AI Typing Coach
              </div>
              <div className="tc-path-toggle">
                <button
                  className={`tc-path-btn${learningPath === "personalized" ? " tc-path-on" : ""}`}
                  onClick={() => setLearningPath("personalized")}
                >
                  <Brain size={15} /> Personalized Path
                </button>
                <button
                  className={`tc-path-btn${learningPath === "beginner" ? " tc-path-on" : ""}`}
                  onClick={() => setLearningPath("beginner")}
                >
                  <TrendingUp size={15} /> Beginner→Advanced
                </button>
              </div>
              {learningPath === "personalized" ? (
                <div className="tc-path-steps">
                  <div className="tc-pstep tc-pstep-done">
                    <CheckCircle size={14} /> Weak key identification complete
                  </div>
                  <div className="tc-pstep">
                    <ChevronDown size={14} /> Drill:{" "}
                    {Object.keys(errorMap).slice(0, 3).join(", ") ||
                      "your weakest keys"}
                  </div>
                  <div className="tc-pstep">
                    <ChevronDown size={14} /> Speed burst: 1-min test targeting
                    +10% WPM
                  </div>
                  <div className="tc-pstep">
                    <ChevronDown size={14} /> Endurance: 5-min consistency test
                  </div>
                </div>
              ) : (
                <div className="tc-path-steps">
                  {[
                    "Beginner: Home row mastery",
                    "Intermediate: All rows & common words",
                    "Advanced: Speed tests & accuracy drills",
                    "Expert: Code & special chars",
                    "Master: 100+ WPM consistency",
                  ].map((s, i) => (
                    <div
                      key={i}
                      className={`tc-pstep${i < (userData?.level || 1) ? " tc-pstep-done" : ""}`}
                    >
                      {i < (userData?.level || 1) ? (
                        <CheckCircle size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                      {s}
                    </div>
                  ))}
                </div>
              )}
              <div className="tc-chart-ttl" style={{ marginTop: "1.5rem" }}>
                <Lightbulb size={13} /> Coaching Tips
              </div>
              {coachingTips.map((t, i) => (
                <div key={i} className={`tc-tip-card tc-tip-p${t.priority}`}>
                  <div className="tc-tip-head">
                    {t.generatedByAI && <span className="tc-ai-tag">AI</span>}
                    <span className="tc-tip-ttl">{t.title}</span>
                    <span className={`tc-tip-st tc-st-${t.status}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="tc-tip-desc">{t.description}</p>
                </div>
              ))}
              {drills.length > 0 && (
                <div className="tc-drill-sec">
                  <div className="tc-chart-ttl">
                    <Zap size={13} /> Personalized Drills ({drills.length}{" "}
                    words)
                  </div>
                  <div className="tc-drill-words">
                    {drills.map((w, i) => (
                      <span key={i} className="tc-dword">
                        {w}
                      </span>
                    ))}
                  </div>
                  <div
                    style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}
                  >
                    <button className="tc-btn tc-btn-acc" onClick={startDrill}>
                      <Play size={14} /> Start Drill
                    </button>
                    <button
                      className="tc-btn tc-btn-drill-nav"
                      onClick={goToDrills}
                    >
                      <Dumbbell size={14} /> Drill Room
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ ACHIEVEMENTS TAB ══ */}
          {tab === "achievements" && (
            <div className="tc-ach-panel">
              <div className="tc-panel-ttl">
                <Trophy size={19} /> Achievements
              </div>
              <div className="tc-lvl-banner">
                <div className="tc-lvl-icon">
                  <Star size={28} />
                  <span className="tc-lvl-num">{userData?.level || 1}</span>
                </div>
                <div className="tc-lvl-info">
                  <div className="tc-lvl-name">
                    Level {userData?.level || 1} Typist
                  </div>
                  <div className="tc-lvl-xp">
                    {userData?.xp || 0} / {(userData?.level || 1) * 1000} XP
                  </div>
                  <div className="tc-lvl-bar">
                    <div
                      className="tc-lvl-fill"
                      style={{ width: `${((userData?.xp || 0) % 1000) / 10}%` }}
                    />
                  </div>
                </div>
                <div className="tc-lvl-streak">
                  <Flame size={22} />
                  <div>
                    <div className="tc-sk-num">
                      {userData?.streak?.current || 0}
                    </div>
                    <div className="tc-sk-lbl">day streak</div>
                  </div>
                </div>
              </div>
              <div className="tc-badges-row">
                {(userData?.badges || ["Newbie"]).map((b, i) => (
                  <span key={i} className="tc-badge">
                    {b}
                  </span>
                ))}
              </div>
              <div className="tc-ach-grid">
                {ACHIEVEMENTS_DEF.map((a) => {
                  const ok = (userData?.achievements || []).includes(a.id);
                  return (
                    <div
                      key={a.id}
                      className={`tc-ach-card${ok ? " tc-ach-on" : " tc-ach-off"}`}
                    >
                      <div className="tc-ach-ico">{a.icon}</div>
                      <div>
                        <div className="tc-ach-name">{a.name}</div>
                        <div className="tc-ach-desc">{a.desc}</div>
                        <div className="tc-ach-pts">+{a.points}pts</div>
                      </div>
                      {ok && <CheckCircle size={14} className="tc-ach-chk" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ LEADERBOARD TAB ══ */}
          {tab === "leaderboard" && (
            <div className="tc-lb-panel">
              <div className="tc-panel-ttl">
                <Swords size={19} /> Global Leaderboard
              </div>
              <div className="tc-lb-table">
                <div className="tc-lb-head">
                  <span>Rank</span>
                  <span>Player</span>
                  <span>WPM</span>
                  <span>Acc</span>
                </div>
                {leaderboard.map((e, i) => (
                  <div
                    key={i}
                    className={`tc-lb-row${i < 3 ? " tc-lb-top" : ""}`}
                  >
                    <span>
                      {i === 0
                        ? "🥇"
                        : i === 1
                          ? "🥈"
                          : i === 2
                            ? "🥉"
                            : `#${i + 1}`}
                    </span>
                    <span>{e.name || `User ${i + 1}`}</span>
                    <span className="tc-lbwpm">{e.wpm}</span>
                    <span>{e.accuracy}%</span>
                  </div>
                ))}
                <div className="tc-lb-row tc-lb-you">
                  <span>You</span>
                  <span>{userData?.name || "Guest"}</span>
                  <span className="tc-lbwpm">{userData?.bestWPM || 0}</span>
                  <span>—</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── HAND VISUALIZER ── */}
      {handVisualizerOn && testRunning && !testDone && (
        <HandVisualizer
          nextChar={nextChar}
          isDarkMode={isDarkMode}
          visible={true}
        />
      )}

      {/* ── VIRTUAL KEYBOARD ── */}
      <VirtualKeyboard
        lang={lang}
        pressedKey={pressedKey}
        visible={vkbdVisible}
        onClose={() => setVkbdVisible(false)}
      />

      {/* ── ACCESSIBILITY FLOAT ── */}
      <A11yPanel
        settings={a11y}
        onChange={(k, v) => setA11y((p) => ({ ...p, [k]: v }))}
      />
      {/* ── HAND VISUALIZER ── */}
      {handVisualizerOn && testRunning && !testDone && (
        <HandVisualizer
          nextChar={nextChar}
          isDarkMode={isDarkMode}
          visible={true}
        />
      )}
    </div>
  );
}
