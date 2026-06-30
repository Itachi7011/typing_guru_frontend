// ============================================================================
// TypingGamesHub.jsx  —  v4 FINAL
// All 14 games, useGameStats for unified localStorage + API persistence,
// animated background selector, full settings tabs.
// ============================================================================
import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";
import {
  Gamepad2, Settings2, Volume2, VolumeX, Sparkles, SlidersHorizontal,
  CircleDot, CloudRain, Circle, Wind, User, LogIn, ChevronDown, Palette,
  Car, Zap, Trophy, Star, ChevronRight, Flame, TrendingUp, Target,
  Search, Shield, Utensils, Wand2, ImageIcon, Info, Rocket, Swords,
  Castle, Gamepad,
} from "lucide-react";

import { LS_KEY, lsGet, lsSet, uid, apiGet, apiPost } from "../../../components/Fallback";
import {
  GAME_API_ROUTES, GAME_AVATARS, SOUND_PACKS, GAME_DEFS, DIFFICULTIES,
  SESSION_LENGTHS, DEFAULT_GAME_SETTINGS, AVATAR_COLOR_SWATCHES, PROJECTILE_OPTIONS,
} from "../../../components/Games/Gamefallback";
import useGameStats from "../../../components/Games/Usegamestats";
import GameAvatar from "../../../components/Games/Gameavatar";
import AnimatedBackground, { BG_THEMES } from "../../../components/Games/Animatedbackground";

// ── All 14 game imports ───────────────────────────────────────────────────────
import WordMuncherGame       from "./Wordmunchergame";
import FallingFeastGame      from "./Fallingfeastgame";
import BubbleBuffetGame      from "./Bubblebuffetgame";
import RunnerRushGame        from "./Runnerrushgame";
import TypeRacerGame         from "./Typeracergame";
import WordInvasionGame      from "./Wordinvasiongame";
import TypingDetectiveGame   from "./Typingdetectivegame";
import TypingWizardDuelGame  from "./Typingwizardduelgame";
import ZombieSurvivalGame    from "./Zombiesurvivalgame";
import TypingRestaurantGame  from "./Typingrestaurantgame";
import TypeRunnerGame        from "./Typerunnergame";
import SpellBrawlerGame      from "./Spellbrawlergame";
import GravityTyperGame      from "./Gravitytypergame";
import WordTowerDefenseGame  from "./Wordtowerdefensegame";

const GAME_COMPONENTS = {
  "word-muncher":       WordMuncherGame,
  "falling-feast":      FallingFeastGame,
  "bubble-buffet":      BubbleBuffetGame,
  "runner-rush":        RunnerRushGame,
  "type-racer":         TypeRacerGame,
  "word-invasion":      WordInvasionGame,
  "typing-detective":   TypingDetectiveGame,
  "typing-wizard":      TypingWizardDuelGame,
  "zombie-survival":    ZombieSurvivalGame,
  "typing-restaurant":  TypingRestaurantGame,
  "type-runner":        TypeRunnerGame,
  "spell-brawler":      SpellBrawlerGame,
  "gravity-typer":      GravityTyperGame,
  "word-tower-defense": WordTowerDefenseGame,
};

const ICON_MAP = {
  "circle-dot": CircleDot, "cloud-rain": CloudRain, circle: Circle,
  wind: Wind, car: Car, zap: Zap, search: Search, wand: Wand2,
  shield: Shield, utensils: Utensils, gamepad: Gamepad,
  swords: Swords, rocket: Rocket, castle: Castle,
};

const CATEGORIES = [
  { id:"all",         label:"All Games" },
  { id:"action",      label:"Action"    },
  { id:"classic",     label:"Classic"   },
  { id:"strategy",    label:"Strategy"  },
  { id:"story",       label:"Story"     },
];

const TAG_MAP = {
  action:   ["platformer","fighting","space","action","racing","competitive","shooter","waves","reflex","speed"],
  classic:  ["classic","pressure","chill","vertical","horizontal"],
  strategy: ["strategy","survival","management","time","defense","battle"],
  story:    ["story","puzzle"],
};

