// ============================================================================
// WordInvasionGame.jsx
// ----------------------------------------------------------------------------
// Space Invaders–style: word-asteroids descend in waves. Type the word shown
// above an asteroid to destroy it with a laser beam. Waves get faster and
// more numerous. Miss too many and the planet is destroyed.
// Uses useSpawnerGame under the hood (treats "progress" as descent %).
// ============================================================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw, X, Trophy, Heart, Zap, Shield } from "lucide-react";
import GameAvatar from "../../../components/Games/Gameavatar";
import NextKeyBeacon from "../../../components/Games/Nextkeybeacon";
import useTypingGameEngine from "../../../components/Games/Usetypinggameengine";
import useGameAudio from "../../../components/Games/Usegameaudio";
import useSpawnerGame from "../../../components/Games/Usespawnergame";
import { DIFFICULTIES } from "../../../components/Games/Gamefallback";



// Wave labels
const WAVE_NAMES = [
  "Scout Wave",
  "Vanguard Fleet",
  "Destroyer Corps",
  "Dread Squadron",
  "Omega Armada",
];

// Laser beam visual state
const LASER_DURATION = 380;

export default function WordInvasionGame({
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
  const [wave, setWave] = useState(1);
  const [laserTarget, setLaserTarget] = useState(null); // {x, y} for beam animation
  const [explosions, setExplosions] = useState([]); // [{id, x, y}]
  const hurtTimerRef = useRef(null);
  const laserTimerRef = useRef(null);
  const waveRef = useRef(1);

  const flashAvatar = useCallback((s) => {
    setAvatarState(s);
    setPulseKey((k) => k + 1);
    clearTimeout(hurtTimerRef.current);
    if (s !== "idle") hurtTimerRef.current = setTimeout(() => setAvatarState("idle"), 260);
  }, []);

  // Track when words are completed to fire laser + explosion
  const containerRef = useRef(null);

  const onWordComplete = useCallback(
    (word) => {
      engine.wordComplete(word);
      flashAvatar("eat");
      play("eat");
      // bump wave every 5 words
      const newWords = (engine.wordsCompleted || 0) + 1;
      const newWave = Math.min(Math.floor(newWords / 5) + 1, WAVE_NAMES.length);
      if (newWave > waveRef.current) {
        waveRef.current = newWave;
        setWave(newWave);
        play("levelUp");
      }
    },
    [engine, flashAvatar, play]
  );

  // Wrap the spawner callbacks so we can intercept wordComplete
  const { items, activeItemId, timeLeft, handleKey } = useSpawnerGame({
    difficulty,
    sessionSeconds,
    maxOnScreen: Math.min(3 + wave, 7),
    status: engine.status,
    loseLife: engine.loseLife,
    wordComplete: onWordComplete,
    registerMistake: engine.registerMistake,
    end: engine.end,
    onAvatarState: flashAvatar,
    playSound: play,
  });

  useEffect(() => {
    engine.start();
    // eslint-disable-next-line
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
        gameId: "word-invasion",
        score: engine.score,
        maxCombo: engine.maxCombo,
        wordsCompleted: engine.wordsCompleted,
        mistakes: engine.mistakes,
        wave,
      });
    }
  }, [engine.status, engine, onFinish, wave]);

  const active = items.find((i) => i.id === activeItemId);

  // Lane columns for asteroids (0..2 mapped to left positions)
  const getLaneX = (lane) => `${lane * 68 + 8}%`;

  // Shield health bar (lives as shield pips)
  const maxLives = diff.lives;

  return (
    <div className="skg-game skg-invasion">
      {/* HUD */}
      <div className="skg-hud skv-hud">
        <button className="skg-icon-btn" onClick={onExit} aria-label="Exit">
          <X size={18} />
        </button>
        <div className="skg-hud-stat">
          <Trophy size={14} /> {engine.score}
        </div>
        <div className="skg-hud-stat skg-hud-combo">x{engine.combo}</div>
        <div className="skv-wave-badge">
          <Zap size={12} /> {WAVE_NAMES[Math.min(wave - 1, WAVE_NAMES.length - 1)]}
        </div>
        <div className="skv-shields">
          {Array.from({ length: maxLives }).map((_, i) => (
            <span
              key={i}
              className={`skv-shield-pip${i < engine.lives ? " skv-shield-on" : ""}`}
            />
          ))}
        </div>
        <div className="skg-hud-timer">{timeLeft}s</div>
      </div>

      {/* Space field */}
      <div className="skv-space" ref={containerRef}>
        {/* Starfield (pure CSS) */}
        <div className="skv-stars" />
        <div className="skv-stars skv-stars-2" />

        {/* Asteroids / word-ships */}
        {items.map((it) => (
          <div
            key={it.id}
            className={`skv-asteroid${it.id === activeItemId ? " skv-asteroid-active" : ""}`}
            style={{
              top: `${it.progress * 0.82}%`,
              left: getLaneX(Math.floor(it.lane * 3)),
            }}
          >
            <div className="skv-asteroid-shell">
              <div className="skv-asteroid-word">
                {it.word.split("").map((ch, i) => (
                  <span
                    key={i}
                    className={i < it.typedLen ? "skg-ch-done" : i === it.typedLen && it.id === activeItemId ? "skg-ch-current" : "skg-ch-pending"}
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Explosions */}
        {explosions.map((ex) => (
          <div key={ex.id} className="skv-explosion" style={{ left: ex.x, top: ex.y }} />
        ))}

        {/* Ground / planet defense line */}
        <div className="skv-planet-line">
          <div className="skv-defense-base">
            <GameAvatar
              avatar={avatar}
              state={avatarState}
              pulseKey={pulseKey}
              comboLevel={Math.min(Math.floor(engine.combo / 5), 3)}
              reduceMotion={settings.reduceMotion}
              size={80}
            />
            {settings.beaconOn && active && (
              <NextKeyBeacon
                nextChar={active.word[active.typedLen] || null}
                accent={avatar?.primary}
              />
            )}
          </div>
        </div>
      </div>

      {/* Game over */}
      {engine.status === "over" && (
        <div className="skg-overlay">
          <div className="skg-overlay-card skv-result-card">
            <div className="skv-result-icon">
              {engine.lives > 0 ? "🌍" : "💥"}
            </div>
            <div className="skg-overlay-title">
              {engine.lives > 0 ? "Invasion Repelled!" : "Planet Destroyed"}
            </div>
            <div className="skg-overlay-score">{engine.score} pts</div>
            <div className="skv-result-grid">
              <div className="skv-result-stat">
                <span className="skv-rs-label">Waves Survived</span>
                <span className="skv-rs-val">{wave}</span>
              </div>
              <div className="skv-result-stat">
                <span className="skv-rs-label">Best Combo</span>
                <span className="skv-rs-val">x{engine.maxCombo}</span>
              </div>
              <div className="skv-result-stat">
                <span className="skv-rs-label">Words Destroyed</span>
                <span className="skv-rs-val">{engine.wordsCompleted}</span>
              </div>
              <div className="skv-result-stat">
                <span className="skv-rs-label">Shield Breaches</span>
                <span className="skv-rs-val">{engine.mistakes}</span>
              </div>
            </div>
            <div className="skg-overlay-actions">
              <button className="skg-btn skg-btn-primary" onClick={onRestart}>
                <RotateCcw size={15} /> Defend Again
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