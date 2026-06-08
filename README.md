# 🏥 X-Triagem - Sistema Hospitalar Interno

Sistema web desenvolvido para uso interno de uma instituição de saúde, com foco no gerenciamento de pacientes e avaliações clínicas relacionadas à triagem da Síndrome do X-Frágil.

O sistema permite que profissionais autorizados cadastrem pacientes, consultem dados, editem informações, realizem avaliações por checklist, acompanhem históricos, gerem relatórios, imprimam registros e visualizem comunicados internos.

---

## 🚀 Funcionalidades

- 🔐 Login com autenticação por JWT
- 👨‍⚕️ Controle de acesso por perfil:
  - **Admin**: médico/diretor
  - **User**: atendente/usuário comum
- 🧑‍⚕️ Cadastro de pacientes
- 🖼️ Cadastro de foto do paciente
- 🔎 Busca de pacientes por nome, CPF e outros dados
- 📄 Visualização completa do perfil do paciente
- ✏️ Edição de pacientes em janela/modal
- 🗑️ Exclusão de pacientes
- 👥 Cadastro, listagem, edição e remoção de usuários
- ✏️ Edição de usuários em janela/modal
- 📋 Checklist clínico com 12 sintomas
- 🧮 Cálculo automático de score
- 📊 Geração automática de recomendação clínica
- 📁 Histórico de avaliações por paciente
- 🧾 Registro de quem cadastrou o paciente
- 🧾 Registro de quem realizou a avaliação
- 📄 Relatórios com filtros
- 🔒 Usuário comum visualiza nos relatórios apenas os registros vinculados à sua permissão
- 🖨️ Opção de impressão de relatórios e históricos
- 📢 Comunicados internos no dashboard
  - Admin pode publicar e excluir avisos
  - Usuários podem visualizar avisos
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
│   ├── resetAdmin.js
│   ├── servidor.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── css/
│   │   ├── imagens/
│   │   └── style.css
│   ├── html/
│   │   ├── index.html
│   │   ├── login.html
│   │   ├── paginas medico/
│   │   │   ├── avaliacao_medico.html
│   │   │   ├── cadastrousuario.html
│   │   │   ├── dashboard_medico.html
│   │   │   ├── historico_medico.html
│   │   │   ├── pacientes_medico.html
│   │   │   ├── questionario_avaliacao.html
│   │   │   ├── relatorios_medico.html
│   │   │   └── usuarios_medico.html
│   │   └── paginas usuario/
│   │       ├── avaliacao_usuario.html
│   │       ├── cadastropaciente_usuario.html
│   │       ├── dashboard_usuario.html
│   │       ├── pacientes_usuario.html
│   │       ├── questionario_avaliacaousuario.html
│   │       └── relatorio_usuario.html
│   └── javascript/
│       └── index.js
│
├── Modelos do Banco de Dados.pdf
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## 📦 Pré-requisitos

Para executar o projeto, é necessário ter instalado:

- Node.js
- npm
- Navegador web

---

## ▶️ Como executar o projeto

Acesse a pasta do backend:

```bash
cd backend
```

Instale as dependências, caso seja a primeira execução:

```bash
npm install
```

Crie ou atualize o usuário administrador:

```bash
node criarAdmin.js
```

Inicie o servidor:

```bash
npm start
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

## 🖥️ Execução para apresentação

Caso o projeto já esteja configurado no computador da apresentação, basta executar:

```bash
cd backend
npm start
```

Depois acesse no navegador:

```txt
http://localhost:3000
```

ou:

```txt
http://localhost:3000/html/index.html
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

## 👥 Perfis de acesso

### Admin

O administrador possui acesso às principais áreas do sistema:

- Dashboard administrativo
- Cadastro de usuários
- Listagem de usuários
- Edição de usuários
- Remoção de usuários
- Cadastro de pacientes
- Listagem de pacientes
- Visualização completa dos pacientes
- Edição de pacientes
- Exclusão de pacientes
- Criação de avaliações
- Histórico de avaliações
- Relatórios
- Impressão de relatórios e históricos
- Publicação de comunicados internos
- Exclusão de comunicados internos

### User

O usuário comum possui acesso às funções operacionais:

- Dashboard do usuário
- Visualização de comunicados internos
- Cadastro de pacientes
- Listagem de pacientes
- Visualização completa dos pacientes
- Edição de pacientes
- Exclusão de pacientes
- Criação de avaliações
- Relatórios vinculados à sua permissão
- Impressão dos registros permitidos

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

Realiza o login e retorna o token JWT.

---

### Usuários

```http
GET /usuarios
POST /usuarios
PUT /usuarios/:id
PATCH /usuarios/:id/perfil
DELETE /usuarios/:id
```

ou:

```http
GET /api/usuarios
POST /api/usuarios
PUT /api/usuarios/:id
PATCH /api/usuarios/:id/perfil
DELETE /api/usuarios/:id
```

Rotas utilizadas para cadastro, listagem, edição, alteração de perfil e remoção de usuários.

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

Rotas utilizadas para cadastro, consulta, edição e exclusão de pacientes.

Ao excluir um paciente, as avaliações vinculadas a ele também são removidas por causa da relação `ON DELETE CASCADE` no banco de dados.

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

Rotas utilizadas para criação de avaliação, consulta de avaliações, histórico por paciente e impressão.

---

### Relatórios

```http
GET /relatorios
POST /relatorios
GET /relatorios/:pacienteId
GET /relatorios/imprimir/:id
```

ou:

```http
GET /api/relatorios
POST /api/relatorios
GET /api/relatorios/:pacienteId
GET /api/relatorios/imprimir/:id
```

Rotas utilizadas para geração, consulta e impressão de relatórios.

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

- `GET`: admin e user podem visualizar os avisos
- `POST`: apenas admin publica avisos
- `DELETE`: apenas admin remove/desativa avisos

---

## 📋 Checklist clínico

O sistema utiliza um checklist com 12 sintomas relacionados à triagem clínica da Síndrome do X-Frágil.

Sintomas avaliados:

1. Deficiência intelectual
2. Face alongada/orelhas
3. Macroorquidismo
4. Hipermobilidade articular
5. Dificuldades de aprendizagem
6. Déficit de atenção
7. Movimentos repetitivos
8. Atraso na fala
9. Hiperatividade
10. Evita contato visual
11. Evita contato físico
12. Agressividade

Cada avaliação gera automaticamente:

- Score da avaliação
- Sintomas marcados
- Limite utilizado no cálculo
- Indicação de suspeita
- Recomendação clínica
- Registro no histórico do paciente
- Registro do profissional que realizou a avaliação

---

## 🧮 Cálculo do score

O score é calculado com base nas respostas marcadas no checklist clínico.

Cada sintoma possui um peso específico, e o sistema calcula automaticamente a pontuação final da avaliação.

O cálculo considera o sexo do paciente:

- Masculino: limite de triagem `0.56`
- Feminino: limite de triagem `0.55`

Quando o score atinge ou ultrapassa o limite definido, o sistema gera a recomendação:

```txt
Encaminhar para teste genético confirmatório
```

Quando o score fica abaixo do limite, o sistema gera a recomendação:

```txt
Acompanhamento clínico
```

O cálculo é feito no arquivo:

```txt
backend/utils/calculoScore.js
```

---

## 📢 Comunicados internos

O sistema possui um mural de comunicados internos integrado ao dashboard.

No perfil **admin**, é possível:

- Publicar avisos
- Inserir título e mensagem
- Visualizar avisos publicados
- Excluir/desativar avisos antigos

No perfil **user**, é possível:

- Visualizar os comunicados internos publicados pela administração
- Acompanhar avisos diretamente pelo dashboard

Essa funcionalidade pode ser usada para informar:

- Reuniões internas
- Mudanças de protocolo
- Manutenções no sistema
- Avisos administrativos
- Orientações para atendentes

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

### Principais relações

- Um usuário pode cadastrar pacientes.
- Um paciente pode possuir várias avaliações.
- Cada avaliação pertence a um paciente.
- Cada avaliação registra o usuário que realizou o atendimento.
- Ao apagar um paciente, suas avaliações são apagadas automaticamente.
- Comunicados internos registram o usuário administrador que os publicou.

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

- Se os dois dispositivos estão na mesma rede
- Se o firewall do Windows permitiu o Node.js
- Se a rede não bloqueia comunicação entre dispositivos
- Se o servidor ainda está rodando no terminal
- Se a porta `3000` está liberada

---

## 🌍 Teste externo opcional com LocalTunnel

Caso seja necessário testar o sistema fora da rede local, é possível gerar um link público temporário com o LocalTunnel.

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

- O terminal do `npm start` precisa continuar aberto
- O terminal do `localtunnel` também precisa continuar aberto
- Se qualquer um dos dois for fechado, o link para de funcionar
- Tudo que for cadastrado pelo link do LocalTunnel será salvo no `banco.db` local da máquina que está rodando o servidor
- O LocalTunnel pode exibir uma tela de segurança pedindo o IP mostrado na própria página antes de liberar o acesso

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

### Criar ou resetar admin

```bash
node criarAdmin.js
```

### Resetar senha do admin

```bash
node resetAdmin.js
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

## 📌 Observações importantes

- O sistema é destinado apenas ao uso interno da instituição.
- Pacientes não possuem acesso ao sistema.
- Apenas usuários autorizados podem acessar as funcionalidades.
- Os resultados servem como apoio à triagem e não substituem diagnóstico médico.
- Os relatórios e históricos podem ser visualizados e impressos pelos profissionais autorizados.
- O banco de dados utilizado é SQLite e fica salvo localmente no arquivo `backend/banco.db`.
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
✅ Cadastro de pacientes  
✅ Cadastro de foto do paciente  
✅ Listagem e busca de pacientes  
✅ Visualização completa dos dados do paciente  
✅ Edição de pacientes em modal  
✅ Exclusão de pacientes  
✅ Cadastro e listagem de usuários  
✅ Edição de usuários em modal  
✅ Remoção de usuários  
✅ Avaliações integradas  
✅ Histórico de avaliações por paciente  
✅ Registro dos sintomas marcados  
✅ Registro de quem cadastrou o paciente  
✅ Registro de quem realizou a avaliação  
✅ Relatórios integrados  
✅ Impressão de relatórios e históricos  
✅ Comunicados internos no dashboard  
✅ Acesso pela rede local/LAN configurado  
✅ Teste externo temporário via LocalTunnel disponível  

---

## 🧑‍🏫 Contexto acadêmico

Projeto desenvolvido para fins acadêmicos na disciplina de Experiência Criativa.

O objetivo é demonstrar a construção de um sistema web com frontend, backend, banco de dados, autenticação, controle de acesso e integração entre as camadas da aplicação.

---

## 👨‍💻 Desenvolvido por

Projeto desenvolvido para fins acadêmicos na PUCPR.