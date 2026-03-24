"use strict";

// ── 양방향 편집: 미리보기 클릭 → 플로팅 에디터 ──

function getAvatarEditorControls() {
  const v = getValues();
  const controls = [
    {
      label: "아이콘",
      type: "select",
      id: "nickIcon",
      options: () => {
        const sel = document.getElementById("nickIcon");
        return [...sel.options].map((o) => ({
          value: o.value,
          text: o.textContent,
        }));
      },
    },
    ...(v.nickIcon === "__custom_img__"
      ? [{ label: "이미지", type: "custom_icon_upload" }]
      : []),
    {
      label: "배치",
      type: "select",
      id: "iconPlacement",
      options: () => {
        const sel = document.getElementById("iconPlacement");
        return [...sel.options].map((o) => ({
          value: o.value,
          text: o.textContent,
        }));
      },
    },
    {
      label: "크기",
      type: "range",
      id: "iconSize",
      min: 12,
      max: 64,
      unit: "px",
    },
    {
      label: "프레임",
      type: "select",
      id: "avatarFrameShape",
      options: avatarFrameShapeOptions,
    },
  ];

  if (v.iconPlacement === "messageAvatar") {
    controls.push(
      {
        label: "프레임크기",
        type: "range",
        id: "avatarFrameSize",
        min: 0,
        max: 64,
        unit: "px",
        fmt: (value) => (value === 0 ? "자동" : value + "px"),
      },
      {
        label: "X오프셋",
        type: "range",
        id: "avatarOffsetX",
        min: -24,
        max: 24,
        unit: "px",
      },
      {
        label: "Y오프셋",
        type: "range",
        id: "avatarOffsetY",
        min: -24,
        max: 24,
        unit: "px",
      },
    );
  }

  if (v.avatarFrameShape !== "bare") {
    controls.push(
      {
        label: "배경색",
        type: "color",
        id: "avatarBgColor",
        hex: "avatarBgHex",
      },
      {
        label: "배경 투명도",
        type: "range",
        id: "avatarBgOpacity",
        min: 0,
        max: 100,
        unit: "%",
      },
      {
        label: "테두리색",
        type: "color",
        id: "avatarBorderColor",
        hex: "avatarBorderHex",
      },
      {
        label: "테두리 두께",
        type: "range",
        id: "avatarBorderWidth",
        min: 0,
        max: 5,
        unit: "px",
      },
      {
        label: "그림자",
        type: "range",
        id: "avatarShadow",
        min: 0,
        max: 30,
        unit: "px",
      },
    );
  }

  return controls;
}

