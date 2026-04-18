/**
 * questao-utils.js
 * Normaliza questões independente do formato do banco:
 *   Formato A (legado): { enunciado, alternativa_a/b/c/d, correta: 'A' }
 *   Formato B (novo):   { pergunta, opcoes: [...], resposta: 0 }
 */

/**
 * Retorna { enunciado, opcoes:[], respostaIdx, comentario, tema, subtema, dificuldade, banca, ano }
 */
function normalizarQuestao(q) {
  let enunciado, opcoes, respostaIdx, comentario;

  // ─── Formato novo (pergunta + opcoes array)
  if (q.pergunta) {
    enunciado = q.pergunta;
    opcoes = parseOpcoes(q.opcoes);
    respostaIdx = typeof q.resposta === 'number' ? q.resposta : 0;
    comentario = q.comentario || '';

  // ─── Formato legado (enunciado + alternativa_a/b/c/d)
  } else if (q.enunciado) {
    enunciado = q.enunciado;
    const letraParaIdx = { A: 0, B: 1, C: 2, D: 3, E: 4 };
    const corrLetra = (q.correta || 'A').toUpperCase();
    respostaIdx = letraParaIdx[corrLetra] ?? 0;
    comentario = q.comentario || q.gabarito || '';

    opcoes = [];
    ['a','b','c','d','e'].forEach(l => {
      const v = q['alternativa_' + l];
      if (v) opcoes.push(v);
    });
    // fallback: opcoes como array
    if (!opcoes.length && q.opcoes) opcoes = parseOpcoes(q.opcoes);

  } else {
    enunciado = '[Enunciado não encontrado]';
    opcoes = [];
    respostaIdx = 0;
    comentario = '';
  }

  return {
    id:          q.id,
    enunciado,
    opcoes,
    respostaIdx,
    comentario,
    tema:        q.tema        || '',
    subtema:     q.subtema     || '',
    dificuldade: q.dificuldade || 'media',
    banca:       q.banca       || '',
    ano:         q.ano         || '',
  };
}

function parseOpcoes(o) {
  if (Array.isArray(o)) return o;
  if (typeof o === 'string') {
    try { return JSON.parse(o); }
    catch { return o.split(',').map(s => s.trim()).filter(Boolean); }
  }
  return [];
}
