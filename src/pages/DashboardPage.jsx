import { useMemo, useState } from "react";
import {
  PackagePlus,
  Wallet,
  HeartHandshake,
  TrendingUp,
  Boxes,
  BarChart3,
  PieChart,
  IconChevron,
  Calendar,
} from "../components/Icons";
import { COLORS, S } from "../styles/tokens";
import { REMARKS_LIST } from "../data/seeds";
import { peso, inPeriod } from "../utils/helpers";

const NAV_MAP = {
  "Stock movement": "stock",
  "Total sales": "sales",
  "Charity given": "charity",
};

const sortByDate = (arr) => [...arr].sort((a, b) => (a.date || "").localeCompare(b.date || ""));

function sampleArray(arr, n) {
  if (!arr.length) return Array(n).fill(0);
  if (arr.length <= n) {
    const pad = Array(n - arr.length).fill(arr[0]);
    return [...pad, ...arr];
  }
  const step = arr.length / n;
  const out = [];
  for (let i = 0; i < n; i++) out.push(arr[Math.min(arr.length - 1, Math.floor(i * step))]);
  out[n - 1] = arr[arr.length - 1];
  return out;
}

function bucketSums(records, n, valueFn) {
  if (!records.length) return Array(n).fill(0);
  const sorted = sortByDate(records);
  const size = Math.ceil(sorted.length / n);
  const out = [];
  for (let i = 0; i < n; i++) {
    const chunk = sorted.slice(i * size, (i + 1) * size);
    out.push(chunk.reduce((s, r) => s + valueFn(r), 0));
  }
  return out;
}