function feGetControls(type) {
  const style = document.getElementById("messageStyle").value;
  const isCapsule = style === "nameCapsule";
  const isSplit = style === "splitLayers";
  const isLayered = style !== "fullBubble";
  const configs = {
    bubble: {
      title: "말풍선 / 레이아웃",
      context: isSplit
        ? "현재는 닉네임과 본문이 분리형으로 렌더링됩니다. 팬더HP에서 가능한 텍스트 색/크기 대신 레이어와 배치만 조정합니다."
        : "말풍선 외곽과 메시지 배치를 조정합니다. 팬더HP에서 가능한 텍스트 편집은 이곳에서 제외합니다.",
      controls: [
        {
          label: "스타일",
          type: "select",
          id: "messageStyle",
          options: () => {
            const sel = document.getElementById("messageStyle");
            return [...sel.options].map((o) => ({
              value: o.value,
              text: o.textContent,
            }));
          },
        },
        { label: "2줄모드", type: "toggle", id: "twoLine" },
        {
          label: "정렬",
          type: "select",
          id: "chatAlign",
          options: () => {
            const sel = document.getElementById("chatAlign");
            return [...sel.options].map((o) => ({
              value: o.value,
              text: o.textContent,
            }));
          },
        },
        { label: "배경색", type: "color", id: "bubbleColor", hex: "bubbleHex" },
        {
          label: "투명도",
          type: "range",
          id: "bubbleOpacity",
          min: 10,
          max: 100,
          unit: "%",
        },
        { label: "그라데이션", type: "toggle", id: "useGradient" },
        {
          label: "둥글기",
          type: "range",
          id: "borderRadius",
          min: 0,
          max: 50,
          unit: "px",
          fmt: (v) => (v >= 50 ? "max" : `${v}px`),
        },
        {
          label: "흐림",
          type: "range",
          id: "blurAmount",
          min: 0,
          max: 20,
          unit: "px",
        },
        {
          label: "테두리",
          type: "range",
          id: "borderWidth",
          min: 0,
          max: 5,
          unit: "px",
        },
        {
          label: "테두리색",
          type: "color",
          id: "borderColor",
          hex: "borderColorHex",
        },
        {
          label: "그림자",
          type: "range",
          id: "boxShadowSize",
          min: 0,
          max: 20,
          unit: "px",
        },
        {
          label: "그림자색",
          type: "color",
          id: "boxShadowColor",
          hex: "boxShadowColorHex",
        },
        {
          label: "좌우여백",
          type: "range",
          id: "paddingX",
          min: 4,
          max: 30,
          unit: "px",
        },
        {
          label: "상하여백",
          type: "range",
          id: "paddingY",
          min: 0,
          max: 16,
          unit: "px",
        },
        {
          label: "메시지간격",
          type: "range",
          id: "chatGap",
          min: 0,
          max: 10,
          unit: "px",
        },
        {
          label: "최대너비",
          type: "range",
          id: "maxWidth",
          min: 50,
          max: 100,
          unit: "%",
        },
      ],
    },
    nick: {
      title: "닉네임",
      context: isSplit
        ? "분리형에서는 닉네임 캡슐이 별도 레이어로 렌더링됩니다."
        : isCapsule
          ? "닉네임 글자와 캡슐 영역을 함께 조정합니다."
          : "팬더HP에서 못 하는 닉네임 캡슐/구분자 중심 조정만 제공합니다.",
      controls: [
        { label: "닉네임색", type: "color", id: "nickColor", hex: "nickHex" },
        { label: "구분자", type: "text", id: "separatorText" },
        ...(isLayered
          ? [
              {
                label: "캡슐배경",
                type: "color",
                id: "nameBubbleColor",
                hex: "nameBubbleHex",
              },
              {
                label: "캡슐투명도",
                type: "range",
                id: "nameBubbleOpacity",
                min: 10,
                max: 100,
                unit: "%",
              },
              {
                label: "캡슐둥글기",
                type: "range",
                id: "capsuleRadius",
                min: 0,
                max: 50,
                unit: "px",
              },
              {
                label: "캡슐좌우여백",
                type: "range",
                id: "namePaddingX",
                min: 0,
                max: 24,
                unit: "px",
                fmt: (v) => (v === 0 ? "자동" : v + "px"),
              },
              {
                label: "캡슐그라데이션",
                type: "toggle",
                id: "nameUseGradient",
              },
              {
                label: "그라데이션 시작",
                type: "color",
                id: "nameGradStart",
                hex: "nameGradStartHex",
              },
              {
                label: "그라데이션 끝",
                type: "color",
                id: "nameGradEnd",
                hex: "nameGradEndHex",
              },
            ]
          : [
              {
                label:
                  "닉네임 캡슐 배경은 분리형/닉네임 캡슐형에서만 표시됩니다.",
                type: "info",
              },
            ]),
      ],
    },
    text: {
      title: "본문 텍스트",
      context: isSplit
        ? "분리형에서는 본문이 별도 레이어로 렌더링됩니다."
        : "팬더HP에서 없는 본문 레이어/배경 확장만 조정합니다.",
      controls: [
        { label: "글자색", type: "color", id: "textColor", hex: "textHex" },
        { label: "2줄모드", type: "toggle", id: "twoLine" },
        ...(isSplit
          ? [
              {
                label: "본문배경",
                type: "color",
                id: "bubbleColor",
                hex: "bubbleHex",
              },
              {
                label: "본문투명도",
                type: "range",
                id: "bubbleOpacity",
                min: 10,
                max: 100,
                unit: "%",
              },
              {
                label: "본문둥글기",
                type: "range",
                id: "borderRadius",
                min: 0,
                max: 50,
                unit: "px",
                fmt: (v) => (v >= 50 ? "max" : `${v}px`),
              },
              {
                label: "본문블러",
                type: "range",
                id: "blurAmount",
                min: 0,
                max: 20,
                unit: "px",
              },
              {
                label: "본문좌우여백",
                type: "range",
                id: "splitTextPaddingX",
                min: 0,
                max: 24,
                unit: "px",
                fmt: (v) => (v === 0 ? "자동" : v + "px"),
              },
              {
                label: "본문상하여백",
                type: "range",
                id: "splitTextPaddingY",
                min: 0,
                max: 12,
                unit: "px",
                fmt: (v) => (v === 0 ? "자동" : v + "px"),
              },
              {
                label: "본문X오프셋",
                type: "range",
                id: "splitTextOffsetX",
                min: -1,
                max: 12,
                unit: "px",
                fmt: (v) => (v < 0 ? "자동" : v + "px"),
              },
            ]
          : [
              {
                label: "배경색",
                type: "color",
                id: "textBgColor",
                hex: "textBgHex",
              },
              {
                label: "배경투명도",
                type: "range",
                id: "textBgOpacity",
                min: 0,
                max: 100,
                unit: "%",
              },
              {
                label: "배경둥글기",
                type: "range",
                id: "textBgRadius",
                min: 0,
                max: 16,
                unit: "px",
              },
              {
                label: "배경패딩",
                type: "range",
                id: "textBgPadding",
                min: 0,
                max: 12,
                unit: "px",
              },
            ]),
      ],
    },
    donation: {
      title: "후원 메시지",
      context:
        "실제 DOM의 .heart__wrapper / .haert__image 구조를 기준으로 미리봅니다.",
      controls: [
        { label: "숨기기", type: "toggle", id: "hideDonation" },
        { label: "이미지숨김", type: "toggle", id: "hideImg" },
        {
          label: "배경색",
          type: "color",
          id: "donationColor",
          hex: "donationHex",
        },
        {
          label: "투명도",
          type: "range",
          id: "donationOpacity",
          min: 10,
          max: 90,
          unit: "%",
        },
        {
          label: "텍스트색",
          type: "color",
          id: "donationTextColor",
          hex: "donationTextHex",
        },
        {
          label: "금액색",
          type: "color",
          id: "heartAmountColor",
          hex: "heartAmountHex",
        },
        {
          label: "둥글기",
          type: "range",
          id: "donationRadius",
          min: 0,
          max: 30,
          unit: "px",
        },
        {
          label: "이미지크기",
          type: "range",
          id: "donationImgSize",
          min: 0,
          max: 80,
          unit: "px",
        },
        { label: "장식라인", type: "toggle", id: "donationDecoLine" },
        {
          label: "라인색",
          type: "color",
          id: "donationDecoColor",
          hex: "donationDecoHex",
        },
      ],
    },
    notice: {
      title: "알림",
      context:
        "실제 DOM의 .chat__notice--list / .notice__text 구조를 기준으로 미리봅니다.",
      controls: [
        { label: "숨기기", type: "toggle", id: "hideNotice" },
        { label: "배경색", type: "color", id: "noticeColor", hex: "noticeHex" },
        {
          label: "투명도",
          type: "range",
          id: "noticeOpacity",
          min: 10,
          max: 90,
          unit: "%",
        },
        {
          label: "글자색",
          type: "color",
          id: "noticeTextColor",
          hex: "noticeTextHex",
        },
        {
          label: "둥글기",
          type: "range",
          id: "noticeRadius",
          min: 0,
          max: 30,
          unit: "px",
        },
        { label: "포인트라인", type: "toggle", id: "noticeAccentLine" },
        {
          label: "라인색",
          type: "color",
          id: "noticeAccentColor",
          hex: "noticeAccentHex",
        },
        {
          label: "라인두께",
          type: "range",
          id: "noticeAccentWidth",
          min: 1,
          max: 5,
          unit: "px",
        },
      ],
    },
    avatar: {
      title: "아바타 / 아이콘",
      context: () => {
        const v = getValues();
        if (v.avatarFrameShape === "bare")
          return "프레임 없이 아이콘 자체만 노출합니다. 배경/테두리/그림자는 적용하지 않습니다.";
        if (v.iconPlacement === "messageAvatar")
          return "좌측 아바타 슬롯을 직접 조정합니다. 프레임 크기와 오프셋까지 함께 수정합니다.";
        return "닉네임 앞 아이콘을 조정합니다. 현재 배치에서는 프레임 크기와 오프셋 대신 아이콘 크기와 프레임 형태가 우선 적용됩니다.";
      },
      controls: () => getAvatarEditorControls(),
    },
  };
  return configs[type] || null;
}

