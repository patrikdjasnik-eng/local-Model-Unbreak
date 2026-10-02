# Governance

[![Governance](https://img.shields.io/badge/dokument-governance-334155)](#rozhodování)
[![Model](https://img.shields.io/badge/model-vedený%20maintainerem-2563eb)](#role)
[![Transparency](https://img.shields.io/badge/rozhodnutí-dokumentovaná-0f766e)](docs/DECISIONS.md)

Model Unbreak používá v této fázi lehký maintainer-led governance model vhodný pro raný open-source projekt.

## Role

### Maintainer

Maintainer odpovídá za směřování repozitáře, integritu release, security response, merge decisions a řešení architektonických sporů.

### Contributor

Contributor navrhuje kód, dokumentaci, benchmark data, testy nebo design feedback. Opakované high-quality contribution může později vést k širší review odpovědnosti.

## Rozhodování

Běžná implementační rozhodnutí probíhají přes pull-request review.

Změny ovlivňující některou z následujících oblastí vyžadují explicitní design discussion a decision record:

- trust boundaries,
- planner scoring semantics,
- persisted configuration formats,
- remote protocol compatibility,
- backend adapter contracts,
- privacy defaults,
- benchmark methodology.

Decision records jsou indexovány v [docs/DECISIONS.md](docs/DECISIONS.md).

## Priority projektu

Když jsou cíle v konfliktu, projekt preferuje:

1. safety před agresivní automatizací,
2. reproducibility před působivými isolated numbers,
3. explainability před opaque heuristics,
4. local privacy před convenience,
5. maintainable adapters před backend-specific shortcuts.

## Změny governance

Governance se může s růstem contributor base vyvíjet. Každá material change má být dokumentována v tomto souboru a zaznamenána jako architecture/project decision.