function ensureDefaults(u) {
  if (!u) return u;
  return {
    ...u,
    gameSettings: { ...DEFAULT_GAME_SETTINGS, ...(u.gameSettings || {}) },
    gameStats: u.gameStats || {},
  };
}

function Tip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="skr-tip-wrap" onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      <Info size={12} className="skr-tip-icon"/>
      {show && <span className="skr-tooltip">{text}</span>}
    </span>
  );
}

function ArcadeGuestModal({ onGuest, onLogin }) {
  return (
    <div className="skg-guest-overlay">
      <div className="skg-guest-modal">
        <div className="skg-guest-logo"><Gamepad2 size={30}/><div className="skg-guest-logo-ring"/></div>
        <h2 className="skg-guest-title">SwiftKeys Arcade</h2>
        <p className="skg-guest-tagline">14 games. One keyboard. Infinite fun.</p>
        <p className="skg-guest-desc">Every correct word is a weapon. Platform, brawl, defend, race — all by typing.</p>
        <div className="skg-guest-actions">
          <button className="skg-btn skg-btn-primary skg-btn-lg" onClick={onLogin}><LogIn size={16}/> Login / Sign Up</button>
          <button className="skg-btn skg-btn-ghost skg-btn-lg" onClick={onGuest}><User size={16}/> Continue as Guest</button>
        </div>
        <p className="skg-guest-note">Guest progress saved locally. Login to sync across devices.</p>
      </div>
    </div>
  );
}

function AvatarCard({ avatar, isSelected, avatarColor, onSelect }) {
  const color = avatarColor || avatar.primary;
  return (
    <button className={`skg-avatar-card${isSelected?" skg-avatar-card-active":""}`}
      style={{ "--acc": color }} onClick={() => onSelect(avatar.id)}
      title={`${avatar.name} — ${avatar.weapon}`}>
      <GameAvatar avatar={{ ...avatar, primary: color }} state="idle" size={50}/>
      <span className="skg-avatar-card-name">{avatar.name}</span>
      <span className="skg-avatar-card-cat">{avatar.weapon}</span>
    </button>
  );
}

