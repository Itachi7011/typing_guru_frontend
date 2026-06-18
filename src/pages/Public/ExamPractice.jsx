import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import {
  Zap,
  Target,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  Brain,
  ArrowLeft,
  BarChart2,
  TrendingUp,
  RefreshCw,
  Play,
  Sun,
  Moon,
  BookOpen,
  Award,
  Info,
  Settings,
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
  ShieldCheck,
  XCircle,
  Timer,
  Hash,
  Keyboard,
  Layers,
  Volume2,
  VolumeX,
  Menu,
  X,
} from "lucide-react";
import {
  FB,
  shuffle,
  calcWPM,
  calcAccuracy,
  countCorrect,
  lsGet,
  lsSet,
  LS_KEY,
} from "../../components/Fallback";

// ── EXAM DEFINITIONS ────────────────────────────────────────────────────────
const EXAMS = [
  {
    id: "ssc_chsl",
    name: "SSC CHSL",
    shortName: "CHSL",
    type: "WPM Typing",
    typeBadge: "wpm",
    wpmRequired: 35,
    accuracyRequired: 80,
    durationSec: 600,
    language: "english",
    allowHindi: true,
    contentTypes: ["words", "sentences", "paragraphs"],
    keyDepression: false,
    info: {
      "Speed Required": "35 WPM",
      Duration: "10 min",
      Language: "English / Hindi",
      "Errors Allowed": "~5%",
      Platform: "DEST Test",
    },
    recommendations: [
      {
        type: "warn",
        title: "Minimum 35 WPM",
        text: "Most candidates fail due to low speed. Target 40+ WPM before the exam.",
      },
      {
        type: "info",
        title: "Use Hindi if comfortable",
        text: "Hindi typing on Krutidev or Mangal font is accepted. Stick to one.",
      },
      {
        type: "good",
        title: "Practice real passages",
        text: "SSC uses government notice-style paragraphs. Practice formal text.",
      },
      {
        type: "tip",
        title: "Reduce backspace usage",
        text: "Backspace is penalized in key depression count. Practice typing correctly the first time.",
      },
    ],
  },
  {
    id: "ssc_cgl_dest",
    name: "SSC CGL DEST",
    shortName: "CGL",
    type: "Key Depression",
    typeBadge: "kd",
    wpmRequired: 0,
    keyDepressionRequired: 2000,
    accuracyRequired: 85,
    durationSec: 900,
    language: "english",
    allowHindi: false,
    contentTypes: ["sentences", "paragraphs"],
    keyDepression: true,
    info: {
      "Key Depressions": "2000 in 15 min",
      Duration: "15 min",
      Language: "English only",
      "Test Type": "Data Entry Speed",
      Accuracy: "≥85%",
    },
    recommendations: [
      {
        type: "warn",
        title: "2000 key depressions in 15 min",
        text: "That's ~133 per minute — equivalent to ~27 WPM with no spaces. Focus on accuracy first.",
      },
      {
        type: "info",
        title: "Every keypress counts",
        text: "Spaces, punctuation, and letters all count as key depressions. Don't skip punctuation.",
      },
      {
        type: "good",
        title: "Practice data entry passages",
        text: "DEST uses government data-like text. Numbers and mixed content are common.",
      },
      {
        type: "tip",
        title: "Minimize corrections",
        text: "Backspace wastes depression count. Slow down slightly to reduce errors.",
      },
    ],
  },
  {
    id: "ssc_steno",
    name: "SSC Stenographer",
    shortName: "Steno",
    type: "Dictation (80–100 WPM)",
    typeBadge: "dict",
    wpmRequired: 80,
    accuracyRequired: 90,
    durationSec: 600,
    language: "english",
    allowHindi: true,
    contentTypes: ["sentences", "paragraphs"],
    keyDepression: false,
    info: {
      "Grade C Speed": "100 WPM dictation",
      "Grade D Speed": "80 WPM dictation",
      Transcription: "50 min (Grade C), 65 min (Grade D)",
      Language: "English / Hindi",
      Accuracy: "≥90%",
    },
    recommendations: [
      {
        type: "warn",
        title: "80–100 WPM is very high",
        text: "Build up gradually: 40→60→80→100 WPM. Do not rush the progression.",
      },
      {
        type: "info",
        title: "Transcription time is generous",
        text: "You have 50–65 minutes to transcribe a 10-min passage. Accuracy matters more than speed here.",
      },
      {
        type: "good",
        title: "Practice dictation-style text",
        text: "Government speeches, budget speeches, and Parliament transcripts are ideal.",
      },
      {
        type: "tip",
        title: "Grade C vs Grade D",
        text: "Grade D (80 WPM) is much more achievable. Start with Grade D preparation.",
      },
    ],
  },
  {
    id: "upsssc_ja",
    name: "UPSSSC Junior Assistant",
    shortName: "UPSSSC JA",
    type: "WPM Typing",
    typeBadge: "wpm",
    wpmRequired: 25,
    accuracyRequired: 80,
    durationSec: 600,
    language: "hindi",
    allowHindi: true,
    contentTypes: ["words", "sentences", "paragraphs"],
    keyDepression: false,
    info: {
      "Speed Required": "25 WPM",
      Duration: "10 min",
      Language: "Hindi (Krutidev/Unicode)",
      "Errors Allowed": "~10%",
      Qualifying: "Yes",
    },
    recommendations: [
      {
        type: "warn",
        title: "Hindi typing required",
        text: "Must use Krutidev 010 or Unicode Mangal font. Confirm the font allowed before practice.",
      },
      {
        type: "info",
        title: "25 WPM is achievable",
        text: "With 4–6 weeks of daily practice, most beginners can reach this target.",
      },
      {
        type: "good",
        title: "UP government content",
        text: "Practice UP government circular-style Hindi passages for realistic preparation.",
      },
      {
        type: "tip",
        title: "Maatra mastery is key",
        text: "Focus on मात्राएं (matras) — they are the most common source of errors in Hindi typing.",
      },
    ],
  },
  {
    id: "dsssb_ldc",
    name: "DSSSB LDC",
    shortName: "DSSSB",
    type: "WPM Typing",
    typeBadge: "wpm",
    wpmRequired: 35,
    accuracyRequired: 80,
    durationSec: 600,
    language: "english",
    allowHindi: true,
    contentTypes: ["words", "sentences", "paragraphs"],
    keyDepression: false,
    info: {
      "Speed Required": "35 WPM",
      Duration: "10 min",
      Language: "English / Hindi",
      "Errors Allowed": "~5%",
      Qualifying: "Yes",
    },
    recommendations: [
      {
        type: "info",
        title: "Same standard as SSC CHSL",
        text: "35 WPM with good accuracy. Target 40+ WPM for a comfortable buffer.",
      },
      {
        type: "warn",
        title: "DSSSB is competitive",
        text: "Many candidates qualify on speed but fail on accuracy. Aim for 90%+ accuracy.",
      },
      {
        type: "good",
        title: "Delhi-centric content",
        text: "Practice passages relating to Delhi government, municipal bodies, and official correspondence.",
      },
      {
        type: "tip",
        title: "Consistency over speed",
        text: "Inconsistent typing (bursts and pauses) reduces your effective WPM. Keep a steady rhythm.",
      },
    ],
  },
  {
    id: "raj_clerk",
    name: "Rajasthan Clerk",
    shortName: "Raj Clerk",
    type: "WPM Typing",
    typeBadge: "wpm",
    wpmRequired: 30,
    accuracyRequired: 80,
    durationSec: 600,
    language: "hindi",
    allowHindi: true,
    contentTypes: ["words", "sentences", "paragraphs"],
    keyDepression: false,
    info: {
      "Speed Required": "30 WPM",
      Duration: "10 min",
      Language: "Hindi",
      Font: "Krutidev 010",
      Qualifying: "Yes",
    },
    recommendations: [
      {
        type: "warn",
        title: "Krutidev 010 font mandatory",
        text: "Do NOT practice on Unicode Mangal. Rajasthan uses Krutidev 010 exclusively.",
      },
      {
        type: "info",
        title: "30 WPM in Hindi is achievable",
        text: "With focused practice on Krutidev layout, 30 WPM can be reached in 6–8 weeks.",
      },
      {
        type: "good",
        title: "Rajasthan government passages",
        text: "Rajasthan Patrika-style Hindi and government notifications are ideal practice material.",
      },
      {
        type: "tip",
        title: "Master the shift keys",
        text: "Half consonants and matras on Krutidev require Shift key combinations. Master these early.",
      },
    ],
  },
  {
    id: "mp_cpct",
    name: "MP CPCT",
    shortName: "CPCT",
    type: "Certification Typing",
    typeBadge: "cert",
    wpmRequired: 30,
    accuracyRequired: 85,
    durationSec: 900,
    language: "hindi",
    allowHindi: true,
    contentTypes: ["words", "sentences", "paragraphs"],
    keyDepression: false,
    info: {
      "Speed Required": "30 WPM",
      Duration: "15 min",
      Language: "Hindi + English",
      Certification: "Valid for 3 years",
      "Computer Basics": "Also tested",
    },
    recommendations: [
      {
        type: "info",
        title: "CPCT is a certification",
        text: "Not just a qualifier — CPCT score is used by multiple MP departments. A higher score is always better.",
      },
      {
        type: "warn",
        title: "Computer knowledge also tested",
        text: "CPCT includes computer literacy (MS Office, internet). Don't ignore this section.",
      },
      {
        type: "good",
        title: "Both Hindi and English needed",
        text: "Practice both languages. The exam switches between Hindi and English passages.",
      },
      {
        type: "tip",
        title: "Target 35+ WPM",
        text: "30 WPM clears the bar, but a score of 35+ WPM puts you in a stronger position for selection.",
      },
    ],
  },
  {
    id: "hc_clerk",
    name: "High Court Clerk",
    shortName: "HC Clerk",
    type: "WPM Typing",
    typeBadge: "wpm",
    wpmRequired: 40,
    accuracyRequired: 85,
    durationSec: 600,
    language: "english",
    allowHindi: true,
    contentTypes: ["sentences", "paragraphs"],
    keyDepression: false,
    info: {
      "Speed Required": "40 WPM (English) / 30 WPM (Hindi)",
      Duration: "10 min",
      Language: "English / Hindi",
      Accuracy: "≥85%",
      Content: "Legal passages",
    },
    recommendations: [
      {
        type: "warn",
        title: "40 WPM is a higher bar",
        text: "High Court expects 40 WPM minimum. Build to 45+ WPM for safety margin.",
      },
      {
        type: "info",
        title: "Legal terminology is common",
        text: "Practice typing legal jargon: petitioner, respondent, jurisdiction, affidavit, etc.",
      },
      {
        type: "good",
        title: "Accuracy is critical",
        text: "Legal documents require 85%+ accuracy. A single misspelling in a legal order is serious.",
      },
      {
        type: "tip",
        title: "Practice judgment-style text",
        text: "Use sample High Court judgments for practice. Speed and legal vocabulary will both improve.",
      },
    ],
  },
  {
    id: "dc_clerk",
    name: "District Court Clerk",
    shortName: "DC Clerk",
    type: "WPM Typing",
    typeBadge: "wpm",
    wpmRequired: 35,
    accuracyRequired: 80,
    durationSec: 600,
    language: "english",
    allowHindi: true,
    contentTypes: ["words", "sentences", "paragraphs"],
    keyDepression: false,
    info: {
      "Speed Required": "35 WPM",
      Duration: "10 min",
      Language: "English / Hindi",
      "Errors Allowed": "~5%",
      Content: "Court orders, notices",
    },
    recommendations: [
      {
        type: "info",
        title: "Similar to SSC CHSL standard",
        text: "35 WPM with 80% accuracy is the norm across most district court exams.",
      },
      {
        type: "warn",
        title: "Court-specific vocabulary",
        text: "Terms like cause list, summons, bail order, and warrant appear frequently. Get familiar.",
      },
      {
        type: "good",
        title: "Hindi typing bonus",
        text: "Many district courts prefer Hindi-typing candidates. It can be a differentiator.",
      },
      {
        type: "tip",
        title: "Punctuation matters",
        text: "Court documents have heavy punctuation. Practice texts with commas, colons, and semicolons.",
      },
    ],
  },
  {
    id: "ssc_mts",
    name: "SSC MTS",
    shortName: "MTS",
    type: "Occasional Typing",
    typeBadge: "wpm",
    wpmRequired: 25,
    accuracyRequired: 75,
    durationSec: 600,
    language: "english",
    allowHindi: true,
    contentTypes: ["words", "sentences"],
    keyDepression: false,
    info: {
      "Speed Required": "25 WPM (select posts)",
      Duration: "10 min (where applicable)",
      Language: "English / Hindi",
      Applicable: "Only certain MTS posts",
      Qualifying: "Yes",
    },
    recommendations: [
      {
        type: "info",
        title: "Not all MTS posts need typing",
        text: "Only select MTS posts require typing. Verify your specific post notification carefully.",
      },
      {
        type: "warn",
        title: "25 WPM is the minimum",
        text: "25 WPM is the easiest target among all SSC exams. Even so, don't take it lightly.",
      },
      {
        type: "good",
        title: "Great entry-level exam",
        text: "If you're new to typing, MTS is the best starting point. Focus on building fundamental skills.",
      },
      {
        type: "tip",
        title: "Build from basics",
        text: "Master home row (ASDF JKL;) first. A solid foundation now will help for harder exams later.",
      },
    ],
  },
  {
    id: "custom",
    name: "Custom Mode",
    shortName: "Custom",
    type: "Configurable",
    typeBadge: "custom",
    wpmRequired: 40,
    accuracyRequired: 90,
    durationSec: 120,
    language: "english",
    allowHindi: true,
    contentTypes: [
      "words",
      "sentences",
      "paragraphs",
      "numbers",
      "alphanumeric",
      "symbols",
    ],
    keyDepression: false,
    isCustom: true,
    info: {},
    recommendations: [
      {
        type: "tip",
        title: "Custom mode",
        text: "Set your own WPM target, accuracy, duration, and content type to build a personalized practice session.",
      },
      {
        type: "good",
        title: "Mix content types",
        text: "Combine words, numbers, and symbols for a well-rounded skill set.",
      },
      {
        type: "info",
        title: "Track your own progress",
        text: "Use custom mode to simulate your personal target before switching to exam mode.",
      },
      {
        type: "warn",
        title: "Be realistic",
        text: "Set targets just above your current ability — not too easy, not too hard.",
      },
    ],
  },
];

