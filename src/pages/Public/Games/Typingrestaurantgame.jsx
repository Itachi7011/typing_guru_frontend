// ============================================================================
// TypingRestaurantGame.jsx
// Genre: Time Management — cook orders by typing ingredients then actions.
// Rush hours, impatient customers, kitchen fires, upgrades, multiple stations.
// ============================================================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, RotateCcw, Trophy, Clock, Star, Users, Monitor, Info, ChevronRight, Flame } from "lucide-react";
import GameAvatar from "../../../components/Games/Gameavatar";
import useGameAudio from "../../../components/Games/Usegameaudio";

// ── Menu + recipes ────────────────────────────────────────────────────────────
const MENU = {
  burger:     { emoji: "🍔", steps: ["bun","patty","cheese","lettuce","cook","serve"], time: 18, price: 80  },
  pizza:      { emoji: "🍕", steps: ["dough","sauce","cheese","pepperoni","bake","serve"], time: 22, price: 100 },
  milkshake:  { emoji: "🥤", steps: ["milk","icecream","syrup","blend","serve"], time: 14, price: 60  },
  coffee:     { emoji: "☕", steps: ["grind","brew","pour","serve"], time: 10, price: 40  },
  pasta:      { emoji: "🍝", steps: ["pasta","sauce","parmesan","boil","serve"], time: 20, price: 90  },
  salad:      { emoji: "🥗", steps: ["lettuce","tomato","cucumber","dressing","serve"], time: 12, price: 50  },
  hotdog:     { emoji: "🌭", steps: ["bun","sausage","mustard","serve"], time: 8,  price: 35  },
  icecream:   { emoji: "🍦", steps: ["cone","scoop","topping","serve"], time: 9,  price: 45  },
};

const CUSTOMER_NAMES = ["Alex","Priya","Ravi","Meena","Tom","Sara","Anil","Neha","Dev","Kiran"];
const FIRE_WORDS = ["extinguish","water","fire","stop"];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

