# 설정기 UI/UX 리디자인 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 설정기를 미니멀 다크 스타일로 전환하고, 3탭(프리셋/디자인/고급) 구조로 재편하며, 불필요해진 호환성 UI를 제거한다.

**Architecture:** 순수 HTML/CSS/JS 단일 파일 구조. CSS 변수 교체 → HTML 구조 재편 → JS 로직 동기화 순서로 진행. 각 태스크는 독립적으로 동작 가능한 단위.

**Tech Stack:** HTML5, CSS3 (CSS Variables), Vanilla JavaScript (ES6+)

**Spec:** `docs/superpowers/specs/2026-03-23-settings-ui-redesign.md`

---

## 파일 구조

| 파일                    | 역할                     | 변경                                              |
| ----------------------- | ------------------------ | ------------------------------------------------- |
| `styles/settings.css`   | 전체 설정기 스타일       | `:root` 변수 교체, 컴포넌트 색상 업데이트         |
| `overlay-settings.html` | 설정기 HTML + 인라인 JS  | 탭/섹션 재편, 레거시 제거, 미리보기 상단바 재구성 |
| `scripts/ui-utils.js`   | 탭 전환, 대시보드 동기화 | phaseOrder/phaseMeta 변경, 레거시 phase 제거      |
| `scripts/state.js`      | 상태 관리, getValues()   | compatMode/resetInner/themeReset 참조 정리        |
| `scripts/preview.js`    | 미리보기 갱신            | dataset 참조 정리, 상단바 연동                    |
| `scripts/preset-ui.js`  | 프리셋 그리드            | 그리드 열 수 변경 불필요 (CSS만 수정)             |

---

### Task 1: CSS 컬러 시스템 교체

**Files:**

- Modify: `styles/settings.css` (`:root` 변수 블록, L3-15)

- [ ] **Step 1: `:root` CSS 변수를 미니멀 다크로 교체**

현재 보라 그라데이션 변수들을 흑백 기반으로 교체한다.

```css
:root {
  --bg-main: #000000;
  --bg-panel: #111111;
  --bg-panel-strong: #1a1a1a;
  --bg-soft: #1a1a1a;
  --line-soft: #262626;
  --text-main: #ffffff;
  --text-muted: #a3a3a3;
  --accent: #ffffff;
  --accent-soft: rgba(255, 255, 255, 0.08);
  --success: #15c97c;
  --shadow-soft: 0 18px 42px rgba(0, 0, 0, 0.4);
}
```

- [ ] **Step 2: 브라우저에서 설정기를 열어 색상 변경 확인**

Run: 브라우저에서 `overlay-settings.html` 열기
Expected: 배경이 순수 검정, 패널이 `#111`, 텍스트가 흰색으로 표시

- [ ] **Step 3: Commit**

```bash
git add styles/settings.css
git commit -m "style: 미니멀 다크 컬러 시스템으로 교체"
```

---

### Task 2: 컴포넌트 스타일 업데이트

**Files:**

- Modify: `styles/settings.css` (토글, 버튼, 슬라이더, 프리셋 카드, 탭 등)

- [ ] **Step 1: 토글 스위치 색상 변경**

`.toggle-switch.on`의 `background`를 `#6c8cff` → `#fff`로, `::after` thumb도 조정.

- [ ] **Step 2: 버튼 스타일 변경**

주요 CTA(`.copy-btn`, `.floating-copy .copy-btn`)를 `background:#fff; color:#000`으로. 보조 버튼을 `border:1px solid #262626; background:transparent; color:#a3a3a3`으로.

- [ ] **Step 3: range 슬라이더 색상 변경**

thumb → `#fff`, track → `#262626`.

- [ ] **Step 4: 탭(`.phase-btn`) 스타일 변경**

활성 시 `border-bottom-color`를 `#6c8cff` → `#fff`로. 활성 텍스트 색상도 `#fff`.

- [ ] **Step 5: 프리셋 카드(`.theme-btn`) 스타일 변경**

컬러 스와치 세로바 → 상단 가로바로 변경. `border:1px solid #262626`, 선택 시 `border-color:#fff`.

- [ ] **Step 6: 섹션 타이틀/접기 색상 조정**

`.section-title` 색상을 새 변수에 맞게 조정. 접기 화살표 색상도 `#525252`.

