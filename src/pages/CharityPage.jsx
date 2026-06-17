import { useState, useMemo } from "react";
import { COLORS, S } from "../styles/tokens";
import { peso, fmtDate } from "../utils/helpers";
import { Pill } from "../components/Badge";
import Modal from "../components/Modal";

export default function CharityPage({ charity, setCharity }) {
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState(false);
  const [editRow, setEditRow]   = useState(null);

  const filtered = useMemo(() => charity.filter((r) =>
    !search ||
    r.beneficiary.toLowerCase().includes(search.toLowerCase()) ||
    r.item.toLowerCase().includes(search.toLowerCase())
  ), [charity, search]);

  const totalQty = charity.reduce((s, r) => s + r.qty, 0);
  const totalVal = charity.reduce((s, r) => s + r.qty * r.cost, 0);
  const handleSave = (row) => {
    if (editRow) {
      setCharity((prev) => prev.map((r) => r.id === editRow.id ? row : r));
    } else {
      setCharity((prev) => [row, ...prev]);
    }
  };
  const openAdd = () => { setEditRow(null); setModal(true); };
  const openEdit = (r) => { setEditRow(r); setModal(true); };
  const handleClose = () => { setEditRow(null); setModal(false); };

  return (
    <div style={S.main}>
      {modal && <Modal key={editRow?.id ?? "new"} type="charity" editData={editRow} onClose={handleClose} onSave={handleSave} />}
      <div style={S.metricsGrid}>
        <div style={S.metric}><div style={S.metricLabel}>Total units given</div><div style={{ ...S.metricValue, color: COLORS.orange }}>{totalQty}</div></div>
        <div style={S.metric}><div style={S.metricLabel}>Total value (cost)</div><div style={{ ...S.metricValue, color: COLORS.amber }}>{peso(totalVal)}</div></div>
        <div style={S.metric}><div style={S.metricLabel}>Beneficiaries</div><div style={{ ...S.metricValue, color: COLORS.blue }}>{[...new Set(charity.map((r) => r.beneficiary))].length}</div></div>
        <div style={S.metric}><div style={S.metricLabel}>Entries</div><div style={{ ...S.metricValue }}>{charity.length}</div></div>
      </div>
      <div style={S.card}>
        <div style={S.cardHdr}>
          <span style={S.cardTitle}>❤️ Charity distribution log</span>
          <div style={S.searchRow}>
            <input style={{ ...S.inputSm, width: 180 }} placeholder="Beneficiary / item…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button style={S.addBtn} onClick={openAdd}>＋ Add entry</button>
          </div>
        </div>
        <div style={S.tblWrap}>
          <table style={S.tbl}>
            <thead>
              <tr>
                {["Date","Beneficiary","Cost","Qty","Amount","Item"].map((h, i) => (
                  <th key={h} style={{ ...S.th, textAlign: [2,3,4].includes(i) ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((r) => (
                <tr key={r.id} onClick={() => openEdit(r)} style={{ cursor: "pointer" }}>
                  <td style={S.td}>{fmtDate(r.date)}</td>
                  <td style={S.td}>{r.beneficiary}</td>
                  <td style={S.tdR}>{peso(r.cost)}</td>
                  <td style={S.tdR}>{r.qty}</td>
                  <td style={S.tdR}>{peso(r.qty * r.cost)}</td>
                  <td style={S.td}><Pill label={r.item} /></td>
                </tr>
              )) : (
                <tr><td colSpan={6} style={S.empty}>No entries found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
