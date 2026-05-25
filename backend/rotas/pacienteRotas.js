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

function normalizarFoto(foto) {
  if (foto === null || foto === undefined || foto === "") {
    return {
      valido: true,
      valor: null,
    };
  }

  const fotoTexto = String(foto).trim();

  if (!fotoTexto) {
    return {
      valido: true,
      valor: null,
    };
  }

  const formatoValido = /^data:image\/(png|jpg|jpeg|webp);base64,/i.test(fotoTexto);

  if (!formatoValido) {
    return {
      valido: false,
      erro: "A foto deve ser uma imagem válida nos formatos PNG, JPG, JPEG ou WEBP",
    };
  }

  if (fotoTexto.length > 5 * 1024 * 1024) {
    return {
      valido: false,
      erro: "A foto é muito grande. Use uma imagem menor.",
    };
  }

  return {
    valido: true,
    valor: fotoTexto,
  };
}

const camposPaciente = `
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
  foto,
  criado_em
`;

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
    foto,
  } = req.body;

  const sexoNormalizado = normalizarSexo(sexo);
  const fotoNormalizada = normalizarFoto(foto);

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

  if (!fotoNormalizada.valido) {
    return res.status(400).json({
      erro: fotoNormalizada.erro,
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
        responsavel,
        foto
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      String(nome).trim(),
      cpf || null,
      data_nascimento,
      sexoNormalizado,
      endereco || null,
      cep || null,
      estado || null,
      cidade || null,
      responsavel || null,
      fotoNormalizada.valor,
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
// ==================================================
router.get("/", autenticacao, (req, res) => {
  const buscaOriginal = req.query.busca ? String(req.query.busca).trim() : "";
  const busca = buscaOriginal ? `%${buscaOriginal}%` : null;

  let sql = `
    SELECT
      ${camposPaciente}
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
      OR endereco LIKE ?
    `;

    params.push(busca, busca, busca, busca, busca, busca, busca);
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
        ${camposPaciente}
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

// ==================================================
// EDITAR PACIENTE
// Admin e User podem editar paciente
// Se a foto não for enviada no body, ela é mantida.
// Se a foto for enviada como string vazia/null, ela é removida.
// ==================================================
router.put("/:id", autenticacao, (req, res) => {
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
  const fotoFoiEnviada = Object.prototype.hasOwnProperty.call(req.body, "foto");
  const fotoNormalizada = fotoFoiEnviada ? normalizarFoto(req.body.foto) : null;

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

  if (fotoFoiEnviada && !fotoNormalizada.valido) {
    return res.status(400).json({
      erro: fotoNormalizada.erro,
    });
  }

  const camposUpdate = [
    "nome = ?",
    "cpf = ?",
    "data_nascimento = ?",
    "sexo = ?",
    "endereco = ?",
    "cep = ?",
    "estado = ?",
    "cidade = ?",
    "responsavel = ?",
  ];

  const params = [
    String(nome).trim(),
    cpf || null,
    data_nascimento,
    sexoNormalizado,
    endereco || null,
    cep || null,
    estado || null,
    cidade || null,
    responsavel || null,
  ];

  if (fotoFoiEnviada) {
    camposUpdate.push("foto = ?");
    params.push(fotoNormalizada.valor);
  }

  params.push(req.params.id);

  db.run(
    `
      UPDATE pacientes
      SET ${camposUpdate.join(",\n          ")}
      WHERE id = ?
    `,
    params,
    function (err) {
      if (err) {
        console.error("Erro ao editar paciente:", err.message);
        return res.status(500).json({
          erro: "Erro ao editar paciente",
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          erro: "Paciente não encontrado",
        });
      }

      return res.json({
        mensagem: "Paciente editado com sucesso",
      });
    }
  );
});

// ==================================================
// EXCLUIR PACIENTE
// Admin e User podem excluir paciente
// ==================================================
router.delete("/:id", autenticacao, (req, res) => {
  db.run(
    `
      DELETE FROM pacientes
      WHERE id = ?
    `,
    [req.params.id],
    function (err) {
      if (err) {
        console.error("Erro ao excluir paciente:", err.message);
        return res.status(500).json({
          erro: "Erro ao excluir paciente",
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          erro: "Paciente não encontrado",
        });
      }

      return res.json({
        mensagem: "Paciente excluído com sucesso",
      });
    }
  );
});

module.exports = router;