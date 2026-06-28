// ============================================================================
// TypingGamesHub.jsx  —  SwiftKeys Arcade v2
// ============================================================================
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
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
  Car,
  Zap,
  Trophy,
  Star,
  ChevronRight,
  Flame,
  TrendingUp,
  Target,
  Crown,
  Lock,
  Search,
  Shield,
  Heart,
  Brain,
  Coffee,
  Swords,
} from "lucide-react";

import {
  LS_KEY,
  lsGet,
  lsSet,
  uid,
  apiGet,
  apiPost,
} from "../../../components/Fallback";

import GameAvatar from "../../../components/Games/Gameavatar";

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

// --- Existing games ---
import WordMuncherGame from "./Wordmunchergame";
import FallingFeastGame from "./Fallingfeastgame";
import BubbleBuffetGame from "./Bubblebuffetgame";
import RunnerRushGame from "./Runnerrushgame";
import TypeRacerGame from "./Typeracergame";
import WordInvasionGame from "./Wordinvasiongame";

// --- NEW games ---
import TypingDetectiveGame from "./Typingdetectivegame";
import TypingWizardDuelGame from "./Typingwizardduelgame";
import ZombieSurvivalGame from "./Zombiesurvivalgame";
import TypingRestaurantGame from "./Typingrestaurantgame";

const GAME_COMPONENTS = {
  "word-muncher": WordMuncherGame,
  "falling-feast": FallingFeastGame,
  "bubble-buffet": BubbleBuffetGame,
  "runner-rush": RunnerRushGame,
  "type-racer": TypeRacerGame,
  "word-invasion": WordInvasionGame,
  "typing-detective": TypingDetectiveGame,
  "typing-wizard-duel": TypingWizardDuelGame,
  "zombie-survival": ZombieSurvivalGame,
  "typing-restaurant": TypingRestaurantGame,
};

const ICON_MAP = {
  "circle-dot": CircleDot,
  "cloud-rain": CloudRain,
  circle: Circle,
  wind: Wind,
  car: Car,
  zap: Zap,
  search: Search,
  shield: Shield,
  heart: Heart,
  brain: Brain,
  coffee: Coffee,
  swords: Swords,
};

function ensureGameDefaults(u) {
  if (!u) return u;
  const merged = { ...u };
  merged.gameSettings = { ...DEFAULT_GAME_SETTINGS, ...(u.gameSettings || {}) };
  merged.gameStats = { ...(u.gameStats || {}) };

  // Ensure all 10 games have stats entries
  const allGameIds = [
    "word-muncher",
    "falling-feast",
    "bubble-buffet",
    "runner-rush",
    "type-racer",
    "word-invasion",
    "typing-detective",
    "typing-wizard-duel",
    "zombie-survival",
    "typing-restaurant",
  ];

  allGameIds.forEach((id) => {
    if (!merged.gameStats[id]) {
      merged.gameStats[id] = {
        bestScore: 0,
        gamesPlayed: 0,
        bestCombo: 0,
        totalWordsEaten: 0,
        lastScore: 0,
      };
    }
  });

  return merged;
}

