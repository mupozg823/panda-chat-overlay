# Live Simulator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 설정기에 라이브 시뮬레이터 패널을 추가하여 실제 팬더TV DOM 구조로 동적 채팅/후원/추천 시뮬레이션을 보여준다.

**Architecture:** 기존 정적 미리보기(`#previewContainer`) 오른쪽에 동적 시뮬레이터(`#simContainer`)를 배치한다. 새 파일 `scripts/live-simulator.js`가 시뮬레이션 엔진을 담당하고, `overlay-settings.html`에 패널 HTML + 초기화 코드 + CSS 스타일을 추가한다. `update()` 함수에 시뮬레이터 CSS 업데이트 훅을 연결한다.

**Tech Stack:** Vanilla JS, 인라인 CSS, PandaTV 실제 DOM 구조

---

## File Structure

| File                        | Action | Responsibility                                                 |
| --------------------------- | ------ | -------------------------------------------------------------- |
| `scripts/live-simulator.js` | Create | 시뮬레이션 엔진: 메시지 생성, 타이머, DOM 조작, CSS 주입       |
| `overlay-settings.html`     | Modify | 시뮬레이터 패널 HTML, CSS 스타일, 스크립트 로드, update() 연결 |
| `tests/overlay.test.js`     | Modify | 시뮬레이터 관련 테스트 추가                                    |

---

### Task 1: live-simulator.js 코어 엔진 생성

**Files:**

- Create: `scripts/live-simulator.js`

- [ ] **Step 1: 시뮬레이션 데이터 상수 정의**

```javascript
"use strict";

// ──── 시뮬레이션 데이터 ────

const SIM_NICKNAMES = [
  "루야♡ai",
  "김잇콩",
  "극한의앙카총",
  "하루너만의",
  "쥬쥬♡달콤",
  "BJ팬더",
  "팬더티비3",
  "별빛구름",
  "새벽감성",
  "오후의커피",
  "달빛소나타",
  "꿈꾸는여우",
  "행복한하루",
];

const SIM_MESSAGES = [
  "안녕하세요~",
  "ㅋㅋㅋㅋ",
  "와 대박",
  "잘봤습니다!",
  "굿굿",
  "오늘도 화이팅!",
  "재밌다 ㅎㅎ",
  "❤️❤️❤️",
  "어서오세요~",
  "감사합니다!",
  "ㅎㅎㅎ 웃기다",
  "대박사건 ㅋㅋ",
  "응원합니다!",
  "오 진짜요?",
  "멋져요~",
  "와주셔서 감사해요",
  "ㄹㅇ ㅋㅋ",
  "이거 실화임?",
  "너무 좋아요!",
  "항상 감사하고 고맙습니다! 앞으로도 영원히 저와 함께 해주실거죠?",
];

const SIM_BADGE_TYPES = [
  { name: "bj", color: "#ff9912", label: "BJ", width: 26, height: 20 },
  { name: "chairman", color: "#e74c3c", label: "회장", width: 60, height: 60 },
  { name: "m", color: "#303031", label: "매니저", width: 20, height: 20 },
  null, // 뱃지 없음 (일반 시청자)
];

const SIM_NOTICE_TYPES = [
  { template: (nick) => `<span>${nick}</span>님께서&nbsp;추천하셨습니다.` },
  {
    template: (nick) =>
      `<span>${nick}</span>님의&nbsp;등급이&nbsp;브론즈로&nbsp;변경되었습니다!`,
  },
  {
    template: (nick) =>
      `<span>${nick}</span>님이&nbsp;팬클럽에&nbsp;가입하셨습니다.`,
  },
];

const SIM_DONATION_AMOUNTS = [100, 500, 1000, 5000, 10000];
```

- [ ] **Step 2: 메시지 DOM 생성 함수들**

```javascript
// ──── DOM 생성 (실제 팬더TV 구조 100% 일치) ────

function _simRandItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function _simBadgeSvg(badge) {
  if (!badge) return "";
  if (badge.name === "bj") {
    return `<div class="mr-1 inline-block w-max align-text-bottom"><div><svg xmlns="http://www.w3.org/2000/svg" width="26" height="20" viewBox="0 0 26 20" fill="none" style="width:16px;height:16px;"><rect width="26" height="20" rx="10" fill="${badge.color}"/><text x="13" y="14" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">BJ</text></svg></div></div>`;
  }
  return `<div class="mr-1 inline-block w-max align-text-bottom"><div><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:16px;height:16px;"><circle cx="10" cy="10" r="10" fill="${badge.color}"/></svg></div></div>`;
}

