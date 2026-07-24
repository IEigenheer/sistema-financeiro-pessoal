# Data Model: Nucleo de Controle Financeiro Pessoal

## Global Conventions

- **Moeda padrao**: Real brasileiro (`BRL`)
- **Locale de exibicao**: `pt-BR`
- **Timezone de referencia do backend**: `America/Sao_Paulo`
- **Dinheiro persistido**: `NUMERIC(19,2)`
- **Taxas persistidas**: `NUMERIC(12,8)`
- **Dinheiro em aplicacao**: `Prisma.Decimal` (ou wrapper equivalente baseado nele)
- **Dinheiro na API**: string decimal com duas casas (`"1234.56"`)
- **Datas financeiras**: `DATE`, serializadas como `YYYY-MM-DD`
- **Competencia mensal**: `DATE` no primeiro dia do mes (`YYYY-MM-01`)
- **Valores informados pelo usuario**: sempre positivos; o sentido financeiro deriva do tipo e da direcao do movimento
- **Validacao de sinal**: valores monetarios negativos sao rejeitados no frontend e no backend
- **Correcao e estorno**: devem ocorrer por operacoes explicitas do dominio, nunca por numeros negativos ambiguos

## Enums Principais

### EntryStatus
- `PLANNED`
- `REALIZED`
- `CANCELED`

### EntryKind
- `SALARY_INSTALLMENT`
- `EXTRA_INCOME`
- `FIXED_EXPENSE_OCCURRENCE`
- `VARIABLE_EXPENSE`
- `INSTALLMENT_CHARGE`

### EntryDirection
- `INFLOW`
- `OUTFLOW`

### EntryOrigin
- `MANUAL`
- `SYSTEM_SALARY`
- `RECURRENCE_RULE`
- `INSTALLMENT_PLAN`
- `START_DATE_RECALCULATION`

### InvestmentMovementType
- `CONTRIBUTION`
- `YIELD`
- `WITHDRAWAL`
- `MANUAL_ADJUSTMENT`

### AdjustmentTarget
- `OPERATIONAL_BALANCE`
- `INVESTMENT_BALANCE`

### AdjustmentDirection
- `INCREASE`
- `DECREASE`

### InstallmentPlanStatus
- `ACTIVE`
- `CANCELED`
- `COMPLETED`

### InstallmentItemStatus
- `OPEN`
- `REALIZED`
- `CANCELED`

### RecurrenceRuleStatus
- `ACTIVE`
- `INACTIVE`

### MonthlyCompetencyStatus
- `MATERIALIZED`
- `STALE`

### AuditOperation
- `CREATE`
- `UPDATE`
- `CANCEL`
- `REALIZE`
- `RECALCULATE`
- `MATERIALIZE`

## Entity: FinancialSettings

### Purpose
Armazena a configuracao financeira ativa do controle.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| controlStartDate | DATE | limite funcional obrigatorio |
| monthlyNetSalary | NUMERIC(19,2) | positivo |
| firstSalaryInstallmentAmount | NUMERIC(19,2) | positivo, preservado exatamente |
| firstSalaryInstallmentDay | SMALLINT | 1..31 |
| defaultMonthlyContribution | NUMERIC(19,2) | positivo ou zero |
| projectedMonthlyInvestmentYieldRate | NUMERIC(12,8) | pode ser zero |
| initialOperationalBalance | NUMERIC(19,2) | pode ser zero |
| initialInvestmentBalance | NUMERIC(19,2) | pode ser zero |
| active | BOOLEAN | apenas uma configuracao ativa |
| createdAt | TIMESTAMP WITH TIME ZONE | auditoria tecnica |
| updatedAt | TIMESTAMP WITH TIME ZONE | auditoria tecnica |

### Constraints
- `monthlyNetSalary >= firstSalaryInstallmentAmount`
- `firstSalaryInstallmentDay BETWEEN 1 AND 31`
- apenas uma linha ativa por vez
- segunda parcela e derivada e nao persistida como campo independente de configuracao

### Indexes
- unique parcial em `(active)` quando `active = true`

## Entity: Category

### Purpose
Classifica apenas despesas sem perder historico.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(120) | nome exibido |
| normalizedName | VARCHAR(120) | para unicidade/case-insensitive |
| active | BOOLEAN | desativacao preserva historico |
| createdAt | TIMESTAMP WITH TIME ZONE | |
| updatedAt | TIMESTAMP WITH TIME ZONE | |

### Constraints
- `name` obrigatorio
- desativacao permitida mesmo com uso historico
- exclusao fisica proibida quando houver referencia
- receitas nao referenciam `Category`; classificacao de receita usa `EntryKind`

