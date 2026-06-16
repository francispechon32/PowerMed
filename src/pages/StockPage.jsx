import { useMemo } from "react";
import { COLORS, S } from "../styles/tokens";
import { peso } from "../utils/helpers";

export default function StockPage({ inventory }) {
  const stockMap = useMemo(() => {
    const m = {};
    inventory.forEach((r) => {
      if (!m[r.variant]) m[r.variant] = { inQty: 0, inVal: 0, outQty: 0, outVal: 0 };
      if (r.entry === "In") { m[r.variant].inQty += r.qty; m[r.variant].inVal += r.qty * r.cost; }
      else { m[r.variant].outQty += r.qty; m[r.variant].outVal += r.qty * r.cost; }
    });
    return m;
  }, [inventory]);

  return (
    <div style={S.main}>
      <div style={S.card}>
        <div style={S.cardHdr}><span style={S.cardTitle}>📊 Stock summary by product</span></div>
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
              {Object.entries(stockMap).map(([k, v]) => {
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
