import { useState } from "react";
import "./Dashboard.css";
import { SEED_INVENTORY, SEED_SALES, SEED_CHARITY } from "./data/seeds";
import { PAGE_ICONS, IconGrid, IconLogout, IconSearch, IconBell, IconChevron } from "./components/Icons";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import SalesPage     from "./pages/SalesPage";
import CharityPage   from "./pages/CharityPage";
import StockPage     from "./pages/StockPage";

const PAGES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "inventory", label: "Inventory" },
  { key: "sales",     label: "Sales"     },
  { key: "charity",   label: "Charity"   },
  { key: "stock",     label: "Stock"     },
];

export default function App() {
  const [page,        setPage]        = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inventory,   setInventory]   = useState(SEED_INVENTORY);
  const [sales,       setSales]       = useState(SEED_SALES);
  const [charity,     setCharity]     = useState(SEED_CHARITY);
  const [search,      setSearch]      = useState("");

  const pageLabel = PAGES.find((p) => p.key === page)?.label ?? "Dashboard";

  return (
    <div className="pm-app">
      <div className="pm-shell">
        <aside className={`pm-sidebar${sidebarOpen ? " pm-sidebar--open" : ""}`}>
          <button
            className="pm-sidebar-brand"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <div className="pm-sidebar-logo">⚗</div>
            <span>PowerMed</span>
          </button>

          <nav className="pm-sidebar-nav">
            {PAGES.map((p) => {
              const Icon = PAGE_ICONS[p.key] || IconGrid;
              return (
                <button
                  key={p.key}
                  className={`pm-nav-item${page === p.key ? " active" : ""}`}
                  onClick={() => setPage(p.key)}
                  aria-label={p.label}
                  aria-current={page === p.key ? "page" : undefined}
                >
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
              <input
                type="search"
                placeholder={`Search ${pageLabel.toLowerCase()}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="pm-header-actions">
              <button className="pm-icon-btn" aria-label="Notifications"><IconBell /></button>
              <div className="pm-profile">
                <div className="pm-avatar">PM</div>
                <span className="pm-profile-name">PowerMed Admin</span>
                <IconChevron />
              </div>
            </div>
          </header>

          <main className="pm-content">
            {page === "dashboard" && <DashboardPage inventory={inventory} sales={sales} charity={charity} />}
            {page === "inventory" && <InventoryPage inventory={inventory} setInventory={setInventory} />}
            {page === "sales"     && <SalesPage     sales={sales}         setSales={setSales}         />}
            {page === "charity"   && <CharityPage   charity={charity}     setCharity={setCharity}     />}
            {page === "stock"     && <StockPage     inventory={inventory}                             />}
          </main>
        </div>
      </div>
    </div>
  );
}
