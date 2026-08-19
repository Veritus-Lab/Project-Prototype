# FLERNK

Plataforma SaaS para assessorias esportivas de corrida, construída com Next.js App Router.

## Desenvolvimento

Requer Node.js 20.9 ou mais recente e npm.

```bash
npm install
npm run dev
```

Use `npm run build` para gerar a versão de produção, `npm run typecheck` para validar os tipos e `npm test` para executar os testes.

## Arquitetura

- `src/app/`: rotas, layout e estilos globais do App Router.
- `public/`: ativos servidos publicamente, incluindo a logo FLERNK.
- `legacy/`: protótipo anterior preservado integralmente como referência; ele não integra o runtime do Next.js.

As integrações futuras com Supabase devem ficar em services e Server Actions. Componentes React não devem executar mutações no Supabase diretamente.

## Segurança e operação

Nunca inclua segredos, chaves `service_role`, senhas de banco ou tokens persistidos no repositório ou no cliente. Mantenha valores de ambiente apenas em arquivos `.env*` locais, partindo de um `.env.example` sem valores sensíveis.

Antes de publicar, execute `npm test`, `npm run typecheck` e `npm run build`. O diretório `legacy/` contém o protótipo histórico e não deve ser removido durante a operação do aplicativo atual.
