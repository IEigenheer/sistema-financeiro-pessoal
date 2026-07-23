# Tasks: Núcleo de Controle Financeiro Pessoal

**Input**: Artefatos de design em `/specs/001-nucleo-controle-financeiro/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`, `.specify/memory/constitution.md`

**Tests**: Obrigatórios para cálculos financeiros, recorrência, parcelamentos, investimentos, consolidação, auditoria, idempotência, transações e fluxos críticos.

**Organização**: As tarefas estão agrupadas por fase operacional e por história de usuário para permitir implementação incremental, validação independente e respeito às prioridades P1, P2 e P3.

## Formato

Cada tarefa segue o formato `- [ ] TXXX [P?] [US?] descrição com caminho exato; depende de: ...; concluído quando: ...`.

---

## Fase 1: Setup do Monorepo

**Objetivo**: criar a base do monorepo com `pnpm workspaces`, TypeScript strict e convenções de repositório sem Nx/Turborepo.

- [ ] T001 Criar o pacote raiz em `package.json`; depende de: nenhum; concluído quando: scripts raiz de `dev`, `build`, `test`, `lint`, `format`, `db:migrate` e `db:generate` estiverem definidos para `pnpm workspaces`.
- [ ] T002 Criar a declaração de workspaces em `pnpm-workspace.yaml`; depende de: T001; concluído quando: `apps/*` e `packages/*` estiverem declarados e não houver referência a Nx ou Turborepo.
- [ ] T003 [P] Criar a configuração TypeScript compartilhada em `tsconfig.base.json`; depende de: T001; concluído quando: `strict`, `noImplicitOverride`, `noUncheckedIndexedAccess` e aliases básicos do monorepo estiverem definidos.
- [ ] T004 [P] Criar lint e formatação em `.eslintrc.cjs` e `.prettierrc.json`; depende de: T001; concluído quando: regras cobrirem TypeScript, React, NestJS e proibição explícita de `any` sem exceção documentada.
- [ ] T005 [P] Criar regras de versionamento seguro em `.gitignore`; depende de: nenhum; concluído quando: `.env`, volumes locais, backups, bancos locais, artefatos de build e `private-input/Controle_Financeiro_Corrigido.xlsx` estiverem protegidos.
- [ ] T006 [P] Criar variáveis globais de exemplo em `.env.example`; depende de: nenhum; concluído quando: o arquivo listar apenas placeholders sanitizados e nenhuma credencial real.
- [ ] T007 Criar a aplicação web base em `apps/web/package.json` e `apps/web/tsconfig.json`; depende de: T002, T003; concluído quando: Next.js App Router, scripts locais e configuração strict estiverem declarados.
- [ ] T008 Criar a aplicação API base em `apps/api/package.json`, `apps/api/tsconfig.json` e `apps/api/nest-cli.json`; depende de: T002, T003; concluído quando: NestJS, Prisma, Jest e scripts de API estiverem declarados.
- [ ] T009 [P] Criar o pacote compartilhado de contratos em `packages/contracts/package.json` e `packages/contracts/tsconfig.json`; depende de: T002, T003; concluído quando: o pacote puder publicar tipos compartilháveis sem lógica de domínio.
- [ ] T010 [P] Criar o pacote compartilhado mínimo de configuração em `packages/config/package.json` e `packages/config/tsconfig.json`; depende de: T002, T003; concluído quando: o pacote estiver limitado a convenções compartilhadas de locale, timezone e config TypeScript.

**Checkpoint da Fase 1**: estrutura do monorepo criada, TypeScript strict ativo e repositório preparado para apps e packages. Validação manual: abrir o workspace e confirmar a presença de `apps/web`, `apps/api`, `packages/contracts` e `packages/config` sem ferramentas extras de orquestração.

---

## Fase 2: Infraestrutura e Configurações Compartilhadas

**Objetivo**: preparar execução local com Docker Compose, boot básico de apps, health checks e convenções compartilhadas.

- [ ] T011 [P] Criar a configuração inicial do frontend em `apps/web/next.config.ts` e `apps/web/src/app/layout.tsx`; depende de: T007; concluído quando: locale `pt-BR`, timezone padrão informado e shell global do App Router estiverem preparados.
- [ ] T012 Criar o bootstrap da API em `apps/api/src/main.ts` e `apps/api/src/app.module.ts`; depende de: T008; concluído quando: Swagger em `/docs`, `ValidationPipe`, serialização segura de erros e prefixo `/v1` estiverem configurados.
- [ ] T013 [P] Criar convenções compartilhadas em `packages/config/src/index.ts`; depende de: T010; concluído quando: constantes de `pt-BR`, `BRL`, `America/Sao_Paulo` e regras de datas financeiras puderem ser importadas por web e api.
- [ ] T014 [P] Criar exports iniciais de contratos em `packages/contracts/src/index.ts`; depende de: T009; concluído quando: tipos básicos de dinheiro decimal, datas locais e competência mensal estiverem publicados.
- [ ] T015 Criar o ambiente local em `compose.yaml`; depende de: T007, T008, T013; concluído quando: serviços separados `web`, `api` e `db` existirem com volumes, rede interna e health checks planejados.
- [ ] T016 [P] Criar a imagem Docker do frontend em `apps/web/Dockerfile`; depende de: T007; concluído quando: a imagem suportar execução local via Compose com `pnpm`.
- [ ] T017 [P] Criar a imagem Docker da API em `apps/api/Dockerfile`; depende de: T008; concluído quando: a imagem suportar Prisma, NestJS e comandos de migração.
- [ ] T018 Criar endpoints de health check em `apps/api/src/modules/health/health.controller.ts` e `apps/web/src/app/api/health/route.ts`; depende de: T011, T012; concluído quando: `compose.yaml` puder usar os endpoints para readiness sem expor dados sensíveis.

