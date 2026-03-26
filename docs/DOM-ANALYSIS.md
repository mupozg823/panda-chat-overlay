# 팬더TV 채팅 위젯 DOM / CSS 훅 분석

> 분석일: 2026-03-23 (라이브 위젯 소스코드 역분석 기반)
> 대상 URL: `https://p.pandahp.kr/chat/{hash}`
> 근거 소스:
>
> - 라이브 위젯 실제 DOM 덤프
> - 위젯 React 소스코드 번들 (`6203-01b026672f3108e0.js`, `page-136f90df6cffad83.js`)
> - 위젯 CSS 파일 6종
> - MutationObserver 실시간 캡처

## 1. 페이지 전체 구조

```
body.h-[100vh].w-[100vw].overflow-hidden
  NEXT-ROUTE-ANNOUNCER
  NAV.absolute.z-20.w-full.bg-gradient-to-b...opacity-0.hover:opacity-80
  DIV.h-full
    UL#chat-preview-container.relative.left-0.h-full.w-full.p-[10px].{theme}
      LI (메시지들)
```

- Next.js 앱, `#__next` div 없음 (App Router 사용)
- `body`에 Tailwind 클래스: `h-[100vh] w-[100vw] overflow-hidden`
- `nav`는 기본 `opacity-0`, hover 시 `opacity-80`으로 표시

## 2. NAV (상단 설정 바)

```html
<nav
  class="absolute z-20 w-full bg-gradient-to-b from-blue-50/50 to-slate-100/50
            opacity-0 shadow-sm transition duration-500 hover:opacity-80"
>
  <div class="mx-auto flex w-full flex-row justify-between p-3 sm:items-center">
    <div class="flex h-full flex-col gap-2 sm:flex-row">
      <div class="flex">
        <label> (눈 아이콘 토글 - 채팅 숨기기) </label>
        <label> (스피커 아이콘 토글 - 소리) </label>
      </div>
      <button>"100%" (투명도 버튼)</button>
      <label> "창 투명도" + range input </label>
    </div>
    <div class="flex flex-row flex-wrap">
      <div>빨간 점 + "방송종료" 텍스트</div>
      <button>휴지통 아이콘 (채팅 삭제)</button>
      <button>새로고침 아이콘</button>
      <a href="/chat"> 설정 아이콘 </a>
    </div>
  </div>
</nav>
```

OBS에서 숨기려면 `nav { display: none !important; }` 하나로 충분.

## 3. UL 컨테이너 (채팅 목록)

```html
<ul
  id="chat-preview-container"
  class="relative left-0 h-full w-full p-[10px] {theme}"
  style="opacity: 1;
           display: flex;
           flex-direction: column;
           justify-content: flex-end;
           align-items: flex-start;
           font-weight: normal;
           background-repeat: no-repeat;
           background-size: cover;
           background-position: center center;"
></ul>
```

### 핵심 사실

- **테마 클래스 위치**: `ul`에 붙음 (예: `ul.default`, `ul.kakaotalk`)
- **인라인 스타일로 레이아웃 제어**: `display: flex`, `flex-direction: column`, `justify-content: flex-end`, `align-items: flex-start` 모두 인라인
- `board` 테마일 때 `backgroundImage: url(/img/chat/board.png)` 인라인 추가
- `kakaotalk` 테마일 때 `textAlign: "right"` 인라인 추가
- `!important`는 인라인 스타일보다 우선하므로 CSS 오버라이드 가능

## 4. 일반 채팅 메시지 (message\_\_wrapper)

### 4.1 레이아웃 모드 결정 로직

소스코드에서 확인된 레이아웃 선택 로직:

```javascript
// 테마 → 레이아웃 매핑
const themeLayouts = {
  kakaotalk: "chatLineBreak",
  box: "chatLineBreak",
  roundbox: "chatLineBreak",
  neon: "chatLineBreak",
  board: "chatLineBreak",
  balloon: "chatLineBreak",
};

// default 테마 → chatInline
// 그 외 테마 → 사용자의 chatTextAlignment 설정값 사용
```

### 4.2 chatInline (default 테마)

