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

// ── GENERATE DRILL TEXT ──────────────────────────────────────────────────────
function generateDrillText(targets, drillMode, caps) {
  if (!targets.length) {
    return shuffle(FB.english.words).slice(0, 40).join(" ");
  }

  let words = [];

  targets.forEach((t) => {
    // From drill fallback
    if (DRILL_FB[t]) {
      words = words.concat(DRILL_FB[t].slice(0, 10));
    }
    // From english words containing the target
    const containing = FB.english.words.filter((w) =>
      w.includes(t.toLowerCase()),
    );
    words = words.concat(containing.slice(0, 8));
  });

  // If pairs mode, generate sequences
  if (drillMode === "pairs") {
    targets.forEach((pair) => {
      if (pair.length >= 2) {
        for (let i = 0; i < 12; i++) {
          const base =
            FB.english.words[
              Math.floor(Math.random() * FB.english.words.length)
            ];
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
          FB.english.words.filter((w) => w.includes(ch))[i % 5] || ch.repeat(3);
        row.push(neighbor);
      }
      words = words.concat(row);
    });
  }

  if (drillMode === "speed") {
    // Short rapid-fire words only
    words = words.filter((w) => w.length <= 5);
    if (words.length < 20)
      words = words.concat(
        shuffle(FB.english.words.filter((w) => w.length <= 5)).slice(0, 20),
      );
  }

  if (!words.length) words = shuffle(FB.english.words).slice(0, 30);
  let result = shuffle([...new Set(words)])
    .slice(0, 60)
    .join(" ");
  if (caps) result = result.toUpperCase();
  return result;
}

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
  const [activeTab, setActiveTab] = useState("letters"); // letters | numbers | symbols | pairs | custom

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
        // Map finger to its keys
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
    const text = generateDrillText(targets, drillMode, caps);
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
  }, [targets, drillMode, caps, duration]);

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
    const last = val[val.length - 1],
      exp = testText[val.length - 1];
    if (last !== undefined) {
      playClick();
      if (last !== exp && exp)
        setErrorMap((m) => ({ ...m, [exp]: (m[exp] || 0) + 1 }));
    }
    if (val.length >= testText.length && !done && !endCalledRef.current)
      endTest();
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

  const renderedText = useMemo(() => {
    return (testText || "")
      .split("")
      .slice(0, 500)
      .map((ch, i) => {
        let cls = "tc-ch-pend";
        if (i < userInput.length)
          cls = userInput[i] === ch ? "tc-ch-ok" : "tc-ch-err";
        const cur = i === userInput.length;
        return (
          <span key={i} className={`${cls}${cur ? " tc-ch-cur" : ""}`}>
            {ch === "\n" ? "↵\n" : ch}
          </span>
        );
      });
  }, [testText, userInput]);

  const topErrors = Object.entries(errorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className={`tc-root${isDarkMode ? " dark" : " light"}`}>
      <style>{`
        .dr-page { max-width:1100px; margin:0 auto; padding:1.5rem 1.2rem; }
        .dr-header { display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; }
        .dr-header-title { display:flex; align-items:center; gap:.6rem; font-size:1.5rem; font-weight:800; }
        .dr-header-title svg { color:var(--tc-accent); }
        .dr-back-btn { display:flex; align-items:center; gap:.35rem; padding:.4rem .8rem; border-radius:9px;
          background:var(--tc-bg3); border:1px solid var(--tc-border); color:var(--tc-text2);
          font-family:inherit; font-size:.8rem; font-weight:700; cursor:pointer; transition:all .2s; }
        .dr-back-btn:hover { border-color:var(--tc-accent); color:var(--tc-accent); }
        .dr-layout { display:grid; grid-template-columns:300px 1fr; gap:1.2rem; }
        @media(max-width:860px){ .dr-layout{grid-template-columns:1fr;} }

        /* Settings Panel */
        .dr-settings { background:var(--tc-bg2); border:1px solid var(--tc-border); border-radius:14px; overflow:hidden; }
        .dr-settings-head { display:flex; align-items:center; justify-content:space-between;
          padding:.75rem 1rem; background:var(--tc-bg3); border-bottom:1px solid var(--tc-border); }
        .dr-settings-title { display:flex; align-items:center; gap:.4rem; font-size:.85rem; font-weight:800; }
        .dr-settings-body { padding:.9rem 1rem; display:flex; flex-direction:column; gap:1rem; }

        /* Target selector */
        .dr-targets-area { display:flex; flex-direction:column; gap:.6rem; }
        .dr-targets-title { font-size:.7rem; font-weight:800; color:var(--tc-text3); text-transform:uppercase; letter-spacing:.07em; }
        .dr-chips { display:flex; flex-wrap:wrap; gap:.3rem; min-height:32px; padding:.35rem;
          background:var(--tc-bg3); border:1px solid var(--tc-border); border-radius:8px; }
        .dr-chips-empty { font-size:.72rem; color:var(--tc-text3); padding:.1rem .2rem; }
        .dr-chip { display:flex; align-items:center; gap:.25rem; padding:.2rem .5rem; border-radius:5px;
          background:rgba(124,106,247,.15); border:1px solid rgba(124,106,247,.3); animation:dr-pop .15s ease; }
        @keyframes dr-pop { from{transform:scale(.7);opacity:0} to{transform:scale(1);opacity:1} }
        .dr-chip-val { font-family:'JetBrains Mono',monospace; font-size:.8rem; font-weight:700; color:var(--tc-accent); }
        .dr-chip-rm { background:transparent; border:none; color:var(--tc-text3); cursor:pointer; display:flex; align-items:center; padding:1px; border-radius:3px; }
        .dr-chip-rm:hover { color:var(--tc-red); }

        /* Char picker tabs */
        .dr-picker-tabs { display:flex; gap:.3rem; flex-wrap:wrap; margin-bottom:.5rem; }
        .dr-picker-tab { padding:.2rem .55rem; border-radius:6px; border:1px solid var(--tc-border);
          background:var(--tc-bg3); color:var(--tc-text3); font-family:inherit; font-size:.68rem;
          font-weight:700; cursor:pointer; transition:all .15s; }
        .dr-picker-tab.active { background:var(--tc-accent); border-color:var(--tc-accent); color:#fff; }

        /* Char grid */
        .dr-char-grid { display:flex; flex-wrap:wrap; gap:.25rem; max-height:130px; overflow-y:auto; }
        .dr-char-btn { width:26px; height:26px; border-radius:5px; border:1px solid var(--tc-border);
          background:var(--tc-bg3); color:var(--tc-text2); font-family:'JetBrains Mono',monospace;
          font-size:.68rem; font-weight:700; cursor:pointer; transition:all .12s;
          display:flex; align-items:center; justify-content:center; }
        .dr-char-btn:hover { border-color:var(--tc-accent); color:var(--tc-accent); }
        .dr-char-btn.selected { background:var(--tc-accent); border-color:var(--tc-accent); color:#fff; }
        .dr-common-pairs { display:flex; flex-wrap:wrap; gap:.25rem; max-height:130px; overflow-y:auto; }
        .dr-pair-btn { padding:.18rem .45rem; border-radius:5px; border:1px solid var(--tc-border);
          background:var(--tc-bg3); color:var(--tc-text2); font-family:'JetBrains Mono',monospace;
          font-size:.7rem; font-weight:700; cursor:pointer; transition:all .12s; }
        .dr-pair-btn:hover { border-color:var(--tc-accent); color:var(--tc-accent); }
        .dr-pair-btn.selected { background:var(--tc-accent); border-color:var(--tc-accent); color:#fff; }

        /* Custom input */
        .dr-custom-row { display:flex; gap:.4rem; }
        .dr-custom-inp { flex:1; padding:.38rem .65rem; border-radius:7px; border:1px solid var(--tc-border);
          background:var(--tc-bg3); color:var(--tc-text); font-family:'JetBrains Mono',monospace;
          font-size:.8rem; outline:none; }
        .dr-custom-inp:focus { border-color:var(--tc-accent); }
        .dr-add-btn { padding:.38rem .75rem; border-radius:7px; border:none; background:var(--tc-accent);
          color:#fff; font-family:inherit; font-size:.78rem; font-weight:700; cursor:pointer; }

        /* Mode pills */
        .dr-mode-grid { display:grid; grid-template-columns:1fr 1fr; gap:.3rem; }
        .dr-mode-btn { display:flex; flex-direction:column; align-items:center; gap:.2rem; padding:.5rem .3rem;
          border-radius:8px; border:1px solid var(--tc-border); background:var(--tc-bg3);
          color:var(--tc-text2); font-family:inherit; font-size:.65rem; font-weight:700; cursor:pointer; transition:all .15s; }
        .dr-mode-btn:hover { border-color:var(--tc-accent); color:var(--tc-accent); }
        .dr-mode-btn.active { background:rgba(124,106,247,.12); border-color:var(--tc-accent); color:var(--tc-accent); }

        /* Duration pills */
        .dr-dur-row { display:flex; gap:.3rem; flex-wrap:wrap; }
        .dr-dur-btn { padding:.25rem .55rem; border-radius:6px; border:1px solid var(--tc-border);
          background:var(--tc-bg3); color:var(--tc-text2); font-family:inherit; font-size:.72rem;
          font-weight:700; cursor:pointer; transition:all .15s; }
        .dr-dur-btn:hover,.dr-dur-btn.active { background:var(--tc-accent); border-color:var(--tc-accent); color:#fff; }

        /* Options toggles */
        .dr-opt-row { display:flex; align-items:center; justify-content:space-between; font-size:.78rem; color:var(--tc-text2); }
        .dr-opt-lbl { display:flex; align-items:center; gap:.35rem; }

        /* Main practice area */
        .dr-practice { display:flex; flex-direction:column; gap:1rem; }
        .dr-live-bar { display:flex; align-items:center; justify-content:space-around; flex-wrap:wrap; gap:.75rem;
          background:var(--tc-bg2); border:1px solid var(--tc-border); border-radius:12px; padding:.8rem 1rem; }
        .dr-live-stat { display:flex; flex-direction:column; align-items:center; gap:.1rem; }
        .dr-live-val { font-family:'JetBrains Mono',monospace; font-size:1.5rem; font-weight:700; color:var(--tc-text); }
        .dr-live-lbl { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.09em; color:var(--tc-text3); }
        .dr-type-area { background:var(--tc-bg2); border:1px solid var(--tc-border); border-radius:12px;
          padding:1.2rem; transition:border-color .2s; }
        .dr-type-area:focus-within { border-color:var(--tc-accent); }
        .dr-text-disp { font-family:'JetBrains Mono',monospace; font-size:1.1rem; line-height:2;
          color:var(--tc-pend); letter-spacing:.03em; margin-bottom:.8rem; user-select:none; word-break:break-word; min-height:55px; }
        .dr-input { width:100%; padding:.7rem 1rem; background:var(--tc-bg3); border:1px solid var(--tc-border);
          border-radius:9px; color:var(--tc-text); font-family:'JetBrains Mono',monospace; font-size:.95rem;
          resize:none; transition:border-color .2s; outline:none; box-sizing:border-box; }
        .dr-input:focus { border-color:var(--tc-accent); }
        .dr-input:disabled { opacity:.5; cursor:not-allowed; }
        .dr-actions { display:flex; gap:.5rem; flex-wrap:wrap; }

        /* Results */
        .dr-results { background:var(--tc-bg2); border:1px solid var(--tc-border); border-radius:14px;
          padding:1.25rem; animation:tc-slideUp .3s ease; }
        .dr-res-title { display:flex; align-items:center; gap:.45rem; font-size:1rem; font-weight:800;
          color:var(--tc-green); margin-bottom:1rem; }
        .dr-stat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:.6rem; margin-bottom:1rem; }
        .dr-stat { display:flex; flex-direction:column; align-items:center; gap:.2rem; padding:.7rem .6rem;
          border-radius:10px; border:1px solid var(--tc-border); background:var(--tc-bg3); }
        .dr-stat-icon { opacity:.7; }
        .dr-stat-val { font-family:'JetBrains Mono',monospace; font-size:1.2rem; font-weight:700; }
        .dr-stat-lbl { font-size:.6rem; font-weight:700; color:var(--tc-text3); text-transform:uppercase; letter-spacing:.07em; }

        /* Error analysis */
        .dr-err-grid { display:flex; flex-wrap:wrap; gap:.4rem; }
        .dr-err-chip { padding:.22rem .55rem; border-radius:5px; background:rgba(239,68,68,.12);
          border:1px solid rgba(239,68,68,.25); color:var(--tc-red); font-family:'JetBrains Mono',monospace;
          font-size:.78rem; font-weight:700; }

        /* History */
        .dr-history { margin-top:1rem; }
        .dr-hist-head { display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr 1fr;
          padding:.45rem .8rem; background:var(--tc-bg3); border-radius:8px 8px 0 0;
          font-size:.62rem; font-weight:800; color:var(--tc-text3); text-transform:uppercase; letter-spacing:.06em; }
        .dr-hist-row { display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr 1fr;
          padding:.5rem .8rem; border-top:1px solid var(--tc-border); font-size:.75rem; color:var(--tc-text2); }
        .dr-hist-row:hover { background:var(--tc-bg3); }
        .dr-hist-targets { display:flex; flex-wrap:wrap; gap:2px; }
        .dr-hist-t { padding:1px 5px; border-radius:3px; background:rgba(124,106,247,.12);
          color:var(--tc-accent); font-family:'JetBrains Mono',monospace; font-size:.65rem; }

        /* Motivation strip */
        .dr-motiv { display:flex; align-items:center; gap:.6rem; padding:.65rem .9rem;
          background:linear-gradient(135deg,rgba(124,106,247,.08),rgba(94,234,212,.05));
          border:1px solid var(--tc-accent); border-radius:10px; font-size:.8rem; color:var(--tc-text2); margin-bottom:.8rem; }

        /* Clear btn */
        .dr-clear-btn { font-size:.65rem; font-weight:700; padding:.18rem .45rem; border-radius:5px;
          background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.2); color:var(--tc-red);
          cursor:pointer; margin-left:auto; }
        .dr-clear-btn:hover { background:rgba(239,68,68,.2); }
      `}</style>

      {/* Nav bar */}


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
          {/* ── Settings Panel ── */}
          {showSettings && (
            <div className="dr-settings">
              <div className="dr-settings-head">
                <div className="dr-settings-title">
                  <Settings size={14} /> Drill Settings
                </div>
                {/* <button
                  className="tc-pb-icon"
                  style={{ width: 26, height: 26 }}
                  onClick={() => setShowSettings(false)}
                >
                  <EyeOff size={12} />
                </button> */}
              </div>
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

                  {/* Picker tabs */}
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

                  {activeTab === "letters" && (
                    <div className="dr-char-grid">
                      {ALPHABET.map((ch) => (
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
                        <m.icon size={14} />
                        {m.label}
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

                {/* Options */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: ".4rem",
                  }}
                >
                  <div className="dr-opt-row">
                    <div className="dr-opt-lbl">
                      <CaseSensitive size={13} /> Capital Letters
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

          {/* ── Practice Area ── */}
          <div className="dr-practice">
            {/* Live bar */}
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
              {/* Timer ring */}
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
