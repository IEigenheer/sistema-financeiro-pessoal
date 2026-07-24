# Research: Núcleo de Controle Financeiro Pessoal

## Decision 1: Monorepo simples com pnpm workspaces
- **Decision**: Usar `pnpm workspaces` como mecanismo único de monorepo, com `apps/web`, `apps/api`, `packages/contracts` e `packages/config`.
- **Rationale**: O projeto é uma aplicação pessoal de baixa complexidade operacional. `pnpm workspaces` resolve linking, scripts compartilhados e cache local sem introduzir a sobrecarga conceitual de Nx/Turborepo.
- **Alternatives considered**:
  - Nx: descartado por elevar a complexidade sem necessidade comprovada nesta primeira versão.
  - Turborepo: descartado pelo mesmo motivo; caching avançado não é prioritário agora.

## Decision 2: Persistência monetária exata e transporte decimal por string
- **Decision**: Persistir valores monetários como `NUMERIC(19,2)` no PostgreSQL, taxas como `NUMERIC(12,8)`, usar `Prisma.Decimal` no backend e transportar dinheiro na API como strings decimais.
- **Rationale**: Garante exatidão financeira, compatibilidade com Prisma, rastreabilidade de arredondamento e conformidade com a constituição, que proíbe float binário em cálculos de domínio.
- **Alternatives considered**:
  - Inteiros em centavos: viável, mas menos expressivo para consultas, OpenAPI e Prisma quando combinado com taxas percentuais de precisão maior.
  - `number` em TypeScript: descartado por risco de erro binário e quebra constitucional.

## Decision 3: Regras de arredondamento explícitas
- **Decision**: Adotar `ROUND_HALF_UP` para arredondamentos monetários e aplicá-lo apenas em pontos definidos: persistência monetária final, cálculo da segunda parcela salarial, materialização de parcelas e consolidações de exibição quando necessário.
- **Rationale**: `ROUND_HALF_UP` é fácil de explicar, previsível e cobre a exigência da diferença salarial ser absorvida pela segunda parcela.
- **Alternatives considered**:
  - `BANKERS ROUNDING`: descartado por ser menos intuitivo para o domínio de finanças pessoais.
  - Arredondar a cada operação intermediária: descartado por amplificar erro acumulado.

## Decision 4: Datas financeiras como DATE e competência mensal como primeiro dia do mês
- **Decision**: Representar datas financeiras sem horário com `DATE`; transportar datas via API em `YYYY-MM-DD`; representar a competência mensal por um `DATE` sempre no primeiro dia do mês (`competencyMonth`).
- **Rationale**: Evita dependência de timezone do navegador, simplifica filtros mensais, mantém compatibilidade com OpenAPI e PostgreSQL e permite query/indexação consistentes.
- **Alternatives considered**:
  - `TIMESTAMP WITH TIME ZONE`: descartado porque o domínio principal trabalha com datas civis, não instantes.
  - String `YYYY-MM`: descartada porque `DATE` oferece validação e ordenação nativas no banco.

## Decision 5: Materialização mensal sob demanda e idempotente
- **Decision**: Não pré-criar meses indefinidamente. Ao abrir ou mutar um mês, um serviço de materialização gera em transação as ocorrências automáticas daquele mês (salário, despesas fixas, parcelas, aporte mensal padrão) usando chaves únicas de geração para evitar duplicidade.
- **Rationale**: Reduz volume morto, respeita o início do controle, suporta anos futuros e mantém o comportamento previsível para meses vazios.
- **Alternatives considered**:
  - Pré-geração anual completa: descartada por criar registros desnecessários e dificultar correções.
  - Geração puramente em memória a cada leitura: descartada por dificultar auditoria, rastreabilidade e consistência entre leituras/escritas.

## Decision 6: Planned vs realized no mesmo registro
- **Decision**: Representar planejado e realizado como estados do mesmo lançamento, com campos distintos para valor/data previstos e efetivos.
- **Rationale**: Evita duplicidade semântica, simplifica consolidação mensal, mantém histórico auditável e segue a decisão já consolidada na especificação.
- **Alternatives considered**:
  - Um registro para previsto e outro para realizado: descartado por dobrar cardinalidade, complicar conciliação e arriscar dupla contagem.

