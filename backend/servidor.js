const express = require('express');
const app = express();
const cors = require('cors');

// Importa o banco (só pra garantir que inicialize)
require('./banco');

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/auth', require('./rotas/authRotas'));
app.use('/usuarios', require('./rotas/usuarioRotas'));
app.use('/pacientes', require('./rotas/pacienteRotas'));
app.use('/avaliacoes', require('./rotas/avaliacaoRotas'));
app.use('/relatorios', require('./rotas/relatorioRotas'));

// Rota teste
app.get('/', (req, res) => {
  res.send("API do sistema hospitalar rodando 🚀");
});

// Porta
const PORTA = 3000;

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});