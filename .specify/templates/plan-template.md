# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., TypeScript (strict), Node.js LTS or NEEDS CLARIFICATION]

**Primary Dependencies**: [e.g., Next.js, NestJS, PostgreSQL, Docker or NEEDS CLARIFICATION]

**Storage**: [e.g., PostgreSQL or N/A]

**Testing**: [e.g., Vitest/Jest, Nest integration tests, Playwright or NEEDS CLARIFICATION]

**Target Platform**: [e.g., modern web browsers + containerized Node.js services or NEEDS CLARIFICATION]

**Project Type**: [e.g., monorepo web application or NEEDS CLARIFICATION]

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] Financial values use exact monetary representation; binary floating point is excluded from balances, projections, and simulations.
- [ ] Rounding rules, financial invariants, and projection traceability are defined and testable.
- [ ] Business rules are isolated in domain/services modules, not in controllers, routes, or UI components.
- [ ] Frontend and backend validation, sensitive data handling, and version-control exclusions are specified.
- [ ] Database changes use versioned migrations and define transaction boundaries where consistency matters.
- [ ] Unit, integration, and regression test obligations are identified for every affected financial behavior.
- [ ] Any added dependency, abstraction, or infrastructure is justified in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
apps/
├── web/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   └── lib/
│   └── tests/
├── api/
│   ├── src/
│   │   ├── modules/
│   │   ├── domain/
│   │   ├── application/
│   │   └── infra/
│   └── tests/
packages/
├── financial-domain/
├── shared-types/
└── shared-config/
infra/
└── docker/
specs/
└── [###-feature]/
```

**Structure Decision**: [Confirm the real directories used by this feature and identify any new package/module boundaries needed for the financial domain]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
