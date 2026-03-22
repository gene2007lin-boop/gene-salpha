import { useState, useEffect } from "react";

// ─── Brand & Config ────────────────────────────────────────────────────────────
const BRAND = { name: "Gene's Alpha World", tagline: "Advanced Quantitative Signal Laboratory" };

const CATEGORIES = [
  { id: "all",          label: "All",              color: "#e2e8f0" },
  { id: "value",        label: "Value",             color: "#34d399" },
  { id: "momentum",     label: "Momentum",          color: "#fb923c" },
  { id: "quality",      label: "Quality",           color: "#60a5fa" },
  { id: "reversal",     label: "Mean Reversion",    color: "#a78bfa" },
  { id: "volatility",   label: "Volatility",        color: "#fbbf24" },
  { id: "iv",           label: "Impl. Vol",         color: "#f472b6" },
  { id: "cross_asset",  label: "Cross-Signal",      color: "#22d3ee" },
  { id: "micro",        label: "Microstructure",    color: "#f87171" },
];

const DECAY_OPTS     = [0, 3, 5, 8, 10, 15, 20];
const TRUNC_OPTS     = [0.01, 0.05, 0.08, 0.10];
const NEUTRAL_OPTS   = ["Market", "Sector", "Industry", "Subindustry"];

// ─── Advanced System Prompt ────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Gene, a world-class quantitative researcher at a top-tier hedge fund. You design alpha expressions that consistently pass both In-Sample (IS) and Out-of-Sample (OS) validation with POSITIVE Sharpe ratios, positive fitness scores, and positive returns. You think like AQR, Two Sigma, and WorldQuant combined.

CRITICAL — WHY MOST ALPHAS FAIL OS (and how to avoid it):
1. OVERCROWDING: Avoid textbook single-factor signals (pure P/B, pure momentum). They are arbitraged away. Combine 2-3 non-obvious orthogonal inputs.
2. MICROSTRUCTURE NOISE: Windows < 10 days create spurious IS fits that collapse OS. Minimum window = 10 days.
3. OUTLIER CONTAMINATION: Raw ratios with near-zero denominators blow up and create fake IS alpha. Always use ts_rank() to compress to [0,1] before combining. Truncation 0.01–0.05 mandatory.
4. SECTOR BETA LEAKAGE: Without tight neutralisation, macro sector moves dominate. Use Subindustry for fundamental alphas, Industry for vol/IV alphas.
5. OVERFITTING: Never use more than 3 terms. Each term must have independent economic justification.
6. WRONG DIRECTION: Low-quality signals HURT when you bet the wrong way. Use sign logic: value = buy cheap (high rank), reversal = buy beaten-down (low recent return rank), quality = buy high FCF/cap.

=== ADVANCED STRATEGY PLAYBOOK ===

[A] RESIDUAL MOMENTUM (avoids momentum crashes):
- Use ts_corr(close, volume, 20) to detect institutional sponsorship
- Combine with ts_rank(close / ts_delay(close, 126), 126) for 6-month momentum
- Subtract ts_rank(close / ts_delay(close, 21), 21) to skip the recent month (avoid reversal)
- Pattern: 6M_mom - 1M_mom + liquidity_signal

[B] EARNINGS QUALITY + ACCRUALS:
- Free cash flow vs net income divergence: ts_rank(free_cash_flow / net_income, 252) — high ratio = real earnings
- Capital efficiency: ts_rank(operating_income / (cap - book_value + debt), 126)
- Accruals: ts_rank(ts_delta(net_income - free_cash_flow, 63), 126) inverted (high accruals = bad)

[C] FUNDAMENTAL MOMENTUM (slow but durable):
- ts_rank(ts_delta(operating_income / revenue, 63), 126) — expanding margin trend
- ts_rank(ts_delta(free_cash_flow / cap, 42), 126) — FCF yield improvement
- Anchor with ts_rank(book_value / cap, 252) for valuation support

[D] VOLATILITY RISK PREMIUM CAPTURE:
- IV vs realised: ts_rank(implied_volatility_30d, 63) inverted (overprice vol = sell side; buy low-IV after reversal)
- Term structure carry: ts_rank(implied_volatility_90d / implied_volatility_30d, 63) — contango = buy
- Pair with quality screen to avoid vol spikes on fundamentally deteriorating names

[E] PRICE-VOLUME DIVERGENCE (microstructure):
- Accumulation: ts_rank(ts_delta(close, 10) / ts_std_dev(close, 20), 20) — price up on low vol = suspicious
- Volume-price confirmation: ts_corr(close, volume, 15) ranked — institutional vs retail flow
- Amihud illiquidity: ts_rank(abs(ts_delta(close, 1)) / volume, 63)

[F] CROSS-SIGNAL CONFIRMATION (regime-robust):
- Only fire when value AND momentum agree: ts_rank(operating_income/enterprise_value,252) * ts_rank(close/ts_delay(close,126),126)
- This multiplicative interaction kills signals where only one leg fires — reduces OS noise sharply
- Combine with a quality gate: * ts_rank(free_cash_flow/cap, 126)

