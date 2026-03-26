# PandaTV 채팅 위젯 내부 아키텍처

> 2026-03-26 라이브 페이지 역공학 결과. 기존 DOM-ANALYSIS.md를 보완하는 위젯 내부 구조 문서.

## 1. 기술 스택

- **프레임워크**: Next.js 13.4.19 (App Router, RSC)
- **UI 라이브러리**: React (클라이언트 컴포넌트)
- **CSS**: Tailwind CSS + NextUI 테마 변수
- **번들러**: Webpack (36개 JS 청크)
- **폴리필**: cdnjs polyfill v3
- **분석**: Google Tag Manager (GTM-W9DHS5HR)

## 2. CSS 파일 구조 (6개)

| 파일                   | 내용                                                 | 채팅 관련                                            |
| ---------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `f768c95df1238545.css` | animate.css (애니메이션 유틸리티)                    | -                                                    |
| `b6cd2f0d53cebda2.css` | Tailwind CSS + NextUI 테마 변수 + 기본 유틸리티      | `.message__nick`, `.message__text`, `.hide__opacity` |
| `943b19bd004d2f23.css` | @font-face (Godo, Binggrae 등 한글 폰트)             | -                                                    |
| `f40b83b17a127892.css` | @font-face (Noto Sans KR 400/500)                    | -                                                    |
| `a8624f4ba1ffa1c4.css` | @font-face (Digital Clock 폰트)                      | -                                                    |
| `6506c2832ad897fd.css` | 테마별 CSS (kakaotalk, neon, roundbox, balloon, box) | 테마 스타일만                                        |

### default 테마 CSS 규칙 (전부)

```css
.message__nick {
  position: relative;
  padding-right: 0.6em;
}
.message__text {
  color: #fff;
}
.hide__opacity {
  opacity: 1;
  transition: opacity 2s ease-out;
}
```

**text-shadow, font-weight 규칙 없음** — 전부 React 인라인 스타일로 주입.

### 테마별 CSS (6506c2832ad897fd.css)

- **neon**: `.message__name`, `.message__text` 등에 `text-shadow: 0 0 5px #00fff5 !important`
- **kakaotalk**: `.message__wrapper` overflow, `.heart__text` box-shadow 등
- **roundbox/balloon/box**: `.message__text`에 padding, border-radius, background 등

## 3. React 컴포넌트 트리

```
UL.{theme} (채팅 컨테이너)
  ├─ 컴포넌트 w (채팅 리스트) — props: {messages, emptyMessages}
  │    └─ 컴포넌트 b (페이지) — props: {params, searchParams}
  │
  └─ LI.message__wrapper (각 메시지)
       └─ P.message__nick
            ├─ DIV.mr-1 (배지 래퍼) → SVG
            ├─ SPAN.message__name (닉네임)
            ├─ SPAN.message__id (아이디)
            ├─ SPAN (구분자, 클래스 없음)
            ├─ IMG.my-1 (이모티콘, 조건부)
            └─ SPAN.message__text (메시지 텍스트)
```

## 4. 인라인 스타일 매핑 (모듈 89881)

채팅 렌더링 로직은 **웹팩 모듈 89881** (23KB, JSX 96개)에 집중.

### 스타일 변수 → 적용 대상

| 변수 | 적용 요소                                     | CSS 속성                                  | 소스                                                 |
| ---- | --------------------------------------------- | ----------------------------------------- | ---------------------------------------------------- |
| `a`  | `UL` (컨테이너)                               | `fontWeight`                              | `chatFontAndBackground.fontBold ? "bold" : "normal"` |
| `K`  | `.message__name`, `.message__id`, 구분자 span | `color, fontSize, textShadow, fontFamily` | 닉네임 스타일                                        |
| `q`  | `.message__text`                              | `color, fontSize, textShadow, fontFamily` | 메시지 스타일                                        |
| `G`  | `li.message__wrapper`                         | `display, justifyContent`                 | 래퍼 레이아웃                                        |
| `g`  | `.notice__text`                               | (공지 스타일)                             | 공지 메시지                                          |
| `h`  | `.pt-2` (후원 텍스트)                         | (후원 스타일)                             | 후원 메시지                                          |

### K 스타일 (닉네임) 구조

```javascript
K = {
  color: getColorByType(data.type, chatTextColor, data.lev),
  fontSize: `${chatFontAndBackground.fontSizeInPixels}px`,
  textShadow: generateShadow(
    chatFontAndBackground.fontShadowThickness,
    chatFontAndBackground.fontShadowColor,
  ),
  fontFamily: isCJK(data.nk)
    ? `"${selectedFont}", "Noto Sans SC", ...`
    : chatFontAndBackground.selectedFont,
};
```

### q 스타일 (메시지 텍스트) 구조

```javascript
q = {
  color: getColorByType(data.type, chatTextColor, data.lev),
  fontSize: `${chatFontAndBackground.fontSizeInPixels}px`,
  textShadow: generateShadow(...),
  fontFamily: ...
}
```

**fontWeight는 K/q에 없음** — UL 컨테이너의 `a` 스타일에서 상속.

## 5. text-shadow 생성 함수 (모듈 47538)

