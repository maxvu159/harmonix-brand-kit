// Vault detail screen — chart + KPIs + deposit panel

const { useState: useStateD } = React;

const APYChart = ({ color = "#6FE5A2" }) => {
  // Generate a soft trending-up area chart
  const pts = [];
  let y = 60;
  for (let i = 0; i <= 60; i++) {
    y += (Math.sin(i / 6) * 4) + (Math.random() - 0.3) * 2;
    y = Math.max(20, Math.min(110, y));
    pts.push([i * (560 / 60), y]);
  }
  const linePath = "M" + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L");
  const areaPath = linePath + ` L560,140 L0,140 Z`;
  return (
    <svg viewBox="0 0 560 140" preserveAspectRatio="none">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[30,60,90,120].map(y => (
        <line key={y} x1="0" x2="560" y1={y} y2={y} stroke="rgba(255,255,255,0.04)"/>
      ))}
      <path d={areaPath} fill="url(#g1)"/>
      <path d={linePath} stroke={color} strokeWidth="1.8" fill="none"/>
    </svg>
  );
};

const ScreenVaultDetail = ({ vault, onBack, onDeposit }) => {
  const [tab, setTab] = useStateD("deposit");
  const [amount, setAmount] = useStateD("1,000");
  const [range, setRange] = useStateD("30d");
  const v = vault;

  return (
    <>
      <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:6}}>
        <button onClick={onBack} style={{color:"rgba(255,255,255,0.5)", fontSize:13}}>← Yield Markets</button>
      </div>
      <div style={{display:"flex", alignItems:"center", gap:16, marginBottom:24}}>
        <div style={{width:54, height:54, borderRadius:9999, background:v.color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:20, fontWeight:700}}>{v.name[0]}</div>
        <div>
          <div style={{fontSize:11, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:".04em"}}>{v.strategy}</div>
          <div style={{fontSize:28, fontWeight:600, color:"white", marginTop:2}}>{v.name}</div>
        </div>
        <span style={{marginLeft:"auto", padding:"6px 12px", background:"rgba(14,203,129,0.14)", color:"#6FE5A2", borderRadius:9999, fontSize:12, fontWeight:500}}>● Live · audited</span>
      </div>

      <div className="detail-grid">
        <div>
          <div className="kpi-row">
            <div className="kpi apy"><div className="l">APY (7d)</div><div className="v">{v.apy.toFixed(2)}%</div></div>
            <div className="kpi"><div className="l">TVL</div><div className="v">${v.tvl.toFixed(1)}M</div></div>
            <div className="kpi"><div className="l">Capacity</div><div className="v">$15.0M</div></div>
            <div className="kpi"><div className="l">Lock period</div><div className="v">{v.sub.split("·")[1].trim()}</div></div>
          </div>

          <div className="chart">
            <div className="chart-head">
              <div>
                <div style={{fontSize:11, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:".04em"}}>Vault performance</div>
                <div style={{display:"flex", alignItems:"baseline", gap:8, marginTop:4}}>
                  <div className="num">$1.0824</div>
                  <div className="delta">+8.24% YTD</div>
                </div>
              </div>
              <div className="tabs" style={{background:"rgba(255,255,255,0.04)"}}>
                {["7d","30d","90d","1y","All"].map(r => (
                  <button key={r} className={"tab" + (range===r?" active":"")} onClick={() => setRange(r)}>{r}</button>
                ))}
              </div>
            </div>
            <APYChart/>
          </div>

          <div className="section-card" style={{marginTop:16}}>
            <div className="section-head"><div><h3>Strategy</h3></div></div>
            <p style={{color:"rgba(255,255,255,0.7)", fontSize:14, lineHeight:1.6, maxWidth:640}}>
              The {v.name} maintains equivalent long and short positions, achieving delta-neutrality and capitalising on yield opportunities while mitigating directional risk. The strategy shorts ETH on perp markets with favourable funding rates while holding ETH spot to remain delta-neutral against USD.
            </p>
            <div style={{display:"flex", gap:8, marginTop:14, flexWrap:"wrap"}}>
              <span className="badge" style={{padding:"5px 10px", borderRadius:9999, background:"rgba(226,246,161,0.14)", color:"var(--hmn-yellow)", fontSize:11}}>Delta neutral</span>
              <span className="badge" style={{padding:"5px 10px", borderRadius:9999, background:"rgba(255,255,255,0.06)", color:"white", fontSize:11}}>Perp funding</span>
              <span className="badge" style={{padding:"5px 10px", borderRadius:9999, background:"rgba(255,255,255,0.06)", color:"white", fontSize:11}}>Hyperliquid</span>
              <span className="badge" style={{padding:"5px 10px", borderRadius:9999, background:"rgba(255,255,255,0.06)", color:"white", fontSize:11}}>Audited × 3</span>
            </div>
          </div>
        </div>

        <div className="deposit-panel">
          <div className="tabs">
            <button className={"tab" + (tab==="deposit"?" active":"")} onClick={() => setTab("deposit")}>Deposit</button>
            <button className={"tab" + (tab==="withdraw"?" active":"")} onClick={() => setTab("withdraw")}>Withdraw</button>
          </div>

          <div style={{fontSize:11, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:".04em", marginBottom:8}}>You {tab === "deposit" ? "deposit" : "withdraw"}</div>
          <div className="amount-box">
            <input value={amount} onChange={(e) => setAmount(e.target.value)}/>
            <div className="right">
              <span className="max">MAX</span>
              <span className="tok"><span className="d"></span>USDC</span>
            </div>
          </div>
          <div className="balance-row">
            <span>Balance: 4,201.85 USDC</span>
            <span>≈ ${(parseFloat(amount.replace(/,/g,"")) || 0).toLocaleString(undefined, {maximumFractionDigits:2})}</span>
          </div>

          <div className="summary">
            <div className="r"><span className="l">Strategy APY</span><span className="v apy">{v.apy.toFixed(2)}%</span></div>
            <div className="r"><span className="l">Est. annual yield</span><span className="v">${((parseFloat(amount.replace(/,/g,"")) || 0) * v.apy / 100).toFixed(2)}</span></div>
            <div className="r"><span className="l">Lock period</span><span className="v">{v.sub.split("·")[1].trim()}</span></div>
            <div className="r"><span className="l">Performance fee</span><span className="v">10%</span></div>
          </div>

          <button className="cta" onClick={() => onDeposit && onDeposit(amount, v)}>
            {tab === "deposit" ? `Deposit ${amount} USDC` : "Initiate withdrawal"}
          </button>

          <p style={{fontSize:11, color:"rgba(255,255,255,0.4)", textAlign:"center", marginTop:12, lineHeight:1.5}}>
            By depositing you agree to the vault's risk disclosure. Withdrawals settle after the lock period.
          </p>
        </div>
      </div>
    </>
  );
};

Object.assign(window, { ScreenVaultDetail });
