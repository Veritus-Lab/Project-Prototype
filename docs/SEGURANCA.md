# Segurança

## Autoridade de Papel e Tenant

Depois do bootstrap, metadata de Auth nao e autoridade. Papel e assessoria reais sempre vêm de `profiles.papel` e `profiles.assessoria_id`, lidos no servidor por `requireUser()` e `requireRole()`.

## RLS e Isolamento

Todas as tabelas de negocio possuem `assessoria_id` e RLS forçada. Policies restringem leitura e mutacao ao tenant do usuario autenticado. O teste `supabase/tests/rls_isolation.sql` valida grants, isolamento Alfa/Beta, visibilidade de atleta e funcoes de convite.

## Convites

- Token bruto e gerado no servidor com 32 bytes aleatorios em base64url.
- Apenas o SHA-256 hexadecimal e persistido em `convites_atletas.token_hash`.
- `token_hash` nao e selecionavel por clientes autenticados.
- Link bruto e mostrado somente logo apos a criacao.
- Convites podem ficar ativo, expirado, aceito ou revogado.
- Estados finais sao protegidos por trigger e nao devem ser reabertos.

## Aceite

`validar_convite(hash)` e publica, mas retorna somente e-mail mascarado, nome da assessoria e estado. `aceitar_convite(hash, user_id, nome)` exige usuario autenticado, bloqueia a linha com `FOR UPDATE`, verifica e-mail real em `auth.users`, valida prazo/estado e cria profile/atleta atomicamente.

## Segredos

Nunca versionar:

- `service_role`;
- senha de banco;
- token da Supabase CLI;
- variaveis `.env*` locais com valores reais.

Arquivos `NEXT_PUBLIC_*` podem conter apenas URL publica do projeto e chave publishable/anon destinada ao cliente.

## Operacao Segura

- `supabase db reset` somente em banco local descartavel.
- Migration remota e forward-only; correcoes exigem nova migration.
- Forms chamam Server Actions, que validam entrada e delegam a services.
- Componentes React nao escrevem diretamente no Supabase.

## Segurança da Etapa 2

A fundação de segurança da Etapa 2 está em `docs/ETAPA_2_FUNDACAO_SEGURA.md`.

Regras adicionais para as próximas tasks:

- Dados financeiros, telefone, observações internas, RPE e histórico de mensagens são sensíveis.
- Eventos financeiros devem ser append-only.
- Atleta não deve acessar financeiro até decisão explícita de produto.
- Observações internas do treinador nunca devem ser selecionáveis por atleta.
- WhatsApp exige opt-in, opt-out respeitado, templates controlados, rate limit e credenciais somente em variáveis de ambiente.
- Toda tabela nova deve ter RLS habilitada e forçada antes de receber grants.
