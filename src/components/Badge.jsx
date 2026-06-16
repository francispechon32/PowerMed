import { COLORS } from "../styles/tokens";

const badgeStyles = {
  In:     { background: COLORS.tealBg,   color: COLORS.teal  },
  Out:    { background: COLORS.coralBg,  color: COLORS.coral },
  SD:     { background: COLORS.blueBg,   color: COLORS.blue  },
  Cash:   { background: COLORS.greenBg,  color: COLORS.green },
  Online: { background: COLORS.amberBg,  color: COLORS.amber },
  Billed: { background: COLORS.pinkBg,   color: COLORS.pink  },
};

export function Badge({ label }) {
  const style = badgeStyles[label] || { background: "#eee", color: "#555" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 500, ...style }}>
      {label}
    </span>
  );
}

export function Pill({ label }) {
  return (
    <span style={{ display: "inline-flex", padding: "3px 10px", background: "#fff7ed", border: "none", borderRadius: 999, fontSize: 11, color: "#9a3412", whiteSpace: "nowrap", fontWeight: 500 }}>
      {label}
    </span>
  );
}
