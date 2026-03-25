import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const TABS = [
  { id: 'questions', icon: 'quiz', label: 'Perguntas' },
  { id: 'videos', icon: 'play_circle', label: 'Vídeos' },
  { id: 'reports', icon: 'assessment', label: 'Relatórios' },
]

export default function AdminScreen({ player, onNavigate }) {
  const [tab, setTab] = useState('questions')

  return (
    <div className="animate-fade-in flex flex-col min-h-screen pb-8 lg:pl-20">
      {/* Header */}
      <header className="w-full sticky top-0 z-40 px-5 py-4 bg-surface/90 backdrop-blur-md shadow-[0_4px_0_0_rgba(213,222,225,1)] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="active:translate-y-1 transition-transform">
            <span className="material-symbols-outlined text-[#00B4D8] text-2xl">arrow_back</span>
          </button>
          <div>
            <h1 className="font-headline font-bold tracking-tight text-on-surface text-lg">Painel Admin</h1>
            <p className="text-on-surface-variant text-xs">Gerenciamento do treinamento</p>
          </div>
        </div>
        <div className="bg-error/10 text-error px-3 py-1 rounded-full font-label font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
          Admin
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto w-full px-5 pt-4">
        <div className="flex bg-surface-container-high rounded-full p-1 gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 rounded-full font-headline font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                tab === t.id
                  ? 'bg-primary text-on-primary shadow-[0_3px_0_0_#004a5a]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto w-full px-5 pt-5 flex-grow">
        {tab === 'questions' && <QuestionsTab />}
        {tab === 'videos' && <VideosTab />}
        {tab === 'reports' && <ReportsTab />}
      </main>
    </div>
  )
}

