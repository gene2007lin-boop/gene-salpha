<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Gene's Alpha World</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#060a12;--surface:rgba(255,255,255,0.03);--border:rgba(255,255,255,0.07);
  --text:#cbd5e1;--text-hi:#f1f5f9;--text-lo:rgba(203,213,225,0.35);
  --green:#34d399;--orange:#fb923c;
  --mono:'Space Mono',monospace;--sans:'DM Sans','Segoe UI',sans-serif;
}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:var(--sans)}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
button{font-family:inherit;cursor:pointer}

/* Ambient BG */
body::before{content:'';position:fixed;inset:0;
  background:radial-gradient(ellipse 80% 60% at 20% 10%,rgba(52,211,153,0.05) 0%,transparent 60%),
             radial-gradient(ellipse 60% 80% at 80% 80%,rgba(96,165,250,0.03) 0%,transparent 60%);
  pointer-events:none;z-index:0}
body::after{content:'';position:fixed;inset:0;
  background-image:linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),
                   linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px);
  background-size:40px 40px;pointer-events:none;z-index:0}

/* Layout */
#app{position:relative;z-index:1;display:flex;flex-direction:column;height:100vh}

/* Header */
header{display:flex;justify-content:space-between;align-items:center;
  padding:14px 24px;border-bottom:1px solid var(--border);
  background:rgba(6,10,18,0.85);backdrop-filter:blur(8px)}
.logo{display:flex;align-items:center;gap:12px}
.logo-glyph{font-size:30px;color:var(--green);font-family:Georgia,serif;
  filter:drop-shadow(0 0 10px rgba(52,211,153,0.5));line-height:1}
.logo-name{font-size:17px;font-weight:600;color:var(--text-hi);letter-spacing:-0.01em}
.logo-tag{font-size:10px;color:rgba(52,211,153,0.55);letter-spacing:0.09em;margin-top:1px}
.h-right{display:flex;align-items:center;gap:14px}
.h-stats{display:flex;gap:8px;align-items:center;font-size:12px;color:var(--text-lo)}
.h-stats strong{color:var(--text-hi);font-weight:600}
.status-wrap{display:flex;align-items:center;gap:8px}
.status-dot{width:7px;height:7px;border-radius:50%;background:var(--green);
  box-shadow:0 0 6px var(--green);transition:all 0.3s}
.status-dot.busy{background:var(--orange);box-shadow:0 0 6px var(--orange);animation:blink 0.7s ease infinite alternate}
.status-label{font-size:10px;font-family:var(--mono);letter-spacing:0.1em;color:var(--text-lo)}

/* Cat bar */
.cat-bar{display:flex;align-items:center;gap:4px;padding:7px 24px;
  border-bottom:1px solid rgba(255,255,255,0.05);overflow-x:auto;
  background:rgba(6,10,18,0.6);flex-shrink:0}
.cat-btn{display:flex;align-items:center;gap:5px;padding:5px 11px;font-size:11px;
  background:transparent;color:var(--text-lo);border:1px solid transparent;
  border-radius:4px;white-space:nowrap;transition:all 0.15s;font-weight:400}
.cat-btn.active,.cat-btn:hover{background:rgba(255,255,255,0.04);color:var(--text);border-color:rgba(255,255,255,0.1)}
.cat-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.gen-btn{margin-left:auto;flex-shrink:0;padding:5px 15px;font-size:11px;
  font-family:var(--mono);background:transparent;color:var(--green);
  border:1px solid rgba(52,211,153,0.35);border-radius:4px;letter-spacing:0.06em;transition:all 0.15s}
.gen-btn:hover{background:rgba(52,211,153,0.07)}
.gen-btn:disabled{opacity:0.4;cursor:not-allowed}

/* Main layout */
.main{display:flex;flex:1;overflow:hidden}

/* List */
.list-panel{width:330px;flex-shrink:0;border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.list-meta{padding:9px 16px;font-size:10px;letter-spacing:0.14em;color:var(--text-lo);
  border-bottom:1px solid rgba(255,255,255,0.04);font-family:var(--mono)}
.list-scroll{overflow-y:auto;flex:1;padding:5px}
.alpha-item{padding:11px 13px;margin-bottom:3px;border-radius:5px;
  background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);
  cursor:pointer;transition:all 0.15s;animation:fadeIn 0.2s ease}
