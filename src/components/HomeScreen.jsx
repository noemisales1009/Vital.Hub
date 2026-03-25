import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from './BottomNav'

function getLevelInfo(xp) {
  const level = Math.floor(xp / 500) + 1
  const next = level * 500
  const prev = (level - 1) * 500
  const progress = ((xp - prev) / (next - prev)) * 100
  return { level, next, progress }
}

const CAT_COLORS = [
  { bg: 'bg-primary/10', text: 'text-primary', icon: 'health_and_safety' },
  { bg: 'bg-vibrant-orange/10', text: 'text-vibrant-orange', icon: 'vaccines' },
  { bg: 'bg-tertiary/10', text: 'text-tertiary', icon: 'biotech' },
  { bg: 'bg-error/10', text: 'text-error', icon: 'emergency' },
  { bg: 'bg-secondary/10', text: 'text-secondary', icon: 'sanitizer' },
  { bg: 'bg-[#00B4D8]/10', text: 'text-[#00B4D8]', icon: 'monitor_heart' },
]

export default function HomeScreen({ player, onNavigate, onSelectVideo }) {
  const [videos, setVideos] = useState([])
  const [rank, setRank] = useState(null)
  const [recentMission, setRecentMission] = useState(null)
  const [attemptsMap, setAttemptsMap] = useState({}) // { videoId: { count, bestAccuracy, passed } }
  const [loading, setLoading] = useState(true)

  const { level, next, progress } = getLevelInfo(player.totalXP)
  const greeting = getGreeting()

  useEffect(() => { loadHomeData() }, [])

  const loadHomeData = async () => {
    try {
      // Vídeos + perguntas
      const [vidRes, qRes] = await Promise.all([
        supabase.from('videos').select('*').order('created_at'),
        supabase.from('questions').select('*').order('id'),
      ])

      // Buscar tentativas do jogador
      const missionsRes = player.playerId
        ? await supabase.from('mission_results').select('*').eq('player_id', player.playerId)
        : { data: [] }

      if (vidRes.data && qRes.data) {
        const videosWithQuestions = vidRes.data.map(v => ({
          ...v,
          questions: qRes.data.filter(q => q.video_id === v.id),
        }))
        setVideos(videosWithQuestions)

        // Calcular tentativas por vídeo
        if (missionsRes.data) {
          const map = {}
          missionsRes.data.forEach(m => {
            const vid = m.video_id
            if (!vid) return
            if (!map[vid]) map[vid] = { count: 0, bestAccuracy: 0, passed: false }
            map[vid].count++
            if (m.accuracy > map[vid].bestAccuracy) map[vid].bestAccuracy = m.accuracy
            if (m.accuracy >= 80) map[vid].passed = true
          })
          setAttemptsMap(map)
        }
      }

      // Ranking
      const { data: allPlayers } = await supabase
        .from('players')
        .select('id, total_xp')
        .order('total_xp', { ascending: false })

      if (allPlayers) {
        const pos = allPlayers.findIndex(p => p.id === player.playerId)
        if (pos !== -1) setRank(pos + 1)
      }

      // Última missão
      if (player.playerId) {
        const { data: missions } = await supabase
          .from('mission_results')
          .select('*')
          .eq('player_id', player.playerId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (missions && missions.length > 0) setRecentMission(missions[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in flex flex-col min-h-screen pb-24 lg:pb-8 lg:pl-20">
      {/* Header */}
      <header className="w-full sticky top-0 z-40 px-5 py-4 bg-surface/90 backdrop-blur-md flex justify-between items-center">
        <div>
          <p className="text-on-surface-variant text-sm">{greeting}</p>
          <h1 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight">{player.playerName || 'Jogador'}</h1>
        </div>
        <button onClick={() => onNavigate('profile')} className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-fixed flex items-center justify-center shadow-[0_4px_0_0_#004a5a]">
            <span className="text-lg font-headline font-black text-white">
              {player.playerName?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-tertiary-container text-on-tertiary-container font-label text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-surface">
            {level}
          </div>
        </button>
      </header>

      <main className="max-w-md mx-auto w-full px-5 pt-2 space-y-5 flex-grow">
        {/* XP + Level Card */}
        <section className="bg-gradient-to-br from-primary to-primary-dim rounded-2xl p-5 text-on-primary relative overflow-hidden shadow-[0_6px_0_0_#003d4d]">
          <div className="absolute -right-6 -top-6 opacity-10">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-on-primary/70 font-label font-bold text-[10px] uppercase tracking-widest">Nível {level}</p>
                <p className="font-headline font-black text-4xl">{player.totalXP} <span className="text-lg font-bold text-on-primary/70">XP</span></p>
              </div>
              <div className="flex items-center gap-1 bg-white/15 px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                <span className="font-headline font-black text-sm">{player.streak}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-label font-bold uppercase tracking-widest text-on-primary/70">
                <span>Progresso</span>
                <span>{player.totalXP}/{next} XP</span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-tertiary-fixed rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-3">
          <QuickStat icon="task_alt" value={player.missionsCompleted} label="Missões" color="text-primary" bg="bg-primary-container/20" />
          <QuickStat icon="target" value={`${player.bestAccuracy}%`} label="Precisão" color="text-correct-dark" bg="bg-correct-bg" />
          <QuickStat icon="leaderboard" value={rank ? `#${rank}` : '—'} label="Ranking" color="text-tertiary" bg="bg-tertiary-container/20" />
        </section>

        {/* Treinamentos disponíveis (vídeos = categorias) */}
        <section>
          <h3 className="font-headline font-bold text-base text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-vibrant-orange" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            Treinamentos Disponíveis
          </h3>

          {loading ? (
            <div className="flex justify-center py-8"><div className="spinner" /></div>
          ) : videos.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl p-6 text-center shadow-[0_4px_0_0_#d5dee1]">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">video_library</span>
              <p className="text-on-surface-variant text-sm">Nenhum treinamento disponível ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((video, i) => {
                const style = CAT_COLORS[i % CAT_COLORS.length]
                const qCount = video.questions.length
                const att = attemptsMap[video.id] || { count: 0, bestAccuracy: 0, passed: false }
                const blocked = att.count >= 3 || att.passed

                return (
                  <button
                    key={video.id}
                    onClick={() => !blocked && onSelectVideo(video, att.count)}
                    disabled={blocked}
                    className={`w-full bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_5px_0_0_#d5dee1] transition-all text-left ${blocked ? 'opacity-70' : 'hover:scale-[1.01] active:translate-y-1 active:shadow-[0_2px_0_0_#d5dee1]'}`}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-32 bg-black overflow-hidden">
                      <img src={getYouTubeThumbnail(video.youtube_url)} alt={video.title} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                        <div>
                          <p className="text-white font-headline font-extrabold text-base leading-tight drop-shadow-md">{video.title}</p>
                          {video.description && <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{video.description}</p>}
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                        </div>
                      </div>
                      {/* Status badge */}
                      {att.passed && (
                        <div className="absolute top-3 right-3 bg-correct text-white font-label font-black text-[10px] px-3 py-1 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          Aprovado
                        </div>
                      )}
                      {!att.passed && att.count >= 3 && (
                        <div className="absolute top-3 right-3 bg-error text-white font-label font-black text-[10px] px-3 py-1 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
                          Esgotado
                        </div>
                      )}
                      {!blocked && att.count > 0 && (
                        <div className="absolute top-3 right-3 bg-vibrant-orange text-white font-label font-black text-[10px] px-3 py-1 rounded-full">
                          Tentativa {att.count}/3
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center`}>
                          <span className={`material-symbols-outlined text-xl ${style.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>{style.icon}</span>
                        </div>
                        <div>
                          <p className="font-headline font-bold text-sm text-on-surface">{qCount} perguntas</p>
                          {att.count > 0
                            ? <p className="text-on-surface-variant text-xs">Melhor nota: <span className={att.bestAccuracy >= 80 ? 'text-correct-dark font-bold' : 'text-error font-bold'}>{att.bestAccuracy}%</span></p>
                            : <p className="text-on-surface-variant text-xs">+{qCount * 50} XP possíveis</p>
                          }
                        </div>
                      </div>
                      {blocked ? (
                        <span className="material-symbols-outlined text-outline-variant text-xl">lock</span>
                      ) : (
                        <div className="bg-primary text-on-primary font-label font-black text-[10px] uppercase px-3 py-1.5 rounded-full shadow-[0_2px_0_0_#004a5a]">
                          {att.count === 0 ? 'Jogar' : 'Tentar'}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* Último resultado */}
        {recentMission && (
          <section>
            <h3 className="font-headline font-bold text-base text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              Última Missão
            </h3>
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_0_0_#d5dee1]">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-headline font-bold text-on-surface">{recentMission.score}/{recentMission.total_questions} acertos</p>
                  <p className="text-on-surface-variant text-xs mt-0.5">{new Date(recentMission.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-headline font-black text-sm ${recentMission.accuracy >= 70 ? 'bg-correct-bg text-correct-dark' : 'bg-wrong-bg text-error'}`}>
                  {recentMission.accuracy}%
                </div>
              </div>
              <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${recentMission.accuracy >= 70 ? 'bg-correct' : 'bg-error'}`} style={{ width: `${recentMission.accuracy}%` }} />
              </div>
            </div>
          </section>
        )}

        {/* Ações rápidas */}
        <section>
          <h3 className="font-headline font-bold text-base text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">grid_view</span>
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ActionCard icon="leaderboard" label="Ranking" desc="Ver classificação" color="bg-[#00B4D8]" onClick={() => onNavigate('dashboard')} />
            <ActionCard icon="person" label="Meu Perfil" desc="Ver conquistas" color="bg-tertiary" onClick={() => onNavigate('profile')} />
            {player.playerRole === 'admin' && (
              <ActionCard icon="admin_panel_settings" label="Admin" desc="Painel de gestão" color="bg-error" onClick={() => onNavigate('admin')} />
            )}
          </div>
        </section>
      </main>

      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  )
}

function QuickStat({ icon, value, label, color, bg }) {
  return (
    <div className={`${bg} rounded-2xl p-3.5 flex flex-col items-center text-center`}>
      <span className={`material-symbols-outlined text-lg ${color} mb-1`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      <span className={`font-headline font-black text-lg ${color}`}>{value}</span>
      <span className="font-label text-[8px] uppercase tracking-widest text-on-surface-variant mt-0.5">{label}</span>
    </div>
  )
}

function ActionCard({ icon, label, desc, color, onClick }) {
  return (
    <button onClick={onClick} className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_0_0_#d5dee1] flex items-center gap-3 hover:scale-[1.02] active:translate-y-1 active:shadow-none transition-all text-left">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
        <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="font-headline font-bold text-sm text-on-surface">{label}</p>
        <p className="text-on-surface-variant text-[11px]">{desc}</p>
      </div>
    </button>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia!'
  if (h < 18) return 'Boa tarde!'
  return 'Boa noite!'
}

function getYouTubeThumbnail(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/)
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : ''
}
