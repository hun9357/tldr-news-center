import Link from "next/link";

type Sync = { sources: number; signals: number; at: string };
type Active = "executive" | "signals" | "big" | "editions" | "archive";

export default function Chrome({
  dateLabel,
  lastUpdated,
  sync,
  active,
  navDate,
}: {
  dateLabel: string;
  lastUpdated?: string;
  sync: Sync;
  active?: Active;
  navDate?: string;
}) {
  const base = navDate ? `/${navDate}` : "/";
  const sections: { key: Active; label: string; href: string }[] = [
    { key: "executive", label: "Executive brief", href: navDate ? base : "/" },
    { key: "signals", label: "Signals", href: navDate ? `${base}#signals` : "/" },
    { key: "big", label: "Big story", href: navDate ? `${base}#big-story` : "/" },
    { key: "editions", label: "Editions", href: navDate ? `${base}#editions` : "/" },
    { key: "archive", label: "Archive", href: "/" },
  ];

  return (
    <>
      <div className="breaking-bar">
        <div className="breaking-label">SYNCED</div>
        <div className="breaking-copy">
          Intelligence brief synced · {sync.sources} sources normalized · {sync.signals} high-priority signals
        </div>
        <time className="breaking-time">{sync.at}</time>
      </div>

      <header className="masthead">
        <div className="masthead-inner">
          <span className="menu-button" aria-hidden="true">☰</span>
          <Link className="brand-lockup" href="/" aria-label="TLDR Daily 홈">
            <strong>TLDR Daily</strong>
            <span>Technology intelligence workspace</span>
          </Link>
          <div className="date-stamp">
            {dateLabel}
            {lastUpdated && <small>최종 업데이트 {lastUpdated}</small>}
          </div>
        </div>
      </header>

      <nav className="section-nav" aria-label="뉴스 섹션">
        <div className="section-nav-inner">
          {sections.map((s) => (
            <Link key={s.key} href={s.href} className={active === s.key ? "active" : undefined}>
              {s.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