function feIdentify(el, e) {
  const li = el.closest("li.message__wrapper");
  if (li && e) {
    const v = getValues();
    const hasIcon = hasActiveNickIcon(v);

    if (hasIcon) {
      const liRect = li.getBoundingClientRect();
      const clickX = e.clientX - liRect.left;
      const clickY = e.clientY - liRect.top;

      if (v.iconPlacement === "messageAvatar") {
        const layeredMode = v.messageStyle !== "fullBubble";
        const avatarSize =
          v.avatarFrameSize > 0
            ? v.avatarFrameSize
            : Math.max(v.iconSize + 2, 18);
        const avatarLeft =
          (layeredMode ? 0 : v.paddingX) + (v.avatarOffsetX || 0);
        const avatarTop =
          (layeredMode ? 0 : v.paddingY) + (v.avatarOffsetY || 0);
        const hitPadding = 10;
        if (
          clickX >= avatarLeft - hitPadding &&
          clickX <= avatarLeft + avatarSize + hitPadding &&
          clickY >= avatarTop - hitPadding &&
          clickY <= avatarTop + avatarSize + hitPadding
        )
          return "avatar";
      } else {
        // nickSlot 모드: 실제 아이콘은 .message__nick::before 에 붙으므로 nick 기준으로 판정
        const nickEl =
          el.closest(".message__nick") || li.querySelector(".message__nick");
        if (nickEl) {
          const nickRect = nickEl.getBoundingClientRect();
          const nickClickX = e.clientX - nickRect.left;
          const nickClickY = e.clientY - nickRect.top;
          const iconZoneWidth = Math.max(v.iconSize + 18, 32);
          const iconZoneHeight = Math.max(v.iconSize + 16, nickRect.height + 8);
          if (
            nickClickX >= -8 &&
            nickClickX <= iconZoneWidth &&
            nickClickY >= -4 &&
            nickClickY <= iconZoneHeight
          )
            return "avatar";
        }
      }
    }
  }
  if (el.closest(".message__name")) return "nick";
  if (el.closest(".message__text")) return "text";
  if (el.closest("li.message__wrapper")) return "bubble";
  if (el.closest("li.heart__wrapper")) return "donation";
  if (el.closest("li.chat__notice--list")) return "notice";
  return null;
}

