const express = require('express');
const router = express.Router();
const db = require('../banco');
const autenticacao = require('../middleware/autenticacao');
const permissao = require('../middleware/permissao');
const calcularScore = require('../utils/calculoScore');

// Criar avaliação (checklist)
router.post('/', autenticacao, (req, res) => {
  const { paciente_id, respostas } = req.body;

  // Buscar sexo do paciente automaticamente
  db.get("SELECT sexo FROM pacientes WHERE id = ?", [paciente_id], (err, paciente) => {

    if (!paciente) {
      return res.status(404).json({ erro: "Paciente não encontrado" });
    }

    const { score, recomendacao } = calcularScore(respostas, paciente.sexo);

    db.run(
      `INSERT INTO avaliacoes (paciente_id, usuario_id, respostas, score, recomendacao)
       VALUES (?, ?, ?, ?, ?)`,
      [
        paciente_id,
        req.usuario.id,
        JSON.stringify(respostas),
        score,
        recomendacao
      ],
      (err) => {
        if (err) return res.status(400).json({ erro: "Erro ao salvar avaliação" });

        res.json({ score, recomendacao });
      }
    );
  });
});


// Histórico por paciente
router.get('/:pacienteId', autenticacao, (req, res) => {

  let query = "SELECT * FROM avaliacoes WHERE paciente_id = ?";
  let params = [req.params.pacienteId];

  // atendente vê só o que ele fez
  if (req.usuario.papel !== 'admin') {
    query += " AND usuario_id = ?";
    params.push(req.usuario.id);
  }

  db.all(query, params, (err, dados) => {
    res.json(dados);
  });
});


// Relatórios com filtro
router.get('/', autenticacao, (req, res) => {
  const { paciente, inicio, fim } = req.query;

  let query = "SELECT * FROM avaliacoes WHERE 1=1";
  let params = [];

  if (req.usuario.papel !== 'admin') {
    query += " AND usuario_id = ?";
    params.push(req.usuario.id);
  }

  if (paciente) {
    query += " AND paciente_id = ?";
    params.push(paciente);
  }

  if (inicio && fim) {
    query += " AND criado_em BETWEEN ? AND ?";
    params.push(inicio, fim);
  }

  db.all(query, params, (err, dados) => {
    res.json(dados);
  });
});


// Dados para impressão
router.get('/imprimir/:id', autenticacao, (req, res) => {

  db.get(`
    SELECT a.*, p.nome, p.data_nascimento, p.sexo
    FROM avaliacoes a
    JOIN pacientes p ON a.paciente_id = p.id
    WHERE a.id = ?
  `, [req.params.id], (err, dados) => {

    if (!dados) {
      return res.status(404).json({ erro: "Avaliação não encontrada" });
    }

    res.json(dados);
  });
});

module.exports = router;