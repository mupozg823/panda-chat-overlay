"use strict";

// ──── PandaTV 역공학 데이터 기반 시뮬레이션 데이터 ────

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

// 등급 코드 (역공학: module 22302 + badge 매핑)
const SIM_LEVELS = [
  { lev: "bj", color: "#ff9912", label: "BJ", svgName: "ico_class_bj" },
  {
    lev: "chairman",
    color: "#e74c3c",
    label: "회장",
    svgName: "ico_chairman",
  },
  { lev: "m", color: "#303031", label: "매니저", svgName: "ico_class_m" },
  { lev: "n", color: null, label: null, svgName: "ico_class_n" },
  { lev: "b", color: "#cd7f32", label: null, svgName: "ico_class_b" },
  { lev: "s", color: "#c0c0c0", label: null, svgName: "ico_class_s" },
  { lev: "g", color: "#ffd700", label: null, svgName: "ico_class_g" },
  { lev: "d", color: "#b9f2ff", label: null, svgName: "ico_class_d" },
  { lev: "v", color: "#9b59b6", label: null, svgName: "ico_class_v" },
];

// 채팅 시 자주 사용되는 등급 분포 (일반:70%, bj:5%, manager:5%, chairman:2%, 나머지 등급)
const SIM_LEVEL_WEIGHTS = [
  { lev: "n", weight: 40 },
  { lev: "b", weight: 15 },
  { lev: "s", weight: 10 },
  { lev: "g", weight: 8 },
  { lev: "d", weight: 5 },
  { lev: "v", weight: 5 },
  { lev: "bj", weight: 5 },
  { lev: "m", weight: 7 },
  { lev: "chairman", weight: 5 },
];

const SIM_NOTICE_TYPES = [
  {
    type: "Recommend",
    template: (nick) => `<span>${nick}</span>님께서&nbsp;추천하셨습니다.`,
  },
  {
    type: "FanIn",
    template: (nick) =>
      `<span>${nick}</span>님이&nbsp;팬클럽에&nbsp;가입하셨습니다.`,
  },
  {
    type: "KingFanIn",
    template: (nick) =>
      `<span>${nick}</span>님이&nbsp;킹팬클럽에&nbsp;가입하셨습니다!`,
  },
  {
    type: "FanUp",
    template: (nick) =>
      `<span>${nick}</span>님의&nbsp;팬&nbsp;등급이&nbsp;올랐습니다!`,
  },
  {
    type: "KingFanUp",
    template: (nick) =>
      `<span>${nick}</span>님의&nbsp;킹팬&nbsp;등급이&nbsp;올랐습니다!`,
  },
  {
    type: "Mission",
    template: (nick) =>
      `<span>${nick}</span>님이&nbsp;미션을&nbsp;완료하셨습니다!`,
  },
];

const SIM_DONATION_AMOUNTS = [100, 500, 1000, 5000, 10000];

// ──── PandaTV 역공학 공식 (module 47538) ────

function _simGenerateTextShadow(size, color) {
  if (!size) return "none";
  const c = color || "rgba(0,0,0,0.8)";
  const offsets = [-1, -0.5, 0, 0.5, 1];
  const shadows = [];
  for (const x of offsets) {
    for (const y of offsets) {
      shadows.push(`${x * size}px ${y * size}px ${size}px ${c}`);
    }
  }
  return shadows.join(", ");
}

// 역공학: nickColor(type, chatTextColor, lev)
function _simNickColor(lev) {
  const levInfo = SIM_LEVELS.find((l) => l.lev === lev);
  if (levInfo && levInfo.color) return levInfo.color;
  return "rgb(241,241,241)";
}

// ID 마스킹 (역공학: 실제 위젯 마스킹 방식)
function _simMaskId(nick) {
  const base = nick.replace(/[^a-zA-Z0-9가-힣]/g, "").slice(0, 5);
  return base + "***";
}

// ──── DOM 헬퍼 ────

function _simRandItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function _simWeightedRandLevel() {
  const total = SIM_LEVEL_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  for (const entry of SIM_LEVEL_WEIGHTS) {
    r -= entry.weight;
    if (r <= 0) return entry.lev;
  }
  return "n";
}

function _simBadgeSvg(lev) {
  const info = SIM_LEVELS.find((l) => l.lev === lev);
  if (!info) return "";
  if (lev === "bj") {
    return `<span class="mr-1 inline-block w-max align-text-bottom"><span><svg data-src="/icons/${info.svgName}.svg" xmlns="http://www.w3.org/2000/svg" width="26" height="20" viewBox="0 0 26 20" fill="none" style="width:16px;height:16px;"><rect width="26" height="20" rx="10" fill="${info.color}"/><text x="13" y="14" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">BJ</text></svg></span></span>`;
  }
  if (lev === "chairman") {
    return `<span class="mr-1 inline-block w-max align-text-bottom"><span><svg data-src="/icons/${info.svgName}.svg" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none" style="width:16px;height:16px;"><circle cx="30" cy="30" r="30" fill="${info.color}"/><text x="30" y="36" text-anchor="middle" fill="#fff" font-size="20" font-weight="bold">회</text></svg></span></span>`;
  }
  return `<span class="mr-1 inline-block w-max align-text-bottom"><span><svg data-src="/icons/${info.svgName}.svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:16px;height:16px;"><circle cx="10" cy="10" r="10" fill="${info.color || "#666"}"/></svg></span></span>`;
}

// ──── 스타일 빌더 (역공학: module 89881 K/q 변수) ────

