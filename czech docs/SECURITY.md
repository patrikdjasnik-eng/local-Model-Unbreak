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

## Disclosure

Po opravě vulnerability může projekt zveřejnit stručné advisory s affected versions, severity, mitigation a upgrade guidance bez unnecessary exploit detailů.

Architektonická rizika viz [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md).
