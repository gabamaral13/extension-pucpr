// ==========================================================
// X-Triagem - Integração Frontend <-> Backend
// Arquivo: frontend/javascript/index.js
// ==========================================================

const API_URL = window.location.origin;

// =========================
// FUNÇÕES BASE
// =========================

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

function formatarData(data) {
  if (!data) return "Não informado";

  const somenteData = String(data).split(" ")[0];

  if (/^\d{4}-\d{2}-\d{2}$/.test(somenteData)) {
    const [ano, mes, dia] = somenteData.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  return escaparHTML(data);
}

function formatarScore(score) {
  const numero = Number(score);
  if (Number.isNaN(numero)) return "-";
  return numero.toFixed(2);
}

function fotoPacienteValida(foto) {
  const valor = String(foto || "").trim();

  if (!valor) return "";

  const inicioValido = /^data:image\/(png|jpg|jpeg|webp);base64,/i.test(valor);
  return inicioValido ? valor : "";
}

function iniciaisNome(nome) {
  const partes = String(nome || "Paciente")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!partes.length) return "PX";

  const primeira = partes[0]?.[0] || "P";
  const segunda = partes.length > 1 ? partes[partes.length - 1]?.[0] : "X";

  return `${primeira}${segunda}`.toUpperCase();
}

function avatarPacienteHTML(paciente, classeExtra = "") {
  const foto = fotoPacienteValida(paciente?.foto);
  const nome = escaparHTML(paciente?.nome || "Paciente");
  const classe = `avatar_paciente ${classeExtra}`.trim();

  if (foto) {
    return `
      <div class="${classe}">
        <img src="${foto}" alt="Foto de ${nome}" />
      </div>
    `;
  }

  return `
    <div class="${classe} avatar_paciente_sem_foto" aria-label="Paciente sem foto">
      ${escaparHTML(iniciaisNome(paciente?.nome))}
    </div>
  `;
}

async function apiFetch(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, opcoes);
  const texto = await resposta.text();

  let dados = {};

  try {
    dados = texto ? JSON.parse(texto) : {};
  } catch (e) {
    dados = { mensagem: texto };
  }

  if (!resposta.ok) {
    throw new Error(dados.erro || dados.mensagem || "Erro na requisição");
  }

  return dados;
}

function caminhoLogin() {
  return "/html/login.html";
}

function sair() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = caminhoLogin();
}

function protegerPagina() {
  const pagina = window.location.pathname.split("/").pop();
  const paginasLivres = ["index.html", "login.html", ""];

  if (!paginasLivres.includes(pagina) && !token()) {
    window.location.href = caminhoLogin();
  }
}

function atualizarBoasVindas() {
  const usuario = usuarioLogado();
  const titulo = document.querySelector(".container_ .titulo");

  if (titulo && usuario) {
    const papel = usuario.papel === "admin" ? "Admin" : "Usuário";
    titulo.textContent = `Bem-vindo, ${papel}`;
  }

  const userArea = document.querySelector(".user_");

  if (userArea && usuario) {
    userArea.innerHTML = `
      <p>${escaparHTML(usuario.username || "Usuário")}</p>
      <button class="botao_user" type="button" onclick="sair()">Sair</button>
    `;
  }
}

function paginaAtual() {
  return window.location.pathname.split("/").pop() || "index.html";
}

function usuarioEhAdmin() {
  return usuarioLogado()?.papel === "admin";
}

// =========================
// MÁSCARAS
// =========================

function aplicarMascaraCPF(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function aplicarMascaraCEP(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function ativarMascaras() {
  const cpf = document.getElementById("cpf");
  const cep = document.getElementById("cep");

  if (cpf) {
    cpf.addEventListener("input", () => {
      cpf.value = aplicarMascaraCPF(cpf.value);
    });
  }

  if (cep) {
    cep.addEventListener("input", () => {
      cep.value = aplicarMascaraCEP(cep.value);
    });
  }
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, senha }),
    });

    const usuario = dados.usuario || decodeJwtPayload(dados.token);

    localStorage.setItem("token", dados.token);
    localStorage.setItem("usuario", JSON.stringify(usuario));

    if (usuario?.papel === "admin") {
      window.location.href = "/html/paginas medico/dashboard_medico.html";
    } else {
      window.location.href = "/html/paginas usuario/dashboard_usuario.html";
    }
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
  const senha = document.getElementById("senha")?.value;
  const confirmaSenha = document.getElementById("confirmsenha")?.value;

  const username = email || nome;

  if (!username || !senha) {
    alert("Preencha e-mail/usuário e senha.");
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
        username,
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
  return `
    <div class="card_api">
      <div class="card_header">${escaparHTML(usuario.username)}</div>

      <div class="card_body">
        <div class="dado_item">
          <strong>ID:</strong> ${escaparHTML(usuario.id)}
        </div>

        <div class="dado_item">
          <strong>Perfil:</strong> ${escaparHTML(usuario.papel)}
        </div>
      </div>

      <div class="acoes_card">
        <button
          class="botao_card"
          type="button"
          onclick="editarUsuario(${usuario.id}, '${escaparHTML(usuario.username)}', '${escaparHTML(usuario.papel)}')"
        >
          Editar
        </button>

        <button
          class="botao_card"
          type="button"
          onclick="alterarPerfilUsuario(${usuario.id}, '${escaparHTML(usuario.papel)}')"
        >
          Alterar perfil
        </button>

        <button
          class="botao_card botao_perigo"
          type="button"
          onclick="removerUsuario(${usuario.id}, '${escaparHTML(usuario.username)}')"
        >
          Remover
        </button>
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

    container.innerHTML =
      usuarios.map(cardUsuario).join("") ||
      "<p>Nenhum usuário cadastrado.</p>";
  } catch (erro) {
    container.innerHTML = `<p>Erro ao carregar usuários: ${escaparHTML(
      erro.message,
    )}</p>`;
  }
}

async function editarUsuario(id, usernameAtual, papelAtual) {
  const novoUsername = prompt("Novo nome/e-mail do usuário:", usernameAtual);

  if (!novoUsername || !novoUsername.trim()) {
    alert("Nome de usuário inválido.");
    return;
  }

  const novoPerfil = prompt(
    "Perfil do usuário: admin ou user",
    papelAtual
  );

  if (!["admin", "user"].includes(novoPerfil)) {
    alert("Perfil inválido. Use admin ou user.");
    return;
  }

  try {
    await apiFetch(`/usuarios/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({
        username: novoUsername.trim(),
        papel: novoPerfil,
      }),
    });

    alert("Usuário editado com sucesso!");
    carregarUsuarios();
  } catch (erro) {
    alert(`Erro ao editar usuário: ${erro.message}`);
  }
}

