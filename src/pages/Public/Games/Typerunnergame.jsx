// ============================================================================
// TypeRunnerGame.jsx  —  MARIO-STYLE PLATFORMER
// Type words to control your character:
//   • Short words (≤4)  → JUMP  (character leaps over obstacle)
//   • Medium (5-7)      → RUN   (speed burst, dodge enemy)
//   • Long (8+)         → ATTACK (destroy enemy, collect coin)
//   • "jump", "run", "attack" always trigger those actions
// Obstacles and enemies scroll from right. Score = distance + coins + kills.
// Full CSS physics: gravity, jump arc, ground collision, parallax layers.
// ============================================================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, RotateCcw, Trophy, Heart, Star, Zap, Users, Monitor,
         Info, ChevronRight } from "lucide-react";
import GameAvatar from "../../../components/Games/Gameavatar";
import useGameAudio from "../../../components/Games/Usegameaudio";
import AnimatedBackground from "../../../components/Games/Animatedbackground";

const GROUND_Y    = 72;   // % from bottom where ground is
const GRAVITY     = 0.6;
const JUMP_V      = -14;
const PLAYER_X    = 14;   // fixed % from left
const OBSTACLE_SPEED_BASE = 2.2;
const COIN_SCORE  = 50;
const KILL_SCORE  = 80;
const DIST_SCORE  = 1;

const OBJ_TYPES = [
  { type: "obstacle", emoji: "🪨", w: 5,  h: 6,  y: GROUND_Y, points: 0 },
  { type: "enemy",    emoji: "👾", w: 5,  h: 7,  y: GROUND_Y, points: KILL_SCORE },
  { type: "coin",     emoji: "🪙", w: 3,  h: 3,  y: GROUND_Y + 8, points: COIN_SCORE },
  { type: "spike",    emoji: "⬆️", w: 4,  h: 5,  y: GROUND_Y, points: 0 },
  { type: "flyEnemy", emoji: "🦇", w: 5,  h: 5,  y: GROUND_Y + 14, points: KILL_SCORE },
];

