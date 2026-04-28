'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

const ADMIN_EMAIL = 'victorcbjr100@gmail.com'
const GROQ_API = process.env.NEXT_PUBLIC_GROQ_API_KEY || ''

const PROVAS = ['ENAMED','USP-SP','UNIFESP','UNICAMP','FMUSP','ENARE','REVALIDA','SUS-SP (IAMSPE)','HC-FMUSP','Santa Casa SP']
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

interface Config { prova_alvo: string; subtemas_ids: number[]; subtemas_por_dia: number; questoes_por_bloco: number; dias_semana: number[] }
interface Bloco { id: number; subtema_id: number; questao_ids: number[]; respondidas: number[]; acertos: number; concluido: boolean; data: string; subtema_nome?: string }
interface Questao { id: number; enunciado: string; imagem_url?: string; comando?: string; alternativas: { id: number; letra: string; texto: string; correta: boolean }[] }

// Prioridade de subtemas por prova (cobranças históricas)
const PRIORIDADE_PROVA: Record<string, string[]> = {
  'ENAMED': ['Cardiologia','Clínica Médica','Pediatria','Cirurgia','Ginecologia','Obstetrícia','Medicina Preventiva','Saúde Pública'],
  'USP-SP': ['Clínica Médica','Cirurgia','Cardiologia','Neurologia','Pneumologia','Nefrologia'],
  'SUS-SP (IAMSPE)': ['Cardiologia','Clínica Médica','Cirurgia','Pediatria','Ginecologia','Obstetrícia'],
  'UNIFESP': ['Clínica Médica','Cardiologia','Cirurgia','Neurologia','Endocrinologia'],
}

