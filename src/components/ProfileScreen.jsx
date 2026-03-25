import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from './BottomNav'

const SECTOR_OPTIONS = [
  'AMBULATÓRIO', 'CCIH', 'CCIRAS', 'CCIRAS + FISIOTERAPIA', 'CENTRO CIRURGICO',
  'COCEP', 'COORD. CME', 'COORD. DA NUTRIÇÃO', 'COORD. DA RECEPÇÃO', 'COORD. FARMÁCIA',
  'COORD. MULTIPROFISSIONAL', 'COORD. NIR', 'COORD. NUTRIÇÃO', 'COORD. SERVIÇO SOCIAL',
  'COORDENAÇÃO DA FARMÁCIA', 'COORDENAÇÃO DO SESMT', 'COORDENAÇÃO MÉDICA DA UTIN E CCIRAS',
  'COORDENADOR DO SETOR', 'COORDENADORA DA UTIN', 'COREMU', 'CRO',
  'GERENCIA DE ENFERMAGEM', 'GERENCIA/UTIN', 'NEP', 'NHE', 'NIR', 'NIR/ DIREÇÃO CLINICA',
  'NSP', 'QUALIDADE', 'RESIDENCIA', 'TIME DE ACESSO', 'UTI NEO', 'UTIN', 'UTIN /CCIH',
]

function getLevelInfo(xp) {
  const level = Math.floor(xp / 500) + 1
  const currentLevelXP = (level - 1) * 500
  const nextLevelXP = level * 500
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
  return { level, nextLevelXP, progress }
}

function getBadges(data) {
  const badges = []
  if (data.missionsCompleted >= 1) badges.push({ icon: 'military_tech', label: 'Primeira Missão', color: 'bg-primary-container text-on-primary-container' })
  if (data.missionsCompleted >= 5) badges.push({ icon: 'workspace_premium', label: '5 Missões', color: 'bg-tertiary-container text-on-tertiary-container' })
  if (data.missionsCompleted >= 10) badges.push({ icon: 'emoji_events', label: 'Veterano', color: 'bg-secondary-container text-on-secondary-container' })
  if (data.bestAccuracy >= 80) badges.push({ icon: 'target', label: 'Precisão 80%+', color: 'bg-correct-bg text-correct-dark' })
  if (data.bestAccuracy === 100) badges.push({ icon: 'star', label: 'Perfeito!', color: 'bg-tertiary-container text-on-tertiary-container' })
  if (data.streak >= 5) badges.push({ icon: 'local_fire_department', label: 'Streak 5+', color: 'bg-vibrant-orange/20 text-vibrant-orange' })
  if (data.totalXP >= 1000) badges.push({ icon: 'bolt', label: '1000+ XP', color: 'bg-primary-container text-on-primary-container' })
  return badges
}

