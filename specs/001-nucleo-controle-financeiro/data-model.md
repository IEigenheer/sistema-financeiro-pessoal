# Data Model: Núcleo de Controle Financeiro Pessoal

## Global Conventions

- **Moeda padrão**: Real brasileiro (`BRL`)
- **Locale de exibição**: `pt-BR`
- **Timezone de referência do backend**: `America/Sao_Paulo`
- **Dinheiro persistido**: `NUMERIC(19,2)`
- **Taxas persistidas**: `NUMERIC(12,8)`
- **Dinheiro em aplicação**: `Prisma.Decimal` (ou wrapper equivalente baseado nele)
- **Dinheiro na API**: string decimal com duas casas (`"1234.56"`)
- **Datas financeiras**: `DATE`, serializadas como `YYYY-MM-DD`
- **Competência mensal**: `DATE` no primeiro dia do mês (`YYYY-MM-01`)
- **Valores informados pelo usuário**: sempre positivos; o sentido financeiro deriva do tipo/direção

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
Armazena a configuração financeira ativa do controle.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| controlStartDate | DATE | limite funcional obrigatório |
| monthlyNetSalary | NUMERIC(19,2) | positivo |
| firstSalaryInstallmentAmount | NUMERIC(19,2) | positivo, preservado exatamente |
| firstSalaryInstallmentDay | SMALLINT | 1..31 |
| defaultMonthlyContribution | NUMERIC(19,2) | positivo ou zero |
| projectedMonthlyInvestmentRate | NUMERIC(12,8) | pode ser zero |
| initialOperationalBalance | NUMERIC(19,2) | pode ser zero |
| initialInvestmentBalance | NUMERIC(19,2) | pode ser zero |
| active | BOOLEAN | apenas uma configuração ativa |
| createdAt | TIMESTAMP WITH TIME ZONE | auditoria técnica |
| updatedAt | TIMESTAMP WITH TIME ZONE | auditoria técnica |

### Constraints
- `monthlyNetSalary >= firstSalaryInstallmentAmount`
- `firstSalaryInstallmentDay BETWEEN 1 AND 31`
- apenas uma linha ativa por vez
- segunda parcela é derivada e não persistida como campo independente de configuração

### Indexes
- unique parcial em `(active)` quando `active = true`

## Entity: Category

### Purpose
Classifica despesas e outros lançamentos relevantes sem perder histórico.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(120) | nome exibido |
| normalizedName | VARCHAR(120) | para unicidade/case-insensitive |
| categoryType | ENUM(`EXPENSE`) | pode evoluir depois |
| active | BOOLEAN | desativação preserva histórico |
| createdAt | TIMESTAMP WITH TIME ZONE | |
| updatedAt | TIMESTAMP WITH TIME ZONE | |

### Constraints
- `name` obrigatório
- desativação permitida mesmo com uso histórico
- exclusão física proibida quando houver referência

### Indexes
- unique parcial em `(normalizedName)` para categorias ativas

## Entity: MonthlyCompetency

### Purpose
Representa um mês materializado sob demanda e o estado de geração automática.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| monthStart | DATE | sempre primeiro dia do mês |
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
Define despesas fixas recorrentes que geram ocorrências mensais.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| description | VARCHAR(255) | genérica |
| categoryId | UUID FK -> Category | obrigatório |
| defaultAmount | NUMERIC(19,2) | positivo |
| dueDay | SMALLINT | 1..31 |
| startDate | DATE | obrigatório |
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
Armazena receitas e despesas em um único modelo com planned/realized no mesmo registro.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| kind | EntryKind | semântica de negócio |
| direction | EntryDirection | `INFLOW` para receitas, `OUTFLOW` para despesas |
| status | EntryStatus | planned/realized/canceled |
| description | VARCHAR(255) | genérica |
| normalizedDescription | VARCHAR(255) | suporte a duplicidade |
| categoryId | UUID FK -> Category nullable | obrigatório para despesas |
| competencyMonth | DATE FK -> MonthlyCompetency.monthStart | primeiro dia do mês |
| plannedDate | DATE | obrigatório |
| effectiveDate | DATE nullable | preserva data original se só valor mudar |
| plannedAmount | NUMERIC(19,2) | positivo |
| effectiveAmount | NUMERIC(19,2) nullable | positivo |
| origin | EntryOrigin | manual/automático |
| recurrenceRuleId | UUID FK -> RecurrenceRule nullable | origem de despesa fixa |
| installmentPlanId | UUID FK -> InstallmentPlan nullable | origem de parcelamento |
| installmentItemId | UUID FK -> InstallmentItem nullable | origem específica da parcela |
| duplicateCheckFingerprint | VARCHAR(255) | hash técnico para warning |
| generationKey | VARCHAR(255) nullable | idempotência de ocorrências automáticas |
| createdAt | TIMESTAMP WITH TIME ZONE | |
| updatedAt | TIMESTAMP WITH TIME ZONE | |
| canceledAt | TIMESTAMP WITH TIME ZONE nullable | |