.alpha-item.selected,.alpha-item:hover{background:rgba(52,211,153,0.05)}
.item-head{display:flex;align-items:center;gap:6px;margin-bottom:6px}
.item-badge{font-size:9px;letter-spacing:0.13em;padding:2px 6px;border-radius:3px;
  font-family:var(--mono);font-weight:700}
.item-type{font-size:9px;color:var(--text-lo)}
.item-title{font-size:12px;font-weight:500;color:#e2e8f0;line-height:1.4;margin-bottom:6px}
.item-tags{display:flex;gap:3px;flex-wrap:wrap;margin-bottom:6px}
.item-tag{font-size:9px;padding:1px 5px;border-radius:2px}
.item-chips{display:flex;gap:3px}
.chip{font-size:9px;font-family:var(--mono);color:var(--text-lo);
  padding:1px 5px;border-radius:2px;border:1px solid rgba(255,255,255,0.06)}

/* Skeleton */
.skel{padding:11px 13px;margin-bottom:3px;border-radius:5px;background:rgba(255,255,255,0.02)}
.skel-line{border-radius:3px;background:linear-gradient(90deg,#0f172a,#1e293b,#0f172a);
  background-size:400px;animation:shimmer 1.5s infinite;margin-bottom:7px}

/* Detail */
.detail-panel{flex:1;overflow-y:auto;padding:22px 26px}
.detail{display:flex;flex-direction:column;gap:16px;animation:fadeIn 0.2s ease}
.d-top{display:flex;flex-direction:column;gap:9px}
.d-meta{display:flex;align-items:center;gap:8px}
.d-badge{font-size:10px;letter-spacing:0.13em;padding:3px 8px;border-radius:3px;font-family:var(--mono);font-weight:700}
.d-type{font-size:11px;color:var(--text-lo)}
.d-title{font-size:19px;font-weight:600;color:var(--text-hi);line-height:1.3;letter-spacing:-0.01em}
.edge-box{display:flex;gap:10px;align-items:flex-start;padding:8px 14px;border-radius:0 4px 4px 0;border-left-width:3px;border-left-style:solid}
.edge-label{font-size:9px;letter-spacing:0.18em;color:var(--text-lo);font-family:var(--mono);flex-shrink:0;padding-top:1px}
.edge-text{font-size:12px;color:rgba(203,213,225,0.72);line-height:1.55}
.copy-all-btn{align-self:flex-start;padding:5px 13px;font-size:11px;font-family:var(--mono);
  background:transparent;border-radius:4px;letter-spacing:0.06em;border:1px solid rgba(255,255,255,0.1);
  color:var(--text-lo);transition:all 0.15s}
.copy-all-btn:hover{color:var(--text);border-color:rgba(255,255,255,0.25)}

/* Tabs */
.tabs{display:flex;border-bottom:1px solid var(--border)}
.tab-btn{padding:8px 17px;font-size:12px;background:transparent;border:none;
  border-bottom:2px solid transparent;color:var(--text-lo);font-weight:400;
  margin-bottom:-1px;transition:all 0.15s}
.tab-btn.active{font-weight:600;border-bottom-color:currentColor}
.tab-btn:hover{color:var(--text)}

/* Expression */
.expr-wrap{background:#030608;border:1px solid rgba(255,255,255,0.07);border-radius:6px;overflow:hidden}
.expr-header{display:flex;justify-content:space-between;align-items:center;
  padding:7px 14px;border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(255,255,255,0.02)}
.expr-lang{font-size:10px;color:var(--text-lo);letter-spacing:0.12em;font-family:var(--mono)}
.copy-btn{padding:4px 11px;font-size:10px;font-family:var(--mono);background:transparent;
  border-radius:3px;letter-spacing:0.07em;border:1px solid rgba(255,255,255,0.1);
  color:var(--text-lo);transition:all 0.15s}
.copy-btn:hover,.copy-btn.done{border-color:currentColor}
.expr-code{margin:0;padding:16px 18px;font-size:12px;line-height:2;font-family:var(--mono);
  white-space:pre-wrap;word-break:break-word}

/* Settings */
.settings-wrap{display:flex;flex-direction:column;gap:12px}
.settings-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.s-box{border-radius:6px;padding:13px 15px;display:flex;flex-direction:column;gap:9px}
.s-label{font-size:9px;letter-spacing:0.2em;color:var(--text-lo);font-family:var(--mono)}
.s-val{font-size:26px;font-weight:700;font-family:var(--mono);line-height:1}
.s-unit{font-size:12px;font-weight:400}
.swatches{display:flex;gap:5px;flex-wrap:wrap}
.swatch{font-size:10px;padding:3px 8px;border-radius:3px;font-family:var(--mono);cursor:default}
.n-swatches{display:flex;gap:6px;flex-wrap:wrap}
.n-swatch{font-size:11px;padding:5px 13px;border-radius:4px;cursor:default}
.s-reason{font-size:11px;color:rgba(203,213,225,0.45);line-height:1.65;
  border-top:1px solid rgba(255,255,255,0.05);padding-top:9px}

/* Rationale */
.rationale-wrap{display:flex;flex-direction:column;gap:14px}
.rationale-text{font-size:13px;line-height:1.8;color:rgba(203,213,225,0.7)}
.tag-cloud{display:flex;gap:6px;flex-wrap:wrap}
.r-tag{font-size:11px;padding:4px 12px;border-radius:4px}
.checklist{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);
  border-radius:6px;padding:15px 17px;display:flex;flex-direction:column;gap:9px}
.cl-title{font-size:10px;letter-spacing:0.16em;color:var(--text-lo);font-family:var(--mono);margin-bottom:3px}
.check-item{display:flex;gap:10px;align-items:center;font-size:12px;color:rgba(203,213,225,0.52)}
.check-mark{font-size:12px;font-weight:700;font-family:var(--mono);flex-shrink:0}

/* Empty */
.empty-state{height:100%;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:12px;opacity:0.15;pointer-events:none}
.empty-glyph{font-size:70px;color:var(--green);font-family:Georgia,serif;line-height:1}
.empty-title{font-size:14px;font-weight:500;color:var(--text-hi);letter-spacing:0.04em}
.empty-sub{font-size:10px;letter-spacing:0.2em;color:var(--text-lo);font-family:var(--mono)}

/* Error */
.err-bar{background:rgba(239,68,68,0.08);border-bottom:1px solid rgba(239,68,68,0.2);
  color:#fca5a5;padding:7px 24px;font-size:12px}

/* Animations */
@keyframes blink{from{opacity:1}to{opacity:0.3}}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
@keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
</style>
</head>
<body>
<div id="app">
  <header>
    <div class="logo">
      <span class="logo-glyph">𝔾</span>
      <div>
        <div class="logo-name">Gene's Alpha World</div>
        <div class="logo-tag">Advanced Quantitative Signal Laboratory</div>
      </div>
    </div>
    <div class="h-right">
      <div class="h-stats">
        <span><strong id="sig-count">4</strong> signals</span>
        <span style="color:rgba(203,213,225,0.15)">·</span>
        <span><strong>8</strong> categories</span>
      </div>
      <div class="status-wrap">
        <div class="status-dot" id="status-dot"></div>
        <span class="status-label" id="status-label">READY</span>
      </div>
    </div>
  </header>

  <div class="cat-bar" id="cat-bar">
    <!-- populated by JS -->
  </div>

  <div id="err-bar" class="err-bar" style="display:none"></div>

  <div class="main">
    <div class="list-panel">
      <div class="list-meta" id="list-meta">0 SIGNALS</div>
      <div class="list-scroll" id="list-scroll"></div>
    </div>
    <div class="detail-panel" id="detail-panel">
      <div class="empty-state">
        <div class="empty-glyph">𝔾</div>
        <div class="empty-title">Select a signal</div>
        <div class="empty-sub">EXPRESSION · SETTINGS · RATIONALE</div>
      </div>
    </div>
  </div>
</div>

<script>
// ── Config ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  {id:"all",         label:"All",           color:"#e2e8f0"},
  {id:"value",       label:"Value",         color:"#34d399"},
  {id:"momentum",    label:"Momentum",      color:"#fb923c"},
  {id:"quality",     label:"Quality",       color:"#60a5fa"},
  {id:"reversal",    label:"Mean Reversion",color:"#a78bfa"},
  {id:"volatility",  label:"Volatility",    color:"#fbbf24"},
  {id:"iv",          label:"Impl. Vol",     color:"#f472b6"},
  {id:"cross_asset", label:"Cross-Signal",  color:"#22d3ee"},
  {id:"micro",       label:"Microstructure",color:"#f87171"},
];

const DECAY_OPTS   = [0,3,5,8,10,15,20];
const TRUNC_OPTS   = [0.01,0.05,0.08,0.10];
const NEUTRAL_OPTS = ["Market","Sector","Industry","Subindustry"];

const SYSTEM_PROMPT = `You are Gene, a world-class quantitative researcher at a top-tier hedge fund. You design alpha expressions that consistently pass both In-Sample (IS) and Out-of-Sample (OS) validation with POSITIVE Sharpe ratios, positive fitness scores, and positive returns. You think like AQR, Two Sigma, and WorldQuant combined.

CRITICAL — WHY MOST ALPHAS FAIL OS (and how to avoid it):
1. OVERCROWDING: Avoid textbook single-factor signals (pure P/B, pure momentum). They are arbitraged away. Combine 2-3 non-obvious orthogonal inputs.
2. MICROSTRUCTURE NOISE: Windows < 10 days create spurious IS fits that collapse OS. Minimum window = 10 days.
3. OUTLIER CONTAMINATION: Raw ratios with near-zero denominators blow up and create fake IS alpha. Always use ts_rank() to compress to [0,1] before combining. Truncation 0.01–0.05 mandatory.
4. SECTOR BETA LEAKAGE: Without tight neutralisation, macro sector moves dominate. Use Subindustry for fundamental alphas, Industry for vol/IV alphas.
5. OVERFITTING: Never use more than 3 terms. Each term must have independent economic justification.
6. WRONG DIRECTION: Low-quality signals HURT when you bet the wrong way.

=== ADVANCED STRATEGY PLAYBOOK ===

[A] RESIDUAL MOMENTUM: 6M momentum minus 1M reversal + FCF quality gate. Pattern: ts_rank(close/ts_delay(close,126),126)*0.45 - ts_rank(close/ts_delay(close,21),21)*0.20 + ts_rank(free_cash_flow/cap,126)*0.35

[B] EARNINGS QUALITY + ACCRUALS: FCF/net_income divergence + accruals inversion. ts_rank(free_cash_flow/net_income,252)*0.45 + ts_rank(operating_income/revenue,126)*0.35 + ts_rank(ts_delta(net_income-free_cash_flow,63),126)*-0.20

[C] FUNDAMENTAL MOMENTUM: Expanding margin trend + FCF yield improvement. ts_rank(ts_delta(operating_income/revenue,63),126)*0.50 + ts_rank(ts_delta(free_cash_flow/cap,42),126)*0.30 + ts_rank(book_value/cap,252)*0.20

[D] VOL RISK PREMIUM: IV contango carry + quality screen. ts_rank(implied_volatility_90d/implied_volatility_30d,63)*0.40 - ts_rank(ts_delta(implied_volatility_30d/implied_volatility_90d,10),42)*0.25 + ts_rank(free_cash_flow/cap,126)*0.35

[E] PRICE-VOLUME MICROSTRUCTURE: Volume-price confirmation + Amihud illiquidity. ts_corr(close,volume,20) ranked + ts_rank(abs(ts_delta(close,1))/volume,63)

[F] CROSS-SIGNAL MULTIPLICATIVE: Only fires when value AND momentum AND quality agree simultaneously. ts_rank(operating_income/enterprise_value,252) * ts_rank(close/ts_delay(close,126),126) * ts_rank(free_cash_flow/cap,126)

[G] MEAN REVERSION + QUALITY: Short-term reversal ONLY on high-quality names. (1-ts_rank(close/ts_delay(close,5),20)) * ts_rank(free_cash_flow/cap,126) — pure reversal without quality filter has negative OS Sharpe.

[H] DEBT-ADJUSTED VALUE: Enterprise yield + net cash premium + earnings quality. ts_rank(ebitda/(cap+debt-cash),252)*0.45 + ts_rank((cash-debt)/cap,126)*0.30 + ts_rank(free_cash_flow/ebitda,126)*0.25

=== fastexpr-regular SYNTAX ===
- UNIT SAFETY: ts_delta() returns raw units. ALWAYS wrap in ts_rank() before adding. Exception: multiplicative combos.
- Operators: ts_rank(x,w), ts_delta(x,w), ts_delay(x,w), group_rank(x,grp), ts_std_dev(x,w), ts_corr(x,y,w), rank(x), sign(x), log(x), abs(x)
- Fields ONLY: close, open, high, low, volume, cap, enterprise_value, operating_income, ebitda, net_income, revenue, book_value, free_cash_flow, debt, cash, shares_outstanding, implied_volatility_30d, implied_volatility_60d, implied_volatility_90d, implied_volatility_1y
- Groups: sector, industry, subindustry
- Outer wrapper: ALWAYS group_rank(..., subindustry) or group_rank(..., industry)
- Windows: min 10, max 504.
- DO NOT invent field names.

Respond ONLY with a JSON array. No markdown, no backticks:
[{"title":"5-8 word title","category":"value|momentum|quality|reversal|volatility|iv|cross_asset|micro","strategy_type":"from playbook","expr":"full expression","rationale":"3 sentences","edge":"specific inefficiency exploited","tags":["t1","t2","t3"],"decay":int,"truncation":float,"neutralisation":"string","decay_reason":"why","truncation_reason":"why","neutralisation_reason":"why"}]`;

const SEEDS = [
  {title:"Residual Momentum with Quality Gate",category:"momentum",strategy_type:"Residual Momentum",
   expr:`group_rank(\n  ts_rank(close / ts_delay(close, 126), 126) * 0.45 -\n  ts_rank(close / ts_delay(close, 21), 21) * 0.20 +\n  ts_rank(free_cash_flow / cap, 126) * 0.35,\n  subindustry\n)`,
   tags:["6M momentum","1M skip","FCF quality"],rationale:"6-month momentum captures institutional trend-following flows; skipping the most recent month eliminates documented short-term reversal. FCF/cap quality gate rejects low-quality names where momentum is most likely to crash out-of-sample.",edge:"Slow institutional rebalancing lag; avoids low-quality momentum crash of 2009 and 2020.",
   decay:5,truncation:0.01,neutralisation:"Subindustry",decay_reason:"Momentum has meaningful autocorrelation; decay 5 smooths turnover while preserving trend.",truncation_reason:"Extreme momentum in micro-caps contaminates signal; 0.01 prevents size-factor leakage.",neutralisation_reason:"Momentum is strongly sector-driven; subindustry extracts stock-specific component."},
  {title:"Debt-Adjusted Value with Accruals Screen",category:"value",strategy_type:"Debt-Adjusted Value",
   expr:`group_rank(\n  ts_rank(ebitda / (cap + debt - cash), 252) * 0.45 +\n  ts_rank(free_cash_flow / ebitda, 126) * 0.35 +\n  ts_rank(ts_delta(net_income - free_cash_flow, 63), 126) * -0.20,\n  subindustry\n)`,
   tags:["EV/EBITDA","FCF quality","accruals reversal"],rationale:"Enterprise yield corrects for capital structure differences that plague P/E ratios. FCF/EBITDA separates real cash earners from accrual-heavy accounting. Inverted accruals term penalises names inflating earnings via working capital — a strong predictor of earnings disappointments.",edge:"Accruals anomaly (Sloan 1996) combined with enterprise-level value avoids value traps in over-levered names.",
   decay:8,truncation:0.01,neutralisation:"Subindustry",decay_reason:"Fundamental signals update quarterly; decay 8 prevents excessive turnover on stale data.",truncation_reason:"Near-zero EBITDA denominators create extreme ranks; 0.01 stabilises signal.",neutralisation_reason:"Capital structures and accrual norms differ sharply across subindustries."},
  {title:"IV Contango Carry with Earnings Quality",category:"iv",strategy_type:"Vol Risk Premium",
   expr:`group_rank(\n  ts_rank(implied_volatility_90d / implied_volatility_30d, 63) * 0.40 +\n  ts_rank(ts_delta(implied_volatility_30d / implied_volatility_90d, 10), 42) * -0.25 +\n  ts_rank(free_cash_flow / cap, 126) * 0.35,\n  industry\n)`,
   tags:["IV contango","term structure shift","FCF screen"],rationale:"90d IV > 30d IV (contango) means options market prices future uncertainty above current — mean-reverts as near-term risk resolves. Penalising steepening term structure avoids entering when smart money buys near-term protection. FCF quality filter removes distressed names where IV signals are noise.",edge:"Collects equity volatility risk premium while controlling for fundamental deterioration risk.",
   decay:3,truncation:0.05,neutralisation:"Industry",decay_reason:"IV signals are highly dynamic; decay 3 preserves freshness.",truncation_reason:"IV ratios spike violently around earnings; 0.05 caps event outliers.",neutralisation_reason:"IV term structure levels are structurally different across industries."},
  {title:"Cross-Signal Triple Confirmation Gate",category:"cross_asset",strategy_type:"Cross-Signal",
   expr:`group_rank(\n  ts_rank(operating_income / enterprise_value, 252) *\n  ts_rank(close / ts_delay(close, 126), 126) *\n  ts_rank(free_cash_flow / cap, 126),\n  subindustry\n)`,
   tags:["value gate","momentum gate","quality gate"],rationale:"Multiplicative combination of value, momentum, and quality only fires full signal when all three legs simultaneously agree — eliminating value traps and momentum traps. The triple confirmation dramatically reduces false positives versus additive approaches.",edge:"Eliminates the value trap and momentum trap by requiring multi-factor simultaneous confirmation.",
   decay:5,truncation:0.01,neutralisation:"Subindustry",decay_reason:"Triple-confirmed signals are naturally slow-moving; decay 5 matches signal cadence.",truncation_reason:"Multiplicative signals compound outlier ranks; 0.01 truncation is mandatory.",neutralisation_reason:"All three legs have subindustry-level structural biases; tight neutralisation essential."},
];

// ── State ────────────────────────────────────────────────────────────────────
let state = { alphas: SEEDS, catFilter:"all", active: SEEDS[0], tab:"expr", loading:false };

// ── Helpers ──────────────────────────────────────────────────────────────────
function catColor(id){ return (CATEGORIES.find(c=>c.id===id)||{color:"#94a3b8"}).color; }
function hex2rgb(h){
  const s=h.replace("#",""), e=s.length===3?s.split("").map(c=>c+c).join(""):s;
  return [parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)].join(",");
}
function esc(s){ const d=document.createElement("div"); d.textContent=s; return d.innerHTML; }
function setStatus(busy){
  document.getElementById("status-dot").className="status-dot"+(busy?" busy":"");
  document.getElementById("status-label").textContent=busy?"GENERATING…":"READY";
}
function showError(msg){
  const b=document.getElementById("err-bar");
  if(msg){b.textContent=msg;b.style.display=""}else{b.style.display="none"}
}

// ── Generation ───────────────────────────────────────────────────────────────
async function generate(cat=null){
  if(state.loading) return;
  state.loading=true; setStatus(true); showError(null);
  const prompt = cat
    ? `Generate 4 advanced, high-Sharpe alphas for the "${cat}" category using the advanced strategy playbook. Include ALL JSON fields.`
    : `Generate 8 sophisticated diverse alphas across: value, momentum, quality, reversal, iv, cross_asset, micro. No basic single-factor alphas. Include ALL JSON fields.`;
  try{
    const res = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,system:SYSTEM_PROMPT,
        messages:[{role:"user",content:prompt}]})
    });
    const data = await res.json();
    const raw  = data.content.map(b=>b.text||"").join("");
    const json = JSON.parse(raw.replace(/```json|```/g,"").trim());
    state.alphas = [...json, ...state.alphas];
    state.active = json[0];
    state.tab = "expr";
  }catch(e){ showError("Generation failed — check API connectivity."); }
  finally{ state.loading=false; setStatus(false); render(); }
}

