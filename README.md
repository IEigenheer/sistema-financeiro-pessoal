# Sistema Financeiro Pessoal

Aplicação web pessoal baseada na planilha `private-file/Controle_Financeiro_Corrigido(1).xlsx`.

## Stack

- `Next.js` no frontend
- `NestJS` no backend
- `PostgreSQL` no banco
- `Docker Compose` para subir tudo

## Funcionalidades espelhadas da planilha

- Configuração anual, mês atual, salários, aporte e saldos iniciais
- Categorias fixas e variáveis
- Despesas fixas recorrentes com status mensal `Pago` ou `Pendente`
- Lançamentos variáveis por mês
- Parcelamentos com ativação automática por competência
- Consolidado de conta corrente, investimento e patrimônio
- Dashboard por categoria seguindo a lógica da planilha
- Simulador de patrimônio comparando aporte X vs Y e compra à vista ou parcelada

## Como subir

```bash
docker compose up --build
```

URLs:

- `http://localhost:3000` para o frontend
- `http://localhost:3001` para a API

Na primeira execução, o backend importa a planilha automaticamente se o banco estiver vazio.
