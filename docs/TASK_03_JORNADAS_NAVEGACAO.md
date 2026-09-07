# Task 03 — Jornadas e navegação FLERNK

Concluída em 07/09/2026. Este desenho transforma o contrato da Task 01 em navegação e telas de baixa fidelidade; não cria rotas, componentes, CSS, contas, cobranças ou integrações. FLERNK é a única assessoria atendida.

## Arquitetura de informação e rotas-alvo

| Área | Rotas-alvo | Navegação desktop | Navegação móvel |
| --- | --- | --- | --- |
| Pública | `/`, `/interesse`, `/login` | Cabeçalho: início, materiais reais quando disponíveis, `Quero correr com a FLERNK`, `Já sou aluno`; acesso de equipe discreto | Menu recolhido; CTAs de interesse e login preservados |
| Sócio | `/socio`, `/socio/alunos`, `/socio/alunos/[alunoId]`, `/socio/financeiro`, `/socio/financeiro/cobrancas`, `/socio/turmas`, `/socio/turmas/[turmaId]/chamada`, `/socio/frequencia`, `/socio/interessados`, `/socio/mensagens`, `/socio/treinos`, `/socio/configuracoes` | Barra lateral com Visão geral, Alunos, Financeiro, Turmas e agenda, Frequência, Interessados, Mensagens, Treinos, Configurações | Cabeçalho contextual e navegação inferior para Visão geral, Alunos, Financeiro e Mais; Mais contém as demais áreas |
| Professor | `/professor`, `/professor/alunos`, `/professor/alunos/[alunoId]`, `/professor/turmas`, `/professor/turmas/[turmaId]/chamada`, `/professor/frequencia`, `/professor/interessados`, `/professor/treinos` | Barra lateral com Minha gestão, Alunos, Turmas e agenda, Frequência, Interessados e Treinos | Navegação inferior para Minha gestão, Turmas, Chamada e Mais; a chamada prioriza uso com uma mão |
| Aluno | `/aluno`, `/aluno/financeiro`, `/aluno/agenda`, `/aluno/frequencia`, `/aluno/treinos`, `/aluno/perfil`, `/aluno/justificativas/nova` | Barra lateral com Início, Meu financeiro, Agenda, Minha frequência, Meus treinos e Perfil | Navegação inferior para Início, Financeiro, Agenda e Mais |

`/treinador` é rota legada. A Task 09 implementará um redirect de compatibilidade após identificar a sessão: sócio para `/socio`, professor para `/professor`, aluno para `/aluno`; sessão ausente ou papel inválido segue para `/login`, sem revelar uma área protegida. Nenhuma nova área usa o prefixo legado. Links públicos e internos acima são distintos e não colidem.

## Matriz de acesso por superfície e dado

| Superfície / dado | Sócio | Professor | Aluno | Visitante | Menu | Server Action / route | RLS / RPC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Painel e indicadores operacionais | Completo | Todas as turmas e agenda da FLERNK | Próprio resumo | — | Mostrar somente itens do papel | Verificar sessão, papel e escopo | Restringir linhas à FLERNK e à titularidade/vínculo |
| Cadastro, matrícula, plano e situação operacional | Gerencia | Consulta/edita somente campos operacionais permitidos | Consulta próprio vínculo/perfil permitido | — | Professor sem ações comerciais | Ações administrativas só para sócio; convite não cria matrícula | Bloquear alteração comercial pelo professor e acesso cruzado do aluno |
| Financeiro completo, cobranças, pagamentos, despesas, caixa, exportação | Completo | Nunca | Próprias cobranças/pagamentos | Nunca | Sócio vê Financeiro; professor não vê item; aluno vê Meu financeiro | Rotas/ações financeiras exigem sócio, exceto consulta/pagamento da própria cobrança pelo aluno | Professor não lê tabelas, views ou RPC financeiras; aluno só lê/aciona a própria cobrança |
| Indicador financeiro do aluno na operação | Completo | Apenas `em dia`, `pendente`, `não configurado` ou `indisponível` | Própria situação e detalhes autorizados do portal | — | Professor vê o indicador nas listas e detalhes | Endpoint do professor retorna somente enum agregado; nunca valor, vencimento, cobrança, pagamento ou ação financeira | RPC/visão de professor expõe apenas aluno autorizado e enum agregado |
| Turmas, encontros, chamada e frequência | Gerencia | Gerencia todas as turmas FLERNK | Consulta próprias turmas/presenças | — | Itens por papel | Professor/sócio registram chamada; aluno solicita justificativa, não altera presença | Vínculo de turma e titularidade limitam leituras/escritas |
| Justificativas | Decide | Decide | Cria/consulta as próprias | — | Ações conforme papel | Validar autor, encontro e transição de estado | Aluno só inclui e lê as próprias; equipe decide em turma autorizada |
| Interessados | Gerencia | Acompanha atendimento/agenda | — | Cria somente interessado | Item interno para sócio/professor; CTA público | Formulário público aceita interesse protegido; conversão é administrativa | Sem criação pública de conta, organização, matrícula ou cobrança |
| Usuários, permissões, integrações e auditoria | Gerencia | Nunca | Nunca | Nunca | Sócio apenas | Exigir sócio e impedir remoção do último sócio | RLS/RPC reforçam papel e preservam auditoria |