async function alterarPerfilUsuario(id, perfilAtual) {
  const novoPerfil = perfilAtual === "admin" ? "user" : "admin";

  const confirmar = confirm(
    `Deseja alterar o perfil deste usuário de "${perfilAtual}" para "${novoPerfil}"?`
  );

  if (!confirmar) return;

  try {
    await apiFetch(`/usuarios/${id}/perfil`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({
        papel: novoPerfil,
      }),
    });

    alert("Perfil alterado com sucesso!");
    carregarUsuarios();
  } catch (erro) {
    alert(`Erro ao alterar perfil: ${erro.message}`);
  }
}

async function removerUsuario(id, username) {
  const usuarioAtual = usuarioLogado();

  if (usuarioAtual && Number(usuarioAtual.id) === Number(id)) {
    alert("Você não pode remover o próprio usuário logado.");
    return;
  }

  const confirmar = confirm(
    `Tem certeza que deseja remover o usuário "${username}"?`
  );

  if (!confirmar) return;

  try {
    await apiFetch(`/usuarios/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    alert("Usuário removido com sucesso!");
    carregarUsuarios();
  } catch (erro) {
    alert(`Erro ao remover usuário: ${erro.message}`);
  }
}


// =========================
// PACIENTES
// =========================

function normalizarSexo(valor) {
  const sexo = String(valor || "").trim().toUpperCase();

  if (sexo === "M" || sexo.startsWith("MASC")) return "M";
  if (sexo === "F" || sexo.startsWith("FEM")) return "F";

  return sexo;
}

function valorOuNaoInformado(valor) {
  return valor && String(valor).trim() ? String(valor).trim() : "Não informado";
}

function redimensionarImagemPaciente(arquivo) {
  return new Promise((resolve, reject) => {
    if (!arquivo) {
      resolve(null);
      return;
    }

    if (!arquivo.type.startsWith("image/")) {
      reject(new Error("Selecione apenas arquivos de imagem."));
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      reject(new Error("A imagem deve ter no máximo 5 MB."));
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
      const imagem = new Image();

      imagem.onload = () => {
        const tamanhoMaximo = 900;
        const escala = Math.min(
          1,
          tamanhoMaximo / imagem.width,
          tamanhoMaximo / imagem.height
        );

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(imagem.width * escala));
        canvas.height = Math.max(1, Math.round(imagem.height * escala));

        const contexto = canvas.getContext("2d");
        contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };

      imagem.onerror = () => reject(new Error("Não foi possível carregar a imagem."));
      imagem.src = leitor.result;
    };

    leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    leitor.readAsDataURL(arquivo);
  });
}

function configurarUploadFotoPaciente() {
  const inputFoto = document.getElementById("fotoPaciente");
  const previewFoto = document.getElementById("previewFotoPaciente");
  const botaoRemover = document.getElementById("removerFotoPaciente");

  if (!inputFoto || !previewFoto) return;

  window.__fotoPacienteBase64 = null;

  inputFoto.addEventListener("change", async () => {
    const arquivo = inputFoto.files?.[0];

    if (!arquivo) return;

    try {
      const fotoBase64 = await redimensionarImagemPaciente(arquivo);
      window.__fotoPacienteBase64 = fotoBase64;

      previewFoto.classList.add("com_foto");
      previewFoto.innerHTML = `
        <img src="${fotoBase64}" alt="Prévia da foto do paciente" />
      `;
    } catch (erro) {
      alert(erro.message);
      inputFoto.value = "";
      window.__fotoPacienteBase64 = null;
    }
  });

  if (botaoRemover) {
    botaoRemover.addEventListener("click", () => {
      inputFoto.value = "";
      window.__fotoPacienteBase64 = null;
      previewFoto.classList.remove("com_foto");
      previewFoto.innerHTML = `
        <span>+</span>
        <p>Adicionar foto do paciente</p>
        <small>PNG, JPG ou WEBP</small>
      `;
    });
  }
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
  const responsavel =
    document.getElementById("responsavel")?.value.trim() || null;
  const foto = window.__fotoPacienteBase64 || null;

  if (!nome || !data_nascimento || !sexo) {
    alert("Preencha nome, data de nascimento e sexo.");
    return;
  }

  if (!["M", "F"].includes(sexo)) {
    alert("Sexo deve ser M ou F.");
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
        foto,
      }),
    });

    alert("Paciente cadastrado com sucesso!");
    window.location.href = "/html/paginas usuario/pacientes_usuario.html";
  } catch (erro) {
    alert(`Erro ao cadastrar paciente: ${erro.message}`);
  }
}

function botoesPaciente(paciente) {
  const id = Number(paciente.id);

  const botaoAvaliar = `
    <button class="botao_card" type="button" onclick="irParaAvaliacao(${id})">
      Avaliar
    </button>
  `;

  const botaoRelatorio = `
    <button class="botao_card" type="button" onclick="irParaRelatorioPaciente(${id})">
      Relatório
    </button>
  `;

  const botaoHistorico = usuarioEhAdmin()
    ? `
      <button class="botao_card" type="button" onclick="irParaHistoricoPaciente(${id})">
        Histórico
      </button>
    `
    : "";

  const botaoDados = `
    <button class="botao_card" type="button" onclick="verDadosPaciente(${id})">
      Perfil
    </button>
  `;

  const botaoEditar = `
    <button class="botao_card" type="button" onclick="editarPaciente(${id})">
      Editar
    </button>
  `;

  const botaoExcluir = `
    <button class="botao_card botao_perigo" type="button" onclick="excluirPaciente(${id})">
      Excluir
    </button>
  `;

  return `
    <div class="acoes_card">
      ${botaoAvaliar}
      ${botaoRelatorio}
      ${botaoHistorico}
      ${botaoDados}
      ${botaoEditar}
      ${botaoExcluir}
    </div>
  `;
}

function cardPaciente(paciente) {
  return `
    <div class="card_api card_paciente">
      <div class="paciente_card_topo">
        ${avatarPacienteHTML(paciente, "avatar_paciente_card")}

        <div class="paciente_card_info">
          <div class="card_header">
            ${escaparHTML(paciente.nome)}
          </div>

          <div class="paciente_tags">
            <span>ID ${escaparHTML(paciente.id)}</span>
            <span>${escaparHTML(paciente.sexo === "M" ? "Masculino" : "Feminino")}</span>
            <span>${formatarData(paciente.data_nascimento)}</span>
          </div>
        </div>
      </div>

      <div class="card_body paciente_card_body">
        <div class="dado_item">
          <strong>CPF:</strong> ${escaparHTML(
            paciente.cpf || "Não informado"
          )}
        </div>

        <div class="dado_item">
          <strong>Cidade:</strong> ${escaparHTML(
            paciente.cidade || "Não informado"
          )}
        </div>

        <div class="dado_item">
          <strong>Estado:</strong> ${escaparHTML(
            paciente.estado || "Não informado"
          )}
        </div>

        <div class="dado_item">
          <strong>Responsável:</strong> ${escaparHTML(
            paciente.responsavel || "Não informado"
          )}
        </div>
      </div>

      ${botoesPaciente(paciente)}
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

    if (lista) {
      lista.innerHTML =
        pacientes.map(cardPaciente).join("") ||
        "<p>Nenhum paciente cadastrado.</p>";

      ativarBuscaLocal(".buscar_paciente input", ".lista_pacientes .card_api");
    }

    if (contador) {
      contador.innerHTML = `
        <h2>${pacientes.length}</h2>
      `;
    }

    return pacientes;
  } catch (erro) {
    if (lista) {
      lista.innerHTML = `<p>Erro ao carregar pacientes: ${escaparHTML(
        erro.message
      )}</p>`;
    }

    return [];
  }
}

async function verDadosPaciente(pacienteId) {
  try {
    const paciente = await apiFetch(`/pacientes/${pacienteId}`, {
      headers: authHeaders(),
    });

    abrirPerfilPaciente(paciente);
  } catch (erro) {
    alert(`Erro ao buscar dados do paciente: ${erro.message}`);
  }
}

function fecharPerfilPaciente() {
  const modal = document.querySelector(".modal_paciente_fundo");

  if (modal) {
    modal.remove();
  }

  document.body.classList.remove("modal_aberto");
}

function abrirPerfilPaciente(paciente) {
  fecharPerfilPaciente();

  const modal = document.createElement("div");
  modal.className = "modal_paciente_fundo";

  const id = Number(paciente.id);
  const sexoFormatado = paciente.sexo === "M" ? "Masculino" : "Feminino";
  const botaoHistorico = usuarioEhAdmin()
    ? `
      <button class="botao_card" type="button" onclick="fecharPerfilPaciente(); irParaHistoricoPaciente(${id})">
        Histórico
      </button>
    `
    : "";

  modal.innerHTML = `
    <div class="modal_paciente_card" role="dialog" aria-modal="true" aria-label="Perfil do paciente">
      <button class="modal_fechar" type="button" onclick="fecharPerfilPaciente()">×</button>

      <div class="perfil_paciente_topo">
        ${avatarPacienteHTML(paciente, "avatar_paciente_modal")}

        <div>
          <p class="perfil_etiqueta">Perfil do paciente</p>
          <h2>${escaparHTML(paciente.nome)}</h2>
          <div class="paciente_tags">
            <span>ID ${escaparHTML(paciente.id)}</span>
            <span>${escaparHTML(sexoFormatado)}</span>
            <span>${formatarData(paciente.data_nascimento)}</span>
          </div>
        </div>
      </div>

      <div class="perfil_grid">
        <div>
          <small>CPF</small>
          <strong>${escaparHTML(valorOuNaoInformado(paciente.cpf))}</strong>
        </div>

        <div>
          <small>Data de nascimento</small>
          <strong>${formatarData(paciente.data_nascimento)}</strong>
        </div>

        <div>
          <small>Sexo</small>
          <strong>${escaparHTML(sexoFormatado)}</strong>
        </div>

        <div>
          <small>Responsável</small>
          <strong>${escaparHTML(valorOuNaoInformado(paciente.responsavel))}</strong>
        </div>
      </div>

      <div class="perfil_secao">
        <h3>Endereço</h3>

        <div class="perfil_grid">
          <div>
            <small>Endereço</small>
            <strong>${escaparHTML(valorOuNaoInformado(paciente.endereco))}</strong>
          </div>

          <div>
            <small>CEP</small>
            <strong>${escaparHTML(valorOuNaoInformado(paciente.cep))}</strong>
          </div>

          <div>
            <small>Cidade</small>
            <strong>${escaparHTML(valorOuNaoInformado(paciente.cidade))}</strong>
          </div>

          <div>
            <small>Estado</small>
            <strong>${escaparHTML(valorOuNaoInformado(paciente.estado))}</strong>
          </div>
        </div>
      </div>

      <div class="perfil_acoes">
        <button class="botao_card" type="button" onclick="fecharPerfilPaciente(); irParaAvaliacao(${id})">
          Iniciar avaliação
        </button>

        <button class="botao_card" type="button" onclick="fecharPerfilPaciente(); irParaRelatorioPaciente(${id})">
          Ver relatório
        </button>

        ${botaoHistorico}

        <button class="botao_card" type="button" onclick="fecharPerfilPaciente(); editarPaciente(${id})">
          Editar dados
        </button>
      </div>
    </div>
  `;

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) {
      fecharPerfilPaciente();
    }
  });

  document.body.appendChild(modal);
  document.body.classList.add("modal_aberto");
}

