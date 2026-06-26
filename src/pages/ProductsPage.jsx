import { useState } from "react";
import { COLORS, S } from "../styles/tokens";
import { Settings, Users, Trash } from "../components/Icons";

function ListManager({ title, icon: Icon, items, onAdd, onDelete, color, placeholder }) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const v = input.trim();
    if (!v) return;
    if (items.some((i) => i.toLowerCase() === v.toLowerCase())) {
      alert(`"${v}" already exists.`);
      return;
    }
    onAdd(v);
    setInput("");
  };

  return (
    <div style={S.card}>
      <div style={S.cardHdr}>
        <span style={{ ...S.cardTitle, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon size={16} color={color} /> {title}
        </span>
        <span style={{ fontSize: 12, color: "#78716c" }}>{items.length} items</span>
      </div>
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            style={{ ...S.inputSm, flex: 1, height: 38 }}
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          />
          <button onClick={handleAdd} style={{ ...S.addBtn, flexShrink: 0 }}>＋ Add</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 380, overflowY: "auto", scrollbarWidth: "none" }}>
          {items.map((item) => (
            <div key={item} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 12px", borderRadius: 12, background: "#fafaf9",
              fontSize: 13,
            }}>
              <span style={{ fontWeight: 500 }}>{item}</span>
              <button
                onClick={() => onDelete(item)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#d4d4d0", padding: 4, borderRadius: 8,
                  display: "flex", alignItems: "center",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = COLORS.coral}
                onMouseLeave={(e) => e.currentTarget.style.color = "#d4d4d0"}
              >
                <Trash size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage({ products, setProducts, customers, setCustomers }) {
  const handleAddProduct  = (v) => setProducts((p) => [...p, v]);
  const handleDelProduct  = (v) => {
    if (!confirm(`Remove product "${v}"? This won't affect existing records.`)) return;
    setProducts((p) => p.filter((x) => x !== v));
  };
  const handleAddCustomer = (v) => setCustomers((p) => [...p, v]);
  const handleDelCustomer = (v) => {
    if (!confirm(`Remove customer "${v}"? This won't affect existing records.`)) return;
    setCustomers((p) => p.filter((x) => x !== v));
  };

  return (
    <div style={S.main}>
      <div style={S.pageHdr}>
        <h2 style={S.pageTitle}>Products &amp; Customers</h2>
        <span style={{ fontSize: 12, color: "#78716c" }}>Manage dropdown lists used throughout the app</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <ListManager
          title="Products / Variants"
          icon={Settings}
          items={products}
          onAdd={handleAddProduct}
          onDelete={handleDelProduct}
          color={COLORS.orange}
          placeholder="e.g. Semaglutide-5mg"
        />
        <ListManager
          title="Customers"
          icon={Users}
          items={customers}
          onAdd={handleAddCustomer}
          onDelete={handleDelCustomer}
          color={COLORS.blue}
          placeholder="e.g. Juan dela Cruz"
        />
      </div>
    </div>
  );
}