const CONTENT_TYPES = [
  { id: "words", label: "Words" },
  { id: "sentences", label: "Sentences" },
  { id: "paragraphs", label: "Paragraphs" },
  { id: "numbers", label: "Numbers" },
  { id: "alphanumeric", label: "AlphaNumeric" },
  { id: "symbols", label: "Symbols" },
];

// ── HINDI WORD BANK ──────────────────────────────────────────────────────────
const HINDI_WORDS = [
  "समय",
  "काम",
  "लोग",
  "देश",
  "सरकार",
  "जानकारी",
  "विकास",
  "शिक्षा",
  "स्वास्थ्य",
  "परिवार",
  "समाज",
  "नीति",
  "कार्य",
  "प्रदेश",
  "नागरिक",
  "जिला",
  "न्यायालय",
  "आवेदन",
  "प्रार्थना",
  "पत्र",
  "सूचना",
  "आदेश",
  "प्रमाण",
  "कार्यालय",
  "अधिकारी",
  "विभाग",
  "योजना",
  "बजट",
  "व्यय",
  "आय",
  "राशि",
  "भुगतान",
  "निर्देश",
  "अनुमति",
  "कर्मचारी",
  "नियुक्ति",
  "सेवा",
  "पदोन्नति",
  "अनुभव",
  "प्रशिक्षण",
  "परीक्षा",
  "उत्तीर्ण",
  "परिणाम",
];

