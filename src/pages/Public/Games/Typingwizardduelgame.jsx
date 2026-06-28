// ============================================================================
// TypingWizardDuelGame.jsx
// Genre: PvP / Boss Battle — type spells to attack, defend, and heal.
// Fast short words = quick spells. Long words = powerful spells.
// Correct streaks fill mana for special moves.
// ============================================================================
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { X, RotateCcw, Trophy, Zap, Shield, Heart, Flame,
         Users, Monitor, Info, ChevronRight } from "lucide-react";
import GameAvatar from "../../../components/Games/Gameavatar";
import useGameAudio from "../../../components/Games/Usegameaudio";
import { DIFFICULTIES } from "../../../components/Games/Gamefallback";

// ── Spell library ────────────────────────────────────────────────────────────
const SPELLS = [
  // fast / low damage
  { word: "fire",      emoji: "🔥", damage: 12, type: "attack",  color: "#ff7849", desc: "Fireball"    },
  { word: "ice",       emoji: "❄️", damage: 10, type: "attack",  color: "#88f0ff", desc: "Ice Shard"   },
  { word: "bolt",      emoji: "⚡", damage: 11, type: "attack",  color: "#fbbf24", desc: "Lightning"   },
  { word: "drain",     emoji: "💜", damage: 8,  type: "attack",  color: "#a78bfa", desc: "Life Drain"  },
  { word: "shield",    emoji: "🛡️", damage: 0,  type: "defend",  color: "#22e6c5", desc: "Shield"      },
  { word: "heal",      emoji: "💚", damage: -15,type: "heal",    color: "#86efac", desc: "Heal"        },
  { word: "block",     emoji: "🧊", damage: 0,  type: "defend",  color: "#4fd4ff", desc: "Block"       },
  // medium
  { word: "venom",     emoji: "☠️", damage: 18, type: "attack",  color: "#84cc16", desc: "Venom"       },
  { word: "shadow",    emoji: "🌑", damage: 16, type: "attack",  color: "#6d28d9", desc: "Shadow"      },
  { word: "plasma",    emoji: "🌀", damage: 20, type: "attack",  color: "#06b6d4", desc: "Plasma"      },
  { word: "barrier",   emoji: "🔮", damage: 0,  type: "defend",  color: "#c084fc", desc: "Barrier"     },
  { word: "restore",   emoji: "✨", damage: -22,type: "heal",    color: "#86efac", desc: "Restore"     },
  // powerful / long
  { word: "meteor",    emoji: "☄️", damage: 35, type: "attack",  color: "#f97316", desc: "Meteor"      },
  { word: "tornado",   emoji: "🌪️", damage: 30, type: "attack",  color: "#a3e635", desc: "Tornado"     },
  { word: "earthquake",emoji: "🌍", damage: 40, type: "attack",  color: "#b45309", desc: "Earthquake"  },
  { word: "blizzard",  emoji: "🌨️", damage: 32, type: "attack",  color: "#bae6fd", desc: "Blizzard"    },
  { word: "thunder",   emoji: "🌩️", damage: 28, type: "attack",  color: "#fde047", desc: "Thunder"     },
  { word: "regenerate",emoji: "💎", damage: -30,type: "heal",    color: "#4ade80", desc: "Regenerate"  },
];

const AI_PROFILES = [
  { name: "Apprentice", hp: 80,  attackWpm: 22, description: "A young student wizard. Casts slowly." },
  { name: "Sorcerer",   hp: 100, attackWpm: 35, description: "A seasoned sorcerer. Moderate threat." },
  { name: "Archmage",   hp: 120, attackWpm: 50, description: "The Archmage. Powerful and relentless." },
];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function pickSpellQueue(difficulty, count = 5) {
  const diff = DIFFICULTIES.find((d) => d.id === difficulty) || DIFFICULTIES[1];
  const filtered = SPELLS.filter((s) => s.word.length <= diff.maxWordLen);
  const pool = filtered.length >= count ? filtered : SPELLS;
  const out = [];
  for (let i = 0; i < count; i++) out.push(pool[Math.floor(Math.random() * pool.length)]);
  return out;
}

// ── Tooltip ──────────────────────────────────────────────────────────────────
function Tip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="skr-tip-wrap" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Info size={13} className="skr-tip-icon" />
      {show && <span className="skr-tooltip">{text}</span>}
    </span>
  );
}

