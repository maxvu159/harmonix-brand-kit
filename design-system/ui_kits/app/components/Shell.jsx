// Shared atoms for the harmonix-app UI kit
// Exported to window for use by other Babel-compiled files.

const { useState, useEffect } = React;

const Icon = ({ name, size = 18 }) => {
  const paths = {
    home:      <path d="M3 12L12 3l9 9M5 10v10h14V10"/>,
    shield:    <path d="M12 2l8 4v6c0 5-3 8-8 10-5-2-8-5-8-10V6z"/>,
    stack:     <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5"/>,
    vault:     <><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></>,
    layers:    <path d="M4 7h16M4 12h16M4 17h16"/>,
    swap:      <path d="M8 5l-4 4 4 4M16 11l4 4-4 4M4 9h12M8 15h12"/>,
    portfolio: <path d="M3 21V10l9-7 9 7v11H3z"/>,
    dash:      <><rect x="3" y="13" width="4" height="8"/><rect x="10" y="8" width="4" height="13"/><rect x="17" y="3" width="4" height="18"/></>,
    gift:      <><rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9c-2 0-4-1-4-3s2-3 4 0c2-3 4-2 4 0s-2 3-4 3z"/></>,
    star:      <path d="M12 2l3 7 7 .8-5 5 1.5 7L12 18l-6.5 3.8L7 14.8l-5-5L9 9z"/>,
    twitter:   <path d="M22 5.8c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.2-.8.5-1.7.8-2.6 1-1.6-1.7-4.2-1.8-5.9-.2-1 1-1.5 2.4-1.2 3.8C8.4 8.5 5.1 6.8 3 4.2c-1.1 2-.5 4.5 1.4 5.7-.7 0-1.3-.2-1.9-.5 0 2.1 1.5 3.9 3.5 4.3-.6.2-1.3.2-1.9.1.6 1.8 2.2 3 4 3-1.7 1.3-3.7 2-5.8 2 4.5 2.9 10.4 1.7 13.3-2.8 1.3-2 2-4.4 1.9-6.8.8-.6 1.5-1.3 2.1-2.1z"/>,
    telegram:  <path d="M21.4 4.2L2.8 11.5c-.9.4-.9 1.6 0 2l4.2 1.5 1.7 5.2c.2.6 1 .7 1.4.2L13 17l4.3 3.2c.7.5 1.7.1 1.8-.8L21.6 5.4c.1-.7-.5-1.4-1.2-1.2z"/>,
    discord:   <path d="M19 4.3c-1.5-.7-3.1-1.2-4.7-1.3l-.3.5c1.5.4 2.9 1 4.2 1.9-1.6-.8-3.4-1.3-5.2-1.3s-3.6.5-5.2 1.3c1.3-.9 2.7-1.5 4.2-1.9l-.3-.5C9.1 3.1 7.5 3.6 6 4.3 3 8.5 2.2 12.6 2.6 16.6c1.7 1.3 3.4 2 5.1 2.5l1.1-1.7c-1-.4-1.9-.8-2.7-1.4.2-.2.4-.4.7-.5 3.4 1.6 7 1.6 10.4 0 .2.2.4.3.7.5-.8.6-1.7 1-2.7 1.4l1.1 1.7c1.7-.5 3.4-1.2 5.1-2.5.4-4 .4-8-2.8-12.3zM9.5 14c-1 0-1.9-.9-1.9-2.1S8.5 9.8 9.5 9.8s1.9.9 1.9 2.1S10.5 14 9.5 14zm5 0c-1 0-1.9-.9-1.9-2.1s.9-2.1 1.9-2.1 1.9.9 1.9 2.1S15.5 14 14.5 14z"/>,
    github:    <path d="M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1 .8-.2 1.6-.3 2.5-.3s1.7.1 2.5.3c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5C19.1 20.2 22 16.4 22 12c0-5.5-4.5-10-10-10z"/>,
    book:      <path d="M4 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V5zM4 17h14"/>,
    arrowUp:   <path d="M12 19V5M5 12l7-7 7 7"/>,
    arrowDown: <path d="M12 5v14M5 12l7 7 7-7"/>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M12 1l1.5 3.5L17 6l3.5 1.5L22 11l-3.5 1.5L17 16l-3.5 1.5L12 21l-1.5-3.5L7 16l-3.5-1.5L2 13l3.5-1.5L7 8l3.5-1.5L12 1z"/></>,
    bell:      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>,
    chevron:   <path d="M9 6l6 6-6 6"/>,
    plus:      <path d="M12 5v14M5 12h14"/>,
    minus:     <path d="M5 12h14"/>,
    check:     <path d="M5 13l4 4L19 7"/>,
    ext:       <><path d="M15 3h6v6"/><path d="M21 3l-9 9"/><path d="M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/></>,
    flash:     <path d="M13 2L4 14h7v8l9-12h-7V2z"/>,
    coin:      <><circle cx="12" cy="12" r="9"/><path d="M12 8v8M9 10c0-1 1.5-2 3-2s3 1 3 2-1 2-3 2-3 1-3 2 1.5 2 3 2 3-1 3-2"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
         strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      {paths[name] || null}
    </svg>
  );
};