실위젯 관찰 기준으로는 `message__box` 없이 닉네임과 메시지가 한 줄에 들어간다.

주의: 라이브 DOM에서는 `P.message__nick > DIV.mr-1` 형태가 관찰됐는데, 이는 invalid HTML이다. 브라우저가 자동 재파싱할 수 있으므로 도구/미리보기에서는 아래처럼 **정규화된 유효 구조**(`div.message__nick` + `span.mr-1`)를 기준으로 삼아야 한다.

```html
<li class="message__wrapper chat {chatEffect} {chatTheme}"
    style="text-align: {direction}; font-family: {font}; {chatDurationStyle}">
  <div class="message__nick hide__opacity {opacityClass}">
    <!-- 배지 (조건부) -->
    <span class="mr-1 inline-block w-max align-text-bottom">
      <svg data-src="/icons/ico_class_n.svg"
           style="width: {fontSize}px; height: {fontSize}px;" fill="none">
      </svg>
    </span>
    <!-- 닉네임 -->
    <span class="message__name"
          style="color: {nickColor}; font-size: {fontSize}px;
                 text-shadow: {shadow}; font-family: {font}">
      닉네임
    </span>
    <!-- ID (설정에 따라) -->
    <span class="message__id"
          style="color: {nickColor}; font-size: {fontSize}px;
                 text-shadow: {shadow}; font-family: {font}">
      (abc***)
    </span>
    <!-- 구분자 (클래스 없음!) -->
    <span style="color: {nickColor}; font-size: {fontSize}px;
                 text-shadow: {shadow}; font-family: {font}">
      :&nbsp;&nbsp;
    </span>
    <!-- 이모티콘 (조건부) -->
    <img src="{emoticonUrl}" alt="채팅 이모티콘" class="my-1"
         width="{w}" height="{h}">
    <!-- 메시지 텍스트 -->
    <span class="message__text"
          style="color: {textColor}; font-size: {fontSize}px;
                 text-shadow: {shadow}; font-family: {font}">
      메시지 내용
    </span>
  </div>
</li>
```

### 4.3 chatLineBreak (kakaotalk 등)

`message__box`가 존재하고, 닉네임 행과 메시지 텍스트가 분리된다. 여기서도 도구 쪽 목표 구조는 유효한 마크업이어야 한다.

```html
<li class="message__wrapper chat {chatEffect} {chatTheme} hide__opacity {opacityClass}"
    style="text-align: {direction}; font-family: {font}; {chatDurationStyle}">
  <div class="message__box">
    <div class="message__nick hide__opacity {opacityClass}">
      <!-- 배지 (조건부) -->
      <span class="mr-1 inline-block w-max align-text-bottom">
        <svg data-src="..." style="width: ...px; height: ...px;" fill="none"></svg>
      </span>
      <span class="message__name" style="{nickStyle}">닉네임</span>
      <span class="message__id" style="{nickStyle}">(abc***)</span>
      <span style="{nickStyle}">:&nbsp;&nbsp;</span>
    </div>
    <!-- 이모티콘 (조건부) -->
    <img src="{emoticonUrl}" alt="채팅 이모티콘" class="my-1">
    <!-- 메시지 (텍스트가 있을 때만) -->
    <p class="message__text hide__opacity {opacityClass}"
       style="color: {textColor}; font-size: ...px; text-shadow: ...; font-family: ...">
      메시지 내용
    </p>
  </div>
</li>
```

### 4.4 chatIndentation (들여쓰기 모드)

`message__box`에 `display: flex` 인라인 스타일이 추가되어 닉네임과 메시지가 가로 정렬.

```html
<li
  class="message__wrapper chat {chatEffect} {chatTheme} hide__opacity {opacityClass}"
  style="text-align: {direction}; font-family: {font}; {chatDurationStyle}"
>
  <div
    class="message__box"
    style="display: flex; justify-content: {left일때 unset, right일때 end}"
  >
    <div
      class="message__nick hide__opacity {opacityClass}"
      style="white-space: nowrap; padding-right: 0; flex-shrink: 0"
    >
      <!-- 배지, 닉네임, ID, 구분자 (동일) -->
    </div>
    <p
      class="message__text hide__opacity {opacityClass}"
      style="flex-shrink: 1; color: ...; font-size: ...; text-shadow: ...; font-family: ..."
    >
      <!-- 이모티콘 (조건부, class="my-1 block") -->
      메시지 내용
    </p>
  </div>
</li>
```

