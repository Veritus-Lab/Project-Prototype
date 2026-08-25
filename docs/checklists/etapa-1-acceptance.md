# Checklist de Aceite da Etapa 1

> QA manual validado pelo usuário em 25/08/2026 no servidor local `http://localhost:3000`.

## Validação Técnica

- [x] `npm test -- --maxWorkers=1`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] Smoke HTTP local em `http://localhost:3000`
  - `/`, `/cadastro`, `/login` e `/convite/token-invalido-para-smoke`: 200.
  - `/treinador`, `/atleta` e `/treinador/convites`: 307 para autenticação.
- [ ] pgTAP local executado nesta rodada
  - Bloqueado em 24/08/2026: Docker Desktop/Linux engine indisponível (`failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`).
- [ ] pgTAP remoto executado nesta rodada
  - Não executado nesta rodada para evitar mutação/uso remoto sem autorização operacional explícita.

## Roteiro Funcional

- [x] Cadastro de treinador validado manualmente
- [x] Confirmacao de e-mail validada manualmente
- [x] Login de usuário validado manualmente
- [x] Criacao de convite validada manualmente
- [x] Revogacao de convite validada manualmente
- [x] Aceite de convite por atleta validado manualmente
- [x] Login do atleta validado manualmente
- [ ] Cadastro de treinador Beta
- [ ] Convite/atleta Beta isolados de Alfa
- [ ] Tentativa de reuso de convite bloqueada
- [ ] E-mail divergente no aceite bloqueado

## Isolamento

- [ ] Treinador Alfa nao le convites Beta
- [ ] Treinador Beta nao le convites Alfa
- [ ] Atleta Alfa nao le registros Beta
- [ ] Atleta Beta nao le registros Alfa

## QA Visual

- [x] Landing validada manualmente
- [x] Cadastro validado manualmente
- [x] Login validado manualmente
- [x] Convite validado manualmente
- [x] Dashboard treinador validado manualmente
- [x] Dashboard atleta validado manualmente
- [x] Sem overflow ou sobreposicao critica reportada no QA manual
- [x] Sem erros criticos reportados no QA manual
- [x] Sem respostas 4xx/5xx inesperadas em rotas publicas no smoke HTTP local
  - Smoke local automatizado aprovado e QA visual/manual validado pelo usuário.

## Documentação

- [x] README atualizado
- [x] SETUP_SUPABASE atualizado
- [x] ARQUITETURA.md criado
- [x] SEGURANCA.md criado
- [x] OPERACAO.md criado
- [x] STATUS_E_ROADMAP atualizado
