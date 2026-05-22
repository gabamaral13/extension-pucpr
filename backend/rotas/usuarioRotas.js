const express = require("express");
const router = express.Router();
const db = require("../banco");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "CHAVE_SECRETA";

router.post("/login", (req, res) => {
  const { username, senha } = req.body;

  if (!username || !senha) {
    return res.status(400).json({ erro: "Informe usuário/e-mail e senha" });
  }

  db.get(
    `
      SELECT id, nome, email, cpf, username, senha, papel
      FROM usuarios
      WHERE username = ? OR email = ?
      LIMIT 1
    `,
    [username, username],
    async (err, usuario) => {
      if (err) {
        console.error("Erro ao buscar usuário:", err.message);
        return res.status(500).json({ erro: "Erro ao buscar usuário" });
      }

      if (!usuario) {
        return res.status(400).json({ erro: "Usuário não encontrado" });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) {
        return res.status(400).json({ erro: "Senha incorreta" });
      }

      const payload = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
        username: usuario.username,
        papel: usuario.papel,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

      res.json({ token, usuario: payload });
    },
  );
});

module.exports = router;