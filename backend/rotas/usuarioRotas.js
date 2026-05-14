const express = require('express');
const router = express.Router();
const db = require('../banco');
const bcrypt = require('bcrypt');
const autenticacao = require('../middleware/autenticacao');
const permissao = require('../middleware/permissao');

// Criar usuário
router.post('/', autenticacao, permissao('admin'), async (req, res) => {
  const { username, senha, papel } = req.body;

  const hash = await bcrypt.hash(senha, 10);

  db.run(
    "INSERT INTO usuarios (username, senha, papel) VALUES (?, ?, ?)",
    [username, hash, papel],
    (err) => {
      if (err) return res.status(400).json({ erro: "Erro ao criar usuário" });
      res.json({ mensagem: "Usuário criado com sucesso" });
    }
  );
});

// Listar usuários (admin)
router.get('/', autenticacao, permissao('admin'), (req, res) => {
  db.all("SELECT id, username, papel FROM usuarios", [], (err, dados) => {
    res.json(dados);
  });
});

module.exports = router;