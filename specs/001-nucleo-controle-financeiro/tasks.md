# Tasks: Núcleo de Controle Financeiro Pessoal

**Input**: artefatos em `specs/001-nucleo-controle-financeiro/`

**Remediação aplicada**: a camada de integração frontend-backend foi antecipada para antes das páginas e formulários das histórias. A US1 agora inclui um overview mensal somente leitura para validação independente.

**Formato**: `- [ ] TXXX [P?] [US?] descrição; arquivos: ...; depende de: ...; concluído quando: ...`

---

## Fase 1: Setup do monorepo

- [ ] T001 Criar o pacote raiz; arquivos: `package.json`; depende de: nenhum; concluído quando: scripts raiz de `dev`, `build`, `lint`, `test`, `format`, `db:migrate` e `db:generate` estiverem definidos para `pnpm`.
- [ ] T002 Criar a declaração de workspaces; arquivos: `pnpm-workspace.yaml`; depende de: T001; concluído quando: `apps/*` e `packages/*` estiverem declarados sem Nx ou Turborepo.
- [ ] T003 [P] Criar configuração TypeScript compartilhada; arquivos: `tsconfig.base.json`; depende de: T001; concluído quando: `strict`, `noImplicitOverride` e `noUncheckedIndexedAccess` estiverem ativos.
- [ ] T004 [P] Criar lint e formatação; arquivos: `.eslintrc.cjs` e `.prettierrc.json`; depende de: T001; concluído quando: TypeScript, React e NestJS estiverem cobertos e `any` sem justificativa estiver proibido.
- [ ] T005 [P] Criar regras de versionamento seguro; arquivos: `.gitignore`; depende de: nenhum; concluído quando: `.env`, volumes locais, backups e `private-input/Controle_Financeiro_Corrigido.xlsx` estiverem ignorados.
- [ ] T006 [P] Criar variáveis globais de exemplo; arquivos: `.env.example`; depende de: T001; concluído quando: apenas placeholders sanitizados existirem no arquivo.
- [ ] T007 Criar a aplicação web base; arquivos: `apps/web/package.json` e `apps/web/tsconfig.json`; depende de: T002, T003; concluído quando: Next.js com App Router e scripts locais estiverem declarados.
- [ ] T008 Criar a aplicação API base; arquivos: `apps/api/package.json`, `apps/api/tsconfig.json` e `apps/api/nest-cli.json`; depende de: T002, T003; concluído quando: NestJS, Prisma e Jest estiverem declarados.
- [ ] T009 [P] Criar o pacote compartilhado de contratos; arquivos: `packages/contracts/package.json` e `packages/contracts/tsconfig.json`; depende de: T002, T003; concluído quando: o pacote puder publicar tipos sem lógica de domínio.
- [ ] T010 [P] Criar o pacote compartilhado mínimo de configuração; arquivos: `packages/config/package.json` e `packages/config/tsconfig.json`; depende de: T002, T003; concluído quando: o pacote ficar restrito a locale, moeda e timezone.

**Checkpoint F1**: monorepo inicial criado e pronto para apps e packages.

---

## Fase 2: Infraestrutura e configurações compartilhadas

- [ ] T011 [P] Criar configuração base do frontend; arquivos: `apps/web/next.config.ts` e `apps/web/src/app/layout.tsx`; depende de: T007; concluído quando: locale `pt-BR` e shell base do App Router estiverem preparados.
- [ ] T012 Criar bootstrap da API; arquivos: `apps/api/src/main.ts` e `apps/api/src/app.module.ts`; depende de: T008; concluído quando: prefixo `/v1`, Swagger, `ValidationPipe` e serialização segura de erros estiverem configurados.
- [ ] T013 [P] Criar convenções compartilhadas; arquivos: `packages/config/src/index.ts`; depende de: T010; concluído quando: `BRL`, `pt-BR`, `America/Sao_Paulo` e helpers de datas financeiras puderem ser importados.
- [ ] T014 [P] Criar exports iniciais de contratos; arquivos: `packages/contracts/src/index.ts`; depende de: T009; concluído quando: tipos básicos de dinheiro decimal, datas locais e competência mensal estiverem expostos.
- [ ] T015 Criar ambiente local com Docker Compose; arquivos: `compose.yaml`; depende de: T007, T008, T013; concluído quando: `web`, `api` e `db` existirem como serviços separados com health checks planejados.
- [ ] T016 [P] Criar imagem Docker do frontend; arquivos: `apps/web/Dockerfile`; depende de: T007; concluído quando: a imagem suportar execução local com `pnpm`.
- [ ] T017 [P] Criar imagem Docker da API; arquivos: `apps/api/Dockerfile`; depende de: T008; concluído quando: a imagem suportar NestJS, Prisma e migrations.
- [ ] T018 Criar health checks; arquivos: `apps/api/src/modules/health/health.controller.ts` e `apps/web/src/app/api/health/route.ts`; depende de: T011, T012, T015; concluído quando: `compose.yaml` puder verificar readiness sem expor dados sensíveis.

**Checkpoint F2**: execução local planejada com `web`, `api` e `db` separados.

---

## Fase 3: Banco de dados e migrations

