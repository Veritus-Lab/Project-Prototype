# Task 02 — Inventário e estratégia de migração

Data do snapshot: 07/09/2026. Ambiente observado: Supabase `flernk-dev`, região `sa-east-1`, PostgreSQL 17, branch `main`; repositório na base `55863f0da0ea082c0052016e7b030f744686cec5`. Esta é uma análise read-only do banco e do repositório, sem migration, carga, exclusão, criação de conta ou chamada a provedor.

## Limite de identificação

Os fatos abaixo não identificam qual organização é a FLERNK operacional. Há quatro organizações: três candidatas com o nome Flernk, cada uma com um perfil e nenhum atleta, e uma explicitamente rotulada “Demonstração”, com seis perfis e cinco atletas. O rótulo permite reconhecer a organização de demonstração, mas não autoriza excluí-la. Nenhuma organização, perfil ou atleta é classificado como real, teste ou migrável sem confirmação expressa dos Sócios FLERNK.

O gate externo obrigatório antes de qualquer migration de dados ou carga é a confirmação, pelos Sócios FLERNK, da organização de destino e do conjunto de dados aprovado. Até então, migrations estruturais futuras permanecem aditivas e não selecionam linhas existentes por inferência.

## Snapshot observado

| Aspecto | Fato observado | Classificação pendente |
| --- | --- | --- |
| Segurança e versão | 20 tabelas públicas com RLS e 13 migrations até `20260829221000_invitation_delete_policy.sql` | Comparação integral entre schema remoto e local antes de qualquer execução futura |
| Pessoas e identidade | 9 perfis, 4 treinadores e 5 atletas | Vínculo de cada registro à FLERNK e qualidade dos cadastros |
| Operação de treino | 4 treinos, 5 atribuições e 1 execução | Se algum histórico deve acompanhar a virada |
| Convites | 1 convite | Estado, destinatário e necessidade de reaproveitamento |
| Catálogos | 15 exercícios e 10 tipos de treino | Curadoria e titularidade para a organização confirmada |
| Financeiro e comunicação | Tabelas operacionais estendidas, financeiras e de comunicação sem linhas | Saldo inicial, planos, cobranças, pagamentos, preferências e origem externa |
| Arquivos externos | Nenhuma planilha CSV, ODS ou XLSX de importação no repositório | Ferramenta atual, extratos e exportações entregues pelos Sócios FLERNK |

## Matriz de origem, decisão e destino

| Domínio | Origem observada | Decisão | Destino no MVP | Justificativa e task responsável |
| --- | --- | --- | --- | --- |
| Organização | `assessorias` | adaptar | Uma organização FLERNK confirmada, preservando `assessoria_id` interno | Evita migração destrutiva; confirmação externa antes de Tasks 06 e 28 |
| Perfis e papéis | `profiles`, enum `papel_usuario` com `treinador` e `atleta` | substituir | Identidade autenticada separada de membro/equipe, aluno e papéis sócio/professor/aluno | O modelo atual não representa os dois sócios; Tasks 06–08 |
| Treinadores e equipe | `treinadores`, bootstrap público de `treinador` | substituir | Membros da equipe e papéis explícitos; provisionamento controlado por convite | `treinador` hoje mistura sócio e professor; Tasks 06–08 |
| Atletas | `atletas`, `atletas_operacionais`, equipamento e avaliações | adaptar | Cadastro administrativo de aluno, dados operacionais, equipamentos e histórico esportivo vinculados à matrícula | `atletas.id = profiles.id` exige login e impede aluno administrativo sem login; separar identidade de cadastro nas Tasks 06 e 10 |
| Dados operacionais | `atletas_operacionais`, `tenis_atletas`, `tenis_execucoes`, `testes_desempenho`, `referencias_ritmo_atribuicoes` | adaptar | Dados operacionais e módulos esportivos secundários, associados ao aluno administrativo | Preservar após validação por origem e titularidade; Tasks 10 e 25 |
| Treinos e agendas | `treinos`, `treinos_atletas`, `execucoes_treino`, exercícios e tipos | reutilizar | Módulo secundário de prescrição, atribuição, agenda e execução | Há dados observados e o MVP preserva treinos; recorrência de turmas/encontros é módulo novo nas Tasks 12–13 |
| Convites | `convites_atletas` | substituir | Convites de equipe e de aluno vinculados a cadastro preexistente | Fluxo atual cria atleta ao aceitar e depende de login; Tasks 08 e 10 |
| Financeiro | `assinaturas_atletas`, `cobrancas`, `eventos_financeiros` | adaptar | Planos, assinaturas, cobranças, pagamentos auditáveis e eventos do provedor | Estruturas existem, mas pagamento, histórico contratual e restrição de sócio ainda faltam; Tasks 14–20 |
| Comunicação | `preferencias_comunicacao`, `lembretes_cobranca` | adaptar | Preferências, templates, fila persistente, tentativas e eventos de entrega | Não há linhas; provedor e conta seguem externos; Tasks 22–23 |
| Catálogos | `exercicios_catalogo`, `tipos_treino_catalogo` | reutilizar | Catálogos de treino da organização confirmada | Há conteúdo observável, mas nenhuma associação automática a uma organização sem validação |
| Legado sem destino ativo | Cadastros/organizações não confirmados e dados não selecionados | arquivar após validação | Mantidos isolados e preservados até decisão documentada | Nenhuma exclusão, fusão ou reatribuição por esta task |

