// ============================================================================
// ZombieSurvivalGame.jsx
// Genre: Survival — type action words to defend your base from zombie waves.
// You decide priorities: repair walls, reload gun, heal, craft, upgrade.
// Wrong decisions get you overwhelmed. Every run is unique.
// ============================================================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, RotateCcw, Trophy, Heart, Shield, Zap, Users, Monitor, Info, ChevronRight } from "lucide-react";
import GameAvatar from "../../../components/Games/Gameavatar";
import useGameAudio from "../../../components/Games/Usegameaudio";

// ── Game constants ────────────────────────────────────────────────────────────
const MAX_WALL_HP   = 100;
const MAX_PLAYER_HP = 100;
const MAX_AMMO      = 12;
const WAVE_SIZE_BASE = 4;

// ── All possible actions the player can type ──────────────────────────────────
const ACTIONS = {
  reload:  { word: "reload",  emoji: "🔫", color: "#fbbf24", category: "combat",   desc: "Reload gun (+6 ammo)",       effect: "ammo",   value: 6  },
  repair:  { word: "repair",  emoji: "🔧", color: "#22e6c5", category: "defense",  desc: "Repair walls (+20 HP)",      effect: "wall",   value: 20 },
  heal:    { word: "heal",    emoji: "💊", color: "#86efac", category: "survival", desc: "Heal yourself (+15 HP)",     effect: "player", value: 15 },
  build:   { word: "build",   emoji: "🏗️", color: "#a78bfa", category: "defense",  desc: "Build barrier (+10 wall)",   effect: "wall",   value: 10 },
  craft:   { word: "craft",   emoji: "⚒️", color: "#f97316", category: "combat",   desc: "Craft item (+score bonus)",  effect: "score",  value: 50 },
  upgrade: { word: "upgrade", emoji: "⬆️", color: "#c084fc", category: "upgrade",  desc: "Upgrade base (+damage)",     effect: "damage", value: 1  },
  shoot:   { word: "shoot",   emoji: "💥", color: "#ff4d6d", category: "combat",   desc: "Shoot zombie (-1 ammo)",     effect: "kill",   value: 1  },
  barricade:{ word:"barricade",emoji:"🪵",  color: "#92400e", category: "defense",  desc: "Barricade door (+25 wall)",  effect: "wall",   value: 25 },
  medkit:  { word: "medkit",  emoji: "🩺", color: "#4ade80", category: "survival", desc: "Use medkit (+30 HP)",        effect: "player", value: 30 },
  grenade: { word: "grenade", emoji: "💣", color: "#ef4444", category: "combat",   desc: "Throw grenade (kill 3)",     effect: "kill",   value: 3  },
};

const ZOMBIE_NAMES = ["Shambler","Runner","Bruiser","Spitter","Crawler","Screamer"];
function rndZombie() {
  return {
    name: ZOMBIE_NAMES[Math.floor(Math.random() * ZOMBIE_NAMES.length)],
    hp: 20 + Math.floor(Math.random() * 20),
    damage: 5 + Math.floor(Math.random() * 8),
    emoji: ["🧟","🧟‍♂️","🧟‍♀️"][Math.floor(Math.random() * 3)],
  };
}

function Tip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="skr-tip-wrap" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Info size={13} className="skr-tip-icon"/>
      {show && <span className="skr-tooltip">{text}</span>}
    </span>
  );
}

function StatBar({ value, max, color, label, emoji }) {
  const pct = Math.max(0, Math.min((value / max) * 100, 100));
  const lowColor = pct < 25 ? "var(--skg-coral)" : color;
  return (
    <div className="skzs-stat-bar">
      <div className="skzs-stat-label">{emoji} {label}</div>
      <div className="skzs-bar-track">
        <div className="skzs-bar-fill" style={{ width: `${pct}%`, background: lowColor,
          animation: pct < 25 ? "skg-pressure-warn 0.5s ease-in-out infinite" : "none" }}/>
      </div>
      <span className="skzs-bar-num" style={{ color: lowColor }}>{Math.round(value)}/{max}</span>
    </div>
  );
}