Menu é orientação visual, não autorização. Cada link, Server Action, handler de rota e consulta deve aplicar a mesma regra; RLS/RPC é a última barreira para dados e mutações. Erro de autorização retorna estado de sem permissão, nunca dados parciais.

## Jornadas completas

### Cobrança e pagamento do aluno

1. O aluno abre `/aluno/financeiro` e vê somente suas cobranças e o estado permitido. Se não houver cobrança aplicável, a tela explica o estado e oferece contato com a FLERNK; não inventa valores.
2. Seleciona uma cobrança própria e inicia checkout seguro do provedor. A rota confirma sessão e propriedade antes de criar/redirecionar para o checkout.
3. Retorno do navegador: ao voltar, o portal mostra “aguardando confirmação” enquanto não há evento autenticado. Não dá baixa pelo redirect, por texto do usuário ou comprovante informal.
4. Webhook autenticado chega ao serviço: a Task 20 validará origem, idempotência e ordem. O evento atualiza pagamento/cobrança uma única vez; o portal e os painéis passam ao estado confirmado.
5. Se o webhook atrasar ou não baixar, o aluno vê estado pendente de confirmação e orientação para aguardar/contatar a FLERNK. Sócio consulta e reconcilia; evento repetido não duplica recebimento.
6. Se checkout falhar, expirar ou for cancelado, a cobrança não é quitada. O aluno pode tentar novamente quando permitido; falha técnica fica visível ao sócio. Professor continua sem detalhe financeiro e vê somente o enum aplicável após a atualização.

### Chamada, correção e justificativa

1. Professor abre `/professor/turmas/[turmaId]/chamada` e sócio abre `/socio/turmas/[turmaId]/chamada` ao tocar em “Fazer chamada” no encontro. A tela móvel carrega alunos vinculados, estado atual e marca se o encontro foi cancelado.
2. Para encontro elegível, seleciona em lote `presente` ou `falta`, ajusta casos individuais para `justificada` ou mantém `não registrado`, revisa e confirma. `não registrado` não é convertido em falta automaticamente.
3. Se o encontro estiver cancelado, a chamada é bloqueada e ele fica fora do denominador da frequência; a tela mostra o motivo/estado operacional disponível.
4. Depois de salvo, correção exige seleção explícita de aluno/estado, motivo e registro de responsável/data. O histórico auditado preserva valor anterior, novo valor e contexto.
5. Aluno abre `/aluno/frequencia`, consulta só seus registros e solicita justificativa para uma falta elegível. Não pode editar a chamada.
6. Professor ou sócio avalia: aprova, recusa ou pede complemento segundo regra futura. Falha de rede antes de confirmar mantém alterações locais não salvas identificadas e permite tentar novamente; conflito ou falta de permissão recarrega a versão válida sem ocultar o erro.

### Cadastro administrativo e convite sem duplicação

