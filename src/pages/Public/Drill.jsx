import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import {
  Dumbbell,
  X,
  Plus,
  ChevronDown,
  RefreshCw,
  Zap,
  Target,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  Brain,
  ArrowLeft,
  Keyboard,
  Hash,
  Type,
  Layers,
  BarChart2,
  TrendingUp,
  Play,
  Shuffle,
  Settings,
  Eye,
  EyeOff,
  Timer,
  Repeat,
  Star,
  Flame,
  CaseSensitive,
  Hand,
  Volume2,
  VolumeX,
  Info,
  SlidersHorizontal,
} from "lucide-react";

import {
  FB,
  DRILL_FB,
  COMMON_PAIRS,
  shuffle,
  calcWPM,
  calcAccuracy,
  countCorrect,
  lsGet,
  lsSet,
  apiGet,
  LS_KEY,
} from "../../components/Fallback";

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const NUMBERS = "0123456789".split("");
const SYMBOLS = [
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "_",
  "+",
  "-",
  "=",
  "[",
  "]",
  ";",
  "'",
  ",",
  ".",
  "/",
  "{",
  "}",
  "|",
  '"',
  "<",
  ">",
  "?",
  "`",
  "~",
];

const DRILL_MODES = [
  {
    id: "pairs",
    label: "Key Pairs",
    icon: Layers,
    desc: "Practice character combinations",
  },
  {
    id: "single",
    label: "Single Keys",
    icon: Type,
    desc: "Focus on individual characters",
  },
  {
    id: "words",
    label: "Words",
    icon: Brain,
    desc: "Common words containing target keys",
  },
  {
    id: "sentences",
    label: "Sentences",
    icon: Dumbbell,
    desc: "Full sentence drills",
  },
  { id: "speed", label: "Speed Burst", icon: Zap, desc: "Fast short drills" },
  {
    id: "accuracy",
    label: "Accuracy Mode",
    icon: Target,
    desc: "Slow down, zero errors",
  },
];

const DURATIONS_DRILL = [
  { label: "30s", value: 30 },
  { label: "1m", value: 60 },
  { label: "2m", value: 120 },
  { label: "5m", value: 300 },
];

// ── LANGUAGE CONFIGS ──────────────────────────────────────────────────────────
const SUPPORTED_LANGS = [
  { id: "english", label: "English", flag: "🇬🇧", words: FB.english.words },
  {
    id: "spanish",
    label: "Español",
    flag: "🇪🇸",
    words: FB.spanish?.words || [],
  },
  { id: "hindi", label: "हिन्दी", flag: "🇮🇳", words: FB.hindi?.words || [] },
];

const HINDI_VOWELS = ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ"];
const HINDI_CONSONANTS = [
  "क",
  "ख",
  "ग",
  "घ",
  "ङ",
  "च",
  "छ",
  "ज",
  "झ",
  "ञ",
  "ट",
  "ठ",
  "ड",
  "ढ",
  "ण",
  "त",
  "थ",
  "द",
  "ध",
  "न",
  "प",
  "फ",
  "ब",
  "भ",
  "म",
  "य",
  "र",
  "ल",
  "व",
  "श",
  "ष",
  "स",
  "ह",
  "क्ष",
  "त्र",
  "ज्ञ",
];
const HINDI_MATRAS = ["ा", "ि", "ी", "ु", "ू", "ृ", "े", "ै", "ो", "ौ"];
const HINDI_CHARS = [...HINDI_VOWELS, ...HINDI_CONSONANTS, ...HINDI_MATRAS];

const SPANISH_LETTERS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "ñ",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "á",
  "é",
  "í",
  "ó",
  "ú",
  "ü",
  "¿",
  "¡",
];