const _simDefaultStyle = `color:rgb(241,241,241); font-size:16px; text-shadow:-1px 0 #000, 1px 0 #000, 0 -1px #000, 0 1px #000; font-family:'Jeju Gothic';`;
const _simNoticeStyle = `color:rgb(122,112,244); font-size:16px; text-shadow:-1px 0 #000, 1px 0 #000, 0 -1px #000, 0 1px #000;`;

function simCreateChatMessage() {
  const nick = _simRandItem(SIM_NICKNAMES);
  const msg = _simRandItem(SIM_MESSAGES);
  const badge = _simRandItem(SIM_BADGE_TYPES);
  const li = document.createElement("li");
  li.className = "message__wrapper chat fadeIn default hide__opacity";
  li.style.cssText = "text-align:left; font-family:'Jeju Gothic';";
  li.innerHTML = `<p class="message__nick hide__opacity">${_simBadgeSvg(badge)}<span class="message__name" style="${_simDefaultStyle}">${nick}</span><span style="${_simDefaultStyle}">:&nbsp;&nbsp;</span> <span class="message__text" style="${_simDefaultStyle}"><span>${msg}</span></span></p>`;
  return li;
}

function simCreateDonation() {
  const nick = _simRandItem(SIM_NICKNAMES);
  const amount = _simRandItem(SIM_DONATION_AMOUNTS);
  const li = document.createElement("li");
  li.className =
    "default chat heart__wrapper animated hide__opacity min-h-max w-max fadeIn break-keep";
  li.style.cssText =
    "display:flex; flex-direction:column; align-items:start; width:100%; font-family:'Jeju Gothic';";
  li.innerHTML = `<div class="haert__image hide__opacity flex max-h-[360px] w-full flex-col text-left items-start" style="display:flex; flex-direction:column; align-items:start; width:100%;"><img alt="heart_image" width="80" height="80" src="assets/heart_placeholder.svg" style="color:transparent;"><div><p class="hide__opacity heart__text p-0 mt-2" style="${_simNoticeStyle}"><span>${nick}</span>님께서&nbsp;${amount}개를&nbsp;선물하셨습니다.</p></div></div>`;
  return li;
}

function simCreateNotice() {
  const nick = _simRandItem(SIM_NICKNAMES);
  const notice = _simRandItem(SIM_NOTICE_TYPES);
  const li = document.createElement("li");
  li.className =
    "chat__notice--list chat whitespace-break-spaces fadeIn default hide__opacity";
  li.style.cssText = "text-align:left; font-family:'Jeju Gothic';";
  li.innerHTML = `<p class="notice__text hide__opacity" style="${_simNoticeStyle}">${notice.template(nick)}</p>`;
  return li;
}
```

- [ ] **Step 3: 시뮬레이터 엔진 (타이머 + CSS 주입)**

```javascript
// ──── 시뮬레이터 엔진 ────

const SIM_MAX_MESSAGES = 50;
let _simTimers = [];
let _simRunning = false;
let _simSpeed = 1;

function _simRandInterval(minMs, maxMs) {
  return (minMs + Math.random() * (maxMs - minMs)) / _simSpeed;
}

function _simAppendMessage(li) {
  const container = document.getElementById("simChat");
  if (!container) return;
  container.appendChild(li);
  while (container.children.length > SIM_MAX_MESSAGES) {
    container.removeChild(container.firstChild);
  }
  container.scrollTop = container.scrollHeight;
}

function _simScheduleChat() {
  if (!_simRunning) return;
  _simAppendMessage(simCreateChatMessage());
  const timer = setTimeout(_simScheduleChat, _simRandInterval(1000, 3000));
  _simTimers.push(timer);
}

function _simScheduleDonation() {
  if (!_simRunning) return;
  _simAppendMessage(simCreateDonation());
  const timer = setTimeout(
    _simScheduleDonation,
    _simRandInterval(10000, 20000),
  );
  _simTimers.push(timer);
}

function _simScheduleNotice() {
  if (!_simRunning) return;
  _simAppendMessage(simCreateNotice());
  const timer = setTimeout(_simScheduleNotice, _simRandInterval(15000, 30000));
  _simTimers.push(timer);
}

function simStart() {
  if (_simRunning) return;
  _simRunning = true;
  _simScheduleChat();
  _simScheduleDonation();
  _simScheduleNotice();
  const btn = document.getElementById("simPlayBtn");
  if (btn) btn.textContent = "⏸";
}

