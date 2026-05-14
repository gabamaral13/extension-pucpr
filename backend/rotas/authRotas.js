const express = require('express');
const router = express.Router();
const db = require('../banco');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// LOGIN
router.post('/login', (req, res) => {
  const { username, senha } = req.body;

  db.get("SELECT * FROM usuarios WHERE username = ?", [username], async (err, usuario) => {

    if (!usuario) {
      return res.status(400).json({ erro: "Usuário não encontrado" });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(400).json({ erro: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: usuario.id, papel: usuario.papel },
      "CHAVE_SECRETA",
      { expiresIn: "8h" }
    );

    res.json({ token });
  });
});

module.exports = router;