# Panda Chat Overlay - 프로젝트 규칙

## 프로젝트 개요

팬더TV 채팅 위젯용 compatibility-first CSS 생성기와 OBS 브라우저 소스용 오버레이 도구다.

## 기술 스택

- 순수 HTML5 + CSS3 + Vanilla JavaScript
- TypeScript/React/Tailwind 사용하지 않음
- 빌드 도구 없음
- 정적 파일 + 경량 Node 서버(`scripts/serve.js`)

## 현재 아키텍처 핵심

- `overlay-settings.html`
  단일 HTML 설정기, 미리보기, CSS 생성 엔진이 모두 들어 있다.
- `overlay.css`
  OBS에 바로 붙여넣을 수 있는 기본 배포 CSS다.
- `scripts/serve.js`
  정적 파일 서빙과 로컬 cross-origin 검증용 CORS 헤더를 제공한다.
- `assets/`
  레퍼런스 이미지와 기본 캐릭터 아이콘을 보관한다.
- `docs/`
  PRD, DOM 분석, ADR, 감사, 로드맵, 경쟁 분석 문서를 둔다.

## 구현 원칙

- CSS는 팬더TV 기존 클래스 오버라이드 방식으로 작성한다.
- JavaScript는 ES6+ 사용, 모듈 없이 인라인 스크립트 중심으로 유지한다.
- 한국어 주석과 UI 라벨 사용이 허용된다.
- OBS 사용자 지정 CSS 동작과 가까운 주입 모델을 기준으로 검증한다.
- 셀렉터를 수정할 때는 `ul.{theme} > li...`와 `ul > li.{theme}...` 두 DOM 형태를 함께 고려한다.
- `!important`는 유지하되, 더 강한 인라인 우선순위까지 무조건 이긴다고 가정하지 않는다.
- 아이콘 / data URI는 CSS 총량을 과도하게 키우지 않도록 경량 리소스를 우선한다.

## 글로벌 규칙 오버라이드

- `any` 금지 규칙: 해당 없음
- Tailwind + `cn()` 규칙: 해당 없음
- `tsc --noEmit` 규칙: 해당 없음
- `console.log` 금지: 해당 없음

## 파일 구조

- `overlay.css` - OBS 브라우저 소스 커스텀 CSS
- `overlay-settings.html` - 인터랙티브 CSS 생성기
- `index.html` - 공유용 진입 페이지
- `scripts/serve.js` - 로컬 서버
- `assets/` - 이미지 리소스
- `docs/` - 제품/아키텍처/검증 문서