// ── HP bar ───────────────────────────────────────────────────────────────────
function HpBar({ hp, maxHp, color, label, shieldActive }) {
  const pct = Math.max(0, Math.min((hp / maxHp) * 100, 100));
  return (
    <div className="skwz-hp-wrap">
      <div className="skwz-hp-label">
        {label}
        {shieldActive && <span className="skwz-shield-badge">🛡️ Shield</span>}
      </div>
      <div className="skwz-hp-track">
        <div className="skwz-hp-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="skwz-hp-num" style={{ color }}>{Math.max(0, Math.round(hp))} HP</div>
    </div>
  );
}

// ── Spell word with per-char highlight ───────────────────────────────────────
function SpellWord({ spell, typedLen, shake }) {
  if (!spell) return null;
  return (
    <div className={`skwz-spell-word${shake ? " sktd-shake" : ""}`}>
      <span className="skwz-spell-emoji">{spell.emoji}</span>
      <div className="skwz-spell-chars">
        {spell.word.split("").map((ch, i) => (
          <span key={i} className={
            i < typedLen       ? "sktd-ch-done"
            : i === typedLen   ? "sktd-ch-current"
            : "sktd-ch-pending"
          }>{ch}</span>
        ))}
      </div>
      <span className="skwz-spell-name">{spell.desc}</span>
    </div>
  );
}