- [ ] T019 [P] Criar variáveis de ambiente da API; arquivos: `apps/api/.env.example`; depende de: T008, T015; concluído quando: URLs e portas estiverem documentadas sem segredos.
- [ ] T020 [P] Criar variáveis de ambiente do frontend; arquivos: `apps/web/.env.example`; depende de: T007, T015; concluído quando: base URL da API estiver documentada sem dados reais.
- [ ] T021 Criar base monetária e enums do Prisma; arquivos: `apps/api/prisma/schema.prisma`; depende de: T012, T013; concluído quando: tipos decimais, enums de status, direção e ajuste manual estiverem definidos conforme `data-model.md`.
- [ ] T022 Criar entidades centrais do Prisma; arquivos: `apps/api/prisma/schema.prisma`; depende de: T021; concluído quando: `FinancialSettings`, `Category` e `MonthlyCompetency` estiverem modeladas com `DATE` e restrições principais.
- [ ] T023 Criar entidades transacionais do Prisma; arquivos: `apps/api/prisma/schema.prisma`; depende de: T022; concluído quando: `RecurrenceRule`, `FinancialEntry`, `InstallmentPlan`, `InstallmentItem`, `InvestmentMovement`, `AuditEvent` e `IdempotencyKey` estiverem modeladas.
- [ ] T024 Criar migration inicial das tabelas; arquivos: `apps/api/prisma/migrations/202607230001_init_finance_core/migration.sql`; depende de: T023; concluído quando: as tabelas da feature existirem em SQL versionado.
- [ ] T025 Criar migration de índices e constraints; arquivos: `apps/api/prisma/migrations/202607230002_finance_constraints/migration.sql`; depende de: T023; concluído quando: uniques, índices e validações de idempotência, recorrência e parcelamento estiverem refletidos.
- [ ] T026 Criar integração Prisma da API; arquivos: `apps/api/src/common/database/prisma.service.ts` e `apps/api/src/common/database/prisma.module.ts`; depende de: T023; concluído quando: o Prisma Client puder ser injetado centralmente.
- [ ] T027 Criar gerenciador transacional; arquivos: `apps/api/src/common/database/prisma-transaction.manager.ts` e `apps/api/src/common/database/repository-helpers.ts`; depende de: T023, T026; concluído quando: casos de uso que afetam dois saldos puderem executar em transação explícita.
- [ ] T028 Criar smoke test de schema e migrations; arquivos: `apps/api/tests/integration/prisma-schema-smoke.spec.ts`; depende de: T024, T025, T026, T027; concluído quando: o teste validar schema, constraints monetárias, índices críticos e recusa de sinais inválidos.

**Checkpoint F3**: persistência versionada pronta para sustentar o domínio financeiro.

---

## Fase 4: Componentes fundamentais do domínio

- [ ] T029 [P] Criar testes de dinheiro e arredondamento; arquivos: `apps/api/src/common/domain/money.spec.ts`; depende de: T023; concluído quando: `ROUND_HALF_UP`, serialização decimal e proibição de `number` em cálculos monetários estiverem cobertos.
- [ ] T030 [P] Criar testes de divisão salarial e data inicial; arquivos: `apps/api/src/modules/financial-settings/domain/salary-rules.spec.ts`; depende de: T023; concluído quando: resíduo na segunda parcela, bloqueio da nova data inicial e meses anteriores sem geração automática estiverem cobertos.
- [ ] T031 [P] Criar testes de materialização mensal; arquivos: `apps/api/src/modules/monthly-overviews/domain/month-materializer.spec.ts`; depende de: T024, T025; concluído quando: geração idempotente de salário e recorrências sob demanda estiver coberta.
- [ ] T032 [P] Criar testes de transações, auditoria, idempotência e duplicidade; arquivos: `apps/api/tests/integration/idempotency-audit-and-transactions.spec.ts`; depende de: T024, T025, T027; concluído quando: retries técnicos, transferências entre saldos e trilha de auditoria falharem antes da implementação.
- [ ] T033 Implementar dinheiro e arredondamento; arquivos: `apps/api/src/common/domain/money.ts` e `apps/api/src/common/domain/rounding.ts`; depende de: T029; concluído quando: todo cálculo monetário do domínio operar com decimal exato.
- [ ] T034 Implementar datas financeiras e competência mensal; arquivos: `apps/api/src/common/domain/financial-date.ts` e `apps/api/src/common/domain/month-competency.ts`; depende de: T029; concluído quando: `DATE`, `YYYY-MM-DD` e competência explícita estiverem centralizados.
- [ ] T035 Implementar regras de salário e data inicial; arquivos: `apps/api/src/modules/financial-settings/domain/salary-splitter.ts` e `apps/api/src/modules/financial-settings/domain/control-start-date.guard.ts`; depende de: T030, T033, T034; concluído quando: a primeira parcela permanecer fixa e a segunda absorver o resíduo.
- [ ] T036 Implementar materialização mensal sob demanda; arquivos: `apps/api/src/modules/monthly-overviews/domain/month-materializer.service.ts`; depende de: T031, T034, T035; concluído quando: ocorrências automáticas forem geradas sem duplicidade e sem pré-criação infinita.
- [ ] T037 Implementar razão de saldos e consolidação base; arquivos: `apps/api/src/modules/monthly-overviews/domain/balance-ledger.service.ts`; depende de: T031, T033, T034; concluído quando: saldo operacional, saldo de investimentos e delta previsto-realizado seguirem o modelo de domínio.
- [ ] T038 Implementar auditoria, idempotência e duplicidade funcional centrais; arquivos: `apps/api/src/modules/audit/application/audit.service.ts`, `apps/api/src/modules/idempotency/application/idempotency-key.service.ts` e `apps/api/src/modules/duplicate-check/application/duplicate-check.service.ts`; depende de: T032, T026; concluído quando: alterações relevantes, POSTs repetidos e alertas preventivos estiverem centralizados no backend.

**Checkpoint F4**: regras financeiras, materialização, auditoria e idempotência disponíveis para todas as histórias.

---