function pedirCampoPaciente(label, valorAtual, obrigatorio = false) {
  const resposta = prompt(label, valorAtual || "");

  if (resposta === null) {
    return {
      cancelado: true,
      valor: null,
    };
  }

  const valor = resposta.trim();

  if (obrigatorio && !valor) {
    alert("Este campo é obrigatório.");
    return {
      cancelado: true,
      valor: null,
    };
  }

  return {
    cancelado: false,
    valor: valor || null,
  };
}

async function editarPaciente(pacienteId) {
  try {
    const paciente = await apiFetch(`/pacientes/${pacienteId}`, {
      headers: authHeaders(),
    });

    const campoNome = pedirCampoPaciente(
      "Nome completo:",
      paciente.nome,
      true
    );
    if (campoNome.cancelado) return;

    const campoCpf = pedirCampoPaciente("CPF:", paciente.cpf || "");
    if (campoCpf.cancelado) return;

    const campoData = pedirCampoPaciente(
      "Data de nascimento no formato AAAA-MM-DD:",
      paciente.data_nascimento,
      true
    );
    if (campoData.cancelado) return;

    const campoSexo = pedirCampoPaciente(
      "Sexo: M ou F",
      paciente.sexo,
      true
    );
    if (campoSexo.cancelado) return;

    const sexoNormalizado = normalizarSexo(campoSexo.valor);

    if (!["M", "F"].includes(sexoNormalizado)) {
      alert("Sexo inválido. Use M ou F.");
      return;
    }

    const campoEndereco = pedirCampoPaciente(
      "Endereço:",
      paciente.endereco || ""
    );
    if (campoEndereco.cancelado) return;

    const campoCep = pedirCampoPaciente("CEP:", paciente.cep || "");
    if (campoCep.cancelado) return;

    const campoEstado = pedirCampoPaciente("Estado:", paciente.estado || "");
    if (campoEstado.cancelado) return;

    const campoCidade = pedirCampoPaciente("Cidade:", paciente.cidade || "");
    if (campoCidade.cancelado) return;

    const campoResponsavel = pedirCampoPaciente(
      "Pais ou responsável:",
      paciente.responsavel || ""
    );
    if (campoResponsavel.cancelado) return;

    await apiFetch(`/pacientes/${pacienteId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({
        nome: campoNome.valor,
        cpf: campoCpf.valor,
        data_nascimento: campoData.valor,
        sexo: sexoNormalizado,
        endereco: campoEndereco.valor,
        cep: campoCep.valor,
        estado: campoEstado.valor,
        cidade: campoCidade.valor,
        responsavel: campoResponsavel.valor,
      }),
    });

    alert("Paciente editado com sucesso!");
    carregarPacientes();
  } catch (erro) {
    alert(`Erro ao editar paciente: ${erro.message}`);
  }
}

async function excluirPaciente(pacienteId) {
  try {
    const paciente = await apiFetch(`/pacientes/${pacienteId}`, {
      headers: authHeaders(),
    });

    const confirmar = confirm(
      `Tem certeza que deseja excluir o paciente "${paciente.nome}"?\n\n` +
        `Atenção: se esse paciente tiver avaliações ou histórico, essas informações também serão removidas.`
    );

    if (!confirmar) return;

    await apiFetch(`/pacientes/${pacienteId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    alert("Paciente excluído com sucesso!");
    carregarPacientes();
  } catch (erro) {
    alert(`Erro ao excluir paciente: ${erro.message}`);
  }
}

function irParaAvaliacao(pacienteId) {
  localStorage.setItem("pacienteSelecionado", String(pacienteId));

  if (usuarioEhAdmin()) {
    window.location.href = "/html/paginas medico/avaliacao_medico.html";
  } else {
    window.location.href = "/html/paginas usuario/avaliacao_usuario.html";
  }
}

function irParaHistoricoPaciente(pacienteId) {
  localStorage.setItem("pacienteSelecionado", String(pacienteId));
  window.location.href = "/html/paginas medico/historico_medico.html";
}

function irParaRelatorioPaciente(pacienteId) {
  localStorage.setItem("pacienteSelecionado", String(pacienteId));

  if (usuarioEhAdmin()) {
    window.location.href = "/html/paginas medico/relatorios_medico.html";
  } else {
    window.location.href = "/html/paginas usuario/relatorio_usuario.html";
  }
}

// =========================
// AVALIAÇÕES
// =========================

const perguntasChecklist = [
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

function opcoesPacientes(pacientes) {
  return pacientes
    .map(
      (paciente) => `
        <option value="${paciente.id}">
          ${escaparHTML(paciente.nome)} - ID ${paciente.id}
        </option>
      `,
    )
    .join("");
}

async function prepararAvaliacao() {
  const areaAvaliacao = document.querySelector(".avaliacao_paciente");
  const areaPaciente = document.querySelector(".escolha_paciente .paciente");

  if (!areaAvaliacao || !areaPaciente) return;

  try {
    const pacientes = await apiFetch("/pacientes", {
      headers: authHeaders(),
    });

    if (!pacientes.length) {
      areaAvaliacao.innerHTML =
        "<p>Cadastre um paciente antes de criar uma avaliação.</p>";
      return;
    }

    const pacienteSelecionado = localStorage.getItem("pacienteSelecionado");

    const pacientePreSelecionado = pacientes.find(
      (paciente) => String(paciente.id) === String(pacienteSelecionado),
    );

    areaPaciente.innerHTML = `
      <p>Paciente</p>

      <input
        id="buscaPacienteAvaliacao"
        type="text"
        placeholder="Digite o nome do paciente"
        list="listaPacientesAvaliacao"
        autocomplete="off"
        value="${
          pacientePreSelecionado
            ? escaparHTML(`${pacientePreSelecionado.nome} - ID ${pacientePreSelecionado.id}`)
            : ""
        }"
      />

      <datalist id="listaPacientesAvaliacao">
        ${pacientes
          .map(
            (paciente) => `
              <option value="${escaparHTML(`${paciente.nome} - ID ${paciente.id}`)}"></option>
            `,
          )
          .join("")}
      </datalist>

      <div id="resumoPacienteSelecionado" class="resumo_paciente_box">
        ${
          pacientePreSelecionado
            ? montarResumoPacienteAvaliacao(pacientePreSelecionado)
            : "<p>Digite e selecione um paciente para visualizar o resumo.</p>"
        }
      </div>
    `;

    window.__pacientesAvaliacao = pacientes;

    const inputBusca = document.getElementById("buscaPacienteAvaliacao");

    inputBusca.addEventListener("input", () => {
      atualizarResumoPacienteAvaliacao();
    });

    areaAvaliacao.innerHTML = `
      <div class="orientacoes_avaliacao">
        <div class="orientacao_card">
          <h4>Como preencher</h4>
          <p>
            Selecione o paciente correto, marque apenas os sintomas observados
            durante a triagem e clique em salvar avaliação.
          </p>
        </div>

        <div class="orientacao_card">
          <h4>Após salvar</h4>
          <p>
          O score será calculado automaticamente. O resultado ficará disponível
          no histórico clínico e nos relatórios para consulta e impressão.
          </p>
        </div>
      </div>

      <form id="formAvaliacao">
        ${perguntasChecklist
          .map(
            (pergunta, index) => `
              <label>
                <input type="checkbox" name="resposta" value="${index}">
                ${index + 1}. ${escaparHTML(pergunta)}
              </label>
            `,
          )
          .join("")}

        <div class="botoes_avaliacao">
          <button type="submit">Salvar avaliação</button>

          <button
            class="botao_limpar"
            type="button"
            onclick="limparChecklistAvaliacao()"
          >
            Limpar checklist
          </button>
        </div>
      </form>

      <div class="aviso_avaliacao">
        <strong>Atenção:</strong> confira o paciente selecionado antes de salvar.
        Essa avaliação será vinculada ao histórico do paciente.
      </div>

      <div id="resultadoAvaliacao"></div>
    `;

    document
      .getElementById("formAvaliacao")
      .addEventListener("submit", salvarAvaliacao);
  } catch (erro) {
    areaAvaliacao.innerHTML = `<p>Erro ao preparar avaliação: ${escaparHTML(
      erro.message,
    )}</p>`;
  }
}

function montarResumoPacienteAvaliacao(paciente) {
  return `
    <h4>Resumo do paciente</h4>

    <div class="resumo_paciente_grid">
      <p>
        <strong>Nome:</strong>
        ${escaparHTML(paciente.nome)}
      </p>

      <p>
        <strong>ID:</strong>
        ${escaparHTML(paciente.id)}
      </p>

      <p>
        <strong>Sexo:</strong>
        ${escaparHTML(paciente.sexo || "Não informado")}
      </p>

      <p>
        <strong>Nascimento:</strong>
        ${formatarData(paciente.data_nascimento)}
      </p>

      <p>
        <strong>Cidade:</strong>
        ${escaparHTML(paciente.cidade || "Não informado")}
      </p>

      <p>
        <strong>Responsável:</strong>
        ${escaparHTML(paciente.responsavel || "Não informado")}
      </p>
    </div>
  `;
}

function atualizarResumoPacienteAvaliacao() {
  const input = document.getElementById("buscaPacienteAvaliacao");
  const resumo = document.getElementById("resumoPacienteSelecionado");

  if (!input || !resumo) return;

  const textoPaciente = input.value.trim();
  const pacientes = window.__pacientesAvaliacao || [];

  const pacienteEncontrado = pacientes.find((paciente) => {
    const textoCompleto = `${paciente.nome} - ID ${paciente.id}`;
    return textoCompleto === textoPaciente;
  });

  if (!pacienteEncontrado) {
    resumo.innerHTML =
      "<p>Digite e selecione um paciente para visualizar o resumo.</p>";
    return;
  }

  resumo.innerHTML = montarResumoPacienteAvaliacao(pacienteEncontrado);
}

function atualizarResumoPacienteHistorico() {
  const input = document.getElementById("buscaPacienteHistorico");
  const resumo = document.getElementById("resumoPacienteHistorico");

  if (!input || !resumo) return;

  const textoPaciente = input.value.trim();
  const pacientes = window.__pacientesHistorico || [];

  const pacienteEncontrado = pacientes.find((paciente) => {
    const textoCompleto = `${paciente.nome} - ID ${paciente.id}`;
    return textoCompleto === textoPaciente;
  });

  if (!pacienteEncontrado) {
    resumo.innerHTML =
      "<p>Digite e selecione um paciente para visualizar o histórico.</p>";
    return;
  }

  resumo.innerHTML = montarResumoPacienteAvaliacao(pacienteEncontrado);
}

function limparChecklistAvaliacao() {
  document.querySelectorAll('input[name="resposta"]').forEach((input) => {
    input.checked = false;
  });

  const resultado = document.getElementById("resultadoAvaliacao");

  if (resultado) {
    resultado.innerHTML = "";
  }
}

async function salvarAvaliacao(event) {
  event.preventDefault();

  const textoPaciente = document
    .getElementById("buscaPacienteAvaliacao")
    ?.value.trim();

  const pacientesAvaliacao = window.__pacientesAvaliacao || [];

  const pacienteEncontrado = pacientesAvaliacao.find((paciente) => {
    const textoCompleto = `${paciente.nome} - ID ${paciente.id}`;
    return textoCompleto === textoPaciente;
  });

  if (!pacienteEncontrado) {
    alert("Selecione um paciente válido da lista.");
    return;
  }

  const paciente_id = Number(pacienteEncontrado.id);
  const respostas = Array(12).fill(0);

  document
    .querySelectorAll('input[name="resposta"]:checked')
    .forEach((input) => {
      respostas[Number(input.value)] = 1;
    });

  try {
    const dados = await apiFetch("/avaliacoes", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        paciente_id,
        respostas,
      }),
    });

    localStorage.setItem("ultimaAvaliacaoId", String(dados.id));

    document.getElementById("resultadoAvaliacao").innerHTML = `
      <div class="resultado_box">
        <h3>Resultado da Avaliação</h3>

        <p>
          <strong>Score final:</strong> ${formatarScore(dados.score)}
        </p>

        <p>
          <strong>Limite:</strong> ${formatarScore(dados.limite)}
        </p>

        <p>
          <strong>Classificação:</strong>
          ${
            dados.suspeito
              ? "Acima do ponto de corte"
              : "Abaixo do ponto de corte"
          }
        </p>

        <p>
          <strong>Recomendação:</strong> ${escaparHTML(dados.recomendacao)}
        </p>

        <div class="acoes_card">
          <button class="botao_card" type="button" onclick="window.print()">
            Imprimir
          </button>

          <button class="botao_card" type="button" onclick="irParaRelatorioPaciente(${paciente_id})">
            Ver relatório
          </button>
        </div>
      </div>
    `;

    alert("Avaliação salva com sucesso!");
  } catch (erro) {
    alert(`Erro ao salvar avaliação: ${erro.message}`);
  }
}

