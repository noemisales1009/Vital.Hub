import { useState, useCallback } from 'react'
import LoginScreen from './components/LoginScreen'
import BriefingScreen from './components/BriefingScreen'
import QuizScreen from './components/QuizScreen'
import VictoryScreen from './components/VictoryScreen'
import DashboardScreen from './components/DashboardScreen'
import ProfileScreen from './components/ProfileScreen'
import HomeScreen from './components/HomeScreen'
import AdminScreen from './components/AdminScreen'
import MissionsScreen from './components/MissionsScreen'

const INITIAL_STATE = {
  playerId: null,
  playerName: '',
  playerSector: '',
  playerRole: 'player',
  totalXP: 0,
  missionsCompleted: 0,
  bestAccuracy: 0,
  streak: 0,
}

export default function App() {
  const [screen, setScreen] = useState('login')
  const [player, setPlayer] = useState(INITIAL_STATE)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videoAttempts, setVideoAttempts] = useState(0) // quantas tentativas já fez
  const [quizResult, setQuizResult] = useState(null)

  const handleLogin = useCallback((playerData) => {
    setPlayer(prev => ({ ...prev, ...playerData }))
    setScreen('home')
  }, [])

  const handleSelectVideo = useCallback((video, attempts) => {
    setSelectedVideo(video)
    setVideoAttempts(attempts)
    setScreen('briefing')
  }, [])

  const handleQuizFinish = useCallback((result) => {
    setQuizResult(result)
    setPlayer(prev => ({
      ...prev,
      totalXP: prev.totalXP + result.xpEarned,
      missionsCompleted: prev.missionsCompleted + 1,
      bestAccuracy: Math.max(prev.bestAccuracy, result.accuracy),
      streak: result.streak,
    }))
    setVideoAttempts(prev => prev + 1)
    setScreen('victory')
  }, [])

  const navigate = useCallback((s) => {
    setScreen(s)
    window.scrollTo(0, 0)
  }, [])

  const canRetry = false

  return (
    <div className="min-h-screen bg-surface">
      {screen === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}
      {screen === 'home' && (
        <HomeScreen player={player} onNavigate={navigate} onSelectVideo={handleSelectVideo} />
      )}
      {screen === 'missions' && (
        <MissionsScreen player={player} onNavigate={navigate} onSelectVideo={handleSelectVideo} />
      )}
      {screen === 'briefing' && selectedVideo && (
        <BriefingScreen
          video={selectedVideo}
          attempt={videoAttempts + 1}
          onStart={() => navigate('quiz')}
          onBack={() => navigate('home')}
          onNavigate={navigate}
        />
      )}
      {screen === 'quiz' && selectedVideo && (
        <QuizScreen
          questions={selectedVideo.questions}
          quizCount={selectedVideo.questions.length}
          player={player}
          videoId={selectedVideo.id}
          attempt={videoAttempts + 1}
          onFinish={handleQuizFinish}
          onExit={() => navigate('briefing')}
        />
      )}
      {screen === 'victory' && (
        <VictoryScreen
          result={quizResult}
          player={player}
          attempt={videoAttempts}
          canRetry={canRetry}
          onHome={() => navigate('home')}
          onRetry={() => navigate('briefing')}
        />
      )}
      {screen === 'dashboard' && (
        <DashboardScreen player={player} onNavigate={navigate} />
      )}
      {screen === 'admin' && player.playerRole === 'admin' && (
        <AdminScreen player={player} onNavigate={navigate} />
      )}
      {screen === 'profile' && (
        <ProfileScreen
          player={player}
          onNavigate={navigate}
          onLogout={() => { setPlayer(INITIAL_STATE); navigate('login') }}
        />
      )}
    </div>
  )
}
