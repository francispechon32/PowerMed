export const peso = (n) =>
  "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function inPeriod(dateStr, period) {
  if (period === "All Time") return true;
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  switch (period) {
    case "Today":
      return y === now.getFullYear() && m === now.getMonth() && d.getDate() === now.getDate();
    case "This Month":
      return y === now.getFullYear() && m === now.getMonth();
    case "Last Month": {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return y === lm.getFullYear() && m === lm.getMonth();
    }
    case "This Week": {
      const dow = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dow + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return d >= monday && d <= sunday;
    }
    case "This Year":
      return y === now.getFullYear();
    default:
      return true;
  }
}

export function inPrevPeriod(dateStr, period) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  switch (period) {
    case "Today": {
      const yest = new Date(now);
      yest.setDate(now.getDate() - 1);
      return y === yest.getFullYear() && m === yest.getMonth() && d.getDate() === yest.getDate();
    }
    case "This Week": {
      const dow = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - ((dow + 6) % 7) - 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return d >= start && d <= end;
    }
    case "This Month": {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return y === lm.getFullYear() && m === lm.getMonth();
    }
    case "Last Month": {
      const lm2 = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return y === lm2.getFullYear() && m === lm2.getMonth();
    }
    case "This Year":
      return y === now.getFullYear() - 1;
    default:
      return false;
  }
}

export function inRange(dateStr, start, end) {
  if (!start || !end) return true;
  const d = new Date(dateStr + "T00:00:00");
  return d >= new Date(start + "T00:00:00") && d <= new Date(end + "T00:00:00");
}

export const fmtDateShort = (d) => {
  if (!d) return "";
  try { return new Date(d + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric" }); }
  catch { return d; }
};

export const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
};

export const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export const nextId = () => Date.now() + Math.floor(Math.random() * 1000);
