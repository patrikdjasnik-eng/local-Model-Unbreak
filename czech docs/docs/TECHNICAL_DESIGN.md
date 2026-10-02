# Technický návrh

[![Design](https://img.shields.io/badge/dokument-technický%20návrh-2563eb)](#design-goals)
[![Runtime](https://img.shields.io/badge/runtime-GGUF%20%2B%20llama.cpp-0f766e)](#backend-contract)
[![Planner](https://img.shields.io/badge/planner-vysvětlitelný-6f42c1)](#fit-planner)

Tento dokument popisuje zamýšlenou technickou podobu Model Unbreak. Pro prototypy je normativní, dokud není nahrazen zaznamenaným rozhodnutím.

## Design goals

- Zpřístupnit omezený hardware bez nutnosti ruční znalosti runtime flags.
- Preferovat measured capability před marketingovými specifikacemi.
- Udržet planning dostatečně deterministický pro testování a vysvětlení.
- Považovat memory headroom za first-class constraint.
- Udržet remote compute volitelný a explicitně trusted.
- Držet runtime-specific behavior za adaptéry.

## Navrhované rozložení repozitáře

```text
model-unbreak/
├─ apps/
│  ├─ cli/
│  └─ desktop/
├─ packages/
│  ├─ contracts/
│  ├─ planner/
│  ├─ model-inspector/
│  └─ telemetry/
├─ services/
│  ├─ coordinator/
│  └─ node/
├─ adapters/
│  ├─ llama-cpp/
│  └─ ollama/
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ fixtures/
└─ docs/
```

Skutečná implementace může začít menší, ale module boundaries mají zůstat explicitní.

## Core contracts

### HardwareSnapshot

Hardware snapshot popisuje kapacitu v konkrétním čase.

```ts
export type HardwareSnapshot = {
  capturedAt: string;
  cpu: {
    model: string;
    logicalCores: number;
  };
  memory: {
    totalBytes: number;
    availableBytes: number;
  };
  gpus: Array<{
    id: string;
    name: string;
    backend: "cuda" | "vulkan" | "metal" | "cpu";
    totalVramBytes: number;
    availableVramBytes: number;
    utilization?: number;
  }>;
};
```

Snapshot není benchmark. Popisuje pouze observed resources.

### ModelProfile

```ts
export type ModelProfile = {
  path: string;
  architecture: string;
  quantization?: string;
  fileBytes: number;
  parameterCount?: number;
  metadata: Record<string, string | number | boolean>;
};
```

Model inspector nemá kvůli vytvoření profilu načítat celé model weights.

### BenchmarkProfile

```ts
export type BenchmarkProfile = {
  hardwareFingerprint: string;
  backendVersion: string;
  measuredAt: string;
  promptTokensPerSecond?: number;
  generationTokensPerSecond?: number;
  network?: {
    rttMs: number;
    throughputMbps: number;
  };
};
```

### ExecutionPlan

```ts
export type ExecutionPlan = {
  id: string;
  profile: "fast" | "big" | "long-context" | "private" | "balanced";
  placement: Array<{
    resourceId: string;
    role: "weights" | "compute" | "kv-cache" | "overflow";
    estimatedBytes: number;
  }>;
  runtime: {
    adapter: string;
    contextTokens: number;
    settings: Record<string, string | number | boolean>;
  };
  estimates: {
    peakVramBytes?: number;
    peakRamBytes?: number;
    generationTokensPerSecond?: number;
    networkRttMs?: number;
  };
  explanation: string[];
  warnings: string[];
};
```

## Fit Planner

Planner přijímá:

```text
ModelProfile
+ HardwareSnapshot[]
+ BenchmarkProfile[]
+ UserPolicy
+ BackendCapabilities
```

a vrací nula nebo více validovaných candidate plans.

První implementace má používat explicitní heuristiky místo machine learningu. Planner tak zůstane inspectable a projekt získá baseline pro budoucí strategie.

### Generování kandidátů

Kandidátní strategie mohou zahrnovat:

- plnou lokální GPU residency, pokud je bezpečná,
- částečný GPU offload + system RAM,
- CPU-heavy local execution,
- plné spuštění na trusted remote node,
- backend-supported multi-device placement.

Planner nesmí předpokládat, že aggregate memory znamená aggregate performance.

### Scoring

Konceptuální score:

```text
score =
  throughputBenefit
  - memoryRisk
  - networkPenalty
  - instabilityPenalty
  - policyPenalty
```

Váhy se liší podle profilu. `private` například dává remote execution nekonečný penalty.

Jeden scalar score nesmí skrýt hard constraints. Plán porušující policy nebo memory safety je odmítnut před rankingem.

## Odhad paměti

Planning musí počítat s více než GGUF file size:

```text
estimated runtime memory =
  model weights
+ KV cache
+ runtime buffers
+ graph/workspace memory
+ backend overhead
+ configured safety margin
```

Safety margins mají být konfigurovatelné a backend-specific. Default má být konzervativní, dokud runtime telemetry nepodpoří přesnější estimates.

## Backend contract

Backend adapter má vystavit capabilities přes structured interface:

```ts
export interface RuntimeAdapter {
  getCapabilities(): Promise<RuntimeCapabilities>;
  validate(plan: ExecutionPlan): Promise<ValidationResult>;
  launch(plan: ExecutionPlan): Promise<RuntimeSession>;
  stop(sessionId: string): Promise<void>;
}
```

Planner nesmí přímo skládat shell commands.

## Runtime lifecycle

```text
plan
 ↓
validate
 ↓
reserve/check resources
 ↓
launch adapter
 ↓
health check
 ↓
serve inference
 ↓
collect telemetry
 ↓
stop / fail
 ↓
persist sanitized results
```

## Failure model

Důležitá selhání zahrnují:

- stale VRAM snapshot,
- runtime OOM navzdory odhadu,
- backend version mismatch,
- remote node disconnect,
- unsupported model metadata,
- stale nebo incompatible benchmark profile,
- změnu user policy po plánování.

Default recovery musí být explicitní. Silent fallback na materiálně odlišný privacy nebo cost profile není povolen.

## Návrh remote nodu

Node má inzerovat capabilities bez zbytečných host details. Coordinator má posílat structured workload description, nikdy raw shell text.

Minimální vlastnosti remote protocol:

- mutual authentication,
- encryption in transit,
- replay resistance,
- node identity a revocation,
- per-request authorization,
- bounded resource claims,
- protocol version negotiation.

## Observability

Užitečné runtime metrics:

- load time,
- time to first token,
- prompt tokens/s,
- generation tokens/s,
- peak VRAM/RAM,
- remote RTT a transfer volume,
- planner prediction error,
- failure reason.

Prompty ani generated content se nemají logovat defaultně.


## Model catalog a acquisition contracts

Core runtime přijímá model artifacts přes catalog/acquisition layer, ne přímo z UI strings.

Doporučené contracts:

```ts
export type CatalogEntry = {
  id: string;
  tier: "free" | "premium";
  family: string;
  format: "gguf";
  quantization: string;
  repoId: string;
  filename: string;
  revision: string;
  licenseId: string;
};

export type AcquisitionState =
  | "PENDING_CONSENT"
  | "DOWNLOADING"
  | "PAUSED"
  | "QUARANTINED"
  | "VERIFYING"
  | "READY"
  | "BLOCKED"
  | "FAILED";
```

Acquisition service musí oddělit network download permissions od inference execution permissions.

## Security control plane

Security moduly komunikují přes normalized events a structured capability requests.

```ts
export type CapabilityRequest = {
  requesterId: string;
  capability: string;
  resource?: string;
  reason: string;
  requestedAt: string;
};

export type CapabilityDecision = {
  decision: "ALLOW" | "ASK" | "DENY";
  ruleId?: string;
  restrictions?: Record<string, string | number | boolean>;
  explanation: string[];
};
```

Creeping Frost request vyhodnotí; platform backends decision enforceují. SafeCell, HoneyNet, Threat Hunter, Node Attestation a Incident Response používají stejné event IDs a session IDs.

Viz [security/README.md](security/README.md) a [security/SECURITY_EVENTS.md](security/SECURITY_EVENTS.md).

## Clone pipeline boundary

Clone jobs nejsou ordinary inference sessions. Mají explicit dataset scope, teacher/student identities, training resources, security mode a evaluation result.

Training service smí číst pouze data sources zahrnuté v approved clone-job manifestu.

## Otevřené design otázky

- Jak konzistentně odhadovat KV-cache memory napříč backend verzemi?
- Které llama.cpp RPC capabilities jsou dost stabilní pro v0?
- Jak agresivně má planner reagovat na transient GPU pressure?
- Jaký fingerprint invaliduje benchmark profile?
- Kdy je restart-based migration lepší než live migration research?
