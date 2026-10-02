# Free LLM API Directory & Ranking

> **Source:** [github.com/tashfeenahmed/freellmapi](https://github.com/tashfeenahmed/freellmapi)
> 18 providers · 161 free models · ~1.7B tokens per month aggregated
> Generated: 2026-09-03

---

## Table of Contents

1. [README & How to Read](#readme--how-to-read)
2. [Provider Rankings (18 providers × 10 domains)](#provider-rankings)
3. [Provider Details (rate limits, model counts)](#provider-details)
4. [Open Source / Open Weight Models (28 models)](#open-source--open-weight-models)
5. [Anonymous / No-Signup Access (7 providers)](#anonymous--no-signup-access)
6. [Best Picks — 'use this when...'](#best-picks)
7. [Scoring Legend](#scoring-legend)
8. [Sources](#sources)

---

## README & How to Read

### Workbook Structure


| Sheet | Purpose |
| --- | --- |
| **Provider_Rankings** | All 18 providers ranked across 10 domains. Composite + per-domain scores are LIVE formulas — flip a raw score in column C–K and the rankings update. |
| **Provider_Details** | Raw rate limits, model counts, and access info per provider. All numbers hardcoded as inputs. |
| **Open_Source_Models** | Open-source / open-weight LLM weights (Llama, Qwen, DeepSeek, etc.) with context, license, and where to run them free. |
| **Anonymous_Access** | Detail sheet for the 7 providers that work without any signup or API key. |
| **Best_Picks** | "Use this when…" quick reference — fastest way to pick a provider for a given job. |

### How to Read the Workbook

- 🔵 **Blue numbers** = hardcoded input (the assumptions)
- ⚫ **Black numbers** = derived from formulas (composite scores, ranks)
- 🟢 **Green numbers** = cross-sheet references (e.g. domain scores that pull from Provider_Details)
- **Conditional formatting** on Provider_Rankings highlights the top scorer per domain
- **Edit a raw score** in column C–K of Provider_Rankings → hit recalc → every rank and composite re-evaluates

---

## Provider Rankings

> All 18 providers ranked across 10 domains. Raw scores (0–10) are inputs; composite score (0–100) and ranks are formulas. Higher = better. Last updated: **July 2026**.


| Rank | Provider | Speed (TPS) | Daily Volume (RPD/tokens) | Long Context (max tokens) | Model Selection (count) | Multimodal (vision/audio) | Production Reliability | OpenAI Compat | Cost Efficiency (free) | Anonymous Access | No Credit Card | Composite (0–100) | Best For |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | Google AI Studio | 7 | 8 | 10 | 6 | 10 | 10 | 8 | 8 | 0 | 10 | 77 | Long context, multimodal |
| 2 | Groq | 10 | 9 | 7 | 7 | 8 | 9 | 10 | 9 | 0 | 10 | 79 | Speed, real-time |
| 1 | Cerebras | 10 | 10 | 10 | 6 | 6 | 8 | 10 | 10 | 0 | 10 | 80 | Throughput, long context |
| 4 | Mistral | 7 | 9 | 8 | 5 | 7 | 9 | 10 | 10 | 0 | 10 | 75 | High token volume, EU |
| 5 | OpenRouter | 6 | 4 | 10 | 9 | 8 | 9 | 10 | 7 | 0 | 10 | 73 | One key, many models |
| 7 | Cloudflare Workers AI | 7 | 8 | 6 | 10 | 7 | 8 | 5 | 9 | 0 | 10 | 70 | Edge, model variety |
| 6 | GitHub Models | 5 | 3 | 7 | 9 | 10 | 9 | 10 | 8 | 0 | 10 | 71 | Frontier models, dev |
| 18 | Cohere | 4 | 2 | 7 | 3 | 5 | 7 | 5 | 5 | 0 | 10 | 48 | RAG (non-commercial) |
| 16 | HuggingFace | 5 | 2 | 7 | 10 | 7 | 6 | 5 | 4 | 0 | 10 | 56 | OSS experimentation |
| 11 | NVIDIA NIM | 7 | 5 | 7 | 10 | 8 | 4 | 5 | 6 | 0 | 10 | 62 | Eval, model variety |
| 14 | Z.ai (Zhipu) | 6 | 3 | 7 | 3 | 6 | 5 | 10 | 7 | 0 | 10 | 57 | Research, GLM family |
| 10 | Ollama Cloud | 6 | 4 | 7 | 4 | 5 | 6 | 10 | 5 | 6 | 10 | 63 | Cloud-free self-hosting |
| 14 | Pollinations | 3 | 1 | 5 | 4 | 3 | 2 | 10 | 9 | 10 | 10 | 57 | Quick test, no signup |
| 9 | LLM7 | 5 | 3 | 6 | 4 | 3 | 5 | 10 | 9 | 9 | 10 | 64 | Anonymous w/ decent vol |
| 8 | OVH AI Endpoints | 4 | 1 | 6 | 8 | 5 | 5 | 10 | 8 | 10 | 10 | 67 | Anonymous w/ big models |
| 13 | Kilo Gateway | 4 | 2 | 5 | 3 | 3 | 4 | 10 | 8 | 10 | 10 | 59 | Quick test, :free routes |
| 12 | OpenCode Zen | 5 | 2 | 6 | 3 | 3 | 4 | 10 | 8 | 10 | 10 | 61 | Promo access, coding |
| 17 | AI Horde | 2 | 1 | 1 | 5 | 2 | 1 | 10 | 9 | 10 | 10 | 51 | Crowd, low priority |

### Scoring Legend


| Score | Interpretation |
| --- | --- |
| 0–2 | Severe limitation (no signup, very low cap, broken) |
| 3–4 | Usable for testing only |
| 5–6 | Solid for prototyping |
| 7–8 | Production-grade for small/medium apps |
| 9–10 | Best-in-class for that domain |

---

## Provider Details

> Raw rate limits, model counts, and access info per provider.


| Provider | RPM | RPD | TPM | Daily Token Cap | Max Context | Free Models | Best Model | Card Req. | Anonym. | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Google AI Studio | 15 | 1,500 | 250K | 1.5M | 1M | 8 | Gemini 2.5 Flash | No | No | Production | Generous free tier reduced in late-2025. Data used for training outside EU/UK/EEA. |
| Groq | 30 | 14,400 | 30K |  | 131,072 | 10 | Llama 3.3 70B | No | No | Production | Ultra-fast LPU. ~320 TPS on Llama 3.3 70B. Llama 4 Scout 1000 RPD. |
| Cerebras | 30 | 14,400 | 500K | 1M | 1M | 6 | Qwen3 235B (22B active) | No | No | Production | 1M tokens/day cap. 30 RPM. Wafer-scale chips. |
| Mistral | 20 | 1K |  | 1B | 256K | 4 | Mistral Large 3 | No | No | Production | ~1B tokens/month on Experiment tier. Codestral, Devstral also free. |
| OpenRouter | 20 | 50 |  |  | 1M | 25 | Qwen3 Coder 480B | No | No | Production | 1K RPD with one-time $10 top-up. 25+ free models. |
| Cloudflare Workers AI | 300 | 10K |  | 10K | 131K | 49 | Llama 3.3 70B | No | No | Production | 10K neurons/day (1 neuron ≈ 1 output token). 50+ models on free tier. |
| GitHub Models | 15 | 150 |  |  | 200K | 45 | GPT-4o | No | No | Production | Free for all GitHub users. Frontier model access (GPT-4o, Claude, Llama, Phi). |
| Cohere | 20 | 100 |  | 1K | 128K | 2 | Command R+ | No | No | Trial | Trial tier only, non-commercial use. |
| HuggingFace | 10 | 100 |  | 100K | 200K | 200 | DeepSeek V3 / Llama | No | No | Stable | $0.10/mo credits (free); $2/mo (PRO). Serverless routes to 200+ models. |
| NVIDIA NIM | 40 | 1K |  |  | 128K | 100 | Nemotron / Llama 3.3 | No | No | Eval only | Evaluation-only ToS — not for production backends. |
| Z.ai (Zhipu) | 5 | 100 |  |  | 200K | 3 | GLM-4.5 / 4.7 Flash | No | No | Research | GLM-4.5/4.7 Flash free, non-commercial carve-out. 1 concurrent request. |
| Ollama Cloud | 5 | 200 |  |  | 262K | 6 | gpt-oss 120B | No | Yes | Stable | Session limits reset every 5h, weekly every 7d. 1 concurrent. |
| Pollinations | 4 |  |  |  | 128K | 8 | GPT-OSS 20B | No | Yes | Best-effort | 1 request / 15s anonymous, 1/5s seed, 1/3s flower. No signup required. |
| LLM7 | 30 | 100 |  | 1M | 128K | 8 | GPT-OSS / Llama 3.1 | No | Yes | Stable | Anonymous 10/min, free token 40/min + 1M tokens/24h. |
| OVH AI Endpoints | 2 |  |  |  | 128K | 40 | Qwen3.5 397B | No | Yes | Beta | 2 req/min anonymous per IP per model. 400 req/min authenticated. |
| Kilo Gateway | 4 | 200 |  |  | 128K | 5 | Various :free routes | No | Yes | Best-effort | 200 req/hr per IP anonymous. :free routes quality varies. |
| OpenCode Zen | 5 | 200 |  |  | 128K | 6 | DeepSeek V4 Flash | No | Yes | Promo | Promo anonymous access to DeepSeek V4 Flash + Nemotron. |
| AI Horde | 1 |  |  |  | 4,096 | 20 | Community Llama / Gemma | No | Yes | Community | Crowd-sourced volunteer GPUs. Anonymous key `0000000000`, lowest priority. |

---

## Open Source / Open Weight Models

> **Open Weight** = trained weights downloadable (training data/code often proprietary).  
> **Open Source** = weights + code + data + training pipeline, all under a permissive license. Most "open" LLMs today are actually open weight.


| Model | Family | Params (Total) | Params (Active) | Context | License | Type | Best For | Free Hosting |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Llama 4 Scout | Llama 4 | 109B | 17B | 10M | Llama 4 Community | Open Weight | Ultra-long context, agentic | Ollama, Groq, Cerebras, Cloudflare |
| Llama 4 Maverick | Llama 4 | 400B | 17B | 1M | Llama 4 Community | Open Weight | Frontier agentic | Ollama, Groq |
| Llama 3.3 70B | Llama 3 | 70B | 70B | 128K | Llama 3.3 | Open Weight | High quality chat | Groq, Cerebras, OpenRouter |
| Llama 3.1 405B | Llama 3 | 405B | 405B | 128K | Llama 3.1 | Open Weight | Frontier dense LLM | OpenRouter (via providers) |
| Qwen3 235B-A22B | Qwen 3 | 235B | 22B | 128K | Apache 2.0 | Open Weight | Multilingual, reasoning | Cerebras, OpenRouter, Groq |
| Qwen3 VL 235B A22B | Qwen 3 | 235B | 22B | 256K | Apache 2.0 | Open Weight | Vision + agentic GUI | Fireworks, OpenRouter |
| Qwen3 Coder 480B | Qwen 3 | 480B | 35B | 256K | Apache 2.0 | Open Weight | Code generation | OpenRouter, Cerebras, Ollama |
| Qwen3 32B | Qwen 3 | 32B | 32B | 128K | Apache 2.0 | Open Weight | Agent + tool calling | Groq, OpenRouter, self-host |
| DeepSeek V3 | DeepSeek | 671B | 37B | 128K | DeepSeek License | Open Weight | Reasoning, MoE | HF, OpenRouter, self-host |
| DeepSeek R1 | DeepSeek | 671B | 37B | 128K | MIT | Open Source | Step-by-step reasoning | HF, OpenRouter, self-host |
| DeepSeek V3.1 | DeepSeek | 671B | 37B | 128K | DeepSeek License | Open Weight | Hybrid reasoning + chat | HF, OpenRouter, self-host |
| DeepSeek V4 Pro | DeepSeek | 1600B | 49B | 1M | DeepSeek License | Open Weight | Frontier MoE, 1M context | Ollama Cloud, OpenRouter |
| DeepSeek V4 Flash | DeepSeek | 284B | 13B | 1M | DeepSeek License | Open Weight | Fast frontier MoE | Ollama Cloud, OpenCode Zen |
| Mistral Large 3 | Mistral | 675B | 123B | 256K | MRL (research) | Open Weight | General, multimodal | Mistral API, self-host |
| Mixtral 8x22B | Mistral | 141B | 44B | 64K | Apache 2.0 | Open Weight | Reasoning, multilingual | self-host (vLLM/TGI) |
| Mistral Small 3.1 24B | Mistral | 24B | 24B | 128K | Apache 2.0 | Open Weight | Function calling, vision | Mistral API, Cloudflare, GitHub |
| Gemma 3 27B | Gemma | 27B | 27B | 128K | Gemma License | Open Weight | Local agentic, vision | Google AI Studio, HF, Ollama |
| GLM-4.5 | GLM/Zhipu | 355B | 32B | 128K | Zhipu custom | Open Weight | Agentic, reasoning, coding | Z.ai, HF, ModelScope, vLLM |
| GLM-4.6V | GLM/Zhipu |  |  | 128K | Zhipu custom | Open Weight | Vision + GUI agents | Z.ai, HF |
| GLM-4.7 Flash | GLM/Zhipu |  |  | 200K | Zhipu custom | Open Weight | Reasoning on/off switch | Z.ai free tier, Cloudflare |
| Kimi K2 1T | Moonshot | 1000B | 32B | 262K | Modified MIT | Open Weight | Long-doc reasoning, agentic | Ollama Cloud, Cloudflare, HF |
| Command R+ 104B | Cohere | 104B | 16B | 128K | CC-BY-NC 4.0 | Open Weight | RAG, tool use, multilingual | Cohere, self-host |
| Phi-4 14B | Microsoft | 14B | 14B | 16K | MIT | Open Source | Small / efficient | Ollama, HF, self-host |
| OLMo 2 32B | OLMo / AI2 | 32B | 32B | 4K | Apache 2.0 | Open Source | Fully open research model | HF, self-host |
| StarCoder 2 7B | BigCode | 7B | 7B | 16K | Apache 2.0 | Open Source | Code (truly open) | HF, self-host |
| GPT-OSS 120B | OpenAI | 117B | 5.1B | 128K | Apache 2.0 | Open Weight | Reasoning, agentic | Groq, Cerebras, OpenRouter, Pollinations, LLM7 |
| GPT-OSS 20B | OpenAI | 21B | 3.6B | 128K | Apache 2.0 | Open Weight | Lightweight reasoning | Pollinations, Groq, OVH, LLM7 |
| Nemotron Super 49B | NVIDIA | 49B | 49B | 128K | NVIDIA Open | Open Weight | Reasoning + tools | NVIDIA NIM, OpenCode Zen |

### Summary


| Metric | Value |
| --- | --- |
| Models listed | 28 |
| Truly open source (not just open weight) | 4 |
| Largest context window | 10,000,000 (Llama 4 Scout) |

---

## Anonymous / No-Signup Access

> The only providers that work with **zero account**. Quality + uptime bounce around, but they all really do work keyless.


| Provider | Anon RPM | Anon RPD | Anon Daily Tokens | Signup Required | Best For | Available Models |
| --- | --- | --- | --- | --- | --- | --- |
| Provider | Anon RPM | Anon RPD | Anon Daily Tokens | Signup Required | Best For | Available Models |
| Pollinations | 4 |  |  | No | 1 request / 15s anonymous, 1/5s seed, 1/3s flower. No signup required. | GPT-OSS 20B, Llama, Mistral, Qwen, image/audio/video |
| LLM7 | 10 | 60 | 500K | No (token free at dash.llm7.io) | Anonymous 10/min, free token 40/min + 1M tokens/24h. | GPT-OSS, Llama 3.1, GLM, DeepSeek quantized |
| OVH AI Endpoints | 2 |  |  | No | 2 req/min anonymous per IP per model. 400 req/min authenticated. | Qwen3.5 397B, GPT-OSS, Llama 3.3, CodeLlama, Mistral |
| Kilo Gateway | 4 | 200 |  | No | 200 req/hr per IP anonymous. :free routes quality varies. | :free routes (provider-pooled) |
| OpenCode Zen | 5 | 200 |  | No | Promo anonymous access to DeepSeek V4 Flash + Nemotron. | DeepSeek V4 Flash, Nemotron (promo) |
| Ollama Cloud |  |  |  | Account (no card) | Session limits reset every 5h, weekly every 7d. 1 concurrent. | GLM-4.7, Kimi K2, gpt-oss, Qwen3, DeepSeek |
| AI Horde | 1 |  |  | No (anon key 0000000000) | Crowd-sourced volunteer GPUs. Anonymous key `0000000000`, lowest priority. | Community Llama, Gemma, Cydonia (low priority) |

---

## Best Picks — "use this when…"


| If you need… | Pick | Why |
| --- | --- | --- |
| Highest rate limits | Groq, Cerebras | 30 RPM + 14.4K RPD on flagship models. Both are production-grade. |
| Largest model selection | Cloudflare, OpenRouter | Cloudflare has 49+ free models; OpenRouter has 25+ free routes. |
| Strongest proprietary models | GitHub Models, Google | GPT-4o, Claude 3.5, Gemini 2.5 Pro for free via GitHub/AI Studio. |
| Fastest inference | Groq, Cerebras | Both optimized for speed — ~300+ TPS on 70B-class models. |
| Largest token budget | Mistral (Experiment) | ~1B tokens / month on Mistral's free experiment tier. |
| Longest context | Google, Cerebras | Both reach 1M tokens context on free tier. |
| European provider | Mistral, LLM7 | Mistral (EU), LLM7 (UK) — both GDPR-friendly. |
| No signup required | Pollinations, LLM7, OVH, Kilo, OpenCode Zen | Truly keyless — pass prompt, get answer. |
| Best for coding | Cerebras, Groq, Mistral | Qwen3 Coder 480B on Cerebras, Qwen3 32B on Groq, Codestral on Mistral. |
| Best for RAG / long docs | Google, Cerebras, NVIDIA | 1M context on Gemini / Cerebras, 128K on NVIDIA NIM catalog. |
| Best anonymous (text) | Pollinations | 1/15s anon, no signup, fully open access. |
| Best anonymous (volume) | LLM7 | Anonymous 10/min + 500K tokens/day without signup. |
| Most production-grade | Google, Groq, OpenRouter | All three operate at frontier scale with consistent SLAs. |
| Best for self-hosting | Ollama | Free, MIT-licensed runtime. Run Llama, Qwen, DeepSeek, Mistral locally. |
| Best truly-open weights | OLMo 2, StarCoder 2 | Full open source (weights + code + data), not just open weights. |

---

## Sources

- [tashfeenahmed/freellmapi](https://github.com/tashfeenahmed/freellmapi) — primary directory of providers
- [cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources) — per-model rate limits (community-maintained)
- [mnfst/awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis) — open dataset of free providers
- Provider documentation pages (linked in Provider_Details)
- freellm.net, wotai.co/blog/best-free-llm-apis — 2025/2026 cross-checks

---

*Markdown extraction of `5edf1a16__2705b654-5c6f-414a-a37a-f34b81868276.xlsx` · 6 sheets · 5 data tables · 28 open-source models.*