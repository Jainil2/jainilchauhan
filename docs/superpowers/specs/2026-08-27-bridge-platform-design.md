# Bridge — learning platform design

Status: approved 2026-08-27. Phases 0 and 1 shipped; Phase 2 next.

## Why

This repo is a personal portfolio carrying an unusually large side-artifact: 93 interactive CS labs at `/lab` — 60 algorithms, 16 data structures, 16 distributed systems, 4 security, and **zero AI/ML**. Each lab has a playable component plus concept, complexity, reference code, pitfalls, production usage, and references. The content is good. Its packaging is a portfolio feature, and portfolio features don't earn traffic.

The goal is a standalone learning platform that earns organic search traffic, is genuinely not already built, and preserves every hour invested in the existing labs.

## The wedge

Every learning platform manufactures FOMO. roadmap.sh is a wall of things you don't know. NeetCode is 150 problems staring at you. ByteByteGo is a firehose. That anxiety _is_ their engagement model.

This one inverts it: **you already know more than you think; here are the next three things, and only three.**

That fuses with the old↔new bridge. For a backend engineer anxious about AI, an LLM **KV-cache is an LRU cache**, continuous batching is a queue plus a scheduler, RAG retrieval is an inverted index plus ANN search. The framing converts "I'm behind on AI" into "I already know 70% of this."

Confidence comes from passing tests on a thing you were scared of. So the engine is **implement-it-yourself**: solve a challenge, tests pass, and _that is your placement_ — no quiz. The bridge map is the navigation layer over what you have actually proven.

## Decisions

| Decision          | Choice                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------- |
| Success metric    | Traffic first; GitHub stars deferred to year two                                       |
| Identity          | Separate brand + domain; placeholder until launch                                      |
| Launch audience   | Backend/infra engineers crossing into AI. "Everyone" is the _value_, not the v1 target |
| Core mechanic     | Implement-it-yourself challenges; placement and bridge map derive from the solved set  |
| AI scope          | AI systems/infra first; ML fundamentals later                                          |
| Challenge runtime | JavaScript in a Web Worker. Python via Pyodide only when fundamentals land             |
| Accounts          | localStorage only; data shaped so accounts drop in later                               |
| Migration         | `/lab/*` moves to the new domain; 301 from `jainilchauhan.com/lab/*`                   |
| Repo topology     | One repo, two Cloudflare Worker environments                                           |
| v1 shape          | ~20 existing labs get challenges, ~15 new AI-systems labs, bridge map between them     |

## Product rules

These are the product. Violating one removes the reason this exists.

1. **Never show more than 3 next steps.** No catalog-wide progress bar, no "12% complete" against 200 labs.
2. **Every AI lab opens with what you already know.** The `sameness` line renders before any new material.
3. **Nothing is gated.** Full content is readable without solving anything; pages stay crawlable.
4. **"I already know this" is one click.** If marking known costs more than solving, placement never happens.

## Architecture

### Content / component split

The old `src/lib/labRegistry.ts` was 7,629 lines mixing component imports, metadata, and prose — and it eagerly imported all 93 lab components. Because `CommandPalette` and `TerminalShell` also imported it, **the portfolio homepage shipped every lab component on the site.** Core Web Vitals is a ranking signal, so this directly fought the traffic goal.

Now:

- `src/content/types.ts` — `LabMeta`, `Challenge`, `Bridge`, `LabCategory`, `LAB_CATEGORIES`.
- `src/content/labs/<slug>.ts` — one file per lab, pure data, no React imports.
- `src/content/labs/index.ts` — non-eager `import.meta.glob` for full content, keyed by slug. Only a detail page pays for prose, and only for the lab being read.
- `src/content/labs.gen.ts` — generated summary index (slug, title, category, difficulty, readingTimeMin, blurb). ~21KB versus ~340KB of full content. This is what list pages and the ⌘K palette import.
- `src/components/system-design/registry.ts` — slug → `lazy(() => import(...))`. Resolved only on `/lab/$slug`.

Keeping metadata free of React imports is what makes Node build scripts possible: sitemap generation, bridge-graph validation, and later a static search index.

### Challenge engine (Phase 1)

`LabEntry.challenge` holds prompt, starter, tests, reference, and progressive hints.

**JavaScript only, no transpile step** — types live in the JSDoc signature, which removes any need for `esbuild-wasm` or `sucrase` in the browser. If TypeScript is ever demanded, add `esbuild-wasm` behind a lazy import; do not build for it now.

`src/lib/challenge/runner.ts` builds a Blob-URL Worker holding the visitor's code plus a small assert harness, and calls `worker.terminate()` on a 3s timeout so an infinite loop cannot hang the tab. CodeMirror 6 loads lazily on the challenge panel only.

### Progress and placement

