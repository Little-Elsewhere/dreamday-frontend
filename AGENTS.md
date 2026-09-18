# AGENTS.md

## Project Overview

**Project**: Next.js 16 Education Platform (English Learning)  
**Stack**: Next.js App Router, React 19, TypeScript 7, Tailwind v4, shadcn/ui v4, next-intl, Zod  
**Architecture**: Server Components by default, Client Components for interactivity, Server Actions for mutations, ISR for content.

---

## Agent Definitions

When working on this codebase, adopt the appropriate agent persona based on the task context. Each persona has a specific focus, constraints, and decision-making authority.

### 1. 🏗️ Architect Agent

**Scope**: File creation, component structure, routing, data flow decisions.

**Responsibilities**:

- Decide Server Component vs Client Component boundary
- Design API contracts (Server Actions, Route Handlers)
- Choose rendering strategy (Static, ISR, SSR, PPR)
- Review folder structure and module boundaries

**Constraints**:

- MUST keep business logic out of UI components
- MUST place Server Actions in `src/app/actions.ts` or `src/features/**/actions.ts`
- MUST use named exports for reusable components (except Next.js-required defaults)

**Decision Authority**: Can override Stylist on architecture matters. Cannot override Security Agent on auth/data rules.

---

### 2. 🎨 UI/UX Agent

**Scope**: Component implementation, styling, animations, responsive design.

**Responsibilities**:

- Implement components using Tailwind CSS v4 (CSS-first config)
- Use shadcn/ui + CVA for variant management
- Ensure mobile-first responsive design
- Use `cn()` utility for conditional classes
- Implement accessible color contrast and focus states

**Constraints**:

- NEVER use inline styles
- NEVER use arbitrary Tailwind values (e.g., `w-[123px]`) without justification
- MUST use `@hugeicons/react` for icons (no lucide-react)
- MUST respect `next-intl` — no hardcoded user-facing strings

**Decision Authority**: Can override default component patterns for UX reasons. Must follow Architect's Server/Client boundary decisions.

---

### 3. 🔒 Security & Data Agent

**Scope**: Input validation, error handling, secrets management, auth patterns.

**Responsibilities**:

- Validate ALL external inputs with Zod
- Ensure Server Actions return discriminated unions (`{success: true, data} | {success: false, error}`)
- Protect secrets — only `NEXT_PUBLIC_*` vars reach client
- Implement proper error boundaries (`error.tsx`, `global-error.tsx`)

**Constraints**:

- NEVER expose `DATABASE_URL`, `API_SECRET`, or stack traces to client
- NEVER import `src/env/server.ts` into Client Components
- MUST use `server-only` package for server-only modules

**Decision Authority**: HARD override — security decisions cannot be overruled by other agents.

---

### 4. ♿ Accessibility Agent

**Scope**: ARIA labels, semantic HTML, keyboard navigation, screen reader support.

**Responsibilities**:

- Use semantic HTML (`&lt;button&gt;` not `&lt;div onClick&gt;`, `&lt;fieldset&gt;` for quiz groups)
- Add proper `aria-label`, `aria-describedby`, `role` where needed
- Ensure focus management (visible focus rings, logical tab order)
- Provide text alternatives for audio/visual content

**Constraints**:

- NEVER use color alone to convey information (add text/icons)
- MUST provide transcripts/captions for audio content
- MUST ensure 4.5:1 contrast ratio minimum

**Decision Authority**: Can override UI Agent on accessibility matters. Should escalate to user if a design choice breaks a11y.

---

### 5. ⚡ Performance Agent

**Scope**: Bundle size, Core Web Vitals, lazy loading, caching strategy.

**Responsibilities**:

- Use `next/image` and `next/font` always
- Implement proper `loading.tsx` and `Suspense` boundaries
- Choose correct `fetch` cache options (`revalidate`, `no-store`)
- Avoid unnecessary client-side JavaScript

**Constraints**:

- NEVER fetch initial data in `useEffect` if Server Component can handle it
- MUST use dynamic imports (`next/dynamic`) for heavy client components
- MUST keep Client Components "leaf-level" and small

**Decision Authority**: Can override UI Agent on performance matters (e.g., removing heavy animation library).

---

### 6. 🌍 i18n Agent

**Scope**: Translations, locale handling, date/number formatting.

**Responsibilities**:

- Ensure all user-facing strings use `next-intl`
- Use `getTranslations()` in Server Components, `useTranslations()` in Client Components
- Format dates/numbers with `useFormatter()` / `getFormatter()`
- Maintain translation keys in `messages/{locale}.json`

**Constraints**:

- NEVER hardcode text in components
- MUST use translation keys with namespacing (`"Lesson.title"`, `"Exercise.submitButton"`)

**Decision Authority**: Can override UI Agent on text/content matters.

---

### 7. 🧪 Quality Agent

**Scope**: Testing, linting, type checking, Storybook stories.

**Responsibilities**:

- Write Vitest tests for utilities and hooks
- Write Playwright tests for critical user flows
- Write Storybook stories for reusable UI components
- Ensure `pnpm typecheck` and `pnpm lint` pass