## Fase 5: Integrações entre frontend e backend antecipadas

- [ ] T039 [P] Criar cliente HTTP compartilhado e configuração da API; arquivos: `apps/web/src/lib/api/client.ts` e `apps/web/src/lib/api/api-config.ts`; depende de: T012, T014; concluído quando: o frontend puder consumir a API com base URL configurável e `Idempotency-Key` opcional.
- [ ] T040 [P] Criar serialização e mapeamento de dinheiro e datas; arquivos: `apps/web/src/lib/api/serializers.ts` e `apps/web/src/lib/api/mappers.ts`; depende de: T039, T013; concluído quando: valores monetários permanecerem como string decimal e datas financeiras não dependerem do timezone do navegador.
- [ ] T041 [P] Criar tratamento global de loading e erro; arquivos: `apps/web/src/lib/errors/api-error.ts`, `apps/web/src/components/notification-center.tsx` e `apps/web/src/components/loading-state.tsx`; depende de: T039; concluído quando: erros padronizados e estados de carregamento puderem ser reutilizados por todas as histórias.
- [ ] T042 [P] Criar fluxo padrão de confirmação e shell compartilhado; arquivos: `apps/web/src/components/confirm-action-dialog.tsx` e `apps/web/src/components/app-shell.tsx`; depende de: T041, T011; concluído quando: confirmações explícitas e mensagens de sucesso puderem ser reutilizadas.
- [ ] T043 Implementar interceptor de `Idempotency-Key`; arquivos: `apps/api/src/common/interceptors/idempotency.interceptor.ts` e `apps/api/src/modules/idempotency/idempotency.module.ts`; depende de: T038, T026; concluído quando: POSTs repetidos responderem de forma determinística com base na chave e no hash da requisição.
- [ ] T044 Implementar tratamento padronizado de erros da API; arquivos: `apps/api/src/common/filters/http-exception.filter.ts` e `apps/api/src/common/errors/common-error.response.ts`; depende de: T038, T012; concluído quando: a API não expuser stack traces nem detalhes internos.

**Checkpoint F5**: cliente web-api, serialização, confirmações e idempotência prontos antes das telas funcionais.

---

## Fase 6: User Story 1 - Configurar a base financeira (P1)

- [ ] T045 [P] [US1] Criar testes unitários de configurações financeiras; arquivos: `apps/api/src/modules/financial-settings/application/financial-settings.service.spec.ts`; depende de: T033, T035, T038; concluído quando: sinais monetários, data inicial, salário e preview de impacto estiverem cobertos.
- [ ] T046 [P] [US1] Criar testes de integração de configurações e categorias; arquivos: `apps/api/tests/integration/financial-settings-and-categories.spec.ts`; depende de: T024, T026, T038; concluído quando: `GET/PUT /v1/financial-settings`, `POST /start-date-preview` e `GET/POST/PATCH /v1/categories` estiverem cobertos.
- [ ] T047 [P] [US1] Criar testes de integração do overview mensal mínimo; arquivos: `apps/api/tests/integration/monthly-overview-bootstrap.spec.ts`; depende de: T024, T026, T036, T037; concluído quando: `GET /v1/months/{month}/overview` validar mês dentro/fora do período, parcelas salariais, receitas previstas e saldo inicial aplicável.
- [ ] T048 [P] [US1] Criar testes de frontend da US1; arquivos: `apps/web/src/features/financial-settings/financial-settings-page.test.tsx`, `apps/web/src/features/categories/categories-page.test.tsx` e `apps/web/src/features/monthly-overview/monthly-overview-page.test.tsx`; depende de: T039, T040, T041, T042; concluído quando: formulários, overview somente leitura e mensagens de confirmação estiverem exercitados.
- [ ] T049 [US1] Implementar DTOs de configurações financeiras; arquivos: `apps/api/src/modules/financial-settings/interfaces/http/dto/upsert-financial-settings.dto.ts` e `apps/api/src/modules/financial-settings/interfaces/http/dto/start-date-preview.dto.ts`; depende de: T045; concluído quando: dinheiro positivo, datas locais e o campo `projectedMonthlyInvestmentYieldRate` forem validados no backend.
- [ ] T050 [US1] Implementar controller de configurações financeiras; arquivos: `apps/api/src/modules/financial-settings/interfaces/http/financial-settings.controller.ts`; depende de: T046, T049; concluído quando: os endpoints de leitura, gravação e preview estiverem documentados e alinhados ao OpenAPI.
- [ ] T051 [US1] Implementar serviço e casos de uso de configurações; arquivos: `apps/api/src/modules/financial-settings/application/financial-settings.service.ts` e `apps/api/src/modules/financial-settings/financial-settings.module.ts`; depende de: T045, T050, T036, T038; concluído quando: a alteração da data inicial bloquear históricos realizados e recalcular apenas automações elegíveis.
- [ ] T052 [US1] Implementar DTOs de categorias; arquivos: `apps/api/src/modules/categories/interfaces/http/dto/create-category.dto.ts` e `apps/api/src/modules/categories/interfaces/http/dto/update-category.dto.ts`; depende de: T045; concluído quando: categorias de despesas aceitarem apenas nome e ativação.
- [ ] T053 [US1] Implementar controller, serviço e módulo de categorias; arquivos: `apps/api/src/modules/categories/interfaces/http/categories.controller.ts`, `apps/api/src/modules/categories/application/category.service.ts` e `apps/api/src/modules/categories/categories.module.ts`; depende de: T046, T052, T038; concluído quando: histórico for preservado e exclusão destrutiva não existir.
- [ ] T054 [US1] Implementar contrato HTTP do overview mensal mínimo; arquivos: `apps/api/src/modules/monthly-overviews/interfaces/http/monthly-overview.controller.ts`; depende de: T047; concluído quando: `GET /v1/months/{month}/overview` expuser `withinControlPeriod`, parcelas salariais e totais mínimos da US1.
- [ ] T055 [US1] Implementar serviço do overview mensal mínimo; arquivos: `apps/api/src/modules/monthly-overviews/application/monthly-overview.service.ts`; depende de: T047, T036, T037, T051; concluído quando: meses anteriores à data inicial não gerarem automações e meses válidos retornarem o overview mínimo.
- [ ] T056 [US1] Criar página de configurações; arquivos: `apps/web/src/app/configuracoes/page.tsx` e `apps/web/src/features/financial-settings/financial-settings-page.tsx`; depende de: T048, T039, T041, T050; concluído quando: a tela carregar dados atuais e fluxo de salvar com tratamento de erro.
- [ ] T057 [US1] Implementar formulário e preview de configurações; arquivos: `apps/web/src/features/financial-settings/financial-settings-form.tsx` e `apps/web/src/features/financial-settings/financial-settings.schema.ts`; depende de: T048, T042, T051, T056; concluído quando: salário, primeira parcela, `projectedMonthlyInvestmentYieldRate`, aporte e saldos forem validados como strings monetárias positivas.
- [ ] T058 [US1] Implementar tela de categorias; arquivos: `apps/web/src/app/categorias/page.tsx`, `apps/web/src/features/categories/categories-page.tsx` e `apps/web/src/features/categories/category-form.tsx`; depende de: T048, T042, T053; concluído quando: cadastro, edição e desativação de categorias de despesas estiverem disponíveis.
- [ ] T059 [US1] Implementar overview mensal somente leitura da US1; arquivos: `apps/web/src/app/mes/[month]/page.tsx` e `apps/web/src/features/monthly-overview/monthly-overview-card.tsx`; depende de: T048, T039, T040, T055; concluído quando: a US1 puder ser demonstrada sem a US2 por meio do overview mínimo.

