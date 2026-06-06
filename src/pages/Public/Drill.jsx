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
  ChevronLeft,
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

// ── MIXED CASE HELPER ──────────────────────────────────────────────────────
function applyMixedCase(text) {
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
      // Randomly capitalize some words for natural variation (15% chance)
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

      if (shouldCapitalize) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      } else {
        return word.toLowerCase();
      }
    }
  });

  return processedWords.join("");
}

// ── GENERATE DRILL TEXT WITH INFINITE SUPPORT ──────────────────────────────
function generateDrillText(targets, drillMode, caps, language) {
  const langData = SUPPORTED_LANGS.find((l) => l.id === language);
  const wordPool = langData?.words || FB.english.words;

  if (!targets.length) {
    let text = shuffle(wordPool).slice(0, 80).join(" ");
    if (caps && language !== "hindi") {
      // Hindi doesn't have case sensitivity
      text = applyMixedCase(text);
    }
    return text;
  }

  let words = [];

  targets.forEach((t) => {
    // From drill fallback (language-specific)
    if (DRILL_FB[language]?.[t]) {
      words = words.concat(DRILL_FB[language][t].slice(0, 10));
    }
    // From words containing the target
    const containing = wordPool.filter((w) =>
      w.toLowerCase().includes(t.toLowerCase()),
    );
    words = words.concat(containing.slice(0, 8));
  });

  // If pairs mode, generate sequences
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

  // Apply mixed case only for languages that support it
  if (caps && language !== "hindi") {
    result = applyMixedCase(result);
  }

  return result;
}

// ── INFINITE TEXT GENERATOR ────────────────────────────────────────────────
const INFINITE_DRILL_GENERATOR = {
  generateMoreText: function (targets, drillMode, caps, language) {
    return generateDrillText(targets, drillMode, caps, language);
  },

  ensureBuffer: function (
    currentText,
    userInputLength,
    targets,
    drillMode,
    caps,
    language,
  ) {
    const remainingChars = currentText.length - userInputLength;
    if (remainingChars < 300) {
      const newChunk = this.generateMoreText(
        targets,
        drillMode,
        caps,
        language,
      );
      return currentText + " " + newChunk;
    }
    return currentText;
  },
};

// ── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`dr-stat tc-c-${color}`}>
    <div className="dr-stat-icon">
      <Icon size={16} />
    </div>
    <div className="dr-stat-val">{value}</div>
    <div className="dr-stat-lbl">{label}</div>
  </div>
);

// ── PROGRESS RING ────────────────────────────────────────────────────────────
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

// ── TARGET CHIP ──────────────────────────────────────────────────────────────
const TargetChip = ({ value, onRemove }) => (
  <div className="dr-chip">
    <span className="dr-chip-val">{value === " " ? "⎵" : value}</span>
    <button className="dr-chip-rm" onClick={() => onRemove(value)}>
      <X size={10} />
    </button>
  </div>
);

// Add these language configurations at the top with other constants:

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

// Add Hindi-specific character sets
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

// Spanish-specific characters
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

// Update the language selection in the component state

