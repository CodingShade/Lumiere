# Lumiere

Aplicação web para agendamento de ensaios fotográficos, construída com Next.js 16 (App Router), React, TypeScript, Tailwind CSS e Supabase.

## Requisitos

- Node.js 22 ou superior.
- Um projeto Supabase.

## Configuração local

No terminal, entre na pasta do app e instale as dependências:

```powershell
cd lumiere
npm install
```

Crie `.env.local` a partir do exemplo e configure a URL do projeto e uma chave pública:

```powershell
Copy-Item .env.example .env.local
```

Use `NEXT_PUBLIC_SUPABASE_URL` e uma das chaves aceitas:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — formato publishable atual do Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — formato anon legado.

O arquivo `.env.local` é ignorado pelo Git. Nunca adicione nele uma chave `service_role` ou outra chave secreta.

## Preparar o banco Supabase

No SQL Editor do projeto, execute os arquivos nesta ordem:

1. [`supabase/schema.sql`](./supabase/schema.sql): extensões, enums, tabelas, índices de exclusão de conflito de horário, trigger de perfil, função de papel atual, grants e policies RLS.
2. [`supabase/functions.sql`](./supabase/functions.sql): RPCs transacionais para cadastrar/excluir fotógrafos e atualizar/restaurar o papel associado.
3. [`supabase/seed.sql`](./supabase/seed.sql), opcional: três serviços e dois locais para demonstração.

Se o schema já tiver sido aplicado antes das correções atuais, execute também [`supabase/fixes.sql`](./supabase/fixes.sql) para permitir locais externos sem endereço e atualizar o fallback do trigger de novos usuários.

Em **Authentication → URL Configuration**, configure `http://localhost:3000` como URL local e permita `http://localhost:3000/auth/callback` como URL de redirecionamento. Para testar confirmação de e-mail, use uma caixa de entrada acessível; em desenvolvimento, a confirmação também pode ser desabilitada nas opções do provedor de e-mail do Supabase.

Inicie o servidor local:

```powershell
npm run dev
```

O app fica disponível em <http://localhost:3000>.

## Contas e papéis

O cadastro público cria contas pelo Supabase Auth. O trigger de `schema.sql` cria o perfil associado com papel `cliente`. Para promover uma conta de teste a administradora, depois de cadastrá-la, execute no SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where email = 'SEU_EMAIL'
);
```

Depois de alterar o papel, entre novamente no app para atualizar a sessão.

## Funcionalidades implementadas

- Landing page em português, que carrega os serviços ativos do Supabase.
- Cadastro, login com senha, logout e callback de confirmação de e-mail.
- Proxy do Next.js 16 para atualizar a sessão e proteger rotas por papel.
- Interface base responsiva, componentes compartilhados, estados de carregamento/erro/404 e formulários acessíveis.
- CRUD de serviços em `/admin/servicos`, com validação Zod no servidor e no formulário, listagem responsiva, modal, feedback e bloqueio de exclusão quando existem agendamentos vinculados.
- CRUD de locais em `/admin/locais`, com endereço obrigatório para estúdios e validação no servidor.
- CRUD de fotógrafos em `/admin/fotografos`, com seleção de perfis de cliente disponíveis, validação de portfólio e alteração/restauração transacional do papel do perfil por RPC.
- Solicitação de agendamento por clientes em `/agendamentos/novo`: opções ativas do Supabase, cálculo da duração pelo serviço, horário de Brasília e feedback para horários conflitantes ou indisponíveis.
- Schemas SQL com RLS para os papéis previstos e dados de demonstração opcionais.

## Estrutura principal

- `src/app`: rotas públicas, áreas autenticadas, páginas administrativas e callback de autenticação.
- `src/actions`: Server Actions de autenticação e operações do domínio.
- `src/components/admin` e `src/components/crud`: telas administrativas e peças compartilhadas dos CRUDs.
- `src/components/forms` e `src/components/ui`: formulários e componentes reutilizáveis.
- `src/lib`: clientes Supabase, autenticação, validações Zod e utilitários.
- `src/proxy.ts`: renovação da sessão e redirecionamentos de acesso para Next.js 16.
- `src/types/database.ts`: tipos das entidades e RPCs do banco.
- `supabase`: schema, funções transacionais e seed.

## Próximos passos

- Completar listagens, edição e cancelamento de agendamentos e construir a visualização de agenda do fotógrafo.
- Implementar o CRUD administrativo de usuários e completar as telas de dashboard e detalhe de agendamento.
- Adicionar testes automatizados para formulários, permissões e operações no Supabase.

## Comandos

```powershell
npm run dev
npm run lint
npm run build
npm start
```