### 4.5 공통 인라인 스타일 상세

#### LI 인라인 스타일

```css
text-align: left|right; /* chatDirection 설정 */
font-family: "Jeju Gothic"; /* 사용자 선택 폰트 */
/* + chatDurationStyle (opacity transition) */
```

#### 닉네임 스타일 (K) - `message__name`, `message__id`, 구분자 span에 적용

```css
color: rgb(R, G, B);             /* 유저 타입/등급별 색상 (인라인!) */
font-size: {n}px;                /* 설정 폰트 크기 (인라인!) */
text-shadow: -1px -1px 1px #000, -1px -0.5px 1px #000, ...;  /* 25방향 외곽선 (인라인!) */
font-family: "Jeju Gothic";     /* 한자 감지 시 "LineSeedJP" 계열로 대체 */
```

#### 메시지 텍스트 스타일 (q) - `message__text`에 적용

```css
color: rgb(R, G, B);             /* 메시지 색상 (인라인!) */
font-size: {n}px;                /* 인라인 */
text-shadow: ...;                /* 인라인 */
font-family: "Jeju Gothic";     /* 인라인 */
```

## 5. 배지 컴포넌트

`react-inlinesvg` 기반. SVG 파일을 fetch해서 인라인 `<svg>`로 주입.

```html
<div class="mr-1 inline-block w-max align-text-bottom">
  <svg
    data-src="/icons/ico_class_n.svg"
    style="width: 16px; height: 16px;"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path ... />
  </svg>
</div>
```

### 배지 아이콘 매핑

| data-src                  | 의미           |
| ------------------------- | -------------- |
| `/icons/ico_class_bj.svg` | BJ (방송자)    |
| `/icons/ico_class_m.svg`  | 매니저         |
| `/icons/ico_chairman.svg` | 팬클럽 회장    |
| `/icons/ico_class_n.svg`  | 일반 (lev 0)   |
| `/icons/ico_class_b.svg`  | 브론즈 (lev 1) |
| `/icons/ico_class_s.svg`  | 실버 (lev 2)   |
| `/icons/ico_class_g.svg`  | 골드 (lev 3)   |
| `/icons/ico_class_d.svg`  | 다이아 (lev 4) |
| `/icons/ico_class_v.svg`  | VIP (lev 5)    |

### 배지 표시 조건

- BJ 배지: `showBJIcon` 설정이 켜져 있을 때
- 매니저 배지: `showManagerIcon` 설정이 켜져 있을 때
- 등급 배지: `showRankIcon` 설정이 켜져 있을 때

## 6. 후원 메시지 (heart\_\_wrapper)

실제 DOM 덤프로 확인한 구조:

```html
<li
  class="{theme} chat heart__wrapper animated hide__opacity min-h-max w-max fadeIn
           {chatEffect} break-keep"
  style="display: flex; flex-direction: column; align-items: start;
           width: 100%; transition: opacity 0.1s ease-out;
           font-family: 'Jeju Gothic';"
>
  <div
    class="haert__image hide__opacity flex max-h-[360px] w-full flex-col text-left items-start"
    style="display: flex; flex-direction: column; align-items: start;
              width: 100%; transition: opacity 0.1s ease-out;"
  >
    <!-- Lottie 애니메이션 (조건부) -->
    <div class="h-[180px] w-[200px]">...</div>
    <!-- 또는 이미지 -->
    <img
      alt="heart_image"
      loading="lazy"
      width="240"
      height="300"
      data-nimg="1"
      src="/_next/image?url=..."
      style="color: transparent;"
    />
    <div>
      <p
        class="hide__opacity heart__text mt-0 p-0 mt-2"
        style="color: rgb(122, 112, 244); font-size: 16px;
                text-shadow: (25방향 외곽선);"
      >
        <span class="{font-LineSeedJP 조건부}">단보아빠</span>
        님께서&nbsp;100개를&nbsp;선물하셨습니다.
      </p>
      <!-- 엑셀 선물일 때 추가 텍스트 -->
      <p
        class="hide__opacity heart__text relative top-2 mb-2 whitespace-nowrap p-0"
        style="{동일 스타일}"
      >
        <span>닉네임</span>님에게
        <span class="mx-1">{수량}</span>
        <span class="mr-1">플러스|마이너스</span>
        선물!
      </p>
    </div>
  </div>
</li>
```

