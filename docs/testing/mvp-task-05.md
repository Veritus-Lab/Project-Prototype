# QA-B — Task 05

Data: 07/09/2026. Resultado: **INFRAESTRUTURA PRONTA; GATES ABERTOS**.

| Verificação | Resultado | Evidência |
| --- | --- | --- |
| Instalação travada | PASSOU | npm 11.6.0 leu `package-lock.json`; dependências exatas adicionadas |
| Guard TDD | PASSOU | RED por módulo ausente; GREEN 7/7 casos em 1,97 s |
| Guard negativo produção | PASSOU | ref/host `hrmyqrekasuqhiqmqske` recusado |
| Unitários/autenticação | PASSOU | 53 arquivos, 157 testes, incluindo testes de sessão/login existentes |
| Cobertura mínima 80% | FALHOU COMO GATE | 54,88% statements; 43,63% branches; 56,60% functions; 60,01% lines |
| E2E Chromium | PASSOU | 4/4 em 15,1 s, desktop + Pixel 7, landing/login anônimos |
| Artefatos de falha | PASSOU | teste temporário deliberado falhou; screenshot PNG, trace ZIP e contexto MD foram gerados em `test-results`; teste removido e diretório ignorado |
| pgTAP local | BLOQUEADO LOCALMENTE | Docker CLI ausente; CI Ubuntu executa stack local sem conexão remota |
| Typecheck final | PASSOU | `tsc --noEmit`, exit 0 após habilitar imports TS usados pelos runners Node |
| Lint/build final | NÃO REPETIDOS | baseline anterior passou; a rodada final foi interrompida e não é apresentada como nova evidência |
| Produção/Vercel/Supabase | NÃO TOCADA | nenhuma migration, seed, variável, deploy ou integração real |

O primeiro E2E revelou um locator `Entrar` ambíguo entre cabeçalho e rodapé. O teste passou a delimitar o banner por papel acessível. A segunda execução confirmou os quatro cenários. Para validar no Windows sem deixar o processo filho do Next preso no teardown, `PLAYWRIGHT_BASE_URL` permite apontar para servidor local já controlado; no CI Linux, o `webServer` continua automático.

QA-B não deve ser declarado totalmente aprovado enquanto a cobertura global não alcançar 80% e o job pgTAP não produzir evidência em runner com Docker. Os gates estão automatizados e bloqueiam a pipeline, em vez de serem mascarados por exclusões, skips ou acesso remoto.

Uma repetição final de `npm ci` encontrou `EPERM` ao remover `lightningcss.win32-x64-msvc.node`, mantido aberto por processo filho do Next no Windows. `npm install` restaurou o diretório (607 pacotes, 0 vulnerabilidades), com avisos de limpeza para binários nativos temporários. A instalação limpa inicial já havia passado; o CI Linux repetirá `npm ci` sem reutilizar esse diretório.
