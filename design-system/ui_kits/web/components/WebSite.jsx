// Shared icons for the harmonix-web kit. Match Heroicons/codebase style.

const WebIcon = ({ name, size = 18 }) => {
  const paths = {
    arrow:      <><path d="M5 12h14M13 5l7 7-7 7"/></>,
    plus:       <><path d="M12 5v14M5 12h14"/></>,
    minus:      <><path d="M5 12h14"/></>,
    chevronDown:<><path d="M6 9l6 6 6-6"/></>,
    ext:        <><path d="M15 3h6v6M21 3l-9 9"/><path d="M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/></>,
    backTop:    <><path d="M12 19V5M5 12l7-7 7 7"/></>,
    yield:      <><path d="M3 16l5-5 4 4 8-9"/><path d="M14 6h6v6"/></>,
    bear:       <><circle cx="6" cy="9" r="2.5"/><circle cx="18" cy="9" r="2.5"/><path d="M4 14c2 4 14 4 16 0M9 14v3M15 14v3"/></>,
    precision:  <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
    twitter:    <path d="M22 5.8c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.2-.8.5-1.7.8-2.6 1-1.6-1.7-4.2-1.8-5.9-.2-1 1-1.5 2.4-1.2 3.8C8.4 8.5 5.1 6.8 3 4.2c-1.1 2-.5 4.5 1.4 5.7-.7 0-1.3-.2-1.9-.5 0 2.1 1.5 3.9 3.5 4.3-.6.2-1.3.2-1.9.1.6 1.8 2.2 3 4 3-1.7 1.3-3.7 2-5.8 2 4.5 2.9 10.4 1.7 13.3-2.8 1.3-2 2-4.4 1.9-6.8.8-.6 1.5-1.3 2.1-2.1z"/>,
    telegram:   <path d="M21.4 4.2L2.8 11.5c-.9.4-.9 1.6 0 2l4.2 1.5 1.7 5.2c.2.6 1 .7 1.4.2L13 17l4.3 3.2c.7.5 1.7.1 1.8-.8L21.6 5.4c.1-.7-.5-1.4-1.2-1.2z"/>,
    discord:    <path d="M19 4.3c-1.5-.7-3.1-1.2-4.7-1.3l-.3.5c1.5.4 2.9 1 4.2 1.9-1.6-.8-3.4-1.3-5.2-1.3s-3.6.5-5.2 1.3c1.3-.9 2.7-1.5 4.2-1.9l-.3-.5C9.1 3.1 7.5 3.6 6 4.3 3 8.5 2.2 12.6 2.6 16.6c1.7 1.3 3.4 2 5.1 2.5l1.1-1.7c-1-.4-1.9-.8-2.7-1.4.2-.2.4-.4.7-.5 3.4 1.6 7 1.6 10.4 0 .2.2.4.3.7.5-.8.6-1.7 1-2.7 1.4l1.1 1.7c1.7-.5 3.4-1.2 5.1-2.5.4-4 .4-8-2.8-12.3zM9.5 14c-1 0-1.9-.9-1.9-2.1S8.5 9.8 9.5 9.8s1.9.9 1.9 2.1S10.5 14 9.5 14zm5 0c-1 0-1.9-.9-1.9-2.1s.9-2.1 1.9-2.1 1.9.9 1.9 2.1S15.5 14 14.5 14z"/>,
    github:     <path d="M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1 .8-.2 1.6-.3 2.5-.3s1.7.1 2.5.3c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5C19.1 20.2 22 16.4 22 12c0-5.5-4.5-10-10-10z"/>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
         strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      {paths[name] || null}
    </svg>
  );
};

const Navbar = () => (
  <div className="nav-wrap">
    <nav className="nav">
      <a className="brand" href="#"><img src="../../assets/logos/harmonix-wordmark.svg" alt="Harmonix"/></a>
      <div className="links">
        <a className="link" href="#">About <WebIcon name="chevronDown" size={14}/></a>
        <a className="link" href="#">Community <WebIcon name="chevronDown" size={14}/></a>
        <a className="link" href="#">Dashboard</a>
        <a className="link" href="#">Docs</a>
      </div>
      <a className="cta" href="#">Launch App</a>
    </nav>
  </div>
);

