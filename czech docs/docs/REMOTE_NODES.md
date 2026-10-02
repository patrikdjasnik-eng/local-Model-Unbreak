# Vzdálené uzly

[![Remote nodes](https://img.shields.io/badge/dokument-vzdálené%20uzly-2563eb)](#účel)
[![Trust](https://img.shields.io/badge/trust-explicitní-0f766e)](#trust-model)
[![Transport](https://img.shields.io/badge/transport-šifrovaný%20plánováno-6f42c1)](#vlastnosti-protokolu)

Remote nodes rozšiřují kapacitu pouze tehdy, když jejich naměřený přínos ospravedlní network cost. Jsou volitelné a mimo default local-only trust boundary.

## Účel

Remote node může poskytnout:

- další VRAM capacity,
- rychlejší kompatibilní GPU,
- model již resident na jiném trusted stroji,
- alternativní execution location, když je local device omezený.

Node **není** považován za transparentní local VRAM.

## Trust model

Early versions podporují pouze explicitně approved nodes ovládané uživatelem nebo trusted peer/team.

Discovery a trust jsou oddělené:

```text
discover candidate
      ↓
inspect identity
      ↓
explicit approval
      ↓
credential establishment
      ↓
authorized capabilities
```

Nalezení zařízení na LAN nesmí samo o sobě udělit execution permission.

## Capability advertisement

Node má vystavit minimální structured capability document, například:

```json
{
  "protocolVersion": "0.x",
  "runtimeAdapters": ["llama.cpp"],
  "gpus": [
    {
      "id": "gpu0",
      "backend": "cuda",
      "totalVramBytes": 12884901888,
      "availableVramBytes": 10737418240
    }
  ]
}
```

Node nemá zveřejňovat unnecessary host details.

## Planner inputs

Remote node je užitečný pouze tehdy, když planner zná capacity i network observations:

- available VRAM,
- backend compatibility,
- model/runtime availability,
- RTT,
- sustained throughput,
- recent load,
- benchmark confidence/age.

## Vlastnosti protokolu

Protocol má poskytovat:

- mutual authentication,
- encryption in transit,
- request authorization,
- replay protection,
- cancellation,
- timeouts,
- protocol version negotiation,
- bounded structured messages,
- clear error codes.

## Failure behavior

Pokud node po planningu zmizí, coordinator může:

1. failnout launch před model execution,
2. fallbacknout pouze na jiný plán povolený stejným privacy/policy profilem,
3. fallback vysvětlit uživateli.

Nesmí tiše přepnout z `private` na remote plan.

## Performance rule

Remote capacity se má vybrat na základě měření, ne proto, že jméno remote GPU vypadá rychleji. Viz [BENCHMARKING.md](BENCHMARKING.md).

## Bezpečnost

Threats a required mitigations jsou definovány v [THREAT_MODEL.md](THREAT_MODEL.md) a [../SECURITY.md](../SECURITY.md).