// ── TEXT GENERATION ──────────────────────────────────────────────────────────
function buildText(contentType, language, examId) {
  const eng = FB.english?.words || [];
  const hindi = HINDI_WORDS;
  const nums = () =>
    Array.from({ length: 200 }, () =>
      String(Math.floor(Math.random() * 9999)),
    ).join(" ");
  const symbols = () => "@ # $ % & * ( ) - + = [ ] ; : , . / ? ! ".repeat(30);

  const pool = language === "hindi" ? hindi : eng;
  const isCustom = examId === "custom";
  const wordCount = isCustom ? 300 : 120;

  if (contentType === "numbers") return nums();
  if (contentType === "symbols") return symbols();
  if (contentType === "alphanumeric") {
    const words = shuffle(eng.filter((w) => w.length <= 5)).slice(0, 150);
    const mixed = [];
    words.forEach((w, i) => {
      mixed.push(w);
      if (i % 3 === 2) mixed.push(String(Math.floor(Math.random() * 999)));
    });
    return mixed.join(" ");
  }

  let selected = shuffle(pool).slice(0, wordCount).join(" ");
  return selected;
}

function calcKeyDepressions(str) {
  return str.length;
}

const EP_HIST_KEY = "ep_exam_history";

const INFINITE_TEXT_GENERATOR_EXAM = {
  generateMoreText: function (contentType, language, examId) {
    return buildText(contentType, language, examId);
  },
  ensureBuffer: function (
    currentText,
    userInputLength,
    contentType,
    language,
    examId,
  ) {
    const remainingChars = currentText.length - userInputLength;
    if (remainingChars < 300) {
      const newChunk = this.generateMoreText(contentType, language, examId);
      return currentText + " " + newChunk;
    }
    return currentText;
  },
};