const Hero = () => (
  <section className="hero" data-screen-label="Web · Hero">
    <div className="hero-inner">
      <h1>Reshaping Yield<br/>Optimization</h1>
      <p className="sub">Minimize Risk, Maximize Yield</p>
      <a className="launch" href="#">Launch App <WebIcon name="ext" size={18}/></a>
    </div>
    <div className="meta-badge">
      <div className="ic">Δ</div>
      Delta Neutral · <b>10.68% APY</b>
    </div>
    <svg className="subtract" viewBox="0 0 1112 708" fill="none">
      <g style={{mixBlendMode:"soft-light"}} opacity="0.7">
        <path fillRule="evenodd" clipRule="evenodd" d="M141.67 176.655L381.606 327.771C429.262 252.445 561.08 85.5986 707.101 20.8177C889.627 -60.1585 1089.19 123.718 1106.54 241.864C1123.89 360.009 1085.9 537.888 973.226 703.032L735.053 551.997C695.883 617.621 586.508 766.509 462.374 837.074C307.207 925.281 173.486 858.19 75.3382 768.477C-22.8094 678.763 -44.3702 457.727 141.67 176.655ZM423.527 357.209C449.528 316.044 520.892 206.073 599.396 170.641C677.9 135.209 763.168 163.08 780.968 251.03C798.767 338.98 723.617 476.408 656.191 575.33C588.766 674.252 487.264 761.337 399.33 715.224C311.396 669.111 300.309 546.064 423.527 357.209Z" stroke="url(#sg)"/>
      </g>
      <defs>
        <linearGradient id="sg" x1="1034.73" y1="676" x2="-351.7" y2="301.92" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff"/>
          <stop offset="1" stopColor="#E2F6A1" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  </section>
);

const STEPS = [
  {
    key: "earn",
    title: "Earn",
    desc: "Earn attractive yields with vaults leveraging hedge-fund strategies effective in all market conditions.",
    card: {
      label: "Best APY · Delta Neutral",
      val:   "10.68%",
      small: "USDC vault · 7-day lock",
      strategies: [
        { name: "Delta Neutral Vault",  apy: "10.68%" },
        { name: "Option Wheel Vault",   apy: "14.20%" },
        { name: "HYPE Delta Neutral",   apy: "8.42%"  },
        { name: "Pendle Hedging Vault", apy: "11.34%" },
      ],
    },
  },
  {
    key: "stake",
    title: "Stake",
    desc: "Stake your $HYPE into validators like ValiDAO, Alphaticks, HyperStake, Nansen ×  HypurrCollective to receive stHype and generate yields.",
    card: {
      label: "Total staked",
      val:   "$12.4M",
      small: "across 5 validators",
      strategies: [
        { name: "ValiDAO",             apy: "12.30%" },
        { name: "AlphaTicks",          apy: "11.85%" },
        { name: "HyperStake",          apy: "11.20%" },
        { name: "Nansen × Hypurr",     apy: "10.74%" },
      ],
    },
  },
  {
    key: "swap",
    title: "Swap",
    desc: "Swap popular token pairs directly on Hyperliquid. Enjoy seamless swaps with minimal slippage.",
    card: {
      label: "Best route",
      val:   "0.02%",
      small: "avg slippage · 24h",
      strategies: [
        { name: "USDC → HYPE",  apy: "+0.04%" },
        { name: "USDC → kHYPE", apy: "+0.02%" },
        { name: "USDC → stETH", apy: "+0.06%" },
        { name: "USDC → BTC",   apy: "+0.01%" },
      ],
    },
  },
];

