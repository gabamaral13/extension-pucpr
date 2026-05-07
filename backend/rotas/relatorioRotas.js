const express = require('express');
const router = express.Router();
const db = require('../banco');
const autenticacao = require('../middleware/autenticacao');
const permissao = require('../middleware/permissao');

// Relatório administrativo por período
// Exemplo: /relatorios?dias=30
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
      if (err) return res.status(500).json({ erro: "Erro ao buscar pacientes" });

      relatorio.totalPacientes = pacientes.totalPacientes || 0;

      db.get(
        `
        SELECT COUNT(*) AS totalAvaliacoes
        FROM avaliacoes
        WHERE criado_em >= DATE('now', ?)
        `,
        [dataFiltro],
        (err, avaliacoes) => {
          if (err) return res.status(500).json({ erro: "Erro ao buscar avaliações" });

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
              if (err) return res.status(500).json({ erro: "Erro ao buscar encaminhamentos" });

              relatorio.totalEncaminhamentos = encaminhamentos.totalEncaminhamentos || 0;

              db.all(
                `
                SELECT u.username AS usuario, COUNT(a.id) AS totalAvaliacoes
                FROM avaliacoes a
                JOIN usuarios u ON a.usuario_id = u.id
                WHERE a.criado_em >= DATE('now', ?)
                GROUP BY u.id
                ORDER BY totalAvaliacoes DESC
                `,
                [dataFiltro],
                (err, usuarios) => {
                  if (err) return res.status(500).json({ erro: "Erro ao buscar usuários" });

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

module.exports = router;