1. Sócio abre `/socio/alunos`, busca por identificadores permitidos antes de cadastrar. Resultado existente leva ao detalhe, sem criar nova aluna.
2. Se não existir, cria cadastro administrativo sem login, com dados mínimos, situação operacional e vínculo de matrícula separado. Falha de validação mantém os campos e aponta correções.
3. Sócio envia convite posterior ao cadastro já criado. A ação identifica o cadastro/aluno de destino, não cria matrícula, assinatura ou cobrança.
4. A pessoa aceita o convite e autentica. O servidor associa a conta ao cadastro preexistente de forma idempotente; reenvio, clique repetido ou resposta tardia não criam outro aluno.
5. Se houver correspondência ambígua ou duplicidade detectada, a vinculação para e vira pendência administrativa auditável. Sócio resolve antes de prosseguir; professor não decide condições comerciais.

### Interesse e conversão

1. Visitante vê a landing, materiais reais apenas nos slots aprovados, e usa “Quero correr com a FLERNK”. Preços, equipe, locais e depoimentos ficam ausentes até haver material real autorizado.
2. Em `/interesse`, informa nome, WhatsApp, objetivo opcional e preferência de turma quando aplicável. Proteções de spam, limite de reenvio e chave de duplicidade são aplicadas antes de persistir.
3. Sucesso confirma apenas o recebimento do interesse. O formulário não cria conta, matrícula, assinatura ou cobrança; falha preserva dados seguros e permite nova tentativa.
4. Sócio ou professor acompanha o interessado em `/socio/interessados` ou `/professor/interessados`, atualiza o atendimento e agenda experimental somente se a oferta existir.
5. Sócio converte manualmente após checar duplicidade. A conversão reaproveita o interessado/origem e cria ou vincula cadastro de aluno único; convite, matrícula, plano e cobrança continuam ações separadas e autorizadas.

### Lembrete cancelado por quitação

1. A fila prepara lembrete configurado para cobrança elegível e preferência de contato válida.
2. Antes do envio, o processador revalida cobrança, matrícula e opt-out. Se a cobrança estiver quitada via confirmação autenticada, cancela o item pendente e registra o motivo.
3. Nenhuma mensagem é enviada. O sócio vê na área de Mensagens o cancelamento/estado da fila; o aluno vê a cobrança quitada no próprio portal.
4. Se pagamento e processamento ocorrerem simultaneamente, a Task 23 implementará exclusão/idempotência para impedir envio posterior quando a quitação vencer a revalidação. Envio já aceito pelo provedor pode não ser cancelável e deve ficar rastreável, sem afirmar que foi evitado.

## Wireframes textuais e especificação de telas

Estados comuns a toda tela protegida: carregando mostra estrutura sem dados antigos; erro explica falha e oferece repetir; sem permissão bloqueia conteúdo e oferece destino permitido; vazio explica ausência e próximo passo. Indicadores de sócio jamais convertem erro em zero.

### Landing e formulário (`/`, `/interesse`)

```
[Marca FLERNK] [materiais reais*] [Já sou aluno]
Corra com orientação. Evolua com a FLERNK.      [Quero correr com a FLERNK]
[slot: diferenciais reais] [slot: locais/horários reais] [slot: equipe autorizada]
[slot: depoimentos autorizados, omitido se ausente]
Formulário: nome | WhatsApp | objetivo opcional | turma opcional | [Enviar interesse]
```

Objetivo: captar interessado. Dados: campos mínimos, origem, estado do envio. Ações: abrir formulário, enviar, ir ao login. Vazio: slots sem conteúdo real são omitidos; carregando: reserva de conteúdo; erro: não confirma lead e permite corrigir/repetir; sem permissão: não aplicável. Destinos: CTA para `/interesse`, login para `/login`; sucesso não redireciona a portal.

### Login (`/login`)

```
[Marca] Entrar
e-mail/identificador | senha | [Entrar]
[Recuperar acesso]                 [Voltar à landing]
```

