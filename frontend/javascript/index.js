// Integração Frontend <-> Backend - X-Triagem

const API_URL = window.location.protocol === "file:" ? "http://localhost:3000" : window.location.origin;

const ROTAS = {
  login: "/html/login.html",
  adminDashboard: "/html/paginas medico/dashboard_medico.html",
  userDashboard: "/html/paginas usuario/dashboard_usuario.html",
  adminPacientes: "/html/paginas medico/pacientes_medico.html",
  userPacientes: "/html/paginas usuario/pacientes_usuario.html",
};

const perguntasChecklist = [
  "Deficiência intelectual",
  "Face alongada/orelhas grandes",
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

function aplicarEstilosIntegracao() {
  if (document.getElementById("estilos-integracao-api")) return;

  const style = document.createElement("style");
  style.id = "estilos-integracao-api";
  style.textContent = `
    html, body {
      min-height: 100%;
      overflow-x: hidden;
    }

    .corpo_ {
      align-items: flex-start !important;
    }

    .paciente,
    .pacientes,
    .avaliacao,
    .relatorios,
    .usuarios,
    .historico,
    .areabase {
      box-sizing: border-box;
      overflow: visible !important;
    }

    .lista_pacientes,
    .lista_relatorios,
    .usuarios_,
    .historico_avaliacao,
    .avaliacao_paciente {
      width: 100%;
      box-sizing: border-box;
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      max-height: none !important;
      overflow: visible !important;
    }

    .user_ {
      width: 100% !important;
      min-height: 90px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      padding: 8px 12px;
      box-sizing: border-box;
    }

    .usuario_logado_nome {
      color: #fff;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 16px;
      font-weight: 700;
      max-width: 170px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0;
    }

    button.botao_user,
    .botao_api {
      min-width: 105px;
      min-height: 44px;
      background: #25dbb6;
      color: #fff;
      text-align: center;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 15px;
      font-weight: 700;
      border-radius: 18px;
      border: none;
      box-shadow: none;
      outline: none;
      cursor: pointer;
      padding: 10px 16px;
    }

    button.botao_user:hover,
    .botao_api:hover {
      background: #087b64;
    }

    .botao_api_secundario {
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.45);
    }

    .card_api {
      width: 100%;
      max-width: none;
      margin: 0;
      background: rgba(9, 6, 73, 0.58);
      border: 1px solid rgba(255, 255, 255, 0.48);
      border-radius: 16px;
      padding: 16px 20px;
      color: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.22);
      box-sizing: border-box;
    }

    .card_api .card_header {
      font-size: 18px;
      color: #ffffff;
      font-weight: 800;
      margin-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.20);
      padding-bottom: 8px;
    }

    .card_api .card_body {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 10px 22px;
      align-items: start;
    }

    .card_api .dado_item {
      font-size: 14px;
      color: #ffffff;
      line-height: 1.45;
      word-break: break-word;
    }

    .card_api .dado_item.largo {
      grid-column: 1 / -1;
    }

    .card_api strong,
    .card_api .dado_item strong {
      color: #25dbb6;
    }

    .mensagem_api,
    .erro_api {
      color: #ffffff;
      text-align: center;
      font-family: Arial, Helvetica, sans-serif;
      padding: 30px;
    }

    .erro_api {
      color: #ffb3b3;
    }

    .buscar_paciente input,
    .buscar_usuario input,
    .busca_paciente input,
    .paciente_ input,
    .data_inicio input,
    .data_fim input,
    select.select_api,
    select#pacienteAvaliacao,
    select#pacienteHistorico {
      box-sizing: border-box;
      border-radius: 18px !important;
      background: rgba(9, 6, 73, 0.72) !important;
      color: #ffffff !important;
      padding: 13px 18px !important;
      border: 1px solid rgba(255, 255, 255, 0.75) !important;
      outline: none !important;
      height: auto !important;
    }

    select.select_api,
    select#pacienteAvaliacao,
    select#pacienteHistorico {
      width: 100% !important;
      max-width: 520px !important;
      margin: 8px 0 0 0 !important;
    }

    .form_avaliacao_api {
      width: 100%;
      color: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
      box-sizing: border-box;
    }

    .grid_perguntas_api {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 14px;
      margin: 18px 0;
      width: 100%;
      box-sizing: border-box;
    }

    .pergunta_api {
      background: rgba(9, 6, 73, 0.58);
      border: 1px solid rgba(255, 255, 255, 0.45);
      border-radius: 14px;
      padding: 14px;
      min-height: 105px;
      box-sizing: border-box;
    }

    .pergunta_api p {
      margin: 0 0 12px 0;
      font-weight: 800;
      line-height: 1.35;
      color: #fff;
    }

    .opcoes_api {
      display: flex;
      gap: 18px;
      align-items: center;
      flex-wrap: wrap;
    }

    .opcoes_api label {
      cursor: pointer;
    }

    #resultadoAvaliacao {
      margin-top: 15px;
    }

    .linha_acoes_api {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
      margin-top: 12px;
    }

    @media print {
      .navegador,
      .botao_imprimir,
      .botao_api,
      .botao_user,
      .filtros,
      .buscar_paciente,
      .buscar_usuario,
      .busca_paciente,
      .top button {
        display: none !important;
      }

      body,
      .corpo,
      .corpo_,
      .relatorios,
      .historico,
      .avaliacao,
      .paciente,
      .pacientes,
      .usuarios,
      .areabase {
        background: #ffffff !important;
        color: #000000 !important;
      }

      .card_api {
        color: #000000 !important;
        background: #ffffff !important;
        border: 1px solid #000000 !important;
        box-shadow: none !important;
      }

      .card_api * {
        color: #000000 !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function token() {
  return localStorage.getItem("token");
}

function usuarioLogado() {
  try {
    return JSON.parse(localStorage.getItem("usuario"));
  } catch (e) {
    return null;
  }
}

function decodeJwtPayload(jwt) {
  try {
    const payload = jwt.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch (e) {
    return null;
  }
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token()}`,
  };
}

