(function () {
  "use strict";

  const iframe = document.getElementById("widgetFrame");
  const statusEl = document.getElementById("status");
  const targetLabel = document.getElementById("targetLabel");
  const emptyState = document.getElementById("emptyState");

  const state = { target: null, observer: null, poller: null, normalized: 0 };

  function setStatus(msg, tone) {
    statusEl.textContent = msg;
    statusEl.dataset.tone = tone || "warn";
  }

  // ── URL 파라미터 파싱 ──

  function parseParams() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("target");
    if (!raw) return null;
    const url = new URL(raw, window.location.href);
    if (url.hostname !== "p.pandahp.kr")
      throw new Error("target host must be p.pandahp.kr");
    if (!url.pathname.startsWith("/chat/"))
      throw new Error("target path must start with /chat/");
    return {
      target: url,
      css: params.get("css") || "", // base64-encoded CSS
    };
  }

  function decodeCss(b64) {
    if (!b64) return "";
    try {
      return decodeURIComponent(escape(atob(b64)));
    } catch {
      return "";
    }
  }

  // ── DOM 정규화 (스타일링 없음, 구조만 수정) ──

  /** 최소 안정화 CSS — 레이아웃 모델 충돌만 해소, 비주얼 스타일은 사용자 CSS에 위임 */
  function buildNormalizeCss() {
    const s = `html[data-wrapper] { background: transparent !important; }
html[data-wrapper] body { background: transparent !important; overflow: hidden !important; }
html[data-wrapper] nav { display: none !important; }
html[data-wrapper] ul { overflow: hidden !important; }
html[data-wrapper] ul > li { min-width: 0 !important; max-width: 100% !important; }
html[data-wrapper] ul > li.message__wrapper { overflow: hidden !important; word-break: break-word !important; overflow-wrap: anywhere !important; }
html[data-wrapper] .message__nick { display: block !important; max-width: 100% !important; }
html[data-wrapper] .message__text, html[data-wrapper] .notice__text, html[data-wrapper] .heart__text { float: none !important; clear: none !important; max-width: 100% !important; word-break: break-word !important; overflow-wrap: anywhere !important; }
html[data-wrapper] .box.message__wrapper, html[data-wrapper] .roundbox.message__wrapper { display: block !important; }
html[data-wrapper] .box.message__wrapper > div.message__box > p.message__text, html[data-wrapper] .roundbox.message__wrapper > div.message__box > p.message__text, html[data-wrapper] .roundbox.message__wrapper > p.message__nick > span.message__text { width: auto !important; float: none !important; display: block !important; }
html[data-wrapper] .heart__wrapper { overflow: hidden !important; }
html[data-wrapper] .haert__image { max-width: 100% !important; overflow: hidden !important; }
html[data-wrapper] img[alt="heart_image"] { max-width: 100% !important; height: auto !important; }`;
    return s;
  }

  /** p.message__nick → div.message__nick (invalid HTML 수정) */
  function fixNickElement(nick, doc) {
    if (nick.tagName !== "P") return nick;
    const div = doc.createElement("div");
    div.className = nick.className;
    for (const attr of nick.attributes) {
      if (attr.name !== "class") div.setAttribute(attr.name, attr.value);
    }
    while (nick.firstChild) div.appendChild(nick.firstChild);
    nick.replaceWith(div);
    return div;
  }

  /** message__box가 없으면 생성 */
  function ensureMessageBox(item, doc) {
    let box = item.querySelector(":scope > .message__box");
    if (box) return box;
    box = doc.createElement("div");
    box.className = "message__box";
    while (item.firstChild) box.appendChild(item.firstChild);
    item.appendChild(box);
    return box;
  }

  /** 구분자 span에 클래스 추가 (CSS 셀렉터 안정화) */
  function tagSeparators(nick) {
    for (const child of nick.children) {
      if (
        child.tagName === "SPAN" &&
        !child.classList.contains("message__name") &&
        !child.classList.contains("message__id") &&
        !child.classList.contains("message__text") &&
        !child.classList.contains("message__separator")
      ) {
        child.classList.add("message__separator");
      }
    }
  }

  function normalizeItem(item, doc) {
    if (item.dataset.normalized) return;
    const box = ensureMessageBox(item, doc);
    let nick = box.querySelector(".message__nick");
    if (nick) nick = fixNickElement(nick, doc);
    if (nick) tagSeparators(nick);
    item.dataset.normalized = "1";
    state.normalized++;
  }

  function normalizeAll(container, doc) {
    container
      .querySelectorAll(":scope > li.message__wrapper")
      .forEach((li) => normalizeItem(li, doc));
    container
      .querySelectorAll(
        ":scope > li.heart__wrapper, :scope > li.chat__notice--list",
      )
      .forEach((li) => {
        li.dataset.normalized = "1";
      });
  }

  // ── iframe 연결 ──

  function injectStyles(doc, userCss) {
    if (doc.getElementById("wrapperNormalize")) return;
    doc.documentElement.setAttribute("data-wrapper", "1");

    // 1. 정규화 CSS (레이아웃 모델 충돌 해소)
    const norm = doc.createElement("style");
    norm.id = "wrapperNormalize";
    norm.textContent = buildNormalizeCss();
    doc.head.appendChild(norm);

    // 2. 사용자 CSS (설정기에서 생성한 커스터마이징)
    if (userCss) {
      const user = doc.createElement("style");
      user.id = "wrapperUserCss";
      user.textContent = userCss;
      doc.head.appendChild(user);
    }
  }

  function connectFrame(userCss) {
    const doc = iframe.contentDocument;
    if (!doc) {
      setStatus("iframe 접근 실패", "error");
      return;
    }

    injectStyles(doc, userCss);

    let attempts = 0;
    clearInterval(state.poller);
    state.poller = setInterval(() => {
      attempts++;
      const container =
        doc.getElementById("chat-preview-container") || doc.querySelector("ul");
      if (container) {
        clearInterval(state.poller);
        normalizeAll(container, doc);

        if (state.observer) state.observer.disconnect();
        state.observer = new MutationObserver(() => {
          normalizeAll(container, doc);
          setStatus(`연결됨 · ${container.children.length}개`, "ok");
        });
        state.observer.observe(container, { childList: true, subtree: true });
        setStatus(`연결됨 · ${container.children.length}개`, "ok");
        return;
      }
      if (attempts >= 80) {
        clearInterval(state.poller);
        setStatus("컨테이너 탐지 실패", "error");
      }
    }, 250);
  }

  // ── 초기화 ──

  function init() {
    let config;
    try {
      config = parseParams();
    } catch (e) {
      setStatus(e.message, "error");
      emptyState.textContent = e.message;
      return;
    }
    if (!config) {
      setStatus("target 필요", "warn");
      return;
    }

    const userCss = decodeCss(config.css);
    targetLabel.textContent = config.target.href;
    emptyState.style.display = "none";
    iframe.style.display = "block";
    iframe.src =
      config.target.pathname + config.target.search + config.target.hash;
    iframe.addEventListener("load", () => connectFrame(userCss));
    setStatus("iframe 로딩 중", "warn");
  }

  init();
})();