// ── Main hub ──────────────────────────────────────────────────────────────────
export default function TypingGamesHub() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [authLoading,     setAuthLoading]     = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showGuestModal,  setShowGuestModal]  = useState(false);
  const [userData,        setUserData]        = useState(null);

  const [avatars,    setAvatars]    = useState(GAME_AVATARS);
  const [soundPacks, setSoundPacks] = useState(SOUND_PACKS);
  const [gameDefs,   setGameDefs]   = useState(GAME_DEFS);

  const [settingsOpen,  setSettingsOpen]  = useState(false);
  const [settingsTab,   setSettingsTab]   = useState("avatar");
  const [activeGameId,  setActiveGameId]  = useState(null);
  const [sessionKey,    setSessionKey]    = useState(0);
  const [categoryFilter,setCategoryFilter]= useState("all");
  const [avatarTab,     setAvatarTab]     = useState("classic");

  // Unified stats hook — handles both localStorage and API
  const { allStats, saveResult, getStat } = useGameStats(isAuthenticated);

  // Auth
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/user/profile/me", { credentials: "include" });
        if (r.ok) {
          const me = await r.json();
          if (me.success && me.user) {
            setIsAuthenticated(true);
            const dr = await fetch("/api/user/profile/user-data", { credentials: "include" });
            const dj = dr.ok ? await dr.json() : {};
            setUserData(ensureDefaults(dj.userData || me.user));
            setAuthLoading(false);
            return;
          }
        }
        const guest = lsGet(LS_KEY);
        if (guest?.guestId) setUserData(ensureDefaults(guest));
        else setShowGuestModal(true);
        setAuthLoading(false);
      } catch {
        const guest = lsGet(LS_KEY);
        if (guest?.guestId) setUserData(ensureDefaults(guest));
        else setShowGuestModal(true);
        setAuthLoading(false);
      }
    })();
  }, []);

  // Asset load
  useEffect(() => {
    (async () => {
      setAvatars(await apiGet(GAME_API_ROUTES.avatars, GAME_AVATARS));
      setSoundPacks(await apiGet(GAME_API_ROUTES.soundPacks, SOUND_PACKS));
      setGameDefs(await apiGet(GAME_API_ROUTES.gameList, GAME_DEFS));
    })();
  }, []);

  const handleGuest = () => {
    const g = ensureDefaults({ guestId: uid(), name:"Guest", usertype:"Guest", level:1, xp:0, bestWPM:0, createdAt: new Date().toISOString() });
    lsSet(LS_KEY, g); setUserData(g); setShowGuestModal(false);
  };

  const persist = useCallback((next) => {
    setUserData(next);
    if (isAuthenticated) apiPost(GAME_API_ROUTES.saveSettings, { gameSettings: next.gameSettings });
    else lsSet(LS_KEY, next);
  }, [isAuthenticated]);

  const updateSetting = (key, value) => {
    if (!userData) return;
    persist({ ...userData, gameSettings: { ...userData.gameSettings, [key]: value } });
  };

  const settings = userData?.gameSettings || DEFAULT_GAME_SETTINGS;

  const selectedAvatar = useMemo(() => {
    const a = avatars.find(x => x.id === settings.avatarId) || avatars[0];
    return { ...a, primary: settings.avatarColor || a.primary };
  }, [avatars, settings.avatarId, settings.avatarColor]);

  // ── Game finish — routes to useGameStats ──────────────────────────────────
  const handleGameFinish = useCallback((result) => {
    saveResult(result);
    // Also persist to userData.gameStats for backwards compat
    setUserData(prev => {
      if (!prev) return prev;
      const prevStat = prev.gameStats?.[result.gameId] || { bestScore:0, gamesPlayed:0, bestCombo:0, totalWordsEaten:0, lastScore:0 };
      const next = {
        ...prev,
        gameStats: {
          ...prev.gameStats,
          [result.gameId]: {
            bestScore:      Math.max(prevStat.bestScore, result.score),
            lastScore:      result.score,
            gamesPlayed:    prevStat.gamesPlayed + 1,
            bestCombo:      Math.max(prevStat.bestCombo, result.maxCombo || 0),
            totalWordsEaten:(prevStat.totalWordsEaten || 0) + (result.wordsCompleted || 0),
          },
        },
      };
      if (!isAuthenticated) lsSet(LS_KEY, next);
      return next;
    });
  }, [saveResult, isAuthenticated]);

  const startGame   = (id) => { setActiveGameId(id); setSessionKey(k => k + 1); };
  const restartGame = ()   => setSessionKey(k => k + 1);
  const exitGame    = ()   => setActiveGameId(null);

  const filteredGames = useMemo(() => {
    if (categoryFilter === "all") return gameDefs;
    const tags = TAG_MAP[categoryFilter] || [];
    return gameDefs.filter(g => g.tags?.some(t => tags.includes(t)));
  }, [gameDefs, categoryFilter]);

  const avatarsByCategory = useMemo(() => {
    const cats = ["classic","anime","scifi","fantasy"];
    return cats.reduce((acc, cat) => { acc[cat] = avatars.filter(a => a.category === cat); return acc; }, {});
  }, [avatars]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (authLoading) return (
    <div className={`skg-root ${isDarkMode?"dark":"light"}`}>
      <div className="skg-loading-screen">
        <div className="skg-loading-orbit"><div className="skg-loading-planet"/><div className="skg-loading-satellite"/></div>
        <p className="skg-loading-text">Loading the arcade…</p>
      </div>
    </div>
  );

  const ActiveGame = activeGameId ? GAME_COMPONENTS[activeGameId] : null;

  return (
    <div className={`skg-root ${isDarkMode?"dark":"light"}`}>
      {/* Guest modal */}
      {!isAuthenticated && showGuestModal && !userData?.guestId && (
        <ArcadeGuestModal onGuest={handleGuest} onLogin={() => navigate("/user/auth/login")}/>
      )}

      {/* ── ACTIVE GAME ── */}
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
          {/* ── HERO ── */}
          <div className="skg-hero">
            <div className="skg-hero-avatar-wrap">
              <GameAvatar avatar={selectedAvatar} state="idle" comboLevel={1} size={88}
                reduceMotion={settings.reduceMotion} projectileType={settings.projectileType || "bullet"}/>
              <div className="skg-hero-avatar-glow" style={{ background: selectedAvatar.primary }}/>
            </div>
            <div className="skg-hero-text">
              <div className="skg-hero-eyebrow"><Sparkles size={12}/> SwiftKeys Arcade</div>
              <h1 className="skg-hero-title">
                Type it right,<br/>
                <span className="skg-hero-title-accent">watch it get destroyed.</span>
              </h1>
              <p className="skg-hero-tagline">14 games. Platformers, brawlers, defense, racing — all by typing.</p>
            </div>
            <div className="skg-hero-side">
              <div className="skg-profile-chip">
                <div className="skg-profile-chip-avatar" style={{ background: selectedAvatar.primary }}>
                  {(userData?.name || "G")[0]}
                </div>
                <div>
                  <div className="skg-profile-name">{userData?.name || "Guest"}</div>
                  <div className="skg-profile-meta">Level {userData?.level || 1}</div>
                </div>
              </div>
              <button className="skg-settings-toggle" onClick={() => setSettingsOpen(o => !o)}>
                <SlidersHorizontal size={15}/> Customize
                <ChevronDown size={13} className={settingsOpen?"skg-chev-up":""}/>
              </button>
            </div>
          </div>

          {/* ── SETTINGS PANEL (tabbed) ── */}
          {settingsOpen && (
            <div className="skg-settings-shell">
              <div className="skg-settings-tabs">
                {[
                  { id:"avatar",     icon:<User size={14}/>,      label:"Avatar"      },
                  { id:"projectile", icon:<Zap size={14}/>,       label:"Weapon"      },
                  { id:"sound",      icon:<Volume2 size={14}/>,   label:"Sound"       },
                  { id:"game",       icon:<Settings2 size={14}/>, label:"Difficulty"  },
                  { id:"bg",         icon:<ImageIcon size={14}/>, label:"Background"  },
                  { id:"access",     icon:<Shield size={14}/>,    label:"Accessibility"},
                ].map(tab => (
                  <button key={tab.id}
                    className={`skg-settings-tab${settingsTab===tab.id?" skg-settings-tab-active":""}`}
                    onClick={() => setSettingsTab(tab.id)}>
                    {tab.icon}<span className="skg-tab-label">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="skg-settings-content">
                {/* AVATAR */}
                {settingsTab === "avatar" && (
                  <div className="skg-settings-pane">
                    <div className="skg-setting-group skg-setting-group-wide">
                      <div className="skg-setting-label"><User size={13}/> Character <Tip text="Each character has a unique body, face, arms, and weapon. The avatar actually moves and shoots!"/></div>
                      <div className="skg-avatar-tabs">
                        {["classic","anime","scifi","fantasy"].map(cat => (
                          <button key={cat} className={`skg-avatar-tab${avatarTab===cat?" skg-avatar-tab-active":""}`}
                            onClick={()=>setAvatarTab(cat)}>{cat}</button>
                        ))}
                      </div>
                      <div className="skg-avatar-gallery">
                        {(avatarsByCategory[avatarTab]||[]).map(a => (
                          <AvatarCard key={a.id} avatar={a}
                            isSelected={settings.avatarId===a.id}
                            avatarColor={settings.avatarId===a.id ? settings.avatarColor : null}
                            onSelect={id => {
                              const av = avatars.find(x=>x.id===id);
                              updateSetting("avatarId", id);
                              if (av?.defaultSoundPack) updateSetting("soundPackId", av.defaultSoundPack);
                              if (av?.projectile) updateSetting("projectileType", av.projectile);
                            }}/>
                        ))}
                      </div>
                      {selectedAvatar && (
                        <div className="skg-avatar-tagline">
                          <span style={{color:selectedAvatar.primary}}>▸</span>{" "}{selectedAvatar.tagline}
                        </div>
                      )}
                    </div>
                    <div className="skg-setting-group">
                      <div className="skg-setting-label"><Palette size={13}/> Recolor <Tip text="Override the avatar's color while keeping its shape and weapon."/></div>
                      <div className="skg-swatch-row">
                        <button className={`skg-swatch skg-swatch-default${!settings.avatarColor?" skg-swatch-active":""}`}
                          onClick={()=>updateSetting("avatarColor",null)}>Default</button>
                        {AVATAR_COLOR_SWATCHES.map(c => (
                          <button key={c}
                            className={`skg-swatch${settings.avatarColor===c?" skg-swatch-active":""}`}
                            style={{"--skg-sw":c}} onClick={()=>updateSetting("avatarColor",c)}/>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* WEAPON / PROJECTILE */}
                {settingsTab === "projectile" && (
                  <div className="skg-settings-pane">
                    <div className="skg-setting-group skg-setting-group-wide">
                      <div className="skg-setting-label"><Zap size={13}/> Weapon / Projectile <Tip text="When you complete a word, your avatar fires this at the target. Auto-set by avatar but overrideable."/></div>
                      <div className="skg-avatar-tagline" style={{marginBottom:"0.6rem"}}>
                        <strong>{selectedAvatar.name}</strong>'s default: <strong>{selectedAvatar.weapon}</strong>
                      </div>
                      <div className="skg-projectile-grid">
                        {PROJECTILE_OPTIONS.map(p => (
                          <button key={p.id}
                            className={`skg-proj-btn${(settings.projectileType||"bullet")===p.id?" skg-proj-active":""}`}
                            onClick={()=>updateSetting("projectileType",p.id)}>
                            <span style={{fontSize:"1.1rem"}}>{p.label.split(" ")[0]}</span>
                            <span className="skg-proj-label">{p.label.split(" ").slice(1).join(" ")}</span>
                            <span className="skg-proj-desc">{p.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SOUND */}
                {settingsTab === "sound" && (
                  <div className="skg-settings-pane">
                    <div className="skg-setting-group">
                      <div className="skg-setting-label">{settings.soundOn?<Volume2 size={13}/>:<VolumeX size={13}/>} Sound Pack</div>
                      <select className="skg-select" value={settings.soundPackId}
                        onChange={e=>updateSetting("soundPackId",e.target.value)}>
                        {soundPacks.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <div className="skg-sound-pack-desc">{soundPacks.find(p=>p.id===settings.soundPackId)?.description}</div>
                      <label className="skg-slider-row">
                        <span>Volume</span>
                        <input type="range" min="0" max="1" step="0.05" value={settings.masterVolume}
                          onChange={e=>updateSetting("masterVolume",parseFloat(e.target.value))}/>
                        <span className="skg-vol-num">{Math.round(settings.masterVolume*100)}%</span>
                      </label>
                      <label className="skg-toggle-row">
                        <span>Enable sound effects</span>
                        <span className={`skg-toggle${settings.soundOn?" skg-toggle-on":""}`}
                          onClick={()=>updateSetting("soundOn",!settings.soundOn)}/>
                      </label>
                    </div>
                  </div>
                )}

                {/* DIFFICULTY */}
                {settingsTab === "game" && (
                  <div className="skg-settings-pane">
                    <div className="skg-setting-group">
                      <div className="skg-setting-label"><Settings2 size={13}/> Difficulty <Tip text="Affects word length, speed, spawn rate, and starting lives across all games."/></div>
                      <div className="skg-diff-pills">
                        {DIFFICULTIES.map(d=>(
                          <button key={d.id}
                            className={`skg-diff-pill${settings.difficulty===d.id?" skg-diff-active":""}`}
                            onClick={()=>updateSetting("difficulty",d.id)}>{d.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="skg-setting-group">
                      <div className="skg-setting-label">Session Length <Tip text="How long timed games last per session."/></div>
                      <div className="skg-session-pills">
                        {SESSION_LENGTHS.map(s=>(
                          <button key={s}
                            className={`skg-session-pill${(settings.sessionSeconds||60)===s?" skg-session-active":""}`}
                            onClick={()=>updateSetting("sessionSeconds",s)}>{s}s</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* BACKGROUND */}
                {settingsTab === "bg" && (
                  <div className="skg-settings-pane">
                    <div className="skg-setting-group skg-setting-group-wide">
                      <div className="skg-setting-label"><ImageIcon size={13}/> Animated Background <Tip text="Each theme has moving elements: stars, rain, embers, petals. Upload your own image for a custom look."/></div>
                      <div className="skg-bg-grid">
                        {/* Custom upload */}
                        <label className="skg-bg-upload-btn" title="Upload JPG/PNG/WebP">
                          <input type="file" accept="image/*" style={{display:"none"}}
                            onChange={e=>{
                              const f = e.target.files?.[0]; if (!f) return;
                              const reader = new FileReader();
                              reader.onload = ev => { updateSetting("customBgUrl", ev.target.result); updateSetting("bgTheme", "custom"); };
                              reader.readAsDataURL(f);
                            }}/>
                          <span className="skg-bg-upload-icon">🖼️</span>
                          <span>{settings.customBgUrl ? "Change image" : "Upload image"}</span>
                        </label>
                        {settings.customBgUrl && (
                          <div className="skg-bg-swatch skg-bg-swatch-active"
                            onClick={()=>{ updateSetting("customBgUrl",null); updateSetting("bgTheme","space"); }}>
                            <img src={settings.customBgUrl} alt="custom bg" className="skg-bg-custom-preview"/>
                            <span className="skg-bg-swatch-label">✕ Custom</span>
                          </div>
                        )}
                        {/* Preset themes */}
                        {BG_THEMES.filter(t=>t.id!=="custom").map(bg=>{
                          const PREVIEWS = {
                            space:"radial-gradient(#1e1b4b,#030712)",forest:"linear-gradient(#022c22,#14532d)",
                            city:"linear-gradient(#020617,#1e1b4b)",volcano:"linear-gradient(#1c0a00,#b91c1c)",
                            ocean:"linear-gradient(#0c4a6e,#0284c7)",arctic:"linear-gradient(#0c1445,#e0f2fe)",
                            arcade:"#000",sakura:"linear-gradient(#fce7f3,#f9a8d4)",
                          };
                          return (
                            <div key={bg.id}
                              className={`skg-bg-swatch${settings.bgTheme===bg.id&&!settings.customBgUrl?" skg-bg-swatch-active":""}`}
                              style={PREVIEWS[bg.id]?.startsWith("linear")||PREVIEWS[bg.id]?.startsWith("radial")
                                ? {backgroundImage:PREVIEWS[bg.id]}
                                : {background:PREVIEWS[bg.id]}}
                              onClick={()=>{ updateSetting("bgTheme",bg.id); updateSetting("customBgUrl",null); }}>
                              <span className="skg-bg-swatch-label">{bg.label}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="skg-bg-hint">All backgrounds have animated moving elements (stars, rain, embers, petals…)</div>
                    </div>
                  </div>
                )}

                {/* ACCESSIBILITY */}
                {settingsTab === "access" && (
                  <div className="skg-settings-pane">
                    <div className="skg-setting-group">
                      <div className="skg-setting-label"><Shield size={13}/> Accessibility</div>
                      {[
                        ["beaconOn",    "Next-key beacon",    "Shows the next letter near your avatar."],
                        ["particlesOn", "Eat particles",      "Burst animation when a word is eaten."],
                        ["reduceMotion","Reduce motion",      "Disables all animations for focus mode."],
                      ].map(([key,label,tip])=>(
                        <label key={key} className="skg-toggle-row">
                          <span>{label} <Tip text={tip}/></span>
                          <span className={`skg-toggle${settings[key]?" skg-toggle-on":""}`}
                            onClick={()=>updateSetting(key,!settings[key])}/>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CATEGORY FILTER ── */}
          <div className="skg-category-bar">
            {CATEGORIES.map(cat=>(
              <button key={cat.id}
                className={`skg-cat-btn${categoryFilter===cat.id?" skg-cat-active":""}`}
                onClick={()=>setCategoryFilter(cat.id)}>{cat.label}</button>
            ))}
            <div className="skg-cat-spacer"/>
            <div className="skg-game-count">{filteredGames.length} games</div>
          </div>

          {/* ── GAME GRID ── */}
          <div className="skg-game-grid">
            {filteredGames.map(g => {
              const Icon = ICON_MAP[g.iconKey] || Gamepad2;
              // Use unified stats from useGameStats hook
              const stat = allStats[g.id] || getStat(g.id);
              const hasPlayed = (stat.gamesPlayed || 0) > 0;
              const bestScore = stat.bestScore || 0;
              const nextTarget = hasPlayed ? Math.ceil(bestScore * 1.25 / 100) * 100 : null;
              return (
                <div key={g.id}
                  className={`skg-game-card${g.isNew?" skg-game-card-new":""}`}
                  style={{"--skg-card-accent":g.accent}}>
                  {g.isNew && <div className="skg-new-badge">NEW</div>}
                  <div className="skg-game-card-top">
                    <div className="skg-game-card-icon"><Icon size={24}/></div>
                    {hasPlayed && <div className="skg-plays-badge">{stat.gamesPlayed}×</div>}
                  </div>
                  <div className="skg-game-card-name">{g.name}</div>
                  <p className="skg-game-card-tag">{g.tagline}</p>
                  {g.description && <p className="skg-game-card-desc">{g.description}</p>}

                  {hasPlayed ? (
                    <div className="skg-score-section">
                      <div className="skg-score-row">
                        <div className="skg-score-item">
                          <span className="skg-score-label"><Trophy size={10}/> Best</span>
                          <span className="skg-score-val" style={{color:g.accent}}>{bestScore}</span>
                        </div>
                        <div className="skg-score-item">
                          <span className="skg-score-label"><TrendingUp size={10}/> Last</span>
                          <span className="skg-score-val">{stat.lastScore||0}</span>
                        </div>
                        <div className="skg-score-item">
                          <span className="skg-score-label"><Flame size={10}/> Combo</span>
                          <span className="skg-score-val">×{stat.bestCombo||0}</span>
                        </div>
                      </div>
                      {nextTarget && (
                        <div className="skg-next-target">
                          <Target size={10}/>
                          <span>Next: <strong>{nextTarget}</strong></span>
                          <div className="skg-target-bar">
                            <div className="skg-target-fill"
                              style={{width:`${Math.min((bestScore/nextTarget)*100,100)}%`,background:g.accent}}/>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="skg-score-empty"><Star size={11}/> No score yet — be the first!</div>
                  )}

                  <div className="skg-tag-row">
                    {g.tags?.map(t=><span key={t} className="skg-tag">{t}</span>)}
                  </div>
                  <button className="skg-play-btn" onClick={()=>startGame(g.id)}>
                    Play <ChevronRight size={14}/>
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── GLOBAL STATS ── */}
          <div className="skg-stats-bar">
            <div className="skg-stats-bar-item">
              <Gamepad2 size={14}/>
              <span>{Object.values(allStats).reduce((a,s)=>a+(s.gamesPlayed||0),0)} total games</span>
            </div>
            <div className="skg-stats-bar-item">
              <Trophy size={14}/>
              <span>Best: {Math.max(0,...Object.values(allStats).map(s=>s.bestScore||0))}</span>
            </div>
            <div className="skg-stats-bar-item">
              <Flame size={14}/>
              <span>Best combo: ×{Math.max(0,...Object.values(allStats).map(s=>s.bestCombo||0))}</span>
            </div>
            <div className="skg-stats-bar-item">
              <Star size={14}/>
              <span>{Object.values(allStats).reduce((a,s)=>a+(s.totalWordsCompleted||0),0)} words typed</span>
            </div>
            <div className="skg-stats-bar-item" style={{marginLeft:"auto",fontSize:"0.7rem",color:"var(--skg-text-dim)"}}>
              {isAuthenticated ? "✓ Stats synced to account" : "⚠ Guest — stats local only"}
            </div>
          </div>
        </>
      )}
    </div>
  );
}