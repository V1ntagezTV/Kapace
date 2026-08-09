# Person Frontend Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Полностью мигрировать frontend Actor → Person под breaking API.

**Architecture:** Новые Person API/DTO/enum, переименование views/composables/components/routes, адаптация EditView под Gender/BirthDate/Roles.

**Tech Stack:** Vue 3, TypeScript, Vue Router, существующие Base* UI-компоненты.

## Global Constraints

- Полное переименование без адаптеров Actor.
- Старые `/actor` URL не поддерживать.
- CharacterName только для Role=Actor.
- Gender/BirthDate/Roles не показывать на Theater/Person view.

---

### Task 1: API contracts

- Create PersonService, Gender/Role enums, V1CreatePersonRequest/Response
- Update Content DTOs, HistoryType, ContentSelectedInfo, ReportApi, ChangesHistoryService, App.vue provide

### Task 2: Views and routes

- Rename Actor* → Person* files/components/composables
- Update router, navigation, Settings, EditList, TheaterPersons

### Task 3: EditView fields

- PersonEditor: Gender, BirthDate
- Content person picker: multi Roles + CharacterName for Actor

### Task 4: Verify

- npm run build / lint / typecheck
