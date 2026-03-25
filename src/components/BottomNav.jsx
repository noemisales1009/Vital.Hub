export default function BottomNav({ active = 'missions', onNavigate }) {
  const items = [
    { id: 'home', icon: 'home', label: 'Início' },
    { id: 'missions', icon: 'fitness_center', label: 'Missões' },
    { id: 'dashboard', icon: 'leaderboard', label: 'Ranking' },
    { id: 'profile', icon: 'person', label: 'Perfil' },
  ]

  return (
    <>
      {/* Mobile / Tablet — bottom bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white shadow-[0_-8px_40px_rgba(0,180,216,0.08)] rounded-t-[2rem] z-50">
        {items.map((item) => {
          const key = item.navId || item.id
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center px-4 py-2 transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-[#00B4D8] text-white rounded-full px-6 shadow-[0_4px_0_0_#008bad] -translate-y-2'
                  : 'text-slate-400 hover:text-[#00B4D8]'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label font-bold text-[10px] uppercase tracking-widest mt-1">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Desktop — sidebar esquerda */}
      <nav className="hidden lg:flex fixed top-0 left-0 h-full w-20 flex-col items-center py-8 gap-2 bg-white shadow-[8px_0_40px_rgba(0,180,216,0.08)] z-50">
        {/* Logo */}
        <div className="w-12 h-12 rounded-full overflow-hidden mb-6">
          <img src="/logo-quiz-juju.png" alt="Quiz Juju" className="w-full h-full object-cover" />
        </div>

        {items.map((item) => {
          const key = item.navId || item.id
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all cursor-pointer group ${
                isActive
                  ? 'bg-[#00B4D8] text-white shadow-[0_4px_0_0_#008bad]'
                  : 'text-slate-400 hover:text-[#00B4D8] hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              <span className="font-label font-bold text-[8px] uppercase tracking-widest mt-0.5">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
