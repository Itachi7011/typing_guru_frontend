// ============================================================================
// useGameStats.js
// Unified stats persistence for ALL 14 games.
// - Guest mode: localStorage
// - Logged in: POST to /api/games/stats  +  localStorage mirror
//
// Usage:
//   const { stats, saveResult, getBest } = useGameStats(isAuthenticated);
//
// `saveResult(result)` accepts:
//   { gameId, score, maxCombo, wordsCompleted, mistakes, ...extra }
// ============================================================================
import { useState, useCallback, useEffect, useRef } from "react";

const LS_KEY_STATS = "swiftkeys_game_stats_v3";
const API_SAVE     = "/api/games/stats/save";
const API_LOAD     = "/api/games/stats/load";

function readLS() {
  try {
    const raw = localStorage.getItem(LS_KEY_STATS);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function writeLS(data) {
  try { localStorage.setItem(LS_KEY_STATS, JSON.stringify(data)); } catch {}
}

const EMPTY_STAT = () => ({
  bestScore: 0, lastScore: 0,
  gamesPlayed: 0, bestCombo: 0,
  totalWordsCompleted: 0, totalMistakes: 0,
  history: [],          // last 20 results
  achievements: [],
  extra: {},            // game-specific fields (wave, level, position…)
});

function mergeResult(prev = EMPTY_STAT(), result) {
  const isNewBest = result.score > prev.bestScore;
  const history   = [
    { ...result, ts: Date.now() },
    ...prev.history,
  ].slice(0, 20);
  return {
    bestScore:           isNewBest ? result.score : prev.bestScore,
    lastScore:           result.score,
    gamesPlayed:         prev.gamesPlayed + 1,
    bestCombo:           Math.max(prev.bestCombo, result.maxCombo || 0),
    totalWordsCompleted: prev.totalWordsCompleted + (result.wordsCompleted || 0),
    totalMistakes:       prev.totalMistakes + (result.mistakes || 0),
    history,
    achievements:        prev.achievements,
    extra:               { ...prev.extra, ...(result.extra || {}) },
    isNewBest,
  };
}

export default function useGameStats(isAuthenticated = false) {
  const [allStats, setAllStats] = useState(() => readLS());
  const pendingRef = useRef([]);         // queue results while offline
  const flushTimer = useRef(null);

  // Load from API on mount if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const r = await fetch(API_LOAD, { credentials: "include" });
        if (!r.ok) return;
        const { stats } = await r.json();
        if (!stats) return;
        // Merge server stats with local (server wins on bestScore)
        const merged = { ...readLS() };
        Object.entries(stats).forEach(([gid, srv]) => {
          const loc = merged[gid] || EMPTY_STAT();
          merged[gid] = {
            ...loc, ...srv,
            bestScore:  Math.max(loc.bestScore || 0, srv.bestScore || 0),
            bestCombo:  Math.max(loc.bestCombo || 0, srv.bestCombo || 0),
            history:    srv.history?.length ? srv.history : loc.history,
          };
        });
        writeLS(merged);
        setAllStats(merged);
      } catch { /* offline, use local */ }
    })();
  }, [isAuthenticated]);

  // Flush pending results to API
  const flush = useCallback(async () => {
    if (!isAuthenticated || pendingRef.current.length === 0) return;
    const batch = [...pendingRef.current];
    pendingRef.current = [];
    try {
      await fetch(API_SAVE, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: batch }),
      });
    } catch {
      // Re-queue on failure
      pendingRef.current = [...batch, ...pendingRef.current];
    }
  }, [isAuthenticated]);

  // Debounced flush
  const scheduleFlush = useCallback(() => {
    clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(flush, 1200);
  }, [flush]);

  const saveResult = useCallback((result) => {
    const gid = result.gameId;
    if (!gid) return;

    setAllStats((prev) => {
      const updated = {
        ...prev,
        [gid]: mergeResult(prev[gid], result),
      };
      writeLS(updated);
      return updated;
    });

    if (isAuthenticated) {
      pendingRef.current.push({ ...result, ts: Date.now() });
      scheduleFlush();
    }
  }, [isAuthenticated, scheduleFlush]);

  const getBest = useCallback((gameId) => {
    return allStats[gameId]?.bestScore || 0;
  }, [allStats]);

  const getStat = useCallback((gameId) => {
    return allStats[gameId] || EMPTY_STAT();
  }, [allStats]);

  const getHistory = useCallback((gameId, n = 10) => {
    return (allStats[gameId]?.history || []).slice(0, n);
  }, [allStats]);

  return { allStats, saveResult, getBest, getStat, getHistory };
}