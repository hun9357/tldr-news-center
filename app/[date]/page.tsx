import Link from "next/link";
import { notFound } from "next/navigation";
import { countArticles, findArticle, getAllDates, getDigest, type Digest } from "@/lib/digest";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllDates().map((date) => ({ date }));
}

function getReadingQueue(digest: Digest) {
  const big = findArticle(digest, digest.bigStoryId);
  const items = digest.editions.flatMap((edition) =>
    edition.items.map((item) => ({ edition, item }))
  );
  const rest = items.filter(({ item }) => item.id !== digest.bigStoryId);
  return [...(big ? [big] : []), ...rest].slice(0, 3);
}

export default function DigestPage({ params }: { params: { date: string } }) {
  const d = getDigest(params.date);
  if (!d) {
    notFound();
    throw new Error("not found");
  }

  const total = countArticles(d);
  const big = findArticle(d, d.bigStoryId);
  const queue = getReadingQueue(d);

  return (
    <div className="digest-shell">
      <section className="digest-hero">
        <div className="hero-copy">
          <Link href="/" className="backlink">← 아카이브</Link>
          <div className="eyebrow"><span className="status-dot" />{d.date} · {d.weekday}요일</div>
          <h1><span>{d.headline}</span></h1>
          <p className="lead">{d.subtitle}</p>
          <div className="hero-actions">
            {big && <Link className="button primary" href={`/${d.date}/${big.item.id}`}>빅스토리 읽기 <span>→</span></Link>}
            <a className="button secondary" href="#editions">에디션 보기</a>
          </div>
          <div className="metric-grid compact" aria-label="오늘 브리핑 요약">
            <div className="metric"><strong>{d.editions.length}</strong><span>뉴스레터</span></div>
            <div className="metric"><strong>{total}</strong><span>분석 기사</span></div>
            <div className="metric"><strong className="keyword-value">{d.keyword}</strong><span>대표 키워드</span></div>
          </div>
        </div>

        <aside className="brief-panel reading-queue" aria-labelledby="queue-title">
          <div className="panel-head">
            <h2 id="queue-title">읽기 큐</h2>
            <span>우선순위순</span>
          </div>
          <div className="queue-list">
            {queue.map(({ edition, item }, index) => (
              <Link key={item.id} href={`/${d.date}/${item.id}`} className="queue-item">
                <span className="rank">{index + 1}</span>
                <span className="queue-copy">
                  <span className="queue-title">{item.title}</span>
                  <span className="queue-meta">{edition.name} · {item.source}</span>
                </span>
                <span className="category-badge" style={{ color: edition.color, background: edition.color + "18" }}>{edition.name}</span>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <nav className="edition-nav" id="editions" aria-label="에디션 빠른 이동">
        {d.editions.map((e) => (
          <a key={e.slug} href={`#${e.slug}`} className="filter-chip">
            <span className="swatch" style={{ background: e.color }} />{e.name}
          </a>
        ))}
      </nav>

      {big && (
        <section className="section-band" aria-labelledby="big-story-title">
          <div className="section-title">
            <div>
              <h2 id="big-story-title">오늘의 빅스토리</h2>
              <p>가장 먼저 읽을 만한 이슈와 맥락입니다.</p>
            </div>
          </div>
          <Link href={`/${d.date}/${big.item.id}`} className="story-feature">
            <div className="story-copy">
              <span className="tagline">{d.keyword}</span>
              <h3>{big.item.title}</h3>
              <p>{big.item.report.tldr}</p>
              <span className="read-link">전체 분석 리포트 <span>→</span></span>
            </div>
            <div className="story-visual" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </Link>
        </section>
      )}

      {d.editions.map((e) => (
        <section className="section-band edition-section" id={e.slug} key={e.slug}>
          <div className="edition-head">
            <div>
              <span className="edition-kicker" style={{ color: e.color }}>
                <span className="swatch" style={{ background: e.color }} />{e.source}
              </span>
              <h2>{e.name}</h2>
            </div>
            <span className="edition-count">{e.items.length}건</span>
          </div>
          <div className="article-grid">
            {e.items.map((it) => (
              <Link key={it.id} href={`/${d.date}/${it.id}`} className="article-card">
                <div className="article-top">
                  <span className="category-badge" style={{ color: e.color, background: e.color + "18" }}>{e.name}</span>
                  <span className="source">{it.source}</span>
                </div>
                <h3>{it.title}</h3>
                <p>{it.summary}</p>
                <span className="read-link">리포트 보기 <span>→</span></span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <footer className="site-footer">TLDR 데일리 다이제스트 · {d.date} · 광고·채용·스폰서 제외</footer>
    </div>
  );
}
