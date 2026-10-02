# Private Module Boundary

[![Boundary](https://img.shields.io/badge/architecture-public%20%2F%20private-2563eb)](#rule)
[![Secrets](https://img.shields.io/badge/secrets-never%20commit-b91c1c)](#repository-rule)
[![Plugins](https://img.shields.io/badge/extensions-contract%20only-0f766e)](#extension-contract)
[![Status](https://img.shields.io/badge/status-active-16a34a)](#migration-rule)

Model Unbreak is intended to have a public core while allowing private extensions owned by the maintainer.

## Rule

A public Git repository cannot contain a folder that is private only to selected users. Any committed file in a public repository is public.

Therefore Model Unbreak separates:

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

The public repository may know **how** to load an extension, but must not contain the private implementation.

## Repository rule

Never commit private modules, credentials, proprietary datasets, private prompts, private signatures, or secret configuration to this public repository.

The following local paths are ignored:

```text
private/
private_modules/
secret_modules/
extensions/private/
.model-unbreak/private/
```

`.gitignore` is a guardrail, not a security boundary. Before every public push, staged files still need review.

## One workspace without exposing private code

Recommended developer layout:

```text
workspace/
├─ local-Model-Unbreak/          # public Git repository
└─ model-unbreak-private/        # separate private Git repository
```

The public application loads private extensions through a stable contract when installed locally.

Alternative mechanisms may include a private Python package, private npm package, local wheel/tarball, private Git submodule, or ignored local plugin directory.

A private Git submodule still exposes its repository URL and pinned commit in the public parent repository.

## Extension contract

The public core depends on capabilities, not private module names.

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

The public code must continue to work when no private extension is installed.

## Security policy

Private extensions receive no automatic elevated trust. They still pass version/identity checks, Creeping Frost policy, SafeCell rules where applicable, normalized Security Events, and explicit user/admin configuration.

Private does not automatically mean trusted.

## Migration rule

When reusing code from an existing private repository:

1. classify the source module as `PUBLIC_SAFE`, `PRIVATE_ONLY`, or `REWRITE_REQUIRED`;
2. never copy `PRIVATE_ONLY` code into the public repository;
3. public interfaces and tests may be rewritten without exposing proprietary internals;
4. migrate private implementation into the private extension repository/package;
5. record only the public contract in Model Unbreak;
6. review the final diff before pushing.

## Classification

### PUBLIC_SAFE

Reusable logic containing no secret implementation, private intelligence, credentials, customer data, or proprietary algorithms.

### PRIVATE_ONLY

Anything intentionally secret, premium/proprietary, security-sensitive beyond the public design, or tied to private infrastructure.

### REWRITE_REQUIRED

Useful behavior whose existing implementation mixes public/private assumptions. Recreate the public-facing behavior behind a clean contract.

## Fail-safe behavior

If a configured private extension is missing or fails verification, the public core does not fetch it from an unknown source, security is not weakened, only documented public functionality is used, and the UI reports the extension unavailable.

## Migration status

Until a private module has been explicitly classified, treat it as **PRIVATE_ONLY** by default.