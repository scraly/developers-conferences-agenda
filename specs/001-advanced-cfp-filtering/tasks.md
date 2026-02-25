# Tasks: Advanced CFP Filtering

**Input**: Design documents from `/specs/001-advanced-cfp-filtering/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, tests/features/

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US4)
- Traceability: comma-separated TS-XXX references

---

## Phase 1: Setup

**Purpose**: Install test tooling and create project scaffolding

- [x] T001 Install @playwright/test as devDependency and add test:e2e script to page/package.json
- [x] T002 Create Playwright configuration at page/playwright.config.js (Chromium, localhost:8080)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure shared across all user stories

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Define TAG_FILTER_CONFIG constant (allowed: topic, tech, language, type; blocked: location) in page/src/app.hooks.js [TS-031, TS-032]
- [x] T004 Implement per-dimension URL param parsing (read {dim}, {dim}_not, {dim}_mode from URLSearchParams) in page/src/app.hooks.js [TS-036]
- [x] T042 Unit tests for legacy tags param migration (parse tags=key:value, distribute to per-dimension params) in page/src/app.hooks.applyCommonFilters.test.js [TS-035]
- [x] T005 Implement legacy tags param migration (parse tags=key:value, distribute to per-dimension params) in page/src/app.hooks.js [TS-035]

**Checkpoint**: URL param infrastructure ready — user story implementation can begin. Note: T005+T042 are non-blocking for Phase 3 and can run in parallel with US-1 work.

---

## Phase 3: User Story 1 — Unified Multi-Select Filters (Priority: P1) MVP

**Goal**: Replace the mixed filtering system with unified multi-select controls for all dimensions
**Independent Test**: Select multiple values in any filter and verify matching events appear

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T006 [US1] Unit tests for multi-value tag filtering (topic, tech, language, type with OR logic) in page/src/app.hooks.applyCommonFilters.test.js [TS-001, TS-002, TS-003, TS-037]
- [x] T007 [US1] Unit tests for multi-value country and region filtering in page/src/app.hooks.applyCommonFilters.test.js [TS-004, TS-005]
- [x] T008 [US1] Unit tests for cross-filter AND logic and empty-filter defaults in page/src/app.hooks.applyCommonFilters.test.js [TS-008, TS-009]
- [x] T009 [US1] Unit tests for region-to-country cascading, deselect behavior, and trim in page/src/app.hooks.applyCommonFilters.test.js [TS-006, TS-007, TS-010, TS-033]

### Implementation for User Story 1

- [x] T010 [P] [US1] Create FilterMultiSelect component (basic multi-select, include-only, react-select isMulti) in page/src/components/FilterMultiSelect/FilterMultiSelect.jsx
- [x] T011 [P] [US1] Create FilterMultiSelect styling in page/src/styles/FilterMultiSelect.css
- [x] T012 [US1] Extend applyCommonFilters for per-dimension multi-value OR filtering (tag dimensions + country + region) in page/src/app.hooks.js
- [x] T013 [US1] Implement useAvailableCountries hook for region-to-country cascading in page/src/app.hooks.js
- [ ] T014 [US1] Replace TagMultiSelect usage with FilterMultiSelect instances per allowed tag dimension in page/src/components/Filters/Filters.jsx
- [ ] T015 [US1] Replace single-select Country and Region dropdowns with FilterMultiSelect in page/src/components/Filters/Filters.jsx
- [ ] T038 [US1] Update Filters.css for new multi-select layout and Clear All button in page/src/styles/Filters.css
- [ ] T016 [US1] Wire per-dimension URL params (read/write include values for all dimensions) in page/src/components/Filters/Filters.jsx
- [ ] T017 [US1] Implement Clear All Filters button that resets all dimensions to empty in page/src/components/Filters/Filters.jsx [TS-038]
- [ ] T018 [US1] E2E tests for multi-select interactions, region cascading, URL persistence, and Clear All in page/e2e/cfp-filters.spec.js [TS-001, TS-004, TS-005, TS-010, TS-011, TS-038]

**Checkpoint**: Core multi-select filtering functional — all P1 scenarios pass

---

## Phase 4: User Story 2 — Negative Tag Filtering (Priority: P2)

**Goal**: Allow users to exclude values in any filter dimension
**Independent Test**: Negate a value and verify matching events are excluded

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T019 [US2] Unit tests for exclusion logic (single exclusion, multi-exclusion, include+exclude combo, same-value conflict) in page/src/app.hooks.applyCommonFilters.test.js [TS-012, TS-013, TS-014, TS-015, TS-016, TS-029]

### Implementation for User Story 2

- [ ] T020 [US2] Add exclusion support to FilterMultiSelect (custom Option component with exclude toggle, green chips for included, red for excluded) in page/src/components/FilterMultiSelect/FilterMultiSelect.jsx
- [ ] T021 [US2] Extend applyCommonFilters for per-dimension exclusion logic (excluded values remove matching events regardless of other selections) in page/src/app.hooks.js
- [ ] T022 [US2] Wire _not URL params (read/write exclusion values) in page/src/components/Filters/Filters.jsx
- [ ] T023 [US2] Update SelectedTags for include/exclude display in page/src/components/SelectedTags/SelectedTags.jsx
- [ ] T024 [US2] E2E tests for exclude toggle, remove exclusion, cross-filter exclusion in page/e2e/cfp-filters.spec.js [TS-012, TS-015, TS-016]

**Checkpoint**: Exclusion filtering functional — all P2 negation scenarios pass

---

## Phase 5: User Story 3 — Not Online Toggle (Priority: P2)

**Goal**: Toggle to hide online-only events while keeping hybrid events visible
**Independent Test**: Enable Not Online and verify online-only events disappear

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T025 [US3] Unit tests for notOnline logic (hide pure-online, keep hybrid, restore on disable) in page/src/app.hooks.applyCommonFilters.test.js [TS-017, TS-018, TS-019]

### Implementation for User Story 3

- [ ] T026 [US3] Add Not Online toggle checkbox to page/src/components/Filters/Filters.jsx
- [ ] T027 [US3] Implement online/notOnline mutual exclusion (enabling one disables the other) in page/src/components/Filters/Filters.jsx [TS-020]
- [ ] T028 [US3] Extend applyCommonFilters for notOnline logic (exclude events where location is exclusively "Online") in page/src/app.hooks.js
- [ ] T029 [US3] E2E tests for Not Online toggle and mutual exclusion with Online in page/e2e/cfp-filters.spec.js [TS-017, TS-019, TS-020]

**Checkpoint**: Not Online toggle functional — all P2 toggle scenarios pass

---

## Phase 6: User Story 4 — Any/All Toggle (Priority: P3)

**Goal**: Per-dimension toggle between OR (any) and AND (all) logic
**Independent Test**: Switch mode and verify filter logic changes accordingly

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T030 [US4] Unit tests for any/all mode (OR vs AND logic, single-value equivalence, mutually exclusive values yield empty) in page/src/app.hooks.applyCommonFilters.test.js [TS-021, TS-022, TS-023, TS-025, TS-030, TS-036]

### Implementation for User Story 4

- [ ] T031 [US4] Add any/all toggle button to FilterMultiSelect header in page/src/components/FilterMultiSelect/FilterMultiSelect.jsx
- [ ] T032 [US4] Extend applyCommonFilters for mode-aware filtering (some() for any, every() for all) in page/src/app.hooks.js
- [ ] T033 [US4] Wire _mode URL params (read/write mode per dimension) in page/src/components/Filters/Filters.jsx
- [ ] T034 [US4] E2E tests for any/all toggle per dimension and independent mode per filter in page/e2e/cfp-filters.spec.js [TS-021, TS-024, TS-025]

**Checkpoint**: Any/All toggle functional — all P3 scenarios pass

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, regression, cleanup

- [ ] T035 [P] E2E test for existing filter regression (text search, checkbox toggles) in page/e2e/cfp-filters.spec.js [TS-034]
- [ ] T036 [P] E2E test for no-results message when all events filtered out in page/e2e/cfp-filters.spec.js [TS-026]
- [ ] T037 [P] E2E test for empty/disabled filter category state in page/e2e/cfp-filters.spec.js [TS-027]
- [ ] T039 Remove TagMultiSelect completely (delete all imports/references from other files, delete TagMultiSelect.jsx and its directory, delete associated CSS) in page/src/components/TagMultiSelect/
- [ ] T040 Run quickstart.md manual validation scenarios
- [ ] T041 [P] Add performance assertion to applyCommonFilters unit tests: filtering 500 events completes within 100ms in page/src/app.hooks.applyCommonFilters.test.js [SC-008]

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: No dependencies — can parallel with Phase 1. Internal ordering: T003→T004 sequential (blocking for Phase 3); T005 non-blocking (can run in parallel with Phase 3)
- **US-1 (Phase 3)**: Depends on T003 + T004 completion (TAG_FILTER_CONFIG + URL parsing). T005 NOT required — legacy migration is independent of core filter logic
- **US-2 (Phase 4)**: Depends on Phase 3 completion (FilterMultiSelect + filter infrastructure)
- **US-3 (Phase 5)**: Depends on Phase 3 completion (Filters.jsx restructure complete) — can parallel with Phase 4 or Phase 6
- **US-4 (Phase 6)**: Depends on Phase 4 completion (US-2 and US-4 modify same files: FilterMultiSelect.jsx, app.hooks.js, Filters.jsx)
- **Polish (Phase 7)**: Depends on Phases 4, 5, 6 completion

### Task Dependencies (within phases)

**Phase 3**:
- T006, T007, T008, T009 → sequential (same file, order-independent but cannot be written simultaneously)
- T010, T011 → parallel (component + CSS, different files)
- T012 → depends on T006-T009 (TDD: implement after tests written)
- T013 → depends on T012 (cascading extends filter logic)
- T014 → depends on T010, T012 (needs FilterMultiSelect + filter logic)
- T015 → depends on T010, T013 (needs FilterMultiSelect + cascading)
- T038 → depends on T014, T015 (CSS must match new components)
- T016 → depends on T038 (layout correct before wiring params)
- T017 → depends on T016 (needs filter state to clear)
- T018 → depends on T001, T002, T017 (E2E needs Playwright + full feature)

**Phases 4, 5, 6**: US-2 then US-4 sequentially (both modify FilterMultiSelect.jsx, app.hooks.js, Filters.jsx). US-3 can parallel with either US-2 or US-4 (only adds a new toggle, no shared file conflicts)

### Parallel Opportunities

| Batch | Tasks | Constraint |
|-------|-------|-----------|
| Setup + Foundation | T001, T003 | Different files |
| US-1 Unit Tests | T006, T007, T008, T009 | Same file — sequential, order-independent |
| US-1 Component | T010, T011 | .jsx and .css in different files |
| Post-US-1 Stories | Phase 5 ∥ Phase 4, then Phase 6 | US-3 independent; US-2→US-4 sequential (shared files) |
| Polish E2E Tests | T035, T036, T037 [P] | Different test describe blocks, same file but independent |

### Critical Path

T003 → T004 → T006-T009 → T012 → T013 → T015 → T038 → T016 → T017 → T018

**Depth**: 10 tasks on critical path (T005 excluded — runs in parallel with Phase 3)

---

## MVP Scope

**Minimum viable delivery**: Phases 1-3 (Setup + Foundation + US-1)
- Delivers: Unified multi-select filters for all dimensions with OR logic, region-to-country cascading, URL persistence, Clear All
- Task count: 18 of 42
- Scenarios covered: TS-001, TS-002, TS-003, TS-004, TS-005, TS-006, TS-007, TS-008, TS-009, TS-010, TS-011, TS-031, TS-032, TS-033, TS-035, TS-036, TS-037, TS-038

---

## Clarifications

### Session 2026-02-25

- Q: Can Phases 4, 5, 6 truly run in parallel given shared file modifications? -> A: US-2 then US-4 sequentially (both modify FilterMultiSelect.jsx, app.hooks.js, Filters.jsx). US-3 can parallel with either since it only adds a new toggle. [T020, T021, T022, T031, T032, T033]
- Q: Should T038 (Filters.css updates) remain in Phase 7 or move earlier? -> A: Move T038 into Phase 3 after T015, before T016. CSS layout changes are structurally tied to the component replacements in T014/T015. [T038, T014, T015, T016]
- Q: Should T006-T009 keep [P] markers despite targeting the same test file? -> A: Remove [P] markers. Tasks are order-independent but same-file, so they execute sequentially. Splitting into separate files would violate codebase conventions. [T006, T007, T008, T009]
- Q: Is T005 (legacy migration) blocking for Phase 3 start, and what is Phase 2's internal ordering? -> A: T003→T004 sequential and blocking for Phase 3. T005 is non-blocking — runs in parallel with Phase 3. Critical path excludes T005. [T003, T004, T005]
- Q: T005 has no preceding test task — TDD violation? -> A: Add T042 (unit tests for legacy param parsing) before T005 to restore TDD compliance. [T005, T042]
- Q: Should T035-T037 (Phase 7 E2E tests) have [P] markers? -> A: Yes, add [P] — describe blocks are sufficiently independent despite same file. Differs from T006-T009 precedent by user decision. [T035, T036, T037]
- Q: What does "deprecate TagMultiSelect" mean in T039 — remove references, delete file, or both? -> A: Full cleanup: remove all imports/references, delete TagMultiSelect.jsx and directory, delete associated CSS. [T039]

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- TDD enforced per constitution: write tests first (T006-T009, T019, T025, T030), verify they fail, then implement
- E2E tests (T018, T024, T029, T034) written after UI implementation within each phase
- Each user story checkpoint is independently testable
- Implementation auto-commits after each task
