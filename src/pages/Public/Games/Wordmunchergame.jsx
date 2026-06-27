// ============================================================================
// WordMuncherGame.jsx
// ----------------------------------------------------------------------------
// Pacman-flavoured typing game: the avatar sits in front of a row of letter
// "pellets" (the current word) and eats one per correct keystroke. Finishing
// a word shifts the queue and serves up the next one. Mistakes don't cost a
// life directly — they build up "Ghost Pressure"; if it fills completely, a
// ghost catches you and you lose a life instead (and the pressure resets).
// ============================================================================
import React, { useState, useRef, useEffect, useCallback } from "react";
import { RotateCcw, X, Trophy, Heart, Ghost } from "lucide-react";
import GameAvatar from "../../../components/Games/Gameavatar";
import NextKeyBeacon from "../../../components/Games/Nextkeybeacon";
import useTypingGameEngine from "../../../components/Games/Usetypinggameengine";
import useGameAudio from "../../../components/Games/Usegameaudio";
import {pickWords,  DIFFICULTIES } from "../../../components/Games/Gamefallback";

const QUEUE_SIZE = 6;
const REFILL_AT = 3;
const PRESSURE_PER_MISS = 16;
const PRESSURE_DECAY = 3;
const PRESSURE_MAX = 100;

export default function WordMuncherGame({
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

  const [queue, setQueue] = useState(() => pickWords(QUEUE_SIZE, difficulty));
  const [typedLen, setTypedLen] = useState(0);
  const [avatarState, setAvatarState] = useState("idle");
  const [pulseKey, setPulseKey] = useState(0);
  const [pressure, setPressure] = useState(0);
  const [timeLeft, setTimeLeft] = useState(sessionSeconds);

  const queueRef = useRef(queue);
  const typedLenRef = useRef(0);
  const pressureRef = useRef(0);
  const hurtTimerRef = useRef(null);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  useEffect(() => {
    typedLenRef.current = typedLen;
  }, [typedLen]);

  useEffect(() => {
    engine.start();
    setTimeLeft(sessionSeconds);
    // run once on mount
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
        if (t <= 1) {
          clearInterval(id);
          engine.end();
          return 0;
        }
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
  const nextChar = activeWord[typedLen] || null;

  return (
    <div className="skg-game skg-muncher">
      <div className="skg-hud">
        <button className="skg-icon-btn" onClick={onExit} aria-label="Exit game">
          <X size={18} />
        </button>
        <div className="skg-hud-stat">
          <Trophy size={14} /> {engine.score}
        </div>
        <div className="skg-hud-stat skg-hud-combo">x{engine.combo}</div>
        <div className="skg-hud-stat">
          <Heart size={14} /> {engine.lives}
        </div>
        <div className="skg-hud-timer">{timeLeft}s</div>
      </div>

      <div className="skg-muncher-pressure">
        <Ghost size={13} />
        <div className="skg-pressure-track">
          <div className="skg-pressure-fill" style={{ width: `${pressure}%` }} />
        </div>
      </div>

      <div className="skg-muncher-lane">
        <GameAvatar
          avatar={avatar}
          state={avatarState}
          pulseKey={pulseKey}
          comboLevel={Math.min(Math.floor(engine.combo / 5), 3)}
          reduceMotion={settings.reduceMotion}
          size={88}
        />
        {settings.beaconOn && <NextKeyBeacon nextChar={nextChar} accent={avatar.primary} />}
        <div className="skg-muncher-pellets">
          {activeWord.split("").map((ch, i) => (
            <span
              key={i}
              className={`skg-pellet${i < typedLen ? " skg-pellet-eaten" : ""}${
                i === typedLen ? " skg-pellet-next" : ""
              }`}
            >
              {ch}
            </span>
          ))}
        </div>
      </div>

      <div className="skg-muncher-queue">
        {queue.slice(1, 5).map((w, i) => (
          <span key={`${w}-${i}`} className="skg-queue-chip" style={{ opacity: 1 - i * 0.18 }}>
            {w}
          </span>
        ))}
      </div>

      {engine.status === "over" && (
        <div className="skg-overlay">
          <div className="skg-overlay-card">
            <div className="skg-overlay-title">Run Complete</div>
            <div className="skg-overlay-score">{engine.score} pts</div>
            <div className="skg-overlay-sub">
              Best combo x{engine.maxCombo} • {engine.wordsCompleted} words eaten
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