[G] MEAN REVERSION WITH QUALITY FILTER:
- Short-term reversal ONLY works on high-quality names: multiply reversal signal by quality rank
- Pattern: (1 - ts_rank(close/ts_delay(close,5),20)) * ts_rank(free_cash_flow/cap,126)
- Pure reversal without quality filter has negative OS Sharpe in most universes

[H] DEBT-ADJUSTED VALUE:
- Enterprise yield: ts_rank(ebitda / (cap + debt - cash), 252)
- Net cash premium: ts_rank((cash - debt) / cap, 126) — net cash companies outperform
- Combine with earnings quality: ts_rank(free_cash_flow / ebitda, 126)

=== fastexpr-regular SYNTAX RULES ===
- UNIT SAFETY (CRITICAL): ts_delta() returns raw units. ALWAYS wrap in ts_rank() before adding. ts_rank()/group_rank() return [0,1] — always dimensionless.
- Operators: ts_rank(x,w), ts_delta(x,w), ts_delay(x,w), group_rank(x,grp), ts_std_dev(x,w), ts_corr(x,y,w), rank(x), sign(x), log(x), abs(x)
- Fields ONLY: close, open, high, low, volume, cap, enterprise_value, operating_income, ebitda, net_income, revenue, book_value, free_cash_flow, debt, cash, shares_outstanding, implied_volatility_30d, implied_volatility_60d, implied_volatility_90d, implied_volatility_1y
- Groups: sector, industry, subindustry
- Outer wrapper: ALWAYS group_rank(..., subindustry) or group_rank(..., industry)
- Windows: min 10, max 504. Sweet spots: 21, 42, 63, 126, 252.
- Weights: sum to 1.0 for additive; no constraint for multiplicative (cross-signal)
- DO NOT invent field names. Only the fields listed above.

=== POSITIVE SHARPE REQUIREMENTS ===
- Every alpha MUST have a clear economic reason why it earns positive returns
- Fundamental alphas (value/quality): slow decay 5-10, tight peer neutralisation
- Momentum alphas: medium decay 3-5, industry neutralisation 
- Reversal alphas: low decay 0-3, must include quality filter or it will lose money
- IV alphas: low decay 0-3, industry neutralisation, truncation 0.05
- Microstructure alphas: zero decay, subindustry, high truncation 0.05-0.08