### Indexes
- unique parcial em `(normalizedName)` para categorias ativas

## Entity: MonthlyCompetency

### Purpose
Representa um mes materializado sob demanda e o estado de geracao automatica.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| monthStart | DATE | sempre primeiro dia do mes |
| status | ENUM(`MATERIALIZED`,`STALE`) | |
| materializationVersion | INTEGER | inicia em 1 |
| lastMaterializedAt | TIMESTAMP WITH TIME ZONE | |
| materializationReason | VARCHAR(64) | ex.: `VIEW`, `ENTRY_MUTATION`, `SETTINGS_CHANGE` |

### Constraints
- `EXTRACT(DAY FROM monthStart) = 1`

### Indexes
- unique em `(monthStart)`

## Entity: RecurrenceRule

### Purpose
Define despesas fixas recorrentes que geram ocorrencias mensais.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| description | VARCHAR(255) | generica |
| categoryId | UUID FK -> Category | obrigatorio |
| defaultAmount | NUMERIC(19,2) | positivo |
| dueDay | SMALLINT | 1..31 |
| startDate | DATE | obrigatorio |
| endDate | DATE nullable | opcional |
| status | ENUM(`ACTIVE`,`INACTIVE`) | |
| createdAt | TIMESTAMP WITH TIME ZONE | |
| updatedAt | TIMESTAMP WITH TIME ZONE | |

### Constraints
- `defaultAmount > 0`
- `dueDay BETWEEN 1 AND 31`
- `endDate IS NULL OR endDate >= startDate`

### Indexes
- index em `(status, startDate, endDate)`
- index em `(categoryId)`

## Entity: FinancialEntry

### Purpose
Armazena receitas e despesas em um unico modelo com planned/realized no mesmo registro.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| kind | EntryKind | semantica de negocio |
| direction | EntryDirection | `INFLOW` para receitas, `OUTFLOW` para despesas |
| status | EntryStatus | planned/realized/canceled |
| description | VARCHAR(255) | generica |
| normalizedDescription | VARCHAR(255) | suporte a duplicidade |
| categoryId | UUID FK -> Category nullable | obrigatorio apenas para despesas |
| competencyMonth | DATE FK -> MonthlyCompetency.monthStart | primeiro dia do mes |
| plannedDate | DATE | obrigatorio |
| effectiveDate | DATE nullable | preserva data original se so valor mudar |
| plannedAmount | NUMERIC(19,2) | positivo |
| effectiveAmount | NUMERIC(19,2) nullable | positivo |
| origin | EntryOrigin | manual/automatico |
| recurrenceRuleId | UUID FK -> RecurrenceRule nullable | origem de despesa fixa |
| installmentPlanId | UUID FK -> InstallmentPlan nullable | origem de parcelamento |
| installmentItemId | UUID FK -> InstallmentItem nullable | origem especifica da parcela |
| duplicateCheckFingerprint | VARCHAR(255) | hash tecnico para warning |
| generationKey | VARCHAR(255) nullable | idempotencia de ocorrencias automaticas |
| createdAt | TIMESTAMP WITH TIME ZONE | |
| updatedAt | TIMESTAMP WITH TIME ZONE | |
| canceledAt | TIMESTAMP WITH TIME ZONE nullable | |

### Constraints
- `plannedAmount > 0`
- `effectiveAmount IS NULL OR effectiveAmount > 0`
- `status = REALIZED` exige `effectiveDate` e `effectiveAmount`
- `status = PLANNED` mantem o mesmo evento logico ate eventual realizacao
- `kind IN (SALARY_INSTALLMENT, EXTRA_INCOME)` exige `direction = INFLOW` e `categoryId IS NULL`
- `kind IN (FIXED_EXPENSE_OCCURRENCE, VARIABLE_EXPENSE, INSTALLMENT_CHARGE)` exige `direction = OUTFLOW` e `categoryId IS NOT NULL`
- um lancamento planejado torna-se realizado por atualizacao do mesmo registro

### Indexes
- index composto em `(competencyMonth, kind, status)`
- index em `(plannedDate)`
- index em `(effectiveDate)`
- index em `(categoryId, competencyMonth)`
- unique parcial em `(generationKey)` quando `generationKey IS NOT NULL`
- index em `(normalizedDescription, plannedAmount, plannedDate)` para duplicidade preventiva

### States & Transitions
- `PLANNED -> REALIZED`
- `PLANNED -> CANCELED`
- `REALIZED` nao volta para `PLANNED`; correcoes editam campos efetivos e geram audit trail
- `CANCELED` permanece historico, sem exclusao fisica

## Entity: InstallmentPlan

