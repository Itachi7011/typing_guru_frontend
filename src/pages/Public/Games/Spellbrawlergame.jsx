// ============================================================================
// SpellBrawlerGame.jsx  —  STREET FIGHTER TYPING
// Type move names to execute: punch, kick, combo, special, block, dodge.
// Real CSS fighting animations: slide forward, punch extend, recoil, knockback.
// HP bars, rounds, KO screen, choose AI difficulty.
// ============================================================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, RotateCcw, Trophy, Zap, Shield, Users, Monitor, Info, ChevronRight } from "lucide-react";
import GameAvatar from "../../../components/Games/Gameavatar";
import useGameAudio from "../../../components/Games/Usegameaudio";
import AnimatedBackground from "../../../components/Games/Animatedbackground";

// ── Move library ──────────────────────────────────────────────────────────────
const MOVES = [
  { word:"punch",   type:"attack",  dmg:12, emoji:"👊", color:"#ff4d6d", desc:"Quick punch",     time:400 },
  { word:"kick",    type:"attack",  dmg:15, emoji:"🦵", color:"#fbbf24", desc:"Strong kick",     time:500 },
  { word:"block",   type:"defense", dmg:0,  emoji:"🛡️", color:"#22e6c5", desc:"Block next hit",  time:800 },
  { word:"dodge",   type:"defense", dmg:0,  emoji:"💨", color:"#a78bfa", desc:"Evade attack",    time:600 },
  { word:"sweep",   type:"attack",  dmg:18, emoji:"🌀", color:"#fb923c", desc:"Leg sweep",       time:550 },
  { word:"uppercut",type:"attack",  dmg:24, emoji:"⬆️", color:"#f43f5e", desc:"Uppercut!",       time:700 },
  { word:"combo",   type:"combo",   dmg:30, emoji:"💥", color:"#e879f9", desc:"Combo hit!",      time:900 },
  { word:"special", type:"special", dmg:45, emoji:"⚡", color:"#facc15", desc:"SPECIAL MOVE",    time:1200 },
  { word:"counter", type:"counter", dmg:22, emoji:"🔄", color:"#4ade80", desc:"Counter attack",  time:600 },
  { word:"slam",    type:"attack",  dmg:20, emoji:"💢", color:"#f97316", desc:"Ground slam",     time:650 },
];

const AI_PROFILES = [
  { name:"Novice",   color:"#86efac", hp:80,  atkMs:2200, missChance:0.45, moves:["punch","kick","block"] },
  { name:"Fighter",  color:"#fbbf24", hp:100, atkMs:1600, missChance:0.3,  moves:["punch","kick","sweep","block","dodge"] },
  { name:"Champion", color:"#f43f5e", hp:120, atkMs:1100, missChance:0.15, moves:MOVES.map(m=>m.word) },
];

const ROUNDS = 3;
const PLAYER_MAX_HP = 100;

function Tip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="skr-tip-wrap" onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      <Info size={13} className="skr-tip-icon"/>
      {show && <span className="skr-tooltip">{text}</span>}
    </span>
  );
}

function HpBar({ hp, max, color, label, side }) {
  const pct = Math.max(0, Math.min((hp/max)*100, 100));
  const lowPulse = pct < 25;
  return (
    <div className={`sbr-hp-wrap sbr-hp-${side}`}>
      <div className="sbr-hp-name" style={{ color }}>{label}</div>
      <div className="sbr-hp-track">
        <div className="sbr-hp-fill" style={{
          width: `${pct}%`, background: color,
          animation: lowPulse ? "skg-pressure-warn 0.5s ease-in-out infinite" : "none",
        }}/>
      </div>
      <div className="sbr-hp-num" style={{ color }}>{Math.max(0,Math.round(hp))}</div>
    </div>
  );
}

