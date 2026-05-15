const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

// Importa o banco
require('./banco');

// Middlewares
app.use(cors());
app.use(express.json());

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
const PORTA = 3000;

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
  console.log(`Frontend disponível em http://localhost:${PORTA}/html/index.html`);
});