### Constraints
- `plannedAmount > 0`
- `effectiveAmount IS NULL OR effectiveAmount > 0`
- `status = REALIZED` exige `effectiveDate` e `effectiveAmount`
- `status = PLANNED` mantém o mesmo evento lógico até eventual realização
- um lançamento planejado torna-se realizado por atualização do mesmo registro

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
- `REALIZED` não volta para `PLANNED`; correções editam campos efetivos e geram audit trail
- `CANCELED` permanece histórico, sem exclusão física

## Entity: InstallmentPlan

### Purpose
Representa a compra parcelada original.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| description | VARCHAR(255) | genérica |
| categoryId | UUID FK -> Category | obrigatório |
| totalAmount | NUMERIC(19,2) | positivo |
| installmentCount | SMALLINT | > 0 |
| installmentAmount | NUMERIC(19,2) | positivo |
| purchaseDate | DATE | obrigatório |
| firstInstallmentMonth | DATE | primeiro dia do mês |
| paymentMethod | VARCHAR(80) | texto controlado |
| status | InstallmentPlanStatus | |
| remainingAmount | NUMERIC(19,2) | derivado e persistível para leitura |
| createdAt | TIMESTAMP WITH TIME ZONE | |
| updatedAt | TIMESTAMP WITH TIME ZONE | |
| canceledAt | TIMESTAMP WITH TIME ZONE nullable | |

### Constraints
- `installmentCount > 0`
- `totalAmount > 0`
- `installmentAmount > 0`
- `firstInstallmentMonth` sempre no primeiro dia do mês

### Indexes
- index em `(status, firstInstallmentMonth)`
- index em `(categoryId)`

### States & Transitions
- `ACTIVE -> COMPLETED`
- `ACTIVE -> CANCELED`
- `COMPLETED` imutável para geração de novas parcelas
- `CANCELED` mantém histórico e cancela apenas parcelas futuras abertas

## Entity: InstallmentItem

### Purpose
Representa cada parcela materializada de um parcelamento.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| planId | UUID FK -> InstallmentPlan | obrigatório |
| installmentNumber | SMALLINT | 1..N |
| competencyMonth | DATE FK -> MonthlyCompetency.monthStart | mês de cobrança |
| amount | NUMERIC(19,2) | positivo |
| status | InstallmentItemStatus | |
| financialEntryId | UUID FK -> FinancialEntry nullable | ocorrência financeira associada |
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
- `REALIZED` é histórico imutável
## Entity: InvestmentMovement

### Purpose
Armazena aportes, rendimentos, resgates e ajustes manuais.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| movementType | InvestmentMovementType | |
| status | EntryStatus | planned/realized/canceled |
| competencyMonth | DATE FK -> MonthlyCompetency.monthStart | primeiro dia do mês |
| plannedDate | DATE | obrigatório |
| effectiveDate | DATE nullable | |
| plannedAmount | NUMERIC(19,2) | positivo |
| effectiveAmount | NUMERIC(19,2) nullable | positivo |
| adjustmentTarget | AdjustmentTarget nullable | obrigatório apenas para ajuste manual |
| description | VARCHAR(255) | genérica |
| origin | VARCHAR(64) | `MANUAL`, `DEFAULT_CONTRIBUTION`, `SYSTEM_YIELD` |
| generationKey | VARCHAR(255) nullable | idempotência automática |
| createdAt | TIMESTAMP WITH TIME ZONE | |
| updatedAt | TIMESTAMP WITH TIME ZONE | |
| canceledAt | TIMESTAMP WITH TIME ZONE nullable | |

