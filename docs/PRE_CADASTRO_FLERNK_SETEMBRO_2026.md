# Pré-cadastro FLERNK — setembro/2026

O migration `20260912150000_flernk_preregistration_september.sql` carrega o roster informado pelo cliente na assessoria principal da FLERNK (`b8b49b94-ce66-49b6-8e4c-2dd98081abcf`).

| Turma | Alunos |
| --- | ---: |
| Turma Adaptado | 8 |
| Turma 1 — Iniciantes | 8 |
| Turma 2 — Iniciantes Intermediários | 16 |
| Turma 3 — Iniciantes Avançados | 12 |
| **Total** | **44** |

O status informado pelo cliente fica registrado na observação do cadastro, com competência setembro/2026 e referência de R$ 109,90: 16 alunos pagos e 28 pendentes. Isso é somente um pré-cadastro operacional; não cria cobrança, pagamento, baixa ou movimento de caixa oficial.

Cada aluno recebe matrícula ativa com início em 01/09/2026 e vínculo à sua turma para permitir a operação administrativa. O script usa verificações de existência por assessoria e nome/turma, portanto pode ser reaplicado sem duplicar alunos, matrículas ou vínculos.

Esta carga não encerra a Task 28: a importação financeira oficial continua dependendo do motor de cobranças, reconciliação e validação da FLERNK.
