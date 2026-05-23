# 🏥 X-Triagem - Sistema Hospitalar Interno

Sistema web desenvolvido para uso interno de uma instituição de saúde, com foco no gerenciamento de pacientes e avaliações clínicas relacionadas à triagem da Síndrome do X-Frágil.

O sistema permite que profissionais autorizados cadastrem pacientes, consultem dados, editem informações, realizem avaliações por checklist, acompanhem históricos, gerem relatórios e publiquem comunicados internos.

---

## 🚀 Funcionalidades

- 🔐 Login com autenticação por JWT
- 👨‍⚕️ Controle de acesso por perfil:
  - **Admin**: médico/diretor
  - **User**: atendente
- 🧑‍⚕️ Cadastro de pacientes
- 🔎 Visualização completa dos dados do paciente
- ✏️ Edição de informações do paciente
- 🗑️ Exclusão de pacientes
- 👥 Cadastro e listagem de usuários
- 📢 Comunicados internos:
  - Admin pode publicar e excluir avisos
  - Usuários podem visualizar os avisos no dashboard
- 📋 Checklist clínico com 12 sintomas
- 🧮 Cálculo automático de score
- 📊 Geração de recomendação clínica
- 📁 Histórico de avaliações por paciente
- 📄 Relatórios com filtros
- 🖨️ Opção de impressão de relatórios e históricos
- 🌐 Integração entre frontend e backend
- 📡 Acesso pela rede local/LAN
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
│   │   ├── avisoRotas.js
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

## 🌐 Acesso pela rede local / LAN

O servidor está configurado para aceitar conexões externas na rede local usando:

```js
0.0.0.0
```

Ao iniciar o servidor com:

```bash
npm start
```

o terminal exibirá links de acesso parecidos com:

```txt
http://192.168.x.x:3000
http://192.168.x.x:3000/html/index.html
http://192.168.x.x:3000/api/status
```

Esses links podem ser usados por outros dispositivos conectados na mesma rede Wi-Fi ou cabo.

Exemplo:

```txt
http://SEU-IP:3000/html/index.html
```

Observação: se aparecer mais de um IP, use o IP da rede principal, normalmente parecido com:

```txt
192.168.0.x
192.168.1.x
192.168.18.x
```

IPs como `192.168.56.x` geralmente são de adaptadores virtuais, como VirtualBox, VMware ou redes internas, e normalmente não devem ser usados para acesso por outro dispositivo.

Caso outro dispositivo não consiga acessar, verifique:

- Se os dois dispositivos estão na mesma rede;
- Se o firewall do Windows permitiu o Node.js;
- Se a rede não bloqueia comunicação entre dispositivos;
- Se o servidor ainda está rodando no terminal.

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
- Cadastro e listagem de usuários
- Cadastro e listagem de pacientes
- Visualização dos dados completos dos pacientes
- Edição de informações dos pacientes
- Exclusão de pacientes
- Criação de avaliações
- Histórico de avaliações
- Relatórios
- Impressão de relatórios e históricos
- Publicação e exclusão de comunicados internos

### User

O usuário comum possui acesso às funções operacionais:

