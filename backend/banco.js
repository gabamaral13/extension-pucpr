const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./banco.db', (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err.message);
  } else {
    console.log("Banco de dados conectado com sucesso");
    db.run("PRAGMA foreign_keys = ON;");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      papel TEXT CHECK(papel IN ('admin', 'user')) NOT NULL DEFAULT 'user',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      data_nascimento TEXT NOT NULL,
      sexo TEXT CHECK(sexo IN ('M', 'F')) NOT NULL,
      responsavel TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS avaliacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      respostas TEXT NOT NULL,
      score REAL NOT NULL,
      recomendacao TEXT NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_avaliacoes_paciente ON avaliacoes(paciente_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario ON avaliacoes(usuario_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_avaliacoes_data ON avaliacoes(criado_em)`);
});

module.exports = db;