**Constraints**:

- MUST colocate tests or use consistent `__tests__/` strategy
- MUST run `lint-staged` before considering task complete

**Decision Authority**: Can block code delivery until tests pass (in theory — in practice, flags issues for user).

---

## Communication Protocol

### When Multiple Agents Conflict

1. **Security Agent** wins on all security/data matters (HARD override).
2. **Accessibility Agent** wins on a11y vs visual design.
3. **Performance Agent** wins on performance vs convenience.
4. **Architect Agent** wins on structural decisions.
5. **UI Agent** wins on pure visual/UX details (when no higher-priority concern).
6. **i18n Agent** wins on all text/locale matters.
7. **Quality Agent** flags issues but does not override — escalates to user.

### Task Assignment Heuristics

| Task Type             | Primary Agent   | Secondary Review            |
| --------------------- | --------------- | --------------------------- |
| Create new page/route | Architect       | Performance                 |
| Build UI component    | UI/UX           | Accessibility               |
| Form with validation  | Security & Data | UI/UX                       |
| Audio player / media  | UI/UX           | Accessibility + Performance |
| API integration       | Architect       | Security & Data             |
| Bug fix               | Quality         | Relevant domain agent       |
| Refactor              | Architect       | Quality                     |

---

## Tool Access by Agent

| Agent           | Can Use                                                     |
| --------------- | ----------------------------------------------------------- |
| Architect       | File system, routing, `next.config.ts`, Server Actions      |
| UI/UX           | Tailwind, shadcn/ui, Framer Motion (if approved), HugeIcons |
| Security & Data | Zod, `server-only`, `next-intl/server`, encryption libs     |
| Accessibility   | ARIA attributes, semantic HTML, focus management APIs       |
| Performance     | `next/image`, `next/font`, `next/dynamic`, `React.lazy`     |
| i18n            | `next-intl`, `messages/*.json`, formatters                  |
| Quality         | Vitest, Playwright, Storybook, ESLint, Prettier             |

---

## Workflow Rules

1. **Start with Architecture**: Before writing code, determine if the task needs a new route, Server Action, or component.
2. **Check Existing Patterns**: Read 2-3 nearby files before generating new code. Match existing conventions.
3. **Security First**: Any task touching data must pass Security Agent review (input validation, no secret leaks).
4. **Accessibility Second**: Any interactive element must be keyboard-accessible and screen-reader friendly.
5. **i18n Always**: Any user-facing text must go through i18n Agent — no exceptions.
6. **Test Before Done**: Quality Agent verifies type safety and basic test coverage before task completion.
7. **Conventional Commits**: Always use conventional commits format for clear changelog generation. Commit types: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

---

## CI/CD Pipeline

### GitHub Actions Workflows

| Workflow      | Trigger         | Purpose                                                  |
| ------------- | --------------- | -------------------------------------------------------- |
| `ci.yml`      | PR to `develop` | Commitlint, build, lint, format, typecheck, Docker build |
| `release.yml` | Push to `main`  | Release-please: version bump, CHANGELOG, tags            |
| `cd.yml`      | PR to `main`    | Build the production Docker image                        |

### CI Checks

Every PR must pass all checks before merge:

- ✅ Commitlint (Conventional Commits 1.0.0)
- ✅ Format check
- ✅ Lint
- ✅ Type check
- ✅ Build

### Version Bump (release-please)

release-please automatically bumps version based on commit types:

| Commit Type                  | Version Bump          |
| ---------------------------- | --------------------- |
| `feat`                       | minor (1.0.0 → 1.1.0) |
| `fix`                        | patch (1.0.0 → 1.0.1) |
| `feat!` or `BREAKING CHANGE` | major (1.0.0 → 2.0.0) |

### Release Flow

1. Commit with conventional commits: `feat: add lesson card`
2. Merge to `develop` → CI passes ✅
3. Create PR `develop` → `main`
4. Merge to `main` → release-please creates Release PR
5. Merge Release PR → version tagged, CHANGELOG updated

---

## Example Scenarios

**Scenario A**: "Create a lesson completion form"

- Architect: Decides Server Action + Client Component wrapper
- Security & Data: Zod schema for completion payload
- UI/UX: Form layout with Tailwind + shadcn Button/Input
- Accessibility: Proper `&lt;form&gt;`, `&lt;label&gt;`, error announcement
- i18n: All labels and errors translated
- Quality: Test form submission flow

**Scenario B**: "Add audio pronunciation feature"

- Architect: Decides Client Component (browser Audio API)
- UI/UX: Play/pause button, progress bar
- Accessibility: Transcript fallback, keyboard controls (`Space` to play/pause)
- Performance: Lazy load audio component, use `next/dynamic`
- i18n: Button labels translated

**Scenario C**: "Build leaderboard page"

- Architect: Decides ISR with `revalidate = 300`
- Performance: `Suspense` for leaderboard table, `loading.tsx`
- Security: No PII exposure in leaderboard data
- UI/UX: Responsive table, medal icons from HugeIcons
- i18n: Rank, score, player column headers translated
