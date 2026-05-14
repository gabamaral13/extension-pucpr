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

  // ==================================================
  // TABELA: USUARIOS
  // ==================================================
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,

      nome_usuario TEXT NOT NULL UNIQUE,

      email TEXT NOT NULL UNIQUE,

      senha TEXT NOT NULL,

      tipo_acesso TEXT NOT NULL
      CHECK (tipo_acesso IN ('admin', 'user'))
      DEFAULT 'user',

      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ==================================================
  // TABELA: PACIENTES
  // ==================================================
  db.run(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id_paciente INTEGER PRIMARY KEY AUTOINCREMENT,

      nome TEXT NOT NULL,

      data_nascimento DATE NOT NULL,

      sexo TEXT NOT NULL
      CHECK (sexo IN ('M', 'F')),

      cpf TEXT UNIQUE,

      nome_responsavel TEXT,

      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ==================================================
  // TABELA: SINTOMAS
  // ==================================================
  db.run(`
    CREATE TABLE IF NOT EXISTS sintomas (
      id_sintoma INTEGER PRIMARY KEY AUTOINCREMENT,

      nome TEXT NOT NULL,

      descricao TEXT,

      peso_masculino REAL NOT NULL,

      peso_feminino REAL NOT NULL
    )
  `);

  // ==================================================
  // TABELA: AVALIACOES
  // ==================================================
  db.run(`
    CREATE TABLE IF NOT EXISTS avaliacoes (
      id_avaliacao INTEGER PRIMARY KEY AUTOINCREMENT,

      id_paciente INTEGER NOT NULL,

      id_usuario INTEGER NOT NULL,

      score_final REAL NOT NULL,

      ponto_corte REAL NOT NULL,

      recomendacao TEXT NOT NULL,

      data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (id_paciente)
      REFERENCES pacientes(id_paciente)
      ON DELETE CASCADE,

      FOREIGN KEY (id_usuario)
      REFERENCES usuarios(id_usuario)
      ON DELETE RESTRICT
    )
  `);

  // ==================================================
  // TABELA: RESPOSTAS_AVALIACAO
  // ==================================================
  db.run(`
    CREATE TABLE IF NOT EXISTS respostas_avaliacao (
      id_resposta INTEGER PRIMARY KEY AUTOINCREMENT,

      id_avaliacao INTEGER NOT NULL,

      id_sintoma INTEGER NOT NULL,

      presente INTEGER NOT NULL
      CHECK (presente IN (0,1)),

      peso_utilizado REAL NOT NULL,

      FOREIGN KEY (id_avaliacao)
      REFERENCES avaliacoes(id_avaliacao)
      ON DELETE CASCADE,

      FOREIGN KEY (id_sintoma)
      REFERENCES sintomas(id_sintoma)
      ON DELETE RESTRICT
    )
  `);

  // ==================================================
  // ÍNDICES
  // ==================================================

  // Pacientes
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_pacientes_nome
    ON pacientes(nome)
  `);

  // Avaliações por paciente
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_avaliacoes_paciente
    ON avaliacoes(id_paciente)
  `);

  // Avaliações por usuário
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario
    ON avaliacoes(id_usuario)
  `);

  // Avaliações por data
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_avaliacoes_data
    ON avaliacoes(data_avaliacao)
  `);

  // Respostas por avaliação
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_respostas_avaliacao
    ON respostas_avaliacao(id_avaliacao)
  `);

  // Respostas por sintoma
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_respostas_sintoma
    ON respostas_avaliacao(id_sintoma)
  `);

});

module.exports = db;