/* ========== PERGUNTAS ========== */
function QuestionsTab() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [videos, setVideos] = useState([])
  const [form, setForm] = useState({
    question: '', option_a: '', option_b: '', option_c: '', option_d: '',
    correct_index: 0, justification: '', category: '', video_id: null,
  })

  useEffect(() => { loadQuestions(); loadVideos() }, [])

  const loadVideos = async () => {
    const { data } = await supabase.from('videos').select('id, title').order('title')
    if (data) setVideos(data)
  }

  const loadQuestions = async () => {
    setLoading(true)
    const { data } = await supabase.from('questions').select('*').order('id')
    if (data) setQuestions(data)
    setLoading(false)
  }

  const resetForm = () => {
    setForm({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_index: 0, justification: '', category: '', video_id: null })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    if (!form.question || !form.option_a || !form.option_b || !form.option_c || !form.option_d) return

    if (editingId) {
      await supabase.from('questions').update(form).eq('id', editingId)
    } else {
      await supabase.from('questions').insert(form)
    }
    resetForm()
    loadQuestions()
  }

  const handleEdit = (q) => {
    setForm({
      question: q.question, option_a: q.option_a, option_b: q.option_b,
      option_c: q.option_c, option_d: q.option_d, correct_index: q.correct_index,
      justification: q.justification || '', category: q.category || '', video_id: q.video_id || null,
    })
    setEditingId(q.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return
    await supabase.from('questions').delete().eq('id', id)
    loadQuestions()
  }

  const [filterVideoId, setFilterVideoId] = useState('')

  const filtered = questions.filter(q => {
    const matchSearch = q.question.toLowerCase().includes(search.toLowerCase()) ||
      (q.category || '').toLowerCase().includes(search.toLowerCase())
    const matchVideo = !filterVideoId || String(q.video_id) === filterVideoId
    return matchSearch && matchVideo
  })

  const LABELS = ['A', 'B', 'C', 'D']

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar pergunta ou categoria..."
            className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-11 pr-4 font-medium text-sm text-on-surface placeholder:text-outline-variant outline-none focus:ring-4 focus:ring-primary-fixed"
          />
        </div>
        <select
          value={filterVideoId}
          onChange={e => setFilterVideoId(e.target.value)}
          className="bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium text-sm text-on-surface outline-none focus:ring-4 focus:ring-primary-fixed appearance-none cursor-pointer shrink-0"
        >
          <option value="">Todos os vídeos</option>
          {videos.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
        </select>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-primary text-on-primary font-headline font-bold text-sm px-5 py-3 rounded-xl chunky-shadow-primary active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nova Pergunta
        </button>
      </div>

      <p className="text-on-surface-variant text-sm">{filtered.length} perguntas cadastradas</p>

      {/* Form */}
      {showForm && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_6px_0_0_#d5dee1] space-y-4">
          <h3 className="font-headline font-bold text-base flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">{editingId ? 'edit' : 'add_circle'}</span>
            {editingId ? 'Editar Pergunta' : 'Nova Pergunta'}
          </h3>

          <FormField label="Pergunta" value={form.question} onChange={v => setForm(f => ({ ...f, question: v }))} textarea />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Opção A" value={form.option_a} onChange={v => setForm(f => ({ ...f, option_a: v }))} />
            <FormField label="Opção B" value={form.option_b} onChange={v => setForm(f => ({ ...f, option_b: v }))} />
            <FormField label="Opção C" value={form.option_c} onChange={v => setForm(f => ({ ...f, option_c: v }))} />
            <FormField label="Opção D" value={form.option_d} onChange={v => setForm(f => ({ ...f, option_d: v }))} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-label font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Resposta Correta</label>
              <div className="flex gap-2">
                {LABELS.map((l, i) => (
                  <button
                    key={i}
                    onClick={() => setForm(f => ({ ...f, correct_index: i }))}
                    className={`w-10 h-10 rounded-xl font-headline font-bold text-sm transition-all ${
                      form.correct_index === i
                        ? 'bg-correct text-white shadow-[0_3px_0_0_#2d8c00]'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <FormField label="Categoria" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} placeholder="Ex: Precauções" />
          </div>

          <div className="space-y-1.5">
            <label className="font-label font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Vídeo/Treinamento</label>
            <select
              value={form.video_id || ''}
              onChange={e => setForm(f => ({ ...f, video_id: e.target.value ? Number(e.target.value) : null }))}
              className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium text-sm text-on-surface appearance-none cursor-pointer outline-none focus:ring-4 focus:ring-primary-fixed"
            >
              <option value="">Sem vídeo vinculado</option>
              {videos.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
            </select>
          </div>

          <FormField label="Justificativa" value={form.justification} onChange={v => setForm(f => ({ ...f, justification: v }))} textarea />

          <div className="flex gap-3 pt-2">
            <button onClick={resetForm} className="flex-1 py-3 rounded-xl font-headline font-bold text-sm uppercase bg-surface-container-high text-on-surface-variant">
              Cancelar
            </button>
            <button onClick={handleSave} className="flex-1 py-3 rounded-xl font-headline font-bold text-sm uppercase bg-primary text-on-primary chunky-shadow-primary active:translate-y-1 active:shadow-none transition-all">
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q, i) => (
            <div key={q.id} className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_3px_0_0_#d5dee1]">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="bg-primary-container text-on-primary-container font-label font-black text-[10px] px-2 py-0.5 rounded-full">#{q.id}</span>
                    {q.category && <span className="bg-tertiary-container/50 text-on-tertiary-container font-label text-[10px] font-bold px-2 py-0.5 rounded-full">{q.category}</span>}
                    {q.video_id && videos.find(v => v.id === q.video_id) && (
                      <span className="bg-primary/10 text-primary font-label text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">play_circle</span>
                        {videos.find(v => v.id === q.video_id)?.title}
                      </span>
                    )}
                    {!q.video_id && (
                      <span className="bg-error/10 text-error font-label text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">warning</span>
                        Sem vídeo
                      </span>
                    )}
                  </div>
                  <p className="font-headline font-bold text-sm text-on-surface leading-snug">{q.question}</p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt, idx) => (
                      <span key={idx} className={`text-[11px] px-2 py-1 rounded-lg truncate ${idx === q.correct_index ? 'bg-correct-bg text-correct-dark font-bold' : 'bg-surface-container-low text-on-surface-variant'}`}>
                        {LABELS[idx]}. {opt}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => handleEdit(q)} className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="w-9 h-9 rounded-xl bg-error/10 flex items-center justify-center text-error hover:bg-error/20 transition-colors">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ========== VÍDEOS ========== */
function VideosTab() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', youtube_url: '', description: '' })

  useEffect(() => { loadVideos() }, [])

  const loadVideos = async () => {
    setLoading(true)
    const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false })
    if (data) setVideos(data)
    setLoading(false)
  }

  const resetForm = () => {
    setForm({ title: '', youtube_url: '', description: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    if (!form.title || !form.youtube_url) return
    if (editingId) {
      await supabase.from('videos').update(form).eq('id', editingId)
    } else {
      await supabase.from('videos').insert(form)
    }
    resetForm()
    loadVideos()
  }

  const handleDelete = async (id) => {
    if (!confirm('Excluir este vídeo?')) return
    await supabase.from('videos').delete().eq('id', id)
    loadVideos()
  }

  const getEmbedUrl = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : url
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-on-surface-variant text-sm">{videos.length} vídeos cadastrados</p>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-primary text-on-primary font-headline font-bold text-sm px-5 py-3 rounded-xl chunky-shadow-primary active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Novo Vídeo
        </button>
      </div>

      {showForm && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_6px_0_0_#d5dee1] space-y-4">
          <h3 className="font-headline font-bold text-base flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">{editingId ? 'edit' : 'add_circle'}</span>
            {editingId ? 'Editar Vídeo' : 'Novo Vídeo'}
          </h3>
          <FormField label="Título" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Ex: Segurança do Paciente" />
          <FormField label="URL do YouTube" value={form.youtube_url} onChange={v => setForm(f => ({ ...f, youtube_url: v }))} placeholder="https://youtube.com/watch?v=..." />
          <FormField label="Descrição" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} textarea placeholder="Descrição do conteúdo..." />

          {form.youtube_url && (
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
              <iframe className="w-full h-full" src={getEmbedUrl(form.youtube_url)} title="Preview" frameBorder="0" allowFullScreen />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={resetForm} className="flex-1 py-3 rounded-xl font-headline font-bold text-sm uppercase bg-surface-container-high text-on-surface-variant">Cancelar</button>
            <button onClick={handleSave} className="flex-1 py-3 rounded-xl font-headline font-bold text-sm uppercase bg-primary text-on-primary chunky-shadow-primary active:translate-y-1 active:shadow-none transition-all">
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map(v => (
            <div key={v.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_4px_0_0_#d5dee1]">
              <div className="aspect-video bg-black">
                <iframe className="w-full h-full" src={getEmbedUrl(v.youtube_url)} title={v.title} frameBorder="0" allowFullScreen />
              </div>
              <div className="p-4">
                <h4 className="font-headline font-bold text-sm text-on-surface">{v.title}</h4>
                {v.description && <p className="text-on-surface-variant text-xs mt-1 line-clamp-2">{v.description}</p>}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { setForm({ title: v.title, youtube_url: v.youtube_url, description: v.description || '' }); setEditingId(v.id); setShowForm(true) }}
                    className="flex-1 py-2 rounded-lg text-xs font-bold bg-primary/10 text-primary flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold bg-error/10 text-error flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ========== GERAR PDF ========== */
function generatePDF(filteredPlayerIds, players, playerGroups, getPlayerVideoStatus, videosMap, stats) {
  const doc = new jsPDF('portrait', 'mm', 'a4')
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 15
  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const colorStatus = (data, colIdx) => {
    if (data.section !== 'body') return
    const val = data.cell.raw
    if (data.column.index === colIdx) {
      if (val === 'APROVADO') { data.cell.styles.textColor = [45, 140, 0]; data.cell.styles.fontStyle = 'bold' }
      else if (val === 'REPROVADO') { data.cell.styles.textColor = [179, 27, 37]; data.cell.styles.fontStyle = 'bold' }
      else if (val === 'EM ANDAMENTO') { data.cell.styles.textColor = [247, 127, 0]; data.cell.styles.fontStyle = 'bold' }
    }
  }

  // ===== CAPA =====
  doc.setFillColor(0, 100, 121)
  doc.rect(0, 0, pageW, 45, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('Quiz Juju', margin, 20)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Relatório de Desempenho dos Participantes', margin, 30)
  doc.text(`Gerado em: ${dateStr}`, margin, 38)

  // ===== RESUMO GERAL =====
  doc.setTextColor(41, 48, 49)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumo Geral', margin, 58)

  autoTable(doc, {
    startY: 63,
    head: [['Participantes', 'Tentativas', 'Aprovados', 'Média Geral']],
    body: [[stats.totalPlayers, stats.totalAttempts, stats.approvedCount, `${stats.avgAccuracy}%`]],
    theme: 'grid',
    headStyles: { fillColor: [0, 100, 121], textColor: 255, fontStyle: 'bold', fontSize: 9, halign: 'center' },
    bodyStyles: { fontSize: 11, fontStyle: 'bold', halign: 'center' },
    margin: { left: margin, right: margin },
  })

  // ===== RESUMO POR PARTICIPANTE =====
  let y = doc.lastAutoTable.finalY + 12
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(41, 48, 49)
  doc.text('Resultado por Participante', margin, y)

  const summaryBody = []
  filteredPlayerIds.forEach(pid => {
    const p = players[pid] || {}
    const playerResults = playerGroups[pid] || []
    const videoStatus = getPlayerVideoStatus(playerResults)

    Object.entries(videoStatus).forEach(([vid, vs]) => {
      const video = videosMap[vid]
      const status = vs.passed ? 'APROVADO' : vs.attempts.length >= 3 ? 'REPROVADO' : 'EM ANDAMENTO'
      summaryBody.push([
        p.name || '—',
        p.sector || '—',
        video?.title || '—',
        `${vs.attempts.length}/3`,
        `${vs.bestAccuracy}%`,
        status,
      ])
    })
  })

  autoTable(doc, {
    startY: y + 4,
    head: [['Nome', 'Setor', 'Treinamento', 'Tentativas', 'Melhor Nota', 'Status']],
    body: summaryBody,
    theme: 'striped',
    headStyles: { fillColor: [0, 100, 121], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'center', cellWidth: 22 },
      5: { halign: 'center', cellWidth: 25 },
    },
    margin: { left: margin, right: margin },
    didParseCell: (data) => colorStatus(data, 5),
  })

  // ===== DETALHAMENTO =====
  doc.addPage('landscape')
  const pageWL = doc.internal.pageSize.getWidth()

  doc.setFillColor(0, 100, 121)
  doc.rect(0, 0, pageWL, 18, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalhamento de Todas as Tentativas', margin, 12)

  const detailBody = []
  filteredPlayerIds.forEach(pid => {
    const p = players[pid] || {}
    const playerResults = playerGroups[pid] || []
    const videoStatus = getPlayerVideoStatus(playerResults)

    Object.entries(videoStatus).forEach(([vid, vs]) => {
      const video = videosMap[vid]
      vs.attempts
        .sort((a, b) => (a.attempt || 1) - (b.attempt || 1))
        .forEach((r, idx) => {
          const mins = Math.floor((r.time_seconds || 0) / 60)
          const secs = (r.time_seconds || 0) % 60
          const date = new Date(r.created_at)
          const status = r.accuracy >= 80 ? 'APROVADO' : 'REPROVADO'
          const attemptNum = r.attempt || idx + 1

          detailBody.push([
            p.name || '—',
            p.sector || '—',
            p.email || '—',
            video?.title || '—',
            `${attemptNum}ª`,
            `${r.score}/${r.total_questions}`,
            `${r.accuracy}%`,
            `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
            status,
            date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          ])
        })
    })
  })

  autoTable(doc, {
    startY: 24,
    head: [['Nome', 'Setor', 'Email', 'Treinamento', 'Tent.', 'Acertos', 'Nota', 'Tempo', 'Status', 'Data/Hora']],
    body: detailBody,
    theme: 'striped',
    headStyles: { fillColor: [0, 100, 121], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: {
      4: { halign: 'center', cellWidth: 12 },
      5: { halign: 'center', cellWidth: 16 },
      6: { halign: 'center', cellWidth: 14 },
      7: { halign: 'center', cellWidth: 14 },
      8: { halign: 'center', cellWidth: 22 },
    },
    margin: { left: 10, right: 10 },
    didParseCell: (data) => {
      colorStatus(data, 8)
      // Colorir nota
      if (data.column.index === 6 && data.section === 'body') {
        const val = parseInt(data.cell.raw)
        if (val >= 80) { data.cell.styles.textColor = [45, 140, 0]; data.cell.styles.fontStyle = 'bold' }
        else if (val < 50) { data.cell.styles.textColor = [179, 27, 37] }
      }
    },
  })

  // ===== RODAPÉ EM TODAS AS PÁGINAS =====
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const pw = doc.internal.pageSize.getWidth()
    const ph = doc.internal.pageSize.getHeight()
    doc.setFontSize(7)
    doc.setTextColor(150)
    doc.setFont('helvetica', 'normal')
    doc.text(`Quiz Juju  |  ${dateStr}  |  Página ${i}/${pageCount}`, pw / 2, ph - 7, { align: 'center' })
  }

  doc.save(`relatorio-treinamento-${now.toISOString().slice(0, 10)}.pdf`)
}

