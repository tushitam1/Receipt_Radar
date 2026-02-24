function Sidebar({ activeView, onNavigate }) {
  const navLinkClass = (view) =>
    `px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
      activeView === view
        ? 'bg-slate-800 text-white font-medium'
        : 'text-slate-700 hover:bg-slate-100'
    }`

  return (
    <aside className="flex-shrink-0 w-56 h-full bg-slate-200 rounded-lg border border-slate-200 shadow-sm flex flex-col p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">
        Receipt Radar
      </h2>
      <nav className="flex flex-col gap-1">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}
          className={navLinkClass('dashboard')}
        >
          Dashboard
        </a>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onNavigate('scan-receipt'); }}
          className={navLinkClass('scan-receipt')}
        >
          Scan Receipt
        </a>
      </nav>
    </aside>
  )
}

export default Sidebar