- Dashboard do usuário
- Cadastro de pacientes
- Listagem de pacientes
- Visualização dos dados completos dos pacientes
- Edição de informações dos pacientes
- Exclusão de pacientes
- Criação de avaliações
- Relatórios
- Visualização dos comunicados internos

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
POST /api/auth/login
```

Realiza login e retorna o token JWT.

---

### Usuários

```http
GET /usuarios
POST /usuarios
GET /api/usuarios
POST /api/usuarios
```

Rotas protegidas para listagem e cadastro de usuários.

Apenas usuários com perfil **admin** podem cadastrar e listar usuários.

---

### Pacientes

```http
GET /pacientes
POST /pacientes
GET /pacientes/:id
PUT /pacientes/:id
DELETE /pacientes/:id
```

ou:

```http
GET /api/pacientes
POST /api/pacientes
GET /api/pacientes/:id
PUT /api/pacientes/:id
DELETE /api/pacientes/:id
```

Rotas para cadastro, consulta, edição e exclusão de pacientes.

Observação: ao excluir um paciente, as avaliações vinculadas a ele também são removidas por causa da relação com `ON DELETE CASCADE` no banco de dados.

---

### Avaliações

```http
GET /avaliacoes
POST /avaliacoes
GET /avaliacoes/:pacienteId
GET /avaliacoes/imprimir/:id
```

ou:

```http
GET /api/avaliacoes
POST /api/avaliacoes
GET /api/avaliacoes/:pacienteId
GET /api/avaliacoes/imprimir/:id
```

Rotas para criação, consulta, histórico e impressão de avaliações.

---

### Relatórios

```http
GET /relatorios
GET /api/relatorios
```

Rota utilizada para geração de dados resumidos e relatórios.

---

### Comunicados internos

```http
GET /avisos
POST /avisos
DELETE /avisos/:id
```

ou:

```http
GET /api/avisos
POST /api/avisos
DELETE /api/avisos/:id
```

Rotas utilizadas para o mural de comunicados internos.

- `GET`: admin e user podem visualizar os avisos.
- `POST`: apenas admin pode publicar avisos.
- `DELETE`: apenas admin pode excluir/desativar avisos.

---

## 📋 Checklist clínico

O sistema utiliza um checklist com 12 sintomas relacionados à triagem clínica da Síndrome do X-Frágil.

Cada avaliação gera automaticamente:

- Score da avaliação;
- Quantidade de sintomas marcados;
- Limite utilizado no cálculo;
- Indicação de suspeita;
- Recomendação clínica;
- Registro no histórico do paciente.

---

## 🧮 Cálculo do score

O score é calculado com base nas respostas marcadas no checklist clínico.

Cada sintoma possui um peso específico, e o sistema calcula automaticamente a pontuação final da avaliação.

A recomendação clínica é gerada de acordo com o score obtido e os critérios definidos no backend.

O cálculo é feito no arquivo:

```txt
backend/utils/calculoScore.js
```

---

## 📢 Comunicados internos

O sistema possui um mural de comunicados internos integrado ao dashboard.

No perfil **admin**, é possível:

- Publicar avisos;
- Inserir título e mensagem;
- Visualizar os avisos publicados;
- Excluir/desativar avisos antigos.

No perfil **user**, é possível:

- Visualizar os comunicados internos publicados pela administração;
- Acompanhar avisos importantes diretamente pelo dashboard.

Essa funcionalidade pode ser usada para informar:

- Reuniões internas;
- Mudanças de protocolo;
- Manutenções no sistema;
- Avisos administrativos;
- Orientações para atendentes.

---

## 🗄️ Banco de dados

O sistema utiliza SQLite como banco de dados local.

O arquivo do banco fica em:

```txt
backend/banco.db
```

As principais tabelas são:

- `usuarios`
- `pacientes`
- `avaliacoes`
- `avisos`

O arquivo responsável por criar e atualizar as tabelas é:

```txt
backend/banco.js
```

---

## 📌 Observações importantes

- O sistema é destinado apenas ao uso interno da instituição.
- Pacientes não possuem acesso ao sistema.
- Apenas usuários autorizados podem acessar as funcionalidades.
- Os resultados servem como apoio à triagem e não substituem diagnóstico médico.
- Os relatórios e históricos podem ser visualizados e impressos pelos profissionais.
- O banco de dados utilizado é SQLite e fica salvo localmente no arquivo `banco.db`.
- Ao testar com LocalTunnel, os dados cadastrados por outros usuários são salvos no banco local da máquina que está executando o servidor.
- Ao apagar um paciente, as avaliações vinculadas a ele também são removidas.
- O sistema deve ser executado com o backend ativo para que login, cadastros, avaliações, relatórios e avisos funcionem corretamente.

---

## 🧪 Status do projeto

✅ Backend estruturado  
✅ Banco de dados SQLite configurado  
✅ Login com JWT funcionando  
✅ Controle de acesso por perfil  
✅ Integração entre frontend e backend  
✅ Cadastro e listagem de pacientes  
✅ Visualização de dados completos dos pacientes  
✅ Edição de pacientes  
✅ Exclusão de pacientes  
✅ Cadastro e listagem de usuários  
✅ Avaliações integradas  
✅ Histórico de avaliações  
✅ Relatórios integrados  
✅ Impressão de relatórios e históricos  
✅ Comunicados internos no dashboard  
✅ Acesso pela rede local/LAN configurado  
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

### Testar pela rede local

```txt
http://SEU-IP:3000/html/index.html
```


## 🌍 Teste externo opcional com LocalTunnel

Caso seja necessário testar o sistema fora da rede local, é possível gerar um link público temporário com o LocalTunnel.

Com o servidor rodando em um terminal:

```bash
npm start
```

Em outro terminal, execute o comando abaixo:

```bash
npx localtunnel --port 3000 --local-host 127.0.0.1
```

O LocalTunnel irá gerar um link temporário, que pode ser usado para acessar o sistema externamente.

Observação: essa etapa é opcional. Para uso normal na mesma rede, basta utilizar o IP local exibido pelo servidor.


---

## 🧹 Observação sobre entrega

Para enviar o projeto em ZIP, não é necessário incluir a pasta:

```txt
node_modules
```

Quem baixar o projeto pode instalar as dependências novamente com:

```bash
npm install
```

Também é recomendado manter o arquivo `.gitignore` configurado para ignorar:

```txt
node_modules
.env
```

---

## 🧑‍🏫 Contexto acadêmico

Projeto desenvolvido para fins acadêmicos na disciplina de Experiência Criativa.

O objetivo é demonstrar a construção de um sistema web com frontend, backend, banco de dados, autenticação, controle de acesso e integração entre as camadas da aplicação.

---

## 👨‍💻 Desenvolvido por

Projeto desenvolvido para fins acadêmicos na PUCPR.