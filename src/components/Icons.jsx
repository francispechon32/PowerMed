/* PowerMed — lightweight inline icon set */

function IconBase({ size = 20, strokeWidth = 2, color, children, ...rest }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color || "currentColor"}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }} {...rest}
    >
      {children}
    </svg>
  );
}

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
      <path d="M5 7h6" /><path d="M13 7h6" />
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

export function Eye(props) {
  return (
    <IconBase {...props}>
      <path d="M1 12S5 4.5 12 4.5 23 12 23 12s-4 7.5-11 7.5S1 12 1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  );
}

export function Trash(props) {
  return (
    <IconBase {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </IconBase>
  );
}

export function Download(props) {
  return (
    <IconBase {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </IconBase>
  );
}

export function Printer(props) {
  return (
    <IconBase {...props}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </IconBase>
  );
}

export function Settings(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </IconBase>
  );
}

export function Users(props) {
  return (
    <IconBase {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  );
}

export function FileText(props) {
  return (
    <IconBase {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </IconBase>
  );
}

export function CheckCircle(props) {
  return (
    <IconBase {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </IconBase>
  );
}

export function XCircle(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </IconBase>
  );
}

export const PAGE_ICONS = {
  dashboard: Home,
  inventory: Boxes,
  sales:     Wallet,
  charity:   HeartHandshake,
  stock:     BarChart3,
  billing:   CreditCard,
  products:  Settings,
};
