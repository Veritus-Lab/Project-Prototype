# Configuração do Supabase

Esta etapa usa uma migration inicial multi-tenant com RLS. A migration é **forward-only**: depois de aplicada em qualquer ambiente compartilhado, não edite `202608180001_initial_schema.sql`. Correções devem ser novas migrations.

## Pré-requisitos

- Node.js na versão declarada em `package.json`;
- Docker em execução para o Supabase local;
- Supabase CLI instalada e autenticada somente quando um projeto remoto for usado;
- um projeto Supabase vazio para a implantação greenfield.

Não use a chave `service_role` no navegador, em variáveis `NEXT_PUBLIC_*` ou nos testes da aplicação. Ela ignora RLS.

## Variáveis da aplicação

Copie `.env.example` para `.env.local` e preencha apenas os valores públicos exibidos em **Project Settings > API**:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

A chave publishable (ou a chave `anon` legada) é esperada no cliente. Senha do banco, access token da CLI e `service_role` não pertencem ao arquivo versionado.
`NEXT_PUBLIC_SITE_URL` define a origem usada nos redirects de Auth e nos links de convite.

## URLs do Auth

Em **Authentication > URL Configuration**, configure:

- **Site URL**: a origem canônica da aplicação, por exemplo `http://localhost:3000` no desenvolvimento;
- **Redirect URLs**: inclua exatamente as origens/callbacks usados por cada ambiente, por exemplo `http://localhost:3000/auth/callback` e a URL HTTPS de produção;
- remova curingas amplos quando os endereços definitivos forem conhecidos.

O cadastro de treinador deve enviar em `raw_user_meta_data` somente `papel: "treinador"`, `nome` e `assessoria_nome`. O trigger valida esses campos e cria assessoria, perfil e extensão na mesma transação. Depois do bootstrap, autorização usa `profiles.papel` e `profiles.assessoria_id`, nunca metadata controlável pelo usuário.

## Aplicação e teste local

Execute, na raiz do repositório:

```bash
supabase start
supabase db reset
supabase test db
```

`supabase db reset` é destrutivo e só deve ser usado no banco local/descartável. Ele recria o banco, aplica `supabase/migrations/202608180001_initial_schema.sql` e permite que `supabase test db` execute `supabase/tests/rls_isolation.sql` em uma transação com rollback.

O teste pgTAP deve terminar com 65 asserções aprovadas. Ele valida RLS forçada, grants, ausência de leitura anônima, ocultação de `token_hash`, isolamento Alfa/Beta, visibilidade do atleta e as três funções do contrato.

## Ordem segura para um projeto remoto

1. Execute a migration e o pgTAP em um Supabase local limpo.
2. Revise o diff SQL e confirme que o projeto remoto correto está selecionado.
3. Faça backup conforme a política do ambiente.
4. Vincule a CLI ao projeto somente com autorização explícita: `supabase link --project-ref <ref>`.
5. Inspecione `supabase db push --dry-run`.
6. Aplique com `supabase db push` somente após a revisão e autorização operacional.
7. Valide cadastro, confirmação de e-mail, convite, aceite e isolamento usando contas de teste sem privilégios administrativos.

Não execute `db reset` em produção. Não há rollback destrutivo desta migration: em produção, publique uma nova migration corretiva. Em desenvolvimento local sem dados importantes, o reset completo é o rollback previsto.

## Convites

O servidor gera um token aleatório e persiste somente seu SHA-256 hexadecimal minúsculo (64 caracteres). O token bruto é mostrado uma única vez no link e nunca é gravado. Clientes autenticados não têm permissão de `SELECT` em `convites_atletas.token_hash`.

- `validar_convite(hash)` aceita acesso anônimo, mas retorna somente e-mail mascarado, nome da assessoria e estado;
- `aceitar_convite(hash, user_id, nome)` exige sessão autenticada, compara `auth.uid()` com `user_id`, consulta o e-mail real em `auth.users`, bloqueia o convite com `FOR UPDATE` e conclui tudo atomicamente;
- a aplicação deve calcular o hash antes de chamar as funções; nunca envie ou registre o token bruto fora do fluxo do convite.

## Diagnóstico

### Cadastro de treinador aborta

- confirme que `papel`, `nome` e `assessoria_nome` foram enviados e respeitam os limites da migration;
- consulte os logs do Auth/Postgres: uma falha em `bootstrap_treinador()` aborta o `INSERT` em `auth.users`, evitando estado parcial;
- confirme que a migration foi aplicada e o trigger `on_auth_user_created_bootstrap_treinador` existe;
- não contorne o trigger criando manualmente registros parciais.

### Consulta retorna zero linhas

- confirme que a requisição possui sessão `authenticated` válida;
- confira se existe um `profiles` com o mesmo `auth.uid()` e o papel/tenant esperados;
- execute `supabase test db` para diferenciar policy incorreta de fixture incorreta;
- lembre que zero linhas, em vez de erro, é o comportamento normal de um `SELECT` filtrado por RLS.

### Erro de permissão em convites

- selecione explicitamente apenas as colunas públicas da tabela; `token_hash` é intencionalmente ilegível;
- para validar um link, use `validar_convite`; não consulte a tabela como `anon`;
- para revogar, atualize `status = 'revogado'` e `revogado_em` juntos. Estados finais são imutáveis.

### Verificação externa pendente

Se a máquina não tiver Supabase CLI, Docker ou Postgres, a inspeção estática não substitui o pgTAP. Registre a lacuna e execute os três comandos locais acima em um ambiente habilitado antes de aplicar remotamente.
