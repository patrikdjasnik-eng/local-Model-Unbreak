# Zásady soukromí

[![Privacy](https://img.shields.io/badge/dokument-soukromí-2563eb)](#výchozí-přístup)
[![Prompts](https://img.shields.io/badge/prompty-defaultně%20nelogovány-0f766e)](#zpracování-obsahu)
[![Telemetry](https://img.shields.io/badge/telemetrie-defaultně%20lokální-6f42c1)](#telemetrie)

Model Unbreak je navržen kolem local inference, takže privacy defaults nesmí podrývat hlavní důvod, proč uživatelé local models volí.

## Výchozí přístup

- Local execution je preferován, když je praktický.
- Remote execution vyžaduje explicitní konfiguraci.
- Prompty a generated content se defaultně nelogují.
- Benchmark data mají popisovat hardware/runtime behavior bez user content.
- Žádný analytics upload nemá být tiše zapnutý.

## Zpracování obsahu

Prompt text, generated output, retrieved documents, tool results a model inputs mohou být citlivé. Komponenty mají předávat jen data potřebná pro execution a vyhýbat se persistence contentu, pokud to explicitně nevyžaduje user-enabled feature.

## Telemetrie

Bezpečná default telemetry zahrnuje například:

- tokens per second,
- memory use,
- runtime errors,
- network RTT,
- adapter version,
- planner prediction error.

Telemetry se má vyhýbat:

- prompt text,
- generated text,
- private filenames tam, kde nejsou potřeba,
- API keys/tokens,
- unnecessary hostnames/IP addresses v exported reports.

## Remote nodes

Remote execution plan nutně rozšiřuje data boundary. Před jeho spuštěním má user-facing explanation jasně říct, že inference data mohou opustit local machine.

Profil `private` musí remote execution odmítnout, ne jen snížit jeho prioritu.

## Exportovaná diagnostika

Diagnostic bundles mají být sanitized by construction. Pokud jsou identifiers potřeba pro correlation, použij generated IDs místo raw secrets nebo private host metadata.

## Budoucí služby

Pokud projekt později přidá optional hosted services, public relays nebo cloud coordination, vyžaduje to samostatný privacy review a explicit opt-in.