- [ ] **Step 7: 색상 입력(`.color-input-wrap`) 배경 변경**

hex 입력 배경을 `#1a1a1a`로.

- [ ] **Step 8: 브라우저에서 각 컴포넌트 확인**

Expected: 토글, 버튼, 슬라이더, 탭, 프리셋 카드가 모두 흑백 미니멀 스타일

- [ ] **Step 9: Commit**

```bash
git add styles/settings.css
git commit -m "style: 컴포넌트 스타일을 미니멀 다크로 업데이트"
```

---

### Task 3: 탭 구조 재편 (HTML)

**Files:**

- Modify: `overlay-settings.html` (phase-nav 탭 버튼, phase-content 블록)

- [ ] **Step 1: 탭 버튼 변경**

`phase-nav` 내 버튼을 변경:

- `data-phase="design"` 라벨 "프리셋" → 유지
- `data-phase="layout"` 라벨 "레이아웃" → "디자인" + `data-phase="design-tab"`
- `data-phase="detail"` 라벨 "세부 조정" → "고급" + `data-phase="advanced"`

주의: `design`이라는 phase명이 현재 프리셋 탭에 사용 중. 혼동 방지를 위해:

- 프리셋 탭: `data-phase="preset"` (현재 `design`)
- 디자인 탭: `data-phase="design"` (현재 `layout`)
- 고급 탭: `data-phase="advanced"` (현재 `detail`)

- [ ] **Step 2: phase-content ID 변경**

- `#phase-design` → `#phase-preset`
- `#phase-layout` → `#phase-design`
- `#phase-detail` → `#phase-advanced`

- [ ] **Step 3: 레거시 대시보드 숨김 요소 제거**

`phase-dashboard` 내 `style="display:none"` 블록 (`phaseOverviewLabel`, `phasePrevBtn`, `phaseNextBtn`, `phaseLayoutValue` 등) 전체 삭제.

- [ ] **Step 4: 브라우저에서 탭 전환 확인 (아직 JS 미수정이므로 동작 안 할 수 있음)**

- [ ] **Step 5: Commit**

```bash
git add overlay-settings.html
git commit -m "refactor: 탭 구조 재편 (preset/design/advanced)"
```

---

### Task 4: 탭 전환 JS 동기화

**Files:**

- Modify: `scripts/ui-utils.js` (phaseOrder, phaseMeta, switchPhase)
- Modify: `overlay-settings.html` (인라인 JS의 switchPhase 호출, 초기화 코드)

- [ ] **Step 1: `ui-utils.js`의 phaseOrder 변경**

```javascript
const phaseOrder = ["preset", "design", "advanced"];
```

- [ ] **Step 2: `phaseMeta` 변경**

```javascript
const phaseMeta = {
  preset: { label: "프리셋", icon: "🎨", note: "프리셋을 선택하세요" },
  design: {
    label: "디자인",
    icon: "✏️",
    note: "말풍선, 레이아웃, 아이콘을 조정합니다",
  },
  advanced: {
    label: "고급",
    icon: "⚙️",
    note: "후원, 배지, 표시 설정을 조정합니다",
  },
};
```

- [ ] **Step 3: `switchPhase` 함수에서 phase-content 매칭 로직 확인**

현재 `id="phase-${phase}"` 또는 `data-phase="${phase}"`로 매칭. HTML의 ID와 일치하는지 확인.

- [ ] **Step 4: `overlay-settings.html` 인라인 JS에서 `switchPhase('design')` 초기화 호출을 `switchPhase('preset')`으로 변경**

L2569 근처의 초기화 코드 수정.

- [ ] **Step 5: `syncPhaseDashboard()` 내 레거시 참조 정리**

`phaseLayoutValue`, `phaseDesignValue`, `phaseDetailValue` 등 제거된 요소 참조 제거.

- [ ] **Step 6: 브라우저에서 탭 전환 테스트**

Expected: 프리셋/디자인/고급 탭 전환이 정상 동작

- [ ] **Step 7: Commit**

```bash
git add scripts/ui-utils.js overlay-settings.html
git commit -m "refactor: 탭 전환 로직을 preset/design/advanced로 변경"
```

---

### Task 5: 디자인 탭 내용 구성

**Files:**

- Modify: `overlay-settings.html` (`#phase-design` 콘텐츠)