### Purpose
Representa a compra parcelada original.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| description | VARCHAR(255) | generica |
| categoryId | UUID FK -> Category | obrigatorio |
| totalAmount | NUMERIC(19,2) | positivo |
| installmentCount | SMALLINT | > 0 |
| installmentAmount | NUMERIC(19,2) | positivo |
| purchaseDate | DATE | obrigatorio |
| firstInstallmentMonth | DATE | primeiro dia do mes |
| paymentMethod | VARCHAR(80) | texto controlado |
| status | InstallmentPlanStatus | |
| remainingAmount | NUMERIC(19,2) | derivado e persistivel para leitura |
| createdAt | TIMESTAMP WITH TIME ZONE | |
| updatedAt | TIMESTAMP WITH TIME ZONE | |
| canceledAt | TIMESTAMP WITH TIME ZONE nullable | |

### Constraints
- `installmentCount > 0`
- `totalAmount > 0`
- `installmentAmount > 0`
- `firstInstallmentMonth` sempre no primeiro dia do mes

### Indexes
- index em `(status, firstInstallmentMonth)`
- index em `(categoryId)`

### States & Transitions
- `ACTIVE -> COMPLETED`
- `ACTIVE -> CANCELED`
- `COMPLETED` imutavel para geracao de novas parcelas
- `CANCELED` mantem historico e cancela apenas parcelas futuras abertas

## Entity: InstallmentItem

### Purpose
Representa cada parcela materializada de um parcelamento.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| planId | UUID FK -> InstallmentPlan | obrigatorio |
| installmentNumber | SMALLINT | 1..N |
| competencyMonth | DATE FK -> MonthlyCompetency.monthStart | mes de cobranca |
| amount | NUMERIC(19,2) | positivo |
| status | InstallmentItemStatus | |
| financialEntryId | UUID FK -> FinancialEntry nullable | ocorrencia financeira associada |
| createdAt | TIMESTAMP WITH TIME ZONE | |
| updatedAt | TIMESTAMP WITH TIME ZONE | |

### Constraints
- `amount > 0`
- `installmentNumber BETWEEN 1 AND installmentCount`

### Indexes
- unique em `(planId, installmentNumber)`
- unique parcial em `(planId, competencyMonth)`
- index em `(status, competencyMonth)`

### States & Transitions
- `OPEN -> REALIZED`
- `OPEN -> CANCELED`
- `REALIZED` e historico imutavel

## Entity: InvestmentMovement

### Purpose
Armazena aportes, rendimentos, resgates e ajustes manuais.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| movementType | InvestmentMovementType | |
| status | EntryStatus | planned/realized/canceled |
| competencyMonth | DATE FK -> MonthlyCompetency.monthStart | primeiro dia do mes |
| plannedDate | DATE | obrigatorio |
| effectiveDate | DATE nullable | |
| plannedAmount | NUMERIC(19,2) | positivo |
| effectiveAmount | NUMERIC(19,2) nullable | positivo |
| adjustmentTarget | AdjustmentTarget nullable | obrigatorio apenas para ajuste manual |
| adjustmentDirection | AdjustmentDirection nullable | obrigatorio apenas para ajuste manual |
| description | VARCHAR(255) | generica |
| origin | VARCHAR(64) | `MANUAL`, `DEFAULT_CONTRIBUTION`, `SYSTEM_YIELD` |
| generationKey | VARCHAR(255) nullable | idempotencia automatica |
| createdAt | TIMESTAMP WITH TIME ZONE | |
| updatedAt | TIMESTAMP WITH TIME ZONE | |
| canceledAt | TIMESTAMP WITH TIME ZONE nullable | |

### Constraints
- `plannedAmount > 0`
- `effectiveAmount IS NULL OR effectiveAmount > 0`
- `movementType = MANUAL_ADJUSTMENT` exige `adjustmentTarget` e `adjustmentDirection`
- `movementType != MANUAL_ADJUSTMENT` exige `adjustmentTarget IS NULL` e `adjustmentDirection IS NULL`
- `movementType = YIELD` nao altera saldo operacional
- `movementType = WITHDRAWAL` reduz investimentos e aumenta operacional
- `movementType = CONTRIBUTION` reduz operacional e aumenta investimentos
- `adjustmentDirection = INCREASE` representa acrescimo explicito no saldo escolhido
- `adjustmentDirection = DECREASE` representa reducao explicita no saldo escolhido

### Indexes
- index em `(competencyMonth, movementType, status)`
- unique parcial em `(generationKey)` quando nao nulo

### States & Transitions
- `PLANNED -> REALIZED`
- `PLANNED -> CANCELED`
- `REALIZED` permite correcao de valor/data efetivos com auditoria

## Entity: AuditEvent