Objetivo: iniciar sessão individual. Dados: credencial e mensagens de autenticação. Ações: entrar, recuperar acesso, voltar. Vazio: não aplicável; carregando: botão bloqueado; erro: credencial/serviço sem revelar contas; sem permissão: sessão autenticada sem papel válido recebe orientação e logout. Destino após sucesso: portal correspondente ao papel; `/treinador` usa redirect da Task 09.

### Painel do sócio (`/socio`)

```
[Visão geral] [Alunos] [Financeiro] [Turmas] [Frequência] [Interessados] ...
Período [____]  [Recebido] [Taxas] [Líquido] [A receber] [Atrasos] [Despesas]
[Ativos] [Novas matrículas] [Cancelamentos] [Frequência] [Interessados aguardando]
Cada cartão -> lista filtrada do mesmo período | [falha de consulta: tentar novamente]
```

Objetivo: priorizar operação e conferência. Dados: indicadores por período, cada um com origem/lista explicativa. Ações: filtrar período, abrir lista/atalho. Vazio: mostra ausência no período e link para ação compatível; carregando: esqueleto; erro: cartão mostra indisponível/erro, nunca `0`; sem permissão: login. Destinos: cartões vão a `/socio/financeiro/cobrancas`, `/socio/alunos`, `/socio/frequencia` ou `/socio/interessados` com o mesmo filtro.

### Alunos: lista e detalhe (`/socio/alunos`, `/socio/alunos/[alunoId]`; equivalente limitado em `/professor`)

```
Lista: [Buscar] [filtros] [Novo cadastro] | nome | matrícula | turma | situação
Detalhe: identidade e contato | matrícula/histórico | turma | observações | [Convidar]
Professor: mesmos dados operacionais permitidos + [em dia|pendente|não configurado|indisponível]
```

Objetivo: localizar, cadastrar e operar aluno. Dados: identificação mínima, matrícula, turma, observações e, para professor, enum financeiro agregado. Ações: buscar, filtrar, criar (sócio), editar campo operacional permitido, convidar (sócio), abrir turma/frequência. Vazio: sem resultado oferece limpar filtros/criar cadastro quando autorizado; carregando: linhas de reserva; erro: repetir sem assumir ausência; sem permissão: retorno ao painel do papel. Destinos: detalhe, turma, frequência e convite. Professor não recebe links, valores, vencimentos, cobranças, pagamentos ou ações financeiras.

### Financeiro do sócio (`/socio/financeiro`, `/socio/financeiro/cobrancas`)

```
[Financeiro] período [____]  [Realizado] [Previsto] [Caixa] [Exportar]
Cobranças | pagamentos | despesas | receitas avulsas | lista/estado/auditoria
```

Objetivo: gerir e conferir financeiro completo. Dados: cobranças, pagamentos, despesas, receitas, realizado e previsto separados. Ações: filtrar, abrir lista, registrar ação autorizada, exportar. Vazio: explica ausência; carregando: tabelas de reserva; erro: falha explícita sem totais zerados; sem permissão: negar. Destinos: cobranças, detalhes e listas filtradas. Esta tela não existe para professor.

### Painel do professor (`/professor`)

```
[Minha gestão] [Alunos] [Turmas] [Frequência] [Interessados] [Treinos]
Agenda de hoje | próximas turmas | chamada pendente
Faltas recorrentes | justificativas aguardando | alunos: [em dia|pendente|não configurado|indisponível]
```

Objetivo: conduzir a operação diária em todas as turmas e agenda da FLERNK. Dados: agenda e turmas completas da FLERNK, pendências de chamada/justificativa, alunos e o único enum financeiro permitido. Ações: abrir turma, chamada, aluno, justificativa e interessado. Vazio: agenda sem encontros; carregando: reserva; erro: indisponível/recarga, sem inferir estado financeiro; sem permissão: login. Destinos: `/professor/turmas/[turmaId]/chamada`, aluno, frequência ou interessados. Nenhum valor, vencimento, cobrança, pagamento ou ação financeira aparece em qualquer estado.

### Chamada móvel (`/socio/turmas/[turmaId]/chamada`, `/professor/turmas/[turmaId]/chamada`)

