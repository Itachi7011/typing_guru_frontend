// ============================================================================
// AnimatedBackground.jsx
// Animated backgrounds with moving elements (stars, clouds, particles, etc.)
// Each theme has CSS-driven parallax layers that always stay in motion.
// ============================================================================
import React, { useEffect, useRef, useMemo } from "react";

export const BG_THEMES = [
  { id: "space",        label: "Space",        desc: "Stars & nebula"       },
  { id: "forest",       label: "Forest",       desc: "Trees & fireflies"    },
  { id: "city",         label: "Neon City",    desc: "Rain & lights"        },
  { id: "volcano",      label: "Volcano",      desc: "Embers & lava"        },
  { id: "ocean",        label: "Ocean",        desc: "Waves & bubbles"      },
  { id: "arctic",       label: "Arctic",       desc: "Snow & aurora"        },
  { id: "arcade",       label: "Arcade",       desc: "Retro pixel grid"     },
  { id: "sakura",       label: "Sakura",       desc: "Petals & bloom"       },
  { id: "custom",       label: "Custom",       desc: "Your own image"       },
];

// ── Particle generator ────────────────────────────────────────────────────────
function makeParticles(n, theme) {
  return Array.from({ length: n }, (_, i) => ({
    id:    i,
    x:     Math.random() * 100,
    y:     Math.random() * 100,
    size:  Math.random() * 4 + 1,
    speed: Math.random() * 20 + 8,
    delay: Math.random() * 6,
    opacity: Math.random() * 0.7 + 0.2,
    drift: (Math.random() - 0.5) * 30,
  }));
}

// ── Theme layer renderer ──────────────────────────────────────────────────────
function SpaceBg() {
  const stars = useMemo(() => makeParticles(60, "space"), []);
  const shooting = useMemo(() => makeParticles(4, "space"), []);
  return (
    <div className="abg-space">
      {/* Static star field */}
      {stars.map((s) => (
        <div key={s.id} className="abg-star" style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          opacity: s.opacity,
          animationDuration: `${s.speed}s`,
          animationDelay: `${s.delay}s`,
        }}/>
      ))}
      {/* Shooting stars */}
      {shooting.map((s) => (
        <div key={`sh${s.id}`} className="abg-shooting-star" style={{
          left: `${s.x}%`, top: `${s.y * 0.4}%`,
          animationDuration: `${3 + s.delay}s`,
          animationDelay: `${s.delay * 2 + 2}s`,
        }}/>
      ))}
      {/* Nebula blobs */}
      <div className="abg-nebula abg-nebula-1"/>
      <div className="abg-nebula abg-nebula-2"/>
      <div className="abg-nebula abg-nebula-3"/>
    </div>
  );
}

function ForestBg() {
  const fireflies = useMemo(() => makeParticles(18, "forest"), []);
  return (
    <div className="abg-forest">
      {/* Ground layers */}
      <div className="abg-forest-far"/>
      <div className="abg-forest-mid"/>
      <div className="abg-forest-near"/>
      {/* Fireflies */}
      {fireflies.map((f) => (
        <div key={f.id} className="abg-firefly" style={{
          left: `${f.x}%`, top: `${f.y * 0.6 + 20}%`,
          animationDuration: `${f.speed}s`,
          animationDelay: `${f.delay}s`,
        }}/>
      ))}
      {/* Floating leaves */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={`l${i}`} className="abg-leaf" style={{
          left: `${10 + i * 11}%`,
          animationDuration: `${8 + i * 1.2}s`,
          animationDelay: `${i * 0.8}s`,
        }}/>
      ))}
    </div>
  );
}

function CityBg() {
  const rainDrops = useMemo(() => makeParticles(40, "city"), []);
  return (
    <div className="abg-city">
      {/* Skyline silhouette */}
      <div className="abg-city-skyline"/>
      {/* Neon window lights */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="abg-window" style={{
          left: `${4 + (i % 10) * 10}%`,
          bottom: `${15 + Math.floor(i / 10) * 12}%`,
          animationDelay: `${Math.random() * 3}s`,
        }}/>
      ))}
      {/* Rain */}
      {rainDrops.map((r) => (
        <div key={r.id} className="abg-raindrop" style={{
          left: `${r.x}%`,
          animationDuration: `${0.4 + r.delay * 0.15}s`,
          animationDelay: `${r.delay * 0.3}s`,
          height: `${8 + r.size * 4}px`,
        }}/>
      ))}
      {/* Car headlights streak */}
      <div className="abg-car-light abg-car-1"/>
      <div className="abg-car-light abg-car-2"/>
    </div>
  );
}

