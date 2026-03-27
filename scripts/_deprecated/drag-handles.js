"use strict";

// ── 드래그 편집 시스템 ──

let _dragState = null;
let _dragTooltip = null;

function dragGetEffectiveValue(prop, v = getValues()) {
  if (prop === "namePaddingX")
    return v.namePaddingX > 0 ? v.namePaddingX : Math.max(v.paddingX - 1, 8);
  if (prop === "splitTextPaddingX")
    return v.splitTextPaddingX > 0 ? v.splitTextPaddingX : v.paddingX;
  if (prop === "splitTextPaddingY")
    return v.splitTextPaddingY > 0 ? v.splitTextPaddingY : v.twoLine ? 6 : 5;
  if (prop === "splitTextOffsetX")
    return v.splitTextOffsetX >= 0
      ? v.splitTextOffsetX
      : v.messageStyle !== "fullBubble"
        ? 2
        : 0;
  if (prop === "avatarFrameSize")
    return v.avatarFrameSize > 0
      ? v.avatarFrameSize
      : Math.max(v.iconSize + 2, 18);
  return +document.getElementById(prop).value;
}

function dragClampToInput(prop, val) {
  const input = document.getElementById(prop);
  if (!input) return val;
  const min = input.min !== "" ? +input.min : -Infinity;
  const max = input.max !== "" ? +input.max : Infinity;
  return Math.max(min, Math.min(max, val));
}

function dragCursorForProp(prop) {
  if (
    prop === "paddingX" ||
    prop === "namePaddingX" ||
    prop === "splitTextPaddingX" ||
    prop === "splitTextOffsetX" ||
    prop === "avatarOffsetX"
  )
    return "ew-resize";
  if (
    prop === "borderRadius" ||
    prop === "capsuleRadius" ||
    prop === "avatarFrameSize"
  )
    return "nwse-resize";
  return "ns-resize";
}

