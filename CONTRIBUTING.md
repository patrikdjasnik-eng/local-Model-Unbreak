# Contributing

[![Contributions](https://img.shields.io/badge/contributions-welcome-16a34a)](#how-to-contribute)
[![Quality](https://img.shields.io/badge/quality-tests%20%2B%20benchmarks-2563eb)](#quality-bar)
[![Commits](https://img.shields.io/badge/commits-emoji%20%2B%20CZ%2FEN-6f42c1)](#commit-messages)

Thank you for considering a contribution to Model Unbreak. The project values reproducibility, small reviewable changes, and clear engineering trade-offs over large speculative rewrites.

## How to contribute

Good contributions include:

- reproducible hardware/benchmark results,
- GGUF memory-estimation edge cases,
- planner tests,
- backend capability adapters,
- security reviews,
- documentation corrections,
- minimal bug reproductions.

Before implementing a large architectural change, open an issue describing the problem, alternatives, and measurable success criteria.

## Development workflow

1. Fork or branch from the current default branch.
2. Keep changes narrowly scoped.
3. Add or update tests for behavioral changes.
4. Update documentation when contracts or user-visible behavior change.
5. Run the relevant test and lint suites locally.
6. Open a pull request with evidence, not just a description.

## Commit messages

Project commits use an emoji and bilingual Czech/English summary.

Recommended format:

```text
🧠 feat: přidán plánovač paměti / add memory planner
🐛 fix: opraven výpočet VRAM / fix VRAM calculation
🧪 test: přidány testy GGUF parseru / add GGUF parser tests
📚 docs: rozšířena architektura / expand architecture docs
🔐 security: zpřísněno ověření uzlu / harden node authentication
```

Use meaningful wording. Avoid commits such as `update`, `fix stuff`, or generated-message noise.

## Code style

- TypeScript: strict mode, type-safe interfaces, camelCase, 2-space indentation.
- Python: typed public interfaces where practical, explicit error handling, formatter/linter configuration in-repo.
- Comments should explain *why*, not narrate obvious code.
- Do not use decorative ASCII separators.
- Network and file boundaries must validate untrusted input.

## Quality bar

A pull request that changes planner behavior should include:

- unit tests for normal and failure paths,
- at least one edge case,
- before/after planner output when relevant,
- benchmark methodology when performance is claimed,
- documentation updates for changed contracts.

Performance claims must follow [docs/BENCHMARKING.md](docs/BENCHMARKING.md).

## Architecture changes

Changes affecting trust boundaries, plan scoring semantics, persisted formats, or backend contracts require an entry in [docs/DECISIONS.md](docs/DECISIONS.md).

## Security

Do not open a public issue for a vulnerability that could enable remote code execution, unauthorized node use, credential exposure, or prompt/model exfiltration. Follow [SECURITY.md](SECURITY.md).

## Pull request checklist

- [ ] The change has a single clear purpose.
- [ ] Tests cover the important behavior.
- [ ] Error paths are handled.
- [ ] Documentation is updated.
- [ ] No benchmark number is presented without methodology.
- [ ] No sensitive data, model file, token, or private host information is committed.
- [ ] Commit messages follow the repository convention.
