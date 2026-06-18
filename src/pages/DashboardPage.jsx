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
} from "../components/Icons";
import { COLORS, S } from "../styles/tokens";
import { REMARKS_LIST } from "../data/seeds";
import { peso, inPeriod } from "../utils/helpers";
import { Pill } from "../components/Badge";

const NAV_MAP = {
  "Stock movement": "stock",
  "Total sales": "sales",
  "Charity given": "charity",
};

export default function DashboardPage({ inventory, sales, charity, onNavigate }) {
  const [period, setPeriod] = useState("All Time");
  const [showProfit, setShowProfit] = useState(false);

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

  const metrics = [
    {
      label: "Stock movement",
      value: balance,
      sub: "Units on hand",
      color: "#2563eb",
      bg: "#dbeafe",
      icon: PackagePlus,
      pct: totalIn ? Math.min(100, Math.round((balance / totalIn) * 100)) : 0,
    },
    {
      label: "Total sales",
      value: peso(totalSales),
      sub: `${filteredSales.length} transactions`,
      color: COLORS.amber,
      bg: COLORS.amberBg,
      icon: Wallet,
      pct: 85,
    },
    {
      label: "Charity given",
      value: totalCharity,
      sub: `${filteredCharity.length} entries`,
      color: "#e11d48",
      bg: "#ffe4e6",
      icon: HeartHandshake,
      pct: totalOut ? Math.min(100, Math.round((totalCharity / totalOut) * 100)) : 0,
    },
    {
      label: "Gross profit",
      value: peso(grossProfit),
      sub: `${totalSales ? ((grossProfit / totalSales) * 100).toFixed(1) : 0}% margin`,
      color: COLORS.green,
      bg: COLORS.greenBg,
      icon: TrendingUp,
      pct: totalSales ? Math.min(100, Math.round((grossProfit / totalSales) * 100)) : 0,
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

        <div className="pm-period-select-wrap">
          <select
            className="pm-period-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option>All Time</option>
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Week</option>
            <option>This Year</option>
          </select>
          <IconChevron size={16} strokeWidth={2.2} className="pm-period-chevron" />
        </div>
      </div>

      <div className="pm-metrics-row">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="pm-metric-card" style={{ background: m.bg, cursor: "pointer" }}
              onClick={() => m.label === "Gross profit" ? setShowProfit(true) : onNavigate(NAV_MAP[m.label])}>
              <div className="pm-metric-icon" style={{ color: m.color }}>
                <Icon size={22} strokeWidth={2} />
              </div>
              <div className="pm-metric-label">{m.label}</div>
              <div className="pm-metric-value">{m.value}</div>
              <div className="pm-metric-sub">{m.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="pm-dash-bottom">
        <div style={{ ...S.card, cursor: "pointer" }} onClick={() => onNavigate("stock")}>
          <div style={S.cardHdr}>
            <span style={{ ...S.cardTitle, display: "flex", alignItems: "center", gap: 8 }}>
              <Boxes size={17} strokeWidth={2.2} color={COLORS.orange} />
              Stock levels
            </span>
          </div>
          <div style={S.tblWrap}>
            <table style={S.tbl}>
              <thead>
                <tr>
                  <th style={S.th}>Product</th>
                  <th style={{ ...S.th, textAlign: "right" }}>In</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Out</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stockMap).slice(0, 10).map(([k, v]) => {
                  const bal = v.inQty - v.outQty;
                  return (
                    <tr key={k}>
                      <td style={S.td}><Pill label={k} /></td>
                      <td style={S.tdR}>{v.inQty}</td>
                      <td style={S.tdR}>{v.outQty}</td>
                      <td style={{ ...S.tdR, fontWeight: 600, color: bal <= 2 ? COLORS.coral : COLORS.orange }}>{bal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="pm-stats-dark" style={{ cursor: "pointer" }} onClick={() => onNavigate("sales")}>
            <h3>
              <PieChart size={16} strokeWidth={2.2} />
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
                    <span>{seg.r} — {seg.pct.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ ...S.card, cursor: "pointer" }} onClick={() => onNavigate("sales")}>
            <div style={S.cardHdr}>
              <span style={{ ...S.cardTitle, display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart3 size={17} strokeWidth={2.2} color={COLORS.orange} />
                Top products by revenue
              </span>
            </div>
            <div style={{ padding: 20 }}>
              {topProducts.map(([name, rev]) => {
                const maxRev = topProducts[0][1];
                const pct = Math.round((rev / maxRev) * 100);
                return (
                  <div key={name} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: "#44403c", fontWeight: 500 }}>{name.replace("-10mg", "").replace("-30mg", " 30mg")}</span>
                      <span style={{ fontWeight: 700, color: COLORS.orange }}>{peso(rev)}</span>
                    </div>
                    <div style={{ background: "#f5f5f4", borderRadius: 999, height: 6, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${COLORS.orange}, ${COLORS.amber})`, borderRadius: 999 }} />
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
              <button onClick={() => setShowProfit(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#78716c", padding: "2px 6px" }}>
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
                      <td style={{ ...S.tdR, fontWeight: 600, color: p.profit >= 0 ? COLORS.green : COLORS.coral }}>{peso(p.profit)}</td>
                      <td style={{ ...S.tdR, fontWeight: 600, color: p.margin >= 0 ? COLORS.green : COLORS.coral }}>{p.margin.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ ...S.td, fontWeight: 700 }}>Total</td>
                    <td style={{ ...S.tdR, fontWeight: 700 }}>{peso(totalRevenue)}</td>
                    <td style={{ ...S.tdR, fontWeight: 700 }}>{peso(totalCost)}</td>
                    <td style={{ ...S.tdR, fontWeight: 700, color: totalProfit >= 0 ? COLORS.green : COLORS.coral }}>{peso(totalProfit)}</td>
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