// =========================
// HISTÓRICO E RELATÓRIOS
// =========================

function contarSintomasMarcados(respostasTexto) {
  try {
    const respostas = JSON.parse(respostasTexto || "[]");
    return respostas.filter(Boolean).length;
  } catch (e) {
    return "-";
  }
}

function cardAvaliacao(avaliacao) {
  const sintomasMarcados = contarSintomasMarcados(avaliacao.respostas);

  return `
    <div class="card_api">
      <div class="card_header">
        ${escaparHTML(
          avaliacao.paciente_nome ||
            avaliacao.nome ||
            `Paciente ${avaliacao.paciente_id}`,
        )}
      </div>

      <div class="card_body">
        <div class="dado_item">
          <strong>Data:</strong> ${formatarData(avaliacao.criado_em)}
        </div>

        <div class="dado_item">
          <strong>Score:</strong> ${formatarScore(avaliacao.score)}
        </div>

        <div class="dado_item">
          <strong>Sexo:</strong> ${escaparHTML(avaliacao.sexo || "-")}
        </div>

        <div class="dado_item">
          <strong>Sintomas:</strong> ${sintomasMarcados}
        </div>

        <div class="dado_item">
          <strong>Profissional:</strong> ${escaparHTML(
            avaliacao.usuario_nome || "-",
          )}
        </div>

        <div class="dado_item" style="min-width: 100%;">
          <strong>Recomendação:</strong> ${escaparHTML(avaliacao.recomendacao)}
        </div>
      </div>

      <div class="acoes_card">
        <button class="botao_card" type="button" onclick="imprimirAvaliacao(${Number(
          avaliacao.id,
        )})">
          Imprimir
        </button>
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

    const pacienteSelecionado = localStorage.getItem("pacienteSelecionado");

    const pacientePreSelecionado = pacientes.find(
      (paciente) => String(paciente.id) === String(pacienteSelecionado),
    );

    seletorArea.innerHTML = `
      <p>Paciente</p>

      <input
        id="buscaPacienteHistorico"
        type="text"
        placeholder="Digite o nome do paciente"
        list="listaPacientesHistorico"
        autocomplete="off"
        value="${
          pacientePreSelecionado
            ? escaparHTML(`${pacientePreSelecionado.nome} - ID ${pacientePreSelecionado.id}`)
            : ""
        }"
      />

      <datalist id="listaPacientesHistorico">
        ${pacientes
          .map(
            (paciente) => `
              <option value="${escaparHTML(`${paciente.nome} - ID ${paciente.id}`)}"></option>
            `,
          )
          .join("")}
      </datalist>

      <div id="resumoPacienteHistorico" class="resumo_paciente_box">
        ${
          pacientePreSelecionado
            ? montarResumoPacienteAvaliacao(pacientePreSelecionado)
            : "<p>Digite e selecione um paciente para visualizar o histórico.</p>"
        }
      </div>
    `;

    window.__pacientesHistorico = pacientes;

    area.innerHTML = `
      <div class="historico_vazio">
        <h4>Histórico de avaliações</h4>
        <p>
          Selecione um paciente para visualizar avaliações anteriores,
          scores, recomendações e opções de impressão.
        </p>
      </div>
    `;

    const input = document.getElementById("buscaPacienteHistorico");

    input.addEventListener("input", () => {
      atualizarResumoPacienteHistorico();
      carregarHistoricoPaciente();
    });

    if (pacientePreSelecionado) {
      carregarHistoricoPaciente();
    }
  } catch (erro) {
    area.innerHTML = `<p>Erro ao carregar pacientes: ${escaparHTML(
      erro.message,
    )}</p>`;
  }
}

async function carregarHistoricoPaciente() {
  const area = document.querySelector(".historico_avaliacao");

  if (!area) return;

  const input = document.getElementById("buscaPacienteHistorico");
  const textoPaciente = input?.value.trim();

  const pacientes = window.__pacientesHistorico || [];

  const pacienteEncontrado = pacientes.find((paciente) => {
    const textoCompleto = `${paciente.nome} - ID ${paciente.id}`;
    return textoCompleto === textoPaciente;
  });

  if (!pacienteEncontrado) {
    area.innerHTML = `
      <div class="historico_vazio">
        <h4>Histórico de avaliações</h4>
        <p>
          Digite e selecione um paciente válido para visualizar o histórico.
        </p>
      </div>
    `;
    return;
  }

  try {
    const avaliacoes = await apiFetch(`/avaliacoes/${pacienteEncontrado.id}`, {
      headers: authHeaders(),
    });

    area.innerHTML =
      avaliacoes.map(cardAvaliacao).join("") ||
      `<div class="historico_vazio">
        <h4>Nenhuma avaliação encontrada</h4>
        <p>Esse paciente ainda não possui avaliações registradas.</p>
      </div>`;
  } catch (erro) {
    area.innerHTML = `<p>Erro ao carregar histórico: ${escaparHTML(
      erro.message,
    )}</p>`;
  }
}

async function carregarRelatorios() {
  const lista = document.querySelector(".lista_relatorios");

  if (!lista) return;

  try {
    const params = new URLSearchParams();

    const inicio = document.querySelector(".data_inicio input")?.value || "";
    const fim = document.querySelector(".data_fim input")?.value || "";

    const campoPaciente =
      document.querySelector(".paciente_ input") ||
      document.querySelector(".busca_paciente input");

    let paciente = campoPaciente?.value.trim() || "";

    const pacienteSelecionado = localStorage.getItem("pacienteSelecionado");

    if (!paciente && pacienteSelecionado) {
      paciente = pacienteSelecionado;

      if (campoPaciente) {
        campoPaciente.value = pacienteSelecionado;
      }

      localStorage.removeItem("pacienteSelecionado");
    }

    if (inicio && fim) {
      params.set("inicio", inicio);
      params.set("fim", fim);
    }

    if (paciente) {
      params.set("paciente", paciente);
    }

    const avaliacoes = await apiFetch(`/avaliacoes?${params.toString()}`, {
      headers: authHeaders(),
    });

    const totalEncaminhamentos = avaliacoes.filter((avaliacao) =>
      String(avaliacao.recomendacao || "")
        .toLowerCase()
        .includes("encaminhar"),
    ).length;

    lista.innerHTML = `
      <div class="resumo_relatorios">
        <div>
          <strong>${avaliacoes.length}</strong>
          <span>relatórios encontrados</span>
        </div>

        <div>
          <strong>${totalEncaminhamentos}</strong>
          <span>encaminhamentos</span>
        </div>
      </div>

      ${
        avaliacoes.length
          ? avaliacoes.map(cardAvaliacao).join("")
          : "<p>Nenhum relatório encontrado.</p>"
      }
    `;
  } catch (erro) {
    lista.innerHTML = `<p>Erro ao carregar relatórios: ${escaparHTML(
      erro.message,
    )}</p>`;
  }
}

async function imprimirAvaliacao(id) {
  try {
    const avaliacao = await apiFetch(`/avaliacoes/imprimir/${id}`, {
      headers: authHeaders(),
    });

    const janela = window.open("", "_blank");

    janela.document.write(`
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Relatório de Avaliação</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              color: #111;
            }

            h1 {
              margin-bottom: 4px;
            }

            h2 {
              margin-top: 28px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 8px;
            }

            .linha {
              margin: 8px 0;
            }

            strong {
              color: #000;
            }

            .box {
              border: 1px solid #ccc;
              border-radius: 8px;
              padding: 16px;
              margin-top: 16px;
            }

            @media print {
              button {
                display: none;
              }
            }
          </style>
        </head>

        <body>
          <h1>X-Triagem</h1>
          <p>Relatório de avaliação clínica</p>

          <h2>Dados do paciente</h2>

          <div class="linha">
            <strong>Paciente:</strong> ${escaparHTML(avaliacao.paciente_nome)}
          </div>

          <div class="linha">
            <strong>Data de nascimento:</strong> ${formatarData(
              avaliacao.data_nascimento,
            )}
          </div>

          <div class="linha">
            <strong>Sexo:</strong> ${escaparHTML(avaliacao.sexo)}
          </div>

          <h2>Resultado da avaliação</h2>

          <div class="box">
            <div class="linha">
              <strong>Data:</strong> ${formatarData(avaliacao.criado_em)}
            </div>

            <div class="linha">
              <strong>Score:</strong> ${formatarScore(avaliacao.score)}
            </div>

            <div class="linha">
              <strong>Recomendação:</strong> ${escaparHTML(
                avaliacao.recomendacao,
              )}
            </div>

            <div class="linha">
              <strong>Profissional responsável:</strong> ${escaparHTML(
                avaliacao.usuario_nome,
              )}
            </div>
          </div>

          <br />

          <button onclick="window.print()">Imprimir</button>
        </body>
      </html>
    `);

    janela.document.close();
  } catch (erro) {
    alert(`Erro ao preparar impressão: ${erro.message}`);
  }
}

// =========================
// AVISOS / COMUNICADOS INTERNOS
// =========================

function formatarDataHora(data) {
  if (!data) return "Não informado";

  const texto = String(data).trim();

  // O SQLite salva CURRENT_TIMESTAMP em UTC.
  // Exemplo: "2026-05-23 02:14:00"
  // Aqui a gente transforma para horário do Brasil.
  const dataUTC = texto.includes("T")
    ? new Date(texto)
    : new Date(texto.replace(" ", "T") + "Z");

  if (Number.isNaN(dataUTC.getTime())) {
    return texto;
  }

  const dataFormatada = dataUTC.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const horaFormatada = dataUTC.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${dataFormatada} às ${horaFormatada}`;
}

