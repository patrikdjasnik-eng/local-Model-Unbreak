# Bezpečnostní politika

[![Security](https://img.shields.io/badge/security-hlásit%20soukromě-b91c1c)](#hlášení-zranitelnosti)
[![Remote nodes](https://img.shields.io/badge/remote%20nodes-pouze%20důvěryhodné-0f766e)](#bezpečnostní-základ)
[![Status](https://img.shields.io/badge/stav-pre--release-6f42c1)](#podporované-verze)

Bezpečnost je core design constraint, protože Model Unbreak může v budoucnu orchestravat model soubory, lokální hardware, network-connected compute nodes a runtime processes.

## Podporované verze

Projekt je pre-release. Dokud neexistuje první tagged release, security fixes cílí na default branch.

## Hlášení zranitelnosti

**Nezveřejňuj** exploitovatelné detaily ve veřejném issue.

Pokud je pro repo zapnuté GitHub private vulnerability reporting, použij ho. Jinak kontaktuj maintanera soukromým zavedeným kanálem a uveď:

- affected commit nebo version,
- impact,
- minimal reproduction,
- required attacker position,
- relevant logs se secrets odstraněnými,
- suggested mitigation, pokud je známá.

Do reportu nedávej reálné API tokeny, private model content, user prompts ani nesouvisející osobní data.

## Bezpečnostní základ

Early remote-node support musí dodržovat:

- nody jsou opt-in,
- nody se autentizují navzájem,
- transport je encrypted,
- remote capabilities jsou allowlisted,
- coordinator nepřijímá arbitrary shell commands jako workload definitions,
- runtime arguments vznikají z validated structured plans,
- secrets se nikdy nezapisují do benchmark output,
- nodes nejsou vystaveny jako unauthenticated public services.

## Citlivé plochy

Projekt považuje za high risk:

- remote execution adapters,
- model/path handling,
- subprocess invocation,
- backend CLI argument construction,
- node authentication a authorization,
- local discovery protocols,
- telemetry a logs,
- configuration import/export.

## Mimo rozsah prvních release

První verze neposkytují security promise pro:

- bezpečné spouštění arbitrary third-party workloads,
- anonymous public compute sharing,
- multi-tenant isolation na úrovni hardened cloud providera,
- ochranu proti fully compromised operating system nebo GPU driveru.


## Security Lab architektura

Projektová security architektura je v [docs/security/README.md](docs/security/README.md).

Core controls:

- **Creeping Frost AI Firewall v2** — capability-aware `ALLOW / ASK / DENY` policy a restrictions.
- **SafeCell** — disposable runtime/filesystem/network containment.
- **HoneyNet + Deception Mode** — synthetic canaries a decoy services bez real credentials.
- **Threat Hunting** — baseline-aware behavioral monitoring a correlation.
- **Supply Chain Guard** — exact artifact source, revision, licence, hashes, quarantine a promotion.
- **Node Attestation** — remote-worker identity a drift evidence.
- **Defense Validation** — non-destructive validation pouze na owned nebo explicitně authorized systems.
- **Incident Response** — containment, evidence preservation, trust changes a recovery.

Základní security protection nemá být paywall. Premium může přidat history, policy automation, remote orchestration a richer reporting, ale baseline quarantine/isolation/integrity controls zůstávají safety součástí produktu.

## Security model acquisition

Instalace modelu respektuje [docs/MODEL_ACQUISITION.md](docs/MODEL_ACQUISITION.md). Downloaded file jde do staging/quarantine před promotion do trusted local model store. Runtime update prochází stejnou supply-chain policy.

## Security Model Clone

Clone workflow respektuje [docs/MODEL_CLONING.md](docs/MODEL_CLONING.md). User conversations, folders, coding sessions ani datasets se nikdy tiše nepřidávají do trainingu. Remote training vyžaduje explicit approval a trusted/attested node.

## Disclosure

Po opravě vulnerability může projekt zveřejnit stručné advisory s affected versions, severity, mitigation a upgrade guidance bez unnecessary exploit detailů.

Architektonická rizika viz [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md).
