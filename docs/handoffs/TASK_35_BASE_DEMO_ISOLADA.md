# Task 35 - Base demo isolada

## Entrega

- `scripts/seed-demo.mjs` cria a assessoria `flernk-demo`, um treinador e cinco
  atletas de apresentação, reutilizando contas demo existentes.
- A carga recria somente treinos e atribuições desse tenant e inclui uma
  execução concluída para alimentar distância, tempo e adesão reais.
- `docs/DEMO_APRESENTACAO.md` documenta pré-requisitos e a execução manual.

## Segurança operacional

- O script exige `FLERNK_DEMO_SEED_CONFIRM=seed-demo`, service role e senha
  demo exclusiva de pelo menos 12 caracteres.
- Não é importado pela aplicação, não é migration e não roda em deploy Vercel.
- O service role existe apenas no terminal administrativo; ele nunca deve ser
  configurado com prefixo `NEXT_PUBLIC_`.
- A base usa as mesmas tabelas e relações da operação normal. Nenhum bypass de
  RLS foi adicionado ao produto.

## Estado da execução

O script não foi executado contra o Supabase conectado nesta task. Criar as
contas demo é uma operação de escrita no ambiente remoto e deve ocorrer apenas
quando houver confirmação explícita para essa carga.

## Verificação

- `node --check scripts/seed-demo.mjs`: aprovado.
- `npm run typecheck`: aprovado.
- `git diff --check`: aprovado.

## Próxima task

Task 36 realiza o QA de entrega comercial: contas demo, fluxos de atleta e
treinador, layout responsivo e deploy de produção.