// ── MIXED CASE HELPER ─────────────────────────────────────────────────────────
function applyMixedCase(text) {
  const words = text.split(/(\s+)/);
  return words
    .map((word, index) => {
      if (word.trim().length === 0) return word;
      const isStartOfSentence =
        index === 0 || (index > 0 && words[index - 1].trim().endsWith("."));
      if (isStartOfSentence) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
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
        "Google",
        "Apple",
        "Microsoft",
      ];
      const shouldCapitalize =
        properNouns.includes(word) || Math.random() < 0.15;
      return shouldCapitalize
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase();
    })
    .join("");
}

// ── GENERATE DRILL TEXT ───────────────────────────────────────────────────────
function generateDrillText(targets, drillMode, caps, language) {
  const langData = SUPPORTED_LANGS.find((l) => l.id === language);
  const wordPool = langData?.words || FB.english.words;

  if (!targets.length) {
    let text = shuffle(wordPool).slice(0, 80).join(" ");
    if (caps && language !== "hindi") text = applyMixedCase(text);
    return text;
  }

  let words = [];

  targets.forEach((t) => {
    if (DRILL_FB[language]?.[t])
      words = words.concat(DRILL_FB[language][t].slice(0, 10));
    const containing = wordPool.filter((w) =>
      w.toLowerCase().includes(t.toLowerCase()),
    );
    words = words.concat(containing.slice(0, 8));
  });

  if (drillMode === "pairs") {
    targets.forEach((pair) => {
      if (pair.length >= 2) {
        for (let i = 0; i < 12; i++) {
          const base = wordPool[Math.floor(Math.random() * wordPool.length)];
          words.push(pair + base.slice(0, 3));
          words.push(base.slice(0, 3) + pair);
        }
      }
    });
  }

  if (drillMode === "single") {
    targets.forEach((ch) => {
      const row = [];
      for (let i = 0; i < 20; i++) {
        const neighbor =
          wordPool.filter((w) => w.includes(ch))[i % 5] || ch.repeat(3);
        row.push(neighbor);
      }
      words = words.concat(row);
    });
  }

  if (drillMode === "speed") {
    words = words.filter((w) => w.length <= 5);
    if (words.length < 20)
      words = words.concat(
        shuffle(wordPool.filter((w) => w.length <= 5)).slice(0, 20),
      );
  }

  if (!words.length) words = shuffle(wordPool).slice(0, 100);

  let result = shuffle([...new Set(words)])
    .slice(0, 100)
    .join(" ");
  if (caps && language !== "hindi") result = applyMixedCase(result);
  return result;
}

// ── INFINITE TEXT GENERATOR ───────────────────────────────────────────────────
const INFINITE_DRILL_GENERATOR = {
  generateMoreText(targets, drillMode, caps, language) {
    return generateDrillText(targets, drillMode, caps, language);
  },
  ensureBuffer(
    currentText,
    userInputLength,
    targets,
    drillMode,
    caps,
    language,
  ) {
    if (currentText.length - userInputLength < 300) {
      return (
        currentText +
        " " +
        this.generateMoreText(targets, drillMode, caps, language)
      );
    }
    return currentText;
  },
};

// ── STAT CARD ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`dr-stat tc-c-${color}`}>
    <div className="dr-stat-icon">
      <Icon size={16} />
    </div>
    <div className="dr-stat-val">{value}</div>
    <div className="dr-stat-lbl">{label}</div>
  </div>
);

// ── PROGRESS RING ─────────────────────────────────────────────────────────────
const ProgressRing = ({ value, max = 100, size = 60, stroke = 6, color }) => {
  const r = (size - stroke) / 2,
    circ = 2 * Math.PI * r,
    pct = Math.min(Math.max(value, 0) / max, 1);
  return (
    <svg width={size} height={size}>
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
        style={{ transition: "stroke-dashoffset 0.4s" }}
      />
      <text
        x={size / 2}
        y={size / 2 + 5}
        textAnchor="middle"
        className="tc-pring-txt"
        fontSize="11"
      >
        {Math.round(pct * max)}
      </text>
    </svg>
  );
};

// ── TARGET CHIP ───────────────────────────────────────────────────────────────
const TargetChip = ({ value, onRemove }) => (
  <div className="dr-chip">
    <span className="dr-chip-val">{value === " " ? "⎵" : value}</span>
    <button className="dr-chip-rm" onClick={() => onRemove(value)}>
      <X size={10} />
    </button>
  </div>
);

