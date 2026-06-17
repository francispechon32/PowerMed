import { useMemo } from "react";
import { COLORS, S } from "../styles/tokens";
import { REMARKS_LIST } from "../data/seeds";
import { peso, getGreeting } from "../utils/helpers";
import { Pill } from "../components/Badge";

export default function DashboardPage({ inventory, sales, charity }) {
  const totalIn    = inventory.filter((r) => r.entry === "In").reduce((s, r) => s + r.qty, 0);
  const totalInVal = inventory.filter((r) => r.entry === "In").reduce((s, r) => s + r.qty * r.cost, 0);
  const totalOut   = inventory.filter((r) => r.entry === "Out").reduce((s, r) => s + r.qty, 0);
  const totalOutVal= inventory.filter((r) => r.entry === "Out").reduce((s, r) => s + r.qty * r.cost, 0);
  const balance    = totalIn - totalOut;
  const totalSales = sales.reduce((s, r) => s + r.price * r.qty, 0);
  const totalCharity= charity.reduce((s, r) => s + r.qty, 0);
  const grossProfit = totalSales - totalOutVal;

  const stockMap = useMemo(() => {
    const m = {};
    inventory.forEach((r) => {
      if (!m[r.variant]) m[r.variant] = { inQty: 0, outQty: 0 };
      if (r.entry === "In") m[r.variant].inQty += r.qty;
      else m[r.variant].outQty += r.qty;
    });
    return m; 
  }, [inventory]);

  const topProducts = useMemo(() => {
    const rev = {};
    sales.forEach((r) => { rev[r.item.trim()] = (rev[r.item.trim()] || 0) + r.price * r.qty; });
    return Object.entries(rev).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [sales]);

  const metrics = [
    { label: "Items in",      value: totalIn,      sub: `${peso(totalInVal)} cost value`,  color: COLORS.orange, bg: COLORS.orangeBg, icon: "📥", pct: 100 },
    { label: "Items out",     value: totalOut,     sub: `${peso(totalOutVal)} cost value`,  color: COLORS.coral,  bg: COLORS.coralBg,  icon: "📤", pct: Math.round((totalOut / totalIn) * 100) || 0 },
    { label: "Balance",       value: balance,      sub: `${peso(totalInVal - totalOutVal)} remaining`, color: COLORS.blue, bg: COLORS.blueBg, icon: "⚖️", pct: Math.round((balance / totalIn) * 100) || 0 },
    { label: "Total sales",   value: peso(totalSales), sub: `${sales.length} transactions`, color: COLORS.amber, bg: COLORS.amberBg, icon: "💰", pct: 85 },
    { label: "Charity given", value: totalCharity, sub: `${charity.length} entries`,        color: "#78716c", bg: "#f5f5f4", icon: "❤️", pct: Math.min(100, Math.round((totalCharity / totalOut) * 100)) || 0 },
    { label: "Gross profit",  value: peso(grossProfit), sub: `${totalSales ? ((grossProfit / totalSales) * 100).toFixed(1) : 0}% margin`, color: COLORS.green, bg: COLORS.greenBg, icon: "📈", pct: totalSales ? Math.min(100, Math.round((grossProfit / totalSales) * 100)) : 0 },
  ];

  const paymentStats = REMARKS_LIST.map((r) => {
    const cnt = sales.filter((s) => s.remarks === r).length;
    const val = sales.filter((s) => s.remarks === r).reduce((a, s) => a + s.price * s.qty, 0);
    return { r, cnt, val };
  });

  return (
    <div style={S.main}>
      <div className="pm-dash-top">
        <div className="pm-hero-card">
          <div>
            <h2>{getGreeting()}, PowerMed!</h2>
            <p>Track inventory, sales, and charity distribution — all in one place.</p>
          </div>
          <div className="pm-hero-emoji" aria-hidden>⚗️</div>
        </div>
        <div className="pm-invite-card">
          <div>
            <h3>Inventory overview</h3>
            <p>{Object.keys(stockMap).length} products tracked · {balance} units on hand</p>
          </div>
          <div style={{ fontSize: 48 }} aria-hidden>📦</div>
        </div>
      </div>

      <div className="pm-metrics-row">
        {metrics.map((m, i) => (
          <div key={i} className="pm-metric-card">
            <div className="pm-metric-icon" style={{ background: m.bg, color: m.color }}>{m.icon}</div>
            <div className="pm-metric-label">{m.label}</div>
            <div className="pm-metric-value" style={{ color: m.color }}>{m.value}</div>
            <div className="pm-metric-sub">{m.sub}</div>
            <div className="pm-progress">
              <div className="pm-progress-bar" style={{ width: `${Math.min(100, m.pct)}%`, background: m.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="pm-dash-bottom">
        <div style={S.card}>
          <div style={S.cardHdr}><span style={S.cardTitle}>📦 Stock levels</span></div>
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
          <div style={S.card}>
            <div style={S.cardHdr}><span style={S.cardTitle}>📊 Top products by revenue</span></div>
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

          <div className="pm-stats-dark">
            <h3>💳 Sales by payment type</h3>
            <div className="pm-stats-list">
              {paymentStats.map(({ r, cnt, val }) => (
                <div key={r} className="pm-stats-item">
                  <span>{r} · {cnt} txns</span>
                  <strong>{peso(val)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