function escaparHTML(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function valor(obj, ...chaves) {
  for (const chave of chaves) {
    if (obj && obj[chave] !== undefined && obj[chave] !== null && obj[chave] !== "") {
      return obj[chave];
    }
  }

  return "";
}

function formatarData(valorData) {
  if (!valorData) return "Não informado";

  const somenteData = String(valorData).split("T")[0].split(" ")[0];
  const partes = somenteData.split("-");

  if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;

  return String(valorData);
}

function formatarScore(valorScore) {
  const numero = Number(valorScore);
  return Number.isFinite(numero) ? numero.toFixed(2) : "-";
}

async function apiFetch(caminho, opcoes = {}) {
  async function executar(url) {
    const resposta = await fetch(url, opcoes);
    const texto = await resposta.text();

    let dados = {};

    try {
      dados = texto ? JSON.parse(texto) : {};
    } catch (e) {
      dados = { mensagem: texto };
    }

    return { resposta, dados };
  }

  let tentativa = await executar(`${API_URL}${caminho}`);

  if (tentativa.resposta.status === 404 && !caminho.startsWith("/api/")) {
    tentativa = await executar(`${API_URL}/api${caminho}`);
  }

  const { resposta, dados } = tentativa;

  if (resposta.status === 401) {
    const pagina = window.location.pathname.split("/").pop();

    if (pagina !== "login.html" && pagina !== "index.html") {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    }
  }

  if (!resposta.ok) {
    throw new Error(dados.erro || dados.mensagem || "Erro na requisição");
  }

  return dados;
}

function sair() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = ROTAS.login;
}

function protegerPagina() {
  const caminho = decodeURI(window.location.pathname);
  const pagina = caminho.split("/").pop();
  const paginasLivres = ["index.html", "login.html", ""];

  if (paginasLivres.includes(pagina)) return;

  const usuario = usuarioLogado();

  if (!token() || !usuario) {
    window.location.href = ROTAS.login;
    return;
  }

  const ehPaginaMedico = caminho.includes("/paginas medico/");
  const ehPaginaUsuario = caminho.includes("/paginas usuario/");

  if (ehPaginaMedico && usuario.papel !== "admin") {
    window.location.href = ROTAS.userDashboard;
    return;
  }

  if (ehPaginaUsuario && usuario.papel === "admin") {
    window.location.href = ROTAS.adminDashboard;
  }
}

