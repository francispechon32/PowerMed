import { useState } from "react";
import { PRODUCTS, CUSTOMERS, REMARKS_LIST, CO_LIST, INCLUSIVES_LIST } from "../data/seeds";
import { nextId } from "../utils/helpers";
import { S } from "../styles/tokens";
import { Trash } from "./Icons";

const EMPTY_INV     = { date: "", variant: "", cost: "", qty: "", entry: "In", batchNo: "", expiryDate: "" };
const EMPTY_SALE    = { date: "", customer: "", item: "", price: "", qty: "", remarks: "SD", co: "HR", inclusives: [] };
const EMPTY_CHARITY = { date: "", beneficiary: "", item: "", cost: "", qty: "" };

export default function Modal({ type, onClose, onSave, onDelete, editData, products: propProducts, customers: propCustomers }) {
  const products  = propProducts  || PRODUCTS;
  const customers = propCustomers || CUSTOMERS;

  const [form, setForm] = useState(() =>
    editData
      ? { ...editData }
      : type === "inv" ? { ...EMPTY_INV } : type === "sales" ? { ...EMPTY_SALE } : { ...EMPTY_CHARITY }
  );
  const [customInc, setCustomInc] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const today = new Date().toISOString().split("T")[0];
  const isEdit = !!editData;

  const toggleInc = (item) => {
    const cur = form.inclusives || [];
    set("inclusives", cur.includes(item) ? cur.filter((i) => i !== item) : [...cur, item]);
  };

  const addCustomInc = () => {
    const val = customInc.trim();
    if (!val) return;
    const cur = form.inclusives || [];
    if (!cur.includes(val)) set("inclusives", [...cur, val]);
    setCustomInc("");
  };

  const removeInc = (item) => {
    set("inclusives", (form.inclusives || []).filter((i) => i !== item));
  };

  const handleSave = () => {
    if (type === "inv") {
      if (!form.variant || !form.qty || !form.cost) return alert("Fill in all required fields.");
      onSave({ ...form, id: isEdit ? editData.id : nextId(), cost: +form.cost, qty: +form.qty });
    } else if (type === "sales") {
      if (!form.customer || !form.item || !form.qty || !form.price) return alert("Fill in all required fields.");
      onSave({ ...form, id: isEdit ? editData.id : nextId(), price: +form.price, qty: +form.qty });
    } else {
      if (!form.beneficiary || !form.item || !form.qty || !form.cost) return alert("Fill in all required fields.");
      onSave({ ...form, id: isEdit ? editData.id : nextId(), cost: +form.cost, qty: +form.qty });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete && onDelete(editData.id, editData);
    onClose();
  };

  const inp = (label, key, type = "text", opts = null, placeholder = "") => (
    <div style={S.formRow}>
      <label style={S.formLbl}>{label}</label>
      {opts ? (
        <select style={S.formInp} value={form[key]} onChange={(e) => set(key, e.target.value)}>
          <option value="">Select…</option>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input style={S.formInp} type={type} value={form[key] ?? ""} onChange={(e) => set(key, e.target.value)}
          placeholder={type === "date" ? today : placeholder} />
      )}
    </div>
  );

  const titles = {
    inv:     isEdit ? "Edit inventory entry"     : "Add inventory entry",
    sales:   isEdit ? "Edit sales transaction"   : "Add sales transaction",
    charity: isEdit ? "Edit charity entry"       : "Add charity entry",
  };

  return (
    <div style={S.modalBg} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>{titles[type]}</h3>

        {type === "inv" && (<>
          {inp("Date", "date", "date")}
          {inp("Variant", "variant", "text", products)}
          {inp("Cost (₱)", "cost", "number")}
          {inp("Qty", "qty", "number")}
          <div style={S.formRow}>
            <label style={S.formLbl}>Entry</label>
            <select style={S.formInp} value={form.entry} onChange={(e) => set("entry", e.target.value)}>
              <option value="In">In</option>
              <option value="Out">Out</option>
            </select>
          </div>
          {form.entry === "In" && (<>
            {inp("Batch No. (optional)", "batchNo", "text", null, "e.g. BT-2026-001")}
            {inp("Expiry Date (optional)", "expiryDate", "date")}
          </>)}
        </>)}

        {type === "sales" && (<>
          {inp("Date", "date", "date")}
          {inp("Customer", "customer", "text", customers)}
          {inp("Item", "item", "text", products)}
          {inp("Price (₱)", "price", "number")}
          {inp("Qty", "qty", "number")}
          <div style={S.formRow}>
            <label style={S.formLbl}>Inclusives (items included with sale)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
              {INCLUSIVES_LIST.map((inc) => {
                const sel = (form.inclusives || []).includes(inc);
                return (
                  <button key={inc} type="button" onClick={() => toggleInc(inc)}
                    style={{
                      padding: "4px 12px", borderRadius: 999, border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                      background: sel ? "#ea580c" : "#f5f5f4",
                      color: sel ? "#fff" : "#44403c",
                      transition: "all 0.12s ease",
                    }}>
                    {inc}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <input style={{ ...S.formInp, flex: 1 }} placeholder="Custom item…"
                value={customInc} onChange={(e) => setCustomInc(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomInc(); } }} />
              <button type="button" onClick={addCustomInc}
                style={{ ...S.btnSecondary, padding: "8px 14px", fontSize: 12 }}>Add</button>
            </div>
            {(form.inclusives || []).length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                {(form.inclusives || []).map((inc) => (
                  <span key={inc} style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "2px 6px 2px 10px", borderRadius: 999, fontSize: 11,
                    background: "#fff7ed", color: "#9a3412", fontWeight: 500,
                  }}>
                    {inc}
                    <button type="button" onClick={() => removeInc(inc)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, lineHeight: 1, color: "#9a3412", padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={S.formRow}>
            <label style={S.formLbl}>Remarks</label>
            <select style={S.formInp} value={form.remarks} onChange={(e) => set("remarks", e.target.value)}>
              {REMARKS_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={S.formRow}>
            <label style={S.formLbl}>C/O</label>
            <select style={S.formInp} value={form.co} onChange={(e) => set("co", e.target.value)}>
              {CO_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </>)}

        {type === "charity" && (<>
          {inp("Date", "date", "date")}
          {inp("Beneficiary", "beneficiary")}
          {inp("Item", "item", "text", products)}
          {inp("Cost (₱)", "cost", "number")}
          {inp("Qty", "qty", "number")}
        </>)}

        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 16, alignItems: "center" }}>
          <div>
            {isEdit && onDelete && (
              confirmDelete ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#dc2626" }}>Confirm delete?</span>
                  <button style={{ ...S.btnSecondary, padding: "6px 12px", fontSize: 12, color: "#dc2626" }} onClick={handleDelete}>Yes, delete</button>
                  <button style={{ ...S.btnSecondary, padding: "6px 12px", fontSize: 12 }} onClick={() => setConfirmDelete(false)}>Cancel</button>
                </div>
              ) : (
                <button style={{ ...S.btnSecondary, padding: "8px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, color: "#dc2626" }}
                  onClick={handleDelete}>
                  <Trash size={14} color="#dc2626" /> Delete
                </button>
              )
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={S.btnSecondary} onClick={onClose}>Cancel</button>
            <button style={S.btnPrimary} onClick={handleSave}>Save entry</button>
          </div>
        </div>
      </div>
    </div>
  );
}