**Checkpoint US1**: funcionalidade implementada, testável e demonstrável sem depender da US2. Validação manual: salvar configurações, cadastrar categorias, consultar um mês válido e um mês anterior à data inicial.

---

## Fase 7: User Story 2 - Registrar e acompanhar o mês financeiro (P1)

- [ ] T060 [P] [US2] Criar testes unitários de previsto, realizado e correções; arquivos: `apps/api/src/modules/entries/domain/entry-status-rules.spec.ts`; depende de: T033, T038; concluído quando: planejado x realizado, preservação da data efetiva e rejeição de negativos estiverem cobertos.
- [ ] T061 [P] [US2] Criar testes unitários de recorrência idempotente; arquivos: `apps/api/src/modules/recurrence-rules/domain/recurrence-materialization.spec.ts`; depende de: T036; concluído quando: uma única ocorrência mensal por regra elegível estiver coberta.
- [ ] T062 [P] [US2] Criar testes de integração de lançamentos e overview expandido; arquivos: `apps/api/tests/integration/monthly-entries-overview.spec.ts`; depende de: T024, T026, T036, T037, T038; concluído quando: `GET/POST/PATCH /v1/entries`, `POST /v1/entries/duplicate-check` e a expansão do overview mensal estiverem cobertos.
- [ ] T063 [P] [US2] Criar testes de frontend do controle mensal; arquivos: `apps/web/src/features/monthly-control/monthly-control-page.test.tsx`; depende de: T039, T040, T041, T042; concluído quando: formulários, estados vazios, atraso e vencimento estiverem exercitados.
- [ ] T064 [US2] Implementar DTOs de lançamentos; arquivos: `apps/api/src/modules/entries/interfaces/http/dto/create-financial-entry.dto.ts`, `apps/api/src/modules/entries/interfaces/http/dto/update-financial-entry.dto.ts` e `apps/api/src/modules/entries/interfaces/http/dto/duplicate-check.dto.ts`; depende de: T060; concluído quando: receitas extras e despesas variáveis aceitarem apenas valores positivos.
- [ ] T065 [US2] Implementar controller de lançamentos; arquivos: `apps/api/src/modules/entries/interfaces/http/entries.controller.ts`; depende de: T062, T064; concluído quando: listagem, criação, atualização e duplicate check seguirem o OpenAPI.
- [ ] T066 [US2] Implementar serviço e módulo de lançamentos; arquivos: `apps/api/src/modules/entries/application/entry.service.ts` e `apps/api/src/modules/entries/entries.module.ts`; depende de: T060, T065, T038; concluído quando: previsto e realizado permanecerem no mesmo registro com trilha de auditoria.
- [ ] T067 [US2] Implementar DTOs de recorrências; arquivos: `apps/api/src/modules/recurrence-rules/interfaces/http/dto/create-recurrence-rule.dto.ts` e `apps/api/src/modules/recurrence-rules/interfaces/http/dto/update-recurrence-rule.dto.ts`; depende de: T061; concluído quando: despesa fixa validar categoria de despesa, valor positivo e datas locais.
- [ ] T068 [US2] Implementar controller de recorrências; arquivos: `apps/api/src/modules/recurrence-rules/interfaces/http/recurrence-rules.controller.ts`; depende de: T062, T067; concluído quando: `GET/POST/PATCH /v1/recurrence-rules` estiverem expostos.
- [ ] T069 [US2] Implementar serviço e módulo de recorrências; arquivos: `apps/api/src/modules/recurrence-rules/application/recurrence-rules.service.ts` e `apps/api/src/modules/recurrence-rules/recurrence-rules.module.ts`; depende de: T061, T068, T036; concluído quando: recorrências gerarem ocorrências mensais sem duplicidade.
- [ ] T070 [US2] Expandir o overview mensal; arquivos: `apps/api/src/modules/monthly-overviews/application/monthly-overview.service.ts`; depende de: T062, T066, T069, T037; concluído quando: despesas fixas, variáveis, estados de atraso e delta previsto-realizado aparecerem no overview.
- [ ] T071 [US2] Criar página do controle mensal; arquivos: `apps/web/src/features/monthly-control/monthly-control-page.tsx`; depende de: T063, T039, T041, T070; concluído quando: um mês puder ser carregado por competência explícita.
- [ ] T072 [US2] Implementar formulário e tabela de lançamentos; arquivos: `apps/web/src/features/monthly-control/entry-form.tsx` e `apps/web/src/features/monthly-control/entry-table.tsx`; depende de: T063, T042, T066, T071; concluído quando: receitas extras, despesas variáveis e mudança de status estiverem operacionais.
- [ ] T073 [US2] Implementar formulários e listagem de recorrências; arquivos: `apps/web/src/features/monthly-control/recurrence-rule-form.tsx` e `apps/web/src/features/monthly-control/recurrence-list.tsx`; depende de: T063, T042, T069, T071; concluído quando: despesas fixas recorrentes puderem ser gerenciadas pela UI.
- [ ] T074 [US2] Implementar cards e estados visuais do overview; arquivos: `apps/web/src/features/monthly-control/monthly-overview-card.tsx` e `apps/web/src/features/monthly-control/status-badges.tsx`; depende de: T063, T040, T070, T071; concluído quando: previsto x realizado, receita atrasada, despesa vencida e saldo operacional negativo estiverem diferenciados.
- [ ] T075 [US2] Implementar alerta de duplicidade e toggle de realização; arquivos: `apps/web/src/features/monthly-control/duplicate-warning-dialog.tsx` e `apps/web/src/features/monthly-control/planned-realized-toggle.tsx`; depende de: T063, T042, T065, T072; concluído quando: o usuário puder confirmar duplicidade funcional e realizar o mesmo lançamento sem gerar um segundo registro.

