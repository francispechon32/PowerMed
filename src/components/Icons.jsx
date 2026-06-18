/* PowerMed — lightweight inline icon set
   No external package needed (no lucide-react install required).
   Same visual language: 24x24 grid, 2px rounded stroke, transparent fill.
   Pass `size`, `strokeWidth`, and optional `color` (defaults to inherited
   CSS color via currentColor, so wrapping a div with `color: ...` just works). */

function IconBase({ size = 20, strokeWidth = 2, color, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}
      {...rest}
    >
      {children}
    </svg>
  );
}

/* Generic hexagonal "package" glyph — reused as the base look for
   anything box/inventory related. */
export function Boxes(props) {
  return (
    <IconBase {...props}>
      <path d="M12 3 4 7.2v8.6L12 20l8-4.2V7.2L12 3Z" />
      <path d="M4 7.2 12 11l8-3.8" />
      <path d="M12 11v9" />
    </IconBase>
  );
}

export function PackagePlus(props) {
  return (
    <IconBase {...props}>
      <path d="M12 4 5 7.6v7.4L12 19l7-4v-7.4L12 4Z" />
      <path d="M5 7.6 12 11l7-3.4" />
      <path d="M12 11v8" />
      <path d="M18.5 2.5v4" />
      <path d="M16.5 4.5h4" />
    </IconBase>
  );
}

export function PackageMinus(props) {
  return (
    <IconBase {...props}>
      <path d="M12 4 5 7.6v7.4L12 19l7-4v-7.4L12 4Z" />
      <path d="M5 7.6 12 11l7-3.4" />
      <path d="M12 11v8" />
      <path d="M16.5 4.5h4" />
    </IconBase>
  );
}

export function Scale(props) {
  return (
    <IconBase {...props}>
      <path d="M12 3v18" />
      <path d="M5 7h6" />
      <path d="M13 7h6" />
      <path d="M5 7 2.2 13.6a2.9 2.9 0 0 0 5.6 0L5 7Z" />
      <path d="M19 7l-2.8 6.6a2.9 2.9 0 0 0 5.6 0L19 7Z" />
      <path d="M8 21h8" />
    </IconBase>
  );
}

export function Wallet(props) {
  return (
    <IconBase {...props}>
      <path d="M7 7V5.2A2.2 2.2 0 0 1 9.2 3h7.6A2.2 2.2 0 0 1 19 5.2V7" />
      <rect x="3" y="7" width="18" height="13" rx="2.2" />
      <path d="M3 11h18" />
      <circle cx="16.5" cy="15" r="1.3" />
    </IconBase>
  );
}

export function HeartHandshake(props) {
  return (
    <IconBase {...props}>
      <path d="M12 20 4.8 12.8a4.5 4.5 0 0 1 0-6.4 4.5 4.5 0 0 1 6.4 0L12 7l.8-.6a4.5 4.5 0 0 1 6.4 0 4.5 4.5 0 0 1 0 6.4L12 20Z" />
    </IconBase>
  );
}

export function TrendingUp(props) {
  return (
    <IconBase {...props}>
      <polyline points="3 17 9.5 10.5 13.5 14.5 21 7" />
      <polyline points="14.5 7 21 7 21 13.5" />
    </IconBase>
  );
}

export function BarChart3(props) {
  return (
    <IconBase {...props}>
      <path d="M3 21h18" />
      <rect x="5" y="13" width="3.2" height="7" rx="0.6" />
      <rect x="10.4" y="8" width="3.2" height="12" rx="0.6" />
      <rect x="15.8" y="4" width="3.2" height="16" rx="0.6" />
    </IconBase>
  );
}

export function CreditCard(props) {
  return (
    <IconBase {...props}>
      <rect x="2.5" y="6" width="19" height="13" rx="2.3" />
      <path d="M2.5 10.5h19" />
      <path d="M6 14.5h4" />
    </IconBase>
  );
}

export function FlaskConical(props) {
  return (
    <IconBase {...props}>
      <path d="M9 2v6.2L4.4 16.8A2.1 2.1 0 0 0 6.3 20h11.4a2.1 2.1 0 0 0 1.9-3.2L15 8.2V2" />
      <path d="M7 2h10" />
      <path d="M7.6 14h8.8" />
    </IconBase>
  );
}

/* ── Below: icons referenced by App.jsx (sidebar nav, header) ── */

export function Home(props) {
  return (
    <IconBase {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5a1 1 0 0 0 1 1h3.5v-6h3v6H17a1 1 0 0 0 1-1V10" />
    </IconBase>
  );
}

export function IconGrid(props) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.4" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.4" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.4" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.4" />
    </IconBase>
  );
}

export function IconLogout(props) {
  return (
    <IconBase {...props}>
      <path d="M9 21H5.5A1.5 1.5 0 0 1 4 19.5v-15A1.5 1.5 0 0 1 5.5 3H9" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </IconBase>
  );
}

export function IconSearch(props) {
  return (
    <IconBase {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.3-4.3" />
    </IconBase>
  );
}

export function IconBell(props) {
  return (
    <IconBase {...props}>
      <path d="M6 9.5a6 6 0 0 1 12 0c0 3.2 1 5 2 6.5H4c1-1.5 2-3.3 2-6.5Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </IconBase>
  );
}

export function IconChevron(props) {
  return (
    <IconBase {...props}>
      <polyline points="7 9.5 12 14.5 17 9.5" />
    </IconBase>
  );
}

export function PieChart(props) {
  return (
    <IconBase {...props}>
      <path d="M12 2.5a9.5 9.5 0 1 0 9.5 9.5h-9.5V2.5Z" />
      <path d="M12 2.5A9.5 9.5 0 0 1 21.5 12" />
    </IconBase>
  );
}

export function Calendar(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
    </IconBase>
  );
}

/* Map of sidebar page-key -> icon component, consumed by App.jsx:
     const Icon = PAGE_ICONS[p.key] || IconGrid; */
export const PAGE_ICONS = {
  dashboard: Home,
  inventory: Boxes,
  sales: Wallet,
  charity: HeartHandshake,
  stock: BarChart3,
};