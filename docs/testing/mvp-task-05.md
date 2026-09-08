# QA-B — Task 05

Data: 08/09/2026. Resultado: **INFRAESTRUTURA PRONTA; GATE EXTERNO PENDENTE**.

| Verificação | Resultado | Evidência |
| --- | --- | --- |
| Instalação travada | PASSOU | npm 11.6.0 leu `package-lock.json`; dependências exatas adicionadas |
| Guard e contrato read-only | PASSOU | 41 testes; cobre produção, sandbox e 22 funções mutantes antes do client Supabase |
| Guard negativo produção | PASSOU | ref/host `hrmyqrekasuqhiqmqske` recusado |
| Unitários/autenticação | PASSOU | 58 arquivos, 220 testes, incluindo sessão/login, domínio financeiro/comunicação e policy de efeitos externos |
| Baseline global | VISÍVEL | 63,92% statements; 51,11% branches; 61,17% functions; 65,16% lines |
| Gate crítico 80% | PASSOU | 464 statements/369 linhas executáveis; 86,42% statements; 81,68% branches; 96,66% functions; 85,90% lines; services/actions críticos incluídos explicitamente |
| E2E Chromium | PASSOU | 4/4 em 15,1 s, desktop + Pixel 7, landing/login anônimos |
| Artefatos de falha | PASSOU | teste temporário deliberado falhou; screenshot PNG, trace ZIP e contexto MD foram gerados em `test-results`; teste removido e diretório ignorado |
| pgTAP local | BLOQUEADO LOCALMENTE | Docker CLI ausente; CI Ubuntu executa stack local sem conexão remota |
| Typecheck final | PASSOU | `next typegen` passou; o build também executou TypeScript sem erros |
| Lint/build final | PASSOU | ESLint exit 0 após artefatos; Next 16.3.1 compilou e gerou 21 páginas |
| Produção/Vercel/Supabase | NÃO TOCADA | nenhuma migration, seed, variável, deploy ou integração real |

O primeiro E2E revelou um locator `Entrar` ambíguo entre cabeçalho e rodapé. O teste passou a delimitar o banner por papel acessível. A segunda execução confirmou os quatro cenários. Para validar no Windows sem deixar o processo filho do Next preso no teardown, `PLAYWRIGHT_BASE_URL` permite apontar para servidor local já controlado; no CI Linux, o `webServer` continua automático.

QA-B local passou nos itens executáveis. A aprovação integral permanece pendente até o job pgTAP produzir evidência em runner com Docker. Os gates estão automatizados e bloqueiam a pipeline, em vez de serem mascarados por exclusões, skips ou acesso remoto.

Uma repetição final de `npm ci` encontrou `EPERM` ao remover `lightningcss.win32-x64-msvc.node`, mantido aberto por processo filho do Next no Windows. `npm install` restaurou o diretório (607 pacotes, 0 vulnerabilidades), com avisos de limpeza para binários nativos temporários. A instalação limpa inicial já havia passado; o CI Linux repetirá `npm ci` sem reutilizar esse diretório.
