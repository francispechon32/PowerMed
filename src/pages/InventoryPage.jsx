import { useState, useMemo, useEffect } from "react";
import { PRODUCTS } from "../data/seeds";
import { peso, fmtDate } from "../utils/helpers";
import { S } from "../styles/tokens";
import { Badge } from "../components/Badge";
import Modal from "../components/Modal";
import Pagination, { PER_PAGE } from "../components/Pagination";
import SelectDropdown from "../components/SelectDropdown";

const ENTRY_OPTIONS = [
  { value: "In", label: "In" },
  { value: "Out", label: "Out" },
];
const PRODUCT_OPTIONS = PRODUCTS.map((p) => ({ value: p, label: p }));

export default function InventoryPage({ inventory, setInventory, search: headerSearch }) {
  const [search, setSearch]     = useState("");
  const [entryF, setEntryF]     = useState("");
  const [productF, setProductF] = useState("");
  const [modal, setModal]       = useState(false);
  const [editRow, setEditRow]   = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => inventory.filter((r) => {
    const sq = search.toLowerCase();
    const q  = !search || r.variant.toLowerCase().includes(sq) || r.date.includes(sq);
    const hq = headerSearch ? headerSearch.toLowerCase() : "";
    const h  = !headerSearch || r.variant.toLowerCase().includes(hq) || r.date.includes(hq);
    const e  = !entryF   || r.entry === entryF;
    const p  = !productF || r.variant === productF;
    return q && h && e && p;
  }), [inventory, search, headerSearch, entryF, productF]);

  useEffect(() => { setCurrentPage(1); }, [search, entryF, productF]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleSave = (row) => {
    if (editRow) {
      setInventory((prev) => prev.map((r) => r.id === editRow.id ? row : r));
    } else {
      setInventory((prev) => [row, ...prev]);
    }
  };
  const openAdd  = () => { setEditRow(null); setModal(true); };
  const openEdit = (r) => { setEditRow(r); setModal(true); };
  const handleClose = () => { setEditRow(null); setModal(false); };

  return (
    <div style={S.main}>
      {modal && <Modal key={editRow?.id ?? "new"} type="inv" editData={editRow} onClose={handleClose} onSave={handleSave} />}
      <div style={S.pageHdr}>
        <h2 style={S.pageTitle}>Inventory log</h2>
      </div>
      <div style={S.card}>
        <div style={S.cardHdr}>
          <div style={S.searchRow}>
            <input style={{ ...S.inputSm, width: 140 }} placeholder="Search…" value={search} onChange={(e) => { setSearch(e.target.value); }} />
            <SelectDropdown value={entryF} onChange={setEntryF} options={ENTRY_OPTIONS} placeholder="All entries" />
            <SelectDropdown value={productF} onChange={setProductF} options={PRODUCT_OPTIONS} placeholder="All products" />
            <button style={S.addBtn} onClick={openAdd}>＋ Add entry</button>
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
              {paged.length ? paged.map((r) => (
                <tr key={r.id} onClick={() => openEdit(r)} style={{ cursor: "pointer" }}>
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
        <Pagination page={currentPage} totalPages={totalPages} total={filtered.length} perPage={PER_PAGE} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