function MoveWord({ move, typedLen, shake }) {
  if (!move) return null;
  return (
    <div className={`sbr-move-word${shake?" sktd-shake":""}`} style={{ borderColor: move.color }}>
      <span className="sbr-move-emoji">{move.emoji}</span>
      <div className="sbr-move-chars">
        {move.word.split("").map((ch, i) => (
          <span key={i} className={
            i < typedLen ? "sktd-ch-done"
            : i === typedLen ? "sktd-ch-current"
            : "sktd-ch-pending"
          }>{ch}</span>
        ))}
      </div>
      <span className="sbr-move-name" style={{ color: move.color }}>{move.desc}</span>
    </div>
  );
}

function Lobby({ onStart, onExit }) {
  const [aiIdx, setAiIdx] = useState(1);
  return (
    <div className="skr-lobby">
      <div className="skr-lobby-card sbr-lobby-card">
        <div className="skr-lobby-title">🥊 Spell Brawler</div>
        <p className="skr-lobby-sub">Type move names to fight! Punch, kick, block, and land specials to win rounds.</p>
        <div className="skr-lobby-section">
          <div className="skr-lobby-label">Mode <Tip text="PvP typing brawl coming soon!"/></div>
          <div className="skr-mode-pills">
            <button className="skr-mode-pill skr-mode-active"><Monitor size={14}/> vs AI</button>
            <button className="skr-mode-pill skr-mode-soon" disabled>
              <Users size={14}/> PvP <span className="skr-soon-badge">Soon</span>
            </button>
          </div>
        </div>
        <div className="skr-lobby-section">
          <div className="skr-lobby-label">Opponent <Tip text="Choose AI difficulty — affects their HP, attack speed, and move pool."/></div>
          <div className="skr-ai-count-row">
            {AI_PROFILES.map((ai, i) => (
              <button key={ai.name}
                className={`skr-count-btn${aiIdx===i?" skr-count-active":""}`}
                onClick={()=>setAiIdx(i)}
                style={aiIdx===i ? { borderColor: ai.color, color: ai.color } : {}}
              >{ai.name}</button>
            ))}
          </div>
        </div>
        <div className="sbr-move-preview">
          <div className="skr-lobby-label">Moves <Tip text="Type the exact word to execute the move. Combos and specials do massive damage!"/></div>
          <div className="sbr-preview-chips">
            {MOVES.slice(0, 6).map(m => (
              <div key={m.word} className="sbr-preview-chip" style={{ borderColor: m.color, color: m.color }}>
                {m.emoji} <code>{m.word}</code>
              </div>
            ))}
          </div>
        </div>
        <div className="skr-lobby-actions">
          <button className="skg-btn skg-btn-primary" onClick={() => onStart(aiIdx)}>
            Fight! <ChevronRight size={16}/>
          </button>
          <button className="skg-btn skg-btn-ghost" onClick={onExit}>Back to Arcade</button>
        </div>
      </div>
    </div>
  );
}

// ── Fighting animation state machine ─────────────────────────────────────────
// playerAnim: idle | walk-fwd | punch | kick | special | block | hurt | ko | victory
// aiAnim:     idle | walk-fwd | punch | kick | special | block | hurt | ko | taunt

let _moveQueue = [...MOVES];
function nextMove() {
  if (_moveQueue.length === 0) _moveQueue = [...MOVES];
  const idx = Math.floor(Math.random() * _moveQueue.length);
  const m = _moveQueue[idx];
  _moveQueue.splice(idx, 1);
  return m;
}

