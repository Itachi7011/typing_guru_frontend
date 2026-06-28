// ============================================================================
// GameAvatar.jsx  —  v2  (rich shapes, auras, eat-toward-mouth animation)
// ============================================================================
import React, { useEffect, useRef } from "react";

const ACCESSORY_CLASS = {
  antenna: "skg-acc-antenna",
  spikes: "skg-acc-spikes",
  spark: "skg-acc-spark",
  trail: "skg-acc-trail",
  horns: "skg-acc-horns",
  blossom: "skg-acc-blossom",
  lightning: "skg-acc-lightning",
  visor: "skg-acc-visor",
  eyepatch: "skg-acc-eyepatch",
  crown: "skg-acc-crown",
  rays: "skg-acc-rays",
  cloak: "skg-acc-cloak",
  none: "",
};

const AURA_CLASS = {
  fire: "skg-aura-fire",
  petal: "skg-aura-petal",
  lightning: "skg-aura-lightning",
  dark: "skg-aura-dark",
  space: "skg-aura-space",
  cyber: "skg-aura-cyber",
  ice: "skg-aura-ice",
  solar: "skg-aura-solar",
  void: "skg-aura-void",
};

const CRUMB_COUNTS = {
  stretch: 6,
  glitch: 4,
  implode: 8,
  burst: 10,
  phase: 5,
  flame: 8,
  bloom: 8,
  zap: 6,
  roar: 8,
  orbit: 6,
  freeze: 8,
  flare: 10,
};

export default function GameAvatar({
  avatar,
  state = "idle",
  pulseKey = 0,
  comboLevel = 0,
  size = 96,
  reduceMotion = false,
}) {
  if (!avatar) return null;
  const {
    primary,
    secondary,
    shape,
    accessory,
    aura,
    eatAnimation = "stretch",
  } = avatar;
  const crumbCount = CRUMB_COUNTS[eatAnimation] || 6;

  const isEating = state === "eat";
  const isBiting = state === "bite";
  const isHurt = state === "hurt";
  const isVictory = state === "victory";

  return (
    <div
      className={[
        "skg-avatar",
        `skg-avatar-${shape || "round"}`,
        `skg-avatar-${state}`,
        `skg-eat-${eatAnimation}`,
        reduceMotion ? "skg-avatar-static" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: size,
        height: size,
        "--skg-av-primary": primary,
        "--skg-av-secondary": secondary,
      }}
    >
      {/* Aura glow — always on, intensity scales with combo */}
      {aura && !reduceMotion && (
        <div
          className={`skg-avatar-aura ${AURA_CLASS[aura] || ""}`}
          style={{ opacity: 0.3 + Math.min(comboLevel / 3, 0.7) }}
        />
      )}

      {/* Combo glow ring */}
      {comboLevel > 0 && (
        <div
          className="skg-avatar-glow"
          style={{ opacity: Math.min(comboLevel / 3, 1) }}
        />
      )}

      {/* Main body */}
      <div className="skg-avatar-body">
        <span className="skg-avatar-eye skg-avatar-eye-l" />
        <span className="skg-avatar-eye skg-avatar-eye-r" />
        <span className="skg-avatar-mouth" />
        {accessory && accessory !== "none" && (
          <span
            className={`skg-avatar-accessory ${ACCESSORY_CLASS[accessory] || ""}`}
          />
        )}
      </div>

      {/* Eat particle burst — varies by eatAnimation type */}
      {isEating && !reduceMotion && (
        <div
          className={`skg-avatar-crumbs skg-crumbs-${eatAnimation}`}
          key={pulseKey}
        >
          {Array.from({ length: crumbCount }).map((_, i) => (
            <span key={i} className={`skg-crumb skg-crumb-${i}`} />
          ))}
        </div>
      )}

      {/* Hurt flash overlay */}
      {isHurt && !reduceMotion && (
        <div className="skg-hurt-flash" key={`hurt-${pulseKey}`} />
      )}

      {/* Victory sparkles */}
      {isVictory && !reduceMotion && (
        <div className="skg-victory-sparks" key={`vic-${pulseKey}`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`skg-vspark skg-vspark-${i}`} />
          ))}
        </div>
      )}
    </div>
  );
}
