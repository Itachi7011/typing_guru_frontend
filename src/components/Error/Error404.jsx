import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import {
  Home,
  ArrowLeft,
  Keyboard,
  RotateCcw,
  Sun,
  Moon,
  Compass,
} from "lucide-react";

// Phrase that gets "mistyped" into the 404 message
const TARGET = "this page doesn't exist";
// What actually gets typed out (with intentional typo) before correcting
const TYPED_SEQUENCE = "this paeg doesnt exist";

export default function Error404() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [typed, setTyped] = useState("");
  const [errIndexes, setErrIndexes] = useState([]);
  const [phase, setPhase] = useState("typing"); // typing | done
  const timeoutRef = useRef(null);

  useEffect(() => {
    let i = 0;
    const errorPositions = new Set([8, 9, 17, 18]); // "pa[eg]" + "doesn[t]" approx

    function tick() {
      if (i <= TYPED_SEQUENCE.length) {
        setTyped(TYPED_SEQUENCE.slice(0, i));
        if (errorPositions.has(i - 1)) {
          setErrIndexes((prev) => [...prev, i - 1]);
        }
        i++;
        timeoutRef.current = setTimeout(tick, i < 6 ? 90 : 55);
      } else {
        timeoutRef.current = setTimeout(() => setPhase("done"), 600);
      }
    }
    tick();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className={`sk-404-root ${isDarkMode ? "dark" : "light"}`}>
      <button
        className="sk-404-theme-btn"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="sk-404-bg-grid" aria-hidden="true" />

      <main className="sk-404-main">
        <div className="sk-404-content">
          <div className="sk-404-eyebrow">
            <Keyboard size={14} />
            <span>SwiftKeys</span>
          </div>

          {/* Big 404 with typing caret styling */}
          <div className="sk-404-code">
            4<span className="sk-404-code-zero">0</span>4
          </div>

          {/* Live "typed" line with error highlighting like the typing test */}
          <div className="sk-404-typeline" aria-live="polite">
            <span className="sk-404-typeline-text">
              {phase === "typing"
                ? typed.split("").map((ch, idx) => (
                    <span
                      key={idx}
                      className={
                        errIndexes.includes(idx)
                          ? "sk-404-ch-err"
                          : "sk-404-ch-ok"
                      }
                    >
                      {ch}
                    </span>
                  ))
                : TARGET.split("").map((ch, idx) => (
                    <span key={idx} className="sk-404-ch-ok">
                      {ch}
                    </span>
                  ))}
              <span className="sk-404-caret" />
            </span>
          </div>

          <p className="sk-404-desc">
            {phase === "done"
              ? "The route you typed doesn't map to a page here. Let's get your fingers back on the home row."
              : "Looks like a typo slipped through…"}
          </p>

          <div className="sk-404-actions">
            <button
              className="sk-404-btn sk-404-btn-primary"
              onClick={() => navigate("/")}
            >
              <Home size={16} />
              Back to Home
            </button>
            <button
              className="sk-404-btn sk-404-btn-secondary"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
            <button
              className="sk-404-btn sk-404-btn-secondary"
              onClick={() => window.location.reload()}
            >
              <RotateCcw size={16} />
              Retry
            </button>
          </div>

          <div className="sk-404-suggest">
            <Compass size={13} />
            <span>
              Try{" "}
              <button
                className="sk-404-link"
                onClick={() => navigate("/drills")}
              >
                Drills
              </button>
              ,{" "}
              <button
                className="sk-404-link"
                onClick={() => navigate("/daily-challenge")}
              >
                Daily Challenge
              </button>{" "}
              or{" "}
              <button
                className="sk-404-link"
                onClick={() => navigate("/exam-practice")}
              >
                Exam Practice
              </button>
            </span>
          </div>
        </div>

        {/* Decorative floating keys */}
        <div className="sk-404-keys" aria-hidden="true">
          <span className="sk-404-key sk-404-key-1">⌫</span>
          <span className="sk-404-key sk-404-key-2">404</span>
          <span className="sk-404-key sk-404-key-3">esc</span>
          <span className="sk-404-key sk-404-key-4">?</span>
        </div>
      </main>
    </div>
  );
}