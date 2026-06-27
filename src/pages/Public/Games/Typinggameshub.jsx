// ============================================================================
// TypingGamesHub.jsx
// ----------------------------------------------------------------------------
// "SwiftKeys Arcade" — the games landing page. Handles the same
// login-or-guest flow as the Typing Test page, loads avatars/sound packs/
// game list from the API with static fallbacks, renders the customization
// rail, and swaps in whichever game the player picked.
//
// ADDING A NEW GAME LATER:
//   1. Add its metadata (name, tagline, icon, accent colour) to GAME_DEFS
//      in gamesFallback.js.
//   2. Build the component (anything shaped like the existing four works —
//      reuse useTypingGameEngine + useSpawnerGame where it fits).
//   3. Import it below and add one line to GAME_COMPONENTS.
// That's the entire integration surface — settings, persistence, the guest/
// auth flow and the game grid all pick it up automatically.
// ============================================================================
import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";
import Swal from "sweetalert2";
import {
  Gamepad2,
  Settings2,
  Volume2,
  VolumeX,
  Sparkles,
  SlidersHorizontal,
  CircleDot,
  CloudRain,
  Circle,
  Wind,
  User,
  LogIn,
  ChevronDown,
  Palette,
} from "lucide-react";

import { LS_KEY, lsGet, lsSet, uid, apiGet, apiPost } from "../../../components/Fallback";

import {
  GAME_API_ROUTES,
  GAME_AVATARS,
  SOUND_PACKS,
  GAME_DEFS,
  DIFFICULTIES,
  SESSION_LENGTHS,
  DEFAULT_GAME_SETTINGS,
  AVATAR_COLOR_SWATCHES,
} from "../../../components/Games/Gamefallback";

import WordMuncherGame from "./Wordmunchergame";
import FallingFeastGame from "./Fallingfeastgame";
import BubbleBuffetGame from "./Bubblebuffetgame";
import RunnerRushGame from "./Runnerrushgame";
import GameAvatar from "../../../components/Games/Gameavatar";


const GAME_COMPONENTS = {
  "word-muncher": WordMuncherGame,
  "falling-feast": FallingFeastGame,
  "bubble-buffet": BubbleBuffetGame,
  "runner-rush": RunnerRushGame,
};

const ICON_MAP = { "circle-dot": CircleDot, "cloud-rain": CloudRain, circle: Circle, wind: Wind };

function ensureGameDefaults(u) {
  if (!u) return u;
  const merged = { ...u };
  merged.gameSettings = { ...DEFAULT_GAME_SETTINGS, ...(u.gameSettings || {}) };
  merged.gameStats = { ...(u.gameStats || {}) };
  GAME_DEFS.forEach((g) => {
    if (!merged.gameStats[g.id]) {
      merged.gameStats[g.id] = { bestScore: 0, gamesPlayed: 0, bestCombo: 0, totalWordsEaten: 0 };
    }
  });
  return merged;
}

function ArcadeGuestModal({ onGuest, onLogin }) {
  return (
    <div className="skg-guest-overlay">
      <div className="skg-guest-modal">
        <div className="skg-guest-logo">
          <Gamepad2 size={30} />
        </div>
        <h2 className="skg-guest-title">SwiftKeys Arcade</h2>
        <p className="skg-guest-desc">
          A few hungry little typists are waiting. Sign in to keep your high
          scores everywhere, or jump straight in as a guest.
        </p>
        <div className="skg-guest-actions">
          <button className="skg-btn skg-btn-primary" onClick={onLogin}>
            <LogIn size={16} /> Login / Sign Up
          </button>
          <button className="skg-btn skg-btn-ghost" onClick={onGuest}>
            <User size={16} /> Continue as Guest
          </button>
        </div>
        <p className="skg-guest-note">Guest progress is saved on this device only.</p>
      </div>
    </div>
  );
}

