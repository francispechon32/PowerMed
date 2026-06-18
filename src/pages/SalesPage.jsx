import { useState, useMemo, useEffect } from "react";
import { REMARKS_LIST, CO_LIST } from "../data/seeds";
import { peso, fmtDate } from "../utils/helpers";
import { S } from "../styles/tokens";
import { Badge, Pill } from "../components/Badge";
import Modal from "../components/Modal";
import Pagination, { PER_PAGE } from "../components/Pagination";
import SelectDropdown from "../components/SelectDropdown";

const REMARK_OPTIONS = REMARKS_LIST.map((r) => ({ value: r, label: r }));
const CO_OPTIONS = CO_LIST.map((c) => ({ value: c, label: c }));

export default function SalesPage({ sales, setSales }) {
  const [search, setSearch]   = useState("");
  const [remarkF, setRemarkF] = useState("");
  const [coF, setCoF]         = useState("");
  const [modal, setModal]     = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => sales.filter((r) => {
    const incStr = (r.inclusives || []).join(" ").toLowerCase();
    const q  = !search  || r.customer.toLowerCase().includes(search.toLowerCase()) || r.item.toLowerCase().includes(search.toLowerCase()) || incStr.includes(search.toLowerCase());
    const rm = !remarkF || r.remarks === remarkF;
    const c  = !coF     || r.co === coF;
    return q && rm && c;
  }), [sales, search, remarkF, coF]);

  useEffect(() => { setCurrentPage(1); }, [search, remarkF, coF]);

  const total      = filtered.reduce((s, r) => s + r.price * r.qty, 0);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged      = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleSave = (row) => {
    if (editRow) {
      setSales((prev) => prev.map((r) => r.id === editRow.id ? row : r));
    } else {
      setSales((prev) => [row, ...prev]);
    }
  };
  const openAdd  = () => { setEditRow(null); setModal(true); };
  const openEdit = (r) => { setEditRow(r); setModal(true); };
  const handleClose = () => { setEditRow(null); setModal(false); };

  return (
    <div style={S.main}>
      {modal && <Modal key={editRow?.id ?? "new"} type="sales" editData={editRow} onClose={handleClose} onSave={handleSave} />}
      <div style={S.pageHdr}>
        <h2 style={S.pageTitle}>Sales transactions</h2>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1c1917" }}>Total: <strong>{peso(total)}</strong></span>
      </div>
      <div style={S.card}>
        <div style={S.cardHdr}>
          <div style={S.searchRow}>
            <input style={{ ...S.inputSm, width: 160 }} placeholder="Customer / item…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <SelectDropdown value={remarkF} onChange={setRemarkF} options={REMARK_OPTIONS} placeholder="All remarks" />
            <SelectDropdown value={coF} onChange={setCoF} options={CO_OPTIONS} placeholder="All C/O" />
            <button style={S.addBtn} onClick={openAdd}>＋ Add sale</button>
          </div>
        </div>
        <div style={S.tblWrap}>
          <table style={S.tbl}>
            <thead>
              <tr>
                {["Date","Customer","Price","Qty","Amount","Remarks","C/O","Item","Inclusives"].map((h, i) => (
                  <th key={h} style={{ ...S.th, textAlign: [2,3,4].includes(i) ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length ? paged.map((r) => (
                <tr key={r.id} onClick={() => openEdit(r)} style={{ cursor: "pointer" }}>
                  <td style={S.td}>{fmtDate(r.date)}</td>
                  <td style={S.td}>{r.customer}</td>
                  <td style={S.tdR}>{peso(r.price)}</td>
                  <td style={S.tdR}>{r.qty}</td>
                  <td style={S.tdR}>{peso(r.price * r.qty)}</td>
                  <td style={S.td}><Badge label={r.remarks} /></td>
                  <td style={S.td}>{r.co}</td>
                  <td style={S.td}><Pill label={r.item} /></td>
                  <td style={S.td}>
                    {(r.inclusives || []).length > 0
                      ? r.inclusives.map((inc) => <Pill key={inc} label={inc} />)
                      : <span style={{ color: "#a8a29e", fontSize: 11 }}>—</span>}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={9} style={S.empty}>No sales match your filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={currentPage} totalPages={totalPages} total={filtered.length} perPage={PER_PAGE} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