function simStop() {
  _simRunning = false;
  _simTimers.forEach(clearTimeout);
  _simTimers = [];
  const btn = document.getElementById("simPlayBtn");
  if (btn) btn.textContent = "▶";
}

function simToggle() {
  _simRunning ? simStop() : simStart();
}

function simClear() {
  simStop();
  const container = document.getElementById("simChat");
  if (container) container.innerHTML = "";
}

function simSetSpeed(val) {
  _simSpeed = parseFloat(val) || 1;
  const label = document.getElementById("simSpeedLabel");
  if (label) label.textContent = `${_simSpeed.toFixed(1)}x`;
  if (_simRunning) {
    simStop();
    simStart();
  }
}

function simUpdateCss() {
  const styleEl = document.getElementById("simCssInjection");
  if (!styleEl) return;
  if (
    typeof generateCssText === "function" &&
    typeof getValues === "function"
  ) {
    styleEl.textContent = generateCssText(getValues());
  }
}
```

- [ ] **Step 4: 커밋**

```bash
git add scripts/live-simulator.js
git commit -m "feat: add live simulator engine with PandaTV-accurate DOM generation"
```

---

### Task 2: 후원 placeholder 이미지 생성

**Files:**

- Create: `assets/heart_placeholder.svg`

- [ ] **Step 1: 간단한 하트 SVG 생성**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
  <rect width="80" height="80" rx="12" fill="#7a70f4" opacity="0.15"/>
  <path d="M40 65 L20 42 A12 12 0 0 1 40 28 A12 12 0 0 1 60 42 Z" fill="#7a70f4" opacity="0.6"/>
</svg>
```

- [ ] **Step 2: 커밋**

```bash
git add assets/heart_placeholder.svg
git commit -m "feat: add heart placeholder SVG for live simulator"
```

---

### Task 3: overlay-settings.html에 시뮬레이터 패널 HTML 추가

**Files:**

- Modify: `overlay-settings.html:1412` (preview-container 뒤에 시뮬레이터 패널 삽입)
- Modify: `overlay-settings.html:1553` (기존 `</div>` 닫힌 후)

- [ ] **Step 1: preview-container 뒤(line ~1553)에 시뮬레이터 패널 HTML 삽입**

`</ul></div>` (previewContainer 끝) 바로 뒤, OBS 사이즈 가이드(`#obsSizeGuide`) 앞에 삽입:

```html
<!-- 라이브 시뮬레이터 -->
<div id="simPanel" style="margin:8px 12px 0 12px;">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
    <span style="font-size:12px;font-weight:700;color:#c6d3f5;"
      >라이브 시뮬레이터</span
    >
    <span style="font-size:10px;color:#6a7aaa;">실제 팬더TV DOM 구조</span>
    <div style="margin-left:auto;display:flex;align-items:center;gap:6px;">
      <button
        id="simPlayBtn"
        type="button"
        onclick="simToggle()"
        style="background:#2a6a4a;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;"
      >
        ▶
      </button>
      <button
        type="button"
        onclick="simClear()"
        style="background:#4a3a3a;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;"
      >
        ↻
      </button>
      <input
        id="simSpeedRange"
        type="range"
        min="0.5"
        max="3"
        step="0.5"
        value="1"
        oninput="simSetSpeed(this.value)"
        style="width:60px;accent-color:#7a70f4;"
      />
      <span
        id="simSpeedLabel"
        style="font-size:10px;color:#9eacd8;min-width:28px;"
        >1.0x</span
      >
    </div>
  </div>
  <div
    id="simContainer"
    style="position:relative;width:100%;height:400px;overflow:hidden;border-radius:10px;border:1px solid rgba(255,255,255,0.06);background:#31475c;"
  >
    <style id="simCssInjection"></style>
    <ul
      id="simChat"
      class="default"
      style="position:relative;left:0;height:100%;width:100%;padding:10px;opacity:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;font-weight:normal;overflow-y:hidden;"
    ></ul>
  </div>
</div>
```

- [ ] **Step 2: script src 로드 추가 (presets.js, css-generator.js 뒤)**

기존 `<script src="scripts/css-generator.js"></script>` 바로 뒤에:

```html
<script src="scripts/live-simulator.js"></script>
```

- [ ] **Step 3: 커밋**

```bash
git add overlay-settings.html
git commit -m "feat: add live simulator panel HTML and script load"
```

---

### Task 4: update() 함수에 시뮬레이터 CSS 업데이트 연결

**Files:**

- Modify: `overlay-settings.html:2694-2707` (update 함수)

