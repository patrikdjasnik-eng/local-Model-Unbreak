# Přispívání

[![Contributions](https://img.shields.io/badge/příspěvky-vítány-16a34a)](#jak-přispět)
[![Quality](https://img.shields.io/badge/kvalita-testy%20%2B%20benchmarky-2563eb)](#laťka-kvality)
[![Commits](https://img.shields.io/badge/commity-emoji%20%2B%20CZ%2FEN-6f42c1)](#commit-messages)

Děkujeme za zájem přispět do Model Unbreak. Projekt dává přednost reprodukovatelnosti, malým reviewovatelným změnám a jasným engineering trade-offs před velkými spekulativními přepisy.

## Jak přispět

Dobré příspěvky zahrnují:

- reprodukovatelné hardware/benchmark výsledky,
- GGUF memory-estimation edge cases,
- planner testy,
- backend capability adaptéry,
- security review,
- opravy dokumentace,
- minimální bug reproductions.

Před implementací velké architektonické změny otevři issue s popisem problému, alternativ a měřitelných success criteria.

## Vývojový workflow

1. Forkni projekt nebo vytvoř branch z aktuální default branch.
2. Udržuj změny úzce zaměřené.
3. Přidej nebo aktualizuj testy pro behavioral changes.
4. Aktualizuj dokumentaci, když se mění kontrakty nebo user-visible behavior.
5. Lokálně spusť relevantní test a lint suites.
6. Otevři pull request s evidence, ne pouze s popisem.

## Commit messages

Projektové commity používají emoji a dvojjazyčný český/anglický souhrn.

Doporučený formát:

```text
🧠 feat: přidán plánovač paměti / add memory planner
🐛 fix: opraven výpočet VRAM / fix VRAM calculation
🧪 test: přidány testy GGUF parseru / add GGUF parser tests
📚 docs: rozšířena architektura / expand architecture docs
🔐 security: zpřísněno ověření uzlu / harden node authentication
```

Používej smysluplné formulace. Vyhýbej se commitům jako `update`, `fix stuff` nebo generated-message noise.

## Styl kódu

- TypeScript: strict mode, type-safe interfaces, camelCase, 2-space indentation.
- Python: typed public interfaces tam, kde to dává smysl, explicitní error handling, formatter/linter configuration v repu.
- Komentáře mají vysvětlovat *proč*, ne narrate obvious code.
- Nepoužívej dekorativní ASCII separators.
- Network a file boundaries musí validovat untrusted input.

## Laťka kvality

Pull request měnící planner behavior má obsahovat:

- unit testy pro normal a failure paths,
- alespoň jeden edge case,
- before/after planner output, pokud je relevantní,
- benchmark methodology, pokud se tvrdí performance,
- documentation updates pro changed contracts.

Performance claims musí respektovat [docs/BENCHMARKING.md](docs/BENCHMARKING.md).

## Architektonické změny

Změny ovlivňující trust boundaries, plan scoring semantics, persisted formats nebo backend contracts vyžadují entry v [docs/DECISIONS.md](docs/DECISIONS.md).

## Bezpečnost

Neotvírej public issue pro vulnerability, která může umožnit remote code execution, unauthorized node use, credential exposure nebo prompt/model exfiltration. Postupuj podle [SECURITY.md](SECURITY.md).

## Pull request checklist

- [ ] Změna má jeden jasný účel.
- [ ] Testy pokrývají důležité chování.
- [ ] Error paths jsou ošetřené.
- [ ] Dokumentace je aktualizovaná.
- [ ] Žádný benchmark údaj není prezentován bez metodiky.
- [ ] Nejsou commitnuta sensitive data, model file, token nebo private host information.
- [ ] Commit messages dodržují repository convention.