function cardAviso(aviso) {
  const podeExcluir = usuarioEhAdmin();

  const autor =
    aviso.autor_nome ||
    aviso.nome_usuario ||
    aviso.username ||
    aviso.autor ||
    "Admin";

  return `
    <div class="card_aviso">
      <div class="aviso_topo">
        <div>
          <h4>${escaparHTML(aviso.titulo)}</h4>
          <span>
            Publicado por ${escaparHTML(autor)} • ${formatarDataHora(aviso.criado_em)}
          </span>
        </div>

        ${
          podeExcluir
            ? `
              <button
                class="botao_card botao_perigo"
                type="button"
                onclick="excluirAviso(${Number(aviso.id)})"
              >
                Excluir
              </button>
            `
            : ""
        }
      </div>

      <p>${escaparHTML(aviso.mensagem)}</p>
    </div>
  `;
}

async function carregarAvisosDashboard() {
  const lista = document.querySelector(".lista_avisos_dashboard");

  if (!lista) return;

  try {
    const avisos = await apiFetch("/avisos", {
      headers: authHeaders(),
    });

    lista.innerHTML =
      avisos.length > 0
        ? avisos.map(cardAviso).join("")
        : `
          <div class="aviso_vazio">
            <h4>Nenhum comunicado publicado</h4>
            <p>Quando o administrador publicar um aviso, ele aparecerá aqui.</p>
          </div>
        `;
  } catch (erro) {
    lista.innerHTML = `<p>Erro ao carregar avisos: ${escaparHTML(
      erro.message
    )}</p>`;
  }
}

