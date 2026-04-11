import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Pipeline" },
  { to: "/leads", label: "Leads" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Layout() {
  return (
    <div className="flex h-screen bg-void text-white">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border-subtle flex flex-col sidebar-gradient">
        <div className="p-6 pb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-fuchsia-500 flex items-center justify-center glow-accent">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14.5 4.5V11.5L8 15L1.5 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" fill="none" />
                <circle cx="8" cy="8" r="2.5" fill="white" opacity="0.9" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-base font-bold tracking-tight">Prospector</h1>
              <p className="text-[10px] text-muted font-medium tracking-widest uppercase">Provou Levou</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-accent-dim/20 to-transparent text-white border border-border"
                    : "text-muted hover:text-soft hover:bg-elevated/50 border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      isActive ? "bg-accent-bright scale-125" : "bg-muted/40 group-hover:bg-muted"
                    }`}
                  />
                  <span className="font-display">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mx-3 mb-4 rounded-xl border border-border-subtle bg-surface/50">
          <p className="text-[11px] text-muted leading-relaxed">
            10-20 leads/dia recomendado para evitar bloqueio no Instagram.
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="absolute top-0 right-0 w-[600px] h-[400px] pointer-events-none opacity-30"
          style={{
            background: "radial-gradient(ellipse at 80% 10%, rgba(139,92,246,0.08), transparent 60%)",
          }}
        />
        <Outlet />
      </main>
    </div>
  );
}
