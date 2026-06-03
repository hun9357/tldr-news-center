import Link from "next/link";
import { notFound } from "next/navigation";
import Chrome from "@/components/Chrome";
import {
  countArticles,
  countInsights,
  countReports,
  findArticle,
  getAllDates,
  getDigest,
  headlineTitles,
  readingQueue,
} from "@/lib/digest";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllDates().map((date) => ({ date }));
}

export default function DigestPage({ params }: { params: { date: string } }) {
  const d = getDigest(params.date);
  if (!d) {
    notFound();
    throw new Error("not found");
  }

  const total = countArticles(d);
  const big = findArticle(d, d.bigStoryId);
  const intel = big?.item.intel;
  const queue = readingQueue(d, 5);

  return (
    <>
      <Chrome
        dateLabel={`${d.date} ${d.weekday}요일`}
        lastUpdated={d.lastUpdated}
        sync={{ sources: d.editions.length, signals: d.signals?.length ?? 0, at: d.syncedAt ?? "09:00" }}
        active="executive"
        navDate={d.date}
      />
      <main className="page">
        <section className="issue-hero" aria-label="오늘의 브리핑">
          {big && (
            <article className="lead-story">
              <span className="category">Executive intelligence</span>
              <h1 className="lead-title">{big.item.title}</h1>
              <p className="lead-summary">{big.item.report.tldr}</p>
              {intel && (
                <div className="intel-strip" aria-label="브리핑 인텔리전스 지표">
                  <div className="intel-card"><span>Impact level</span><strong>{intel.impact ?? "—"}</strong><small>{intel.affectedSurface ?? big.edition.name}</small></div>
                  <div className="intel-card"><span>Confidence</span><strong>{intel.confidence ?? "—"}</strong><small>corroborated</small></div>
                  <div className="intel-card"><span>Affected surface</span><strong>{intel.affectedSurface ?? big.edition.name}</strong><small>scope</small></div>
                  <div className="intel-card"><span>Recommended owner</span><strong>{intel.owner ?? "—"}</strong><small>review</small></div>
                </div>
              )}
              <div className="keyword-line">{d.keyword}</div>
              <div className="actions">
                <Link className="button primary" href={`/${d.date}/${big.item.id}`}>먼저 읽기 →</Link>
                <a className="button" href="#editions">에디션 둘러보기</a>
              </div>
            </article>
          )}

          <aside className="queue-panel" aria-labelledby="daily-queue-title">
            <div className="queue-head">
              <h2 id="daily-queue-title">읽기 큐 <span className="queue-count">{queue.length}</span></h2>
              <span>전체 보기</span>
            </div>
            <div className="queue-list">
              {queue.map(({ edition, item }) => (
                <Link key={item.id} className="queue-row" href={`/${d.date}/${item.id}`}>
                  <span><b style={{ color: edition.color }}>{edition.name}</b>{item.title}</span>
                  <time>{item.source}</time>
                </Link>
              ))}
            </div>
          </aside>
        </section>

        <section className="metrics-strip" aria-label="오늘 브리핑 요약">
          <div className="metric"><span>오늘의 뉴스레터</span><strong>{d.editions.length} <small>발행</small></strong></div>
          <div className="metric"><span>오늘의 기사</span><strong>{total} <small>건</small></strong></div>
          <div className="metric"><span>대표 키워드</span><strong style={{ fontSize: 20 }}>{d.keyword}</strong></div>
          <div className="metric"><span>분석 리포트</span><strong>{countReports(d)} <small>건</small></strong></div>
          <div className="metric"><span>인사이트</span><strong>{countInsights(d)} <small>건</small></strong></div>
          {d.subscribers ? (
            <div className="metric"><span>구독자</span><strong style={{ fontSize: 28 }}>{d.subscribers.toLocaleString()} <small>명</small></strong></div>
          ) : d.market ? (
            <div className="metric"><span>시장</span><strong style={{ fontSize: 18 }}>{d.market.index}<br /><small>{d.market.value} {d.market.change}</small></strong></div>
          ) : (
            <div className="metric"><span>날짜</span><strong style={{ fontSize: 20 }}>{d.date}</strong></div>
          )}
        </section>

        {d.signals && d.signals.length > 0 && (
          <section className="signal-board" id="signals" aria-label="인텔리전스 신호 요약">
            {d.signals.slice(0, 3).map((s, i) => (
              <article key={i} className={`signal-card${s.kind === "primary" ? " primary" : ""}`}>
                <span className="signal-label">{s.kind === "primary" ? "Primary signal" : s.kind === "market" ? "Market signal" : "Watchlist"}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                {(s.severity || s.velocity || s.action) && (
                  <div className="score-row">
                    {s.severity && <span className="score-chip">Severity <strong>{s.severity}</strong></span>}
                    {s.velocity && <span className="score-chip">Velocity <strong>{s.velocity}</strong></span>}
                    {s.action && <span className="score-chip">Action <strong>{s.action}</strong></span>}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}

        <nav className="edition-tabs" id="editions" aria-label="에디션 빠른 이동">
          {d.editions.map((e) => (
            <a key={e.slug} href={`#${e.slug}`}>{e.name}</a>
          ))}
        </nav>

        {big && (
          <section id="big-story" aria-labelledby="big-story-title">
            <div className="section-title-row">
              <h2 id="big-story-title">오늘의 빅스토리</h2>
              <div className="tools">
                {intel?.impact && <span>Impact: {intel.impact}</span>}
                {intel?.confidence && <span>Confidence: {intel.confidence}</span>}
              </div>
            </div>
            <Link className="big-story" href={`/${d.date}/${big.item.id}`}>
              <div className="story-visual">{big.edition.name}</div>
              <div>
                <span className="category">{big.edition.name}</span>
                <h2>{big.item.title}</h2>
                <p>{big.item.report.what ?? big.item.report.tldr}</p>
              </div>
              <aside className="related">
                <h3>관련 읽기</h3>
                <ul>
                  {(big.item.related ?? headlineTitles(d, 3)).slice(0, 3).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </aside>
            </Link>
          </section>
        )}

        {d.editions.map((e) => (
          <section id={e.slug} key={e.slug} style={{ scrollMarginTop: 128 }} aria-label={`${e.name} 기사`}>
            <div className="section-title-row">
              <h2>{e.name}</h2>
              <div className="tools"><span>{e.source}</span><span>{e.items.length}건</span></div>
            </div>
            <div className="article-grid">
              {e.items.map((it) => (
                <Link key={it.id} className="article-card" href={`/${d.date}/${it.id}`}>
                  <b style={{ color: e.color }}>{e.name}</b>
                  <h3>{it.title}</h3>
                  <p>{it.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <footer className="site-footer">TLDR 데일리 다이제스트 · {d.date} · 광고·채용·스폰서 제외</footer>
      </main>
    </>
  );
}