// ── MAIN DRILLS PAGE ─────────────────────────────────────────────────────────
export default function Drill() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Targets (letters/pairs) to drill
  const [targets, setTargets] = useState([]);
  const [drillMode, setDrillMode] = useState("pairs");
  const [duration, setDuration] = useState(60);
  const [caps, setCaps] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showSettings, setShowSettings] = useState(true);
  const [activeTab, setActiveTab] = useState("letters");
  const [language, setLanguage] = useState("english");

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

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const wpmRef = useRef(null);
  const userInputRef = useRef("");
  const testTextRef = useRef("");
  const startRef = useRef(null);
  const wpmHistRef = useRef([]);
  const endCalledRef = useRef(false);
  const audioCtx = useRef(null);

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

  // Load targets from navigation state (from main page results)
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
        const keys = FMAP[state.weakFinger] || [];
        keys.forEach((k) => {
          if (!incoming.includes(k)) incoming.push(k);
        });
      }
      if (incoming.length) {
        setTargets(incoming.slice(0, 10));
        setShowSettings(true);
      }
    }
  }, [location.state]);

  const generate = useCallback(() => {
    let text = generateDrillText(targets, drillMode, caps, language);
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

  const additionalCSS = `
  .dr-char-group-label {
    width: 100%;
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--tc-accent);
    margin: 0.5rem 0 0.25rem 0;
    padding-left: 0.2rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .dr-char-group-label:first-of-type {
    margin-top: 0;
  }
  
  /* Better support for Hindi characters */
  .dr-char-btn {
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  /* Ensure Hindi text displays properly */
  .dr-text-line, .dr-ch-ok, .dr-ch-err, .dr-ch-pend {
    font-size: 1rem;
  }
  
  /* For Hindi, use a font that supports Devanagari */
  .dr-root.language-hindi .dr-text-line,
  .dr-root.language-hindi .dr-ch-ok,
  .dr-root.language-hindi .dr-ch-err,
  .dr-root.language-hindi .dr-ch-pend {
    font-family: "Noto Sans Devanagari", "Mangal", "Nirmala UI", "JetBrains Mono", monospace;
  }
  
  /* For Spanish, ensure ñ and accented characters display properly */
  .dr-root.language-spanish .dr-text-line,
  .dr-root.language-spanish .dr-ch-ok,
  .dr-root.language-spanish .dr-ch-err,
  .dr-root.language-spanish .dr-ch-pend {
    font-family: "JetBrains Mono", monospace;
  }
`;

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

    // INFINITE TEXT: Check if we're near the end and generate more
    const remainingChars = testText.length - val.length;
    if (remainingChars < 300 && !done) {
      const newChunk = INFINITE_DRILL_GENERATOR.generateMoreText(
        targets,
        drillMode,
        caps,
        language,
      );
      setTestText((prev) => prev + " " + newChunk);
    }

    if (val.length >= testText.length && !done && !endCalledRef.current) {
      const newChunk = INFINITE_DRILL_GENERATOR.generateMoreText(
        targets,
        drillMode,
        caps,
        language,
      );
      setTestText((prev) => prev + " " + newChunk);
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

    // Save to history
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

  // ── 5-LINE DISPLAY WITH FOCUS ON MIDDLE 3 LINES ──
  const renderedText = useMemo(() => {
    if (!testText) return null;

    const text = testText;

    // Function to split text into lines at word boundaries
    const splitIntoLines = (str, maxLineLength = 75) => {
      const lines = [];
      let currentLine = "";
      const words = str.split(/(\s+)/);

      for (let i = 0; i < words.length; i++) {
        const word = words[i];

        if (word.match(/^\s+$/)) {
          if ((currentLine + word).length <= maxLineLength) {
            currentLine += word;
          } else {
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

    const lines = splitIntoLines(text, 75);
    if (lines.length === 0) return null;

    // Find current line
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

    // Show exactly 5 lines with current line in middle
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
    for (let i = 0; i < emptyLinesNeeded; i++) visibleLines.push([]);

    // Calculate offset
    let offset = 0;
    for (let i = 0; i < startLineIndex; i++) {
      offset += lines[i]?.length || 0;
    }

    // Render
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
          const ch = line[charIdx];
          const absoluteIndex = globalIndex + charIdx;
          let cls = "dr-ch-pend";
          if (absoluteIndex < userInput.length) {
            cls = userInput[absoluteIndex] === ch ? "dr-ch-ok" : "dr-ch-err";
          }
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
        globalIndex += line.length;
      }
    });

    return renderedChars;
  }, [testText, userInput]);

  const topErrors = Object.entries(errorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div
      className={`dr-root${isDarkMode ? " dark" : " light"} language-${language}`}
    >
      <style>{`
        .dr-root.dark {
          --tc-bg: #0a0b0f;
          --tc-bg2: #11131a;
          --tc-bg3: #181b25;
          --tc-border: #252836;
          --tc-text: #e8eaf6;
          --tc-text2: #8b90a4;
          --tc-text3: #555b6e;
          --tc-accent: #7c6af7;
          --tc-accent2: #5eead4;
          --tc-red: #ef4444;
          --tc-green: #10b981;
          --tc-yellow: #f59e0b;
          --tc-blue: #3b82f6;
          --tc-purple: #a855f7;
          --tc-pend: #555b6e;
          --tc-cur: #7c6af7;
        }
        .dr-root.light {
          --tc-bg: #f4f5fb;
          --tc-bg2: #fff;
          --tc-bg3: #eef0f8;
          --tc-border: #d8dbe8;
          --tc-text: #1a1c2e;
          --tc-text2: #5a5f78;
          --tc-text3: #9096b0;
          --tc-accent: #5b4ee8;
          --tc-accent2: #0d9488;
          --tc-red: #dc2626;
          --tc-green: #059669;
          --tc-yellow: #d97706;
          --tc-blue: #2563eb;
          --tc-purple: #9333ea;
          --tc-pend: #9096b0;
          --tc-cur: #5b4ee8;
        }
        
        .dr-root {
          min-height: 100vh;
          background: var(--tc-bg);
          color: var(--tc-text);
          font-family: "Syne", sans-serif;
        }
        
        .dr-page { max-width: 1200px; margin: 0 auto; padding: 1.5rem 1.2rem; }
        
        /* Character styles */
        .dr-ch-ok { color: var(--tc-green); }
        .dr-ch-err { color: var(--tc-red); text-decoration: underline wavy; }
        .dr-ch-pend { color: var(--tc-text3); }
        .dr-ch-cur { position: relative; }
        .dr-ch-cur::before {
          content: "";
          position: absolute;
          left: -1px;
          top: 3px;
          bottom: 3px;
          width: 2px;
          background: var(--tc-cur);
          border-radius: 2px;
          animation: dr-blink 1s step-end infinite;
        }
        @keyframes dr-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        /* Line display styles */
        .dr-text-line {
          display: block;
          width: 100%;
          margin-bottom: 0.25rem;
          font-family: "JetBrains Mono", monospace;
          font-size: 1.05rem;
          line-height: 1.8;
          white-space: pre-wrap;
          word-break: normal;
          letter-spacing: normal;
        }
        .dr-text-line span {
          display: inline;
          white-space: pre;
          letter-spacing: normal;
        }
        .dr-empty-line {
          height: 1.8rem;
          opacity: 0.3;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          border-top: 1px dashed var(--tc-border);
          margin: 0.25rem 0;
        }
        .dr-placeholder-dots {
          color: var(--tc-text3);
          font-size: 0.8rem;
          opacity: 0.5;
          font-family: "JetBrains Mono", monospace;
        }
        
        /* Typing area */
        .dr-type-area {
          background: var(--tc-bg2);
          border: 1px solid var(--tc-border);
          border-radius: 12px;
          padding: 1.2rem;
          transition: border-color 0.2s;
        }
        .dr-type-area:focus-within {
          border-color: var(--tc-accent);
        }
        .dr-text-disp {
          font-family: "JetBrains Mono", monospace;
          font-size: 1.05rem;
          line-height: 2;
          margin-bottom: 0.8rem;
          user-select: none;
          word-break: normal;
          white-space: normal;
          min-height: 250px;
          display: block;
          width: 100%;
        }
        .dr-input {
          width: 100%;
          padding: 0.7rem 1rem;
          background: var(--tc-bg3);
          border: 1px solid var(--tc-border);
          border-radius: 9px;
          color: var(--tc-text);
          font-family: "JetBrains Mono", monospace;
          font-size: 0.95rem;
          resize: vertical;
          transition: border-color 0.2s;
          outline: none;
          box-sizing: border-box;
        }
        .dr-input:focus { border-color: var(--tc-accent); }
        .dr-input:disabled { opacity: 0.5; cursor: not-allowed; }
        
        /* Rest of the existing drill styles */
        .dr-layout { display: grid; grid-template-columns: 300px 1fr; gap: 1.2rem; }
        @media (max-width: 860px) { .dr-layout { grid-template-columns: 1fr; } }
        
        .dr-settings { background: var(--tc-bg2); border: 1px solid var(--tc-border); border-radius: 14px; overflow: hidden; }
        .dr-settings-head { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: var(--tc-bg3); border-bottom: 1px solid var(--tc-border); }
        .dr-settings-title { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; font-weight: 800; }
        .dr-settings-body { padding: 0.9rem 1rem; display: flex; flex-direction: column; gap: 1rem; }
        
        .dr-targets-area { display: flex; flex-direction: column; gap: 0.6rem; }
        .dr-targets-title { font-size: 0.7rem; font-weight: 800; color: var(--tc-text3); text-transform: uppercase; letter-spacing: 0.07em; }
        .dr-chips { display: flex; flex-wrap: wrap; gap: 0.3rem; min-height: 32px; padding: 0.35rem; background: var(--tc-bg3); border: 1px solid var(--tc-border); border-radius: 8px; }
        .dr-chips-empty { font-size: 0.72rem; color: var(--tc-text3); padding: 0.1rem 0.2rem; }
        .dr-chip { display: flex; align-items: center; gap: 0.25rem; padding: 0.2rem 0.5rem; border-radius: 5px; background: rgba(124,106,247,0.15); border: 1px solid rgba(124,106,247,0.3); }
        .dr-chip-val { font-family: "JetBrains Mono", monospace; font-size: 0.8rem; font-weight: 700; color: var(--tc-accent); }
        .dr-chip-rm { background: transparent; border: none; color: var(--tc-text3); cursor: pointer; display: flex; align-items: center; padding: 1px; border-radius: 3px; }
        .dr-chip-rm:hover { color: var(--tc-red); }
        
        .dr-picker-tabs { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
        .dr-picker-tab { padding: 0.2rem 0.55rem; border-radius: 6px; border: 1px solid var(--tc-border); background: var(--tc-bg3); color: var(--tc-text3); font-family: inherit; font-size: 0.68rem; font-weight: 700; cursor: pointer; }
        .dr-picker-tab.active { background: var(--tc-accent); border-color: var(--tc-accent); color: #fff; }
        
        .dr-char-grid { display: flex; flex-wrap: wrap; gap: 0.25rem; max-height: 150px; overflow-y: auto; }
        .dr-char-btn { width: 26px; height: 26px; border-radius: 5px; border: 1px solid var(--tc-border); background: var(--tc-bg3); color: var(--tc-text2); font-family: "JetBrains Mono", monospace; font-size: 0.68rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .dr-char-btn:hover { border-color: var(--tc-accent); color: var(--tc-accent); }
        .dr-char-btn.selected { background: var(--tc-accent); border-color: var(--tc-accent); color: #fff; }
        
        .dr-common-pairs { display: flex; flex-wrap: wrap; gap: 0.25rem; max-height: 130px; overflow-y: auto; }
        .dr-pair-btn { padding: 0.18rem 0.45rem; border-radius: 5px; border: 1px solid var(--tc-border); background: var(--tc-bg3); color: var(--tc-text2); font-family: "JetBrains Mono", monospace; font-size: 0.7rem; font-weight: 700; cursor: pointer; }
        .dr-pair-btn:hover, .dr-pair-btn.selected { border-color: var(--tc-accent); color: var(--tc-accent); }
        
        .dr-custom-row { display: flex; gap: 0.4rem; }
        .dr-custom-inp { flex: 1; padding: 0.38rem 0.65rem; border-radius: 7px; border: 1px solid var(--tc-border); background: var(--tc-bg3); color: var(--tc-text); font-family: "JetBrains Mono", monospace; font-size: 0.8rem; outline: none; }
        .dr-custom-inp:focus { border-color: var(--tc-accent); }
        .dr-add-btn { padding: 0.38rem 0.75rem; border-radius: 7px; border: none; background: var(--tc-accent); color: #fff; font-family: inherit; font-size: 0.78rem; font-weight: 700; cursor: pointer; }
        
        .dr-mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.3rem; }
        .dr-mode-btn { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; padding: 0.5rem 0.3rem; border-radius: 8px; border: 1px solid var(--tc-border); background: var(--tc-bg3); color: var(--tc-text2); font-family: inherit; font-size: 0.65rem; font-weight: 700; cursor: pointer; }
        .dr-mode-btn:hover, .dr-mode-btn.active { border-color: var(--tc-accent); color: var(--tc-accent); }
        
        .dr-dur-row { display: flex; gap: 0.3rem; flex-wrap: wrap; }
        .dr-dur-btn { padding: 0.25rem 0.55rem; border-radius: 6px; border: 1px solid var(--tc-border); background: var(--tc-bg3); color: var(--tc-text2); font-family: inherit; font-size: 0.72rem; font-weight: 700; cursor: pointer; }
        .dr-dur-btn:hover, .dr-dur-btn.active { background: var(--tc-accent); border-color: var(--tc-accent); color: #fff; }
        
        .dr-opt-row { display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; color: var(--tc-text2); }
        .dr-opt-lbl { display: flex; align-items: center; gap: 0.35rem; }
        
        .dr-practice { display: flex; flex-direction: column; gap: 1rem; }
        .dr-live-bar { display: flex; align-items: center; justify-content: space-around; flex-wrap: wrap; gap: 0.75rem; background: var(--tc-bg2); border: 1px solid var(--tc-border); border-radius: 12px; padding: 0.8rem 1rem; }
        .dr-live-stat { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; }
        .dr-live-val { font-family: "JetBrains Mono", monospace; font-size: 1.5rem; font-weight: 700; color: var(--tc-text); }
        .dr-live-lbl { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: var(--tc-text3); }
        
        .dr-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        
        .dr-results { background: var(--tc-bg2); border: 1px solid var(--tc-border); border-radius: 14px; padding: 1.25rem; animation: tc-slideUp 0.3s ease; }
        .dr-res-title { display: flex; align-items: center; gap: 0.45rem; font-size: 1rem; font-weight: 800; color: var(--tc-green); margin-bottom: 1rem; }
        .dr-stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.6rem; margin-bottom: 1rem; }
        .dr-stat { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; padding: 0.7rem 0.6rem; border-radius: 10px; border: 1px solid var(--tc-border); background: var(--tc-bg3); }
        .dr-stat-icon { opacity: 0.7; }
        .dr-stat-val { font-family: "JetBrains Mono", monospace; font-size: 1.2rem; font-weight: 700; }
        .dr-stat-lbl { font-size: 0.6rem; font-weight: 700; color: var(--tc-text3); text-transform: uppercase; letter-spacing: 0.07em; }
        
        .dr-err-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .dr-err-chip { padding: 0.22rem 0.55rem; border-radius: 5px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); color: var(--tc-red); font-family: "JetBrains Mono", monospace; font-size: 0.78rem; font-weight: 700; }
        
        .dr-history { margin-top: 1rem; }
        .dr-hist-head { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr; padding: 0.45rem 0.8rem; background: var(--tc-bg3); border-radius: 8px 8px 0 0; font-size: 0.62rem; font-weight: 800; color: var(--tc-text3); text-transform: uppercase; }
        .dr-hist-row { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr; padding: 0.5rem 0.8rem; border-top: 1px solid var(--tc-border); font-size: 0.75rem; color: var(--tc-text2); }
        .dr-hist-row:hover { background: var(--tc-bg3); }
        .dr-hist-targets { display: flex; flex-wrap: wrap; gap: 2px; }
        .dr-hist-t { padding: 1px 5px; border-radius: 3px; background: rgba(124,106,247,0.12); color: var(--tc-accent); font-family: "JetBrains Mono", monospace; font-size: 0.65rem; }
        
        .dr-motiv { display: flex; align-items: center; gap: 0.6rem; padding: 0.65rem 0.9rem; background: linear-gradient(135deg, rgba(124,106,247,0.08), rgba(94,234,212,0.05)); border: 1px solid var(--tc-accent); border-radius: 10px; font-size: 0.8rem; color: var(--tc-text2); margin-bottom: 0.8rem; }
        .dr-clear-btn { font-size: 0.65rem; font-weight: 700; padding: 0.18rem 0.45rem; border-radius: 5px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: var(--tc-red); cursor: pointer; margin-left: auto; }
        .dr-clear-btn:hover { background: rgba(239,68,68,0.2); }
        
        .tc-btn { display: flex; align-items: center; gap: 0.35rem; padding: 0.5rem 1.1rem; border-radius: 9px; border: none; font-family: inherit; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
        .tc-btn-sec { background: var(--tc-bg3); border: 1px solid var(--tc-border); color: var(--tc-text2); }
        .tc-btn-sec:hover { border-color: var(--tc-accent); color: var(--tc-accent); }
        .tc-btn-acc { background: linear-gradient(135deg, var(--tc-accent), var(--tc-purple)); color: #fff; }
        .tc-btn-acc:hover { opacity: 0.88; transform: translateY(-1px); }
        .tc-toggle { width: 36px; height: 19px; border-radius: 10px; background: var(--tc-bg3); border: 1px solid var(--tc-border); position: relative; cursor: pointer; }
        .tc-toggle::after { content: ""; position: absolute; width: 13px; height: 13px; border-radius: 50%; background: var(--tc-text3); top: 2px; left: 2px; transition: transform 0.2s; }
        .tc-toggle-on { background: var(--tc-accent); border-color: var(--tc-accent); }
        .tc-toggle-on::after { transform: translateX(17px); background: #fff; }
        .tc-pring-bg { stroke: var(--tc-border); }
        .tc-pring-txt { font-family: "JetBrains Mono", monospace; font-size: 11px; font-weight: 700; fill: var(--tc-text); }
        .tc-chart-ttl { display: flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; font-weight: 700; color: var(--tc-text2); text-transform: uppercase; margin-bottom: 0.65rem; }
        
        @keyframes tc-slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="dr-page">
        {location.state?.weakPair || location.state?.weakFinger ? (
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
        ) : null}

        <div className="dr-layout">
          {/* Settings Panel */}
          {showSettings && (
            <div className="dr-settings">
              <div className="dr-settings-head">
                <div className="dr-settings-title">
                  <Settings size={14} /> Drill Settings
                </div>
              </div>
              <div className="dr-settings-body">
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

                  {activeTab === "letters" && (
                    <div className="dr-char-grid">
                      {language === "hindi" ? (
                        // Hindi characters
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
                        // Spanish characters with ñ and accents
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
                        // English alphabet
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
            </div>
          )}

          {/* Practice Area */}
          <div className="dr-practice">
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

            {/* Typing area with 5-line display */}
            <div className="dr-type-area">
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
              {!showSettings && (
                <button
                  className="tc-btn tc-btn-sec"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings size={14} /> Settings
                </button>
              )}
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