**Checkpoint US2**: fluxo mensal operacional com recorrências, previsto x realizado e overview expandido.

---

## Fase 8: User Story 3 - Controlar parcelamentos e investimentos (P2)

- [ ] T076 [P] [US3] Criar testes unitários de parcelamentos; arquivos: `apps/api/src/modules/installment-plans/domain/installment-plan.rules.spec.ts`; depende de: T036, T038; concluído quando: geração idempotente, preservação de parcelas realizadas e cancelamento de futuras abertas estiverem cobertos.
- [ ] T077 [P] [US3] Criar testes unitários de movimentos de investimento; arquivos: `apps/api/src/modules/investment-movements/domain/investment-movement.rules.spec.ts`; depende de: T033, T037, T038; concluído quando: aporte, resgate, rendimento e ajuste manual com alvo e direção explícitos estiverem cobertos.
- [ ] T078 [P] [US3] Criar testes de integração de parcelamentos; arquivos: `apps/api/tests/integration/installment-plans.spec.ts`; depende de: T024, T026, T027, T036, T038; concluído quando: criação, preview de mudança, alteração e cancelamento seguirem o contrato.
- [ ] T079 [P] [US3] Criar testes de integração de investimentos; arquivos: `apps/api/tests/integration/investment-movements.spec.ts`; depende de: T024, T026, T027, T037, T038; concluído quando: transferências entre saldos e rendimento mensal seguirem as regras de negócio.
- [ ] T080 [US3] Implementar DTOs principais de parcelamentos; arquivos: `apps/api/src/modules/installment-plans/interfaces/http/dto/create-installment-plan.dto.ts` e `apps/api/src/modules/installment-plans/interfaces/http/dto/update-installment-plan.dto.ts`; depende de: T076; concluído quando: requests de criação e atualização aceitarem apenas campos do cliente.
- [ ] T081 [US3] Implementar DTOs de preview e cancelamento de parcelamentos; arquivos: `apps/api/src/modules/installment-plans/interfaces/http/dto/installment-change-preview.dto.ts` e `apps/api/src/modules/installment-plans/interfaces/http/dto/installment-cancel-preview.dto.ts`; depende de: T076; concluído quando: impacto em parcelas futuras puder ser validado sem estados derivados no request.
- [ ] T082 [US3] Implementar controller de parcelamentos; arquivos: `apps/api/src/modules/installment-plans/interfaces/http/installment-plans.controller.ts`; depende de: T078, T080, T081; concluído quando: `GET/POST/PATCH /v1/installment-plans` e endpoints de preview/cancelamento estiverem expostos.
- [ ] T083 [US3] Implementar serviço e módulo de parcelamentos; arquivos: `apps/api/src/modules/installment-plans/application/installment-plans.service.ts` e `apps/api/src/modules/installment-plans/installment-plans.module.ts`; depende de: T076, T082, T027, T038; concluído quando: alterações afetarem apenas parcelas futuras abertas e o saldo restante for recalculado corretamente.
- [ ] T084 [US3] Implementar DTO de criação de investimentos; arquivos: `apps/api/src/modules/investment-movements/interfaces/http/dto/create-investment-movement.dto.ts`; depende de: T077; concluído quando: o request exigir valor positivo e, para ajuste manual, saldo alvo e direção explícitos.
- [ ] T085 [US3] Implementar DTO de atualização de investimentos; arquivos: `apps/api/src/modules/investment-movements/interfaces/http/dto/update-investment-movement.dto.ts`; depende de: T077; concluído quando: correções de efetivação preservarem a data efetiva quando não for alterada explicitamente.
- [ ] T086 [US3] Implementar controller de investimentos; arquivos: `apps/api/src/modules/investment-movements/interfaces/http/investment-movements.controller.ts`; depende de: T079, T084, T085; concluído quando: `GET/POST/PATCH /v1/investment-movements` estiverem expostos conforme o OpenAPI.
- [ ] T087 [US3] Implementar serviço e módulo de investimentos; arquivos: `apps/api/src/modules/investment-movements/application/investment-movements.service.ts` e `apps/api/src/modules/investment-movements/investment-movements.module.ts`; depende de: T077, T086, T027, T037, T038; concluído quando: aportes, resgates e ajustes que afetam dois saldos ocorrerem em transação.
- [ ] T088 [P] [US3] Criar testes de frontend de parcelamentos; arquivos: `apps/web/src/features/installments/installments-page.test.tsx`; depende de: T039, T040, T041, T042; concluído quando: preview, confirmação e preservação de histórico estiverem exercitados.
- [ ] T089 [P] [US3] Criar testes de frontend de investimentos; arquivos: `apps/web/src/features/investments/investments-page.test.tsx`; depende de: T039, T040, T041, T042; concluído quando: tipos de movimento, alvo, direção e resumos de saldo estiverem exercitados.
- [ ] T090 [US3] Criar página de parcelamentos; arquivos: `apps/web/src/app/parcelamentos/page.tsx` e `apps/web/src/features/installments/installments-page.tsx`; depende de: T088, T082, T083; concluído quando: a tela listar e iniciar cadastro de parcelamentos.
- [ ] T091 [US3] Implementar formulário, listagem e previews de parcelamentos; arquivos: `apps/web/src/features/installments/installment-plan-form.tsx`, `apps/web/src/features/installments/installment-plan-list.tsx`, `apps/web/src/features/installments/installment-change-preview-dialog.tsx` e `apps/web/src/features/installments/installment-cancel-dialog.tsx`; depende de: T088, T042, T082, T083; concluído quando: o usuário puder visualizar o impacto antes de alterar ou cancelar.
- [ ] T092 [US3] Criar página de investimentos; arquivos: `apps/web/src/app/investimentos/page.tsx` e `apps/web/src/features/investments/investments-page.tsx`; depende de: T089, T086, T087; concluído quando: a tela de investimentos puder ser acessada separadamente do controle mensal.
- [ ] T093 [US3] Implementar formulário, listagem e resumo de investimentos; arquivos: `apps/web/src/features/investments/investment-movement-form.tsx`, `apps/web/src/features/investments/investment-movement-list.tsx`, `apps/web/src/features/investments/investment-balance-summary.tsx` e `apps/web/src/features/investments/movement-type-badges.tsx`; depende de: T089, T042, T086, T087; concluído quando: aporte, resgate, rendimento e ajuste manual puderem ser operados e visualizados.

