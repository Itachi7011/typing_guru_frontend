import React, { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import {
  BarChart2,
  TrendingUp,
  Target,
  Clock,
  Zap,
  Flame,
  Star,
  Activity,
  AlertCircle,
  Lock,
  Unlock,
  TreePine,
  List,
  Keyboard,
  Brain,
  ChevronUp,
  ChevronDown,
  Sun,
  Moon,
  ArrowLeft,
  Calendar,
  Award,
} from "lucide-react";
import { lsGet, LS_KEY, calcAccuracy } from "../../components/Fallback";

// ── Mini SVG line chart ───────────────────────────────────────────
const MiniLine = ({ data = [], color = "var(--an-accent)", h = 80 }) => {
  if (!data.length) return <div className="an-empty">No data yet</div>;
  const W = 400,
    P = 12;
  const max = Math.max(...data, 1),
    min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: P + (i / (data.length - 1 || 1)) * (W - P * 2),
    y: P + ((max - v) / range) * (h - P * 2),
  }));
  const area = `${pts.map((p) => `${p.x},${p.y}`).join(" ")} ${pts[pts.length - 1].x},${h} ${pts[0].x},${h}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${h}`}
      className="an-line-svg"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#aGrad)" />
      <polyline
        points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}
    </svg>
  );
};

