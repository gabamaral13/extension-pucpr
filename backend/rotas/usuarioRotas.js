const express = require("express");
const router = express.Router();
const db = require("../banco");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const autenticacao = require("../middleware/autenticacao");

const JWT_SECRET = process.env.JWT_SECRET || "CHAVE_SECRETA";

// ==================================================
// LOGIN
// Rota esperada no frontend: POST /auth/login
// ==================================================
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

      return res.json({ token, usuario: payload });
    },
  );
});

// ==================================================
// LISTAR USUÁRIOS
// Rota esperada no frontend: GET /usuarios
// ==================================================
router.get("/", autenticacao, (req, res) => {
  db.all(
    `
      SELECT id, nome, email, cpf, username, papel, criado_em
      FROM usuarios
      ORDER BY id DESC
    `,
    [],
    (err, usuarios) => {
      if (err) {
        console.error("Erro ao listar usuários:", err.message);
        return res.status(500).json({ erro: "Erro ao listar usuários" });
      }

      return res.json(usuarios);
    },
  );
});

// ==================================================
// CADASTRAR USUÁRIO
// Rota esperada no frontend: POST /usuarios
// ==================================================
router.post("/", autenticacao, async (req, res) => {
  const { nome, email, cpf, username, senha, papel } = req.body;

  const usernameFinal = username || email;

  if (!usernameFinal || !senha) {
    return res.status(400).json({
      erro: "Username/e-mail e senha são obrigatórios",
    });
  }

  const papelFinal = papel || "user";

  if (!["admin", "user"].includes(papelFinal)) {
    return res.status(400).json({ erro: "Perfil inválido" });
  }

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    db.run(
      `
        INSERT INTO usuarios (nome, email, cpf, username, senha, papel)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        nome || null,
        email || null,
        cpf || null,
        usernameFinal,
        senhaCriptografada,
        papelFinal,
      ],
      function (err) {
        if (err) {
          console.error("Erro ao cadastrar usuário:", err.message);

          if (err.message.includes("UNIQUE")) {
            return res.status(400).json({
              erro: "Já existe um usuário com esse username/e-mail",
            });
          }

          return res.status(500).json({ erro: "Erro ao cadastrar usuário" });
        }

        return res.status(201).json({
          id: this.lastID,
          mensagem: "Usuário cadastrado com sucesso",
        });
      },
    );
  } catch (err) {
    console.error("Erro ao criptografar senha:", err.message);
    return res.status(500).json({ erro: "Erro ao preparar senha" });
  }
});

// ==================================================
// EDITAR USUÁRIO
// Rota esperada no frontend: PUT /usuarios/:id
// ==================================================
router.put("/:id", autenticacao, (req, res) => {
  const { id } = req.params;
  const { username, papel } = req.body;

  if (!username || !papel) {
    return res.status(400).json({
      erro: "Nome de usuário e perfil são obrigatórios",
    });
  }

  if (!["admin", "user"].includes(papel)) {
    return res.status(400).json({ erro: "Perfil inválido" });
  }

  db.run(
    `
      UPDATE usuarios
      SET username = ?, papel = ?
      WHERE id = ?
    `,
    [username, papel, id],
    function (err) {
      if (err) {
        console.error("Erro ao editar usuário:", err.message);

        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({
            erro: "Já existe um usuário com esse username",
          });
        }

        return res.status(500).json({ erro: "Erro ao editar usuário" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      return res.json({ mensagem: "Usuário editado com sucesso" });
    },
  );
});

// ==================================================
// ALTERAR PERFIL
// Rota esperada no frontend: PATCH /usuarios/:id/perfil
// ==================================================
router.patch("/:id/perfil", autenticacao, (req, res) => {
  const { id } = req.params;
  const { papel } = req.body;

  if (!["admin", "user"].includes(papel)) {
    return res.status(400).json({ erro: "Perfil inválido" });
  }

  db.run(
    `
      UPDATE usuarios
      SET papel = ?
      WHERE id = ?
    `,
    [papel, id],
    function (err) {
      if (err) {
        console.error("Erro ao alterar perfil:", err.message);
        return res.status(500).json({ erro: "Erro ao alterar perfil" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      return res.json({ mensagem: "Perfil alterado com sucesso" });
    },
  );
});

// ==================================================
// REMOVER USUÁRIO
// Rota esperada no frontend: DELETE /usuarios/:id
// ==================================================
router.delete("/:id", autenticacao, (req, res) => {
  const { id } = req.params;

  const usuarioLogadoId = req.usuario?.id;

  if (Number(usuarioLogadoId) === Number(id)) {
    return res.status(400).json({
      erro: "Você não pode remover o próprio usuário logado",
    });
  }

  db.run(
    `
      DELETE FROM usuarios
      WHERE id = ?
    `,
    [id],
    function (err) {
      if (err) {
        console.error("Erro ao remover usuário:", err.message);
        return res.status(500).json({ erro: "Erro ao remover usuário" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      return res.json({ mensagem: "Usuário removido com sucesso" });
    },
  );
});

module.exports = router;