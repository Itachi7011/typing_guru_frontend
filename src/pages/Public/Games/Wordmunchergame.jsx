// ============================================================================
// WordMuncherGame.jsx  —  v2
// Pac-Man flavoured typing game. Ghost pressure on mistakes. Upgraded with:
//   • Best score / next-target in HUD
//   • Word "flies into mouth" eat animation
//   • Ultra-modern result overlay with stat grid
//   • skg-ch-current highlight on the active pellet
// ============================================================================
import React, { useState, useRef, useEffect, useCallback } from "react";
import { RotateCcw, X, Trophy, Heart, Ghost, TrendingUp, Target, Flame, Star } from "lucide-react";
import GameAvatar from "../../../components/Games/Gameavatar";
import NextKeyBeacon from "../../../components/Games/Nextkeybeacon";
import useTypingGameEngine from "../../../components/Games/Usetypinggameengine";
import useGameAudio from "../../../components/Games/Usegameaudio";
import { pickWords, DIFFICULTIES } from "../../../components/Games/Gamefallback";

const QUEUE_SIZE    = 6;
const REFILL_AT     = 3;
const PRESSURE_PER_MISS = 16;
const PRESSURE_DECAY    = 3;
const PRESSURE_MAX      = 100;

// ---- Score HUD strip -------------------------------------------------------
function ScoreStrip({ score, bestScore, combo, label }) {
  const isNewBest = score > bestScore && bestScore > 0;
  const nextTarget = bestScore > 0 ? Math.ceil(bestScore * 1.25 / 50) * 50 : 100;
  const progress   = Math.min((score / nextTarget) * 100, 100);

  return (
    <div className="skm-score-strip">
      <div className="skm-score-block">
        <span className="skm-score-label"><Trophy size={11}/> Score</span>
        <span className={`skm-score-val${isNewBest ? " skm-new-best" : ""}`}>{score}</span>
      </div>
      <div className="skm-score-block">
        <span className="skm-score-label"><Star size={11}/> Best</span>
        <span className="skm-score-val skm-best-val">{bestScore || "—"}</span>
      </div>
      <div className="skm-score-block skm-score-block-wide">
        <span className="skm-score-label"><Target size={11}/> Next: {nextTarget}</span>
        <div className="skm-target-bar">
          <div className="skm-target-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="skm-score-block">
        <span className="skm-score-label"><Flame size={11}/> Combo</span>
        <span className="skm-score-val skm-combo-val">×{combo}</span>
      </div>
    </div>
  );
}

