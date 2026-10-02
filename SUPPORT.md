# Support

[![Support](https://img.shields.io/badge/support-community%20issues-2563eb)](#where-to-ask)
[![Bugs](https://img.shields.io/badge/bugs-reproduction%20required-0f766e)](#bug-reports)
[![Security](https://img.shields.io/badge/security-use%20private%20reporting-b91c1c)](SECURITY.md)

Model Unbreak is an experimental project. Support is best-effort and should focus on reproducible behavior.

## Where to ask

Use GitHub Issues for:

- reproducible bugs,
- hardware-detection failures,
- incorrect GGUF estimates,
- planner behavior that contradicts documented policy,
- focused feature proposals.

Use Discussions if enabled for open-ended design conversation, hardware results, or general questions.

Security reports belong in the private process described in [SECURITY.md](SECURITY.md).

## Bug reports

A useful report includes:

```text
Model Unbreak commit/version:
Operating system:
CPU:
RAM:
GPU:
VRAM:
Driver/runtime:
Model architecture:
GGUF quantization:
Model size:
Context setting:
Selected profile:
Expected behavior:
Observed behavior:
Minimal reproduction:
Relevant sanitized logs:
```

Do not upload proprietary model files, private prompts, API keys, access tokens, or unrelated diagnostic archives.

## Performance reports

Performance claims should follow [docs/BENCHMARKING.md](docs/BENCHMARKING.md). A screenshot of a single tokens-per-second value is not enough to diagnose a planner problem.

## Unsupported expectations

The project cannot guarantee that:

- every GGUF model can run on every machine,
- adding a remote GPU increases speed,
- a model that fits in combined memory will be interactive,
- third-party runtimes behave identically across driver versions.
