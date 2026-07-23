# Feature Specification: Núcleo de Controle Financeiro Pessoal

**Feature Branch**: `001-nucleo-controle-financeiro`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "Migrar o núcleo da planilha de controle financeiro pessoal para uma aplicação web, cobrindo configurações financeiras, categorias, receitas, despesas, parcelamentos, aportes, investimentos, consolidação mensal, dashboard inicial, rastreabilidade e estados de correção, sem importar dados reais nem definir tecnologia nesta etapa."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configurar a base financeira (Priority: P1)

Como usuário, quero definir minhas configurações financeiras e categorias para que o sistema gere o calendário financeiro correto a partir da data de início do controle e mantenha a classificação dos lançamentos de forma consistente.

**Why this priority**: Sem configurações financeiras e categorias válidas, o sistema não consegue iniciar o controle mensal nem aplicar as regras-base de receitas, aportes e consolidação.

**Independent Test**: Pode ser testada de forma independente ao cadastrar configurações iniciais e categorias, salvar os dados e verificar que meses anteriores ao início do controle não geram movimentações automáticas.

**Acceptance Scenarios**:

1. **Given** que o usuário informa data de início do controle, salário líquido mensal, valor da primeira parcela, dia da primeira parcela, aporte mensal padrão, rendimento projetado e saldos iniciais, **When** salva as configurações, **Then** o sistema registra esses parâmetros e calcula a segunda parcela do salário como o restante do salário líquido com recebimento no último dia do mês.
2. **Given** que existem meses anteriores à data de início configurada, **When** o usuário acessa esses meses no sistema, **Then** eles não exibem receitas automáticas, despesas recorrentes automáticas, aportes automáticos nem evolução patrimonial gerada antes da data inicial.
3. **Given** que o usuário cadastra uma categoria e depois a desativa, **When** consulta lançamentos históricos que usam essa categoria, **Then** o sistema preserva o histórico, impede exclusão destrutiva e sinaliza a categoria como inativa para novos usos.

---

### User Story 2 - Registrar e acompanhar o mês financeiro (Priority: P1)

Como usuário, quero registrar receitas, despesas fixas e despesas variáveis com status previsto ou realizado para acompanhar meu fluxo mensal e comparar o que foi planejado com o que realmente aconteceu.

**Why this priority**: Este é o núcleo operacional que substitui a parte principal da planilha e entrega valor imediato no controle mensal de caixa.

**Independent Test**: Pode ser testada de forma independente ao cadastrar receitas e despesas de um mês, marcar parte delas como realizadas e verificar a consolidação mensal, a diferença entre previsto e realizado e os estados de atraso ou vencimento.

**Acceptance Scenarios**:

1. **Given** que o usuário possui configurações financeiras ativas, **When** acessa um mês iniciado após a data de início do controle, **Then** o sistema apresenta as parcelas automáticas de salário previstas para aquele mês sem duplicar registros.
2. **Given** que o usuário cadastra uma despesa fixa recorrente com valor, categoria, dia de vencimento, data inicial e status ativa, **When** visualiza os meses cobertos pelo período da recorrência, **Then** o sistema gera previsões mensais únicas para essa despesa até a data final, quando houver.
3. **Given** que o usuário registra receitas extras, despesas variáveis e altera o status de planejado para realizado, **When** consulta a consolidação do mês, **Then** o sistema diferencia claramente valores previstos e realizados e recalcula os totais mensais correspondentes.
4. **Given** que existe uma receita prevista após a data esperada de recebimento ou uma despesa prevista após a data de vencimento sem baixa, **When** o mês é consultado, **Then** o sistema sinaliza os estados de receita atrasada e despesa vencida sem convertê-las automaticamente em realizadas.

---

### User Story 3 - Controlar parcelamentos e investimentos (Priority: P2)

Como usuário, quero registrar compras parceladas, aportes e outros movimentos de investimento para controlar compromissos futuros, distinguir o saldo operacional do patrimônio investido e preservar a auditabilidade de cada movimento.

**Why this priority**: Parcelamentos e investimentos são partes centrais do controle financeiro, mas dependem das configurações e do fluxo mensal já estabelecidos.

**Independent Test**: Pode ser testada de forma independente ao cadastrar um parcelamento e movimentos de investimento, validando a geração das parcelas mensais, o saldo restante e a separação entre saldo operacional e patrimônio investido.

**Acceptance Scenarios**:

1. **Given** que o usuário cadastra uma compra parcelada uma única vez com total, quantidade de parcelas, valor da parcela e mês da primeira cobrança, **When** salva o parcelamento, **Then** o sistema identifica automaticamente os meses de cobrança, a numeração de cada parcela, a data da última parcela, o total comprometido por mês e o saldo remanescente do parcelamento.
2. **Given** que o usuário registra um aporte mensal ou manual, **When** o lançamento é confirmado, **Then** o sistema reduz o saldo operacional, aumenta o saldo de investimentos e registra o movimento como aporte auditável, sem classificá-lo como despesa.
3. **Given** que o usuário registra rendimento, resgate ou ajuste manual, **When** consulta a movimentação de investimentos, **Then** o sistema distingue esses tipos de lançamento e atualiza separadamente saldo operacional e saldo de investimentos conforme a natureza do movimento.
4. **Given** que um parcelamento possui parcelas já realizadas, **When** o usuário cancela ou altera o parcelamento, **Then** o sistema preserva o histórico realizado, atualiza apenas as parcelas futuras elegíveis e exige confirmação explícita antes de qualquer alteração com impacto retroativo.

---

### User Story 4 - Visualizar dashboard e rastrear totais (Priority: P3)

Como usuário, quero visualizar um dashboard inicial e abrir os totais consolidados do mês para entender minha evolução patrimonial em investimentos, distribuição de despesas e composição de cada valor agregado.

**Why this priority**: O dashboard aumenta a capacidade de análise e decisão, mas depende da existência prévia de dados consistentes nas funcionalidades operacionais.

**Independent Test**: Pode ser testada de forma independente ao consultar um mês com dados registrados e verificar os indicadores do dashboard, os gráficos e a abertura de totais em seus lançamentos de origem.

**Acceptance Scenarios**:

1. **Given** que há lançamentos válidos em pelo menos um mês após a data de início do controle, **When** o usuário acessa o dashboard inicial, **Then** o sistema exibe patrimônio atual em investimentos, aporte do mês, receitas do mês, despesas do mês, saldo operacional, evolução mensal dos investimentos, distribuição de despesas por categoria e comparação entre previsto e realizado.
2. **Given** que o dashboard apresenta evolução temporal, **When** o usuário visualiza o gráfico de evolução patrimonial, **Then** a série principal considera somente investimentos, conecta os pontos mensais por linha e diferencia visualmente informações previstas e realizadas quando aplicável.
3. **Given** que o usuário abre um total mensal consolidado, **When** solicita o detalhamento do valor, **Then** o sistema mostra quais receitas, despesas, parcelas, aportes e rendimentos compõem aquele total sem perder rastreabilidade por origem e status.

### Edge Cases

