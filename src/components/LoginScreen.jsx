import { useState } from 'react'
import { supabase } from '../lib/supabase'

const SECTORS = [
  'AMBULATÓRIO',
  'CCIH',
  'CCIRAS',
  'CCIRAS + FISIOTERAPIA',
  'CENTRO CIRURGICO',
  'COCEP',
  'COORD. CME',
  'COORD. DA NUTRIÇÃO',
  'COORD. DA RECEPÇÃO',
  'COORD. FARMÁCIA',
  'COORD. MULTIPROFISSIONAL',
  'COORD. NIR',
  'COORD. NUTRIÇÃO',
  'COORD. SERVIÇO SOCIAL',
  'COORDENAÇÃO DA FARMÁCIA',
  'COORDENAÇÃO DO SESMT',
  'COORDENAÇÃO MÉDICA DA UTIN E CCIRAS',
  'COORDENADOR DO SETOR',
  'COORDENADORA DA UTIN',
  'COREMU',
  'CRO',
  'GERENCIA DE ENFERMAGEM',
  'GERENCIA/UTIN',
  'NEP',
  'NHE',
  'NIR',
  'NIR/ DIREÇÃO CLINICA',
  'NSP',
  'QUALIDADE',
  'RESIDENCIA',
  'TIME DE ACESSO',
  'UTI NEO',
  'UTIN',
  'UTIN /CCIH',
]

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [sector, setSector] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const translateError = (msg) => {
    if (msg.includes('Invalid login credentials')) return 'Email ou senha incorretos.'
    if (msg.includes('User already registered')) return 'Este email já está cadastrado.'
    if (msg.includes('Email not confirmed')) return 'Confirme seu email antes de entrar.'
    if (msg.includes('Password should be')) return 'A senha deve ter no mínimo 6 caracteres.'
    if (msg.includes('duplicate key')) return 'Este email já está cadastrado.'
    return msg
  }

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Preencha email e senha.')
      return
    }
    setError('')
    setLoading(true)

    try {
      // 1. Autenticar via Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      // Se não tem no auth, tenta login direto pela tabela players (usuários antigos)
      if (authErr) {
        const { data } = await supabase
          .from('players')
          .select('*')
          .eq('email', email.trim().toLowerCase())
          .eq('password', password)

        if (!data || data.length === 0) throw new Error('Email ou senha incorretos.')
        const player = data[0]

        onLogin({
          playerId: player.id,
          playerName: player.name,
          playerSector: player.sector,
          playerRole: player.role || 'player',
          totalXP: player.total_xp || 0,
          missionsCompleted: player.missions_completed || 0,
          bestAccuracy: player.best_accuracy || 0,
          streak: player.streak || 0,
        })
        return
      }

      // 2. Buscar dados do jogador pela user_id
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', authData.user.id)

      if (!data || data.length === 0) throw new Error('Perfil não encontrado. Faça o cadastro.')
      const player = data[0]

      onLogin({
        playerId: player.id,
        playerName: player.name,
        playerSector: player.sector,
        playerRole: player.role || 'player',
        totalXP: player.total_xp || 0,
        missionsCompleted: player.missions_completed || 0,
        bestAccuracy: player.best_accuracy || 0,
        streak: player.streak || 0,
      })
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!name.trim() || !sector || !email.trim() || !password) {
      setError('Preencha todos os campos.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    setError('')
    setLoading(true)

    try {
      // Verificar se email já existe na players
      const { data: existing } = await supabase
        .from('players')
        .select('id')
        .eq('email', email.trim().toLowerCase())

      if (existing && existing.length > 0) throw new Error('Este email já está cadastrado.')

      // 1. Criar usuário no auth.users do Supabase
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      })

      if (authErr) throw authErr

      // 2. Criar jogador na tabela players vinculado ao auth user
      const { data, error: err } = await supabase
        .from('players')
        .insert({
          user_id: authData.user.id,
          name: name.trim(),
          sector,
          email: email.trim().toLowerCase(),
          password,
        })
        .select()
        .single()

      if (err) throw err

      onLogin({
        playerId: data.id,
        playerName: data.name,
        playerSector: data.sector,
        totalXP: 0,
        missionsCompleted: 0,
        bestAccuracy: 0,
        streak: 0,
      })
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setLoading(false)
    }
  }

  const submitForm = () => mode === 'login' ? handleLogin() : handleRegister()

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center p-5 min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed top-[-15%] left-[-15%] w-[50%] h-[50%] bg-primary-fixed opacity-10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-15%] w-[55%] h-[55%] bg-tertiary-fixed opacity-10 rounded-full blur-[120px] pointer-events-none" />

      <main className="w-full max-w-sm flex flex-col items-center space-y-6 relative z-10">
        {/* Logo */}
        <div className="relative">
          <img
            alt="Quiz Juju"
            className="w-40 h-40 object-contain drop-shadow-xl"
            src="/logo-quiz-juju.png"
          />
        </div>

        {/* Título */}
        <div className="text-center space-y-1">
          <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight">
            <span className="text-[#40cef3]">Quiz</span> <span className="text-vibrant-orange">Juju</span>
          </h1>
          <p className="text-on-surface-variant text-sm">
            {mode === 'login' ? 'Acesse sua conta e continue a missão.' : 'Crie sua conta e junte-se ao time!'}
          </p>
        </div>

        {/* Tabs */}
        <div className="w-full flex bg-surface-container-high rounded-full p-1">
          <button
            onClick={() => { setMode('login'); setError('') }}
            className={`flex-1 py-3 rounded-full font-headline font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-primary text-on-primary shadow-[0_3px_0_0_#004a5a]'
                : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
            Entrar
          </button>
          <button
            onClick={() => { setMode('register'); setError('') }}
            className={`flex-1 py-3 rounded-full font-headline font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-primary text-on-primary shadow-[0_3px_0_0_#004a5a]'
                : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
            Cadastrar
          </button>
        </div>

        {/* Form */}
        <div className="w-full bg-surface-container-lowest p-6 rounded-2xl shadow-[0_6px_0_0_#d5dee1] space-y-4 relative overflow-hidden">
          {mode === 'register' && (
            <div className="absolute -top-2 -right-2 bg-vibrant-orange text-white px-3 py-1 rounded-lg font-label font-bold text-[9px] uppercase tracking-tighter rotate-12 shadow-md">
              Novo Recruta
            </div>
          )}

          {mode === 'register' && (
            <>
              <Field icon="badge" label="Nome Completo" placeholder="Ex: Ana Silva" value={name} onChange={setName} onEnter={submitForm} />
              <div className="space-y-1.5">
                <label className="font-label font-bold text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Setor</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-xl">medical_services</span>
                  <select
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-10 focus:ring-4 focus:ring-primary-fixed focus:bg-white transition-all font-medium text-on-surface appearance-none cursor-pointer outline-none text-sm"
                  >
                    <option disabled value="">Selecione seu setor</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>
              </div>
            </>
          )}

          <Field icon="mail" label="Email" type="email" placeholder="seu.email@hospital.com" value={email} onChange={setEmail} onEnter={submitForm} />
          <Field icon="lock" label="Senha" type="password" placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'} value={password} onChange={setPassword} onEnter={submitForm} />

          {error && (
            <div className="flex items-center gap-2 text-error text-sm font-medium bg-wrong-bg p-3 rounded-xl">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {loading && <div className="flex justify-center py-1"><div className="spinner" /></div>}

          <button
            onClick={submitForm}
            disabled={loading}
            className={`w-full font-headline font-black text-lg py-5 rounded-xl uppercase tracking-wider active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${
              mode === 'login'
                ? 'bg-primary text-on-primary chunky-shadow-primary'
                : 'bg-vibrant-orange text-white orange-chunky-shadow'
            }`}
          >
            {mode === 'login' ? 'ENTRAR NA MISSÃO' : 'CRIAR CONTA'}
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {mode === 'login' ? 'rocket_launch' : 'shield_person'}
            </span>
          </button>
        </div>

        <p className="text-on-surface-variant text-sm text-center">
          {mode === 'login' ? (
            <>Primeira missão? <button onClick={() => { setMode('register'); setError('') }} className="text-primary font-bold hover:underline">Cadastre-se</button></>
          ) : (
            <>Já é do time? <button onClick={() => { setMode('login'); setError('') }} className="text-primary font-bold hover:underline">Faça login</button></>
          )}
        </p>
      </main>

    </div>
  )
}

function Field({ icon, label, type = 'text', placeholder, value, onChange, onEnter }) {
  return (
    <div className="space-y-1.5">
      <label className="font-label font-bold text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">{label}</label>
      <div className="relative group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-xl">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onEnter?.()}
          className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-4 focus:ring-primary-fixed focus:bg-white transition-all font-medium text-on-surface placeholder:text-outline-variant outline-none text-sm"
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