**Checkpoint da Fase 2**: apps inicializáveis em contêineres separados com saúde verificável. Validação manual: revisar `compose.yaml`, Dockerfiles e endpoints de health, confirmando separação entre `web`, `api` e `db`.

---

## Fase 3: Banco de Dados e Migrations

**Objetivo**: materializar o modelo persistente com Prisma, PostgreSQL, índices, restrições e suporte a transações.

- [ ] T019 [P] Criar variáveis de ambiente da API em `apps/api/.env.example`; depende de: T008, T015; concluído quando: URLs de banco, porta e chaves não sensíveis estiverem documentadas apenas com placeholders.
- [ ] T020 [P] Criar variáveis de ambiente do frontend em `apps/web/.env.example`; depende de: T007, T015; concluído quando: base URL da API e flags públicas estiverem documentadas sem segredos.
- [ ] T021 Criar o schema Prisma em `apps/api/prisma/schema.prisma`; depende de: T012, T013, T014; concluído quando: `FinancialSettings`, `Category`, `MonthlyCompetency`, `RecurrenceRule`, `FinancialEntry`, `InstallmentPlan`, `InstallmentItem`, `InvestmentMovement`, `AuditEvent` e `IdempotencyKey` estiverem modeladas com `NUMERIC`, `DATE`, enums, índices e restrições do `data-model.md`.
- [ ] T022 Criar a migration inicial em `apps/api/prisma/migrations/202607230001_init_finance_core/migration.sql`; depende de: T021; concluído quando: tabelas, índices, uniques parciais e constraints de idempotência, recorrência e parcelamento estiverem refletidos no SQL versionado.
- [ ] T023 Criar a integração Prisma em `apps/api/src/common/database/prisma.service.ts` e `apps/api/src/common/database/prisma.module.ts`; depende de: T021; concluído quando: a API puder injetar o client Prisma de forma centralizada.
- [ ] T024 Criar o gerenciador transacional em `apps/api/src/common/database/prisma-transaction.manager.ts`; depende de: T023; concluído quando: casos de uso que afetam dois saldos ou múltiplos registros puderem executar em transação explícita.
- [ ] T025 Criar dados fictícios de desenvolvimento em `apps/api/prisma/seed.ts`; depende de: T021; concluído quando: somente dados genéricos e sanitizados forem usados para smoke tests locais.
- [ ] T026 Criar o smoke test de schema e migrations em `apps/api/tests/integration/prisma-schema-smoke.spec.ts`; depende de: T022, T023, T024; concluído quando: o teste validar criação de schema, constraints principais, índices críticos e recusa a valores monetários inválidos.

**Checkpoint da Fase 3**: banco e migrations versionadas prontos para suportar todo o domínio. Validação manual: revisar `schema.prisma`, migration SQL e `.env.example` da API confirmando exatidão monetária e datas `DATE`.

---

## Fase 4: Componentes Fundamentais do Domínio

**Objetivo**: criar os blocos centrais reutilizáveis para dinheiro, datas financeiras, materialização mensal, auditoria, duplicidade e idempotência.

> **Nota**: nesta fase, os testes críticos vêm antes da implementação correspondente.

- [ ] T027 [P] Criar testes de arredondamento monetário em `apps/api/src/common/domain/money.spec.ts`; depende de: T021; concluído quando: os casos cobrirem `ROUND_HALF_UP`, serialização decimal e proibição de `number` em cálculos de domínio.
- [ ] T028 [P] Criar testes de divisão salarial e data inicial em `apps/api/src/modules/financial-settings/domain/salary-rules.spec.ts`; depende de: T021; concluído quando: os casos cobrirem resíduo na segunda parcela, bloqueio da nova data inicial e meses anteriores sem geração automática.
- [ ] T029 [P] Criar testes de materialização e consolidação base em `apps/api/src/modules/monthly-overviews/domain/month-materializer.spec.ts`; depende de: T021; concluído quando: os casos cobrirem geração idempotente de salário, recorrências, meses vazios e competência sob demanda.
- [ ] T030 [P] Criar testes de transação, auditoria e idempotência técnica em `apps/api/tests/integration/idempotency-and-transactions.spec.ts`; depende de: T022, T024; concluído quando: o teste falhar inicialmente para operações repetidas, correções auditáveis e movimentos de dois saldos.
- [ ] T031 Implementar dinheiro e arredondamento em `apps/api/src/common/domain/money.ts` e `apps/api/src/common/domain/rounding.ts`; depende de: T027; concluído quando: o domínio usar Decimal/Prisma Decimal e nenhum cálculo monetário converter valores para `number`.
- [ ] T032 Implementar período financeiro e salário automático em `apps/api/src/common/domain/financial-period.ts` e `apps/api/src/modules/financial-settings/domain/salary-splitter.ts`; depende de: T028, T031; concluído quando: competência mensal, último dia do mês e segunda parcela derivada estiverem centralizados.
- [ ] T033 Implementar a materialização mensal sob demanda em `apps/api/src/modules/monthly-overviews/domain/month-materializer.service.ts`; depende de: T029, T032; concluído quando: salário, recorrências, parcelas e aporte padrão puderem ser gerados com `generationKey` e sem duplicidade.
- [ ] T034 Implementar o cálculo de saldos e consolidação base em `apps/api/src/modules/monthly-overviews/domain/balance-ledger.service.ts`; depende de: T029, T031; concluído quando: saldo operacional, saldo de investimentos e patrimônio principal seguirem as fórmulas do `data-model.md`.
- [ ] T035 Implementar auditoria central em `apps/api/src/modules/audit/application/audit.service.ts` e `apps/api/src/modules/audit/audit.module.ts`; depende de: T030, T024; concluído quando: alterações relevantes puderem persistir `beforeSnapshot`, `afterSnapshot`, operação e origem técnica.
- [ ] T036 Implementar idempotência e duplicidade funcional em `apps/api/src/modules/idempotency/application/idempotency-key.service.ts` e `apps/api/src/modules/duplicate-check/application/duplicate-check.service.ts`; depende de: T030, T021; concluído quando: retries técnicos forem deduplicados e lançamentos semelhantes puderem gerar alerta preventivo sem bloqueio absoluto.