// ---- Modern result overlay -------------------------------------------------
function ResultOverlay({ engine, bestScore, onRestart, onExit }) {
  const isNewBest  = engine.score > bestScore;
  const accuracy   = engine.wordsCompleted + engine.mistakes > 0
    ? Math.round((engine.wordsCompleted / (engine.wordsCompleted + engine.mistakes)) * 100)
    : 0;

  return (
    <div className="skg-overlay">
      <div className={`skg-overlay-card skm-result-card${isNewBest ? " skg-new-best" : ""}`}>
        {isNewBest && (
          <div className="skm-newbest-banner">
            <Trophy size={14} /> New Best Score!
          </div>
        )}
        <div className="skg-overlay-title">
          {engine.lives > 0 ? "Run Complete" : "Caught!"}
        </div>
        <div className="skg-overlay-score">{engine.score}</div>
        <div className="skg-overlay-sub">points earned</div>

        <div className="skm-stat-grid">
          <div className="skm-stat-cell">
            <span className="skm-stat-label">Words eaten</span>
            <span className="skm-stat-val">{engine.wordsCompleted}</span>
          </div>
          <div className="skm-stat-cell">
            <span className="skm-stat-label">Best combo</span>
            <span className="skm-stat-val">×{engine.maxCombo}</span>
          </div>
          <div className="skm-stat-cell">
            <span className="skm-stat-label">Mistakes</span>
            <span className="skm-stat-val skm-stat-mistakes">{engine.mistakes}</span>
          </div>
          <div className="skm-stat-cell">
            <span className="skm-stat-label">Accuracy</span>
            <span className="skm-stat-val skm-stat-acc">{accuracy}%</span>
          </div>
        </div>

        {bestScore > 0 && !isNewBest && (
          <div className="skm-prev-best">
            Best so far: <strong>{bestScore}</strong>
            {" "}— need <strong>{bestScore - engine.score}</strong> more to beat it
          </div>
        )}

        <div className="skg-overlay-actions">
          <button className="skg-btn skg-btn-primary" onClick={onRestart}>
            <RotateCcw size={15} /> Play Again
          </button>
          <button className="skg-btn skg-btn-ghost" onClick={onExit}>
            Back to Arcade
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
export default function WordMuncherGame({
  avatar, difficulty, sessionSeconds, settings,
  userData, onExit, onRestart, onFinish,
}) {
  const diff = DIFFICULTIES.find((d) => d.id === difficulty) || DIFFICULTIES[1];
  const { play } = useGameAudio({
    packId: settings.soundPackId,
    volume: settings.masterVolume,
    enabled: settings.soundOn,
  });
  const engine = useTypingGameEngine({ lives: diff.lives });

  const bestScore = userData?.gameStats?.["word-muncher"]?.bestScore || 0;

  const [queue,      setQueue]      = useState(() => pickWords(QUEUE_SIZE, difficulty));
  const [typedLen,   setTypedLen]   = useState(0);
  const [avatarState,setAvatarState]= useState("idle");
  const [pulseKey,   setPulseKey]   = useState(0);
  const [pressure,   setPressure]   = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(sessionSeconds);
  // word-fly-to-mouth animation key
  const [eatKey, setEatKey] = useState(null);

  const queueRef     = useRef(queue);
  const typedLenRef  = useRef(0);
  const pressureRef  = useRef(0);
  const hurtTimerRef = useRef(null);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { typedLenRef.current = typedLen; }, [typedLen]);

  useEffect(() => {
    engine.start();
    setTimeLeft(sessionSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flashAvatar = useCallback((s) => {
    setAvatarState(s);
    setPulseKey((k) => k + 1);
    clearTimeout(hurtTimerRef.current);
    if (s !== "idle") {
      hurtTimerRef.current = setTimeout(() => setAvatarState("idle"), 260);
    }
  }, []);

  // keyboard handling
  useEffect(() => {
    if (engine.status !== "running") return;
    const onKey = (e) => {
      if (e.key.length !== 1 && e.key !== " ") return;
      const word = queueRef.current[0];
      if (!word) return;
      const expected = word[typedLenRef.current];
      if (expected && e.key.toLowerCase() === expected.toLowerCase()) {
        const newLen = typedLenRef.current + 1;
        if (newLen >= word.length) {
          engine.wordComplete(word);
          flashAvatar("eat");
          play("eat");
          setEatKey((k) => (k ?? 0) + 1);   // triggers fly animation
          setTypedLen(0);
          setQueue((prev) => {
            const rest = prev.slice(1);
            if (rest.length <= REFILL_AT) {
              return [...rest, ...pickWords(QUEUE_SIZE - rest.length, difficulty)];
            }
            return rest;
          });
        } else {
          setTypedLen(newLen);
          flashAvatar("bite");
          play("bite");
        }
      } else {
        engine.registerMistake();
        flashAvatar("hurt");
        play("wrong");
        pressureRef.current = Math.min(PRESSURE_MAX, pressureRef.current + PRESSURE_PER_MISS);
        setPressure(pressureRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [engine, difficulty, play, flashAvatar]);

  // ghost pressure decay + catch
  useEffect(() => {
    if (engine.status !== "running") return;
    const id = setInterval(() => {
      pressureRef.current = Math.max(0, pressureRef.current - PRESSURE_DECAY);
      setPressure(pressureRef.current);
      if (pressureRef.current >= PRESSURE_MAX) {
        engine.loseLife();
        flashAvatar("hurt");
        play("wrong");
        pressureRef.current = 40;
        setPressure(40);
      }
    }, 400);
    return () => clearInterval(id);
  }, [engine, play, flashAvatar]);

  // session timer
  useEffect(() => {
    if (engine.status !== "running") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); engine.end(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [engine]);

  const finishedRef = useRef(false);
  useEffect(() => {
    if (engine.status === "over" && !finishedRef.current) {
      finishedRef.current = true;
      onFinish?.({
        gameId: "word-muncher",
        score: engine.score,
        maxCombo: engine.maxCombo,
        wordsCompleted: engine.wordsCompleted,
        mistakes: engine.mistakes,
      });
    }
  }, [engine.status, engine, onFinish]);

  const activeWord = queue[0] || "";
  const nextChar   = activeWord[typedLen] || null;

  // timer color
  const timerColor = timeLeft <= 10 ? "var(--skg-coral)" : timeLeft <= 20 ? "var(--skg-amber)" : undefined;

  return (
    <div className="skg-game skg-muncher">
      {/* HUD */}
      <div className="skg-hud">
        <button className="skg-icon-btn" onClick={onExit} aria-label="Exit">
          <X size={18} />
        </button>
        <div className="skg-hud-stat" style={{ color: "var(--skg-lime)" }}>
          <Trophy size={14} /> {engine.score}
        </div>
        <div className="skg-hud-stat skg-hud-combo">×{engine.combo}</div>
        {Array.from({ length: diff.lives }).map((_, i) => (
          <Heart
            key={i}
            size={15}
            fill={i < engine.lives ? "var(--skg-coral)" : "none"}
            color={i < engine.lives ? "var(--skg-coral)" : "var(--skg-text-dim)"}
          />
        ))}
        <div className="skg-hud-timer" style={{ color: timerColor }}>{timeLeft}s</div>
      </div>

      {/* Score strip */}
      <ScoreStrip
        score={engine.score}
        bestScore={bestScore}
        combo={engine.combo}
      />

      {/* Ghost pressure bar */}
      <div className="skg-muncher-pressure">
        <Ghost size={13} />
        <div className="skg-pressure-track">
          <div
            className="skg-pressure-fill"
            style={{ width: `${pressure}%` }}
          />
        </div>
        <span style={{ fontSize: "0.7rem", color: "var(--skg-text-muted)" }}>
          Ghost pressure
        </span>
      </div>

      {/* Typing lane */}
      <div className="skg-muncher-lane">
        <div className="skm-avatar-col">
          <GameAvatar
            avatar={avatar}
            state={avatarState}
            pulseKey={pulseKey}
            comboLevel={Math.min(Math.floor(engine.combo / 5), 3)}
            reduceMotion={settings.reduceMotion}
            size={88}
          />
          {settings.beaconOn && (
            <NextKeyBeacon nextChar={nextChar} accent={avatar?.primary} />
          )}
        </div>

        <div className="skg-muncher-pellets">
          {/* Word-fly animation wrapper */}
          <div
            className={eatKey != null ? "skm-word-fly" : ""}
            key={eatKey}
            style={{ display: "contents" }}
          >
            {activeWord.split("").map((ch, i) => (
              <span
                key={i}
                className={[
                  "skg-pellet",
                  i < typedLen ? "skg-pellet-eaten" : "",
                  i === typedLen ? "skg-pellet-next" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {ch}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming queue */}
      <div className="skg-muncher-queue">
        <span className="skm-queue-label">Up next:</span>
        {queue.slice(1, 5).map((w, i) => (
          <span
            key={`${w}-${i}`}
            className="skg-queue-chip"
            style={{ opacity: 1 - i * 0.2 }}
          >
            {w}
          </span>
        ))}
      </div>

      {engine.status === "over" && (
        <ResultOverlay
          engine={engine}
          bestScore={bestScore}
          onRestart={onRestart}
          onExit={onExit}
        />
      )}
    </div>
  );
}