import React, {
  useState,
  useContext,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
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
  LogIn,
  UserPlus,
  Radar as RadarIcon,
  PieChart,
  ScatterChart,
  LineChart,
  BarChart3,
  Grid3x3,
  X,
  Sparkles,
  Trophy,
  Info,
  Loader2,
} from "lucide-react";
import { lsGet, LS_KEY, calcAccuracy } from "../../components/Fallback";

/* ════════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════════ */

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

const MILESTONE_ICONS = {
  star: Star,
  flame: Flame,
  award: Award,
  zap: Zap,
};

const INSIGHT_ICONS = {
  zap: Zap,
  target: Target,
  alert: AlertCircle,
  keyboard: Keyboard,
  clock: Clock,
};

/* ════════════════════════════════════════════════════════════
   TOOLTIP — shared floating tooltip for chart hover/tap
   ════════════════════════════════════════════════════════════ */
function ChartTooltip({ x, y, visible, children }) {
  if (!visible) return null;
  return (
    <div className="an2-tooltip" style={{ left: x, top: y }} role="tooltip">
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MINI LINE / AREA CHART (existing, with tooltip support)
   ════════════════════════════════════════════════════════════ */
const MiniLine = ({
  data = [],
  color = "var(--an2-accent)",
  h = 100,
  unit = "",
}) => {
  const wrapRef = useRef(null);
  const [tip, setTip] = useState({
    visible: false,
    x: 0,
    y: 0,
    val: null,
    idx: null,
  });

  if (!data.length) return <div className="an2-empty">No data yet</div>;
  const W = 400,
    P = 12;
  const max = Math.max(...data, 1),
    min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: P + (i / (data.length - 1 || 1)) * (W - P * 2),
    y: P + ((max - v) / range) * (h - P * 2),
    v,
  }));
  const area = `${pts.map((p) => `${p.x},${p.y}`).join(" ")} ${pts[pts.length - 1].x},${h} ${pts[0].x},${h}`;

  function handleMove(e) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    let closest = 0,
      closestDist = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - relX);
      if (d < closestDist) {
        closestDist = d;
        closest = i;
      }
    });
    const p = pts[closest];
    setTip({
      visible: true,
      x: (p.x / W) * rect.width,
      y: (p.y / h) * rect.height,
      val: p.v,
      idx: closest,
    });
  }

  return (
    <div className="an2-chart-wrap" ref={wrapRef}>
      <svg
        viewBox={`0 0 ${W} ${h}`}
        className="an2-line-svg"
        preserveAspectRatio="none"
        onMouseMove={handleMove}
        onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
        onTouchStart={handleMove}
        onTouchMove={handleMove}
      >
        <defs>
          <linearGradient id="an2Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#an2Grad)" />
        <polyline
          points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={tip.idx === i ? 4.5 : 3}
            fill={color}
            className="an2-line-pt"
          />
        ))}
        {tip.visible && (
          <line
            x1={pts[tip.idx].x}
            x2={pts[tip.idx].x}
            y1={0}
            y2={h}
            stroke={color}
            strokeOpacity="0.25"
            strokeWidth="1"
          />
        )}
      </svg>
      <ChartTooltip x={tip.x} y={tip.y} visible={tip.visible}>
        {tip.val}
        {unit}
      </ChartTooltip>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   BAR CHART (existing, with tooltip)
   ════════════════════════════════════════════════════════════ */