**Checkpoint da Fase 4**: primitives financeiras, auditoria, idempotência e materialização disponíveis para todas as histórias. Validação manual: revisar os testes T027-T030 e confirmar que eles cobrem as regras constitucionais antes do código de domínio.

---

## Fase 5: User Story 1 - Configurar a Base Financeira (P1)

**Objetivo**: permitir configurar a base financeira e gerenciar categorias com preservação de histórico.

**Teste independente**: salvar configurações e categorias, consultar o resultado e verificar ausência de automações antes da data inicial.

- [ ] T037 [P] [US1] Criar testes unitários de configurações financeiras e categorias em `apps/api/src/modules/financial-settings/application/financial-settings.service.spec.ts`; depende de: T031, T032, T035; concluído quando: os testes cobrirem FR-001 a FR-006, FR-029 e FR-029A.
- [ ] T038 [P] [US1] Criar testes de integração de configurações e categorias em `apps/api/tests/integration/financial-settings-and-categories.spec.ts`; depende de: T022, T023, T035; concluído quando: `GET/PUT /v1/financial-settings`, `POST /start-date-preview`, `GET/POST/PATCH /v1/categories` estiverem cobertos.
- [ ] T039 [P] [US1] Criar testes de frontend para formulários de configurações e categorias em `apps/web/src/features/financial-settings/financial-settings-form.test.tsx` e `apps/web/src/features/categories/category-management.test.tsx`; depende de: T011, T014; concluído quando: validação pt-BR, mensagens e bloqueio de categorias inativas forem exercitados.
- [ ] T040 [US1] Implementar DTOs e controller de configurações em `apps/api/src/modules/financial-settings/interfaces/http/dto/upsert-financial-settings.dto.ts`, `apps/api/src/modules/financial-settings/interfaces/http/dto/start-date-preview.dto.ts` e `apps/api/src/modules/financial-settings/interfaces/http/financial-settings.controller.ts`; depende de: T037, T038; concluído quando: os endpoints `GET`, `PUT` e `POST /start-date-preview` validarem `YYYY-MM-DD` e dinheiro como string decimal.
- [ ] T041 [US1] Implementar o módulo e casos de uso de configurações em `apps/api/src/modules/financial-settings/financial-settings.module.ts`, `apps/api/src/modules/financial-settings/application/upsert-financial-settings.use-case.ts` e `apps/api/src/modules/financial-settings/application/get-financial-settings.use-case.ts`; depende de: T037, T040; concluído quando: a alteração de data inicial bloquear meses com lançamentos realizados anteriores e recalcular apenas automações elegíveis.
- [ ] T042 [US1] Implementar DTOs e controller de categorias em `apps/api/src/modules/categories/interfaces/http/dto/create-category.dto.ts`, `apps/api/src/modules/categories/interfaces/http/dto/update-category.dto.ts` e `apps/api/src/modules/categories/interfaces/http/categories.controller.ts`; depende de: T038; concluído quando: `GET`, `POST` e `PATCH /v1/categories/{categoryId}` funcionarem sem exclusão destrutiva.
- [ ] T043 [US1] Implementar o serviço e módulo de categorias em `apps/api/src/modules/categories/application/category.service.ts` e `apps/api/src/modules/categories/categories.module.ts`; depende de: T042, T035; concluído quando: desativação preservar histórico e bloquear novos usos comuns.
- [ ] T044 [US1] Criar a página de configurações em `apps/web/src/app/configuracoes/page.tsx` e `apps/web/src/features/financial-settings/financial-settings-page.tsx`; depende de: T039, T040, T041; concluído quando: o fluxo de salvar, editar e visualizar preview de impacto estiver disponível.
- [ ] T045 [US1] Implementar o formulário de configurações em `apps/web/src/features/financial-settings/financial-settings-form.tsx` e `apps/web/src/features/financial-settings/financial-settings.schema.ts`; depende de: T039, T044; concluído quando: Zod e React Hook Form validarem salário, parcelas, data inicial e saldos com mensagens em pt-BR.
- [ ] T046 [US1] Criar a página de categorias em `apps/web/src/app/categorias/page.tsx` e `apps/web/src/features/categories/categories-page.tsx`; depende de: T039, T042, T043; concluído quando: listar, cadastrar, editar e desativar categorias estiverem disponíveis.
- [ ] T047 [US1] Implementar o gerenciamento de categorias em `apps/web/src/features/categories/category-form.tsx` e `apps/web/src/features/categories/category-list.tsx`; depende de: T046; concluído quando: o usuário conseguir usar categorias ativas em novos cadastros e visualizar categorias inativas no histórico.

**Checkpoint US1**: funcionalidade implementada: configurações financeiras e categorias. Testes necessários passando: T037-T039. Validação manual: salvar configuração inicial, criar três categorias, desativar uma e confirmar que meses anteriores à data inicial continuam sem geração automática. Independência: não depende de US2, US3 ou US4.

