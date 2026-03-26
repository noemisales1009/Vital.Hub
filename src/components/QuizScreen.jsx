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
    const totalAnswered = answersLog.current.length
    const finalScore = answersLog.current.filter(a => a.is_correct).length
    const accuracy = totalAnswered > 0 ? Math.round((finalScore / totalAnswered) * 100) : 0
    const xpEarned = finalScore * 50

    // Save to Supabase
    try {
      const { data: mission } = await supabase
        .from('mission_results')
        .insert({
          player_id: player.playerId,
          video_id: videoId,
          attempt,
          score: finalScore,
          total_questions: quizQuestions.length,
          accuracy,
          time_seconds: elapsed,
          xp_earned: xpEarned,
        })
        .select()
        .single()

      if (mission && answersLog.current.length > 0) {
        await supabase.from('answers').insert(
          answersLog.current.map(a => ({ ...a, mission_result_id: mission.id }))
        )
      }

      await supabase
        .from('players')
        .update({
          total_xp: player.totalXP + xpEarned,
          missions_completed: player.missionsCompleted + 1,
          best_accuracy: Math.max(player.bestAccuracy, accuracy),
          streak,
        })
        .eq('id', player.playerId)
    } catch (err) {
      console.error('Error saving results:', err)
    }

    onFinish({
      score: finalScore,
      total: quizQuestions.length,
      accuracy,
      timeSeconds: elapsed,
      xpEarned,
      streak,
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

      <main className="flex-grow flex flex-col items-center px-6 pt-10 pb-24 w-full max-w-2xl mx-auto">
        {/* Question */}
        <div className="w-full mb-10">
          <div className="relative bg-surface-container-lowest rounded-2xl p-8 shadow-[0_8px_0_0_#d5dee1] border-2 border-surface-container-highest">
            <span className="absolute -top-4 -left-2 bg-tertiary-container text-on-tertiary-container font-headline font-black px-4 py-1 rounded-full text-sm uppercase tracking-widest">
              Desafio Vital
            </span>
            <h2 className="font-headline text-xl md:text-2xl font-extrabold text-on-surface leading-tight mt-2">
              {q.question}
            </h2>
            <div className="absolute -bottom-6 -right-4 w-20 h-20 opacity-10">
              <span className="material-symbols-outlined text-[80px]">medical_services</span>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="w-full space-y-4">
          {options.map((opt, i) => {
            const cls = getOptionClasses(i)
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={answered}
                className="w-full group active:translate-y-1 transition-transform disabled:pointer-events-none"
              >
                <div className={`w-full rounded-xl p-5 flex items-center gap-4 transition-colors ${cls.card}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-headline font-bold ${cls.number}`}>
                    {cls.icon ? (
                      <span className="material-symbols-outlined">{cls.icon}</span>
                    ) : (
                      LABELS[i]
                    )}
                  </div>
                  <span className={`font-headline font-bold text-base text-left leading-snug ${cls.text}`}>{opt}</span>
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

      {/* Feedback Bar */}
      <div className={`fixed bottom-0 left-0 w-full bg-white p-6 shadow-[0_-8px_40px_rgba(0,180,216,0.08)] rounded-t-2xl z-50 transition-transform duration-300 ${showFeedback ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center gap-3">
            {isCorrect ? (
              <>
                <div className="w-12 h-12 bg-correct-bg rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-correct-dark font-bold">celebration</span>
                </div>
                <div>
                  <p className="font-headline font-extrabold text-lg text-correct-dark">Excelente!</p>
                  <p className="text-sm font-medium text-correct-dark">Você acertou!</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-wrong-bg rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-error font-bold">heart_broken</span>
                </div>
                <div>
                  <p className="font-headline font-extrabold text-lg text-error">Ops!</p>
                  <p className="text-sm font-medium text-error">Resposta correta: {options[q.correct_index]}</p>
                </div>
              </>
            )}
          </div>

          {q.justification && (
            <div className="bg-surface-container-low rounded-xl p-4">
              <p className="text-sm text-on-surface-variant">
                <span className="font-bold text-on-surface">Explicação: </span>
                {q.justification}
              </p>
            </div>
          )}

          <button
            onClick={handleNext}
            className="w-full px-12 py-4 bg-primary text-on-primary font-headline font-black text-xl uppercase tracking-widest rounded-xl chunky-shadow-primary active:translate-y-1 active:shadow-none transition-all"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
