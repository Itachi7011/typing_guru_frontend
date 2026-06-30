// ============================================================================
// GravityTyperGame.jsx  —  ASTEROIDS / ZERO GRAVITY
// Your ship floats in space. Type words to:
//   • Short (≤4)  → THRUST  (accelerate in facing direction)
//   • Medium (5-7)→ ROTATE  (change heading left/right)
//   • Long (8+)   → SHOOT   (fire laser at nearest asteroid)
//   • "fire","shoot","blast" → always SHOOT
//   • "left","right","spin"  → ROTATE
//   • "go","thrust","boost"  → THRUST
// Full 2D physics: position, velocity, friction, wrap-around edges.
// Asteroids spawn, split when hit. Waves increase.
// ============================================================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, RotateCcw, Trophy, Star, Zap, Users, Monitor, Info, ChevronRight } from "lucide-react";
import useGameAudio from "../../../components/Games/Usegameaudio";
import AnimatedBackground from "../../../components/Games/Animatedbackground";

const W = 100; // % units for positioning
const H = 100;
const SHIP_SIZE = 4;
const ASTEROID_SPEED = 0.12;
const BULLET_SPEED   = 1.8;
const FRICTION       = 0.98;
const THRUST_FORCE   = 0.35;
const ROTATE_AMOUNT  = 22;
const BULLET_TTL     = 55; // frames

function Tip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="skr-tip-wrap" onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      <Info size={13} className="skr-tip-icon"/>
      {show && <span className="skr-tooltip">{text}</span>}
    </span>
  );
}

function categorise(w) {
  const lw = w.toLowerCase();
  if (["fire","shoot","blast","zap","hit","aim"].includes(lw)) return "shoot";
  if (["left","right","spin","turn","rotate"].includes(lw)) return "rotate";
  if (["go","boost","thrust","rush","dash"].includes(lw)) return "thrust";
  if (w.length <= 4) return "thrust";
  if (w.length <= 7) return "rotate";
  return "shoot";
}

const WORD_POOL = {
  thrust: ["go","zip","fly","hop","rev","gun","zap","dash","rush","boost","speed","turbo"],
  rotate: ["spin","left","right","orbit","circle","spiral","swerve","vector","course"],
  shoot:  ["laser","bullet","missile","photon","destroy","obliterate","supernova","annihilate","explosion"],
};

function pickWord() {
  const r = Math.random();
  const pool = r < 0.35 ? WORD_POOL.thrust : r < 0.65 ? WORD_POOL.rotate : WORD_POOL.shoot;
  return pool[Math.floor(Math.random() * pool.length)];
}

let _astId = 0, _bulId = 0;
function makeAsteroid(wave, x, y, size, vx, vy) {
  const spd = ASTEROID_SPEED * (1 + wave * 0.15);
  const angle = Math.random() * Math.PI * 2;
  return {
    id: ++_astId,
    x:  x ?? Math.random() * 100,
    y:  y ?? Math.random() * 100,
    vx: vx ?? Math.cos(angle) * spd,
    vy: vy ?? Math.sin(angle) * spd,
    size: size ?? (2 + Math.floor(Math.random() * 3)), // 2-4
    hp: size ?? 2,
    angle: Math.random() * 360,
    spin: (Math.random() - 0.5) * 3,
  };
}