---

## Fase 6: User Story 2 - Registrar e Acompanhar o Mês Financeiro (P1)

**Objetivo**: permitir registrar receitas, despesas fixas e despesas variáveis, acompanhar previsto x realizado e consolidar o mês.

**Teste independente**: abrir um mês após a data inicial, materializar salário, cadastrar despesas/receitas e confirmar consolidação sem duplicidade.

- [ ] T048 [P] [US2] Criar testes unitários de previsto versus realizado e estados de atraso em `apps/api/src/modules/entries/domain/entry-status-rules.spec.ts`; depende de: T031, T035; concluído quando: FR-007A, FR-008A, FR-011A, FR-026 e correções de lançamento realizado estiverem cobertos.
- [ ] T049 [P] [US2] Criar testes unitários de recorrência idempotente em `apps/api/src/modules/recurrence-rules/domain/recurrence-materialization.spec.ts`; depende de: T033; concluído quando: FR-009, FR-010 e a ausência de duplicidade mensal por recorrência estiverem cobertos.
- [ ] T050 [P] [US2] Criar testes de integração de lançamentos e consolidação mensal em `apps/api/tests/integration/monthly-entries-overview.spec.ts`; depende de: T022, T033, T034, T036; concluído quando: `GET/POST/PATCH /v1/entries`, `POST /v1/entries/duplicate-check`, `GET /v1/months/{month}/overview` e regras de duplicidade funcional forem cobertos.
- [ ] T051 [P] [US2] Criar testes de frontend do controle mensal em `apps/web/src/features/monthly-control/monthly-control-page.test.tsx`; depende de: T011, T014; concluído quando: formulário de lançamento, status planejado-realizado, despesa vencida e receita atrasada estiverem exercitados.
- [ ] T052 [US2] Implementar DTOs e controller de lançamentos em `apps/api/src/modules/entries/interfaces/http/dto/create-financial-entry.dto.ts`, `apps/api/src/modules/entries/interfaces/http/dto/update-financial-entry.dto.ts` e `apps/api/src/modules/entries/interfaces/http/entries.controller.ts`; depende de: T048, T050; concluído quando: `GET`, `POST`, `PATCH` e `duplicate-check` de lançamentos validarem dinheiro decimal, datas locais e confirmação de duplicidade.
- [ ] T053 [US2] Implementar o serviço e módulo de lançamentos em `apps/api/src/modules/entries/application/entry.service.ts` e `apps/api/src/modules/entries/entries.module.ts`; depende de: T048, T052, T035, T036; concluído quando: previsto e realizado forem estados do mesmo registro e edições auditáveis preservarem `effectiveDate`.
- [ ] T054 [US2] Implementar DTOs e controller de recorrências em `apps/api/src/modules/recurrence-rules/interfaces/http/dto/create-recurrence-rule.dto.ts`, `apps/api/src/modules/recurrence-rules/interfaces/http/dto/update-recurrence-rule.dto.ts` e `apps/api/src/modules/recurrence-rules/interfaces/http/recurrence-rules.controller.ts`; depende de: T049, T050; concluído quando: `GET`, `POST` e `PATCH /v1/recurrence-rules` estiverem disponíveis.
- [ ] T055 [US2] Implementar o serviço e módulo de recorrências em `apps/api/src/modules/recurrence-rules/application/recurrence-rules.service.ts` e `apps/api/src/modules/recurrence-rules/recurrence-rules.module.ts`; depende de: T049, T054, T033; concluído quando: a despesa fixa gerar no máximo uma ocorrência mensal por origem válida.
- [ ] T056 [US2] Implementar a consolidação mensal em `apps/api/src/modules/monthly-overviews/application/monthly-overview.service.ts` e `apps/api/src/modules/monthly-overviews/interfaces/http/monthly-overview.controller.ts`; depende de: T050, T053, T055, T034; concluído quando: `GET /v1/months/{month}/overview` diferenciar receitas, despesas, aportes, rendimentos e saldo por competência.
- [ ] T057 [US2] Criar a página mensal em `apps/web/src/app/mes/[month]/page.tsx` e `apps/web/src/features/monthly-control/monthly-control-page.tsx`; depende de: T051, T056; concluído quando: o mês puder ser carregado por competência explícita sem depender do timezone do navegador.
- [ ] T058 [US2] Implementar formulários e tabela de lançamentos em `apps/web/src/features/monthly-control/entry-form.tsx` e `apps/web/src/features/monthly-control/entry-table.tsx`; depende de: T051, T052, T057; concluído quando: receitas extras, despesas variáveis e mudança de status planejado-realizado estiverem operacionais.
- [ ] T059 [US2] Implementar formulários e listagem de recorrências em `apps/web/src/features/monthly-control/recurrence-rule-form.tsx` e `apps/web/src/features/monthly-control/recurrence-list.tsx`; depende de: T051, T054, T057; concluído quando: despesas fixas com data inicial, final opcional e ativação puderem ser gerenciadas pela UI.
- [ ] T060 [US2] Implementar cards de consolidação e estados visuais em `apps/web/src/features/monthly-control/monthly-overview-card.tsx` e `apps/web/src/features/monthly-control/status-badges.tsx`; depende de: T056, T057; concluído quando: previsto x realizado, receita atrasada, despesa vencida, mês vazio e saldo operacional negativo estiverem diferenciados visualmente.
- [ ] T061 [US2] Implementar alerta de duplicidade e toggle de realização em `apps/web/src/features/monthly-control/duplicate-warning-dialog.tsx` e `apps/web/src/features/monthly-control/planned-realized-toggle.tsx`; depende de: T050, T052, T058; concluído quando: o usuário puder confirmar duplicidade funcional e realizar lançamentos sem criar um segundo registro.