export default function SpellBrawlerGame({
  avatar, difficulty, sessionSeconds, settings, userData, onExit, onRestart, onFinish,
}) {
  const { play } = useGameAudio({ packId: settings?.soundPackId ?? "epic", volume: settings?.masterVolume ?? 0.7, enabled: settings?.soundOn ?? true });

  const [phase, setPhase] = useState("lobby");
  const [bgTheme, setBgTheme] = useState("city");
  const [aiProfileIdx, setAiProfileIdx] = useState(1);

  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [aiHp,     setAiHp]     = useState(100);
  const [round,    setRound]     = useState(1);
  const [playerWins, setPlayerWins] = useState(0);
  const [aiWins,     setAiWins]     = useState(0);

  const [currentMove, setCurrentMove] = useState(null);
  const [typedLen,    setTypedLen]     = useState(0);
  const [shake,       setShake]        = useState(false);
  const [score,       setScore]        = useState(0);
  const [combo,       setCombo]        = useState(0);

  // Animation states
  const [playerAnim, setPlayerAnim] = useState("idle");
  const [aiAnim,     setAiAnim]     = useState("idle");
  const [playerX,    setPlayerX]    = useState(22); // % from left
  const [aiX,        setAiX]        = useState(72);
  const [blockActive,  setBlockActive]  = useState(false);
  const [aiBlocking,   setAiBlocking]   = useState(false);
  const [battleLog,    setBattleLog]    = useState([]);
  const [roundBanner,  setRoundBanner]  = useState(null);
  const [effects,      setEffects]      = useState([]);

  const playerHpRef  = useRef(PLAYER_MAX_HP);
  const aiHpRef      = useRef(100);
  const typedRef     = useRef(0);
  const moveRef      = useRef(null);
  const blockRef     = useRef(false);
  const aiBlockRef   = useRef(false);
  const comboRef     = useRef(0);
  const scoreRef     = useRef(0);
  const finishedRef  = useRef(false);
  const fxIdRef      = useRef(0);
  const roundRef     = useRef(1);
  const playerWinsRef = useRef(0);
  const aiWinsRef     = useRef(0);

  const ai = AI_PROFILES[aiProfileIdx] || AI_PROFILES[1];

  const addLog = useCallback((msg) => setBattleLog(l => [...l.slice(-5), msg]), []);
  const addEffect = useCallback((text, color, x, y) => {
    const id = fxIdRef.current++;
    setEffects(p => [...p, { id, text, color, x, y }]);
    setTimeout(() => setEffects(p => p.filter(e => e.id !== id)), 1100);
  }, []);

  const animPlayer = useCallback((anim, ms = 500) => {
    setPlayerAnim(anim);
    setTimeout(() => setPlayerAnim("idle"), ms);
  }, []);

  const animAI = useCallback((anim, ms = 500) => {
    setAiAnim(anim);
    setTimeout(() => setAiAnim("idle"), ms);
  }, []);

  const checkRoundEnd = useCallback((pHp, aHp) => {
    if (aHp <= 0) {
      playerWinsRef.current++;
      setPlayerWins(playerWinsRef.current);
      animPlayer("victory");
      animAI("ko");
      addLog("💥 ROUND WIN!");
      play("levelUp");
    } else if (pHp <= 0) {
      aiWinsRef.current++;
      setAiWins(aiWinsRef.current);
      animAI("victory");
      animPlayer("ko");
      addLog("💀 ROUND LOSS!");
      play("wrong");
    } else return false;

    const pw = playerWinsRef.current, aw = aiWinsRef.current;
    setTimeout(() => {
      if (pw >= 2 || aw >= 2 || roundRef.current >= ROUNDS) {
        setPhase("over");
      } else {
        // Next round
        roundRef.current++;
        setRound(roundRef.current);
        setRoundBanner(`Round ${roundRef.current}`);
        setTimeout(() => setRoundBanner(null), 1500);
        playerHpRef.current = PLAYER_MAX_HP; setPlayerHp(PLAYER_MAX_HP);
        aiHpRef.current = ai.hp; setAiHp(ai.hp);
        blockRef.current = false; setBlockActive(false);
        aiBlockRef.current = false; setAiBlocking(false);
      }
    }, 1600);
    return true;
  }, [ai.hp, animAI, animPlayer, addLog, play]);

  const startGame = useCallback((aiIdx) => {
    setAiProfileIdx(aiIdx);
    const aiP = AI_PROFILES[aiIdx];
    playerHpRef.current = PLAYER_MAX_HP; setPlayerHp(PLAYER_MAX_HP);
    aiHpRef.current = aiP.hp; setAiHp(aiP.hp);
    setRound(1); roundRef.current = 1;
    setPlayerWins(0); playerWinsRef.current = 0;
    setAiWins(0); aiWinsRef.current = 0;
    setScore(0); scoreRef.current = 0;
    setCombo(0); comboRef.current = 0;
    typedRef.current = 0; setTypedLen(0);
    blockRef.current = false; setBlockActive(false);
    aiBlockRef.current = false; setAiBlocking(false);
    setBattleLog(["🥊 FIGHT!"]);
    setEffects([]);
    finishedRef.current = false;
    const m = nextMove();
    moveRef.current = m; setCurrentMove(m);
    setRoundBanner("Round 1 – FIGHT!");
    setTimeout(() => setRoundBanner(null), 1500);
    setPhase("playing");
  }, []);

  // AI attack loop
  useEffect(() => {
    if (phase !== "playing") return;
    const aiP = AI_PROFILES[aiProfileIdx] || AI_PROFILES[1];
    const id = setInterval(() => {
      if (aiHpRef.current <= 0 || playerHpRef.current <= 0) return;
      const miss = Math.random() < aiP.missChance;
      if (miss) { animAI("dodge"); addLog("👾 AI missed!"); return; }

      const aiMove = MOVES.find(m => aiP.moves.includes(m.word)) || MOVES[0];
      const rndIdx = Math.floor(Math.random() * aiP.moves.length);
      const chosenWord = aiP.moves[rndIdx];
      const chosenMove = MOVES.find(m => m.word === chosenWord) || MOVES[0];

      if (chosenMove.type === "defense") {
        aiBlockRef.current = true; setAiBlocking(true);
        animAI("block", 800);
        setTimeout(() => { aiBlockRef.current = false; setAiBlocking(false); }, 800);
        addLog(`🛡️ AI used ${chosenMove.desc}!`);
        return;
      }

      animAI("punch", chosenMove.time);
      setTimeout(() => {
        let dmg = chosenMove.dmg;
        if (blockRef.current) { dmg = Math.floor(dmg * 0.2); addLog("🛡️ You blocked!"); blockRef.current = false; setBlockActive(false); }
        playerHpRef.current = Math.max(0, playerHpRef.current - dmg);
        setPlayerHp(playerHpRef.current);
        animPlayer("hurt");
        addLog(`${chosenMove.emoji} AI used ${chosenMove.desc}! -${dmg} HP`);
        addEffect(`-${dmg}`, "#ff4d6d", 25, 50);
        play("wrong");
        checkRoundEnd(playerHpRef.current, aiHpRef.current);
      }, chosenMove.time * 0.6);
    }, aiP.atkMs);
    return () => clearInterval(id);
  }, [phase, aiProfileIdx, animAI, animPlayer, addLog, addEffect, play, checkRoundEnd]);

  // Keyboard
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e) => {
      if (e.key.length !== 1) return;
      e.preventDefault();
      const m = moveRef.current;
      if (!m) return;
      const idx = typedRef.current;
      if (e.key.toLowerCase() === m.word[idx]?.toLowerCase()) {
        const nl = idx + 1; typedRef.current = nl; setTypedLen(nl);
        play("bite");
        if (nl >= m.word.length) {
          // Execute move
          comboRef.current++; setCombo(comboRef.current);
          const comboPts = m.type === "special" ? 200 : m.type === "combo" ? 120 : 40 + comboRef.current * 8;
          scoreRef.current += comboPts; setScore(Math.floor(scoreRef.current));

          if (m.type === "defense") {
            blockRef.current = true; setBlockActive(true);
            setTimeout(() => { blockRef.current = false; setBlockActive(false); }, m.time);
            animPlayer("block", m.time);
            addLog(`🛡️ You used ${m.desc}!`);
            play("combo");
          } else {
            // Slide forward + attack
            setPlayerX(34);
            setTimeout(() => setPlayerX(22), m.time * 0.4);
            animPlayer(m.type === "special" ? "victory" : "eat", m.time);

            setTimeout(() => {
              let dmg = m.dmg + Math.floor(comboRef.current * 1.5);
              if (aiBlockRef.current) { dmg = Math.floor(dmg * 0.15); addLog("💢 AI blocked!"); }
              else {
                // Knock AI back briefly
                setAiX(78); setTimeout(() => setAiX(72), 300);
                animAI("hurt", 400);
              }
              aiHpRef.current = Math.max(0, aiHpRef.current - dmg);
              setAiHp(aiHpRef.current);
              addLog(`${m.emoji} ${m.desc}! -${dmg} HP`);
              addEffect(`${m.emoji} -${dmg}`, m.color, 68, 50);
              play("eat");
              checkRoundEnd(playerHpRef.current, aiHpRef.current);
            }, m.time * 0.5);
          }

          const nm = nextMove(); moveRef.current = nm; setCurrentMove(nm);
          typedRef.current = 0; setTypedLen(0);
        }
      } else {
        setShake(true); setTimeout(() => setShake(false), 300);
        comboRef.current = 0; setCombo(0);
        play("wrong");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, animPlayer, animAI, addLog, addEffect, play, checkRoundEnd]);

  // Emit result
  useEffect(() => {
    if (phase !== "over" || finishedRef.current) return;
    finishedRef.current = true;
    onFinish?.({
      gameId: "spell-brawler",
      score: Math.floor(scoreRef.current),
      maxCombo: comboRef.current,
      wordsCompleted: Math.floor(scoreRef.current / 50),
      mistakes: 0,
      extra: { rounds: roundRef.current, playerWins: playerWinsRef.current },
    });
  }, [phase, onFinish]);

  const bestScore = userData?.gameStats?.["spell-brawler"]?.bestScore || 0;
  const aiP = AI_PROFILES[aiProfileIdx] || AI_PROFILES[1];

  if (phase === "lobby") return (
    <div className="skg-game skg-brawler">
      <AnimatedBackground theme={bgTheme} dim={0.5}>
        <Lobby onStart={startGame} onExit={onExit}/>
      </AnimatedBackground>
    </div>
  );

  return (
    <div className="skg-game skg-brawler">
      <AnimatedBackground theme={bgTheme} dim={0.42}>
        {/* Round banner */}
        {roundBanner && (
          <div className="sbr-round-banner">
            <div className="sbr-round-text">{roundBanner}</div>
          </div>
        )}

        {/* HUD */}
        <div className="skg-hud sbr-hud">
          <button className="skg-icon-btn" onClick={onExit}><X size={18}/></button>
          <div className="skg-hud-stat" style={{ color: "var(--skg-lime)" }}><Trophy size={14}/> {Math.floor(score)}</div>
          <div className="skg-hud-stat skg-hud-combo"><Zap size={13}/> ×{combo}</div>
          <div className="sbr-round-indicator">Round {round}/{ROUNDS}</div>
          <div className="sbr-wins">
            {"🟢".repeat(playerWins)}{"⚫".repeat(Math.max(0, 2-playerWins))} vs {"🔴".repeat(aiWins)}{"⚫".repeat(Math.max(0, 2-aiWins))}
          </div>
        </div>

        {/* HP bars */}
        <div className="sbr-hp-row">
          <HpBar hp={playerHp} max={PLAYER_MAX_HP} color={avatar?.primary||"#22e6c5"} label="You" side="player"/>
          <div className="sbr-vs-badge">VS</div>
          <HpBar hp={aiHp} max={aiP.hp} color={aiP.color} label={aiP.name} side="ai"/>
        </div>

        {/* Arena */}
        <div className="sbr-arena">
          {/* Floating effects */}
          {effects.map(e => (
            <div key={e.id} className="sbr-effect" style={{ left:`${e.x}%`, top:`${e.y}%`, color:e.color }}>{e.text}</div>
          ))}

          {/* Player */}
          <div className="sbr-fighter sbr-player-side" style={{ left:`${playerX}%` }}>
            {blockActive && <div className="sbr-shield-fx">🛡️</div>}
            <div className={`sbr-fighter-sprite sbr-player-anim-${playerAnim}`}>
              <GameAvatar avatar={avatar} state={
                playerAnim === "punch" || playerAnim === "eat" ? "eat"
                : playerAnim === "hurt" ? "hurt"
                : playerAnim === "victory" ? "victory"
                : "idle"
              } pulseKey={0} comboLevel={Math.min(Math.floor(combo/4),3)}
                size={80} reduceMotion={settings?.reduceMotion}
                projectileType={settings?.projectileType || "bullet"}/>
            </div>
            <div className="sbr-fighter-label">You</div>
          </div>

          {/* AI Fighter */}
          <div className="sbr-fighter sbr-ai-side" style={{ left:`${aiX}%` }}>
            {aiBlocking && <div className="sbr-shield-fx">🛡️</div>}
            <div className={`sbr-ai-sprite sbr-ai-anim-${aiAnim}`}>
              <div className="sbr-ai-char">🥷</div>
            </div>
            <div className="sbr-fighter-label" style={{ color: aiP.color }}>{aiP.name}</div>
          </div>

          {/* Ground */}
          <div className="sbr-ground"/>
        </div>

        {/* Battle log */}
        <div className="sbr-battle-log">
          {battleLog.slice(-3).map((l, i) => (
            <div key={i} className="sbr-log-line">{l}</div>
          ))}
        </div>

        {/* Move typing */}
        <div className="sbr-type-area">
          <MoveWord move={currentMove} typedLen={typedLen} shake={shake}/>
          <div className="sbr-type-hint">
            <span className="sktd-ch-done">■</span> typed &nbsp;
            <span className="sktd-ch-current">■</span> next &nbsp;
            <span className="sktd-ch-pending">■</span> pending
          </div>
        </div>

        {/* Result */}
        {phase === "over" && (
          <div className="skg-overlay">
            <div className="skg-overlay-card sbr-result-card">
              <div className="sbr-result-icon">{playerWins > aiWins ? "🏆" : "💀"}</div>
              <div className="skg-overlay-title">{playerWins > aiWins ? "Victory!" : playerWins === aiWins ? "Draw!" : "Defeated!"}</div>
              <div className="skg-overlay-score">{Math.floor(score)}</div>
              <div className="skg-overlay-sub">pts · vs {aiP.name}</div>
              <div className="skm-stat-grid">
                <div className="skm-stat-cell"><span className="skm-stat-label">Rounds won</span><span className="skm-stat-val skm-stat-acc">{playerWins}/3</span></div>
                <div className="skm-stat-cell"><span className="skm-stat-label">Best combo</span><span className="skm-stat-val">×{combo}</span></div>
                <div className="skm-stat-cell"><span className="skm-stat-label">Enemy HP left</span><span className="skm-stat-val skm-stat-mistakes">{Math.max(0,Math.round(aiHp))}</span></div>
                <div className="skm-stat-cell"><span className="skm-stat-label">Best score</span><span className="skm-stat-val">{Math.max(bestScore,Math.floor(score))}</span></div>
              </div>
              <div className="skg-overlay-actions">
                <button className="skg-btn skg-btn-primary" onClick={onRestart}><RotateCcw size={15}/> Rematch</button>
                <button className="skg-btn skg-btn-ghost" onClick={onExit}>Back to Arcade</button>
              </div>
            </div>
          </div>
        )}
      </AnimatedBackground>
    </div>
  );
}