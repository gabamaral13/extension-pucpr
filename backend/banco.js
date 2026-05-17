const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'banco.db'), (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err.message);
  } else {
    console.log("Banco de dados conectado com sucesso");
    db.run("PRAGMA foreign_keys = ON;");
  }
});

// Adiciona coluna sem quebrar se ela já existir
function adicionarColuna(tabela, coluna, definicao) {
  db.run(
    `ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${definicao}`,
    (err) => {
      if (err) {
        if (err.message.includes('duplicate column name')) {
          // Coluna já existe, então está tudo certo
          return;
        }

        console.error(`Erro ao adicionar coluna ${coluna}:`, err.message);
        return;
      }

      console.log(`Coluna ${coluna} adicionada na tabela ${tabela}`);
    }
  );
}

db.serialize(() => {
  // ==================================================
  // TABELA: USUARIOS
  // ==================================================
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      papel TEXT CHECK(papel IN ('admin', 'user')) NOT NULL DEFAULT 'user',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ==================================================
  // TABELA: PACIENTES
  // ==================================================
  db.run(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      nome TEXT NOT NULL,
      data_nascimento TEXT NOT NULL,
      sexo TEXT CHECK(sexo IN ('M', 'F')) NOT NULL,

      cep TEXT,
      estado TEXT,
      cidade TEXT,
      responsavel TEXT,

      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migração para bancos antigos
  // Se a tabela já existia sem essas colunas, elas serão adicionadas.
  adicionarColuna('pacientes', 'cep', 'TEXT');
  adicionarColuna('pacientes', 'estado', 'TEXT');
  adicionarColuna('pacientes', 'cidade', 'TEXT');
  adicionarColuna('pacientes', 'responsavel', 'TEXT');

  // ==================================================
  // TABELA: AVALIACOES
  // ==================================================
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

  // ==================================================
  // ÍNDICES
  // ==================================================
  db.run(`CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_avaliacoes_paciente ON avaliacoes(paciente_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario ON avaliacoes(usuario_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_avaliacoes_data ON avaliacoes(criado_em)`);
});

module.exports = db;