- [ ] **Step 1: update() 함수에 simUpdateCss() 호출 추가**

기존 `update()` 함수의 `_updateCssTimer` setTimeout 콜백에 `simUpdateCss()` 추가:

```javascript
function update() {
  const v = getValues();
  syncMessageStyleUI();
  updatePreview(v);

  clearTimeout(_updateCssTimer);
  _updateCssTimer = setTimeout(() => {
    updateCSS(v);
    simUpdateCss();
  }, 80);

  _pushUndo();
  syncPhaseDashboard();
}
```

- [ ] **Step 2: 초기화 코드에 시뮬레이터 CSS 첫 주입 추가**

페이지 로드 시 `setTimeout(() => { ... }, 200)` 블록 안(기존 초기화 마지막)에 추가:

```javascript
simUpdateCss();
```

- [ ] **Step 3: 커밋**

```bash
git add overlay-settings.html
git commit -m "feat: connect simulator CSS injection to update cycle"
```

---

### Task 5: 테스트 추가

**Files:**

- Modify: `tests/overlay.test.js`

- [ ] **Step 1: 시뮬레이터 관련 테스트 추가**

파일 끝에 추가:

```javascript
test("live simulator script exists and exposes required functions", () => {
  const simSource = read("scripts/live-simulator.js");

  assert.match(simSource, /function simCreateChatMessage\(\)/);
  assert.match(simSource, /function simCreateDonation\(\)/);
  assert.match(simSource, /function simCreateNotice\(\)/);
  assert.match(simSource, /function simStart\(\)/);
  assert.match(simSource, /function simStop\(\)/);
  assert.match(simSource, /function simToggle\(\)/);
  assert.match(simSource, /function simClear\(\)/);
  assert.match(simSource, /function simSetSpeed\(/);
  assert.match(simSource, /function simUpdateCss\(\)/);
});

test("live simulator DOM uses actual PandaTV structure (no message__box, no message__id)", () => {
  const simSource = read("scripts/live-simulator.js");

  assert.match(
    simSource,
    /class="message__wrapper chat fadeIn default hide__opacity"/,
  );
  assert.match(simSource, /<p class="message__nick/);
  assert.match(simSource, /class="message__name"/);
  assert.match(simSource, /class="message__text"/);
  assert.match(simSource, /class="haert__image/);
  assert.match(simSource, /class="heart__text/);
  assert.match(simSource, /class="chat__notice--list/);
  assert.match(simSource, /class="notice__text/);

  assert.doesNotMatch(simSource, /message__box/);
  assert.doesNotMatch(simSource, /message__id/);
  assert.doesNotMatch(simSource, /message__separator/);
});

test("overlay settings includes simulator panel and script", () => {
  const settingsHtml = read("overlay-settings.html");

  assert.match(settingsHtml, /id="simPanel"/);
  assert.match(settingsHtml, /id="simContainer"/);
  assert.match(settingsHtml, /id="simChat"/);
  assert.match(settingsHtml, /id="simCssInjection"/);
  assert.match(settingsHtml, /id="simPlayBtn"/);
  assert.match(settingsHtml, /id="simSpeedRange"/);
  assert.match(settingsHtml, /scripts\/live-simulator\.js/);
  assert.match(settingsHtml, /simUpdateCss\(\)/);
});
```

- [ ] **Step 2: 테스트 실행**

Run: `node --test tests/overlay.test.js`
Expected: 모든 테스트 PASS (기존 12 + 신규 3 = 15)

- [ ] **Step 3: 커밋**

```bash
git add tests/overlay.test.js
git commit -m "test: add live simulator tests"
```

---

### Task 6: 브라우저 검증

- [ ] **Step 1: 로컬 서버 시작**

```bash
node scripts/serve.js &
```

- [ ] **Step 2: 브라우저에서 시뮬레이터 동작 확인**

1. `http://127.0.0.1:4173/overlay-settings.html` 열기
2. ▶ 버튼 클릭 → 채팅 메시지가 동적으로 올라오는지 확인
3. 프리셋 변경 → 시뮬레이터 CSS가 실시간 반영되는지 확인
4. 속도 슬라이더 조절 → 메시지 빈도 변화 확인
5. ↻ 버튼 → 메시지 클리어 + 정지 확인
6. ⏸ 버튼 → 일시정지/재생 토글 확인

- [ ] **Step 3: 서버 종료 및 최종 커밋**

```bash
kill %1
git add -A
git commit -m "feat: live simulator - browser verified"
```