let _cid = 0;
function makeCustomer(level) {
  const dishes = Object.keys(MENU);
  // Higher level = more complex dishes
  const available = level < 2 ? ["burger","milkshake","coffee","hotdog"]
    : level < 4 ? dishes.slice(0, 5)
    : dishes;
  const dish = rnd(available);
  const recipe = MENU[dish];
  const patience = Math.max(12000, recipe.time * 1000 - level * 500);
  return {
    id: ++_cid,
    name: rnd(CUSTOMER_NAMES),
    dish,
    recipe,
    patience,
    maxPatience: patience,
    arrived: Date.now(),
    angry: false,
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

// Per-char word display
function TypeWord({ word, typedLen, shake, color }) {
  if (!word) return null;
  return (
    <span className={`skrt-type-word${shake ? " sktd-shake" : ""}`} style={{ "--wc": color || "var(--skg-cyan)" }}>
      {word.split("").map((ch, i) => (
        <span key={i} className={
          i < typedLen       ? "sktd-ch-done"
          : i === typedLen   ? "sktd-ch-current skrt-ch-big"
          : "sktd-ch-pending"
        }>{ch}</span>
      ))}
    </span>
  );
}

// Customer card
function CustomerCard({ customer, isActive, onSelect }) {
  const pct = Math.max(0, Math.min((customer.patience / customer.maxPatience) * 100, 100));
  const patColor = pct > 60 ? "var(--skg-lime)" : pct > 30 ? "var(--skg-amber)" : "var(--skg-coral)";
  return (
    <div className={`skrt-customer${isActive ? " skrt-customer-active" : ""}${customer.angry ? " skrt-customer-angry" : ""}`}
      onClick={() => onSelect(customer.id)}>
      <div className="skrt-cust-top">
        <span className="skrt-cust-emoji">{customer.recipe.emoji}</span>
        <div>
          <div className="skrt-cust-name">{customer.name}</div>
          <div className="skrt-cust-dish">{customer.dish}</div>
        </div>
        <span className="skrt-cust-price" style={{ color: "var(--skg-lime)" }}>
          ₹{customer.recipe.price}
        </span>
      </div>
      <div className="skrt-patience-bar">
        <div className="skrt-patience-fill" style={{ width: `${pct}%`, background: patColor }}/>
      </div>
      {customer.angry && <div className="skrt-angry-label">😤 Impatient!</div>}
    </div>
  );
}

function Lobby({ onStart, onExit }) {
  return (
    <div className="skr-lobby">
      <div className="skr-lobby-card skrt-lobby-card">
        <div className="skr-lobby-title">🍔 Restaurant Rush</div>
        <p className="skr-lobby-sub">Take orders, cook dishes by typing ingredients, and serve before customers walk out!</p>
        <div className="skr-lobby-section">
          <div className="skr-lobby-label">Mode <Tip text="Multiplayer co-op restaurant mode coming soon!"/></div>
          <div className="skr-mode-pills">
            <button className="skr-mode-pill skr-mode-active"><Monitor size={14}/> Solo Chef</button>
            <button className="skr-mode-pill skr-mode-soon" disabled>
              <Users size={14}/> Co-op <span className="skr-soon-badge">Soon</span>
            </button>
          </div>
        </div>
        <div className="skrt-menu-preview">
          <div className="skr-lobby-label">Menu <Tip text="Type each ingredient step by step. Then type 'serve' to complete!"/></div>
          <div className="skrt-menu-grid">
            {Object.entries(MENU).slice(0, 4).map(([name, item]) => (
              <div key={name} className="skrt-menu-item">
                <span>{item.emoji}</span>
                <span>{name}</span>
                <span style={{ color: "var(--skg-lime)", fontSize: "0.7rem" }}>₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="skr-lobby-section">
          <div className="skr-lobby-label">Tips</div>
          <div className="skrt-tips-list">
            <div className="skrt-tip-item">🎯 Click a customer to take their order</div>
            <div className="skrt-tip-item">⌨️ Type each step of the recipe</div>
            <div className="skrt-tip-item">🔥 Type "extinguish" if kitchen catches fire!</div>
            <div className="skrt-tip-item">😤 Serve before patience runs out</div>
          </div>
        </div>
        <div className="skr-lobby-actions">
          <button className="skg-btn skg-btn-primary" onClick={onStart}>
            Open Restaurant! <ChevronRight size={16}/>
          </button>
          <button className="skg-btn skg-btn-ghost" onClick={onExit}>Back to Arcade</button>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function TypingRestaurantGame({
  avatar, difficulty, sessionSeconds, settings, onExit, onRestart, onFinish,
}) {
  const { play } = useGameAudio({
    packId:  settings?.soundPackId  ?? "retro",
    volume:  settings?.masterVolume ?? 0.7,
    enabled: settings?.soundOn      ?? true,
  });

  const [phase,        setPhase]        = useState("lobby");
  const [customers,    setCustomers]    = useState([]);
  const [activeId,     setActiveId]     = useState(null);
  const [stepIndex,    setStepIndex]    = useState(0);
  const [typedLen,     setTypedLen]     = useState(0);
  const [shake,        setShake]        = useState(false);
  const [score,        setScore]        = useState(0);
  const [combo,        setCombo]        = useState(0);
  const [served,       setServed]       = useState(0);
  const [lost,         setLost]         = useState(0);
  const [level,        setLevel]        = useState(1);
  const [timeLeft,     setTimeLeft]     = useState(sessionSeconds);
  const [fire,         setFire]         = useState(false);
  const [fireWord,     setFireWord]     = useState("");
  const [fireTyped,    setFireTyped]    = useState(0);
  const [avatarState,  setAvatarState]  = useState("idle");
  const [pulseKey,     setPulseKey]     = useState(0);
  const [rushHour,     setRushHour]     = useState(false);
  const [notifications,setNotifications]= useState([]);

  const hurtRef    = useRef(null);
  const finishedRef = useRef(false);
  const typedRef   = useRef(0);
  const fireTypedRef = useRef(0);
  const scoreRef   = useRef(0);
  const servedRef  = useRef(0);
  const lostRef    = useRef(0);
  const comboRef   = useRef(0);
  const levelRef   = useRef(1);
  const activeRef  = useRef(null);
  const stepRef    = useRef(0);
  const customersRef = useRef([]);
  const fireRef    = useRef(false);
  const fireWordRef = useRef("");

  const addNote = useCallback((msg, color) => {
    const id = Date.now();
    setNotifications((n) => [...n, { id, msg, color }]);
    setTimeout(() => setNotifications((n) => n.filter((x) => x.id !== id)), 2200);
  }, []);

  const flash = useCallback((s) => {
    setAvatarState(s);
    setPulseKey((k) => k + 1);
    clearTimeout(hurtRef.current);
    if (s !== "idle") hurtRef.current = setTimeout(() => setAvatarState("idle"), 280);
  }, []);

  const startGame = useCallback(() => {
    setCustomers([]); customersRef.current = [];
    setActiveId(null); activeRef.current = null;
    setStepIndex(0); stepRef.current = 0;
    setTypedLen(0); typedRef.current = 0;
    setScore(0); scoreRef.current = 0;
    setServed(0); servedRef.current = 0;
    setLost(0); lostRef.current = 0;
    setCombo(0); comboRef.current = 0;
    setLevel(1); levelRef.current = 1;
    setFire(false); fireRef.current = false;
    setFireWord(""); setFireTyped(0); fireTypedRef.current = 0;
    setRushHour(false);
    finishedRef.current = false;
    setNotifications([]);
    setPhase("playing");
  }, []);

  // Customer spawner
  useEffect(() => {
    if (phase !== "playing") return;
    const baseMs = Math.max(3500, 7000 - levelRef.current * 400);
    const spawnOne = () => {
      if (customersRef.current.length >= 5) return;
      const c = makeCustomer(levelRef.current);
      customersRef.current = [...customersRef.current, c];
      setCustomers([...customersRef.current]);
      addNote(`${c.name} wants a ${c.dish}!`, "var(--skg-cyan)");
    };
    spawnOne(); // immediate first
    const id = setInterval(spawnOne, rushHour ? baseMs * 0.5 : baseMs);
    return () => clearInterval(id);
  }, [phase, rushHour, addNote]);

  // Patience countdown
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      const now = Date.now();
      setCustomers((prev) => {
        const next = prev.map((c) => {
          const elapsed = now - c.arrived;
          const remaining = c.maxPatience - elapsed;
          if (remaining <= 0) {
            // Customer leaves
            if (!c.walkedOut) {
              lostRef.current += 1;
              setLost(lostRef.current);
              comboRef.current = 0;
              setCombo(0);
              addNote(`${c.name} left! 😤`, "var(--skg-coral)");
              play("wrong");
              if (activeRef.current === c.id) {
                activeRef.current = null;
                setActiveId(null);
                stepRef.current = 0;
                setStepIndex(0);
                typedRef.current = 0;
                setTypedLen(0);
              }
            }
            return { ...c, patience: 0, walkedOut: true, angry: true };
          }
          return { ...c, patience: remaining, angry: remaining < c.maxPatience * 0.3 };
        }).filter((c) => !c.walkedOut || c.id === activeRef.current);
        customersRef.current = next;
        return next;
      });
    }, 250);
    return () => clearInterval(id);
  }, [phase, addNote, play]);

  // Rush hour + fire events
  useEffect(() => {
    if (phase !== "playing") return;
    // Rush hour every 45s
    const rushId = setInterval(() => {
      setRushHour(true);
      addNote("🔥 RUSH HOUR! Orders coming fast!", "var(--skg-amber)");
      setTimeout(() => { setRushHour(false); }, 15000);
    }, 45000);
    // Kitchen fire every 60s
    const fireId = setInterval(() => {
      if (fireRef.current) return;
      const fw = rnd(FIRE_WORDS);
      fireRef.current = true;
      fireWordRef.current = fw;
      setFire(true);
      setFireWord(fw);
      fireTypedRef.current = 0;
      setFireTyped(0);
      addNote("🔥 KITCHEN FIRE! Type the word!", "var(--skg-coral)");
      play("wrong");
    }, 60000);
    // Level up every 30s
    const levelId = setInterval(() => {
      levelRef.current += 1;
      setLevel(levelRef.current);
      addNote(`⬆️ Level ${levelRef.current}! More dishes available.`, "var(--skg-violet)");
      play("levelUp");
    }, 30000);
    return () => { clearInterval(rushId); clearInterval(fireId); clearInterval(levelId); };
  }, [phase, addNote, play]);

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

  // Active customer recipe
  const activeCustomer = customers.find((c) => c.id === activeId);
  const currentStep = activeCustomer?.recipe.steps[stepIndex] ?? null;

  // Keyboard
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e) => {
      if (e.key.length !== 1) return;
      e.preventDefault();

      // Fire mode overrides everything
      if (fireRef.current) {
        const fw = fireWordRef.current;
        const idx = fireTypedRef.current;
        if (e.key.toLowerCase() === fw[idx]?.toLowerCase()) {
          const newLen = idx + 1;
          fireTypedRef.current = newLen;
          setFireTyped(newLen);
          play("bite");
          if (newLen >= fw.length) {
            fireRef.current = false;
            setFire(false);
            setFireWord(""); setFireTyped(0); fireTypedRef.current = 0;
            addNote("🧯 Fire extinguished!", "var(--skg-cyan)");
            flash("eat");
            play("eat");
          }
        } else {
          setShake(true); setTimeout(() => setShake(false), 300);
          flash("hurt"); play("wrong");
          // Fire damage
          scoreRef.current = Math.max(0, scoreRef.current - 10);
          setScore(scoreRef.current);
        }
        return;
      }

      if (!currentStep || !activeCustomer) return;
      const idx = typedRef.current;
      if (e.key.toLowerCase() === currentStep[idx]?.toLowerCase()) {
        const newLen = idx + 1;
        typedRef.current = newLen;
        setTypedLen(newLen);
        flash("bite");
        play("bite");

        if (newLen >= currentStep.length) {
          const nextStep = stepIndex + 1;
          if (nextStep >= activeCustomer.recipe.steps.length) {
            // Dish complete!
            comboRef.current += 1;
            setCombo(comboRef.current);
            const patienceBonus = Math.round((activeCustomer.patience / activeCustomer.maxPatience) * 50);
            const pts = activeCustomer.recipe.price + patienceBonus + comboRef.current * 10;
            scoreRef.current += pts;
            setScore(scoreRef.current);
            servedRef.current += 1;
            setServed(servedRef.current);
            addNote(`✅ ${activeCustomer.name} served! +${pts} pts`, "var(--skg-lime)");
            flash("eat");
            play("eat");
            // Remove customer
            customersRef.current = customersRef.current.filter((c) => c.id !== activeId);
            setCustomers([...customersRef.current]);
            activeRef.current = null;
            setActiveId(null);
            stepRef.current = 0;
            setStepIndex(0);
            typedRef.current = 0;
            setTypedLen(0);
          } else {
            stepRef.current = nextStep;
            setStepIndex(nextStep);
            typedRef.current = 0;
            setTypedLen(0);
          }
        }
      } else {
        setShake(true); setTimeout(() => setShake(false), 300);
        comboRef.current = 0; setCombo(0);
        flash("hurt"); play("wrong");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, currentStep, activeCustomer, stepIndex, activeId, addNote, flash, play]);

  const handleSelectCustomer = (id) => {
    if (fireRef.current) return; // can't take orders during fire
    activeRef.current = id;
    setActiveId(id);
    stepRef.current = 0;
    setStepIndex(0);
    typedRef.current = 0;
    setTypedLen(0);
  };

  // Emit result
  useEffect(() => {
    if (phase !== "over" || finishedRef.current) return;
    finishedRef.current = true;
    onFinish?.({
      gameId: "typing-restaurant",
      score: scoreRef.current,
      maxCombo: comboRef.current,
      wordsCompleted: servedRef.current,
      mistakes: lostRef.current,
    });
  }, [phase]);

  if (phase === "lobby") return <div className="skg-game skg-restaurant"><Lobby onStart={startGame} onExit={onExit}/></div>;

  const timerColor = timeLeft <= 10 ? "var(--skg-coral)" : timeLeft <= 20 ? "var(--skg-amber)" : undefined;
  const stars = served >= 20 ? 3 : served >= 10 ? 2 : served >= 5 ? 1 : 0;

  return (
    <div className={`skg-game skg-restaurant${rushHour ? " skrt-rush-mode" : ""}`}>
      {/* Fire overlay */}
      {fire && (
        <div className="skrt-fire-overlay">
          <div className="skrt-fire-modal">
            <div className="skrt-fire-icon">🔥🔥🔥</div>
            <div className="skrt-fire-title">KITCHEN FIRE!</div>
            <div className="skrt-fire-word">
              <TypeWord word={fireWord} typedLen={fireTyped} shake={shake} color="var(--skg-coral)"/>
            </div>
            <div className="skrt-fire-hint">Type the word above to extinguish!</div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="skrt-notifications">
        {notifications.map((n) => (
          <div key={n.id} className="skrt-notif" style={{ borderColor: n.color, color: n.color }}>{n.msg}</div>
        ))}
      </div>

      {/* HUD */}
      <div className="skg-hud">
        <button className="skg-icon-btn" onClick={onExit}><X size={18}/></button>
        <div className="skg-hud-stat" style={{ color: "var(--skg-lime)" }}><Trophy size={14}/> {score}</div>
        <div className="skg-hud-stat skg-hud-combo">×{combo}</div>
        <div className="skg-hud-stat">✅ {served} served</div>
        <div className="skg-hud-stat skrt-level-badge">⬆️ Lv {level}</div>
        {rushHour && <div className="skg-hud-stat skrt-rush-badge">🔥 RUSH!</div>}
        <div className="skg-hud-timer" style={{ color: timerColor }}>{timeLeft}s</div>
      </div>

      {/* Main layout */}
      <div className="skrt-layout">
        {/* Customer queue */}
        <div className="skrt-customer-col">
          <div className="skrt-col-title">
            👥 Customers ({customers.length})
            <Tip text="Click a customer to take their order. Serve them before patience runs out!"/>
          </div>
          {customers.length === 0 && (
            <div className="skrt-empty-queue">Waiting for customers…</div>
          )}
          {customers.map((c) => (
            <CustomerCard key={c.id} customer={c} isActive={c.id === activeId}
              onSelect={handleSelectCustomer}/>
          ))}
        </div>

        {/* Cooking station */}
        <div className="skrt-cook-col">
          <div className="skrt-col-title">
            👨‍🍳 Kitchen Station
            <Tip text="Type each step of the recipe in order. The highlighted letter is next!"/>
          </div>

          {activeCustomer ? (
            <div className="skrt-station">
              <div className="skrt-order-header">
                <span className="skrt-order-emoji">{activeCustomer.recipe.emoji}</span>
                <div>
                  <div className="skrt-order-name">{activeCustomer.name}'s {activeCustomer.dish}</div>
                  <div className="skrt-order-price">₹{activeCustomer.recipe.price}</div>
                </div>
              </div>

              {/* Recipe steps */}
              <div className="skrt-steps">
                {activeCustomer.recipe.steps.map((step, i) => (
                  <div key={i} className={`skrt-step${i < stepIndex ? " skrt-step-done" : i === stepIndex ? " skrt-step-active" : ""}`}>
                    <span className="skrt-step-num">{i + 1}</span>
                    {i === stepIndex ? (
                      <TypeWord word={step} typedLen={typedLen} shake={shake} color="var(--skg-cyan)"/>
                    ) : (
                      <span className="skrt-step-word">{step}</span>
                    )}
                    {i < stepIndex && <span className="skrt-step-check">✓</span>}
                  </div>
                ))}
              </div>

              {/* Current step big display */}
              {currentStep && (
                <div className="skrt-current-step">
                  <div className="skrt-current-label">Type now:</div>
                  <div className="skrt-current-word">
                    <TypeWord word={currentStep} typedLen={typedLen} shake={shake} color="var(--skg-cyan)"/>
                  </div>
                  <div className="skrt-progress-row">
                    Step {stepIndex + 1} of {activeCustomer.recipe.steps.length}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="skrt-no-order">
              <div className="skrt-no-order-icon">👆</div>
              <div>Click a customer to take their order</div>
            </div>
          )}

          {/* Avatar */}
          <div className="skrt-avatar-row">
            <GameAvatar avatar={avatar} state={avatarState} pulseKey={pulseKey}
              comboLevel={Math.min(Math.floor(combo / 3), 3)} size={70}
              reduceMotion={settings?.reduceMotion}/>
            <div className="skrt-chef-status">
              {rushHour ? "😰 Rush hour!" : fire ? "🔥 FIRE!" : combo > 5 ? "🔥 On fire!" : "👨‍🍳 Ready!"}
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div className="skrt-stats-col">
          <div className="skrt-col-title">📊 Stats</div>
          <div className="skrt-stat-item"><span>⭐</span><span>{stars === 3 ? "⭐⭐⭐" : stars === 2 ? "⭐⭐" : stars === 1 ? "⭐" : "—"} Rating</span></div>
          <div className="skrt-stat-item"><span>✅</span><span>{served} served</span></div>
          <div className="skrt-stat-item"><span>😤</span><span>{lost} walked out</span></div>
          <div className="skrt-stat-item"><span>🔥</span><span>×{combo} combo</span></div>
          <div className="skrt-stat-item"><span>⬆️</span><span>Level {level}</span></div>
          {rushHour && <div className="skrt-rush-notice">🔥 RUSH HOUR ACTIVE</div>}
        </div>
      </div>

      {/* Result */}
      {phase === "over" && (
        <div className="skg-overlay">
          <div className="skg-overlay-card skrt-result-card">
            <div className="skrt-result-stars">
              {"⭐".repeat(stars) || "😔"}
            </div>
            <div className="skg-overlay-title">Restaurant Closed!</div>
            <div className="skg-overlay-score">{score}</div>
            <div className="skg-overlay-sub">pts · {served} dishes served</div>
            <div className="skm-stat-grid">
              <div className="skm-stat-cell"><span className="skm-stat-label">Served</span><span className="skm-stat-val skm-stat-acc">{served}</span></div>
              <div className="skm-stat-cell"><span className="skm-stat-label">Walked out</span><span className="skm-stat-val skm-stat-mistakes">{lost}</span></div>
              <div className="skm-stat-cell"><span className="skm-stat-label">Best combo</span><span className="skm-stat-val">×{combo}</span></div>
              <div className="skm-stat-cell"><span className="skm-stat-label">Level reached</span><span className="skm-stat-val">{level}</span></div>
            </div>
            <div className="skg-overlay-actions">
              <button className="skg-btn skg-btn-primary" onClick={onRestart}><RotateCcw size={15}/> Open Again</button>
              <button className="skg-btn skg-btn-ghost" onClick={onExit}>Back to Arcade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}