function atualizarBoasVindas() {
  const usuario = usuarioLogado();
  const titulo = document.querySelector(".container_ .titulo");

  if (titulo && usuario) {
    titulo.textContent = usuario.papel === "admin" ? "Bem-vindo, Admin" : "Bem-vindo, User";
  }

  const userArea = document.querySelector(".user_");

  if (userArea && usuario) {
    const nome = usuario.nome || usuario.username || "Usuário";

    userArea.innerHTML = `
      <p class="usuario_logado_nome" title="${escaparHTML(nome)}">${escaparHTML(nome)}</p>
      <button class="botao_user" type="button" onclick="sair()">Sair</button>
    `;
  }
}

function corrigirLinksUsuarioPorJS() {
  const caminho = decodeURI(window.location.pathname);

  if (!caminho.includes("/paginas usuario/")) return;

  document.querySelectorAll('a[href$="dashboard_medico.html"]').forEach((a) => (a.href = "./dashboard_usuario.html"));
  document.querySelectorAll('a[href$="pacientes_medico.html"]').forEach((a) => (a.href = "./pacientes_usuario.html"));
  document.querySelectorAll('a[href$="avaliacao_medico.html"]').forEach((a) => (a.href = "./avaliacao_usuario.html"));
  document.querySelectorAll('a[href$="relatorios_medico.html"]').forEach((a) => (a.href = "./relatorio_usuario.html"));
}

// =========================
// LOGIN
// =========================

async function fazerLogin(event) {
  event.preventDefault();

  const username = document.getElementById("email")?.value.trim();
  const senha = document.getElementById("senha")?.value;

  if (!username || !senha) {
    alert("Preencha usuário/e-mail e senha.");
    return;
  }

  try {
    const dados = await apiFetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, senha }),
    });

    const usuario = dados.usuario || decodeJwtPayload(dados.token);

    localStorage.setItem("token", dados.token);
    localStorage.setItem("usuario", JSON.stringify(usuario));

    window.location.href = usuario?.papel === "admin" ? ROTAS.adminDashboard : ROTAS.userDashboard;
  } catch (erro) {
    alert(`Erro ao fazer login: ${erro.message}`);
  }
}

// =========================
// USUÁRIOS
// =========================

async function fazerCadastro(event) {
  event.preventDefault();

  const nome = document.getElementById("nome")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const cpf = document.getElementById("cpf")?.value.trim();
  const senha = document.getElementById("senha")?.value;
  const confirmaSenha = document.getElementById("confirmsenha")?.value;

  if (!nome || !email || !senha) {
    alert("Preencha nome, e-mail e senha.");
    return;
  }

  if (senha !== confirmaSenha) {
    alert("As senhas não conferem.");
    return;
  }

  try {
    await apiFetch("/usuarios", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        nome,
        email,
        cpf,
        username: email,
        senha,
        papel: "user",
      }),
    });

    alert("Usuário cadastrado com sucesso!");
    window.location.href = "/html/paginas medico/usuarios_medico.html";
  } catch (erro) {
    alert(`Erro ao cadastrar usuário: ${erro.message}`);
  }
}

function cardUsuario(usuario) {
  const nome = valor(usuario, "nome", "username") || "Usuário sem nome";

  return `
    <div class="card_api">
      <div class="card_header">${escaparHTML(nome)}</div>
      <div class="card_body">
        <div class="dado_item"><strong>ID:</strong> ${escaparHTML(valor(usuario, "id") || "-")}</div>
        <div class="dado_item"><strong>Usuário:</strong> ${escaparHTML(valor(usuario, "username") || "-")}</div>
        <div class="dado_item"><strong>E-mail:</strong> ${escaparHTML(valor(usuario, "email") || "Não informado")}</div>
        <div class="dado_item"><strong>CPF:</strong> ${escaparHTML(valor(usuario, "cpf") || "Não informado")}</div>
        <div class="dado_item"><strong>Perfil:</strong> ${escaparHTML(valor(usuario, "papel") || "-")}</div>
      </div>
    </div>
  `;
}

