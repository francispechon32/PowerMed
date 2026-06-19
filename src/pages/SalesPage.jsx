import { useState, useMemo, useEffect } from "react";
import { PRODUCTS, CUSTOMERS, REMARKS_LIST, CO_LIST } from "../data/seeds";
import { peso, fmtDate } from "../utils/helpers";
import { COLORS, S } from "../styles/tokens";
import { Badge, Pill } from "../components/Badge";
import Modal from "../components/Modal";
import ReceiptModal from "../components/ReceiptModal";
import Pagination, { PER_PAGE } from "../components/Pagination";
import SelectDropdown from "../components/SelectDropdown";
import { Download, Eye } from "../components/Icons";
import { exportCsv } from "../utils/exportCsv";

const REMARK_OPTIONS = REMARKS_LIST.map((r) => ({ value: r, label: r }));
const CO_OPTIONS     = CO_LIST.map((c) => ({ value: c, label: c }));

function CustomerHistoryModal({ customer, sales, onClose }) {
  const rows = sales.filter((r) => r.customer === customer);
  const total = rows.reduce((s, r) => s + r.price * r.qty, 0);
  const billed = rows.filter((r) => r.remarks === "Billed").reduce((s, r) => s + r.price * r.qty, 0);
  const outstanding = rows.filter((r) => r.remarks === "Billed" && !r.paid).reduce((s, r) => s + r.price * r.qty, 0);
  return (
    <div style={S.modalBg} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.modal, width: 580 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{customer}</h3>
            <div style={{ fontSize: 12, color: "#78716c", marginTop: 2 }}>Customer history</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#78716c", padding: "2px 6px" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Total spend",   value: peso(total),       color: COLORS.orange },
            { label: "Total billed",  value: peso(billed),      color: COLORS.amber  },
            { label: "Outstanding",   value: peso(outstanding),  color: COLORS.coral  },
          ].map((c) => (
            <div key={c.label} style={{ background: "#fafaf9", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#78716c", marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>
        <div style={{ maxHeight: 320, overflowY: "auto", scrollbarWidth: "none" }}>
          <table style={S.tbl}>
            <thead>
              <tr>
                {["Date","Item","Qty","Amount","Payment"].map((h, i) => (
                  <th key={h} style={{ ...S.th, textAlign: [2, 3].includes(i) ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={S.td}>{fmtDate(r.date)}</td>
                  <td style={S.td}><Pill label={r.item} /></td>
                  <td style={S.tdR}>{r.qty}</td>
                  <td style={S.tdR}>{peso(r.price * r.qty)}</td>
                  <td style={S.td}><Badge label={r.remarks} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function SalesPage({ sales, setSales, search: headerSearch, products: propProducts, customers: propCustomers, onAddToast }) {
  const products  = propProducts  || PRODUCTS;
  const customers = propCustomers || CUSTOMERS;

  const [search, setSearch]       = useState("");
  const [remarkF, setRemarkF]     = useState("");
  const [coF, setCoF]             = useState("");
  const [modal, setModal]         = useState(false);
  const [editRow, setEditRow]     = useState(null);
  const [receipt, setReceipt]     = useState(null);
  const [custModal, setCustModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => sales.filter((r) => {
    const incStr = (r.inclusives || []).join(" ").toLowerCase();
    const sq = search.toLowerCase();
    const q  = !search  || r.customer.toLowerCase().includes(sq) || r.item.toLowerCase().includes(sq) || incStr.includes(sq);
    const hq = headerSearch ? headerSearch.toLowerCase() : "";
    const h  = !headerSearch || r.customer.toLowerCase().includes(hq) || r.item.toLowerCase().includes(hq) || incStr.includes(hq);
    const rm = !remarkF || r.remarks === remarkF;
    const c  = !coF     || r.co === coF;
    return q && h && rm && c;
  }), [sales, search, headerSearch, remarkF, coF]);

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

  const handleDelete = (id, item) => {
    setSales((prev) => prev.filter((r) => r.id !== id));
    onAddToast && onAddToast(`Deleted sale for "${item.customer}"`, () => {
      setSales((prev) => [item, ...prev]);
    });
  };

  const openAdd  = () => { setEditRow(null); setModal(true); };
  const openEdit = (r) => { setEditRow(r); setModal(true); };
  const handleClose = () => { setEditRow(null); setModal(false); };

  const handleExport = () => {
    exportCsv(
      "sales.csv",
      ["Date","Customer","Item","Price","Qty","Amount","Remarks","C/O","Inclusives","Paid"],
      filtered.map((r) => [
        r.date, r.customer, r.item, r.price, r.qty, r.price * r.qty,
        r.remarks, r.co, (r.inclusives || []).join("; "), r.paid ? "Yes" : "No",
      ])
    );
  };

  return (
    <div style={S.main}>
      {modal && (
        <Modal
          key={editRow?.id ?? "new"}
          type="sales"
          editData={editRow}
          onClose={handleClose}
          onSave={handleSave}
          onDelete={handleDelete}
          products={products}
          customers={customers}
        />
      )}
      {receipt && <ReceiptModal sale={receipt} onClose={() => setReceipt(null)} />}
      {custModal && <CustomerHistoryModal customer={custModal} sales={sales} onClose={() => setCustModal(null)} />}

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
            <button style={{ ...S.addBtn, background: "#f5f5f4", color: "#44403c", boxShadow: "none" }} onClick={handleExport}>
              <Download size={14} /> Export
            </button>
            <button style={S.addBtn} onClick={openAdd}>＋ Add sale</button>
          </div>
        </div>
        <div style={S.tblWrap}>
          <table style={S.tbl}>
            <thead>
              <tr>
                {["Date","Customer","Price","Qty","Amount","Remarks","C/O","Item","Inclusives",""].map((h, i) => (
                  <th key={h + i} style={{ ...S.th, textAlign: [2,3,4].includes(i) ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length ? paged.map((r) => (
                <tr key={r.id} style={{ cursor: "pointer" }}>
                  <td style={S.td} onClick={() => openEdit(r)}>{fmtDate(r.date)}</td>
                  <td style={S.td}>
                    <button
                      onClick={() => setCustModal(r.customer)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: 12, color: COLORS.blue, fontWeight: 600, textDecoration: "underline", textDecorationStyle: "dotted" }}>
                      {r.customer}
                    </button>
                  </td>
                  <td style={S.tdR} onClick={() => openEdit(r)}>{peso(r.price)}</td>
                  <td style={S.tdR} onClick={() => openEdit(r)}>{r.qty}</td>
                  <td style={S.tdR} onClick={() => openEdit(r)}>{peso(r.price * r.qty)}</td>
                  <td style={S.td} onClick={() => openEdit(r)}><Badge label={r.remarks} /></td>
                  <td style={S.td} onClick={() => openEdit(r)}>{r.co}</td>
                  <td style={S.td} onClick={() => openEdit(r)}><Pill label={r.item} /></td>
                  <td style={S.td} onClick={() => openEdit(r)}>
                    {(r.inclusives || []).length > 0
                      ? r.inclusives.map((inc) => <Pill key={inc} label={inc} />)
                      : <span style={{ color: "#a8a29e", fontSize: 11 }}>—</span>}
                  </td>
                  <td style={S.td}>
                    <button
                      onClick={() => setReceipt(r)}
                      title="View receipt"
                      style={{
                        background: "none", border: "none", cursor: "pointer", padding: 4,
                        color: "#a8a29e", borderRadius: 6, display: "flex", alignItems: "center",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = COLORS.orange}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#a8a29e"}
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={10} style={S.empty}>No sales match your filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={currentPage} totalPages={totalPages} total={filtered.length} perPage={PER_PAGE} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