- Mês sem movimentações deve permanecer acessível e exibir totais zerados ou saldos herdados, sem criar lançamentos artificiais além das previsões automáticas válidas após a data de início.
- Despesa vencida deve permanecer prevista e sinalizada como vencida até que seja quitada, editada ou cancelada com justificativa compatível.
- Receita atrasada deve permanecer prevista e sinalizada como atrasada até recebimento, remarcação ou cancelamento explícito.
- Lançamento futuro deve ser permitido como planejado, mas não pode ser tratado como realizado antes da data efetiva.
- Categoria desativada deve continuar visível em registros históricos e indisponível para novos cadastros comuns.
- Parcelamento cancelado não pode apagar silenciosamente parcelas realizadas; parcelas futuras devem refletir o cancelamento conforme a regra aplicada.
- Valores negativos só são aceitos quando compatíveis com o tipo de movimento; em casos inválidos, o sistema deve bloquear o lançamento com mensagem clara.
- Duplicidade de lançamento deve gerar alerta antes da confirmação quando houver forte semelhança entre tipo, data, valor e descrição.
- Edição de lançamento já realizado deve manter trilha de auditoria do valor anterior e do novo valor.
- Saldo operacional negativo deve ser permitido e claramente sinalizado como estado de caixa insuficiente.
- Alteração de configurações com impacto em meses anteriores deve exibir prévia do efeito e exigir confirmação explícita antes de recalcular períodos afetados.
- Despesa fixa não pode gerar previsões duplicadas para o mesmo mês e a mesma origem recorrente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir cadastrar e editar uma configuração financeira base contendo data de início do controle, salário líquido mensal, valor da primeira parcela salarial, dia de recebimento da primeira parcela, aporte mensal padrão, rendimento mensal projetado, saldo inicial operacional e saldo inicial de investimentos.
- **FR-002**: O sistema MUST calcular a segunda parcela salarial como a diferença entre o salário líquido mensal e a primeira parcela informada.
- **FR-003**: O sistema MUST registrar a data de recebimento da segunda parcela salarial como o último dia do respectivo mês.
- **FR-004**: O sistema MUST impedir a geração automática de receitas, despesas recorrentes, aportes ou patrimônio em meses anteriores à data de início do controle.
- **FR-005**: O sistema MUST permitir cadastrar, editar, desativar e listar categorias utilizadas para classificar despesas e outros lançamentos pertinentes.
- **FR-006**: O sistema MUST preservar o histórico de categorias já utilizadas em registros existentes e impedir exclusão destrutiva que comprometa rastreabilidade histórica.
- **FR-007**: O sistema MUST permitir registrar receitas automáticas de salário e receitas extras com data de recebimento, descrição genérica, categoria ou tipo, valor e status planejado ou realizado.
- **FR-008**: O sistema MUST diferenciar visual e numericamente receitas previstas de receitas efetivamente recebidas.
- **FR-009**: O sistema MUST permitir cadastrar despesas fixas recorrentes com descrição genérica, categoria, valor padrão, dia de vencimento, data inicial, data final opcional e status ativa ou inativa.
- **FR-010**: O sistema MUST gerar no máximo uma previsão mensal por despesa fixa recorrente para cada mês elegível dentro de seu período de vigência.
- **FR-011**: O sistema MUST permitir registrar despesas variáveis individuais com data, descrição genérica, categoria, valor e status planejado ou realizado.
- **FR-012**: O sistema MUST permitir registrar uma compra parcelada uma única vez com descrição genérica, categoria, valor total, quantidade de parcelas, valor da parcela, data da compra, mês da primeira parcela, forma de pagamento e status.
- **FR-013**: O sistema MUST calcular automaticamente, para cada parcelamento, os meses de cobrança, o número atual de cada parcela, a data da última parcela, o valor total comprometido por mês e o saldo restante do parcelamento.
- **FR-014**: O sistema MUST preservar parcelas já realizadas quando um parcelamento for alterado ou cancelado, evitando exclusão silenciosa do histórico.
- **FR-015**: O sistema MUST registrar aportes mensais e manuais como movimentos auditáveis que reduzem o saldo operacional e aumentam o saldo de investimentos sem classificá-los como despesa.
- **FR-016**: O sistema MUST permitir registrar rendimentos, resgates e ajustes manuais como lançamentos distintos de aportes.
- **FR-017**: O sistema MUST tratar o saldo da conta corrente como saldo operacional para fins de fluxo de caixa.
- **FR-018**: O sistema MUST tratar o patrimônio principal exibido ao usuário como patrimônio em investimentos, sem somar automaticamente o saldo operacional aos indicadores patrimoniais principais.
- **FR-019**: O sistema MUST consolidar por mês receitas previstas, receitas realizadas, despesas fixas previstas, despesas realizadas, despesas variáveis, parcelas, aportes, rendimentos, saldo operacional, saldo de investimentos e diferença entre previsto e realizado.
- **FR-020**: O sistema MUST iniciar os cálculos de consolidação somente a partir da data configurada como início do controle.
- **FR-021**: O sistema MUST exibir um dashboard inicial com patrimônio atual em investimentos, aporte realizado no mês, receitas do mês, despesas do mês, saldo operacional, evolução mensal dos investimentos, distribuição de despesas por categoria e comparação entre valores previstos e realizados.
- **FR-022**: O sistema MUST apresentar gráficos com títulos, legendas, tooltips, valores monetários formatados, distinção entre previsto e realizado e quantidade de séries compatível com leitura clara.
- **FR-023**: O sistema MUST representar evolução temporal com conexão contínua entre os valores mensais quando o indicador for uma série histórica.
- **FR-024**: O sistema MUST permitir rastrear qualquer valor consolidado até os lançamentos que o compõem, incluindo receitas, despesas, parcelas, aportes e rendimentos.
- **FR-025**: O sistema MUST permitir abrir um total mensal consolidado e identificar a composição do valor por lançamentos de origem, tipo, status e período.
- **FR-026**: O sistema MUST sinalizar mês sem movimentações, despesa vencida, receita atrasada, lançamento futuro, categoria desativada, parcelamento cancelado e saldo operacional negativo com comportamento consistente e compreensível.
- **FR-027**: O sistema MUST alertar sobre potencial duplicidade antes de confirmar um novo lançamento quando houver coincidência relevante de tipo, data, valor e descrição genérica.
- **FR-028**: O sistema MUST manter trilha de auditoria para edição de lançamentos já realizados, alterações relevantes em parcelamentos e ajustes de configuração com efeito retroativo.
- **FR-029**: O sistema MUST apresentar prévia e solicitar confirmação explícita antes de aplicar alterações de configuração que afetem meses já consolidados.
- **FR-030**: O sistema MUST limitar o escopo desta feature ao controle financeiro principal, excluindo simulador de cenários, simulação de compras ou receitas, controle detalhado por ativo financeiro, integrações bancárias, múltiplos usuários, autenticação, aplicativo mobile nativo e importação definitiva dos dados reais da planilha.

### Constitutional Alignment *(mandatory)*