async function carregarUsuarios() {
  const container = document.querySelector(".usuarios_");

  if (!container) return;

  try {
    const usuarios = await apiFetch("/usuarios", {
      headers: authHeaders(),
    });

    renderizarUsuarios(usuarios);

    const busca = document.querySelector(".buscar_usuario input");

    if (busca) {
      busca.addEventListener("input", () => {
        const termo = busca.value.trim().toLowerCase();

        const filtrados = usuarios.filter((usuario) =>
          [usuario.nome, usuario.email, usuario.username, usuario.cpf, usuario.papel]
            .filter(Boolean)
            .some((campo) => String(campo).toLowerCase().includes(termo))
        );

        renderizarUsuarios(filtrados);
      });
    }
  } catch (erro) {
    container.innerHTML = `<p class="erro_api">Erro ao carregar usuários: ${escaparHTML(erro.message)}</p>`;
  }
}

function renderizarUsuarios(usuarios) {
  const container = document.querySelector(".usuarios_");

  if (!container) return;

  container.innerHTML =
    usuarios.map(cardUsuario).join("") ||
    "<p class='mensagem_api'>Nenhum usuário cadastrado.</p>";
}

// =========================
// PACIENTES
// =========================

function normalizarSexo(valorSexo) {
  const sexo = String(valorSexo || "").trim().toUpperCase();

  if (sexo === "M" || sexo.startsWith("MASC")) return "M";
  if (sexo === "F" || sexo.startsWith("FEM")) return "F";

  return sexo;
}

async function cadastrarPaciente(event) {
  if (event) event.preventDefault();

  const nome = document.getElementById("nome")?.value.trim();
  const cpf = document.getElementById("cpf")?.value.trim() || null;
  const data_nascimento = document.getElementById("data")?.value;
  const sexo = normalizarSexo(document.getElementById("sexo")?.value);
  const endereco = document.getElementById("endereco")?.value.trim() || null;
  const cep = document.getElementById("cep")?.value.trim() || null;
  const estado = document.getElementById("estado")?.value.trim() || null;
  const cidade = document.getElementById("cidade")?.value.trim() || null;
  const responsavel = document.getElementById("responsavel")?.value.trim() || null;

  if (!nome || !data_nascimento || !sexo) {
    alert("Preencha nome, data de nascimento e sexo.");
    return;
  }

  if (!["M", "F"].includes(sexo)) {
    alert("Sexo deve ser Masculino ou Feminino.");
    return;
  }

  try {
    await apiFetch("/pacientes", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        nome,
        cpf,
        data_nascimento,
        sexo,
        endereco,
        cep,
        estado,
        cidade,
        responsavel,
      }),
    });

    alert("Paciente cadastrado com sucesso!");

    const usuario = usuarioLogado();

    window.location.href = usuario?.papel === "admin" ? ROTAS.adminPacientes : ROTAS.userPacientes;
  } catch (erro) {
    alert(`Erro ao cadastrar paciente: ${erro.message}`);
  }
}

function cardPaciente(paciente) {
  const nome = valor(paciente, "nome", "paciente_nome") || "Paciente sem nome";
  const id = valor(paciente, "id", "id_paciente", "paciente_id");

  return `
    <div class="card_api">
      <div class="card_header">${escaparHTML(nome)}</div>
      <div class="card_body">
        <div class="dado_item"><strong>ID:</strong> ${escaparHTML(id || "-")}</div>
        <div class="dado_item"><strong>CPF:</strong> ${escaparHTML(valor(paciente, "cpf", "paciente_cpf") || "Não informado")}</div>
        <div class="dado_item"><strong>Sexo:</strong> ${escaparHTML(valor(paciente, "sexo") || "Não informado")}</div>
        <div class="dado_item"><strong>Nascimento:</strong> ${escaparHTML(formatarData(valor(paciente, "data_nascimento")))}</div>
        <div class="dado_item"><strong>CEP:</strong> ${escaparHTML(valor(paciente, "cep") || "Não informado")}</div>
        <div class="dado_item"><strong>Estado:</strong> ${escaparHTML(valor(paciente, "estado") || "Não informado")}</div>
        <div class="dado_item"><strong>Cidade:</strong> ${escaparHTML(valor(paciente, "cidade") || "Não informado")}</div>
        <div class="dado_item largo"><strong>Endereço:</strong> ${escaparHTML(valor(paciente, "endereco") || "Não informado")}</div>
        <div class="dado_item largo"><strong>Pais/Responsável:</strong> ${escaparHTML(valor(paciente, "responsavel") || "Não informado")}</div>
      </div>
    </div>
  `;
}

