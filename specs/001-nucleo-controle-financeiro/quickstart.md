# Quickstart (Planned): Núcleo de Controle Financeiro Pessoal

> Este documento descreve como o projeto deverá ser executado e validado quando a implementação existir. Nenhum dos comandos abaixo implica que a feature já esteja pronta hoje.

## Objetivo

Validar localmente o monorepo com `docker compose`, API REST documentada, frontend em pt-BR e PostgreSQL no mesmo ambiente de desenvolvimento.

## Pré-requisitos previstos

- Docker Desktop ou engine compatível com Compose
- Node.js 22 LTS
- pnpm 9+
- Arquivos `.env.example` preenchidos manualmente em cada aplicação, sem versionar `.env`

## Estrutura esperada

- `compose.yaml` na raiz com serviços `web`, `api` e `db`
- `apps/web` para Next.js
- `apps/api` para NestJS e Prisma
- `packages/contracts` para tipos/contratos compartilháveis
- `packages/config` para convenções compartilhadas

## Subida futura do ambiente local

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp .env.example .env
docker compose up --build
```

## Serviços esperados após implementação

- `web`: interface em `http://localhost:3000`
- `api`: API REST em `http://localhost:3333`
- `swagger`: documentação OpenAPI em `http://localhost:3333/docs`
- `db`: PostgreSQL acessível somente na rede local do compose e, opcionalmente, na porta exposta de desenvolvimento

## Sequência de validação funcional prevista

### 1. Configurações iniciais

1. Abrir a documentação Swagger.
2. Enviar `PUT /v1/financial-settings` com datas em `YYYY-MM-DD`, valores monetários em strings decimais e timezone implícito do backend `America/Sao_Paulo`.
3. Confirmar que a leitura posterior mostra segunda parcela salarial derivável e nenhum mês anterior ao início com geração automática.

### 2. Categorias

1. Criar categorias fictícias por `POST /v1/categories`.
2. Desativar uma categoria usada e validar que o histórico permanece acessível.

### 3. Materialização mensal e lançamentos

1. Solicitar `GET /v1/months/2026-08-01/overview`.
2. Verificar que o mês é materializado sob demanda sem criar duplicatas ao repetir a chamada.
3. Criar receitas extras e despesas variáveis com status planejado.
4. Atualizar alguns lançamentos para realizado e confirmar que previsto e realizado continuam no mesmo registro lógico.

### 4. Despesas fixas e parcelamentos

1. Criar uma regra recorrente de despesa fixa.
2. Reabrir o overview do mês e confirmar a geração da ocorrência mensal única.
3. Criar um parcelamento e validar geração das parcelas futuras.
4. Solicitar preview de alteração/cancelamento e verificar impacto sem apagar histórico já realizado.

### 5. Investimentos

1. Registrar aporte, rendimento, resgate e ajuste manual com dados fictícios.
2. Confirmar no overview e no dashboard que:
   - aporte reduz saldo operacional e aumenta investimentos;
   - resgate faz o inverso;
   - rendimento aumenta somente investimentos;
   - ajuste manual afeta apenas o saldo explicitamente escolhido.

### 6. Dashboard

1. Abrir a home do frontend.
2. Validar gráficos ECharts com séries temporais conectadas, tooltips monetários em `pt-BR`, legenda, ocultação de séries e distinção entre previsto e realizado.

## Execução prevista de testes

```bash
pnpm -r test
pnpm --filter web test
pnpm --filter api test
pnpm --filter api test:integration
pnpm exec playwright test
```

## Resultados esperados

- Nenhum cálculo financeiro usa `number` no domínio.
- Endpoints aceitam dinheiro como string decimal e datas como `YYYY-MM-DD`.
- Meses anteriores ao início do controle não geram automações.
- Materialização mensal é idempotente.
- Parcelamentos preservam parcelas realizadas.
- Dashboard principal mostra patrimônio em investimentos sem somar o saldo operacional.

## Dados de exemplo

- Todos os testes e seeds deverão usar apenas dados fictícios.
- A planilha real em `private-input/` permanece fora do fluxo de execução e nunca deve ser importada automaticamente.