const BarChartViz = ({ data = [], color = "var(--an2-accent)" }) => {
  const [hoverIdx, setHoverIdx] = useState(null);
  if (!data.length) return <div className="an2-empty">No data yet</div>;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="an2-bar-chart">
      {data.map((d, i) => (
        <div
          key={i}
          className="an2-bar-col"
          onMouseEnter={() => setHoverIdx(i)}
          onMouseLeave={() => setHoverIdx(null)}
          onTouchStart={() => setHoverIdx(i)}
        >
          {hoverIdx === i && <div className="an2-bar-tip">{d.value}</div>}
          <div className="an2-bar-track">
            <div
              className="an2-bar-fill"
              style={{
                height: `${(d.value / max) * 100}%`,
                background: color,
                opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.45,
              }}
            />
          </div>
          <span className="an2-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   DONUT CHART — new representation type
   ════════════════════════════════════════════════════════════ */
const DONUT_COLORS = [
  "var(--an2-accent)",
  "var(--an2-teal)",
  "var(--an2-blue)",
  "var(--an2-purple)",
  "var(--an2-yellow)",
  "var(--an2-orange)",
  "var(--an2-green)",
  "var(--an2-red)",
];

const DonutChart = ({ data = [], size = 160, stroke = 26 }) => {
  const [hoverIdx, setHoverIdx] = useState(null);
  if (!data.length) return <div className="an2-empty">No data yet</div>;
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  let offsetAcc = 0;

  return (
    <div className="an2-donut-wrap">
      <svg width={size} height={size} className="an2-donut-svg">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {data.map((d, i) => {
            const frac = d.value / total;
            const dash = frac * circ;
            const gap = circ - dash;
            const seg = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                strokeWidth={hoverIdx === i ? stroke + 4 : stroke}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offsetAcc}
                style={{ transition: "stroke-width 0.15s" }}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                onTouchStart={() => setHoverIdx(i)}
                opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.45}
              />
            );
            offsetAcc += dash;
            return seg;
          })}
        </g>
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          className="an2-donut-center-val"
        >
          {hoverIdx !== null ? data[hoverIdx].value : total}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 16}
          textAnchor="middle"
          className="an2-donut-center-lbl"
        >
          {hoverIdx !== null ? data[hoverIdx].label : "Total"}
        </text>
      </svg>
      <div className="an2-donut-legend">
        {data.map((d, i) => (
          <div
            key={i}
            className={`an2-legend-item${hoverIdx === i ? " an2-legend-active" : ""}`}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <span
              className="an2-legend-dot"
              style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
            />
            <span className="an2-legend-label">{d.label}</span>
            <span className="an2-legend-val">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   RADAR CHART — new representation type (skill balance)
   ════════════════════════════════════════════════════════════ */
const RadarChart = ({ data = [], size = 260, color = "var(--an2-accent)" }) => {
  const [hoverIdx, setHoverIdx] = useState(null);
  if (!data.length) return <div className="an2-empty">No data yet</div>;
  const center = size / 2;
  const maxR = center - 38;
  const n = data.length;
  const angleStep = (Math.PI * 2) / n;

  function pointAt(i, value, max = 100) {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = (value / max) * maxR;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  }

  const ringLevels = [25, 50, 75, 100];
  const dataPoints = data.map((d, i) => pointAt(i, d.value));
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="an2-radar-wrap">
      <svg width={size} height={size} className="an2-radar-svg">
        {/* grid rings */}
        {ringLevels.map((lvl) => {
          const pts = data
            .map((_, i) => pointAt(i, lvl))
            .map((p) => `${p.x},${p.y}`)
            .join(" ");
          return (
            <polygon
              key={lvl}
              points={pts}
              fill="none"
              className="an2-radar-ring"
            />
          );
        })}
        {/* axis lines */}
        {data.map((_, i) => {
          const p = pointAt(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              className="an2-radar-axis"
            />
          );
        })}
        {/* data shape */}
        <polygon
          points={dataPath}
          fill={color}
          fillOpacity="0.22"
          stroke={color}
          strokeWidth="2"
        />
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoverIdx === i ? 6 : 4}
            fill={color}
            stroke="var(--an2-bg2)"
            strokeWidth="2"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            onTouchStart={() => setHoverIdx(i)}
            style={{ cursor: "pointer" }}
          />
        ))}
        {/* labels */}
        {data.map((d, i) => {
          const p = pointAt(i, 122);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`an2-radar-label${hoverIdx === i ? " an2-radar-label-active" : ""}`}
            >
              {d.axis}
            </text>
          );
        })}
      </svg>
      {hoverIdx !== null && (
        <div className="an2-radar-callout">
          <strong>{data[hoverIdx].axis}</strong>: {data[hoverIdx].value}/100
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   SCATTER PLOT — new representation type (WPM vs Accuracy)
   ════════════════════════════════════════════════════════════ */
const ScatterPlot = ({ data = [], color = "var(--an2-accent)" }) => {
  const [hoverIdx, setHoverIdx] = useState(null);
  if (!data.length) return <div className="an2-empty">No data yet</div>;
  const W = 400,
    H = 220,
    P = 30;
  const maxX = Math.max(...data.map((d) => d.x), 10);
  const maxY = 100;

  function px(v) {
    return P + (v / maxX) * (W - P * 1.5);
  }
  function py(v) {
    return H - P - (v / maxY) * (H - P * 1.5);
  }

  return (
    <div className="an2-scatter-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="an2-scatter-svg">
        {/* axes */}
        <line
          x1={P}
          y1={H - P}
          x2={W - 10}
          y2={H - P}
          className="an2-scatter-axis"
        />
        <line x1={P} y1={10} x2={P} y2={H - P} className="an2-scatter-axis" />
        {/* gridlines for accuracy at 80/90/100 */}
        {[80, 90, 100].map((v) => (
          <line
            key={v}
            x1={P}
            x2={W - 10}
            y1={py(v)}
            y2={py(v)}
            className="an2-scatter-grid"
          />
        ))}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={px(d.x)}
            cy={py(d.y)}
            r={hoverIdx === i ? 6 : 4}
            fill={color}
            fillOpacity={hoverIdx === null || hoverIdx === i ? 0.85 : 0.35}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            onTouchStart={() => setHoverIdx(i)}
            style={{ cursor: "pointer" }}
          />
        ))}
        <text
          x={W / 2}
          y={H - 4}
          textAnchor="middle"
          className="an2-scatter-axis-label"
        >
          WPM →
        </text>
        <text
          x={12}
          y={H / 2}
          textAnchor="middle"
          className="an2-scatter-axis-label"
          transform={`rotate(-90 12 ${H / 2})`}
        >
          Accuracy →
        </text>
      </svg>
      {hoverIdx !== null && (
        <div className="an2-scatter-callout">
          {data[hoverIdx].label}: <strong>{data[hoverIdx].x} WPM</strong> @{" "}
          <strong>{data[hoverIdx].y}%</strong>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   HEATMAP CALENDAR — new representation type (GitHub-style)
   ════════════════════════════════════════════════════════════ */
const HeatmapCalendar = ({ data = [] }) => {
  const [tip, setTip] = useState(null);
  if (!data.length) return <div className="an2-empty">No activity yet</div>;

  // group into weeks (columns), 7 rows
  const weeks = [];
  let week = [];
  data.forEach((d, i) => {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length) weeks.push(week);

  const max = Math.max(...data.map((d) => d.count), 1);

  function levelFor(count) {
    if (count === 0) return 0;
    const ratio = count / max;
    if (ratio > 0.75) return 4;
    if (ratio > 0.5) return 3;
    if (ratio > 0.25) return 2;
    return 1;
  }

  return (
    <div className="an2-heatmap-wrap">
      <div className="an2-heatmap-grid">
        {weeks.map((w, wi) => (
          <div className="an2-heatmap-col" key={wi}>
            {w.map((d, di) => (
              <div
                key={di}
                className={`an2-heatmap-cell an2-heat-${levelFor(d.count)}`}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const parentRect = e.currentTarget
                    .closest(".an2-heatmap-wrap")
                    .getBoundingClientRect();
                  setTip({
                    x: rect.left - parentRect.left + rect.width / 2,
                    y: rect.top - parentRect.top - 8,
                    date: d.date,
                    count: d.count,
                  });
                }}
                onMouseLeave={() => setTip(null)}
                onTouchStart={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const parentRect = e.currentTarget
                    .closest(".an2-heatmap-wrap")
                    .getBoundingClientRect();
                  setTip({
                    x: rect.left - parentRect.left + rect.width / 2,
                    y: rect.top - parentRect.top - 8,
                    date: d.date,
                    count: d.count,
                  });
                }}
              />
            ))}
          </div>
        ))}
      </div>
      {tip && (
        <div className="an2-heatmap-tip" style={{ left: tip.x, top: tip.y }}>
          <strong>{tip.count}</strong> test{tip.count === 1 ? "" : "s"} on{" "}
          {new Date(tip.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>
      )}
      <div className="an2-heatmap-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={`an2-heatmap-cell an2-heat-${l}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   STAT CARD / RING (existing, namespaced an2-)
   ════════════════════════════════════════════════════════════ */
const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div className={`an2-stat-card an2-c-${color}`}>
    <div className="an2-stat-top">
      <div className="an2-stat-icon">
        <Icon size={18} />
      </div>
      {trend !== undefined && (
        <div
          className={`an2-trend ${trend >= 0 ? "an2-trend-up" : "an2-trend-down"}`}
        >
          {trend >= 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="an2-stat-val">{value}</div>
    <div className="an2-stat-label">{label}</div>
    {sub && <div className="an2-stat-sub">{sub}</div>}
  </div>
);

const Ring = ({ value, max = 100, size = 80, stroke = 8, color, label }) => {
  const r = (size - stroke) / 2,
    circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value, 0) / max, 1);
  return (
    <div className="an2-ring-wrap">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="an2-ring-bg"
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
          className="an2-ring-txt"
        >
          {Math.round(pct * max)}
          {max === 100 ? "%" : ""}
        </text>
      </svg>
      {label && <div className="an2-ring-label">{label}</div>}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MILESTONE MODAL — celebratory popup on load
   ════════════════════════════════════════════════════════════ */
function MilestoneModal({ milestone, onClose }) {
  if (!milestone) return null;
  const Icon = MILESTONE_ICONS[milestone.icon] || Trophy;
  return (
    <div className="an2-modal-overlay" onClick={onClose}>
      <div
        className="an2-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="an2-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <div className="an2-modal-icon-wrap">
          <Icon size={34} className="an2-modal-icon" />
          <span className="an2-modal-sparkle an2-spk-1">✦</span>
          <span className="an2-modal-sparkle an2-spk-2">✦</span>
          <span className="an2-modal-sparkle an2-spk-3">✦</span>
        </div>
        <h3 className="an2-modal-title">{milestone.title}</h3>
        <p className="an2-modal-msg">{milestone.message}</p>
        <button className="an2-modal-btn" onClick={onClose}>
          Awesome!
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   LOGIN PROMPT — shown only when neither backend nor local data
   exists (no guest data, not logged in)
   ════════════════════════════════════════════════════════════ */
function LoginPrompt({ isDarkMode, toggleTheme, navigate }) {
  return (
    <div
      className={`an2-root an2-empty-state-root ${isDarkMode ? "dark" : "light"}`}
    >
      <button className="an2-icon-btn an2-floating-theme" onClick={toggleTheme}>
        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <div className="an2-login-card">
        <div className="an2-login-icon">
          <BarChart2 size={32} />
        </div>
        <h2 className="an2-login-title">No analytics yet</h2>
        <p className="an2-login-desc">
          Log in to sync your progress across devices, or just start typing as a
          guest — your stats will appear here automatically.
        </p>
        <div className="an2-login-actions">
          <button
            className="an2-btn an2-btn-acc"
            onClick={() => navigate("/login")}
          >
            <LogIn size={15} /> Log In
          </button>
          <button className="an2-btn an2-btn-sec" onClick={() => navigate("/")}>
            <UserPlus size={15} /> Start Typing
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function Analytics() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [dataSource, setDataSource] = useState("loading"); // loading | backend | local | none
  const [backendData, setBackendData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [milestoneQueue, setMilestoneQueue] = useState([]);
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [progressChartMode, setProgressChartMode] = useState("line"); // line | bar | scatter
  const [breakdownChartMode, setBreakdownChartMode] = useState("bars"); // bars | donut

  /* ── Resolve data source: backend first, then localStorage,
       silently — never surface fetch errors to the user. ── */
  useEffect(() => {
    let cancelled = false;

    async function resolveData() {
      try {
        const res = await fetch("/api/user/analytics/overview", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && !cancelled) {
            setBackendData(json);
            setDataSource("backend");

            // Fetch heatmap in background (non-blocking for main render)
            fetch("/api/user/analytics/heatmap?days=84", {
              credentials: "include",
            })
              .then((r) => (r.ok ? r.json() : null))
              .then((hm) => {
                if (hm?.success && !cancelled) setHeatmapData(hm.heatmap);
              })
              .catch(() => {});

            if (json.milestones?.length) {
              setMilestoneQueue(json.milestones);
            }
            return;
          }
        }
        // Backend not available / not authenticated — fall back silently
        throw new Error("backend-unavailable");
      } catch {
        if (cancelled) return;
        const local = lsGet(LS_KEY);
        if (local && (local.testHistory?.length || local.totalTests)) {
          setDataSource("local");
        } else {
          setDataSource("none");
        }
      }
    }

    resolveData();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Pop milestones one at a time, gently delayed so the page
       can render first ── */
  useEffect(() => {
    if (milestoneQueue.length && !activeMilestone) {
      const t = setTimeout(() => {
        setActiveMilestone(milestoneQueue[0]);
      }, 650);
      return () => clearTimeout(t);
    }
  }, [milestoneQueue, activeMilestone]);

  function dismissMilestone() {
    setActiveMilestone(null);
    setMilestoneQueue((q) => q.slice(1));
  }

  /* ── LOCAL fallback data shaping (mirrors old behavior) ── */
  const localUserData = useMemo(
    () => (dataSource === "local" ? lsGet(LS_KEY) || {} : {}),
    [dataSource],
  );
  const localHistory = localUserData.testHistory || [];

  const local_last20 = useMemo(
    () => localHistory.slice(0, 20).reverse(),
    [localHistory],
  );
  const local_avgWpm = useMemo(
    () =>
      local_last20.length
        ? Math.round(
            local_last20.reduce((a, b) => a + b.wpm, 0) / local_last20.length,
          )
        : 0,
    [local_last20],
  );
  const local_avgAcc = useMemo(
    () =>
      local_last20.length
        ? Math.round(
            local_last20.reduce((a, b) => a + b.accuracy, 0) /
              local_last20.length,
          )
        : 0,
    [local_last20],
  );
  const local_wpmTrend = useMemo(() => {
    if (local_last20.length < 2) return 0;
    const half = Math.floor(local_last20.length / 2);
    const first =
      local_last20.slice(0, half).reduce((a, b) => a + b.wpm, 0) / half;
    const second =
      local_last20.slice(half).reduce((a, b) => a + b.wpm, 0) /
      (local_last20.length - half);
    return Math.round(((second - first) / (first || 1)) * 100);
  }, [local_last20]);
  const local_plateauDetected = useMemo(() => {
    const h = localHistory.slice(0, 5).map((x) => x.wpm);
    if (h.length < 4) return false;
    const avg = h.reduce((a, b) => a + b, 0) / h.length;
    return Math.max(...h) - Math.min(...h) < avg * 0.05;
  }, [localHistory]);
  const local_weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((label, i) => ({
      label,
      value: localHistory.filter((h) => {
        const d = new Date(h.date);
        return d.getDay() === (i + 1) % 7;
      }).length,
    }));
  }, [localHistory]);
  const local_modeData = useMemo(() => {
    const counts = {};
    localHistory.forEach((h) => {
      counts[h.mode] = (counts[h.mode] || 0) + 1;
    });
    return Object.entries(counts)
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }));
  }, [localHistory]);
  const local_xp = localUserData.xp || 0;

  function distributionLocal(field, buckets) {
    return buckets.map(({ range, min, max }) => {
      const cnt = localHistory.filter(
        (h) => h[field] >= min && h[field] <= max,
      ).length;
      const pct = localHistory.length
        ? Math.round((cnt / localHistory.length) * 100)
        : 0;
      return { range, count: cnt, pct };
    });
  }

  const local_radar = useMemo(() => {
    const bestWpm = localUserData.bestWPM || 0;
    const bestAcc = local_avgAcc || 0;
    const totalTests = localUserData.totalTests || 0;
    const streak = localUserData.streak?.current || 0;
    const totalTime = localUserData.totalTime || 0;
    return [
      {
        axis: "Speed",
        value: Math.min(100, Math.round((bestWpm / 120) * 100)),
      },
      { axis: "Accuracy", value: Math.min(100, Math.round(bestAcc)) },
      {
        axis: "Consistency",
        value: Math.min(100, Math.max(0, 100 - Math.abs(local_wpmTrend))),
      },
      {
        axis: "Endurance",
        value: Math.min(100, Math.round((totalTime / 3600 / 20) * 100)),
      },
      {
        axis: "Volume",
        value: Math.min(100, Math.round((totalTests / 200) * 100)),
      },
      {
        axis: "Discipline",
        value: Math.min(100, Math.round((streak / 30) * 100)),
      },
    ];
  }, [localUserData, local_avgAcc, local_wpmTrend]);

  const local_scatter = useMemo(
    () =>
      localHistory.slice(0, 40).map((h, i) => ({
        x: h.wpm || 0,
        y: h.accuracy || 0,
        label: new Date(h.date).toLocaleDateString(),
        idx: i,
      })),
    [localHistory],
  );

  /* ── Unified view-model: pick backend or local shape ── */
  const vm = useMemo(() => {
    if (dataSource === "backend" && backendData) {
      return {
        bestWPM: backendData.profile.bestWPM || 0,
        avgWpm: backendData.derived.avgWpm,
        avgAcc: backendData.derived.avgAcc,
        wpmTrend: backendData.derived.wpmTrend,
        plateauDetected: backendData.derived.plateauDetected,
        totalTime: backendData.profile.totalTime || 0,
        streak: backendData.profile.streak || { current: 0, longest: 0 },
        level: backendData.profile.level || 1,
        xp: backendData.profile.xp || 0,
        totalTests: backendData.profile.totalTests || 0,
        totalWords: backendData.profile.totalWords || 0,
        weeklyGoal: backendData.profile.weeklyGoal || { done: 0, target: 7 },
        wpmSeries: backendData.charts.wpmSeries,
        accuracySeries: backendData.charts.accuracySeries,
        weekly: backendData.charts.weekly,
        modes: backendData.charts.modes,
        speedDistribution: backendData.charts.speedDistribution,
        accuracyDistribution: backendData.charts.accuracyDistribution,
        radar: backendData.charts.radar,
        scatter: backendData.charts.scatter,
        insights: backendData.insights,
        history: null, // fetched separately/paginated for backend mode
        usesPagination: true,
      };
    }

    // local fallback shape
    return {
      bestWPM: localUserData.bestWPM || 0,
      avgWpm: local_avgWpm,
      avgAcc: local_avgAcc,
      wpmTrend: local_wpmTrend,
      plateauDetected: local_plateauDetected,
      totalTime: localUserData.totalTime || 0,
      streak: localUserData.streak || { current: 0, longest: 0 },
      level: localUserData.level || 1,
      xp: local_xp,
      totalTests: localUserData.totalTests || 0,
      totalWords: localUserData.totalWords || 0,
      weeklyGoal: localUserData.weeklyGoal || { done: 0, target: 7 },
      wpmSeries: local_last20.map((h) => h.wpm),
      accuracySeries: local_last20.map((h) => h.accuracy),
      weekly: local_weeklyData,
      modes: local_modeData,
      speedDistribution: distributionLocal("wpm", [
        { range: "0–30 WPM", min: 0, max: 30 },
        { range: "31–60 WPM", min: 31, max: 60 },
        { range: "61–80 WPM", min: 61, max: 80 },
        { range: "81–100 WPM", min: 81, max: 100 },
        { range: "100+ WPM", min: 101, max: 9999 },
      ]),
      accuracyDistribution: distributionLocal("accuracy", [
        { range: "< 80%", min: 0, max: 79 },
        { range: "80–89%", min: 80, max: 89 },
        { range: "90–94%", min: 90, max: 94 },
        { range: "95–99%", min: 95, max: 99 },
        { range: "100%", min: 100, max: 100 },
      ]),
      radar: local_radar,
      scatter: local_scatter,
      insights: null, // built inline below for local mode
      history: localHistory,
      usesPagination: false,
    };
  }, [
    dataSource,
    backendData,
    localUserData,
    local_avgWpm,
    local_avgAcc,
    local_wpmTrend,
    local_plateauDetected,
    local_weeklyData,
    local_modeData,
    local_radar,
    local_scatter,
    local_xp,
    local_last20,
    localHistory,
  ]);

  /* ── Backend paginated history (only used in backend mode) ── */
  const [historyPage, setHistoryPage] = useState(1);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (dataSource !== "backend" || activeTab !== "history") return;
    let cancelled = false;
    setHistoryLoading(true);
    fetch(`/api/user/analytics/history?page=${historyPage}&limit=20`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json?.success) return;
        setHistoryItems(json.items);
        setHistoryTotalPages(json.totalPages);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dataSource, activeTab, historyPage]);

  /* ── Skill tree (backend-aware) ── */
  const [skillData, setSkillData] = useState(null);
  useEffect(() => {
    if (dataSource !== "backend" || activeTab !== "skills") return;
    let cancelled = false;
    fetch("/api/user/analytics/skills", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled && json?.success) setSkillData(json.skills);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [dataSource, activeTab]);

  const skillTreeDisplay =
    dataSource === "backend" && skillData
      ? skillData
      : SKILL_TREE_DEF.map((s) => ({
          ...s,
          unlocked: vm.xp >= s.xpReq,
          progress:
            vm.xp >= s.xpReq ? 100 : Math.min((vm.xp / s.xpReq) * 100, 100),
        }));

  /* ── Local insights (built client-side, mirrors backend logic) ── */
  const localInsights = useMemo(() => {
    if (vm.insights) return vm.insights; // backend already provided them
    const insights = [];
    if (vm.avgWpm > 0) {
      insights.push({
        type: "info",
        icon: "zap",
        text: `Your average speed is ${vm.avgWpm} WPM. ${
          vm.avgWpm < 40
            ? "Keep practicing daily to reach 60 WPM."
            : vm.avgWpm < 80
              ? "Great progress! Target 80 WPM next."
              : "Excellent! Push for 100+ WPM."
        }`,
      });
    }
    if (vm.avgAcc > 0) {
      insights.push({
        type: "success",
        icon: "target",
        text: `Average accuracy ${vm.avgAcc}%. ${
          vm.avgAcc < 90
            ? "Focus on accuracy over speed for now."
            : "Outstanding accuracy — maintain it as you increase speed."
        }`,
      });
    }
    if (vm.plateauDetected) {
      insights.push({
        type: "warn",
        icon: "alert",
        text: "Plateau detected in your last 5 tests. Try switching to a harder mode or longer duration.",
      });
    }
    insights.push({
      type: "info",
      icon: "clock",
      text: `You've practiced for ${Math.round(
        vm.totalTime / 60,
      )} minutes total. Consistency beats intensity!`,
    });
    return insights;
  }, [vm]);

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "breakdown", label: "Breakdown", icon: Activity },
    { id: "activity", label: "Activity", icon: Grid3x3 },
    { id: "skills", label: "Skills", icon: TreePine },
    { id: "history", label: "History", icon: List },
  ];

  /* ── Loading state — smooth skeleton, no error flash ── */
  if (dataSource === "loading") {
    return (
      <div className={`an2-root ${isDarkMode ? "dark" : "light"}`}>
        <div className="an2-skeleton-wrap">
          <div className="an2-skeleton an2-skel-title" />
          <div className="an2-skeleton-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="an2-skeleton an2-skel-card" />
            ))}
          </div>
          <div className="an2-skeleton an2-skel-chart" />
        </div>
      </div>
    );
  }

  /* ── No data anywhere — friendly login/guest prompt ── */
  if (dataSource === "none") {
    return (
      <LoginPrompt
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        navigate={navigate}
      />
    );
  }

  return (
    <div className={`an2-root ${isDarkMode ? "dark" : "light"}`}>
      <MilestoneModal milestone={activeMilestone} onClose={dismissMilestone} />

      {/* Navbar */}
      <nav className="an2-nav">
        <div className="an2-nav-inner">
          <button className="an2-nav-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="an2-nav-title">
            <BarChart2 size={18} /> Analytics
            {dataSource === "local" && (
              <span
                className="an2-source-chip"
                title="Showing data saved on this device"
              >
                Guest
              </span>
            )}
          </div>
          <div className="an2-nav-right">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`an2-tab-btn${activeTab === t.id ? " an2-tab-active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                <t.icon size={14} />
                <span>{t.label}</span>
              </button>
            ))}
            <button className="an2-icon-btn" onClick={toggleTheme}>
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile tab bar */}
      <div className="an2-mobile-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`an2-mtab${activeTab === t.id ? " an2-mtab-on" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            <t.icon size={15} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <main className="an2-main">
        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="an2-section">
            <h2 className="an2-sec-title">
              <BarChart2 size={20} /> Performance Overview
            </h2>

            {vm.plateauDetected && (
              <div className="an2-alert an2-alert-warn">
                <AlertCircle size={15} />
                Plateau detected — your WPM has been consistent. Try a new mode
                to break through!
              </div>
            )}

            <div className="an2-stat-grid">
              <StatCard
                icon={Zap}
                label="Best WPM"
                value={vm.bestWPM}
                sub="All time"
                color="blue"
                trend={vm.wpmTrend}
              />
              <StatCard
                icon={Target}
                label="Avg WPM"
                value={vm.avgWpm}
                sub="Last 20 tests"
                color="purple"
              />
              <StatCard
                icon={Activity}
                label="Avg Accuracy"
                value={`${vm.avgAcc}%`}
                sub="Last 20 tests"
                color="green"
              />
              <StatCard
                icon={Clock}
                label="Practice Time"
                value={`${Math.round(vm.totalTime / 60)}m`}
                sub="Total"
                color="yellow"
              />
              <StatCard
                icon={Flame}
                label="Streak"
                value={`${vm.streak?.current || 0}d`}
                sub={`Best: ${vm.streak?.longest || 0}d`}
                color="orange"
              />
              <StatCard
                icon={Star}
                label="Level"
                value={vm.level}
                sub={`${vm.xp} XP`}
                color="indigo"
              />
              <StatCard
                icon={Award}
                label="Tests Done"
                value={vm.totalTests}
                sub="Completed"
                color="teal"
              />
              <StatCard
                icon={Calendar}
                label="Words Typed"
                value={vm.totalWords.toLocaleString()}
                color="red"
              />
            </div>

            <div className="an2-rings-section">
              <div className="an2-card">
                <div className="an2-card-title">
                  <Activity size={14} /> Key Metrics
                </div>
                <div className="an2-rings-row">
                  <Ring
                    value={vm.avgAcc}
                    label="Accuracy"
                    color="var(--an2-green)"
                  />
                  <Ring
                    value={Math.min(vm.bestWPM, 150)}
                    max={150}
                    label="Best WPM"
                    color="var(--an2-accent)"
                  />
                  <Ring
                    value={Math.min(vm.xp % 1000, 1000)}
                    max={1000}
                    label="XP Progress"
                    color="var(--an2-yellow)"
                  />
                  <Ring
                    value={Math.min(vm.streak?.current || 0, 30)}
                    max={30}
                    label="Day Streak"
                    color="var(--an2-orange)"
                  />
                </div>
              </div>
            </div>

            <div className="an2-card">
              <div className="an2-card-title">
                <RadarIcon size={14} /> Skill Balance
              </div>
              <RadarChart data={vm.radar} />
            </div>

            <div className="an2-xp-card">
              <div className="an2-xp-left">
                <Star size={18} />
                <div>
                  <div className="an2-xp-level">Level {vm.level}</div>
                  <div className="an2-xp-count">
                    {vm.xp} / {vm.level * 1000} XP
                  </div>
                </div>
              </div>
              <div className="an2-xp-bar-wrap">
                <div className="an2-xp-bar">
                  <div
                    className="an2-xp-fill"
                    style={{ width: `${Math.min((vm.xp % 1000) / 10, 100)}%` }}
                  />
                </div>
                <span className="an2-xp-pct">
                  {Math.round((vm.xp % 1000) / 10)}%
                </span>
              </div>
            </div>

            <div className="an2-tip-banner">
              <Sparkles size={14} />
              <span>
                {vm.streak?.current > 0
                  ? `You're on a ${vm.streak.current}-day streak — even 5 minutes today keeps it alive.`
                  : "Start a streak today — consistency is the #1 driver of speed gains."}
              </span>
            </div>
          </div>
        )}

        {/* ── PROGRESS ── */}
        {activeTab === "progress" && (
          <div className="an2-section">
            <h2 className="an2-sec-title">
              <TrendingUp size={20} /> Progress Charts
            </h2>

            <div className="an2-chart-mode-switch">
              <button
                className={`an2-mode-btn${progressChartMode === "line" ? " an2-mode-active" : ""}`}
                onClick={() => setProgressChartMode("line")}
              >
                <LineChart size={13} /> Line
              </button>
              <button
                className={`an2-mode-btn${progressChartMode === "scatter" ? " an2-mode-active" : ""}`}
                onClick={() => setProgressChartMode("scatter")}
              >
                <ScatterChart size={13} /> Correlation
              </button>
            </div>

            {progressChartMode === "line" && (
              <>
                <div className="an2-card an2-card-lg">
                  <div className="an2-card-title">
                    <Zap size={14} /> WPM — Last 20 Tests
                  </div>
                  <MiniLine data={vm.wpmSeries} h={100} unit=" WPM" />
                  {vm.wpmSeries.length > 1 && (
                    <div className="an2-chart-footer">
                      <span>Min: {Math.min(...vm.wpmSeries)} WPM</span>
                      <span>Avg: {vm.avgWpm} WPM</span>
                      <span>Max: {Math.max(...vm.wpmSeries)} WPM</span>
                    </div>
                  )}
                </div>

                <div className="an2-card an2-card-lg">
                  <div className="an2-card-title">
                    <Target size={14} /> Accuracy — Last 20 Tests
                  </div>
                  <MiniLine
                    data={vm.accuracySeries}
                    color="var(--an2-green)"
                    h={100}
                    unit="%"
                  />
                </div>
              </>
            )}

            {progressChartMode === "scatter" && (
              <div className="an2-card an2-card-lg">
                <div className="an2-card-title">
                  <ScatterChart size={14} /> Speed vs Accuracy Correlation
                </div>
                <ScatterPlot data={vm.scatter} />
                <p className="an2-chart-hint">
                  Each dot is one test. Dots higher and further right show both
                  fast and accurate typing — your sweet spot.
                </p>
              </div>
            )}

            <div className="an2-two-col">
              <div className="an2-card">
                <div className="an2-card-title">
                  <Calendar size={14} /> Sessions This Week
                </div>
                <BarChartViz data={vm.weekly} color="var(--an2-accent)" />
              </div>
              <div className="an2-card">
                <div className="an2-card-title">
                  <Keyboard size={14} /> Tests by Mode
                </div>
                <BarChartViz data={vm.modes} color="var(--an2-teal)" />
              </div>
            </div>

            <div className="an2-card">
              <div className="an2-card-title">
                <Activity size={14} /> Weekly Goal
              </div>
              <div className="an2-goal-row">
                <span>
                  {vm.weeklyGoal?.done || 0} / {vm.weeklyGoal?.target || 7}{" "}
                  sessions
                </span>
                <span>
                  {Math.round(
                    ((vm.weeklyGoal?.done || 0) /
                      (vm.weeklyGoal?.target || 7)) *
                      100,
                  )}
                  %
                </span>
              </div>
              <div className="an2-progress-bar">
                <div
                  className="an2-progress-fill"
                  style={{
                    width: `${Math.min(
                      ((vm.weeklyGoal?.done || 0) /
                        (vm.weeklyGoal?.target || 7)) *
                        100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── BREAKDOWN ── */}
        {activeTab === "breakdown" && (
          <div className="an2-section">
            <h2 className="an2-sec-title">
              <Activity size={20} /> Test Breakdown
            </h2>

            <div className="an2-chart-mode-switch">
              <button
                className={`an2-mode-btn${breakdownChartMode === "bars" ? " an2-mode-active" : ""}`}
                onClick={() => setBreakdownChartMode("bars")}
              >
                <BarChart3 size={13} /> Bars
              </button>
              <button
                className={`an2-mode-btn${breakdownChartMode === "donut" ? " an2-mode-active" : ""}`}
                onClick={() => setBreakdownChartMode("donut")}
              >
                <PieChart size={13} /> Donut
              </button>
            </div>

            {breakdownChartMode === "bars" && (
              <div className="an2-two-col">
                <div className="an2-card">
                  <div className="an2-card-title">Speed Distribution</div>
                  <div className="an2-dist-list">
                    {vm.speedDistribution.map((d, i) => (
                      <div key={i} className="an2-dist-row">
                        <span className="an2-dist-range">{d.range}</span>
                        <div className="an2-dist-track">
                          <div
                            className="an2-dist-fill"
                            style={{
                              width: `${d.pct}%`,
                              background: DONUT_COLORS[i % DONUT_COLORS.length],
                            }}
                          />
                        </div>
                        <span className="an2-dist-count">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="an2-card">
                  <div className="an2-card-title">Accuracy Distribution</div>
                  <div className="an2-dist-list">
                    {vm.accuracyDistribution.map((d, i) => (
                      <div key={i} className="an2-dist-row">
                        <span className="an2-dist-range">{d.range}</span>
                        <div className="an2-dist-track">
                          <div
                            className="an2-dist-fill"
                            style={{
                              width: `${d.pct}%`,
                              background:
                                DONUT_COLORS[(i + 2) % DONUT_COLORS.length],
                            }}
                          />
                        </div>
                        <span className="an2-dist-count">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {breakdownChartMode === "donut" && (
              <div className="an2-two-col">
                <div className="an2-card">
                  <div className="an2-card-title">Speed Distribution</div>
                  <DonutChart
                    data={vm.speedDistribution.map((d) => ({
                      label: d.range,
                      value: d.count,
                    }))}
                  />
                </div>
                <div className="an2-card">
                  <div className="an2-card-title">Accuracy Distribution</div>
                  <DonutChart
                    data={vm.accuracyDistribution.map((d) => ({
                      label: d.range,
                      value: d.count,
                    }))}
                  />
                </div>
              </div>
            )}

            <div className="an2-card">
              <div className="an2-card-title">
                <Brain size={14} /> Performance Insights
              </div>
              <div className="an2-insights-list">
                {localInsights.map((ins, i) => {
                  const Icon = INSIGHT_ICONS[ins.icon] || Info;
                  return (
                    <div
                      key={i}
                      className={`an2-insight an2-insight-${ins.type}`}
                    >
                      <Icon size={14} />
                      <span>{ins.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY (new tab — heatmap calendar) ── */}
        {activeTab === "activity" && (
          <div className="an2-section">
            <h2 className="an2-sec-title">
              <Grid3x3 size={20} /> Activity Calendar
            </h2>
            <div className="an2-card an2-card-lg">
              <div className="an2-card-title">
                <Calendar size={14} /> Last 12 Weeks
              </div>
              {dataSource === "backend" ? (
                heatmapData ? (
                  <HeatmapCalendar data={heatmapData} />
                ) : (
                  <div className="an2-empty">
                    <Loader2 size={16} className="an2-spin" /> Loading activity…
                  </div>
                )
              ) : (
                <HeatmapCalendar
                  data={(() => {
                    const days = 84;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const map = new Map();
                    localHistory.forEach((h) => {
                      const d = new Date(h.date);
                      d.setHours(0, 0, 0, 0);
                      const key = d.toISOString().slice(0, 10);
                      map.set(key, (map.get(key) || 0) + 1);
                    });
                    const out = [];
                    for (let i = days - 1; i >= 0; i--) {
                      const d = new Date(today);
                      d.setDate(d.getDate() - i);
                      const key = d.toISOString().slice(0, 10);
                      out.push({ date: key, count: map.get(key) || 0 });
                    }
                    return out;
                  })()}
                />
              )}
            </div>
            <div className="an2-tip-banner">
              <Info size={14} />
              <span>
                Darker squares mean more tests that day. Aim to keep the row
                unbroken for a stronger streak.
              </span>
            </div>
          </div>
        )}

        {/* ── SKILLS ── */}
        {activeTab === "skills" && (
          <div className="an2-section">
            <h2 className="an2-sec-title">
              <TreePine size={20} /> Skill Tree
            </h2>
            <div className="an2-skill-grid">
              {skillTreeDisplay.map((s) => (
                <div
                  key={s.id}
                  className={`an2-skill-card${s.unlocked ? " an2-skill-on" : ""}`}
                >
                  <div className="an2-skill-header">
                    {s.unlocked ? (
                      <Unlock size={15} className="an2-skill-icon-on" />
                    ) : (
                      <Lock size={15} className="an2-skill-icon-off" />
                    )}
                    <span className="an2-skill-name">{s.name}</span>
                    <span className="an2-skill-xp">{s.xpReq} XP</span>
                  </div>
                  <div className="an2-skill-progress">
                    <div
                      className="an2-skill-fill"
                      style={{ width: `${s.progress}%` }}
                    />
                  </div>
                  {!s.unlocked && (
                    <div className="an2-skill-need">
                      {Math.max(0, s.xpReq - vm.xp)} XP needed
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {activeTab === "history" && (
          <div className="an2-section">
            <h2 className="an2-sec-title">
              <List size={20} /> Test History
            </h2>

            {dataSource === "backend" ? (
              <>
                {historyLoading && !historyItems.length ? (
                  <div className="an2-empty">
                    <Loader2 size={16} className="an2-spin" /> Loading history…
                  </div>
                ) : !historyItems.length ? (
                  <div className="an2-empty-big">
                    No tests recorded yet. Head to the typing test to get
                    started!
                  </div>
                ) : (
                  <>
                    <HistoryTable
                      items={historyItems}
                      startIndexOffset={(historyPage - 1) * 20}
                    />
                    <div className="an2-pagination">
                      <button
                        className="an2-page-btn"
                        disabled={historyPage <= 1}
                        onClick={() =>
                          setHistoryPage((p) => Math.max(1, p - 1))
                        }
                      >
                        Prev
                      </button>
                      <span className="an2-page-info">
                        Page {historyPage} / {historyTotalPages}
                      </span>
                      <button
                        className="an2-page-btn"
                        disabled={historyPage >= historyTotalPages}
                        onClick={() =>
                          setHistoryPage((p) =>
                            Math.min(historyTotalPages, p + 1),
                          )
                        }
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : !vm.history?.length ? (
              <div className="an2-empty-big">
                No tests recorded yet. Head to the typing test to get started!
              </div>
            ) : (
              <HistoryTable
                items={vm.history}
                startIndexOffset={0}
                reverseNum
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   HISTORY TABLE — shared between backend/local modes
   ════════════════════════════════════════════════════════════ */
function HistoryTable({ items, startIndexOffset = 0, reverseNum = false }) {
  return (
    <div className="an2-table-wrap">
      <div className="an2-table">
        <div className="an2-table-head">
          <span>#</span>
          <span>Date</span>
          <span>WPM</span>
          <span>Accuracy</span>
          <span>Duration</span>
          <span>Mode</span>
        </div>
        {items.map((h, i) => (
          <div key={i} className="an2-table-row">
            <span className="an2-table-num">
              {reverseNum ? items.length - i : startIndexOffset + i + 1}
            </span>
            <span>{new Date(h.date).toLocaleDateString()}</span>
            <span className="an2-wpm-cell">{h.wpm}</span>
            <span
              className={
                h.accuracy >= 95
                  ? "an2-acc-hi"
                  : h.accuracy >= 85
                    ? "an2-acc-mid"
                    : "an2-acc-lo"
              }
            >
              {h.accuracy}%
            </span>
            <span>{h.duration || "—"}s</span>
            <span className="an2-mode-cell">
              {h.textType || h.mode || "words"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
