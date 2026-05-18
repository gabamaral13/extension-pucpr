# 🏥 X-Triagem - Sistema Hospitalar Interno

Sistema web desenvolvido para uso interno de uma instituição de saúde, com foco no gerenciamento de pacientes e avaliações clínicas relacionadas à triagem da Síndrome do X-Frágil.

O sistema permite que profissionais autorizados cadastrem pacientes, realizem avaliações por checklist, acompanhem históricos e gerem relatórios para consulta e impressão.

---

## 🚀 Funcionalidades

- 🔐 Login com autenticação por JWT
- 👨‍⚕️ Controle de acesso por perfil:
  - **Admin**: médico/diretor
  - **User**: atendente
- 🧑‍⚕️ Cadastro de pacientes
- 📋 Checklist clínico com 12 sintomas
- 🧮 Cálculo automático de score
- 📊 Geração de recomendação clínica
- 📁 Histórico de avaliações por paciente
- 📄 Relatórios com filtros
- 🖨️ Opção de impressão de relatórios e históricos
- 🌐 Integração entre frontend e backend

---

## 🛠️ Tecnologias utilizadas

### Backend

- Node.js
- Express
- SQLite
- JSON Web Token
- Bcrypt
- CORS

### Frontend

- HTML
- CSS
- JavaScript

---

## 📁 Estrutura do projeto

```bash
extension-pucpr/
├── backend/
│   ├── middleware/
│   │   ├── autenticacao.js
│   │   └── permissao.js
│   ├── rotas/
│   │   ├── authRotas.js
│   │   ├── avaliacaoRotas.js
│   │   ├── pacienteRotas.js
│   │   ├── relatorioRotas.js
│   │   └── usuarioRotas.js
│   ├── utils/
│   │   └── calculoScore.js
│   ├── banco.js
│   ├── criarAdmin.js
│   ├── servidor.js
│   └── package.json
│
├── frontend/
│   ├── css/
│   ├── html/
│   │   ├── index.html
│   │   ├── login.html
│   │   ├── paginas medico/
│   │   └── paginas usuario/
│   └── javascript/
│       └── index.js
│
└── README.md
```

---

## ▶️ Como executar o projeto

Primeiro, acesse a pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie o usuário administrador, caso ainda não exista:

```bash
node criarAdmin.js
```

Depois inicie o servidor:

```bash
npm start
```

O servidor será iniciado em:

```txt
http://localhost:3000
```

Para acessar o sistema, abra no navegador:

```txt
http://localhost:3000/html/index.html
```

Ou direto pela tela de login:

```txt
http://localhost:3000/html/login.html
```

---

## 🔑 Login padrão do administrador

```txt
Usuário: admin
Senha: admin123
```

Caso o administrador já exista no banco, o comando abaixo pode retornar erro de usuário duplicado:

```bash
node criarAdmin.js
```

Isso significa apenas que o usuário admin já foi criado.

---

## 👥 Perfis de acesso

### Admin

O administrador possui acesso às principais áreas do sistema:

- Dashboard administrativo
- Listagem de pacientes
- Criação de avaliações
- Histórico de avaliações
- Relatórios
- Cadastro e listagem de usuários

### User

O usuário comum possui acesso às funções operacionais:

- Dashboard do usuário
- Cadastro de pacientes
- Listagem de pacientes
- Relatórios

---

## 🔗 Principais rotas da API

### Autenticação

```http
POST /auth/login
```

Realiza login e retorna o token JWT.

---

### Usuários

```http
GET /usuarios
POST /usuarios
```

Rotas protegidas para listagem e cadastro de usuários.

---

### Pacientes

```http
GET /pacientes
POST /pacientes
GET /pacientes/:id
```

Rotas para cadastro e consulta de pacientes.

---

### Avaliações

```http
GET /avaliacoes
POST /avaliacoes
GET /avaliacoes/:pacienteId
GET /avaliacoes/imprimir/:id
```

Rotas para criação, consulta, histórico e impressão de avaliações.

---

### Relatórios

```http
GET /relatorios
```

Rota utilizada para geração de dados resumidos e relatórios.

---

## 📋 Checklist clínico

O sistema utiliza um checklist com 12 sintomas relacionados à triagem clínica. Cada avaliação gera automaticamente:

- Score da avaliação
- Quantidade de sintomas marcados
- Recomendação clínica
- Registro no histórico do paciente

---

## 📌 Observações importantes

- O sistema é destinado apenas ao uso interno da instituição.
- Pacientes não possuem acesso ao sistema.
- Apenas usuários autorizados podem acessar as funcionalidades.
- Os resultados servem como apoio à triagem e não substituem diagnóstico médico.
- Os relatórios e históricos podem ser visualizados e impressos pelos profissionais.

---

## 🧪 Status do projeto

✅ Backend estruturado  
✅ Banco de dados SQLite configurado  
✅ Login com JWT funcionando  
✅ Integração inicial entre frontend e backend  
✅ Cadastro e listagem de pacientes  
✅ Cadastro e listagem de usuários  
✅ Avaliações e relatórios integrados  

---

## 👨‍💻 Desenvolvido por

Projeto desenvolvido para fins acadêmicos na disciplina de Experiência Criativa.