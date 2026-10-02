# Hranice privátních modulů

[![Boundary](https://img.shields.io/badge/architektura-public%20%2F%20private-2563eb)](#pravidlo)
[![Secrets](https://img.shields.io/badge/secrets-nikdy%20necommitovat-b91c1c)](#pravidlo-repozitáře)
[![Plugins](https://img.shields.io/badge/extensions-pouze%20kontrakt-0f766e)](#extension-contract)
[![Status](https://img.shields.io/badge/stav-active-16a34a)](#pravidlo-migrace)

Model Unbreak má public core a současně může používat privátní extensions vlastněné maintainerem.

## Pravidlo

Ve veřejném Git repozitáři nejde mít složku, která je private pouze pro vybrané lidi. Každý commitnutý soubor v public repu je veřejný.

Proto rozdělíme:

```text
PUBLIC REPOSITORY
├─ contracts
├─ planner
├─ catalog
├─ SafeCell interfaces
├─ Creeping Frost public policy core
├─ Security Event contracts
├─ public adapters
└─ documentation

PRIVATE EXTENSIONS
├─ proprietary implementations
├─ private heuristics
├─ private signatures/intelligence
├─ private integrations
└─ maintainer-only experiments
```

Public repo může vědět **jak** extension načíst, ale nesmí obsahovat private implementation.

## Pravidlo repozitáře

Do public repa nikdy necommitovat private modules, credentials, proprietary datasets, private prompts, private signatures ani secret configuration.

Ignorované local paths:

```text
private/
private_modules/
secret_modules/
extensions/private/
.model-unbreak/private/
```

`.gitignore` je guardrail, ne security boundary. Před public push je pořád nutné zkontrolovat staged files.

## Jeden workspace bez zveřejnění private kódu

Doporučený developer layout:

```text
workspace/
├─ local-Model-Unbreak/          # public Git repository
└─ model-unbreak-private/        # separate private Git repository
```

Public aplikace načte private extensions přes stabilní contract, pokud jsou lokálně nainstalované.

Možné mechanismy: private Python package, private npm package, local wheel/tarball, private Git submodule nebo ignored local plugin directory.

Private Git submodule v public parent repu stále zveřejní URL repozitáře a pinned commit.

## Extension contract

Public core závisí na capabilities, ne na názvech secret modulů.

```python
from typing import Protocol

class ModelUnbreakExtension(Protocol):
    id: str
    version: str

    def capabilities(self) -> set[str]:
        ...

    def register(self, registry: "ExtensionRegistry") -> None:
        ...
```

Public code musí fungovat i bez jediného private extension.

## Security policy

Private extension automaticky nedostává vyšší trust. Stále prochází version/identity checks, Creeping Frost policy, SafeCell rules podle potřeby, normalized Security Events a explicit user/admin configuration.

Private automaticky neznamená trusted.

## Pravidlo migrace

Při reuse kódu z existujícího private repa:

1. klasifikovat source module jako `PUBLIC_SAFE`, `PRIVATE_ONLY` nebo `REWRITE_REQUIRED`;
2. `PRIVATE_ONLY` nikdy nekopírovat do public repa;
3. public interfaces a tests lze přepsat bez exposure proprietary internals;
4. private implementation migrovat do private extension repa/package;
5. v Model Unbreak ponechat jen public contract;
6. před push zkontrolovat final diff.

## Klasifikace

### PUBLIC_SAFE

Reusable logic bez secret implementation, private intelligence, credentials, customer data nebo proprietary algorithms.

### PRIVATE_ONLY

Cokoli záměrně secret, premium/proprietary, security-sensitive beyond public design nebo navázané na private infrastructure.

### REWRITE_REQUIRED

Užitečné behavior, jehož stávající implementation míchá public/private assumptions. Public-facing behavior se vytvoří znovu za čistým contractem.

## Fail-safe behavior

Pokud private extension chybí nebo selže verification, public core jej nestahuje z unknown source, security se neoslabí, použije jen documented public functionality a UI označí extension jako unavailable.

## Stav migrace

Dokud private module není explicitně klasifikovaný, považujeme jej defaultně za **PRIVATE_ONLY**.