function VolcanoBg() {
  const embers = useMemo(() => makeParticles(30, "volcano"), []);
  return (
    <div className="abg-volcano">
      <div className="abg-volcano-sky"/>
      <div className="abg-volcano-mountain"/>
      <div className="abg-lava-glow"/>
      {/* Lava flow */}
      <div className="abg-lava-stream abg-lava-1"/>
      <div className="abg-lava-stream abg-lava-2"/>
      {/* Embers */}
      {embers.map((e) => (
        <div key={e.id} className="abg-ember" style={{
          left: `${e.x}%`, bottom: `${10 + Math.random() * 20}%`,
          width: e.size + 1, height: e.size + 1,
          animationDuration: `${e.speed * 0.5}s`,
          animationDelay: `${e.delay}s`,
          "--ember-drift": `${e.drift}px`,
        }}/>
      ))}
    </div>
  );
}

function OceanBg() {
  const bubbles = useMemo(() => makeParticles(20, "ocean"), []);
  return (
    <div className="abg-ocean">
      <div className="abg-ocean-sky"/>
      {/* Waves */}
      <div className="abg-wave abg-wave-1"/>
      <div className="abg-wave abg-wave-2"/>
      <div className="abg-wave abg-wave-3"/>
      {/* Bubbles */}
      {bubbles.map((b) => (
        <div key={b.id} className="abg-bubble" style={{
          left: `${b.x}%`, bottom: `${b.y * 0.3}%`,
          width: b.size * 3, height: b.size * 3,
          animationDuration: `${b.speed}s`,
          animationDelay: `${b.delay}s`,
        }}/>
      ))}
      {/* Fish */}
      <div className="abg-fish abg-fish-1"/>
      <div className="abg-fish abg-fish-2"/>
    </div>
  );
}

function ArcticBg() {
  const snowflakes = useMemo(() => makeParticles(35, "arctic"), []);
  return (
    <div className="abg-arctic">
      <div className="abg-aurora abg-aurora-1"/>
      <div className="abg-aurora abg-aurora-2"/>
      <div className="abg-aurora abg-aurora-3"/>
      <div className="abg-snow-ground"/>
      {snowflakes.map((s) => (
        <div key={s.id} className="abg-snowflake" style={{
          left: `${s.x}%`,
          width: s.size + 2, height: s.size + 2,
          animationDuration: `${s.speed}s`,
          animationDelay: `${s.delay}s`,
          "--snow-drift": `${s.drift}px`,
        }}>❄</div>
      ))}
    </div>
  );
}

function ArcadeBg() {
  return (
    <div className="abg-arcade">
      <div className="abg-pixel-grid"/>
      <div className="abg-scanline"/>
      {/* Floating score numbers */}
      {["100","200","50","500","10"].map((n, i) => (
        <div key={i} className="abg-score-float" style={{
          left: `${15 + i * 18}%`,
          top: `${20 + (i % 3) * 20}%`,
          animationDelay: `${i * 1.2}s`,
        }}>+{n}</div>
      ))}
      {/* Pac-dots row */}
      <div className="abg-dot-row">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="abg-dot" style={{ animationDelay: `${i * 0.15}s` }}/>
        ))}
      </div>
    </div>
  );
}

function SakuraBg() {
  const petals = useMemo(() => makeParticles(25, "sakura"), []);
  return (
    <div className="abg-sakura">
      <div className="abg-sakura-sky"/>
      <div className="abg-sakura-tree abg-tree-l"/>
      <div className="abg-sakura-tree abg-tree-r"/>
      {petals.map((p) => (
        <div key={p.id} className="abg-petal" style={{
          left: `${p.x}%`,
          animationDuration: `${p.speed}s`,
          animationDelay: `${p.delay}s`,
          "--petal-drift": `${p.drift}px`,
          opacity: p.opacity,
        }}>🌸</div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AnimatedBackground({ theme = "space", customUrl, children, dim = 0.55 }) {
  const BG_MAP = {
    space: SpaceBg, forest: ForestBg, city: CityBg,
    volcano: VolcanoBg, ocean: OceanBg, arctic: ArcticBg,
    arcade: ArcadeBg, sakura: SakuraBg,
  };
  const BgComp = BG_MAP[theme] || SpaceBg;

  return (
    <div className="abg-root">
      {/* Animated layer */}
      <div className="abg-layer">
        {customUrl ? (
          <div className="abg-custom" style={{ backgroundImage: `url(${customUrl})` }}/>
        ) : (
          <BgComp/>
        )}
      </div>
      {/* Dim overlay so game content stays readable */}
      <div className="abg-dim" style={{ opacity: dim }}/>
      {/* Game content */}
      <div className="abg-content">{children}</div>
    </div>
  );
}