function ActionWord({ action, typedLen, isActive, shake }) {
  if (!action) return null;
  return (
    <div className={`skzs-action-word${isActive ? " skzs-action-active" : ""}${shake ? " sktd-shake" : ""}`}
      style={{ borderColor: isActive ? action.color : undefined }}>
      <span className="skzs-action-emoji">{action.emoji}</span>
      <div className="skzs-action-chars">
        {action.word.split("").map((ch, i) => (
          <span key={i} className={
            i < typedLen       ? "sktd-ch-done"
            : i === typedLen   ? "sktd-ch-current"
            : "sktd-ch-pending"
          }>{ch}</span>
        ))}
      </div>
      <span className="skzs-action-desc" style={{ color: action.color }}>{action.desc}</span>
    </div>
  );
}

function Lobby({ onStart, onExit }) {
  return (
    <div className="skr-lobby">
      <div className="skr-lobby-card skzs-lobby-card">
        <div className="skr-lobby-title">🧟 Zombie Survival</div>
        <p className="skr-lobby-sub">Type action words to defend your base. Wrong priorities get you overwhelmed!</p>
        <div className="skr-lobby-section">
          <div className="skr-lobby-label">Mode <Tip text="Multiplayer co-op defense coming soon!"/></div>
          <div className="skr-mode-pills">
            <button className="skr-mode-pill skr-mode-active"><Monitor size={14}/> Solo Survival</button>
            <button className="skr-mode-pill skr-mode-soon" disabled>
              <Users size={14}/> Co-op <span className="skr-soon-badge">Soon</span>
            </button>
          </div>
        </div>
        <div className="skzs-action-preview">
          <div className="skr-lobby-label">Available Actions <Tip text="You'll see a queue of actions. Type the word to perform them. Choose wisely!"/></div>
          <div className="skzs-preview-chips">
            {Object.values(ACTIONS).slice(0, 6).map((a) => (
              <div key={a.word} className="skzs-preview-chip" style={{ borderColor: a.color }}>
                {a.emoji} <code>{a.word}</code>
              </div>
            ))}
          </div>
        </div>
        <div className="skr-lobby-actions">
          <button className="skg-btn skg-btn-primary" onClick={onStart}>
            Survive! <ChevronRight size={16}/>
          </button>
          <button className="skg-btn skg-btn-ghost" onClick={onExit}>Back to Arcade</button>
        </div>
      </div>
    </div>
  );
}

