// ============================================================================
// NextKeyBeacon.jsx
// ----------------------------------------------------------------------------
// Stands in for the old hand-gesture visualizer on the games page. Instead
// of showing which finger to use, it shows a small glowing key-cap hovering
// near the avatar's mouth with the next character to type — clearer at a
// glance during fast-paced gameplay, and themeable per avatar via `accent`.
// ============================================================================
import React from "react";

export default function NextKeyBeacon({ nextChar, accent = "#22e6c5", visible = true }) {
  if (!visible || !nextChar) return null;
  const display = nextChar === " " ? "␣" : nextChar.toUpperCase();
  return (
    <div className="skg-beacon" style={{ "--skg-beacon-accent": accent }}>
      <span className="skg-beacon-ring" />
      <span className="skg-beacon-key">{display}</span>
    </div>
  );
}