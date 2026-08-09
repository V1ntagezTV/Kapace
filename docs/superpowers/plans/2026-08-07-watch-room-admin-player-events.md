# Watch Room Admin Player Events Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Синхронизировать нативные Play/Pause/Seek owner/mod через SignalR и показать под видео текущий режим LIVE/OFFLINE.

**Architecture:** YouTube-адаптер публикует состояния IFrame API. Composable сравнивает локальное состояние с последним `PlaybackSnapshot`: действия owner/mod отправляет в Hub, действия viewer переводят его в локальный режим; seek определяется по отклонению времени.

**Tech Stack:** Vue 3 Composition API, TypeScript, YouTube IFrame API, SignalR, SCSS.

## Global Constraints

- У YouTube IFrame API нет отдельного seek event; seek определяется по времени.
- Пользователь в local-режиме не применяет события owner/mod.
- Программное применение snapshot не должно вызывать повторный Hub-вызов.
- Новый тестовый раннер не добавляется.

---

### Task 1: События адаптера YouTube

**Files:**
- Modify: `src/features/watch-room/player/SyncPlayer.ts`
- Modify: `src/features/watch-room/player/YouTubePlayerAdapter.ts`

**Interfaces:**
- Produces: `SyncPlayerPlaybackState`
- Produces: `onPlaybackStateChanged(listener): () => void`

- [ ] Добавить состояния `playing`, `paused`, `buffering`, `ended`, `cued`.
- [ ] Преобразовывать числовые состояния IFrame API в типизированные события.
- [ ] Очищать listeners при `destroy`.

### Task 2: Ролевая синхронизация нативных действий

**Files:**
- Modify: `src/features/watch-room/useWatchRoom.ts`

**Interfaces:**
- Consumes: `SyncPlayer.onPlaybackStateChanged`
- Uses: существующие Hub `Play`, `Pause`, `Seek`

- [ ] Подписываться на события текущего адаптера и отписываться при замене/dispose.
- [ ] Игнорировать состояние, совпадающее с актуальным snapshot, и события во время программного применения.
- [ ] Для viewer переводить несовпадающий Play/Pause или seek в `isLocallyDetached`.
- [ ] Для owner/mod сериализовать и объединять нативные команды, отправляя позицию плеера в Hub.
- [ ] Для seek owner/mod применить короткий debounce и отправлять `Seek` вместо local detach.
- [ ] При ошибке Hub перевести инициатора в local и показать существующий toast.

### Task 3: Индикатор LIVE/OFFLINE

**Files:**
- Modify: `src/views/WatchRoomView.vue`

**Interfaces:**
- Consumes: `isLocallyDetached`

- [ ] Сразу под iframe добавить `● LIVE` для synchronized и `● OFFLINE` для local.
- [ ] Использовать красный цвет LIVE, серый OFFLINE и доступный текстовый `aria-label`.
- [ ] Сохранить существующий текстовый статус в панели управления.

### Task 4: Проверка

**Files:**
- Verify: все изменённые файлы

- [ ] Run: `npm run lint && npm run build`
- [ ] Expected: exit code `0`, без новых errors; существующие warnings допустимы.
- [ ] Проверить `git diff --check` и исключить generated-изменение `dist/index.html`.
