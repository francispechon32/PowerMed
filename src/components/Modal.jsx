import { useState } from "react";
import { PRODUCTS, CUSTOMERS, REMARKS_LIST, CO_LIST } from "../data/seeds";
import { nextId } from "../utils/helpers";
import { S } from "../styles/tokens";

const EMPTY_INV     = { date: "", variant: "", cost: "", qty: "", entry: "In" };
const EMPTY_SALE    = { date: "", customer: "", item: "", price: "", qty: "", remarks: "SD", co: "HR" };
const EMPTY_CHARITY = { date: "", beneficiary: "", item: "", cost: "", qty: "" };

export default function Modal({ type, onClose, onSave }) {
  const [form, setForm] = useState(
    type === "inv" ? EMPTY_INV : type === "sales" ? EMPTY_SALE : EMPTY_CHARITY
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const today = new Date().toISOString().split("T")[0];

  const handleSave = () => {
    if (type === "inv") {
      if (!form.variant || !form.qty || !form.cost) return alert("Fill in all required fields.");
      onSave({ ...form, id: nextId(), cost: +form.cost, qty: +form.qty });
    } else if (type === "sales") {
      if (!form.customer || !form.item || !form.qty || !form.price) return alert("Fill in all required fields.");
      onSave({ ...form, id: nextId(), price: +form.price, qty: +form.qty });
    } else {
      if (!form.beneficiary || !form.item || !form.qty || !form.cost) return alert("Fill in all required fields.");
      onSave({ ...form, id: nextId(), cost: +form.cost, qty: +form.qty });
    }
    onClose();
  };

  const inp = (label, key, type = "text", opts = null) => (
    <div style={S.formRow}>
      <label style={S.formLbl}>{label}</label>
      {opts ? (
        <select style={S.formInp} value={form[key]} onChange={(e) => set(key, e.target.value)}>
          <option value="">Select…</option>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input style={S.formInp} type={type} value={form[key]} onChange={(e) => set(key, e.target.value)}
          placeholder={type === "date" ? today : ""} />
      )}
    </div>
  );

  const titles = { inv: "Add inventory entry", sales: "Add sales transaction", charity: "Add charity entry" };

  return (
    <div style={S.modalBg} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>{titles[type]}</h3>

        {type === "inv" && (<>
          {inp("Date", "date", "date")}
          {inp("Variant", "variant", "text", PRODUCTS)}
          {inp("Cost (₱)", "cost", "number")}
          {inp("Qty", "qty", "number")}
          <div style={S.formRow}>
            <label style={S.formLbl}>Entry</label>
            <select style={S.formInp} value={form.entry} onChange={(e) => set("entry", e.target.value)}>
              <option value="In">In</option>
              <option value="Out">Out</option>
            </select>
          </div>
        </>)}

        {type === "sales" && (<>
          {inp("Date", "date", "date")}
          {inp("Customer", "customer", "text", CUSTOMERS)}
          {inp("Item", "item", "text", PRODUCTS)}
          {inp("Price (₱)", "price", "number")}
          {inp("Qty", "qty", "number")}
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
          {inp("Item", "item", "text", PRODUCTS)}
          {inp("Cost (₱)", "cost", "number")}
          {inp("Qty", "qty", "number")}
        </>)}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <button style={S.btnSecondary} onClick={onClose}>Cancel</button>
          <button style={S.btnPrimary} onClick={handleSave}>Save entry</button>
        </div>
      </div>
    </div>
  );
}