async function carregarPacientes() {
  const lista = document.querySelector(".lista_pacientes");
  const contador = document.querySelector(".pacientes_registrados");

  if (!lista && !contador) return [];

  try {
    const pacientes = await apiFetch("/pacientes", {
      headers: authHeaders(),
    });

    if (lista) renderizarPacientes(pacientes);

    if (contador) {
      contador.innerHTML = `
        <h2 style="color:#fff;font-family:Arial,sans-serif;font-size:48px;font-weight:700;margin:15px 0 0 40px;text-shadow:0 2px 4px rgba(0,0,0,.3);">
          ${pacientes.length}
        </h2>
      `;
    }

    const busca = document.querySelector(".buscar_paciente input");

    if (busca && lista) {
      busca.addEventListener("input", () => {
        const termo = busca.value.trim().toLowerCase();

        const filtrados = pacientes.filter((paciente) =>
          [paciente.id, paciente.nome, paciente.cpf, paciente.cidade, paciente.estado, paciente.responsavel]
            .filter(Boolean)
            .some((campo) => String(campo).toLowerCase().includes(termo))
        );

        renderizarPacientes(filtrados);
      });
    }

    return pacientes;
  } catch (erro) {
    if (lista) {
      lista.innerHTML = `<p class="erro_api">Erro ao carregar pacientes: ${escaparHTML(erro.message)}</p>`;
    }

    return [];
  }
}

function renderizarPacientes(pacientes) {
  const lista = document.querySelector(".lista_pacientes");

  if (!lista) return;

  lista.innerHTML =
    pacientes.map(cardPaciente).join("") ||
    "<p class='mensagem_api'>Nenhum paciente cadastrado.</p>";
}

function opcoesPacientes(pacientes) {
  return pacientes
    .map((paciente) => {
      const nome = valor(paciente, "nome") || "Paciente sem nome";
      return `<option value="${paciente.id}">${escaparHTML(nome)} - ID ${paciente.id}</option>`;
    })
    .join("");
}

// =========================
// AVALIAÇÃO
// =========================

async function prepararAvaliacao() {
  const areaAvaliacao = document.querySelector(".avaliacao_paciente");
  const areaPaciente = document.querySelector(".escolha_paciente .paciente");

  if (!areaAvaliacao || !areaPaciente) return;

  try {
    const pacientes = await apiFetch("/pacientes", {
      headers: authHeaders(),
    });

    if (!pacientes.length) {
      areaAvaliacao.innerHTML = "<p class='mensagem_api'>Cadastre um paciente antes de criar uma avaliação.</p>";
      return;
    }

    areaPaciente.innerHTML = `
      <p>Paciente</p>
      <select id="pacienteAvaliacao" class="select_api">
        ${opcoesPacientes(pacientes)}
      </select>
    `;

    areaAvaliacao.innerHTML = `
      <form id="formAvaliacao" class="form_avaliacao_api">
        <div class="grid_perguntas_api">
          ${perguntasChecklist
            .map(
              (pergunta, index) => `
                <div class="pergunta_api">
                  <p>${index + 1}. ${escaparHTML(pergunta)}</p>
                  <div class="opcoes_api">
                    <label>
                      <input type="radio" name="resposta_${index}" value="1" required>
                      Sim
                    </label>
                    <label>
                      <input type="radio" name="resposta_${index}" value="0" required>
                      Não
                    </label>
                  </div>
                </div>
              `
            )
            .join("")}
        </div>

        <div class="linha_acoes_api">
          <button class="botao_api" type="submit">Salvar avaliação</button>
        </div>
      </form>

      <div id="resultadoAvaliacao"></div>
    `;

    document.getElementById("formAvaliacao").addEventListener("submit", salvarAvaliacao);
  } catch (erro) {
    areaAvaliacao.innerHTML = `<p class="erro_api">Erro ao preparar avaliação: ${escaparHTML(erro.message)}</p>`;
  }
}

