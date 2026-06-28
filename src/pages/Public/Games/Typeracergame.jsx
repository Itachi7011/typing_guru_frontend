// ============================================================================
// TypeRacerGame.jsx  —  v3  (keyboard fixed, AI count selector, coming soon MP)
// ============================================================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  RotateCcw,
  X,
  Trophy,
  Flag,
  Zap,
  Users,
  Monitor,
  ChevronRight,
  Info,
} from "lucide-react";
import GameAvatar from "../../../components/Games/Gameavatar";
import useGameAudio from "../../../components/Games/Usegameaudio";
import { pickWords } from "../../../components/Games/Gamefallback";

const CHARS_PER_WPM = 5;
const TOTAL_LAPS = 3;

const ALL_AI = [
  { name: "Nitro", color: "#ff4d6d", wpm: 32, variance: 6 },
  { name: "Blaze", color: "#fbbf24", wpm: 48, variance: 8 },
  { name: "Phantom", color: "#a78bfa", wpm: 62, variance: 10 },
  { name: "Turbo", color: "#22e6c5", wpm: 78, variance: 12 },
];

function buildPassage(difficulty) {
  return pickWords(36, difficulty).join(" ");
}

// ── Tooltip ─────────────────────────────────────────────────────────────────
function Tip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="skr-tip-wrap"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Info size={13} className="skr-tip-icon" />
      {show && <span className="skr-tooltip">{text}</span>}
    </span>
  );
}

// ── Track bar ────────────────────────────────────────────────────────────────
function TrackRow({ label, wpm, color, progress, lap, isPlayer }) {
  return (
    <div className={`skr-racer-row${isPlayer ? " skr-racer-row-player" : ""}`}>
      <div className="skr-racer-info">
        <span style={{ fontSize: "1rem" }}>{isPlayer ? "🏎️" : "🚗"}</span>
        <span className="skr-racer-name" style={isPlayer ? { color } : {}}>
          {label}
        </span>
        <span className="skr-racer-lap">L{Math.min(lap + 1, TOTAL_LAPS)}</span>
      </div>
      <div className="skr-track-bar">
        <div
          className="skr-track-fill"
          style={{
            width: `${progress}%`,
            background: color,
            boxShadow: isPlayer ? `0 0 10px ${color}88` : "none",
          }}
        />
        <span
          className="skr-car-icon"
          style={{ left: `clamp(0%, ${progress}%, 96%)`, color }}
        >
          {isPlayer ? "🏎" : "🚗"}
        </span>
      </div>
      <span className="skr-racer-wpm" style={{ color }}>
        {wpm} WPM
      </span>
    </div>
  );
}

