---
paths:
  - src/**/*.{ts,tsx}
---

# UTC datetime contract

The backend sends and receives **instants in UTC** only, as ISO-8601 with a `Z` suffix (e.g. `2026-10-30T12:00:00Z`).

- **Validate:** parse API datetime strings with `utcInstantSchema` from `@/schemas/datetime` (`z.iso.datetime()`). Do not hand-roll datetime regex guards.
- **Display:** `new Date(validatedIso)` + next-intl formatters in UI only (see `i18n` rule).
- **Send:** serialize with `toISOString()`. Never send local-offset datetimes to the API.

```ts
// ❌ BAD — trust external JSON / treat as local wall time
const createdAt = json.created_at as string

// ✅ GOOD — Zod boundary, then format for display
const { created_at: createdAt } = userResponseSchema.parse(json)
format.dateTime(new Date(createdAt), { dateStyle: 'medium', timeStyle: 'short' })
```