function SparkLine({ data, color, width = 64, height = 36 }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = width / (data.length - 1 || 1);
  const points = data.map((d, i) => `${i * stepX},${height - ((d - min) / range) * height}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkArea({ data, color, width = 64, height = 36 }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = width / (data.length - 1 || 1);
  const pts = data.map((d, i) => [i * stepX, height - ((d - min) / range) * height]);
  const linePath = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0] + "," + p[1]).join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  const gradId = `pm-grad-${color.replace("#", "")}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkBars({ data, color, width = 64, height = 36, gap = 3 }) {
  const max = Math.max(...data, 1);
  const barW = (width - gap * (data.length - 1)) / data.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {data.map((d, i) => {
        const h = Math.max(2, (d / max) * height);
        const x = i * (barW + gap);
        const y = height - h;
        return <rect key={i} x={x} y={y} width={barW} height={h} rx={1.5} fill={color} />;
      })}
    </svg>
  );
}

function stockStatus(bal) {
  if (bal <= 2) return { label: "Low stock", color: COLORS.coral, bg: "#ffe4e6" };
  if (bal <= 10) return { label: "Moderate",  color: COLORS.amber, bg: COLORS.amberBg };
  return               { label: "In Stock",   color: "#15803d",    bg: "#dcfce7" };
}

export default function DashboardPage({ inventory, sales, charity, onNavigate }) {
  const [period, setPeriod] = useState("Today");
  const [showProfit, setShowProfit] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const PERIOD_OPTIONS = ["Today", "This Week", "This Month", "Last Month", "This Year", "All Time"];

  const filteredInventory = useMemo(() => inventory.filter((r) => inPeriod(r.date, period)), [inventory, period]);
  const filteredSales     = useMemo(() => sales.filter((r) => inPeriod(r.date, period)), [sales, period]);
  const filteredCharity   = useMemo(() => charity.filter((r) => inPeriod(r.date, period)), [charity, period]);

  const totalIn     = filteredInventory.filter((r) => r.entry === "In").reduce((s, r) => s + r.qty, 0);
  const totalOut    = filteredInventory.filter((r) => r.entry === "Out").reduce((s, r) => s + r.qty, 0);
  const totalOutVal = filteredInventory.filter((r) => r.entry === "Out").reduce((s, r) => s + r.qty * r.cost, 0);
  const balance     = totalIn - totalOut;
  const totalSales  = filteredSales.reduce((s, r) => s + r.price * r.qty, 0);
  const totalCharity = filteredCharity.reduce((s, r) => s + r.qty, 0);
  const grossProfit  = totalSales - totalOutVal;

  const stockMap = useMemo(() => {
    const m = {};
    filteredInventory.forEach((r) => {
      if (!m[r.variant]) m[r.variant] = { inQty: 0, outQty: 0 };
      if (r.entry === "In") m[r.variant].inQty += r.qty;
      else m[r.variant].outQty += r.qty;
    });
    return m;
  }, [filteredInventory]);

  const lowStockCount = useMemo(
    () => Object.values(stockMap).filter((v) => v.inQty - v.outQty <= 5).length,
    [stockMap]
  );

  const topProducts = useMemo(() => {
    const rev = {};
    filteredSales.forEach((r) => { rev[r.item.trim()] = (rev[r.item.trim()] || 0) + r.price * r.qty; });
    return Object.entries(rev).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredSales]);

  const profitData = useMemo(() => {
    const revMap = {};
    filteredSales.forEach((r) => { revMap[r.item] = (revMap[r.item] || 0) + r.price * r.qty; });
    const costMap = {};
    filteredInventory.filter((r) => r.entry === "Out").forEach((r) => {
      costMap[r.variant] = (costMap[r.variant] || 0) + r.cost * r.qty;
    });
    const allItems = new Set([...Object.keys(revMap), ...Object.keys(costMap)]);
    return Array.from(allItems)
      .map((item) => {
        const revenue = revMap[item] || 0;
        const cost = costMap[item] || 0;
        const profit = revenue - cost;
        const margin = revenue ? (profit / revenue) * 100 : 0;
        return { item, revenue, cost, profit, margin };
      })
      .sort((a, b) => b.profit - a.profit);
  }, [filteredSales, filteredInventory]);

  const stockTrend = useMemo(() => {
    const sorted = sortByDate(filteredInventory);
    let running = 0;
    const cum = sorted.map((r) => { running += r.entry === "In" ? r.qty : -r.qty; return running; });
    return sampleArray(cum, 7);
  }, [filteredInventory]);

  const salesTrend = useMemo(() => {
    const sorted = sortByDate(filteredSales);
    let running = 0;
    const cum = sorted.map((r) => { running += r.price * r.qty; return running; });
    return sampleArray(cum, 7);
  }, [filteredSales]);

  const charityTrend = useMemo(
    () => bucketSums(filteredCharity, 6, (r) => r.qty),
    [filteredCharity]
  );

  const profitTrend = useMemo(() => {
    const records = [
      ...filteredSales.map((r) => ({ date: r.date, val: r.price * r.qty })),
      ...filteredInventory.filter((r) => r.entry === "Out").map((r) => ({ date: r.date, val: -r.qty * r.cost })),
    ];
    return bucketSums(records, 6, (r) => r.val);
  }, [filteredSales, filteredInventory]);

  const metrics = [
    {
      label: "Stock movement",
      value: balance,
      sub: "Units on hand",
      color: "#2563eb",
      bg: "#dbeafe",
      icon: PackagePlus,
      chart: { type: "line", data: stockTrend },
    },
    {
      label: "Total sales",
      value: peso(totalSales),
      sub: `${filteredSales.length} transactions`,
      color: COLORS.amber,
      bg: COLORS.amberBg,
      icon: Wallet,
      chart: { type: "area", data: salesTrend },
    },
    {
      label: "Charity given",
      value: totalCharity,
      sub: `${filteredCharity.length} entries`,
      color: "#e11d48",
      bg: "#ffe4e6",
      icon: HeartHandshake,
      chart: { type: "bars", data: charityTrend },
    },
    {
      label: "Gross profit",
      value: peso(grossProfit),
      sub: `${totalSales ? ((grossProfit / totalSales) * 100).toFixed(1) : 0}% margin`,
      color: COLORS.green,
      bg: COLORS.greenBg,
      icon: TrendingUp,
      chart: { type: "bars", data: profitTrend },
    },
  ];

  const paymentStats = REMARKS_LIST.map((r) => {
    const cnt = filteredSales.filter((s) => s.remarks === r).length;
    const val = filteredSales.filter((s) => s.remarks === r).reduce((a, s) => a + s.price * s.qty, 0);
    return { r, cnt, val };
  });

  const DONUT_COLORS = ["#2dd4bf", "#f0653f", "#3b82f6", "#c2780b", "#a855f7"];
  const donutTotal = paymentStats.reduce((s, p) => s + p.val, 0) || 1;
  const donutSegments = useMemo(() => {
    let cumulative = 0;
    return paymentStats.map((p, i) => {
      const pct = (p.val / donutTotal) * 100;
      const seg = { ...p, pct, color: DONUT_COLORS[i % DONUT_COLORS.length], offset: cumulative };
      cumulative += pct;
      return seg;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSales]);

  const RADIUS = 52;
  const CIRC = 2 * Math.PI * RADIUS;

  const totalProfit  = profitData.reduce((s, p) => s + p.profit, 0);
  const totalRevenue = profitData.reduce((s, p) => s + p.revenue, 0);
  const totalCost    = profitData.reduce((s, p) => s + p.cost, 0);

  return (
    <div style={S.main}>

      <div className="pm-welcome-row">
        <h2 className="pm-welcome-title">Welcome, PowerMed!</h2>

        <div className="pm-period-pill-wrap">
          <button
            className="pm-period-pill"
            onClick={() => setShowPeriodDropdown((v) => !v)}
          >
            <Calendar size={15} strokeWidth={2.2} />
            <span>{period}</span>
            <IconChevron
              size={13}
              strokeWidth={2.5}
              style={{
                transition: "transform 0.2s",
                transform: showPeriodDropdown ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {showPeriodDropdown && (
            <div className="pm-period-dropdown">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={`pm-period-option${period === opt ? " active" : ""}`}
                  onClick={() => {
                    setPeriod(opt);
                    setShowPeriodDropdown(false);
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pm-metrics-row">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="pm-metric-card"
            style={{ borderTop: `3.5px solid ${m.color}` }}
            onClick={() =>
              m.label === "Gross profit"
                ? setShowProfit(true)
                : onNavigate(NAV_MAP[m.label])
            }
          >
            <div className="pm-metric-card-top">
              <span className="pm-metric-label">{m.label}</span>
              <div className="pm-metric-icon" style={{ background: m.bg, color: m.color }}>
                <m.icon size={24} strokeWidth={2} />
              </div>
            </div>
            <div className="pm-metric-card-body">
              <div>
                <div className="pm-metric-value">{m.value}</div>
                <div className="pm-metric-sub">{m.sub}</div>
              </div>
              <div className="pm-metric-chart-side">
                {m.chart.type === "line" && <SparkLine data={m.chart.data} color={m.color} width={64} height={36} />}
                {m.chart.type === "area" && <SparkArea data={m.chart.data} color={m.color} width={64} height={36} />}
                {m.chart.type === "bars" && <SparkBars data={m.chart.data} color={m.color} width={64} height={36} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pm-dash-bottom">

        {/* ── Stock levels — capped height, scrolls internally ── */}
        <div
          style={{
            ...S.card,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            maxHeight: 580,
            overflow: "hidden",
          }}
          onClick={() => onNavigate("stock")}
        >
          <div style={{ ...S.cardHdr, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <span style={{ ...S.cardTitle, display: "flex", alignItems: "center", gap: 8 }}>
              <Boxes size={17} strokeWidth={2.2} color={COLORS.orange} />
              Stock levels
            </span>
            {lowStockCount > 0 && (
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.coral,
                background: "#ffe4e6",
                borderRadius: 999,
                padding: "4px 10px",
              }}>
                {lowStockCount} low
              </span>
            )}
          </div>

          <div className="pm-stock-list-wrap" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            <table style={{ ...S.tbl, borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, padding: "14px 20px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#a8a29e", background: "#fafaf9", borderBottom: "1px solid #f1f0ee", position: "sticky", top: 0 }}>Item</th>
                  <th style={{ ...S.th, padding: "14px 20px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#a8a29e", background: "#fafaf9", borderBottom: "1px solid #f1f0ee", textAlign: "right", position: "sticky", top: 0 }}>In</th>
                  <th style={{ ...S.th, padding: "14px 20px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#a8a29e", background: "#fafaf9", borderBottom: "1px solid #f1f0ee", textAlign: "right", position: "sticky", top: 0 }}>Out</th>
                  <th style={{ ...S.th, padding: "14px 20px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#a8a29e", background: "#fafaf9", borderBottom: "1px solid #f1f0ee", textAlign: "right", position: "sticky", top: 0 }}>Balance</th>
                  <th style={{ ...S.th, padding: "14px 20px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#a8a29e", background: "#fafaf9", borderBottom: "1px solid #f1f0ee", position: "sticky", top: 0 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stockMap).map(([k, v]) => {
                  const bal = v.inQty - v.outQty;
                  const status = stockStatus(bal);
                  return (
                    <tr key={k}>
                      <td style={{ ...S.td, padding: "16px 20px", borderBottom: "1px solid #f1f0ee", fontWeight: 500 }}>{k}</td>
                      <td style={{ ...S.tdR, padding: "16px 20px", borderBottom: "1px solid #f1f0ee" }}>{v.inQty}</td>
                      <td style={{ ...S.tdR, padding: "16px 20px", borderBottom: "1px solid #f1f0ee" }}>{v.outQty}</td>
                      <td style={{ ...S.tdR, padding: "16px 20px", borderBottom: "1px solid #f1f0ee", fontWeight: 700, color: status.color }}>{bal}</td>
                      <td style={{ ...S.td, padding: "16px 20px", borderBottom: "1px solid #f1f0ee" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          fontSize: 11, fontWeight: 600, color: status.color,
                          background: status.bg, borderRadius: 999, padding: "4px 10px",
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: status.color, flexShrink: 0, display: "inline-block" }} />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          <div className="pm-stats-dark" style={{ cursor: "pointer" }} onClick={() => onNavigate("sales")}>
            <h3>
              <PieChart size={16} strokeWidth={2.2} color={COLORS.orange} />
              Sales by payment type
            </h3>
            <div className="pm-donut-row">
              <svg viewBox="0 0 140 140" width="140" height="140" className="pm-donut-svg">
                <g transform="rotate(-90 70 70)">
                  {donutSegments.map((seg) => {
                    const dash = (seg.pct / 100) * CIRC;
                    const dashOffset = -(seg.offset / 100) * CIRC;
                    return (
                      <circle
                        key={seg.r}
                        cx="70"
                        cy="70"
                        r={RADIUS}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="24"
                        strokeDasharray={`${dash} ${CIRC - dash}`}
                        strokeDashoffset={dashOffset}
                      />
                    );
                  })}
                </g>
              </svg>
              <div className="pm-donut-legend">
                {donutSegments.map((seg) => (
                  <div key={seg.r} className="pm-donut-legend-item">
                    <span className="pm-donut-dot" style={{ background: seg.color }} />
                    <span>{seg.r}</span>
                    <span style={{ fontWeight: 600, color: "var(--pm-text)" }}>{seg.pct.toFixed(0)}%</span>
                    <span style={{ flex: 1, borderBottom: "1.5px dashed #d6d3d1", marginBottom: 3, marginLeft: 4, marginRight: 4 }} />
                    <span style={{ color: "var(--pm-text-muted)", fontSize: 11.5 }}>{peso(seg.val)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ ...S.card, cursor: "pointer", flex: "none" }} onClick={() => onNavigate("sales")}>
            <div style={{ ...S.cardHdr, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...S.cardTitle, display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart3 size={17} strokeWidth={2.2} color={COLORS.orange} />
                Top products by revenue
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#a8a29e" }}>{period}</span>
            </div>

            <div style={{ padding: "4px 0 14px" }}>
              {topProducts.length === 0 && (
                <div style={{ fontSize: 13, color: "#a8a29e", textAlign: "center", padding: "24px 16px" }}>
                  No sales recorded for this period yet.
                </div>
              )}
              {topProducts.map(([name, rev], idx) => {
                const maxRev = topProducts[0][1];
                const pct = Math.round((rev / maxRev) * 100);
                const cleanName = name.replace(/-(\d+mg)/i, " $1");
                return (
                  <div key={name} style={{ marginBottom: idx < topProducts.length - 1 ? 10 : 0, padding: "0 16px" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#292524", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 5 }}>
                          {cleanName}
                        </div>
                        <div style={{ background: "#f0eeeb", height: 11, overflow: "hidden", width: "100%" }}>
                          <div style={{ width: `${pct}%`, maxWidth: "100%", height: "100%", background: COLORS.orange }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.orange, flexShrink: 0, paddingBottom: 2 }}>
                        {peso(rev)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {showProfit && (
        <div style={S.modalBg} onClick={(e) => e.target === e.currentTarget && setShowProfit(false)}>
          <div style={{ ...S.modal, width: 620, maxWidth: "95vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1c1917" }}>Gross profit breakdown</h3>
              <button
                onClick={() => setShowProfit(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#78716c", padding: "2px 6px" }}
              >
                ✕
              </button>
            </div>
            <div style={S.tblWrap}>
              <table style={S.tbl}>
                <thead>
                  <tr>
                    <th style={S.th}>Item</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Revenue (₱)</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Cost (₱)</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Gross Profit (₱)</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {profitData.map((p) => (
                    <tr key={p.item}>
                      <td style={S.td}>{p.item}</td>
                      <td style={S.tdR}>{peso(p.revenue)}</td>
                      <td style={S.tdR}>{peso(p.cost)}</td>
                      <td style={{ ...S.tdR, fontWeight: 600, color: p.profit >= 0 ? COLORS.green : COLORS.coral }}>
                        {peso(p.profit)}
                      </td>
                      <td style={{ ...S.tdR, fontWeight: 600, color: p.margin >= 0 ? COLORS.green : COLORS.coral }}>
                        {p.margin.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ ...S.td, fontWeight: 700 }}>Total</td>
                    <td style={{ ...S.tdR, fontWeight: 700 }}>{peso(totalRevenue)}</td>
                    <td style={{ ...S.tdR, fontWeight: 700 }}>{peso(totalCost)}</td>
                    <td style={{ ...S.tdR, fontWeight: 700, color: totalProfit >= 0 ? COLORS.green : COLORS.coral }}>
                      {peso(totalProfit)}
                    </td>
                    <td style={{ ...S.tdR, fontWeight: 700, color: totalProfit >= 0 ? COLORS.green : COLORS.coral }}>
                      {totalRevenue ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}