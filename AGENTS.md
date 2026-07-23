# Agent Context

- Este repositório segue a arquitetura definida pela feature `001-nucleo-controle-financeiro`.
- Monorepo com `pnpm workspaces`, `apps/web`, `apps/api`, `packages/contracts`, `packages/config` e `compose.yaml` na raiz.
- Stack planejada: Next.js App Router, NestJS, PostgreSQL, Prisma, OpenAPI/Swagger, Apache ECharts e TypeScript strict.
- Locale obrigatório: `pt-BR`; moeda padrão: `BRL`; timezone padrão: `America/Sao_Paulo`.
- Dinheiro deve permanecer em `Decimal`/`NUMERIC`, nunca em `number` para cálculos de domínio.
- Datas financeiras usam `DATE` e a competência mensal é representada pelo primeiro dia do mês.
- Materialização mensal é sob demanda e idempotente.
- Não versionar planilhas reais, `.env`, backups, volumes locais de banco ou dados pessoais.