function WordTarget({ word, typedLen, action, shake }) {
  const colors = { thrust:"#22e6c5", rotate:"#fbbf24", shoot:"#ff4d6d" };
  const labels = { thrust:"⬆ THRUST", rotate:"🔄 ROTATE", shoot:"⚡ SHOOT" };
  return (
    <div className={`sgt-word-target${shake?" sktd-shake":""}`} style={{ borderColor: colors[action] }}>
      <span className="sgt-action-badge" style={{ background: colors[action] }}>{labels[action]}</span>
      <div className="sgt-word-chars">
        {word.split("").map((ch,i) => (
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
      <div className="skr-lobby-card sgt-lobby-card">
        <div className="skr-lobby-title">🚀 Gravity Typer</div>
        <p className="skr-lobby-sub">Zero gravity asteroid field. Type to thrust, rotate, and shoot. Survive the waves!</p>
        <div className="skr-lobby-section">
          <div className="skr-lobby-label">Mode <Tip text="Co-op ship control coming soon!"/></div>
          <div className="skr-mode-pills">
            <button className="skr-mode-pill skr-mode-active"><Monitor size={14}/> Solo Pilot</button>
            <button className="skr-mode-pill skr-mode-soon" disabled>
              <Users size={14}/> Co-op <span className="skr-soon-badge">Soon</span>
            </button>
          </div>
        </div>
        <div className="skr-lobby-section">
          <div className="skr-lobby-label">Controls <Tip text="Short words thrust. Medium words rotate. Long words shoot. Or type the action directly!"/></div>
          <div className="str-control-grid">
            <div className="str-ctrl"><span className="str-ctrl-key">short / go / boost</span><span style={{color:"#22e6c5"}}>⬆ Thrust</span></div>
            <div className="str-ctrl"><span className="str-ctrl-key">medium / spin / left</span><span style={{color:"#fbbf24"}}>🔄 Rotate</span></div>
            <div className="str-ctrl"><span className="str-ctrl-key">long / fire / shoot</span><span style={{color:"#ff4d6d"}}>⚡ Shoot</span></div>
          </div>
        </div>
        <div className="skr-lobby-actions">
          <button className="skg-btn skg-btn-primary" onClick={onStart}>Launch! <ChevronRight size={16}/></button>
          <button className="skg-btn skg-btn-ghost" onClick={onExit}>Back to Arcade</button>
        </div>
      </div>
    </div>
  );
}

export default function GravityTyperGame({
  avatar, difficulty, sessionSeconds, settings, userData, onExit, onRestart, onFinish,
}) {
  const { play } = useGameAudio({ packId: settings?.soundPackId ?? "scifi", volume: settings?.masterVolume ?? 0.7, enabled: settings?.soundOn ?? true });

  const [phase, setPhase] = useState("lobby");

  // Ship state
  const [shipX, setShipX] = useState(50);
  const [shipY, setShipY] = useState(50);
  const [shipAngle, setShipAngle] = useState(-90); // degrees, -90 = up
  const [thrusting, setThrusting] = useState(false);
  const [lives, setLives]   = useState(3);
  const [score, setScore]   = useState(0);
  const [wave,  setWave]    = useState(1);
  const [combo, setCombo]   = useState(0);
  const [timeLeft, setTimeLeft] = useState(sessionSeconds);

  const [asteroids, setAsteroids] = useState([]);
  const [bullets,   setBullets]   = useState([]);
  const [effects,   setEffects]   = useState([]);
  const [word,      setWord]      = useState(() => pickWord());
  const [typedLen,  setTypedLen]  = useState(0);
  const [shake,     setShake]     = useState(false);

  // Physics refs
  const shipRef = useRef({ x:50, y:50, vx:0, vy:0, angle:-90 });
  const asteroidsRef = useRef([]);
  const bulletsRef   = useRef([]);
  const livesRef     = useRef(3);
  const scoreRef     = useRef(0);
  const comboRef     = useRef(0);
  const waveRef      = useRef(1);
  const typedRef     = useRef(0);
  const wordRef      = useRef(word);
  const thrustRef    = useRef(false);
  const finishedRef  = useRef(false);
  const fxIdRef      = useRef(0);
  const invincibleRef = useRef(false);

  useEffect(() => { wordRef.current = word; }, [word]);
  useEffect(() => { asteroidsRef.current = asteroids; }, [asteroids]);
  useEffect(() => { bulletsRef.current   = bullets; },   [bullets]);

  const addEffect = useCallback((text, color, x, y) => {
    const id = fxIdRef.current++;
    setEffects(p => [...p, { id, text, color, x, y }]);
    setTimeout(() => setEffects(p => p.filter(e => e.id !== id)), 900);
  }, []);

  const nextWord = useCallback(() => {
    const nw = pickWord();
    wordRef.current = nw;
    setWord(nw);
    typedRef.current = 0;
    setTypedLen(0);
  }, []);

  const spawnWave = useCallback((w) => {
    const count = 3 + w * 2;
    const asts = Array.from({ length: count }, () => {
      // spawn away from ship
      let x, y;
      do { x = Math.random()*100; y = Math.random()*100; }
      while (Math.abs(x-shipRef.current.x)<20 && Math.abs(y-shipRef.current.y)<20);
      return makeAsteroid(w, x, y);
    });
    asteroidsRef.current = asts;
    setAsteroids([...asts]);
  }, []);

  const startGame = useCallback(() => {
    shipRef.current = { x:50, y:50, vx:0, vy:0, angle:-90 };
    setShipX(50); setShipY(50); setShipAngle(-90);
    livesRef.current = 3; setLives(3);
    scoreRef.current = 0; setScore(0);
    comboRef.current = 0; setCombo(0);
    waveRef.current = 1; setWave(1);
    bulletsRef.current = []; setBullets([]);
    setEffects([]); setThrusting(false);
    finishedRef.current = false;
    invincibleRef.current = false;
    nextWord();
    spawnWave(1);
    setPhase("playing");
  }, [nextWord, spawnWave]);

  // Physics + collision loop
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      const s = shipRef.current;

      // Thrust
      if (thrustRef.current) {
        const rad = (s.angle * Math.PI) / 180;
        s.vx += Math.cos(rad) * THRUST_FORCE * 0.016 * 60;
        s.vy += Math.sin(rad) * THRUST_FORCE * 0.016 * 60;
      }

      // Friction + move + wrap
      s.vx *= FRICTION; s.vy *= FRICTION;
      s.x = ((s.x + s.vx) + 100) % 100;
      s.y = ((s.y + s.vy) + 100) % 100;
      setShipX(s.x); setShipY(s.y);

      // Move asteroids + spin
      const newAsts = asteroidsRef.current.map(a => ({
        ...a,
        x: ((a.x + a.vx) + 100) % 100,
        y: ((a.y + a.vy) + 100) % 100,
        angle: a.angle + a.spin,
      }));

      // Move bullets + TTL
      const newBuls = bulletsRef.current
        .map(b => ({ ...b, x: b.x + b.vx, y: b.y + b.vy, ttl: b.ttl - 1 }))
        .filter(b => b.ttl > 0 && b.x > 0 && b.x < 100 && b.y > 0 && b.y < 100);

      // Bullet-asteroid collision
      const hitAstIds = new Set();
      const hitBulIds = new Set();
      const newFragments = [];

      newBuls.forEach(b => {
        newAsts.forEach(a => {
          const dist = Math.hypot(b.x - a.x, b.y - a.y);
          if (dist < a.size * 1.2 && !hitAstIds.has(a.id) && !hitBulIds.has(b.id)) {
            hitAstIds.add(a.id);
            hitBulIds.add(b.id);
            const pts = a.size * 20 + comboRef.current * 5;
            scoreRef.current += pts; setScore(Math.floor(scoreRef.current));
            addEffect(`+${pts}`, "#fbbf24", a.x, a.y);
            play("eat");
            if (a.size > 1) {
              // Split
              for (let i = 0; i < 2; i++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = ASTEROID_SPEED * 1.3;
                newFragments.push(makeAsteroid(waveRef.current, a.x + (Math.random()-0.5)*4, a.y + (Math.random()-0.5)*4, a.size-1, Math.cos(ang)*spd, Math.sin(ang)*spd));
              }
            }
          }
        });
      });

      const survivingAsts = [...newAsts.filter(a => !hitAstIds.has(a.id)), ...newFragments];
      const survivingBuls = newBuls.filter(b => !hitBulIds.has(b.id));

      // Ship-asteroid collision
      if (!invincibleRef.current) {
        survivingAsts.forEach(a => {
          const dist = Math.hypot(s.x - a.x, s.y - a.y);
          if (dist < a.size * 1.4 + SHIP_SIZE * 0.5) {
            livesRef.current = Math.max(0, livesRef.current - 1);
            setLives(livesRef.current);
            addEffect("💥", "#ff4d6d", s.x, s.y);
            play("wrong");
            comboRef.current = 0; setCombo(0);
            // Brief invincibility
            invincibleRef.current = true;
            setTimeout(() => { invincibleRef.current = false; }, 2000);
            // Knockback
            s.vx = -s.vx * 2; s.vy = -s.vy * 2;
            if (livesRef.current <= 0) setPhase("over");
          }
        });
      }

      // Wave clear
      if (survivingAsts.length === 0) {
        waveRef.current++;
        setWave(waveRef.current);
        const bonus = waveRef.current * 100;
        scoreRef.current += bonus; setScore(Math.floor(scoreRef.current));
        addEffect(`🌊 Wave ${waveRef.current}! +${bonus}`, "#22e6c5", 50, 50);
        play("levelUp");
        setTimeout(() => spawnWave(waveRef.current), 800);
      }

      asteroidsRef.current = survivingAsts; setAsteroids([...survivingAsts]);
      bulletsRef.current   = survivingBuls; setBullets([...survivingBuls]);
    }, 16);
    return () => clearInterval(id);
  }, [phase, addEffect, play, spawnWave]);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    setTimeLeft(sessionSeconds);
    const id = setInterval(() => {
      setTimeLeft(t => { if (t<=1){ clearInterval(id); setPhase("over"); return 0; } return t-1; });
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
        const nl = idx + 1; typedRef.current = nl; setTypedLen(nl);
        play("bite");
        if (nl >= w.length) {
          const action = categorise(w);
          comboRef.current++; setCombo(comboRef.current);

          if (action === "thrust") {
            thrustRef.current = true; setThrusting(true);
            setTimeout(() => { thrustRef.current = false; setThrusting(false); }, 700);
            addEffect("🚀 THRUST", "#22e6c5", shipRef.current.x, shipRef.current.y);
            play("combo");
          } else if (action === "rotate") {
            const dir = Math.random() < 0.5 ? 1 : -1;
            shipRef.current.angle += ROTATE_AMOUNT * dir;
            setShipAngle(shipRef.current.angle);
            addEffect(dir > 0 ? "↻ ROTATE" : "↺ ROTATE", "#fbbf24", shipRef.current.x, shipRef.current.y);
            play("bite");
          } else if (action === "shoot") {
            const rad = (shipRef.current.angle * Math.PI) / 180;
            const bullet = {
              id: ++_bulId,
              x: shipRef.current.x + Math.cos(rad) * 3,
              y: shipRef.current.y + Math.sin(rad) * 3,
              vx: Math.cos(rad) * BULLET_SPEED,
              vy: Math.sin(rad) * BULLET_SPEED,
              ttl: BULLET_TTL,
            };
            bulletsRef.current = [...bulletsRef.current, bullet];
            setBullets([...bulletsRef.current]);
            addEffect("⚡ FIRE", "#ff4d6d", shipRef.current.x, shipRef.current.y);
            play("eat");
          }

          const pts = w.length * 10 + comboRef.current * 5;
          scoreRef.current += pts; setScore(Math.floor(scoreRef.current));
          nextWord();
        }
      } else {
        setShake(true); setTimeout(() => setShake(false), 300);
        comboRef.current = 0; setCombo(0); play("wrong");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, nextWord, addEffect, play]);

  // Emit
  useEffect(() => {
    if (phase !== "over" || finishedRef.current) return;
    finishedRef.current = true;
    onFinish?.({ gameId:"gravity-typer", score:Math.floor(scoreRef.current), maxCombo:comboRef.current, wordsCompleted:Math.floor(scoreRef.current/15), mistakes:0, extra:{ wave:waveRef.current } });
  }, [phase, onFinish]);

  const bestScore = userData?.gameStats?.["gravity-typer"]?.bestScore || 0;
  const action = categorise(word);
  const timerColor = timeLeft<=10?"var(--skg-coral)":timeLeft<=20?"var(--skg-amber)":undefined;

  if (phase === "lobby") return (
    <div className="skg-game skg-gravity"><AnimatedBackground theme="space" dim={0.3}><Lobby onStart={startGame} onExit={onExit}/></AnimatedBackground></div>
  );

  return (
    <div className="skg-game skg-gravity">
      <AnimatedBackground theme="space" dim={0.25}>
        <div className="skg-hud sgt-hud">
          <button className="skg-icon-btn" onClick={onExit}><X size={18}/></button>
          <div className="skg-hud-stat" style={{color:"var(--skg-lime)"}}><Trophy size={14}/> {Math.floor(score)}</div>
          <div className="skg-hud-stat skg-hud-combo">×{combo}</div>
          <div className="skg-hud-stat"><Zap size={13}/> Wave {wave}</div>
          {Array.from({length:3}).map((_,i)=>(
            <span key={i} style={{fontSize:"1rem"}}>{i<lives?"❤️":"🖤"}</span>
          ))}
          <div className="skg-hud-timer" style={{color:timerColor}}>{timeLeft}s</div>
        </div>

        {/* Space field */}
        <div className="sgt-space">
          {/* Bullets */}
          {bullets.map(b => (
            <div key={b.id} className="sgt-bullet" style={{ left:`${b.x}%`, top:`${b.y}%` }}/>
          ))}

          {/* Asteroids */}
          {asteroids.map(a => (
            <div key={a.id} className={`sgt-asteroid sgt-ast-${a.size}`}
              style={{ left:`${a.x}%`, top:`${a.y}%`, transform:`rotate(${a.angle}deg)` }}>
              {"🪨"}
            </div>
          ))}

          {/* Ship */}
          <div className="sgt-ship"
            style={{ left:`${shipX}%`, top:`${shipY}%`, transform:`rotate(${shipAngle + 90}deg)` }}>
            <div className="sgt-ship-body">🚀</div>
            {thrusting && <div className="sgt-thrust-flame">🔥</div>}
          </div>

          {/* Effects */}
          {effects.map(e => (
            <div key={e.id} className="sgt-effect" style={{ left:`${e.x}%`, top:`${e.y}%`, color:e.color }}>{e.text}</div>
          ))}
        </div>

        {/* Typing */}
        <div className="sgt-type-area">
          <WordTarget word={word} typedLen={typedLen} action={action} shake={shake}/>
        </div>

        {phase === "over" && (
          <div className="skg-overlay">
            <div className="skg-overlay-card">
              {Math.floor(score) > bestScore && bestScore > 0 && <div className="skm-newbest-banner"><Trophy size={14}/> New Best!</div>}
              <div className="skg-overlay-title">{lives > 0 ? "Mission Complete" : "Ship Destroyed"}</div>
              <div className="skg-overlay-score">{Math.floor(score)}</div>
              <div className="skg-overlay-sub">pts · wave {wave} reached</div>
              <div className="skm-stat-grid">
                <div className="skm-stat-cell"><span className="skm-stat-label">Wave reached</span><span className="skm-stat-val">{wave}</span></div>
                <div className="skm-stat-cell"><span className="skm-stat-label">Best combo</span><span className="skm-stat-val">×{combo}</span></div>
                <div className="skm-stat-cell"><span className="skm-stat-label">Lives left</span><span className="skm-stat-val skm-stat-acc">{lives}</span></div>
                <div className="skm-stat-cell"><span className="skm-stat-label">Best score</span><span className="skm-stat-val">{Math.max(bestScore,Math.floor(score))}</span></div>
              </div>
              <div className="skg-overlay-actions">
                <button className="skg-btn skg-btn-primary" onClick={onRestart}><RotateCcw size={15}/> Relaunch</button>
                <button className="skg-btn skg-btn-ghost" onClick={onExit}>Back to Arcade</button>
              </div>
            </div>
          </div>
        )}
      </AnimatedBackground>
    </div>
  );
}