// ── Lobby ────────────────────────────────────────────────────────────────────
function Lobby({ onStart, onExit }) {
  const [aiIdx, setAiIdx] = useState(0);
  return (
    <div className="skr-lobby">
      <div className="skr-lobby-card skwz-lobby-card">
        <div className="skr-lobby-title">🧙 Wizard Duel</div>
        <p className="skr-lobby-sub">Type spells to cast them. Fast words = quick shots. Long words = devastation.</p>
        <div className="skr-lobby-section">
          <div className="skr-lobby-label">Mode <Tip text="PvP multiplayer duels coming soon!" /></div>
          <div className="skr-mode-pills">
            <button className="skr-mode-pill skr-mode-active"><Monitor size={14}/> vs AI</button>
            <button className="skr-mode-pill skr-mode-soon" disabled>
              <Users size={14}/> PvP <span className="skr-soon-badge">Soon</span>
            </button>
          </div>
        </div>
        <div className="skr-lobby-section">
          <div className="skr-lobby-label">AI Opponent <Tip text="Choose your rival wizard's difficulty." /></div>
          <div className="skr-ai-count-row">
            {AI_PROFILES.map((ai, i) => (
              <button key={ai.name}
                className={`skr-count-btn${aiIdx === i ? " skr-count-active" : ""}`}
                onClick={() => setAiIdx(i)}
              >{ai.name}</button>
            ))}
          </div>
          {AI_PROFILES[aiIdx] && (
            <div className="skwz-ai-desc">{AI_PROFILES[aiIdx].description}</div>
          )}
        </div>
        <div className="skwz-spell-preview">
          <div className="skr-lobby-label">Spell Types</div>
          <div className="skwz-spell-chips">
            {[{emoji:"🔥",label:"Attack"},{emoji:"🛡️",label:"Defend"},{emoji:"💚",label:"Heal"},{emoji:"☄️",label:"Epic"}].map((s) => (
              <div key={s.label} className="skwz-spell-chip">{s.emoji} {s.label}</div>
            ))}
          </div>
        </div>
        <div className="skr-lobby-actions">
          <button className="skg-btn skg-btn-primary" onClick={() => onStart(aiIdx)}>
            Begin Duel <ChevronRight size={16}/>
          </button>
          <button className="skg-btn skg-btn-ghost" onClick={onExit}>Back to Arcade</button>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
const PLAYER_MAX_HP = 100;
const MANA_PER_CORRECT = 12;
const MANA_MAX = 100;

export default function TypingWizardDuelGame({
  avatar, difficulty, sessionSeconds, settings, onExit, onRestart, onFinish,
}) {
  const { play } = useGameAudio({
    packId:  settings?.soundPackId  ?? "epic",
    volume:  settings?.masterVolume ?? 0.7,
    enabled: settings?.soundOn      ?? true,
  });

  const [phase,       setPhase]       = useState("lobby");
  const [aiProfileIdx,setAiProfileIdx]= useState(0);
  const [playerHp,    setPlayerHp]    = useState(PLAYER_MAX_HP);
  const [aiHp,        setAiHp]        = useState(100);
  const [mana,        setMana]        = useState(0);
  const [playerShield,setPlayerShield]= useState(false);
  const [aiShield,    setAiShield]    = useState(false);
  const [queue,       setQueue]       = useState([]);
  const [typedLen,    setTypedLen]    = useState(0);
  const [shake,       setShake]       = useState(false);
  const [score,       setScore]       = useState(0);
  const [combo,       setCombo]       = useState(0);
  const [avatarState, setAvatarState] = useState("idle");
  const [pulseKey,    setPulseKey]    = useState(0);
  const [battleLog,   setBattleLog]   = useState([]);
  const [effects,     setEffects]     = useState([]); // floating damage numbers
  const [timeLeft,    setTimeLeft]    = useState(sessionSeconds);
  const [aiCasting,   setAiCasting]   = useState(null);

  const hurtRef     = useRef(null);
  const finishedRef = useRef(false);
  const typedRef    = useRef(0);
  const shieldRef   = useRef(false);
  const aiShieldRef = useRef(false);
  const effectIdRef = useRef(0);

  const aiProfile = AI_PROFILES[aiProfileIdx] || AI_PROFILES[0];

  const addLog = useCallback((msg) => setBattleLog((l) => [...l.slice(-6), msg]), []);

  const addEffect = useCallback((text, color, side) => {
    const id = effectIdRef.current++;
    setEffects((prev) => [...prev, { id, text, color, side }]);
    setTimeout(() => setEffects((prev) => prev.filter((e) => e.id !== id)), 900);
  }, []);

  const flash = useCallback((s) => {
    setAvatarState(s);
    setPulseKey((k) => k + 1);
    clearTimeout(hurtRef.current);
    if (s !== "idle") hurtRef.current = setTimeout(() => setAvatarState("idle"), 280);
  }, []);

  const startGame = useCallback((aiIdx) => {
    setAiProfileIdx(aiIdx);
    const ai = AI_PROFILES[aiIdx];
    setPlayerHp(PLAYER_MAX_HP);
    setAiHp(ai.hp);
    setMana(0);
    setPlayerShield(false);
    setAiShield(false);
    shieldRef.current = false;
    aiShieldRef.current = false;
    setScore(0);
    setCombo(0);
    setTypedLen(0);
    typedRef.current = 0;
    setBattleLog(["⚔️ The duel begins!"]);
    setEffects([]);
    finishedRef.current = false;
    setQueue(pickSpellQueue(difficulty, 6));
    setPhase("playing");
  }, [difficulty]);

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

  // AI attack loop
  useEffect(() => {
    if (phase !== "playing") return;
    const ai = AI_PROFILES[aiProfileIdx] || AI_PROFILES[0];
    // AI attacks every (60/wpm * 5) seconds (avg word time at their wpm)
    const attackMs = Math.max(1800, (60 / ai.attackWpm) * 5 * 1000);
    const id = setInterval(() => {
      const spell = rnd(SPELLS.filter((s) => s.word.length <= 7));
      setAiCasting(spell);
      setTimeout(() => {
        setAiCasting(null);
        if (spell.type === "attack") {
          const dmg = shieldRef.current ? Math.floor(spell.damage * 0.25) : spell.damage;
          if (shieldRef.current) {
            setPlayerShield(false); shieldRef.current = false;
            addLog(`🛡️ Your shield absorbed most of ${spell.desc}! (${dmg} dmg)`);
          } else {
            addLog(`💥 AI cast ${spell.desc}! You took ${dmg} damage.`);
          }
          addEffect(`-${dmg}`, "#ff4d6d", "player");
          setPlayerHp((h) => {
            const nh = Math.max(0, h - dmg);
            if (nh <= 0) setPhase("over");
            return nh;
          });
          play("wrong");
        } else if (spell.type === "heal") {
          const heal = Math.abs(spell.damage);
          setAiHp((h) => Math.min(ai.hp, h + heal));
          addLog(`💚 AI cast ${spell.desc} and recovered ${heal} HP.`);
          addEffect(`+${heal}`, "#86efac", "ai");
        } else {
          aiShieldRef.current = true;
          setAiShield(true);
          setTimeout(() => { aiShieldRef.current = false; setAiShield(false); }, 3500);
          addLog(`🛡️ AI raised a ${spell.desc}!`);
        }
      }, 600);
    }, attackMs);
    return () => clearInterval(id);
  }, [phase, aiProfileIdx, addLog, addEffect, play]);

  // Keyboard
  const currentSpell = queue[0];
  const target = currentSpell?.word ?? "";

  useEffect(() => {
    if (phase !== "playing" || !currentSpell) return;
    const onKey = (e) => {
      if (e.key.length !== 1 && e.key !== " ") return;
      const idx = typedRef.current;
      if (e.key.toLowerCase() === target[idx]?.toLowerCase()) {
        const newLen = idx + 1;
        typedRef.current = newLen;
        setTypedLen(newLen);
        setMana((m) => Math.min(MANA_MAX, m + MANA_PER_CORRECT));
        flash("bite");
        play("bite");

        if (newLen >= target.length) {
          // Spell cast!
          const sp = currentSpell;
          const newCombo = combo + 1;
          setCombo(newCombo);
          const pts = sp.word.length * 15 + newCombo * 8;
          setScore((s) => s + pts);

          if (sp.type === "attack") {
            const dmg = aiShieldRef.current
              ? Math.floor(sp.damage * 0.2)
              : Math.floor(sp.damage * (1 + newCombo * 0.05));
            if (aiShieldRef.current) {
              setAiShield(false); aiShieldRef.current = false;
              addLog(`🛡️ AI shield blocked most of ${sp.desc}! (${dmg} dmg)`);
            } else {
              addLog(`${sp.emoji} You cast ${sp.desc}! AI took ${dmg} damage!`);
            }
            addEffect(`-${dmg}`, sp.color, "ai");
            setAiHp((h) => {
              const nh = Math.max(0, h - dmg);
              if (nh <= 0) setPhase("over");
              return nh;
            });
            flash("eat");
            play("eat");
          } else if (sp.type === "heal") {
            const heal = Math.abs(sp.damage);
            setPlayerHp((h) => Math.min(PLAYER_MAX_HP, h + heal));
            addLog(`${sp.emoji} You cast ${sp.desc} and recovered ${heal} HP!`);
            addEffect(`+${heal}`, "#86efac", "player");
            flash("victory");
            play("combo");
          } else {
            shieldRef.current = true;
            setPlayerShield(true);
            setTimeout(() => { shieldRef.current = false; setPlayerShield(false); }, 4000);
            addLog(`${sp.emoji} You raised a ${sp.desc}!`);
            flash("eat");
            play("combo");
          }

          typedRef.current = 0;
          setTypedLen(0);
          setQueue((prev) => {
            const rest = prev.slice(1);
            if (rest.length <= 2) return [...rest, ...pickSpellQueue(difficulty, 4)];
            return rest;
          });
        }
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 300);
        setCombo(0);
        setMana((m) => Math.max(0, m - 8));
        flash("hurt");
        play("wrong");
        addLog("❌ Spell fizzled! Wrong letter.");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, currentSpell, target, combo, difficulty, flash, play, addLog, addEffect]);

  // Emit result
  useEffect(() => {
    if (phase !== "over" || finishedRef.current) return;
    finishedRef.current = true;
    onFinish?.({
      gameId: "typing-wizard",
      score,
      maxCombo: combo,
      wordsCompleted: Math.floor(score / 20),
      mistakes: 0,
    });
  }, [phase]);

  if (phase === "lobby") return <div className="skg-game skg-wizard"><Lobby onStart={startGame} onExit={onExit}/></div>;

  const playerWon = aiHp <= 0;
  const aiWon     = playerHp <= 0;
  const timerColor = timeLeft <= 10 ? "var(--skg-coral)" : timeLeft <= 20 ? "var(--skg-amber)" : undefined;

  return (
    <div className="skg-game skg-wizard">
      {/* HUD */}
      <div className="skg-hud">
        <button className="skg-icon-btn" onClick={onExit}><X size={18}/></button>
        <div className="skg-hud-stat" style={{ color: "var(--skg-lime)" }}><Trophy size={14}/> {score}</div>
        <div className="skg-hud-stat skg-hud-combo"><Zap size={13}/> ×{combo}</div>
        <div className="skg-hud-stat skwz-mana-hud">
          <span className="skwz-mana-icon">💧</span>
          <div className="skwz-mana-bar"><div className="skwz-mana-fill" style={{ width: `${mana}%` }}/></div>
          <span>{Math.round(mana)}%</span>
        </div>
        <div className="skg-hud-timer" style={{ color: timerColor }}>{timeLeft}s</div>
      </div>

      {/* Arena */}
      <div className="skwz-arena">
        {/* HP bars */}
        <div className="skwz-hp-row">
          <HpBar hp={playerHp} maxHp={PLAYER_MAX_HP} color="#22e6c5" label="You" shieldActive={playerShield}/>
          <div className="skwz-vs">⚔️</div>
          <HpBar hp={aiHp} maxHp={aiProfile.hp} color="#ff4d6d" label={aiProfile.name} shieldActive={aiShield}/>
        </div>

        {/* Duel field */}
        <div className="skwz-field">
          {/* Player side */}
          <div className="skwz-side skwz-player-side">
            <GameAvatar avatar={avatar} state={avatarState} pulseKey={pulseKey}
              comboLevel={Math.min(Math.floor(combo / 3), 3)} size={88}
              reduceMotion={settings?.reduceMotion}/>
            {effects.filter((e) => e.side === "player").map((e) => (
              <div key={e.id} className="skwz-effect" style={{ color: e.color }}>{e.text}</div>
            ))}
          </div>

          {/* Battle log center */}
          <div className="skwz-battle-log">
            {battleLog.slice(-4).map((l, i) => (
              <div key={i} className="skwz-log-line">{l}</div>
            ))}
            {aiCasting && (
              <div className="skwz-ai-casting">
                {aiCasting.emoji} AI casting {aiCasting.desc}…
              </div>
            )}
          </div>

          {/* AI side */}
          <div className="skwz-side skwz-ai-side">
            <div className="skwz-ai-avatar">
              🧙‍♂️
              <div className="skwz-ai-name">{aiProfile.name}</div>
            </div>
            {effects.filter((e) => e.side === "ai").map((e) => (
              <div key={e.id} className="skwz-effect" style={{ color: e.color }}>{e.text}</div>
            ))}
          </div>
        </div>

        {/* Spell queue */}
        <div className="skwz-spell-queue">
          <div className="skwz-queue-label">
            Spell Queue
            <Tip text="Type the highlighted word to cast the spell. Fast typing = more spells per second!" />
          </div>
          <div className="skwz-queue-items">
            {queue.slice(0, 5).map((sp, i) => (
              <div key={`${sp.word}-${i}`}
                className={`skwz-queue-spell${i === 0 ? " skwz-queue-active" : ""}`}
                style={{ borderColor: i === 0 ? sp.color : undefined }}
              >
                <span className="skwz-q-emoji">{sp.emoji}</span>
                {i === 0 ? (
                  <div className="skwz-q-chars">
                    {sp.word.split("").map((ch, ci) => (
                      <span key={ci} className={
                        ci < typedLen     ? "sktd-ch-done"
                        : ci === typedLen ? "sktd-ch-current"
                        : "sktd-ch-pending"
                      }>{ch}</span>
                    ))}
                  </div>
                ) : (
                  <span className="skwz-q-word">{sp.word}</span>
                )}
                <span className="skwz-q-type" style={{ color: sp.color }}>
                  {sp.type === "attack" ? `⚔️ ${sp.damage}` : sp.type === "heal" ? `💚 ${Math.abs(sp.damage)}` : "🛡️"}
                </span>
              </div>
            ))}
          </div>
          {queue[0] && (
            <div className="skwz-active-spell-hint" style={{ borderColor: queue[0].color }}>
              {queue[0].emoji} Cast <strong>{queue[0].desc}</strong> — type:&nbsp;
              {queue[0].word.split("").map((ch, i) => (
                <span key={i} className={
                  i < typedLen ? "sktd-ch-done" : i === typedLen ? "sktd-ch-current" : "sktd-ch-pending"
                }>{ch}</span>
              ))}
              {shake && <span className="skwz-wrong-flash"> ✗</span>}
            </div>
          )}
        </div>
      </div>

      {/* Result */}
      {phase === "over" && (
        <div className="skg-overlay">
          <div className="skg-overlay-card skwz-result-card">
            <div className="skwz-result-icon">{playerWon ? "🏆" : "💀"}</div>
            <div className="skg-overlay-title">{playerWon ? "Victory!" : aiWon ? "Defeated!" : "Time's Up!"}</div>
            <div className="skg-overlay-score">{score}</div>
            <div className="skg-overlay-sub">pts · vs {aiProfile.name}</div>
            <div className="skm-stat-grid">
              <div className="skm-stat-cell"><span className="skm-stat-label">Your HP left</span><span className="skm-stat-val skm-stat-acc">{Math.max(0, Math.round(playerHp))}</span></div>
              <div className="skm-stat-cell"><span className="skm-stat-label">Enemy HP left</span><span className="skm-stat-val skm-stat-mistakes">{Math.max(0, Math.round(aiHp))}</span></div>
              <div className="skm-stat-cell"><span className="skm-stat-label">Best combo</span><span className="skm-stat-val">×{combo}</span></div>
              <div className="skm-stat-cell"><span className="skm-stat-label">Mana peak</span><span className="skm-stat-val">{Math.round(mana)}%</span></div>
            </div>
            <div className="skg-overlay-actions">
              <button className="skg-btn skg-btn-primary" onClick={onRestart}><RotateCcw size={15}/> Duel Again</button>
              <button className="skg-btn skg-btn-ghost" onClick={onExit}>Back to Arcade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}