async function salvarAvaliacao(event) {
  event.preventDefault();

  const paciente_id = Number(document.getElementById("pacienteAvaliacao")?.value);
  const respostas = [];

  for (let i = 0; i < perguntasChecklist.length; i++) {
    const marcada = document.querySelector(`input[name="resposta_${i}"]:checked`);

    if (!marcada) {
      alert("Responda todas as 12 perguntas antes de salvar.");
      return;
    }

    respostas.push(Number(marcada.value));
  }

  try {
    const dados = await apiFetch("/avaliacoes", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        paciente_id,
        respostas,
      }),
    });

    document.getElementById("resultadoAvaliacao").innerHTML = `
      <div class="card_api">
        <div class="card_header">Resultado da avaliação</div>
        <div class="card_body">
          <div class="dado_item"><strong>Paciente:</strong> ${escaparHTML(dados.paciente_nome || paciente_id)}</div>
          <div class="dado_item"><strong>Score:</strong> ${formatarScore(dados.score)}</div>
          <div class="dado_item"><strong>Limite:</strong> ${formatarScore(dados.limite)}</div>
          <div class="dado_item"><strong>Suspeita:</strong> ${dados.suspeito ? "Sim" : "Não"}</div>
          <div class="dado_item largo"><strong>Recomendação:</strong> ${escaparHTML(dados.recomendacao)}</div>
        </div>
      </div>
    `;

    alert("Avaliação salva com sucesso!");
    document.getElementById("formAvaliacao").reset();
  } catch (erro) {
    alert(`Erro ao salvar avaliação: ${erro.message}`);
  }
}

// =========================
// HISTÓRICO E RELATÓRIOS
// =========================

function quantidadeSintomasMarcados(avaliacao) {
  try {
    const respostas = JSON.parse(avaliacao.respostas || "[]");
    return respostas.filter((resposta) => Number(resposta) === 1).length;
  } catch (e) {
    return "-";
  }
}

function cardAvaliacao(avaliacao) {
  const nome = valor(avaliacao, "paciente_nome", "nome") || "Paciente sem nome";
  const pacienteId = valor(avaliacao, "paciente_id", "id_paciente") || "-";
  const avaliador = valor(avaliacao, "usuario_nome_completo", "usuario_nome", "username") || "-";

  return `
    <div class="card_api">
      <div class="card_header">${escaparHTML(nome)}</div>
      <div class="card_body">
        <div class="dado_item"><strong>ID avaliação:</strong> ${escaparHTML(valor(avaliacao, "id") || "-")}</div>
        <div class="dado_item"><strong>Paciente ID:</strong> ${escaparHTML(pacienteId)}</div>
        <div class="dado_item"><strong>CPF:</strong> ${escaparHTML(valor(avaliacao, "paciente_cpf", "cpf") || "Não informado")}</div>
        <div class="dado_item"><strong>Sexo:</strong> ${escaparHTML(valor(avaliacao, "sexo") || "-")}</div>
        <div class="dado_item"><strong>Data:</strong> ${escaparHTML(formatarData(valor(avaliacao, "criado_em", "data")))}</div>
        <div class="dado_item"><strong>Avaliador:</strong> ${escaparHTML(avaliador)}</div>
        <div class="dado_item"><strong>Score:</strong> ${formatarScore(valor(avaliacao, "score"))}</div>
        <div class="dado_item"><strong>Sintomas marcados:</strong> ${quantidadeSintomasMarcados(avaliacao)}</div>
        <div class="dado_item largo"><strong>Recomendação:</strong> ${escaparHTML(valor(avaliacao, "recomendacao") || "Não informado")}</div>
      </div>
    </div>
  `;
}