export default function ProfileScreen({ player, onNavigate, onLogout }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(player.playerName)
  const [sector, setSector] = useState(player.playerSector)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fresh, setFresh] = useState({
    totalXP: player.totalXP,
    missionsCompleted: player.missionsCompleted,
    bestAccuracy: player.bestAccuracy,
    streak: player.streak,
    playerName: player.playerName,
    playerSector: player.playerSector,
  })

  // Buscar dados frescos do Supabase
  useEffect(() => {
    if (!player.playerId) return
    const load = async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('id', player.playerId)

      if (data && data.length > 0) {
        const p = data[0]
        setFresh({
          totalXP: p.total_xp || 0,
          missionsCompleted: p.missions_completed || 0,
          bestAccuracy: p.best_accuracy || 0,
          streak: p.streak || 0,
          playerName: p.name,
          playerSector: p.sector,
        })
        setName(p.name)
        setSector(p.sector)
      }
    }
    load()
  }, [player.playerId])

  const { level, nextLevelXP, progress } = getLevelInfo(fresh.totalXP)
  const badges = getBadges(fresh)

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase
        .from('players')
        .update({ name: name.trim(), sector })
        .eq('id', player.playerId)

      setFresh(f => ({ ...f, playerName: name.trim(), playerSector: sector }))
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in flex flex-col min-h-screen pb-24 lg:pb-8 lg:pl-20">
      {/* Header */}
      <header className="w-full sticky top-0 z-40 px-4 py-3 bg-surface/90 shadow-[0_4px_0_0_rgba(213,222,225,1)] backdrop-blur-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="active:translate-y-1 transition-transform">
            <span className="material-symbols-outlined text-[#00B4D8] text-2xl">arrow_back</span>
          </button>
          <h1 className="font-headline font-bold tracking-tight text-on-surface text-lg">Meu Perfil</h1>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-primary font-label font-bold text-xs uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            Editar
          </button>
        )}
      </header>

      <main className="max-w-md mx-auto w-full px-5 pt-6 space-y-6 flex-grow">
        {/* Avatar + Level Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_6px_0_0_#d5dee1] relative overflow-hidden">
          <div className="absolute -right-6 -top-6 opacity-5">
            <span className="material-symbols-outlined text-[140px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
          </div>

          <div className="flex items-center gap-5 relative z-10">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-fixed flex items-center justify-center shadow-[0_6px_0_0_#004a5a]">
                <span className="text-3xl font-headline font-black text-white">
                  {fresh.playerName?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-tertiary-container text-on-tertiary-container font-label text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="font-headline font-extrabold text-xl text-on-surface truncate">{fresh.playerName}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">medical_services</span>
                <span className="text-on-surface-variant text-sm">{fresh.playerSector}</span>
              </div>
              {/* Level bar */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-label font-bold text-[9px] uppercase tracking-widest text-on-surface-variant">Nível {level}</span>
                  <span className="font-label font-bold text-[9px] text-primary">{fresh.totalXP}/{nextLevelXP} XP</span>
                </div>
                <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-inverse-primary rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-3 gap-3">
          <StatBox icon="bolt" value={fresh.totalXP} label="XP Total" color="text-primary" />
          <StatBox icon="task_alt" value={fresh.missionsCompleted} label="Missões" color="text-tertiary" />
          <StatBox icon="target" value={`${fresh.bestAccuracy}%`} label="Precisão" color="text-correct-dark" />
        </section>

        {/* Streak */}
        <section className="bg-gradient-to-r from-vibrant-orange to-[#ff9100] rounded-2xl p-5 shadow-[0_6px_0_0_#b35c00] flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <span className="material-symbols-outlined text-[100px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          </div>
          <div className="relative z-10">
            <p className="text-white/80 font-label font-bold text-[10px] uppercase tracking-widest">Sequência Atual</p>
            <p className="text-white font-headline font-black text-3xl">{fresh.streak} acertos</p>
          </div>
        </section>

        {/* Conquistas */}
        <section className="space-y-3">
          <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">emoji_events</span>
            Conquistas
          </h3>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge, i) => (
                <div key={i} className={`${badge.color} rounded-2xl p-4 flex items-center gap-3`}>
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{badge.icon}</span>
                  <span className="font-headline font-bold text-sm">{badge.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-2xl p-6 text-center">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">lock</span>
              <p className="text-on-surface-variant text-sm">Complete missões para desbloquear conquistas!</p>
            </div>
          )}
        </section>

        {/* Editar Perfil */}
        {editing && (
          <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_6px_0_0_#d5dee1] space-y-4">
            <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit</span>
              Editar Perfil
            </h3>

            <div className="space-y-1.5">
              <label className="font-label font-bold text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Nome</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-xl">badge</span>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-4 focus:ring-primary-fixed focus:bg-white transition-all font-medium text-on-surface outline-none text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-label font-bold text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Setor</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-xl">medical_services</span>
                <select
                  value={sector}
                  onChange={e => setSector(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-10 focus:ring-4 focus:ring-primary-fixed focus:bg-white transition-all font-medium text-on-surface appearance-none cursor-pointer outline-none text-sm"
                >
                  {SECTOR_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setEditing(false); setName(fresh.playerName); setSector(fresh.playerSector) }}
                className="flex-1 py-3 rounded-xl font-headline font-bold text-sm uppercase tracking-wider bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl font-headline font-bold text-sm uppercase tracking-wider bg-primary text-on-primary chunky-shadow-primary active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </section>
        )}

        {/* Toast de sucesso */}
        {saved && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-correct-bg text-correct-dark font-headline font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-fade-in">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Perfil atualizado!
          </div>
        )}

        {/* Sair */}
        <button
          onClick={onLogout}
          className="w-full py-4 rounded-xl font-headline font-bold text-sm uppercase tracking-wider border-2 border-error/30 text-error hover:bg-wrong-bg transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">logout</span>
          Sair da Conta
        </button>
      </main>

      <BottomNav active="profile" onNavigate={onNavigate} />
    </div>
  )
}

function StatBox({ icon, value, label, color }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 flex flex-col items-center text-center shadow-[0_4px_0_0_#d5dee1]">
      <span className={`material-symbols-outlined text-xl ${color} mb-1`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      <span className={`font-headline font-black text-xl ${color}`}>{value}</span>
      <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant mt-0.5">{label}</span>
    </div>
  )
}
