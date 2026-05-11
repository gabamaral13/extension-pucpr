const express = require('express');
const router = express.Router();
const db = require('../banco');
const autenticacao = require('../middleware/autenticacao');
const permissao = require('../middleware/permissao');

// Relatório administrativo por período
// Exemplo: GET /relatorios?dias=30
router.get('/', autenticacao, permissao('admin'), (req, res) => {
  const dias = req.query.dias || 30;
  const dataFiltro = `-${dias} days`;

  const relatorio = {};

  db.get(
    `
    SELECT COUNT(DISTINCT paciente_id) AS totalPacientes
    FROM avaliacoes
    WHERE criado_em >= DATE('now', ?)
    `,
    [dataFiltro],
    (err, pacientes) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao buscar pacientes" });
      }

      relatorio.totalPacientes = pacientes.totalPacientes || 0;

      db.get(
        `
        SELECT COUNT(*) AS totalAvaliacoes
        FROM avaliacoes
        WHERE criado_em >= DATE('now', ?)
        `,
        [dataFiltro],
        (err, avaliacoes) => {
          if (err) {
            return res.status(500).json({ erro: "Erro ao buscar avaliações" });
          }

          relatorio.totalAvaliacoes = avaliacoes.totalAvaliacoes || 0;

          db.get(
            `
            SELECT COUNT(*) AS totalEncaminhamentos
            FROM avaliacoes
            WHERE criado_em >= DATE('now', ?)
            AND recomendacao = 'Encaminhar para teste genético'
            `,
            [dataFiltro],
            (err, encaminhamentos) => {
              if (err) {
                return res.status(500).json({ erro: "Erro ao buscar encaminhamentos" });
              }

              relatorio.totalEncaminhamentos = encaminhamentos.totalEncaminhamentos || 0;

              db.all(
                `
                SELECT 
                  u.username AS usuario, 
                  COUNT(a.id) AS totalAvaliacoes
                FROM avaliacoes a
                JOIN usuarios u ON a.usuario_id = u.id
                WHERE a.criado_em >= DATE('now', ?)
                GROUP BY u.id, u.username
                ORDER BY totalAvaliacoes DESC
                `,
                [dataFiltro],
                (err, usuarios) => {
                  if (err) {
                    return res.status(500).json({ erro: "Erro ao buscar usuários" });
                  }

                  relatorio.periodo = `Últimos ${dias} dias`;
                  relatorio.avaliacoesPorUsuario = usuarios;

                  res.json(relatorio);
                }
              );
            }
          );
        }
      );
    }
  );
});

// Relatório de desempenho dos funcionários
// Exemplo: GET /relatorios/funcionarios?dias=30
router.get('/funcionarios', autenticacao, permissao('admin'), (req, res) => {
  const dias = req.query.dias || 30;
  const dataFiltro = `-${dias} days`;

  db.all(
    `
    SELECT 
      u.id,
      u.username AS funcionario,
      u.papel,
      COUNT(a.id) AS totalAvaliacoes,
      COUNT(DISTINCT a.paciente_id) AS totalPacientesAtendidos,
      SUM(CASE 
        WHEN a.recomendacao = 'Encaminhar para teste genético'
        THEN 1 ELSE 0 
      END) AS totalEncaminhamentos
    FROM usuarios u
    LEFT JOIN avaliacoes a 
      ON u.id = a.usuario_id
      AND a.criado_em >= DATE('now', ?)
    GROUP BY u.id, u.username, u.papel
    ORDER BY totalAvaliacoes DESC
    `,
    [dataFiltro],
    (err, funcionarios) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao gerar relatório de funcionários" });
      }

      db.get(
        `
        SELECT 
          COUNT(DISTINCT usuario_id) AS funcionariosQueAtenderam,
          COUNT(DISTINCT paciente_id) AS pacientesAtendidos,
          COUNT(*) AS avaliacoesRealizadas
        FROM avaliacoes
        WHERE criado_em >= DATE('now', ?)
        `,
        [dataFiltro],
        (err, resumo) => {
          if (err) {
            return res.status(500).json({ erro: "Erro ao gerar resumo do relatório" });
          }

          res.json({
            periodo: `Últimos ${dias} dias`,
            resumo: {
              funcionariosQueAtenderam: resumo.funcionariosQueAtenderam || 0,
              pacientesAtendidos: resumo.pacientesAtendidos || 0,
              avaliacoesRealizadas: resumo.avaliacoesRealizadas || 0
            },
            funcionarios
          });
        }
      );
    }
  );
});

module.exports = router;