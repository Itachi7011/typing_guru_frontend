// ============================================================================
// GameAvatar.jsx
// ----------------------------------------------------------------------------
// A small, fully CSS-driven "creature" used across every game. No images —
// shape + colour + a couple of decorative bits come from the avatar object
// (see GAME_AVATARS in gamesFallback.js), and the visible animation comes
// from the `state` prop: idle | bite | eat | hurt | victory.
//
// `pulseKey` should change (e.g. a counter incremented by the caller) every
// time the same state is re-triggered in a row, so the crumb-burst animation
// restarts instead of silently no-op'ing because the className didn't change.
// ============================================================================
import React from "react";

const ACCESSORY_CLASS = {
  antenna: "skg-acc-antenna",
  spikes: "skg-acc-spikes",
  spark: "skg-acc-spark",
  trail: "skg-acc-trail",
  none: "",
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
  const { primary, secondary, shape, accessory } = avatar;

  return (
    <div
      className={`skg-avatar skg-avatar-${shape} skg-avatar-${state}${
        reduceMotion ? " skg-avatar-static" : ""
      }`}
      style={{
        width: size,
        height: size,
        "--skg-av-primary": primary,
        "--skg-av-secondary": secondary,
      }}
    >
      {comboLevel > 0 && (
        <div className="skg-avatar-glow" style={{ opacity: Math.min(comboLevel / 3, 1) }} />
      )}
      <div className="skg-avatar-body">
        <span className="skg-avatar-eye skg-avatar-eye-l" />
        <span className="skg-avatar-eye skg-avatar-eye-r" />
        <span className="skg-avatar-mouth" />
        {accessory && accessory !== "none" && (
          <span className={`skg-avatar-accessory ${ACCESSORY_CLASS[accessory] || ""}`} />
        )}
      </div>
      {state === "eat" && !reduceMotion && (
        <div className="skg-avatar-crumbs" key={pulseKey}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className={`skg-crumb skg-crumb-${i}`} />
          ))}
        </div>
      )}
    </div>
  );
}