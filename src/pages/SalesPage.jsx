import { useState, useMemo } from "react";
import { REMARKS_LIST, CO_LIST } from "../data/seeds";
import { peso, fmtDate } from "../utils/helpers";
import { S } from "../styles/tokens";
import { Badge, Pill } from "../components/Badge";
import Modal from "../components/Modal";

export default function SalesPage({ sales, setSales }) {
  const [search, setSearch]     = useState("");
  const [remarkF, setRemarkF]   = useState("");
  const [coF, setCoF]           = useState("");
  const [modal, setModal]       = useState(false);

  const filtered = useMemo(() => sales.filter((r) => {
    const q  = !search  || r.customer.toLowerCase().includes(search.toLowerCase()) || r.item.toLowerCase().includes(search.toLowerCase());
    const rm = !remarkF || r.remarks === remarkF;
    const c  = !coF     || r.co === coF;
    return q && rm && c;
  }), [sales, search, remarkF, coF]);

  const total = filtered.reduce((s, r) => s + r.price * r.qty, 0);
  const handleAdd = (row) => setSales((prev) => [row, ...prev]);

  return (
    <div style={S.main}>
      {modal && <Modal type="sales" onClose={() => setModal(false)} onSave={handleAdd} />}
      <div style={S.card}>
        <div style={S.cardHdr}>
          <span style={S.cardTitle}>🧾 Sales transactions — <strong>{peso(total)}</strong> total</span>
          <div style={S.searchRow}>
            <input style={{ ...S.inputSm, width: 160 }} placeholder="Customer / item…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select style={S.inputSm} value={remarkF} onChange={(e) => setRemarkF(e.target.value)}>
              <option value="">All remarks</option>
              {REMARKS_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select style={S.inputSm} value={coF} onChange={(e) => setCoF(e.target.value)}>
              <option value="">All C/O</option>
              {CO_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button style={S.addBtn} onClick={() => setModal(true)}>＋ Add sale</button>
          </div>
        </div>
        <div style={S.tblWrap}>
          <table style={S.tbl}>
            <thead>
              <tr>
                {["Date","Customer","Price","Qty","Amount","Remarks","C/O","Item"].map((h, i) => (
                  <th key={h} style={{ ...S.th, textAlign: [2,3,4].includes(i) ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((r) => (
                <tr key={r.id}>
                  <td style={S.td}>{fmtDate(r.date)}</td>
                  <td style={S.td}>{r.customer}</td>
                  <td style={S.tdR}>{peso(r.price)}</td>
                  <td style={S.tdR}>{r.qty}</td>
                  <td style={S.tdR}>{peso(r.price * r.qty)}</td>
                  <td style={S.td}><Badge label={r.remarks} /></td>
                  <td style={S.td}>{r.co}</td>
                  <td style={S.td}><Pill label={r.item} /></td>
                </tr>
              )) : (
                <tr><td colSpan={8} style={S.empty}>No sales match your filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
