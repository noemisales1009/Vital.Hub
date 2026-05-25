import { useState } from 'react'
import BottomNav from './BottomNav'

function getEmbedUrl(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : url
}

export default function BriefingScreen({ video, attempt = 1, onStart, onBack, onNavigate }) {
  if (!video) return null
  const totalQuestions = video.questions.length
  // Na 1ª tentativa exige confirmação; nas demais o vídeo já foi assistido
  const [watched, setWatched] = useState(attempt > 1)
  // Usa temas do vídeo (campo topics) ou fallback das categorias das perguntas
  const categories = video.topics
    ? video.topics.split(',').map(t => t.trim()).filter(Boolean)
    : [...new Set(video.questions.map(q => q.category).filter(Boolean))]

  return (
    <div className="animate-fade-in flex flex-col min-h-screen pb-20 lg:pb-8 lg:pl-20">
      {/* Header */}
      <header className="w-full sticky top-0 z-50 px-4 py-3 bg-surface/90 shadow-[0_4px_0_0_rgba(213,222,225,1)] backdrop-blur-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="active:translate-y-1 transition-transform">
            <span className="material-symbols-outlined text-[#00B4D8] text-2xl">arrow_back</span>
          </button>
          <h1 className="font-headline font-bold tracking-tight text-on-surface text-lg">{video.title}</h1>
        </div>
        <div className="bg-primary-container text-on-primary-container px-4 py-1 rounded-full font-label font-bold text-xs uppercase tracking-widest chunky-shadow-surface">
          {totalQuestions} Perguntas
        </div>
      </header>

      <main className="max-w-lg mx-auto w-full px-4 pt-4 space-y-4 flex-grow">
        {/* YouTube Video */}
        <section>
          <div className="aspect-video w-full rounded-2xl navy-chunky-border overflow-hidden shadow-2xl">
            {attempt === 1 ? (
              <iframe
                className="w-full h-full"
                src={getEmbedUrl(video.youtube_url)}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full bg-surface-container flex flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="material-symbols-outlined text-5xl text-outline">lock</span>
                <p className="font-headline font-bold text-on-surface text-base">Vídeo já assistido</p>
                <p className="font-label text-on-surface-variant text-sm">O vídeo só pode ser assistido uma vez. Revise seus anotações e inicie o desafio!</p>
              </div>
            )}
          </div>
          <div className="mt-3 flex justify-between items-center">
            <h2 className="font-headline font-extrabold text-xl text-on-surface tracking-tight">{video.title}</h2>
            <div className="flex items-center gap-1 text-primary font-label font-bold text-sm">
              <span className="material-symbols-outlined text-sm">schedule</span>
              Vídeo
            </div>
          </div>
          {video.description && (
            <p className="text-on-surface-variant text-sm mt-1">{video.description}</p>
          )}

          {/* Confirmação de assistência — só na 1ª tentativa */}
          {attempt === 1 && (
            <button
              onClick={() => setWatched(true)}
              disabled={watched}
              className={`mt-3 w-full py-3 rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all
                ${watched
                  ? 'bg-green-100 border-green-400 text-green-700 cursor-default'
                  : 'bg-surface border-outline text-on-surface-variant active:scale-95'
                }`}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={watched ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {watched ? 'check_circle' : 'play_circle'}
              </span>
              {watched ? 'Vídeo assistido! Pode começar.' : 'Confirmar que assisti ao vídeo'}
            </button>
          )}
        </section>

        {/* Temas abordados */}
        {categories.length > 0 && (
          <section className="bg-surface-container-lowest rounded-2xl p-5 chunky-shadow-surface space-y-3 relative overflow-hidden">
            <div className="absolute -top-2 -right-2 bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-lg font-label font-bold text-[10px] uppercase tracking-tighter rotate-12 shadow-md">
              Essencial
            </div>
            <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
              Temas abordados
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <span key={cat} className="bg-primary-container/20 text-primary font-label font-bold text-xs px-3 py-1.5 rounded-full">
                  {cat}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-primary mb-1">quiz</span>
            <span className="font-headline font-extrabold text-lg text-on-surface">{totalQuestions}</span>
            <span className="font-label text-[10px] uppercase text-outline">Perguntas</span>
          </div>
          <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-secondary mb-1">military_tech</span>
            <span className="font-headline font-extrabold text-lg text-on-surface">+{totalQuestions * 10}</span>
            <span className="font-label text-[10px] uppercase text-outline">XP Máximo</span>
          </div>
          <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-primary mb-1">psychology</span>
            <span className="font-headline font-extrabold text-lg text-on-surface">{totalQuestions > 30 ? 'Alto' : totalQuestions > 15 ? 'Médio' : 'Baixo'}</span>
            <span className="font-label text-[10px] uppercase text-outline">Nível</span>
          </div>
        </div>

        {/* Tentativa */}
        <div className="rounded-2xl p-4 flex items-center gap-3 bg-primary/10 border-2 border-primary/30">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
          </div>
          <div>
            <p className="font-headline font-bold text-sm text-primary">Tentativa Única</p>
            <p className="text-on-surface-variant text-xs">Você tem apenas 1 tentativa. Mínimo 80% para aprovação.</p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          disabled={!watched}
          className={`w-full font-headline font-black text-lg py-5 rounded-xl transition-all flex items-center justify-center gap-3
            ${watched
              ? 'bg-vibrant-orange text-white orange-chunky-shadow active:translate-y-1 active:shadow-none'
              : 'bg-outline/20 text-outline cursor-not-allowed'
            }`}
        >
          COMEÇAR DESAFIO!
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
        </button>
      </main>

      <BottomNav active="missions" onNavigate={onNavigate} />
    </div>
  )
}
