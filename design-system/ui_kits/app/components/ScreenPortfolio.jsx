// Portfolio + Swap screens (also dashboard-lite for variety)

const ScreenPortfolio = ({ onOpenVault }) => {
  const positions = [
    { ...VAULTS[0], deposited: 5000, pnl: 142.30, share: 0.41 },
    { ...VAULTS[1], deposited: 2500, pnl: 86.20,  share: 0.21 },
    { ...VAULTS[2], deposited: 4621.85, pnl: 28.94, share: 0.38 },
  ];
  const totalDeposited = positions.reduce((s, p) => s + p.deposited, 0);
  const totalPnl       = positions.reduce((s, p) => s + p.pnl, 0);

  return (
    <>
      <div className="banner" style={{background:"linear-gradient(135deg, #032620 0%, #173132 60%, #1D3637 100%)"}}>
        <div>
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:8}}>
            <span style={{background:"rgba(226,246,161,0.18)", color:"var(--hmn-yellow)", fontSize:10, padding:"3px 8px", borderRadius:9999, fontFamily:"monospace", letterSpacing:".06em"}}>0x7a2b…F4a1</span>
            <span style={{color:"rgba(255,255,255,0.5)", fontSize:11}}>Connected via Rainbow</span>
          </div>
          <h2>Your portfolio</h2>
          <p>Track every open position, yield earned, and pending withdrawal in one place.</p>
        </div>
        <div className="stats">
          <div className="stat"><div className="l">Net deposit</div><div className="v">${totalDeposited.toLocaleString()}</div></div>
          <div className="stat"><div className="l">Total earned</div><div className="v" style={{color:"#6FE5A2"}}>+${totalPnl.toFixed(2)}</div></div>
          <div className="stat"><div className="l">Avg APY</div><div className="v">9.74%</div></div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-head">
          <div>
            <h3>Active positions</h3>
            <div className="desc">{positions.length} vaults · auto-compounding</div>
          </div>
          <div className="tabs">
            <button className="tab active">Active</button>
            <button className="tab">Pending</button>
            <button className="tab">Closed</button>
          </div>
        </div>
        <div className="tbl">
          <div className="thead" style={{gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 100px"}}>
            <span>Vault</span>
            <span>Deposited</span>
            <span>PnL</span>
            <span>APY</span>
            <span>Share</span>
            <span></span>
          </div>
          {positions.map(p => (
            <div className="pos-row" key={p.key} onClick={() => onOpenVault(p)} style={{cursor:"pointer"}}>
              <div className="vault-name" style={{display:"flex", alignItems:"center", gap:12}}>
                <div className="ic" style={{background:p.color, width:36, height:36, borderRadius:9999, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700}}>{p.name[0]}</div>
                <div>
                  <div style={{color:"white", fontWeight:500}}>{p.name}</div>
                  <div style={{fontSize:11, color:"rgba(255,255,255,0.45)", fontFamily:"monospace"}}>{p.sub}</div>
                </div>
              </div>
              <span className="num" style={{fontFamily:"monospace", color:"white"}}>${p.deposited.toLocaleString()}</span>
              <span className="num" style={{fontFamily:"monospace", color:"#6FE5A2"}}>+${p.pnl.toFixed(2)}</span>
              <span className="num" style={{fontFamily:"monospace", color:"var(--hmn-yellow)", fontWeight:600}}>{p.apy.toFixed(2)}%</span>
              <span className="num" style={{fontFamily:"monospace", color:"white"}}>{(p.share*100).toFixed(0)}%</span>
              <button className="deposit-btn">Manage</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const ScreenSwap = () => {
  const [from, setFrom] = React.useState("USDC");
  const [to, setTo]     = React.useState("HYPE");
  const [amount, setAmount] = React.useState("250.00");

  return (
    <div style={{maxWidth:560, margin:"40px auto 0"}}>
      <div className="swap-card">
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18}}>
          <h3 style={{margin:0}}>Swap</h3>
          <button style={{color:"rgba(255,255,255,0.6)"}}><Icon name="settings"/></button>
        </div>

        <div style={{fontSize:11, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:".04em", marginBottom:8}}>You pay</div>
        <div className="amount-box">
          <input value={amount} onChange={(e) => setAmount(e.target.value)}/>
          <div className="right"><span className="max">MAX</span><span className="tok"><span className="d"></span>{from}</span></div>
        </div>
        <div className="balance-row" style={{marginBottom:14}}>
          <span>Balance: 4,201.85 {from}</span><span>≈ ${parseFloat(amount.replace(/,/g,"")).toFixed(2)}</span>
        </div>

        <div style={{display:"flex", justifyContent:"center", margin:"-6px 0"}}>
          <button style={{width:36, height:36, borderRadius:9999, background:"var(--d-bg-card)", border:"3px solid var(--d-bg)", color:"white", display:"flex", alignItems:"center", justifyContent:"center"}}
                  onClick={() => { const f = from; setFrom(to); setTo(f); }}>
            <Icon name="swap" size={16}/>
          </button>
        </div>

        <div style={{fontSize:11, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:".04em", marginBottom:8, marginTop:6}}>You receive</div>
        <div className="amount-box">
          <input value={(parseFloat(amount.replace(/,/g,"")) * 0.063).toFixed(4)} readOnly/>
          <div className="right"><span className="tok"><span className="d" style={{background:"linear-gradient(135deg,#50D2C1,#2DAB97)"}}></span>{to}</span></div>
        </div>

        <div style={{padding:"12px 0", borderTop:"1px dashed rgba(255,255,255,0.08)", borderBottom:"1px dashed rgba(255,255,255,0.08)", margin:"14px 0", fontSize:13, color:"rgba(255,255,255,0.7)"}}>
          <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}><span>Rate</span><span style={{color:"white", fontFamily:"monospace"}}>1 {from} = 0.063 {to}</span></div>
          <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}><span>Route</span><span style={{color:"white"}}>Hyperliquid spot</span></div>
          <div style={{display:"flex", justifyContent:"space-between"}}><span>Network fee</span><span style={{color:"white", fontFamily:"monospace"}}>≈ $0.01</span></div>
        </div>

        <button className="cta" style={{width:"100%", padding:14, borderRadius:9999, background:"var(--hmn-yellow)", color:"var(--hmn-green)", fontWeight:600}}>Swap {amount} {from}</button>
      </div>
    </div>
  );
};

Object.assign(window, { ScreenPortfolio, ScreenSwap });
