const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "banco.db"), (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err.message);
  } else {
    console.log("Banco de dados conectado com sucesso");
    db.run("PRAGMA foreign_keys = ON;");
  }
});

// ==================================================
// FUNÇÕES AUXILIARES
// ==================================================

// Adiciona coluna sem quebrar se ela já existir
function adicionarColuna(tabela, coluna, definicao) {
  db.run(`ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${definicao}`, (err) => {
    if (err) {
      if (err.message.includes("duplicate column name")) {
        return;
      }


    console.log(`Coluna ${coluna} adicionada na tabela ${tabela}`);
  });
}

// Migração para corrigir bancos antigos que tinham nome_usuario/tipo_acesso
function migrarTabelaUsuarios() {
  db.all("PRAGMA table_info(usuarios)", (err, colunas) => {
    if (err) {
      console.error("Erro ao verificar tabela usuarios:", err.message);
      return;
    }

    const nomesColunas = colunas.map((coluna) => coluna.name);

    const temUsername = nomesColunas.includes("username");
    const temPapel = nomesColunas.includes("papel");
    const temNomeUsuario = nomesColunas.includes("nome_usuario");
    const temTipoAcesso = nomesColunas.includes("tipo_acesso");

    if (!temUsername) {
      adicionarColuna("usuarios", "username", "TEXT");
    }

    if (!temPapel) {
      adicionarColuna("usuarios", "papel", "TEXT DEFAULT 'user'");
    }

    // Copia nome_usuario para username em bancos antigos
    if (!temUsername && temNomeUsuario) {
      db.run(
        `
        UPDATE usuarios
        SET username = nome_usuario
        WHERE username IS NULL
      `,
        (err) => {
          if (err) {
      );
    }

    // Copia tipo_acesso para papel em bancos antigos
    if (!temPapel && temTipoAcesso) {
      db.run(
        `
        UPDATE usuarios
        SET papel = tipo_acesso
        WHERE papel IS NULL
      `,
        (err) => {
          if (err) {
      );
    }

    // Garante que usuários sem papel fiquem como user
    db.run(
      `
      UPDATE usuarios
      SET papel = 'user'
      WHERE papel IS NULL OR papel NOT IN ('admin', 'user')
    );
  });
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

  // Corrige bancos antigos que tinham nome_usuario/tipo_acesso
  migrarTabelaUsuarios();

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
  adicionarColuna("pacientes", "cep", "TEXT");
  adicionarColuna("pacientes", "estado", "TEXT");
  adicionarColuna("pacientes", "cidade", "TEXT");
  adicionarColuna("pacientes", "responsavel", "TEXT");

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