function categoriseWord(w) {
  if (["jump","hop","leap","skip"].includes(w.toLowerCase())) return "jump";
  if (["run","dash","sprint","rush","go","fly"].includes(w.toLowerCase())) return "run";
  if (["attack","fight","punch","kick","shoot","fire","smash","blast"].includes(w.toLowerCase())) return "attack";
  if (w.length <= 4) return "jump";
  if (w.length <= 7) return "run";
  return "attack";
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

// ── Word display with per-char highlight ──────────────────────────────────────
function WordTarget({ word, typedLen, action, shake }) {
  const actionColor = { jump: "#22e6c5", run: "#fbbf24", attack: "#ff4d6d" };
  return (
    <div className={`str-word-target${shake ? " sktd-shake" : ""}`}
      style={{ borderColor: actionColor[action] || "var(--skg-border)" }}>
      <span className="str-action-badge" style={{ background: actionColor[action] }}>
        {action === "jump" ? "⬆ JUMP" : action === "run" ? "💨 RUN" : "⚔ ATTACK"}
      </span>
      <div className="str-word-chars">
        {word.split("").map((ch, i) => (
          <span key={i} className={
            i < typedLen ? "sktd-ch-done" : i === typedLen ? "sktd-ch-current" : "sktd-ch-pending"
          }>{ch}</span>
        ))}
      </div>
    </div>
  );
}

// ── Lobby ─────────────────────────────────────────────────────────────────────
function Lobby({ onStart, onExit, bgTheme, setBgTheme, BG_THEMES }) {
  return (
    <div className="skr-lobby">
      <div className="skr-lobby-card">
        <div className="skr-lobby-title">🍄 Type Runner</div>
        <p className="skr-lobby-sub">
          Type words to jump obstacles, dash past enemies, and attack! Short = jump, Medium = run, Long = attack.
        </p>
        <div className="skr-lobby-section">
          <div className="skr-lobby-label">Mode <Tip text="Multiplayer running coming soon!"/></div>
          <div className="skr-mode-pills">
            <button className="skr-mode-pill skr-mode-active"><Monitor size={14}/> Solo Run</button>
            <button className="skr-mode-pill skr-mode-soon" disabled>
              <Users size={14}/> Race <span className="skr-soon-badge">Soon</span>
            </button>
          </div>
        </div>
        <div className="skr-lobby-section">
          <div className="skr-lobby-label">Controls <Tip text="Words auto-map to actions by length. You can also type the action word directly."/></div>
          <div className="str-control-grid">
            <div className="str-ctrl"><span className="str-ctrl-key">short word</span><span>⬆️ Jump</span></div>
            <div className="str-ctrl"><span className="str-ctrl-key">medium word</span><span>💨 Run burst</span></div>
            <div className="str-ctrl"><span className="str-ctrl-key">long word</span><span>⚔️ Attack</span></div>
          </div>
        </div>
        <div className="skr-lobby-actions">
          <button className="skg-btn skg-btn-primary" onClick={onStart}>
            Start Running! <ChevronRight size={16}/>
          </button>
          <button className="skg-btn skg-btn-ghost" onClick={onExit}>Back to Arcade</button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
let _oid = 0;
const WORD_POOLS = {
  jump:   ["cat","dog","hop","bee","run","ant","sky","sun","fly","hit","bat","axe","cut","dig","fox"],
  run:    ["tiger","river","quest","storm","sword","blast","rapid","forge","speed","coast","flint"],
  attack: ["thunder","blizzard","volcano","champion","lightning","fortress","explosion","powerful","shatter"],
};

function pickWord(diff) {
  const r = Math.random();
  const pool = r < 0.4 ? WORD_POOLS.jump : r < 0.7 ? WORD_POOLS.run : WORD_POOLS.attack;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function TypeRunnerGame({
  avatar, difficulty, sessionSeconds, settings, userData, onExit, onRestart, onFinish,
}) {
  const { play } = useGameAudio({ packId: settings?.soundPackId ?? "arcade", volume: settings?.masterVolume ?? 0.7, enabled: settings?.soundOn ?? true });

  const [phase, setPhase] = useState("lobby");
  const [bgTheme, setBgTheme] = useState("forest");

  // Player physics
  const [playerY, setPlayerY]       = useState(GROUND_Y);
  const [velY,    setVelY]          = useState(0);
  const [isGround,setIsGround]      = useState(true);
  const [playerState, setPlayerState] = useState("idle");  // idle|jump|run|attack|hurt
  const [pulseKey,    setPulseKey]    = useState(0);

  // Game objects
  const [objects,  setObjects]  = useState([]);
  const [word,     setWord]     = useState(() => pickWord("medium"));
  const [typedLen, setTypedLen] = useState(0);
  const [shake,    setShake]    = useState(false);
  const [score,    setScore]    = useState(0);
  const [distance, setDistance] = useState(0);
  const [lives,    setLives]    = useState(3);
  const [combo,    setCombo]    = useState(0);
  const [effects,  setEffects]  = useState([]); // floating text
  const [timeLeft, setTimeLeft] = useState(sessionSeconds);
  const [speed,    setSpeed]    = useState(OBSTACLE_SPEED_BASE);

  const playerYRef  = useRef(GROUND_Y);
  const velYRef     = useRef(0);
  const isGroundRef = useRef(true);
  const typedRef    = useRef(0);
  const wordRef     = useRef(word);
  const objectsRef  = useRef([]);
  const scoreRef    = useRef(0);
  const livesRef    = useRef(3);
  const comboRef    = useRef(0);
  const distanceRef = useRef(0);
  const speedRef    = useRef(OBSTACLE_SPEED_BASE);
  const finishedRef = useRef(false);
  const fxIdRef     = useRef(0);

  useEffect(() => { wordRef.current = word; }, [word]);
  useEffect(() => { objectsRef.current = objects; }, [objects]);

  const addEffect = useCallback((text, color, x, y) => {
    const id = fxIdRef.current++;
    setEffects(prev => [...prev, { id, text, color, x, y }]);
    setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 900);
  }, []);

  const flashPlayer = useCallback((s) => {
    setPlayerState(s);
    setPulseKey(k => k + 1);
    setTimeout(() => setPlayerState("idle"), 400);
  }, []);

  const nextWord = useCallback(() => {
    const nw = pickWord(difficulty);
    wordRef.current = nw;
    setWord(nw);
    typedRef.current = 0;
    setTypedLen(0);
  }, [difficulty]);

  const startGame = useCallback(() => {
    playerYRef.current = GROUND_Y; setPlayerY(GROUND_Y);
    velYRef.current = 0; setVelY(0);
    isGroundRef.current = true; setIsGround(true);
    setObjects([]); objectsRef.current = [];
    scoreRef.current = 0; setScore(0);
    livesRef.current = 3; setLives(3);
    comboRef.current = 0; setCombo(0);
    distanceRef.current = 0; setDistance(0);
    speedRef.current = OBSTACLE_SPEED_BASE; setSpeed(OBSTACLE_SPEED_BASE);
    finishedRef.current = false;
    setEffects([]);
    nextWord();
    setPhase("playing");
  }, [nextWord]);

  // Physics loop (60fps)
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      // Gravity
      if (!isGroundRef.current) {
        velYRef.current += GRAVITY;
        const newY = playerYRef.current - velYRef.current;
        if (newY >= GROUND_Y) {
          playerYRef.current = GROUND_Y;
          velYRef.current = 0;
          isGroundRef.current = true;
          setIsGround(true);
        } else {
          playerYRef.current = newY;
        }
        setPlayerY(playerYRef.current);
        setVelY(velYRef.current);
      }

      // Move objects
      const sp = speedRef.current;
      const newObjs = objectsRef.current
        .map(o => ({ ...o, x: o.x - sp }))
        .filter(o => o.x > -10);

      // Collision detection
      newObjs.forEach(o => {
        const px = PLAYER_X; const py = playerYRef.current;
        const hit = Math.abs(px - o.x) < 5 && Math.abs(py - o.y) < 8;
        if (hit && !o.hit) {
          o.hit = true;
          if (o.type === "coin") {
            scoreRef.current += COIN_SCORE; setScore(scoreRef.current);
            addEffect(`+${COIN_SCORE}`, "#fbbf24", o.x, o.y);
            play("eat");
          } else if (o.type === "enemy" || o.type === "flyEnemy") {
            // Enemy hits player if not attacking
            livesRef.current -= 1; setLives(livesRef.current);
            setPlayerState("hurt"); setPulseKey(k => k + 1);
            setTimeout(() => setPlayerState("idle"), 400);
            play("wrong");
            addEffect("-1 ❤️", "#ff4d6d", o.x, o.y);
            if (livesRef.current <= 0) setPhase("over");
          } else if (o.type === "obstacle" || o.type === "spike") {
            if (!isGroundRef.current) return; // jumped over
            livesRef.current -= 1; setLives(livesRef.current);
            setPlayerState("hurt"); setPulseKey(k => k + 1);
            setTimeout(() => setPlayerState("idle"), 400);
            play("wrong");
            addEffect("💥", "#ff4d6d", o.x, o.y);
            if (livesRef.current <= 0) setPhase("over");
          }
        }
      });

      objectsRef.current = newObjs.filter(o => !o.hit || o.type === "coin");
      setObjects([...objectsRef.current]);

      // Distance
      distanceRef.current += sp * 0.1;
      setDistance(Math.floor(distanceRef.current));
      scoreRef.current += DIST_SCORE * 0.05;
      if (Math.floor(distanceRef.current) % 50 === 0 && distanceRef.current > 0) {
        setScore(Math.floor(scoreRef.current));
      }
    }, 16);
    return () => clearInterval(id);
  }, [phase, addEffect, play]);

  // Spawn loop
  useEffect(() => {
    if (phase !== "playing") return;
    let spawned = 0;
    const spawn = () => {
      if (objectsRef.current.length < 6) {
        const t = OBJ_TYPES[Math.floor(Math.random() * OBJ_TYPES.length)];
        const obj = { ...t, id: ++_oid, x: 105, hit: false };
        objectsRef.current = [...objectsRef.current, obj];
        setObjects([...objectsRef.current]);
        spawned++;
        // Speed ramp
        speedRef.current = OBSTACLE_SPEED_BASE + spawned * 0.04;
        setSpeed(speedRef.current);
      }
    };
    const base = 2200 - (difficulty === "hard" ? 600 : difficulty === "insane" ? 900 : difficulty === "medium" ? 300 : 0);
    const id = setInterval(spawn, base + Math.random() * 1000);
    return () => clearInterval(id);
  }, [phase, difficulty]);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    setTimeLeft(sessionSeconds);
    const id = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(id); setPhase("over"); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, sessionSeconds]);

  // Keyboard
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e) => {
      if (e.key.length !== 1 && e.key !== " ") return;
      e.preventDefault();
      const w = wordRef.current;
      const idx = typedRef.current;
      if (e.key.toLowerCase() === w[idx]?.toLowerCase()) {
        const nl = idx + 1;
        typedRef.current = nl;
        setTypedLen(nl);
        play("bite");
        if (nl >= w.length) {
          // Word complete — execute action!
          const action = categoriseWord(w);
          comboRef.current++; setCombo(comboRef.current);
          const pts = w.length * 12 + comboRef.current * 6;
          scoreRef.current += pts; setScore(Math.floor(scoreRef.current));

          if (action === "jump" && isGroundRef.current) {
            velYRef.current = JUMP_V; isGroundRef.current = false;
            setIsGround(false); flashPlayer("eat");
            play("combo"); addEffect("JUMP!", "#22e6c5", PLAYER_X, playerYRef.current);
          } else if (action === "run") {
            speedRef.current = Math.min(speedRef.current + 1.5, 8);
            setTimeout(() => { speedRef.current = Math.max(speedRef.current - 1.5, OBSTACLE_SPEED_BASE); }, 1200);
            flashPlayer("bite");
            play("combo"); addEffect("DASH!", "#fbbf24", PLAYER_X, playerYRef.current);
          } else if (action === "attack") {
            // Destroy nearest enemy/obstacle
            const target = objectsRef.current.find(o => o.x > PLAYER_X && o.x < PLAYER_X + 25);
            if (target) {
              objectsRef.current = objectsRef.current.filter(o => o.id !== target.id);
              setObjects([...objectsRef.current]);
              const bonus = target.points || 40;
              scoreRef.current += bonus; setScore(Math.floor(scoreRef.current));
              addEffect(`⚔️ +${bonus}`, "#ff4d6d", target.x, target.y);
            }
            flashPlayer("eat"); play("eat");
            addEffect("ATTACK!", "#ff4d6d", PLAYER_X, playerYRef.current);
          }
          nextWord();
        }
      } else {
        setShake(true); setTimeout(() => setShake(false), 300);
        comboRef.current = 0; setCombo(0);
        play("wrong");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, nextWord, flashPlayer, play, addEffect]);

  // Emit result
  useEffect(() => {
    if (phase !== "over" || finishedRef.current) return;
    finishedRef.current = true;
    onFinish?.({
      gameId: "type-runner",
      score: Math.floor(scoreRef.current),
      maxCombo: comboRef.current,
      wordsCompleted: Math.floor(distanceRef.current / 10),
      mistakes: 0,
      extra: { distance: Math.floor(distanceRef.current) },
    });
  }, [phase, onFinish]);

  const bestScore = userData?.gameStats?.["type-runner"]?.bestScore || 0;
  const action = categoriseWord(word);
  const timerColor = timeLeft <= 10 ? "var(--skg-coral)" : timeLeft <= 20 ? "var(--skg-amber)" : undefined;
  const actionColor = { jump: "#22e6c5", run: "#fbbf24", attack: "#ff4d6d" };

  if (phase === "lobby") {
    return (
      <div className="skg-game skg-typerunner">
        <AnimatedBackground theme={bgTheme} dim={0.5}>
          <Lobby onStart={startGame} onExit={onExit} bgTheme={bgTheme} setBgTheme={setBgTheme}/>
        </AnimatedBackground>
      </div>
    );
  }

  return (
    <div className="skg-game skg-typerunner">
      <AnimatedBackground theme={bgTheme} dim={0.45}>
        {/* HUD */}
        <div className="skg-hud str-hud">
          <button className="skg-icon-btn" onClick={onExit}><X size={18}/></button>
          <div className="skg-hud-stat" style={{ color: "var(--skg-lime)" }}><Trophy size={14}/> {Math.floor(score)}</div>
          <div className="skg-hud-stat skg-hud-combo">×{combo}</div>
          <div className="skg-hud-stat"><Star size={13}/> {distance}m</div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} size={15}
              fill={i < lives ? "var(--skg-coral)" : "none"}
              color={i < lives ? "var(--skg-coral)" : "var(--skg-text-dim)"}/>
          ))}
          <div className="skg-hud-timer" style={{ color: timerColor }}>{timeLeft}s</div>
        </div>

        {/* Best score strip */}
        <div className="str-score-bar">
          <span>Best: <strong>{bestScore}</strong></span>
          {score > bestScore && score > 0 && <span className="str-new-best">🏆 New Best!</span>}
          <span style={{ color: actionColor[action] }}>Next action: <strong>{action.toUpperCase()}</strong></span>
        </div>

        {/* Game world */}
        <div className="str-world">
          {/* Floating effects */}
          {effects.map(e => (
            <div key={e.id} className="str-effect"
              style={{ left: `${e.x}%`, bottom: `${e.y + 5}%`, color: e.color }}>{e.text}</div>
          ))}

          {/* Objects */}
          {objects.map(o => (
            <div key={o.id} className={`str-object str-obj-${o.type}`}
              style={{ left: `${o.x}%`, bottom: `${o.y}%` }}>
              {o.emoji}
            </div>
          ))}

          {/* Player */}
          <div className="str-player" style={{ left: `${PLAYER_X}%`, bottom: `${playerY}%` }}>
            <GameAvatar avatar={avatar} state={playerState} pulseKey={pulseKey}
              comboLevel={Math.min(Math.floor(combo / 4), 3)} size={64}
              reduceMotion={settings?.reduceMotion}
              projectileType={settings?.projectileType || "bullet"}/>
          </div>

          {/* Ground */}
          <div className="str-ground"/>
        </div>

        {/* Typing area */}
        <div className="str-type-area">
          <WordTarget word={word} typedLen={typedLen} action={action} shake={shake}/>
          <div className="str-type-hint">
            <span className="sktd-ch-done">■</span> typed &nbsp;
            <span className="sktd-ch-current">■</span> next &nbsp;
            <span className="sktd-ch-pending">■</span> pending
          </div>
        </div>

        {/* Result */}
        {phase === "over" && (
          <div className="skg-overlay">
            <div className={`skg-overlay-card${score > bestScore && bestScore > 0 ? " skg-new-best" : ""}`}>
              {score > bestScore && bestScore > 0 && <div className="skm-newbest-banner"><Trophy size={14}/> New Best!</div>}
              <div className="skg-overlay-title">Run Over!</div>
              <div className="skg-overlay-score">{Math.floor(score)}</div>
              <div className="skg-overlay-sub">pts · {distance}m run</div>
              <div className="skm-stat-grid">
                <div className="skm-stat-cell"><span className="skm-stat-label">Distance</span><span className="skm-stat-val">{distance}m</span></div>
                <div className="skm-stat-cell"><span className="skm-stat-label">Best combo</span><span className="skm-stat-val">×{combo}</span></div>
                <div className="skm-stat-cell"><span className="skm-stat-label">Lives left</span><span className="skm-stat-val skm-stat-acc">{lives}</span></div>
                <div className="skm-stat-cell"><span className="skm-stat-label">Best score</span><span className="skm-stat-val">{Math.max(bestScore, Math.floor(score))}</span></div>
              </div>
              <div className="skg-overlay-actions">
                <button className="skg-btn skg-btn-primary" onClick={onRestart}><RotateCcw size={15}/> Run Again</button>
                <button className="skg-btn skg-btn-ghost" onClick={onExit}>Back to Arcade</button>
              </div>
            </div>
          </div>
        )}
      </AnimatedBackground>
    </div>
  );
}