# Base demo de apresentação

O script `scripts/seed-demo.mjs` cria ou atualiza exclusivamente a assessoria
`flernk-demo`, um treinador demo e cinco atletas demo. Ele usa o service role
somente em execução administrativa local e nunca é chamado pelo aplicativo,
por migration ou por deploy da Vercel.

## Pré-requisitos

- Projeto Supabase correto selecionado e migrations aplicadas.
- `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` disponíveis apenas
  no terminal administrativo.
- Uma senha demo exclusiva com pelo menos 12 caracteres.

## Execução manual

No PowerShell, defina as variáveis temporariamente e execute:

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY = "..."
$env:FLERNK_DEMO_PASSWORD = "uma-senha-demo-exclusiva"
$env:FLERNK_DEMO_SEED_CONFIRM = "seed-demo"
node scripts/seed-demo.mjs
```

O script é idempotente para a assessoria demo: reutiliza usuários e vínculos,
recria apenas os treinos e atribuições daquele tenant. Não use as contas ou a
senha demo para clientes reais.