**Checkpoint US3**: parcelamentos e investimentos auditáveis com transações e previews de impacto.

---

## Fase 9: User Story 4 - Visualizar dashboard e rastrear totais (P3)

- [ ] T094 [P] [US4] Criar testes de integração do dashboard; arquivos: `apps/api/tests/integration/dashboard.spec.ts`; depende de: T037, T083, T087; concluído quando: `GET /v1/dashboard` validar patrimônio em investimentos, receitas, despesas, aporte e saldo operacional.
- [ ] T095 [P] [US4] Criar testes de integração de breakdown e auditoria; arquivos: `apps/api/tests/integration/monthly-breakdown-and-audit.spec.ts`; depende de: T037, T038, T070; concluído quando: `GET /v1/months/{month}/breakdown` e `GET /v1/audit/{entityName}/{entityId}` validarem rastreabilidade e snapshots.
- [ ] T096 [P] [US4] Criar testes de frontend do dashboard; arquivos: `apps/web/src/features/dashboard/dashboard-page.test.tsx` e `apps/web/src/features/monthly-control/monthly-breakdown-drawer.test.tsx`; depende de: T039, T040, T041, T042; concluído quando: cards, drawer e timeline de auditoria estiverem exercitados.
- [ ] T097 [US4] Implementar módulo, serviço e controller do dashboard; arquivos: `apps/api/src/modules/dashboard/dashboard.module.ts`, `apps/api/src/modules/dashboard/application/dashboard.service.ts` e `apps/api/src/modules/dashboard/interfaces/http/dashboard.controller.ts`; depende de: T094, T070, T087; concluído quando: o endpoint `/v1/dashboard` refletir somente investimentos como patrimônio principal.
- [ ] T098 [US4] Implementar queries e controllers de breakdown e auditoria; arquivos: `apps/api/src/modules/monthly-overviews/application/monthly-breakdown.service.ts`, `apps/api/src/modules/monthly-overviews/interfaces/http/monthly-breakdown.controller.ts` e `apps/api/src/modules/audit/interfaces/http/audit.controller.ts`; depende de: T095, T038, T070; concluído quando: qualquer total mensal puder ser aberto até os lançamentos de origem.
- [ ] T099 [US4] Implementar home, cards e filtros do dashboard; arquivos: `apps/web/src/app/page.tsx`, `apps/web/src/features/dashboard/dashboard-page.tsx`, `apps/web/src/features/dashboard/dashboard-summary-cards.tsx` e `apps/web/src/features/dashboard/dashboard-filters.tsx`; depende de: T096, T039, T041, T097; concluído quando: o dashboard inicial puder ser aberto como página principal.
- [ ] T100 [US4] Implementar breakdown drawer, timeline e links de rastreio; arquivos: `apps/web/src/features/monthly-control/monthly-breakdown-drawer.tsx`, `apps/web/src/features/monthly-control/breakdown-item-list.tsx`, `apps/web/src/features/dashboard/audit-timeline.tsx` e `apps/web/src/features/dashboard/traceability-link.tsx`; depende de: T096, T042, T098, T071; concluído quando: o usuário puder abrir um total mensal e navegar até a trilha de auditoria.

