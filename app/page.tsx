import Link from "next/link";
import Chrome from "@/components/Chrome";
import {
  countArticles,
  findArticle,
  getAllDates,
  getDigest,
  headlineTitles,
  readingQueue,
  sideHeadlines,
  topEditionNames,
} from "@/lib/digest";

export const dynamic = "force-static";

export default function Home() {
  const archives = getAllDates()
    .map((date) => {
      const digest = getDigest(date);
      if (!digest) return null;
      return {
        date,
        digest,
        big: findArticle(digest, digest.bigStoryId),
        total: countArticles(digest),
      };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  const latest = archives[0];

  if (!latest) {
    return (
      <>
        <Chrome dateLabel="아카이브" sync={{ sources: 0, signals: 0, at: "--:--" }} active="archive" />
        <main className="page">
          <div className="empty-state">아직 요약이 없습니다.</div>
        </main>
      </>
    );
  }

  const d = latest.digest;
  const big = latest.big;
  const intel = big?.item.intel;
  const queue = readingQueue(d, 5);
  const side = sideHeadlines(d, 4);

  return (
    <>
      <Chrome
        dateLabel={`${d.date} (${d.weekday})`}
        lastUpdated={d.lastUpdated}
        sync={{ sources: d.editions.length, signals: d.signals?.length ?? 0, at: d.syncedAt ?? "09:00" }}
        active="archive"
        navDate={d.date}
      />
      <main className="page">
        <section className="lead-grid" aria-label="최신 브리핑">
          {big && (
            <article className="lead-story">
              <span className="category">Priority intelligence</span>
              <h1 className="lead-title">{big.item.title}</h1>
              <p className="lead-summary">{big.item.report.tldr}</p>
              {intel && (
                <div className="intel-strip" aria-label="인텔리전스 지표">
                  <div className="intel-card"><span>Impact</span><strong>{intel.impact ?? "—"}</strong><small>{intel.affectedSurface ?? big.edition.name}</small></div>
                  <div className="intel-card"><span>Confidence</span><strong>{intel.confidence ?? "—"}</strong><small>verified sources</small></div>
                  <div className="intel-card"><span>Owner</span><strong>{intel.owner ?? "—"}</strong><small>review</small></div>
                  <div className="intel-card"><span>Status</span><strong>{intel.status ?? "Tracking"}</strong><small>follow-up</small></div>
                </div>
              )}
              <div className="byline">
                <span>TLDR Daily</span>
                <time>{d.lastUpdated ?? d.date}</time>
                <Link href={`/${d.date}/${big.item.id}`}>리포트 →</Link>
              </div>
              <div className="keyword-line">{d.keyword}</div>
            </article>
          )}

          <aside className="side-headlines" aria-label="주요 헤드라인">
            {side.map(({ edition, item }) => (
              <Link key={item.id} className="side-headline" href={`/${d.date}/${item.id}`}>
                <span className="tag" style={{ color: edition.color }}>{edition.name}</span>
                <h2>{item.title}</h2>
                <time>{item.source}</time>
              </Link>
            ))}
          </aside>

          <aside className="queue-panel" aria-labelledby="home-queue-title">
            <div className="queue-head">
              <h2 id="home-queue-title">읽기 큐 <span className="queue-count">{queue.length}</span></h2>
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

        <section className="metrics-strip" aria-label="아카이브 요약">
          <div className="metric"><span>오늘의 브리핑</span><strong>{latest.total} <small>건</small></strong></div>
          <div className="metric"><span>주요 기업</span><strong>{d.stats?.companies ?? "—"} <small>개</small></strong></div>
          <div className="metric"><span>보안 이슈</span><strong>{d.stats?.security ?? "—"} <small>건</small></strong></div>
          <div className="metric"><span>투자/인수</span><strong>{d.stats?.deals ?? "—"} <small>건</small></strong></div>
          <div className="metric"><span>글로벌 정책</span><strong>{d.stats?.policy ?? "—"} <small>건</small></strong></div>
          {d.market ? (
            <div className="metric"><span>시장 요약</span><strong style={{ fontSize: 18 }}>{d.market.index}<br /><small>{d.market.value} {d.market.change}</small></strong></div>
          ) : (
            <div className="metric"><span>아카이브</span><strong>{archives.length} <small>일</small></strong></div>
          )}
        </section>

        <section aria-label="아카이브 인덱스">
          <div className="section-title-row">
            <h2>아카이브</h2>
            <div className="tools"><span>날짜 내림차순 ▾</span></div>
          </div>
          <div className="archive-table">
            <div className="archive-head">
              <span>날짜</span><span>주요 뉴스</span><span>카테고리</span><span>브리핑</span><span>보안 이슈</span><span>투자/인수</span>
            </div>
            {archives.map(({ date, digest, big: b, total }) => {
              const heads = headlineTitles(digest, 3);
              const cats = topEditionNames(digest, 3);
              return (
                <Link key={date} className="archive-row" href={`/${date}`}>
                  <time>{date} ({digest.weekday})</time>
                  <p>
                    {(heads.length ? heads : [b ? b.item.title : digest.headline]).map((h, i, arr) => (
                      <span key={i}>{h}{i < arr.length - 1 ? <br /> : null}</span>
                    ))}
                  </p>
                  <div className="dot-list">{cats.map((c) => <span key={c}>{c}</span>)}</div>
                  <span>{total}건</span>
                  <span>{digest.stats?.security ?? "—"}건</span>
                  <span>{digest.stats?.deals ?? "—"}건</span>
                </Link>
              );
            })}
          </div>
        </section>

        <footer className="site-footer">개인용 TLDR 인텔리전스 아카이브 · 비공개</footer>
      </main>
    </>
  );
}
