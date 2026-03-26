import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from './BottomNav'

export default function DashboardScreen({ player, onNavigate }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      try {
        const { data: lb } = await supabase
          .from('players')
          .select('*')
          .order('total_xp', { ascending: false })
          .limit(10)

        if (!cancelled && lb) setLeaderboard(lb)

        if (player.playerId) {
          const { data: hist } = await supabase
            .from('mission_results')
            .select('*')
            .eq('player_id', player.playerId)
            .order('created_at', { ascending: false })
            .limit(5)

          if (!cancelled && hist) setHistory(hist)
        }
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [player.playerId])

  return (
    <div className="animate-fade-in flex flex-col min-h-screen pb-20 lg:pb-8 lg:pl-20">
      {/* Header */}
      <header className="w-full sticky top-0 z-50 px-4 py-3 bg-surface/90 backdrop-blur-md shadow-[0_4px_0_0_rgba(213,222,225,1)] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="material-symbols-outlined text-[#00B4D8] active:translate-y-1 transition-transform">
            arrow_back
          </button>
          <h1 className="font-headline font-bold tracking-tight text-on-surface text-lg">Quiz Juju</h1>
        </div>
        <span className="text-[#00B4D8] font-bold font-headline text-sm">{player.playerName}</span>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-8">
        <section>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface mb-1">Command Center</h2>
          <p className="text-on-surface-variant">Visão geral do seu desempenho.</p>
        </section>

        {/* Stat Cards */}
        <section className="grid grid-cols-3 gap-3">
          <StatCard
            label="Melhor Resultado"
            title="Precisão"
            value={`${player.bestAccuracy}%`}
            color="text-primary"
            borderColor="border-primary-container"
            icon="verified"
          />
          <StatCard
            label="Experiência"
            title="XP Total"
            value={player.totalXP}
            suffix="XP"
            color="text-tertiary"
            borderColor="border-tertiary-container"
            icon="bolt"
          />
          <StatCard
            label="Missões"
            title="Completadas"
            value={player.missionsCompleted}
            color="text-secondary"
            borderColor="border-secondary-container"
            icon="military_tech"
          />
        </section>

        {/* Leaderboard */}
        <section className="space-y-4">
          <h3 className="font-headline font-bold text-lg">Ranking Geral</h3>
          <div className="bg-surface-container-low rounded-2xl p-2 space-y-2">
            {loading ? (
              <div className="flex justify-center py-8"><div className="spinner" /></div>
            ) : leaderboard.length === 0 ? (
              <p className="text-center text-on-surface-variant py-4 text-sm">Nenhum jogador ainda.</p>
            ) : (
              leaderboard.map((p, i) => {
                const isMe = p.id === player.playerId
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-4 rounded-xl ${isMe ? 'bg-primary-fixed/10 border-2 border-primary-fixed' : 'bg-surface-container-lowest'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-primary-container">person</span>
                        </div>
                        <div className={`absolute -top-1 -left-1 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-black border-2 border-white ${i === 0 ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                          {i + 1}
                        </div>
                      </div>
                      <div>
                        <p className="font-headline font-bold text-on-surface">{p.name}{isMe ? ' (Você)' : ''}</p>
                        <p className="text-xs text-on-surface-variant">{p.sector} &bull; {p.missions_completed} missões</p>
                      </div>
                    </div>
                    <div className="bg-primary-container px-3 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                      <span className="text-xs font-black text-on-primary-container tracking-tighter">{p.total_xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* History */}
        <section className="space-y-4">
          <h3 className="font-headline font-bold text-lg">Seu Histórico</h3>
          <div className="bg-surface-container-low rounded-2xl p-2 space-y-2">
            {history.length === 0 ? (
              <p className="text-center text-on-surface-variant py-4 text-sm">Nenhuma missão completada ainda.</p>
            ) : (
              history.map(h => {
                const date = new Date(h.created_at)
                const dateStr = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                const mins = Math.floor(h.time_seconds / 60)
                const secs = h.time_seconds % 60

                return (
                  <div key={h.id} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl">
                    <div>
                      <p className="font-headline font-bold text-on-surface">{h.score}/{h.total_questions} acertos</p>
                      <p className="text-xs text-on-surface-variant">{dateStr} &bull; {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-headline font-black text-sm ${h.accuracy >= 70 ? 'text-correct-dark' : 'text-error'}`}>{h.accuracy}%</span>
                      <div className="bg-primary-container px-2 py-1 rounded-full">
                        <span className="text-xs font-black text-on-primary-container">+{h.xp_earned} XP</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-on-primary-fixed text-on-primary rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <h3 className="font-headline font-black text-xl mb-2">Nova Missão Disponível!</h3>
            <p className="text-sm opacity-80 mb-4 max-w-[200px]">Continue treinando para subir no ranking.</p>
            <button
              onClick={() => onNavigate('home')}
              className="bg-primary-fixed text-on-primary-fixed font-label font-black uppercase text-xs px-6 py-3 rounded-full chunky-shadow-primary active:translate-y-1 active:shadow-none transition-all"
            >
              Iniciar Missão
            </button>
          </div>
          <div className="absolute -right-8 top-4 opacity-20">
            <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: "'FILL' 1" }}>clinical_notes</span>
          </div>
        </section>
      </main>

      <BottomNav active="ranking" onNavigate={onNavigate} />
    </div>
  )
}

function StatCard({ label, title, value, suffix, color, borderColor, icon }) {
  return (
    <div className={`p-4 rounded-2xl bg-surface-container-lowest border-b-4 ${borderColor} relative overflow-hidden`}>
      <div className="relative z-10">
        <p className="font-label text-[8px] uppercase tracking-widest text-on-surface-variant mb-1">{label}</p>
        <h3 className="text-sm font-headline font-bold mb-1">{title}</h3>
        <div className="flex items-end gap-1">
          <span className={`text-2xl font-headline font-black ${color}`}>{value}</span>
          {suffix && <span className={`text-[10px] font-bold ${color} mb-0.5`}>{suffix}</span>}
        </div>
      </div>
      <div className="absolute -right-3 -bottom-3 opacity-10">
        <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
    </div>
  )
}