**Checkpoint US4**: dashboard inicial e rastreabilidade de totais disponíveis.

---

## Fase 10: Dashboard e gráficos

- [ ] T101 [P] [US4] Implementar gráfico de evolução dos investimentos; arquivos: `apps/web/src/features/dashboard/charts/investment-evolution-chart.tsx`; depende de: T099; concluído quando: a série temporal conectar pontos e representar somente patrimônio em investimentos.
- [ ] T102 [P] [US4] Implementar gráfico de previsto versus realizado; arquivos: `apps/web/src/features/dashboard/charts/planned-vs-realized-chart.tsx`; depende de: T099; concluído quando: previsto e realizado estiverem visualmente diferenciados com tooltip monetário.
- [ ] T103 [P] [US4] Implementar gráfico de despesas por categoria; arquivos: `apps/web/src/features/dashboard/charts/expenses-by-category-chart.tsx`; depende de: T099; concluído quando: a distribuição suportar legenda, ocultação de séries e estado vazio.
- [ ] T104 [US4] Implementar formatadores e empty state de gráficos; arquivos: `apps/web/src/lib/formatters/money.ts`, `apps/web/src/lib/formatters/financial-date.ts` e `apps/web/src/features/dashboard/charts/chart-empty-state.tsx`; depende de: T013, T040; concluído quando: dinheiro e datas financeiras estiverem formatados sem conversão monetária para `number`.
- [ ] T105 [US4] Integrar gráficos, responsividade e seleção de séries; arquivos: `apps/web/src/features/dashboard/dashboard-page.tsx`; depende de: T101, T102, T103, T104; concluído quando: legendas, tooltips, seleção/ocultação de séries e responsividade estiverem completos.

**Checkpoint F10**: dashboard visual completo sem adicionar simulador avançado.

---

## Fase 11: Testes end-to-end

- [ ] T106 Criar a configuração E2E; arquivos: `playwright.config.ts`; depende de: T015, T016, T017, T042; concluído quando: `web`, `api` e `db` puderem ser iniciados para testes locais da feature.
- [ ] T107 [P] Criar cenário E2E da US1; arquivos: `apps/web/tests/e2e/us1-settings-categories.spec.ts`; depende de: T059, T106; concluído quando: configurar base financeira, gerenciar categorias e validar overview mínimo estiverem cobertos ponta a ponta.
- [ ] T108 [P] Criar cenário E2E da US2; arquivos: `apps/web/tests/e2e/us2-monthly-control.spec.ts`; depende de: T075, T106; concluído quando: materializar um mês, registrar lançamentos e validar previsto x realizado estiverem cobertos ponta a ponta.
- [ ] T109 [P] Criar cenário E2E da US3; arquivos: `apps/web/tests/e2e/us3-installments-investments.spec.ts`; depende de: T093, T106; concluído quando: parcelamentos, previews, aporte, resgate e ajuste manual estiverem cobertos ponta a ponta.
- [ ] T110 [P] Criar cenário E2E da US4; arquivos: `apps/web/tests/e2e/us4-dashboard-traceability.spec.ts`; depende de: T105, T100, T106; concluído quando: dashboard, gráficos e rastreabilidade de totais estiverem cobertos ponta a ponta.

**Checkpoint F11**: histórias principais cobertas ponta a ponta com Playwright.

---

## Fase 12: Documentação, segurança e validação final