- [ ] **Step 1: 기존 레이아웃 탭의 카드 UI 제거 (메시지 스타일 선택은 디자인 탭 레이아웃 섹션으로 이동)**

- [ ] **Step 2: 디자인 탭에 3개 접이식 섹션 구성**

```html
<div class="phase-content" id="phase-design" data-phase="design">
  <!-- 말풍선 섹션 (초기 펼쳐짐) -->
  <div class="section" id="sec-bubble">
    <div class="section-title" onclick="toggleSection(this)">말풍선</div>
    <div class="section-body">
      <!-- 기존 #sec-style 내용 이동: 배경색, 투명도, 둥글기, 흐림, 테두리, 그림자, 그라데이션 -->
    </div>
  </div>

  <!-- 레이아웃 섹션 (초기 접혀짐) -->
  <div class="section collapsed" id="sec-layout">
    <div class="section-title" onclick="toggleSection(this)">레이아웃</div>
    <div class="section-body">
      <!-- 메시지 스타일 선택 (전체말풍선/캡슐/분리), 줄바꿈, 간격, 여백, 최대너비, 구분자, 텍스트 배경 -->
    </div>
  </div>

  <!-- 아이콘 & 캡슐 섹션 (초기 접혀짐) -->
  <div class="section collapsed" id="sec-icon">
    <div class="section-title" onclick="toggleSection(this)">아이콘 & 캡슐</div>
    <div class="section-body">
      <!-- 기존 #sec-name 내용 이동 -->
    </div>
  </div>
</div>
```

- [ ] **Step 3: 기존 `#sec-style` (말풍선) 내용을 `#sec-bubble`로 이동**

컨트롤 ID는 모두 유지 (bubbleColor, bubbleOpacity, borderRadius 등).

- [ ] **Step 4: 레이아웃 탭의 카드 UI + 기존 `#sec-text` 내용을 `#sec-layout`으로 이동**

메시지 스타일 선택 (layout-cards) + twoLine, chatGap, paddingX, maxWidth, separatorText, 텍스트 배경 파라미터.

레이아웃 탭에 있던 동기화 쌍 (`twoLine2`, `chatAlign2`, `iconPlacement2`)은 제거하고 원본 input만 사용.

- [ ] **Step 5: 기존 `#sec-name` 내용을 `#sec-icon`으로 이동**

아이콘 선택, 크기, 위치, 아바타 프레임, 캡슐 배경/둥글기.

- [ ] **Step 6: 브라우저에서 디자인 탭 확인**

Expected: 3개 접이식 섹션이 정상 표시, 설정 변경 시 미리보기 반영

- [ ] **Step 7: Commit**

```bash
git add overlay-settings.html
git commit -m "feat: 디자인 탭 구성 (말풍선+레이아웃+아이콘 통합)"
```

---

### Task 6: 고급 탭 내용 구성

**Files:**

- Modify: `overlay-settings.html` (`#phase-advanced` 콘텐츠)

- [ ] **Step 1: 고급 탭에 4개 접이식 섹션 구성**

```html
<div class="phase-content" id="phase-advanced" data-phase="advanced">
  <!-- 후원 & 알림 (초기 펼쳐짐) -->
  <div class="section" id="sec-donation">...</div>

  <!-- 등급별 배지 (초기 접혀짐) -->
  <div class="section collapsed" id="sec-rankbadge">...</div>

  <!-- 표시 설정 (초기 접혀짐) -->
  <div class="section collapsed" id="sec-display">...</div>

  <!-- 추가 CSS (초기 접혀짐) -->
  <div class="section collapsed" id="sec-customcss">...</div>
</div>
```

- [ ] **Step 2: 후원 & 알림 — 기존 `#sec-donation` 내용 이동 (ID 유지)**

- [ ] **Step 3: 등급별 배지 — 기존 `#sec-rankbadge` 내용 이동 (ID 유지)**

- [ ] **Step 4: 표시 설정 — 새 섹션 구성**

`compatTheme` (대상 테마 선택) + 기존 `#sec-visibility` 내용 (hideNav, hideIcon, preventFade, noAnimation) 이동.

- [ ] **Step 5: 추가 CSS — 커스텀 CSS 텍스트에어리어 이동**

현재 CSS 출력 영역(`css-output-area`)에 있는 `custom-css-panel`을 고급 탭으로 이동.

- [ ] **Step 6: 브라우저에서 고급 탭 확인**