function cardPacienteSemRelatorio(paciente) {
  return `
    <div class="card_api">
      <div class="card_header">${escaparHTML(paciente.nome || "Paciente sem nome")}</div>
      <div class="card_body">
        <div class="dado_item"><strong>ID:</strong> ${escaparHTML(paciente.id || "-")}</div>
        <div class="dado_item"><strong>CPF:</strong> ${escaparHTML(paciente.cpf || "Não informado")}</div>
        <div class="dado_item"><strong>Sexo:</strong> ${escaparHTML(paciente.sexo || "Não informado")}</div>
        <div class="dado_item"><strong>Nascimento:</strong> ${escaparHTML(formatarData(paciente.data_nascimento))}</div>
        <div class="dado_item"><strong>Cidade:</strong> ${escaparHTML(paciente.cidade || "Não informado")}</div>
        <div class="dado_item"><strong>Estado:</strong> ${escaparHTML(paciente.estado || "Não informado")}</div>
        <div class="dado_item largo">
          <strong>Status:</strong> Paciente encontrado, mas ainda não possui avaliação salva.
        </div>
        <div class="dado_item largo">
          <strong>Relatório:</strong> Para aparecer como relatório completo, primeiro faça uma avaliação desse paciente.
        </div>
      </div>
    </div>
  `;
}

async function prepararHistorico() {
  const area = document.querySelector(".historico_avaliacao");
  const seletorArea = document.querySelector(".selecionar_paciente .paciente");

  if (!area || !seletorArea) return;

  try {
    const pacientes = await apiFetch("/pacientes", {
      headers: authHeaders(),
    });

    seletorArea.innerHTML = `
      <p>Paciente</p>
      <select id="pacienteHistorico" class="select_api">
        <option value="">Selecione</option>
        ${opcoesPacientes(pacientes)}
      </select>
    `;

    document.getElementById("pacienteHistorico").addEventListener("change", carregarHistoricoPaciente);
  } catch (erro) {
    area.innerHTML = `<p class="erro_api">Erro ao carregar pacientes: ${escaparHTML(erro.message)}</p>`;
  }
}

async function carregarHistoricoPaciente() {
  const pacienteId = document.getElementById("pacienteHistorico")?.value;
  const area = document.querySelector(".historico_avaliacao");

  if (!pacienteId || !area) {
    if (area) area.innerHTML = "";
    return;
  }

  try {
    const avaliacoes = await apiFetch(`/avaliacoes/${pacienteId}`, {
      headers: authHeaders(),
    });

    area.innerHTML =
      avaliacoes.map(cardAvaliacao).join("") ||
      "<p class='mensagem_api'>Esse paciente ainda não possui avaliações.</p>";
  } catch (erro) {
    area.innerHTML = `<p class="erro_api">Erro ao carregar histórico: ${escaparHTML(erro.message)}</p>`;
  }
}

async function carregarRelatorios() {
  const lista = document.querySelector(".lista_relatorios");

  if (!lista) return;

  try {
    const params = new URLSearchParams();

    const inicio = document.querySelector(".data_inicio input")?.value;
    const fim = document.querySelector(".data_fim input")?.value;

    const pacienteFiltro =
      document.querySelector(".paciente_ input")?.value.trim() ||
      document.querySelector(".busca_paciente input")?.value.trim();

    if (inicio) params.set("inicio", inicio);
    if (fim) params.set("fim", fim);
    if (pacienteFiltro) params.set("paciente", pacienteFiltro);

    const avaliacoes = await apiFetch(`/avaliacoes?${params.toString()}`, {
      headers: authHeaders(),
    });

    if (avaliacoes.length > 0) {
      lista.innerHTML = avaliacoes.map(cardAvaliacao).join("");
      return;
    }

    if (pacienteFiltro) {
      const pacientes = await apiFetch(`/pacientes?busca=${encodeURIComponent(pacienteFiltro)}`, {
        headers: authHeaders(),
      });

      if (pacientes.length > 0) {
        lista.innerHTML = pacientes.map(cardPacienteSemRelatorio).join("");
        return;
      }
    }

    lista.innerHTML = "<p class='mensagem_api'>Nenhum relatório encontrado.</p>";
  } catch (erro) {
    lista.innerHTML = `<p class="erro_api">Erro ao carregar relatórios: ${escaparHTML(erro.message)}</p>`;
  }
}