/* ========== RELATÓRIOS ========== */
function ReportsTab() {
  const [results, setResults] = useState([])
  const [players, setPlayers] = useState({})
  const [videosMap, setVideosMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterVideo, setFilterVideo] = useState('')
  const [filterStatus, setFilterStatus] = useState('') // 'approved', 'failed', 'pending'
  const [expandedPlayer, setExpandedPlayer] = useState(null)

  useEffect(() => { loadReports() }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      const [resResults, resPlayers, resVideos] = await Promise.all([
        supabase.from('mission_results').select('*').order('created_at', { ascending: false }),
        supabase.from('players').select('id, name, sector, email'),
        supabase.from('videos').select('id, title'),
      ])

      if (resResults.data) setResults(resResults.data)
      if (resPlayers.data) {
        const map = {}
        resPlayers.data.forEach(p => { map[p.id] = p })
        setPlayers(map)
      }
      if (resVideos.data) {
        const map = {}
        resVideos.data.forEach(v => { map[v.id] = v })
        setVideosMap(map)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Agrupar resultados por jogador
  const playerGroups = {}
  results.forEach(r => {
    if (!playerGroups[r.player_id]) playerGroups[r.player_id] = []
    playerGroups[r.player_id].push(r)
  })

  // Calcular status por jogador+vídeo
  const getPlayerVideoStatus = (playerResults) => {
    const byVideo = {}
    playerResults.forEach(r => {
      const vid = r.video_id || 'unknown'
      if (!byVideo[vid]) byVideo[vid] = { attempts: [], bestAccuracy: 0, passed: false }
      byVideo[vid].attempts.push(r)
      if (r.accuracy > byVideo[vid].bestAccuracy) byVideo[vid].bestAccuracy = r.accuracy
      if (r.accuracy >= 80) byVideo[vid].passed = true
    })
    return byVideo
  }

  // Filtrar jogadores
  const filteredPlayerIds = Object.keys(playerGroups).filter(pid => {
    const p = players[pid]
    if (!p) return false
    const q = search.toLowerCase()
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.sector?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)

    if (!matchSearch) return false

    if (filterVideo || filterStatus) {
      const videoStatus = getPlayerVideoStatus(playerGroups[pid])
      if (filterVideo) {
        const vs = videoStatus[filterVideo]
        if (!vs) return false
        if (filterStatus === 'approved' && !vs.passed) return false
        if (filterStatus === 'failed' && (vs.passed || vs.attempts.length < 3)) return false
        if (filterStatus === 'pending' && (vs.passed || vs.attempts.length >= 3)) return false
      } else if (filterStatus) {
        const anyMatch = Object.values(videoStatus).some(vs => {
          if (filterStatus === 'approved') return vs.passed
          if (filterStatus === 'failed') return !vs.passed && vs.attempts.length >= 3
          if (filterStatus === 'pending') return !vs.passed && vs.attempts.length < 3
          return true
        })
        if (!anyMatch) return false
      }
    }

    return true
  })

  // Stats gerais
  const totalPlayers = Object.keys(players).length
  const totalAttempts = results.length
  const avgAccuracy = results.length > 0 ? Math.round(results.reduce((a, r) => a + r.accuracy, 0) / results.length) : 0
  const approvedCount = Object.keys(playerGroups).filter(pid => {
    return Object.values(getPlayerVideoStatus(playerGroups[pid])).some(vs => vs.passed)
  }).length

  const videosList = Object.values(videosMap)

  return (
    <div className="space-y-5">
      {/* Stats gerais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-primary/10 rounded-2xl p-4 text-center">
          <p className="font-headline font-black text-2xl text-primary">{totalPlayers}</p>
          <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Participantes</p>
        </div>
        <div className="bg-tertiary-container/30 rounded-2xl p-4 text-center">
          <p className="font-headline font-black text-2xl text-tertiary">{totalAttempts}</p>
          <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Tentativas</p>
        </div>
        <div className="bg-correct-bg rounded-2xl p-4 text-center">
          <p className="font-headline font-black text-2xl text-correct-dark">{approvedCount}</p>
          <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Aprovados</p>
        </div>
        <div className="bg-vibrant-orange/10 rounded-2xl p-4 text-center">
          <p className="font-headline font-black text-2xl text-vibrant-orange">{avgAccuracy}%</p>
          <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Média Geral</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, setor ou email..."
            className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-11 pr-4 font-medium text-sm text-on-surface placeholder:text-outline-variant outline-none focus:ring-4 focus:ring-primary-fixed"
          />
        </div>
        <select
          value={filterVideo}
          onChange={e => setFilterVideo(e.target.value)}
          className="bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium text-sm text-on-surface outline-none focus:ring-4 focus:ring-primary-fixed appearance-none cursor-pointer"
        >
          <option value="">Todos os vídeos</option>
          {videosList.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium text-sm text-on-surface outline-none focus:ring-4 focus:ring-primary-fixed appearance-none cursor-pointer"
        >
          <option value="">Todos os status</option>
          <option value="approved">Aprovados (80%+)</option>
          <option value="failed">Reprovados (3 tentativas)</option>
          <option value="pending">Em andamento</option>
        </select>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-on-surface-variant text-sm">{filteredPlayerIds.length} participantes encontrados</p>
        <button
          onClick={() => generatePDF(filteredPlayerIds, players, playerGroups, getPlayerVideoStatus, videosMap, { totalPlayers, totalAttempts, approvedCount, avgAccuracy })}
          className="bg-error text-white font-headline font-bold text-sm px-5 py-3 rounded-xl shadow-[0_4px_0_0_#9f0519] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
          Gerar PDF
        </button>
      </div>

      {/* Lista de participantes */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner" /></div>
      ) : (
        <div className="space-y-3">
          {filteredPlayerIds.map(pid => {
            const p = players[pid] || {}
            const playerResults = playerGroups[pid] || []
            const videoStatus = getPlayerVideoStatus(playerResults)
            const isExpanded = expandedPlayer === pid

            return (
              <div key={pid} className="bg-surface-container-lowest rounded-2xl shadow-[0_3px_0_0_#d5dee1] overflow-hidden">
                {/* Header do participante */}
                <button
                  onClick={() => setExpandedPlayer(isExpanded ? null : pid)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-container-low/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                      <span className="font-headline font-black text-sm text-on-primary-container">{p.name?.charAt(0)?.toUpperCase() || '?'}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-headline font-bold text-sm text-on-surface truncate">{p.name || 'Desconhecido'}</p>
                      <p className="text-on-surface-variant text-xs truncate">{p.sector} &bull; {p.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-headline font-bold text-xs text-on-surface-variant">{playerResults.length} tentativa{playerResults.length !== 1 ? 's' : ''}</span>
                    <span className={`material-symbols-outlined text-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                  </div>
                </button>

                {/* Detalhes expandidos */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-surface-container-high">
                    {Object.entries(videoStatus).map(([vid, vs]) => {
                      const video = videosMap[vid]
                      return (
                        <div key={vid} className="mt-3">
                          {/* Vídeo header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-lg">play_circle</span>
                              <span className="font-headline font-bold text-sm">{video?.title || 'Vídeo removido'}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full font-label font-black text-[10px] uppercase ${
                              vs.passed ? 'bg-correct-bg text-correct-dark' : vs.attempts.length >= 3 ? 'bg-wrong-bg text-error' : 'bg-vibrant-orange/10 text-vibrant-orange'
                            }`}>
                              {vs.passed ? 'Aprovado' : vs.attempts.length >= 3 ? 'Reprovado' : `${vs.attempts.length}/3 tentativas`}
                            </span>
                          </div>

                          {/* Tentativas */}
                          <div className="space-y-2 ml-7">
                            {vs.attempts
                              .sort((a, b) => (a.attempt || 1) - (b.attempt || 1))
                              .map((r, idx) => {
                                const mins = Math.floor((r.time_seconds || 0) / 60)
                                const secs = (r.time_seconds || 0) % 60
                                const date = new Date(r.created_at)
                                const isPassed = r.accuracy >= 80

                                return (
                                  <div key={r.id} className={`rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 ${isPassed ? 'bg-correct-bg/50' : 'bg-surface-container-low'}`}>
                                    {/* Tentativa badge */}
                                    <div className={`flex items-center gap-2 shrink-0`}>
                                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-headline font-black text-xs ${
                                        isPassed ? 'bg-correct text-white' : 'bg-surface-container-high text-on-surface-variant'
                                      }`}>
                                        {r.attempt || idx + 1}
                                      </span>
                                      <span className="font-label font-bold text-[10px] uppercase text-on-surface-variant">
                                        {r.attempt === 3 || idx === 2 ? 'Última' : `${r.attempt || idx + 1}ª`} tentativa
                                      </span>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex flex-wrap items-center gap-3 flex-1 text-xs">
                                      <span className={`px-2.5 py-1 rounded-lg font-headline font-black ${isPassed ? 'bg-correct text-white' : r.accuracy >= 50 ? 'bg-tertiary-container/50 text-on-tertiary-container' : 'bg-wrong-bg text-error'}`}>
                                        {r.accuracy}%
                                      </span>
                                      <span className="text-on-surface-variant flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        {r.score}/{r.total_questions}
                                      </span>
                                      <span className="text-on-surface-variant flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">timer</span>
                                        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                                      </span>
                                      <span className="text-on-surface-variant flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                                        {date.toLocaleDateString('pt-BR')} {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>

                                    {/* Status icon */}
                                    {isPassed && (
                                      <span className="material-symbols-outlined text-correct-dark text-xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                    )}
                                  </div>
                                )
                              })}
                          </div>

                          {/* Melhor nota */}
                          <div className="ml-7 mt-2 text-xs text-on-surface-variant">
                            Melhor nota: <span className={`font-bold ${vs.bestAccuracy >= 80 ? 'text-correct-dark' : 'text-error'}`}>{vs.bestAccuracy}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {filteredPlayerIds.length === 0 && (
            <p className="text-center text-on-surface-variant py-8 text-sm">Nenhum participante encontrado.</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ========== SHARED ========== */
function FormField({ label, value, onChange, placeholder, textarea }) {
  const cls = "w-full bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium text-sm text-on-surface placeholder:text-outline-variant outline-none focus:ring-4 focus:ring-primary-fixed"
  return (
    <div className="space-y-1.5">
      <label className="font-label font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls + ' resize-none'} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  )
}
