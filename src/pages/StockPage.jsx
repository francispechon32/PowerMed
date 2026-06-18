import { useMemo, useState, useEffect } from "react";
import { COLORS, S } from "../styles/tokens";
import { peso, inRange, fmtDateShort } from "../utils/helpers";
import { Calendar, IconChevron } from "../components/Icons";
import Pagination, { PER_PAGE } from "../components/Pagination";

export default function StockPage({ inventory }) {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showPicker, setShowPicker] = useState(false);
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd]     = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => inventory.filter((r) => inRange(r.date, dateRange.start, dateRange.end)), [inventory, dateRange]);

  const stockMap = useMemo(() => {
    const m = {};
    filtered.forEach((r) => {
      if (!m[r.variant]) m[r.variant] = { inQty: 0, inVal: 0, outQty: 0, outVal: 0 };
      if (r.entry === "In") { m[r.variant].inQty += r.qty; m[r.variant].inVal += r.qty * r.cost; }
      else { m[r.variant].outQty += r.qty; m[r.variant].outVal += r.qty * r.cost; }
    });
    return m;
  }, [filtered]);

  const stockEntries = Object.entries(stockMap);

  useEffect(() => { setCurrentPage(1); }, [dateRange]);

  const totalPages = Math.max(1, Math.ceil(stockEntries.length / PER_PAGE));
  const paged      = stockEntries.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <div style={S.main}>
      <div style={S.pageHdr}>
        <h2 style={S.pageTitle}>Stock summary by product</h2>
      </div>
      <div style={{ ...S.card, overflow: "visible" }}>
        <div style={S.cardHdr}>
          <div style={{ position: "relative" }}>
            <button
              className="pm-period-pill"
              onClick={() => { setDraftStart(dateRange.start || ""); setDraftEnd(dateRange.end || ""); setShowPicker(true); }}>
              <Calendar size={15} strokeWidth={2} />
              <span>{dateRange.start ? `${fmtDateShort(dateRange.start)} – ${fmtDateShort(dateRange.end)}` : "All dates"}</span>
              {dateRange.start ? (
                <span onClick={(e) => { e.stopPropagation(); setDateRange({ start: "", end: "" }); }}
                  style={{ marginLeft: 4, color: "#a8a29e", fontSize: 14, lineHeight: 1 }}>✕</span>
              ) : <IconChevron size={14} strokeWidth={2.2} />}
            </button>
            {showPicker && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setShowPicker(false)} />
                <div style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 6, zIndex: 50,
                  background: "#fff", borderRadius: 16, padding: 16,
                  boxShadow: "0 10px 30px rgba(28,25,23,0.12), 0 2px 8px rgba(28,25,23,0.06)",
                  display: "flex", flexDirection: "column", gap: 10, minWidth: 250,
                }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, color: "#78716c", marginBottom: 4, fontWeight: 600 }}>From</label>
                      <input type="date" value={draftStart} onChange={(e) => setDraftStart(e.target.value)}
                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e5e5", fontSize: 12, fontFamily: "inherit", color: "#1c1917", background: "#fff", outline: "none", width: 140 }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, color: "#78716c", marginBottom: 4, fontWeight: 600 }}>To</label>
                      <input type="date" value={draftEnd} onChange={(e) => setDraftEnd(e.target.value)}
                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e5e5", fontSize: 12, fontFamily: "inherit", color: "#1c1917", background: "#fff", outline: "none", width: 140 }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                    <button onClick={() => { setDateRange({ start: "", end: "" }); setShowPicker(false); }}
                      style={{ padding: "6px 14px", borderRadius: 999, border: "none", background: "#f5f5f4", cursor: "pointer", fontSize: 12, fontFamily: "inherit", color: "#44403c", fontWeight: 500 }}>
                      Clear
                    </button>
                    <button onClick={() => { setDateRange({ start: draftStart, end: draftEnd }); setShowPicker(false); }}
                      style={{ padding: "6px 14px", borderRadius: 999, border: "none", background: COLORS.orange, cursor: "pointer", fontSize: 12, fontFamily: "inherit", color: "#fff", fontWeight: 600 }}>
                      Apply
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div style={S.tblWrap}>
          <table style={S.tbl}>
            <thead>
              <tr>
                {["Product","In qty","In value","Out qty","Out value","Balance qty","Balance value","Status"].map((h, i) => (
                  <th key={h} style={{ ...S.th, textAlign: i > 0 && i < 7 ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(([k, v]) => {
                const bQty = v.inQty  - v.outQty;
                const bVal = v.inVal  - v.outVal;
                const status = bQty <= 0 ? "Empty" : bQty <= 2 ? "Low" : "OK";
                const statusBadge = {
                  OK:    { background: COLORS.orangeBg, color: COLORS.orange },
                  Low:   { background: COLORS.amberBg,  color: COLORS.amber  },
                  Empty: { background: COLORS.coralBg,  color: COLORS.coral  },
                }[status];
                return (
                  <tr key={k}>
                    <td style={{ ...S.td, fontWeight: 500 }}>{k}</td>
                    <td style={S.tdR}>{v.inQty}</td>
                    <td style={S.tdR}>{peso(v.inVal)}</td>
                    <td style={S.tdR}>{v.outQty}</td>
                    <td style={S.tdR}>{peso(v.outVal)}</td>
                    <td style={{ ...S.tdR, fontWeight: 600, color: bQty <= 2 ? COLORS.coral : COLORS.orange }}>{bQty}</td>
                    <td style={S.tdR}>{peso(bVal)}</td>
                    <td style={S.td}>
                      <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 500, ...statusBadge }}>{status}</span>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr><td colSpan={8} style={S.empty}>No stock data for selected range.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={currentPage} totalPages={totalPages} total={stockEntries.length} perPage={PER_PAGE} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
