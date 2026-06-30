// ============================================================================
// WordTowerDefenseGame.jsx  —  TOWER DEFENSE
// Enemies march down a path. Type words to:
//   • Place towers (cannon, laser, ice, fire, lightning)
//   • Upgrade existing towers
//   • Use special abilities (airstrike, freeze, nuke)
// Towers auto-shoot enemies in range. Gold economy. Wave escalation.
// ============================================================================
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { X, RotateCcw, Trophy, Shield, Zap, Users, Monitor, Info, ChevronRight, Heart } from "lucide-react";
import useGameAudio from "../../../components/Games/Usegameaudio";
import AnimatedBackground from "../../../components/Games/Animatedbackground";

// ── Tower definitions ─────────────────────────────────────────────────────────
const TOWER_TYPES = {
  cannon:    { word:"cannon",    emoji:"💣", cost:60,  dmg:25, range:20, rate:1200, color:"#fbbf24", desc:"Slow but powerful"    },
  laser:     { word:"laser",     emoji:"⚡", cost:80,  dmg:15, range:28, rate:600,  color:"#22e6c5", desc:"Fast rapid-fire"       },
  ice:       { word:"ice",       emoji:"❄️", cost:70,  dmg:10, range:22, rate:900,  color:"#88f0ff", desc:"Slows enemies"         },
  fire:      { word:"fire",      emoji:"🔥", cost:75,  dmg:20, range:18, rate:750,  color:"#ff7849", desc:"Burns over time"       },
  lightning: { word:"lightning", emoji:"⚡", cost:120, dmg:40, range:30, rate:2000, color:"#a78bfa", desc:"Chain damage"          },
  sniper:    { word:"sniper",    emoji:"🎯", cost:100, dmg:60, range:45, rate:2500, color:"#86efac", desc:"Long range precision"  },
};

// ── Special abilities ─────────────────────────────────────────────────────────
const ABILITIES = {
  airstrike: { word:"airstrike", emoji:"💥", cost:150, desc:"Kills all on-screen enemies" },
  freeze:    { word:"freeze",    emoji:"🧊", cost:100, desc:"Freezes all enemies 3 seconds" },
  nuke:      { word:"nuke",      emoji:"☢️",  cost:200, desc:"Massive area damage" },
};

// ── Enemy types ───────────────────────────────────────────────────────────────
const ENEMY_TYPES = [
  { type:"walker",  emoji:"🧟", hp:40,  speed:0.18, reward:15, armor:0   },
  { type:"runner",  emoji:"🏃", hp:25,  speed:0.32, reward:10, armor:0   },
  { type:"tank",    emoji:"🛡️", hp:120, speed:0.10, reward:30, armor:0.3 },
  { type:"flyer",   emoji:"🦅", hp:35,  speed:0.28, reward:20, armor:0   },
  { type:"boss",    emoji:"👿", hp:300, speed:0.08, reward:80, armor:0.4 },
];

// ── Path waypoints (% of container) ──────────────────────────────────────────
const PATH = [
  {x:0,  y:50},
  {x:20, y:50},
  {x:20, y:20},
  {x:50, y:20},
  {x:50, y:75},
  {x:80, y:75},
  {x:80, y:40},
  {x:100,y:40},
];

// ── Tower placement slots (not on path) ──────────────────────────────────────
const SLOTS = [
  {x:10,y:28},{x:10,y:72},{x:32,y:40},{x:32,y:72},{x:40,y:8},
  {x:62,y:10},{x:62,y:50},{x:65,y:88},{x:72,y:58},{x:88,y:60},
  {x:88,y:22},{x:90,y:88},{x:8,y:8},  {x:45,y:88},{x:55,y:40},
];

function Tip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="skr-tip-wrap" onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      <Info size={13} className="skr-tip-icon"/>
      {show && <span className="skr-tooltip">{text}</span>}
    </span>
  );
}

let _eid = 0, _tid = 0, _bid = 0;

