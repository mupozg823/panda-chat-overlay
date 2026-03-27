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
  null,
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
