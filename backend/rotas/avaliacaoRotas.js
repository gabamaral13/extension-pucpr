const express = require("express");
const router = express.Router();
const db = require("../banco");
const autenticacao = require("../middleware/autenticacao");
const calcularScore = require("../utils/calculoScore");

function respostasValidas(respostas) {
  return (
    Array.isArray(respostas) &&
    respostas.length === 12 &&
    respostas.every((resposta) => Number(resposta) === 0 || Number(resposta) === 1)
  );
}

// ==================================================
// CRIAR AVALIAÇÃO
// Admin e User podem criar avaliação
// ==================================================
router.post("/", autenticacao, (req, res) => {
  const pacienteId = Number(req.body.paciente_id);
  const respostas = req.body.respostas;

  if (!pacienteId) {
    return res.status(400).json({
      erro: "Paciente é obrigatório",
    });
  }

  if (!respostasValidas(respostas)) {
    return res.status(400).json({
      erro: "É necessário enviar exatamente 12 respostas com 0 ou 1",
    });
  }

  db.get(
    `
      SELECT id, nome, sexo
      FROM pacientes
      WHERE id = ?
    `,
    [pacienteId],
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

      let resultado;

      try {
        resultado = calcularScore(respostas.map(Number), paciente.sexo);
      } catch (erro) {
        return res.status(400).json({
          erro: erro.message,
        });
      }

      db.run(
        `
          INSERT INTO avaliacoes (
            paciente_id,
            usuario_id,
            respostas,
            score,
            limite,
            suspeito,
            recomendacao
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          pacienteId,
          req.usuario.id,
          JSON.stringify(respostas.map(Number)),
          resultado.score,
          resultado.limite,
          resultado.suspeito ? 1 : 0,
          resultado.recomendacao,
        ],
        function (err) {
          if (err) {
            console.error("Erro ao salvar avaliação:", err.message);
            return res.status(500).json({
              erro: "Erro ao salvar avaliação",
            });
          }

          return res.status(201).json({
            id: this.lastID,
            paciente_id: paciente.id,
            paciente_nome: paciente.nome,
            score: resultado.score,
            limite: resultado.limite,
            suspeito: resultado.suspeito,
            recomendacao: resultado.recomendacao,
          });
        }
      );
    }
  );
});

// ==================================================
// LISTAR AVALIAÇÕES / RELATÓRIOS
// Admin e User podem visualizar relatórios
// ==================================================
router.get("/", autenticacao, (req, res) => {
  const { paciente, inicio, fim } = req.query;

  let sql = `
    SELECT
      a.id,
      a.paciente_id,
      a.usuario_id,
      a.respostas,
      a.score,
      a.limite,
      a.suspeito,
      a.recomendacao,
      a.criado_em,

      p.nome AS paciente_nome,
      p.cpf AS paciente_cpf,
      p.data_nascimento,
      p.sexo,
      p.endereco,
      p.cep,
      p.cidade,
      p.estado,
      p.responsavel,

      u.username AS usuario_nome,
      u.nome AS usuario_nome_completo
    FROM avaliacoes a
    JOIN pacientes p ON a.paciente_id = p.id
    JOIN usuarios u ON a.usuario_id = u.id
    WHERE 1 = 1
  `;

  const params = [];

  if (paciente) {
    if (/^\d+$/.test(String(paciente))) {
      sql += ` AND a.paciente_id = ?`;
      params.push(Number(paciente));
    } else {
      sql += `
        AND (
          p.nome LIKE ?
          OR p.cpf LIKE ?
          OR p.cidade LIKE ?
          OR p.estado LIKE ?
        )
      `;
      params.push(`%${paciente}%`, `%${paciente}%`, `%${paciente}%`, `%${paciente}%`);
    }
  }

  if (inicio) {
    sql += ` AND DATE(a.criado_em) >= DATE(?)`;
    params.push(inicio);
  }

  if (fim) {
    sql += ` AND DATE(a.criado_em) <= DATE(?)`;
    params.push(fim);
  }

  sql += ` ORDER BY a.criado_em DESC`;

  db.all(sql, params, (err, avaliacoes) => {
    if (err) {
      console.error("Erro ao listar avaliações:", err.message);
      return res.status(500).json({
        erro: "Erro ao listar avaliações",
      });
    }

    return res.json(avaliacoes);
  });
});

// ==================================================
// HISTÓRICO DE UM PACIENTE
// Admin e User podem ver histórico
// ==================================================
router.get("/:pacienteId", autenticacao, (req, res) => {
  let sql = `
    SELECT
      a.id,
      a.paciente_id,
      a.usuario_id,
      a.respostas,
      a.score,
      a.limite,
      a.suspeito,
      a.recomendacao,
      a.criado_em,

      p.nome AS paciente_nome,
      p.cpf AS paciente_cpf,
      p.data_nascimento,
      p.sexo,

      u.username AS usuario_nome,
      u.nome AS usuario_nome_completo
    FROM avaliacoes a
    JOIN pacientes p ON a.paciente_id = p.id
    JOIN usuarios u ON a.usuario_id = u.id
    WHERE a.paciente_id = ?
    ORDER BY a.criado_em DESC
  `;

  db.all(sql, [req.params.pacienteId], (err, historico) => {
    if (err) {
      console.error("Erro ao buscar histórico:", err.message);
      return res.status(500).json({
        erro: "Erro ao buscar histórico",
      });
    }

    return res.json(historico);
  });
});

// ==================================================
// BUSCAR UMA AVALIAÇÃO PARA IMPRESSÃO
// ==================================================
router.get("/imprimir/:id", autenticacao, (req, res) => {
  db.get(
    `
      SELECT
        a.id,
        a.paciente_id,
        a.usuario_id,
        a.respostas,
        a.score,
        a.limite,
        a.suspeito,
        a.recomendacao,
        a.criado_em,

        p.nome AS paciente_nome,
        p.cpf AS paciente_cpf,
        p.data_nascimento,
        p.sexo,
        p.endereco,
        p.cep,
        p.cidade,
        p.estado,
        p.responsavel,

        u.username AS usuario_nome,
        u.nome AS usuario_nome_completo
      FROM avaliacoes a
      JOIN pacientes p ON a.paciente_id = p.id
      JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.id = ?
    `,
    [req.params.id],
    (err, avaliacao) => {
      if (err) {
        console.error("Erro ao buscar avaliação:", err.message);
        return res.status(500).json({
          erro: "Erro ao buscar avaliação",
        });
      }

      if (!avaliacao) {
        return res.status(404).json({
          erro: "Avaliação não encontrada",
        });
      }

      return res.json(avaliacao);
    }
  );
});

module.exports = router;