Expected: 4개 접이식 섹션 정상, 후원/배지/표시/커스텀CSS 동작 확인

- [ ] **Step 7: Commit**

```bash
git add overlay-settings.html
git commit -m "feat: 고급 탭 구성 (후원+배지+표시+커스텀CSS)"
```

---

### Task 7: 호환성 섹션 및 레거시 UI 제거

**Files:**

- Modify: `overlay-settings.html`
- Modify: `scripts/state.js`
- Modify: `scripts/preview.js`

- [ ] **Step 1: `#sec-compat` 섹션 HTML 제거**

호환성 섹션 전체 삭제 (compatMode select, resetInner toggle, themeReset toggle).

- [ ] **Step 2: 퀵 네비 바 (`quick-nav`) 제거**

디자인/고급 탭 내 섹션이 3-4개로 줄어 퀵 네비 불필요.

- [ ] **Step 3: `state.js`의 `getValues()`에서 `compatMode`, `resetInner`, `themeReset` 읽기 코드 정리**

DOM에서 해당 요소를 읽는 코드를 제거하고, 기본값 하드코딩:

```javascript
// full-injection이므로 항상 고정값
compatMode: 'stable',
resetInner: true,
themeReset: true,
```

참고: CSS 생성기는 이미 이 값들을 사용하지 않지만, 프리셋 데이터가 이 키를 가지고 있을 수 있으므로 getValues에서 기본값을 유지하는 것이 안전.

- [ ] **Step 4: `preview.js`에서 `previewMeta` 텍스트 관련 코드 정리**

`previewMeta.textContent = ...` 줄 제거 또는 단순화. `dataset.compatMode` 등 제거.

- [ ] **Step 5: `overlay-settings.html` 인라인 JS에서 `compatModeLabels`, `syncPhaseDashboard` 내 호환성 참조 정리**

- [ ] **Step 6: 브라우저에서 전체 동작 확인**

Expected: 호환성 관련 UI 없음, 프리셋 적용 정상, CSS 생성 정상

- [ ] **Step 7: Commit**

```bash
git add overlay-settings.html scripts/state.js scripts/preview.js
git commit -m "refactor: 호환성 섹션 및 레거시 UI 제거"
```

---

### Task 8: 미리보기 상단 바 재구성

**Files:**

- Modify: `overlay-settings.html` (preview-header, css-output-area)
- Modify: `styles/settings.css` (상단바 스타일)

- [ ] **Step 1: preview-header HTML 재구성**

```html
<div class="preview-header">
  <div class="preview-header-left">
    <span class="preview-label">미리보기</span>
    <!-- 테마 선택 드롭다운 (기존 preview-theme-picker 유지) -->
    <!-- 배경 선택 도트 (기존 bg-selector 유지) -->
  </div>
  <div class="preview-header-right">
    <button class="copy-btn-primary" id="copyBtn" onclick="copyCSS()">
      CSS 복사
    </button>
    <div class="settings-dropdown">
      <button class="settings-dropdown-trigger">설정 ▾</button>
      <!-- 기존 드롭다운 메뉴: 저장/불러오기/파일 저장/파일 불러오기 -->
    </div>
  </div>
</div>
```

- [ ] **Step 2: `preview-meta` 제거**

호환 모드 정보 표시 텍스트 삭제.

- [ ] **Step 3: CSS 출력 영역을 접기/펼치기로 변경**

기존 `css-output-area`를 심플한 접기/펼치기 구조로:

```html
<div
  class="css-output-collapsed"
  id="cssOutputToggle"
  onclick="toggleCssOutput()"
>
  <span class="css-output-preview"
    >/* PandaTV Chat Overlay - full-injection output */</span
  >
  <span class="css-output-expand">▸</span>
</div>
<div class="css-output-expanded" id="cssOutputExpanded" style="display:none;">
  <pre class="css-code" id="cssOutput"></pre>
</div>
```

- [ ] **Step 4: 왼쪽 패널의 floating-copy 버튼 제거 (상단바로 이동됨)**

- [ ] **Step 5: OBS 가이드 (`obs-guide`) 제거**

- [ ] **Step 6: 상단바 CSS 스타일링**

```css
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: #111;
  border-bottom: 1px solid #262626;
}
.copy-btn-primary {
  background: #fff;
  color: #000;
  border: none;
  border-radius: 4px;
  padding: 5px 16px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
}
```

