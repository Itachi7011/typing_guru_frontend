import React, { useMemo, useState, useEffect } from "react";

// Comprehensive finger mapping for all character types
const FINGER_KEY_MAP = {
  // Left hand
  left_pinky: [
    // English lowercase
    "q",
    "a",
    "z",
    // English uppercase (Shift + key)
    "Q",
    "A",
    "Z",
    // Numbers & Symbols
    "1",
    "`",
    "~",
    "!",
    // Hindi
    "क",
    "का",
    "कि",
    "की",
    "कु",
    "कू",
    "के",
    "कै",
    "को",
    "कौ",
    "़",
    "ऽ",
    "ॐ",
  ],
  left_ring: [
    "w",
    "s",
    "x",
    "W",
    "S",
    "X",
    "2",
    "@",
    "ख",
    "खा",
    "खि",
    "खी",
    "खु",
    "खू",
    "खे",
    "खै",
    "खो",
    "खौ",
  ],
  left_middle: [
    "e",
    "d",
    "c",
    "E",
    "D",
    "C",
    "3",
    "#",
    "ग",
    "गा",
    "गि",
    "गी",
    "गु",
    "गू",
    "गे",
    "गै",
    "गो",
    "गौ",
  ],
  left_index: [
    "r",
    "f",
    "v",
    "t",
    "g",
    "b",
    "R",
    "F",
    "V",
    "T",
    "G",
    "B",
    "4",
    "5",
    "$",
    "%",
    "(",
    "[",
    "{",
    "घ",
    "च",
    "छ",
    "ज",
    "झ",
    "ञ",
    "ट",
    "ठ",
    "ड",
    "ढ",
    "ण",
    "त",
    "था",
    "ति",
    "ती",
    "तु",
    "तू",
    "ते",
    "तै",
    "तो",
    "तौ",
  ],

  // Right hand
  right_index: [
    "y",
    "h",
    "n",
    "u",
    "j",
    "m",
    "Y",
    "H",
    "N",
    "U",
    "J",
    "M",
    "6",
    "7",
    "^",
    "&",
    ")",
    "]",
    "}",
    "_",
    "थ",
    "द",
    "ध",
    "न",
    "प",
    "फ",
    "ब",
    "भ",
    "म",
    "य",
    "र",
    "ला",
    "लि",
    "ली",
    "लु",
    "लू",
    "ले",
    "लै",
    "लो",
    "लौ",
  ],
  right_middle: [
    "i",
    "k",
    ",",
    "I",
    "K",
    "<",
    "8",
    "*",
    "र",
    "रा",
    "रि",
    "री",
    "रु",
    "रू",
    "रे",
    "रै",
    "रो",
    "रौ",
  ],
  right_ring: [
    "o",
    "l",
    ".",
    "O",
    "L",
    ">",
    "9",
    "(",
    "व",
    "श",
    "ष",
    "स",
    "ह",
    "क्ष",
    "त्र",
    "ज्ञ",
  ],
  right_pinky: [
    "p",
    ";",
    "/",
    "[",
    "]",
    "\\",
    "P",
    ":",
    "?",
    "{",
    "}",
    "|",
    "0",
    ")",
    "-",
    "_",
    "=",
    "+",
    '"',
    "ड़",
    "ढ़",
    "ृ",
    "ॄ",
    "ॅ",
    "ॉ",
    "ॆ",
    "े",
    "ै",
    "ो",
    "ौ",
    "्",
  ],
  thumbs: [" ", "\n", "\t", "।", "॥"],
};

// Keys that require Shift
const SHIFT_REQUIRED = {
  // Uppercase letters
  Q: "q",
  W: "w",
  E: "e",
  R: "r",
  T: "t",
  Y: "y",
  U: "u",
  I: "i",
  O: "o",
  P: "p",
  A: "a",
  S: "s",
  D: "d",
  F: "f",
  G: "g",
  H: "h",
  J: "j",
  K: "k",
  L: "l",
  Z: "z",
  X: "x",
  C: "c",
  V: "v",
  B: "b",
  N: "n",
  M: "m",
  // Symbols that need Shift
  "~": "`",
  "!": "1",
  "@": "2",
  "#": "3",
  $: "4",
  "%": "5",
  "^": "6",
  "&": "7",
  "*": "8",
  "(": "9",
  ")": "0",
  _: "-",
  "+": "=",
  "{": "[",
  "}": "]",
  "|": "\\",
  ":": ";",
  '"': "'",
  "<": ",",
  ">": ".",
  "?": "/",
};

