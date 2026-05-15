const express = require('express');
const router = express.Router();
const db = require('../banco');
const autenticacao = require('../middleware/autenticacao');
const calcularScore = require('../utils/calculoScore');

// Criar avaliação
router.post('/', autenticacao, (req, res) => {
  const { paciente_id, respostas } = req.body;

  if (!paciente_id) {
    return res.status(400).json({ erro: 'Paciente é obrigatório' });
  }

  if (!Array.isArray(respostas) || respostas.length !== 12) {
    return res.status(400).json({ erro: 'É necessário enviar exatamente 12 respostas' });
  }

  db.get('SELECT sexo FROM pacientes WHERE id = ?', [paciente_id], (err, paciente) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar paciente' });

    if (!paciente) {
      return res.status(404).json({ erro: 'Paciente não encontrado' });
    }

    let resultado;

    try {
      resultado = calcularScore(respostas, paciente.sexo);
    } catch (erro) {
      return res.status(400).json({ erro: erro.message });
    }

    const { score, recomendacao } = resultado;

    db.run(
      `INSERT INTO avaliacoes (paciente_id, usuario_id, respostas, score, recomendacao)
       VALUES (?, ?, ?, ?, ?)`,
      [paciente_id, req.usuario.id, JSON.stringify(respostas), score, recomendacao],
      function (err) {
        if (err) return res.status(400).json({ erro: 'Erro ao salvar avaliação' });

        res.json({ id: this.lastID, score, recomendacao });
      }
    );
  });
});

// Listar avaliações
router.get('/', autenticacao, (req, res) => {
  const { paciente, inicio, fim } = req.query;

  let query = `
    SELECT
      a.*,
      p.nome AS paciente_nome,
      p.data_nascimento,
      p.sexo,
      u.username AS usuario_nome
    FROM avaliacoes a
    JOIN pacientes p ON a.paciente_id = p.id
    JOIN usuarios u ON a.usuario_id = u.id
    WHERE 1=1
  `;

  const params = [];

  if (req.usuario.papel !== 'admin') {
    query += ' AND a.usuario_id = ?';
    params.push(req.usuario.id);
  }

  if (paciente) {
    if (/^\d+$/.test(String(paciente))) {
      query += ' AND a.paciente_id = ?';
      params.push(paciente);
    } else {
      query += ' AND p.nome LIKE ?';
      params.push(`%${paciente}%`);
    }
  }

  if (inicio && fim) {
    query += ' AND a.criado_em BETWEEN ? AND ?';
    params.push(inicio, fim);
  }

  query += ' ORDER BY a.criado_em DESC';

  db.all(query, params, (err, dados) => {
    if (err) return res.status(500).json({ erro: 'Erro ao listar avaliações' });
    res.json(dados);
  });
});

// Histórico por paciente
router.get('/:pacienteId', autenticacao, (req, res) => {
  let query = `
    SELECT
      a.*,
      p.nome AS paciente_nome,
      p.data_nascimento,
      p.sexo,
      u.username AS usuario_nome
    FROM avaliacoes a
    JOIN pacientes p ON a.paciente_id = p.id
    JOIN usuarios u ON a.usuario_id = u.id
    WHERE a.paciente_id = ?
  `;

  const params = [req.params.pacienteId];

  if (req.usuario.papel !== 'admin') {
    query += ' AND a.usuario_id = ?';
    params.push(req.usuario.id);
  }

  query += ' ORDER BY a.criado_em DESC';

  db.all(query, params, (err, dados) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar histórico' });
    res.json(dados);
  });
});

// Dados para impressão
router.get('/imprimir/:id', autenticacao, (req, res) => {
  db.get(`
    SELECT a.*, p.nome, p.data_nascimento, p.sexo, u.username AS usuario_nome
    FROM avaliacoes a
    JOIN pacientes p ON a.paciente_id = p.id
    JOIN usuarios u ON a.usuario_id = u.id
    WHERE a.id = ?
  `, [req.params.id], (err, dados) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar avaliação' });

    if (!dados) {
      return res.status(404).json({ erro: 'Avaliação não encontrada' });
    }

    if (req.usuario.papel !== 'admin' && dados.usuario_id !== req.usuario.id) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    res.json(dados);
  });
});

module.exports = router;