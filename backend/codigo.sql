-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS xtriagem_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE xtriagem_db;

-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_usuario VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabela de Pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    sexo ENUM('M', 'F') NOT NULL,
    responsavel VARCHAR(255) NULL, -- Opcional
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Tabela de Sintomas (Catálogo base para o Checklist)
CREATE TABLE IF NOT EXISTS sintomas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    peso_masculino DECIMAL(5,4) NOT NULL, -- Precisão para os pesos específicos
    peso_feminino DECIMAL(5,4) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
);

-- 4. Tabela de Avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    usuario_id INT NOT NULL,
    respostas_checklist JSON NOT NULL, -- Armazena os IDs dos sintomas selecionados e respostas
    score_calculado DECIMAL(5,2) NOT NULL,
    recomendacao VARCHAR(100) NOT NULL, -- Ex: 'Encaminhamento para teste genético', 'Não há indicação'
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Chaves Estrangeiras
    CONSTRAINT fk_avaliacao_paciente 
        FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    CONSTRAINT fk_avaliacao_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- Índices para otimização de consultas (Busca e Relatórios)
CREATE INDEX idx_pacientes_nome ON pacientes(nome);
CREATE INDEX idx_avaliacoes_paciente ON avaliacoes(paciente_id);
CREATE INDEX idx_avaliacoes_data ON avaliacoes(data_avaliacao);