### Purpose
Registra mudancas relevantes para rastreabilidade financeira.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| entityName | VARCHAR(80) | ex.: `FinancialEntry` |
| entityId | UUID | identificador do alvo |
| operation | AuditOperation | |
| beforeSnapshot | JSONB | opcional em create |
| afterSnapshot | JSONB | opcional em cancel |
| changeOrigin | VARCHAR(32) | `local-user` ou `system` |
| occurredAt | TIMESTAMP WITH TIME ZONE | |

### Indexes
- index em `(entityName, entityId, occurredAt DESC)`
- index em `(operation, occurredAt DESC)`

## Entity: IdempotencyKey

### Purpose
Evita duplicidade tecnica em requisicoes repetidas da API.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| key | VARCHAR(128) | valor do header |
| endpoint | VARCHAR(128) | rota alvo |
| requestHash | VARCHAR(128) | payload normalizado |
| responseStatus | SMALLINT | ultimo status retornado |
| responseBody | JSONB | resposta serializada |
| createdAt | TIMESTAMP WITH TIME ZONE | |
| expiresAt | TIMESTAMP WITH TIME ZONE | TTL opcional |

### Constraints
- chave unica por endpoint
- mesma chave com payload divergente deve retornar erro de conflito

### Indexes
- unique em `(key, endpoint)`
- index em `(expiresAt)`

## Relationships Summary

- `FinancialSettings` 1 ativo por ambiente logico
- `Category` 1:N `RecurrenceRule`
- `Category` 1:N `FinancialEntry` apenas para despesas
- `RecurrenceRule` 1:N `FinancialEntry` (ocorrencias automaticas)
- `InstallmentPlan` 1:N `InstallmentItem`
- `InstallmentItem` 1:1 `FinancialEntry` (quando materializada como cobranca do mes)
- `MonthlyCompetency` 1:N `FinancialEntry`
- `MonthlyCompetency` 1:N `InvestmentMovement`
- `MonthlyCompetency` 1:N `InstallmentItem`
- `AuditEvent` referencia entidades por `entityName` + `entityId`

## Materializacao Mensal Sob Demanda

1. Receber uma competencia (`YYYY-MM-01`) por leitura ou mutacao.
2. Validar que a competencia e maior ou igual ao `controlStartDate` truncado para o primeiro dia do mes quando a geracao automatica for aplicavel.
3. Se a competencia for anterior ao inicio do controle, retornar contexto mensal fora do periodo iniciado sem gerar lancamentos automaticos.
4. Fazer `upsert` de `MonthlyCompetency` quando a competencia estiver dentro do periodo iniciado.
5. Em transacao:
   - gerar duas receitas salariais automaticas do mes;
   - gerar ocorrencias de `RecurrenceRule` ativas;
   - gerar `InstallmentItem` e `FinancialEntry` vinculadas para parcelamentos ativos;
   - gerar o aporte padrao planejado do mes como `InvestmentMovement`, se configurado;
   - recalcular `remainingAmount` dos parcelamentos impactados.
6. Usar `generationKey` derivada de origem + competencia + versao da regra para garantir idempotencia.
7. Nunca pre-criar meses indefinidamente; meses futuros so surgem quando solicitados.
8. Meses vazios podem existir como `MonthlyCompetency` sem lancamentos, preservando visao consistente e sem duplicacoes.

## Balance Calculation Strategy

- **Saldo operacional** = saldo inicial operacional + receitas realizadas - despesas realizadas - aportes realizados + resgates realizados +/- ajustes operacionais realizados.
- **Saldo de investimentos** = saldo inicial de investimentos + aportes realizados + rendimentos realizados - resgates realizados +/- ajustes de investimentos realizados.
- **Patrimonio principal exibido** = apenas saldo de investimentos.
- **Diferenca previsto x realizado** = agregacao por competencia comparando `plannedAmount` vs `effectiveAmount` no mesmo conjunto logico de eventos.

## Transition Rules Worth Testing

- Alterar `controlStartDate` so e permitido sem lancamentos realizados antes da nova data.
- Realizacao de lancamento preserva o mesmo registro e gera `AuditEvent`.
- Correcao apenas de `effectiveAmount` preserva `effectiveDate` se esta nao for explicitamente alterada.
- Edicao de `InstallmentPlan` so recalcula `InstallmentItem` futuras `OPEN`.
- Cancelamento de parcelamento marca futuras `OPEN` como `CANCELED` e mantem `REALIZED` intactas.
- Resgates e aportes devem ocorrer em transacao por alterarem dois saldos.
- Ajustes manuais exigem `adjustmentTarget` e `adjustmentDirection` explicitos.
- Nenhum fluxo de correcao ou estorno usa valor monetario negativo como atalho semantico.

