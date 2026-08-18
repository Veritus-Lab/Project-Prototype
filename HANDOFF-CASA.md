# FLERNK - Handoff para continuidade

Atualizado em 18/08/2026.

## Onde o trabalho esta

- Repositorio: `Veritus-Lab/Project-Prototype`
- Branch de continuidade: `feat/etapa-1-nextjs-supabase`
- Plano: `docs/superpowers/plans/2026-08-18-etapa-1-migracao-nextjs-supabase.md`
- Especificacao: `docs/superpowers/specs/2026-08-18-etapa-1-migracao-nextjs-supabase-design.md`
- Proxima atividade: Task 3, configuracao dos clientes Supabase e ambiente.

Nao continue a migracao a partir de `main`: use a branch acima.

## O que foi concluido

### Task 1 - Base Next.js

- O prototipo Express/SQLite/HTML foi preservado em `legacy/`.
- A raiz passou a usar Next.js App Router, React, TypeScript e Tailwind CSS.
- Vitest, Testing Library, ESLint e verificacao de tipos foram configurados.
- O alias `@/*` funciona no TypeScript e no Vitest.
- A logo foi disponibilizada em `public/flernk-logo.jpg`.

Commits:

- `42d86a3 chore: migrate project shell to nextjs`
- `106195a fix: configure vitest source alias`

### Task 2 - Design system e landing

- Landing migrada para componentes React/Next.js.
- Inter e tokens oficiais FLERNK aplicados.
- Componentes `Button`, `Input`, `Card`, `Badge` e `Brand` criados.
- Header, hero, recursos, publicos/planos e footer componentizados.
- Logo renderizada com `next/image` e icones com Lucide.
- Dependencias CDN removidas da nova aplicacao.
- CTAs preparados para `/login` e `/cadastro`; essas rotas pertencem as Tasks 5 e 6.

Commit:

- `6c24c6b feat: add FLERNK design system and landing`

## Verificacoes ja executadas

No estado da Task 2:

- `npm test`: 6 testes aprovados.
- `npm run lint`: aprovado.
- `npm run typecheck`: aprovado.
- `npm run build`: aprovado.
- ECC/Chrome DevTools: desktop e mobile sem overflow ou erros de console.
- Lighthouse mobile: 100 em acessibilidade, boas praticas, SEO e Agentic Browsing.

Ao retomar, rode novamente:

```bash
npm install
npm test
npm run lint
npm run typecheck
npm run build
npm run dev
```

O servidor local fica em `http://localhost:3000` por padrao.

## Como continuar em outra maquina

```bash
git clone https://github.com/Veritus-Lab/Project-Prototype.git
cd Project-Prototype
git fetch origin
git switch --track origin/feat/etapa-1-nextjs-supabase
npm install
```

Se a branch local ja existir:

```bash
git switch feat/etapa-1-nextjs-supabase
git pull --ff-only
```

## Configuracao Supabase para a Task 3

O projeto Supabase foi criado. Crie `.env.local` somente na maquina local:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://hrmyqrekasuqhiqmqske.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<sua-chave-publishable>
```

O arquivo `.env.local` esta ignorado pelo Git. A chave recebida nesta sessao nao foi gravada na documentacao nem versionada. Nunca versionar senha do banco, `service_role` ou secret key.

## Sequencia restante da Etapa 1

1. Task 3: ambiente, clientes Supabase SSR e middleware de renovacao de sessao.
2. Task 4: migration multi-tenant, RLS e testes de isolamento.
3. Task 5: cadastro aberto do treinador e confirmacao de e-mail.
4. Task 6: login, sessao, autorizacao por papel e shells dos dashboards.
5. Task 7: geracao e revogacao de convites seguros.
6. Task 8: aceite do convite e cadastro exclusivo do atleta.
7. Task 9: validacao integral, ECC e documentacao operacional.

## Decisoes arquiteturais aprovadas

- Cadastro aberto apenas para treinador, com verificacao de e-mail.
- O cadastro do treinador cria uma assessoria.
- Atleta entra apenas por convite do treinador.
- Convite vinculado ao e-mail e assessoria, uso unico, revogavel e valido por sete dias.
- Na primeira etapa o treinador copia um link; envio automatico por e-mail fica para depois.
- Toda tabela de negocio tera `assessoria_id` e RLS desde a migration inicial.
- Mutacoes passam por Server Actions e `lib/services/`; componentes nao escrevem direto no Supabase.
- Padrao visual em todo o sistema: Inter, amarelo `#E2FF00`, hover `#C8E200`, fundo `#0A0C0E`, superficie `#14171A`, superficie elevada `#1A1E23`, borda `#23272D` e texto `#F3F4F6`.

## Observacoes de revisao

- Os CTAs pill da landing foram mantidos por fazerem parte da composicao aprovada. Controles densos dos dashboards devem usar raio de ate 8px.
- Ao usar `Input`, sempre forneca label explicito ou outro nome acessivel coberto por teste.
- A migration da Task 4 nao pode ser aplicada apenas com a publishable key. Ela devera ser executada no SQL Editor do Supabase ou por CLI autenticada, seguida do teste RLS.
- Nenhuma alteracao foi aplicada ao banco Supabase ate este handoff.

## Documentacao disponivel

- `README.md`: instalacao e comandos atuais.
- `HANDOFF-CASA.md`: este ponto de continuidade.
- `docs/superpowers/specs/2026-08-18-etapa-1-migracao-nextjs-supabase-design.md`: arquitetura aprovada.
- `docs/superpowers/plans/2026-08-18-etapa-1-migracao-nextjs-supabase.md`: plano completo, Tasks 1 a 9.
- `legacy/`: prototipo anterior preservado para consulta durante a migracao.
