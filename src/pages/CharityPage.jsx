import { useState, useMemo, useEffect } from "react";
import { COLORS, S } from "../styles/tokens";
import { peso, fmtDate } from "../utils/helpers";
import { Pill } from "../components/Badge";
import Modal from "../components/Modal";
import { HeartHandshake, Wallet, TrendingUp, BarChart3 } from "../components/Icons";
import Pagination, { PER_PAGE } from "../components/Pagination";

export default function CharityPage({ charity, setCharity, search: headerSearch }) {
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => charity.filter((r) => {
    const sq = search.toLowerCase();
    const q  = !search || r.beneficiary.toLowerCase().includes(sq) || r.item.toLowerCase().includes(sq);
    const hq = headerSearch ? headerSearch.toLowerCase() : "";
    const h  = !headerSearch || r.beneficiary.toLowerCase().includes(hq) || r.item.toLowerCase().includes(hq);
    return q && h;
  }), [charity, search, headerSearch]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const totalQty = charity.reduce((s, r) => s + r.qty, 0);
  const totalVal = charity.reduce((s, r) => s + r.qty * r.cost, 0);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged      = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleSave = (row) => {
    if (editRow) {
      setCharity((prev) => prev.map((r) => r.id === editRow.id ? row : r));
    } else {
      setCharity((prev) => [row, ...prev]);
    }
  };
  const openAdd  = () => { setEditRow(null); setModal(true); };
  const openEdit = (r) => { setEditRow(r); setModal(true); };
  const handleClose = () => { setEditRow(null); setModal(false); };

  return (
    <div style={S.main}>
      {modal && <Modal key={editRow?.id ?? "new"} type="charity" editData={editRow} onClose={handleClose} onSave={handleSave} />}
      <div className="pm-metrics-row">
        {[
          { label: "Total units given",  value: totalQty,                                               sub: "Units distributed",  color: "#e11d48",    bg: "#ffe4e6",       icon: HeartHandshake },
          { label: "Total value",        value: peso(totalVal),                                         sub: "Total cost",          color: COLORS.amber, bg: COLORS.amberBg, icon: Wallet         },
          { label: "Beneficiaries",      value: [...new Set(charity.map((r) => r.beneficiary))].length, sub: "Unique recipients",   color: COLORS.blue,  bg: COLORS.blueBg,  icon: TrendingUp     },
          { label: "Entries",            value: charity.length,                                         sub: "All records",         color: COLORS.orange,bg: COLORS.orangeBg,icon: BarChart3      },
        ].map((m) => (
          <div key={m.label} className="pm-metric-card" style={{ borderTop: `3.5px solid ${m.color}` }}>
            <div className="pm-metric-card-top">
              <span className="pm-metric-label">{m.label}</span>
              <div className="pm-metric-icon" style={{ background: m.bg, color: m.color }}>
                <m.icon size={24} strokeWidth={2} />
              </div>
            </div>
            <div className="pm-metric-value">{m.value}</div>
            <div className="pm-metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>
      <div style={S.pageHdr}>
        <h2 style={S.pageTitle}>Charity distribution log</h2>
      </div>
      <div style={S.card}>
        <div style={S.cardHdr}>
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
              {paged.length ? paged.map((r) => (
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
        <Pagination page={currentPage} totalPages={totalPages} total={filtered.length} perPage={PER_PAGE} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