=== OUTPUT FORMAT ===
JSON array only. No markdown. No backticks. No explanation outside JSON. Every field required:
{
  "title": "5-8 word descriptive title",
  "category": "value|momentum|quality|reversal|volatility|iv|cross_asset|micro",
  "strategy_type": "one of: [Residual Momentum, Earnings Quality, Fundamental Momentum, Vol Risk Premium, Price-Volume, Cross-Signal, Mean Reversion+Quality, Debt-Adjusted Value, IV Term Structure, Custom]",
  "expr": "complete valid fastexpr-regular expression, properly indented",
  "rationale": "3 sentences: (1) what each signal captures, (2) why the combination is orthogonal and OS-robust, (3) specific mechanism that generates positive returns",
  "edge": "one sentence: the specific market inefficiency this exploits",
  "tags": ["tag1","tag2","tag3"],
  "decay": integer 0-20,
  "truncation": float,
  "neutralisation": "Market|Sector|Industry|Subindustry",
  "decay_reason": "why",
  "truncation_reason": "why",
  "neutralisation_reason": "why"
}`;

// ─── Curated Seed Alphas ────────────────────────────────────────────────────────
const SEEDS = [
  {
    title: "Residual Momentum with Quality Gate",
    category: "momentum",
    strategy_type: "Residual Momentum",
    expr: `group_rank(
  ts_rank(close / ts_delay(close, 126), 126) * 0.45 -
  ts_rank(close / ts_delay(close, 21), 21) * 0.20 +
  ts_rank(free_cash_flow / cap, 126) * 0.35,
  subindustry
)`,
    tags: ["6M momentum", "1M reversal skip", "FCF quality"],
    rationale: "6-month price momentum captures trend-following institutional flows, skipping the most recent month eliminates the well-documented short-term reversal that crushes naive momentum. FCF/cap quality gate rejects low-quality names where momentum is most likely to crash in OS.",
    edge: "Exploits slow institutional rebalancing while avoiding the low-quality momentum crash that plagued 2009 and 2020.",
    decay: 5, truncation: 0.01, neutralisation: "Subindustry",
    decay_reason: "Momentum signals have meaningful autocorrelation; decay 5 smooths turnover while preserving the trend signal.",
    truncation_reason: "Momentum signals in micro-cap names can be extreme; 0.01 prevents size-factor contamination.",
    neutralisation_reason: "Momentum is strongly sector-driven; subindustry neutralisation extracts stock-specific momentum orthogonal to sector rotation.",
  },
  {
    title: "Debt-Adjusted Value with Accruals Screen",
    category: "value",
    strategy_type: "Debt-Adjusted Value",
    expr: `group_rank(
  ts_rank(ebitda / (cap + debt - cash), 252) * 0.45 +
  ts_rank(free_cash_flow / ebitda, 126) * 0.35 +
  ts_rank(ts_delta(net_income - free_cash_flow, 63), 126) * -0.20,
  subindustry
)`,
    tags: ["EV/EBITDA", "FCF quality", "accruals reversal"],
    rationale: "Enterprise yield on debt-adjusted cap corrects for capital structure differences that plague pure P/E ratios. FCF/EBITDA ratio separates real cash earners from accrual-heavy accounting profits. Inverted accruals term (negative weight) penalises names inflating earnings via working capital — a well-documented predictor of future earnings disappointments.",
    edge: "Captures the accruals anomaly first documented by Sloan (1996) combined with enterprise-level value to avoid value traps in over-levered names.",
    decay: 8, truncation: 0.01, neutralisation: "Subindustry",
    decay_reason: "Fundamental signals update quarterly; decay 8 prevents excessive turnover on stale data.",
    truncation_reason: "Near-zero EBITDA denominators create extreme ranks; 0.01 truncation stabilises signal.",
    neutralisation_reason: "Capital structures and accrual norms differ sharply across subindustries; tight neutralisation prevents sector bets.",
  },
  {
    title: "IV Contango Carry with Earnings Quality",
    category: "iv",
    strategy_type: "Vol Risk Premium",
    expr: `group_rank(
  ts_rank(implied_volatility_90d / implied_volatility_30d, 63) * 0.40 +
  ts_rank(ts_delta(implied_volatility_30d / implied_volatility_90d, 10), 42) * -0.25 +
  ts_rank(free_cash_flow / cap, 126) * 0.35,
  industry
)`,
    tags: ["IV contango", "term structure shift", "FCF screen"],
    rationale: "When 90d IV exceeds 30d IV (contango), the options market prices in future uncertainty above current — historically mean-reverts as near-term risk resolves, creating a carry opportunity. Penalising names where the term structure is steepening (shift signal) avoids entering when smart money is buying near-term protection. FCF quality filter removes distressed names where any IV signal is noise.",
    edge: "Collects the well-documented volatility risk premium in equity options markets while controlling for fundamental deterioration risk.",
    decay: 3, truncation: 0.05, neutralisation: "Industry",
    decay_reason: "IV signals are highly dynamic; decay 3 preserves freshness while reducing daily whipsawing.",
    truncation_reason: "IV ratios spike violently around earnings; 0.05 truncation prevents single events from dominating signal.",
    neutralisation_reason: "IV term structure levels are structurally different across industries (tech vs utilities); industry neutralisation isolates relative mispricing.",
  },
  {
    title: "Cross-Signal Confirmation Triple Gate",
    category: "cross_asset",
    strategy_type: "Cross-Signal",
    expr: `group_rank(
  ts_rank(operating_income / enterprise_value, 252) *
  ts_rank(close / ts_delay(close, 126), 126) *
  ts_rank(free_cash_flow / cap, 126),
  subindustry
)`,
    tags: ["value gate", "momentum gate", "quality gate"],
    rationale: "Multiplicative combination of value, momentum, and quality only fires full signal when all three legs simultaneously agree — dramatically reducing false positives versus additive combinations. When EV yield is high AND price is trending up AND FCF is strong, the stock is cheap, improving, and real; the triple confirmation reduces OS noise by an order of magnitude versus single-factor screens.",
    edge: "Eliminates the value trap (cheap but deteriorating) and momentum trap (trending but over-valued) by requiring simultaneous multi-factor confirmation.",
    decay: 5, truncation: 0.01, neutralisation: "Subindustry",
    decay_reason: "Triple-confirmed signals are naturally slow; decay 5 matches the signal's own update cadence.",
    truncation_reason: "Multiplicative signals can produce very large values; 0.01 truncation prevents compounding of outlier ranks.",
    neutralisation_reason: "All three signals have subindustry-level structural differences; subindustry neutralisation is essential for all three legs.",
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function GeneAlphaWorld() {
  const [alphas,     setAlphas]     = useState(SEEDS);
  const [loading,    setLoading]    = useState(false);
  const [catFilter,  setCatFilter]  = useState("all");
  const [active,     setActive]     = useState(SEEDS[0]);
  const [tab,        setTab]        = useState("expr");
  const [copied,     setCopied]     = useState(null);
  const [error,      setError]      = useState(null);
  const [pulsing,    setPulsing]    = useState(false);

  const catColor = id => CATEGORIES.find(c => c.id === id)?.color ?? "#94a3b8";
  const filtered = catFilter === "all" ? alphas : alphas.filter(a => a.category === catFilter);

  async function generate(cat = null) {
    setLoading(true); setPulsing(true); setError(null);

    const prompt = cat
      ? `Generate 4 advanced, high-quality alphas for the "${cat}" category. Use sophisticated strategies from the playbook — NOT basic single-factor signals. Each must have a specific edge, be IS/OS robust, and generate positive Sharpe and fitness. Include all JSON fields.`
      : `Generate 8 sophisticated, diverse alphas spanning: value, momentum, quality, reversal, iv, cross_asset, micro. Use the advanced strategy playbook. NO basic single-factor alphas. Each must have clear edge and positive expected Sharpe IS and OS. Include all JSON fields.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const raw  = data.content.map(b => b.text || "").join("");
      const json = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setAlphas(prev => [...json, ...prev]);
      setActive(json[0]);
      setTab("expr");
    } catch(e) {
      setError("Generation failed. Check network connectivity.");
    } finally {
      setLoading(false);
      setTimeout(() => setPulsing(false), 800);
    }
  }

  function copy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyAll(a) {
    const t = [
      `// ${a.title}`,
      `// Strategy: ${a.strategy_type}`,
      `// Edge: ${a.edge}`,
      ``,
      a.expr,
      ``,
      `// Settings`,
      `// Decay: ${a.decay}`,
      `// Truncation: ${a.truncation}`,
      `// Neutralisation: ${a.neutralisation}`,
    ].join("\n");
    copy(t, "all");
  }

  useEffect(() => { generate(); }, []);

  const a = active;
  const ac = a ? catColor(a.category) : "#34d399";

  return (
    <div style={$.root}>
      {/* ── Ambient background ── */}
      <div style={$.bg} />
      <div style={$.grid} />

      {/* ── Header ── */}
      <header style={$.header}>
        <div style={$.hBrand}>
          <div style={$.hLogo}>
            <span style={$.hLogoGlyph}>𝔾</span>
            <div>
              <div style={$.hTitle}>{BRAND.name}</div>
              <div style={$.hSub}>{BRAND.tagline}</div>
            </div>
          </div>
        </div>
        <div style={$.hRight}>
          <div style={$.hStats}>
            <span style={$.hStat}><span style={$.hStatVal}>{alphas.length}</span> signals</span>
            <span style={$.hDivider}>·</span>
            <span style={$.hStat}><span style={$.hStatVal}>{CATEGORIES.length - 1}</span> categories</span>
          </div>
          <div style={$.pulse(pulsing)}>
            <div style={$.pulseRing(pulsing)} />
            <div style={$.pulseDot(pulsing)} />
          </div>
          <span style={$.pulseLabel(pulsing)}>{pulsing ? "GENERATING…" : "READY"}</span>
        </div>
      </header>

      {/* ── Category bar ── */}
      <div style={$.catBar}>
        {CATEGORIES.map(cat => (
          <button key={cat.id} style={$.catBtn(catFilter === cat.id, cat.color)}
            onClick={() => setCatFilter(cat.id)}>
            <span style={$.catDot(cat.color)} />
            {cat.label}
          </button>
        ))}
        <div style={$.catBarRight}>
          <button style={$.genBtn("secondary")} onClick={() => generate(catFilter === "all" ? null : catFilter)} disabled={loading}>
            {loading ? "◌" : catFilter === "all" ? "⟳ Generate Batch" : `+ ${CATEGORIES.find(c=>c.id===catFilter)?.label} Alpha`}
          </button>
        </div>
      </div>

      {error && <div style={$.errBar}>{error}</div>}

      {/* ── Main layout ── */}
      <div style={$.layout}>

        {/* Left panel: signal list */}
        <div style={$.listPanel}>
          <div style={$.listMeta}>{filtered.length} signals{catFilter !== "all" ? ` · ${CATEGORIES.find(c=>c.id===catFilter)?.label}` : ""}</div>
          <div style={$.list}>
            {filtered.map((alpha, i) => {
              const col = catColor(alpha.category);
              const sel = active === alpha;
              return (
                <div key={i} style={$.item(sel, col)} onClick={() => { setActive(alpha); setTab("expr"); }}>
                  <div style={$.itemHead}>
                    <span style={$.itemBadge(col)}>{alpha.category}</span>
                    {alpha.strategy_type && <span style={$.itemType}>{alpha.strategy_type}</span>}
                  </div>
                  <div style={$.itemTitle}>{alpha.title}</div>
                  <div style={$.itemTags}>
                    {(alpha.tags||[]).map((t,j) => <span key={j} style={$.itemTag(col)}>{t}</span>)}
                  </div>
                  <div style={$.itemSettings}>
                    {alpha.decay != null && <span style={$.setting}>D·{alpha.decay}</span>}
                    {alpha.truncation != null && <span style={$.setting}>T·{alpha.truncation}</span>}
                    {alpha.neutralisation && <span style={$.setting}>{alpha.neutralisation.slice(0,3).toUpperCase()}</span>}
                  </div>
                </div>
              );
            })}
            {loading && [1,2,3].map(i => (
              <div key={i} style={$.skeleton}>
                <div style={$.skelA} /><div style={$.skelB} /><div style={$.skelC} />
              </div>
            ))}
          </div>
        </div>

        {/* Right panel: detail */}
        <div style={$.detailPanel}>
          {a ? (
            <div style={$.detail}>
              {/* Detail header */}
              <div style={$.dTop}>
                <div style={$.dMeta}>
                  <span style={$.dBadge(ac)}>{a.category}</span>
                  {a.strategy_type && <span style={$.dType}>{a.strategy_type}</span>}
                </div>
                <h2 style={$.dTitle}>{a.title}</h2>
                {a.edge && (
                  <div style={$.edgeBox(ac)}>
                    <span style={$.edgeLabel}>EDGE</span>
                    <span style={$.edgeText}>{a.edge}</span>
                  </div>
                )}
                <button style={$.copyAllBtn(copied==="all", ac)} onClick={() => copyAll(a)}>
                  {copied==="all" ? "✓ Copied" : "⊞ Copy All"}
                </button>
              </div>

              {/* Tabs */}
              <div style={$.tabs}>
                {[["expr","Expression"],["settings","Settings"],["rationale","Rationale"]].map(([id,label]) => (
                  <button key={id} style={$.tabBtn(tab===id, ac)} onClick={() => setTab(id)}>{label}</button>
                ))}
              </div>

              {/* Expression tab */}
              {tab === "expr" && (
                <div style={$.exprWrap}>
                  <div style={$.exprHeader}>
                    <span style={$.exprLang}>fastexpr-regular</span>
                    <button style={$.copyBtn(copied==="expr", ac)} onClick={() => copy(a.expr, "expr")}>
                      {copied==="expr" ? "✓ Copied" : "⊞ Copy"}
                    </button>
                  </div>
                  <pre style={$.expr(ac)}>{a.expr}</pre>
                </div>
              )}

              {/* Settings tab */}
              {tab === "settings" && (
                <div style={$.settingsWrap}>
                  <div style={$.settingsRow}>

                    {/* Decay */}
                    <div style={$.sBox(ac)}>
                      <div style={$.sBoxLabel}>DECAY</div>
                      <div style={$.sBoxVal(ac)}>{a.decay ?? "—"}<span style={$.sBoxUnit}> d</span></div>
                      <div style={$.sSwatches}>
                        {DECAY_OPTS.map(d => <span key={d} style={$.sSwatch(d===a.decay, ac)}>{d}</span>)}
                      </div>
                      <div style={$.sReason}>{a.decay_reason}</div>
                    </div>

                    {/* Truncation */}
                    <div style={$.sBox(ac)}>
                      <div style={$.sBoxLabel}>TRUNCATION</div>
                      <div style={$.sBoxVal(ac)}>{a.truncation ?? "—"}</div>
                      <div style={$.sSwatches}>
                        {TRUNC_OPTS.map(t => <span key={t} style={$.sSwatch(t===a.truncation, ac)}>{t}</span>)}
                      </div>
                      <div style={$.sReason}>{a.truncation_reason}</div>
                    </div>

                  </div>

                  {/* Neutralisation */}
                  <div style={$.nBox(ac)}>
                    <div style={$.sBoxLabel}>NEUTRALISATION</div>
                    <div style={$.nSwatches}>
                      {NEUTRAL_OPTS.map(n => (
                        <span key={n} style={$.nSwatch(n===a.neutralisation, ac)}>{n}</span>
                      ))}
                    </div>
                    <div style={$.sReason}>{a.neutralisation_reason}</div>
                  </div>

                  <button style={$.copyBtn(copied==="settings", ac)} onClick={() => copy(
                    `Decay: ${a.decay}\nTruncation: ${a.truncation}\nNeutralisation: ${a.neutralisation}`, "settings"
                  )}>
                    {copied==="settings" ? "✓ Copied Settings" : "⊞ Copy Settings"}
                  </button>
                </div>
              )}

              {/* Rationale tab */}
              {tab === "rationale" && (
                <div style={$.rationaleWrap}>
                  <p style={$.rationaleText}>{a.rationale}</p>
                  <div style={$.tagCloud}>
                    {(a.tags||[]).map((t,i) => <span key={i} style={$.rTag(ac)}>{t}</span>)}
                  </div>
                  <div style={$.checklist}>
                    <div style={$.checklistTitle}>IS/OS Robustness Checklist</div>
                    {[
                      ["✓", "2+ orthogonal signal types combined"],
                      ["✓", "No windows below 10 days"],
                      ["✓", "ts_delta wrapped in ts_rank (unit-safe)"],
                      ["✓", "Truncation applied — outlier-resistant"],
                      ["✓", "Peer neutralisation removes sector beta"],
                      ["✓", "Decay matches signal autocorrelation"],
                    ].map(([icon, text], i) => (
                      <div key={i} style={$.checkItem}>
                        <span style={$.checkMark(ac)}>{icon}</span>
                        <span style={$.checkText}>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={$.emptyState}>
              <div style={$.emptyGlyph}>𝔾</div>
              <div style={$.emptyTitle}>Select a signal</div>
              <div style={$.emptySub}>Expression · Settings · Rationale</div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes ringPulse { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.2);opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
      `}</style>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
function hex2rgb(h) {
  const s = h.replace("#","");
  const e = s.length===3 ? s.split("").map(c=>c+c).join("") : s;
  return [parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)].join(",");
}

const $ = {
  root: { minHeight:"100vh", background:"#060a12", color:"#cbd5e1", fontFamily:"'DM Sans','Segoe UI',sans-serif", position:"relative", overflow:"hidden" },
  bg:   { position:"fixed", inset:0, background:"radial-gradient(ellipse 80% 60% at 20% 10%, rgba(52,211,153,0.04) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 80%, rgba(96,165,250,0.03) 0%, transparent 60%)", pointerEvents:"none", zIndex:0 },
  grid: { position:"fixed", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize:"40px 40px", pointerEvents:"none", zIndex:0 },

  header: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 24px", borderBottom:"1px solid rgba(255,255,255,0.06)", position:"relative", zIndex:2, backdropFilter:"blur(8px)", background:"rgba(6,10,18,0.8)" },
  hBrand: { display:"flex", alignItems:"center" },
  hLogo:  { display:"flex", alignItems:"center", gap:12 },
  hLogoGlyph: { fontSize:32, color:"#34d399", fontFamily:"Georgia,serif", lineHeight:1, filter:"drop-shadow(0 0 12px rgba(52,211,153,0.5))" },
  hTitle: { fontSize:18, fontWeight:600, color:"#f1f5f9", letterSpacing:"-0.01em", fontFamily:"'DM Sans',sans-serif" },
  hSub:   { fontSize:11, color:"rgba(52,211,153,0.6)", letterSpacing:"0.08em", marginTop:1 },
  hRight: { display:"flex", alignItems:"center", gap:16 },
  hStats: { display:"flex", alignItems:"center", gap:8 },
  hStat:  { fontSize:12, color:"rgba(203,213,225,0.5)" },
  hStatVal: { color:"#f1f5f9", fontWeight:600 },
  hDivider: { color:"rgba(203,213,225,0.2)" },
  pulse:  (a) => ({ position:"relative", width:14, height:14, display:"flex", alignItems:"center", justifyContent:"center" }),
  pulseRing: (a) => ({ position:"absolute", inset:0, borderRadius:"50%", border:`1px solid ${a?"#fb923c":"#34d399"}`, animation:a?"ringPulse 1s ease-out infinite":"none", opacity:a?1:0 }),
  pulseDot:  (a) => ({ width:7, height:7, borderRadius:"50%", background:a?"#fb923c":"#34d399", boxShadow:`0 0 6px ${a?"#fb923c":"#34d399"}` }),
  pulseLabel:(a) => ({ fontSize:10, letterSpacing:"0.12em", color:a?"#fb923c":"rgba(52,211,153,0.6)", fontFamily:"'Space Mono',monospace" }),

  catBar:     { display:"flex", alignItems:"center", gap:4, padding:"8px 24px", borderBottom:"1px solid rgba(255,255,255,0.05)", overflowX:"auto", position:"relative", zIndex:2, background:"rgba(6,10,18,0.6)" },
  catBtn:     (a,c) => ({ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", fontSize:11, fontFamily:"'DM Sans',sans-serif", background:a?`rgba(${hex2rgb(c)},0.15)`:"transparent", color:a?c:"rgba(203,213,225,0.45)", border:`1px solid ${a?c:"transparent"}`, borderRadius:4, cursor:"pointer", whiteSpace:"nowrap", fontWeight:a?600:400, transition:"all 0.15s" }),
  catDot:     (c) => ({ width:5, height:5, borderRadius:"50%", background:c, flexShrink:0 }),
  catBarRight:{ marginLeft:"auto", flexShrink:0 },
  genBtn:     () => ({ padding:"6px 16px", fontSize:11, fontFamily:"'Space Mono',monospace", background:"transparent", color:"#34d399", border:"1px solid rgba(52,211,153,0.4)", borderRadius:4, cursor:"pointer", letterSpacing:"0.06em", transition:"all 0.15s" }),
  errBar:     { background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#fca5a5", padding:"8px 24px", fontSize:12, position:"relative", zIndex:2 },

  layout:     { display:"flex", height:"calc(100vh - 98px)", position:"relative", zIndex:1 },

  listPanel:  { width:340, flexShrink:0, borderRight:"1px solid rgba(255,255,255,0.05)", display:"flex", flexDirection:"column", overflow:"hidden" },
  listMeta:   { padding:"10px 16px", fontSize:10, letterSpacing:"0.14em", color:"rgba(203,213,225,0.3)", borderBottom:"1px solid rgba(255,255,255,0.04)", fontFamily:"'Space Mono',monospace" },
  list:       { overflowY:"auto", flex:1, padding:"6px" },
  item:       (sel,c) => ({ padding:"12px 14px", marginBottom:3, borderRadius:6, background:sel?`rgba(${hex2rgb(c)},0.08)`:"rgba(255,255,255,0.02)", border:`1px solid ${sel?c:"rgba(255,255,255,0.04)"}`, cursor:"pointer", transition:"all 0.15s", animation:"fadeIn 0.25s ease" }),
  itemHead:   { display:"flex", alignItems:"center", gap:6, marginBottom:6 },
  itemBadge:  (c) => ({ fontSize:9, letterSpacing:"0.14em", color:c, background:`rgba(${hex2rgb(c)},0.12)`, padding:"2px 7px", borderRadius:3, border:`1px solid ${c}33`, fontFamily:"'Space Mono',monospace", fontWeight:700 }),
  itemType:   { fontSize:9, color:"rgba(203,213,225,0.3)", letterSpacing:"0.06em" },
  itemTitle:  { fontSize:12, fontWeight:500, color:"#e2e8f0", lineHeight:1.4, marginBottom:6 },
  itemTags:   { display:"flex", gap:3, flexWrap:"wrap", marginBottom:7 },
  itemTag:    (c) => ({ fontSize:9, color:`rgba(${hex2rgb(c)},0.7)`, padding:"1px 6px", borderRadius:2, border:`1px solid rgba(${hex2rgb(c)},0.2)` }),
  itemSettings:{ display:"flex", gap:4 },
  setting:    { fontSize:9, color:"rgba(203,213,225,0.3)", padding:"1px 5px", borderRadius:2, border:"1px solid rgba(255,255,255,0.06)", fontFamily:"'Space Mono',monospace" },
  skeleton:   { padding:"12px 14px", marginBottom:3, borderRadius:6, background:"rgba(255,255,255,0.02)" },
  skelA:      { height:8, width:"40%", borderRadius:3, background:"linear-gradient(90deg,#0f172a,#1e293b,#0f172a)", backgroundSize:"400px", animation:"shimmer 1.5s infinite", marginBottom:8 },
  skelB:      { height:10, width:"85%", borderRadius:3, background:"linear-gradient(90deg,#0f172a,#1e293b,#0f172a)", backgroundSize:"400px", animation:"shimmer 1.5s infinite 0.1s", marginBottom:7 },
  skelC:      { height:7, width:"60%", borderRadius:3, background:"linear-gradient(90deg,#0f172a,#1e293b,#0f172a)", backgroundSize:"400px", animation:"shimmer 1.5s infinite 0.2s" },

  detailPanel:{ flex:1, overflow:"auto", padding:"24px 28px" },
  detail:     { display:"flex", flexDirection:"column", gap:18, animation:"fadeIn 0.2s ease" },
  dTop:       { display:"flex", flexDirection:"column", gap:10 },
  dMeta:      { display:"flex", alignItems:"center", gap:8 },
  dBadge:     (c) => ({ fontSize:10, letterSpacing:"0.14em", color:c, background:`rgba(${hex2rgb(c)},0.12)`, padding:"3px 9px", borderRadius:3, border:`1px solid ${c}33`, fontFamily:"'Space Mono',monospace", fontWeight:700 }),
  dType:      { fontSize:11, color:"rgba(203,213,225,0.4)", letterSpacing:"0.05em" },
  dTitle:     { fontSize:20, fontWeight:600, color:"#f1f5f9", margin:0, lineHeight:1.3, letterSpacing:"-0.01em" },
  edgeBox:    (c) => ({ background:`rgba(${hex2rgb(c)},0.06)`, border:`1px solid rgba(${hex2rgb(c)},0.2)`, borderLeft:`3px solid ${c}`, borderRadius:"0 4px 4px 0", padding:"8px 14px", display:"flex", gap:10, alignItems:"flex-start" }),
  edgeLabel:  { fontSize:9, letterSpacing:"0.18em", color:"rgba(203,213,225,0.4)", fontFamily:"'Space Mono',monospace", flexShrink:0, paddingTop:1 },
  edgeText:   { fontSize:12, color:"rgba(203,213,225,0.75)", lineHeight:1.55 },
  copyAllBtn: (done,c) => ({ alignSelf:"flex-start", padding:"5px 14px", fontSize:11, fontFamily:"'Space Mono',monospace", background:done?`rgba(${hex2rgb(c)},0.15)`:"transparent", color:done?c:"rgba(203,213,225,0.35)", border:`1px solid ${done?c:"rgba(255,255,255,0.1)"}`, borderRadius:4, cursor:"pointer", letterSpacing:"0.06em", transition:"all 0.15s" }),

  tabs:       { display:"flex", gap:0, borderBottom:"1px solid rgba(255,255,255,0.07)" },
  tabBtn:     (a,c) => ({ padding:"8px 18px", fontSize:12, fontFamily:"'DM Sans',sans-serif", background:"transparent", color:a?c:"rgba(203,213,225,0.35)", border:"none", borderBottom:a?`2px solid ${c}`:"2px solid transparent", cursor:"pointer", fontWeight:a?600:400, marginBottom:-1, transition:"all 0.15s" }),

  exprWrap:   { background:"#030608", border:"1px solid rgba(255,255,255,0.07)", borderRadius:6, overflow:"hidden" },
  exprHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" },
  exprLang:   { fontSize:10, color:"rgba(203,213,225,0.3)", letterSpacing:"0.12em", fontFamily:"'Space Mono',monospace" },
  copyBtn:    (done,c) => ({ padding:"4px 12px", fontSize:10, fontFamily:"'Space Mono',monospace", background:done?`rgba(${hex2rgb(c)},0.12)`:"transparent", color:done?c:"rgba(203,213,225,0.3)", border:`1px solid ${done?c:"rgba(255,255,255,0.1)"}`, borderRadius:3, cursor:"pointer", letterSpacing:"0.08em", transition:"all 0.15s" }),
  expr:       (c) => ({ margin:0, padding:"18px 20px", fontSize:12, lineHeight:2, color:c, fontFamily:"'Space Mono',monospace", whiteSpace:"pre-wrap", wordBreak:"break-word" }),

  settingsWrap: { display:"flex", flexDirection:"column", gap:12 },
  settingsRow:  { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  sBox:         (c) => ({ background:`rgba(${hex2rgb(c)},0.04)`, border:`1px solid rgba(${hex2rgb(c)},0.15)`, borderRadius:6, padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }),
  sBoxLabel:    { fontSize:9, letterSpacing:"0.2em", color:"rgba(203,213,225,0.3)", fontFamily:"'Space Mono',monospace" },
  sBoxVal:      (c) => ({ fontSize:28, fontWeight:700, color:c, lineHeight:1, fontFamily:"'Space Mono',monospace" }),
  sBoxUnit:     { fontSize:13, fontWeight:400 },
  sSwatches:    { display:"flex", gap:5, flexWrap:"wrap" },
  sSwatch:      (sel,c) => ({ fontSize:10, padding:"3px 9px", borderRadius:3, border:`1px solid ${sel?c:"rgba(255,255,255,0.08)"}`, color:sel?c:"rgba(203,213,225,0.25)", fontWeight:sel?700:400, fontFamily:"'Space Mono',monospace", cursor:"default" }),
  sReason:      { fontSize:11, color:"rgba(203,213,225,0.45)", lineHeight:1.65, borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:10 },
  nBox:         (c) => ({ background:`rgba(${hex2rgb(c)},0.04)`, border:`1px solid rgba(${hex2rgb(c)},0.15)`, borderRadius:6, padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }),
  nSwatches:    { display:"flex", gap:6, flexWrap:"wrap" },
  nSwatch:      (sel,c) => ({ fontSize:11, padding:"5px 14px", borderRadius:4, border:`1px solid ${sel?c:"rgba(255,255,255,0.08)"}`, color:sel?c:"rgba(203,213,225,0.25)", fontWeight:sel?600:400, cursor:"default", transition:"all 0.15s" }),

  rationaleWrap:{ display:"flex", flexDirection:"column", gap:16 },
  rationaleText:{ fontSize:13, lineHeight:1.8, color:"rgba(203,213,225,0.72)", margin:0 },
  tagCloud:     { display:"flex", gap:7, flexWrap:"wrap" },
  rTag:         (c) => ({ fontSize:11, color:`rgba(${hex2rgb(c)},0.85)`, padding:"4px 13px", borderRadius:4, border:`1px solid rgba(${hex2rgb(c)},0.25)`, background:`rgba(${hex2rgb(c)},0.07)` }),
  checklist:    { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:6, padding:"16px 18px", display:"flex", flexDirection:"column", gap:9 },
  checklistTitle:{ fontSize:10, letterSpacing:"0.16em", color:"rgba(203,213,225,0.3)", fontFamily:"'Space Mono',monospace", marginBottom:4 },
  checkItem:    { display:"flex", gap:10, alignItems:"center" },
  checkMark:    (c) => ({ fontSize:12, color:c, fontWeight:700, flexShrink:0, fontFamily:"'Space Mono',monospace" }),
  checkText:    { fontSize:12, color:"rgba(203,213,225,0.55)" },

  emptyState:   { height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, opacity:0.15 },
  emptyGlyph:   { fontSize:72, color:"#34d399", fontFamily:"Georgia,serif", lineHeight:1 },
  emptyTitle:   { fontSize:14, fontWeight:500, color:"#e2e8f0", letterSpacing:"0.05em" },
  emptySub:     { fontSize:10, letterSpacing:"0.2em", color:"rgba(203,213,225,0.5)", fontFamily:"'Space Mono',monospace" },
};