`src/lib/useKnowledge.ts` follows the existing `useLabProgress.ts` pattern exactly — default state on the server, load in an effect, `hydrated` flag, try/catch around every localStorage access. Shape:

```ts
{ solved: Set<slug>, known: Set<slug>, attempted: Set<slug> }   // key: "knowledge-v1"
```

`known ∪ solved` is the placement. Flat and serializable so a future Supabase row is a straight upsert.

### Bridge map

```ts
bridgesFrom?: { slug: string; sameness: string; delta: string }[]
```

"Next 3" = AI labs whose `bridgesFrom` slugs are fully covered by `known ∪ solved`, ranked by fewest unmet prerequisites, sliced to 3. Plain array filtering — no graph library. When nothing qualifies, show the 3 cheapest prerequisites framed as "start here", never as a list of what's missing.

`scripts/generate-content.mjs` fails the build on a dangling or self-referential bridge.

### Deployment

One repo, two wrangler environments sharing `src/`, selected by `VITE_SITE` at build time and read through `src/lib/site.ts`. Because the constant folds at build time, each build dead-code-eliminates the other product.

All portfolio chrome stays portfolio-only: `PortfolioHUD`, `ChaosOverlay`, `MobileShellFab`, **and `TerminalShell`**. The terminal was initially planned to carry over, but its command set is a bio shell — `whoami`, `cat about.md`, `resume`, `cd` between portfolio sections — with lab listing as a single `ls /lab`. That is portfolio personality, not lab navigation, so shipping it on the platform would be noise. Platform navigation is the Phase 4 bridge map; until then `/lab`'s category filters carry it, which is adequate for 93 labs.

`/projects/$slug` and `/writing/$slug` throw `notFound()` on the platform build. The route tree is shared, so without that guard the platform domain would serve the portfolio's pages — duplicate content Google would have to pick a winner for, on the wrong product.

`scripts/generate-content.mjs` derives the sitemap host from the build target and warns when a delta build has no `SITE_URL`, since both builds write the same `public/sitemap.xml`.

The design system is shared unchanged.

## Phases

Sized against ~250 hrs (5-10 hrs/week over six months). Each phase ships independently.

- **Phase 0 — Foundation (~45 hrs).** Content split, lazy components, generated sitemap and summary index, dead-code removal, second wrangler environment.
- **Phase 1 — Challenge engine (~55 hrs).** Runner, panel, `useKnowledge`, wiring into the lab detail page.
- **Phase 2 — 20 bridge-source challenges (~45 hrs).** `lru-cache`, `hash-table`, `bloom-filter`, `trie`, `heap-priority-queue`, `quickselect`, `skip-list`, `quadtree`, `btree-index`, `sparse-matrix`, `bitset`, `huffman-coding`, `message-queue`, `backpressure`, `rate-limiter`, `load-balancer`, `circuit-breaker`, `sharding-replication`, `levenshtein`, `topological-sort`.
- **Phase 3 — 15 AI-systems labs (~65 hrs).** Table below.
- **Phase 4 — Bridge map UI (~25 hrs).** The "next 3" surface; the 3-item cap enforced in the component, not by convention.
- **Phase 5 — Launch (~25 hrs).** Name, domain, canonical URLs, 301s, structured data, OG images, launch post.

This sums to ~260 hrs against ~250. If it runs long the cut line is Phase 3 — ship 12 AI labs instead of 15. Do not cut Phase 4; without the bridge map this is just another lab site.

### Phase 3 labs and their bridges

| AI lab                              | Bridges from                          |
| ----------------------------------- | ------------------------------------- |
| Tokenization / BPE                  | `trie`, `huffman-coding`              |
| Embeddings & vector space           | `sparse-matrix`, `hash-table`         |
| ANN search / HNSW                   | `skip-list`, `quadtree`               |
| Vector index: recall vs latency     | `btree-index`, `bloom-filter`         |
| KV cache (LLM inference)            | `lru-cache`                           |
| Continuous batching                 | `message-queue`, `backpressure`       |
| Attention as a lookup table         | `hash-table`, `sparse-matrix`         |
| Speculative decoding                | `branch-and-bound`                    |
| Quantization                        | `bitset`, `huffman-coding`            |
| RAG retrieval pipeline              | `btree-index`, `bloom-filter`         |
| Reranking                           | `heap-priority-queue`, `quickselect`  |
| Semantic cache                      | `lru-cache`, `consistent-hashing`     |
| Agent loop & tool use               | `topological-sort`, `circuit-breaker` |
| Prompt injection & trust boundaries | `jwt-anatomy`, `cors-lab`             |
| Inference cost & latency budgets    | `rate-limiter`, `load-balancer`       |

## Out of scope for v1

Accounts, ML fundamentals, Pyodide, open-sourcing, comments, monetization, mobile app, video, AI-generated hints, spaced repetition. Each is a v2 conversation once traffic data exists.
