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
- 👥 Cadastro e listagem de usuários
- 📋 Checklist clínico com 12 sintomas
- 🧮 Cálculo automático de score
- 📊 Geração de recomendação clínica
- 📁 Histórico de avaliações por paciente
- 📄 Relatórios com filtros
- 🖨️ Opção de impressão de relatórios e históricos
- 🌐 Integração entre frontend e backend
- 🌍 Possibilidade de teste externo usando LocalTunnel

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
│   ├── banco.db
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

## ▶️ Como executar o projeto localmente

Primeiro, acesse a pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie ou atualize o usuário administrador:

```bash
node criarAdmin.js
```

Depois inicie o servidor:

```bash
npm start
```

ou:

```bash
node servidor.js
```

O servidor será iniciado em:

```txt
http://localhost:3000
```

Para acessar o sistema, abra no navegador:

```txt
http://localhost:3000
```

ou:

```txt
http://localhost:3000/html/index.html
```

Também é possível acessar direto pela tela de login:

```txt
http://localhost:3000/html/login.html
```

---

## 🔎 Teste rápido da API

Com o servidor rodando, acesse:

```txt
http://localhost:3000/api/status
```

Resposta esperada:

```json
{
  "mensagem": "API do sistema hospitalar rodando 🚀"
}
```

---

## 🔑 Login padrão do administrador

```txt
Usuário: admin
Senha: admin123
```

O comando abaixo cria o administrador caso ele ainda não exista:

```bash
node criarAdmin.js
```

Caso o administrador já exista, o script atualiza/reseta a senha do admin para:

```txt
admin123
```

---

## 🌐 Acesso pela rede local

O servidor está configurado para aceitar conexões externas na rede local usando:

```js
0.0.0.0
```

Ao iniciar o servidor, serão exibidos links parecidos com:

```txt
http://192.168.x.x:3000
http://172.x.x.x:3000
```

Esses links podem ser usados por outros dispositivos conectados na mesma rede.

Exemplo:

```txt
http://SEU-IP:3000
```

ou:

```txt
http://SEU-IP:3000/api/status
```

Observação: em redes de faculdade, empresa ou alguns hotspots de celular, pode existir bloqueio entre dispositivos. Nesse caso, mesmo estando na mesma rede, outro computador pode não conseguir acessar o servidor local.

---

## 🌍 Teste externo com LocalTunnel

Quando a rede local bloquear o acesso entre computadores, é possível usar o LocalTunnel para criar um link público temporário.

Primeiro, deixe o servidor rodando:

```bash
npm start
```

Depois, em outro terminal, execute:

```bash
npx localtunnel --port 3000 --local-host 127.0.0.1
```

O terminal irá gerar um link parecido com:

```txt
https://exemplo.loca.lt
```

Esse link pode ser enviado para outra pessoa testar o sistema.

Para testar a API pelo LocalTunnel:

```txt
https://exemplo.loca.lt/api/status
```

Para acessar o sistema:

```txt
https://exemplo.loca.lt
```

ou:

```txt
https://exemplo.loca.lt/html/index.html
```

Importante:

- O terminal do `npm start` precisa continuar aberto.
- O terminal do `localtunnel` também precisa continuar aberto.
- Se qualquer um dos dois for fechado, o link para de funcionar.
- Tudo que for cadastrado pelo link do LocalTunnel será salvo no `banco.db` local da máquina que está rodando o servidor.
- O LocalTunnel pode exibir uma tela de segurança pedindo o IP mostrado na própria página antes de liberar o acesso.

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

### Status da API

```http
GET /api/status
```

Verifica se a API está rodando corretamente.

---

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

O sistema utiliza um checklist com 12 sintomas relacionados à triagem clínica da Síndrome do X-Frágil.

Cada avaliação gera automaticamente:

- Score da avaliação
- Quantidade de sintomas marcados
- Recomendação clínica
- Registro no histórico do paciente

---

## 🧮 Cálculo do score

O score é calculado com base nas respostas marcadas no checklist clínico.

Cada sintoma possui um peso específico, e o sistema calcula automaticamente a pontuação final da avaliação.

A recomendação clínica é gerada de acordo com o score obtido e os critérios definidos no backend.

---

## 📌 Observações importantes

- O sistema é destinado apenas ao uso interno da instituição.
- Pacientes não possuem acesso ao sistema.
- Apenas usuários autorizados podem acessar as funcionalidades.
- Os resultados servem como apoio à triagem e não substituem diagnóstico médico.
- Os relatórios e históricos podem ser visualizados e impressos pelos profissionais.
- O banco de dados utilizado é SQLite e fica salvo localmente no arquivo `banco.db`.
- Ao testar com LocalTunnel, os dados cadastrados por outros usuários são salvos no banco local da máquina que está executando o servidor.

---

## 🧪 Status do projeto

✅ Backend estruturado  
✅ Banco de dados SQLite configurado  
✅ Login com JWT funcionando  
✅ Controle de acesso por perfil  
✅ Integração entre frontend e backend  
✅ Cadastro e listagem de pacientes  
✅ Cadastro e listagem de usuários  
✅ Avaliações integradas  
✅ Histórico de avaliações  
✅ Relatórios integrados  
✅ Impressão de relatórios e históricos  
✅ Acesso externo temporário via LocalTunnel testado  

---

## 🧑‍💻 Comandos úteis

### Entrar na pasta do backend

```bash
cd backend
```

### Instalar dependências

```bash
npm install
```

### Criar/resetar admin

```bash
node criarAdmin.js
```

### Rodar servidor

```bash
npm start
```

ou:

```bash
node servidor.js
```

### Testar API localmente

```txt
http://localhost:3000/api/status
```

### Gerar link público temporário

```bash
npx localtunnel --port 3000 --local-host 127.0.0.1
```

---

## 🧑‍🏫 Contexto acadêmico

Projeto desenvolvido para fins acadêmicos na disciplina de Experiência Criativa.

O objetivo é demonstrar a construção de um sistema web com frontend, backend, banco de dados, autenticação, controle de acesso e integração entre as camadas da aplicação.

---

## 👨‍💻 Desenvolvido por

Projeto desenvolvido para fins acadêmicos na PUCPR.