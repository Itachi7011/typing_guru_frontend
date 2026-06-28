// ============================================================================
// FallingFeastGame.jsx  —  v2
// Words fall from the sky. Avatar at the floor catches/eats them.
// Upgraded: best-score HUD strip, word-flies-into-mouth on complete,
// skg-ch-current letter highlight, modern result overlay.
// ============================================================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw, X, Trophy, Heart, TrendingUp, Target, Flame, Star } from "lucide-react";
import GameAvatar from "../../../components/Games/Gameavatar";
import NextKeyBeacon from "../../../components/Games/Nextkeybeacon";
import useTypingGameEngine from "../../../components/Games/Usetypinggameengine";
import useGameAudio from "../../../components/Games/Usegameaudio";
import useSpawnerGame from "../../../components/Games/Usespawnergame";
import { DIFFICULTIES } from "../../../components/Games/Gamefallback";

// ---- Shared score strip (same shape as muncher) ----------------------------
function ScoreStrip({ score, bestScore, combo }) {
  const nextTarget = bestScore > 0 ? Math.ceil(bestScore * 1.25 / 50) * 50 : 100;
  const progress   = Math.min((score / nextTarget) * 100, 100);
  const isNewBest  = score > bestScore && bestScore > 0;
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

// ---- Ultra-modern result overlay -------------------------------------------
function ResultOverlay({ engine, bestScore, onRestart, onExit }) {
  const isNewBest = engine.score > bestScore;
  const accuracy  = engine.wordsCompleted + engine.mistakes > 0
    ? Math.round((engine.wordsCompleted / (engine.wordsCompleted + engine.mistakes)) * 100)
    : 0;
  return (
    <div className="skg-overlay">
      <div className={`skg-overlay-card${isNewBest ? " skg-new-best" : ""}`}>
        {isNewBest && (
          <div className="skm-newbest-banner"><Trophy size={14}/> New Best Score!</div>
        )}
        <div className="skg-overlay-title">Feast Over</div>
        <div className="skg-overlay-score">{engine.score}</div>
        <div className="skg-overlay-sub">points earned</div>
        <div className="skm-stat-grid">
          <div className="skm-stat-cell">
            <span className="skm-stat-label">Words caught</span>
            <span className="skm-stat-val">{engine.wordsCompleted}</span>
          </div>
          <div className="skm-stat-cell">
            <span className="skm-stat-label">Best combo</span>
            <span className="skm-stat-val">×{engine.maxCombo}</span>
          </div>
          <div className="skm-stat-cell">
            <span className="skm-stat-label">Dropped</span>
            <span className="skm-stat-val skm-stat-mistakes">{engine.mistakes}</span>
          </div>
          <div className="skm-stat-cell">
            <span className="skm-stat-label">Accuracy</span>
            <span className="skm-stat-val skm-stat-acc">{accuracy}%</span>
          </div>
        </div>
        {bestScore > 0 && !isNewBest && (
          <div className="skm-prev-best">
            Best: <strong>{bestScore}</strong> — need <strong>{bestScore - engine.score}</strong> more
          </div>
        )}
        <div className="skg-overlay-actions">
          <button className="skg-btn skg-btn-primary" onClick={onRestart}>
            <RotateCcw size={15}/> Play Again
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
export default function FallingFeastGame({
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
  const bestScore = userData?.gameStats?.["falling-feast"]?.bestScore || 0;

  const [avatarState, setAvatarState] = useState("idle");
  const [pulseKey,    setPulseKey]    = useState(0);
  // track which word ids are "eating" (flying to mouth)
  const [eatingIds, setEatingIds] = useState(new Set());
  const hurtTimerRef = useRef(null);

  const flashAvatar = useCallback((s) => {
    setAvatarState(s);
    setPulseKey((k) => k + 1);
    clearTimeout(hurtTimerRef.current);
    if (s !== "idle") hurtTimerRef.current = setTimeout(() => setAvatarState("idle"), 260);
  }, []);

  // Wrap wordComplete to also trigger eat-fly animation
  const handleWordComplete = useCallback((word, itemId) => {
    engine.wordComplete(word);
    if (itemId) {
      setEatingIds((prev) => new Set([...prev, itemId]));
      setTimeout(() => {
        setEatingIds((prev) => { const n = new Set(prev); n.delete(itemId); return n; });
      }, 400);
    }
  }, [engine]);

  const { items, activeItemId, timeLeft, handleKey } = useSpawnerGame({
    difficulty,
    sessionSeconds,
    maxOnScreen: 5,
    status: engine.status,
    loseLife: engine.loseLife,
    wordComplete: engine.wordComplete,
    registerMistake: engine.registerMistake,
    end: engine.end,
    onAvatarState: flashAvatar,
    playSound: play,
  });

  useEffect(() => { engine.start(); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    if (engine.status !== "running") return;
    const onKey = (e) => {
      if (e.key.length !== 1 && e.key !== " ") return;
      handleKey(e.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [engine.status, handleKey]);

  const finishedRef = useRef(false);
  useEffect(() => {
    if (engine.status === "over" && !finishedRef.current) {
      finishedRef.current = true;
      onFinish?.({
        gameId: "falling-feast",
        score: engine.score,
        maxCombo: engine.maxCombo,
        wordsCompleted: engine.wordsCompleted,
        mistakes: engine.mistakes,
      });
    }
  }, [engine.status, engine, onFinish]);

  const active = items.find((i) => i.id === activeItemId);
  const timerColor = timeLeft <= 10 ? "var(--skg-coral)" : timeLeft <= 20 ? "var(--skg-amber)" : undefined;

  return (
    <div className="skg-game skg-falling">
      {/* HUD */}
      <div className="skg-hud">
        <button className="skg-icon-btn" onClick={onExit} aria-label="Exit">
          <X size={18}/>
        </button>
        <div className="skg-hud-stat" style={{ color: "var(--skg-lime)" }}>
          <Trophy size={14}/> {engine.score}
        </div>
        <div className="skg-hud-stat skg-hud-combo">×{engine.combo}</div>
        {Array.from({ length: diff.lives }).map((_, i) => (
          <Heart key={i} size={15}
            fill={i < engine.lives ? "var(--skg-coral)" : "none"}
            color={i < engine.lives ? "var(--skg-coral)" : "var(--skg-text-dim)"}
          />
        ))}
        <div className="skg-hud-timer" style={{ color: timerColor }}>{timeLeft}s</div>
      </div>

      {/* Score strip */}
      <ScoreStrip score={engine.score} bestScore={bestScore} combo={engine.combo} />

      {/* Sky arena */}
      <div className="skg-falling-sky">
        {items.map((it) => {
          const isActive = it.id === activeItemId;
          const isEating = eatingIds.has(it.id);
          return (
            <div
              key={it.id}
              className={[
                "skg-falling-word",
                isActive ? "skg-falling-active" : "",
                isEating ? "skg-word-eaten" : "",
              ].filter(Boolean).join(" ")}
              style={{
                top: `${it.progress}%`,
                left: `${it.lane * 78 + 6}%`,
                // fly toward the floor center where avatar sits
                "--fly-x": `${(50 - (it.lane * 78 + 6))}vw`,
                "--fly-y": `${(90 - it.progress) * 0.9}px`,
              }}
            >
              {it.word.split("").map((ch, i) => (
                <span
                  key={i}
                  className={
                    i < it.typedLen
                      ? "skg-ch-done"
                      : isActive && i === it.typedLen
                      ? "skg-ch-current"
                      : "skg-ch-pending"
                  }
                >
                  {ch}
                </span>
              ))}
            </div>
          );
        })}

        {/* Floor + avatar */}
        <div className="skg-falling-floor">
          <GameAvatar
            avatar={avatar}
            state={avatarState}
            pulseKey={pulseKey}
            comboLevel={Math.min(Math.floor(engine.combo / 5), 3)}
            reduceMotion={settings.reduceMotion}
            size={84}
          />
          {settings.beaconOn && active && (
            <NextKeyBeacon
              nextChar={active.word[active.typedLen] || null}
              accent={avatar?.primary}
            />
          )}
        </div>
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