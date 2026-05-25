const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const os = require("os");
const bcrypt = require("bcrypt");

const db = require("./banco");

const autenticacao = require("./middleware/autenticacao");
const permissao = require("./middleware/permissao");

const authRotas = require("./rotas/authRotas");
const usuarioRotas = require("./rotas/usuarioRotas");
const pacienteRotas = require("./rotas/pacienteRotas");
const avaliacaoRotas = require("./rotas/avaliacaoRotas");
const relatorioRotas = require("./rotas/relatorioRotas");
const avisoRotas = require("./rotas/avisoRotas");

// Middlewares
app.use(cors());
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));

// Frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// ===============================
// ROTAS DE USUÁRIO DIRETAS
// deixei vários caminhos aceitos para não quebrar
// ===============================

async function criarUsuario(req, res) {
  const { nome, email, cpf, username, senha, papel } = req.body;

  const nomeFinal = String(nome || "").trim() || null;
  const emailFinal = String(email || "").trim().toLowerCase() || null;
  const cpfFinal = String(cpf || "").trim() || null;
  const usernameFinal = String(username || emailFinal || nomeFinal || "").trim();
  const papelFinal = papel || "user";

  if (!usernameFinal || !senha) {
    return res.status(400).json({
      erro: "Nome/e-mail/usuário e senha são obrigatórios",
    });
  }

  if (!["admin", "user"].includes(papelFinal)) {
    return res.status(400).json({
      erro: "Papel inválido",
    });
  }

  db.get(
    `
      SELECT id
      FROM usuarios
      WHERE username = ?
      OR (email IS NOT NULL AND email <> '' AND email = ?)
      LIMIT 1
    `,
    [usernameFinal, emailFinal],
    async (err, existente) => {
      if (err) {
        console.error("Erro ao verificar usuário:", err.message);
        return res.status(500).json({
          erro: "Erro ao verificar usuário",
        });
      }

      if (existente) {
        return res.status(400).json({
          erro: "Usuário ou e-mail já cadastrado",
        });
      }

      try {
        const hash = await bcrypt.hash(senha, 10);

        db.run(
          `
            INSERT INTO usuarios (nome, email, cpf, username, senha, papel)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          [nomeFinal, emailFinal, cpfFinal, usernameFinal, hash, papelFinal],
          function (err) {
            if (err) {
              console.error("Erro ao criar usuário:", err.message);
              return res.status(400).json({
                erro: "Erro ao criar usuário. Verifique se os campos existem no banco.",
              });
            }

            return res.status(201).json({
              mensagem: "Usuário criado com sucesso",
              id: this.lastID,
            });
          }
        );
      } catch (erro) {
        console.error("Erro ao criptografar senha:", erro.message);
        return res.status(500).json({
          erro: "Erro ao criar senha do usuário",
        });
      }
    }
  );
}

function listarUsuarios(req, res) {
  db.all(
    `
      SELECT id, nome, email, cpf, username, papel, criado_em
      FROM usuarios
      ORDER BY COALESCE(nome, username) ASC
    `,
    [],
    (err, dados) => {
      if (err) {
        console.error("Erro ao listar usuários:", err.message);
        return res.status(500).json({
          erro: "Erro ao listar usuários",
        });
      }

      return res.json(dados);
    }
  );
}

// Caminhos aceitos para cadastro/listagem de usuários
app.post(
  [
    "/usuarios",
    "/api/usuarios",
    "/usuario",
    "/api/usuario",
    "/usuarios/cadastrar",
    "/api/usuarios/cadastrar",
  ],
  autenticacao,
  permissao("admin"),
  criarUsuario
);

app.get(
  ["/usuarios", "/api/usuarios", "/usuario", "/api/usuario"],
  autenticacao,
  permissao("admin"),
  listarUsuarios
);

// ===============================
// ROTAS NORMAIS
// ===============================

app.use("/auth", authRotas);
app.use("/api/auth", authRotas);

app.use("/usuarios", usuarioRotas);
app.use("/api/usuarios", usuarioRotas);

app.use("/pacientes", pacienteRotas);
app.use("/api/pacientes", pacienteRotas);

app.use("/avaliacoes", avaliacaoRotas);
app.use("/api/avaliacoes", avaliacaoRotas);

app.use("/relatorios", relatorioRotas);
app.use("/api/relatorios", relatorioRotas);

app.use("/avisos", avisoRotas);
app.use("/api/avisos", avisoRotas);

// Página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/html/index.html"));
});

// Status da API
app.get("/api/status", (req, res) => {
  res.json({
    mensagem: "API do sistema hospitalar rodando 🚀",
  });
});

// Porta
const PORTA = process.env.PORT || 3000;
const HOST = "0.0.0.0";

function mostrarIpsDaRede() {
  const interfaces = os.networkInterfaces();

  console.log("\nAcesse em outro dispositivo da mesma rede usando este link:\n");

  let encontrouIp = false;

  Object.keys(interfaces).forEach((nome) => {
    interfaces[nome].forEach((rede) => {
      const ehIPv4 = rede.family === "IPv4";
      const ehInterno = rede.internal;

      const nomeInterface = nome.toLowerCase();

      const ehIpVirtual =
        nomeInterface.includes("virtual") ||
        nomeInterface.includes("vmware") ||
        nomeInterface.includes("virtualbox") ||
        nomeInterface.includes("vbox") ||
        nomeInterface.includes("wsl") ||
        nomeInterface.includes("hyper-v") ||
        rede.address.startsWith("169.254.") ||
        rede.address.startsWith("192.168.56.");

      if (ehIPv4 && !ehInterno && !ehIpVirtual) {
        encontrouIp = true;

        console.log(`http://${rede.address}:${PORTA}`);
        console.log(`http://${rede.address}:${PORTA}/html/index.html`);
        console.log(`http://${rede.address}:${PORTA}/api/status`);
        console.log("");
      }
    });
  });

  if (!encontrouIp) {
    console.log("Nenhum IP de rede local encontrado.");
    console.log('Use o comando "ipconfig" para verificar o IPv4 manualmente.\n');
  }
}

// Rota inexistente
app.use((req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada",
    caminho: req.originalUrl,
  });
});

// Iniciar servidor
const servidor = app.listen(PORTA, HOST, () => {
  console.log(`Servidor rodando localmente em http://localhost:${PORTA}`);
  console.log(`Frontend local em http://localhost:${PORTA}/html/index.html`);
  mostrarIpsDaRede();
});

servidor.on("error", (erro) => {
  if (erro.code === "EADDRINUSE") {
    console.error(`Erro: a porta ${PORTA} já está sendo usada.`);
    console.error("Feche outro servidor Node ou use outra porta.");
  } else {
    console.error("Erro ao iniciar o servidor:", erro.message);
  }
});