function feGetAnchorRoot(anchorEl) {
  if (!anchorEl) return null;
  return anchorEl.closest ? anchorEl.closest("li") || anchorEl : anchorEl;
}

function feGetAvailableTypes(anchorEl) {
  const root = feGetAnchorRoot(anchorEl);
  if (!root) return [];
  if (root.classList.contains("message__wrapper")) {
    const v = getValues();
    const hasIcon = hasActiveNickIcon(v);
    return ["bubble", "nick", "text", ...(hasIcon ? ["avatar"] : [])];
  }
  if (root.classList.contains("heart__wrapper")) return ["donation"];
  if (root.classList.contains("chat__notice--list")) return ["notice"];
  return [];
}

let _previewQuickAnchor = null;

function previewQuickDescribeAnchor(root) {
  if (!root)
    return "메시지 위에 마우스를 올리면 아바타/아이콘 클릭 타깃과 빠른 편집 버튼이 함께 열립니다.";
  if (root.classList.contains("message__wrapper")) {
    const name =
      root.querySelector(".message__name")?.textContent?.trim() ||
      "현재 메시지";
    return `${name} 메시지 선택됨 · 아래 큰 버튼으로 말풍선, 닉네임, 본문${feGetAvailableTypes(root).includes("avatar") ? ", 아바타/아이콘" : ""}을 바로 편집할 수 있습니다.`;
  }
  if (root.classList.contains("heart__wrapper"))
    return "후원 메시지 선택됨 · 작은 텍스트를 정확히 누르지 않아도 아래 버튼으로 바로 편집합니다.";
  if (root.classList.contains("chat__notice--list"))
    return "알림 메시지 선택됨 · 알림 스타일을 아래 버튼으로 바로 편집합니다.";
  return "빠른 편집 대기중";
}

