const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const os = require('os');

// Importa o banco
require('./banco');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir o frontend pelo próprio backend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas da API
app.use('/auth', require('./rotas/authRotas'));
app.use('/usuarios', require('./rotas/usuarioRotas'));
app.use('/pacientes', require('./rotas/pacienteRotas'));
app.use('/avaliacoes', require('./rotas/avaliacaoRotas'));
app.use('/relatorios', require('./rotas/relatorioRotas'));

// Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});

// Rota teste
app.get('/api/status', (req, res) => {
  res.json({ mensagem: 'API do sistema hospitalar rodando 🚀' });
});

// Porta
const PORTA = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Função para mostrar IPs úteis da rede local
function mostrarIpsDaRede() {
  const interfaces = os.networkInterfaces();

  console.log('\nAcesse em outro dispositivo da mesma rede usando um destes links:\n');

  let encontrouIp = false;

  Object.keys(interfaces).forEach((nome) => {
    interfaces[nome].forEach((rede) => {
      const ehIPv4 = rede.family === 'IPv4';
      const ehInterno = rede.internal;
      const ehIpVirtual =
        nome.toLowerCase().includes('virtual') ||
        nome.toLowerCase().includes('vmware') ||
        nome.toLowerCase().includes('virtualbox') ||
        nome.toLowerCase().includes('wsl') ||
        rede.address.startsWith('169.254.');

      if (ehIPv4 && !ehInterno && !ehIpVirtual) {
        encontrouIp = true;
        console.log(`http://${rede.address}:${PORTA}`);
        console.log(`http://${rede.address}:${PORTA}/html/index.html`);
        console.log(`http://${rede.address}:${PORTA}/api/status`);
        console.log('');
      }
    });
  });

  if (!encontrouIp) {
    console.log('Nenhum IP de rede local encontrado.');
    console.log('Use o comando "ipconfig" para verificar o IPv4 manualmente.\n');
  }
}

// Rota para páginas/API inexistentes
app.use((req, res) => {
  res.status(404).json({
    erro: 'Rota não encontrada',
    caminho: req.originalUrl
  });
});

// Inicia o servidor
const servidor = app.listen(PORTA, HOST, () => {
  console.log(`Servidor rodando localmente em http://localhost:${PORTA}`);
  console.log(`Frontend local em http://localhost:${PORTA}/html/index.html`);

  mostrarIpsDaRede();
});

// Tratamento de erro ao iniciar o servidor
servidor.on('error', (erro) => {
  if (erro.code === 'EADDRINUSE') {
    console.error(`Erro: a porta ${PORTA} já está sendo usada.`);
    console.error('Feche outro servidor Node ou use outra porta.');
  } else {
    console.error('Erro ao iniciar o servidor:', erro.message);
  }
});