# Implementation Plan: Núcleo de Controle Financeiro Pessoal

**Branch**: `001-nucleo-controle-financeiro` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-nucleo-controle-financeiro/spec.md`

**Note**: Este plano cobre apenas pesquisa e design da feature. Nenhum código funcional foi implementado e `tasks.md` não foi criado nesta etapa.

## Summary

Entregar a base técnica de um monorepo de finanças pessoais com `apps/web` em Next.js App Router, `apps/api` em NestJS, PostgreSQL via Docker Compose, contratos REST documentados em OpenAPI e modelagem orientada a domínio para configurações financeiras, lançamentos planejados/realizados, parcelamentos, aportes, rendimentos, resgates, dashboard e trilha de auditoria. A estratégia central é materializar ocorrências mensais sob demanda com idempotência, manter valores monetários exatos com `Decimal`, transportar dinheiro como strings decimais e separar claramente saldo operacional de patrimônio em investimentos.

## Technical Context

**Language/Version**: TypeScript 5.x em modo `strict`, Node.js 22 LTS

**Primary Dependencies**: Next.js (App Router), NestJS, Prisma ORM, PostgreSQL, pnpm workspaces, Docker Compose, OpenAPI/Swagger, Apache ECharts, Zod, React Hook Form

**Storage**: PostgreSQL 16 com Prisma migrations versionadas em `apps/api/prisma`

**Testing**: Jest + Supertest no backend, Vitest + React Testing Library no frontend, Playwright para E2E, testes de regressão financeira e idempotência sobre PostgreSQL real em ambiente de teste

**Target Platform**: Navegadores modernos no frontend e serviços Node.js containerizados localmente com `docker compose`

**Project Type**: Monorepo web application

**Performance Goals**: visão mensal consolidada em até 300 ms p95 no backend com base típica de uso pessoal; dashboard inicial em até 2 s com até 10 anos de histórico; materialização sob demanda de um mês em até 500 ms p95 sem duplicidades. Essas metas se aplicam à feature completa e devem ser validadas com dados fictícios e comandos reproduzíveis antes do encerramento total da feature, sem bloquear o checkpoint inicial do MVP da US1.

**Constraints**: interface em pt-BR, moeda BRL, timezone padrão `America/Sao_Paulo`, datas financeiras como `DATE`, transporte de datas `YYYY-MM-DD`, dinheiro sem `number`, arredondamento monetário `ROUND_HALF_UP`, sem Nx/Turborepo, sem autenticação nesta feature, sem dados reais da planilha no repositório

**Scale/Scope**: aplicação pessoal de usuário único, baixa concorrência humana, até dezenas de milhares de lançamentos ao longo de vários anos, com foco em corretude financeira e simplicidade operacional

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Financial values use exact monetary representation; binary floating point is excluded from balances, projections, and simulations.
- [x] Rounding rules, financial invariants, and projection traceability are defined and testable.
- [x] Business rules are isolated in NestJS domain/application services; controllers, route handlers, and React components remain orchestration/presentation only.
- [x] Frontend and backend validation, sensitive data handling, `.env.example`, and non-versioning of real spreadsheet/database artifacts are specified.
- [x] Database changes use Prisma migrations, `DATE` columns for financial dates, transaction boundaries for multi-saldo operations, and audit-safe soft preservation instead of destructive deletes.
- [x] Unit, integration, E2E, regression, rounding, idempotency, transaction, start-date, installment-change, and planned-vs-realized tests are identified.
- [x] Added dependencies are limited to the mandatory stack and justified by user requirements; no extra orchestration layer such as Nx/Turborepo is introduced.

## Project Structure

### Documentation (this feature)

```text
specs/001-nucleo-controle-financeiro/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
apps/
├── web/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   └── services/
│   └── tests/
├── api/
│   ├── prisma/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── financial-settings/
│   │   │   ├── categories/
│   │   │   ├── entries/
│   │   │   ├── recurrence-rules/
│   │   │   ├── installment-plans/
│   │   │   ├── investment-movements/
│   │   │   ├── monthly-overviews/
│   │   │   ├── dashboard/
│   │   │   ├── duplicate-check/
│   │   │   └── audit/
│   │   ├── common/
│   │   └── main.ts
│   └── tests/
├── packages/
│   ├── contracts/
│   └── config/
├── compose.yaml
└── AGENTS.md
```

**Structure Decision**: usar `packages/contracts` apenas para aliases e DTOs compartilháveis sem lógica de domínio, manter as regras financeiras no backend (`apps/api/src/modules/*/domain` e `application`) e usar `packages/config` somente para convenções compartilhadas de locale/timezone/tsconfig. Prisma pertence ao backend em `apps/api/prisma`, evitando raiz poluída e mantendo ownership claro do schema.

## Phase 0: Research Summary

- A stack obrigatória foi consolidada sem necessidade de Nx/Turborepo.
- A estratégia monetária foi fechada com PostgreSQL `NUMERIC(19,2)` para dinheiro e `NUMERIC(12,8)` para taxas, `Prisma.Decimal` no backend e strings decimais na API.
- A competência mensal foi definida como `DATE` no primeiro dia do mês, com materialização sob demanda e idempotente.
- A prevenção de duplicidade combinará alerta funcional com `Idempotency-Key` para evitar duplicidade técnica em POSTs repetidos.
- A modelagem foi simplificada para entidades centrais (`FinancialEntry` e `InvestmentMovement`) com planned/realized no mesmo registro, em vez de tabelas mensais ou entradas duplicadas.

## Phase 1: Design Summary

- `data-model.md` define entidades, restrições, índices, estados, transições, auditoria e materialização mensal.
- `contracts/openapi.yaml` cobre configurações, categorias, lançamentos, recorrências, parcelamentos, investimentos, consolidação, dashboard, auditoria, preview de impacto e detecção de duplicidade.
- `quickstart.md` descreve como o ambiente deverá ser executado posteriormente com `pnpm` + `docker compose`, sem afirmar que a aplicação já existe.
- `AGENTS.md` foi atualizado com o contexto mínimo da arquitetura e das regras financeiras para futuras interações automatizadas.

## Post-Design Constitution Check

- [x] Monetary strategy remains exact, deterministic, and testable.
- [x] Planned vs realized remains a state transition on the same record, preserving auditability.
- [x] Installment edits/cancellations preserve realized history and only affect eligible future items.
- [x] Dual-balance movements are designed for transactional consistency.
- [x] Validation is present in frontend and backend, with backend as final authority.
- [x] Dashboard and graph requirements remain aligned with clarity-first UX in pt-BR.
- [x] No personal spreadsheet data, secrets, local DB volumes, or implementation code were introduced.

## Technical Decisions Assumed

- Node.js 22 LTS and PostgreSQL 16 are the default local runtime versions.
- `competency_month` is represented as a `DATE` pointing to the first day of the month.
- Automatic month generation is triggered on read/write of a month-scoped use case, not by background pre-creation.
- `Idempotency-Key` is supported for create/mutate endpoints that can be retried by the client.
- `packages/contracts` is intentionally slim and does not host domain services or persistence logic.

## Complexity Tracking

Nenhuma violação constitucional exige justificativa nesta fase. As complexidades removidas intencionalmente são: ausência de Nx/Turborepo, ausência de event sourcing completo, ausência de tabelas mensais físicas, ausência de autenticação nesta feature e ausência de simulador avançado nesta etapa.