function syncPreviewQuickDock(anchorEl = _previewQuickAnchor) {
  const statusEl = document.getElementById("previewQuickStatus");
  const buttonsEl = document.getElementById("previewQuickButtons");
  if (!statusEl || !buttonsEl) return;
  document.querySelectorAll("#previewChat li.preview-item").forEach((item) => {
    if (!item.hasAttribute("tabindex")) item.tabIndex = 0;
  });

  const root = feGetAnchorRoot(anchorEl);
  _previewQuickAnchor = root;
  buttonsEl.innerHTML = "";
  statusEl.textContent = previewQuickDescribeAnchor(root);

  const availableTypes = feGetAvailableTypes(root);
  if (availableTypes.length === 0) {
    const idleBtn = document.createElement("button");
    idleBtn.type = "button";
    idleBtn.className = "preview-quick-btn";
    idleBtn.disabled = true;
    idleBtn.textContent = "빠른 편집 대기중";
    buttonsEl.appendChild(idleBtn);
    return;
  }

  availableTypes.forEach((type) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "preview-quick-btn";
    if (_feCurrentType === type && _feCurrentAnchor === root)
      btn.classList.add("is-active");
    btn.textContent = previewTargetLabels[type] || type;
    btn.setAttribute(
      "aria-label",
      `${previewTargetLabels[type] || type} 편집 열기`,
    );
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      feShow(type, root, root);
    });
    buttonsEl.appendChild(btn);
  });
}

function feClearHighlights() {
  document
    .querySelectorAll("#previewChat .fe-highlight")
    .forEach((el) => el.classList.remove("fe-highlight"));
  document
    .querySelectorAll("#previewChat .fe-highlight-inline")
    .forEach((el) => el.classList.remove("fe-highlight-inline"));
}

function feApplyHighlight(type, anchorEl, triggerEl) {
  const root = feGetAnchorRoot(anchorEl);
  if (!root) return;

  feClearHighlights();
  root.classList.add("fe-highlight");

  let inlineTarget = null;
  if (type === "nick")
    inlineTarget =
      root.querySelector(".message__name") ||
      triggerEl.closest?.(".message__name");
  else if (type === "text")
    inlineTarget =
      root.querySelector(".message__text") ||
      triggerEl.closest?.(".message__text");
  else if (type === "notice")
    inlineTarget = root.querySelector(".notice__text");
  else if (type === "donation")
    inlineTarget = root.querySelector(".haert__image");

  if (inlineTarget && inlineTarget !== root)
    inlineTarget.classList.add("fe-highlight-inline");
}

function feSetHint(type) {
  const hint = document.getElementById("previewEditHint");
  if (!hint) return;
  if (!type) {
    hint.textContent =
      "메시지 위에 마우스를 올리면 파란/주황 클릭 타깃과 아래 빠른 편집 버튼이 열립니다. 아바타와 아이콘은 해당 타깃을 바로 누르면 됩니다.";
    return;
  }
  const targetLabel = previewTargetLabels[type] || type;
  hint.textContent = `${targetLabel} 편집 중 · 아래 빠른 편집 버튼이나 에디터 상단 버튼으로 다른 요소로 바로 전환할 수 있습니다.`;
}

