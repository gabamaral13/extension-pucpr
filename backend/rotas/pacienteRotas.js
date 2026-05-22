const express = require("express");
const router = express.Router();
const db = require("../banco");
const autenticacao = require("../middleware/autenticacao");

function normalizarSexo(valor) {
  const sexo = String(valor || "").trim().toUpperCase();

  if (sexo === "M" || sexo.startsWith("MASC")) return "M";
  if (sexo === "F" || sexo.startsWith("FEM")) return "F";

  return sexo;
}

// ==================================================
// CADASTRAR PACIENTE
// Admin e User podem cadastrar paciente
// ==================================================
router.post("/", autenticacao, (req, res) => {
  const {
    nome,
    cpf,
    data_nascimento,
    sexo,
    endereco,
    cep,
    estado,
    cidade,
    responsavel,
  } = req.body;

  const sexoNormalizado = normalizarSexo(sexo);

  if (!nome || !data_nascimento || !sexoNormalizado) {
    return res.status(400).json({
      erro: "Nome, data de nascimento e sexo são obrigatórios",
    });
  }

  if (!["M", "F"].includes(sexoNormalizado)) {
    return res.status(400).json({
      erro: "Sexo deve ser M ou F",
    });
  }

  db.run(
    `
      INSERT INTO pacientes (
        nome,
        cpf,
        data_nascimento,
        sexo,
        endereco,
        cep,
        estado,
        cidade,
        responsavel
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      nome,
      cpf || null,
      data_nascimento,
      sexoNormalizado,
      endereco || null,
      cep || null,
      estado || null,
      cidade || null,
      responsavel || null,
    ],
    function (err) {
      if (err) {
        console.error("Erro ao cadastrar paciente:", err.message);
        return res.status(500).json({
          erro: "Erro ao cadastrar paciente",
        });
      }

      return res.status(201).json({
        mensagem: "Paciente cadastrado com sucesso",
        id: this.lastID,
      });
    }
  );
});

// ==================================================
// LISTAR PACIENTES
// Admin e User podem visualizar pacientes
// Agora busca também por ID.
// ==================================================
router.get("/", autenticacao, (req, res) => {
  const buscaOriginal = req.query.busca ? String(req.query.busca).trim() : "";
  const busca = buscaOriginal ? `%${buscaOriginal}%` : null;

  let sql = `
    SELECT
      id,
      nome,
      cpf,
      data_nascimento,
      sexo,
      endereco,
      cep,
      estado,
      cidade,
      responsavel,
      criado_em
    FROM pacientes
  `;

  const params = [];

  if (busca) {
    sql += `
      WHERE CAST(id AS TEXT) LIKE ?
      OR nome LIKE ?
      OR cpf LIKE ?
      OR cidade LIKE ?
      OR estado LIKE ?
      OR responsavel LIKE ?
    `;

    params.push(busca, busca, busca, busca, busca, busca);
  }

  sql += ` ORDER BY nome ASC`;

  db.all(sql, params, (err, pacientes) => {
    if (err) {
      console.error("Erro ao listar pacientes:", err.message);
      return res.status(500).json({
        erro: "Erro ao listar pacientes",
      });
    }

    return res.json(pacientes);
  });
});

// ==================================================
// BUSCAR PACIENTE POR ID
// Admin e User podem visualizar paciente
// ==================================================
router.get("/:id", autenticacao, (req, res) => {
  db.get(
    `
      SELECT
        id,
        nome,
        cpf,
        data_nascimento,
        sexo,
        endereco,
        cep,
        estado,
        cidade,
        responsavel,
        criado_em
      FROM pacientes
      WHERE id = ?
    `,
    [req.params.id],
    (err, paciente) => {
      if (err) {
        console.error("Erro ao buscar paciente:", err.message);
        return res.status(500).json({
          erro: "Erro ao buscar paciente",
        });
      }

      if (!paciente) {
        return res.status(404).json({
          erro: "Paciente não encontrado",
        });
      }

      return res.json(paciente);
    }
  );
});

module.exports = router;