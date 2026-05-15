const express = require('express');
const router = express.Router();
const db = require('../banco');
const bcrypt = require('bcrypt');
const autenticacao = require('../middleware/autenticacao');
const permissao = require('../middleware/permissao');

// Criar usuário
router.post('/', autenticacao, permissao('admin'), async (req, res) => {
  const { username, senha, papel } = req.body;

  if (!username || !senha) {
    return res.status(400).json({ erro: 'Usuário/e-mail e senha são obrigatórios' });
  }

  const papelUsuario = papel || 'user';

  if (!['admin', 'user'].includes(papelUsuario)) {
    return res.status(400).json({ erro: 'Papel inválido' });
  }

  const hash = await bcrypt.hash(senha, 10);

  db.run(
    'INSERT INTO usuarios (username, senha, papel) VALUES (?, ?, ?)',
    [username, hash, papelUsuario],
    function (err) {
      if (err) return res.status(400).json({ erro: 'Erro ao criar usuário. Verifique se ele já existe.' });
      res.json({ mensagem: 'Usuário criado com sucesso', id: this.lastID });
    }
  );
});

// Listar usuários
router.get('/', autenticacao, permissao('admin'), (req, res) => {
  db.all('SELECT id, username, papel FROM usuarios ORDER BY username ASC', [], (err, dados) => {
    if (err) return res.status(500).json({ erro: 'Erro ao listar usuários' });
    res.json(dados);
  });
});

module.exports = router;