## Módulos e entidades que precisam ser criados

As tabelas existentes não cobrem, ou não cobrem com a separação requerida, os seguintes elementos: membros e papéis; cadastro de aluno desacoplado de identidade; matrículas e histórico; planos; pagamentos; despesas e movimentações; turmas; encontros; presenças; justificativas; interessados; eventos do provedor; e fila persistente. A criação é aditiva e pertence às Tasks 06, 10–18, 20, 22–23 e 26, conforme o domínio.

Também é necessária a correção de acesso: o papel genérico `treinador` concede acesso amplo, inclusive às estruturas financeiras atuais. A separação entre sócio e professor, a autorização no banco e no servidor, e o indicador financeiro agregado do professor pertencem às Tasks 06–08; esta task não altera políticas nem dados.

## Estratégia de deduplicação e importação

1. Receber dos Sócios FLERNK a identificação da organização e os arquivos/exportações autorizados; registrar responsável, origem, data e escopo do lote.
2. Carregar primeiro em staging isolado, com identificador de lote e chave de origem por registro. Nunca usar nome, e-mail ou telefone como chave definitiva sem regra documentada de normalização e revisão.
3. Normalizar contatos e campos comparáveis, preservar o valor de origem e produzir candidatos a duplicidade para decisão humana. Conflitos não são fundidos automaticamente.
4. Executar dry-run que valide referências, obrigatórios, formatos, competência financeira e contagens; gerar relatório de aceitos, rejeitados, advertências e motivos sem expor PII em versionamento.
5. Importar somente registros aprovados, gravando chave de origem e lote de importação para idempotência. Uma reexecução deve atualizar/ignorar somente o mesmo registro de origem, nunca criar duplicidade.
6. Reconciliar contagens e totais com a fonte autorizada, obter aceite e preservar staging, relatório e trilha de auditoria pelo período definido na virada.

Não há deleção automática, fusão automática, sobrescrita silenciosa ou classificação automática de dados existentes.

## Ordem de migração e rollback em alto nível

1. Confirmar organização, escopo, fonte, backup/restauração e ambiente de homologação.
2. Aplicar migrations estruturais aditivas e validar schema, RLS e permissões em ambiente descartável ou homologação, sem carga real.
3. Criar o lote de staging, executar dry-run, tratar rejeições e aprovar o relatório.
4. Migrar primeiro identidade/membros e cadastros administrativos; depois matrículas, planos e financeiro; em seguida turmas, encontros, presenças, treinos e histórico; por fim preferências, interessados e filas. Cada etapa reconcilia referências e totais antes da próxima.
5. Só após validação completa, habilitar integrações e a operação de produção conforme Tasks 31–32.

Rollback significa interromper a carga, desabilitar as novas rotas/integrações e restaurar o ambiente a partir do backup verificado ou reverter o lote por sua trilha de auditoria. Migrations já aplicadas não são apagadas: correções são novas migrations aditivas. Dados de origem e registros legados permanecem preservados até validação humana.

## Dados externos ainda necessários

| Entrada dos Sócios FLERNK | Uso | Tasks afetadas |
| --- | --- | --- |
| Identificação explícita da organização FLERNK e dos cadastros autorizados | Seleção segura de origem e destino | 02, 06, 08, 28, 32 |
| Exportação da ferramenta atual, planilhas, qualidade/origem e volume dos alunos | Staging, deduplicação e carga de ensaio | 02, 10, 28, 32 |
| Planos, condições contratadas, valores, vencimentos, histórico de pagamento e saldo inicial | Reconciliação financeira e importação | 02, 14–18, 28, 32 |
| Turmas, locais, horários, vínculo do professor e histórico de presença | Migração operacional e homologação | 02, 12–13, 25, 28 |
| Aceite dos relatórios de dry-run e carga | Liberação da virada | 28, 30–32 |

## Critérios de saída da Task 02

- Cada domínio observado tem decisão e destino explícitos na matriz.
- Nenhuma organização, perfil ou atleta é identificado como real/teste por inferência; o único rótulo usado é “Demonstração”, conforme o dado observado.
- O acoplamento atual de identidade e atleta, a sobrecarga de `treinador` e o acesso financeiro amplo estão atribuídos às tasks corretas.
- A importação futura é por staging, lote, chave de origem, dry-run e idempotência, sem exclusão automática.