async function carregarResumoAdmin() {
  const pagina = window.location.pathname.split("/").pop();

  if (pagina !== "dashboard_medico.html" && pagina !== "relatorios_medico.html") return;

  try {
    const resumo = await apiFetch("/relatorios?dias=30", {
      headers: authHeaders(),
    });

    const cardPacientes = document.querySelector(".dashboard .pacientes p, .graficos .pacientes p");
    const cardAvaliacoes = document.querySelector(".dashboard .avaliacoes p, .graficos .avaliacoes p");
    const cardEncaminhamentos = document.querySelector(".dashboard .encaminhamentos p, .graficos .encaminhamentos p");
    const cardRelatorio = document.querySelector(".dashboard .relatorio p, .graficos .relatorio p");

    if (cardPacientes) {
      cardPacientes.innerHTML = `<strong>${resumo.totalPacientes}</strong> registrados no sistema`;
    }

    if (cardAvaliacoes) {
      cardAvaliacoes.innerHTML = `<strong>${resumo.totalAvaliacoes}</strong> realizadas nos últimos 30 dias`;
    }

    if (cardEncaminhamentos) {
      cardEncaminhamentos.innerHTML = `<strong>${resumo.totalEncaminhamentos}</strong> para teste genético`;
    }

    if (cardRelatorio) {
      cardRelatorio.innerHTML = `<strong>${resumo.avaliacoesPorUsuario?.length || 0}</strong> usuários cadastrados`;
    }
  } catch (erro) {
    console.error("Erro ao carregar dashboard admin:", erro);
  }
}

// =========================
// INICIALIZAÇÃO
// =========================

document.addEventListener("DOMContentLoaded", () => {
  aplicarEstilosIntegracao();
  corrigirLinksUsuarioPorJS();
  protegerPagina();
  atualizarBoasVindas();

  const pagina = window.location.pathname.split("/").pop() || "index.html";

  const botaoLoginHome = document.getElementById("login");

  if (botaoLoginHome) {
    botaoLoginHome.addEventListener("click", () => {
      window.location.href = ROTAS.login;
    });
  }

  const botaoCadastrarPaciente = document.querySelector(".botao_cadastrar");

  if (pagina === "cadastropaciente_usuario.html" && botaoCadastrarPaciente) {
    botaoCadastrarPaciente.addEventListener("click", cadastrarPaciente);
  }

  const botaoCadastroUsuario = document.querySelector(".botao_user_");

  if (pagina === "usuarios_medico.html" && botaoCadastroUsuario) {
    botaoCadastroUsuario.addEventListener("click", () => {
      window.location.href = "/html/paginas medico/cadastrousuario.html";
    });
  }

  document.querySelectorAll(".botao_imprimir").forEach((botao) => {
    botao.addEventListener("click", () => window.print());
  });

  document.querySelectorAll(".filtros button, .botao_aplicar").forEach((botao) => {
    botao.addEventListener("click", carregarRelatorios);
  });

  document.querySelectorAll(".busca_paciente input, .paciente_ input").forEach((input) => {
    input.addEventListener("input", () => {
      clearTimeout(input._timerBuscaRelatorio);
      input._timerBuscaRelatorio = setTimeout(carregarRelatorios, 350);
    });
  });

  document.querySelectorAll(".botao_avaliacao").forEach((botao) => {
    botao.addEventListener("click", () => {
      document.getElementById("formAvaliacao")?.scrollIntoView({
        behavior: "smooth",
      });
    });
  });

  if (pagina === "dashboard_medico.html") carregarResumoAdmin();
  if (pagina === "usuarios_medico.html") carregarUsuarios();

  if (
    pagina === "pacientes_medico.html" ||
    pagina === "pacientes_usuario.html" ||
    pagina === "dashboard_usuario.html"
  ) {
    carregarPacientes();
  }

  if (pagina === "avaliacao_medico.html" || pagina === "avaliacao_usuario.html") {
    prepararAvaliacao();
  }

  if (pagina === "historico_medico.html") prepararHistorico();

  if (pagina === "relatorios_medico.html" || pagina === "relatorio_usuario.html") {
    carregarRelatorios();
  }
});