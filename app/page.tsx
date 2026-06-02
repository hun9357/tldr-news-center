import Link from "next/link";
import { countArticles, findArticle, getAllDates, getDigest, type Digest } from "@/lib/digest";

export const dynamic = "force-static";

function getReadingQueue(digest: Digest) {
  const big = findArticle(digest, digest.bigStoryId);
  const items = digest.editions.flatMap((edition) =>
    edition.items.map((item) => ({ edition, item }))
  );
  const rest = items.filter(({ item }) => item.id !== digest.bigStoryId);
  return [...(big ? [big] : []), ...rest].slice(0, 3);
}

export default function Home() {
  const dates = getAllDates();
  const archives = dates
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
    .filter((archive): archive is NonNullable<typeof archive> => archive !== null);
  const latest = archives[0];
  const queue = latest ? getReadingQueue(latest.digest) : [];

  return (
    <div className="archive-shell">
      <section className="home-hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot" />개인용 데일리 브리핑</div>
          <h1><span>매일 도착한</span><span>기술 흐름</span></h1>
          <p className="lead">
            TLDR 뉴스레터를 한국어 분석 리포트로 정리한 개인 아카이브입니다.
            날짜별 빅스토리와 기사 묶음을 빠르게 다시 열 수 있습니다.
          </p>
          <div className="hero-actions">
            {latest && <Link className="button primary" href={`/${latest.date}`}>최신 브리핑 보기 <span>→</span></Link>}
            <a className="button secondary" href="#archive-index">아카이브 인덱스</a>
          </div>
        </div>

        {latest && (
          <aside className="brief-panel" aria-labelledby="home-queue-title">
            <div className="panel-head">
              <h2 id="home-queue-title">최신 읽기 큐</h2>
              <span>{latest.digest.date}</span>
            </div>
            <div className="queue-list">
              {queue.map(({ edition, item }, index) => (
                <Link key={item.id} href={`/${latest.date}/${item.id}`} className="queue-item">
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
        )}
      </section>

      <section className="metric-grid" aria-label="아카이브 요약">
        <div className="metric"><strong>{archives.length}</strong><span>아카이브 날짜</span></div>
        <div className="metric"><strong>{latest ? latest.digest.editions.length : 0}</strong><span>뉴스레터 / 최신일</span></div>
        <div className="metric"><strong>{latest ? latest.total : 0}</strong><span>분석 기사 / 최신일</span></div>
      </section>

      <section className="section-band" id="archive-index" aria-labelledby="archive-title">
        <div className="section-title">
          <div>
            <h2 id="archive-title">아카이브 인덱스</h2>
            <p>날짜별 브리핑과 핵심 키워드를 이어서 볼 수 있습니다.</p>
          </div>
        </div>

        {archives.length === 0 ? (
          <div className="empty-state">아직 요약이 없습니다.</div>
        ) : (
          <div className="archive-grid">
            {archives.map(({ date, digest, big, total }) => (
              <Link key={date} href={`/${date}`} className="archive-card">
                <span className="archive-date">{date}<small>{digest.weekday}요일</small></span>
                <span className="archive-story">{big ? big.item.title : digest.headline}</span>
                <span className="archive-meta">
                  <span>{total}건</span>
                  <span>{digest.keyword}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="site-footer">개인용 TLDR 요약 아카이브 · 비공개</footer>
    </div>
  );
}
