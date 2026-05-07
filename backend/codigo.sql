const sqlite3 = require('sqlite3').verbose();

// Cria ou abre o banco
const db = new sqlite3.Database('./banco.db', (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err.message);
  } else {
    console.log("Banco de dados conectado com sucesso");
    // É fundamental ativar as chaves estrangeiras no SQLite, pois vêm desativadas por padrão
    db.run("PRAGMA foreign_keys = ON;");
  }
});

// Criar tabelas
db.serialize(() => {

  // 1. Tabela de Usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_usuario TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      tipo TEXT CHECK(tipo IN ('admin', 'user')) NOT NULL DEFAULT 'user',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Tabela de Pacientes
  db.run(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      data_nascimento TEXT NOT NULL, -- Formato esperado: YYYY-MM-DD
      sexo TEXT CHECK(sexo IN ('M', 'F')) NOT NULL,
      responsavel TEXT, -- Opcional
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Tabela de Sintomas (Catálogo base para o Checklist)
  db.run(`
    CREATE TABLE IF NOT EXISTS sintomas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT NOT NULL,
      peso_masculino REAL NOT NULL,
      peso_feminino REAL NOT NULL,
      ativo INTEGER DEFAULT 1 -- 1 para true, 0 para false no SQLite
    )
  `);

  // 4. Tabela de Avaliações
  db.run(`
    CREATE TABLE IF NOT EXISTS avaliacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      respostas_checklist TEXT NOT NULL, -- Armazenar como string JSON
      score_calculado REAL NOT NULL,
      recomendacao TEXT NOT NULL,
      data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
    )
  `);

  // (Opcional) Criação de Índices para otimizar as buscas citadas nos requisitos
  db.run(`CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_avaliacoes_paciente ON avaliacoes(paciente_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_avaliacoes_data ON avaliacoes(data_avaliacao)`);

});

module.exports = db;
