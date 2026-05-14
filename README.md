# 🏥 Sistema Hospitalar Interno

Sistema web desenvolvido para uso interno de uma instituição de saúde, permitindo o gerenciamento de pacientes e avaliações clínicas com base em um checklist de sintomas.

---

## 🚀 Funcionalidades

* 🔐 Autenticação com login e senha (JWT)
* 👨‍⚕️ Controle de acesso por perfil:

  * Admin (médico/diretor)
  * Atendente
* 🧑‍⚕️ Cadastro de pacientes
* 📋 Checklist com 12 sintomas
* 🧮 Cálculo automático de score ponderado
* 📊 Geração de recomendação clínica
* 📁 Histórico de avaliações por paciente
* 📄 Relatórios com filtros

---

## 🛠️ Tecnologias utilizadas

* Node.js
* Express
* SQLite
* JSON Web Token (JWT)
* Bcrypt

---

## ▶️ Como executar o projeto

```bash
cd backend
npm install
npm start
```

---

## 📌 Observações

* O sistema é de uso interno da instituição.
* Pacientes não possuem acesso ao sistema.
* Os resultados são gerados para visualização e impressão pelos profissionais.

---

## 📁 Estrutura do projeto

```bash
backend/
  ├── middleware/
  ├── rotas/
  ├── utils/
  ├── banco.js
  ├── servidor.js
  └── package.json

frontend/
```