function _simBuildNickStyle(lev) {
  const shadow = _simGenerateTextShadow(1, "rgba(0,0,0,0.8)");
  return `color:${_simNickColor(lev)}; font-size:16px; text-shadow:${shadow}; font-family:'Jeju Gothic', sans-serif;`;
}

function _simBuildTextStyle() {
  const shadow = _simGenerateTextShadow(1, "rgba(0,0,0,0.8)");
  return `color:rgb(241,241,241); font-size:16px; text-shadow:${shadow}; font-family:'Jeju Gothic', sans-serif;`;
}

function _simBuildNoticeStyle() {
  const shadow = _simGenerateTextShadow(1, "rgba(0,0,0,0.8)");
  return `color:rgb(122,112,244); font-size:16px; text-shadow:${shadow};`;
}

// ──── DOM 생성 (역공학: module 89881 4가지 레이아웃) ────

function simCreateChatMessage() {
  const nick = _simRandItem(SIM_NICKNAMES);
  const msg = _simRandItem(SIM_MESSAGES);
  const lev = _simWeightedRandLevel();
  const nickStyle = _simBuildNickStyle(lev);
  const textStyle = _simBuildTextStyle();
  const badge = _simBadgeSvg(lev);
  const maskedId = _simMaskId(nick);

  const li = document.createElement("li");
  li.className = "message__wrapper chat fadeIn default hide__opacity";
  li.style.cssText = "text-align:left; font-family:'Jeju Gothic', sans-serif;";

  // chatInline 레이아웃 — badge를 span으로 변경하여 p 안에서 유효한 HTML 유지
  li.innerHTML = [
    `<p class="message__nick hide__opacity">`,
    badge,
    `<span class="message__name" style="${nickStyle}">${nick}</span>`,
    `<span class="message__id" style="display:none;${nickStyle}">(${maskedId})</span>`,
    `<span style="${nickStyle}">:&nbsp;&nbsp;</span>`,
    `<span class="message__text" style="${textStyle}"><span>${msg}</span></span>`,
    `</p>`,
  ].join("");

  return li;
}

function simCreateDonation() {
  const nick = _simRandItem(SIM_NICKNAMES);
  const amount = _simRandItem(SIM_DONATION_AMOUNTS);
  const isExcel = Math.random() < 0.2;
  const noticeStyle = _simBuildNoticeStyle();

  const li = document.createElement("li");
  li.className =
    "default chat heart__wrapper animated hide__opacity min-h-max w-max fadeIn break-keep";
  li.style.cssText =
    "display:flex; flex-direction:column; align-items:start; width:100%; font-family:'Jeju Gothic', sans-serif;";

  let excelHtml = "";
  if (isExcel) {
    const excelTarget = _simRandItem(SIM_NICKNAMES);
    const excelType = Math.random() < 0.5 ? "플러스" : "마이너스";
    excelHtml = `<p class="hide__opacity heart__text relative top-2 mb-2 whitespace-nowrap p-0" style="${noticeStyle}"><span>${excelTarget}</span>님에게 <span class="mx-1">${amount}</span> <span class="mr-1">${excelType}</span> 선물!</p>`;
  }

  // 역공학: heart__wrapper DOM (width=240 height=300)
  li.innerHTML = [
    `<div class="haert__image hide__opacity flex max-h-[360px] w-full flex-col text-left items-start" style="display:flex; flex-direction:column; align-items:start; width:100%;">`,
    `<img alt="heart_image" width="240" height="300" src="assets/heart_placeholder.svg" style="color:transparent;">`,
    `<div>`,
    `<p class="hide__opacity heart__text mt-0 p-0" style="${noticeStyle}"><span>${nick}</span>님께서&nbsp;${amount}개를&nbsp;선물하셨습니다.</p>`,
    excelHtml,
    `</div>`,
    `</div>`,
  ].join("");

  return li;
}

function simCreateNotice() {
  const nick = _simRandItem(SIM_NICKNAMES);
  const notice = _simRandItem(SIM_NOTICE_TYPES);
  const noticeStyle = _simBuildNoticeStyle();

  const li = document.createElement("li");
  li.className =
    "chat__notice--list chat whitespace-break-spaces fadeIn default hide__opacity";
  li.style.cssText = "text-align:left; font-family:'Jeju Gothic', sans-serif;";
  li.innerHTML = `<p class="notice__text hide__opacity" style="${noticeStyle}">${notice.template(nick)}</p>`;

  return li;
}

// ──── 시뮬레이터 엔진 ────

const SIM_MAX_MESSAGES = 50;
let _simChatTimer = 0;
let _simDonationTimer = 0;
let _simNoticeTimer = 0;
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
  _simChatTimer = setTimeout(_simScheduleChat, _simRandInterval(1000, 3000));
}

function _simScheduleDonation() {
  if (!_simRunning) return;
  _simAppendMessage(simCreateDonation());
  _simDonationTimer = setTimeout(
    _simScheduleDonation,
    _simRandInterval(10000, 20000),
  );
}

function _simScheduleNotice() {
  if (!_simRunning) return;
  _simAppendMessage(simCreateNotice());
  _simNoticeTimer = setTimeout(
    _simScheduleNotice,
    _simRandInterval(15000, 30000),
  );
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
  clearTimeout(_simChatTimer);
  clearTimeout(_simDonationTimer);
  clearTimeout(_simNoticeTimer);
  _simChatTimer = _simDonationTimer = _simNoticeTimer = 0;
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
