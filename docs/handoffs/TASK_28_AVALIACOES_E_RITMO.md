# Task 28 - Avaliacoes de Desempenho e Referencias de Ritmo

Data: 29/08/2026

## Entrega

- Migration `202608290002_add_performance_assessments.sql` aplicada ao Supabase e tipos regenerados.
- `testes_desempenho` registra data, protocolo, ritmo de limiar, VAM e observacao para atletas vinculados ao treinador.
- O detalhe do atleta permite registrar avaliacoes e exibe a referencia atual e o historico.
- A migration cria um snapshot imutavel em `referencias_ritmo_atribuicoes` ao atribuir um treino, quando o atleta tiver uma avaliacao com medida. O snapshot preserva a referencia usada mesmo que haja avaliacao posterior.

## Referencias de planejamento

- As faixas sao identificadas como `Leve`, `Moderado`, `Limiar` e `Intenso` e sao revisaveis pelo treinador.
- Com ritmo de limiar, a versao 1 usa deslocamentos de +30/+60, +10/+30, -10/+10 e -30/-10 segundos por km.
- Com VAM, a versao 1 usa 60-70%, 70-80%, 80-90% e 90-100% da VAM em metros por minuto.
- Essas faixas sao referencias de planejamento, nao prescricao automatica, diagnostico ou garantia de desempenho/prevencao de lesao. A literatura mostra diferentes metodos para quantificar zonas; por isso a formula fica versionada no snapshot e a revisao humana continua obrigatoria.

## Seguranca

- FKs compostas garantem que atleta, treinador, avaliacao e atribuicao pertencam a mesma assessoria.
- RLS limita as avaliacoes ao treinador responsavel pelo atleta.
- O snapshot concede apenas leitura e insert para o contexto autorizado; nao ha action de alteracao nem exclusao.

## Validacao

- `npx supabase migration list --linked`: alinhado ate `202608290002`.
- `npx tsc --noEmit --pretty false`: aprovado.
- `git diff --check`: aprovado.
- Vitest focado: 2/2 aprovado para faixas de ritmo e VAM.

## Proximo passo

Concluir QA manual de atleta com avaliacao, atribuicao de novo treino e consulta do snapshot. Depois, planejar a proxima etapa de produto fora do roadmap atual ou fechar a Etapa 2 com regressao completa.
