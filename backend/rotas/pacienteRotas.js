const express = require('express');
const router = express.Router();
const db = require('../banco');
const autenticacao = require('../middleware/autenticacao');

// Criar paciente
router.post('/', autenticacao, (req, res) => {
  const {
    nome,
    data_nascimento,
    sexo,
    cep,
    estado,
    cidade,
    responsavel
  } = req.body;

  if (!nome || !data_nascimento || !sexo) {
    return res.status(400).json({
      erro: 'Nome, data de nascimento e sexo são obrigatórios'
    });
  }

  if (!['M', 'F'].includes(sexo)) {
    return res.status(400).json({
      erro: 'Sexo deve ser M ou F'
    });
  }

  db.run(
    `
      INSERT INTO pacientes (
        nome,
        data_nascimento,
        sexo,
        cep,
        estado,
        cidade,
        responsavel
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      nome,
      data_nascimento,
      sexo,
      cep || null,
      estado || null,
      cidade || null,
      responsavel || null
    ],
    function (err) {
      if (err) {
        console.error('Erro ao criar paciente:', err.message);

        return res.status(400).json({
          erro: 'Erro ao criar paciente'
        });
      }

      res.status(201).json({
        mensagem: 'Paciente criado com sucesso',
        id: this.lastID
      });
    }
  );
});

// Listar pacientes
router.get('/', autenticacao, (req, res) => {
  db.all(
    `
      SELECT
        id,
        nome,
        data_nascimento,
        sexo,
        cep,
        estado,
        cidade,
        responsavel,
        criado_em
      FROM pacientes
      ORDER BY nome ASC
    `,
    [],
    (err, dados) => {
      if (err) {
        console.error('Erro ao listar pacientes:', err.message);

        return res.status(500).json({
          erro: 'Erro ao listar pacientes'
        });
      }

      res.json(dados);
    }
  );
});

// Buscar paciente por ID
router.get('/:id', autenticacao, (req, res) => {
  db.get(
    `
      SELECT
        id,
        nome,
        data_nascimento,
        sexo,
        cep,
        estado,
        cidade,
        responsavel,
        criado_em
      FROM pacientes
      WHERE id = ?
    `,
    [req.params.id],
    (err, dado) => {
      if (err) {
        console.error('Erro ao buscar paciente:', err.message);

        return res.status(500).json({
          erro: 'Erro ao buscar paciente'
        });
      }

      if (!dado) {
        return res.status(404).json({
          erro: 'Paciente não encontrado'
        });
      }

      res.json(dado);
    }
  );
});

module.exports = router;