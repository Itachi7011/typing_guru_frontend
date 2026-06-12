import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  Clock,
  Layers,
  Monitor,
  CaseSensitive,
  RefreshCw,
  Hand,
  Keyboard,
  Smartphone,
  ChevronDown,
  AlignLeft,
  Shield,
  Hash,
  Cpu,
  Dumbbell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Collapsible section
const SideSection = ({ label, icon: Icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="sk-sb-section">
      <button
        className={`sk-sb-sec-head${open ? " open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon size={13} />
        <span>{label}</span>
        <ChevronDown size={11} className={`sk-sb-chev${open ? " up" : ""}`} />
      </button>
      {open && <div className="sk-sb-sec-body">{children}</div>}
    </div>
  );
};

/**
 * Dynamic Sidebar
 * Props:
 *   collapsed: bool
 *   onToggle: fn
 *   sections: Array<{ label, icon, content: ReactNode }>
 *   quickNav: Array<{ label, icon, onClick }>
 *   blurred: bool  (blur during test)
 *   isDarkMode: bool
 */
export default function Sidebar({
  collapsed,
  onToggle,
  sections = [],
  quickNav = [],
  blurred = false,
  isDarkMode,
}) {
  const cls = [
    "sk-sidebar",
    collapsed ? "sk-sb-collapsed" : "",
    blurred ? "sk-sb-blurred" : "",
    isDarkMode ? "dark" : "light",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* Toggle button */}
      <button
        className={`sk-sb-toggle ${collapsed ? "expand" : "collapse"}`}
        onClick={onToggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <aside className={cls}>
        {!collapsed && (
          <div className="sk-sb-inner">
            {sections.map((sec, i) => (
              <SideSection
                key={i}
                label={sec.label}
                icon={sec.icon}
                defaultOpen={sec.defaultOpen !== false}
              >
                {sec.content}
              </SideSection>
            ))}

            {quickNav.length > 0 && (
              <div className="sk-sb-quicknav">
                {quickNav.map((n, i) => (
                  <button key={i} className="sk-sb-navbtn" onClick={n.onClick}>
                    <n.icon size={13} /> {n.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {collapsed && (
          <div className="sk-sb-mini">
            {sections.map((sec, i) => (
              <button key={i} className="sk-sb-mini-icon" title={sec.label}>
                <sec.icon size={15} />
              </button>
            ))}
            {quickNav.length > 0 && <div className="sk-sb-mini-sep" />}
            {quickNav.map((n, i) => (
              <button
                key={i}
                className="sk-sb-mini-icon"
                title={n.label}
                onClick={n.onClick}
              >
                <n.icon size={15} />
              </button>
            ))}
          </div>
        )}
      </aside>
    </>
  );
}

// Re-export pill helper for use in parent
export function SbPills({ items, active, onSelect, xs }) {
  return (
    <div className="sk-sb-pills">
      {items.map((item) => (
        <button
          key={item.id || item.value || item}
          className={`sk-sb-pill${xs ? " xs" : ""}${active === (item.id || item.value || item) ? " on" : ""}`}
          onClick={() => onSelect(item.id || item.value || item)}
        >
          {item.flag ? `${item.flag} ` : ""}
          {item.label || item}
        </button>
      ))}
    </div>
  );
}

export function SbToggle({ label, icon: Icon, value, onChange }) {
  return (
    <div className="sk-sb-opt-row">
      <div className="sk-sb-opt-label">
        {Icon && <Icon size={13} />}
        <span>{label}</span>
      </div>
      <div
        className={`sk-sb-toggle-sw${value ? " on" : ""}`}
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onChange(!value)}
      />
    </div>
  );
}