const Sidebar = ({ active, onNav, totalAssets = "$24.6M" }) => {
  const groups = [
    { items: [{ icon: "home", label: "Home", key: "home" }] },
    { title: "Harmonix",
      items: [
        { icon: "shield", label: "Protection Vault", key: "protection" },
        { icon: "stack",  label: "HAR Staking",      key: "har" },
      ]},
    { title: "Products",
      items: [
        { icon: "vault",  label: "Yield Markets", key: "yield", badge: "NEW" },
        { icon: "layers", label: "Stake",         key: "stake" },
        { icon: "swap",   label: "Swap",          key: "swap" },
      ]},
    { title: "Stats",
      items: [
        { icon: "portfolio", label: "Portfolio",  key: "portfolio" },
        { icon: "dash",      label: "Dashboard",  key: "dashboard" },
      ]},
    { title: "Rewards",
      items: [
        { icon: "star", label: "Referral Program", key: "referral" },
        { icon: "gift", label: "Points Reward",    key: "points" },
      ]},
  ];

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <img src="../../assets/logos/HMN-Logo-yellow.svg" alt="Harmonix"/>
        <span className="tag">BETA</span>
      </div>
      <div className="total-card">
        <div className="lbl">Total assets</div>
        <div className="val">{totalAssets}</div>
      </div>
      {groups.map((g, gi) => (
        <div className="nav-group" key={gi}>
          {g.title && <div className="title"><span>{g.title}</span><hr/></div>}
          <div className="nav-list">
            {g.items.map((it) => (
              <a className={"nav-item" + (active === it.key ? " active" : "")}
                 key={it.key}
                 onClick={(e) => { e.preventDefault(); onNav && onNav(it.key); }}
                 href="#">
                <Icon name={it.icon}/>
                <span>{it.label}</span>
                {it.badge && <span className="badge">{it.badge}</span>}
              </a>
            ))}
          </div>
        </div>
      ))}

      <div className="audit-card">
        <div className="ttl">Audited by</div>
        <div className="audit-row">
          <span className="a">Verichains</span>
          <span className="a">Shieldify</span>
          <span className="a">Zenith</span>
        </div>
        <div className="social-row">
          <a href="#" aria-label="Twitter"><Icon name="twitter"/></a>
          <a href="#" aria-label="Telegram"><Icon name="telegram"/></a>
          <a href="#" aria-label="Discord"><Icon name="discord"/></a>
          <a href="#" aria-label="Github"><Icon name="github"/></a>
          <a href="#" aria-label="Blog"><Icon name="book"/></a>
        </div>
      </div>
    </aside>
  );
};

const TopBar = ({ title, crumbs, walletConnected, onConnect }) => (
  <div className="topbar">
    <div>
      {crumbs && <div className="crumbs">{crumbs}</div>}
      <div className="title">{title}</div>
    </div>
    <div className="right">
      <button className="wallet-btn connected" style={{padding: "8px 12px"}}><Icon name="bell" size={16}/></button>
      <button className="wallet-btn connected" style={{padding: "8px 12px"}}><Icon name="settings" size={16}/></button>
      {walletConnected ? (
        <button className="wallet-btn connected"><span className="dot"></span>0x7a2b…F4a1</button>
      ) : (
        <button className="wallet-btn" onClick={onConnect}>Connect wallet</button>
      )}
    </div>
  </div>
);

Object.assign(window, { Icon, Sidebar, TopBar });