function dragInjectHandles() {
  const chat = document.getElementById("previewChat");
  const v = getValues();
  const layeredMode = v.messageStyle !== "fullBubble";
  const splitMode = v.messageStyle === "splitLayers";
  const hasIcon = hasActiveNickIcon(v);
  const avatarAsLeft = hasIcon && v.iconPlacement === "messageAvatar";
  const avatarSize = dragGetEffectiveValue("avatarFrameSize", v);
  const avatarInset = avatarAsLeft
    ? Math.max(avatarSize + Math.min(v.avatarOffsetX || 0, 0), 0)
    : 0;
  const avatarLeft = (layeredMode ? 0 : v.paddingX) + (v.avatarOffsetX || 0);
  const avatarTop = (layeredMode ? 0 : v.paddingY) + (v.avatarOffsetY || 0);

  chat.querySelectorAll(".drag-handle").forEach((el) => el.remove());

  chat.querySelectorAll("li.message__wrapper").forEach((li) => {
    li.style.position = "relative";

    const hl = document.createElement("div");
    hl.className = "drag-handle drag-handle-x left";
    hl.dataset.prop = "paddingX";
    hl.dataset.dir = "left";
    li.appendChild(hl);

    const hr = document.createElement("div");
    hr.className = "drag-handle drag-handle-x right";
    hr.dataset.prop = "paddingX";
    hr.dataset.dir = "right";
    li.appendChild(hr);

    const hc = document.createElement("div");
    hc.className = "drag-handle drag-handle-corner";
    hc.dataset.prop = "borderRadius";
    li.appendChild(hc);

    if (layeredMode) {
      const name = li.querySelector(".message__name");
      if (name) {
        name.style.position = "relative";
        const nl = document.createElement("div");
        nl.className = "drag-handle drag-handle-inline-x left";
        nl.dataset.prop = "namePaddingX";
        nl.dataset.dir = "left";
        name.appendChild(nl);

        const nr = document.createElement("div");
        nr.className = "drag-handle drag-handle-inline-x right";
        nr.dataset.prop = "namePaddingX";
        nr.dataset.dir = "right";
        name.appendChild(nr);

        const nc = document.createElement("div");
        nc.className = "drag-handle drag-handle-inline-corner";
        nc.dataset.prop = "capsuleRadius";
        name.appendChild(nc);
      }
    }

    if (splitMode) {
      const text = li.querySelector(".message__text");
      if (text) {
        text.style.position = "relative";

        const tl = document.createElement("div");
        tl.className = "drag-handle drag-handle-inline-x left";
        tl.dataset.prop = "splitTextPaddingX";
        tl.dataset.dir = "left";
        text.appendChild(tl);

        const tr = document.createElement("div");
        tr.className = "drag-handle drag-handle-inline-x right";
        tr.dataset.prop = "splitTextPaddingX";
        tr.dataset.dir = "right";
        text.appendChild(tr);

        const tb = document.createElement("div");
        tb.className = "drag-handle drag-handle-inline-y";
        tb.dataset.prop = "splitTextPaddingY";
        text.appendChild(tb);

        const ts = document.createElement("div");
        ts.className = "drag-handle drag-handle-inline-shift";
        ts.dataset.prop = "splitTextOffsetX";
        text.appendChild(ts);
      }
    }

    if (avatarAsLeft) {
      const sizeHandle = document.createElement("div");
      sizeHandle.className = "drag-handle drag-handle-avatar-size";
      sizeHandle.dataset.prop = "avatarFrameSize";
      sizeHandle.style.left = `${avatarLeft + avatarSize - 6}px`;
      sizeHandle.style.top = `${avatarTop + avatarSize - 6}px`;
      li.appendChild(sizeHandle);

      const xHandle = document.createElement("div");
      xHandle.className = "drag-handle drag-handle-avatar-x";
      xHandle.dataset.prop = "avatarOffsetX";
      xHandle.style.left = `${avatarLeft + Math.max(avatarSize / 2 - 11, 0)}px`;
      xHandle.style.top = `${Math.max(avatarTop - 10, 0)}px`;
      li.appendChild(xHandle);

      const yHandle = document.createElement("div");
      yHandle.className = "drag-handle drag-handle-avatar-y";
      yHandle.dataset.prop = "avatarOffsetY";
      yHandle.style.left = `${avatarLeft + avatarSize + 4}px`;
      yHandle.style.top = `${avatarTop + Math.max(avatarSize / 2 - 11, 0)}px`;
      li.appendChild(yHandle);

      li.style.paddingLeft = layeredMode
        ? `${avatarInset}px`
        : li.style.paddingLeft;
    }
  });

  const items = chat.querySelectorAll("li.message__wrapper");
  for (let i = 0; i < items.length - 1; i++) {
    const gap = document.createElement("div");
    gap.className = "drag-handle drag-handle-gap";
    gap.dataset.prop = "chatGap";
    items[i].after(gap);
  }
}

function dragShowTooltip(text, x, y) {
  if (!_dragTooltip) {
    _dragTooltip = document.createElement("div");
    _dragTooltip.className = "drag-tooltip";
    document.body.appendChild(_dragTooltip);
  }
  _dragTooltip.textContent = text;
  _dragTooltip.style.left = x + 14 + "px";
  _dragTooltip.style.top = y - 10 + "px";
  _dragTooltip.style.display = "block";
}

function dragHideTooltip() {
  if (_dragTooltip) _dragTooltip.style.display = "none";
}

document.addEventListener("mousedown", function (e) {
  const handle = e.target.closest(".drag-handle");
  if (!handle) return;
  e.preventDefault();
  e.stopPropagation();

  const prop = handle.dataset.prop;
  const el = handle.closest("li") || handle;
  const currentVal = dragGetEffectiveValue(prop);

  _dragState = {
    prop,
    startX: e.clientX,
    startY: e.clientY,
    startVal: currentVal,
    dir: handle.dataset.dir || "",
    el,
  };

  el.classList.add("fe-drag-active");
  document.body.classList.add("fe-dragging");
  document.body.style.cursor = dragCursorForProp(prop);
});