let _feCurrentType = null;
let _feCurrentAnchor = null;
function feShow(type, anchorEl, triggerEl = anchorEl) {
  const cfg = feGetControls(type);
  if (!cfg) return;
  const editor = document.getElementById("floatingEditor");
  const rootAnchor = feGetAnchorRoot(anchorEl);
  if (!rootAnchor) return;

  // 같은 요소 / 같은 타입을 다시 클릭하면 닫기
  if (
    editor.style.display === "block" &&
    _feCurrentType === type &&
    _feCurrentAnchor === rootAnchor
  ) {
    feClose();
    return;
  }
  _feCurrentType = type;
  _feCurrentAnchor = rootAnchor;
  syncPreviewQuickDock(rootAnchor);
  document.getElementById("feTitle").textContent = cfg.title;
  const body = document.getElementById("feBody");
  body.innerHTML = "";
  feApplyHighlight(type, rootAnchor, triggerEl);
  feSetHint(type);
  const controls =
    typeof cfg.controls === "function" ? cfg.controls() : cfg.controls;
  const contextText =
    typeof cfg.context === "function" ? cfg.context() : cfg.context;

  const availableTypes = feGetAvailableTypes(rootAnchor);
  if (availableTypes.length > 1) {
    const targetBar = document.createElement("div");
    targetBar.className = "fe-targets";
    availableTypes.forEach((targetType) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "fe-target-btn";
      if (targetType === type) btn.classList.add("active");
      btn.textContent = previewTargetLabels[targetType] || targetType;
      btn.addEventListener("click", () =>
        feShow(targetType, rootAnchor, rootAnchor),
      );
      targetBar.appendChild(btn);
    });
    body.appendChild(targetBar);
  }

  if (contextText) {
    const context = document.createElement("div");
    context.className = "fe-context";
    context.textContent = contextText;
    body.appendChild(context);
  }

  controls.forEach((c) => {
    const row = document.createElement("div");
    row.className = "fe-row";
    const lbl = document.createElement("span");
    lbl.className = "fe-label";
    lbl.textContent = c.label;
    row.appendChild(lbl);

    const right = document.createElement("div");
    right.className = "fe-right";

    if (c.type === "color") {
      const inp = document.createElement("input");
      inp.type = "color";
      inp.className = "fe-color";
      inp.value = document.getElementById(c.id).value;
      inp.addEventListener("input", () => {
        document.getElementById(c.id).value = inp.value;
        if (c.hex) document.getElementById(c.hex).value = inp.value;
        update();
      });
      right.appendChild(inp);
    } else if (c.type === "range") {
      const inp = document.createElement("input");
      inp.type = "range";
      inp.className = "fe-range";
      inp.min = c.min;
      inp.max = c.max;
      if (c.step) inp.step = c.step;
      inp.value = document.getElementById(c.id).value;
      const val = document.createElement("span");
      val.className = "fe-val";
      val.textContent = c.fmt ? c.fmt(+inp.value) : inp.value + c.unit;
      inp.addEventListener("input", () => {
        document.getElementById(c.id).value = inp.value;
        val.textContent = c.fmt ? c.fmt(+inp.value) : inp.value + c.unit;
        update();
      });
      right.appendChild(inp);
      right.appendChild(val);
    } else if (c.type === "toggle") {
      const btn = document.createElement("button");
      btn.className = "fe-toggle";
      const isOn = document.getElementById(c.id).classList.contains("on");
      btn.classList.toggle("on", isOn);
      btn.textContent = isOn ? "ON" : "OFF";
      btn.addEventListener("click", () => {
        toggleSwitch(c.id);
        const nowOn = document.getElementById(c.id).classList.contains("on");
        btn.classList.toggle("on", nowOn);
        btn.textContent = nowOn ? "ON" : "OFF";
      });
      right.appendChild(btn);
    } else if (c.type === "info") {
      const info = document.createElement("span");
      info.style.cssText = "color:#888;font-size:11px;";
      info.textContent = c.label;
      right.appendChild(info);
    } else if (c.type === "custom_icon_upload") {
      // 커스텀 이미지 업로드 영역
      const wrap = document.createElement("div");
      wrap.id = "feIconUploadWrap";
      wrap.style.cssText =
        "display:flex;flex-direction:column;gap:4px;width:100%;";
      const isCustom =
        document.getElementById("nickIcon").value === "__custom_img__";
      row.style.display = isCustom ? "" : "none";
      row.id = "feIconUploadRow";

      // 현재 아이콘 미리보기
      if (customIconDataUrl) {
        const preview = document.createElement("img");
        preview.src = customIconDataUrl;
        preview.style.cssText =
          "width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid #555;";
        wrap.appendChild(preview);
      }

      // URL 입력
      const urlInput = document.createElement("input");
      urlInput.type = "text";
      urlInput.placeholder = "이미지 URL 입력";
      urlInput.value = document.getElementById("customIconUrl").value;
      urlInput.style.cssText =
        "width:100%;background:#2a2a4a;border:1px solid #3a3a5a;border-radius:6px;color:#ddd;font-size:11px;padding:3px 6px;";
      urlInput.addEventListener("change", () => {
        const val = urlInput.value.trim();
        if (!val) return;
        document.getElementById("customIconUrl").value = val;
        // base64 변환 시도 (OBS 호환)
        if (val.startsWith("data:")) {
          customIconDataUrl = val;
          document.getElementById("iconPreviewImg").src = customIconDataUrl;
          document.getElementById("iconPreviewRow").style.display = "flex";
          update();
        } else {
          const fetchUrl = val;
          fetch(fetchUrl)
            .then((r) => {
              if (!r.ok) throw new Error("HTTP " + r.status);
              return r.blob();
            })
            .then((blob) => {
              const rd = new FileReader();
              rd.onload = (re) => {
                if (
                  document.getElementById("customIconUrl").value.trim() !==
                  fetchUrl
                )
                  return;
                customIconDataUrl = re.target.result;
                document.getElementById("iconPreviewImg").src =
                  customIconDataUrl;
                document.getElementById("iconPreviewRow").style.display =
                  "flex";
                const img = wrap.querySelector("img");
                if (img) img.src = customIconDataUrl;
                update();
              };
              rd.readAsDataURL(blob);
            })
            .catch(() => {
              if (
                document.getElementById("customIconUrl").value.trim() !==
                fetchUrl
              )
                return;
              customIconDataUrl = fetchUrl;
              document.getElementById("iconPreviewImg").src = fetchUrl;
              document.getElementById("iconPreviewRow").style.display = "flex";
              update();
            });
        }
      });
      wrap.appendChild(urlInput);

      // 파일 업로드 버튼
      const fileBtn = document.createElement("button");
      fileBtn.textContent = "파일 선택";
      fileBtn.style.cssText =
        "background:#3a5a7a;color:#ddd;border:none;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;";
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.style.display = "none";
      fileInput.addEventListener("change", (ev) => {
        const file = ev.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (re) => {
          customIconDataUrl = re.target.result;
          document.getElementById("iconPreviewImg").src = customIconDataUrl;
          document.getElementById("iconPreviewRow").style.display = "flex";
          update();
          // 에디터 내 미리보기 갱신
          const existingPreview = wrap.querySelector("img");
          if (existingPreview) existingPreview.src = customIconDataUrl;
          else {
            const img = document.createElement("img");
            img.src = customIconDataUrl;
            img.style.cssText =
              "width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid #555;";
            wrap.insertBefore(img, wrap.firstChild);
          }
        };
        reader.readAsDataURL(file);
      });
      fileBtn.addEventListener("click", () => fileInput.click());
      wrap.appendChild(fileBtn);
      wrap.appendChild(fileInput);
      right.appendChild(wrap);
    } else if (c.type === "text") {
      const inp = document.createElement("input");
      inp.type = "text";
      inp.className = "fe-input";
      inp.style.width = "72px";
      inp.style.textAlign = "center";
      inp.value = document.getElementById(c.id).value;
      inp.addEventListener("input", () => {
        document.getElementById(c.id).value = inp.value;
        update();
      });
      right.appendChild(inp);
    } else if (c.type === "select") {
      const sel = document.createElement("select");
      sel.className = "fe-select";
      const opts = typeof c.options === "function" ? c.options() : c.options;
      opts.forEach((o) => {
        const opt = document.createElement("option");
        opt.value = o.value;
        opt.textContent = o.text;
        sel.appendChild(opt);
      });
      sel.value = document.getElementById(c.id).value;
      sel.addEventListener("change", () => {
        document.getElementById(c.id).value = sel.value;
        if (c.id === "nickIcon") {
          onNickIconChange();
          _feCurrentType = null;
          requestAnimationFrame(() => {
            const nextTypes = feGetAvailableTypes(rootAnchor);
            if (sel.value === "__custom_img__") {
              feShow("avatar", rootAnchor, rootAnchor);
              return;
            }
            if (!nextTypes.includes("avatar")) {
              feClose();
              syncPreviewQuickDock(rootAnchor);
              return;
            }
            feShow("avatar", rootAnchor, rootAnchor);
          });
        } else if (c.id === "iconPlacement" || c.id === "avatarFrameShape") {
          update();
          _feCurrentType = null;
          requestAnimationFrame(() => feShow(type, rootAnchor, rootAnchor));
        } else if (c.id === "messageStyle") {
          update();
          _feCurrentType = null;
          requestAnimationFrame(() => feShow(type, rootAnchor, rootAnchor));
        } else {
          update();
        }
      });
      right.appendChild(sel);
    }
    row.appendChild(right);
    body.appendChild(row);
  });

  editor.style.display = "block";
  const r = rootAnchor.getBoundingClientRect();
  const ew = editor.offsetWidth;
  const eh = editor.offsetHeight;
  let left = r.left - ew - 12;
  if (left < 8) left = r.right + 12;
  if (left + ew > window.innerWidth - 8) left = window.innerWidth - ew - 8;
  let top = r.top;
  if (top + eh > window.innerHeight - 8) top = window.innerHeight - eh - 8;
  if (top < 8) top = 8;
  editor.style.left = left + "px";
  editor.style.top = top + "px";
}