// ── Generates a random queue of 5 actions ────────────────────────────────────
function pickActionQueue(wallHp, playerHp, ammo, wave) {
  const all = Object.values(ACTIONS);
  // Weight toward urgent actions
  const urgent = [];
  if (wallHp < 30)   urgent.push(ACTIONS.repair, ACTIONS.barricade, ACTIONS.build);
  if (playerHp < 30) urgent.push(ACTIONS.heal, ACTIONS.medkit);
  if (ammo <= 2)     urgent.push(ACTIONS.reload, ACTIONS.reload);
  if (wave > 2)      urgent.push(ACTIONS.grenade, ACTIONS.upgrade);
  const pool = [...urgent, ...all, ...all];
  const out = [];
  const used = new Set();
  while (out.length < 5) {
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!used.has(pick.word)) { out.push(pick); used.add(pick.word); }
  }
  return out;
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ZombieSurvivalGame({
  avatar, difficulty, sessionSeconds, settings, onExit, onRestart, onFinish,
}) {
  const { play } = useGameAudio({
    packId:  settings?.soundPackId  ?? "epic",
    volume:  settings?.masterVolume ?? 0.7,
    enabled: settings?.soundOn      ?? true,
  });

  const [phase,      setPhase]      = useState("lobby");
  const [wallHp,     setWallHp]     = useState(MAX_WALL_HP);
  const [playerHp,   setPlayerHp]   = useState(MAX_PLAYER_HP);
  const [ammo,       setAmmo]       = useState(MAX_AMMO);
  const [damageBonus,setDamageBonus]= useState(0);
  const [wave,       setWave]       = useState(1);
  const [zombies,    setZombies]    = useState([]);
  const [score,      setScore]      = useState(0);
  const [combo,      setCombo]      = useState(0);
  const [actionQueue,setActionQueue]= useState([]);
  const [typedLen,   setTypedLen]   = useState(0);
  const [shake,      setShake]      = useState(false);
  const [avatarState,setAvatarState]= useState("idle");
  const [pulseKey,   setPulseKey]   = useState(0);
  const [log,        setLog]        = useState([]);
  const [timeLeft,   setTimeLeft]   = useState(sessionSeconds);
  const [waveAnnounce, setWaveAnnounce] = useState(null);

  const hurtRef     = useRef(null);
  const finishedRef = useRef(false);
  const typedRef    = useRef(0);
  const wallRef     = useRef(MAX_WALL_HP);
  const playerRef   = useRef(MAX_PLAYER_HP);
  const ammoRef     = useRef(MAX_AMMO);
  const damageRef   = useRef(0);
  const zombiesRef  = useRef([]);
  const waveRef     = useRef(1);
  const comboRef    = useRef(0);
  const scoreRef    = useRef(0);

  const addLog = useCallback((msg) => setLog((l) => [...l.slice(-7), msg]), []);

  const flash = useCallback((s) => {
    setAvatarState(s);
    setPulseKey((k) => k + 1);
    clearTimeout(hurtRef.current);
    if (s !== "idle") hurtRef.current = setTimeout(() => setAvatarState("idle"), 280);
  }, []);

  const refreshQueue = useCallback(() => {
    const q = pickActionQueue(wallRef.current, playerRef.current, ammoRef.current, waveRef.current);
    setActionQueue(q);
    typedRef.current = 0;
    setTypedLen(0);
  }, []);

  const startGame = useCallback(() => {
    setWallHp(MAX_WALL_HP); wallRef.current = MAX_WALL_HP;
    setPlayerHp(MAX_PLAYER_HP); playerRef.current = MAX_PLAYER_HP;
    setAmmo(MAX_AMMO); ammoRef.current = MAX_AMMO;
    setDamageBonus(0); damageRef.current = 0;
    setWave(1); waveRef.current = 1;
    setScore(0); scoreRef.current = 0;
    setCombo(0); comboRef.current = 0;
    setZombies([]); zombiesRef.current = [];
    setLog(["🧟 Wave 1 incoming! Defend your base!"]);
    finishedRef.current = false;
    setWaveAnnounce("Wave 1");
    setTimeout(() => setWaveAnnounce(null), 1800);
    const q = pickActionQueue(MAX_WALL_HP, MAX_PLAYER_HP, MAX_AMMO, 1);
    setActionQueue(q);
    typedRef.current = 0;
    setTypedLen(0);
    setPhase("playing");
  }, []);

  // Spawn zombies per wave
  useEffect(() => {
    if (phase !== "playing") return;
    const count = WAVE_SIZE_BASE + waveRef.current * 2;
    const newZombies = Array.from({ length: count }, rndZombie);
    setZombies(newZombies);
    zombiesRef.current = newZombies;
  }, [wave, phase]);

  // Zombie attack loop
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      if (zombiesRef.current.length === 0) return;
      const z = zombiesRef.current[0];
      // Zombie attacks wall first, then player
      if (wallRef.current > 0) {
        const dmg = z.damage;
        wallRef.current = Math.max(0, wallRef.current - dmg);
        setWallHp(wallRef.current);
        if (wallRef.current <= 0) addLog(`🧱 Wall destroyed by ${z.name}!`);
      } else {
        const dmg = Math.floor(z.damage * 1.5);
        playerRef.current = Math.max(0, playerRef.current - dmg);
        setPlayerHp(playerRef.current);
        addLog(`💀 ${z.name} attacked you! -${dmg} HP`);
        flash("hurt");
        play("wrong");
        if (playerRef.current <= 0) { setPhase("over"); }
      }
    }, 1600 - Math.min(waveRef.current * 80, 900));
    return () => clearInterval(id);
  }, [phase, wave, addLog, flash, play]);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    setTimeLeft(sessionSeconds);
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); setPhase("over"); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, sessionSeconds]);

  // Keyboard
  const currentAction = actionQueue[0];
  const target = currentAction?.word ?? "";

  useEffect(() => {
    if (phase !== "playing" || !currentAction) return;
    const onKey = (e) => {
      if (e.key.length !== 1 && e.key !== " ") return;
      const idx = typedRef.current;
      if (e.key.toLowerCase() === target[idx]?.toLowerCase()) {
        const newLen = idx + 1;
        typedRef.current = newLen;
        setTypedLen(newLen);
        play("bite");
        flash("bite");

        if (newLen >= target.length) {
          // Action performed!
          const ac = currentAction;
          comboRef.current += 1;
          setCombo(comboRef.current);
          const pts = ac.word.length * 10 + comboRef.current * 5;
          scoreRef.current += pts;
          setScore(scoreRef.current);
          flash("eat");
          play("eat");

          if (ac.effect === "wall") {
            wallRef.current = Math.min(MAX_WALL_HP, wallRef.current + ac.value);
            setWallHp(wallRef.current);
            addLog(`${ac.emoji} ${ac.desc} — wall at ${Math.round(wallRef.current)} HP (+${pts} pts)`);
          } else if (ac.effect === "player") {
            playerRef.current = Math.min(MAX_PLAYER_HP, playerRef.current + ac.value);
            setPlayerHp(playerRef.current);
            addLog(`${ac.emoji} ${ac.desc} — HP at ${Math.round(playerRef.current)} (+${pts} pts)`);
          } else if (ac.effect === "ammo") {
            ammoRef.current = Math.min(MAX_AMMO, ammoRef.current + ac.value);
            setAmmo(ammoRef.current);
            addLog(`${ac.emoji} ${ac.desc} — ammo: ${ammoRef.current} (+${pts} pts)`);
          } else if (ac.effect === "kill") {
            const kills = Math.min(ac.value, zombiesRef.current.length);
            if (ammoRef.current <= 0 && ac.word !== "grenade") {
              addLog(`🔫 Out of ammo! Reload first!`);
              comboRef.current = 0; setCombo(0);
            } else {
              if (ac.word === "shoot") { ammoRef.current = Math.max(0, ammoRef.current - 1); setAmmo(ammoRef.current); }
              const remaining = zombiesRef.current.slice(kills);
              zombiesRef.current = remaining;
              setZombies(remaining);
              addLog(`${ac.emoji} ${kills} zombie(s) eliminated! (+${pts} pts)`);
              if (remaining.length === 0) {
                // Wave clear!
                const waveBonus = waveRef.current * 100;
                scoreRef.current += waveBonus;
                setScore(scoreRef.current);
                waveRef.current += 1;
                setWave(waveRef.current);
                setWaveAnnounce(`Wave ${waveRef.current}`);
                setTimeout(() => setWaveAnnounce(null), 1800);
                addLog(`🎉 Wave cleared! +${waveBonus} bonus! Wave ${waveRef.current} incoming!`);
                play("levelUp");
                flash("victory");
              }
            }
          } else if (ac.effect === "score") {
            addLog(`${ac.emoji} ${ac.desc} (+${pts + ac.value} pts)`);
            scoreRef.current += ac.value;
            setScore(scoreRef.current);
          } else if (ac.effect === "damage") {
            damageRef.current += ac.value;
            setDamageBonus(damageRef.current);
            addLog(`${ac.emoji} Base upgraded! Damage +${damageRef.current} (+${pts} pts)`);
          }

          refreshQueue();
        }
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 300);
        comboRef.current = 0;
        setCombo(0);
        flash("hurt");
        play("wrong");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, currentAction, target, refreshQueue, flash, play, addLog]);

  // Emit result
  useEffect(() => {
    if (phase !== "over" || finishedRef.current) return;
    finishedRef.current = true;
    onFinish?.({
      gameId: "zombie-survival",
      score: scoreRef.current,
      maxCombo: comboRef.current,
      wordsCompleted: Math.floor(scoreRef.current / 15),
      mistakes: 0,
      wave: waveRef.current,
    });
  }, [phase]);

  if (phase === "lobby") return <div className="skg-game skg-zombie"><Lobby onStart={startGame} onExit={onExit}/></div>;

  const timerColor = timeLeft <= 10 ? "var(--skg-coral)" : timeLeft <= 20 ? "var(--skg-amber)" : undefined;
  const wallDanger = wallHp < 30;
  const playerDanger = playerHp < 30;

  return (
    <div className="skg-game skg-zombie">
      {/* Wave announcement overlay */}
      {waveAnnounce && (
        <div className="skzs-wave-announce">
          <div className="skzs-wave-text">🧟 {waveAnnounce} Incoming!</div>
        </div>
      )}

      {/* HUD */}
      <div className="skg-hud">
        <button className="skg-icon-btn" onClick={onExit}><X size={18}/></button>
        <div className="skg-hud-stat" style={{ color: "var(--skg-lime)" }}><Trophy size={14}/> {score}</div>
        <div className="skg-hud-stat skg-hud-combo">×{combo}</div>
        <div className="skg-hud-stat skzs-wave-badge">🧟 Wave {wave}</div>
        <div className="skg-hud-stat">🔫 {ammo}/{MAX_AMMO}</div>
        <div className="skg-hud-timer" style={{ color: timerColor }}>{timeLeft}s</div>
      </div>

      {/* Status bars */}
      <div className="skzs-status-panel">
        <StatBar value={wallHp}   max={MAX_WALL_HP}   color="#22e6c5" label="Wall HP"   emoji="🧱"/>
        <StatBar value={playerHp} max={MAX_PLAYER_HP} color="#f87171" label="Player HP" emoji="❤️"/>
        <div className="skzs-zombie-count">
          {zombies.slice(0, 8).map((z, i) => (
            <span key={i} title={`${z.name} — ${z.hp}HP`} className="skzs-zombie-dot">{z.emoji}</span>
          ))}
          {zombies.length > 8 && <span className="skzs-zombie-more">+{zombies.length - 8}</span>}
          {zombies.length === 0 && <span className="skzs-zombie-clear">✅ Area clear!</span>}
        </div>
      </div>

      {/* Main layout */}
      <div className="skzs-layout">
        {/* Avatar + danger indicators */}
        <div className="skzs-avatar-col">
          <GameAvatar avatar={avatar} state={avatarState} pulseKey={pulseKey}
            comboLevel={Math.min(Math.floor(combo / 4), 3)} size={84}
            reduceMotion={settings?.reduceMotion}/>
          {wallDanger   && <div className="skzs-danger-tag skzs-wall-danger">⚠️ Repair wall!</div>}
          {playerDanger && <div className="skzs-danger-tag skzs-player-danger">⚠️ Heal up!</div>}
          {ammo <= 2    && <div className="skzs-danger-tag skzs-ammo-danger">⚠️ Low ammo!</div>}
        </div>

        {/* Action queue */}
        <div className="skzs-action-col">
          <div className="skzs-action-title">
            Choose your action:
            <Tip text="Type the word next to each action to perform it. The first item is active. Prioritize wisely!"/>
          </div>
          {actionQueue.map((ac, i) => (
            <ActionWord key={`${ac.word}-${i}`} action={ac} typedLen={i === 0 ? typedLen : 0}
              isActive={i === 0} shake={i === 0 && shake}/>
          ))}
        </div>

        {/* Battle log */}
        <div className="skzs-log-col">
          <div className="skzs-log-title">📻 Base Radio</div>
          {log.slice(-8).map((l, i) => (
            <div key={i} className="skzs-log-entry">{l}</div>
          ))}
        </div>
      </div>

      {/* Result */}
      {phase === "over" && (
        <div className="skg-overlay">
          <div className="skg-overlay-card skzs-result-card">
            <div className="skzs-result-icon">{playerHp > 0 ? "🏆" : "💀"}</div>
            <div className="skg-overlay-title">{playerHp > 0 ? "Survived!" : "Overrun!"}</div>
            <div className="skg-overlay-score">{score}</div>
            <div className="skg-overlay-sub">pts · Wave {wave} reached</div>
            <div className="skm-stat-grid">
              <div className="skm-stat-cell"><span className="skm-stat-label">Waves survived</span><span className="skm-stat-val">{wave - 1}</span></div>
              <div className="skm-stat-cell"><span className="skm-stat-label">Best combo</span><span className="skm-stat-val">×{combo}</span></div>
              <div className="skm-stat-cell"><span className="skm-stat-label">HP remaining</span><span className="skm-stat-val skm-stat-acc">{Math.max(0, Math.round(playerHp))}</span></div>
              <div className="skm-stat-cell"><span className="skm-stat-label">Upgrades</span><span className="skm-stat-val">{damageBonus}</span></div>
            </div>
            <div className="skg-overlay-actions">
              <button className="skg-btn skg-btn-primary" onClick={onRestart}><RotateCcw size={15}/> Survive Again</button>
              <button className="skg-btn skg-btn-ghost" onClick={onExit}>Back to Arcade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}