- [ ] T111 Implementar redaction de logs e dados sensíveis; arquivos: `apps/api/src/common/redaction/log-redaction.ts`; depende de: T044; concluído quando: respostas e logs públicos não incluírem segredos, stack traces ou payloads sensíveis crus.
- [ ] T112 Atualizar documentação raiz; arquivos: `README.md`; depende de: T015, T106; concluído quando: setup local, scripts e restrições de confidencialidade estiverem documentados sem afirmar implementação inexistente.
- [ ] T113 Atualizar quickstart da feature; arquivos: `specs/001-nucleo-controle-financeiro/quickstart.md`; depende de: T110; concluído quando: os passos refletirem a implementação real e os fluxos de validação manual da feature.
- [ ] T114 Atualizar checklist de requisitos; arquivos: `specs/001-nucleo-controle-financeiro/checklists/requirements.md`; depende de: T110; concluído quando: cada requisito funcional e cada história tiverem forma explícita de validação.
- [ ] T115 Atualizar contexto operacional do agente; arquivos: `AGENTS.md`; depende de: T105; concluído quando: convenções de dinheiro decimal, datas financeiras, idempotência e auditoria estiverem refletidas no contexto do projeto.
- [ ] T116 Criar smoke test do contrato OpenAPI; arquivos: `apps/api/tests/integration/openapi-contract-smoke.spec.ts`; depende de: T050, T053, T065, T068, T082, T086, T097, T098, T111; concluído quando: todos os endpoints do contrato tiverem cobertura mínima de disponibilidade e shape esperado.
- [ ] T117 Criar massa fictícia para validação de performance; arquivos: `apps/api/prisma/performance-seed.ts` e `specs/001-nucleo-controle-financeiro/performance/performance-dataset.md`; depende de: T087, T097, T098; concluído quando: existir um conjunto reproduzível de dados fictícios suficiente para medir overview, dashboard e materialização sem usar dados reais.
- [ ] T118 Medir performance do overview mensal; arquivos: `apps/api/tests/performance/monthly-overview.perf.spec.ts`; depende de: T117, T070, T116; concluído quando: o endpoint `GET /v1/months/{month}/overview` for medido com comandos reproduzíveis e resultados brutos persistidos.
- [ ] T119 Medir performance do dashboard; arquivos: `apps/api/tests/performance/dashboard.perf.spec.ts`; depende de: T117, T097, T116; concluído quando: o endpoint `GET /v1/dashboard` for medido com comandos reproduzíveis e resultados brutos persistidos.
- [ ] T120 Medir performance da materialização mensal; arquivos: `apps/api/tests/performance/month-materialization.perf.spec.ts`; depende de: T117, T083, T087; concluído quando: a materialização sob demanda de um mês completo for medida com comandos reproduzíveis e sem infraestrutura de produção.
- [ ] T121 Registrar resultados de performance e ambiente; arquivos: `specs/001-nucleo-controle-financeiro/performance/results.md`; depende de: T118, T119, T120; concluído quando: tempos observados, tamanho da massa, máquina local e comandos executados estiverem documentados.
- [ ] T122 Comparar resultados com as metas do plano; arquivos: `specs/001-nucleo-controle-financeiro/performance/assessment.md`; depende de: T121; concluído quando: overview, dashboard e materialização estiverem comparados explicitamente com as metas de `plan.md`.
- [ ] T123 Registrar desvios de performance como pendências; arquivos: `specs/001-nucleo-controle-financeiro/performance/deviations.md`; depende de: T122; concluído quando: qualquer desvio em relação às metas estiver registrado como pendência antes de declarar a feature completa concluída.

**Checkpoint F12**: documentação, segurança mínima, validação contratual e validação de performance da feature completa concluídas.

---

## Dependências e ordem de execução

### Dependências por fase

- Fase 1 inicia imediatamente.
- Fase 2 depende da Fase 1.
- Fase 3 depende das Fases 1 e 2.
- Fase 4 depende da Fase 3.
- Fase 5 depende da Fase 4 e deve terminar antes das telas funcionais da US1.
- US1 depende das Fases 4 e 5 e já entrega um incremento demonstrável.
- US2 depende de US1 para configurações e categorias.
- US3 depende das fundações, da US1 e do fluxo mensal já estabelecido na US2.
- US4 depende dos dados produzidos por US2 e US3.
- Fase 10 depende da base visual da US4.
- Fase 11 depende das histórias implementadas e da integração principal.
- Fase 12 depende das histórias desejadas, dos testes E2E, do contrato estabilizado e da validação final de performance da feature completa.

### Fluxo crítico representativo

- As dependências declaradas individualmente em cada tarefa são a fonte autoritativa para a ordem de execução.
- Marcadores `[P]` só permitem paralelismo quando todas as dependências declaradas da tarefa já estiverem concluídas.
- O bloco abaixo é apenas um resumo representativo e não substitui as dependências individuais de cada tarefa.
- Sequência representativa válida para o MVP da US1: `T001 -> T002 -> T003 -> T007 -> T008 -> T009 -> T010 -> T011 -> T012 -> T013 -> T014 -> T015 -> T021 -> T022 -> T023 -> T024 -> T025 -> T026 -> T029 -> T030 -> T033 -> T034 -> T035 -> T036 -> T037 -> T038 -> T039 -> T040 -> T041 -> T042 -> T045 -> T046 -> T047 -> T048 -> T049 -> T050 -> T051 -> T052 -> T053 -> T054 -> T055 -> T056 -> T057 -> T058 -> T059`
- Essa sequência cobre setup, infraestrutura fundamental, schema e migrations necessários, contratos e integração web/API, backend da US1, frontend da US1, testes da US1 e o checkpoint do MVP.

### Paralelismo seguro
- T003, T004, T005, T006, T009 e T010 podem ocorrer em paralelo após T001-T002.
- T011, T013, T014, T016 e T017 podem ocorrer em paralelo na Fase 2 porque escrevem arquivos distintos.
- T029, T030, T031 e T032 podem ocorrer em paralelo na Fase 4.
- T039, T040, T041 e T042 podem ocorrer em paralelo parcial após o cliente HTTP existir, pois a escrita fica separada por arquivo.
- Em cada história, testes de backend e frontend marcados com `[P]` são independentes porque escrevem specs diferentes.
- T101, T102 e T103 podem ocorrer em paralelo porque cada gráfico fica em arquivo próprio.
- T107, T108, T109 e T110 podem ocorrer em paralelo após T106 porque cada cenário E2E fica em arquivo próprio.

### Regras de execução

- Testes críticos vêm antes da implementação correspondente para regras financeiras, materialização, parcelamentos, investimentos e auditoria.
- Nenhuma tarefa de frontend funcional começa antes da camada de integração T039-T044.
- Tarefas marcadas com `[P]` não compartilham o mesmo arquivo e não dependem de um artefato ainda inexistente no mesmo passo; elas só podem começar depois que todas as dependências individuais declaradas estiverem concluídas.
- A US1 forma o primeiro incremento executável, demonstrável e testável sem depender da US2, e as tarefas T117-T123 não bloqueiam esse checkpoint inicial do MVP.
- O escopo exclui autenticação, múltiplos usuários, Open Finance, integração bancária, app mobile, simulador avançado, importação definitiva da planilha e controle individual de ativos.







