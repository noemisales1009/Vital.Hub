import BottomNav from './BottomNav'

function getEmbedUrl(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : url
}

const ATTEMPT_LABELS = ['', '1ª Tentativa', '2ª Tentativa', '3ª e Última Tentativa']

export default function BriefingScreen({ video, attempt = 1, onStart, onBack, onNavigate }) {
  if (!video) return null
  const totalQuestions = video.questions.length
  const categories = [...new Set(video.questions.map(q => q.category).filter(Boolean))]

  return (
    <div className="animate-fade-in flex flex-col min-h-screen pb-24 lg:pb-8 lg:pl-20">
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

      <main className="max-w-md mx-auto w-full px-5 pt-5 space-y-5 flex-grow">
        {/* YouTube Video */}
        <section>
          <div className="aspect-video w-full rounded-2xl navy-chunky-border bg-black overflow-hidden shadow-2xl">
            <iframe
              className="w-full h-full"
              src={getEmbedUrl(video.youtube_url)}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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
            <span className="font-headline font-extrabold text-lg text-on-surface">+{totalQuestions * 50}</span>
            <span className="font-label text-[10px] uppercase text-outline">XP Máximo</span>
          </div>
          <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-primary mb-1">psychology</span>
            <span className="font-headline font-extrabold text-lg text-on-surface">{totalQuestions > 30 ? 'Alto' : totalQuestions > 15 ? 'Médio' : 'Baixo'}</span>
            <span className="font-label text-[10px] uppercase text-outline">Nível</span>
          </div>
        </div>

        {/* Tentativa */}
        <div className={`rounded-2xl p-4 flex items-center gap-3 ${attempt === 3 ? 'bg-error/10 border-2 border-error/30' : attempt === 2 ? 'bg-vibrant-orange/10 border-2 border-vibrant-orange/30' : 'bg-primary/10 border-2 border-primary/30'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${attempt === 3 ? 'bg-error/20' : attempt === 2 ? 'bg-vibrant-orange/20' : 'bg-primary/20'}`}>
            <span className="font-headline font-black text-xl">{attempt}/3</span>
          </div>
          <div>
            <p className={`font-headline font-bold text-sm ${attempt === 3 ? 'text-error' : attempt === 2 ? 'text-vibrant-orange' : 'text-primary'}`}>
              {ATTEMPT_LABELS[attempt]}
            </p>
            <p className="text-on-surface-variant text-xs">
              {attempt === 3 ? 'Esta é sua última chance!' : attempt === 2 ? 'Você tem mais uma chance após esta.' : 'Você tem até 3 tentativas. Mínimo 80% para aprovação.'}
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="w-full bg-vibrant-orange text-white font-headline font-black text-lg py-5 rounded-xl orange-chunky-shadow active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
        >
          COMEÇAR DESAFIO!
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
        </button>
      </main>

      <BottomNav active="missions" onNavigate={onNavigate} />
    </div>
  )
}