- [ ] **Step 7: `toggleCssOutput()` 함수 추가**

```javascript
function toggleCssOutput() {
  const expanded = document.getElementById("cssOutputExpanded");
  const toggle = document.getElementById("cssOutputToggle");
  const isOpen = expanded.style.display !== "none";
  expanded.style.display = isOpen ? "none" : "block";
  toggle.querySelector(".css-output-expand").textContent = isOpen ? "▸" : "▾";
}
```

- [ ] **Step 8: 브라우저에서 상단바 확인**

Expected: CSS 복사 버튼이 미리보기 우측 상단에 표시, 접기/펼치기 동작

- [ ] **Step 9: Commit**

```bash
git add overlay-settings.html styles/settings.css
git commit -m "feat: 미리보기 상단바에 CSS 복사 통합 + CSS 출력 접기"
```

---

### Task 9: 동기화 쌍 제거 및 레이아웃 탭 동기화 코드 정리

**Files:**

- Modify: `overlay-settings.html` (인라인 JS)
- Modify: `scripts/state.js`

- [ ] **Step 1: 레이아웃 탭 동기화 쌍 제거**

`twoLine2 → twoLine`, `chatAlign2 → chatAlign`, `iconPlacement2 → iconPlacement` 동기화 코드 제거. 원본 input만 남기고 `*2` ID 요소와 관련 `syncLayoutPhase()` 코드 삭제.

- [ ] **Step 2: `state.js`의 `_captureState`/`_restoreState`에서 동기화 쌍 관련 코드 확인**

ID 기반 자동 탐색이므로 `*2` 요소가 DOM에서 사라지면 자동으로 무시됨. 별도 수정 불필요할 것으로 예상.

- [ ] **Step 3: 브라우저에서 레이아웃 관련 설정 변경 테스트**

Expected: 메시지 스타일 변경, 줄바꿈 토글 등이 미리보기에 정상 반영

- [ ] **Step 4: Commit**

```bash
git add overlay-settings.html scripts/state.js
git commit -m "refactor: 레이아웃 탭 동기화 쌍 제거"
```

---

### Task 10: 프리셋 그리드 2열 + 최종 정리

**Files:**

- Modify: `styles/settings.css` (`.theme-presets` grid-template-columns)
- Modify: `overlay-settings.html` (최종 정리)

- [ ] **Step 1: 프리셋 그리드를 3열 → 2열로 변경**

```css
.theme-presets {
  grid-template-columns: repeat(2, 1fr);
}
```

480px 이하 반응형도 `repeat(2, 1fr)` → `1fr`로 조정.

- [ ] **Step 2: 프리셋 카드에 프리셋 설명 텍스트 추가 공간 확보**

2열로 넓어진 카드에 `load` 정보나 간단한 설명을 추가로 표시할 수 있도록 카드 높이/패딩 조정.

- [ ] **Step 3: 레거시 CSS 클래스 정리**

사용하지 않는 `.phase-summary-grid`, `.starter-grid`, `.layout-cards` 관련 CSS 정리.

- [ ] **Step 4: 전체 동작 확인**

브라우저에서 전체 워크플로우 테스트:

1. 프리셋 선택 → 미리보기 반영
2. 디자인 탭에서 말풍선/레이아웃/아이콘 조정 → 미리보기 반영
3. 고급 탭에서 후원/배지/표시 조정 → 미리보기 반영
4. CSS 복사 버튼 동작
5. 설정 저장/불러오기
6. 반응형 레이아웃 (창 크기 조절)

- [ ] **Step 5: Commit**

```bash
git add styles/settings.css overlay-settings.html
git commit -m "feat: 프리셋 그리드 2열 + 최종 UI 정리"
```

---

## 실행 순서 의존성

```
Task 1 (CSS 변수) → Task 2 (컴포넌트 스타일) → 독립
Task 3 (탭 HTML) → Task 4 (탭 JS) → Task 5 (디자인 탭) → Task 6 (고급 탭)
Task 7 (호환성 제거) — Task 5, 6 이후
Task 8 (상단바) — Task 3 이후
Task 9 (동기화 정리) — Task 5 이후
Task 10 (프리셋 그리드 + 최종) — 모든 태스크 이후
```

Tasks 1-2는 Tasks 3-6과 병렬 가능.