```javascript
// generateShadow(thickness, color) → 25방향 외곽선
// 5x5 그리드: [-N, -N/2, 0, N/2, N] × [-N, -N/2, 0, N/2, N]

// thickness=1, color=#000000 →
// "-1px -1px 1px #000000,
//  -1px -0.5px 1px #000000,
//  -1px 0px 1px #000000,
//  -1px 0.5px 1px #000000,
//  -1px 1px 1px #000000,
//  -0.5px -1px 1px #000000,
//  ... (총 25개 방향)
//  1px 1px 1px #000000"

// thickness=0 → 그림자 없음 (빈 문자열 또는 "none")
```

**blur radius** = thickness 값과 동일 (예: thickness=2 → `2px 2px 2px #color`)

## 6. 설정 구조

### chatFontAndBackground

| 속성                  | 타입    | 설명                             |
| --------------------- | ------- | -------------------------------- |
| `selectedFont`        | string  | 폰트 이름 (기본: "Jeju Gothic")  |
| `fontSizeInPixels`    | number  | 폰트 크기 (px)                   |
| `fontShadowThickness` | number  | 외곽선 두께 (0=없음, 1~3 일반적) |
| `fontShadowColor`     | string  | 외곽선 색상 (hex)                |
| `fontBold`            | boolean | 볼드 여부 (UL에 적용)            |
| `backgroundType`      | string  | 배경 유형                        |
| `backgroundColorHex`  | string  | 배경 색상                        |

### chatSettings

| 속성                    | 설명                |
| ----------------------- | ------------------- |
| `isChatAutoHideEnabled` | 자동 숨김 활성화    |
| `chatAutoHide`          | 자동 숨김 시간      |
| `selectedChatIcons`     | 채팅 아이콘 설정    |
| `selectedChatOptions`   | 채팅 옵션           |
| `sponCoinDisplayStatus` | 후원 코인 표시 상태 |

### chatStyles

| 속성           | 설명                                      |
| -------------- | ----------------------------------------- |
| `chatTheme`    | 테마 이름 (default, kakaotalk, neon, ...) |
| `chatEffect`   | 채팅 효과 (애니메이션)                    |
| `chatDuration` | 채팅 지속 시간                            |

### chatAlignment

| 속성                | 설명                     |
| ------------------- | ------------------------ |
| `chatTextAlignment` | 텍스트 정렬 (left/right) |
| `chatDirection`     | 채팅 방향                |

### chatTextColor

| 속성             | 설명           |
| ---------------- | -------------- |
| `other`          | 일반 채팅 색상 |
| `sponChat`       | 후원 채팅 색상 |
| `mission`        | 미션 색상      |
| `missionContent` | 미션 내용 색상 |

### chatBasic

| 속성               | 설명        |
| ------------------ | ----------- |
| `chatTransparency` | 채팅 투명도 |

## 7. CSS 오버라이드 시 핵심 원칙

### 인라인 스타일 vs CSS 우선순위

```
일반 CSS < 인라인 style < CSS !important < 인라인 !important
```

- PandaTV는 `element.style.xxx = "..."` (일반 인라인) 사용
- `!important` CSS 규칙으로 오버라이드 가능
- **BUT**: 부모에 적용된 `!important`는 자식의 인라인 스타일과 무관
- 자식 요소의 인라인 스타일을 오버라이드하려면 **해당 요소를 직접 타겟**해야 함

### CSS Generator 타겟팅 규칙

| 인라인 스타일 위치                | 필요한 CSS 타겟                                                   |
| --------------------------------- | ----------------------------------------------------------------- |
| `.message__name` style.textShadow | `.message__name { text-shadow: xxx !important; }`                 |
| `.message__text` style.textShadow | `.message__text { text-shadow: xxx !important; }`                 |
| `.message__id` style.textShadow   | `.message__id { text-shadow: xxx !important; }`                   |
| 구분자 span style.textShadow      | `.message__nick > span:not(...) { text-shadow: xxx !important; }` |
| UL style.fontWeight               | `.message__name { font-weight: 400 !important; }` (상속 차단)     |

## 8. className 매핑

모듈 89881에서 사용하는 className 목록:

| className                                     | 용도                          |
| --------------------------------------------- | ----------------------------- |
| `"message__wrapper chat "`                    | 채팅 메시지 래퍼              |
| `"message__nick hide__opacity "`              | 닉네임 영역 (일반)            |
| `"message__nick  hide__opacity "`             | 닉네임 영역 (변형)            |
| `"message__name"`                             | 닉네임 텍스트                 |
| `"message__id"`                               | 아이디 텍스트                 |
| `"message__text"`                             | 메시지 텍스트                 |
| `"message__text hide__opacity "`              | 메시지 텍스트 (들여쓰기 모드) |
| `"message__box"`                              | 메시지 내부 박스              |
| `"mr-1 inline-block w-max align-text-bottom"` | 배지 래퍼                     |
| `"notice__text hide__opacity "`               | 공지 텍스트                   |
| `"my-1"` / `"my-1 block"`                     | 이모티콘                      |
| `"mx-1"`                                      | 후원 수량                     |
| `"h-[180px] w-[200px]"`                       | 후원 이미지 컨테이너          |
| `"relative left-0 h-full w-full p-[10px] "`   | UL 컨테이너                   |