async function publicarAviso(event) {
  event.preventDefault();

  const titulo = document.getElementById("avisoTitulo")?.value.trim();
  const mensagem = document.getElementById("avisoMensagem")?.value.trim();

  if (!titulo || !mensagem) {
    alert("Preencha o título e a mensagem do aviso.");
    return;
  }

  try {
    await apiFetch("/avisos", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        titulo,
        mensagem,
      }),
    });

    document.getElementById("formAviso")?.reset();

    alert("Aviso publicado com sucesso!");
    carregarAvisosDashboard();
  } catch (erro) {
    alert(`Erro ao publicar aviso: ${erro.message}`);
  }
}

async function excluirAviso(id) {
  const confirmar = confirm("Tem certeza que deseja excluir este aviso?");

  if (!confirmar) return;

  try {
    await apiFetch(`/avisos/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    alert("Aviso excluído com sucesso!");
    carregarAvisosDashboard();
  } catch (erro) {
    alert(`Erro ao excluir aviso: ${erro.message}`);
  }
}

// =========================
// DASHBOARDS
// =========================

async function carregarDashboardUsuario() {
  const area = document.querySelector(".areabase");

  if (!area || paginaAtual() !== "dashboard_usuario.html") return;

  try {
    const [pacientes, avaliacoes] = await Promise.all([
      apiFetch("/pacientes", { headers: authHeaders() }),
      apiFetch("/avaliacoes", { headers: authHeaders() }),
    ]);

    const ultimoPaciente = pacientes[pacientes.length - 1];

    area.innerHTML = `
      <h3 class="titu1">Dashboard</h3>
      <p>Resumo geral do atendimento</p>

      <div class="graficos">
        <div>
          <h5>Pacientes</h5>
          <p><strong>${pacientes.length}</strong> cadastrados</p>
        </div>

        <div>
          <h5>Avaliações</h5>
          <p><strong>${avaliacoes.length}</strong> realizadas</p>
        </div>

        <div>
          <h5>Relatórios</h5>
          <p><strong>${avaliacoes.length}</strong> disponíveis</p>
        </div>

        <div>
          <h5>Último paciente</h5>
          <p>${escaparHTML(ultimoPaciente?.nome || "Nenhum paciente")}</p>
        </div>
      </div>

      <hr />

      <section class="mural_avisos">
        <div class="mural_topo">
          <div>
            <h3>Comunicados Internos</h3>
            <p>Avisos publicados pela administração.</p>
          </div>
        </div>

        <div class="lista_avisos_dashboard">
          <p>Carregando avisos...</p>
        </div>
      </section>

      <hr />

      <h3 class="titu2">Ações rápidas</h3>

      <div class="acoes">
        <a href="./cadastropaciente_usuario.html">
          <button class="novo_user" type="button">Novo paciente</button>
        </a>

        <a href="./avaliacao_usuario.html">
          <button class="nova_avaliacao" type="button">Nova avaliação</button>
        </a>

        <a href="./relatorio_usuario.html">
          <button class="novo_relatorio" type="button">Ver relatórios</button>
        </a>
      </div>

      <div class="sistema">
        <h5>Resumo do atendimento</h5>

        <p>
          Use esta área para cadastrar pacientes, iniciar avaliações clínicas
          e consultar relatórios gerados.
        </p>

        <p>
          <strong>Seu papel:</strong> Atendente<br />
          <strong>Status:</strong> Sistema funcionando
        </p>
      </div>
    `;

    carregarAvisosDashboard();
  } catch (erro) {
    area.innerHTML = `<p>Erro ao carregar dashboard: ${escaparHTML(
      erro.message
    )}</p>`;
  }
}

async function carregarDashboardMedico() {
  if (paginaAtual() !== "dashboard_medico.html") return;

  try {
    const [pacientes, avaliacoes] = await Promise.all([
      apiFetch("/pacientes", { headers: authHeaders() }),
      apiFetch("/avaliacoes", { headers: authHeaders() }),
    ]);

    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    const avaliacoesUltimos30Dias = avaliacoes.filter((avaliacao) => {
      if (!avaliacao.criado_em) return true;

      const dataAvaliacao = new Date(avaliacao.criado_em);
      return dataAvaliacao >= trintaDiasAtras;
    });

    const totalEncaminhamentos = avaliacoesUltimos30Dias.filter((avaliacao) =>
      String(avaliacao.recomendacao || "")
        .toLowerCase()
        .includes("encaminhar")
    ).length;

    const cardPacientes = document.querySelector(".graficos .pacientes p");
    const cardAvaliacoes = document.querySelector(".graficos .avaliacoes p");
    const cardEncaminhamentos = document.querySelector(
      ".graficos .encaminhamentos p"
    );
    const cardRelatorio = document.querySelector(".graficos .relatorio p");

    if (cardPacientes) {
      cardPacientes.innerHTML = `<strong>${pacientes.length}</strong> registrados`;
    }

    if (cardAvaliacoes) {
      cardAvaliacoes.innerHTML = `<strong>${avaliacoesUltimos30Dias.length}</strong> nos últimos 30 dias`;
    }

    if (cardEncaminhamentos) {
      cardEncaminhamentos.innerHTML = `<strong>${totalEncaminhamentos}</strong> para teste genético`;
    }

    if (cardRelatorio) {
      cardRelatorio.innerHTML = `<strong>${avaliacoes.length}</strong> disponíveis`;
    }

    const sistema = document.querySelector(".sistema");

    if (sistema) {
      const ultimas = avaliacoes.slice(0, 3);

      sistema.innerHTML = `
        <section class="mural_avisos">
          <div class="mural_topo">
            <div>
              <h3>Comunicados Internos</h3>
              <p>Publique avisos para todos os usuários do sistema.</p>
            </div>
          </div>

          <form id="formAviso" class="form_aviso">
            <input
              id="avisoTitulo"
              type="text"
              placeholder="Título do aviso"
              maxlength="100"
            />

            <textarea
              id="avisoMensagem"
              placeholder="Mensagem do aviso"
              maxlength="500"
            ></textarea>

            <button class="botao_card" type="submit">
              Publicar aviso
            </button>
          </form>

          <div class="lista_avisos_dashboard">
            <p>Carregando avisos...</p>
          </div>
        </section>

        <hr />

        <h5>Últimas avaliações</h5>

        ${
          ultimas.length
            ? ultimas
                .map(
                  (avaliacao) => `
                    <p>
                      <strong>${escaparHTML(
                        avaliacao.paciente_nome ||
                          avaliacao.nome ||
                          `Paciente ${avaliacao.paciente_id}`
                      )}</strong><br />
                      Score: ${formatarScore(avaliacao.score)} |
                      ${escaparHTML(
                        avaliacao.recomendacao || "Sem recomendação"
                      )}
                    </p>
                  `
                )
                .join("")
            : "<p>Nenhuma avaliação registrada ainda.</p>"
        }
      `;

      const formAviso = document.getElementById("formAviso");

      if (formAviso) {
        formAviso.addEventListener("submit", publicarAviso);
      }

      carregarAvisosDashboard();
    }
  } catch (erro) {
    console.error("Erro ao carregar dashboard médico:", erro);
  }
}

// =========================
// BUSCA LOCAL
// =========================

function ativarBuscaLocal(inputSelector, cardSelector) {
  const input = document.querySelector(inputSelector);
  if (!input) return;

  input.addEventListener("input", () => {
    const termo = input.value.toLowerCase().trim();
    const cards = document.querySelectorAll(cardSelector);

    cards.forEach((card) => {
      const texto = card.textContent.toLowerCase();
      card.style.display = texto.includes(termo) ? "" : "none";
    });
  });
}

// =========================
// INICIALIZAÇÃO
// =========================

document.addEventListener("DOMContentLoaded", () => {
  protegerPagina();
  atualizarBoasVindas();
  ativarMascaras();

  const pagina = paginaAtual();

  const botaoLoginHome = document.getElementById("login");

  if (botaoLoginHome) {
    botaoLoginHome.addEventListener("click", () => {
      window.location.href = "/html/login.html";
    });
  }

  const botaoCadastrarPaciente = document.querySelector(".botao_cadastrar");

  if (pagina === "cadastropaciente_usuario.html") {
    configurarUploadFotoPaciente();

    if (botaoCadastrarPaciente) {
      botaoCadastrarPaciente.addEventListener("click", cadastrarPaciente);
    }
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

  document.querySelectorAll(".filtros button").forEach((botao) => {
    botao.addEventListener("click", carregarRelatorios);
  });

  const buscaRelatorioUsuario = document.querySelector(".busca_paciente input");

  if (buscaRelatorioUsuario) {
    buscaRelatorioUsuario.addEventListener("input", () => {
      clearTimeout(window.__timerBuscaRelatorio);

      window.__timerBuscaRelatorio = setTimeout(() => {
        carregarRelatorios();
      }, 400);
    });
  }

  if (pagina === "dashboard_medico.html") {
    carregarDashboardMedico();
  }

  if (pagina === "dashboard_usuario.html") {
    carregarDashboardUsuario();
  }

  if (pagina === "usuarios_medico.html") {
    carregarUsuarios();
  }

  if (pagina === "pacientes_medico.html" || pagina === "pacientes_usuario.html") {
    carregarPacientes();
  }

  if (pagina === "avaliacao_medico.html" || pagina === "avaliacao_usuario.html") {
    prepararAvaliacao();
  }

  if (pagina === "historico_medico.html") {
    prepararHistorico();
  }

  if (pagina === "relatorios_medico.html" || pagina === "relatorio_usuario.html") {
    carregarRelatorios();
  }
});