// ============================================================================
// Guest Modal
// ============================================================================
function ArcadeGuestModal({ onGuest, onLogin }) {
  return (
    <div className="skg-guest-overlay">
      <div className="skg-guest-modal">
        <div className="skg-guest-logo">
          <Gamepad2 size={32} />
          <div className="skg-guest-logo-ring" />
        </div>
        <h2 className="skg-guest-title">SwiftKeys Arcade</h2>
        <p className="skg-guest-tagline">Type fast. Eat words. Score big.</p>
        <p className="skg-guest-desc">
          Ten arcade games that turn typing practice into pure fun. Sign in to
          track high scores everywhere, or jump in as a guest.
        </p>
        <div className="skg-guest-actions">
          <button
            className="skg-btn skg-btn-primary skg-btn-lg"
            onClick={onLogin}
          >
            <LogIn size={17} /> Login / Sign Up
          </button>
          <button
            className="skg-btn skg-btn-ghost skg-btn-lg"
            onClick={onGuest}
          >
            <User size={17} /> Continue as Guest
          </button>
        </div>
        <p className="skg-guest-note">
          Guest progress saved on this device only.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Score card for a single game
// ============================================================================
function ScorePill({ stat, accent }) {
  if (!stat || stat.gamesPlayed === 0) return null;
  return (
    <div className="skg-score-pill" style={{ "--accent": accent }}>
      <Trophy size={11} />
      <span>{stat.bestScore}</span>
    </div>
  );
}

// ============================================================================
// Category filter tabs
// ============================================================================
const CATEGORIES = [
  { id: "all", label: "All Games" },
  { id: "classic", label: "Classic" },
  { id: "speed", label: "Speed" },
  { id: "competitive", label: "Compete" },
  { id: "strategy", label: "Strategy" },
  { id: "survival", label: "Survival" },
];

// ============================================================================
// Avatar gallery item
// ============================================================================
function AvatarCard({ avatar, isSelected, avatarColor, onSelect, size = 56 }) {
  return (
    <button
      className={`skg-avatar-card${isSelected ? " skg-avatar-card-active" : ""}`}
      style={{ "--acc": avatarColor || avatar.primary }}
      onClick={() => onSelect(avatar.id)}
      title={avatar.name}
    >
      <GameAvatar
        avatar={{ ...avatar, primary: avatarColor || avatar.primary }}
        state="idle"
        size={size}
      />
      <span className="skg-avatar-card-name">{avatar.name}</span>
      {avatar.category && (
        <span className="skg-avatar-card-cat">{avatar.category}</span>
      )}
    </button>
  );
}

// ============================================================================
// Main hub
// ============================================================================
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
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeAvatarTab, setActiveAvatarTab] = useState("classic");

  // ---- asset load ----------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const avatarsData = await apiGet(GAME_API_ROUTES.avatars, GAME_AVATARS);
        setAvatars(avatarsData);

        const soundData = await apiGet(GAME_API_ROUTES.soundPacks, SOUND_PACKS);
        setSoundPacks(soundData);

        const gameData = await apiGet(GAME_API_ROUTES.gameList, GAME_DEFS);
        setGameDefs(gameData);
      } catch (error) {
        console.error("Failed to load game assets:", error);
      }
    })();
  }, []);

  // ---- auth ----------------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch("/api/user/profile/me", {
          credentials: "include",
        });
        if (meRes.ok) {
          const me = await meRes.json();
          if (me.success && me.user) {
            setIsAuthenticated(true);
            const dataRes = await fetch("/api/user/profile/user-data", {
              credentials: "include",
            });
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
        apiPost(GAME_API_ROUTES.saveSettings, {
          gameSettings: next.gameSettings,
        });
      } else {
        lsSet(LS_KEY, next);
      }
    },
    [isAuthenticated],
  );

  const updateSetting = (key, value) => {
    if (!userData) return;
    persist({
      ...userData,
      gameSettings: { ...userData.gameSettings, [key]: value },
    });
  };

  const settings = userData?.gameSettings || DEFAULT_GAME_SETTINGS;

  const selectedAvatar = useMemo(() => {
    const a = avatars.find((x) => x.id === settings.avatarId) || avatars[0];
    return { ...a, primary: settings.avatarColor || a.primary };
  }, [avatars, settings.avatarId, settings.avatarColor]);

  // ---- game finish ---------------------------------------------------------
  const handleGameFinish = useCallback(
    (result) => {
      if (!userData) return;
      const prevStat = userData.gameStats?.[result.gameId] || {
        bestScore: 0,
        gamesPlayed: 0,
        bestCombo: 0,
        totalWordsEaten: 0,
        lastScore: 0,
      };
      const isNewBest = result.score > prevStat.bestScore;
      const nextStat = {
        bestScore: Math.max(prevStat.bestScore, result.score),
        lastScore: result.score,
        gamesPlayed: prevStat.gamesPlayed + 1,
        bestCombo: Math.max(prevStat.bestCombo, result.maxCombo),
        totalWordsEaten: prevStat.totalWordsEaten + result.wordsCompleted,
      };
      const next = {
        ...userData,
        gameStats: { ...userData.gameStats, [result.gameId]: nextStat },
      };
      setUserData(next);

      if (isAuthenticated) {
        apiPost(GAME_API_ROUTES.saveResult(result.gameId), result);
      } else {
        lsSet(LS_KEY, next);
      }
    },
    [userData, isAuthenticated],
  );

  const startGame = (id) => {
    setActiveGameId(id);
    setSessionKey((k) => k + 1);
  };
  const restartGame = () => setSessionKey((k) => k + 1);
  const exitGame = () => setActiveGameId(null);

  // ---- filtered games -------------------------------------------------------
  const filteredGames = useMemo(() => {
    if (categoryFilter === "all") return gameDefs;
    const tagMap = {
      classic: ["classic", "pressure", "reflex", "chill"],
      speed: ["speed", "horizontal", "vertical"],
      competitive: ["competitive", "racing", "shooter", "waves"],
      strategy: ["strategy", "detective", "wizard", "restaurant", "story"],
      survival: ["survival", "zombie", "defense"],
    };
    const tags = tagMap[categoryFilter] || [];
    return gameDefs.filter((g) => g.tags?.some((t) => tags.includes(t)));
  }, [gameDefs, categoryFilter]);

  // ---- avatar tabs ---------------------------------------------------------
  const avatarsByCategory = useMemo(() => {
    const cats = ["classic", "anime", "scifi", "fantasy"];
    return cats.reduce((acc, cat) => {
      acc[cat] = avatars.filter((a) => a.category === cat);
      return acc;
    }, {});
  }, [avatars]);

  // ---- loading screen -------------------------------------------------------
  if (authLoading) {
    return (
      <div className={`skg-root ${isDarkMode ? "dark" : "light"}`}>
        <div className="skg-loading-screen">
          <div className="skg-loading-orbit">
            <div className="skg-loading-planet" />
            <div className="skg-loading-satellite" />
          </div>
          <p className="skg-loading-text">Warming up the arcade…</p>
        </div>
      </div>
    );
  }

  const ActiveGame = activeGameId ? GAME_COMPONENTS[activeGameId] : null;

  return (
    <div className={`skg-root ${isDarkMode ? "dark" : "light"}`}>
      {!isAuthenticated && showGuestModal && !userData?.guestId && (
        <ArcadeGuestModal
          onGuest={handleGuest}
          onLogin={() => navigate("/user/auth/login")}
        />
      )}

      {/* ===== ACTIVE GAME ===== */}
      {ActiveGame ? (
        <ActiveGame
          key={sessionKey}
          avatar={selectedAvatar}
          difficulty={settings.difficulty}
          sessionSeconds={settings.sessionSeconds || 60}
          settings={settings}
          userData={userData}
          onExit={exitGame}
          onRestart={restartGame}
          onFinish={handleGameFinish}
        />
      ) : (
        <>
          {/* ===== HERO ===== */}
          <div className="skg-hero">
            <div className="skg-hero-avatar-wrap">
              <GameAvatar
                avatar={selectedAvatar}
                state="idle"
                comboLevel={1}
                size={90}
                reduceMotion={settings.reduceMotion}
              />
              <div
                className="skg-hero-avatar-glow"
                style={{ background: selectedAvatar.primary }}
              />
            </div>
            <div className="skg-hero-text">
              <div className="skg-hero-eyebrow">
                <Sparkles size={12} /> SwiftKeys Arcade
              </div>
              <h1 className="skg-hero-title">
                Type it right,
                <br />
                <span className="skg-hero-title-accent">
                  watch it get eaten.
                </span>
              </h1>
              <p className="skg-hero-tagline">
                Ten arcade games where your WPM is the weapon.
              </p>
            </div>
            <div className="skg-hero-side">
              <div className="skg-profile-chip">
                <div
                  className="skg-profile-chip-avatar"
                  style={{ background: selectedAvatar.primary }}
                >
                  {(userData?.name || "G")[0]}
                </div>
                <div>
                  <div className="skg-profile-name">
                    {userData?.name || "Guest"}
                  </div>
                  <div className="skg-profile-meta">
                    Level {userData?.level || 1}
                  </div>
                </div>
              </div>
              <button
                className="skg-settings-toggle"
                onClick={() => setSettingsOpen((o) => !o)}
              >
                <SlidersHorizontal size={15} />
                Customize
                <ChevronDown
                  size={13}
                  className={settingsOpen ? "skg-chev-up" : ""}
                />
              </button>
            </div>
          </div>

          {/* ===== SETTINGS PANEL ===== */}
          {settingsOpen && (
            <div className="skg-settings">
              {/* Avatar selector with tabs */}
              <div className="skg-setting-group skg-setting-group-wide">
                <div className="skg-setting-label">
                  <User size={13} /> Character
                </div>
                <div className="skg-avatar-tabs">
                  {["classic", "anime", "scifi", "fantasy"].map((cat) => (
                    <button
                      key={cat}
                      className={`skg-avatar-tab${activeAvatarTab === cat ? " skg-avatar-tab-active" : ""}`}
                      onClick={() => setActiveAvatarTab(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="skg-avatar-gallery">
                  {(avatarsByCategory[activeAvatarTab] || []).map((a) => (
                    <AvatarCard
                      key={a.id}
                      avatar={a}
                      isSelected={settings.avatarId === a.id}
                      avatarColor={
                        settings.avatarId === a.id ? settings.avatarColor : null
                      }
                      onSelect={(id) => {
                        updateSetting("avatarId", id);
                        updateSetting(
                          "soundPackId",
                          a.defaultSoundPack || settings.soundPackId,
                        );
                      }}
                    />
                  ))}
                </div>
                {/* Selected avatar tagline */}
                {selectedAvatar && (
                  <div className="skg-avatar-tagline">
                    <span style={{ color: selectedAvatar.primary }}>▸</span>{" "}
                    {selectedAvatar.tagline}
                  </div>
                )}
              </div>

              {/* Recolor */}
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

              {/* Sound pack */}
              <div className="skg-setting-group">
                <div className="skg-setting-label">
                  {settings.soundOn ? (
                    <Volume2 size={13} />
                  ) : (
                    <VolumeX size={13} />
                  )}{" "}
                  Sound
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
                <div className="skg-sound-pack-desc">
                  {
                    soundPacks.find((p) => p.id === settings.soundPackId)
                      ?.description
                  }
                </div>
                <label className="skg-slider-row">
                  <span>Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.masterVolume}
                    onChange={(e) =>
                      updateSetting("masterVolume", parseFloat(e.target.value))
                    }
                  />
                  <span className="skg-vol-num">
                    {Math.round(settings.masterVolume * 100)}%
                  </span>
                </label>
                <label className="skg-toggle-row">
                  <span>Enable sound</span>
                  <span
                    className={`skg-toggle${settings.soundOn ? " skg-toggle-on" : ""}`}
                    onClick={() => updateSetting("soundOn", !settings.soundOn)}
                  />
                </label>
              </div>

              {/* Difficulty */}
              <div className="skg-setting-group">
                <div className="skg-setting-label">
                  <Settings2 size={13} /> Difficulty &amp; Session
                </div>
                <div className="skg-diff-pills">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.id}
                      className={`skg-diff-pill${settings.difficulty === d.id ? " skg-diff-active" : ""}`}
                      onClick={() => updateSetting("difficulty", d.id)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <div className="skg-session-pills">
                  {SESSION_LENGTHS.map((s) => (
                    <button
                      key={s}
                      className={`skg-session-pill${(settings.sessionSeconds || 60) === s ? " skg-session-active" : ""}`}
                      onClick={() => updateSetting("sessionSeconds", s)}
                    >
                      {s}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessibility */}
              <div className="skg-setting-group">
                <div className="skg-setting-label">Accessibility</div>
                {[
                  ["beaconOn", "Next-key beacon"],
                  ["particlesOn", "Eat particles"],
                  ["reduceMotion", "Reduce motion"],
                ].map(([key, label]) => (
                  <label key={key} className="skg-toggle-row">
                    <span>{label}</span>
                    <span
                      className={`skg-toggle${settings[key] ? " skg-toggle-on" : ""}`}
                      onClick={() => updateSetting(key, !settings[key])}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ===== CATEGORY FILTER ===== */}
          <div className="skg-category-bar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`skg-cat-btn${categoryFilter === cat.id ? " skg-cat-active" : ""}`}
                onClick={() => setCategoryFilter(cat.id)}
              >
                {cat.label}
              </button>
            ))}
            <div className="skg-cat-spacer" />
            <div className="skg-game-count">{filteredGames.length} games</div>
          </div>

          {/* ===== GAME GRID ===== */}
          <div className="skg-game-grid">
            {filteredGames.map((g) => {
              const Icon = ICON_MAP[g.iconKey] || Gamepad2;
              const stat = userData?.gameStats?.[g.id];
              const hasPlayed = stat?.gamesPlayed > 0;
              const nextTarget = hasPlayed
                ? Math.ceil((stat.bestScore * 1.2) / 100) * 100
                : null;

              return (
                <div
                  key={g.id}
                  className={`skg-game-card${g.isNew ? " skg-game-card-new" : ""}`}
                  style={{ "--skg-card-accent": g.accent }}
                >
                  {g.isNew && <div className="skg-new-badge">NEW</div>}

                  <div className="skg-game-card-top">
                    <div className="skg-game-card-icon">
                      <Icon size={24} />
                    </div>
                    <div className="skg-game-card-meta">
                      {hasPlayed && (
                        <div className="skg-plays-badge">
                          {stat.gamesPlayed}× played
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="skg-game-card-name">{g.name}</div>
                  <p className="skg-game-card-tag">{g.tagline}</p>
                  {g.description && (
                    <p className="skg-game-card-desc">{g.description}</p>
                  )}

                  {/* Score section */}
                  {hasPlayed ? (
                    <div className="skg-score-section">
                      <div className="skg-score-row">
                        <div className="skg-score-item">
                          <span className="skg-score-label">
                            <Trophy size={10} /> Best
                          </span>
                          <span
                            className="skg-score-val"
                            style={{ color: g.accent }}
                          >
                            {stat.bestScore}
                          </span>
                        </div>
                        <div className="skg-score-item">
                          <span className="skg-score-label">
                            <TrendingUp size={10} /> Last
                          </span>
                          <span className="skg-score-val">
                            {stat.lastScore}
                          </span>
                        </div>
                        <div className="skg-score-item">
                          <span className="skg-score-label">
                            <Flame size={10} /> Combo
                          </span>
                          <span className="skg-score-val">
                            x{stat.bestCombo}
                          </span>
                        </div>
                      </div>
                      {nextTarget && (
                        <div className="skg-next-target">
                          <Target size={10} />
                          <span>
                            Next: <strong>{nextTarget}</strong>
                          </span>
                          <div className="skg-target-bar">
                            <div
                              className="skg-target-fill"
                              style={{
                                width: `${Math.min((stat.bestScore / nextTarget) * 100, 100)}%`,
                                background: g.accent,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="skg-score-empty">
                      <Star size={11} /> No score yet — be the first!
                    </div>
                  )}

                  {/* Tags */}
                  <div className="skg-tag-row">
                    {g.tags?.map((t) => (
                      <span key={t} className="skg-tag">
                        {t}
                      </span>
                    ))}
                  </div>

                  <button
                    className="skg-play-btn"
                    onClick={() => startGame(g.id)}
                  >
                    Play <ChevronRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* ===== GLOBAL STATS BAR ===== */}
          {userData && (
            <div className="skg-stats-bar">
              <div className="skg-stats-bar-item">
                <Gamepad2 size={14} />
                <span>
                  {Object.values(userData.gameStats || {}).reduce(
                    (a, s) => a + (s.gamesPlayed || 0),
                    0,
                  )}{" "}
                  total games
                </span>
              </div>
              <div className="skg-stats-bar-item">
                <Trophy size={14} />
                <span>
                  Best:{" "}
                  {Math.max(
                    0,
                    ...Object.values(userData.gameStats || {}).map(
                      (s) => s.bestScore || 0,
                    ),
                  )}
                </span>
              </div>
              <div className="skg-stats-bar-item">
                <Flame size={14} />
                <span>
                  Best combo: x
                  {Math.max(
                    0,
                    ...Object.values(userData.gameStats || {}).map(
                      (s) => s.bestCombo || 0,
                    ),
                  )}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