const EarnSection = () => {
  const [active, setActive] = React.useState("earn");
  const cur = STEPS.find(s => s.key === active);
  return (
    <section className="earn-section" data-screen-label="Web · Earn / Stake / Swap">
      <div className="earn-grid">
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s.key} className={"step" + (active === s.key ? " active" : "")}
                 onMouseEnter={() => setActive(s.key)}>
              <div className="n" onClick={() => setActive(s.key)}>{i + 1}</div>
              {active === s.key ? (
                <div className="body">
                  <h2>{s.title}</h2>
                  <p>{s.desc}</p>
                  <a href="#" className="btn-prim">Launch App <WebIcon name="ext" size={14}/></a>
                </div>
              ) : (
                <div className="label" onClick={() => setActive(s.key)}>{s.title}</div>
              )}
              <span className="line"></span>
            </div>
          ))}
        </div>

        <div className="earn-card">
          <div className="head">
            <div>
              <div className="lbl">{cur.card.label}</div>
              <div className="val">{cur.card.val}</div>
              <div className="small">{cur.card.small}</div>
            </div>
            <span className="pill">● Live</span>
          </div>
          <div className="strategy-list">
            {cur.card.strategies.map(st => (
              <div key={st.name} className="sr">
                <span className="nm">{st.name}</span>
                <span className="ap">{st.apy}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const CoreTechnology = () => {
  const tech = [
    { icon: "yield",     title: "Yield Optimization", text: "Maximising returns while preserving upside potential by using sophisticated yield optimisers." },
    { icon: "bear",      title: "Bear Market Yield",  text: "Harmonix's key differentiator — generating consistent yield even in bearish markets.", shift: true },
    { icon: "precision", title: "Precise Execution",  text: "Minimising slippage and optimising transaction efficiency for on-chain orders." },
  ];
  return (
    <section className="core-section" data-screen-label="Web · Core Technology">
      <h2>Core Technology</h2>
      <div className="core-grid">
        {tech.map(t => (
          <div key={t.title} className={"core-card" + (t.shift ? " shift" : "")}>
            <div className="ic"><WebIcon name={t.icon} size={40}/></div>
            <h3>{t.title}</h3>
            <p>{t.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const PARTNERS = ["Hyperliquid", "Pendle", "EigenLayer", "Renzo", "KelpDAO", "Etherfi", "Puffer", "Wormhole", "Pyth", "Goldlink"];
const PartnerSection = () => (
  <section className="partner-section" data-screen-label="Web · Partners">
    <h2>Backed by the best</h2>
    <p className="sub">Trusted protocols. Audited contracts. Battle-tested infrastructure.</p>
    <div className="partner-grid">
      {PARTNERS.map(p => <a className="partner" href="#" key={p}>{p}</a>)}
    </div>
  </section>
);

const FAQ_DATA = [
  { q: "What is Harmonix Finance?", a: "Harmonix Finance is a DeFi platform that transforms sophisticated hedge-fund strategies into accessible, automated vaults — letting any user access curated investment strategies." },
  { q: "What sets Harmonix apart from other DeFi platforms?", a: "Innovative strategies inspired by traditional finance (delta-neutral, option wheels, basis trades) adapted for DeFi — with a strong emphasis on transparency and security." },
  { q: "How does Harmonix benefit investors?", a: "Harmonix automates complex trading strategies, balances risk and reward, surfaces real-time performance metrics, and prioritises transparency and security." },
  { q: "How can I start using Harmonix?", a: "Visit our platform, connect your wallet, explore the available vaults, select the one that suits your goals, and deposit your assets to start earning yields." },
  { q: "What are the main vault strategies?", a: "Option Wheel Vault (LP + option premium), Delta Neutral Vault (perp funding + spot), Restaking Vaults (LRTs), Pendle Hedging Vault (PT-ETH drawdown hedge), and Hip-3 Vaults on Hyperliquid." },
  { q: "Has Harmonix launched a token yet?", a: "Not yet. Join our Discord and follow our X account to receive the latest updates on the $HMN token generation event." },
];
const FAQSection = () => {
  const [open, setOpen] = React.useState(0);
  return (
    <section className="faq-section" data-screen-label="Web · FAQ">
      <div className="faq-grid">
        <div className="ttl-block">
          <h2>FAQs</h2>
          <p>Don't see the answer you're looking for?</p>
          <a href="#" className="btn-ghost">Get in touch <WebIcon name="arrow" size={16}/></a>
        </div>
        <div className="faq-list">
          {FAQ_DATA.map((it, i) => (
            <div className={"faq-item" + (open === i ? " open" : "")} key={i}>
              <div className="faq-head" onClick={() => setOpen(open === i ? -1 : i)}>
                <span className="q">{it.q}</span>
                <WebIcon name={open === i ? "minus" : "plus"} size={20}/>
              </div>
              <div className="faq-body">{it.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="footer" data-screen-label="Web · Footer">
    <div className="footer-grid">
      <div>
        <img src="../../assets/logos/HMN-Logo-green.svg" alt="Harmonix"/>
        <h3>Minimize Risk, Maximize Yield</h3>
      </div>
      <div className="footer-cols">
        <div className="footer-col">
          <h4>About</h4>
          <ul>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Audit</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Community</h4>
          <ul>
            <li><a href="#"><WebIcon name="github" size={18}/>Github</a></li>
            <li><a href="#"><WebIcon name="telegram" size={18}/>Telegram</a></li>
            <li><a href="#"><WebIcon name="twitter" size={18}/>Twitter</a></li>
            <li><a href="#"><WebIcon name="discord" size={18}/>Discord</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>&nbsp;</h4>
          <ul>
            <li><a href="#">Dashboard</a></li>
            <li><a href="#">Docs</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div className="brand-text">HARMONIX</div>
    <div className="footer-bottom">
      <span>© {new Date().getFullYear()} Harmonix Finance</span>
      <a className="back-top" href="#"><WebIcon name="backTop" size={18}/></a>
    </div>
  </footer>
);

Object.assign(window, { WebIcon, Navbar, Hero, EarnSection, CoreTechnology, PartnerSection, FAQSection, Footer });
