const express = require('express');
const router = express.Router();
const db = require('../banco');
const autenticacao = require('../middleware/autenticacao');
const permissao = require('../middleware/permissao');

// Criar paciente
router.post('/', autenticacao, (req, res) => {
  const { nome, data_nascimento, sexo, responsavel } = req.body;

  db.run(
    "INSERT INTO pacientes (nome, data_nascimento, sexo, responsavel) VALUES (?, ?, ?, ?)",
    [nome, data_nascimento, sexo, responsavel],
    (err) => {
      if (err) return res.status(400).json({ erro: "Erro ao criar paciente" });
      res.json({ mensagem: "Paciente criado com sucesso" });
    }
  );
});

// Listar pacientes
router.get('/', autenticacao, (req, res) => {
  db.all("SELECT * FROM pacientes", [], (err, dados) => {
    res.json(dados);
  });
});

// Buscar paciente por ID
router.get('/:id', autenticacao, (req, res) => {
  db.get("SELECT * FROM pacientes WHERE id = ?", [req.params.id], (err, dado) => {
    if (!dado) return res.status(404).json({ erro: "Paciente não encontrado" });
    res.json(dado);
  });
});

module.exports = router;