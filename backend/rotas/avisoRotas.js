const express = require("express");
const router = express.Router();

const db = require("../banco");
const autenticacao = require("../middleware/autenticacao");
const permissao = require("../middleware/permissao");

// ==================================================
// LISTAR AVISOS
// Admin e User podem visualizar
// ==================================================
router.get("/", autenticacao, (req, res) => {
  db.all(
    `
      SELECT
        avisos.id,
        avisos.titulo,
        avisos.mensagem,
        avisos.criado_por,
        avisos.ativo,
        avisos.criado_em,
        usuarios.nome AS autor_nome,
        usuarios.username AS autor_username
      FROM avisos
      LEFT JOIN usuarios ON usuarios.id = avisos.criado_por
      WHERE avisos.ativo = 1
      ORDER BY avisos.criado_em DESC
    `,
    [],
    (err, avisos) => {
      if (err) {
        console.error("Erro ao listar avisos:", err.message);
        return res.status(500).json({
          erro: "Erro ao listar avisos",
        });
      }

      return res.json(avisos);
    }
  );
});

// ==================================================
// CRIAR AVISO
// Somente admin pode publicar
// ==================================================
router.post("/", autenticacao, permissao("admin"), (req, res) => {
  const { titulo, mensagem } = req.body;

  const tituloFinal = String(titulo || "").trim();
  const mensagemFinal = String(mensagem || "").trim();

  if (!tituloFinal || !mensagemFinal) {
    return res.status(400).json({
      erro: "Título e mensagem são obrigatórios",
    });
  }

  const usuarioId =
    req.usuario?.id ||
    req.user?.id ||
    req.usuarioId ||
    req.userId ||
    null;

  db.run(
    `
      INSERT INTO avisos (
        titulo,
        mensagem,
        criado_por,
        ativo
      )
      VALUES (?, ?, ?, 1)
    `,
    [tituloFinal, mensagemFinal, usuarioId],
    function (err) {
      if (err) {
        console.error("Erro ao criar aviso:", err.message);
        return res.status(500).json({
          erro: "Erro ao criar aviso",
        });
      }

      return res.status(201).json({
        mensagem: "Aviso publicado com sucesso",
        id: this.lastID,
      });
    }
  );
});

// ==================================================
// EXCLUIR AVISO
// Somente admin pode excluir
// Aqui não apaga do banco, só desativa
// ==================================================
router.delete("/:id", autenticacao, permissao("admin"), (req, res) => {
  db.run(
    `
      UPDATE avisos
      SET ativo = 0
      WHERE id = ?
    `,
    [req.params.id],
    function (err) {
      if (err) {
        console.error("Erro ao excluir aviso:", err.message);
        return res.status(500).json({
          erro: "Erro ao excluir aviso",
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          erro: "Aviso não encontrado",
        });
      }

      return res.json({
        mensagem: "Aviso excluído com sucesso",
      });
    }
  );
});

module.exports = router;