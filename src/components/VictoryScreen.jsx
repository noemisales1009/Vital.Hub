import { useEffect, useState } from 'react'

export default function VictoryScreen({ result, player, attempt, canRetry, onHome, onRetry }) {
  const [barWidth, setBarWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      const pct = Math.min((player.totalXP / 5000) * 100, 100)
      setBarWidth(pct)
    }, 400)
    return () => clearTimeout(timer)
  }, [player.totalXP])

  if (!result) return null

  const minutes = Math.floor(result.timeSeconds / 60)
  const secs = result.timeSeconds % 60
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  const passed = result.accuracy >= 80

  const getMessage = () => {
    if (passed) return `Parabéns, ${player.playerName}! Você foi aprovado com ${result.accuracy}%!`
    if (canRetry) return `${player.playerName}, você precisa de 80% para aprovação. Você usou ${attempt} de 3 tentativas. Revise o vídeo e tente novamente!`
    return `${player.playerName}, suas 3 tentativas foram esgotadas. Entre em contato com o responsável.`
  }

  return (
    <div className="animate-fade-in flex flex-col min-h-screen">
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 pb-12 pt-8 confetti-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-surface pointer-events-none" />

        <div className="relative w-full max-w-md flex flex-col items-center space-y-8 z-10">
          {/* Star Badge */}
          <div className="relative animate-bounce-in">
            <div className="absolute inset-0 bg-tertiary-fixed blur-[60px] opacity-30 rounded-full" />
            <div className="relative w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-b from-tertiary-fixed to-tertiary-fixed-dim rounded-full flex items-center justify-center shadow-[0_12px_0_0_#eace58] -rotate-3 border-4 border-white/20">
              <span className="material-symbols-outlined text-[64px] sm:text-[100px] text-on-tertiary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <div className="absolute -top-4 -right-2 bg-primary-container text-on-primary-container font-headline font-black px-4 py-2 rounded-xl rotate-12 shadow-lg text-lg">
                +{result.xpEarned} XP
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="font-headline font-extrabold text-4xl tracking-tight text-on-surface drop-shadow-sm">
              {passed ? 'Aprovado!' : 'Tente Novamente'}
            </h1>
            <p className="font-headline font-bold text-primary text-xl tracking-wide uppercase">
              {result.score}/{result.total} Acertos
            </p>
          </div>

          {/* XP Bar */}
          <div className="w-full bg-surface-container-high rounded-xl p-6 space-y-4 shadow-[0_8px_0_0_#d5dee1]">
            <div className="flex justify-between items-end">
              <span className="font-label font-bold text-sm tracking-widest text-on-surface-variant uppercase">Progresso</span>
              <span className="font-headline font-black text-primary text-lg">{player.totalXP} XP</span>
            </div>
            <div className="w-full h-6 bg-surface-container rounded-full overflow-hidden border-4 border-surface-container">
              <div
                className="h-full bg-gradient-to-r from-primary to-inverse-primary rounded-full relative transition-all duration-1000"
                style={{ width: `${barWidth}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-4 border-2 border-surface-container-high">
              <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
              </div>
              <div>
                <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider">Tempo</p>
                <p className="font-headline font-bold text-lg">{timeStr}</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-4 border-2 border-surface-container-high">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <div>
                <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider">Precisão</p>
                <p className="font-headline font-bold text-lg">{result.accuracy}%</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="w-full pt-8 space-y-6">
            <button
              onClick={onHome}
              className="w-full bg-[#00B4D8] text-white font-headline font-extrabold text-lg py-4 sm:py-6 rounded-xl chunky-shadow-primary active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
            >
              VOLTAR À BASE
              <span className="material-symbols-outlined">home</span>
            </button>
            {canRetry && !passed && (
              <button
                onClick={onRetry}
                className="w-full bg-vibrant-orange text-white font-headline font-extrabold text-lg py-4 sm:py-6 rounded-xl orange-chunky-shadow active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
              >
                TENTAR NOVAMENTE ({attempt}/3)
                <span className="material-symbols-outlined">refresh</span>
              </button>
            )}
          </div>
        </div>

        {/* Attempt info + message */}
        <div className="mt-8 text-center max-w-xs space-y-3">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-headline font-bold text-sm ${passed ? 'bg-correct-bg text-correct-dark' : canRetry ? 'bg-vibrant-orange/10 text-vibrant-orange' : 'bg-error/10 text-error'}`}>
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              {passed ? 'verified' : canRetry ? 'replay' : 'block'}
            </span>
            {passed ? 'Aprovado - 80%+' : `Tentativa ${attempt} de 3 utilizada`}
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">{getMessage()}</p>
        </div>
      </div>
    </div>
  )
}
