---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED for any work touching financial calculations,
projections, recurrence, simulation, critical integrations, or financial bug
fixes. For non-financial plumbing, include tests whenever the specification
demands them.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions
- Include related requirement or acceptance-criteria references in the description when known (e.g., `FR-003`, `AC1`)

## Path Conventions

- **Monorepo web app**: `apps/web/src/`, `apps/api/src/`, `packages/`, `infra/docker/`
- Paths shown below assume the monorepo structure required by the constitution; adjust concrete paths to match plan.md

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit-tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create monorepo structure per implementation plan in apps/, packages/, and infra/docker/
- [ ] T002 Initialize TypeScript strict workspaces for Next.js and NestJS applications
- [ ] T003 [P] Configure Docker-based local infrastructure in infra/docker/
- [ ] T004 [P] Configure linting, formatting, and secret-safe .gitignore rules

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T005 Setup PostgreSQL schema and versioned migration framework in apps/api/src/infra/db/
- [ ] T006 [P] Implement exact money and rounding primitives in packages/financial-domain/src/
- [ ] T007 [P] Setup frontend/backend validation and secure configuration boundaries in apps/web/src/ and apps/api/src/
- [ ] T008 Create projection/simulation audit trace model in packages/financial-domain/src/
- [ ] T009 Configure transaction handling and repository boundaries in apps/api/src/
- [ ] T010 Setup unit, integration, and regression test harnesses across apps/ and packages/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (REQUIRED for financial/domain behavior) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T011 [P] [US1] Add unit tests for financial rules in packages/financial-domain/tests/[name].test.ts
- [ ] T012 [P] [US1] Add integration test for [user journey] in apps/api/tests/integration/[name].spec.ts

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create [Entity1] model in packages/financial-domain/src/[entity1].ts
- [ ] T014 [P] [US1] Create [Entity2] model in apps/api/src/modules/[feature]/domain/[entity2].ts
- [ ] T015 [US1] Implement [UseCase] in apps/api/src/modules/[feature]/application/[use-case].ts (depends on T013, T014)
- [ ] T016 [US1] Implement [endpoint/feature] in apps/api/src/modules/[feature]/interfaces/http/[file].controller.ts
- [ ] T017 [US1] Implement UI flow in apps/web/src/features/[feature]/[file].tsx
- [ ] T018 [US1] Add frontend/backend validation, scenario labeling, and error handling
- [ ] T019 [US1] Add audit trace persistence or logging for user story 1 operations

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (REQUIRED when financial behavior changes) ⚠️

- [ ] T020 [P] [US2] Add unit or regression tests for [behavior] in packages/financial-domain/tests/[name].test.ts
- [ ] T021 [P] [US2] Add integration test for [user journey] in apps/api/tests/integration/[name].spec.ts

### Implementation for User Story 2

- [ ] T022 [P] [US2] Create [Entity] model in packages/financial-domain/src/[entity].ts
- [ ] T023 [US2] Implement [Service] in apps/api/src/modules/[feature]/application/[service].ts
- [ ] T024 [US2] Implement [endpoint/feature] in apps/api/src/modules/[feature]/interfaces/http/[file].controller.ts
- [ ] T025 [US2] Integrate with User Story 1 components in apps/web/src/features/[feature]/ and apps/api/src/modules/[feature]/

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (REQUIRED when financial behavior changes) ⚠️

- [ ] T026 [P] [US3] Add unit or regression tests for [behavior] in packages/financial-domain/tests/[name].test.ts
- [ ] T027 [P] [US3] Add integration test for [user journey] in apps/api/tests/integration/[name].spec.ts

### Implementation for User Story 3

- [ ] T028 [P] [US3] Create [Entity] model in packages/financial-domain/src/[entity].ts
- [ ] T029 [US3] Implement [Service] in apps/api/src/modules/[feature]/application/[service].ts
- [ ] T030 [US3] Implement [endpoint/feature] in apps/api/src/modules/[feature]/interfaces/http/[file].controller.ts

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/ and specs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional regression or unit tests in packages/financial-domain/tests/
- [ ] TXXX Security hardening and sensitive-data review
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Required tests MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority
- A task is not done while relevant tests fail

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Add unit tests for financial rules in packages/financial-domain/tests/[name].test.ts"
Task: "Add integration test for [user journey] in apps/api/tests/integration/[name].spec.ts"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in packages/financial-domain/src/[entity1].ts"
Task: "Create [Entity2] model in apps/api/src/modules/[feature]/domain/[entity2].ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify required tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Include requirement or acceptance-criteria IDs in task descriptions whenever available
