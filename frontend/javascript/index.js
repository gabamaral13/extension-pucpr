
// Integração Frontend <-> Backend

const API_URL =
  window.location.origin && window.location.origin !== 'null' && window.location.origin.includes('3000')
    ? window.location.origin
    : 'http://localhost:3000';

function aplicarEstilosIntegracao() {
  if (document.getElementById('estilos-integracao-api')) return;

  const style = document.createElement('style');
  style.id = 'estilos-integracao-api';
  style.textContent = `
    .card_api {
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 10px;
      padding: 12px;
      margin: 10px 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      color: #111;
    }

    select {
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #ccc;
      width: 100%;
      max-width: 420px;
    }

    #resultadoAvaliacao {
      margin-top: 15px;
      padding: 10px;
      border-radius: 8px;
    }
  `;
  document.head.appendChild(style);
}

function token() {
  return localStorage.getItem('token');
}

function usuarioLogado() {
  try {
    return JSON.parse(localStorage.getItem('usuario'));
  } catch (e) {
    return null;
  }
}

function decodeJwtPayload(jwt) {
  try {
    const payload = jwt.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch (e) {
    return null;
  }
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token()}`
  };
}

function escaparHTML(valor) {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function apiFetch(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, opcoes);
  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : {};

  if (!resposta.ok) {
    throw new Error(dados.erro || dados.mensagem || 'Erro na requisição');
  }

  return dados;
}

function caminhoLogin() {
  return window.location.pathname.includes('paginas') ? '../login.html' : 'login.html';
}

function sair() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = caminhoLogin();
}

function protegerPagina() {
  const pagina = window.location.pathname.split('/').pop();
  const paginasLivres = ['index.html', 'login.html', ''];

  if (!paginasLivres.includes(pagina) && !token()) {
    window.location.href = caminhoLogin();
  }
}

function atualizarBoasVindas() {
  const usuario = usuarioLogado();
  const titulo = document.querySelector('.container_ .titulo');

  if (titulo && usuario) {
    const papel = usuario.papel === 'admin' ? 'Admin' : 'Usuário';
    titulo.textContent = `Bem-vindo, ${papel}`;
  }

  const userArea = document.querySelector('.user_');

  if (userArea && usuario) {
    userArea.innerHTML = `
      <p style="font-size: 13px; margin-top: 20px;">${escaparHTML(usuario.username || 'Usuário')}</p>
      <button type="button" onclick="sair()">Sair</button>
    `;
  }
}

// =========================
// LOGIN
// =========================

async function fazerLogin(event) {
  event.preventDefault();

  const username = document.getElementById('email')?.value.trim();
  const senha = document.getElementById('senha')?.value;

  if (!username || !senha) {
    alert('Preencha usuário/e-mail e senha.');
    return;
  }

  try {
    const dados = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, senha })
    });

    const usuario = dados.usuario || decodeJwtPayload(dados.token);

    localStorage.setItem('token', dados.token);
    localStorage.setItem('usuario', JSON.stringify(usuario));

    if (usuario?.papel === 'admin') {
      window.location.href = 'paginas medico/dashboard_medico.html';
    } else {
      window.location.href = 'paginas usuario/dashboard_usuario.html';
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

  const nome = document.getElementById('nome')?.value.trim();
  const emails = document.querySelectorAll('#email');
  const email = emails[0]?.value.trim();
  const senha = document.getElementById('senha')?.value;
  const confirmaSenha = document.getElementById('confirmsenha')?.value;

  const username = email || nome;

  if (!username || !senha) {
    alert('Preencha e-mail/usuário e senha.');
    return;
  }

  if (senha !== confirmaSenha) {
    alert('As senhas não conferem.');
    return;
  }

  try {
    await apiFetch('/usuarios', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ username, senha, papel: 'user' })
    });

    alert('Usuário cadastrado com sucesso!');
    window.location.href = 'usuarios_medico.html';
  } catch (erro) {
    alert(`Erro ao cadastrar usuário: ${erro.message}`);
  }
}

async function carregarUsuarios() {
  const container = document.querySelector('.usuarios_');
  if (!container) return;

  try {
    const usuarios = await apiFetch('/usuarios', { headers: authHeaders() });

    container.innerHTML = usuarios.map((usuario) => `
      <div class="card_api">
        <strong>${escaparHTML(usuario.username)}</strong><br>
        <span>Perfil: ${escaparHTML(usuario.papel)}</span>
      </div>
    `).join('') || '<p>Nenhum usuário cadastrado.</p>';
  } catch (erro) {
    container.innerHTML = `<p>Erro ao carregar usuários: ${escaparHTML(erro.message)}</p>`;
  }
}

// =========================
// PACIENTES
// =========================

function normalizarSexo(valor) {
  const sexo = String(valor || '').trim().toUpperCase();

  if (sexo === 'M' || sexo.startsWith('MASC')) return 'M';
  if (sexo === 'F' || sexo.startsWith('FEM')) return 'F';

  return sexo;
}

async function cadastrarPaciente() {
  const nome = document.getElementById('nome')?.value.trim();
  const data_nascimento = document.getElementById('data')?.value;
  const sexo = normalizarSexo(document.getElementById('sexo')?.value);
  const responsavel = document.querySelector('.infor_paciente input')?.value.trim() || null;

  if (!nome || !data_nascimento || !sexo) {
    alert('Preencha nome, data de nascimento e sexo.');
    return;
  }

  if (!['M', 'F'].includes(sexo)) {
    alert('Sexo deve ser M ou F.');
    return;
  }

  try {
    await apiFetch('/pacientes', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ nome, data_nascimento, sexo, responsavel })
    });

    alert('Paciente cadastrado com sucesso!');
    window.location.href = 'pacientes_usuario.html';
  } catch (erro) {
    alert(`Erro ao cadastrar paciente: ${erro.message}`);
  }
}

function cardPaciente(paciente) {
  return `
    <div class="card_api">
      <strong>${escaparHTML(paciente.nome)}</strong><br>
      <span>ID: ${paciente.id}</span><br>
      <span>Nascimento: ${escaparHTML(paciente.data_nascimento)}</span><br>
      <span>Sexo: ${escaparHTML(paciente.sexo)}</span>
    </div>
  `;
}

async function carregarPacientes() {
  const lista = document.querySelector('.lista_pacientes');
  const contador = document.querySelector('.pacientes_registrados');

  if (!lista && !contador) return [];

  try {
    const pacientes = await apiFetch('/pacientes', { headers: authHeaders() });

    if (lista) {
      lista.innerHTML = pacientes.map(cardPaciente).join('') || '<p>Nenhum paciente cadastrado.</p>';
    }

    if (contador) {
      contador.innerHTML = `<h2>${pacientes.length}</h2>`;
    }

    return pacientes;
  } catch (erro) {
    if (lista) lista.innerHTML = `<p>Erro ao carregar pacientes: ${escaparHTML(erro.message)}</p>`;
    return [];
  }
}

// =========================
// AVALIAÇÕES
// =========================

const perguntasChecklist = [
  'Atraso no desenvolvimento da fala',
  'Dificuldade de aprendizagem',
  'Déficit de atenção ou hiperatividade',
  'Ansiedade ou timidez excessiva',
  'Comportamentos repetitivos',
  'Sensibilidade a sons, luzes ou toque',
  'Histórico familiar relacionado',
  'Face alongada ou orelhas proeminentes',
  'Dificuldade de contato visual',
  'Atraso motor',
  'Convulsões ou alterações neurológicas',
  'Alterações comportamentais importantes'
];

function opcoesPacientes(pacientes) {
  return pacientes.map((paciente) => `
    <option value="${paciente.id}">${escaparHTML(paciente.nome)} - ID ${paciente.id}</option>
  `).join('');
}

async function prepararAvaliacao() {
  const areaAvaliacao = document.querySelector('.avaliacao_paciente');
  const areaPaciente = document.querySelector('.escolha_paciente .paciente');

  if (!areaAvaliacao || !areaPaciente) return;

  try {
    const pacientes = await apiFetch('/pacientes', { headers: authHeaders() });

    if (!pacientes.length) {
      areaAvaliacao.innerHTML = '<p>Cadastre um paciente antes de criar uma avaliação.</p>';
      return;
    }

    areaPaciente.innerHTML = `
      <p>Paciente</p>
      <select id="pacienteAvaliacao">${opcoesPacientes(pacientes)}</select>
    `;

    areaAvaliacao.innerHTML = `
      <form id="formAvaliacao">
        ${perguntasChecklist.map((pergunta, index) => `
          <label style="display:block; margin: 8px 0;">
            <input type="checkbox" name="resposta" value="${index}">
            ${index + 1}. ${escaparHTML(pergunta)}
          </label>
        `).join('')}

        <button type="submit">Salvar avaliação</button>
      </form>

      <div id="resultadoAvaliacao"></div>
    `;

    document.getElementById('formAvaliacao').addEventListener('submit', salvarAvaliacao);
  } catch (erro) {
    areaAvaliacao.innerHTML = `<p>Erro ao preparar avaliação: ${escaparHTML(erro.message)}</p>`;
  }
}

async function salvarAvaliacao(event) {
  event.preventDefault();

  const paciente_id = Number(document.getElementById('pacienteAvaliacao')?.value);
  const respostas = Array(12).fill(0);

  document.querySelectorAll('input[name="resposta"]:checked').forEach((input) => {
    respostas[Number(input.value)] = 1;
  });

  try {
    const dados = await apiFetch('/avaliacoes', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ paciente_id, respostas })
    });

    document.getElementById('resultadoAvaliacao').innerHTML = `
      <p><strong>Score:</strong> ${dados.score}</p>
      <p><strong>Recomendação:</strong> ${escaparHTML(dados.recomendacao)}</p>
    `;

    alert('Avaliação salva com sucesso!');
  } catch (erro) {
    alert(`Erro ao salvar avaliação: ${erro.message}`);
  }
}

// =========================
// HISTÓRICO E RELATÓRIOS
// =========================

function cardAvaliacao(avaliacao) {
  const respostas = (() => {
    try {
      return JSON.parse(avaliacao.respostas || '[]').filter(Boolean).length;
    } catch (e) {
      return '-';
    }
  })();

  return `
    <div class="card_api">
      <strong>${escaparHTML(avaliacao.paciente_nome || avaliacao.nome || `Paciente ${avaliacao.paciente_id}`)}</strong><br>
      <span>Data: ${escaparHTML(avaliacao.criado_em)}</span><br>
      <span>Score: ${escaparHTML(avaliacao.score)}</span><br>
      <span>Sintomas marcados: ${respostas}</span><br>
      <span>Recomendação: ${escaparHTML(avaliacao.recomendacao)}</span>
    </div>
  `;
}

async function prepararHistorico() {
  const area = document.querySelector('.historico_avaliacao');
  const seletorArea = document.querySelector('.selecionar_paciente .paciente');

  if (!area || !seletorArea) return;

  try {
    const pacientes = await apiFetch('/pacientes', { headers: authHeaders() });

    seletorArea.innerHTML = `
      <p>Paciente</p>
      <select id="pacienteHistorico">
        <option value="">Selecione</option>
        ${opcoesPacientes(pacientes)}
      </select>
    `;

    document.getElementById('pacienteHistorico').addEventListener('change', carregarHistoricoPaciente);
  } catch (erro) {
    area.innerHTML = `<p>Erro ao carregar pacientes: ${escaparHTML(erro.message)}</p>`;
  }
}

async function carregarHistoricoPaciente() {
  const pacienteId = document.getElementById('pacienteHistorico')?.value;
  const area = document.querySelector('.historico_avaliacao');

  if (!pacienteId || !area) return;

  try {
    const avaliacoes = await apiFetch(`/avaliacoes/${pacienteId}`, { headers: authHeaders() });

    area.innerHTML = avaliacoes.map(cardAvaliacao).join('') || '<p>Esse paciente ainda não possui avaliações.</p>';
  } catch (erro) {
    area.innerHTML = `<p>Erro ao carregar histórico: ${escaparHTML(erro.message)}</p>`;
  }
}

async function carregarRelatorios() {
  const lista = document.querySelector('.lista_relatorios');

  if (!lista) return;

  try {
    const usuario = usuarioLogado();
    const params = new URLSearchParams();

    const inputs = document.querySelectorAll('.filtros input, .busca_paciente input');
    const inicio = inputs[0]?.type === 'date' ? inputs[0].value : '';
    const fim = inputs[1]?.type === 'date' ? inputs[1].value : '';
    const paciente = inputs[2]?.value || (inputs[0]?.type !== 'date' ? inputs[0]?.value : '');

    if (inicio && fim) {
      params.set('inicio', `${inicio} 00:00:00`);
      params.set('fim', `${fim} 23:59:59`);
    }

    if (paciente) {
      params.set('paciente', paciente);
    }

    const avaliacoes = await apiFetch(`/avaliacoes?${params.toString()}`, {
      headers: authHeaders()
    });

    lista.innerHTML = avaliacoes.map(cardAvaliacao).join('') || '<p>Nenhum relatório encontrado.</p>';

    if (usuario?.papel === 'admin') {
      carregarResumoAdmin();
    }
  } catch (erro) {
    lista.innerHTML = `<p>Erro ao carregar relatórios: ${escaparHTML(erro.message)}</p>`;
  }
}

async function carregarResumoAdmin() {
  const pagina = window.location.pathname.split('/').pop();

  if (pagina !== 'dashboard_medico.html' && pagina !== 'relatorios_medico.html') return;

  try {
    const [resumo, pacientes] = await Promise.all([
      apiFetch('/relatorios?dias=30', { headers: authHeaders() }),
      apiFetch('/pacientes', { headers: authHeaders() })
    ]);

    const cardPacientes = document.querySelector('.dashboard .pacientes p, .graficos .pacientes p');
    const cardAvaliacoes = document.querySelector('.dashboard .avaliacoes p, .graficos .avaliacoes p');
    const cardEncaminhamentos = document.querySelector('.dashboard .encaminhamentos p, .graficos .encaminhamentos p');
    const cardRelatorio = document.querySelector('.dashboard .relatorio p, .graficos .relatorio p');

    if (cardPacientes) {
      cardPacientes.innerHTML = `<strong>${pacientes.length}</strong> registrados no sistema`;
    }

    if (cardAvaliacoes) {
      cardAvaliacoes.innerHTML = `<strong>${resumo.totalAvaliacoes}</strong> realizadas nos últimos 30 dias`;
    }

    if (cardEncaminhamentos) {
      cardEncaminhamentos.innerHTML = `<strong>${resumo.totalEncaminhamentos}</strong> para teste genético`;
    }

    if (cardRelatorio) {
      cardRelatorio.innerHTML = `<strong>${resumo.avaliacoesPorUsuario?.length || 0}</strong> usuários com avaliações`;
    }
  } catch (erro) {
    console.error('Erro ao carregar dashboard admin:', erro);
  }
}

// =========================
// INICIALIZAÇÃO
// =========================

document.addEventListener('DOMContentLoaded', () => {
  aplicarEstilosIntegracao();
  protegerPagina();
  atualizarBoasVindas();

  const pagina = window.location.pathname.split('/').pop() || 'index.html';

  const botaoLoginHome = document.getElementById('login');

  if (botaoLoginHome) {
    botaoLoginHome.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }

  const botaoCadastrarPaciente = document.querySelector('.botao_cadastrar');

  if (pagina === 'cadastropaciente_usuario.html' && botaoCadastrarPaciente) {
    botaoCadastrarPaciente.addEventListener('click', cadastrarPaciente);
  }

  const botaoCadastroUsuario = document.querySelector('.botao_user_');

  if (pagina === 'usuarios_medico.html' && botaoCadastroUsuario) {
    botaoCadastroUsuario.addEventListener('click', () => {
      window.location.href = 'cadastrousuario.html';
    });
  }

  document.querySelectorAll('.botao_imprimir').forEach((botao) => {
    botao.addEventListener('click', () => window.print());
  });

  document.querySelectorAll('.filtros button').forEach((botao) => {
    botao.addEventListener('click', carregarRelatorios);
  });

  if (pagina === 'dashboard_medico.html') carregarResumoAdmin();

  if (
    pagina === 'usuarios_medico.html'
  ) {
    carregarUsuarios();
  }

  if (
    pagina === 'pacientes_medico.html' ||
    pagina === 'pacientes_usuario.html' ||
    pagina === 'dashboard_usuario.html'
  ) {
    carregarPacientes();
  }

  if (pagina === 'avaliacao_medico.html') prepararAvaliacao();

  if (pagina === 'historico_medico.html') prepararHistorico();

  if (
    pagina === 'relatorios_medico.html' ||
    pagina === 'relatorio_usuario.html'
  ) {
    carregarRelatorios();
  }
});