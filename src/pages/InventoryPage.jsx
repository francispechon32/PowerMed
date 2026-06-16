import { useState, useMemo } from "react";
import { PRODUCTS } from "../data/seeds";
import { peso, fmtDate } from "../utils/helpers";
import { S } from "../styles/tokens";
import { Badge } from "../components/Badge";
import Modal from "../components/Modal";

export default function InventoryPage({ inventory, setInventory }) {
  const [search, setSearch]     = useState("");
  const [entryF, setEntryF]     = useState("");
  const [productF, setProductF] = useState("");
  const [modal, setModal]       = useState(false);

  const filtered = useMemo(() => inventory.filter((r) => {
    const q = !search || r.variant.toLowerCase().includes(search.toLowerCase()) || r.date.includes(search);
    const e = !entryF   || r.entry === entryF;
    const p = !productF || r.variant === productF;
    return q && e && p;
  }), [inventory, search, entryF, productF]);

  const handleAdd = (row) => setInventory((prev) => [row, ...prev]);

  return (
    <div style={S.main}>
      {modal && <Modal type="inv" onClose={() => setModal(false)} onSave={handleAdd} />}
      <div style={S.card}>
        <div style={S.cardHdr}>
          <span style={S.cardTitle}>📦 Inventory log</span>
          <div style={S.searchRow}>
            <input style={{ ...S.inputSm, width: 140 }} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select style={S.inputSm} value={entryF} onChange={(e) => setEntryF(e.target.value)}>
              <option value="">All entries</option>
              <option value="In">In</option>
              <option value="Out">Out</option>
            </select>
            <select style={S.inputSm} value={productF} onChange={(e) => setProductF(e.target.value)}>
              <option value="">All products</option>
              {PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <button style={S.addBtn} onClick={() => setModal(true)}>＋ Add entry</button>
          </div>
        </div>
        <div style={S.tblWrap}>
          <table style={S.tbl}>
            <thead>
              <tr>
                {["Date","Variant","Cost","Qty","Amount","Entry"].map((h, i) => (
                  <th key={h} style={{ ...S.th, textAlign: i >= 2 && i <= 4 ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((r) => (
                <tr key={r.id}>
                  <td style={S.td}>{fmtDate(r.date)}</td>
                  <td style={S.td}>{r.variant}</td>
                  <td style={S.tdR}>{peso(r.cost)}</td>
                  <td style={S.tdR}>{r.qty}</td>
                  <td style={S.tdR}>{peso(r.qty * r.cost)}</td>
                  <td style={S.td}><Badge label={r.entry} /></td>
                </tr>
              )) : (
                <tr><td colSpan={6} style={S.empty}>No entries match your filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