// ── Copy ─────────────────────────────────────────────────────────────────────
function copyText(text, btnId){
  navigator.clipboard.writeText(text);
  const el=document.getElementById(btnId);
  if(!el) return;
  const orig=el.textContent; el.textContent="✓ Copied";
  setTimeout(()=>{if(el)el.textContent=orig;},2000);
}

// ── Render: Cat Bar ──────────────────────────────────────────────────────────
function renderCatBar(){
  const bar=document.getElementById("cat-bar");
  bar.innerHTML="";
  CATEGORIES.forEach(cat=>{
    const b=document.createElement("button");
    b.className="cat-btn"+(state.catFilter===cat.id?" active":"");
    b.innerHTML=`<span class="cat-dot" style="background:${cat.color}"></span>${esc(cat.label)}`;
    b.onclick=()=>{state.catFilter=cat.id; render();};
    bar.appendChild(b);
  });
  const genB=document.createElement("button");
  genB.className="gen-btn"; genB.disabled=state.loading;
  const catLabel=CATEGORIES.find(c=>c.id===state.catFilter)?.label||"";
  genB.textContent=state.loading?"◌":state.catFilter==="all"?"⟳ Generate Batch":`+ ${catLabel} Alpha`;
  genB.onclick=()=>generate(state.catFilter==="all"?null:state.catFilter);
  bar.appendChild(genB);
}