### Constraints
- `plannedAmount > 0`
- `effectiveAmount IS NULL OR effectiveAmount > 0`
- `movementType = MANUAL_ADJUSTMENT` exige `adjustmentTarget`
- `movementType != MANUAL_ADJUSTMENT` exige `adjustmentTarget IS NULL`
- `movementType = YIELD` não altera saldo operacional
- `movementType = WITHDRAWAL` reduz investimentos e aumenta operacional
- `movementType = CONTRIBUTION` reduz operacional e aumenta investimentos

### Indexes
- index em `(competencyMonth, movementType, status)`
- unique parcial em `(generationKey)` quando não nulo

### States & Transitions
- `PLANNED -> REALIZED`
- `PLANNED -> CANCELED`
- `REALIZED` permite correção de valor/data efetivos com auditoria

## Entity: AuditEvent

### Purpose
Registra mudanças relevantes para rastreabilidade financeira.

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
Evita duplicidade técnica em requisições repetidas da API.

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| key | VARCHAR(128) | valor do header |
| endpoint | VARCHAR(128) | rota alvo |
| requestHash | VARCHAR(128) | payload normalizado |
| responseStatus | SMALLINT | último status retornado |
| responseBody | JSONB | resposta serializada |
| createdAt | TIMESTAMP WITH TIME ZONE | |
| expiresAt | TIMESTAMP WITH TIME ZONE | TTL opcional |

### Constraints
- chave única por endpoint
- mesma chave com payload divergente deve retornar erro de conflito

### Indexes
- unique em `(key, endpoint)`
- index em `(expiresAt)`

## Relationships Summary

- `FinancialSettings` 1 ativo por ambiente lógico
- `Category` 1:N `RecurrenceRule`
- `Category` 1:N `FinancialEntry`
- `RecurrenceRule` 1:N `FinancialEntry` (ocorrências automáticas)
- `InstallmentPlan` 1:N `InstallmentItem`
- `InstallmentItem` 1:1 `FinancialEntry` (quando materializada como cobrança do mês)
- `MonthlyCompetency` 1:N `FinancialEntry`
- `MonthlyCompetency` 1:N `InvestmentMovement`
- `MonthlyCompetency` 1:N `InstallmentItem`
- `AuditEvent` referencia entidades por `entityName` + `entityId`

## Materialização Mensal Sob Demanda

1. Receber uma competência (`YYYY-MM-01`) por leitura ou mutação.
2. Validar que a competência é maior ou igual ao `controlStartDate` truncado para o primeiro dia do mês quando a geração automática for aplicável.
3. Fazer `upsert` de `MonthlyCompetency`.
4. Em transação:
   - gerar duas receitas salariais automáticas do mês;
   - gerar ocorrências de `RecurrenceRule` ativas;
   - gerar `InstallmentItem` e `FinancialEntry` vinculadas para parcelamentos ativos;
   - gerar o aporte padrão planejado do mês como `InvestmentMovement`, se configurado;
   - recalcular `remainingAmount` dos parcelamentos impactados.
5. Usar `generationKey` derivada de origem + competência + versão da regra para garantir idempotência.
6. Nunca pré-criar meses indefinidamente; meses futuros só surgem quando solicitados.
7. Meses vazios podem existir como `MonthlyCompetency` sem lançamentos, preservando visão consistente e sem duplicações.

## Balance Calculation Strategy

- **Saldo operacional** = saldo inicial operacional + receitas realizadas - despesas realizadas - aportes realizados + resgates realizados +/- ajustes operacionais realizados.
- **Saldo de investimentos** = saldo inicial de investimentos + aportes realizados + rendimentos realizados - resgates realizados +/- ajustes de investimentos realizados.
- **Patrimônio principal exibido** = apenas saldo de investimentos.
- **Diferença previsto x realizado** = agregação por competência comparando `plannedAmount` vs `effectiveAmount` no mesmo conjunto lógico de eventos.

## Transition Rules Worth Testing

- Alterar `controlStartDate` só é permitido sem lançamentos realizados antes da nova data.
- Realização de lançamento preserva o mesmo registro e gera `AuditEvent`.
- Correção apenas de `effectiveAmount` preserva `effectiveDate` se esta não for explicitamente alterada.
- Edição de `InstallmentPlan` só recalcula `InstallmentItem` futuras `OPEN`.
- Cancelamento de parcelamento marca futuras `OPEN` como `CANCELED` e mantém `REALIZED` intactas.
- Resgates e aportes devem ocorrer em transação por alterarem dois saldos.