function makeEnemy(wave, idx) {
  const typeIdx = wave >= 5 ? Math.floor(Math.random()*ENEMY_TYPES.length) : Math.min(Math.floor(Math.random()*(1+Math.floor(wave/2))), ENEMY_TYPES.length-1);
  const et = ENEMY_TYPES[typeIdx];
  return {
    id: ++_eid,
    ...et,
    maxHp: et.hp + wave * 8,
    hp: et.hp + wave * 8,
    speed: et.speed * (1 + wave * 0.05),
    pathIdx: 0,
    t: 0,
    x: PATH[0].x,
    y: PATH[0].y,
    frozen: 0,
    burning: 0,
    burnDmg: 0,
    spawnDelay: idx * 900,
    spawned: false,
  };
}

function WordTarget({ word, typedLen, shake, action, color }) {
  return (
    <div className={`std-word-target${shake?" sktd-shake":""}`} style={{ borderColor: color || "var(--skg-border)" }}>
      {action && <span className="std-action-badge" style={{ background: color }}>{action}</span>}
      <div className="std-word-chars">
        {word.split("").map((ch, i) => (
          <span key={i} className={
            i<typedLen?"sktd-ch-done":i===typedLen?"sktd-ch-current":"sktd-ch-pending"
          }>{ch}</span>
        ))}
      </div>
    </div>
  );
}