**Checkpoint US2**: funcionalidade implementada: controle mensal com lançamentos, recorrências e overview. Testes necessários passando: T048-T051. Validação manual: abrir um mês após a data inicial, confirmar salário automático único, criar uma recorrência, registrar uma receita extra e marcar um lançamento como realizado. Independência: depende apenas das fundações e da US1; não depende de US3 nem US4.

---

## Fase 7: User Story 3 - Controlar Parcelamentos e Investimentos (P2)

**Objetivo**: permitir registrar parcelamentos e movimentos de investimento com preservação de histórico e separação entre saldo operacional e patrimônio investido.

**Teste independente**: criar um parcelamento e movimentos de investimento, validar geração futura, saldo restante e efeitos nos dois saldos.

- [ ] T062 [P] [US3] Criar testes unitários de geração, alteração e cancelamento de parcelas em `apps/api/src/modules/installment-plans/domain/installment-plan.rules.spec.ts`; depende de: T033, T035; concluído quando: FR-012 a FR-014, geração idempotente e atualização apenas de parcelas futuras abertas estiverem cobertos.
- [ ] T063 [P] [US3] Criar testes unitários de aportes, resgates, rendimentos e ajustes manuais em `apps/api/src/modules/investment-movements/domain/investment-movement.rules.spec.ts`; depende de: T031, T034, T035; concluído quando: FR-015 a FR-018 e FR-019A estiverem cobertos.
- [ ] T064 [P] [US3] Criar testes de integração de parcelamentos e investimentos em `apps/api/tests/integration/installments-and-investments.spec.ts`; depende de: T022, T024, T033, T034, T036; concluído quando: `GET/POST/PATCH /v1/installment-plans`, previews, cancelamento e `GET/POST/PATCH /v1/investment-movements` estiverem cobertos com transações.
- [ ] T065 [P] [US3] Criar testes de frontend para parcelamentos e investimentos em `apps/web/src/features/investments/investments-page.test.tsx` e `apps/web/src/features/installments/installments-page.test.tsx`; depende de: T011, T014; concluído quando: previews, confirmações e distinção de tipos de movimento estiverem exercitados.
- [ ] T066 [US3] Implementar DTOs e controller de parcelamentos em `apps/api/src/modules/installment-plans/interfaces/http/dto/create-installment-plan.dto.ts`, `apps/api/src/modules/installment-plans/interfaces/http/dto/update-installment-plan.dto.ts` e `apps/api/src/modules/installment-plans/interfaces/http/installment-plans.controller.ts`; depende de: T062, T064; concluído quando: todos os endpoints de parcelamento do OpenAPI estiverem expostos com validação.
- [ ] T067 [US3] Implementar o serviço e módulo de parcelamentos em `apps/api/src/modules/installment-plans/application/installment-plans.service.ts` e `apps/api/src/modules/installment-plans/installment-plans.module.ts`; depende de: T062, T066, T024, T035; concluído quando: alteração e cancelamento preservarem parcelas realizadas e mantiverem saldo restante correto.
- [ ] T068 [US3] Implementar DTOs e controller de investimentos em `apps/api/src/modules/investment-movements/interfaces/http/dto/create-investment-movement.dto.ts`, `apps/api/src/modules/investment-movements/interfaces/http/dto/update-investment-movement.dto.ts` e `apps/api/src/modules/investment-movements/interfaces/http/investment-movements.controller.ts`; depende de: T063, T064; concluído quando: aportes, rendimentos, resgates e ajustes manuais validarem alvo, valor positivo e datas financeiras.
- [ ] T069 [US3] Implementar o serviço e módulo de investimentos em `apps/api/src/modules/investment-movements/application/investment-movements.service.ts` e `apps/api/src/modules/investment-movements/investment-movements.module.ts`; depende de: T063, T068, T024, T034, T035; concluído quando: movimentos de dois saldos ocorrerem em transação e rendimento do mês for aplicado no fechamento.
- [ ] T070 [US3] Criar a página de parcelamentos em `apps/web/src/app/parcelamentos/page.tsx` e `apps/web/src/features/installments/installments-page.tsx`; depende de: T065, T066, T067; concluído quando: a listagem, criação e edição de parcelamentos estiverem acessíveis.
- [ ] T071 [US3] Implementar cadastro e listagem de parcelamentos em `apps/web/src/features/installments/installment-plan-form.tsx` e `apps/web/src/features/installments/installment-plan-list.tsx`; depende de: T070; concluído quando: o usuário puder cadastrar uma compra parcelada única e consultar total, parcela atual e saldo restante.
- [ ] T072 [US3] Implementar preview e confirmação de impacto de parcelamentos em `apps/web/src/features/installments/installment-change-preview-dialog.tsx` e `apps/web/src/features/installments/installment-cancel-dialog.tsx`; depende de: T064, T071; concluído quando: alteração e cancelamento exibirem impacto antes da confirmação.
- [ ] T073 [US3] Criar a página de investimentos em `apps/web/src/app/investimentos/page.tsx` e `apps/web/src/features/investments/investments-page.tsx`; depende de: T065, T068, T069; concluído quando: os movimentos de investimento puderem ser acessados separadamente do controle mensal.
- [ ] T074 [US3] Implementar formulário e listagem de movimentos em `apps/web/src/features/investments/investment-movement-form.tsx` e `apps/web/src/features/investments/investment-movement-list.tsx`; depende de: T073; concluído quando: aporte, rendimento, resgate e ajuste manual puderem ser criados e editados pela UI.
- [ ] T075 [US3] Implementar resumo de saldos e badges de tipos em `apps/web/src/features/investments/investment-balance-summary.tsx` e `apps/web/src/features/investments/movement-type-badges.tsx`; depende de: T069, T073, T074; concluído quando: saldo operacional e patrimônio em investimentos aparecerem separados e consistentes.

