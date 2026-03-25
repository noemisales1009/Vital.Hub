import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from './BottomNav'

export default function MissionsScreen({ player, onNavigate, onSelectVideo }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [completedMap, setCompletedMap] = useState({})

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [vidRes, qRes, missRes] = await Promise.all([
        supabase.from('videos').select('*').order('created_at'),
        supabase.from('questions').select('id, video_id').order('id'),
        player.playerId
          ? supabase.from('mission_results').select('*').eq('player_id', player.playerId)
          : Promise.resolve({ data: [] }),
      ])

      if (vidRes.data && qRes.data) {
        const videosWithQuestions = vidRes.data.map(v => ({
          ...v,
          questions: qRes.data.filter(q => q.video_id === v.id),
        }))
        setVideos(videosWithQuestions)
      }

      // Mapear melhor resultado por vídeo (precisamos vincular mission_results ao video)
      // Por agora, contamos total de missões completadas
      if (missRes.data) {
        const map = {}
        missRes.data.forEach(m => {
          if (!map[m.id] || m.accuracy > map[m.id]) {
            map[m.id] = m.accuracy
          }
        })
        setCompletedMap(map)
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
      <header className="w-full sticky top-0 z-40 px-5 py-4 bg-surface/90 backdrop-blur-md shadow-[0_4px_0_0_rgba(213,222,225,1)]">
        <h1 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight">Missões</h1>
        <p className="text-on-surface-variant text-sm">Escolha um treinamento para começar</p>
      </header>

      <main className="max-w-md mx-auto w-full px-5 pt-5 space-y-4 flex-grow">
        {loading ? (
          <div className="flex justify-center py-16"><div className="spinner" /></div>
        ) : videos.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-8 text-center shadow-[0_4px_0_0_#d5dee1]">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-3">video_library</span>
            <p className="font-headline font-bold text-on-surface">Nenhum treinamento disponível</p>
            <p className="text-on-surface-variant text-sm mt-1">Aguarde novos conteúdos serem adicionados.</p>
          </div>
        ) : (
          videos.map((video, i) => {
            const qCount = video.questions.length
            const xp = qCount * 50

            return (
              <button
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="w-full bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_5px_0_0_#d5dee1] hover:scale-[1.01] active:translate-y-1 active:shadow-[0_2px_0_0_#d5dee1] transition-all text-left"
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-black overflow-hidden">
                  <img
                    src={getYouTubeThumbnail(video.youtube_url)}
                    alt={video.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    </div>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-white font-headline font-extrabold text-lg leading-tight drop-shadow-md">{video.title}</p>
                    {video.description && (
                      <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{video.description}</p>
                    )}
                  </div>

                  {/* XP badge */}
                  <div className="absolute top-3 right-3 bg-vibrant-orange text-white font-label font-black text-[10px] px-3 py-1 rounded-full shadow-md">
                    +{xp} XP
                  </div>
                </div>

                {/* Info bar */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-sm">
                      <span className="material-symbols-outlined text-lg text-primary">quiz</span>
                      <span className="font-headline font-bold">{qCount} perguntas</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-sm">
                      <span className="material-symbols-outlined text-lg text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                      <span className="font-headline font-bold">{xp} XP</span>
                    </div>
                  </div>
                  <div className="bg-primary text-on-primary font-label font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-full shadow-[0_3px_0_0_#004a5a]">
                    Jogar
                  </div>
                </div>
              </button>
            )
          })
        )}
      </main>

      <BottomNav active="missions" onNavigate={onNavigate} />
    </div>
  )
}

function getYouTubeThumbnail(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/)
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : ''
}
