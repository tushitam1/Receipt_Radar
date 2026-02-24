function Header({ onLogout }) {
  return (
    <div className="flex items-center justify-between w-full text-white font-medium">
      <div className="flex-1 flex justify-start">Receipt Radar</div>
      <div className="flex-1 flex justify-center">Dashboard</div>
      <div className="flex-1 flex justify-end">
        <button
          type="button"
          className="px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Header
