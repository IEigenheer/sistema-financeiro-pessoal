<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Template placeholder set -> I. Correção Financeira e Auditabilidade
- Template placeholder set -> II. Privacidade e Segurança
- Template placeholder set -> III. Arquitetura Modular
- Template placeholder set -> IV. Banco de Dados Confiável
- Template placeholder set -> V. Testes Obrigatórios
- Template placeholder set -> VI. Clareza da Experiência do Usuário
- Template placeholder set -> VII. Desenvolvimento Orientado por Especificação
- Template placeholder set -> VIII. Simplicidade Intencional
- Template placeholder set -> IX. Qualidade de Código em TypeScript
- Template placeholder set -> X. Governança e Exceções Explícitas
Added sections:
- Requisitos Técnicos e Arquiteturais
- Fluxo de Entrega e Qualidade
Removed sections:
- None
Templates requiring updates:
- ✅ updated .specify/templates/plan-template.md
- ✅ updated .specify/templates/spec-template.md
- ✅ updated .specify/templates/tasks-template.md
Follow-up TODOs:
- None
-->
# Constituição do Sistema Financeiro Pessoal

## Princípios Fundamentais

### I. Correção Financeira e Auditabilidade
Todos os cálculos financeiros MUST ser determinísticos, reproduzíveis e cobertos
por testes automatizados. Valores monetários MUST utilizar representação exata,
baseada em inteiros escalados ou decimais de precisão fixa; ponto flutuante
binário é proibido para saldos, lançamentos, projeções, taxas derivadas e
consolidações. Regras de arredondamento MUST ser explícitas por contexto de
negócio e aplicadas de forma consistente em frontend, backend e persistência.
Cada projeção ou simulação MUST permitir rastrear entradas, premissas, versão
da regra e etapas intermediárias que levaram ao resultado. Justificativa: sem
auditabilidade, a migração da planilha perde confiabilidade operacional.

### II. Privacidade e Segurança
Dados financeiros, pessoais e credenciais MUST ser tratados como confidenciais.
Segredos, tokens, senhas, arquivos reais de planilhas, dumps de banco local e
quaisquer dados identificáveis MUST permanecer fora do controle de versão e
protegidos por `.gitignore`, exemplos sanitizados e configurações seguras.
Entradas de usuário MUST ser validadas no frontend e novamente no backend, com
mensagens de erro seguras e sem vazamento de dados sensíveis. Justificativa: um
sistema financeiro pessoal só é aceitável se preservar confidencialidade e
integridade.

### III. Arquitetura Modular
O repositório MUST permanecer um monorepo com frontend Next.js, backend NestJS
e PostgreSQL como armazenamento principal. A infraestrutura local MUST executar
via Docker. Regras de negócio financeiras MUST residir em módulos de domínio ou
serviços dedicados; controllers, rotas, componentes visuais e handlers de
interface NÃO PODEM concentrar lógica de cálculo ou decisão. Responsabilidades
entre domínios financeiros MUST ser explícitas e coesas para permitir evolução
segura. Justificativa: separação clara reduz regressões e facilita testes e
auditoria.

### IV. Banco de Dados Confiável
Toda mudança de esquema ou dado persistido MUST ocorrer por migrations
versionadas, revisáveis e reproduzíveis. Operações financeiras relacionadas
MUST usar transações quando houver risco de inconsistência parcial. Exclusões ou
alterações relevantes MUST evitar perda silenciosa de dados por meio de soft
delete, histórico, trilha de auditoria ou estratégia equivalente documentada.
Justificativa: o banco é parte do livro-razão operacional do sistema e exige
histórico confiável.

### V. Testes Obrigatórios
Toda regra de cálculo, projeção, recorrência ou simulação MUST possuir testes
unitários cobrindo casos nominais, bordas, arredondamento e invariantes
financeiros. Fluxos críticos MUST possuir testes de integração entre frontend,
backend, persistência e/ou contratos, conforme o escopo. Toda correção de bug
financeiro MUST incluir teste de regressão reproduzindo o defeito corrigido.
Nenhuma funcionalidade é considerada concluída com testes falhando.
Justificativa: a precisão esperada do domínio financeiro depende de prevenção
ativa contra regressões.

### VI. Clareza da Experiência do Usuário
A interface MUST diferenciar com clareza valores atuais, previstos e simulados,
inclusive em estados vazios, tabelas e gráficos. Cenário base e cenário
simulado MUST ser visualmente distinguíveis por legenda, contexto textual e
sinalização consistente. Gráficos MUST exibir legenda, tooltip, unidades,
período e descrição compreensíveis. O produto MUST priorizar clareza e decisão
informada sobre densidade de informação. Justificativa: números corretos ainda
falham se forem apresentados de forma ambígua.

