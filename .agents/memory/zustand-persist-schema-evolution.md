---
name: Zustand persist schema evolution
description: Why adding a field to a persisted Zustand store can crash users with older localStorage, and how to guard it.
---

# Zustand persist: shallow merge + schema evolution

**Rule:** When a Zustand `persist` store holds a nested state slice (e.g. `stats: {...}`), any field you add later will be `undefined` for users whose localStorage was written *before* that field existed. Consumers that iterate/filter/spread it then crash at runtime (e.g. "X is not iterable"). Default state initializers do NOT save you here.

**Why:** Zustand's default `persist` `merge` is a *shallow, root-level* merge — `{ ...initialState, ...persistedState }`. The persisted `stats` object replaces the default `stats` object wholesale, so the freshly-added default field (`conceptsMastered: []`) is dropped and replaced by old data that lacks the key. This is rehydration-from-localStorage only; it is invisible in a fresh browser and easy to miss in testing.

**How to apply:** For any persisted store with nested slices, provide a custom `merge` that deep-merges nested objects over the defaults AND coerces array-typed fields to arrays (`Array.isArray(x) ? x : current.<field>`). When bumping `version`, always pair it with a `migrate` function (a passthrough is fine if `merge` does the shape repair) — bumping `version` *without* `migrate` makes Zustand log "State loaded from storage couldn't be migrated…" on a version mismatch. Whenever you add a new field to a persisted slice, update the `merge` to defend it.

**Concretely in blue-j:** `useProgressStore` (`artifacts/blue-j/src/lib/progress-store.ts`, localStorage key `bluej-progress`) carries the custom `merge` that coerces `stats.conceptsMastered`/`languagesUsed`/`modesUsed`. Server hydration (`hydrateConcepts`) already guards `Array.isArray`, but that runs async after first render, so the persisted value must be repaired at rehydration, not just on server load.
