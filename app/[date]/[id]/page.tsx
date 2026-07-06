import Link from "next/link";
import { notFound } from "next/navigation";
import Chrome from "@/components/Chrome";
import { getAllArticleParams, findArticle, getDigest } from "@/lib/digest";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllArticleParams();
}

export default function ReportPage({ params }: { params: { date: string; id: string } }) {
  const d = getDigest(params.date);
  const found = d ? findArticle(d, params.id) : null;
  if (!d || !found) {
    notFound();
    throw new Error("not found");
  }
  const { item, edition } = found;
  const r = item.report ?? { tldr: item.summary || item.title };
  const intel = item.intel;

  return (
    <>
      <Chrome
        dateLabel={`${d.date} ${d.weekday}요일`}
        lastUpdated={d.lastUpdated}
        sync={{ sources: d.editions.length, signals: d.signals?.length ?? 0, at: d.syncedAt ?? "09:00" }}
        active="big"
        navDate={d.date}
      />
      <main className="page">
        <div className="report-layout">
          <article className="report-main">
            <Link className="back-link" href={`/${d.date}`}>← {d.date} 목록</Link>
            <div className="category">{edition.name}</div>
            <h1 className="report-title">{item.title}</h1>
            <div className="report-meta">
              <span>{edition.source}</span>
              <time>{d.lastUpdated ?? d.date}</time>
              <span>{item.source}</span>
            </div>

            {intel && (intel.confidence || intel.impact || intel.owner) && (
              <div className="analyst-panel" aria-label="분석 품질 지표">
                <div><span>Confidence</span><strong>{intel.confidence ?? "—"}</strong></div>
                <div><span>Impact</span><strong>{intel.impact ?? "—"}</strong></div>
                <div><span>Action owner</span><strong>{intel.owner ?? "—"}</strong></div>
              </div>
            )}

            <div className="summary-box"><b>TLDR</b><br />{r.tldr}</div>

            <section className="report-section" id="summary">
              <h2>한 줄 요약</h2>
              <p>{r.tldr}</p>
            </section>

            {r.what && (
              <section className="report-section" id="what">
                <h2>무슨 일인가</h2>
                <p>{r.what}</p>
              </section>
            )}

            {r.points && r.points.length > 0 && (
              <section className="report-section" id="points">
                <h2>핵심 포인트</h2>
                <ul>{r.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </section>
            )}

            {r.why && r.why.length > 0 && (
              <section className="report-section" id="why">
                <h2>왜 중요한가</h2>
                <ul>{r.why.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </section>
            )}

            {r.context && (
              <section className="report-section" id="context">
                <h2>배경 / 용어</h2>
                <p>{r.context}</p>
              </section>
            )}

            {r.action && (
              <section className="report-section" id="action">
                <h2>대응 / 할 일</h2>
                <p>{r.action}</p>
              </section>
            )}
          </article>

          <aside className="report-aside" aria-label="리포트 정보">
            <section className="rail-block">
              <h2>리포트 정보</h2>
              <dl className="info-table">
                <div><dt>발행일</dt><dd>{d.date}</dd></div>
                <div><dt>에디션</dt><dd>{edition.name}</dd></div>
                <div><dt>출처</dt><dd>{item.source}</dd></div>
                {item.originalDate && <div><dt>원문 발행일</dt><dd>{item.originalDate}</dd></div>}
                <div><dt>원문 링크</dt><dd><a href={item.url} target="_blank" rel="noopener noreferrer">↗</a></dd></div>
              </dl>
            </section>

            <section className="rail-block">
              <h2>목차</h2>
              <ol className="toc">
                <li><a href="#summary">한 줄 요약</a></li>
                {r.what && <li><a href="#what">무슨 일인가</a></li>}
                {r.points && r.points.length > 0 && <li><a href="#points">핵심 포인트</a></li>}
                {r.why && r.why.length > 0 && <li><a href="#why">왜 중요한가</a></li>}
                {r.context && <li><a href="#context">배경 / 용어</a></li>}
                {r.action && <li><a href="#action">대응 / 할 일</a></li>}
              </ol>
            </section>

            <section className="rail-block">
              <h2>원문 및 참고</h2>
              <div className="rail-actions">
                <a className="button primary" href={item.url} target="_blank" rel="noopener noreferrer">원문 보기 ↗</a>
                <Link className="button" href={`/${d.date}`}>목록으로</Link>
              </div>
            </section>
          </aside>
        </div>

        <footer className="site-footer">TLDR 데일리 다이제스트 · {d.date}</footer>
      </main>
    </>
  );
}
