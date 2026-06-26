import { useState, useMemo, useEffect, useRef } from "react";
import "./Dashboard.css";
import { SEED_INVENTORY, SEED_SALES, SEED_CHARITY, PRODUCTS, CUSTOMERS } from "./data/seeds";
import { PAGE_ICONS, IconGrid, IconLogout, IconSearch, IconBell, IconChevron } from "./components/Icons";
import { COLORS } from "./styles/tokens";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { ToastContainer } from "./components/Toast";
import { nextId } from "./utils/helpers";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import SalesPage     from "./pages/SalesPage";
import CharityPage   from "./pages/CharityPage";
import StockPage     from "./pages/StockPage";
import BillingPage   from "./pages/BillingPage";
import ProductsPage  from "./pages/ProductsPage";
import powerMedLogo  from "./assets/powermed-logo.png";

const PAGES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "inventory", label: "Inventory" },
  { key: "sales",     label: "Sales"     },
  { key: "charity",   label: "Charity"   },
  { key: "stock",     label: "Stock"     },
  { key: "billing",   label: "Billing"   },
  { key: "products",  label: "Products"  },
];

export default function App() {
  const [page,        setPage]        = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search,      setSearch]      = useState("");
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showLowStockAlert, setShowLowStockAlert] = useState(false);
  const [toasts,      setToasts]      = useState([]);
  const prevLowCount = useRef(0);

  const [inventory,  setInventory]  = useLocalStorage("pm-inventory",  SEED_INVENTORY);
  const [sales,      setSales]      = useLocalStorage("pm-sales",       SEED_SALES);
  const [charity,    setCharity]    = useLocalStorage("pm-charity",     SEED_CHARITY);
  const [products,   setProducts]   = useLocalStorage("pm-products",    PRODUCTS);
  const [customers,  setCustomers]  = useLocalStorage("pm-customers",   CUSTOMERS);

  const addToast = (message, undoFn) => {
    const id = nextId();
    setToasts((prev) => [...prev, { id, message, onUndo: undoFn || null }]);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const lowStockItems = useMemo(() => {
    const m = {};
    inventory.forEach((r) => {
      if (!m[r.variant]) m[r.variant] = { inQty: 0, outQty: 0 };
      if (r.entry === "In") m[r.variant].inQty += r.qty;
      else m[r.variant].outQty += r.qty;
    });
    return Object.entries(m)
      .map(([variant, v]) => ({ variant, balance: v.inQty - v.outQty }))
      .filter((item) => item.balance < 5)
      .sort((a, b) => a.balance - b.balance);
  }, [inventory]);

  const expiringItems = useMemo(() => {
    const now  = new Date(); now.setHours(0, 0, 0, 0);
    const soon = new Date(now.getTime() + 30 * 86400000);
    const m = {};
    inventory.forEach((r) => {
      if (r.entry === "In" && r.expiryDate) {
        const d = new Date(r.expiryDate + "T00:00:00");
        if (d >= now && d <= soon) {
          if (!m[r.variant] || d < new Date(m[r.variant] + "T00:00:00")) {
            m[r.variant] = r.expiryDate;
          }
        }
      }
    });
    return Object.entries(m).map(([variant, expiryDate]) => ({ variant, expiryDate }));
  }, [inventory]);

  const totalNotifCount = lowStockItems.length + expiringItems.length;

  useEffect(() => {
    if (lowStockItems.length > prevLowCount.current) {
      setShowLowStockAlert(true);
    }
    prevLowCount.current = lowStockItems.length;
  }, [lowStockItems.length]);

  const pageLabel = PAGES.find((p) => p.key === page)?.label ?? "Dashboard";

  const notifBell = (
    <div style={{ position: "relative" }}>
      <button className="pm-icon-btn" aria-label="Notifications" onClick={() => setShowNotifDropdown((o) => !o)}>
        <IconBell />
        {totalNotifCount > 0 && (
          <span style={{
            position: "absolute", top: -2, right: -2,
            background: COLORS.coral, color: "#fff",
            fontSize: 10, fontWeight: 700,
            width: 17, height: 17, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
          }}>
            {totalNotifCount}
          </span>
        )}
      </button>
      {showNotifDropdown && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setShowNotifDropdown(false)} />
          <div style={{
            position: "absolute", top: "100%", right: 0, marginTop: 6, zIndex: 50,
            background: "#fff", borderRadius: 16, padding: 16, minWidth: 300,
            maxHeight: 420, overflowY: "auto",
            boxShadow: "0 10px 30px rgba(28,25,23,0.15)",
          }}>
            {lowStockItems.length > 0 && (<>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1c1917", marginBottom: 8 }}>⚠ Low Stock</div>
              {lowStockItems.map((item) => (
                <div key={item.variant} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12, borderBottom: "1px solid #f5f5f4" }}>
                  <span>{item.variant}</span>
                  <span style={{ color: item.balance <= 0 ? COLORS.coral : COLORS.orange, fontWeight: 600 }}>{item.balance} left</span>
                </div>
              ))}
            </>)}

            {expiringItems.length > 0 && (<>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1c1917", marginBottom: 8, marginTop: lowStockItems.length > 0 ? 12 : 0 }}>🕐 Expiring Soon (30 days)</div>
              {expiringItems.map((item) => (
                <div key={item.variant} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12, borderBottom: "1px solid #f5f5f4" }}>
                  <span>{item.variant}</span>
                  <span style={{ color: COLORS.amber, fontWeight: 600 }}>{item.expiryDate}</span>
                </div>
              ))}
            </>)}

            {totalNotifCount === 0 && (
              <div style={{ fontSize: 12, color: "#a8a29e" }}>All clear — no alerts.</div>
            )}

            {totalNotifCount > 0 && (
              <button onClick={() => { setPage("stock"); setShowNotifDropdown(false); }}
                style={{ marginTop: 12, width: "100%", padding: "8px", borderRadius: 999, border: "none", background: COLORS.orange, color: "#fff", cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600 }}>
                View stock page →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="pm-app">
      <div className="pm-shell">
        <aside className={`pm-sidebar${sidebarOpen ? " pm-sidebar--open" : ""}`}>
          <button className="pm-sidebar-brand" onClick={() => setSidebarOpen((o) => !o)} aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
            <div className="pm-sidebar-logo"><img src={powerMedLogo} alt="PowerMed" /></div>
            <span>PowerMed</span>
          </button>

          <nav className="pm-sidebar-nav">
            {PAGES.map((p) => {
              const Icon = PAGE_ICONS[p.key] || IconGrid;
              return (
                <button key={p.key} className={`pm-nav-item${page === p.key ? " active" : ""}`}
                  onClick={() => setPage(p.key)} aria-label={p.label} aria-current={page === p.key ? "page" : undefined}>
                  <span className="pm-nav-link">
                    <Icon />
                    <span className="pm-nav-label">{p.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="pm-sidebar-footer">
            <button className="pm-nav-item" aria-label="Sign out">
              <span className="pm-nav-link">
                <IconLogout />
                <span className="pm-nav-label">Sign out</span>
              </span>
            </button>
          </div>
        </aside>

        <div className="pm-main-wrap">
          <header className="pm-header">
            <div className="pm-search">
              <IconSearch />
              <input type="search" placeholder={`Search ${pageLabel.toLowerCase()}…`} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="pm-header-actions">
              {notifBell}
              <div className="pm-profile">
                <div className="pm-avatar">PM</div>
                <span className="pm-profile-name">PowerMed Admin</span>
                <IconChevron />
              </div>
            </div>
          </header>

          <main className="pm-content">
            {page === "dashboard" && (
              <DashboardPage inventory={inventory} sales={sales} charity={charity} onNavigate={setPage} search={search} />
            )}
            {page === "inventory" && (
              <InventoryPage inventory={inventory} setInventory={setInventory} search={search} products={products} onAddToast={addToast} />
            )}
            {page === "sales" && (
              <SalesPage sales={sales} setSales={setSales} inventory={inventory} setInventory={setInventory} search={search} products={products} customers={customers} onAddToast={addToast} />
            )}
            {page === "charity" && (
              <CharityPage charity={charity} setCharity={setCharity} inventory={inventory} setInventory={setInventory} search={search} products={products} onAddToast={addToast} />
            )}
            {page === "stock" && (
              <StockPage inventory={inventory} search={search} />
            )}
            {page === "billing" && (
              <BillingPage sales={sales} setSales={setSales} search={search} />
            )}
            {page === "products" && (
              <ProductsPage products={products} setProducts={setProducts} customers={customers} setCustomers={setCustomers} />
            )}
          </main>
        </div>
      </div>

      {showLowStockAlert && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200, background: "rgba(28,25,23,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)",
        }} onClick={(e) => e.target === e.currentTarget && setShowLowStockAlert(false)}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 24, maxWidth: 400, width: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(28,25,23,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.coral }}>⚠ Low Stock Alert</span>
              <button onClick={() => setShowLowStockAlert(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#78716c", padding: "2px 6px", lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ fontSize: 12, color: "#44403c", marginBottom: 12 }}>
              {lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""} {lowStockItems.length > 1 ? "are" : "is"} running low:
            </div>
            {lowStockItems.map((item) => (
              <div key={item.variant} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12, borderBottom: "1px solid #f5f5f4" }}>
                <span>{item.variant}</span>
                <span style={{ color: item.balance <= 0 ? COLORS.coral : COLORS.orange, fontWeight: 600 }}>{item.balance} left</span>
              </div>
            ))}
            <button onClick={() => { setPage("stock"); setShowLowStockAlert(false); }}
              style={{ marginTop: 14, width: "100%", padding: "10px", borderRadius: 999, border: "none", background: COLORS.orange, color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: 600 }}>
              View stock page →
            </button>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}