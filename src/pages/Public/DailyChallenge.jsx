import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import {
  CalendarDays,
  Zap,
  Target,
  Clock,
  Flame,
  Trophy,
  Star,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Sun,
  Moon,
  Lock,
  Activity,
  Brain,
  Hand,
  Volume2,
  VolumeX,
  ChevronRight,
  Award,
  TrendingUp,
  Sparkles,
  Menu,
  X,
  Home,
  Keyboard,
  BarChart3,
  Dumbbell,
} from "lucide-react";
import {
  lsGet,
  lsSet,
  LS_KEY,
  calcWPM,
  calcAccuracy,
  countCorrect,
  generateText,
  FB,
} from "../../components/Fallback";
import HandVisualizer from "../../components/Handvisualizer";

// ── Seeded random (same challenge every day) ──────────────────────
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
function getDaySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// ── Challenge definitions ─────────────────────────────────────────
const CHALLENGES = [
  {
    id: "speed_burst",
    title: "Speed Burst",
    desc: "Type as fast as you can — 30 seconds, pure WPM.",
    duration: 30,
    target: "wpm",
    goal: 60,
    icon: "⚡",
    color: "blue",
  },
  {
    id: "accuracy_master",
    title: "Accuracy Master",
    desc: "Finish with 98%+ accuracy. Speed doesn't matter.",
    duration: 60,
    target: "accuracy",
    goal: 98,
    icon: "🎯",
    color: "green",
  },
  {
    id: "endurance",
    title: "Endurance Run",
    desc: "Complete a full 5-minute test without stopping.",
    duration: 300,
    target: "wpm",
    goal: 40,
    icon: "🏃",
    color: "orange",
  },
  {
    id: "consistency",
    title: "Consistency King",
    desc: "Keep your WPM variance under 10% for 2 minutes.",
    duration: 120,
    target: "consistency",
    goal: 90,
    icon: "📈",
    color: "purple",
  },
  {
    id: "perfect_score",
    title: "Perfect Score",
    desc: "Hit 100% accuracy on a 45-second test.",
    duration: 45,
    target: "accuracy",
    goal: 100,
    icon: "💎",
    color: "teal",
  },
  {
    id: "code_ninja",
    title: "Code Ninja",
    desc: "Type code for 60 seconds with 95%+ accuracy.",
    duration: 60,
    target: "accuracy",
    goal: 95,
    icon: "💻",
    color: "indigo",
  },
  {
    id: "marathon",
    title: "Marathon Typist",
    desc: "Type 200+ words in 3 minutes.",
    duration: 180,
    target: "words",
    goal: 200,
    icon: "🏅",
    color: "red",
  },
];

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// ── Progress Ring ─────────────────────────────────────────────────
const Ring = ({ value, max = 100, size = 70, stroke = 7, color }) => {
  const r = (size - stroke) / 2,
    circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value, 0) / max, 1);
  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        stroke="var(--dc-border)"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        stroke={color || "var(--dc-accent)"}
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
        className="dc-ring-txt"
      >
        {Math.round(pct * max)}
        {max === 100 ? "%" : ""}
      </text>
    </svg>
  );
};