```
< Turma / encontro [cancelado?]
[Marcar todos presentes] [Marcar todos faltas]
Aluno A  [presente v]   Aluno B [falta v]   Aluno C [justificada v]
Aluno D  [não registrado v]
[Revisar e confirmar]  Histórico de correções
```

Objetivo: registrar presença com rapidez e rastreabilidade. Dados: encontro, vínculos, estado por aluno, cancelamento e histórico autorizado. Ações: lote, alteração individual, confirmar, corrigir com motivo. Vazio: turma sem alunos; carregando: itens bloqueados; erro: alterações não salvas identificadas e nova tentativa; sem permissão: voltar à agenda do papel. Se cancelado, bloqueia registro e informa exclusão do denominador. Destinos: frequência/turma de `/socio` ou `/professor`; correção abre registro auditado.

### Painel, financeiro e frequência do aluno (`/aluno`, `/aluno/financeiro`, `/aluno/frequencia`)

```
Início: plano/resumo autorizado | próxima ação | agenda | atalhos
Meu financeiro: minhas cobranças e histórico | [Pagar cobrança própria]
Minha frequência: encontros próprios | presente/falta/justificada/não registrado | [Solicitar justificativa]
```

Objetivo: permitir acompanhamento próprio e ações autorizadas. Dados: vínculo, agenda, cobranças próprias, frequência própria e justificativas. Ações: abrir checkout próprio, consultar histórico, solicitar justificativa, editar perfil permitido. Vazio: explica ausência de vínculo/cobrança/encontro; carregando: reserva; erro: repetir e, no pagamento, manter “aguardando confirmação” até webhook; sem permissão: login/portal próprio. Destinos: checkout externo seguro retornando ao financeiro, agenda, frequência, nova justificativa e perfil. O aluno nunca acessa dados de outro aluno ou caixa da FLERNK.

### Interessados (`/socio/interessados`, `/professor/interessados`)

```
[Buscar] [novo | em contato | experimental agendada | convertido | encerrado]
Interessado | origem | contato | próxima ação | responsável
[Abrir] [registrar atendimento] [agendar] [converter: sócio]
```

Objetivo: acompanhar captação até conversão manual. Dados: interessado, origem, contato permitido, situação e próxima ação. Ações: filtrar, atualizar atendimento, agendar experimental quando disponível, converter (sócio). Vazio: sem interessados; carregando: lista de reserva; erro: repetir; sem permissão: painel do papel. Destinos: detalhe do interessado; conversão encaminha ao cadastro administrativo com origem preservada e verificação de duplicidade.

## Rastreabilidade aos critérios globais do MVP

| Critério global | Papel/jornada/tela desta task | Próxima implementação |
| --- | --- | --- |
| Contas individuais, professor limitado e aluno isolado | Matriz; painéis e detalhes por papel | 07–09, 21 e 25 |
| Público não cria assessoria/equipe | Landing e interesse | 08, 26 e 27 |
| Conversão sem duplicação e aluno sem login | Cadastro/convite; interesse/conversão | 10 e 26 |
| Cobrança única e atualização confiável | Jornada cobrança/pagamento | 15, 19–21 |
| Realizado e previsto separados | Painel/financeiro do sócio | 17, 18 e 24 |
| Quitação cancela lembrete pendente | Jornada lembrete | 22 e 23 |
| Chamada móvel; cancelado fora da falta | Jornada e wireframe de chamada | 12, 13 e 25 |
| Landing factual | Landing e slots de material real | 26 e 27 |
| Importação, operação e recuperação | Limites de navegação; sem prometer conclusão | 28, 31 e 34 |
| Ciclo completo em teste e piloto | Jornadas de pagamento e lembrete mapeiam estados/falhas | 19–23, 29–33 |

## Decisões reservadas à Task 09

Task 09 implementará layouts, menus, autenticação, logout, recuperação de acesso, guardas de rota e redirects de papel descritos aqui. Também implementará a compatibilidade de `/treinador`. Esta Task 03 não escreve componentes, CSS ou código de rota, e não escolhe a mecânica técnica desses elementos.
