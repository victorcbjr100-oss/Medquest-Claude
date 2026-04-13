# MedQuest Pro

Plataforma de questões para preparação em residência médica.

## Estrutura de arquivos

```
/
├── index.html              ← Login e cadastro
├── dashboard.html          ← Página inicial do usuário
├── temas.html              ← Especialidades e subtemas
├── questoes.html           ← Banco de questões com filtros
├── simulado.html           ← Simulado cronometrado
├── estatisticas.html       ← Painel de métricas completo
├── favoritas.html          ← Questões favoritadas
├── caderno.html            ← Caderno de questões e anotações
├── perfil.html             ← Perfil do usuário
├── admin-questoes.html     ← Admin: gerenciar questões
├── sql_setup.sql           ← Script SQL para o Supabase
├── css/
│   └── style.css           ← Estilos globais
└── js/
    ├── supabase.js         ← Cliente Supabase
    ├── auth.js             ← Helpers de autenticação
    └── sidebar.js          ← Sidebar dinâmica
```

## Como configurar

### 1. Supabase

1. Acesse [supabase.com](https://supabase.com) e abra seu projeto
2. Vá em **SQL Editor** e execute todo o conteúdo de `sql_setup.sql`
3. As tabelas, políticas RLS e trigger de perfil serão criados automaticamente

### 2. GitHub Pages (ou qualquer hosting estático)

1. Faça upload de todos os arquivos para um repositório GitHub
2. Ative GitHub Pages em **Settings → Pages → Deploy from branch (main)**
3. Acesse o site pelo link gerado

### 3. Tornar-se administrador

Após criar sua conta no site, execute no Supabase SQL Editor:

```sql
update perfis set role = 'admin' where id = '<seu-uuid>';
```

Seu UUID está em: **Supabase → Authentication → Users**

Como admin, você terá acesso à seção "Admin" na sidebar e poderá:
- Adicionar/editar/excluir questões em `admin-questoes.html`

### 4. Estrutura das questões no banco

| Campo       | Tipo   | Descrição                                    |
|-------------|--------|----------------------------------------------|
| pergunta    | text   | Enunciado completo da questão                |
| opcoes      | jsonb  | Array JSON: `["Opção A", "Opção B", ...]`    |
| resposta    | int    | Índice da opção correta (0 = A, 1 = B...)    |
| tema        | text   | Especialidade: "Cardiologia", "Pediatria"... |
| subtema     | text   | Subtema: "Hipertensão", "Asma"...            |
| dificuldade | text   | "facil", "media" ou "dificil"                |
| banca       | text   | Ex: "USP", "FMUSP", "UERJ"                   |
| ano         | int    | Ano da prova de origem                        |
| comentario  | text   | Gabarito comentado (HTML permitido)           |

## Funcionalidades

- ✅ Login e cadastro com Supabase Auth
- ✅ Banco de questões por especialidade e subtema
- ✅ Filtros por tema, subtema, dificuldade e banca
- ✅ Gabarito comentado após responder
- ✅ Favoritar questões
- ✅ Comentários nas questões
- ✅ Simulado cronometrado com embaralhamento
- ✅ Estatísticas completas: donut chart, gráfico de progresso, calendário de atividades, áreas para melhorar
- ✅ Caderno com questões salvas e anotações
- ✅ Perfil com dados acadêmicos
- ✅ Painel admin para gerenciar questões
- ✅ Sidebar com detecção automática de admin