function Lobby({ onStart, onExit }) {
  return (
    <div className="skr-lobby">
      <div className="skr-lobby-card std-lobby-card">
        <div className="skr-lobby-title">🏰 Word Tower Defense</div>
        <p className="skr-lobby-sub">Type tower names to place them. Towers auto-shoot enemies. Earn gold, upgrade, use abilities!</p>
        <div className="skr-lobby-section">
          <div className="skr-lobby-label">Mode <Tip text="Co-op defense mode coming soon!"/></div>
          <div className="skr-mode-pills">
            <button className="skr-mode-pill skr-mode-active"><Monitor size={14}/> Solo Defense</button>
            <button className="skr-mode-pill skr-mode-soon" disabled>
              <Users size={14}/> Co-op <span className="skr-soon-badge">Soon</span>
            </button>
          </div>
        </div>
        <div className="skr-lobby-section">
          <div className="skr-lobby-label">Towers <Tip text="Type any tower name to place it in the next available slot. Costs gold!"/></div>
          <div className="std-tower-preview">
            {Object.values(TOWER_TYPES).map(t => (
              <div key={t.word} className="std-tower-chip" style={{ borderColor: t.color }}>
                <span>{t.emoji}</span>
                <code style={{ color: t.color }}>{t.word}</code>
                <span className="std-chip-cost">💰{t.cost}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="skr-lobby-section">
          <div className="skr-lobby-label">Abilities <Tip text="Type these for powerful one-time effects. Costs more gold."/></div>
          <div className="std-tower-preview">
            {Object.values(ABILITIES).map(a => (
              <div key={a.word} className="std-tower-chip" style={{ borderColor: "#e879f9" }}>
                <span>{a.emoji}</span>
                <code style={{ color: "#e879f9" }}>{a.word}</code>
                <span className="std-chip-cost">💰{a.cost}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="skr-lobby-actions">
          <button className="skg-btn skg-btn-primary" onClick={onStart}>Defend! <ChevronRight size={16}/></button>
          <button className="skg-btn skg-btn-ghost" onClick={onExit}>Back to Arcade</button>
        </div>
      </div>
    </div>
  );
}

// ── Interpolate along path ────────────────────────────────────────────────────
function getPathPos(enemy) {
  const a = PATH[enemy.pathIdx];
  const b = PATH[Math.min(enemy.pathIdx + 1, PATH.length - 1)];
  if (!b || enemy.pathIdx >= PATH.length - 1) return { x: PATH[PATH.length-1].x, y: PATH[PATH.length-1].y, done: true };
  return {
    x: a.x + (b.x - a.x) * enemy.t,
    y: a.y + (b.y - a.y) * enemy.t,
    done: false,
  };
}

export default function WordTowerDefenseGame({
  avatar, difficulty, sessionSeconds, settings, userData, onExit, onRestart, onFinish,
}) {
  const { play } = useGameAudio({ packId: settings?.soundPackId ?? "epic", volume: settings?.masterVolume ?? 0.7, enabled: settings?.soundOn ?? true });

  const [phase, setPhase] = useState("lobby");

  const [towers,   setTowers]   = useState([]);
  const [enemies,  setEnemies]  = useState([]);
  const [bullets,  setBullets]  = useState([]);
  const [effects,  setEffects]  = useState([]);
  const [gold,     setGold]     = useState(120);
  const [lives,    setLives]    = useState(20);
  const [wave,     setWave]     = useState(0);
  const [score,    setScore]    = useState(0);
  const [combo,    setCombo]    = useState(0);
  const [word,     setWord]     = useState("cannon");
  const [typedLen, setTypedLen] = useState(0);
  const [shake,    setShake]    = useState(false);
  const [waveActive, setWaveActive] = useState(false);
  const [waveCountdown, setWaveCountdown] = useState(5);
  const [frozenUntil,   setFrozenUntil]   = useState(0);
  const [log, setLog] = useState(["🏰 Build towers and defend the base!"]);

  const towersRef   = useRef([]);
  const enemiesRef  = useRef([]);
  const bulletsRef  = useRef([]);
  const goldRef     = useRef(120);
  const livesRef    = useRef(20);
  const waveRef     = useRef(0);
  const scoreRef    = useRef(0);
  const comboRef    = useRef(0);
  const typedRef    = useRef(0);
  const wordRef     = useRef("cannon");
  const finishedRef = useRef(false);
  const fxIdRef     = useRef(0);
  const frozenRef   = useRef(0);
  const slotIdxRef  = useRef(0);

  useEffect(() => { towersRef.current = towers; }, [towers]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  useEffect(() => { bulletsRef.current = bullets; }, [bullets]);

  const addEffect = useCallback((text, color, x, y) => {
    const id = fxIdRef.current++;
    setEffects(p => [...p, { id, text, color, x, y }]);
    setTimeout(() => setEffects(p => p.filter(e => e.id !== id)), 900);
  }, []);

  const addLog = useCallback((msg) => setLog(l => [...l.slice(-6), msg]), []);

  const nextAvailableSlot = useCallback(() => {
    const usedSlots = new Set(towersRef.current.map(t => t.slotIdx));
    for (let i = 0; i < SLOTS.length; i++) {
      if (!usedSlots.has(i)) return i;
    }
    return null;
  }, []);

  const setNextWord = useCallback(() => {
    // Cycle through tower names + abilities
    const all = [...Object.keys(TOWER_TYPES), ...Object.keys(ABILITIES), "upgrade"];
    const next = all[Math.floor(Math.random() * all.length)];
    wordRef.current = next;
    setWord(next);
    typedRef.current = 0;
    setTypedLen(0);
  }, []);

  const startGame = useCallback(() => {
    towersRef.current = []; setTowers([]);
    enemiesRef.current = []; setEnemies([]);
    bulletsRef.current = []; setBullets([]);
    goldRef.current = 120; setGold(120);
    livesRef.current = 20; setLives(20);
    waveRef.current = 0; setWave(0);
    scoreRef.current = 0; setScore(0);
    comboRef.current = 0; setCombo(0);
    frozenRef.current = 0;
    slotIdxRef.current = 0;
    finishedRef.current = false;
    setEffects([]); setWaveActive(false); setWaveCountdown(5);
    setLog(["🏰 Build towers! First wave in 5s..."]);
    wordRef.current = "cannon"; setWord("cannon");
    typedRef.current = 0; setTypedLen(0);
    setPhase("playing");
  }, []);

  // Wave spawner
  useEffect(() => {
    if (phase !== "playing") return;
    let cdTimer;
    const startNextWave = () => {
      waveRef.current++;
      const wv = waveRef.current;
      setWave(wv);
      const count = 5 + wv * 3;
      const newEnemies = Array.from({ length: count }, (_, i) => makeEnemy(wv, i));
      setWaveActive(true);
      addLog(`🌊 Wave ${wv} — ${count} enemies incoming!`);
      play("levelUp");

      // Spawn enemies with delay
      newEnemies.forEach(e => {
        setTimeout(() => {
          e.spawned = true;
          enemiesRef.current = [...enemiesRef.current, e];
          setEnemies([...enemiesRef.current]);
        }, e.spawnDelay);
      });

      // Check wave end
      const totalDelay = count * 900 + 3000;
      setTimeout(() => {
        setWaveActive(false);
        if (livesRef.current > 0) {
          const bonus = wv * 50;
          goldRef.current += bonus; setGold(goldRef.current);
          addLog(`✅ Wave ${wv} clear! +${bonus} gold`);
          setWaveCountdown(8);
          cdTimer = setInterval(() => {
            setWaveCountdown(c => {
              if (c <= 1) { clearInterval(cdTimer); startNextWave(); return 8; }
              return c - 1;
            });
          }, 1000);
        }
      }, totalDelay);
    };

    // Start first wave after 5s
    setWaveCountdown(5);
    const initCd = setInterval(() => {
      setWaveCountdown(c => {
        if (c <= 1) { clearInterval(initCd); startNextWave(); return 8; }
        return c - 1;
      });
    }, 1000);
    return () => { clearInterval(initCd); clearInterval(cdTimer); };
  }, [phase, addLog, play]);

  // Game loop — enemies move, towers shoot
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      const now = Date.now();
      const isFrozen = frozenRef.current > now;

      // Move enemies
      const reachedEnd = [];
      const movedEnemies = enemiesRef.current.map(e => {
        if (!e.spawned) return e;
        let spd = isFrozen ? e.speed * 0.15 : e.speed;
        if (e.frozen > now) spd *= 0.2;
        let t = e.t + spd * 0.016;
        let pathIdx = e.pathIdx;
        if (t >= 1) { t = 0; pathIdx++; }
        if (pathIdx >= PATH.length - 1) { reachedEnd.push(e); return null; }
        const pos = getPathPos({ ...e, pathIdx, t });
        let hp = e.hp;
        if (e.burning > now) { hp -= e.burnDmg * 0.016; }
        return { ...e, pathIdx, t, x: pos.x, y: pos.y, hp: Math.max(0, hp) };
      }).filter(Boolean).filter(e => e.hp > 0);

      // Enemies reaching end
      if (reachedEnd.length > 0) {
        livesRef.current = Math.max(0, livesRef.current - reachedEnd.length);
        setLives(livesRef.current);
        if (livesRef.current <= 0) { setPhase("over"); return; }
      }

      // Tower shooting
      const newBullets = [...bulletsRef.current];
      towersRef.current.forEach(tw => {
        if (!tw.lastShot) tw.lastShot = 0;
        if (now - tw.lastShot < tw.rate) return;
        const def = TOWER_TYPES[tw.type];
        const inRange = movedEnemies.filter(e => e.spawned && Math.hypot(e.x - tw.x, e.y - tw.y) < tw.range);
        if (inRange.length === 0) return;
        const target = inRange[0];
        tw.lastShot = now;
        newBullets.push({
          id: ++_bid, fromTower: tw.id, targetId: target.id,
          x: tw.x, y: tw.y, tx: target.x, ty: target.y,
          dmg: tw.dmg, type: tw.type, progress: 0,
        });
      });

      // Move bullets
      const hitMap = {};
      const survivingBullets = newBullets.map(b => {
        const prog = Math.min(b.progress + 0.12, 1);
        if (prog >= 1) {
          hitMap[b.targetId] = (hitMap[b.targetId] || 0) + b.dmg;
          return null;
        }
        return { ...b, progress: prog,
          x: b.x + (b.tx - b.x) * 0.12,
          y: b.y + (b.ty - b.y) * 0.12,
        };
      }).filter(Boolean);

      // Apply bullet hits
      const afterHit = movedEnemies.map(e => {
        const dmg = hitMap[e.id] || 0;
        if (!dmg) return e;
        const newHp = e.hp - dmg;
        if (newHp <= 0) {
          goldRef.current += e.reward; setGold(goldRef.current);
          scoreRef.current += e.reward * 3 + comboRef.current * 2;
          setScore(Math.floor(scoreRef.current));
          return null;
        }
        return { ...e, hp: newHp };
      }).filter(Boolean);

      enemiesRef.current = afterHit; setEnemies([...afterHit]);
      bulletsRef.current = survivingBullets; setBullets([...survivingBullets]);
    }, 16);
    return () => clearInterval(id);
  }, [phase]);

  // Keyboard
  const execWord = useCallback((w) => {
    const towerDef = TOWER_TYPES[w];
    const abilityDef = ABILITIES[w];

    if (towerDef) {
      if (goldRef.current < towerDef.cost) { addLog(`💰 Need ${towerDef.cost} gold for ${w}!`); play("wrong"); return; }
      const slotIdx = nextAvailableSlot();
      if (slotIdx === null) { addLog("❌ No free slots!"); play("wrong"); return; }
      const slot = SLOTS[slotIdx];
      const tower = { id: ++_tid, type: w, ...towerDef, ...slot, slotIdx, level: 1, lastShot: 0 };
      goldRef.current -= towerDef.cost; setGold(goldRef.current);
      const newTowers = [...towersRef.current, tower];
      towersRef.current = newTowers; setTowers(newTowers);
      addLog(`${towerDef.emoji} ${w} tower placed! -${towerDef.cost} gold`);
      addEffect(`${towerDef.emoji} ${w}!`, towerDef.color, slot.x, slot.y);
      play("combo");
    } else if (abilityDef) {
      if (goldRef.current < abilityDef.cost) { addLog(`💰 Need ${abilityDef.cost} gold for ${w}!`); play("wrong"); return; }
      goldRef.current -= abilityDef.cost; setGold(goldRef.current);

      if (w === "airstrike") {
        const killed = enemiesRef.current.length;
        const reward = enemiesRef.current.reduce((s, e) => s + e.reward, 0);
        goldRef.current += reward; setGold(goldRef.current);
        scoreRef.current += killed * 25; setScore(Math.floor(scoreRef.current));
        enemiesRef.current = []; setEnemies([]);
        addLog(`💥 AIRSTRIKE! ${killed} enemies wiped!`);
        addEffect("💥 AIRSTRIKE!", "#ff4d6d", 50, 40);
        play("eat");
      } else if (w === "freeze") {
        frozenRef.current = Date.now() + 3000;
        addLog("🧊 All enemies frozen for 3 seconds!");
        addEffect("🧊 FREEZE!", "#88f0ff", 50, 40);
        play("combo");
      } else if (w === "nuke") {
        const dmgEach = 200;
        enemiesRef.current = enemiesRef.current.map(e => ({ ...e, hp: Math.max(0, e.hp - dmgEach) })).filter(e => e.hp > 0);
        setEnemies([...enemiesRef.current]);
        addLog("☢️ NUKE deployed! Massive damage!");
        addEffect("☢️ NUKE!", "#a78bfa", 50, 40);
        play("eat");
      }
    } else if (w === "upgrade") {
      if (towersRef.current.length === 0) { addLog("❌ No towers to upgrade!"); play("wrong"); return; }
      const cost = 50;
      if (goldRef.current < cost) { addLog(`💰 Need ${cost} gold to upgrade!`); play("wrong"); return; }
      const tower = towersRef.current[towersRef.current.length - 1];
      goldRef.current -= cost; setGold(goldRef.current);
      const upd = towersRef.current.map(t => t.id === tower.id
        ? { ...t, dmg: Math.floor(t.dmg * 1.4), range: t.range * 1.1, rate: Math.floor(t.rate * 0.85), level: t.level + 1 }
        : t
      );
      towersRef.current = upd; setTowers(upd);
      addLog(`⬆️ ${tower.type} tower upgraded to lv${tower.level + 1}!`);
      addEffect("⬆️ UPGRADE!", "#ffe566", tower.x, tower.y);
      play("combo");
    } else {
      addLog(`❓ Unknown command: ${w}`);
    }
  }, [nextAvailableSlot, addEffect, addLog, play]);

  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e) => {
      if (e.key.length !== 1) return;
      e.preventDefault();
      const w = wordRef.current;
      const idx = typedRef.current;
      if (e.key.toLowerCase() === w[idx]?.toLowerCase()) {
        const nl = idx + 1; typedRef.current = nl; setTypedLen(nl);
        play("bite");
        if (nl >= w.length) {
          comboRef.current++; setCombo(comboRef.current);
          execWord(w);
          setNextWord();
        }
      } else {
        setShake(true); setTimeout(() => setShake(false), 300);
        comboRef.current = 0; setCombo(0); play("wrong");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, execWord, setNextWord, play]);

  useEffect(() => {
    if (phase !== "over" || finishedRef.current) return;
    finishedRef.current = true;
    onFinish?.({ gameId:"word-tower-defense", score:Math.floor(scoreRef.current), maxCombo:comboRef.current, wordsCompleted:towersRef.current.length, mistakes:0, extra:{ wave:waveRef.current, towersPlaced:towersRef.current.length } });
  }, [phase, onFinish]);

  const bestScore = userData?.gameStats?.["word-tower-defense"]?.bestScore || 0;
  const currentWordDef = TOWER_TYPES[word] || ABILITIES[word];
  const wordColor = currentWordDef?.color || (word === "upgrade" ? "#ffe566" : "var(--skg-cyan)");
  const wordAction = currentWordDef ? `${currentWordDef.emoji} ${word.toUpperCase()}` : word === "upgrade" ? "⬆️ UPGRADE" : word.toUpperCase();

  if (phase === "lobby") return (
    <div className="skg-game skg-towerdef"><AnimatedBackground theme="volcano" dim={0.45}><Lobby onStart={startGame} onExit={onExit}/></AnimatedBackground></div>
  );

  return (
    <div className="skg-game skg-towerdef">
      <AnimatedBackground theme="volcano" dim={0.4}>
        {/* HUD */}
        <div className="skg-hud std-hud">
          <button className="skg-icon-btn" onClick={onExit}><X size={18}/></button>
          <div className="skg-hud-stat" style={{color:"var(--skg-lime)"}}><Trophy size={14}/> {Math.floor(score)}</div>
          <div className="skg-hud-stat skg-hud-combo">×{combo}</div>
          <div className="skg-hud-stat std-gold-hud">💰 {goldRef.current}</div>
          <div className="skg-hud-stat"><Shield size={13}/> {lives} lives</div>
          <div className="skg-hud-stat"><Zap size={13}/> Wave {wave}</div>
          {!waveActive && <div className="std-wave-cd">Next: {waveCountdown}s</div>}
        </div>

        {/* Map */}
        <div className="std-map">
          {/* Path */}
          <svg className="std-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points={PATH.map(p=>`${p.x},${p.y}`).join(" ")}
              fill="none" stroke="rgba(180,150,80,0.5)" strokeWidth="5" strokeLinejoin="round"/>
          </svg>

          {/* Slot indicators */}
          {SLOTS.map((sl, i) => {
            const placed = towers.find(t => t.slotIdx === i);
            return (
              <div key={i} className={`std-slot${placed?" std-slot-used":""}`}
                style={{ left:`${sl.x}%`, top:`${sl.y}%` }}
                title={placed ? `${placed.type} lv${placed.level}` : "Empty slot"}>
                {placed ? `${TOWER_TYPES[placed.type]?.emoji || "🗼"}${placed.level > 1 ? `★${placed.level}` : ""}` : ""}
              </div>
            );
          })}

          {/* Tower range rings on hover */}
          {towers.map(t => (
            <div key={`r${t.id}`} className="std-tower-range"
              style={{
                left:`${t.x}%`, top:`${t.y}%`,
                width:`${t.range * 2}%`, height:`${t.range * 2}%`,
                borderColor: (TOWER_TYPES[t.type]?.color || "#fff") + "33",
              }}/>
          ))}

          {/* Bullets */}
          {bullets.map(b => (
            <div key={b.id} className="std-bullet"
              style={{ left:`${b.x}%`, top:`${b.y}%`, background: TOWER_TYPES[b.type]?.color || "#fff" }}/>
          ))}

          {/* Enemies */}
          {enemies.filter(e=>e.spawned).map(e => (
            <div key={e.id} className="std-enemy" style={{ left:`${e.x}%`, top:`${e.y}%` }}>
              <div className="std-enemy-emoji">{e.emoji}</div>
              <div className="std-enemy-hp-bar">
                <div className="std-enemy-hp-fill"
                  style={{ width:`${(e.hp/e.maxHp)*100}%`,
                    background: e.hp/e.maxHp > 0.5 ? "#4ade80" : e.hp/e.maxHp > 0.25 ? "#fbbf24" : "#ff4d6d" }}/>
              </div>
            </div>
          ))}

          {/* Base at end */}
          <div className="std-base" style={{ left:`${PATH[PATH.length-1].x - 4}%`, top:`${PATH[PATH.length-1].y - 4}%` }}>
            🏰
          </div>

          {/* Effects */}
          {effects.map(e => (
            <div key={e.id} className="std-effect" style={{ left:`${e.x}%`, top:`${e.y}%`, color:e.color }}>{e.text}</div>
          ))}
        </div>

        {/* Bottom panel */}
        <div className="std-bottom-panel">
          <div className="std-log-strip">
            {log.slice(-3).map((l,i) => <span key={i} className="std-log-line">{l}</span>)}
          </div>
          <div className="std-type-col">
            <WordTarget word={word} typedLen={typedLen} shake={shake} action={wordAction} color={wordColor}/>
            <div className="std-hint-row">
              <span className="sktd-ch-done">■</span> typed &nbsp;
              <span className="sktd-ch-current">■</span> next &nbsp;
              <span className="sktd-ch-pending">■</span> pending
            </div>
          </div>
          <div className="std-tower-quick">
            {Object.values(TOWER_TYPES).slice(0,4).map(t=>(
              <div key={t.word} className={`std-quick-chip${goldRef.current>=t.cost?"":" std-quick-disabled"}`}
                style={{ borderColor: t.color }}>
                {t.emoji} <span style={{color:t.color}}>{t.word}</span>
                <span className="std-chip-cost">💰{t.cost}</span>
              </div>
            ))}
          </div>
        </div>

        {phase === "over" && (
          <div className="skg-overlay">
            <div className="skg-overlay-card">
              <div className="skg-overlay-title">{lives > 0 ? "Waves Complete!" : "Base Destroyed!"}</div>
              <div className="skg-overlay-score">{Math.floor(score)}</div>
              <div className="skg-overlay-sub">pts · {wave} waves survived</div>
              <div className="skm-stat-grid">
                <div className="skm-stat-cell"><span className="skm-stat-label">Waves</span><span className="skm-stat-val">{wave}</span></div>
                <div className="skm-stat-cell"><span className="skm-stat-label">Towers</span><span className="skm-stat-val">{towers.length}</span></div>
                <div className="skm-stat-cell"><span className="skm-stat-label">Lives left</span><span className="skm-stat-val skm-stat-acc">{lives}</span></div>
                <div className="skm-stat-cell"><span className="skm-stat-label">Best</span><span className="skm-stat-val">{Math.max(bestScore,Math.floor(score))}</span></div>
              </div>
              <div className="skg-overlay-actions">
                <button className="skg-btn skg-btn-primary" onClick={onRestart}><RotateCcw size={15}/> Defend Again</button>
                <button className="skg-btn skg-btn-ghost" onClick={onExit}>Back to Arcade</button>
              </div>
            </div>
          </div>
        )}
      </AnimatedBackground>
    </div>
  );
}