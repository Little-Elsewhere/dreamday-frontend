# Contributing

## Commit messages

This project follows [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Messages are validated by **commitlint**:

- Locally via Husky (`commit-msg` hook)
- On PRs to `develop` via the **Commitlint** CI job

Config: [`commitlint.config.ts`](./commitlint.config.ts)

### Format

```
<type>[optional scope][optional !]: <description>

[optional body]

[optional footer(s)]
```

Rules that matter in practice:

1. Start with a **type** (noun), then optional scope in parentheses, optional `!`, then `: ` and a short description.
2. Description comes right after the colon and space — keep the header ≤ 100 characters.
3. Body and footers are optional. Separate body from the header with a blank line.
4. Breaking changes use `!` after type/scope and/or a `BREAKING CHANGE:` footer.

### Types

| Type       | When to use                        | Example                             |
| ---------- | ---------------------------------- | ----------------------------------- |
| `feat`     | New user-facing capability         | `feat: add lesson card component`   |
| `fix`      | Bug fix                            | `fix: resolve login timeout`        |
| `perf`     | Performance improvement            | `perf: optimize image loading`      |
| `docs`     | Documentation only                 | `docs: update CONTRIBUTING`         |
| `style`    | Formatting / UI styling (no logic) | `style: adjust button spacing`      |
| `refactor` | Code change without feature/fix    | `refactor: simplify env validation` |
| `test`     | Tests only                         | `test: add unit tests for utils`    |
| `build`    | Build system / bundler             | `build: update project tooling`     |
| `ci`       | CI/CD workflows and hooks          | `ci: add commitlint job`            |
| `chore`    | Maintenance that is not deps/ci    | `chore: clean up unused exports`    |
| `deps`     | Add / remove / bump dependencies   | `deps: bump zod to v4`              |
| `revert`   | Revert a previous commit           | `revert: undo loading changes`      |

### Scope (optional)

Scope is a short noun for the area you touched — not a file path.

Examples for this repo: `ci`, `i18n`, `ui`, `pwa`, `env`, `auth`, `release`.

```
feat(i18n): add Vietnamese offline page
build: update project tooling
ci: enforce conventional commits on PRs
```

Skip the scope when the change is tiny or spans many areas.

### Dependencies

| Situation                                   | Prefer                                       |
| ------------------------------------------- | -------------------------------------------- |
| Only add / bump / remove packages           | `deps: …`                                    |
| New dependency as part of a product feature | `feat(…): …` (mention lib in body if useful) |
| Tooling / lint / hooks setup                | `ci:` / `chore:` / `build:`                  |

### Breaking changes

Either mark the header:

```
feat!: change API response format
```

Or use a footer (must be uppercase `BREAKING CHANGE`):

```
feat: change API response format

BREAKING CHANGE: responses now return id instead of _id
```

### How this affects releases

[release-please](https://github.com/googleapis/release-please) reads these commits on `main` to bump versions and write the changelog:

| Commit                          | Version bump |
| ------------------------------- | ------------ |
| `fix`                           | patch        |
| `feat`                          | minor        |
| `!` or `BREAKING CHANGE` footer | major        |

### Examples

```bash
# Feature with scope
git commit -m "feat(ui): add lesson progress bar"

# Fix with body
git commit -m "$(cat <<'EOF'
fix: prevent racing of requests

Introduce a request id and ignore stale responses.

Refs: #123
EOF
)"

# Dependency bump
git commit -m "deps: add @commitlint/cli"

# Bad — missing type (commitlint will reject)
git commit -m "update stuff"
```

### Quick validation

```bash
# Check a message without committing
echo "feat: add offline page" | pnpm commitlint

# Expect failure
echo "update stuff" | pnpm commitlint
```
