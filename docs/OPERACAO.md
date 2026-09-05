# Operação da Etapa 1

## Comandos

```powershell
npm install
npm test -- --maxWorkers=1
npm run lint
npm run typecheck
npm run build
npm run dev
```

## Ambiente

Copie `.env.example` para `.env.local` e configure:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
- `NEXT_PUBLIC_SITE_URL`.
- `RESEND_API_KEY` (somente servidor; configurada como Secret na Vercel).

No Supabase hospedado, configure Confirm email e Redirect URLs contendo `/auth/callback` para cada ambiente.

## Banco Local

Com Docker em execução:

```powershell
npx supabase start
npx supabase db reset --local --no-seed
npx supabase test db --local supabase/tests/rls_isolation.sql
```

Nao execute reset em ambiente remoto.

## Diagnóstico Rápido

### Login redireciona para o painel errado

Verifique `profiles.papel`. A escolha visual Atleta/Treinador no login nao e enviada nem usada para autorizacao.

### Dashboard retorna para `/login`

Confirme sessao Auth, cookie SSR e existencia de `profiles` para o usuario.

### Convite nao aparece

Confira se o usuario e treinador da assessoria correta e se a consulta nao pede `token_hash`.

### E-mail de convite nao chega

Enquanto o remetente for `onboarding@resend.dev`, a Resend limita os envios de teste
ao endereço autorizado na conta. Para enviar aos atletas reais, verifique um domínio
na Resend e configure o remetente FLERNK antes de publicar o fluxo.

### Aceite falha com e-mail divergente

O atleta deve cadastrar o mesmo e-mail que recebeu o convite. A RPC valida o e-mail real de `auth.users`.

### Convite expirado, revogado ou usado

O link nao pode ser reutilizado. O treinador deve gerar um novo convite.

## Publicação

Antes de abrir PR ou publicar:

1. Rode testes, lint, typecheck e build.
2. Execute pgTAP local/remoto quando houver mudanca de banco.
3. Faça QA desktop e mobile das rotas principais.
4. Atualize `docs/STATUS_E_ROADMAP.md` e checklist de aceite.