### 핵심 차이점 (기존 분석 대비)

- `heart__image--wrapper`는 **존재하지 않음** (기존 코드에서 타겟하던 셀렉터)
- 수량 `span.mx-1`은 **엑셀 선물일 때만** 존재 (일반 선물은 텍스트 노드)
- 닉네임 span에는 **클래스 없음** (font-LineSeedJP만 조건부)
- `haert__image` (오타) 그대로 유지됨
- 이미지는 Next.js `Image` 컴포넌트 (`data-nimg="1"`)

## 7. 알림 메시지 (chat\_\_notice--list)

```html
<li
  class="chat__notice--list chat whitespace-break-spaces {chatEffect} {chatTheme}
           hide__opacity {opacityClass}
           {kakaotalk일 때: flex flex-col items-end}"
  style="text-align: left; font-family: 'Jeju Gothic';"
>
  <p
    class="notice__text hide__opacity {opacityClass}"
    style="color: rgb(122, 112, 244); font-size: 16px;
            text-shadow: (25방향 외곽선);"
  >
    <span class="{font-LineSeedJP 조건부}">닉네임</span>
    님께서&nbsp;추천하셨습니다.
  </p>
</li>
```

### 알림 유형 (소스코드에서 확인)

| 타입         | 텍스트                                           |
| ------------ | ------------------------------------------------ |
| `Recommend`  | {닉}님께서 추천하셨습니다.                       |
| 등급 변경    | {닉}님의 등급이 {name}로 변경되었습니다!         |
| `MemberJoin` | {닉}님이 입장하셨습니다.                         |
| `FanIn`      | 열혈 팬클럽 {닉} 님께서 입장하셨습니다.          |
| `KingFanIn`  | 팬클럽 회장 {닉} 님께서 입장하셨습니다.          |
| 팬 랭킹      | {닉}님이 {rank}위로 팬 랭킹이 올라갔습니다!      |
| 팬클럽 회장  | 축하합니다! {닉}님께서 팬클럽 회장이 되셨습니다! |

## 8. CSS로 커스터마이징 가능한 영역 (확정)

### 완전 제어 가능 (`!important`로 인라인 스타일 오버라이드)

| 대상              | 셀렉터                                                                            | 비고                                                                          |
| ----------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 배경/투명도       | `body, html`                                                                      | 배경 투명화                                                                   |
| 상단 바           | `nav`                                                                             | `display: none`                                                               |
| 컨테이너 레이아웃 | `ul.{theme}`, `ul#{id}`                                                           | flex 방향, 패딩, gap                                                          |
| 메시지 래퍼       | `li.message__wrapper`, `li.{theme}.message__wrapper`                              | 배경, 테두리, 패딩, 정렬                                                      |
| 내부 박스         | `.message__box`                                                                   | lineBreak/indent 모드에서 존재                                                |
| 닉네임 영역       | `.message__nick`                                                                  | display, 패딩                                                                 |
| 닉네임 텍스트     | `.message__name`                                                                  | **color, font-size, text-shadow 인라인이지만 `!important`로 오버라이드 가능** |
| 메시지 텍스트     | `.message__text`                                                                  | 동일                                                                          |
| 배지              | `div.mr-1:has(svg)`, `div.mr-1 svg`                                               | SVG 숨기기/대체                                                               |
| 구분자            | `.message__nick > span:not(.message__name):not(.message__text):not(.message__id)` | 클래스 없는 span                                                              |
| 후원 래퍼         | `li.heart__wrapper`                                                               | 배경, 레이아웃                                                                |
| 후원 내부         | `.haert__image`                                                                   | 배경, 이미지 숨기기                                                           |
| 후원 텍스트       | `.heart__text`                                                                    | 색상, 크기                                                                    |
| 알림 래퍼         | `li.chat__notice--list`                                                           | 배경, 레이아웃                                                                |
| 알림 텍스트       | `.notice__text`                                                                   | 색상, 크기                                                                    |
| 페이드아웃        | `.hide__opacity`                                                                  | opacity transition                                                            |
| 스크롤바          | `*`, `::-webkit-scrollbar`                                                        | 숨기기                                                                        |

