# FAQ

[![FAQ](https://img.shields.io/badge/dokument-FAQ-2563eb)](#co-je-model-unbreak)
[![Focus](https://img.shields.io/badge/focus-omezený%20hardware-0f766e)](#pro-koho-je)
[![Scope](https://img.shields.io/badge/rozsah-GGUF%20planning-6f42c1)](#vytváří-více-vram)

## Co je Model Unbreak?

Model Unbreak je plánovaný local-first GGUF runtime planner. Inspektuje model a dostupný hardware, benchmarkuje relevantní zdroje a vybírá vysvětlitelnou execution strategy.

## Pro koho je?

Primárně pro uživatele s consumer hardware, kde záleží na VRAM, RAM, context size a runtime tuning: starší gaming GPU, 4–12GB karty, mixed desktop/laptop setups a malé trusted multi-PC prostředí.

## Vytváří více VRAM?

Ne. Nepřeměňuje oddělené memory devices na fyzicky unified VRAM. Plánuje kolem skutečných local a remote resources a respektuje network cost.

## Je to CUDA-over-IP?

Ne. Existující projekty už řeší remote CUDA a low-level GPU forwarding. Model Unbreak má sedět nad runtimes jako llama.cpp a rozhodovat o placement/tuning místo reimplementace GPU driverů.

## Proč nepoužít jen automatické nastavení llama.cpp nebo Ollama?

Tyto runtime umí modely spouštět dobře, ale Model Unbreak má přidat higher-level vrstvu kombinující model inspection, hardware benchmarking, policy, porovnání alternativních strategií, remote-node cost a human-readable reasoning.

## Udělá další GPU inference vždy rychlejší?

Ne. Additional memory může umožnit větší model a zároveň snížit throughput, pokud dominuje network nebo synchronization overhead.

## Co znamená local-first?

Planner preferuje sufficiently capable local plan a tiše neposílá inference data na jiný stroj. Remote execution je explicitní a policy-controlled.

## Co je Elastic Overflow?

Research direction pro reakci na měnící se local memory pressure. Projekt musí nejdřív změřit, jestli je restart, re-planning nebo state migration praktická, než to bude prezentovat jako normální feature.

## Bude projekt navždy podporovat jen GGUF?

Ne nutně. GGUF je zamýšlený first target, protože zúžení format/backend scope dělá první planner testovatelný. Budoucí formáty mají vstupovat přes explicit adapters a decision records.

## Je v projektu kryptoměna nebo token?

Ne. Coin ani mining economy nejsou součástí goals.

## Je remote execution bezpečný?

Může být bezpečnější, ale mění trust boundary. Early design počítá s explicitně trusted nodes, authenticated encrypted transport, structured workloads a žádným anonymous public execution.

## Kde začít s contribution?

Přečti si [../CONTRIBUTING.md](../CONTRIBUTING.md) a pak vyber malý measurable problém: GGUF metadata parsing, memory estimation fixtures, planner edge cases, benchmark reproducibility nebo security review.

## Můžu ve Free použít vlastní GGUF?

Ano. Plánovaný tier model dovoluje user-provided GGUF, pokud active runtime podporuje architecture. Premium je za orchestration/optimization features Model Unbreak, ne za zákaz open model files.

## Cloneuje Model Unbreak celé model repository?

Defaultně ne. Catalog resolve exact selected artifact a preferuje artifact-level download přes provider API. Full Git/Git LFS clone je fallback pouze pokud je potřeba a user ho explicitně schválí.

## Jaké modely budou v prvním menu?

Initial catalog zahrnuje lehké Free entries Qwen3.5 0.8B, Qwen3 1.7B/4B, SmolLM3 3B a Qwen2.5-Coder 1.5B a silnější premium-curated Qwen3 8B, Qwen2.5-Coder 7B, gpt-oss 20B a Gemma 3 12B/27B. Exact sources/quantizations jsou v [MODEL_CATALOG.md](MODEL_CATALOG.md).

## Co je Model Clone?

Research workflow, který používá větší teacher a synthetic nebo explicitně selected user data k vytvoření/evaluation menšího specialized student modelu nebo adapteru. Není to perfect copy teacheru. Viz [MODEL_CLONING.md](MODEL_CLONING.md).

## Co je Creeping Frost?

Creeping Frost AI Firewall v2 je plánovaný central capability policy engine. Vyhodnocuje network access, host filesystem access, process spawning, remote compute, VRAM/RAM allocation, model acquisition a clone training přes `ALLOW / ASK / DENY` + optional restrictions.

## Útočí Security Lab zpět na suspicious systémy?

Ne. HoneyNet, Deception Mode, Threat Hunting a Defense Validation jsou defensive/local mechanisms. Decoys jsou synthetic, validation míří na owned/authorized systems a design výslovně vylučuje retaliation.
