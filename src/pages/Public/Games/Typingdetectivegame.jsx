// ============================================================================
// TypingDetectiveGame.jsx
// Genre: Detective / Puzzle — solve a procedurally generated mansion mystery
// by typing clues, searching rooms, unlocking safes, and questioning suspects.
// ============================================================================
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  X,
  RotateCcw,
  Search,
  Lock,
  MessageSquare,
  Eye,
  Trophy,
  Heart,
  Users,
  Monitor,
  Info,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import GameAvatar from "../../../components/Games/Gameavatar";
import useGameAudio from "../../../components/Games/Usegameaudio";

// ── Data pools ───────────────────────────────────────────────────────────────
const SUSPECTS = ["Butler", "Gardener", "Maid", "Chef", "Guest", "Driver"];
const ROOMS = ["Library", "Kitchen", "Cellar", "Study", "Ballroom", "Attic"];
const OBJECTS = [
  "candle",
  "letter",
  "dagger",
  "poison",
  "mask",
  "journal",
  "glove",
  "clock",
  "mirror",
  "ring",
  "key",
  "rope",
];
const MOTIVES = ["jealousy", "greed", "revenge", "blackmail", "inheritance"];
const PASSWORDS = [
  "midnight",
  "crimson",
  "shadow",
  "velvet",
  "eclipse",
  "phantom",
  "silence",
  "wraith",
];
const CLUE_FRAGMENTS = [
  "blood on the carpet",
  "broken window latch",
  "missing silver spoon",
  "torn photograph",
  "strange footprints",
  "overturned inkwell",
  "wax seal on envelope",
  "half-burned note",
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rnd(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Mystery generator ────────────────────────────────────────────────────────
function generateMystery() {
  const suspect = rnd(SUSPECTS);
  const room = rnd(ROOMS);
  const object = rnd(OBJECTS);
  const motive = rnd(MOTIVES);
  const password = rnd(PASSWORDS);
  const clues = shuffle(CLUE_FRAGMENTS).slice(0, 4);

  // 5 stages: search 2 rooms → find 2 clues → unlock safe → question suspect → accuse
  return {
    suspect,
    room,
    object,
    motive,
    password,
    clues,
    stages: [
      {
        type: "search",
        instruction: `Search the ${room} — type the room name to enter`,
        target: room.toLowerCase(),
        label: `🚪 Search Room`,
        hint: room.toLowerCase(),
        description: `You suspect the ${room} holds evidence. Type the room name to search it.`,
      },
      {
        type: "clue",
        instruction: `Examine the ${object} — type it to inspect`,
        target: object,
        label: `🔍 Examine Clue`,
        hint: object,
        description: `You spot a ${object} on the floor. Type it to pick it up and examine it.`,
      },
      {
        type: "search",
        instruction: `Type the clue: "${clues[0]}" — type the first word`,
        target: clues[0].split(" ")[0],
        label: `📝 Note Clue`,
        hint: clues[0].split(" ")[0],
        description: `Your notebook shows: "${clues[0]}". Type the first keyword to record it.`,
      },
      {
        type: "safe",
        instruction: `Crack the safe — type the password`,
        target: password,
        label: `🔒 Crack Safe`,
        hint: password,
        description: `A locked safe is hidden behind a painting. The password is hidden in your notes. Type it!`,
        revealHint: true,
      },
      {
        type: "question",
        instruction: `Question the ${suspect} — type their name`,
        target: suspect.toLowerCase(),
        label: `💬 Question Suspect`,
        hint: suspect.toLowerCase(),
        description: `The ${suspect} is acting suspiciously. Type their name to confront them.`,
      },
      {
        type: "accuse",
        instruction: `Accuse! Type the motive: "${motive}"`,
        target: motive,
        label: `⚖️ Make Accusation`,
        hint: motive,
        description: `You have all the evidence. The motive was ${motive}. Type it to close the case!`,
      },
    ],
  };
}

// ── Tooltip ──────────────────────────────────────────────────────────────────
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

// ── Target word with per-char highlight ──────────────────────────────────────
function TypeTarget({ target, typedLen, shake }) {
  return (
    <div className={`sktd-target-word${shake ? " sktd-shake" : ""}`}>
      {target.split("").map((ch, i) => (
        <span
          key={i}
          className={
            i < typedLen
              ? "sktd-ch-done"
              : i === typedLen
                ? "sktd-ch-current"
                : "sktd-ch-pending"
          }
        >
          {ch}
        </span>
      ))}
    </div>
  );
}

// ── Lobby ────────────────────────────────────────────────────────────────────
function Lobby({ onStart, onExit }) {
  return (
    <div className="skr-lobby">
      <div className="skr-lobby-card sktd-lobby-card">
        <div className="skr-lobby-title">🔍 Typing Detective</div>
        <p className="skr-lobby-sub">
          Solve a randomly generated mansion mystery by typing clues, passwords,
          and accusations.
        </p>
        <div className="skr-lobby-section">
          <div className="skr-lobby-label">
            Mode <Tip text="Multiplayer detective mode coming soon!" />
          </div>
          <div className="skr-mode-pills">
            <button className="skr-mode-pill skr-mode-active">
              <Monitor size={14} /> Solo Investigation
            </button>
            <button className="skr-mode-pill skr-mode-soon" disabled>
              <Users size={14} /> Co-op{" "}
              <span className="skr-soon-badge">Soon</span>
            </button>
          </div>
        </div>
        <div className="sktd-feature-grid">
          {[
            "Search rooms",
            "Examine clues",
            "Crack safes",
            "Question suspects",
            "Make accusations",
          ].map((f) => (
            <div key={f} className="sktd-feature-chip">
              ✓ {f}
            </div>
          ))}
        </div>
        <div className="skr-lobby-actions">
          <button className="skg-btn skg-btn-primary" onClick={onStart}>
            Begin Investigation <ChevronRight size={16} />
          </button>
          <button className="skg-btn skg-btn-ghost" onClick={onExit}>
            Back to Arcade
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function TypingDetectiveGame({
  avatar,
  difficulty,
  sessionSeconds,
  settings,
  onExit,
  onRestart,
  onFinish,
}) {
  const { play } = useGameAudio({
    packId: settings?.soundPackId ?? "chime",
    volume: settings?.masterVolume ?? 0.7,
    enabled: settings?.soundOn ?? true,
  });

  const [phase, setPhase] = useState("lobby");
  const [mystery, setMystery] = useState(null);
  const [stage, setStage] = useState(0);
  const [typedLen, setTypedLen] = useState(0);
  const [shake, setShake] = useState(false);
  const [lives, setLives] = useState(5);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [avatarState, setAvatarState] = useState("idle");
  const [pulseKey, setPulseKey] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(sessionSeconds);
  const [solvedStages, setSolvedStages] = useState([]);
  const [log, setLog] = useState([
    "🔍 A body has been found in the mansion...",
  ]);

  const hurtRef = useRef(null);
  const finishedRef = useRef(false);
  const typedRef = useRef(0);

  const startGame = useCallback(() => {
    const m = generateMystery();
    setMystery(m);
    setStage(0);
    setTypedLen(0);
    setLives(5);
    setScore(0);
    setCombo(0);
    setShowHint(false);
    setSolvedStages([]);
    setLog([
      "🔍 A body has been found in the mansion. The detective has arrived...",
    ]);
    finishedRef.current = false;
    setPhase("playing");
  }, []);

  const flash = useCallback((s) => {
    setAvatarState(s);
    setPulseKey((k) => k + 1);
    clearTimeout(hurtRef.current);
    if (s !== "idle")
      hurtRef.current = setTimeout(() => setAvatarState("idle"), 280);
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    setTimeLeft(sessionSeconds);
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setPhase("over");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, sessionSeconds]);

  const currentStage = mystery?.stages[stage];
  const target = currentStage?.target ?? "";

  // Keyboard
  useEffect(() => {
    if (phase !== "playing" || !currentStage) return;
    const onKey = (e) => {
      if (e.key.length !== 1 && e.key !== " ") return;
      const idx = typedRef.current;
      const expected = target[idx];
      if (!expected) return;

      if (e.key.toLowerCase() === expected.toLowerCase()) {
        const newLen = idx + 1;
        typedRef.current = newLen;
        setTypedLen(newLen);
        flash("bite");
        play("bite");

        if (newLen >= target.length) {
          // Stage complete
          const pts = target.length * 20 + combo * 5;
          setScore((s) => s + pts);
          setCombo((c) => c + 1);
          setSolvedStages((p) => [...p, stage]);
          setLog((l) => [
            ...l,
            `✅ ${currentStage.label} — solved! (+${pts} pts)`,
          ]);
          flash("eat");
          play("eat");

          if (stage + 1 >= mystery.stages.length) {
            setPhase("over");
          } else {
            setStage((s) => s + 1);
            typedRef.current = 0;
            setTypedLen(0);
            setShowHint(false);
          }
        }
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 320);
        setCombo(0);
        flash("hurt");
        play("wrong");
        setLives((l) => {
          const nl = l - 1;
          if (nl <= 0) setPhase("over");
          return Math.max(0, nl);
        });
        setLog((l) => [...l, `❌ Wrong key — be careful!`]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, target, currentStage, stage, combo, flash, play, mystery]);

  // Emit result
  useEffect(() => {
    if (phase !== "over" || finishedRef.current) return;
    finishedRef.current = true;
    const solved = stage >= (mystery?.stages.length ?? 0);
    onFinish?.({
      gameId: "typing-detective",
      score,
      maxCombo: combo,
      wordsCompleted: solvedStages.length,
      mistakes: 5 - lives,
      solved,
    });
  }, [phase]);

  if (phase === "lobby")
    return (
      <div className="skg-game skg-detective">
        <Lobby onStart={startGame} onExit={onExit} />
      </div>
    );

  const solved = stage >= (mystery?.stages.length ?? 0);
  const timerColor =
    timeLeft <= 10
      ? "var(--skg-coral)"
      : timeLeft <= 20
        ? "var(--skg-amber)"
        : undefined;

  return (
    <div className="skg-game skg-detective">
      {/* HUD */}
      <div className="skg-hud">
        <button className="skg-icon-btn" onClick={onExit}>
          <X size={18} />
        </button>
        <div className="skg-hud-stat" style={{ color: "var(--skg-lime)" }}>
          <Trophy size={14} /> {score}
        </div>
        <div className="skg-hud-stat skg-hud-combo">×{combo}</div>
        <div className="skg-hud-stat">
          {Array.from({ length: 5 }).map((_, i) => (
            <Heart
              key={i}
              size={14}
              fill={i < lives ? "var(--skg-coral)" : "none"}
              color={i < lives ? "var(--skg-coral)" : "var(--skg-text-dim)"}
            />
          ))}
        </div>
        <div className="skg-hud-stat">
          Stage {Math.min(stage + 1, mystery?.stages.length ?? 1)}/
          {mystery?.stages.length ?? 6}
        </div>
        <div className="skg-hud-timer" style={{ color: timerColor }}>
          {timeLeft}s
        </div>
      </div>

      <div className="sktd-layout">
        {/* Left: case board */}
        <div className="sktd-board">
          <div className="sktd-board-title">📋 Case Board</div>
          {mystery?.stages.map((s, i) => (
            <div
              key={i}
              className={`sktd-stage-row${i === stage ? " sktd-stage-active" : ""}${solvedStages.includes(i) ? " sktd-stage-done" : ""}`}
            >
              <span className="sktd-stage-icon">
                {solvedStages.includes(i) ? "✅" : i === stage ? "▶" : "○"}
              </span>
              <span className="sktd-stage-name">{s.label}</span>
            </div>
          ))}
          <div className="sktd-mystery-card">
            <div className="sktd-mc-row">
              <span>Suspect:</span> <strong>{mystery?.suspect}</strong>
            </div>
            <div className="sktd-mc-row">
              <span>Room:</span> <strong>{mystery?.room}</strong>
            </div>
            <div className="sktd-mc-row">
              <span>Clues found:</span> <strong>{solvedStages.length}</strong>
            </div>
          </div>
        </div>

        {/* Center: current task */}
        <div className="sktd-main">
          {currentStage && !solved && (
            <>
              <div className="sktd-scene-label">{currentStage.label}</div>
              <div className="sktd-description">{currentStage.description}</div>

              <div className="sktd-type-area">
                <div className="sktd-type-prompt">Type to continue:</div>
                <TypeTarget target={target} typedLen={typedLen} shake={shake} />
                <div className="sktd-char-guide">
                  <span className="sktd-guide-done">■ typed</span>
                  <span className="sktd-guide-current">■ type this next</span>
                  <span className="sktd-guide-pending">■ coming up</span>
                </div>
              </div>

              <div className="sktd-hint-row">
                <button
                  className="sktd-hint-btn"
                  onClick={() => setShowHint((h) => !h)}
                >
                  <Lightbulb size={13} /> {showHint ? "Hide hint" : "Show hint"}
                </button>
                {showHint && (
                  <div className="sktd-hint-text">
                    Type: <strong>{currentStage.hint}</strong>
                  </div>
                )}
              </div>

              <div className="sktd-avatar-row">
                <GameAvatar
                  avatar={avatar}
                  state={avatarState}
                  pulseKey={pulseKey}
                  comboLevel={Math.min(Math.floor(combo / 3), 3)}
                  size={72}
                  reduceMotion={settings?.reduceMotion}
                />
                <div className="sktd-avatar-speech">
                  {avatarState === "hurt"
                    ? "Hmm, wrong key..."
                    : "Keep going, detective!"}
                </div>
              </div>
            </>
          )}

          {solved && phase !== "over" && (
            <div className="sktd-solved-banner">
              <div className="sktd-solved-icon">🎉</div>
              <div className="sktd-solved-title">Case Solved!</div>
            </div>
          )}
        </div>

        {/* Right: detective log */}
        <div className="sktd-log">
          <div className="sktd-log-title">🗒 Detective Log</div>
          <div className="sktd-log-entries">
            {log.slice(-8).map((entry, i) => (
              <div key={i} className="sktd-log-entry">
                {entry}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      {phase === "over" && (
        <div className="skg-overlay">
          <div className="skg-overlay-card sktd-result-card">
            <div className="sktd-result-icon">{solved ? "🏆" : "💀"}</div>
            <div className="skg-overlay-title">
              {solved ? "Case Closed!" : "Case Unsolved"}
            </div>
            <div className="skg-overlay-score">{score}</div>
            <div className="skg-overlay-sub">
              pts · {solvedStages.length}/{mystery?.stages.length} stages
            </div>
            <div className="skm-stat-grid">
              <div className="skm-stat-cell">
                <span className="skm-stat-label">Clues found</span>
                <span className="skm-stat-val">{solvedStages.length}</span>
              </div>
              <div className="skm-stat-cell">
                <span className="skm-stat-label">Best combo</span>
                <span className="skm-stat-val">×{combo}</span>
              </div>
              <div className="skm-stat-cell">
                <span className="skm-stat-label">Wrong keys</span>
                <span className="skm-stat-val skm-stat-mistakes">
                  {5 - lives}
                </span>
              </div>
              <div className="skm-stat-cell">
                <span className="skm-stat-label">Lives left</span>
                <span className="skm-stat-val skm-stat-acc">{lives}/5</span>
              </div>
            </div>
            {solved && (
              <div className="sktd-verdict">
                Verdict: <strong>{mystery?.suspect}</strong> did it in the{" "}
                <strong>{mystery?.room}</strong> out of{" "}
                <strong>{mystery?.motive}</strong>.
              </div>
            )}
            <div className="skg-overlay-actions">
              <button className="skg-btn skg-btn-primary" onClick={onRestart}>
                <RotateCcw size={15} /> New Mystery
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
