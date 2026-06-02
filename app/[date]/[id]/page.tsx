import Link from "next/link";
import { notFound } from "next/navigation";
import { getDigest, findArticle, getAllArticleParams } from "@/lib/digest";

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
  const r = item.report;

  return (
    <div className="report-shell">
      <Link href={`/${d.date}`} className="backlink">← {d.date} 목록</Link>

      <header className="report-hero">
        <div className="report-kicker" style={{ color: edition.color }}>
          <span className="swatch" style={{ background: edition.color }} />{edition.name} · {edition.source}
        </div>
        <h1>{item.title}</h1>
        <p>{r.tldr}</p>
      </header>

      <div className="report-layout">
        <article className="report-body">
          <section className="summary-card" aria-labelledby="summary-title">
            <span className="tagline" id="summary-title">한 줄 요약</span>
            <p>{r.tldr}</p>
          </section>

          {r.what && (
            <section className="report-section">
              <h2>무슨 일인가</h2>
              <p>{r.what}</p>
            </section>
          )}

          {r.points && r.points.length > 0 && (
            <section className="report-section">
              <h2>핵심 포인트</h2>
              <ul className="report-list">{r.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </section>
          )}

          {r.why && r.why.length > 0 && (
            <section className="report-section">
              <h2>왜 중요한가</h2>
              <ul className="report-list arrow-list">{r.why.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </section>
          )}

          {r.context && (
            <section className="report-section context-section">
              <h2>배경 / 용어</h2>
              <p>{r.context}</p>
            </section>
          )}

          {r.action && (
            <section className="report-section action-section">
              <h2>대응 / 할 일</h2>
              <p>{r.action}</p>
            </section>
          )}

          <div className="report-actions">
            <a className="button primary" href={item.url} target="_blank" rel="noopener noreferrer">원문 보기 <span>↗</span></a>
            <Link className="button secondary" href={`/${d.date}`}>목록으로</Link>
          </div>
        </article>

        <aside className="report-rail" aria-label="리포트 정보">
          <div className="rail-card">
            <h2>리포트 정보</h2>
            <dl>
              <div>
                <dt>날짜</dt>
                <dd>{d.date}</dd>
              </div>
              <div>
                <dt>에디션</dt>
                <dd>{edition.name}</dd>
              </div>
              <div>
                <dt>출처</dt>
                <dd>{item.source}</dd>
              </div>
            </dl>
          </div>
          <div className="rail-card">
            <h2>섹션</h2>
            <ol>
              {r.what && <li>무슨 일인가</li>}
              {r.points && r.points.length > 0 && <li>핵심 포인트</li>}
              {r.why && r.why.length > 0 && <li>왜 중요한가</li>}
              {r.context && <li>배경 / 용어</li>}
              {r.action && <li>대응 / 할 일</li>}
            </ol>
          </div>
        </aside>
      </div>

      <footer className="site-footer">TLDR 데일리 다이제스트 · {d.date}</footer>
    </div>
  );
}