document.addEventListener("mousemove", function (e) {
  if (!_dragState) return;
  e.preventDefault();

  const { prop, startX, startY, startVal } = _dragState;
  let delta, newVal, label, unit;

  if (prop === "paddingX") {
    delta = (e.clientX - startX) * (_dragState.dir === "left" ? -0.5 : 0.5);
    newVal = dragClampToInput(prop, Math.round(startVal + delta));
    label = "좌우 패딩";
    unit = "px";
  } else if (prop === "namePaddingX") {
    delta = (e.clientX - startX) * (_dragState.dir === "left" ? -0.45 : 0.45);
    newVal = dragClampToInput(prop, Math.round(startVal + delta));
    label = "닉캡슐 여백";
    unit = "px";
  } else if (prop === "splitTextPaddingX") {
    delta = (e.clientX - startX) * (_dragState.dir === "left" ? -0.45 : 0.45);
    newVal = dragClampToInput(prop, Math.round(startVal + delta));
    label = "본문 좌우 여백";
    unit = "px";
  } else if (prop === "splitTextPaddingY") {
    delta = (e.clientY - startY) * 0.25;
    newVal = dragClampToInput(prop, Math.round(startVal + delta));
    label = "본문 상하 여백";
    unit = "px";
  } else if (prop === "splitTextOffsetX") {
    delta = (e.clientX - startX) * 0.25;
    newVal = dragClampToInput(prop, Math.round(startVal + delta));
    label = "본문 X 오프셋";
    unit = "px";
  } else if (prop === "borderRadius") {
    delta = -(e.clientY - startY) * 0.5 + (e.clientX - startX) * -0.3;
    newVal = dragClampToInput(prop, Math.round(startVal + delta));
    label = "둥글기";
    unit = "px";
  } else if (prop === "capsuleRadius") {
    delta = -(e.clientY - startY) * 0.45 + (e.clientX - startX) * -0.25;
    newVal = dragClampToInput(prop, Math.round(startVal + delta));
    label = "닉캡슐 둥글기";
    unit = "px";
  } else if (prop === "chatGap") {
    delta = (e.clientY - startY) * 0.3;
    newVal = dragClampToInput(prop, Math.round(startVal + delta));
    label = "메시지 간격";
    unit = "px";
  } else if (prop === "avatarFrameSize") {
    delta = (e.clientX - startX + (e.clientY - startY)) * 0.2;
    newVal = dragClampToInput(prop, Math.round(startVal + delta));
    label = "아바타 프레임";
    unit = "px";
  } else if (prop === "avatarOffsetX") {
    delta = (e.clientX - startX) * 0.2;
    newVal = dragClampToInput(prop, Math.round(startVal + delta));
    label = "아바타 X 오프셋";
    unit = "px";
  } else if (prop === "avatarOffsetY") {
    delta = (e.clientY - startY) * 0.2;
    newVal = dragClampToInput(prop, Math.round(startVal + delta));
    label = "아바타 Y 오프셋";
    unit = "px";
  }

  if (newVal !== undefined) {
    setRange(prop, newVal);
    update();
    dragShowTooltip(`${label}: ${newVal}${unit}`, e.clientX, e.clientY);
  }
});

document.addEventListener("mouseup", function () {
  if (!_dragState) return;
  _dragState.el.classList.remove("fe-drag-active");
  document.body.classList.remove("fe-dragging");
  document.body.style.cursor = "";
  _dragState = null;
  dragHideTooltip();
  dragInjectHandles();
});

// updatePreview 후 핸들 재주입 (드래그 중에는 건너뜀)
const _origUpdate = window.update;
if (_origUpdate) {
  window.update = function () {
    _origUpdate();
    if (!_dragState) {
      setTimeout(() => {
        dragInjectHandles();
        syncPreviewQuickDock(_feCurrentAnchor || _previewQuickAnchor);
      }, 10);
    }
  };
}
// 초기 주입
setTimeout(() => {
  dragInjectHandles();
  syncPreviewQuickDock(
    document.querySelector("#previewChat li.message__wrapper"),
  );
}, 200);
