# Watch Room Local Playback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Разрешить каждому участнику локально управлять нативным YouTube-плеером и вручную возвращаться к общему времени комнаты.

**Architecture:** `useWatchRoom` хранит режим текущего клиента (`synchronized`/`local`) отдельно от серверного `PlaybackSnapshot`. В локальном режиме snapshot обновляет UI, но не плеер; кнопка синхронизации повторно применяет последний snapshot.

**Tech Stack:** Vue 3 Composition API, TypeScript, YouTube IFrame API, SignalR, SCSS.

## Global Constraints

- Нативные действия YouTube не вызывают Hub.
- `PlaybackStateChanged` остаётся источником общего состояния.
- Новый тестовый раннер не добавляется.
- Проверка: `npm run lint`, `npm run build` и ручной сценарий в двух браузерах.

---

### Task 1: Нативная панель YouTube

**Files:**
- Modify: `src/features/watch-room/player/YouTubePlayerAdapter.ts`
- Modify: `src/views/WatchRoomView.vue`

**Interfaces:**
- YouTube IFrame API получает `controls: 1` и `disablekb: 0`.
- Iframe больше не перекрывается локальным overlay.

- [ ] **Step 1: Включить controls**

```ts
playerVars: {
  controls: 1,
  disablekb: 0,
  rel: 0,
  playsinline: 1,
}
```

- [ ] **Step 2: Удалить overlay**

Удалить `watch-room-view__player-overlay`, обработчик `togglePlayback` и связанные стили, чтобы iframe получал pointer/keyboard events напрямую.

### Task 2: Локальный режим и ручная синхронизация

**Files:**
- Modify: `src/features/watch-room/useWatchRoom.ts`

**Interfaces:**
- Produces: `isLocallyDetached: Ref<boolean>`
- Produces: `syncToRoom(): Promise<void>`

- [ ] **Step 1: Добавить состояние клиента**

```ts
const isLocallyDetached = ref(false);
```

- [ ] **Step 2: Не применять snapshot в локальном режиме**

После обновления `room` и общего времени вызывать `applySnapshotToPlayer` только при `!isLocallyDetached.value`.

- [ ] **Step 3: Заменить drift correction обнаружением отклонения**

Периодически сравнивать `adapter.getCurrentTime()` с `getEffectivePosition(snapshot)`. При расхождении больше `1.5` секунды устанавливать `isLocallyDetached.value = true`, не вызывая `seekTo`.

- [ ] **Step 4: Добавить ручную синхронизацию**

```ts
const syncToRoom = (): Promise<void> => runBusy(async () => {
  const snapshot = requireCurrentRoom();
  isLocallyDetached.value = false;
  try {
    await enqueuePlayerOperation(
      () => applySnapshotToPlayer(snapshot, eventGeneration)
    );
  } catch (error) {
    isLocallyDetached.value = true;
    throw error;
  }
});
```

- [ ] **Step 5: Общие owner/mod actions повторно подключают инициатора**

Перед `Play`, `Pause` и `Seek` сохранить старый режим и установить synchronized; при ошибке восстановить старый режим.

### Task 3: UI режима и проверка

**Files:**
- Modify: `src/components/WatchRoom/PlaybackControls.vue`
- Modify: `src/views/WatchRoomView.vue`

**Interfaces:**
- Consumes: `isLocallyDetached`
- Emits: `sync`

- [ ] **Step 1: Показать статус и кнопку всем**

```vue
<button type="button" :disabled="disabled" @click="emit('sync')">
  Синхронизироваться
</button>
```

Статус: `Локальный просмотр` либо `Синхронизировано`. Общее время комнаты остаётся видимым.

- [ ] **Step 2: Уточнить общие controls**

Owner/mod видят подписи «Запустить для всех», «Пауза для всех» и «Общая позиция видео». Viewer не видит общие controls, но видит кнопку синхронизации.

- [ ] **Step 3: Статическая проверка**

Run: `npm run lint && npm run build`

Expected: обе команды завершаются с кодом `0`; существующие warnings допустимы, новых errors нет.

- [ ] **Step 4: Ручная проверка**

В двух браузерах войти в одну комнату. Во втором браузере нативно отмотать назад и убедиться, что первый не изменился, а статус второго стал «Локальный просмотр». Нажать «Синхронизироваться» и убедиться, что второй вернулся к эффективной позиции и Play/Pause общего snapshot.
