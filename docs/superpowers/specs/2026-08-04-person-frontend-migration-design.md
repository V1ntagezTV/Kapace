# Design: Frontend migration Actor → Person

## Goal

Полностью заменить frontend-сущность `Actor` на `Person` в соответствии с breaking API бэкенда. Старые URL `/actor/*` не поддерживаются.

## Confirmed decisions

- Полное переименование кода, файлов, DI, роутов и UI-текстов.
- Маршруты: `/person/:id`, `/person/:id/history`, `/edit/person`, `/edit/person/:person`.
- В EditView у персоны: необязательные `Gender`, `BirthDate` (запрет будущей даты).
- В EditView у контента: `Persons` с ролями `Actor | Director | Writer | Producer`; `CharacterName` только для `Actor`.
- TheaterView / PersonView: не показывать роли, гендер и дату рождения; CharacterName из роли Actor можно показывать как раньше.

## API contracts

| Было | Стало |
|------|-------|
| `v1/actor/*` | `v1/person/*` |
| `create-actor` | `create-person` |
| `ActorId` / `Actors` | `PersonId` / `Persons` |
| `ContentActors = 32` | `ContentPersons = 32` |
| `HistoryType.Actor` | `HistoryType.Person` |
| `ReportTargetType 'Actor'` | `'Person'` |

### Person fields

- `Gender`: `Unspecified | Male | Female`
- `BirthDate`: `string | null` (`YYYY-MM-DD`), не в будущем

### Content persons payload

```json
{
  "Persons": [
    {
      "PersonId": 1,
      "Roles": [
        { "Role": "Actor", "CharacterName": "Hero" },
        { "Role": "Director", "CharacterName": null }
      ]
    }
  ]
}
```

## UI copy

Все пользовательские «актёр/актёры» → «персона/персоны».

## Out of scope

- Отображение Gender / BirthDate / Roles на TheaterView и PersonView.
- Редиректы со старых `/actor` URL.
- Автотесты (в проекте отсутствуют).

## Success criteria

Typecheck/lint/build проходят; ручные сценарии: страница персоны, новые URL, форма персоны, контент с несколькими ролями, история и репорт.
