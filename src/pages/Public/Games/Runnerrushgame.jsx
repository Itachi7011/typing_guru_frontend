// ============================================================================
// RunnerRushGame.jsx
// ----------------------------------------------------------------------------
// Horizontal variant of the same spawner engine: words approach the avatar
// from the right instead of falling or floating. Combo level visibly speeds
// up the scrolling ground via a CSS variable, giving "running faster" a
// purely CSS-driven feel without any extra physics code.
// ============================================================================
import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, X, Trophy, Heart, Wind } from "lucide-react";
import GameAvatar from "../../../components/Games/Gameavatar";
import NextKeyBeacon from "../../../components/Games/Nextkeybeacon";
import useTypingGameEngine from "../../../components/Games/Usetypinggameengine";
import useGameAudio from "../../../components/Games/Usegameaudio";
import useSpawnerGame from "../../../components/Games/Usespawnergame";
import { DIFFICULTIES } from "../../../components/Games/Gamefallback";

export default function RunnerRushGame({
  avatar,
  difficulty,
  sessionSeconds,
  settings,
  onExit,
  onRestart,
  onFinish,
}) {
  const diff = DIFFICULTIES.find((d) => d.id === difficulty) || DIFFICULTIES[1];
  const { play } = useGameAudio({
    packId: settings.soundPackId,
    volume: settings.masterVolume,
    enabled: settings.soundOn,
  });
  const engine = useTypingGameEngine({ lives: diff.lives });
  const [avatarState, setAvatarState] = useState("idle");
  const [pulseKey, setPulseKey] = useState(0);
  const hurtTimerRef = useRef(null);

  const flashAvatar = (s) => {
    setAvatarState(s);
    setPulseKey((k) => k + 1);
    clearTimeout(hurtTimerRef.current);
    if (s !== "idle") hurtTimerRef.current = setTimeout(() => setAvatarState("idle"), 260);
  };

  const { items, activeItemId, timeLeft, handleKey } = useSpawnerGame({
    difficulty,
    sessionSeconds,
    maxOnScreen: 4,
    status: engine.status,
    loseLife: engine.loseLife,
    wordComplete: engine.wordComplete,
    registerMistake: engine.registerMistake,
    end: engine.end,
    onAvatarState: flashAvatar,
    playSound: play,
  });

  useEffect(() => {
    engine.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        gameId: "runner-rush",
        score: engine.score,
        maxCombo: engine.maxCombo,
        wordsCompleted: engine.wordsCompleted,
        mistakes: engine.mistakes,
      });
    }
  }, [engine.status, engine, onFinish]);

  const active = items.find((i) => i.id === activeItemId);
  const speedLevel = Math.min(Math.floor(engine.combo / 5), 3);

  return (
    <div className="skg-game skg-runner" style={{ "--skg-track-speed": `${2.2 - speedLevel * 0.4}s` }}>
      <div className="skg-hud">
        <button className="skg-icon-btn" onClick={onExit} aria-label="Exit game">
          <X size={18} />
        </button>
        <div className="skg-hud-stat">
          <Trophy size={14} /> {engine.score}
        </div>
        <div className="skg-hud-stat skg-hud-combo">
          <Wind size={13} /> x{engine.combo}
        </div>
        <div className="skg-hud-stat">
          <Heart size={14} /> {engine.lives}
        </div>
        <div className="skg-hud-timer">{timeLeft}s</div>
      </div>

      <div className="skg-runner-track">
        <div className="skg-runner-ground" />
        <div className="skg-runner-avatar-spot">
          <GameAvatar
            avatar={avatar}
            state={avatarState}
            pulseKey={pulseKey}
            comboLevel={speedLevel}
            reduceMotion={settings.reduceMotion}
            size={80}
          />
          {settings.beaconOn && active && (
            <NextKeyBeacon nextChar={active.word[active.typedLen] || null} accent={avatar.primary} />
          )}
        </div>
        {items.map((it) => (
          <div
            key={it.id}
            className={`skg-runner-word${it.id === activeItemId ? " skg-runner-active" : ""}`}
            style={{ left: `${100 - it.progress}%`, top: `${18 + it.lane * 55}%` }}
          >
            {it.word.split("").map((ch, i) => (
              <span key={i} className={i < it.typedLen ? "skg-ch-done" : "skg-ch-pending"}>
                {ch}
              </span>
            ))}
          </div>
        ))}
      </div>

      {engine.status === "over" && (
        <div className="skg-overlay">
          <div className="skg-overlay-card">
            <div className="skg-overlay-title">Run Finished</div>
            <div className="skg-overlay-score">{engine.score} pts</div>
            <div className="skg-overlay-sub">
              Best combo x{engine.maxCombo} • {engine.wordsCompleted} snacks grabbed
            </div>
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
      )}
    </div>
  );
}