**Checkpoint US3**: funcionalidade implementada: parcelamentos e investimentos auditáveis. Testes necessários passando: T062-T065. Validação manual: cadastrar um parcelamento, pedir preview de alteração, cancelar futuras abertas, lançar aporte, resgate, rendimento e ajuste manual. Independência: depende das fundações, da US1 e da US2 apenas como contexto operacional; não depende da US4.

---

## Fase 8: User Story 4 - Visualizar Dashboard e Rastrear Totais (P3)

**Objetivo**: disponibilizar dashboard inicial, abertura de totais mensais e trilha de auditoria consultável.

**Teste independente**: consultar dashboard e breakdown de um mês com dados já cadastrados, verificando composição e rastreabilidade.

- [ ] T076 [P] [US4] Criar testes de integração para dashboard, breakdown mensal e auditoria em `apps/api/tests/integration/dashboard-and-traceability.spec.ts`; depende de: T034, T035, T056, T067, T069; concluído quando: `GET /v1/dashboard`, `GET /v1/months/{month}/breakdown` e `GET /v1/audit/{entityName}/{entityId}` estiverem cobertos.
- [ ] T077 [P] [US4] Criar testes de frontend para dashboard e detalhamento de totais em `apps/web/src/features/dashboard/dashboard-page.test.tsx` e `apps/web/src/features/monthly-control/monthly-breakdown-drawer.test.tsx`; depende de: T011, T014; concluído quando: cards, drawer de rastreabilidade e timeline de auditoria estiverem exercitados.
- [ ] T078 [US4] Implementar o módulo, serviço e controller do dashboard em `apps/api/src/modules/dashboard/dashboard.module.ts`, `apps/api/src/modules/dashboard/application/dashboard.service.ts` e `apps/api/src/modules/dashboard/interfaces/http/dashboard.controller.ts`; depende de: T076, T034, T056, T069; concluído quando: o endpoint `/v1/dashboard` consolidar patrimônio em investimentos, aporte do mês, receitas, despesas e saldo operacional.
- [ ] T079 [US4] Implementar os controllers de breakdown e auditoria em `apps/api/src/modules/monthly-overviews/interfaces/http/monthly-breakdown.controller.ts` e `apps/api/src/modules/audit/interfaces/http/audit.controller.ts`; depende de: T076, T035, T056; concluído quando: breakdown mensal e trilha por entidade estiverem consultáveis sem perder origem, tipo, status e período.
- [ ] T080 [US4] Criar a home do produto em `apps/web/src/app/page.tsx` e `apps/web/src/features/dashboard/dashboard-page.tsx`; depende de: T077, T078; concluído quando: o dashboard inicial puder ser aberto como página principal.
- [ ] T081 [US4] Implementar o detalhamento de totais em `apps/web/src/features/monthly-control/monthly-breakdown-drawer.tsx` e `apps/web/src/features/monthly-control/breakdown-item-list.tsx`; depende de: T077, T079, T057; concluído quando: o usuário puder abrir qualquer total mensal e ver os lançamentos que o compõem.
- [ ] T082 [US4] Implementar cards e filtros do dashboard em `apps/web/src/features/dashboard/dashboard-summary-cards.tsx` e `apps/web/src/features/dashboard/dashboard-filters.tsx`; depende de: T080; concluído quando: indicadores principais, filtros e estados vazios estiverem operacionais.
- [ ] T083 [US4] Implementar timeline de auditoria e links de rastreio em `apps/web/src/features/dashboard/audit-timeline.tsx` e `apps/web/src/features/dashboard/traceability-link.tsx`; depende de: T079, T081; concluído quando: edições relevantes puderem ser exploradas pela UI com origem técnica e snapshots resumidos.

**Checkpoint US4**: funcionalidade implementada: dashboard inicial e rastreabilidade de totais. Testes necessários passando: T076-T077. Validação manual: abrir a home, conferir indicadores do mês e detalhar um total até seus lançamentos de origem. Independência: depende dos dados produzidos pelas histórias anteriores, mas não exige simulador, Open Finance ou escopo fora da feature.

---

## Fase 9: Integrações entre Frontend e Backend

**Objetivo**: consolidar cliente HTTP, contratos compartilhados, tratamento de erro, confirmações e suporte a `Idempotency-Key`.

