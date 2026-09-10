# Migração FLERNK para gestão administrativa e financeira

## Decisão de produto

A FLERNK é uma única assessoria esportiva. O site público divulga a assessoria e capta interessados; não vende software e não permite cadastro de outras assessorias. Após login, a experiência muda conforme o papel persistido no banco.

O módulo de treino está obsoleto. Nenhuma tela, menu, CTA, mensagem ou fluxo ativo fará referência a prescrição, calendário de treino, execução, desempenho, equipamentos ou quilometragem. As tabelas e o histórico legados permanecem preservados até uma migração de retenção explicitamente aprovada.

## Papéis e experiências

| Papel | Experiência autorizada |
| --- | --- |
| Sócio | Visão geral, financeiro completo, alunos, matrículas, turmas, frequência, interessados, equipe e configurações. |
| Professor | Alunos, turmas, encontros, chamada, faltas e indicador financeiro agregado. Não acessa valores, cobranças, pagamentos, despesas ou configurações financeiras. |
| Aluno | Próprio cadastro, matrícula, turma, frequência, faltas, cobranças e pagamentos. |

O indicador do professor entrega somente `em_dia`, `pendente`, `nao_configurado` ou `indisponivel`. A autorização é aplicada no banco e no servidor.

## Landing pública

A landing contém apresentação da FLERNK, proposta de valor, diferenciais confirmados, equipe/locais quando houver material real, formulário de interesse e CTAs “Quero correr com a FLERNK” e “Já sou aluno”. O formulário cria somente um interessado; não cria usuário, matrícula, assinatura ou cobrança.

## Estratégia de migração

1. Revisar documentos e navegação para declarar o novo produto e retirar treino da experiência visível.
2. Encerrar o bootstrap/cadastro público de assessoria e provisionar equipe por convite.
3. Construir os portais administrativo, operacional e do aluno usando as entidades do MVP já introduzidas.
4. Completar o financeiro, pagamento e comunicação.
5. Testar isolamento, autorização e jornadas em preview antes de promover produção.

## Critérios de aceite globais

- Nenhuma rota ativa ou menu apresenta treino.
- Visitante não cria assessoria; somente registra interesse.
- Sócio vê financeiro completo; professor vê somente o status agregado; aluno vê somente os próprios dados.
- Dados e tabelas de treino existentes não são apagados durante esta migração.