function feClose() {
  document.getElementById("floatingEditor").style.display = "none";
  _feCurrentType = null;
  _feCurrentAnchor = null;
  feClearHighlights();
  feSetHint();
  syncPreviewQuickDock(_previewQuickAnchor);
}

let _feDragState = null;
document.addEventListener("mousedown", function (e) {
  if (e.target.id !== "feTitle" && !e.target.closest("#feTitle")) return;
  const editor = document.getElementById("floatingEditor");
  _feDragState = {
    startX: e.clientX,
    startY: e.clientY,
    startLeft: parseInt(editor.style.left) || 0,
    startTop: parseInt(editor.style.top) || 0,
  };
  e.preventDefault();
});
document.addEventListener("mousemove", function (e) {
  if (!_feDragState) return;
  const editor = document.getElementById("floatingEditor");
  editor.style.left =
    _feDragState.startLeft + e.clientX - _feDragState.startX + "px";
  editor.style.top =
    _feDragState.startTop + e.clientY - _feDragState.startY + "px";
});
document.addEventListener("mouseup", function () {
  _feDragState = null;
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") feClose();
});

document.getElementById("previewChat").addEventListener("click", function (e) {
  const clickTarget = e.target.closest(".preview-click-target");
  if (clickTarget) {
    e.preventDefault();
    e.stopPropagation();
    const anchor = clickTarget.closest("li") || clickTarget;
    feShow(clickTarget.dataset.feType || "avatar", anchor, clickTarget);
    return;
  }
  const quickBtn = e.target.closest(".preview-quick-btn");
  if (quickBtn) return;
  const type = feIdentify(e.target, e);
  if (!type) return;
  e.stopPropagation();

  const anchor = e.target.closest("li") || e.target;
  feShow(type, anchor, e.target);
});

document
  .getElementById("previewChat")
  .addEventListener("mouseover", function (e) {
    const anchor = e.target.closest("li");
    if (!anchor) return;
    syncPreviewQuickDock(anchor);
  });

document
  .getElementById("previewChat")
  .addEventListener("focusin", function (e) {
    const anchor = e.target.closest("li");
    if (!anchor) return;
    syncPreviewQuickDock(anchor);
  });

document.addEventListener("click", function (e) {
  const editor = document.getElementById("floatingEditor");
  if (editor.style.display === "none") return;
  if (editor.contains(e.target)) return;
  if (document.getElementById("previewChat").contains(e.target)) return;
  if (document.getElementById("previewQuickDock")?.contains(e.target)) return;
  feClose();
});
