const express = require('express');
const router = express.Router();
const db = require('../banco');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// LOGIN
router.post('/login', (req, res) => {
  const { username, senha } = req.body;

  if (!username || !senha) {
    return res.status(400).json({ erro: 'Informe usuário/e-mail e senha' });
  }

  db.get('SELECT * FROM usuarios WHERE username = ?', [username], async (err, usuario) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar usuário' });
    }

    if (!usuario) {
      return res.status(400).json({ erro: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(400).json({ erro: 'Senha incorreta' });
    }

    const payload = {
      id: usuario.id,
      username: usuario.username,
      papel: usuario.papel
    };

    const token = jwt.sign(payload, 'CHAVE_SECRETA', { expiresIn: '8h' });

    res.json({
      token,
      usuario: payload
    });
  });
});

module.exports = router;