// ── Pre-game lobby ───────────────────────────────────────────────────────────
function Lobby({ onStart, onExit, difficulty }) {
  const [aiCount, setAiCount] = useState(2);
  return (
    <div className="skr-lobby">
      <div className="skr-lobby-card">
        <div className="skr-lobby-title">🏁 Type Racer</div>
        <p className="skr-lobby-sub">
          Race against AI opponents. Your WPM = your speed.
        </p>

        <div className="skr-lobby-section">
          <div className="skr-lobby-label">
            Mode
            <Tip text="Multiplayer racing is coming soon!" />
          </div>
          <div className="skr-mode-pills">
            <button className="skr-mode-pill skr-mode-active">
              <Monitor size={14} /> vs AI
            </button>
            <button className="skr-mode-pill skr-mode-soon" disabled>
              <Users size={14} /> Multiplayer
              <span className="skr-soon-badge">Soon</span>
            </button>
          </div>
        </div>

        <div className="skr-lobby-section">
          <div className="skr-lobby-label">
            AI Opponents
            <Tip text="Choose how many AI racers to compete against (1–4)." />
          </div>
          <div className="skr-ai-count-row">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                className={`skr-count-btn${aiCount === n ? " skr-count-active" : ""}`}
                onClick={() => setAiCount(n)}
              >
                {n} AI
              </button>
            ))}
          </div>
          <div className="skr-ai-preview">
            {ALL_AI.slice(0, aiCount).map((ai) => (
              <span
                key={ai.name}
                className="skr-ai-chip"
                style={{ borderColor: ai.color, color: ai.color }}
              >
                {ai.name} ~{ai.wpm} WPM
              </span>
            ))}
          </div>
        </div>

        <div className="skr-lobby-actions">
          <button
            className="skg-btn skg-btn-primary skr-start-btn"
            onClick={() => onStart(aiCount)}
          >
            Start Race <ChevronRight size={16} />
          </button>
          <button className="skg-btn skg-btn-ghost" onClick={onExit}>
            Back to Arcade
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function TypeRacerGame({
  avatar,
  difficulty,
  sessionSeconds,
  settings,
  onExit,
  onRestart,
  onFinish,
}) {
  const { play } = useGameAudio({
    packId: settings?.soundPackId ?? "arcade",
    volume: settings?.masterVolume ?? 0.7,
    enabled: settings?.soundOn ?? true,
  });

  const [phase, setPhase] = useState("lobby"); // lobby | countdown | running | over
  const [aiCount, setAiCount] = useState(2);
  const [countdown, setCountdown] = useState(3);

  const [passage, setPassage] = useState("");
  const [typedIndex, setTypedIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [playerWPM, setPlayerWPM] = useState(0);
  const [playerLap, setPlayerLap] = useState(0);
  const [avatarState, setAvatarState] = useState("idle");
  const [pulseKey, setPulseKey] = useState(0);

  const [aiProgress, setAiProgress] = useState([]);
  const [aiWPM, setAiWPM] = useState([]);
  const [finishOrder, setFinishOrder] = useState([]);

  const startTimeRef = useRef(null);
  const finishRef = useRef([]);
  const maxComboRef = useRef(0);
  const mistakesRef = useRef(0);
  const finishedRef = useRef(false);
  const hurtTimerRef = useRef(null);
  const typedIndexRef = useRef(0);
  const comboRef = useRef(0);
  const playerLapRef = useRef(0);
  const charsPerLapRef = useRef(1);

  // Keep refs in sync
  useEffect(() => {
    typedIndexRef.current = typedIndex;
  }, [typedIndex]);
  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);
  useEffect(() => {
    playerLapRef.current = playerLap;
  }, [playerLap]);

  const activeAI = ALL_AI.slice(0, aiCount);

  // ── Start race ─────────────────────────────────────────────────────────────
  const handleStart = useCallback(
    (count) => {
      const p = buildPassage(difficulty);
      setPassage(p);
      charsPerLapRef.current = Math.ceil(p.length / TOTAL_LAPS);
      setAiCount(count);
      setAiProgress(Array(count).fill(0));
      setAiWPM(ALL_AI.slice(0, count).map((a) => a.wpm));
      setTypedIndex(0);
      setMistakes(0);
      setScore(0);
      setCombo(0);
      setPlayerWPM(0);
      setPlayerLap(0);
      finishRef.current = [];
      finishedRef.current = false;
      mistakesRef.current = 0;
      maxComboRef.current = 0;
      setFinishOrder([]);
      setCountdown(3);
      setPhase("countdown");
    },
    [difficulty],
  );

  // ── Countdown ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("running");
      startTimeRef.current = Date.now();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // ── AI movement ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "running") return;
    const total = passage.length;
    const id = setInterval(() => {
      setAiProgress((prev) =>
        prev.map((p, i) => {
          const ai = activeAI[i];
          const wpm = ai.wpm + (Math.random() - 0.5) * ai.variance;
          const inc = ((wpm * CHARS_PER_WPM) / 60 / (1000 / 80) / total) * 100;
          const np = Math.min(p + inc, 100);
          if (np >= 100 && !finishRef.current.includes(ai.name)) {
            finishRef.current = [...finishRef.current, ai.name];
            setFinishOrder([...finishRef.current]);
          }
          return np;
        }),
      );
      setAiWPM(
        activeAI.map((a) =>
          Math.round(a.wpm + (Math.random() - 0.5) * a.variance),
        ),
      );
    }, 80);
    return () => clearInterval(id);
  }, [phase, passage, activeAI]);

  // ── WPM calc ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 60000;
      if (elapsed > 0)
        setPlayerWPM(
          Math.round(typedIndexRef.current / CHARS_PER_WPM / elapsed),
        );
    }, 500);
    return () => clearInterval(id);
  }, [phase]);

  // ── Flash avatar ───────────────────────────────────────────────────────────
  const flash = useCallback((s) => {
    setAvatarState(s);
    setPulseKey((k) => k + 1);
    clearTimeout(hurtTimerRef.current);
    if (s !== "idle")
      hurtTimerRef.current = setTimeout(() => setAvatarState("idle"), 260);
  }, []);

  // ── Keyboard — THE FIX: read passage from ref, not closure ────────────────
  const passageRef = useRef("");
  useEffect(() => {
    passageRef.current = passage;
  }, [passage]);

  useEffect(() => {
    if (phase !== "running") return;
    const onKey = (e) => {
      if (e.key.length !== 1 && e.key !== " ") return;
      e.preventDefault();
      const p = passageRef.current;
      const idx = typedIndexRef.current;
      const expected = p[idx];
      if (!expected) return;

      if (e.key === expected) {
        const newIdx = idx + 1;
        typedIndexRef.current = newIdx;
        setTypedIndex(newIdx);

        const nc = comboRef.current + 1;
        comboRef.current = nc;
        maxComboRef.current = Math.max(maxComboRef.current, nc);
        setCombo(nc);
        setScore((s) => s + 10 + Math.min(nc * 2, 40));
        flash("bite");
        play("bite");

        // lap check
        const newLap = Math.min(
          Math.floor(newIdx / charsPerLapRef.current),
          TOTAL_LAPS - 1,
        );
        if (newLap > playerLapRef.current) {
          playerLapRef.current = newLap;
          setPlayerLap(newLap);
          flash("eat");
          play("combo");
        }

        // finished
        if (newIdx >= p.length) {
          if (!finishRef.current.includes("You")) {
            finishRef.current = ["You", ...finishRef.current];
            setFinishOrder([...finishRef.current]);
          }
          setPhase("over");
        }
      } else {
        mistakesRef.current += 1;
        comboRef.current = 0;
        setMistakes((m) => m + 1);
        setCombo(0);
        flash("hurt");
        play("wrong");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, flash, play]);

  // ── Session time limit ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "running") return;
    const id = setTimeout(() => setPhase("over"), sessionSeconds * 1000);
    return () => clearTimeout(id);
  }, [phase, sessionSeconds]);

  // ── Emit result ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "over" || finishedRef.current) return;
    finishedRef.current = true;
    const pos = finishRef.current.indexOf("You") + 1 || aiCount + 1;
    onFinish?.({
      gameId: "type-racer",
      score,
      maxCombo: maxComboRef.current,
      wordsCompleted: Math.floor(typedIndexRef.current / 5),
      mistakes: mistakesRef.current,
      position: pos,
      wpm: playerWPM,
    });
  }, [phase]);

  if (phase === "lobby") {
    return (
      <div className="skg-game skg-racer">
        <Lobby onStart={handleStart} onExit={onExit} difficulty={difficulty} />
      </div>
    );
  }

  const totalChars = passage.length;
  const playerProgress =
    totalChars > 0 ? Math.min((typedIndex / totalChars) * 100, 100) : 0;
  const isWinner = finishRef.current[0] === "You";
  const playerPos = finishRef.current.indexOf("You") + 1;

  // Passage render
  const passageEl = passage.split("").map((ch, i) => {
    const cls =
      i < typedIndex
        ? "skg-ch-done"
        : i === typedIndex
          ? "skg-ch-current"
          : "skg-ch-pending";
    return (
      <span key={i} className={cls}>
        {ch}
      </span>
    );
  });

  return (
    <div className="skg-game skg-racer">
      {/* HUD */}
      <div className="skg-hud">
        <button className="skg-icon-btn" onClick={onExit}>
          <X size={18} />
        </button>
        <div className="skg-hud-stat" style={{ color: "var(--skg-lime)" }}>
          <Trophy size={14} /> {score}
        </div>
        <div className="skg-hud-stat skg-hud-combo">×{combo}</div>
        <div className="skg-hud-stat skr-wpm-display">
          <Zap size={13} /> {playerWPM} WPM
        </div>
        <div className="skg-hud-stat">
          <Flag size={14} /> Lap {Math.min(playerLap + 1, TOTAL_LAPS)}/
          {TOTAL_LAPS}
        </div>
      </div>

      {/* Countdown */}
      {phase === "countdown" && (
        <div className="skr-countdown-overlay">
          <div className="skr-countdown-num">
            {countdown === 0 ? "GO!" : countdown}
          </div>
          <p className="skr-countdown-sub">Type the passage — spaces count!</p>
        </div>
      )}

      {/* Tracks */}
      <div className="skr-tracks">
        <TrackRow
          label="You"
          wpm={playerWPM}
          color={avatar?.primary || "#22e6c5"}
          progress={playerProgress}
          lap={playerLap}
          isPlayer
        />
        {activeAI.map((ai, i) => (
          <TrackRow
            key={ai.name}
            label={ai.name}
            wpm={aiWPM[i] || ai.wpm}
            color={ai.color}
            progress={aiProgress[i] || 0}
            lap={0}
            isPlayer={false}
          />
        ))}
      </div>

      {/* Typing zone */}
      <div className="skr-typing-zone">
        <div className="skr-avatar-area">
          <GameAvatar
            avatar={avatar}
            state={avatarState}
            pulseKey={pulseKey}
            comboLevel={Math.min(Math.floor(combo / 5), 3)}
            reduceMotion={settings?.reduceMotion}
            size={76}
          />
          <div className="skr-speed-label" style={{ color: avatar?.primary }}>
            {playerWPM} WPM
          </div>
        </div>
        <div className="skr-passage-wrap">
          {/* Cursor-line highlight on current word */}
          <div className="skr-passage">{passageEl}</div>
          <div className="skr-passage-hint">
            <span className="skr-hint-dot skg-ch-done" /> typed &nbsp;
            <span
              className="skr-hint-dot skg-ch-current"
              style={{ background: "var(--skg-cyan)" }}
            />{" "}
            next &nbsp;
            <span
              className="skr-hint-dot"
              style={{ background: "var(--skg-text-dim)" }}
            />{" "}
            pending
          </div>
        </div>
      </div>

      {/* Result */}
      {phase === "over" && (
        <div className="skg-overlay">
          <div
            className={`skg-overlay-card skr-result-card${isWinner ? " skr-winner" : ""}`}
          >
            {isWinner && (
              <div className="skr-winner-banner">🏆 RACE WINNER!</div>
            )}
            <div className="skr-result-pos">
              {playerPos
                ? `${playerPos}${["st", "nd", "rd"][playerPos - 1] || "th"} Place`
                : "DNF"}
            </div>
            <div className="skg-overlay-score">{score}</div>
            <div className="skg-overlay-sub">points</div>
            <div className="skr-result-stats">
              <div className="skr-stat-pill">
                <Zap size={12} /> {playerWPM} WPM
              </div>
              <div className="skr-stat-pill">×{maxComboRef.current} combo</div>
              <div className="skr-stat-pill">
                {mistakesRef.current} mistakes
              </div>
            </div>
            <div className="skr-finish-order">
              <div className="skr-finish-title">Finish Order</div>
              {[
                ...finishRef.current,
                ...activeAI
                  .map((a) => a.name)
                  .filter((n) => !finishRef.current.includes(n)),
              ].map((name, i) => (
                <div
                  key={name}
                  className={`skr-finish-row${name === "You" ? " skr-finish-you" : ""}`}
                >
                  <span className="skr-finish-rank">#{i + 1}</span>
                  <span>{name}</span>
                </div>
              ))}
            </div>
            <div className="skg-overlay-actions">
              <button className="skg-btn skg-btn-primary" onClick={onRestart}>
                <RotateCcw size={15} /> Race Again
              </button>
              <button className="skg-btn skg-btn-ghost" onClick={onExit}>
                Back to Arcade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