// ── HOOK: measure container width for dynamic line length ──────────────────
function useContainerWidth(ref) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    ro.observe(ref.current);
    setWidth(ref.current.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ExamPractice() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Exam selection
  const [selectedExam, setSelectedExam] = useState(EXAMS[0]);
  const [language, setLanguage] = useState("english");
  const [contentType, setContentType] = useState("sentences");
  const [showReco, setShowReco] = useState(false);
  const isGeneratingRef = useRef(false);

  // Custom mode overrides
  const [customWPM, setCustomWPM] = useState(40);
  const [customAcc, setCustomAcc] = useState(90);
  const [customDur, setCustomDur] = useState(120);
  const [customContent, setCustomContent] = useState("words");
  const [customKD, setCustomKD] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  // Test state
  const [testText, setTestText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [startTime, setStartTime] = useState(null);
  const [wpmHist, setWpmHist] = useState([]);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState(() => lsGet(EP_HIST_KEY) || []);
  const [rollingWPM, setRollingWPM] = useState(0);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const wpmTickRef = useRef(null);
  const audioCtx = useRef(null);
  const userInputRef = useRef("");
  const testTextRef = useRef("");
  const startRef = useRef(null);
  const wpmHistRef = useRef([]);
  const endCalledRef = useRef(false);
  const rollingWPMBufferRef = useRef([]);

  // Container ref for dynamic line length
  const textDisplayRef = useRef(null);
  const containerWidth = useContainerWidth(textDisplayRef);

  const BUFFER_THRESHOLD = 2000;
  const MIN_AHEAD_BUFFER = 1500;

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

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarOpen &&
        !e.target.closest(".tg-exam-pract-sidebar") &&
        !e.target.closest(".tg-exam-pract-sidebar-toggle")
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  // Close sidebar on route/exam change on mobile
  const closeSidebar = () => setSidebarOpen(false);

  const examConfig = useMemo(() => {
    if (selectedExam.isCustom) {
      return {
        ...selectedExam,
        wpmRequired: customWPM,
        accuracyRequired: customAcc,
        durationSec: customDur,
        language,
        keyDepression: customKD,
        contentType: customContent,
      };
    }
    return { ...selectedExam, language, contentType };
  }, [
    selectedExam,
    language,
    customWPM,
    customAcc,
    customDur,
    customContent,
    customKD,
    contentType,
  ]);

  const generateText = useCallback(() => {
    const ct = selectedExam.isCustom ? customContent : contentType;
    const lang =
      selectedExam.isCustom || selectedExam.allowHindi
        ? language
        : selectedExam.language;
    const text = buildText(ct, lang, selectedExam.id);
    setTestText(text);
    setUserInput("");
    setDone(false);
    setResults(null);
    setWpmHist([]);
    const dur = selectedExam.isCustom ? customDur : selectedExam.durationSec;
    setTimeLeft(dur);
    setRunning(false);
    endCalledRef.current = false;
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [selectedExam, language, contentType, customContent, customDur]);

  useEffect(() => {
    generateText();
  }, [generateText]);

  useEffect(() => {
    if (running && !done) {
      timerRef.current = setInterval(() => {
        setTimeLeft((p) => {
          if (p <= 1) {
            clearInterval(timerRef.current);
            clearInterval(wpmTickRef.current);
            endTest();
            return 0;
          }
          return p - 1;
        });
      }, 1000);
      wpmTickRef.current = setInterval(() => {
        if (startRef.current && running && !done) {
          const elapsed = (Date.now() - startRef.current) / 1000;
          if (elapsed >= 10) {
            const correct = countCorrect(
              userInputRef.current,
              testTextRef.current,
            );
            const wpm = correct / 5 / (elapsed / 60);
            const cappedWpm = Math.min(wpm, 200);
            setWpmHist((h) => [...h, Math.round(cappedWpm)]);
          }
        }
      }, 5000);
    }
    return () => {
      clearInterval(timerRef.current);
      clearInterval(wpmTickRef.current);
    };
  }, [running, done]);

  useEffect(() => {
    if (!running || done) return;
    if (isGeneratingRef.current) return;
    const remaining = testText.length - userInput.length;
    if (remaining < MIN_AHEAD_BUFFER) {
      isGeneratingRef.current = true;
      requestIdleCallback(() => {
        const chunk = INFINITE_TEXT_GENERATOR_EXAM.generateMoreText(
          selectedExam.isCustom ? customContent : contentType,
          language,
          selectedExam.id,
        );
        setTestText((prev) => prev + " " + chunk);
        isGeneratingRef.current = false;
      });
    }
  }, [userInput, running, done]);

  useEffect(() => {
    if (!selectedExam.isCustom) return;
    if (testText.length < 5000) {
      const chunk = INFINITE_TEXT_GENERATOR_EXAM.generateMoreText(
        customContent,
        language,
        selectedExam.id,
      );
      setTestText((prev) => prev + " " + chunk);
    }
  }, [testText]);

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
      g.gain.value = 0.03;
      o.start();
      o.stop(audioCtx.current.currentTime + 0.018);
    } catch {}
  }

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
    playClick();

    if (selectedExam.isCustom && !done) {
      const remaining = testTextRef.current.length - val.length;
      if (remaining < BUFFER_THRESHOLD) {
        setTestText((prev) => {
          const remaining = prev.length - val.length;
          if (selectedExam.isCustom && remaining < BUFFER_THRESHOLD) {
            const newChunk = INFINITE_TEXT_GENERATOR_EXAM.generateMoreText(
              customContent,
              language,
              selectedExam.id,
            );
            return prev + " " + newChunk;
          }
          return prev;
        });
      }
    }
  }

  function endTest() {
    if (endCalledRef.current) return;
    endCalledRef.current = true;
    clearInterval(timerRef.current);
    clearInterval(wpmTickRef.current);

    const fi = userInputRef.current,
      ft = testTextRef.current,
      fs = startRef.current;
    const fh = [...wpmHistRef.current];
    let elapsed = examConfig.durationSec;

    let wpm = 0;
    if (elapsed >= 3 && fi.length > 0) {
      const correct = countCorrect(fi, ft);
      wpm = correct / 5 / (elapsed / 60);
      wpm = Math.max(0, Math.min(wpm, 200));
    } else if (fh.length > 0) {
      wpm = fh.reduce((a, b) => a + b, 0) / fh.length;
    } else if (fi.length > 0) {
      const correct = countCorrect(fi, ft);
      wpm = correct / 5 / (Math.max(elapsed, 3) / 60);
    }

    const correct = countCorrect(fi, ft);
    const acc = calcAccuracy(correct, fi.length || 1);
    const cons =
      fh.length > 1
        ? Math.round(
            100 -
              ((Math.max(...fh) - Math.min(...fh)) / (Math.max(...fh) || 1)) *
                100,
          )
        : 100;
    const kd = calcKeyDepressions(fi);
    const passed = examConfig.keyDepression
      ? kd >= examConfig.keyDepressionRequired &&
        acc >= examConfig.accuracyRequired
      : wpm >= examConfig.wpmRequired && acc >= examConfig.accuracyRequired;

    const res = {
      wpm: Math.round(Math.max(0, Math.min(wpm, 200))),
      accuracy: Math.max(0, Math.min(100, Math.round(acc))),
      consistency: Math.max(0, Math.min(100, Math.round(cons))),
      mistakes: fi.length - correct,
      elapsed: Math.round(elapsed),
      kd,
      passed,
      examId: selectedExam.id,
      examName: selectedExam.name,
      language,
      date: new Date().toISOString(),
    };

    setDone(true);
    setRunning(false);
    setResults(res);
    setStartTime(null);

    const hist = [res, ...(lsGet(EP_HIST_KEY) || [])].slice(0, 50);
    lsSet(EP_HIST_KEY, hist);
    setHistory(hist);
    setShowReco(true);
  }

  function resetTest() {
    clearInterval(timerRef.current);
    clearInterval(wpmTickRef.current);
    generateText();
    setShowReco(false);
  }

  function selectExam(exam) {
    setSelectedExam(exam);
    setShowReco(false);
    if (!exam.isCustom) {
      setLanguage(exam.language || "english");
      const validTypes = exam.contentTypes || ["words"];
      setContentType(
        validTypes.includes("sentences") ? "sentences" : validTypes[0],
      );
    }
    // Close sidebar on mobile after selecting
    closeSidebar();
  }

  const liveWPM = useMemo(() => {
    if (done && results) return results.wpm;
    if (running && startTime && userInput.length > 20) {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed < 5) return 0;
      const correct = countCorrect(userInput, testText);
      const effectiveTime = Math.max(elapsed, 5);
      const wpm = correct / 5 / (effectiveTime / 60);
      let cappedWpm = Math.min(wpm, 200);
      cappedWpm = Math.max(cappedWpm, 0);
      return Math.round(cappedWpm);
    }
    return rollingWPM || 0;
  }, [done, results, running, startTime, userInput, testText, rollingWPM]);

  const liveAcc = useMemo(() => {
    if (done && results) return results.accuracy;
    if (userInput.length > 0)
      return calcAccuracy(countCorrect(userInput, testText), userInput.length);
    return 0;
  }, [done, results, userInput, testText]);

  const liveMistakes = useMemo(() => {
    if (done && results) return results.mistakes;
    return userInput.length - countCorrect(userInput, testText);
  }, [done, results, userInput, testText]);

  const liveKD = useMemo(() => calcKeyDepressions(userInput), [userInput]);

  const dur = selectedExam.isCustom ? customDur : selectedExam.durationSec;
  const timerPct = (timeLeft / dur) * 100;
  const timerColor =
    timerPct > 50 ? "#10b981" : timerPct > 20 ? "#f59e0b" : "#ef4444";
  const ringR = 27,
    ringCirc = 2 * Math.PI * ringR;

  const onTrack = useMemo(() => {
    if (!running && !done) return null;
    if (examConfig.keyDepression)
      return (
        liveKD >=
          (examConfig.keyDepressionRequired || 2000) * (1 - timeLeft / dur) &&
        liveAcc >= examConfig.accuracyRequired
      );
    return (
      liveWPM >= examConfig.wpmRequired &&
      liveAcc >= examConfig.accuracyRequired
    );
  }, [running, done, liveWPM, liveAcc, liveKD, examConfig, timeLeft, dur]);

  // Dynamic line length based on container width
  const charsPerLine = useMemo(() => {
    if (!containerWidth) return 75;
    // Approximate: at 1rem (16px) monospace, each char ≈ 9.6px
    // We use font-size of 1.05rem = ~16.8px per char
    const charWidth = 9.8;
    const padding = 40; // 1.3rem * 2 sides ≈ 40px
    const availableWidth = containerWidth - padding;
    const chars = Math.floor(availableWidth / charWidth);
    return Math.max(20, Math.min(chars, 80));
  }, [containerWidth]);

  // Rendered text — uses dynamic charsPerLine
  const renderedText = useMemo(() => {
    if (!testText) return null;
    const text = testText;

    const splitIntoLines = (str, maxLineLength) => {
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

    const lines = splitIntoLines(text, charsPerLine);
    if (lines.length === 0) return null;

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

    let offset = 0;
    for (let i = 0; i < startLineIndex; i++) {
      offset += (lines[i]?.length || 0) + 1;
    }

    const renderedChars = [];
    let globalIndex = offset;

    visibleLines.forEach((line, lineIdx) => {
      if (line.length === 0) {
        renderedChars.push(
          <div
            key={`empty-line-${lineIdx}`}
            className="tg-exam-pract-empty-line"
          >
            <span className="tg-exam-pract-placeholder-dots">~</span>
          </div>,
        );
      } else {
        const lineChars = [];
        for (let charIdx = 0; charIdx < line.length; charIdx++) {
          const ch = line[charIdx];
          const absoluteIndex = globalIndex + charIdx;
          let cls = "tg-exam-pract-ch-pend";
          if (absoluteIndex < userInput.length) {
            cls =
              userInput[absoluteIndex] === ch
                ? "tg-exam-pract-ch-ok"
                : "tg-exam-pract-ch-err";
          }
          lineChars.push(
            <span
              key={absoluteIndex}
              className={`${cls}${absoluteIndex === userInput.length ? " tg-exam-pract-ch-cur" : ""}`}
            >
              {ch}
            </span>,
          );
        }
        renderedChars.push(
          <div key={`line-${lineIdx}`} className="tg-exam-pract-text-line">
            {lineChars}
          </div>,
        );
        globalIndex += line.length + 1;
      }
    });

    return renderedChars;
  }, [testText, userInput, charsPerLine]);

  const badgeClass = {
    wpm: "tg-exam-pract-badge-wpm",
    kd: "tg-exam-pract-badge-kd",
    dict: "tg-exam-pract-badge-dict",
    cert: "tg-exam-pract-badge-cert",
    custom: "tg-exam-pract-badge-custom",
  };

  const availableContentTypes = selectedExam.isCustom
    ? CONTENT_TYPES
    : CONTENT_TYPES.filter((ct) =>
        (selectedExam.contentTypes || []).includes(ct.id),
      );

  const SidebarContent = () => (
    <>
      {/* Exam Selector */}
      <div className="tg-exam-pract-panel">
        <div className="tg-exam-pract-panel-head">
          <FileText size={13} /> Select Exam
        </div>
        <div
          className="tg-exam-pract-panel-body"
          style={{ paddingTop: "0.6rem", paddingBottom: "0.75rem" }}
        >
          <div className="tg-exam-pract-exam-list">
            {EXAMS.map((exam) => (
              <button
                key={exam.id}
                className={`tg-exam-pract-exam-btn ${selectedExam.id === exam.id ? (exam.isCustom ? "tg-exam-pract-custom-active" : "tg-exam-pract-exam-active") : ""}`}
                onClick={() => selectExam(exam)}
              >
                <div className="tg-exam-pract-exam-icon">
                  {exam.shortName.slice(0, 2)}
                </div>
                <div className="tg-exam-pract-exam-info">
                  <div className="tg-exam-pract-exam-name">{exam.name}</div>
                  <div className="tg-exam-pract-exam-type">{exam.type}</div>
                </div>
                <span
                  className={`tg-exam-pract-exam-badge ${badgeClass[exam.typeBadge] || ""}`}
                >
                  {exam.typeBadge === "wpm"
                    ? "WPM"
                    : exam.typeBadge === "kd"
                      ? "KD"
                      : exam.typeBadge === "dict"
                        ? "DICT"
                        : exam.typeBadge === "cert"
                          ? "CERT"
                          : "✦"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exam Info */}
      {!selectedExam.isCustom && Object.keys(selectedExam.info).length > 0 && (
        <div className="tg-exam-pract-info-box">
          <div className="tg-exam-pract-info-title">
            <Info size={13} /> Exam Details
          </div>
          {Object.entries(selectedExam.info).map(([k, v]) => (
            <div key={k} className="tg-exam-pract-info-row">
              <span className="tg-exam-pract-info-key">{k}</span>
              <span className="tg-exam-pract-info-val">{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Language */}
      {(selectedExam.allowHindi || selectedExam.isCustom) && (
        <div className="tg-exam-pract-panel">
          <div className="tg-exam-pract-panel-head">
            <Keyboard size={13} /> Language
          </div>
          <div
            className="tg-exam-pract-panel-body"
            style={{ padding: "0.75rem 1rem" }}
          >
            <div className="tg-exam-pract-lang-row">
              {["english", "hindi"].map((lang) => (
                <button
                  key={lang}
                  className={`tg-exam-pract-lang-btn ${language === lang ? "tg-exam-pract-lang-active" : ""}`}
                  onClick={() => setLanguage(lang)}
                >
                  {lang === "english" ? "🇬🇧 English" : "🇮🇳 हिन्दी"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Type */}
      <div className="tg-exam-pract-panel">
        <div className="tg-exam-pract-panel-head">
          <Layers size={13} /> Content Type
        </div>
        <div
          className="tg-exam-pract-panel-body"
          style={{ padding: "0.75rem 1rem" }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
            {availableContentTypes.map((ct) => (
              <button
                key={ct.id}
                className={`tg-exam-pract-lang-btn ${(selectedExam.isCustom ? customContent : contentType) === ct.id ? "tg-exam-pract-lang-active" : ""}`}
                style={{
                  flex: "0 0 auto",
                  fontSize: "0.7rem",
                  padding: "0.3rem 0.6rem",
                }}
                onClick={() =>
                  selectedExam.isCustom
                    ? setCustomContent(ct.id)
                    : setContentType(ct.id)
                }
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Mode Config */}
      {selectedExam.isCustom && (
        <div className="tg-exam-pract-panel">
          <div className="tg-exam-pract-panel-head">
            <Settings size={13} /> Custom Settings
          </div>
          <div className="tg-exam-pract-panel-body">
            <div className="tg-exam-pract-custom-grid">
              <div className="tg-exam-pract-custom-field">
                <label className="tg-exam-pract-field-label">Target WPM</label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={customWPM}
                  onChange={(e) => setCustomWPM(Number(e.target.value))}
                  className="tg-exam-pract-field-input"
                />
              </div>
              <div className="tg-exam-pract-custom-field">
                <label className="tg-exam-pract-field-label">
                  Min Accuracy %
                </label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={customAcc}
                  onChange={(e) => setCustomAcc(Number(e.target.value))}
                  className="tg-exam-pract-field-input"
                />
              </div>
              <div className="tg-exam-pract-custom-field">
                <label className="tg-exam-pract-field-label">
                  Duration (sec)
                </label>
                <select
                  value={customDur}
                  onChange={(e) => setCustomDur(Number(e.target.value))}
                  className="tg-exam-pract-field-select"
                >
                  {[30, 60, 120, 180, 300, 600, 900].map((d) => (
                    <option key={d} value={d}>
                      {d < 60 ? `${d}s` : `${d / 60}m`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="tg-exam-pract-custom-field">
                <label className="tg-exam-pract-field-label">Mode</label>
                <select
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  className="tg-exam-pract-field-select"
                >
                  {CONTENT_TYPES.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="tg-exam-pract-toggle-row">
              <span>Key Depression Mode</span>
              <div
                className={`tg-exam-pract-toggle ${customKD ? "tg-exam-pract-toggle-on" : ""}`}
                onClick={() => setCustomKD((k) => !k)}
                role="switch"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div
      className={`tg-exam-pract-root ${isDarkMode ? "dark" : "light"} lang-${language}`}
    >
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="tg-exam-pract-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* BODY */}
      <div className="tg-exam-pract-body">
        {/* Mobile sidebar toggle button (floating) */}
        <button
          className="tg-exam-pract-sidebar-toggle"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          <span>{sidebarOpen ? "Close" : selectedExam.shortName}</span>
        </button>

        {/* SIDEBAR */}
        <aside
          className={`tg-exam-pract-sidebar ${sidebarOpen ? "tg-exam-pract-sidebar-open" : ""}`}
        >
          {/* Sidebar header on mobile */}
          <div className="tg-exam-pract-sidebar-mobile-header">
            <span className="tg-exam-pract-sidebar-mobile-title">
              <FileText size={14} /> Choose Exam
            </span>
            <button
              className="tg-exam-pract-sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={16} />
            </button>
          </div>
          <SidebarContent />
        </aside>

        {/* MAIN */}
        <div className="tg-exam-pract-main">
          {/* Live Bar */}
          <div className="tg-exam-pract-live-bar">
            <div className="tg-exam-pract-live-stat">
              <Zap size={14} style={{ color: "var(--ep-accent)" }} />
              <span className="tg-exam-pract-live-val">{liveWPM}</span>
              <span className="tg-exam-pract-live-lbl">WPM</span>
              {!selectedExam.isCustom && (
                <span className="tg-exam-pract-live-target">
                  /{examConfig.wpmRequired}
                </span>
              )}
            </div>
            <div className="tg-exam-pract-live-stat">
              <Target size={14} style={{ color: "var(--ep-green)" }} />
              <span className="tg-exam-pract-live-val">{liveAcc}%</span>
              <span className="tg-exam-pract-live-lbl">Acc</span>
              {!selectedExam.isCustom && (
                <span className="tg-exam-pract-live-target">
                  Min {examConfig.accuracyRequired}%
                </span>
              )}
            </div>

            {/* Timer Ring */}
            <svg width="68" height="68" className="tg-exam-pract-timer-ring">
              <circle
                cx={34}
                cy={34}
                r={ringR}
                fill="none"
                strokeWidth={5}
                className="tg-exam-pract-ring-bg"
              />
              <circle
                cx={34}
                cy={34}
                r={ringR}
                fill="none"
                strokeWidth={5}
                stroke={timerColor}
                strokeDasharray={ringCirc}
                strokeDashoffset={ringCirc * (1 - timerPct / 100)}
                strokeLinecap="round"
                transform="rotate(-90 34 34)"
                className="tg-exam-pract-ring-fill"
              />
              <text
                x={34}
                y={39}
                textAnchor="middle"
                className="tg-exam-pract-ring-txt"
                fontSize="12"
              >
                {timeLeft}
              </text>
            </svg>

            <div className="tg-exam-pract-live-stat">
              <AlertCircle size={14} style={{ color: "var(--ep-red)" }} />
              <span className="tg-exam-pract-live-val">{liveMistakes}</span>
              <span className="tg-exam-pract-live-lbl">Errors</span>
            </div>

            {selectedExam.keyDepression ||
            (selectedExam.isCustom && customKD) ? (
              <div className="tg-exam-pract-live-stat">
                <Hash size={14} style={{ color: "var(--ep-yellow)" }} />
                <span className="tg-exam-pract-live-val">{liveKD}</span>
                <span className="tg-exam-pract-live-lbl">KD</span>
                <span className="tg-exam-pract-live-target">
                  /{examConfig.keyDepressionRequired || 2000}
                </span>
              </div>
            ) : null}

            <div
              className={`tg-exam-pract-live-status ${!running && !done ? "tg-exam-pract-status-idle" : done ? (results?.passed ? "tg-exam-pract-status-done" : "tg-exam-pract-status-fail") : "tg-exam-pract-status-running"}`}
            >
              {!running && !done ? (
                <>
                  <Timer size={12} /> Ready
                </>
              ) : done ? (
                results?.passed ? (
                  <>
                    <CheckCircle size={12} /> Passed
                  </>
                ) : (
                  <>
                    <XCircle size={12} /> Failed
                  </>
                )
              ) : (
                <>
                  <Activity size={12} /> Running
                </>
              )}
            </div>
          </div>

          {/* On-track indicator */}
          {(running || done) && (
            <div
              className={`tg-exam-pract-pass-bar ${onTrack === null ? "tg-exam-pract-neutral" : onTrack ? "tg-exam-pract-on-track" : "tg-exam-pract-off-track"}`}
            >
              {onTrack === null ? (
                <>
                  <Activity size={13} /> Start typing to see progress
                </>
              ) : onTrack ? (
                <>
                  <CheckCircle size={13} /> On track to pass — keep going!
                </>
              ) : (
                <>
                  <AlertCircle size={13} /> Below target — increase speed or
                  reduce errors
                </>
              )}
              <span className="tg-exam-pract-pass-criteria">
                {examConfig.keyDepression
                  ? `${examConfig.keyDepressionRequired} KD • ${examConfig.accuracyRequired}% Acc`
                  : `${examConfig.wpmRequired} WPM • ${examConfig.accuracyRequired}% Acc`}
              </span>
            </div>
          )}

          {/* KD bar */}
          {(selectedExam.keyDepression ||
            (selectedExam.isCustom && customKD)) &&
            running && (
              <div className="tg-exam-pract-kd-bar">
                <Hash size={14} style={{ color: "var(--ep-yellow)" }} />
                <span className="tg-exam-pract-kd-val">{liveKD}</span>
                <span className="tg-exam-pract-kd-lbl">
                  key depressions so far
                </span>
                <span
                  className="tg-exam-pract-kd-lbl"
                  style={{ marginLeft: "auto" }}
                >
                  Target:{" "}
                  <strong style={{ color: "var(--ep-yellow)" }}>
                    {examConfig.keyDepressionRequired || 2000}
                  </strong>
                </span>
              </div>
            )}

          {/* Typing Area */}
          <div className="tg-exam-pract-type-wrap">
            <div className="tg-exam-pract-text-display" ref={textDisplayRef}>
              {renderedText}
            </div>
            <textarea
              ref={inputRef}
              className="tg-exam-pract-textarea"
              value={userInput}
              onChange={handleInput}
              placeholder="Start typing to begin the test…"
              disabled={done}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="tg-exam-pract-actions">
            <button
              className="tg-exam-pract-btn tg-exam-pract-btn-secondary"
              onClick={resetTest}
            >
              <RefreshCw size={14} /> New Test
            </button>
            {done && (
              <button
                className="tg-exam-pract-btn tg-exam-pract-btn-primary"
                onClick={resetTest}
              >
                <Play size={14} /> Retry
              </button>
            )}
            <button
              className="tg-exam-pract-btn tg-exam-pract-btn-secondary"
              onClick={() => setShowReco((r) => !r)}
            >
              <Lightbulb size={14} /> {showReco ? "Hide Tips" : "Show Tips"}
              {showReco ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {/* Results */}
          {done && results && (
            <div className="tg-exam-pract-results">
              <div className="tg-exam-pract-result-header">
                <div
                  className={`tg-exam-pract-result-badge ${results.passed ? "tg-exam-pract-result-pass" : "tg-exam-pract-result-fail"}`}
                >
                  {results.passed ? (
                    <>
                      <CheckCircle size={16} /> PASSED
                    </>
                  ) : (
                    <>
                      <XCircle size={16} /> FAILED
                    </>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--ep-text2)",
                    fontWeight: 600,
                  }}
                >
                  {selectedExam.name} —{" "}
                  {language === "hindi" ? "Hindi" : "English"}
                </span>
              </div>

              <div className="tg-exam-pract-stat-grid">
                {[
                  {
                    icon: Zap,
                    label: "WPM",
                    value: results.wpm,
                    sub: `Target: ${examConfig.wpmRequired}`,
                    color: "blue",
                  },
                  {
                    icon: Target,
                    label: "Accuracy",
                    value: `${results.accuracy}%`,
                    sub: `Min: ${examConfig.accuracyRequired}%`,
                    color: "green",
                  },
                  {
                    icon: Activity,
                    label: "Consistency",
                    value: `${results.consistency}%`,
                    color: "purple",
                  },
                  {
                    icon: AlertCircle,
                    label: "Mistakes",
                    value: results.mistakes,
                    color: "red",
                  },
                  {
                    icon: Clock,
                    label: "Time",
                    value: `${results.elapsed}s`,
                    color: "yellow",
                  },
                  ...(selectedExam.keyDepression ||
                  (selectedExam.isCustom && customKD)
                    ? [
                        {
                          icon: Hash,
                          label: "Key Dep.",
                          value: results.kd,
                          sub: `Need: ${examConfig.keyDepressionRequired || 2000}`,
                          color: "orange",
                        },
                      ]
                    : [
                        {
                          icon: TrendingUp,
                          label: "Raw WPM",
                          value: Math.round(
                            results.wpm *
                              (100 / Math.max(results.accuracy, 1)) *
                              0.8,
                          ),
                          color: "teal",
                        },
                      ]),
                ].map((s, i) => (
                  <div
                    key={i}
                    className={`tg-exam-pract-stat-card tg-exam-pract-sc-${s.color}`}
                  >
                    <div className="tg-exam-pract-stat-icon">
                      <s.icon size={16} />
                    </div>
                    <div className="tg-exam-pract-stat-val">{s.value}</div>
                    <div className="tg-exam-pract-stat-lbl">{s.label}</div>
                    {s.sub && (
                      <div className="tg-exam-pract-stat-sub">{s.sub}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Verdict */}
              <div
                className={`tg-exam-pract-verdict ${results.passed ? "tg-exam-pract-verdict-pass" : "tg-exam-pract-verdict-fail"}`}
              >
                <div className="tg-exam-pract-verdict-title">
                  {results.passed ? (
                    <ShieldCheck
                      size={14}
                      style={{ color: "var(--ep-green)" }}
                    />
                  ) : (
                    <AlertCircle size={14} style={{ color: "var(--ep-red)" }} />
                  )}
                  Exam Criteria Check — {selectedExam.name}
                </div>
                <div className="tg-exam-pract-verdict-items">
                  {examConfig.keyDepression ? (
                    <div className="tg-exam-pract-verdict-row">
                      <span className="tg-exam-pract-verdict-key">
                        <Hash size={11} /> Key Depressions ≥{" "}
                        {examConfig.keyDepressionRequired || 2000}
                      </span>
                      <span
                        className={
                          results.kd >=
                          (examConfig.keyDepressionRequired || 2000)
                            ? "tg-exam-pract-verdict-met"
                            : "tg-exam-pract-verdict-notmet"
                        }
                      >
                        {results.kd}{" "}
                        {results.kd >=
                        (examConfig.keyDepressionRequired || 2000)
                          ? "✓"
                          : "✗"}
                      </span>
                    </div>
                  ) : (
                    <div className="tg-exam-pract-verdict-row">
                      <span className="tg-exam-pract-verdict-key">
                        <Zap size={11} /> WPM ≥ {examConfig.wpmRequired}
                      </span>
                      <span
                        className={
                          results.wpm >= examConfig.wpmRequired
                            ? "tg-exam-pract-verdict-met"
                            : "tg-exam-pract-verdict-notmet"
                        }
                      >
                        {results.wpm} WPM{" "}
                        {results.wpm >= examConfig.wpmRequired ? "✓" : "✗"}
                      </span>
                    </div>
                  )}
                  <div className="tg-exam-pract-verdict-row">
                    <span className="tg-exam-pract-verdict-key">
                      <Target size={11} /> Accuracy ≥{" "}
                      {examConfig.accuracyRequired}%
                    </span>
                    <span
                      className={
                        results.accuracy >= examConfig.accuracyRequired
                          ? "tg-exam-pract-verdict-met"
                          : "tg-exam-pract-verdict-notmet"
                      }
                    >
                      {results.accuracy}%{" "}
                      {results.accuracy >= examConfig.accuracyRequired
                        ? "✓"
                        : "✗"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {showReco && (
                <div className="tg-exam-pract-reco-section">
                  <div className="tg-exam-pract-reco-title">
                    <Lightbulb size={14} /> Recommendations for{" "}
                    {selectedExam.name}
                  </div>
                  <div className="tg-exam-pract-reco-grid">
                    {selectedExam.recommendations.map((r, i) => (
                      <div key={i} className="tg-exam-pract-reco-card">
                        <div
                          className={`tg-exam-pract-reco-ico tg-exam-pract-reco-ico-${r.type}`}
                        >
                          {r.type === "warn" ? (
                            <AlertCircle size={14} />
                          ) : r.type === "good" ? (
                            <CheckCircle size={14} />
                          ) : r.type === "info" ? (
                            <Info size={14} />
                          ) : (
                            <Lightbulb size={14} />
                          )}
                        </div>
                        <div className="tg-exam-pract-reco-text">
                          <strong>{r.title}</strong>
                          {r.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tips before test */}
          {!done && showReco && (
            <div
              className="tg-exam-pract-results"
              style={{ padding: "1.25rem" }}
            >
              <div className="tg-exam-pract-reco-section">
                <div className="tg-exam-pract-reco-title">
                  <Lightbulb size={14} /> Tips & Strategy — {selectedExam.name}
                </div>
                <div className="tg-exam-pract-reco-grid">
                  {selectedExam.recommendations.map((r, i) => (
                    <div key={i} className="tg-exam-pract-reco-card">
                      <div
                        className={`tg-exam-pract-reco-ico tg-exam-pract-reco-ico-${r.type}`}
                      >
                        {r.type === "warn" ? (
                          <AlertCircle size={14} />
                        ) : r.type === "good" ? (
                          <CheckCircle size={14} />
                        ) : r.type === "info" ? (
                          <Info size={14} />
                        ) : (
                          <Lightbulb size={14} />
                        )}
                      </div>
                      <div className="tg-exam-pract-reco-text">
                        <strong>{r.title}</strong>
                        {r.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div>
              <div className="tg-exam-pract-section-lbl">
                <BarChart2 size={13} /> Practice History
              </div>
              <div className="tg-exam-pract-history-wrap">
                <div className="tg-exam-pract-hist-head">
                  <span>Exam</span>
                  <span>WPM</span>
                  <span>Acc</span>
                  <span className="tg-ep-hide-xs">KD</span>
                  <span>Result</span>
                  <span className="tg-ep-hide-xs">Date</span>
                </div>
                {history.slice(0, 10).map((h, i) => (
                  <div key={i} className="tg-exam-pract-hist-row">
                    <span className="tg-exam-pract-hist-exam">
                      {h.examName || "—"}
                    </span>
                    <span className="tg-exam-pract-hist-wpm">{h.wpm}</span>
                    <span>{h.accuracy}%</span>
                    <span className="tg-ep-hide-xs">{h.kd || "—"}</span>
                    <span
                      className={
                        h.passed
                          ? "tg-exam-pract-hist-pass"
                          : "tg-exam-pract-hist-fail"
                      }
                    >
                      {h.passed ? "✓ Pass" : "✗ Fail"}
                    </span>
                    <span className="tg-ep-hide-xs">
                      {new Date(h.date).toLocaleDateString()}
                    </span> 
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