export default function CronogramaPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const initialized = useRef(false)
  const [tela, setTela] = useState<'loading'|'setup'|'home'|'bloco'>('loading')
  const [config, setConfig] = useState<Config | null>(null)
  const [blocos, setBlocos] = useState<Bloco[]>([])
  const [todosSubtemas, setTodosSubtemas] = useState<any[]>([])
  const [temas, setTemas] = useState<any[]>([])
  // Setup
  const [setupStep, setSetupStep] = useState(0)
  const [setupConfig, setSetupConfig] = useState<Config>({ prova_alvo: 'ENAMED', subtemas_ids: [], subtemas_por_dia: 2, questoes_por_bloco: 10, dias_semana: [1,2,3,4,5] })
  const [searchSub, setSearchSub] = useState('')
  const [savingSetup, setSavingSetup] = useState(false)
  // Bloco ativo
  const [blocoAtivo, setBlocoAtivo] = useState<Bloco | null>(null)
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [acertosBloco, setAcertosBloco] = useState(0)
  const [gerando, setGerando] = useState(false)
  const [iaFeedback, setIaFeedback] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user || user.email !== ADMIN_EMAIL) { router.push('/dashboard'); return }
    if (initialized.current) return
    initialized.current = true
    init()
  }, [user, authLoading])

  async function init() {
    const [{ data: configData }, { data: subsData }, { data: temasData }] = await Promise.all([
      supabase.from('cronograma_config').select('*').eq('user_id', user!.id).single(),
      supabase.from('subtemas').select('id, nome, tema_id, questoes(count)').order('nome'),
      supabase.from('temas').select('id, nome, icone').order('nome'),
    ])
    setTodosSubtemas(subsData || [])
    setTemas(temasData || [])
    if (configData) {
      setConfig(configData as Config)
      await loadBlocosHoje(configData as Config)
      setTela('home')
    } else {
      setTela('setup')
    }
  }

  async function loadBlocosHoje(cfg: Config) {
    const hoje = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('cronograma_blocos')
      .select('*, subtemas(nome)')
      .eq('user_id', user!.id)
      .eq('data', hoje)
      .order('id')
    if (data && data.length > 0) {
      setBlocos(data.map(b => ({ ...b, subtema_nome: b.subtemas?.nome })))
    } else {
      await gerarBlocosHoje(cfg)
    }
  }

  async function gerarBlocosHoje(cfg: Config) {
    setGerando(true)
    const hoje = new Date().toISOString().split('T')[0]
    const diaSemana = new Date().getDay()
    if (!cfg.dias_semana.includes(diaSemana)) { setGerando(false); return }

    // Busca estatísticas de acerto por subtema do usuário
    const { data: respostas } = await supabase.from('respostas')
      .select('questoes(subtema_id), acertou')
      .eq('session_id', user!.id)

    const statsMap: Record<number, { total: number; acertos: number }> = {}
    ;(respostas || []).forEach((r: any) => {
      const sid = r.questoes?.subtema_id
      if (!sid) return
      if (!statsMap[sid]) statsMap[sid] = { total: 0, acertos: 0 }
      statsMap[sid].total++
      if (r.acertou) statsMap[sid].acertos++
    })

    // Seleciona subtemas priorizando erros e prova alvo
    const provaPrio = PRIORIDADE_PROVA[cfg.prova_alvo] || []
    const subtemasConfig = cfg.subtemas_ids
    const subtemasOrdenados = [...subtemasConfig].sort((a, b) => {
      const sa = statsMap[a] || { total: 0, acertos: 0 }
      const sb = statsMap[b] || { total: 0, acertos: 0 }
      const pctA = sa.total > 0 ? sa.acertos / sa.total : 0.5
      const pctB = sb.total > 0 ? sb.acertos / sb.total : 0.5
      const nomeA = todosSubtemas.find(s => s.id === a)
      const nomeB = todosSubtemas.find(s => s.id === b)
      const temaA = temas.find(t => t.id === nomeA?.tema_id)
      const temaB = temas.find(t => t.id === nomeB?.tema_id)
      const prioA = provaPrio.indexOf(temaA?.nome || '') >= 0 ? 1 : 0
      const prioB = provaPrio.indexOf(temaB?.nome || '') >= 0 ? 1 : 0
      // Prioridade: mais erros primeiro, depois cobrança na prova
      return (pctA - pctB) + (prioB - prioA) * 0.1
    })

    // Rotação diária — usa o dia do ano para variar
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    const start = (dayOfYear * cfg.subtemas_por_dia) % Math.max(subtemasOrdenados.length, 1)
    const selecionados: number[] = []
    for (let i = 0; i < cfg.subtemas_por_dia && i < subtemasOrdenados.length; i++) {
      selecionados.push(subtemasOrdenados[(start + i) % subtemasOrdenados.length])
    }

    // Para cada subtema, busca questões aleatórias
    const novoBlocos: Bloco[] = []
    for (const subId of selecionados) {
      const { data: qs } = await supabase.from('questoes')
        .select('id').eq('subtema_id', subId).eq('oculto', false)
      if (!qs || qs.length === 0) continue
      // Shuffle e pega N questões
      const shuffled = qs.map(q => q.id).sort(() => Math.random() - 0.5)
      const escolhidas = shuffled.slice(0, cfg.questoes_por_bloco)
      const { data: blocoData } = await supabase.from('cronograma_blocos').insert({
        user_id: user!.id, data: hoje, subtema_id: subId,
        questao_ids: escolhidas, respondidas: [], acertos: 0, concluido: false
      }).select('*, subtemas(nome)').single()
      if (blocoData) novoBlocos.push({ ...blocoData, subtema_nome: blocoData.subtemas?.nome })
    }
    setBlocos(novoBlocos)
    setGerando(false)
  }

  async function abrirBloco(bloco: Bloco) {
    // Restaura progresso do localStorage
    const key = `cronograma_bloco_${bloco.id}`
    const saved = localStorage.getItem(key)
    let startIdx = 0
    let acertos = bloco.acertos
    if (saved) {
      const { idx, ac } = JSON.parse(saved)
      startIdx = idx
      acertos = ac
    }
    // Carrega questões
    const { data } = await supabase.from('questoes')
      .select('id, enunciado, imagem_url, comando, alternativas(id, letra, texto, correta)')
      .in('id', bloco.questao_ids)
    if (!data) return
    // Mantém ordem original
    const ordered = bloco.questao_ids.map(id => data.find(q => q.id === id)).filter(Boolean) as Questao[]
    setQuestoes(ordered)
    setQIdx(startIdx)
    setAcertosBloco(acertos)
    setSelected(null)
    setAnswered(false)
    setBlocoAtivo(bloco)
    setIaFeedback('')
    setTela('bloco')
  }

  async function responder() {
    if (!selected || answered || !blocoAtivo) return
    const q = questoes[qIdx]
    const correta = q.alternativas.find(a => a.correta)
    const acertou = selected === correta?.id
    setAnswered(true)
    const novosAcertos = acertou ? acertosBloco + 1 : acertosBloco
    setAcertosBloco(novosAcertos)
    // Salva progresso
    const key = `cronograma_bloco_${blocoAtivo.id}`
    localStorage.setItem(key, JSON.stringify({ idx: qIdx, ac: novosAcertos }))
    // Atualiza no banco
    const novasRespondidas = [...(blocoAtivo.respondidas || []), q.id]
    await supabase.from('cronograma_blocos').update({
      respondidas: novasRespondidas, acertos: novosAcertos,
      concluido: novasRespondidas.length >= questoes.length
    }).eq('id', blocoAtivo.id)
    setBlocoAtivo(prev => prev ? { ...prev, respondidas: novasRespondidas, acertos: novosAcertos } : prev)
    // Se última questão, gera feedback da IA
    if (qIdx === questoes.length - 1) {
      const pct = Math.round((novosAcertos / questoes.length) * 100)
      const msg = pct >= 80 ? `🏆 Excelente! ${novosAcertos}/${questoes.length} acertos (${pct}%). Você domina este tema!`
        : pct >= 60 ? `✅ Bom desempenho! ${novosAcertos}/${questoes.length} acertos (${pct}%). Continue praticando.`
        : `⚠️ Precisa melhorar. ${novosAcertos}/${questoes.length} acertos (${pct}%). Revise este subtema antes da prova.`
      setIaFeedback(msg)
      localStorage.removeItem(key)
    }
  }

  function proximaQuestao() {
    if (qIdx < questoes.length - 1) {
      setQIdx(i => i + 1)
      setSelected(null)
      setAnswered(false)
      const key = `cronograma_bloco_${blocoAtivo?.id}`
      localStorage.setItem(key, JSON.stringify({ idx: qIdx + 1, ac: acertosBloco }))
    }
  }

  function voltarQuestao() {
    if (qIdx > 0) {
      setQIdx(i => i - 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  async function salvarSetup() {
    if (setupConfig.subtemas_ids.length === 0) return
    setSavingSetup(true)
    const { data } = await supabase.from('cronograma_config').upsert({
      user_id: user!.id, ...setupConfig, updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' }).select().single()
    if (data) {
      setConfig(setupConfig)
      await gerarBlocosHoje(setupConfig)
      setTela('home')
    }
    setSavingSetup(false)
  }

  if (tela === 'loading' || authLoading) return (
    <div className="app"><Sidebar /><div className="main"><div className="loading">Carregando cronograma...</div></div></div>
  )

  // ── BLOCO DE QUESTÕES ────────────────────────────────────
  if (tela === 'bloco' && blocoAtivo && questoes.length > 0) {
    const q = questoes[qIdx]
    const corretaId = q.alternativas.find(a => a.correta)?.id
    const isUltima = qIdx === questoes.length - 1
    const concluido = blocoAtivo.respondidas?.length >= questoes.length

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => setTela('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', fontSize: 14, fontFamily: 'Inter', fontWeight: 600, padding: 0 }}>← Sair</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>{blocoAtivo.subtema_nome}</div>
            <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 2 }}>Questão {qIdx + 1} de {questoes.length} · {acertosBloco} acertos</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {Math.round((qIdx / questoes.length) * 100)}%
          </div>
        </div>

        {/* Barra de progresso */}
        <div style={{ height: 3, background: 'var(--border)' }}>
          <div style={{ height: '100%', width: `${((qIdx + (answered ? 1 : 0)) / questoes.length) * 100}%`, background: 'linear-gradient(90deg, #4A90E2, #6366F1)', transition: 'width .3s' }} />
        </div>

        {/* Feedback final */}
        {iaFeedback && (
          <div style={{ margin: '16px 20px 0', padding: '14px 18px', borderRadius: 12, background: acertosBloco / questoes.length >= 0.8 ? 'rgba(80,200,120,.12)' : acertosBloco / questoes.length >= 0.6 ? 'rgba(74,144,226,.1)' : 'rgba(232,93,93,.1)', border: `1px solid ${acertosBloco / questoes.length >= 0.8 ? '#50C878' : acertosBloco / questoes.length >= 0.6 ? 'var(--blue)' : '#E85D5D'}`, fontSize: 14, fontWeight: 600, lineHeight: 1.6 }}>
            {iaFeedback}
            <div style={{ marginTop: 12 }}>
              <button onClick={() => setTela('home')} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#4A90E2,#6366F1)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Inter' }}>
                Voltar ao cronograma
              </button>
            </div>
          </div>
        )}

        {/* Questão */}
        <div style={{ flex: 1, padding: '20px', maxWidth: 720, width: '100%', margin: '0 auto' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', marginBottom: 14 }}>
            <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text)' }}>{q.enunciado}</div>
            {q.imagem_url && <img src={q.imagem_url} alt="" style={{ marginTop: 14, width: '100%', maxWidth: 480, borderRadius: 10, border: '1px solid var(--border)' }} />}
            {q.comando && <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, fontSize: 14, fontStyle: 'italic', color: 'var(--muted)', border: '1px solid var(--border)' }}>{q.comando}</div>}
          </div>

          {/* Alternativas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {q.alternativas.sort((a, b) => a.letra.localeCompare(b.letra)).map(alt => {
              const isSelected = selected === alt.id
              const isCorreta = alt.id === corretaId
              let bg = 'var(--surface)', border = 'var(--border)', color = 'var(--text)'
              if (answered) {
                if (isCorreta) { bg = 'rgba(80,200,120,.15)'; border = '#50C878'; color = '#50C878' }
                else if (isSelected && !isCorreta) { bg = 'rgba(232,93,93,.1)'; border = '#E85D5D'; color = '#E85D5D' }
              } else if (isSelected) { bg = 'var(--blue-light)'; border = 'var(--blue)'; color = 'var(--blue)' }
              return (
                <button key={alt.id} onClick={() => !answered && setSelected(alt.id)} disabled={answered}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${border}`, background: bg, color, cursor: answered ? 'default' : 'pointer', textAlign: 'left', fontFamily: 'Inter', fontSize: 14, lineHeight: 1.6, transition: 'all .15s', width: '100%' }}>
                  <span style={{ fontWeight: 700, flexShrink: 0, minWidth: 20 }}>{alt.letra}</span>
                  <span>{alt.texto}</span>
                </button>
              )
            })}
          </div>

          {/* Botões de ação */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={voltarQuestao} disabled={qIdx === 0}
              style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--border)', background: 'none', color: qIdx === 0 ? 'var(--border)' : 'var(--text)', cursor: qIdx === 0 ? 'default' : 'pointer', fontSize: 14, fontFamily: 'Inter' }}>
              ← Voltar
            </button>
            {!answered ? (
              <button onClick={responder} disabled={!selected}
                style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: selected ? 'linear-gradient(135deg,#4A90E2,#6366F1)' : 'var(--border)', color: selected ? '#fff' : 'var(--muted)', cursor: selected ? 'pointer' : 'default', fontSize: 14, fontWeight: 700, fontFamily: 'Inter' }}>
                Responder
              </button>
            ) : !isUltima ? (
              <button onClick={proximaQuestao}
                style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#4A90E2,#6366F1)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Inter' }}>
                Próxima →
              </button>
            ) : (
              <button onClick={() => setTela('home')}
                style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#50C878,#2ecc71)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Inter' }}>
                ✅ Concluir bloco
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── SETUP ────────────────────────────────────────────────
  if (tela === 'setup') {
    const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, fontFamily: 'Inter,sans-serif', color: 'var(--text)', background: 'var(--surface)', outline: 'none', marginBottom: 12 }
    const subsFiltrados = todosSubtemas.filter(s => s.nome.toLowerCase().includes(searchSub.toLowerCase())).slice(0, 50)

    return (
      <div className="app"><Sidebar />
      <div className="main" style={{ maxWidth: 640 }}>
        <div className="page-header">
          <div className="page-title">📅 Configurar Cronograma</div>
          <div className="page-sub">Configure uma vez — a IA cuida do resto</div>
        </div>

        {/* Prova alvo */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🎯 Prova alvo</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PROVAS.map(p => (
              <button key={p} onClick={() => setSetupConfig(c => ({ ...c, prova_alvo: p }))}
                style={{ padding: '7px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: 12, fontWeight: 600, background: setupConfig.prova_alvo === p ? 'var(--blue)' : 'var(--surface)', color: setupConfig.prova_alvo === p ? '#fff' : 'var(--muted)', border: `1px solid ${setupConfig.prova_alvo === p ? 'var(--blue)' : 'var(--border)'}` }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Configuração de ritmo */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>⚙️ Ritmo de estudos</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 8 }}>Subtemas por dia</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setSetupConfig(c => ({ ...c, subtemas_por_dia: n }))}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: 13, fontWeight: 700, background: setupConfig.subtemas_por_dia === n ? 'var(--blue)' : 'var(--surface)', color: setupConfig.subtemas_por_dia === n ? '#fff' : 'var(--muted)', border: `1px solid ${setupConfig.subtemas_por_dia === n ? 'var(--blue)' : 'var(--border)'}` }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 8 }}>Questões por bloco</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[5,10,15,20,25,30].map(n => (
                  <button key={n} onClick={() => setSetupConfig(c => ({ ...c, questoes_por_bloco: n }))}
                    style={{ padding: '7px 10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: 12, fontWeight: 700, background: setupConfig.questoes_por_bloco === n ? 'var(--blue)' : 'var(--surface)', color: setupConfig.questoes_por_bloco === n ? '#fff' : 'var(--muted)', border: `1px solid ${setupConfig.questoes_por_bloco === n ? 'var(--blue)' : 'var(--border)'}` }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 8 }}>Dias de estudo</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {DIAS_SEMANA.map((d, i) => (
                <button key={i} onClick={() => setSetupConfig(c => ({ ...c, dias_semana: c.dias_semana.includes(i) ? c.dias_semana.filter(x => x !== i) : [...c.dias_semana, i] }))}
                  style={{ flex: 1, padding: '8px 4px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: 11, fontWeight: 700, background: setupConfig.dias_semana.includes(i) ? 'var(--blue)' : 'var(--surface)', color: setupConfig.dias_semana.includes(i) ? '#fff' : 'var(--muted)', border: `1px solid ${setupConfig.dias_semana.includes(i) ? 'var(--blue)' : 'var(--border)'}` }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Seleção de subtemas */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>📚 Subtemas do cronograma</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
            Selecione os subtemas que quer estudar. A IA vai rodar entre eles priorizando seus pontos fracos.
            <br /><strong style={{ color: setupConfig.subtemas_ids.length > 0 ? 'var(--blue)' : 'var(--red)' }}>{setupConfig.subtemas_ids.length} selecionados</strong>
          </div>
          <input style={{ ...inp, marginBottom: 10 }} value={searchSub} onChange={e => setSearchSub(e.target.value)} placeholder="🔍 Buscar subtema..." />
          {/* Selecionados */}
          {setupConfig.subtemas_ids.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {setupConfig.subtemas_ids.map(id => {
                const s = todosSubtemas.find(x => x.id === id)
                return s ? (
                  <span key={id} onClick={() => setSetupConfig(c => ({ ...c, subtemas_ids: c.subtemas_ids.filter(x => x !== id) }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'var(--blue)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {s.nome} ✕
                  </span>
                ) : null
              })}
            </div>
          )}
          <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {subsFiltrados.map(s => {
              const sel = setupConfig.subtemas_ids.includes(s.id)
              const count = s.questoes?.[0]?.count || 0
              return (
                <div key={s.id} onClick={() => setSetupConfig(c => ({ ...c, subtemas_ids: sel ? c.subtemas_ids.filter(x => x !== s.id) : [...c.subtemas_ids, s.id] }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, border: `1.5px solid ${sel ? 'var(--blue)' : 'var(--border)'}`, background: sel ? 'var(--blue-light)' : 'var(--surface)', cursor: 'pointer', transition: 'all .1s' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${sel ? 'var(--blue)' : 'var(--border)'}`, background: sel ? 'var(--blue)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {sel && <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: sel ? 'var(--blue)' : 'var(--text)' }}>{s.nome}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{count} questões</div>
                </div>
              )
            })}
          </div>
        </div>

        <button onClick={salvarSetup} disabled={savingSetup || setupConfig.subtemas_ids.length === 0}
          style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: setupConfig.subtemas_ids.length > 0 ? 'linear-gradient(135deg,#4A90E2,#6366F1)' : 'var(--border)', color: setupConfig.subtemas_ids.length > 0 ? '#fff' : 'var(--muted)', cursor: setupConfig.subtemas_ids.length > 0 ? 'pointer' : 'default', fontSize: 15, fontWeight: 700, fontFamily: 'Inter' }}>
          {savingSetup ? '⏳ Salvando...' : '🚀 Iniciar cronograma'}
        </button>
      </div></div>
    )
  }

  // ── HOME DO CRONOGRAMA ────────────────────────────────────
  const hoje = new Date().toISOString().split('T')[0]
  const diaSemana = new Date().getDay()
  const diaEstudo = config?.dias_semana.includes(diaSemana) ?? true
  const totalQuestoes = blocos.reduce((s, b) => s + b.questao_ids.length, 0)
  const totalRespondidas = blocos.reduce((s, b) => s + (b.respondidas?.length || 0), 0)
  const totalAcertos = blocos.reduce((s, b) => s + b.acertos, 0)

  return (
    <div className="app"><Sidebar />
    <div className="main" style={{ maxWidth: 720 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">📅 Meu Cronograma</div>
          <div className="page-sub">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </div>
        <button onClick={() => setTela('setup')}
          style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter', fontWeight: 600 }}>
          ⚙️ Editar
        </button>
      </div>

      {/* Resumo do dia */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { v: `${totalRespondidas}/${totalQuestoes}`, l: 'Respondidas', c: 'var(--blue)' },
          { v: totalRespondidas > 0 ? Math.round((totalAcertos/totalRespondidas)*100)+'%' : '—', l: 'Acertos', c: '#50C878' },
          { v: blocos.filter(b => b.concluido).length + '/' + blocos.length, l: 'Blocos', c: '#F5A623' },
        ].map(s => (
          <div key={s.l} className="card" style={{ textAlign: 'center', padding: '14px 10px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {!diaEstudo ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🛋️</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Dia de descanso!</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Você não programou estudos para hoje. Aproveite para descansar.</div>
        </div>
      ) : gerando ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>⏳ Gerando blocos do dia...</div>
        </div>
      ) : blocos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Nenhum bloco gerado. <button onClick={() => gerarBlocosHoje(config!)} style={{ color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontWeight: 600 }}>Gerar agora</button></div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {blocos.map(b => {
            const savedKey = `cronograma_bloco_${b.id}`
            const savedRaw = typeof window !== 'undefined' ? localStorage.getItem(savedKey) : null
            const emAndamento = savedRaw && !b.concluido
            const pct = b.questao_ids.length > 0 ? Math.round(((b.respondidas?.length || 0) / b.questao_ids.length) * 100) : 0
            const acertoPct = (b.respondidas?.length || 0) > 0 ? Math.round((b.acertos / (b.respondidas?.length || 1)) * 100) : null

            return (
              <div key={b.id} className="card" style={{ borderLeft: `4px solid ${b.concluido ? '#50C878' : emAndamento ? '#F5A623' : 'var(--blue)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{b.subtema_nome}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {b.questao_ids.length} questões
                      {acertoPct !== null && <span style={{ marginLeft: 8, color: acertoPct >= 80 ? '#50C878' : acertoPct >= 60 ? '#F5A623' : '#E85D5D', fontWeight: 600 }}>{acertoPct}% de acertos</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {b.concluido && <span style={{ fontSize: 11, fontWeight: 700, color: '#50C878', background: 'rgba(80,200,120,.12)', padding: '3px 10px', borderRadius: 99 }}>✅ Concluído</span>}
                    {emAndamento && <span style={{ fontSize: 11, fontWeight: 700, color: '#F5A623', background: 'rgba(245,166,35,.12)', padding: '3px 10px', borderRadius: 99 }}>▶ Em andamento</span>}
                  </div>
                </div>
                {/* Barra de progresso */}
                <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, marginBottom: 14, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: pct + '%', background: b.concluido ? '#50C878' : 'linear-gradient(90deg,#4A90E2,#6366F1)', borderRadius: 99, transition: 'width .4s' }} />
                </div>
                <button onClick={() => abrirBloco(b)}
                  style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: b.concluido ? 'rgba(80,200,120,.12)' : 'linear-gradient(135deg,#4A90E2,#6366F1)', color: b.concluido ? '#50C878' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Inter' }}>
                  {b.concluido ? '👁️ Revisar questões' : emAndamento ? `▶ Continuar — questão ${JSON.parse(savedRaw!).idx + 1}/${b.questao_ids.length}` : '▶ Iniciar bloco'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div></div>
  )
}