- [ ] T084 [P] Criar o cliente HTTP compartilhado em `apps/web/src/lib/api/client.ts` e `apps/web/src/lib/api/fetcher.ts`; depende de: T014, T012; concluído quando: o frontend conseguir consumir a API com base URL configurável, serialização de datas financeiras e cabeçalho `Idempotency-Key`.
- [ ] T085 [P] Criar query keys e mapeadores de resposta em `apps/web/src/lib/api/query-keys.ts` e `apps/web/src/lib/api/mappers.ts`; depende de: T084; concluído quando: respostas de overview, dashboard, entries e investments estiverem normalizadas sem perder strings decimais.
- [ ] T086 [P] Criar tratamento global de erros em `apps/web/src/lib/errors/api-error.ts` e `apps/web/src/components/notification-center.tsx`; depende de: T084; concluído quando: erros de validação, conflito de idempotência e duplicidade funcional gerarem mensagens seguras e compreensíveis.
- [ ] T087 [P] Implementar o interceptor de idempotência em `apps/api/src/common/interceptors/idempotency.interceptor.ts` e `apps/api/src/modules/idempotency/idempotency.module.ts`; depende de: T036, T023; concluído quando: POSTs repetidos puderem responder de forma determinística com base na chave e no hash da requisição.
- [ ] T088 [P] Implementar o tratamento padronizado de erros da API em `apps/api/src/common/filters/http-exception.filter.ts` e `apps/api/src/common/errors/common-error.response.ts`; depende de: T012, T035; concluído quando: a API não expuser stack traces nem detalhes internos em respostas públicas.
- [ ] T089 [P] Implementar shell compartilhado e confirmações de ações em `apps/web/src/components/app-shell.tsx` e `apps/web/src/components/confirm-action-dialog.tsx`; depende de: T011, T086; concluído quando: loading, empty states, confirmações explícitas e mensagens de sucesso forem reutilizáveis entre páginas.

**Checkpoint da Fase 9**: integrações web-api consistentes, com erros seguros e retries idempotentes. Validação manual: repetir um POST com a mesma chave de idempotência e confirmar resposta consistente sem criação duplicada.

---

## Fase 10: Dashboard e Gráficos

**Objetivo**: completar a experiência visual do dashboard com Apache ECharts, formatação monetária e comportamento responsivo.

- [ ] T090 [P] [US4] Implementar o gráfico de evolução dos investimentos em `apps/web/src/features/dashboard/charts/investment-evolution-chart.tsx`; depende de: T080, T082; concluído quando: a série temporal conectar pontos mensais e representar apenas patrimônio em investimentos.
- [ ] T091 [P] [US4] Implementar o gráfico de previsto versus realizado em `apps/web/src/features/dashboard/charts/planned-vs-realized-chart.tsx`; depende de: T080, T082; concluído quando: previsto e realizado tiverem diferenciação visual clara, tooltip monetário e legenda.
- [ ] T092 [P] [US4] Implementar o gráfico de despesas por categoria em `apps/web/src/features/dashboard/charts/expenses-by-category-chart.tsx`; depende de: T080, T082; concluído quando: distribuição de despesas por categoria suportar legenda, ocultação de séries e estado vazio.
- [ ] T093 [US4] Implementar formatação financeira compartilhada em `apps/web/src/lib/formatters/money.ts` e `apps/web/src/lib/formatters/financial-date.ts`; depende de: T013, T084; concluído quando: dinheiro em BRL e datas `YYYY-MM-DD` puderem ser exibidos sem depender do timezone do navegador.
- [ ] T094 [US4] Integrar os gráficos ao dashboard em `apps/web/src/features/dashboard/dashboard-page.tsx` e `apps/web/src/features/dashboard/charts/chart-empty-state.tsx`; depende de: T090, T091, T092, T093; concluído quando: responsividade, legendas, tooltips, seleção/ocultação de séries e estados vazios estiverem completos.

**Checkpoint da Fase 10**: dashboard visualmente completo e legível. Validação manual: abrir a home em desktop e mobile, ocultar séries, verificar tooltip monetário e conferir diferença visual entre previsto e realizado.

---

## Fase 11: Testes End-to-End

**Objetivo**: validar os principais fluxos completos com Playwright.

- [ ] T095 Criar a configuração E2E em `playwright.config.ts`; depende de: T015, T016, T017, T089; concluído quando: web, api e db puderem ser iniciados para testes automáticos locais.
- [ ] T096 [P] Criar o cenário E2E da US1 em `apps/web/tests/e2e/us1-settings-categories.spec.ts`; depende de: T047, T095; concluído quando: o teste configurar a base financeira e gerenciar categorias de ponta a ponta.
- [ ] T097 [P] Criar o cenário E2E da US2 em `apps/web/tests/e2e/us2-monthly-control.spec.ts`; depende de: T061, T095; concluído quando: o teste materializar um mês, criar lançamentos e validar previsto x realizado.
- [ ] T098 [P] Criar o cenário E2E da US3 em `apps/web/tests/e2e/us3-installments-investments.spec.ts`; depende de: T075, T095; concluído quando: o teste cobrir parcelamentos, previews, aporte, resgate e ajuste manual.
- [ ] T099 [P] Criar o cenário E2E da US4 em `apps/web/tests/e2e/us4-dashboard-traceability.spec.ts`; depende de: T094, T095; concluído quando: o teste abrir o dashboard, validar gráficos e detalhar um total mensal até sua composição.

**Checkpoint da Fase 11**: fluxos críticos da feature cobertos ponta a ponta. Validação manual: revisar os quatro specs Playwright e confirmar que cada história possui cenário E2E próprio.

---

## Fase 12: Documentação, Segurança e Validação Final

**Objetivo**: fechar documentação operacional, endurecimento mínimo de segurança e validação final contra a constituição.

