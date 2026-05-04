const sqlite3 = require('sqlite3').verbose();

// Cria ou abre o banco
const db = new sqlite3.Database('./banco.db', (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err.message);
  } else {
    console.log("Banco de dados conectado com sucesso");
  }
});

// Criar tabelas
db.serialize(() => {

  // Usuários (admin e atendente)
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      senha TEXT,
      papel TEXT
    )
  `);

  // Pacientes
  db.run(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      data_nascimento TEXT,
      sexo TEXT,
      responsavel TEXT
    )
  `);

  // Avaliações (checklist)
  db.run(`
    CREATE TABLE IF NOT EXISTS avaliacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER,
      usuario_id INTEGER,
      respostas TEXT,
      score REAL,
      recomendacao TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

});

module.exports = db;