// Shift key side (left or right shift)
const getShiftSide = (key) => {
  // Left shift typically handles right hand keys, right shift handles left hand keys
  const leftHandKeys = [
    "q",
    "w",
    "e",
    "r",
    "t",
    "a",
    "s",
    "d",
    "f",
    "g",
    "z",
    "x",
    "c",
    "v",
    "b",
  ];
  const lowerKey = key.toLowerCase();
  return leftHandKeys.includes(lowerKey) ? "right" : "left";
};

function getFingerForKey(key) {
  if (!key) return null;

  for (const [finger, keys] of Object.entries(FINGER_KEY_MAP)) {
    if (keys.includes(key)) return finger;
  }
  return null;
}

function needsShift(key) {
  return SHIFT_REQUIRED.hasOwnProperty(key);
}

function getShiftDisplay(key) {
  if (!needsShift(key)) return null;
  const isLeftShift = getShiftSide(key) === "left";
  return {
    side: isLeftShift ? "left" : "right",
    label: isLeftShift ? "← SHIFT" : "SHIFT →",
  };
}

// Get finger display name in multiple languages
function getFingerDisplayName(finger, language = "en") {
  const names = {
    left_pinky: { en: "Pinky", hi: "छोटी उंगली" },
    left_ring: { en: "Ring", hi: "अनामिका" },
    left_middle: { en: "Middle", hi: "मध्यमा" },
    left_index: { en: "Index", hi: "तर्जनी" },
    right_index: { en: "Index", hi: "तर्जनी" },
    right_middle: { en: "Middle", hi: "मध्यमा" },
    right_ring: { en: "Ring", hi: "अनामिका" },
    right_pinky: { en: "Pinky", hi: "छोटी उंगली" },
    thumbs: { en: "Thumb", hi: "अंगूठा" },
  };
  return names[finger]?.[language] || names[finger]?.en || finger;
}