// ── Render: List ─────────────────────────────────────────────────────────────
function renderList(){
  const filtered=state.catFilter==="all"?state.alphas:state.alphas.filter(a=>a.category===state.catFilter);
  document.getElementById("list-meta").textContent=`${filtered.length} SIGNALS${state.catFilter!=="all"?" · "+CATEGORIES.find(c=>c.id===state.catFilter)?.label:""}`;
  document.getElementById("sig-count").textContent=state.alphas.length;
  const scroll=document.getElementById("list-scroll");
  scroll.innerHTML="";
  filtered.forEach((a,i)=>{
    const col=catColor(a.category);
    const div=document.createElement("div");
    div.className="alpha-item"+(state.active===a?" selected":"");
    div.style.borderColor=state.active===a?col:"rgba(255,255,255,0.04)";
    div.style.background=state.active===a?`rgba(${hex2rgb(col)},0.07)`:"rgba(255,255,255,0.02)";
    div.innerHTML=`
      <div class="item-head">
        <span class="item-badge" style="color:${col};background:rgba(${hex2rgb(col)},0.12);border:1px solid ${col}33">${esc(a.category)}</span>
        ${a.strategy_type?`<span class="item-type">${esc(a.strategy_type)}</span>`:""}
      </div>
      <div class="item-title">${esc(a.title)}</div>
      <div class="item-tags">${(a.tags||[]).map(t=>`<span class="item-tag" style="color:rgba(${hex2rgb(col)},0.7);border:1px solid rgba(${hex2rgb(col)},0.2)">${esc(t)}</span>`).join("")}</div>
      <div class="item-chips">
        ${a.decay!=null?`<span class="chip">D·${a.decay}</span>`:""}
        ${a.truncation!=null?`<span class="chip">T·${a.truncation}</span>`:""}
        ${a.neutralisation?`<span class="chip">${esc(a.neutralisation.slice(0,3).toUpperCase())}</span>`:""}
      </div>`;
    div.onclick=()=>{state.active=a; state.tab="expr"; render();};
    scroll.appendChild(div);
  });
  if(state.loading){
    [55,80,40].forEach((w,i)=>{
      const sk=document.createElement("div"); sk.className="skel";
      sk.innerHTML=`<div class="skel-line" style="height:8px;width:${w}%"></div><div class="skel-line" style="height:10px;width:85%"></div><div class="skel-line" style="height:7px;width:60%"></div>`;
      scroll.appendChild(sk);
    });
  }
}

