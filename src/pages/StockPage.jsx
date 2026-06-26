import { useMemo, useState, useEffect } from "react";
import { COLORS, S } from "../styles/tokens";
import { peso, inRange, fmtDateShort, fmtDate } from "../utils/helpers";
import { Calendar, IconChevron, Download } from "../components/Icons";
import Pagination, { PER_PAGE } from "../components/Pagination";
import { exportCsv } from "../utils/exportCsv";

export default function StockPage({ inventory, search }) {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showPicker, setShowPicker] = useState(false);
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd]     = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => inventory.filter((r) => inRange(r.date, dateRange.start, dateRange.end)), [inventory, dateRange]);

  const stockMap = useMemo(() => {
    const m = {};

    // When a start date is set, compute opening balance from all transactions before it
    if (dateRange.start) {
      inventory
        .filter((r) => new Date(r.date + "T00:00:00") < new Date(dateRange.start + "T00:00:00"))
        .forEach((r) => {
          if (!m[r.variant]) m[r.variant] = { openingQty: 0, openingVal: 0, inQty: 0, inVal: 0, outQty: 0, outVal: 0, expiries: [] };
          if (r.entry === "In") { m[r.variant].openingQty += r.qty; m[r.variant].openingVal += r.qty * r.cost; }
          else { m[r.variant].openingQty -= r.qty; m[r.variant].openingVal -= r.qty * r.cost; }
        });
    }

    filtered.forEach((r) => {
      if (!m[r.variant]) m[r.variant] = { openingQty: 0, openingVal: 0, inQty: 0, inVal: 0, outQty: 0, outVal: 0, expiries: [] };
      if (r.entry === "In") {
        m[r.variant].inQty += r.qty;
        m[r.variant].inVal += r.qty * r.cost;
        if (r.expiryDate) m[r.variant].expiries.push(r.expiryDate);
      } else {
        m[r.variant].outQty += r.qty;
        m[r.variant].outVal += r.qty * r.cost;
      }
    });
    return m;
  }, [inventory, filtered, dateRange.start]);

  const today = new Date();
  const in30  = new Date(today.getTime() + 30 * 86400000);

  const stockEntries = Object.entries(stockMap).filter(([k]) =>
    !search || k.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => { setCurrentPage(1); }, [dateRange, search]);

  const totalPages = Math.max(1, Math.ceil(stockEntries.length / PER_PAGE));
  const paged      = stockEntries.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleExport = () => {
    exportCsv(
      "stock.csv",
      ["Product","In Qty","In Value","Out Qty","Out Value","Balance Qty","Balance Value","Status","Nearest Expiry"],
      stockEntries.map(([k, v]) => {
        const bQty = v.openingQty + v.inQty - v.outQty;
        const bVal = v.openingVal + v.inVal - v.outVal;
        const status = bQty <= 0 ? "Empty" : bQty <= 2 ? "Low" : "OK";
        const nearestExpiry = v.expiries.length
          ? v.expiries.sort()[0]
          : "";
        return [k, v.inQty, v.inVal.toFixed(2), v.outQty, v.outVal.toFixed(2), bQty, bVal.toFixed(2), status, nearestExpiry];
      })
    );
  };

  return (
    <div style={S.main}>
      <div style={S.pageHdr}>
        <h2 style={S.pageTitle}>Stock summary by product</h2>
      </div>
      <div style={{ ...S.card, overflow: "visible" }}>
        <div style={S.cardHdr}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <button
                className="pm-period-pill"
                onClick={() => { setDraftStart(dateRange.start || ""); setDraftEnd(dateRange.end || ""); setShowPicker(true); }}>
                <Calendar size={15} strokeWidth={2} />
                <span>
                  {dateRange.start && dateRange.end
                    ? `${fmtDateShort(dateRange.start)} – ${fmtDateShort(dateRange.end)}`
                    : dateRange.start
                    ? `From ${fmtDateShort(dateRange.start)}`
                    : dateRange.end
                    ? `Until ${fmtDateShort(dateRange.end)}`
                    : "All dates"}
                </span>
                {(dateRange.start || dateRange.end) ? (
                  <span onClick={(e) => { e.stopPropagation(); setDateRange({ start: "", end: "" }); }}
                    style={{ marginLeft: 4, color: "#a8a29e", fontSize: 14, lineHeight: 1 }}>✕</span>
                ) : <IconChevron size={14} strokeWidth={2.2} />}
              </button>
              {showPicker && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setShowPicker(false)} />
                  <div style={{
                    position: "absolute", top: "100%", left: 0, marginTop: 6, zIndex: 50,
                    background: "#fff", borderRadius: 16, padding: 16,
                    boxShadow: "0 10px 30px rgba(28,25,23,0.12), 0 2px 8px rgba(28,25,23,0.06)",
                    display: "flex", flexDirection: "column", gap: 10, minWidth: 250,
                  }}>
                    <div>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: "block", fontSize: 11, color: "#78716c", marginBottom: 4, fontWeight: 600 }}>From</label>
                        <input type="date" value={draftStart} onChange={(e) => setDraftStart(e.target.value)}
                          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e5e5", fontSize: 12, fontFamily: "inherit", color: "#1c1917", background: "#fff", outline: "none", width: 180 }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "#78716c", marginBottom: 4, fontWeight: 600 }}>To</label>
                        <input type="date" value={draftEnd} onChange={(e) => setDraftEnd(e.target.value)}
                          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e5e5", fontSize: 12, fontFamily: "inherit", color: "#1c1917", background: "#fff", outline: "none", width: 180 }} />
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
            <button style={{ ...S.addBtn, background: "#f5f5f4", color: "#44403c", boxShadow: "none" }} onClick={handleExport}>
              <Download size={14} /> Export
            </button>
          </div>
        </div>
        <div style={S.tblWrap}>
          <table style={S.tbl}>
            <thead>
              <tr>
                {["Product","In qty","In value","Out qty","Out value","Balance qty","Balance value","Nearest Expiry","Status"].map((h, i) => (
                  <th key={h} style={{ ...S.th, textAlign: i > 0 && i < 7 ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(([k, v]) => {
                const bQty = v.openingQty + v.inQty - v.outQty;
                const bVal = v.openingVal + v.inVal - v.outVal;
                const status = bQty <= 0 ? "Empty" : bQty <= 2 ? "Low" : "OK";
                const statusBadge = {
                  OK:    { background: COLORS.orangeBg, color: COLORS.orange },
                  Low:   { background: COLORS.amberBg,  color: COLORS.amber  },
                  Empty: { background: COLORS.coralBg,  color: COLORS.coral  },
                }[status];

                const futureExpiries = v.expiries
                  .filter((d) => new Date(d) >= today)
                  .sort();
                const nearestExpiry = futureExpiries[0] || null;
                const isExpiringSoon = nearestExpiry && new Date(nearestExpiry) <= in30;

                return (
                  <tr key={k}>
                    <td style={{ ...S.td, fontWeight: 500 }}>{k}</td>
                    <td style={S.tdR}>{v.inQty}</td>
                    <td style={S.tdR}>{peso(v.inVal)}</td>
                    <td style={S.tdR}>{v.outQty}</td>
                    <td style={S.tdR}>{peso(v.outVal)}</td>
                    <td style={{ ...S.tdR, fontWeight: 600, color: bQty <= 2 ? COLORS.coral : COLORS.orange }}>{bQty}</td>
                    <td style={S.tdR}>{peso(bVal)}</td>
                    <td style={{ ...S.td, fontSize: 11, color: isExpiringSoon ? COLORS.coral : "#78716c", fontWeight: isExpiringSoon ? 600 : 400 }}>
                      {nearestExpiry ? (
                        <span title={nearestExpiry}>
                          {fmtDate(nearestExpiry)}{isExpiringSoon ? " ⚠" : ""}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={S.td}>
                      <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 500, ...statusBadge }}>{status}</span>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr><td colSpan={9} style={S.empty}>No stock data for selected range.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={currentPage} totalPages={totalPages} total={stockEntries.length} perPage={PER_PAGE} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}