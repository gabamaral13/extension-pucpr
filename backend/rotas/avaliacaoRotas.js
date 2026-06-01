const express = require("express");
const router = express.Router();
const db = require("../banco");
const autenticacao = require("../middleware/autenticacao");
const calcularScore = require("../utils/calculoScore");

const sintomasChecklist = [
  "Deficiência intelectual",
  "Face alongada/orelhas",
  "Macroorquidismo",
  "Hipermobilidade articular",
  "Dificuldades de aprendizagem",
  "Déficit de atenção",
  "Movimentos repetitivos",
  "Atraso na fala",
  "Hiperatividade",
  "Evita contato visual",
  "Evita contato físico",
  "Agressividade",
];

function respostasValidas(respostas) {
  return (
    Array.isArray(respostas) &&
    respostas.length === 12 &&
    respostas.every((resposta) => Number(resposta) === 0 || Number(resposta) === 1)
  );
}

function listarSintomasMarcados(respostas) {
  return respostas
    .map(Number)
    .map((resposta, index) => (resposta === 1 ? sintomasChecklist[index] : null))
    .filter(Boolean);
}

function usuarioEhAdmin(req) {
  return req.usuario?.papel === "admin";
}

const camposAvaliacao = `
  a.id,
  a.paciente_id,
  a.usuario_id,
  a.respostas,
  a.sintomas,
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
  p.criado_por AS paciente_criado_por,

  avaliador.username AS usuario_nome,
  avaliador.nome AS usuario_nome_completo,
  avaliador.email AS usuario_email,

  criador.username AS paciente_criado_por_usuario,
  criador.nome AS paciente_criado_por_nome,
  criador.email AS paciente_criado_por_email
`;

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

      const respostasNumericas = respostas.map(Number);
      const sintomasMarcados = listarSintomasMarcados(respostasNumericas);
      let resultado;

      try {
        resultado = calcularScore(respostasNumericas, paciente.sexo);
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
            sintomas,
            score,
            limite,
            suspeito,
            recomendacao
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          pacienteId,
          req.usuario.id,
          JSON.stringify(respostasNumericas),
          JSON.stringify(sintomasMarcados),
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
            sintomas: sintomasMarcados,
            score: resultado.score,
            limite: resultado.limite,
            suspeito: resultado.suspeito,
            sensibilidade: resultado.sensibilidade,
            auc: resultado.auc,
            recomendacao: resultado.recomendacao,
          });
        }
      );
    }
  );
});

// ==================================================
// LISTAR AVALIAÇÕES / RELATÓRIOS
// Admin vê todos.
// User comum vê somente pacientes que ele cadastrou.
// ==================================================
router.get("/", autenticacao, (req, res) => {
  const { paciente, inicio, fim } = req.query;

  let sql = `
    SELECT
      ${camposAvaliacao}
    FROM avaliacoes a
    JOIN pacientes p ON a.paciente_id = p.id
    JOIN usuarios avaliador ON a.usuario_id = avaliador.id
    LEFT JOIN usuarios criador ON p.criado_por = criador.id
    WHERE 1 = 1
  `;

  const params = [];

  if (!usuarioEhAdmin(req)) {
    sql += ` AND p.criado_por = ?`;
    params.push(req.usuario.id);
  }

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
// Admin vê qualquer paciente.
// User comum vê somente se ele cadastrou o paciente.
// ==================================================
router.get("/:pacienteId", autenticacao, (req, res) => {
  let sql = `
    SELECT
      ${camposAvaliacao}
    FROM avaliacoes a
    JOIN pacientes p ON a.paciente_id = p.id
    JOIN usuarios avaliador ON a.usuario_id = avaliador.id
    LEFT JOIN usuarios criador ON p.criado_por = criador.id
    WHERE a.paciente_id = ?
  `;

  const params = [req.params.pacienteId];

  if (!usuarioEhAdmin(req)) {
    sql += ` AND p.criado_por = ?`;
    params.push(req.usuario.id);
  }

  sql += ` ORDER BY a.criado_em DESC`;

  db.all(sql, params, (err, historico) => {
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
// Admin imprime qualquer avaliação.
// User comum imprime somente se o paciente foi cadastrado por ele.
// ==================================================
router.get("/imprimir/:id", autenticacao, (req, res) => {
  let sql = `
    SELECT
      ${camposAvaliacao}
    FROM avaliacoes a
    JOIN pacientes p ON a.paciente_id = p.id
    JOIN usuarios avaliador ON a.usuario_id = avaliador.id
    LEFT JOIN usuarios criador ON p.criado_por = criador.id
    WHERE a.id = ?
  `;

  const params = [req.params.id];

  if (!usuarioEhAdmin(req)) {
    sql += ` AND p.criado_por = ?`;
    params.push(req.usuario.id);
  }

  db.get(sql, params, (err, avaliacao) => {
    if (err) {
      console.error("Erro ao buscar avaliação:", err.message);
      return res.status(500).json({
        erro: "Erro ao buscar avaliação",
      });
    }

    if (!avaliacao) {
      return res.status(404).json({
        erro: "Avaliação não encontrada ou sem permissão de acesso",
      });
    }

    return res.json(avaliacao);
  });
});

module.exports = router;