// ============================================================================
// useSpawnerGame.js
// ----------------------------------------------------------------------------
// Shared engine for any game shaped like "items spawn, travel along one
// axis, and must be fully typed before they finish travelling". Falling
// Feast, Bubble Buffet and Runner Rush all use this — only the CSS/JSX that
// maps an item's `progress` (0 → 100) and `lane` (0 → 1) onto screen
// coordinates differs between them. A future 5th/6th game can reuse this
// hook too instead of reinventing spawn/travel logic.
//
// All callbacks (engine functions, sound, avatar state) are mirrored into a
// ref and read from there inside intervals/timeouts, so re-renders in the
// parent component never reset or duplicate a running timer.
// ============================================================================
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { pickWords, DIFFICULTIES } from "./Gamefallback";

let _uid = 0;
const nextId = () => `sp-${++_uid}`;

export default function useSpawnerGame({
  difficulty = "medium",
  sessionSeconds = 60,
  maxOnScreen = 5,
  status, // 'idle' | 'running' | 'over' — comes from useTypingGameEngine
  loseLife,
  wordComplete,
  registerMistake,
  end,
  onAvatarState,
  playSound,
}) {
  const diff = DIFFICULTIES.find((d) => d.id === difficulty) || DIFFICULTIES[1];
  const [items, setItems] = useState([]);
  const [timeLeft, setTimeLeft] = useState(sessionSeconds);

  const itemsRef = useRef([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Everything here can change every render without disturbing a single
  // running timer — only `status`, `difficulty`, `sessionSeconds` and
  // `maxOnScreen` are allowed to restart effects below.
  const fnRef = useRef({});
  useEffect(() => {
    fnRef.current = { loseLife, wordComplete, registerMistake, end, onAvatarState, playSound };
  }, [loseLife, wordComplete, registerMistake, end, onAvatarState, playSound]);

  const travelMs = 6500 / diff.speed;

  // ---- spawn loop ----------------------------------------------------------
  useEffect(() => {
    if (status !== "running") return;
    let alive = true;
    let timer = null;
    const tick = () => {
      if (!alive) return;
      if (itemsRef.current.length < maxOnScreen) {
        const [word] = pickWords(1, difficulty);
        setItems((prev) => [
          ...prev,
          { id: nextId(), word, typedLen: 0, progress: 0, lane: Math.random() },
        ]);
      }
      timer = setTimeout(tick, diff.spawnMs * (0.8 + Math.random() * 0.4));
    };
    timer = setTimeout(tick, 350);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [status, difficulty, maxOnScreen, diff.spawnMs]);

  // ---- travel/progress loop ------------------------------------------------
  useEffect(() => {
    if (status !== "running") return;
    const stepMs = 60;
    const inc = (stepMs / travelMs) * 100;
    const id = setInterval(() => {
      setItems((prev) => {
        const out = [];
        for (const it of prev) {
          const p = it.progress + inc;
          if (p >= 100) {
            // missed — ran the full distance without being finished
            fnRef.current.loseLife?.();
            fnRef.current.onAvatarState?.("hurt");
            fnRef.current.playSound?.("wrong");
            continue;
          }
          out.push({ ...it, progress: p });
        }
        return out;
      });
    }, stepMs);
    return () => clearInterval(id);
  }, [status, travelMs]);

  // ---- session countdown ---------------------------------------------------
  useEffect(() => {
    if (status !== "running") return;
    setTimeLeft(sessionSeconds);
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          fnRef.current.end?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [status, sessionSeconds]);

  // most "urgent" item — furthest along its travel — used to highlight it
  const activeItemId = useMemo(() => {
    if (!items.length) return null;
    return items.reduce((a, b) => (b.progress > a.progress ? b : a)).id;
  }, [items]);

  // stable forever (reads everything from refs) — safe to use directly in a
  // window keydown listener without re-subscribing every tick
  const handleKey = useCallback((key) => {
    const list = itemsRef.current;
    if (!list.length) return;
    const active = list.reduce((a, b) => (b.progress > a.progress ? b : a));
    const expected = active.word[active.typedLen];
    if (!expected) return;
    if (key.toLowerCase() === expected.toLowerCase()) {
      const newLen = active.typedLen + 1;
      if (newLen >= active.word.length) {
        fnRef.current.wordComplete?.(active.word);
        fnRef.current.onAvatarState?.("eat");
        fnRef.current.playSound?.("eat");
        setItems((prev) => prev.filter((i) => i.id !== active.id));
      } else {
        fnRef.current.onAvatarState?.("bite");
        fnRef.current.playSound?.("bite");
        setItems((prev) =>
          prev.map((i) => (i.id === active.id ? { ...i, typedLen: newLen } : i)),
        );
      }
    } else {
      fnRef.current.registerMistake?.();
      fnRef.current.onAvatarState?.("hurt");
      fnRef.current.playSound?.("wrong");
    }
  }, []);

  return { items, activeItemId, timeLeft, handleKey };
}