### VII. Desenvolvimento Orientado por Especificação
Nenhuma funcionalidade, ajuste de escopo ou refatoração com impacto
comportamental MUST ser implementada antes de existir especificação
correspondente aprovada. Mudanças de requisito MUST atualizar primeiro a
especificação e só depois o plano, as tarefas e o código. Cada tarefa
implementada MUST ser rastreável a pelo menos um requisito, cenário de aceitação
ou critério de sucesso. A implementação MUST respeitar estritamente o escopo
aprovado; trabalho fora de escopo exige emenda explícita. Justificativa:
disciplina de especificação reduz retrabalho e desvio de escopo.

### VIII. Simplicidade Intencional
Abstrações, bibliotecas, serviços auxiliares e infraestrutura adicional MUST
ser introduzidos apenas com necessidade comprovada pelo problema atual. A
primeira versão MUST otimizar confiabilidade pessoal, manutenção simples e
evolução incremental, não completude teórica. Requisitos futuros hipotéticos
NÃO DEVEM aumentar a complexidade da versão corrente sem benefício direto e
demonstrável. Justificativa: simplicidade preserva velocidade de entrega e
reduz superfície de falha.

### IX. Qualidade de Código em TypeScript
Todo código TypeScript MUST operar com `strict` habilitado. O uso de `any` é
proibido, salvo exceção documentada com justificativa, escopo mínimo e plano de
remoção. Nomes de tipos, funções, módulos, documentação e commits MUST refletir
com precisão o domínio financeiro adotado e permanecer consistentes entre
frontend, backend e banco. Justificativa: linguagem e tipagem claras reduzem
ambiguidades em um domínio sensível.

### X. Governança e Exceções Explícitas
Esta constituição tem precedência sobre especificações, planos, tarefas e
implementações. Qualquer exceção MUST ser registrada com contexto,
justificativa, impacto, prazo de revisão e aprovação explícita no artefato que
introduziu a exceção. Toda alteração constitucional MUST atualizar versão,
histórico e artefatos dependentes no mesmo fluxo de mudança. Justificativa:
governança explícita impede desvios silenciosos em decisões de alto impacto.

## Requisitos Técnicos e Arquiteturais

- O layout padrão do monorepo MUST separar aplicações executáveis de
  bibliotecas de domínio compartilhadas.
- O frontend MUST tratar validação, formatação e diferenciação visual de
  cenários sem duplicar a fonte de verdade das regras financeiras.
- O backend MUST concentrar orquestração, validação de domínio, casos de uso e
  integração transacional com PostgreSQL.
- Migrations, seeds de desenvolvimento e composição local de serviços MUST ser
  executáveis via Docker.
- Arquivos locais contendo dados financeiros reais MUST permanecer fora do
  repositório; somente exemplos anonimizados ou sintéticos podem ser
  versionados.
- Logs, eventos e respostas de erro NÃO PODEM expor segredos, dados pessoais
  completos ou payloads financeiros sensíveis.

## Fluxo de Entrega e Qualidade

- Toda especificação MUST declarar escopo, cenários independentes, critérios de
  aceitação, impacto em privacidade/segurança, impacto em banco e estratégia de
  testes.
- Todo plano MUST incluir uma Constitution Check explícita cobrindo
  representação monetária, regras de arredondamento, rastreabilidade de
  projeções, modularidade, validação de entrada, migrations, transações e
  simplicidade.
- Toda lista de tarefas MUST manter rastreabilidade para requisitos ou critérios
  de aceitação e incluir tarefas de teste quando o trabalho tocar cálculo,
  projeção, recorrência, simulação, integração crítica ou correção de bug
  financeiro.
- Antes de concluir uma entrega, a equipe MUST revisar aderência à constituição,
  garantir testes relevantes passando e registrar quaisquer exceções aprovadas.
- Bugs financeiros, divergências entre cenário base e simulado e mudanças de
  schema MUST ser tratados como mudanças de alto risco e revisados com atenção
  reforçada.

## Governance

- Esta constituição substitui convenções conflitantes em qualquer artefato do
  projeto. Em caso de conflito, prevalece a regra mais restritiva desta
  constituição até que uma emenda formal seja aprovada.
- Emendas MUST documentar motivação, impacto, artefatos sincronizados e tipo de
  incremento de versão. Versionamento semântico: MAJOR para remoção ou
  redefinição incompatível de princípios; MINOR para novos princípios, seções
  ou obrigações materiais; PATCH para esclarecimentos sem mudança normativa.
- A data de ratificação MUST permanecer como a data da primeira adoção; a data
  de última alteração MUST ser atualizada a cada emenda com mudança efetiva.
- Revisões de conformidade MUST ocorrer na criação de especificações, no
  preenchimento de planos, na geração de tarefas e antes de considerar uma
  funcionalidade concluída.
- Exceções aprovadas MUST ser temporárias, rastreáveis e revisadas na entrega
  subsequente aplicável; exceções vencidas retornam automaticamente ao estado
  de não conformidade.
- O histórico de alterações MUST ser preservado por meio do Sync Impact Report
  anexado a cada atualização desta constituição.

**Version**: 1.0.0 | **Ratified**: 2026-07-23 | **Last Amended**: 2026-07-23
