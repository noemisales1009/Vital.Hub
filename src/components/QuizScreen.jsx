import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const LABELS = ['A', 'B', 'C', 'D']

export default function QuizScreen({ questions, quizCount, player, videoId, attempt, onFinish, onExit }) {
  const [quizQuestions, setQuizQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [streak, setStreak] = useState(Math.max(0, player.streak || 0))
  const [answered, setAnswered] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const answersLog = useRef([])
  const startTime = useRef(Date.now())

  useEffect(() => {
    setQuizQuestions([...questions])
    setCurrentIdx(0)
    setScore(0)
    setHearts(3)
    setAnswered(false)
    setSelectedIdx(null)
    setShowFeedback(false)
    answersLog.current = []
    startTime.current = Date.now()
  }, [questions, quizCount])

  const q = quizQuestions[currentIdx]
  if (!q) return null

  const options = [q.option_a, q.option_b, q.option_c, q.option_d]
  const progress = (currentIdx / quizQuestions.length) * 100
  const isCorrect = selectedIdx === q.correct_index

  const handleSelect = (idx) => {
    if (answered) return
    setSelectedIdx(idx)
  }

  const handleConfirm = () => {
    if (answered || selectedIdx === null) return
    setAnswered(true)
    const correct = selectedIdx === q.correct_index

    answersLog.current.push({
      question_id: q.id,
      selected_index: selectedIdx,
      is_correct: correct,
    })

    if (correct) {
      setScore(s => s + 1)
      setStreak(s => s + 1)
    } else {
      setHearts(h => h - 1)
      setStreak(0)
    }

    setTimeout(() => setShowFeedback(true), 300)
  }

  const handleNext = async () => {
    const nextIdx = currentIdx + 1

    if (nextIdx >= quizQuestions.length) {
      await finishQuiz()
      return
    }

    setCurrentIdx(nextIdx)
    setAnswered(false)
    setSelectedIdx(null)
    setShowFeedback(false)
  }

  const finishQuiz = async () => {
    const elapsed = Math.floor((Date.now() - startTime.current) / 1000)

    // Envia só as respostas — o Supabase calcula e salva tudo
    const answersPayload = answersLog.current.map(a => ({
      question_id: a.question_id,
      selected_index: a.selected_index,
    }))

    let resultData = null

    try {
      const { data, error } = await supabase.rpc('process_quiz_result', {
        p_player_id: player.playerId,
        p_video_id: videoId,
        p_attempt: attempt,
        p_time_seconds: elapsed,
        p_answers: answersPayload,
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      resultData = data
    } catch (err) {
      console.error('Erro ao salvar resultado:', err)
      // Fallback local se a função falhar
      const totalAnswered = answersLog.current.length
      const finalScore = answersLog.current.filter(a => a.is_correct).length
      const accuracy = totalAnswered > 0 ? Math.round((finalScore / totalAnswered) * 100) : 0
      resultData = {
        score: finalScore,
        total: totalAnswered,
        accuracy,
        xp_earned: finalScore * 50,
        streak: 0,
      }
    }

    onFinish({
      score: resultData.score,
      total: resultData.total || quizQuestions.length,
      accuracy: resultData.accuracy,
      timeSeconds: elapsed,
      xpEarned: resultData.xp_earned,
      streak: resultData.streak || 0,
    })
  }

  const getOptionClasses = (idx) => {
    if (!answered) {
      // Opção selecionada (ainda não confirmada)
      if (idx === selectedIdx) {
        return {
          card: 'bg-primary/10 border-2 border-primary shadow-[0_6px_0_0_#004a5a]',
          number: 'bg-primary text-white',
          text: 'text-primary',
        }
      }
      return {
        card: 'bg-surface-container-lowest border-2 border-surface-container-highest chunky-shadow-surface hover:bg-surface-container-low',
        number: 'bg-surface-container-high text-on-surface-variant',
        text: 'text-on-surface',
      }
    }
    if (idx === q.correct_index) {
      return {
        card: 'bg-correct-bg border-2 border-correct chunky-shadow-correct',
        number: 'bg-correct text-white',
        text: 'text-correct-dark',
        icon: 'check',
      }
    }
    if (idx === selectedIdx && !isCorrect) {
      return {
        card: 'bg-wrong-bg border-2 border-error chunky-shadow-wrong',
        number: 'bg-error text-white',
        text: 'text-error',
        icon: 'close',
      }
    }
    return {
      card: 'bg-surface-container-lowest border-2 border-surface-container-highest chunky-shadow-surface opacity-50',
      number: 'bg-surface-container-high text-on-surface-variant',
      text: 'text-on-surface',
    }
  }

  return (
    <div className="animate-fade-in flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full sticky top-0 z-50 px-4 py-3 flex justify-between items-center bg-surface/90 backdrop-blur-md shadow-[0_4px_0_0_rgba(213,222,225,1)]">
        <div className="flex items-center gap-4 w-full max-w-2xl mx-auto">
          <button onClick={() => { if (confirm('Sair? Seu progresso será perdido.')) onExit() }} className="material-symbols-outlined text-slate-500 active:translate-y-1 transition-transform">
            close
          </button>
          <div className="flex-grow h-4 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center gap-1 bg-correct-bg px-3 py-1 rounded-full shadow-[0_2px_0_0_rgba(213,222,225,1)]">
            <span className="material-symbols-outlined text-correct-dark text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="font-headline font-extrabold text-correct-dark text-sm">{score}</span>
          </div>
          <div className="bg-surface-container-lowest px-3 py-1 rounded-full shadow-[0_2px_0_0_rgba(213,222,225,1)]">
            <span className="font-headline font-bold text-on-surface-variant text-sm">{currentIdx + 1}/{quizQuestions.length}</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center px-4 sm:px-6 pt-6 pb-20 w-full max-w-lg mx-auto">
        {/* Question */}
        <div className="w-full mb-6">
          <div className="relative bg-surface-container-lowest rounded-2xl p-5 sm:p-8 shadow-[0_8px_0_0_#d5dee1] border-2 border-surface-container-highest">
            <span className="absolute -top-3 -left-1 bg-tertiary-container text-on-tertiary-container font-headline font-black px-3 py-0.5 rounded-full text-xs uppercase tracking-widest">
              Desafio Vital
            </span>
            <h2 className="font-headline text-lg sm:text-xl font-extrabold text-on-surface leading-tight mt-1">
              {q.question}
            </h2>
            <div className="absolute -bottom-6 -right-4 w-20 h-20 opacity-10">
              <span className="material-symbols-outlined text-[80px]">medical_services</span>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="w-full space-y-3">
          {options.map((opt, i) => {
            const cls = getOptionClasses(i)
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={answered}
                className="w-full group active:translate-y-1 transition-transform disabled:pointer-events-none"
              >
                <div className={`w-full rounded-xl p-4 flex items-center gap-3 transition-colors ${cls.card}`}>
                  <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-headline font-bold text-sm ${cls.number}`}>
                    {cls.icon ? (
                      <span className="material-symbols-outlined">{cls.icon}</span>
                    ) : (
                      LABELS[i]
                    )}
                  </div>
                  <span className={`font-headline font-bold text-sm text-left leading-snug ${cls.text}`}>{opt}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Botão Confirmar - aparece quando selecionou mas não confirmou */}
        {selectedIdx !== null && !answered && (
          <button
            onClick={handleConfirm}
            className="w-full mt-6 bg-vibrant-orange text-white font-headline font-black text-lg py-5 rounded-xl orange-chunky-shadow active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
          >
            CONFIRMAR RESPOSTA
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </button>
        )}
      </main>

      {/* Feedback Popup */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-xs sm:max-w-sm rounded-2xl p-5 space-y-3 shadow-2xl ${isCorrect ? 'bg-white border-4 border-correct' : 'bg-white border-4 border-error'}`}>
            {/* Ícone */}
            <div className="flex justify-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isCorrect ? 'bg-correct-bg' : 'bg-wrong-bg'}`}>
                <span className={`material-symbols-outlined text-4xl ${isCorrect ? 'text-correct-dark' : 'text-error'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isCorrect ? 'check_circle' : 'cancel'}
                </span>
              </div>
            </div>

            {/* Título */}
            <div className="text-center">
              <p className={`font-headline font-extrabold text-xl ${isCorrect ? 'text-correct-dark' : 'text-error'}`}>
                {isCorrect ? 'Excelente!' : 'Ops!'}
              </p>
              <p className={`text-xs font-medium mt-1 ${isCorrect ? 'text-correct-dark' : 'text-error'}`}>
                {isCorrect ? 'Você acertou!' : `Resposta correta: ${options[q.correct_index]}`}
              </p>
            </div>

            {/* Justificativa */}
            {q.justification && (
              <div className="bg-surface-container-low rounded-xl p-4">
                <p className="text-sm text-on-surface-variant">
                  <span className="font-bold text-on-surface">Explicação: </span>
                  {q.justification}
                </p>
              </div>
            )}

            {/* Botão */}
            <button
              onClick={handleNext}
              className={`w-full py-4 font-headline font-black text-lg uppercase tracking-widest rounded-xl active:translate-y-1 active:shadow-none transition-all text-white ${
                isCorrect
                  ? 'bg-correct shadow-[0_6px_0_0_#2d8c00]'
                  : 'bg-primary chunky-shadow-primary'
              }`}
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