export default function TypingGamesHub() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [userData, setUserData] = useState(null);

  const [avatars, setAvatars] = useState(GAME_AVATARS);
  const [soundPacks, setSoundPacks] = useState(SOUND_PACKS);
  const [gameDefs, setGameDefs] = useState(GAME_DEFS);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeGameId, setActiveGameId] = useState(null);
  const [sessionKey, setSessionKey] = useState(0);

  // ---- load avatars/sound packs/game list, API first, static fallback ----
  useEffect(() => {
    (async () => {
      setAvatars(await apiGet(GAME_API_ROUTES.avatars, GAME_AVATARS));
      setSoundPacks(await apiGet(GAME_API_ROUTES.soundPacks, SOUND_PACKS));
      setGameDefs(await apiGet(GAME_API_ROUTES.gameList, GAME_DEFS));
    })();
  }, []);

  // ---- auth check, then user-data or guest fallback (mirrors the Typing Test page) ----
  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch("/api/user/profile/me", { credentials: "include" });
        if (meRes.ok) {
          const me = await meRes.json();
          if (me.success && me.user) {
            setIsAuthenticated(true);
            const dataRes = await fetch("/api/user/profile/user-data", { credentials: "include" });
            if (dataRes.ok) {
              const dataJson = await dataRes.json();
              if (dataJson.success && dataJson.userData) {
                setUserData(ensureGameDefaults(dataJson.userData));
                setAuthLoading(false);
                return;
              }
            }
            setUserData(ensureGameDefaults(me.user));
            setAuthLoading(false);
            return;
          }
        }
        const guest = lsGet(LS_KEY);
        if (guest?.guestId) {
          setUserData(ensureGameDefaults(guest));
          setShowGuestModal(false);
        } else {
          setShowGuestModal(true);
        }
        setAuthLoading(false);
      } catch {
        const guest = lsGet(LS_KEY);
        if (guest?.guestId) setUserData(ensureGameDefaults(guest));
        else setShowGuestModal(true);
        setAuthLoading(false);
      }
    })();
  }, []);

  const handleGuest = () => {
    const g = ensureGameDefaults({
      guestId: uid(),
      name: "Guest",
      usertype: "Guest",
      level: 1,
      xp: 0,
      bestWPM: 0,
      createdAt: new Date().toISOString(),
    });
    lsSet(LS_KEY, g);
    setUserData(g);
    setShowGuestModal(false);
  };

  const persist = useCallback(
    (next) => {
      setUserData(next);
      if (isAuthenticated) {
        apiPost(GAME_API_ROUTES.saveSettings, { gameSettings: next.gameSettings });
      } else {
        lsSet(LS_KEY, next);
      }
    },
    [isAuthenticated],
  );

  const updateSetting = (key, value) => {
    if (!userData) return;
    persist({ ...userData, gameSettings: { ...userData.gameSettings, [key]: value } });
  };

  const settings = userData?.gameSettings || DEFAULT_GAME_SETTINGS;

  const selectedAvatar = useMemo(() => {
    const a = avatars.find((x) => x.id === settings.avatarId) || avatars[0];
    return { ...a, primary: settings.avatarColor || a.primary };
  }, [avatars, settings.avatarId, settings.avatarColor]);

  const handleGameFinish = useCallback(
    (result) => {
      if (!userData) return;
      const prevStat =
        userData.gameStats?.[result.gameId] || {
          bestScore: 0,
          gamesPlayed: 0,
          bestCombo: 0,
          totalWordsEaten: 0,
        };
      const nextStat = {
        bestScore: Math.max(prevStat.bestScore, result.score),
        gamesPlayed: prevStat.gamesPlayed + 1,
        bestCombo: Math.max(prevStat.bestCombo, result.maxCombo),
        totalWordsEaten: prevStat.totalWordsEaten + result.wordsCompleted,
      };
      const next = { ...userData, gameStats: { ...userData.gameStats, [result.gameId]: nextStat } };
      setUserData(next);

      if (isAuthenticated) {
        apiPost(GAME_API_ROUTES.saveResult(result.gameId), result);
      } else {
        lsSet(LS_KEY, next);
      }

      Swal.fire({
        icon: result.score > prevStat.bestScore ? "success" : "info",
        title: result.score > prevStat.bestScore ? "New Best Score!" : "Game Over",
        text: `${result.score} pts • best combo x${result.maxCombo}`,
        timer: 2200,
        showConfirmButton: false,
        background: isDarkMode ? "#131829" : "#fff",
        color: isDarkMode ? "#eef2ff" : "#131829",
      });
    },
    [userData, isAuthenticated, isDarkMode],
  );

  const startGame = (id) => {
    setActiveGameId(id);
    setSessionKey((k) => k + 1);
  };
  const restartGame = () => setSessionKey((k) => k + 1);
  const exitGame = () => setActiveGameId(null);

  if (authLoading) {
    return (
      <div className={`skg-root ${isDarkMode ? "dark" : "light"}`}>
        <div className="skg-loading-screen">
          <div className="skg-loading-spinner" />
          <p>Loading the arcade…</p>
        </div>
      </div>
    );
  }

  const ActiveGame = activeGameId ? GAME_COMPONENTS[activeGameId] : null;

  return (
    <div className={`skg-root ${isDarkMode ? "dark" : "light"}`}>
      {!isAuthenticated && showGuestModal && !userData?.guestId && (
        <ArcadeGuestModal onGuest={handleGuest} onLogin={() => navigate("/user/auth/login")} />
      )}

      {ActiveGame ? (
        <ActiveGame
          key={sessionKey}
          avatar={selectedAvatar}
          difficulty={settings.difficulty}
          sessionSeconds={settings.sessionSeconds || 60}
          settings={settings}
          onExit={exitGame}
          onRestart={restartGame}
          onFinish={handleGameFinish}
        />
      ) : (
        <>
          <div className="skg-hero">
            <GameAvatar avatar={selectedAvatar} state="idle" size={84} reduceMotion={settings.reduceMotion} />
            <div className="skg-hero-text">
              <div className="skg-hero-eyebrow">
                <Sparkles size={13} /> SwiftKeys Arcade
              </div>
              <h1 className="skg-hero-title">Type it right, watch it get eaten.</h1>
              <p className="skg-hero-tagline">
                Four bite-sized arcade games built around one idea: every
                correct word feeds your character. Mistakes just make them flinch.
              </p>
            </div>
            <div className="skg-hero-side">
              <div className="skg-profile-chip">
                {userData?.name || "Guest"} • Lv {userData?.level || 1}
              </div>
              <button className="skg-settings-toggle" onClick={() => setSettingsOpen((o) => !o)}>
                <SlidersHorizontal size={16} /> Customize
                <ChevronDown size={14} className={settingsOpen ? "skg-chev-up" : ""} />
              </button>
            </div>
          </div>

          {settingsOpen && (
            <div className="skg-settings">
              <div className="skg-setting-group">
                <div className="skg-setting-label">
                  <User size={13} /> Character
                </div>
                <div className="skg-swatch-row">
                  {avatars.map((a) => (
                    <button
                      key={a.id}
                      className={`skg-swatch${settings.avatarId === a.id ? " skg-swatch-active" : ""}`}
                      style={{ "--skg-sw": a.primary }}
                      onClick={() => updateSetting("avatarId", a.id)}
                      title={a.name}
                    >
                      {a.name[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="skg-setting-group">
                <div className="skg-setting-label">
                  <Palette size={13} /> Recolor
                </div>
                <div className="skg-swatch-row">
                  <button
                    className={`skg-swatch skg-swatch-default${!settings.avatarColor ? " skg-swatch-active" : ""}`}
                    onClick={() => updateSetting("avatarColor", null)}
                  >
                    Default
                  </button>
                  {AVATAR_COLOR_SWATCHES.map((c) => (
                    <button
                      key={c}
                      className={`skg-swatch${settings.avatarColor === c ? " skg-swatch-active" : ""}`}
                      style={{ "--skg-sw": c }}
                      onClick={() => updateSetting("avatarColor", c)}
                    />
                  ))}
                </div>
              </div>

              <div className="skg-setting-group">
                <div className="skg-setting-label">
                  {settings.soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />} Sound Pack
                </div>
                <select
                  className="skg-select"
                  value={settings.soundPackId}
                  onChange={(e) => updateSetting("soundPackId", e.target.value)}
                >
                  {soundPacks.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <label className="skg-slider-row">
                  <span>Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.masterVolume}
                    onChange={(e) => updateSetting("masterVolume", parseFloat(e.target.value))}
                  />
                </label>
                <label className="skg-toggle-row">
                  <span>Sound effects</span>
                  <span
                    className={`skg-toggle${settings.soundOn ? " skg-toggle-on" : ""}`}
                    onClick={() => updateSetting("soundOn", !settings.soundOn)}
                  />
                </label>
              </div>

              <div className="skg-setting-group">
                <div className="skg-setting-label">
                  <Settings2 size={13} /> Difficulty &amp; Session
                </div>
                <select
                  className="skg-select"
                  value={settings.difficulty}
                  onChange={(e) => updateSetting("difficulty", e.target.value)}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <select
                  className="skg-select"
                  value={settings.sessionSeconds || 60}
                  onChange={(e) => updateSetting("sessionSeconds", parseInt(e.target.value, 10))}
                >
                  {SESSION_LENGTHS.map((s) => (
                    <option key={s} value={s}>
                      {s}s
                    </option>
                  ))}
                </select>
              </div>

              <div className="skg-setting-group">
                <div className="skg-setting-label">Accessibility</div>
                <label className="skg-toggle-row">
                  <span>Next-key beacon</span>
                  <span
                    className={`skg-toggle${settings.beaconOn ? " skg-toggle-on" : ""}`}
                    onClick={() => updateSetting("beaconOn", !settings.beaconOn)}
                  />
                </label>
                <label className="skg-toggle-row">
                  <span>Eat particles</span>
                  <span
                    className={`skg-toggle${settings.particlesOn ? " skg-toggle-on" : ""}`}
                    onClick={() => updateSetting("particlesOn", !settings.particlesOn)}
                  />
                </label>
                <label className="skg-toggle-row">
                  <span>Reduce motion</span>
                  <span
                    className={`skg-toggle${settings.reduceMotion ? " skg-toggle-on" : ""}`}
                    onClick={() => updateSetting("reduceMotion", !settings.reduceMotion)}
                  />
                </label>
              </div>
            </div>
          )}

          <div className="skg-game-grid">
            {gameDefs.map((g) => {
              const Icon = ICON_MAP[g.iconKey] || Gamepad2;
              const stat = userData?.gameStats?.[g.id];
              return (
                <div key={g.id} className="skg-game-card" style={{ "--skg-card-accent": g.accent }}>
                  <div className="skg-game-card-icon">
                    <Icon size={26} />
                  </div>
                  <div className="skg-game-card-name">{g.name}</div>
                  <p className="skg-game-card-tag">{g.tagline}</p>
                  {stat?.gamesPlayed > 0 && (
                    <div className="skg-game-card-best">Best: {stat.bestScore} pts</div>
                  )}
                  <button className="skg-play-btn" onClick={() => startGame(g.id)}>
                    Play
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}