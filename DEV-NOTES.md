# Model Unbreak — DEV NOTES

![Date](https://img.shields.io/badge/date-2026--10--02-0969da?style=flat-square)
![Branch](https://img.shields.io/badge/branch-feat%2Fdashboard--ui--ux-8957e5?style=flat-square)
![Status](https://img.shields.io/badge/status-active_development-3fb950?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript&logoColor=white)
![UI](https://img.shields.io/badge/UI-Vite_dark_mode-646cff?style=flat-square&logo=vite&logoColor=white)
![Backend](https://img.shields.io/badge/backend-localhost_only-238636?style=flat-square)
![llama.cpp](https://img.shields.io/badge/llama.cpp-managed_runtime-a371f7?style=flat-square)
![Tests](https://img.shields.io/badge/tests-Vitest-fcc72b?style=flat-square&logo=vitest&logoColor=black)
![CI](https://img.shields.io/badge/GitHub_Actions-runner_blocked-f85149?style=flat-square&logo=githubactions&logoColor=white)

> Interní vývojový deník pro práci provedenou dne **2. 10. 2026** na větvi `feat/dashboard-ui-ux`.
>
> Snapshot před vytvořením tohoto souboru: **HEAD `cf47dfa`**, **PR #1**, **43 commitů**, **27 změněných souborů**, přibližně **+5468 / -6 řádků**.

## Cíl dne

Dnešní práce posunula Model Unbreak z dokumentačního/core repozitáře směrem k prvnímu skutečně použitelnému lokálnímu demu.

Hlavní cíl byl postupně změněn z:

```text
statický dashboard
→ vizuální demo
```

na:

```text
intuitivní desktop UI
→ lokální TypeScript backend
→ reálná hardwarová telemetrie
→ lokální GGUF katalog
→ automatické spuštění modelu
→ interní chat
→ managed llama.cpp runtime
```

Zásadní UX myšlenka je jednoduchá:

> Uživatel nemá ručně řešit porty, příkazy llama.cpp ani start jednotlivých modelů. Vybere model a Model Unbreak se pokusí zbytek vyřešit automaticky.

## 1. První kompletní dashboard UI

První implementace vznikla podle dodané vizuální reference.

Přidáno:

- desktopový dashboard,
- levý sidebar,
- Dashboard,
- Model Inspector,
- Planner,
- Hardware,
- Security Lab,
- Nodes,
- Catalog,
- Settings,
- Local Engine status,
- Quick Actions,
- System Snapshot,
- Recent Model Inspection,
- Execution Summary,
- Creeping Frost security panel,
- Nodes,
- Benchmark Snapshot,
- Quick Stats,
- stavový footer,
- responzivní breakpointy pro tablet a mobil.

Původní UI bylo záměrně vytvořeno nejprve jako funkční vizuální shell. Část hodnot byla v této fázi demo/mock.

První hlavní commit:

```text
329d708 🎨 feat: implementován dashboard UI/UX / implement dashboard UI/UX
```

## 2. Testovací základ UI

Byl doplněn Vitest + jsdom testovací základ a příkaz:

```bash
npm run verify
```

`verify` spouští:

```text
TypeScript typecheck
→ Vitest
→ produkční Vite build
```

Testy postupně pokrývaly:

- render dashboardu,
- navigaci,
- aktivní položku sidebaru,
- modální dialogy,
- Quick Actions,
- security policy toggles,
- ALLOW / DENY,
- ARIA stav přepínačů,
- refresh telemetrie,
- Escape pro modal,
- potvrzení workflow,
- local-only security text,
- Vite entry,
- responzivní breakpointy,
- přítomnost hlavních dashboard sekcí.

Klíčový commit:

```text
a033340 🧪 test: přidány UI a build testy / add UI and build tests
```

## 3. Local AI konzole

Do UI byla přidána položka **Local AI**.

Chat UX byl inspirován dřívějším RabbitHollow AI rozhraním, ale vizuálně převeden do Model Unbreak.

Funkce první verze:

- výběr lokálního modelu,
- Temperature,
- Max tokens,
- interní chat,
- Enter = odeslat,
- Shift+Enter = nový řádek,
- Stop,
- Reconnect,
- Clear conversation,
- lokální historie v `localStorage`,
- stav CHECKING / ONLINE / OFFLINE,
- předpřipravené technické prompty.

Přidané soubory:

```text
ui/llm.ts
ui/llm.css
```

Důležité commity:

```text
c369f13 🤖 feat: přidána navigace Local AI / add Local AI navigation
34bdf63 🤖 feat: přidán lokální LLM runtime / add local LLM runtime
7de3dfa 🎨 feat: přidán Model Unbreak LLM vzhled / add Model Unbreak LLM styling
20e3f72 🐛 fix: načtení Local AI až po vykreslení UI / load Local AI after UI render
608d1fe 🐛 fix: zpřesněn strict TypeScript fetch / tighten strict TypeScript fetch
```

## 4. Local-only bezpečnost

Po první přímé integraci llama.cpp byl provoz omezen pouze na loopback.

Podporované lokální hosty:

```text
127.0.0.1
localhost
::1
```

Nebyla ponechána možnost omylem přesměrovat demo na libovolný externí LLM endpoint.

Security commit:

```text
60ef575 🛡️ security: LLM proxy omezen na localhost / restrict LLM proxy to localhost
```

Test:

```text
e04122e 🧪 test: ověřen local-only LLM proxy / verify local-only LLM proxy
```

## 5. Lokální TypeScript backend

Byl vytvořen backend přímo v TypeScriptu.

Struktura:

```text
backend/
└─ src/
   ├─ app.ts
   ├─ config.ts
   ├─ hardware.ts
   ├─ llama.ts
   ├─ planner.ts
   ├─ server.ts
   ├─ catalog.ts
   └─ runtime-manager.ts
```

Backend standardně poslouchá pouze na:

```text
127.0.0.1:8787
```

UI používá Vite proxy na backend.

Aktuální API základ:

```text
GET  /api/health
GET  /api/hardware
GET  /api/models
GET  /api/catalog

POST /api/chat
POST /api/planner
POST /api/benchmark
POST /api/runtime/activate
POST /api/runtime/stop
```

Backend obsahuje mimo jiné:

- kontrolu vstupů,
- omezení velikosti request body,
- timeouty,
- `Cache-Control: no-store`,
- normalizované JSON odpovědi,
- převod chyb llama.cpp na skutečné HTTP chyby,
- žádný fake-success při nedostupném modelu.

Klíčové commity:

```text
bdb739a 🧩 feat: přidán backend základ / add backend foundation
69cbabd 🧩 feat: přidán backend základ / add backend foundation
7e7fe70 🧩 feat: přidán backend základ / add backend foundation
e9b2a16 🧩 feat: přidán backend základ / add backend foundation
709b5e4 ⚙️ feat: přidáno lokální backend API / add local backend API
fcdbfc2 ⚙️ feat: přidáno lokální backend API / add local backend API
```

## 6. Jedním příkazem UI + backend

Vývojový start byl sjednocen.

Aktuálně:

```powershell
npm run dev
```

spouští současně:

```text
UI  → Vite
API → TypeScript backend
```

Použit je `concurrently`.

Skripty:

```text
npm run dev
npm run dev:ui
npm run dev:api
npm run build
npm run build:ui
npm run start:api
npm run typecheck
npm test
npm run verify
```

Commity:

```text
d440c2d ⚙️ feat: společný dev start backendu a UI / run backend and UI together
e7c7326 🧩 chore: backend zahrnut do typechecku / include backend in typecheck
c458d72 🔌 feat: UI proxy napojen na lokální backend / proxy UI to local backend
c3be4d5 🤖 feat: LLM UI napojeno přes backend / route LLM UI through backend
```

## 7. Reálná hardwarová telemetrie

Dashboard byl přepojen z mock dat na skutečný lokální hardware.

Backend zjišťuje:

### CPU

- model CPU,
- logická jádra,
- architekturu.

### RAM

- celkovou paměť,
- volnou paměť,
- procentuální využití.

### NVIDIA GPU

Pokud je dostupné `nvidia-smi`, načítá:

- název GPU,
- VRAM total,
- VRAM used,
- GPU utilization.

### Storage

Používá filesystem statistiky pro:

- total,
- free,
- used %.

Frontend runtime bridge:

```text
ui/runtime.ts
```

Commity:

```text
c0fe431 🖥️ feat: dashboard napojen na reálný hardware / connect dashboard to real hardware
2f51e4c 🖥️ feat: refresh používá backend telemetry / refresh uses backend telemetry
8bf36c9 🧪 test: reálná backend telemetrie v UI / test real backend telemetry in UI
```

## 8. Execution Planner

Byl vytvořen první praktický memory planner.

Vstupy:

- velikost modelu,
- context size,
- dostupná RAM,
- dostupná VRAM.

Možné výsledky:

```text
GPU
GPU_RAM_OFFLOAD
CPU_RAM
INSUFFICIENT_MEMORY
```

Planner zatím používá odhad working setu:

```text
model weights
+ odhad KV cache
+ runtime overhead
```

Není zatím považován za přesný profiler llama.cpp, ale za bezpečný první doporučovací mechanismus.

## 9. Benchmark endpoint

Přidán:

```text
POST /api/benchmark
```

Benchmark:

- umí automaticky aktivovat vybraný model,
- provede krátkou inference,
- změří elapsed time,
- vrací output length,
- vrací odhad token rate.

Důležité:

> Aktuální tokens/s je stále označen jako **odhad**, protože není počítán z tokenizer telemetry llama.cpp.

Commit:

```text
af08bc2 ⚡ feat: benchmark automaticky spustí vybraný model / benchmark auto-starts selected model
```

## 10. Automatické hledání GGUF modelů

Byl přidán lokální katalog.

Model Unbreak dnes automaticky prohledává omezené lokální lokace, například:

```text
<projekt>/models
~/models
~/Models
~/Downloads
~/.cache/llama.cpp
~/.cache/huggingface/hub
```

Další adresáře lze později dodat přes:

```text
MODEL_UNBREAK_MODEL_DIRS
```

Ochrany katalogu:

- maximální počet navštívených položek,
- maximální počet výsledků,
- omezená hloubka,
- ignorování `node_modules`,
- ignorování `.git`,
- přijímají se pouze soubory `.gguf`.

Každý objevený model dostane stabilní krátké ID odvozené z lokální cesty pomocí SHA-256.

Přidaný soubor:

```text
backend/src/catalog.ts
```

## 11. Managed llama.cpp runtime

Nejdůležitější změna dne.

Přidán:

```text
backend/src/runtime-manager.ts
```

Cílové uživatelské workflow:

```text
uživatel vybere GGUF model
        ↓
Model Unbreak najde model v katalogu
        ↓
zastaví předchozí managed runtime
        ↓
najde llama-server
        ↓
spustí vybraný model
        ↓
nejprve GPU profil
        ↓
při selhání CPU fallback
        ↓
čeká na /v1/models readiness
        ↓
chat je připraven
```

Aktuální managed llama port:

```text
127.0.0.1:8081
```

Backend záměrně používá jiný port než původní ruční llama.cpp workflow, aby se managed runtime lépe oddělil.

### Hledání llama-server

Runtime manager zkouší:

1. `LLAMA_SERVER_BIN`,
2. `llama-server.exe` v PATH,
3. `llama-server` v PATH.

Pokud není binary dostupná, uživateli je vrácena konkrétní chyba.

To znamená:

> Běžný uživatel již nemá ručně spouštět model při každém použití. Stále však existuje jednorázový prerequisite: llama.cpp / llama-server musí být na počítači dostupný nebo musí být nastaven `LLAMA_SERVER_BIN`.

### GPU → CPU fallback

První pokus:

```text
-ngl 999
```

Fallback:

```text
-ngl 0
```

Výchozí context:

```text
4096
```

Commity:

```text
1c44b53 🤖 feat: automatické hledání a spouštění GGUF modelů / auto-discover and launch GGUF models
1c4e105 🤖 feat: automatické hledání a spouštění GGUF modelů / auto-discover and launch GGUF models
716d13e ⚙️ feat: interní managed llama port / add managed llama runtime port
b1b63eb 🤖 feat: katalog a automatická aktivace modelu / add catalog and automatic model activation
f9dc50a 🤖 feat: backend řídí llama-server / backend manages llama-server
64d206b 🤖 feat: výběr modelu ho automaticky spustí / selecting a model auto-starts it
```

## 12. Interní chat → automatické spuštění modelu

Local AI nyní pracuje s katalogovým ID modelu.

Výběr modelu v dropdownu:

```text
change
→ POST /api/runtime/activate
→ STARTING
→ managed llama-server
→ ONLINE · GPU / ONLINE · CPU
```

Pokud start selže:

- UI zobrazí `START FAILED`,
- do konverzace se vloží srozumitelná chyba,
- nedochází k falešnému stavu ONLINE.

Chat navíc volá `ensureActive()`, takže pokud uživatel pošle zprávu a runtime ještě neběží, backend se jej pokusí spustit automaticky.

Opraven byl také payload:

```text
maxTokens
```

místo nekonzistentního:

```text
max_tokens
```

Commit:

```text
d4898f1 🐛 fix: správný maxTokens payload / fix maxTokens payload
```

## 13. Navigace a Quick Actions již nejsou jen placeholder

Hlavní navigace byla začata přepojovat na skutečné workflow.

Aktuálně:

### Model Inspector

Otevírá modelovou/Local AI pracovní plochu.

### Catalog

Otevírá modelový výběr a Local AI.

### Hardware

Vyvolá refresh skutečné hardwarové telemetrie a přesune uživatele na System Snapshot.

### Planner

Volá backend a sestaví doporučení z dostupného hardwaru + modelu.

### Security Lab

Přesune uživatele k Creeping Frost panelu.

### Nodes

Přesune uživatele na Nodes panel.

### Primary actions

- Inspect / run model,
- Scan Hardware,
- Open Planner.

Commit:

```text
749f081 🧭 feat: navigace a hlavní akce napojeny na reálné funkce / wire navigation and primary actions
```

## 14. GitHub-like dark mode redesign

Po prvním neon-heavy UI byl směr změněn na klidnější a čitelnější dark-mode design inspirovaný kvalitou GitHubu, nikoli jeho kopií.

Nový vizuální základ:

```text
background       #0d1117
surface          #161b22
border           #30363d
text             #f0f6fc
muted            #8b949e
Model Unbreak    #8957e5 / #a371f7
status green     #3fb950
status red       #f85149
```

Přidáno:

- méně glow efektů,
- čitelnější kontrast,
- klidnější panely,
- konzistentnější borders,
- větší hierarchie obsahu,
- logičtější sidebar,
- skupiny navigace:
  - WORKSPACE,
  - INFRASTRUCTURE,
  - SECURITY,
  - SYSTEM.

Přidán nový horní přehled:

```text
SYSTEM STATUS
├─ Local engine
├─ Active model
├─ GPU / VRAM
├─ Security
└─ Context
```

Tyto karty jsou klikatelné a vedou uživatele na relevantní část aplikace.

Soubory:

```text
ui/github-dark.css
ui/dashboard-enhancements.ts
```

Commity:

```text
ed0a911 🧭 feat: intuitivnější dashboard a živý maskot / improve dashboard UX and add animated mascot
84562e0 🎨 feat: GitHub-like dark motiv v našem stylu / add GitHub-like dark theme in our style
cf47dfa 🎨 feat: načten nový intuitivní dark UI motiv / load new intuitive dark UI theme
```

## 15. Unbreak mascot

Do topbaru byl přidán vlastní animovaný maskot místo kopírování GitHub Octocatu.

Motiv:

> malý stylizovaný cyber-rabbit / Model Unbreak companion.

Implementace je vlastní SVG + CSS animace, nikoli externí GIF.

Chování:

- kliknutí otevře Local AI,
- zelený status = runtime online,
- červený status = runtime offline,
- tooltip,
- periodické mikroanimace.

Aktuální animace:

```text
wink
scan
bob
ear movement
```

Interval:

```text
náhodně přibližně každých 5.5–10.5 sekundy
```

Respektuje:

```css
@media (prefers-reduced-motion: reduce)
```

Maskot je navržen tak, aby se v budoucnu mohl měnit podle runtime stavu:

```text
idle
loading model
generating
success
warning
offline
error
```

## 16. Testování provedené během dne

Testovací sada byla rozšířena o:

### UI

- dashboard render,
- navigation,
- Local AI navigation,
- model selector,
- modaly,
- toggles,
- responsive CSS,
- runtime telemetry.

### LLM client

- model discovery,
- chat payload,
- response parsing,
- HTTP failure,
- empty response,
- history sanitization,
- model activation.

### Backend

- health,
- hardware,
- models/catalog,
- chat validation,
- message sanitization,
- temperature clamp,
- maxTokens clamp,
- planner,
- benchmark,
- 404,
- llama failure → 502,
- runtime activate,
- local-only config.

### Runtime UI

- CPU data,
- GPU data,
- RAM usage,
- VRAM usage,
- Local Engine stav,
- manual refresh.

Relevantní testovací commity:

```text
9f027e1 🧪 test: backend API, planner a bezpečnost / test backend API planner and security
ab76c9f 🧪 test: LLM UI testy přes backend / route LLM UI tests through backend
8bf36c9 🧪 test: reálná backend telemetrie v UI / test real backend telemetry in UI
167cc4b 🧪 test: automatická aktivace a katalog modelů / test auto activation and model catalog
eca1d17 🧪 test: UI umí automaticky aktivovat model / test automatic model activation in UI
```

## 17. Aktuální architektura

```text
┌─────────────────────────────────────────────┐
│                Model Unbreak UI             │
│                  Vite :5173                 │
├─────────────────────────────────────────────┤
│ Dashboard │ Local AI │ Planner │ Security   │
└──────────────────────┬──────────────────────┘
                       │ /api
                       ▼
┌─────────────────────────────────────────────┐
│          Model Unbreak Backend :8787        │
│                 localhost only              │
├─────────────────────────────────────────────┤
│ health                                      │
│ hardware                                    │
│ catalog                                     │
│ planner                                     │
│ benchmark                                   │
│ runtime manager                             │
│ chat                                        │
└──────────────────────┬──────────────────────┘
                       │ managed runtime
                       ▼
┌─────────────────────────────────────────────┐
│               llama-server :8081            │
│                                             │
│ selected local GGUF                         │
│ GPU first → CPU fallback                    │
└─────────────────────────────────────────────┘
```

## 18. Aktuální spuštění

```powershell
cd C:\Users\Admin\local-Model-Unbreak

git fetch origin
git switch feat/dashboard-ui-ux
git pull origin feat/dashboard-ui-ux

npm install
npm run verify
npm run dev
```

Frontend:

```text
http://127.0.0.1:5173
```

Backend:

```text
http://127.0.0.1:8787
```

Managed llama runtime:

```text
http://127.0.0.1:8081
```

## 19. GitHub Actions / CI stav

GitHub Actions dnes opakovaně skončily před provedením prvního workflow kroku.

Pozorované hodnoty:

```text
runner_id: 0
runner_name: ""
steps: []
conclusion: failure
```

To znamená, že GitHub runner nebyl přidělen.

Proto červený stav vzdáleného workflow v této chvíli **není důkaz selhání TypeScriptu nebo testů**.

Současně však platí:

> Dokud není k dispozici úspěšný lokální `npm run verify` nebo funkční vzdálený runner, nesmí být test suite označována jako plně green.

PR zatím zůstává otevřený a nebyl sloučen do `main`.

## 20. Známé limity aktuálního dema

Aktuálně ještě není dokončeno:

- instalování llama.cpp automaticky za uživatele,
- přesné GGUF metadata čtené přímo z hlavičky,
- automatický výběr optimálního context size,
- skutečná tokenizer-based tokens/s telemetrie,
- persistence uživatelů,
- registrace,
- login,
- per-user model preferences,
- více současných lokálních runtime,
- vzdálené nodes,
- plná implementace Creeping Frost policy enforcement,
- reálný model inspector detail view,
- dlouhodobá historie chatů v DB,
- produkční packaging / EXE,
- finální accessibility audit,
- finální E2E testy v reálném browseru.

## 21. Další doporučené kroky

### P0 — před dalším rozšiřováním

1. Lokálně spustit `npm run verify`.
2. Opravit všechny type/test/build chyby.
3. Spustit `npm run dev`.
4. Ověřit reálný GGUF model.
5. Ověřit nalezení `llama-server`.
6. Ověřit GPU start.
7. Ověřit CPU fallback.
8. Ověřit chat po automatické aktivaci.

### P1 — první opravdu použitelný produktový flow

```text
Login
→ Dashboard
→ Models
→ Select model
→ auto start
→ Local AI
→ chat
```

### P2

- GGUF inspector,
- skutečný model metadata parser,
- hardware-aware planner,
- přesná benchmark telemetry,
- persistent user profiles,
- per-user last selected model,
- bezpečné session management.

## 22. Kompletní commit log dne

| Commit | Změna |
|---|---|
| `329d708` | 🎨 dashboard UI/UX |
| `a033340` | 🧪 UI + build testy |
| `c369f13` | 🤖 Local AI navigation |
| `34bdf63` | 🤖 Local LLM runtime |
| `7de3dfa` | 🎨 LLM styling |
| `49cf074` | 🔌 první llama.cpp proxy |
| `a69a872` | 🧪 Local LLM testy |
| `8294b09` | 🧪 Local AI navigation test |
| `20e3f72` | 🐛 Local AI load order fix |
| `608d1fe` | 🐛 strict TypeScript fetch fix |
| `60ef575` | 🛡️ local-only LLM proxy |
| `e04122e` | 🧪 local-only proxy test |
| `bdb739a` | 🧩 backend foundation |
| `69cbabd` | 🧩 backend foundation |
| `7e7fe70` | 🧩 backend foundation |
| `e9b2a16` | 🧩 backend foundation |
| `709b5e4` | ⚙️ backend API |
| `fcdbfc2` | ⚙️ backend API server |
| `d440c2d` | ⚙️ společný dev start |
| `e7c7326` | 🧩 backend v typechecku |
| `c458d72` | 🔌 UI → backend proxy |
| `c3be4d5` | 🤖 LLM UI přes backend |
| `9f027e1` | 🧪 backend/planner/security testy |
| `ab76c9f` | 🧪 LLM UI testy přes backend |
| `c0fe431` | 🖥️ reálný hardware dashboard |
| `2f51e4c` | 🖥️ real telemetry refresh |
| `8bf36c9` | 🧪 runtime telemetry UI test |
| `eceb067` | 📝 runnable demo docs |
| `1c44b53` | 🤖 GGUF discovery / auto launch |
| `1c4e105` | 🤖 managed runtime základ |
| `716d13e` | ⚙️ interní llama port |
| `b1b63eb` | 🤖 catalog + model activation API |
| `f9dc50a` | 🤖 backend spravuje llama-server |
| `64d206b` | 🤖 výběr modelu = auto start |
| `d4898f1` | 🐛 maxTokens payload fix |
| `af08bc2` | ⚡ benchmark auto-start model |
| `167cc4b` | 🧪 catalog + activation testy |
| `e9c5c25` | 🐛 llama process typing |
| `eca1d17` | 🧪 model activation UI test |
| `749f081` | 🧭 navigace napojena na funkce |
| `ed0a911` | 🧭 intuitivnější dashboard + mascot |
| `84562e0` | 🎨 GitHub-like dark motiv |
| `cf47dfa` | 🎨 aktivace nového dark UI |

## Poznámka k dokumentu

Tento soubor popisuje vývojový stav **na konci práce 2. 10. 2026**. Je to technický development log, nikoli release notes.

Při dalších změnách by měl být dokument doplňován po dnech, například:

```text
## 2026-10-03
## 2026-10-04
...
```

Tím zůstane dohledatelné nejen **co** bylo implementováno, ale také **proč**, v jakém pořadí a s jakými omezeními.
