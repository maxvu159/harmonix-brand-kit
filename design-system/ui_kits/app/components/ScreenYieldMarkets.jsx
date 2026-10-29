// Vaults list screen — Yield Markets

const VAULTS = [
  { key: "delta",   name: "Delta Neutral Vault",  sub: "ETH · 7d lock",    apy: 10.68, tvl: 8.2, color: "#627EEA", strategy: "perp-funding + spot", live: true },
  { key: "option",  name: "Option Wheel Vault",   sub: "ETH · 14d lock",   apy: 14.20, tvl: 4.6, color: "#FFAF1D", strategy: "covered call + LP", live: true },
  { key: "hype",    name: "HYPE Delta Neutral",   sub: "$HYPE · 0d lock",  apy: 8.42,  tvl: 12.1, color: "#50D2C1", strategy: "basis trade · Hyperliquid", live: true, badge: "HIP-3" },
  { key: "pendle",  name: "Pendle Hedging Vault", sub: "PT-ETH · 30d",     apy: 11.34, tvl: 3.1, color: "#B4B4B8", strategy: "drawdown hedge", live: true },
  { key: "renzo",   name: "Renzo Restaking",      sub: "ezETH · flexible", apy: 7.84,  tvl: 5.4, color: "#ACE730", strategy: "LRT + funding", live: true },
  { key: "kelp",    name: "KelpDAO Restaking",    sub: "rsETH · flexible", apy: 7.21,  tvl: 2.8, color: "#075A5A", strategy: "LRT + funding", live: true },
  { key: "solv",    name: "Solv BTC Vault",       sub: "BTC · 14d",        apy: 6.92,  tvl: 1.6, color: "#B080FF", strategy: "covered call", live: false, badge: "Soon" },
];

const ScreenYieldMarkets = ({ onOpenVault }) => (
  <>
    <div className="banner">
      <div>
        <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:8}}>
          <span style={{background:"rgba(226,246,161,0.18)", color:"var(--hmn-yellow)", fontSize:10, padding:"3px 8px", borderRadius:9999, fontFamily:"monospace", letterSpacing:".06em"}}>HIP-3 · LIVE</span>
        </div>
        <h2>Hip-3 Vaults</h2>
        <p>Discover the innovative features of Hip-3 vaults on Hyperliquid — institutional-grade strategies, on-chain settlement.</p>
      </div>
      <div className="stats">
        <div className="stat"><div className="l">Total TVL</div><div className="v">$37.8M</div></div>
        <div className="stat"><div className="l">Avg APY</div><div className="v">9.62%</div></div>
        <div className="stat"><div className="l">Vaults</div><div className="v">7</div></div>
      </div>
    </div>

    <div className="section-card">
      <div className="section-head">
        <div>
          <h3>All vaults</h3>
          <div className="desc">Curated strategies. Click any vault to deposit.</div>
        </div>
        <div className="tabs">
          <button className="tab active">All</button>
          <button className="tab">Stablecoin</button>
          <button className="tab">ETH</button>
          <button className="tab">BTC</button>
          <button className="tab">Restaking</button>
        </div>
      </div>

      <div className="tbl">
        <div className="thead">
          <span>Vault</span>
          <span>APY (7d)</span>
          <span>TVL</span>
          <span>Strategy</span>
          <span>Status</span>
          <span></span>
        </div>
        {VAULTS.map((v) => (
          <div className="tr" key={v.key} onClick={() => onOpenVault(v)}>
            <div className="vault-name">
              <div className="ic" style={{background: v.color}}>{v.name[0]}</div>
              <div>
                <div className="name">{v.name}</div>
                <div className="sub">{v.sub}</div>
              </div>
            </div>
            <span className="num apy">{v.apy.toFixed(2)}%</span>
            <span className="num">${v.tvl.toFixed(1)}M</span>
            <span style={{color:"rgba(255,255,255,0.65)", fontSize:13}}>{v.strategy}</span>
            <span>{v.badge ? <span className="badge">{v.badge}</span> : (v.live ? <span style={{color:"#6FE5A2", fontSize:12}}>● Live</span> : <span style={{color:"rgba(255,255,255,0.3)", fontSize:12}}>● Closed</span>)}</span>
            <button className="deposit-btn">{v.live ? "Deposit" : "Notify"}</button>
          </div>
        ))}
      </div>
    </div>
  </>
);

Object.assign(window, { VAULTS, ScreenYieldMarkets });
