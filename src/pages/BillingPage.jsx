import { useState, useMemo } from "react";
import { COLORS, S } from "../styles/tokens";
import { peso, fmtDate } from "../utils/helpers";
import { Badge } from "../components/Badge";
import Pagination, { PER_PAGE } from "../components/Pagination";
import { CreditCard, CheckCircle, XCircle } from "../components/Icons";

export default function BillingPage({ sales, setSales, search: headerSearch }) {
  const [filter, setFilter] = useState("all"); // all | unpaid | paid
  const [coFilter, setCoFilter] = useState("");

  const billedSales = useMemo(() =>
    sales.filter((r) => r.remarks === "Billed"),
    [sales]
  );

  const coList = useMemo(() => [...new Set(billedSales.map((r) => r.co))].sort(), [billedSales]);

  const filtered = useMemo(() => {
    const hq = (headerSearch || "").toLowerCase();
    return billedSales.filter((r) => {
      const matchSearch = !headerSearch ||
        r.customer.toLowerCase().includes(hq) ||
        r.item.toLowerCase().includes(hq);
      const matchFilter = filter === "all" || (filter === "paid" ? r.paid : !r.paid);
      const matchCo = !coFilter || r.co === coFilter;
      return matchSearch && matchFilter && matchCo;
    });
  }, [billedSales, headerSearch, filter, coFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const totalBilled      = billedSales.reduce((s, r) => s + r.price * r.qty, 0);
  const totalPaid        = billedSales.filter((r) => r.paid).reduce((s, r) => s + r.price * r.qty, 0);
  const totalOutstanding = totalBilled - totalPaid;

  const togglePaid = (id) => {
    setSales((prev) => prev.map((r) => r.id === id ? { ...r, paid: !r.paid } : r));
  };

  const markAllPaid = () => {
    const ids = new Set(filtered.filter((r) => !r.paid).map((r) => r.id));
    setSales((prev) => prev.map((r) => ids.has(r.id) ? { ...r, paid: true } : r));
  };

  const summaryCards = [
    { label: "Total billed",      value: peso(totalBilled),      color: COLORS.orange, bg: COLORS.orangeBg },
    { label: "Collected",         value: peso(totalPaid),        color: COLORS.green,  bg: COLORS.greenBg  },
    { label: "Outstanding",       value: peso(totalOutstanding), color: COLORS.coral,  bg: COLORS.coralBg  },
    { label: "Unpaid entries",    value: billedSales.filter((r) => !r.paid).length, color: COLORS.amber, bg: COLORS.amberBg },
  ];

  return (
    <div style={S.main}>
      <div style={S.pageHdr}>
        <h2 style={S.pageTitle}>Accounts Receivable</h2>
        <span style={{ fontSize: 12, color: "#78716c" }}>Billed sales only</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {summaryCards.map((c) => (
          <div key={c.label} style={{
            background: "#fff", borderRadius: 18, padding: "16px 18px",
            boxShadow: "0 10px 30px rgba(28,25,23,0.06), 0 2px 8px rgba(28,25,23,0.03)",
            borderTop: `3.5px solid ${c.color}`,
          }}>
            <div style={{ fontSize: 11, color: "#78716c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <div style={S.cardHdr}>
          <div style={S.searchRow}>
            <div style={{ display: "flex", gap: 4, background: "#f5f5f4", borderRadius: 999, padding: 3 }}>
              {[["all", "All"], ["unpaid", "Unpaid"], ["paid", "Paid"]].map(([v, l]) => (
                <button key={v} onClick={() => { setFilter(v); setCurrentPage(1); }}
                  style={{
                    padding: "5px 14px", borderRadius: 999, border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 12, fontWeight: 600,
                    background: filter === v ? "#fff" : "transparent",
                    color: filter === v ? COLORS.orange : "#78716c",
                    boxShadow: filter === v ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.15s",
                  }}>
                  {l}
                </button>
              ))}
            </div>
            <select style={{ ...S.inputSm, paddingRight: 28 }}
              value={coFilter} onChange={(e) => { setCoFilter(e.target.value); setCurrentPage(1); }}>
              <option value="">All C/O</option>
              {coList.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {filtered.some((r) => !r.paid) && (
              <button onClick={markAllPaid} style={{
                padding: "7px 14px", borderRadius: 999, border: "none", cursor: "pointer",
                fontSize: 12, fontFamily: "inherit", fontWeight: 600,
                background: COLORS.green, color: "#fff",
                boxShadow: "0 4px 12px rgba(22,163,74,0.25)",
              }}>
                Mark filtered as paid
              </button>
            )}
          </div>
        </div>

        <div style={S.tblWrap}>
          <table style={S.tbl}>
            <thead>
              <tr>
                {["Date","Customer","Item","Amount","C/O","Status",""].map((h, i) => (
                  <th key={h + i} style={{ ...S.th, textAlign: i === 3 ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length ? paged.map((r) => (
                <tr key={r.id}>
                  <td style={S.td}>{fmtDate(r.date)}</td>
                  <td style={S.td}>{r.customer}</td>
                  <td style={S.td}>{r.item}</td>
                  <td style={S.tdR}>{peso(r.price * r.qty)}</td>
                  <td style={S.td}>{r.co}</td>
                  <td style={S.td}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                      background: r.paid ? COLORS.greenBg : COLORS.coralBg,
                      color: r.paid ? COLORS.green : COLORS.coral,
                    }}>
                      {r.paid ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {r.paid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td style={S.td}>
                    <button onClick={() => togglePaid(r.id)} style={{
                      padding: "5px 12px", borderRadius: 999, border: "none", cursor: "pointer",
                      fontSize: 11, fontFamily: "inherit", fontWeight: 600,
                      background: r.paid ? "#f5f5f4" : COLORS.green,
                      color: r.paid ? "#78716c" : "#fff",
                      transition: "all 0.15s",
                    }}>
                      {r.paid ? "Mark unpaid" : "Mark paid"}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} style={S.empty}>No billed entries match your filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={currentPage} totalPages={totalPages} total={filtered.length} perPage={PER_PAGE} onPageChange={setCurrentPage} />
      </div>

      {/* C/O breakdown */}
      <div style={S.card}>
        <div style={S.cardHdr}>
          <span style={{ ...S.cardTitle, display: "flex", alignItems: "center", gap: 8 }}>
            <CreditCard size={16} color={COLORS.orange} /> Breakdown by C/O
          </span>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {coList.map((co) => {
            const rows = billedSales.filter((r) => r.co === co);
            const total = rows.reduce((s, r) => s + r.price * r.qty, 0);
            const paid  = rows.filter((r) => r.paid).reduce((s, r) => s + r.price * r.qty, 0);
            const outstanding = total - paid;
            const pct = total ? Math.round((paid / total) * 100) : 0;
            return (
              <div key={co}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{co}</span>
                  <span style={{ fontSize: 12, color: "#78716c" }}>
                    <span style={{ color: COLORS.green, fontWeight: 700 }}>{peso(paid)}</span> paid · <span style={{ color: COLORS.coral, fontWeight: 700 }}>{peso(outstanding)}</span> outstanding
                  </span>
                </div>
                <div style={{ background: "#f5f5f4", borderRadius: 999, height: 8, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: COLORS.green, borderRadius: 999, transition: "width 0.4s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