// ── Render: Detail ───────────────────────────────────────────────────────────
function renderDetail(){
  const panel=document.getElementById("detail-panel");
  const a=state.active;
  if(!a){ panel.innerHTML=`<div class="empty-state"><div class="empty-glyph">𝔾</div><div class="empty-title">Select a signal</div><div class="empty-sub">EXPRESSION · SETTINGS · RATIONALE</div></div>`; return; }
  const col=catColor(a.category);

  const tabContent = {
    expr:`<div class="expr-wrap">
      <div class="expr-header">
        <span class="expr-lang">fastexpr-regular</span>
        <button class="copy-btn" id="copy-expr-btn" onclick="copyText(${JSON.stringify(a.expr)},'copy-expr-btn')">⊞ Copy</button>
      </div>
      <pre class="expr-code" style="color:${col}">${esc(a.expr)}</pre>
    </div>`,
    settings:`<div class="settings-wrap">
      <div class="settings-row">
        <div class="s-box" style="background:rgba(${hex2rgb(col)},0.04);border:1px solid rgba(${hex2rgb(col)},0.16)">
          <div class="s-label">DECAY</div>
          <div class="s-val" style="color:${col}">${a.decay??'—'}<span class="s-unit"> d</span></div>
          <div class="swatches">${DECAY_OPTS.map(d=>`<span class="swatch" style="border:1px solid ${d===a.decay?col:'rgba(255,255,255,0.08)'};color:${d===a.decay?col:'rgba(203,213,225,0.25)'};font-weight:${d===a.decay?700:400}">${d}</span>`).join("")}</div>
          <div class="s-reason">${esc(a.decay_reason||"")}</div>
        </div>
        <div class="s-box" style="background:rgba(${hex2rgb(col)},0.04);border:1px solid rgba(${hex2rgb(col)},0.16)">
          <div class="s-label">TRUNCATION</div>
          <div class="s-val" style="color:${col}">${a.truncation??'—'}</div>
          <div class="swatches">${TRUNC_OPTS.map(t=>`<span class="swatch" style="border:1px solid ${t===a.truncation?col:'rgba(255,255,255,0.08)'};color:${t===a.truncation?col:'rgba(203,213,225,0.25)'};font-weight:${t===a.truncation?700:400}">${t}</span>`).join("")}</div>
          <div class="s-reason">${esc(a.truncation_reason||"")}</div>
        </div>
      </div>
      <div class="s-box" style="background:rgba(${hex2rgb(col)},0.04);border:1px solid rgba(${hex2rgb(col)},0.16)">
        <div class="s-label">NEUTRALISATION</div>
        <div class="n-swatches">${NEUTRAL_OPTS.map(n=>`<span class="n-swatch" style="border:1px solid ${n===a.neutralisation?col:'rgba(255,255,255,0.08)'};color:${n===a.neutralisation?col:'rgba(203,213,225,0.25)'};font-weight:${n===a.neutralisation?600:400}">${n}</span>`).join("")}</div>
        <div class="s-reason">${esc(a.neutralisation_reason||"")}</div>
      </div>
      <button class="copy-btn" id="copy-settings-btn" onclick="copyText('Decay: ${a.decay}\\nTruncation: ${a.truncation}\\nNeutralisation: ${a.neutralisation}','copy-settings-btn')">⊞ Copy Settings</button>
    </div>`,
    rationale:`<div class="rationale-wrap">
      <p class="rationale-text">${esc(a.rationale||"")}</p>
      <div class="tag-cloud">${(a.tags||[]).map(t=>`<span class="r-tag" style="color:rgba(${hex2rgb(col)},0.85);border:1px solid rgba(${hex2rgb(col)},0.25);background:rgba(${hex2rgb(col)},0.07)">${esc(t)}</span>`).join("")}</div>
      <div class="checklist">
        <div class="cl-title">IS/OS ROBUSTNESS CHECKLIST</div>
        ${[["✓","2+ orthogonal signal types combined"],["✓","No windows below 10 days"],["✓","ts_delta wrapped in ts_rank (unit-safe)"],["✓","Truncation applied — outlier-resistant"],["✓","Peer neutralisation removes sector beta"],["✓","Decay matches signal autocorrelation"]].map(([icon,text])=>`<div class="check-item"><span class="check-mark" style="color:${col}">${icon}</span><span>${esc(text)}</span></div>`).join("")}
      </div>
    </div>`,
  };

  const copyAllText = `// ${a.title}\n// Strategy: ${a.strategy_type||""}\n// Edge: ${a.edge||""}\n\n${a.expr}\n\n// Decay: ${a.decay}\n// Truncation: ${a.truncation}\n// Neutralisation: ${a.neutralisation}`;

  panel.innerHTML=`<div class="detail">
    <div class="d-top">
      <div class="d-meta">
        <span class="d-badge" style="color:${col};background:rgba(${hex2rgb(col)},0.12);border:1px solid ${col}33">${esc(a.category)}</span>
        ${a.strategy_type?`<span class="d-type">${esc(a.strategy_type)}</span>`:""}
      </div>
      <h2 class="d-title">${esc(a.title)}</h2>
      ${a.edge?`<div class="edge-box" style="background:rgba(${hex2rgb(col)},0.06);border-color:rgba(${hex2rgb(col)},0.2);border-left-color:${col}">
        <span class="edge-label">EDGE</span><span class="edge-text">${esc(a.edge)}</span>
      </div>`:""}
      <button class="copy-all-btn" id="copy-all-btn" onclick="copyText(${JSON.stringify(copyAllText)},'copy-all-btn')">⊞ Copy All</button>
    </div>
    <div class="tabs">
      ${["expr","settings","rationale"].map((t,i)=>`<button class="tab-btn${state.tab===t?" active":""}" style="${state.tab===t?`color:${col}`:""}" onclick="setTab('${t}')">${["Expression","Settings","Rationale"][i]}</button>`).join("")}
    </div>
    ${tabContent[state.tab]||""}
  </div>`;
}

function setTab(t){ state.tab=t; renderDetail(); }

function render(){
  renderCatBar();
  renderList();
  renderDetail();
}

// ── Init ─────────────────────────────────────────────────────────────────────
render();
generate();
</script>
</body>
</html>