// Beautiful hand diagram with animations
function HandDiagram({
  side,
  activeFinger,
  nextKey,
  isDarkMode,
  showShift,
  shiftSide,
}) {
  const isLeft = side === "left";
  const accent = "#7c6af7";
  const shiftColor = "#f59e0b";
  const accentGlow = "rgba(124, 106, 247, 0.4)";

  const bgColor = isDarkMode
    ? "linear-gradient(135deg, rgba(30,30,46,0.95), rgba(20,20,35,0.98))"
    : "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(245,245,250,0.98))";

  const fingerNames = isLeft
    ? ["pinky", "ring", "middle", "index", "thumb"]
    : ["index", "middle", "ring", "pinky", "thumb"];

  const fingerLabels = {
    pinky: "🖐️",
    ring: "💍",
    middle: "⚡",
    index: "👆",
    thumb: "👍",
  };

  const activeName = activeFinger?.replace(`${side}_`, "");
  const isShiftActive = showShift && shiftSide === side;

  return (
    <div
      className="hand-diagram"
      style={{
        background: bgColor,
        backdropFilter: "blur(10px)",
        borderRadius: "24px",
        padding: "20px 12px",
        textAlign: "center",
        width: "160px",
        boxShadow: isDarkMode
          ? "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)"
          : "0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
        position: "relative",
        animation: "handAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <style>{`
        @keyframes handAppear {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fingerPulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.05);
            filter: brightness(1.1);
          }
        }
        
        @keyframes keyFloat {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.8);
          }
          60% {
            opacity: 1;
            transform: translateY(-5px) scale(1.1);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes shiftPulse {
          0%, 100% {
            box-shadow: 0 0 5px ${shiftColor}, 0 0 10px rgba(245,158,11,0.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 20px ${shiftColor}, 0 0 30px rgba(245,158,11,0.6);
            transform: scale(1.02);
          }
        }
        
        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 5px ${accent}, 0 0 10px ${accentGlow};
          }
          50% {
            box-shadow: 0 0 15px ${accent}, 0 0 25px ${accentGlow};
          }
        }
        
        .finger {
          position: relative;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .finger.active {
          animation: fingerPulse 0.6s ease-in-out;
        }
        
        .key-badge {
          animation: keyFloat 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .shift-badge {
          animation: shiftPulse 0.5s ease-in-out infinite;
        }
        
        .hand-diagram {
          transition: all 0.3s ease;
        }
        
        .hand-diagram:hover {
          transform: translateY(-4px);
        }
      `}</style>

      {/* Shift key indicator */}
      {isShiftActive && (
        <div
          className="shift-badge"
          style={{
            position: "absolute",
            top: "-15px",
            left: "50%",
            transform: "translateX(-50%)",
            background: `linear-gradient(135deg, ${shiftColor}, ${shiftColor}dd)`,
            color: "white",
            borderRadius: "20px",
            padding: "4px 12px",
            fontSize: "11px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            boxShadow: `0 2px 8px rgba(245,158,11,0.4)`,
            border: "1px solid rgba(255,255,255,0.3)",
            zIndex: 10,
            letterSpacing: "1px",
          }}
        >
          {shiftSide === "left" ? "← HOLD SHIFT" : "HOLD SHIFT →"}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "16px",
          position: "relative",
        }}
      >
        {fingerNames.map((name, i) => {
          const active = activeName === name;
          const isThumb = name === "thumb";

          return (
            <div
              key={name}
              className={`finger ${active ? "active" : ""}`}
              style={{
                width: isThumb ? "28px" : "24px",
                height: isThumb ? "50px" : "85px",
                background: active
                  ? `linear-gradient(135deg, ${accent}, ${accent}dd)`
                  : isDarkMode
                    ? "linear-gradient(135deg, #2a2a3e, #222235)"
                    : "linear-gradient(135deg, #f0f0f5, #e8e8f0)",
                borderRadius: isThumb ? "16px" : "20px",
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                transform: active
                  ? "translateY(-8px) scale(1.08)"
                  : "translateY(0) scale(1)",
                boxShadow: active
                  ? `0 8px 20px ${accentGlow}, 0 0 0 2px rgba(255,255,255,0.3)`
                  : isDarkMode
                    ? "0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)"
                    : "0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingBottom: "12px",
                position: "relative",
                cursor: "default",
              }}
            >
              {/* Finger tip highlight */}
              {active && (
                <div
                  style={{
                    position: "absolute",
                    top: "4px",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "white",
                    opacity: 0.8,
                    animation: "glowPulse 1s infinite",
                  }}
                />
              )}

              {/* Key badge on active finger */}
              {active && nextKey && (
                <div
                  className="key-badge"
                  style={{
                    position: "absolute",
                    top: "-30px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
                    color: "white",
                    borderRadius: "12px",
                    padding: "4px 10px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    fontFamily: "monospace",
                    whiteSpace: "nowrap",
                    boxShadow: `0 4px 12px ${accentGlow}`,
                    border: "1px solid rgba(255,255,255,0.3)",
                    zIndex: 10,
                  }}
                >
                  {nextKey === " " ? "␣" : nextKey === "\n" ? "↵" : nextKey}
                </div>
              )}

              {/* Finger emoji */}
              <div
                style={{
                  fontSize: "16px",
                  marginBottom: "4px",
                  opacity: active ? 1 : 0.5,
                  filter: active ? "brightness(1.2)" : "none",
                }}
              >
                {fingerLabels[name]}
              </div>

              {/* Finger name */}
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: active ? "white" : isDarkMode ? "#888" : "#999",
                }}
              >
                {name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hand label */}
      <div
        style={{
          fontSize: "0.7rem",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "2px",
          color: isShiftActive
            ? shiftColor
            : activeFinger
              ? accent
              : isDarkMode
                ? "#666"
                : "#999",
          padding: "4px",
          borderRadius: "8px",
          transition: "color 0.3s",
        }}
      >
        {side === "left" ? "👈 LEFT HAND" : "RIGHT HAND 👉"}
      </div>
    </div>
  );
}

export default function HandVisualizer({
  nextChar,
  isDarkMode,
  visible,
  language = "en",
}) {
  const [prevChar, setPrevChar] = useState(null);

  const activeFinger = useMemo(() => {
    if (!nextChar || !visible) return null;
    return getFingerForKey(nextChar);
  }, [nextChar, visible]);

  const shiftInfo = useMemo(() => {
    if (!nextChar || !visible) return null;
    if (needsShift(nextChar)) {
      return getShiftDisplay(nextChar);
    }
    return null;
  }, [nextChar, visible]);

  // Trigger animation when character changes
  useEffect(() => {
    if (nextChar && nextChar !== prevChar) {
      setPrevChar(nextChar);
    }
  }, [nextChar, prevChar]);

  if (!visible) return null;

  const isLeftHand = activeFinger && activeFinger.startsWith("left");
  const isRightHand =
    activeFinger &&
    (activeFinger.startsWith("right") || activeFinger === "thumbs");
  const showShift = shiftInfo !== null;
  const shiftSide = shiftInfo?.side;

  // Get display character
  const displayChar =
    nextChar === " " ? "Space" : nextChar === "\n" ? "Enter" : nextChar;

  return (
    <div
    className="hv-root"
      style={{
        position: "fixed",
        top: "50%",
        left: 0,
        right: 0,
        transform: "translateY(-50%)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 40px",
        pointerEvents: "none",
        zIndex: 10000,
        
      }}
    >
      {/* Left hand container */}
      <div
        style={{
          opacity: isLeftHand || (showShift && shiftSide === "left") ? 1 : 0.5,
          transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform:
            isLeftHand || (showShift && shiftSide === "left")
              ? "translateX(0) scale(1)"
              : "translateX(-10px) scale(0.95)",
          filter:
            isLeftHand || (showShift && shiftSide === "left")
              ? "none"
              : "grayscale(0.3) blur(1px)",
        }}
      >
        <HandDiagram
          side="left"
          activeFinger={isLeftHand ? activeFinger : null}
          nextKey={isLeftHand ? nextChar : null}
          isDarkMode={isDarkMode}
          showShift={showShift && shiftSide === "left"}
          shiftSide="left"
        />
      </div>

      {/* Right hand container */}
      <div
        style={{
          opacity:
            isRightHand || (showShift && shiftSide === "right") ? 1 : 0.5,
          transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform:
            isRightHand || (showShift && shiftSide === "right")
              ? "translateX(0) scale(1)"
              : "translateX(10px) scale(0.95)",
          filter:
            isRightHand || (showShift && shiftSide === "right")
              ? "none"
              : "grayscale(0.3) blur(1px)",
        }}
      >
        <HandDiagram
          side="right"
          activeFinger={isRightHand ? activeFinger : null}
          nextKey={isRightHand ? nextChar : null}
          isDarkMode={isDarkMode}
          showShift={showShift && shiftSide === "right"}
          shiftSide="right"
        />
      </div>

      {/* Instruction hint */}
      <div
        style={{
          position: "absolute",
          bottom: "-80px",
          left: "50%",
          transform: "translateX(-50%)",
          background: isDarkMode
            ? "rgba(0,0,0,0.85)"
            : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          padding: "10px 20px",
          borderRadius: "30px",
          fontSize: "13px",
          color: isDarkMode ? "#ddd" : "#555",
          whiteSpace: "nowrap",
          fontFamily: "monospace",
          border: `1px solid ${isDarkMode ? "#444" : "#e0e0e0"}`,
          pointerEvents: "auto",
          cursor: "default",
          animation: "fadeInUp 0.5s ease",
          fontWeight: "bold",
          letterSpacing: "0.5px",
        }}
      >
        <style> 
          {`
            @keyframes fadeInUp {  
              from { 
                opacity: 0;
                transform: translateX(-50%) translateY(10px);
              } 
              to {
                opacity: 1; 
                transform: translateX(-50%) translateY(0);
              }
            }
          `}
        </style>
        {showShift ? (
          <span style={{ color: "#f59e0b" }}>
            ⬆️ HOLD {shiftSide?.toUpperCase()} SHIFT + Press "{displayChar}"
          </span>
        ) : nextChar ? (
          <span>
            🎯 Press "{displayChar}" with{" "}
            {activeFinger?.replace(/_/g, " ") || "correct finger"}
          </span>
        ) : (
          <span>💡 Start typing to see finger guidance</span>
        )}
      </div>
    </div>
  );
}