- **Financial Rules**: Todos os valores monetários desta feature devem usar representação decimal exata, regras explícitas de arredondamento por contexto e rastreabilidade integral do cálculo mensal, de parcelamentos e de movimentos de investimento até seus lançamentos de origem.
- **Privacy & Security**: A especificação não reutiliza dados reais da planilha; descrições, exemplos e critérios de aceitação usam conteúdo genérico. Entradas devem ser validadas tanto no cliente quanto no servidor, e artefatos com dados reais devem permanecer fora do controle de versão.
- **Architecture Boundaries**: A lógica de cálculo de salário, recorrência, parcelamento, saldos e consolidação deve permanecer em módulos de domínio dedicados; interfaces de entrada, telas e rotas só podem orquestrar e apresentar resultados.
- **Database Impact**: A feature exigirá persistência versionada para configurações, categorias, lançamentos, parcelamentos, movimentos de investimento, trilhas de auditoria e consolidações derivadas. Alterações relevantes devem preservar histórico e usar transações quando afetarem múltiplos registros financeiros relacionados.
- **Test Strategy**: A implementação futura deverá incluir testes unitários para regras de salário, recorrência, parcelamento, aportes, consolidação e estados; testes de integração para fluxo mensal crítico; e testes de regressão para qualquer correção de divergência financeira.

### Key Entities *(include if feature involves data)*

- **Configuração Financeira**: Conjunto de parâmetros que inicia o controle financeiro e define salário, parcelas salariais, aporte padrão, rendimento projetado e saldos iniciais.
- **Categoria**: Classificador reutilizável para despesas e outros lançamentos, com estado ativo ou inativo e preservação de histórico.
- **Receita**: Lançamento de entrada com origem salarial automática ou extra, data, valor, tipo/categoria e status planejado ou realizado.
- **Despesa Fixa**: Regra recorrente que gera previsões mensais com vencimento, valor padrão, período de vigência e estado ativo ou inativo.
- **Despesa Variável**: Lançamento individual de saída com data, descrição genérica, categoria, valor e status.
- **Parcelamento**: Compra parcelada registrada uma vez, com valor total, quantidade de parcelas, cronograma, forma de pagamento, status e saldo restante.
- **Parcela Mensal**: Ocorrência mensal derivada de um parcelamento, com mês de cobrança, número da parcela, valor e estado.
- **Movimento de Investimento**: Registro financeiro classificado como aporte, rendimento, resgate ou ajuste manual, com impacto definido em saldo operacional e saldo investido.
- **Consolidação Mensal**: Visão agregada por mês contendo totais previstos, realizados, saldos, diferenças e estados relevantes.
- **Trilha de Auditoria**: Registro de alterações e origem dos cálculos usados para explicar totais consolidados e mudanças em lançamentos sensíveis.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário consegue concluir a configuração financeira inicial e cadastrar pelo menos três categorias em até 10 minutos, sem depender da planilha.
- **SC-002**: Em 100% dos meses posteriores à data de início configurada, o sistema exibe separadamente receitas previstas, receitas realizadas, despesas, aportes e saldos sem gerar movimentações automáticas anteriores à data inicial.
- **SC-003**: Em 100% dos parcelamentos válidos cadastrados, o sistema apresenta corretamente a quantidade total de parcelas, a parcela atual, a última parcela e o saldo restante conforme o cronograma informado.
- **SC-004**: Em 100% dos totais mensais exibidos ao usuário, o detalhamento de rastreabilidade permite identificar os lançamentos que compõem o valor agregado.
- **SC-005**: O dashboard inicial permite que o usuário identifique patrimônio em investimentos, aporte do mês, receitas, despesas e saldo operacional em até 2 minutos de navegação.
- **SC-006**: Em pelo menos 95% dos testes de aceitação executados com dados genéricos, os estados previstos do domínio financeiro são apresentados de forma compreensível e consistente ao usuário.

## Assumptions

- A primeira versão atende um único usuário pessoal, sem autenticação e sem compartilhamento de dados com terceiros.
- O sistema trabalha com uma única moeda base por controle financeiro.
- O controle mensal segue meses de calendário e calcula a segunda parcela salarial no último dia de cada mês.
- Receitas e despesas podem existir como planejadas antes de serem realizadas, e a mudança de status não cria um novo lançamento independente quando se tratar do mesmo evento financeiro.
- Alterações retroativas em configurações, parcelamentos ou lançamentos sensíveis exigem confirmação explícita e preservação de histórico, mas a interface exata dessa confirmação será definida no planejamento.
- A detecção de duplicidade atua como alerta preventivo e não como bloqueio absoluto quando o usuário confirmar que os lançamentos são distintos.
- A consolidação anual existente na planilha serve apenas como referência de negócio; esta especificação cobre consolidação mensal e dashboard inicial.
- Funcionalidades explicitamente fora de escopo permanecem excluídas mesmo que existam referências correlatas na planilha atual.