// ── MAIN DRILLS PAGE ──────────────────────────────────────────────────────────
export default function Drill() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Settings state
  const [targets, setTargets] = useState([]);
  const [drillMode, setDrillMode] = useState("pairs");
  const [duration, setDuration] = useState(60);
  const [caps, setCaps] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [activeTab, setActiveTab] = useState("letters");
  const [language, setLanguage] = useState("english");

  // Sidebar collapse state (starts expanded, collapses on mobile after first load)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Test state
  const [testText, setTestText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [startTime, setStartTime] = useState(null);
  const [wpmHist, setWpmHist] = useState([]);
  const [errorMap, setErrorMap] = useState({});
  const [results, setResults] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [historyResults, setHistoryResults] = useState(
    () => lsGet("drill_history") || [],
  );

  // Dynamic line length based on container width
  const typeAreaRef = useRef(null);
  const [lineLength, setLineLength] = useState(75);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const wpmRef = useRef(null);
  const userInputRef = useRef("");
  const testTextRef = useRef("");
  const startRef = useRef(null);
  const wpmHistRef = useRef([]);
  const endCalledRef = useRef(false);
  const audioCtx = useRef(null);

  // Collapse sidebar on small screens by default
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    if (mq.matches) setSidebarOpen(false);
    const handler = (e) => {
      if (e.matches) setSidebarOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Dynamic line-length observer
  useEffect(() => {
    if (!typeAreaRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const containerWidth = entry.contentRect.width;
      // ~8px per monospace char at ~1rem; clamp between 40 and 100 chars
      const charsPerLine = Math.max(
        40,
        Math.min(100, Math.floor(containerWidth / 10)),
      );
      setLineLength(charsPerLine);
    });
    ro.observe(typeAreaRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    userInputRef.current = userInput;
  }, [userInput]);
  useEffect(() => {
    testTextRef.current = testText;
  }, [testText]);
  useEffect(() => {
    startRef.current = startTime;
  }, [startTime]);
  useEffect(() => {
    wpmHistRef.current = wpmHist;
  }, [wpmHist]);

  // Load targets from navigation state
  useEffect(() => {
    const state = location.state;
    if (state) {
      const incoming = [];
      if (state.weakPair && state.weakPair.length >= 2)
        incoming.push(state.weakPair);
      if (state.weakFinger) {
        const FMAP = {
          left_pinky: ["q", "a", "z"],
          left_ring: ["w", "s", "x"],
          left_middle: ["e", "d", "c"],
          left_index: ["r", "f", "v", "t", "g"],
          right_index: ["y", "h", "n", "u", "j"],
          right_middle: ["i", "k"],
          right_ring: ["o", "l"],
          right_pinky: ["p", ";"],
        };
        (FMAP[state.weakFinger] || []).forEach((k) => {
          if (!incoming.includes(k)) incoming.push(k);
        });
      }
      if (incoming.length) {
        setTargets(incoming.slice(0, 10));
        setSidebarOpen(true);
      }
    }
  }, [location.state]);

  const generate = useCallback(() => {
    const text = generateDrillText(targets, drillMode, caps, language);
    setTestText(text);
    setUserInput("");
    setDone(false);
    setResults(null);
    setWpmHist([]);
    setErrorMap({});
    setTimeLeft(duration);
    setRunning(false);
    endCalledRef.current = false;
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [targets, drillMode, caps, duration, language]);

  useEffect(() => {
    generate();
  }, [generate]);

  function playClick() {
    if (!soundOn) return;
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
      g.gain.value = 0.035;
      o.start();
      o.stop(audioCtx.current.currentTime + 0.02);
    } catch {}
  }

  // Timer
  useEffect(() => {
    if (running && !done) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (wpmRef.current) clearInterval(wpmRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((p) => {
          if (p <= 1) {
            clearInterval(timerRef.current);
            clearInterval(wpmRef.current);
            endTest();
            return 0;
          }
          return p - 1;
        });
      }, 1000);

      wpmRef.current = setInterval(() => {
        if (startRef.current) {
          const el = (Date.now() - startRef.current) / 1000;
          const w = calcWPM(
            countCorrect(userInputRef.current, testTextRef.current),
            el,
          );
          setWpmHist((h) => [...h, w]);
        }
      }, 5000);
    }
    return () => {
      clearInterval(timerRef.current);
      clearInterval(wpmRef.current);
    };
  }, [running, done]);

  function handleInput(e) {
    const val = e.target.value;
    if (done) return;

    if (!running) {
      setRunning(true);
      setStartTime(Date.now());
      endCalledRef.current = false;
    }

    setUserInput(val);
    userInputRef.current = val;

    const last = val[val.length - 1];
    const exp = testText[val.length - 1];
    if (last !== undefined) {
      playClick();
      if (last !== exp && exp)
        setErrorMap((m) => ({ ...m, [exp]: (m[exp] || 0) + 1 }));
    }

    // Infinite text buffer
    if (testText.length - val.length < 300 && !done) {
      const chunk = INFINITE_DRILL_GENERATOR.generateMoreText(
        targets,
        drillMode,
        caps,
        language,
      );
      setTestText((prev) => prev + " " + chunk);
    }
    if (val.length >= testText.length && !done && !endCalledRef.current) {
      const chunk = INFINITE_DRILL_GENERATOR.generateMoreText(
        targets,
        drillMode,
        caps,
        language,
      );
      setTestText((prev) => prev + " " + chunk);
    }
  }

  function endTest() {
    if (endCalledRef.current) return;
    endCalledRef.current = true;
    clearInterval(timerRef.current);
    clearInterval(wpmRef.current);

    const fi = userInputRef.current,
      ft = testTextRef.current,
      fs = startRef.current;
    const fh = [...wpmHistRef.current];
    const el = fs ? (Date.now() - fs) / 1000 : duration;
    const correct = countCorrect(fi, ft),
      wpm = calcWPM(correct, el);
    const acc = calcAccuracy(correct, fi.length || 1);
    const cons =
      fh.length > 1
        ? Math.round(
            100 -
              ((Math.max(...fh) - Math.min(...fh)) / (Math.max(...fh) || 1)) *
                100,
          )
        : 100;
    const res = {
      wpm: Math.max(0, wpm),
      accuracy: Math.max(0, Math.min(100, acc)),
      consistency: Math.max(0, Math.min(100, cons)),
      elapsed: Math.round(el),
      mistakes: fi.length - correct,
      targets: [...targets],
      drillMode,
      date: new Date().toISOString(),
    };
    setDone(true);
    setRunning(false);
    setResults(res);
    setStartTime(null);
    const hist = [res, ...(lsGet("drill_history") || [])].slice(0, 50);
    lsSet("drill_history", hist);
    setHistoryResults(hist);
  }

  function addTarget(val) {
    if (!val || targets.includes(val) || targets.length >= 10) return;
    setTargets((t) => [...t, val]);
  }
  function removeTarget(val) {
    setTargets((t) => t.filter((x) => x !== val));
  }
  function addCustom() {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    trimmed
      .split("")
      .slice(0, 3)
      .forEach((ch) => addTarget(ch));
    if (trimmed.length >= 2) addTarget(trimmed.slice(0, 4));
    setCustomInput("");
  }
  function clearTargets() {
    setTargets([]);
  }

  const timerPct = (timeLeft / duration) * 100;
  const timerColor =
    timerPct > 50 ? "#10b981" : timerPct > 20 ? "#f59e0b" : "#ef4444";

  // ── 5-LINE DISPLAY (dynamic lineLength) ────────────────────────────────────
  const renderedText = useMemo(() => {
    if (!testText) return null;

    const splitIntoLines = (str, maxLineLength) => {
      const lines = [];
      let currentLine = "";
      const words = str.split(/(\s+)/);
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (word.match(/^\s+$/)) {
          if ((currentLine + word).length <= maxLineLength) currentLine += word;
          else {
            if (currentLine) lines.push(currentLine);
            currentLine = "";
          }
        } else {
          const testLine = currentLine + word;
          if (testLine.length > maxLineLength && currentLine.length > 0) {
            lines.push(currentLine.trimEnd());
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
      }
      if (currentLine) lines.push(currentLine.trimEnd());
      if (lines.length === 0) lines.push("");
      return lines.map((line) => line.split(""));
    };

    const lines = splitIntoLines(testText, lineLength);
    if (lines.length === 0) return null;

    let charCount = 0,
      currentLineIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineEnd = charCount + lines[i].length;
      if (userInput.length >= charCount && userInput.length <= lineEnd) {
        currentLineIndex = i;
        break;
      }
      charCount += lines[i].length;
    }

    let startLineIndex = 0,
      endLineIndex;
    if (currentLineIndex >= 3) {
      startLineIndex = Math.max(0, currentLineIndex - 2);
      endLineIndex = Math.min(lines.length, startLineIndex + 5);
      if (endLineIndex === lines.length && endLineIndex - startLineIndex < 5)
        startLineIndex = Math.max(0, endLineIndex - 5);
    } else {
      endLineIndex = Math.min(5, lines.length);
    }

    const visibleLines = [...lines.slice(startLineIndex, endLineIndex)];
    const emptyLinesNeeded = Math.max(0, 5 - visibleLines.length);
    for (let i = 0; i < emptyLinesNeeded; i++) visibleLines.push([]);

    let offset = 0;
    for (let i = 0; i < startLineIndex; i++) {
      offset += (lines[i]?.length || 0) + 1; // +1 for the space between lines
    }

    const renderedChars = [];
    let globalIndex = offset;
    visibleLines.forEach((line, lineIdx) => {
      if (line.length === 0) {
        renderedChars.push(
          <div key={`empty-line-${lineIdx}`} className="dr-empty-line">
            <span className="dr-placeholder-dots">~</span>
          </div>,
        );
      } else {
        const lineChars = [];
        for (let charIdx = 0; charIdx < line.length; charIdx++) {
          const ch = line[charIdx],
            absoluteIndex = globalIndex + charIdx;
          let cls = "dr-ch-pend";
          if (absoluteIndex < userInput.length)
            cls = userInput[absoluteIndex] === ch ? "dr-ch-ok" : "dr-ch-err";
          lineChars.push(
            <span
              key={absoluteIndex}
              className={`${cls}${absoluteIndex === userInput.length ? " dr-ch-cur" : ""}`}
            >
              {ch}
            </span>,
          );
        }
        renderedChars.push(
          <div key={`line-${lineIdx}`} className="dr-text-line">
            {lineChars}
          </div>,
        );
        globalIndex += line.length + 1;
      }
    });
    return renderedChars;
  }, [testText, userInput, lineLength]);

  const topErrors = Object.entries(errorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div
      className={`dr-root${isDarkMode ? " dark" : " light"} language-${language}`}
    >
      <div className="dr-page">
        {/* ── Motivational banner ── */}
        {(location.state?.weakPair || location.state?.weakFinger) && (
          <div className="dr-motiv">
            <Brain
              size={14}
              style={{ color: "var(--tc-accent)", flexShrink: 0 }}
            />
            <span>
              Targets loaded from your last test result. Drill these to improve
              your weak spots!
            </span>
          </div>
        )}

        {/* ── Mobile sidebar toggle (visible only on ≤860px via CSS) ── */}
        <button
          className={`dr-sidebar-toggle${sidebarOpen ? " open" : ""}`}
          style={{ marginBottom: "0.75rem" }}
          onClick={() => setSidebarOpen((o) => !o)}
        >
          <SlidersHorizontal size={15} />
          {sidebarOpen ? "Hide Settings" : "Show Settings"}
          <ChevronDown size={13} />
        </button>

        <div className="dr-layout">
          {/* ── SETTINGS PANEL ── */}
          <div className={`dr-settings${sidebarOpen ? "" : " collapsed"}`}>
            <div className="dr-settings-head">
              <div className="dr-settings-title">
                <Settings size={14} /> Drill Settings
              </div>
            </div>

            {sidebarOpen && (
              <div className="dr-settings-body">
                {/* Targets */}
                <div className="dr-targets-area">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="dr-targets-title">
                      Target Keys / Pairs ({targets.length}/10)
                    </span>
                    {targets.length > 0 && (
                      <button className="dr-clear-btn" onClick={clearTargets}>
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="dr-chips">
                    {targets.length === 0 && (
                      <span className="dr-chips-empty">
                        No targets — select below or leave empty for general
                        drill
                      </span>
                    )}
                    {targets.map((t) => (
                      <TargetChip key={t} value={t} onRemove={removeTarget} />
                    ))}
                  </div>

                  <div className="dr-picker-tabs">
                    {["letters", "numbers", "symbols", "pairs", "custom"].map(
                      (tab) => (
                        <button
                          key={tab}
                          className={`dr-picker-tab${activeTab === tab ? " active" : ""}`}
                          onClick={() => setActiveTab(tab)}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ),
                    )}
                  </div>

                  {/* Language selector */}
                  <div>
                    <div
                      className="dr-targets-title"
                      style={{ marginBottom: ".4rem" }}
                    >
                      Language
                    </div>
                    <div className="dr-dur-row">
                      {SUPPORTED_LANGS.map((lang) => (
                        <button
                          key={lang.id}
                          className={`dr-dur-btn${language === lang.id ? " active" : ""}`}
                          onClick={() => {
                            setLanguage(lang.id);
                            generate();
                          }}
                        >
                          {lang.flag} {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Character grid */}
                  {activeTab === "letters" && (
                    <div className="dr-char-grid">
                      {language === "hindi" ? (
                        <>
                          <div className="dr-char-group-label">
                            Vowels (स्वर)
                          </div>
                          {HINDI_VOWELS.map((ch) => (
                            <button
                              key={ch}
                              className={`dr-char-btn${targets.includes(ch) ? " selected" : ""}`}
                              onClick={() =>
                                targets.includes(ch)
                                  ? removeTarget(ch)
                                  : addTarget(ch)
                              }
                            >
                              {ch}
                            </button>
                          ))}
                          <div className="dr-char-group-label">
                            Consonants (व्यंजन)
                          </div>
                          {HINDI_CONSONANTS.map((ch) => (
                            <button
                              key={ch}
                              className={`dr-char-btn${targets.includes(ch) ? " selected" : ""}`}
                              onClick={() =>
                                targets.includes(ch)
                                  ? removeTarget(ch)
                                  : addTarget(ch)
                              }
                            >
                              {ch}
                            </button>
                          ))}
                          <div className="dr-char-group-label">
                            Matras (मात्राएं)
                          </div>
                          {HINDI_MATRAS.map((ch) => (
                            <button
                              key={ch}
                              className={`dr-char-btn${targets.includes(ch) ? " selected" : ""}`}
                              onClick={() =>
                                targets.includes(ch)
                                  ? removeTarget(ch)
                                  : addTarget(ch)
                              }
                            >
                              {ch}
                            </button>
                          ))}
                        </>
                      ) : language === "spanish" ? (
                        SPANISH_LETTERS.map((ch) => (
                          <button
                            key={ch}
                            className={`dr-char-btn${targets.includes(ch) ? " selected" : ""}`}
                            onClick={() =>
                              targets.includes(ch)
                                ? removeTarget(ch)
                                : addTarget(ch)
                            }
                          >
                            {ch}
                          </button>
                        ))
                      ) : (
                        ALPHABET.map((ch) => (
                          <button
                            key={ch}
                            className={`dr-char-btn${targets.includes(ch) ? " selected" : ""}`}
                            onClick={() =>
                              targets.includes(ch)
                                ? removeTarget(ch)
                                : addTarget(ch)
                            }
                          >
                            {ch}
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "numbers" && (
                    <div className="dr-char-grid">
                      {NUMBERS.map((ch) => (
                        <button
                          key={ch}
                          className={`dr-char-btn${targets.includes(ch) ? " selected" : ""}`}
                          onClick={() =>
                            targets.includes(ch)
                              ? removeTarget(ch)
                              : addTarget(ch)
                          }
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeTab === "symbols" && (
                    <div className="dr-char-grid">
                      {SYMBOLS.map((ch) => (
                        <button
                          key={ch}
                          className={`dr-char-btn${targets.includes(ch) ? " selected" : ""}`}
                          onClick={() =>
                            targets.includes(ch)
                              ? removeTarget(ch)
                              : addTarget(ch)
                          }
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeTab === "pairs" && (
                    <div className="dr-common-pairs">
                      {COMMON_PAIRS.map((p) => (
                        <button
                          key={p}
                          className={`dr-pair-btn${targets.includes(p) ? " selected" : ""}`}
                          onClick={() =>
                            targets.includes(p) ? removeTarget(p) : addTarget(p)
                          }
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeTab === "custom" && (
                    <div className="dr-custom-row">
                      <input
                        className="dr-custom-inp"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCustom()}
                        placeholder="Type chars or pair…"
                        maxLength={4}
                      />
                      <button className="dr-add-btn" onClick={addCustom}>
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Drill Mode */}
                <div>
                  <div
                    className="dr-targets-title"
                    style={{ marginBottom: ".4rem" }}
                  >
                    Drill Mode
                  </div>
                  <div className="dr-mode-grid">
                    {DRILL_MODES.map((m) => (
                      <button
                        key={m.id}
                        className={`dr-mode-btn${drillMode === m.id ? " active" : ""}`}
                        onClick={() => setDrillMode(m.id)}
                      >
                        <m.icon size={14} /> {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <div
                    className="dr-targets-title"
                    style={{ marginBottom: ".4rem" }}
                  >
                    Duration
                  </div>
                  <div className="dr-dur-row">
                    {DURATIONS_DRILL.map((d) => (
                      <button
                        key={d.value}
                        className={`dr-dur-btn${duration === d.value ? " active" : ""}`}
                        onClick={() => {
                          setDuration(d.value);
                          setTimeLeft(d.value);
                        }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mixed Case toggle */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: ".4rem",
                  }}
                >
                  <div className="dr-opt-row">
                    <div className="dr-opt-lbl">
                      <CaseSensitive size={13} /> Mixed Case (Lower + Upper)
                    </div>
                    <div
                      className={`tc-toggle${caps ? " tc-toggle-on" : ""}`}
                      onClick={() => setCaps((c) => !c)}
                      role="switch"
                    />
                  </div>
                </div>

                <button
                  className="tc-btn tc-btn-acc"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={generate}
                >
                  <RefreshCw size={14} /> Generate New Drill
                </button>
              </div>
            )}
          </div>

          {/* ── PRACTICE AREA ── */}
          <div className="dr-practice">
            {/* Live stats */}
            <div className="dr-live-bar">
              <div className="dr-live-stat">
                <Zap size={14} style={{ color: "var(--tc-accent)" }} />
                <span className="dr-live-val">
                  {running && startTime
                    ? calcWPM(
                        countCorrect(userInput, testText),
                        (Date.now() - startTime) / 1000,
                      )
                    : done && results
                      ? results.wpm
                      : 0}
                </span>
                <span className="dr-live-lbl">WPM</span>
              </div>
              <div className="dr-live-stat">
                <Target size={14} style={{ color: "var(--tc-green)" }} />
                <span className="dr-live-val">
                  {running && userInput.length
                    ? calcAccuracy(
                        countCorrect(userInput, testText),
                        userInput.length,
                      )
                    : done && results
                      ? results.accuracy
                      : 0}
                  %
                </span>
                <span className="dr-live-lbl">Accuracy</span>
              </div>
              <ProgressRing
                value={timeLeft}
                max={duration}
                size={60}
                stroke={5}
                color={timerColor}
              />
              <div className="dr-live-stat">
                <AlertCircle size={14} style={{ color: "var(--tc-red)" }} />
                <span className="dr-live-val">
                  {running
                    ? userInput.length - countCorrect(userInput, testText)
                    : done && results
                      ? results.mistakes
                      : 0}
                </span>
                <span className="dr-live-lbl">Errors</span>
              </div>
              <div className="dr-live-stat">
                <Hash size={14} style={{ color: "var(--tc-purple)" }} />
                <span className="dr-live-val">{targets.length || "—"}</span>
                <span className="dr-live-lbl">Targets</span>
              </div>
            </div>

            {/* Typing area */}
            <div className="dr-type-area" ref={typeAreaRef}>
              <div className="dr-text-disp">{renderedText}</div>
              <textarea
                ref={inputRef}
                className="dr-input"
                value={userInput}
                onChange={handleInput}
                placeholder={
                  targets.length
                    ? `Drill: ${targets.join(", ")} — start typing…`
                    : "Start typing to begin…"
                }
                disabled={done}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="dr-actions">
              <button className="tc-btn tc-btn-sec" onClick={generate}>
                <RefreshCw size={14} /> New
              </button>
              <button
                className="tc-btn tc-btn-acc"
                onClick={() => {
                  setTargets((t) => shuffle(t));
                  generate();
                }}
              >
                <Shuffle size={14} /> Shuffle
              </button>
            </div>

            {/* Results */}
            {done && results && (
              <div className="dr-results">
                <div className="dr-res-title">
                  <CheckCircle size={16} /> Drill Complete!
                </div>
                <div className="dr-stat-grid">
                  <StatCard
                    icon={Zap}
                    label="WPM"
                    value={results.wpm}
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
                </div>
                {topErrors.length > 0 && (
                  <div style={{ marginBottom: ".75rem" }}>
                    <div className="tc-chart-ttl">
                      <AlertCircle size={12} /> Key Errors
                    </div>
                    <div className="dr-err-grid">
                      {topErrors.map(([k, v]) => (
                        <span key={k} className="dr-err-chip">
                          "{k}" ×{v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div
                  style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}
                >
                  <button className="tc-btn tc-btn-acc" onClick={generate}>
                    <Repeat size={14} /> Try Again
                  </button>
                  <button
                    className="tc-btn tc-btn-sec"
                    onClick={() => navigate("/")}
                  >
                    <ArrowLeft size={14} /> Back to Test
                  </button>
                </div>
              </div>
            )}

            {/* History */}
            {historyResults.length > 0 && (
              <div className="dr-history">
                <div className="tc-chart-ttl" style={{ marginBottom: ".5rem" }}>
                  <BarChart2 size={13} /> Drill History
                </div>
                <div
                  style={{
                    background: "var(--tc-bg2)",
                    border: "1px solid var(--tc-border)",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <div className="dr-hist-head">
                    <span>Targets</span>
                    <span>WPM</span>
                    <span>Acc</span>
                    <span>Mode</span>
                    <span>Date</span>
                  </div>
                  {historyResults.slice(0, 8).map((h, i) => (
                    <div key={i} className="dr-hist-row">
                      <div className="dr-hist-targets">
                        {(h.targets || []).slice(0, 4).map((t, j) => (
                          <span key={j} className="dr-hist-t">
                            {t}
                          </span>
                        ))}
                        {(h.targets || []).length > 4 && (
                          <span className="dr-hist-t">
                            +{h.targets.length - 4}
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontWeight: 700,
                          color: "var(--tc-accent)",
                          fontFamily: "JetBrains Mono,monospace",
                        }}
                      >
                        {h.wpm}
                      </span>
                      <span>{h.accuracy}%</span>
                      <span>{h.drillMode}</span>
                      <span>{new Date(h.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