- [ ] T100 Atualizar a documentação raiz em `README.md`; depende de: T015, T095; concluído quando: setup local, comandos principais, arquitetura do monorepo e restrições de confidencialidade estiverem descritos sem afirmar funcionalidades não implementadas.
- [ ] T101 Implementar redaction de logs e dados sensíveis em `apps/api/src/common/redaction/log-redaction.ts`; depende de: T088; concluído quando: descrições, valores financeiros sensíveis e segredos forem sanitizados antes de logs estruturados.
- [ ] T102 Atualizar o guia de validação em `specs/001-nucleo-controle-financeiro/quickstart.md`; depende de: T099; concluído quando: comandos, fluxos manuais e expectativas refletirem a implementação real sem inserir dados pessoais.
- [ ] T103 Atualizar o checklist de requisitos em `specs/001-nucleo-controle-financeiro/checklists/requirements.md`; depende de: T099; concluído quando: cada requisito e cenário relevante puder ser marcado contra tarefas, testes e validações executadas.
- [ ] T104 Atualizar o contexto operacional em `AGENTS.md`; depende de: T015, T021, T094; concluído quando: arquitetura, convenções de dinheiro, datas e restrições de segurança refletirem o sistema implementado.
- [ ] T105 Criar o smoke test de contrato OpenAPI em `apps/api/tests/integration/openapi-contract-smoke.spec.ts`; depende de: T040, T042, T052, T054, T066, T068, T078, T079, T088; concluído quando: todos os endpoints definidos em `contracts/openapi.yaml` tiverem cobertura mínima de disponibilidade e shape contratual.

**Checkpoint da Fase 12**: documentação e validação final concluídas. Validação manual: executar o checklist atualizado, revisar o quickstart e confirmar aderência explícita à constituição sem dados reais da planilha.

---

## Dependências e Ordem de Execução

### Dependências por Fase

- **Fase 1**: sem dependências; pode começar imediatamente.
- **Fase 2**: depende da Fase 1.
- **Fase 3**: depende das Fases 1 e 2.
- **Fase 4**: depende da Fase 3.
- **US1 (Fase 5)**: depende da Fase 4.
- **US2 (Fase 6)**: depende da Fase 4 e usa configurações/categorias da US1.
- **US3 (Fase 7)**: depende da Fase 4 e do fluxo mensal já disponível na US2.
- **US4 (Fases 8 e 10)**: depende de dados consistentes produzidos por US2 e US3.
- **Fase 9**: pode iniciar após a Fase 4 e ser finalizada junto das histórias.
- **Fase 11**: depende da conclusão das histórias e da integração principal.
- **Fase 12**: depende das histórias desejadas e dos testes E2E.

### Caminho Crítico

`T001 -> T002 -> T007/T008 -> T012 -> T021 -> T022 -> T024 -> T031 -> T033 -> T034 -> T041 -> T053 -> T056 -> T067 -> T069 -> T078 -> T094 -> T095 -> T099 -> T105`

### Dependências entre Histórias

- **US1**: primeira entrega funcional e MVP.
- **US2**: depende de US1 para configurações e categorias, mas permanece independente de US3 e US4.
- **US3**: depende de US2 para a visão mensal e de US1 para categorias/configurações.
- **US4**: depende dos dados produzidos por US2 e US3 para análise e rastreabilidade.

### Regra Interna de Cada História

- Escrever os testes financeiros primeiro e garantir falha inicial.
- Implementar domínio e casos de uso antes dos controllers.
- Implementar controllers antes da integração da UI.
- Não considerar a tarefa concluída com testes relevantes falhando.

---

## Oportunidades de Paralelismo

- **Fase 1**: T003-T006 e T009-T010 podem ocorrer em paralelo após T001-T002.
- **Fase 2**: T011, T013, T014, T016 e T017 podem ocorrer em paralelo.
- **Fase 4**: T027-T030 podem ser escritas em paralelo; T035 e T036 podem evoluir em paralelo após T024.
- **US1**: T037-T039 em paralelo; T044-T047 podem ser distribuídas após backend básico.
- **US2**: T048-T051 em paralelo; T058-T061 podem ser distribuídas após T057.
- **US3**: T062-T065 em paralelo; T070-T075 podem ser distribuídas após backend principal.
- **US4**: T076-T077 em paralelo; T090-T092 podem ser implementadas em paralelo.
- **E2E**: T096-T099 podem ser divididas por história após T095.

---

## Exemplos de Execução Paralela

### Exemplo US1

```bash
T037 [US1] financial-settings.service.spec.ts
T038 [US1] financial-settings-and-categories.spec.ts
T039 [US1] financial-settings-form.test.tsx
```

### Exemplo US2

```bash
T048 [US2] entry-status-rules.spec.ts
T049 [US2] recurrence-materialization.spec.ts
T050 [US2] monthly-entries-overview.spec.ts
T051 [US2] monthly-control-page.test.tsx
```

### Exemplo US3

```bash
T062 [US3] installment-plan.rules.spec.ts
T063 [US3] investment-movement.rules.spec.ts
T064 [US3] installments-and-investments.spec.ts
T065 [US3] investments-page.test.tsx
```

### Exemplo US4

```bash
T090 [US4] investment-evolution-chart.tsx
T091 [US4] planned-vs-realized-chart.tsx
T092 [US4] expenses-by-category-chart.tsx
```

---

## Estratégia de Implementação

### MVP Primeiro

1. Concluir Fases 1 a 4.
2. Concluir a US1.
3. Validar manualmente a configuração inicial, categorias e bloqueio de data inicial.
4. Só então avançar para a US2.

### Entrega Incremental

1. **Entrega 1**: US1.
2. **Entrega 2**: US2.
3. **Entrega 3**: US3.
4. **Entrega 4**: US4 com gráficos e rastreabilidade.
5. **Fechamento**: E2E, documentação e revisão constitucional.

### Notas

- Tarefas `[P]` foram marcadas apenas quando usam arquivos distintos e não dependem de trabalho inacabado no mesmo ponto do fluxo.
- Nenhuma tarefa inclui autenticação, múltiplos usuários, Open Finance, integração bancária, app mobile, simulador avançado, importação definitiva da planilha ou controle individual de ativos.
- Toda história possui tarefas de teste, backend, frontend e checkpoint de validação independente.
