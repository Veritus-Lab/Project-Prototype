# Checklist de Aceite da Etapa 1

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

- [ ] Cadastro de treinador Alfa
- [ ] Confirmacao de e-mail do treinador Alfa
- [ ] Login do treinador Alfa
- [ ] Criacao de convite Alfa
- [ ] Revogacao de convite Alfa
- [ ] Aceite de convite por atleta Alfa
- [ ] Login do atleta Alfa
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

- [ ] Landing em 1440x900
- [ ] Landing em 390x844
- [ ] Cadastro em 1440x900
- [ ] Login em 1440x900
- [ ] Convite ativo em 1440x900
- [ ] Convite invalido/expirado em 390x844
- [ ] Dashboard treinador em 1440x900
- [ ] Dashboard atleta em 390x844
- [ ] Sem overflow ou sobreposicao critica
- [ ] Sem erros criticos de console
- [x] Sem respostas 4xx/5xx inesperadas em rotas publicas no smoke HTTP local
  - QA visual/manual ainda pendente no navegador do ambiente local.

## Documentação

- [x] README atualizado
- [x] SETUP_SUPABASE atualizado
- [x] ARQUITETURA.md criado
- [x] SEGURANCA.md criado
- [x] OPERACAO.md criado
- [x] STATUS_E_ROADMAP atualizado