// ── MAIN ─────────────────────────────────────────────────────────
export default function DailyChallenge() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const userData = lsGet(LS_KEY) || {};

  // Pick today's challenge using seeded random
  const todayChallenge = useMemo(() => {
    const rng = seededRand(getDaySeed());
    return CHALLENGES[Math.floor(rng() * CHALLENGES.length)];
  }, []);

  const [phase, setPhase] = useState("intro"); // intro | test | results
  const [testWords, setTestWords] = useState("");
  const [userInput, setUserInput] = useState("");
  const [testRunning, setTestRunning] = useState(false);
  const [testDone, setTestDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(todayChallenge.duration);
  const [startTime, setStartTime] = useState(null);
  const [wpmHist, setWpmHist] = useState([]);
  const [results, setResults] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [handVisualizerOn, setHandVisualizerOn] = useState(true);
  const [streakData, setStreakData] = useState({
    lastCompleted: lsGet("dc_last_completed") || null,
    streak: lsGet("dc_streak") || 0,
  });

  // ── Sidebar (mobile hamburger) ──────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Dynamic line width (chars per line) based on container size ──
  const [maxLineLen, setMaxLineLen] = useState(65);
  const typeWrapRef = useRef(null);

  useEffect(() => {
    const calcLineLen = () => {
      const el = typeWrapRef.current;
      const width = el ? el.clientWidth : window.innerWidth;
      // approximate monospace char width relative to font-size:
      // font-size scales via clamp(0.74rem..1.05rem) depending on width.
      // We derive an effective char width (~0.62 * font-size in px).
      let fontPx;
      if (width <= 360) fontPx = 13;
      else if (width <= 480) fontPx = 14;
      else if (width <= 768) fontPx = 15.5;
      else fontPx = 16.8; // ~1.05rem
      // slightly wider effective char width + extra safety margin so
      // justified (space-between) lines never overflow horizontally
      const charWidth = fontPx * 0.62;
      const usablePadding = width <= 480 ? 24 : 36; // padding inside dc-type-area + text-disp + safety
      const usableWidth = Math.max(width - usablePadding, 100);
      let chars = Math.floor(usableWidth / charWidth);
      // clamp to sensible bounds so layout never gets too sparse/dense
      chars = Math.max(18, Math.min(chars, 95));
      setMaxLineLen(chars);
    };

    calcLineLen();
    window.addEventListener("resize", calcLineLen);
    window.addEventListener("orientationchange", calcLineLen);
    return () => {
      window.removeEventListener("resize", calcLineLen);
      window.removeEventListener("orientationchange", calcLineLen);
    };
  }, []);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const wpmTickRef = useRef(null);
  const audioCtx = useRef(null);
  const userInputRef = useRef("");
  const testWordsRef = useRef("");
  const startTimeRef = useRef(null);
  const wpmHistRef = useRef([]);
  const endCalledRef = useRef(false);

  useEffect(() => {
    userInputRef.current = userInput;
  }, [userInput]);
  useEffect(() => {
    testWordsRef.current = testWords;
  }, [testWords]);
  useEffect(() => {
    startTimeRef.current = startTime;
  }, [startTime]);
  useEffect(() => {
    wpmHistRef.current = wpmHist;
  }, [wpmHist]);

  const nextChar = useMemo(() => {
    if (!testRunning || testDone) return null;
    return testWords[userInput.length] || null;
  }, [testRunning, testDone, testWords, userInput]);

  const alreadyCompletedToday = useMemo(() => {
    const today = new Date().toDateString();
    return streakData.lastCompleted === today;
  }, [streakData]);

  const initTest = useCallback(() => {
    const text = generateText(
      "english",
      todayChallenge.id === "code_ninja" ? "code" : "words",
      "javascript",
      120,
      false,
    );
    setTestWords(text);
    setUserInput("");
    setTestDone(false);
    setResults(null);
    setWpmHist([]);
    setTimeLeft(todayChallenge.duration);
    setTestRunning(false);
    endCalledRef.current = false;
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [todayChallenge]);

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
      o.frequency.value = 880;
      g.gain.value = 0.03;
      o.start();
      o.stop(audioCtx.current.currentTime + 0.02);
    } catch {}
  }

  // Auto-scroll to current character position
  useEffect(() => {
    if (testRunning && !testDone && userInput.length > 0) {
      const currentChar = document.querySelector(".dcr-text-disp .dc-ch-cur");
      if (currentChar) {
        currentChar.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }
  }, [userInput, testRunning, testDone]);

  useEffect(() => {
    if (testRunning && !testDone) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            clearInterval(wpmTickRef.current);
            endTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      wpmTickRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const el = (Date.now() - startTimeRef.current) / 1000;
          const wpm = calcWPM(
            countCorrect(userInputRef.current, testWordsRef.current),
            el,
          );
          setWpmHist((h) => [...h, wpm]);
        }
      }, 5000);
    }
    return () => {
      clearInterval(timerRef.current);
      clearInterval(wpmTickRef.current);
    };
  }, [testRunning, testDone]);

  function handleInput(e) {
    const val = e.target.value;
    if (testDone) return;
    if (!testRunning) {
      setTestRunning(true);
      setStartTime(Date.now());
    }
    setUserInput(val);
    userInputRef.current = val;
    playClick();
    if (val.length >= testWords.length && !endCalledRef.current) endTest();
  }

  function endTest() {
    if (endCalledRef.current) return;
    endCalledRef.current = true;
    clearInterval(timerRef.current);
    clearInterval(wpmTickRef.current);

    const fi = userInputRef.current,
      ft = testWordsRef.current,
      fs = startTimeRef.current;
    const fh = [...wpmHistRef.current];
    const el = fs ? (Date.now() - fs) / 1000 : todayChallenge.duration;
    const correct = countCorrect(fi, ft);
    const wpm = calcWPM(correct, el);
    const acc = calcAccuracy(correct, fi.length || 1);
    const cons =
      fh.length > 1
        ? Math.round(
            100 -
              ((Math.max(...fh) - Math.min(...fh)) / (Math.max(...fh) || 1)) *
                100,
          )
        : 100;
    const words = Math.round(correct / 5);

    let achieved = false;
    if (todayChallenge.target === "wpm") achieved = wpm >= todayChallenge.goal;
    else if (todayChallenge.target === "accuracy")
      achieved = acc >= todayChallenge.goal;
    else if (todayChallenge.target === "consistency")
      achieved = cons >= todayChallenge.goal;
    else if (todayChallenge.target === "words")
      achieved = words >= todayChallenge.goal;

    const res = {
      wpm: Math.max(0, wpm),
      accuracy: Math.max(0, Math.min(100, acc)),
      consistency: cons,
      words,
      elapsed: Math.round(el),
      achieved,
    };
    setResults(res);
    setTestDone(true);
    setTestRunning(false);

    // Update streak if achieved
    if (achieved) {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const lastDay = lsGet("dc_last_completed");
      const currentStreak = lsGet("dc_streak") || 0;
      const newStreak = lastDay === yesterday ? currentStreak + 1 : 1;
      lsSet("dc_streak", newStreak);
      lsSet("dc_last_completed", today);
      setStreakData({ lastCompleted: today, streak: newStreak });
    }

    setTimeout(() => setPhase("results"), 400);
  }

  // Rendered text — now uses dynamic maxLineLen (responsive!)
  const renderedText = useMemo(() => {
    const text = testWords || "";

    // Function to wrap text at word boundaries WITHOUT dropping any
    // characters — every character in `str` must end up in `lines`,
    // in the same order, so character indices stay perfectly in sync
    // with userInput.length.
    const wrapText = (str, maxLineLength) => {
      const words = str.split(/(\s+)/);
      const lines = [];
      let currentLine = "";

      words.forEach((word) => {
        if (word.match(/^\s+$/)) {
          // Whitespace chunk: try to keep it on the current line.
          if (
            currentLine.length + word.length <= maxLineLength ||
            currentLine.length === 0
          ) {
            currentLine += word;
          } else {
            // Doesn't fit — push current line as-is, then carry the
            // whitespace over to the start of the next line instead
            // of discarding it.
            lines.push(currentLine);
            currentLine = word;
          }
        } else {
          const testLine = currentLine + word;
          if (testLine.length > maxLineLength && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
      });

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines.map((line) => line.split(""));
    };

    // Dynamic max line length based on screen/container width
    const lines = wrapText(text, maxLineLen);

    if (lines.length === 0) {
      lines.push([]);
    }

    // Find which line contains the current typing position
    let charCount = 0;
    let currentLineIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineStart = charCount;
      const lineEnd = charCount + lines[i].length;
      if (userInput.length >= lineStart && userInput.length <= lineEnd) {
        currentLineIndex = i;
        break;
      }
      charCount += lines[i].length;
    }

    // Calculate visible lines — always show exactly 5 lines
    let startLineIndex = 0;
    let endLineIndex;

    if (currentLineIndex >= 3) {
      startLineIndex = Math.max(0, currentLineIndex - 2);
      endLineIndex = Math.min(lines.length, startLineIndex + 5);
      if (endLineIndex === lines.length && endLineIndex - startLineIndex < 5) {
        startLineIndex = Math.max(0, endLineIndex - 5);
      }
    } else {
      endLineIndex = Math.min(5, lines.length);
    }

    const visibleLines = [...lines.slice(startLineIndex, endLineIndex)];

    const emptyLinesNeeded = Math.max(0, 5 - visibleLines.length);
    for (let i = 0; i < emptyLinesNeeded; i++) {
      visibleLines.push([]);
    }

    let offset = 0;
    for (let i = 0; i < startLineIndex; i++) {
      offset += lines[i]?.length || 0;
    }

    const renderedChars = [];
    let globalIndex = offset;

    visibleLines.forEach((line, lineIdx) => {
      if (line.length === 0) {
        renderedChars.push(
          <div key={`empty-line-${lineIdx}`} className="dcr-empty-line">
            <span className="dcr-placeholder-dots">··········</span>
          </div>,
        );
      } else {
        const lineChars = [];
        line.forEach((ch, charIdx) => {
          const absoluteIndex = globalIndex + charIdx;
          let cls = "dc-ch-pend";
          if (absoluteIndex < userInput.length) {
            cls = userInput[absoluteIndex] === ch ? "dc-ch-ok" : "dc-ch-err";
          }
          lineChars.push(
            <span
              key={absoluteIndex}
              className={`${cls}${absoluteIndex === userInput.length ? " dc-ch-cur" : ""}`}
            >
              {ch}
            </span>,
          );
        });

        const isLastLine = lineIdx === visibleLines.length - 1;
        renderedChars.push(
          <div
            key={`line-${lineIdx}`}
            className={`dcr-text-line${isLastLine ? " dcr-line-last" : ""}`}
          >
            {lineChars}
          </div>,
        );
        globalIndex += line.length;
      }
    });

    return renderedChars;
  }, [testWords, userInput, maxLineLen]);

  const timerPct = (timeLeft / todayChallenge.duration) * 100;
  const timerColor =
    timerPct > 50
      ? "var(--dc-green)"
      : timerPct > 20
        ? "var(--dc-yellow)"
        : "var(--dc-red)";

  const liveWPM =
    testRunning && startTime
      ? calcWPM(
          countCorrect(userInputRef.current, testWordsRef.current),
          (Date.now() - startTime) / 1000,
        )
      : 0;
  const liveAcc =
    testRunning && userInput.length
      ? calcAccuracy(
          countCorrect(userInputRef.current, testWordsRef.current),
          userInput.length,
        )
      : 0;

  return (
    <div className={`dc-root ${isDarkMode ? "dark" : "light"}`}>
      {/* ── Mobile hamburger menu toggle ── */}
      <button
        className="dcr-menu-toggle"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* ── Sidebar overlay (mobile/tablet) ── */}
      <div
        className={`dcr-sidebar-overlay${sidebarOpen ? " dcr-overlay-open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Collapsible sidebar (mobile/tablet) ── */}
      <aside className={`dcr-sidebar${sidebarOpen ? " dcr-sidebar-open" : ""}`}>
        <div className="dcr-sidebar-header">
          <span>
            <Keyboard
              size={16}
              style={{ marginRight: "0.4rem", verticalAlign: "-2px" }}
            />
            SwiftKeys
          </span>
          <button
            className="dcr-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>
        <nav className="dcr-sidebar-body">
          <Link
            to="/"
            className="dcr-sidebar-link"
            onClick={() => setSidebarOpen(false)}
          >
            <Home size={15} /> Home
          </Link>
          <Link
            to="/drills"
            className="dcr-sidebar-link"
            onClick={() => setSidebarOpen(false)}
          >
            <Dumbbell size={15} /> Drills
          </Link>
          <Link
            to="/daily-challenge"
            className="dcr-sidebar-link dcr-link-active"
            onClick={() => setSidebarOpen(false)}
          >
            <CalendarDays size={15} /> Daily Challenge
          </Link>
          <Link
            to="/analytics"
            className="dcr-sidebar-link"
            onClick={() => setSidebarOpen(false)}
          >
            <BarChart3 size={15} /> Analytics
          </Link>
          <button
            className="dcr-sidebar-link"
            onClick={() => {
              setSoundEnabled((s) => !s);
            }}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            Sound {soundEnabled ? "On" : "Off"}
          </button>
          <button className="dcr-sidebar-link" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </nav>
      </aside>

      <main className="dc-main">
        {/* ── INTRO PHASE ── */}
        {phase === "intro" && (
          <div className="dc-intro">
            <div className="dc-date-badge">
              <CalendarDays size={14} />
              {DAY_NAMES[new Date().getDay()]},{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <div className="dc-challenge-hero">
              <div className="dc-hero-icon">{todayChallenge.icon}</div>
              <div className="dc-hero-label">Today's Challenge</div>
              <h1 className="dc-hero-title">{todayChallenge.title}</h1>
              <p className="dc-hero-desc">{todayChallenge.desc}</p>
              <div className="dc-hero-meta">
                <div className="dc-meta-chip">
                  <Clock size={13} /> {todayChallenge.duration}s
                </div>
                <div className="dc-meta-chip">
                  <Target size={13} /> Goal: {todayChallenge.goal}
                  {todayChallenge.target === "wpm"
                    ? " WPM"
                    : todayChallenge.target === "accuracy"
                      ? "% accuracy"
                      : todayChallenge.target === "words"
                        ? " words"
                        : "% consistency"}
                </div>
              </div>
            </div>

            {alreadyCompletedToday && (
              <div className="dc-completed-banner">
                <CheckCircle size={16} />
                You've already completed today's challenge! Come back tomorrow
                for a new one.
              </div>
            )}

            <div className="dc-week-grid">
              {CHALLENGES.slice(0, 7).map((c, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (new Date().getDay() - i));
                const isPast = i < new Date().getDay();
                const isToday = i === new Date().getDay();
                return (
                  <div
                    key={i}
                    className={`dc-week-day${isToday ? " dc-week-today" : ""}${isPast ? " dc-week-past" : ""}`}
                  >
                    <div className="dc-week-day-name">
                      {DAY_NAMES[i].slice(0, 3)}
                    </div>
                    <div className="dc-week-icon">
                      {isPast ? "✓" : isToday ? c.icon : "?"}
                    </div>
                    {isToday && <div className="dc-week-today-dot" />}
                  </div>
                );
              })}
            </div>

            <div className="dc-intro-opts">
              <label className="dc-opt-row">
                <Hand size={14} />
                <span>Hand Guide</span>
                <div
                  className={`dc-toggle${handVisualizerOn ? " dc-toggle-on" : ""}`}
                  onClick={() => setHandVisualizerOn((h) => !h)}
                  role="switch"
                  aria-checked={handVisualizerOn}
                  tabIndex={0}
                />
              </label>
            </div>

            <button
              className="dc-start-btn"
              onClick={() => {
                setPhase("test");
                initTest();
              }}
            >
              <Zap size={18} />
              {alreadyCompletedToday ? "Try Again" : "Start Challenge"}
              <ChevronRight size={18} />
            </button>

            {/* Leaderboard / past results */}
            <div className="dc-past-section">
              <div className="dc-past-title">
                <Trophy size={15} /> Your Best Results
              </div>
              <div className="dc-past-stats">
                <div className="dc-past-stat">
                  <Star size={14} />
                  <div>
                    <div className="dc-past-val">
                      {userData.bestWPM || 0} WPM
                    </div>
                    <div className="dc-past-lbl">Best Speed</div>
                  </div>
                </div>
                <div className="dc-past-stat">
                  <Flame size={14} />
                  <div>
                    <div className="dc-past-val">{streakData.streak}</div>
                    <div className="dc-past-lbl">Day Streak</div>
                  </div>
                </div>
                <div className="dc-past-stat">
                  <Award size={14} />
                  <div>
                    <div className="dc-past-val">
                      {userData.totalTests || 0}
                    </div>
                    <div className="dc-past-lbl">Total Tests</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TEST PHASE ── */}
        {phase === "test" && (
          <div className="dc-test">
            {/* Challenge header */}
            <div className="dc-test-header">
              <div className="dc-test-challenge-name">
                <span className="dc-test-icon">{todayChallenge.icon}</span>
                {todayChallenge.title}
              </div>
              <div className="dc-test-goal">
                Goal: {todayChallenge.goal}
                {todayChallenge.target === "wpm"
                  ? " WPM"
                  : todayChallenge.target === "accuracy"
                    ? "% acc"
                    : todayChallenge.target === "words"
                      ? " words"
                      : "% consistency"}
              </div>
            </div>

            {/* Live stats */}
            <div className="dc-live-bar">
              <div className="dc-live-stat">
                <span className="dc-live-val">{Math.round(liveWPM)}</span>
                <span className="dc-live-lbl">WPM</span>
              </div>
              <div className="dc-live-stat">
                <span className="dc-live-val">{Math.round(liveAcc)}%</span>
                <span className="dc-live-lbl">Acc</span>
              </div>
              <Ring
                value={timeLeft}
                max={todayChallenge.duration}
                size={68}
                stroke={6}
                color={timerColor}
              />
              <div className="dc-live-stat">
                <span className="dc-live-val">{timeLeft}s</span>
                <span className="dc-live-lbl">Left</span>
              </div>
            </div>

            {/* Typing area */}
            <div
              className={`dc-type-area${testRunning && !testDone ? " dc-type-active" : ""}`}
            >
              <div className="dcr-type-wrap" ref={typeWrapRef}>
                <div className="dcr-text-disp">{renderedText}</div>
              </div>
              <textarea
                ref={inputRef}
                className="dc-input"
                value={userInput}
                onChange={handleInput}
                placeholder="Start typing to begin…"
                disabled={testDone}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                rows={3}
              />
            </div>

            <div className="dc-test-actions">
              <button
                className="dc-btn dc-btn-sec"
                onClick={() => {
                  clearInterval(timerRef.current);
                  clearInterval(wpmTickRef.current);
                  setPhase("intro");
                }}
              >
                <ArrowLeft size={14} /> Quit
              </button>
              <button
                className="dc-btn dc-btn-acc"
                onClick={() => {
                  initTest();
                }}
              >
                <RefreshCw size={14} /> Restart
              </button>
            </div>
          </div>
        )}

        {/* ── RESULTS PHASE ── */}
        {phase === "results" && results && (
          <div className="dc-results">
            <div
              className={`dc-result-hero ${results.achieved ? "dc-result-win" : "dc-result-lose"}`}
            >
              <div className="dc-result-emoji">
                {results.achieved ? "🏆" : "😤"}
              </div>
              <div className="dc-result-headline">
                {results.achieved ? "Challenge Complete!" : "So Close!"}
              </div>
              <div className="dc-result-sub">
                {results.achieved
                  ? `You nailed the ${todayChallenge.title} challenge!`
                  : `Goal was ${todayChallenge.goal}${todayChallenge.target === "wpm" ? " WPM" : "%"}. Keep trying!`}
              </div>
              {results.achieved && (
                <div className="dc-streak-gained">
                  <Flame size={16} /> Streak: {streakData.streak} days
                </div>
              )}
            </div>

            <div className="dc-result-stats">
              <div className="dc-result-stat">
                <Zap size={16} className="dc-rs-icon-blue" />
                <span className="dc-rs-val">{results.wpm}</span>
                <span className="dc-rs-lbl">WPM</span>
              </div>
              <div className="dc-result-stat">
                <Target size={16} className="dc-rs-icon-green" />
                <span className="dc-rs-val">{results.accuracy}%</span>
                <span className="dc-rs-lbl">Accuracy</span>
              </div>
              <div className="dc-result-stat">
                <Activity size={16} className="dc-rs-icon-purple" />
                <span className="dc-rs-val">{results.consistency}%</span>
                <span className="dc-rs-lbl">Consistency</span>
              </div>
              <div className="dc-result-stat">
                <Clock size={16} className="dc-rs-icon-yellow" />
                <span className="dc-rs-val">{results.elapsed}s</span>
                <span className="dc-rs-lbl">Time</span>
              </div>
            </div>

            {/* Goal meter */}
            <div className="dc-goal-meter-card">
              <div className="dc-gm-title">
                <TrendingUp size={14} /> Challenge Goal Progress
              </div>
              <div className="dc-gm-row">
                <span>
                  {todayChallenge.target === "wpm"
                    ? `${results.wpm} WPM`
                    : todayChallenge.target === "accuracy"
                      ? `${results.accuracy}%`
                      : todayChallenge.target === "words"
                        ? `${results.words} words`
                        : `${results.consistency}%`}
                </span>
                <span>/ {todayChallenge.goal}</span>
              </div>
              <div className="dc-gm-track">
                <div
                  className="dc-gm-fill"
                  style={{
                    width: `${Math.min(
                      ((todayChallenge.target === "wpm"
                        ? results.wpm
                        : todayChallenge.target === "accuracy"
                          ? results.accuracy
                          : todayChallenge.target === "words"
                            ? results.words
                            : results.consistency) /
                        todayChallenge.goal) *
                        100,
                      100,
                    )}%`,
                    background: results.achieved
                      ? "var(--dc-green)"
                      : "var(--dc-accent)",
                  }}
                />
              </div>
              {results.achieved && (
                <div className="dc-gm-badge">
                  <CheckCircle size={13} /> Goal Achieved!
                </div>
              )}
            </div>

            <div className="dc-result-actions">
              <button
                className="dc-btn dc-btn-sec"
                onClick={() => setPhase("intro")}
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                className="dc-btn dc-btn-acc"
                onClick={() => {
                  setPhase("test");
                  initTest();
                }}
              >
                <RefreshCw size={14} /> Try Again
              </button>
              <button
                className="dc-btn dc-btn-sec"
                onClick={() => navigate("/")}
              >
                <Sparkles size={14} /> Practice Mode
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Hand Visualizer — only shown during test on non-mobile */}
      {handVisualizerOn && phase === "test" && testRunning && !testDone && (
        <HandVisualizer
          nextChar={nextChar}
          isDarkMode={isDarkMode} 
          visible={true} 
        /> 
      )} 
    </div> 
  ); 
}