// ── Bar chart ─────────────────────────────────────────────────────
const BarChartViz = ({ data = [], color = "var(--an-accent)" }) => {
  if (!data.length) return <div className="an-empty">No data yet</div>;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="an-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="an-bar-col">
          <div className="an-bar-track">
            <div
              className="an-bar-fill"
              style={{ height: `${(d.value / max) * 100}%`, background: color }}
            />
          </div>
          <span className="an-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div className={`an-stat-card an-c-${color}`}>
    <div className="an-stat-top">
      <div className="an-stat-icon">
        <Icon size={18} />
      </div>
      {trend !== undefined && (
        <div
          className={`an-trend ${trend >= 0 ? "an-trend-up" : "an-trend-down"}`}
        >
          {trend >= 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="an-stat-val">{value}</div>
    <div className="an-stat-label">{label}</div>
    {sub && <div className="an-stat-sub">{sub}</div>}
  </div>
);

// ── Ring ─────────────────────────────────────────────────────────
const Ring = ({ value, max = 100, size = 80, stroke = 8, color, label }) => {
  const r = (size - stroke) / 2,
    circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value, 0) / max, 1);
  return (
    <div className="an-ring-wrap">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="an-ring-bg"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.7s ease" }}
        />
        <text
          x={size / 2}
          y={size / 2 + 5}
          textAnchor="middle"
          className="an-ring-txt"
        >
          {Math.round(pct * max)}
          {max === 100 ? "%" : ""}
        </text>
      </svg>
      {label && <div className="an-ring-label">{label}</div>}
    </div>
  );
};

// ── SKILL_TREE fallback ───────────────────────────────────────────
const SKILL_TREE_DEF = [
  { id: "homerow", name: "Home Row", xpReq: 0 },
  { id: "allrows", name: "All Rows", xpReq: 500 },
  { id: "speed50", name: "Speed 50 WPM", xpReq: 1000 },
  { id: "speed80", name: "Speed 80 WPM", xpReq: 2500 },
  { id: "accuracy", name: "Accuracy Pro", xpReq: 3000 },
  { id: "code", name: "Code Typing", xpReq: 5000 },
  { id: "speed100", name: "100 WPM Club", xpReq: 8000 },
  { id: "master", name: "Master Typist", xpReq: 15000 },
];

// ── MAIN ─────────────────────────────────────────────────────────
export default function Analytics() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const userData = lsGet(LS_KEY) || {};
  const history = userData.testHistory || [];

  const [activeTab, setActiveTab] = useState("overview");

  // Derived stats
  const last20 = useMemo(() => history.slice(0, 20).reverse(), [history]);
  const last7 = useMemo(() => history.slice(0, 7).reverse(), [history]);
  const avgWpm = useMemo(
    () =>
      last20.length
        ? Math.round(last20.reduce((a, b) => a + b.wpm, 0) / last20.length)
        : 0,
    [last20],
  );
  const avgAcc = useMemo(
    () =>
      last20.length
        ? Math.round(last20.reduce((a, b) => a + b.accuracy, 0) / last20.length)
        : 0,
    [last20],
  );
  const wpmTrend = useMemo(() => {
    if (last20.length < 2) return 0;
    const half = Math.floor(last20.length / 2);
    const first = last20.slice(0, half).reduce((a, b) => a + b.wpm, 0) / half;
    const second =
      last20.slice(half).reduce((a, b) => a + b.wpm, 0) /
      (last20.length - half);
    return Math.round(((second - first) / (first || 1)) * 100);
  }, [last20]);

  const plateauDetected = useMemo(() => {
    const h = history.slice(0, 5).map((x) => x.wpm);
    if (h.length < 4) return false;
    const avg = h.reduce((a, b) => a + b, 0) / h.length;
    return Math.max(...h) - Math.min(...h) < avg * 0.05;
  }, [history]);

  // Weekly data
  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((label, i) => ({
      label,
      value: history.filter((h) => {
        const d = new Date(h.date);
        return d.getDay() === (i + 1) % 7;
      }).length,
    }));
  }, [history]);

  const modeData = useMemo(() => {
    const counts = {};
    history.forEach((h) => {
      counts[h.mode] = (counts[h.mode] || 0) + 1;
    });
    return Object.entries(counts)
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }));
  }, [history]);

  const skillTree = SKILL_TREE_DEF;
  const xp = userData.xp || 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "breakdown", label: "Breakdown", icon: Activity },
    { id: "skills", label: "Skills", icon: TreePine },
    { id: "history", label: "History", icon: List },
  ];

  return (
    <div className={`an-root ${isDarkMode ? "dark" : "light"}`}>
      {/* Navbar */}
      <nav className="an-nav">
        <div className="an-nav-inner">
          <button className="an-nav-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="an-nav-title">
            <BarChart2 size={18} /> Analytics
          </div>
          <div className="an-nav-right">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`an-tab-btn${activeTab === t.id ? " an-tab-active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                <t.icon size={14} />
                <span>{t.label}</span>
              </button>
            ))}
            <button className="an-icon-btn" onClick={toggleTheme}>
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile tab bar */}
      <div className="an-mobile-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`an-mtab${activeTab === t.id ? " an-mtab-on" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            <t.icon size={15} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <main className="an-main">
        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="an-section">
            <h2 className="an-sec-title">
              <BarChart2 size={20} /> Performance Overview
            </h2>

            {plateauDetected && (
              <div className="an-alert an-alert-warn">
                <AlertCircle size={15} />
                Plateau detected — your WPM has been consistent. Try a new mode
                to break through!
              </div>
            )}

            <div className="an-stat-grid">
              <StatCard
                icon={Zap}
                label="Best WPM"
                value={userData.bestWPM || 0}
                sub="All time"
                color="blue"
                trend={wpmTrend}
              />
              <StatCard
                icon={Target}
                label="Avg WPM"
                value={avgWpm}
                sub="Last 20 tests"
                color="purple"
              />
              <StatCard
                icon={Activity}
                label="Avg Accuracy"
                value={`${avgAcc}%`}
                sub="Last 20 tests"
                color="green"
              />
              <StatCard
                icon={Clock}
                label="Practice Time"
                value={`${Math.round((userData.totalTime || 0) / 60)}m`}
                sub="Total"
                color="yellow"
              />
              <StatCard
                icon={Flame}
                label="Streak"
                value={`${userData.streak?.current || 0}d`}
                sub={`Best: ${userData.streak?.longest || 0}d`}
                color="orange"
              />
              <StatCard
                icon={Star}
                label="Level"
                value={userData.level || 1}
                sub={`${xp} XP`}
                color="indigo"
              />
              <StatCard
                icon={Award}
                label="Tests Done"
                value={userData.totalTests || 0}
                sub="Completed"
                color="teal"
              />
              <StatCard
                icon={Calendar}
                label="Words Typed"
                value={(userData.totalWords || 0).toLocaleString()}
                color="red"
              />
            </div>

            <div className="an-rings-section">
              <div className="an-card">
                <div className="an-card-title">
                  <Activity size={14} /> Key Metrics
                </div>
                <div className="an-rings-row">
                  <Ring
                    value={avgAcc}
                    label="Accuracy"
                    color="var(--an-green)"
                  />
                  <Ring
                    value={Math.min(userData.bestWPM || 0, 150)}
                    max={150}
                    label="Best WPM"
                    color="var(--an-accent)"
                  />
                  <Ring
                    value={Math.min(xp % 1000, 1000)}
                    max={1000}
                    label="XP Progress"
                    color="var(--an-yellow)"
                  />
                  <Ring
                    value={Math.min(userData.streak?.current || 0, 30)}
                    max={30}
                    label="Day Streak"
                    color="var(--an-orange)"
                  />
                </div>
              </div>
            </div>

            <div className="an-xp-card">
              <div className="an-xp-left">
                <Star size={18} />
                <div>
                  <div className="an-xp-level">Level {userData.level || 1}</div>
                  <div className="an-xp-count">
                    {xp} / {(userData.level || 1) * 1000} XP
                  </div>
                </div>
              </div>
              <div className="an-xp-bar-wrap">
                <div className="an-xp-bar">
                  <div
                    className="an-xp-fill"
                    style={{ width: `${Math.min((xp % 1000) / 10, 100)}%` }}
                  />
                </div>
                <span className="an-xp-pct">
                  {Math.round((xp % 1000) / 10)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── PROGRESS ── */}
        {activeTab === "progress" && (
          <div className="an-section">
            <h2 className="an-sec-title">
              <TrendingUp size={20} /> Progress Charts
            </h2>

            <div className="an-card an-card-lg">
              <div className="an-card-title">
                <Zap size={14} /> WPM — Last 20 Tests
              </div>
              <MiniLine data={last20.map((h) => h.wpm)} h={100} />
              {last20.length > 1 && (
                <div className="an-chart-footer">
                  <span>Min: {Math.min(...last20.map((h) => h.wpm))} WPM</span>
                  <span>Avg: {avgWpm} WPM</span>
                  <span>Max: {Math.max(...last20.map((h) => h.wpm))} WPM</span>
                </div>
              )}
            </div>

            <div className="an-card an-card-lg">
              <div className="an-card-title">
                <Target size={14} /> Accuracy — Last 20 Tests
              </div>
              <MiniLine
                data={last20.map((h) => h.accuracy)}
                color="var(--an-green)"
                h={100}
              />
            </div>

            <div className="an-two-col">
              <div className="an-card">
                <div className="an-card-title">
                  <Calendar size={14} /> Sessions This Week
                </div>
                <BarChartViz data={weeklyData} color="var(--an-accent)" />
              </div>
              <div className="an-card">
                <div className="an-card-title">
                  <Keyboard size={14} /> Tests by Mode
                </div>
                <BarChartViz data={modeData} color="var(--an-teal)" />
              </div>
            </div>

            <div className="an-card">
              <div className="an-card-title">
                <Activity size={14} /> Weekly Goal
              </div>
              <div className="an-goal-row">
                <span>
                  {userData.weeklyGoal?.done || 0} /{" "}
                  {userData.weeklyGoal?.target || 7} sessions
                </span>
                <span>
                  {Math.round(
                    ((userData.weeklyGoal?.done || 0) /
                      (userData.weeklyGoal?.target || 7)) *
                      100,
                  )}
                  %
                </span>
              </div>
              <div className="an-progress-bar">
                <div
                  className="an-progress-fill"
                  style={{
                    width: `${Math.min(((userData.weeklyGoal?.done || 0) / (userData.weeklyGoal?.target || 7)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── BREAKDOWN ── */}
        {activeTab === "breakdown" && (
          <div className="an-section">
            <h2 className="an-sec-title">
              <Activity size={20} /> Test Breakdown
            </h2>

            <div className="an-two-col">
              <div className="an-card">
                <div className="an-card-title">Speed Distribution</div>
                <div className="an-dist-list">
                  {[
                    { range: "0–30 WPM", color: "var(--an-red)" },
                    { range: "31–60 WPM", color: "var(--an-yellow)" },
                    { range: "61–80 WPM", color: "var(--an-blue)" },
                    { range: "81–100 WPM", color: "var(--an-teal)" },
                    { range: "100+ WPM", color: "var(--an-accent)" },
                  ].map(({ range, color }, i) => {
                    const limits = [
                      [0, 30],
                      [31, 60],
                      [61, 80],
                      [81, 100],
                      [101, 999],
                    ];
                    const cnt = history.filter(
                      (h) => h.wpm >= limits[i][0] && h.wpm <= limits[i][1],
                    ).length;
                    const pct = history.length
                      ? Math.round((cnt / history.length) * 100)
                      : 0;
                    return (
                      <div key={i} className="an-dist-row">
                        <span className="an-dist-range">{range}</span>
                        <div className="an-dist-track">
                          <div
                            className="an-dist-fill"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                        <span className="an-dist-count">{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="an-card">
                <div className="an-card-title">Accuracy Distribution</div>
                <div className="an-dist-list">
                  {[
                    { range: "< 80%", color: "var(--an-red)" },
                    { range: "80–89%", color: "var(--an-yellow)" },
                    { range: "90–94%", color: "var(--an-blue)" },
                    { range: "95–99%", color: "var(--an-teal)" },
                    { range: "100%", color: "var(--an-green)" },
                  ].map(({ range, color }, i) => {
                    const limits = [
                      [0, 79],
                      [80, 89],
                      [90, 94],
                      [95, 99],
                      [100, 100],
                    ];
                    const cnt = history.filter(
                      (h) =>
                        h.accuracy >= limits[i][0] &&
                        h.accuracy <= limits[i][1],
                    ).length;
                    const pct = history.length
                      ? Math.round((cnt / history.length) * 100)
                      : 0;
                    return (
                      <div key={i} className="an-dist-row">
                        <span className="an-dist-range">{range}</span>
                        <div className="an-dist-track">
                          <div
                            className="an-dist-fill"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                        <span className="an-dist-count">{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="an-card">
              <div className="an-card-title">
                <Brain size={14} /> Performance Insights
              </div>
              <div className="an-insights-list">
                <div className="an-insight an-insight-info">
                  <Zap size={14} />
                  <span>
                    Your average speed is <strong>{avgWpm} WPM</strong>.{" "}
                    {avgWpm < 40
                      ? "Keep practicing daily to reach 60 WPM."
                      : avgWpm < 80
                        ? "Great progress! Target 80 WPM next."
                        : "Excellent! Push for 100+ WPM."}
                  </span>
                </div>
                <div className="an-insight an-insight-success">
                  <Target size={14} />
                  <span>
                    Average accuracy <strong>{avgAcc}%</strong>.{" "}
                    {avgAcc < 90
                      ? "Focus on accuracy over speed for now."
                      : "Outstanding accuracy — maintain it as you increase speed."}
                  </span>
                </div>
                {plateauDetected && (
                  <div className="an-insight an-insight-warn">
                    <AlertCircle size={14} />
                    <span>
                      Plateau detected in your last 5 tests. Try switching to a
                      harder mode or longer duration.
                    </span>
                  </div>
                )}
                <div className="an-insight an-insight-info">
                  <Clock size={14} />
                  <span>
                    You've practiced for{" "}
                    <strong>
                      {Math.round((userData.totalTime || 0) / 60)} minutes
                    </strong>{" "}
                    total. Consistency beats intensity!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SKILLS ── */}
        {activeTab === "skills" && (
          <div className="an-section">
            <h2 className="an-sec-title">
              <TreePine size={20} /> Skill Tree
            </h2>
            <div className="an-skill-grid">
              {skillTree.map((s, i) => {
                const unlocked = xp >= s.xpReq;
                const progress = unlocked
                  ? 100
                  : Math.min((xp / s.xpReq) * 100, 100);
                return (
                  <div
                    key={s.id}
                    className={`an-skill-card${unlocked ? " an-skill-on" : ""}`}
                  >
                    <div className="an-skill-header">
                      {unlocked ? (
                        <Unlock size={15} className="an-skill-icon-on" />
                      ) : (
                        <Lock size={15} className="an-skill-icon-off" />
                      )}
                      <span className="an-skill-name">{s.name}</span>
                      <span className="an-skill-xp">{s.xpReq} XP</span>
                    </div>
                    <div className="an-skill-progress">
                      <div
                        className="an-skill-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {!unlocked && (
                      <div className="an-skill-need">
                        {s.xpReq - xp} XP needed
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {activeTab === "history" && (
          <div className="an-section">
            <h2 className="an-sec-title">
              <List size={20} /> Test History
            </h2>
            {!history.length ? (
              <div className="an-empty-big">
                No tests recorded yet. Head to the typing test to get started!
              </div>
            ) : (
              <div className="an-table-wrap">
                <div className="an-table">
                  <div className="an-table-head">
                    <span>#</span>
                    <span>Date</span>
                    <span>WPM</span>
                    <span>Accuracy</span>
                    <span>Duration</span>
                    <span>Mode</span>
                  </div>
                  {history.map((h, i) => (
                    <div key={i} className="an-table-row">
                      <span className="an-table-num">{history.length - i}</span>
                      <span>{new Date(h.date).toLocaleDateString()}</span>
                      <span className="an-wpm-cell">{h.wpm}</span>
                      <span
                        className={
                          h.accuracy >= 95
                            ? "an-acc-hi"
                            : h.accuracy >= 85
                              ? "an-acc-mid"
                              : "an-acc-lo"
                        }
                      >
                        {h.accuracy}%
                      </span>
                      <span>{h.duration || "—"}s</span>
                      <span className="an-mode-cell">{h.mode || "words"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