### 제한적 제어 (CSS로 힘든 부분)

| 대상                    | 이유                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| 등급별 닉네임 색상 분리 | 인라인 style로 주입, DOM에 등급 클래스 없음 (`:has(svg[data-src*="..."])` 우회 가능하지만 OBS v29+ 필요) |
| 레이아웃 모드 변경      | inline/lineBreak/indent는 React 상태로 결정, CSS로 구조 변경 불가                                        |
| 이모티콘 크기 조절      | inline width/height 속성                                                                                 |
| 한자 감지 폰트 전환     | 인라인 fontFamily                                                                                        |

### CSS로 제어 불가

| 대상                  | 이유              |
| --------------------- | ----------------- |
| 메시지 내용 필터링    | DOM 조작 필요     |
| 채팅 최대 줄수        | JS 상태 관리 영역 |
| 실시간 채팅 속도 제어 | WebSocket 영역    |

## 9. 인라인 스타일 vs CSS 우선순위 정리

```
일반 CSS < 인라인 style < CSS !important < 인라인 style !important
```

팬더TV는 `element.style.color = "..."` (일반 인라인) 방식을 사용.
`element.style.setProperty('color', '...', 'important')` (인라인 !important)는 미사용 확인.

따라서 **CSS `!important`로 모든 인라인 스타일을 오버라이드 가능**.

## 10. 셀렉터 형태 재확인

### 테마 클래스 위치

- **`ul`에 붙음**: `ul.default`, `ul.kakaotalk` 등
- **`li`에도 붙음**: `li.default.message__wrapper`, `li.default.heart__wrapper` 등

### 필요한 셀렉터 쌍

```css
/* 형태 A: ul에 테마 */
ul.default > li.message__wrapper { ... }
/* 형태 B: li에 테마 */
ul > li.default.message__wrapper { ... }
```

두 형태 모두 실제 위젯에서 동시에 해당하므로, 어느 쪽이든 매칭됨.
단일 형태만 써도 되지만, 미리보기 호환성을 위해 둘 다 유지.

## 11. 기존 프로젝트 코드와의 차이점

| 항목                        | 기존 가정             | 실제                                                             |
| --------------------------- | --------------------- | ---------------------------------------------------------------- |
| `heart__image--wrapper`     | 존재                  | **존재하지 않음**                                                |
| 수량 `span.mx-1`            | 항상 존재             | 엑셀 선물일 때만 존재                                            |
| 배지                        | `message__nick svg`   | `div.mr-1 > svg[data-src]` (래퍼 div 있음)                       |
| default 테마 `message__box` | 없음 (맞음)           | chatInline 모드에서 없음 확인                                    |
| chatIndentation 모드        | 문서에 없었음         | `message__box`에 `display: flex` 인라인, nick에 `flex-shrink: 0` |
| `message__id` span          | 문서에 없었음         | 설정에 따라 `(id***)` 표시                                       |
| 구분자 span                 | 클래스 없는 span 맞음 | `:\xa0\xa0` (콜론+공백2개), 인라인 스타일 있음                   |
| UL 레이아웃                 | CSS 클래스            | **인라인 스타일로 flex 제어**                                    |

## 12. "완전 인젝션" 전환 시 고려사항

`all: unset !important`를 사용하면:

- 테마 CSS 잔상 100% 제거 가능
- 인라인 스타일도 `!important`로 오버라이드 가능
- 단, `font-family`, `color`, `text-shadow` 등 상속 속성을 전부 재선언해야 함
- `display`, `position` 같은 레이아웃 속성도 재선언 필수
- 미리보기 DOM을 이 문서의 구조와 정확히 맞추면, 미리보기와 OBS 결과의 일치도가 크게 향상됨
