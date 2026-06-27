// ============================================================================
// useTypingGameEngine.js
// ----------------------------------------------------------------------------
// The "scoring brain" shared by every game on the page: score, combo, lives,
// mistakes and run status. Each game decides *how* words appear and travel
// (queue, falling, floating, running) but all of them report back into this
// same engine, so HUDs, game-over screens and the result payload sent to the
// backend are identical in shape no matter which game was played.
// ============================================================================
import { useState, useRef, useCallback } from "react";

export default function useTypingGameEngine({ lives: startLives = 4, onGameOver } = {}) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(startLives);
  const [mistakes, setMistakes] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | running | over

  const comboRef = useRef(0);
  const livesRef = useRef(startLives);
  const statusRef = useRef("idle");

  const start = useCallback(() => {
    comboRef.current = 0;
    livesRef.current = startLives;
    statusRef.current = "running";
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setMistakes(0);
    setWordsCompleted(0);
    setLives(startLives);
    setStatus("running");
  }, [startLives]);

  const wordComplete = useCallback((word) => {
    if (statusRef.current !== "running") return;
    comboRef.current += 1;
    const base = word.length * 10;
    const comboBonus = Math.min(comboRef.current * 2, 60);
    setCombo(comboRef.current);
    setMaxCombo((m) => Math.max(m, comboRef.current));
    setScore((s) => s + base + comboBonus);
    setWordsCompleted((w) => w + 1);
  }, []);

  const registerMistake = useCallback(() => {
    if (statusRef.current !== "running") return;
    comboRef.current = 0;
    setCombo(0);
    setMistakes((m) => m + 1);
  }, []);

  const loseLife = useCallback(() => {
    if (statusRef.current !== "running") return;
    comboRef.current = 0;
    setCombo(0);
    livesRef.current -= 1;
    setLives(Math.max(0, livesRef.current));
    if (livesRef.current <= 0) {
      statusRef.current = "over";
      setStatus("over");
      onGameOver?.();
    }
  }, [onGameOver]);

  const end = useCallback(() => {
    if (statusRef.current !== "running") return;
    statusRef.current = "over";
    setStatus("over");
  }, []);

  return {
    score,
    combo,
    maxCombo,
    lives,
    mistakes,
    wordsCompleted,
    status,
    start,
    wordComplete,
    registerMistake,
    loseLife,
    end,
  };
}