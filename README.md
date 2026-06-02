# TLDR 데일리 다이제스트 (개인용)

매일 도착하는 TLDR 뉴스레터를 한국어로 요약해 한눈에 보는 **비공개 개인 웹사이트**입니다.
날짜별 아카이브 누적형이며, **비밀번호(Basic Auth)**로 보호됩니다.

- 홈(`/`): 날짜 목록 아카이브
- 날짜 페이지(`/2026-06-02`): 그날의 빅스토리 + 카테고리별 전체 기사 요약 + 심층 분석
- 데이터: `data/YYYY-MM-DD.json` 한 파일이 하루치. 새 날짜는 JSON만 추가하면 됩니다.

---

## 1. GitHub에 올리기

1. GitHub에서 새 저장소 생성 (예: `tldr-digest`, **Private** 권장).
2. 이 폴더(`tldr-site`)에서 터미널 실행:

```bash
git init
git add .
git commit -m "TLDR daily digest"
git branch -M main
git remote add origin https://github.com/<당신의계정>/tldr-digest.git
git push -u origin main
```

## 2. Vercel에 배포 (GitHub 연동)

1. https://vercel.com 로그인 → **Add New… → Project**
2. 방금 만든 GitHub 저장소를 **Import**
3. Framework는 **Next.js**로 자동 인식됨 → 별도 설정 불필요
4. **Environment Variables**에 아래 2개 추가 (중요!):

   | Name | Value |
   |------|-------|
   | `SITE_USER` | 원하는 아이디 (예: `james`) |
   | `SITE_PASS` | 강력한 비밀번호 |

5. **Deploy** 클릭 → 약 1분 후 `https://<프로젝트>.vercel.app` 생성
6. 접속하면 브라우저가 아이디/비밀번호를 물어봅니다. 위에서 정한 값 입력 → 나만 접속.

> 환경변수를 바꾸면 Vercel에서 **Redeploy** 해야 적용됩니다.

## 3. 매일 자동 업데이트 (선택)

이미 Cowork에 **매일 아침 8시 예약 작업**이 설정되어 있습니다. 작업이 그날 TLDR을 요약해
`data/YYYY-MM-DD.json`을 새로 만들고, GitHub에 commit/push 하면 Vercel이 자동 재배포합니다.

자동 push가 동작하려면 예약 작업 실행 환경에 git 인증(Personal Access Token 등)이 설정되어
있어야 합니다. 수동으로 갱신하려면 새 JSON을 `data/`에 넣고 위 git push만 다시 하면 됩니다.

---

## 로컬에서 미리보기

```bash
npm install
cp .env.example .env.local   # 비밀번호 수정
npm run dev                  # http://localhost:3000
```

## 구조 & 새 날짜 추가

각 날짜는 `data/<날짜>/` **폴더**입니다 (파일이 커서 에디션별로 분리):

```
data/2026-06-02/
  index.json      # 날짜 메타 + bigStoryId + editions 목록(파일명 순서)
  ai.json infosec.json crypto.json tech.json it.json design.json marketing.json dev.json
```

- **목록 페이지**(`/<날짜>