## Decision 7: Modelagem separada entre lançamentos financeiros e movimentos de investimento
- **Decision**: Usar `FinancialEntry` para receitas, despesas, ocorrências recorrentes e parcelas; usar `InvestmentMovement` para aporte, rendimento, resgate e ajuste manual.
- **Rationale**: Mantém clareza conceitual sem criar uma modelagem excessivamente genérica. Movimentos que afetam dois saldos continuam transacionais, mas o modelo permanece compreensível e alinhado ao domínio funcional.
- **Alternatives considered**:
  - Tabela única para todo tipo de evento financeiro: possível, mas acrescenta complexidade de campos opcionais e regras condicionais demais para a primeira versão.
  - Tabelas por mês: descartadas explicitamente pelo escopo.

## Decision 8: Parcelamentos com plano e itens derivados
- **Decision**: Manter `InstallmentPlan` como origem e `InstallmentItem` como parcelas materializadas, com parcelas realizadas imutáveis, futuras recalculáveis e cancelamento por mudança de status em parcelas futuras abertas.
- **Rationale**: Permite preview de impacto, cancelamento sem exclusão, saldo restante correto e materialização idempotente por número de parcela/competência.
- **Alternatives considered**:
  - Gerar parcelas apenas sob consulta sem persistência: descartado por enfraquecer rastreabilidade e histórico.
  - Reescrever parcelas realizadas: descartado por violar auditabilidade.

## Decision 9: Auditoria explícita e origem técnica sem autenticação
- **Decision**: Persistir `AuditEvent` com entidade, identificador, operação, valores anterior/posterior, data/hora e origem (`local-user` ou `system`).
- **Rationale**: O sistema ainda não tem autenticação, mas precisa manter rastreabilidade. A origem técnica cobre edições manuais e materializações automáticas sem inventar um módulo de auth fora de escopo.
- **Alternatives considered**:
  - Apenas `updatedAt`: descartado por ser insuficiente para correções financeiras.
  - Soft deletes sem trilha detalhada: descartado por não explicar o que mudou.

## Decision 10: Prevenção de duplicidade em duas camadas
- **Decision**: Combinar alerta funcional por semelhança (tipo, valor, data, descrição normalizada, categoria) com proteção técnica via `Idempotency-Key` para operações repetidas de API.
- **Rationale**: Atende à exigência de não bloquear absolutamente duplicidades funcionais, ao mesmo tempo em que evita duplicidade técnica por retry/reenvio.
- **Alternatives considered**:
  - Apenas alerta de UI: insuficiente para retries de rede.
  - Bloqueio absoluto por chave natural: rígido demais para o domínio.

## Decision 11: Estratégia de validação distribuída com autoridade final no backend
- **Decision**: Usar Zod + React Hook Form no frontend para UX e DTOs validados com `class-validator`/ValidationPipe no NestJS, com contratos OpenAPI e tipos compartilhados mínimos em `packages/contracts`.
- **Rationale**: Evita round-trips desnecessários, melhora mensagens ao usuário e mantém o backend como árbitro final das regras de negócio.
- **Alternatives considered**:
  - Validação apenas no backend: segura, porém piora UX e não atende plenamente ao requisito.
  - Compartilhar esquemas de domínio completos entre frontend e backend: descartado por acoplamento excessivo.

## Decision 12: Stack de testes focada em corretude financeira
- **Decision**: Manter Jest/Supertest no backend, Vitest/React Testing Library no frontend e Playwright para E2E, com cobertura explícita para arredondamento, idempotência, transações, previsto vs realizado, data inicial e parcelamentos.
- **Rationale**: A pilha sugerida pelo usuário já cobre bem a natureza do sistema e não exige substituição nesta etapa.
- **Alternatives considered**:
  - Trocar Jest por Vitest também no backend: possível, mas reduz alinhamento com NestJS e não oferece ganho claro aqui.
  - Cypress no lugar de Playwright: descartado por não trazer vantagem concreta para os fluxos selecionados.
