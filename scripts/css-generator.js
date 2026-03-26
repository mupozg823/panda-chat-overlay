"use strict";

// ──── Google Fonts @import 매핑 ────
const GOOGLE_FONT_IMPORTS = {
  "Noto Sans KR":
    "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap",
  "Jeju Gothic":
    "https://fonts.googleapis.com/css2?family=Jeju+Gothic&display=swap",
  "Nanum Gothic":
    "https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700&display=swap",
  "Nanum Myeongjo":
    "https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&display=swap",
  "Black Han Sans":
    "https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap",
  "Do Hyeon": "https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap",
  Jua: "https://fonts.googleapis.com/css2?family=Jua&display=swap",
  Gaegu:
    "https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&display=swap",
  "Hi Melody":
    "https://fonts.googleapis.com/css2?family=Hi+Melody&display=swap",
  "Gamja Flower":
    "https://fonts.googleapis.com/css2?family=Gamja+Flower&display=swap",
  "Single Day":
    "https://fonts.googleapis.com/css2?family=Single+Day&display=swap",
  Dongle:
    "https://fonts.googleapis.com/css2?family=Dongle:wght@300;400;700&display=swap",
  "Gowun Dodum":
    "https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap",
  "IBM Plex Sans KR":
    "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&display=swap",
};

function buildFontImport(fontFamilyValue) {
  for (const [name, url] of Object.entries(GOOGLE_FONT_IMPORTS)) {
    if (fontFamilyValue.includes(name)) {
      return `@import url('${url}');\n`;
    }
  }
  return "";
}

function ensureKoreanFallback(fontFamilyValue) {
  if (fontFamilyValue.includes("Malgun Gothic")) return fontFamilyValue;
  const replaced = fontFamilyValue.replace(
    /,\s*sans-serif/,
    ", 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
  );
  if (replaced !== fontFamilyValue) return replaced;
  if (/^\s*sans-serif\s*$/.test(fontFamilyValue))
    return "'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  if (/,\s*serif\s*$/.test(fontFamilyValue))
    return fontFamilyValue.replace(
      /,\s*serif\s*$/,
      ", 'Malgun Gothic', 'Apple SD Gothic Neo', serif",
    );
  return (
    fontFamilyValue + ", 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif"
  );
}

// ──── CSS 생성 헬퍼 ────
function selectorsFor(themeNames, builders) {
  const builderList = Array.isArray(builders) ? builders : [builders];
  const selectors = [];
  themeNames.forEach((theme) => {
    builderList.forEach((builder) => {
      const value = builder(theme);
      if (Array.isArray(value)) selectors.push(...value);
      else selectors.push(value);
    });
  });
  return selectors.join(",\n");
}

function selectorsForThemedListItems(themeNames, itemClass, tails = "") {
  const tailList = Array.isArray(tails) ? tails : [tails];
  return selectorsFor(themeNames, (theme) =>
    tailList.flatMap((tail) => [
      `ul.${theme} > li.${itemClass}${tail}`,
      `ul > li.${theme}.${itemClass}${tail}`,
    ]),
  );
}

function buildRule(selectors, declarations) {
  if (!selectors || !declarations.length) return "";
  return `${selectors} {\n${declarations.map((line) => `  ${line}`).join("\n")}\n}\n\n`;
}

function buildShadow(enabled, size, color) {
  if (!enabled) return "none";
  const s = size || 2;
  const c = color || "#000000";
  const rgb = hexToRgb(c);
  return `0 0 ${s * 3}px rgba(${rgb.r},${rgb.g},${rgb.b},0.4), 0 ${Math.ceil(s / 2)}px ${s}px rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`;
}

function buildShadowCss(enabled, size, color) {
  return `text-shadow: ${buildShadow(enabled, size, color)} !important;`;
}

function buildAlphaColor(hex, opacity) {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(opacity / 100).toFixed(2)})`;
}

function normalizeCustomCss(value) {
  const text = String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/<\/style>/gi, "")
    .replace(/<script/gi, "")
    .replace(/expression\s*\(/gi, "")
    .replace(/javascript\s*:/gi, "")
    .trim();
  return text ? `${text}\n` : "";
}

function buildBubbleBackground(v) {
  if (v.useGradient) {
    const start = hexToRgb(v.gradStart);
    const end = hexToRgb(v.gradEnd);
    const alpha = (v.bubbleOpacity / 100).toFixed(2);
    return `linear-gradient(${v.gradDirection}, rgba(${start.r}, ${start.g}, ${start.b}, ${alpha}), rgba(${end.r}, ${end.g}, ${end.b}, ${alpha}))`;
  }
  return buildAlphaColor(v.bubbleColor, v.bubbleOpacity);
}

function buildDonationBackground(v) {
  if (v.donationUseGradient) {
    const start = hexToRgb(v.donationGradStart);
    const end = hexToRgb(v.donationGradEnd);
    const alpha = (v.donationOpacity / 100).toFixed(2);
    return `linear-gradient(135deg, rgba(${start.r},${start.g},${start.b},${alpha}), rgba(${end.r},${end.g},${end.b},${alpha}))`;
  }
  return buildAlphaColor(v.donationColor, v.donationOpacity);
}

function buildDonationGlow(v) {
  if (!v.donationGlow || v.donationGlowSize <= 0) return "none";
  const c = hexToRgb(v.donationGlowColor);
  return `0 0 ${v.donationGlowSize}px rgba(${c.r},${c.g},${c.b},0.35), 0 0 ${Math.round(v.donationGlowSize * 0.4)}px rgba(${c.r},${c.g},${c.b},0.2)`;
}

function buildNameBubbleBackground(v) {
  if (v.nameUseGradient) {
    const start = hexToRgb(v.nameGradStart);
    const end = hexToRgb(v.nameGradEnd);
    const alpha = (v.nameBubbleOpacity / 100).toFixed(2);
    return `linear-gradient(${v.gradDirection}, rgba(${start.r}, ${start.g}, ${start.b}, ${alpha}), rgba(${end.r}, ${end.g}, ${end.b}, ${alpha}))`;
  }
  return buildAlphaColor(v.nameBubbleColor, v.nameBubbleOpacity);
}

const avatarFrameShapeOptions = [
  { value: "circle", text: "원형 프레임" },
  { value: "rounded", text: "둥근 사각" },
  { value: "square", text: "사각 프레임" },
  { value: "bare", text: "프레임 없음" },
];

function hasActiveNickIcon(v) {
  return Boolean(
    (v.nickIcon === "__custom_img__" && v.customIconUrl) ||
    (v.nickIcon && v.nickIcon !== "__custom_img__"),
  );
}

function getAvatarFrameShape(v) {
  return v.avatarFrameShape || "circle";
}

function getAvatarFrameRadius(shape, size) {
  if (shape === "circle") return "50%";
  if (shape === "rounded") return `${Math.max(6, Math.round(size * 0.24))}px`;
  return "0px";
}

function buildAvatarFrameTokens(v, frameSize) {
  const shape = getAvatarFrameShape(v);
  const bare = shape === "bare";
  const bg = hexToRgb(v.avatarBgColor || "#ffffff");
  const border = hexToRgb(v.avatarBorderColor || "#ffffff");
  return {
    shape,
    bare,
    radius: getAvatarFrameRadius(shape, frameSize),
    background: bare
      ? "transparent"
      : `rgba(${bg.r},${bg.g},${bg.b},${v.avatarBgOpacity / 100})`,
    border:
      bare || v.avatarBorderWidth <= 0
        ? "none"
        : `${v.avatarBorderWidth}px solid rgba(${border.r},${border.g},${border.b},0.72)`,
    shadow:
      bare || v.avatarShadow <= 0
        ? "none"
        : `0 ${Math.round(v.avatarShadow * 0.375)}px ${v.avatarShadow}px rgba(0,0,0,0.2)`,
    imageFit: bare ? "contain" : "cover",
  };
}

function escapeForCssContent(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\A ")
    .replace(/\r/g, "");
}

function escapeForCssUrl(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "")
    .replace(/\r/g, "")
    .replace(/\)/g, "\\)");
}

// ──── CSS 출력 및 복사 ────
function updateCSS(v) {
  const targets = getTargetThemes(v.compatTheme);
  const bubbleBackground = buildBubbleBackground(v);
  const nameBubbleBackground = buildNameBubbleBackground(v);
  const donationBackground = buildDonationBackground(v);
  const donationGlowShadow = buildDonationGlow(v);
  const noticeBackground = buildAlphaColor(v.noticeColor, v.noticeOpacity);
  const effectiveBorderRadius = v.borderRadius >= 50 ? 999 : v.borderRadius;
  const effectiveDonationRadius =
    v.donationRadius > 0 ? v.donationRadius : effectiveBorderRadius;
  const effectiveNoticeRadius =
    v.noticeRadius > 0 ? v.noticeRadius : effectiveBorderRadius;
  const effectiveNickFontSize =
    v.nickFontSize > 0 ? v.nickFontSize : v.fontSize;
  const effectiveCapsuleRadius = v.capsuleRadius >= 50 ? 999 : v.capsuleRadius;
  const borderLine =
    v.borderWidth > 0
      ? `border: ${v.borderWidth}px solid ${v.borderColor} !important;`
      : "border: none !important;";
  const boxShadowLine =
    v.boxShadowSize > 0
      ? `box-shadow: 0 ${Math.ceil(v.boxShadowSize / 2)}px ${v.boxShadowSize}px ${buildAlphaColor(v.boxShadowColor, 40)} !important;`
      : "box-shadow: none !important;";
  const layeredMode = v.messageStyle !== "fullBubble";
  const capsuleMode = v.messageStyle === "nameCapsule";
  const splitMode = v.messageStyle === "splitLayers";
  const effectiveNamePaddingX =
    v.namePaddingX > 0 ? v.namePaddingX : Math.max(v.paddingX - 1, 8);
  const effectiveSplitTextPaddingX =
    v.splitTextPaddingX > 0 ? v.splitTextPaddingX : v.paddingX;
  const effectiveSplitTextPaddingY =
    v.splitTextPaddingY > 0 ? v.splitTextPaddingY : v.twoLine ? 6 : 5;
  const effectiveSplitTextOffsetX =
    v.splitTextOffsetX >= 0 ? v.splitTextOffsetX : layeredMode ? 2 : 0;
  const hasCustomAvatar = v.nickIcon === "__custom_img__" && v.customIconUrl;
  const hasEmojiAvatar = v.nickIcon && v.nickIcon !== "__custom_img__";
  const hasAvatar = hasActiveNickIcon(v);
  const avatarSize =
    v.avatarFrameSize > 0 ? v.avatarFrameSize : Math.max(v.iconSize + 2, 18);
  const avatarFrame = buildAvatarFrameTokens(v, avatarSize);
  const avatarAsLeft = hasAvatar && v.iconPlacement === "messageAvatar";
  const avatarInset = avatarAsLeft
    ? Math.max(avatarSize + Math.min(v.avatarOffsetX || 0, 0), 0)
    : 0;
  const avatarOffsetX = v.avatarOffsetX || 0;
  const avatarOffsetY = v.avatarOffsetY || 0;

  const selectors = {
    container: selectorsFor(targets, (theme) => `ul.${theme}`),
    messageItem: selectorsForThemedListItems(targets, "message__wrapper"),
    messageItemBefore: selectorsForThemedListItems(
      targets,
      "message__wrapper",
      "::before",
    ),
    messageBox: selectorsForThemedListItems(
      targets,
      "message__wrapper",
      " > div.message__box",
    ),
    messageNick: selectorsForThemedListItems(
      targets,
      "message__wrapper",
      " .message__nick",
    ),
    messageNickBefore: selectorsForThemedListItems(
      targets,
      "message__wrapper",
      " .message__nick::before",
    ),
    messageName: selectorsForThemedListItems(
      targets,
      "message__wrapper",
      " .message__name",
    ),
    messageNameBefore: selectorsForThemedListItems(
      targets,
      "message__wrapper",
      " .message__name::before",
    ),
    messageNameAfter: selectorsForThemedListItems(
      targets,
      "message__wrapper",
      " .message__name::after",
    ),
    messageId: selectorsForThemedListItems(
      targets,
      "message__wrapper",
      " .message__id",
    ),
    messageSeparator: selectorsForThemedListItems(
      targets,
      "message__wrapper",
      " .message__nick > span:not(.message__name):not(.message__text):not(.message__id)",
    ),
    messageText: selectorsForThemedListItems(
      targets,
      "message__wrapper",
      " .message__text",
    ),
    messageBadge: selectorsForThemedListItems(
      targets,
      "message__wrapper",
      " .message__nick svg",
    ),
    messageBadgeWrap: selectorsForThemedListItems(
      targets,
      "message__wrapper",
      " .mr-1",
    ),
    messageItemAfter: selectorsForThemedListItems(
      targets,
      "message__wrapper",
      "::after",
    ),
    donationItem: selectorsForThemedListItems(targets, "heart__wrapper"),
    donationShell: selectorsForThemedListItems(
      targets,
      "heart__wrapper",
      " .haert__image",
    ),
    donationImageWrap: selectorsForThemedListItems(
      targets,
      "heart__wrapper",
      " .haert__image > div:not(:last-child)",
    ),
    donationImage: selectorsForThemedListItems(targets, "heart__wrapper", [
      " .haert__image > img",
      ' img[alt="heart_image"]',
    ]),
    donationText: selectorsForThemedListItems(targets, "heart__wrapper", [
      " .heart__text",
      " .haert__image",
      " .haert__image p",
      " .haert__image div",
    ]),
    donationAmount: selectorsForThemedListItems(targets, "heart__wrapper", [
      " .heart__text .mx-1",
      " .heart__text span.mx-1",
    ]),
    donationItemBefore: selectorsForThemedListItems(
      targets,
      "heart__wrapper",
      "::before",
    ),
    noticeItem: selectorsForThemedListItems(targets, "chat__notice--list"),
    noticeText: selectorsForThemedListItems(
      targets,
      "chat__notice--list",
      " .notice__text",
    ),
    hideEnd: "nav",
    fade: selectorsFor(targets, (theme) => [
      `ul.${theme} > li.hide__opacity`,
      `ul > li.${theme}.hide__opacity`,
      `ul.${theme} > li .hide__opacity`,
      `ul > li.${theme} .hide__opacity`,
    ]),
    motion: selectorsFor(targets, (theme) => [
      `ul.${theme} > li`,
      `ul > li.${theme}`,
      `ul.${theme} > li *`,
      `ul > li.${theme} *`,
    ]),
  };

  const parts = [];

  const fontImport = buildFontImport(v.fontFamily);
  if (fontImport) {
    parts.push(fontImport + "\n");
  }
  parts.push("/* PandaTV Chat Overlay - full-injection output */\n\n");
  parts.push(
    buildRule("body, html", [
      "background: transparent !important;",
      "overflow: hidden !important;",
    ]),
  );

  if (v.hideNav) {
    parts.push(buildRule("nav", ["display: none !important;"]));
  }

  parts.push("/* 컨테이너 */\n");
  parts.push(
    buildRule(selectors.container, [
      "all: unset !important;",
      "display: flex !important;",
      "flex-direction: column !important;",
      "justify-content: flex-end !important;",
      `align-items: ${v.chatAlign === "right" ? "flex-end" : "flex-start"} !important;`,
      "height: 100vh !important;",
      "overflow: hidden !important;",
      "width: 100% !important;",
      "box-sizing: border-box !important;",
      `padding: ${v.containerPadding}px !important;`,
      `gap: ${v.chatGap}px !important;`,
      "list-style: none !important;",
      "transition: none !important;",
      `font-family: ${ensureKoreanFallback(v.fontFamily)} !important;`,
    ]),
  );

  parts.push("/* 일반 메시지 */\n");
  const messageItemDecls = layeredMode
    ? [
        "all: unset !important;",
        "display: block !important;",
        "position: relative !important;",
        "overflow: hidden !important;",
        "box-sizing: border-box !important;",
        "word-break: break-word !important;",
        "overflow-wrap: break-word !important;",
        "background: transparent !important;",
        "backdrop-filter: none !important;",
        "-webkit-backdrop-filter: none !important;",
        `padding: 0 0 0 ${avatarInset}px !important;`,
        `max-width: ${v.maxWidth}% !important;`,
        "list-style: none !important;",
        `line-height: ${v.lineHeight} !important;`,
        `text-align: ${v.chatAlign === "right" ? "right" : "left"} !important;`,
        `align-self: ${v.chatAlign === "right" ? "flex-end" : "flex-start"} !important;`,
        "transition: none !important;",
      ]
    : [
        "all: unset !important;",
        "display: block !important;",
        "overflow: hidden !important;",
        "box-sizing: border-box !important;",
        "word-break: break-word !important;",
        "overflow-wrap: break-word !important;",
        `background: ${bubbleBackground} !important;`,
        v.blurAmount > 0
          ? `backdrop-filter: blur(${v.blurAmount}px) !important;`
          : "backdrop-filter: none !important;",
        v.blurAmount > 0
          ? `-webkit-backdrop-filter: blur(${v.blurAmount}px) !important;`
          : "-webkit-backdrop-filter: none !important;",
        borderLine,
        `border-radius: ${effectiveBorderRadius}px !important;`,
        avatarAsLeft
          ? `padding: ${v.paddingY}px ${v.paddingX}px ${v.paddingY}px ${avatarInset + v.paddingX}px !important;`
          : `padding: ${v.paddingY}px ${v.paddingX}px !important;`,
        avatarAsLeft || v.bubbleTail ? "position: relative !important;" : "",
        "width: max-content !important;",
        `max-width: ${v.maxWidth}% !important;`,
        "list-style: none !important;",
        `line-height: ${v.lineHeight} !important;`,
        boxShadowLine,
        `text-align: ${v.chatAlign === "right" ? "right" : "left"} !important;`,
        `align-self: ${v.chatAlign === "right" ? "flex-end" : "flex-start"} !important;`,
        "transition: none !important;",
      ].filter(Boolean);
  messageItemDecls.push(
    `font-size: ${v.fontSize}px !important;`,
    `color: ${v.textColor} !important;`,
    "font-family: inherit !important;",
    buildShadowCss(v.textShadow, v.textShadowSize, v.textShadowColor),
  );
  parts.push(buildRule(selectors.messageItem, messageItemDecls));

  const messageBoxDecls = [
    "all: unset !important;",
    "font-family: inherit !important;",
    "display: block !important;",
    "max-width: 100% !important;",
  ];
  if (avatarAsLeft && layeredMode) {
    messageBoxDecls.push(
      "position: relative !important;",
      "z-index: 1 !important;",
      "overflow: visible !important;",
    );
  }
  parts.push(buildRule(selectors.messageBox, messageBoxDecls));

  parts.push(
    buildRule(selectors.messageNick, [
      "all: unset !important;",
      "font-family: inherit !important;",
      `display: ${layeredMode || v.twoLine ? "block" : "inline"} !important;`,
      "position: relative !important;",
    ]),
  );

  const messageNameDecls = [];
  if (layeredMode) {
    messageNameDecls.push(
      "display: inline-flex !important;",
      "align-items: center !important;",
      `min-height: ${avatarSize}px !important;`,
      `padding: 0 ${effectiveNamePaddingX}px !important;`,
      `background: ${nameBubbleBackground} !important;`,
      `border-radius: ${effectiveCapsuleRadius}px !important;`,
      boxShadowLine,
    );
  }
  messageNameDecls.push(
    `color: ${v.nickColor} !important;`,
    `font-size: ${effectiveNickFontSize}px !important;`,
    buildShadowCss(v.textShadow, v.textShadowSize, v.textShadowColor),
    `font-weight: ${v.nickBold ? "700" : "400"} !important;`,
    "max-width: 100% !important;",
    "overflow: hidden !important;",
    "text-overflow: ellipsis !important;",
    "white-space: nowrap !important;",
  );
  if (v.nickLetterSpacing > 0) {
    messageNameDecls.push(
      `letter-spacing: ${v.nickLetterSpacing}px !important;`,
    );
  }
  parts.push(buildRule(selectors.messageName, messageNameDecls));

  // .message__id (PandaTV가 인라인 text-shadow를 주입하므로 직접 타겟 필요)
  const messageIdDecls = [
    buildShadowCss(v.textShadow, v.textShadowSize, v.textShadowColor),
    `font-weight: ${v.nickBold ? "700" : "400"} !important;`,
  ];
  if (v.hideId) {
    messageIdDecls.push("display: none !important;");
  }
  parts.push(buildRule(selectors.messageId, messageIdDecls));

  // 닉네임 프레임 (::after)
  if (v.nameFrameEnabled) {
    const fAlpha = (v.nameFrameOpacity / 100).toFixed(2);
    const fc1 = hexToRgb(v.nameFrameColor1);
    const fc2 = hexToRgb(v.nameFrameColor2);
    const pad = v.nameFramePadding;
    parts.push(
      buildRule(selectors.messageName, [
        "position: relative !important;",
        "z-index: 1 !important;",
      ]),
    );
    parts.push(
      buildRule(selectors.messageNameAfter, [
        "content: '' !important;",
        "position: absolute !important;",
        `top: -${pad}px !important;`,
        `right: -${pad + 4}px !important;`,
        `bottom: -${pad}px !important;`,
        `left: -${pad + 4}px !important;`,
        `background: linear-gradient(135deg, rgba(${fc1.r},${fc1.g},${fc1.b},${fAlpha}), rgba(${fc2.r},${fc2.g},${fc2.b},${fAlpha})) !important;`,
        `border-radius: ${v.nameFrameRadius}px !important;`,
        "z-index: -1 !important;",
        "pointer-events: none !important;",
      ]),
    );
  }

  // 구분자 (실제 DOM: 클래스 없는 span — .message__nick > span:not(.message__name):not(.message__text))
  const separatorDecls = [
    `display: ${layeredMode || v.twoLine || !v.separatorText ? "none" : "inline"} !important;`,
    buildShadowCss(v.textShadow, v.textShadowSize, v.textShadowColor),
  ];
  if (
    v.separatorText &&
    v.separatorText !== ": " &&
    !layeredMode &&
    !v.twoLine
  ) {
    separatorDecls.push("font-size: 0 !important;");
    separatorDecls.push("letter-spacing: 0 !important;");
  }
  parts.push(buildRule(selectors.messageSeparator, separatorDecls));
  if (
    v.separatorText &&
    v.separatorText !== ": " &&
    !layeredMode &&
    !v.twoLine
  ) {
    const separatorAfterSelectors = selectorsForThemedListItems(
      targets,
      "message__wrapper",
      " .message__nick > span:not(.message__name):not(.message__text):not(.message__id)::after",
    );
    parts.push(
      buildRule(separatorAfterSelectors, [
        `content: '${escapeForCssContent(v.separatorText)}' !important;`,
      ]),
    );
  }

  const messageTextDecls = [
    `display: ${layeredMode || v.twoLine ? "block" : "inline"} !important;`,
    `color: ${v.textColor} !important;`,
    "font-family: inherit !important;",
    buildShadowCss(v.textShadow, v.textShadowSize, v.textShadowColor),
    `margin-top: ${splitMode ? 0 : capsuleMode ? 4 : v.twoLine ? 2 : 0}px !important;`,
    `margin-left: ${layeredMode ? effectiveSplitTextOffsetX : 0}px !important;`,
  ];
  const hasTextBg = v.textBgOpacity > 0 && !splitMode;
  if (splitMode) {
    messageTextDecls.push(
      `background: ${bubbleBackground} !important;`,
      "border: none !important;",
      boxShadowLine,
      "float: none !important;",
      `padding: ${effectiveSplitTextPaddingY}px ${effectiveSplitTextPaddingX}px !important;`,
      `border-radius: ${effectiveBorderRadius}px !important;`,
      v.blurAmount > 0
        ? `backdrop-filter: blur(${v.blurAmount}px) !important;`
        : "backdrop-filter: none !important;",
      v.blurAmount > 0
        ? `-webkit-backdrop-filter: blur(${v.blurAmount}px) !important;`
        : "-webkit-backdrop-filter: none !important;",
    );
  } else if (hasTextBg) {
    const textBg = buildAlphaColor(v.textBgColor, v.textBgOpacity);
    messageTextDecls.push(
      `background: ${textBg} !important;`,
      "border: none !important;",
      "box-shadow: none !important;",
      "float: none !important;",
      `padding: ${v.textBgPadding}px ${v.textBgPadding + 2}px !important;`,
      `border-radius: ${v.textBgRadius}px !important;`,
      "display: inline-block !important;",
      ...(v.textBgBlur > 0
        ? [
            `backdrop-filter: blur(${v.textBgBlur}px) !important;`,
            `-webkit-backdrop-filter: blur(${v.textBgBlur}px) !important;`,
          ]
        : []),
    );
  }
  messageTextDecls.push(
    `font-weight: ${v.textBold ? "700" : "400"} !important;`,
  );
  if (v.textLetterSpacing > 0) {
    messageTextDecls.push(
      `letter-spacing: ${v.textLetterSpacing}px !important;`,
    );
  }
  parts.push(buildRule(selectors.messageText, messageTextDecls));

  // 채팅 이모티콘 크기 제한 — H-1
  parts.push(
    buildRule(
      selectorsForThemedListItems(
        targets,
        "message__wrapper",
        " .message__text img",
      ),
      ["max-height: 1.5em !important;", "vertical-align: middle !important;"],
    ),
  );

  if (avatarAsLeft && hasCustomAvatar) {
    const leftPos = `${(layeredMode ? 0 : v.paddingX) + avatarOffsetX}px`;
    const topPos = `${(layeredMode ? 0 : v.paddingY) + avatarOffsetY}px`;
    parts.push(
      buildRule(selectors.messageNameBefore, ["content: none !important;"]),
    );
    parts.push(
      buildRule(selectors.messageItemBefore, [
        "content: '' !important;",
        "position: absolute !important;",
        `left: ${leftPos} !important;`,
        `top: ${topPos} !important;`,
        `width: ${avatarSize}px !important;`,
        `height: ${avatarSize}px !important;`,
        "max-width: 100% !important;",
        "display: block !important;",
        "box-sizing: border-box !important;",
        "z-index: 2 !important;",
        "pointer-events: none !important;",
        `background-color: ${avatarFrame.background} !important;`,
        `background-image: url('${escapeForCssUrl(v.customIconUrl)}') !important;`,
        `background-size: ${avatarFrame.bare ? "contain" : `${v.iconSize}px ${v.iconSize}px`} !important;`,
        "background-repeat: no-repeat !important;",
        "background-position: center !important;",
        `border-radius: ${avatarFrame.radius} !important;`,
        `border: ${avatarFrame.border} !important;`,
        `box-shadow: ${avatarFrame.shadow} !important;`,
      ]),
    );
  } else if (avatarAsLeft && hasEmojiAvatar) {
    const leftPos = `${(layeredMode ? 0 : v.paddingX) + avatarOffsetX}px`;
    const topPos = `${(layeredMode ? 0 : v.paddingY) + avatarOffsetY}px`;
    parts.push(
      buildRule(selectors.messageNameBefore, ["content: none !important;"]),
    );
    parts.push(
      buildRule(selectors.messageItemBefore, [
        `content: '${escapeForCssContent(v.nickIcon)}' !important;`,
        "position: absolute !important;",
        `left: ${leftPos} !important;`,
        `top: ${topPos} !important;`,
        `width: ${avatarSize}px !important;`,
        `height: ${avatarSize}px !important;`,
        "max-width: 100% !important;",
        "display: flex !important;",
        "box-sizing: border-box !important;",
        "z-index: 2 !important;",
        "pointer-events: none !important;",
        "align-items: center !important;",
        "justify-content: center !important;",
        `font-size: ${v.iconSize}px !important;`,
        "line-height: 1 !important;",
        `background: ${avatarFrame.background} !important;`,
        `border-radius: ${avatarFrame.radius} !important;`,
        `border: ${avatarFrame.border} !important;`,
        `box-shadow: ${avatarFrame.shadow} !important;`,
      ]),
    );
  } else if (v.nickIcon === "__custom_img__" && v.customIconUrl) {
    parts.push(
      buildRule(selectors.messageItemBefore, ["content: none !important;"]),
    );
    parts.push(
      buildRule(selectors.messageNameBefore, [
        "content: '' !important;",
        "display: inline-block !important;",
        "box-sizing: border-box !important;",
        `width: ${v.iconSize}px !important;`,
        `height: ${v.iconSize}px !important;`,
        `min-width: ${v.iconSize}px !important;`,
        `min-height: ${v.iconSize}px !important;`,
        "max-width: 100% !important;",
        `background-color: ${avatarFrame.background} !important;`,
        `background-image: url('${escapeForCssUrl(v.customIconUrl)}') !important;`,
        `background-size: ${avatarFrame.imageFit} !important;`,
        "background-repeat: no-repeat !important;",
        "background-position: center !important;",
        "vertical-align: -3px !important;",
        "margin-right: 4px !important;",
        `border-radius: ${avatarFrame.radius} !important;`,
        `border: ${avatarFrame.border} !important;`,
        `box-shadow: ${avatarFrame.shadow} !important;`,
      ]),
    );
  } else if (v.nickIcon && v.nickIcon !== "__custom_img__") {
    parts.push(
      buildRule(selectors.messageNameBefore, [
        `content: '${escapeForCssContent(v.nickIcon)}' !important;`,
        "display: inline-block !important;",
        "box-sizing: border-box !important;",
        `width: ${v.iconSize}px !important;`,
        `height: ${v.iconSize}px !important;`,
        `min-width: ${v.iconSize}px !important;`,
        `min-height: ${v.iconSize}px !important;`,
        "max-width: 100% !important;",
        `font-size: ${v.iconSize}px !important;`,
        "line-height: 1 !important;",
        "text-align: center !important;",
        "margin-right: 4px !important;",
        "vertical-align: -2px !important;",
        `background: ${avatarFrame.background} !important;`,
        `border-radius: ${avatarFrame.radius} !important;`,
        `border: ${avatarFrame.border} !important;`,
        `box-shadow: ${avatarFrame.shadow} !important;`,
      ]),
    );
  } else {
    parts.push(
      buildRule(selectors.messageItemBefore, ["content: none !important;"]),
    );
    parts.push(
      buildRule(selectors.messageNameBefore, ["content: none !important;"]),
    );
  }

  const shouldHideBadge = v.hideIcon || (v.nickIcon && v.nickIcon !== "");
  if (shouldHideBadge) {
    parts.push(
      buildRule(selectors.messageBadge, ["display: none !important;"]),
    );
  }

  // 배지 스타일링
  if (!shouldHideBadge) {
    const badgeFilters = [];
    if (v.badgeGrayscale > 0)
      badgeFilters.push(`grayscale(${v.badgeGrayscale}%)`);
    if (v.badgeOpacity < 100) badgeFilters.push(`opacity(${v.badgeOpacity}%)`);
    const badgeWrapDecls = [];
    if (badgeFilters.length > 0)
      badgeWrapDecls.push(`filter: ${badgeFilters.join(" ")} !important;`);
    if (v.badgeScale !== 100) {
      const badgePixel = Math.round((16 * v.badgeScale) / 100);
      badgeWrapDecls.push(
        `width: ${badgePixel}px !important;`,
        `height: ${badgePixel}px !important;`,
        "display: inline-flex !important;",
        "align-items: center !important;",
        "justify-content: center !important;",
        "overflow: hidden !important;",
      );
      parts.push(
        buildRule(selectors.messageBadge, [
          `width: ${badgePixel}px !important;`,
          `height: ${badgePixel}px !important;`,
        ]),
      );
    }
    if (badgeWrapDecls.length > 0) {
      parts.push(buildRule(selectors.messageBadgeWrap, badgeWrapDecls));
    }
  }

  // 말풍선 꼬리
  if (v.bubbleTail && v.messageStyle === "fullBubble") {
    const tailSize = v.bubbleTailSize;
    const bg = hexToRgb(v.bubbleColor);
    const tailColor = `rgba(${bg.r},${bg.g},${bg.b},${(v.bubbleOpacity / 100).toFixed(2)})`;
    parts.push(
      buildRule(selectors.messageItemAfter, [
        "content: '' !important;",
        "position: absolute !important;",
        `bottom: -${tailSize}px !important;`,
        `${v.chatAlign === "right" ? "right" : "left"}: ${tailSize + 4}px !important;`,
        "width: 0 !important;",
        "height: 0 !important;",
        `border-left: ${tailSize}px solid transparent !important;`,
        `border-right: ${tailSize}px solid transparent !important;`,
        `border-top: ${tailSize}px solid ${v.useGradient ? buildAlphaColor(v.gradEnd, v.bubbleOpacity) : tailColor} !important;`,
        "pointer-events: none !important;",
      ]),
    );
  }

  // 진입 애니메이션
  if (v.animationType && v.animationType !== "none" && !v.noAnimation) {
    const keyframes = {
      fadeIn: `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`,
      slideUp: `@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`,
      slideLeft: `@keyframes fadeIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }`,
    };
    if (keyframes[v.animationType]) {
      parts.push(keyframes[v.animationType] + "\n");
    }
  }

  parts.push("/* 후원 메시지 */\n");
  if (v.hideDonation) {
    parts.push(
      buildRule(selectors.donationItem, ["display: none !important;"]),
    );
  } else {
    const donationDecls = [
      "all: unset !important;",
      "display: block !important;",
      "box-sizing: border-box !important;",
      `background: ${donationBackground} !important;`,
      v.blurAmount > 0
        ? `backdrop-filter: blur(${v.blurAmount}px) !important;`
        : "backdrop-filter: none !important;",
      v.blurAmount > 0
        ? `-webkit-backdrop-filter: blur(${v.blurAmount}px) !important;`
        : "-webkit-backdrop-filter: none !important;",
      borderLine,
      `border-radius: ${effectiveDonationRadius}px !important;`,
      `padding: ${v.paddingY}px ${v.paddingX}px !important;`,
      "width: max-content !important;",
      `max-width: ${v.maxWidth}% !important;`,
      "list-style: none !important;",
      donationGlowShadow !== "none"
        ? `box-shadow: ${donationGlowShadow} !important;`
        : boxShadowLine,
      `align-self: ${v.chatAlign === "right" ? "flex-end" : "flex-start"} !important;`,
      "transition: none !important;",
      "word-break: break-word !important;",
      "overflow-wrap: break-word !important;",
    ];
    if (v.donationGap > 0) {
      donationDecls.push(`margin-top: ${v.donationGap}px !important;`);
    }
    parts.push(buildRule(selectors.donationItem, donationDecls));

    parts.push(
      buildRule(selectors.donationShell, [
        "all: unset !important;",
        "display: flex !important;",
        "flex-direction: column !important;",
        "align-items: flex-start !important;",
        "gap: 8px !important;",
      ]),
    );

    const effectiveDonationFontSize =
      v.donationFontSize > 0
        ? v.donationFontSize
        : Math.max(v.fontSize - 1, 11);
    parts.push(
      buildRule(selectors.donationText, [
        `color: ${v.donationTextColor} !important;`,
        `font-size: ${effectiveDonationFontSize}px !important;`,
        buildShadowCss(v.textShadow, v.textShadowSize, v.textShadowColor),
      ]),
    );
    parts.push(
      buildRule(selectors.donationAmount, [
        `color: ${v.heartAmountColor} !important;`,
        "font-weight: 700 !important;",
      ]),
    );

    if (v.hideImg) {
      parts.push(
        buildRule(selectors.donationImageWrap, ["display: none !important;"]),
      );
      parts.push(
        buildRule(selectors.donationImage, ["display: none !important;"]),
      );
    } else {
      parts.push(
        buildRule(selectors.donationImageWrap, ["display: block !important;"]),
      );
      parts.push(
        buildRule(selectors.donationImage, [
          `width: ${v.donationImgSize}px !important;`,
          `height: ${v.donationImgSize}px !important;`,
          `max-width: ${v.donationImgSize}px !important;`,
          `max-height: ${v.donationImgSize}px !important;`,
          "object-fit: contain !important;",
          "display: inline-block !important;",
          "vertical-align: middle !important;",
          ...(v.donationImgRadius > 0
            ? [`border-radius: ${v.donationImgRadius}px !important;`]
            : []),
          ...(v.donationImgBorder > 0
            ? [
                `border: ${v.donationImgBorder}px solid rgba(255,255,255,0.3) !important;`,
              ]
            : []),
          ...(v.donationImgShadow > 0
            ? [
                `box-shadow: 0 2px ${v.donationImgShadow}px rgba(0,0,0,0.3) !important;`,
              ]
            : []),
        ]),
      );
    }
  }

  if (v.donationDecoLine && !v.hideDonation) {
    parts.push(
      buildRule(selectors.donationItemBefore, [
        "content: '' !important;",
        "position: absolute !important;",
        "top: 0 !important;",
        "left: 10% !important;",
        "right: 10% !important;",
        "height: 2px !important;",
        `background: linear-gradient(90deg, transparent, ${v.donationDecoColor}, transparent) !important;`,
        "pointer-events: none !important;",
        "z-index: 1 !important;",
      ]),
    );
    // donationItem needs position:relative for the ::before
    parts.push(
      buildRule(selectors.donationItem, ["position: relative !important;"]),
    );
  }

  parts.push("/* 알림/추천 */\n");
  if (v.hideNotice) {
    parts.push(buildRule(selectors.noticeItem, ["display: none !important;"]));
  } else {
    parts.push(
      buildRule(selectors.noticeItem, [
        "all: unset !important;",
        "display: block !important;",
        "box-sizing: border-box !important;",
        `background: ${noticeBackground} !important;`,
        v.blurAmount > 0
          ? `backdrop-filter: blur(${v.blurAmount}px) !important;`
          : "backdrop-filter: none !important;",
        v.blurAmount > 0
          ? `-webkit-backdrop-filter: blur(${v.blurAmount}px) !important;`
          : "-webkit-backdrop-filter: none !important;",
        borderLine,
        `border-radius: ${effectiveNoticeRadius}px !important;`,
        `padding: ${v.paddingY}px ${v.paddingX}px !important;`,
        "width: max-content !important;",
        `max-width: ${v.maxWidth}% !important;`,
        "list-style: none !important;",
        boxShadowLine,
        `align-self: ${v.chatAlign === "right" ? "flex-end" : "flex-start"} !important;`,
        ...(v.noticeAccentLine
          ? [
              `border-left: ${v.noticeAccentWidth}px solid ${v.noticeAccentColor} !important;`,
            ]
          : []),
      ]),
    );

    const effectiveNoticeFontSize =
      v.noticeFontSize > 0 ? v.noticeFontSize : Math.max(v.fontSize - 1, 11);
    parts.push(
      buildRule(selectors.noticeText, [
        `color: ${v.noticeTextColor} !important;`,
        `font-size: ${effectiveNoticeFontSize}px !important;`,
        buildShadowCss(v.textShadow, v.textShadowSize, v.textShadowColor),
      ]),
    );
  }

  // hideEnd: "방송종료" 영역은 nav 안에 있으므로 hideNav로 이미 처리됨
  // 위험한 유틸 클래스 셀렉터(div.flex.flex-row.flex-wrap)는 ADR-006에 따라 제거

  if (v.preventFade) {
    parts.push(
      buildRule(selectors.fade, [
        "opacity: 1 !important;",
        "transition: none !important;",
      ]),
    );
  }

  if (v.noAnimation) {
    parts.push("/* 애니메이션 제거 */\n");
    parts.push(
      buildRule(selectors.motion, [
        "animation: none !important;",
        "transition: none !important;",
      ]),
    );
  }

  parts.push(buildRule("*", ["scrollbar-width: none !important;"]));
  parts.push(buildRule("::-webkit-scrollbar", ["display: none !important;"]));

  // 등급별 배지
  if (v.useRankBadge && v.rankBadgeIcons) {
    const badgeSize = v.rankBadgeSize || 16;
    const badgeParts = [];
    RANK_BADGES.forEach((rank) => {
      const cfg = v.rankBadgeIcons[rank.key];
      if (!cfg || cfg.type === "default") return;
      const sel = `div.mr-1:has(svg[data-src*="${rank.dataSrc}"])`;
      if (cfg.type === "hide") {
        badgeParts.push(buildRule(sel, ["display: none !important;"]));
      } else if (cfg.type === "emoji" && cfg.emoji) {
        badgeParts.push(buildRule(sel + " svg", ["display: none !important;"]));
        badgeParts.push(
          buildRule(sel + "::before", [
            `content: '${escapeForCssContent(cfg.emoji)}' !important;`,
            `font-size: ${badgeSize}px !important;`,
            "line-height: 1 !important;",
            "vertical-align: middle !important;",
          ]),
        );
      } else if (cfg.type === "image" && cfg.url) {
        badgeParts.push(buildRule(sel + " svg", ["display: none !important;"]));
        badgeParts.push(
          buildRule(sel + "::before", [
            "content: '' !important;",
            "display: inline-block !important;",
            `width: ${badgeSize}px !important;`,
            `height: ${badgeSize}px !important;`,
            `background-image: url('${escapeForCssUrl(cfg.url)}') !important;`,
            "background-size: contain !important;",
            "background-repeat: no-repeat !important;",
            "background-position: center !important;",
            "vertical-align: middle !important;",
          ]),
        );
      }
    });
    if (badgeParts.length) {
      parts.push("/* 등급별 배지 커스터마이즈 (:has() 필요 - OBS v29+) */\n");
      badgeParts.forEach((p) => parts.push(p));
    }
  }

  // 직급별 아바타 이미지
  if (v.useRankAvatar && v.rankAvatarImages && hasAvatar) {
    const avatarParts = [];
    RANK_BADGES.forEach((rank) => {
      const url = v.rankAvatarImages[rank.key];
      if (!url) return;
      const rankHas = `:has(.mr-1 svg[data-src*="${rank.dataSrc}"])`;
      const sel = selectorsForThemedListItems(
        targets,
        `message__wrapper${rankHas}`,
        avatarAsLeft ? "::before" : " .message__name::before",
      );
      avatarParts.push(
        buildRule(sel, [
          `background-image: url('${escapeForCssUrl(url)}') !important;`,
        ]),
      );
    });
    if (avatarParts.length) {
      parts.push("/* 직급별 아바타 이미지 (:has() 필요 - OBS v29+) */\n");
      avatarParts.forEach((p) => parts.push(p));
    }
  }

  // 메시지 수 제한 (nth-last-child)
  if (v.maxMessages > 0) {
    const maxSel = selectorsFor(targets, (theme) => [
      `ul.${theme} > li:nth-last-child(n+${v.maxMessages + 1})`,
      `ul > li.${theme}:nth-last-child(n+${v.maxMessages + 1})`,
    ]);
    parts.push(buildRule(maxSel, ["display: none !important;"]));
  }

  // 텍스트 외곽선 (-webkit-text-stroke)
  if (v.textStroke) {
    const strokeVal = `${v.textStrokeSize || 1}px ${v.textStrokeColor || "#000000"}`;
    parts.push(
      buildRule(selectors.messageName, [
        `-webkit-text-stroke: ${strokeVal} !important;`,
      ]),
    );
    parts.push(
      buildRule(selectors.messageText, [
        `-webkit-text-stroke: ${strokeVal} !important;`,
      ]),
    );
    parts.push(
      buildRule(selectors.messageSeparator, [
        `-webkit-text-stroke: ${strokeVal} !important;`,
      ]),
    );
  }

  const customCss = normalizeCustomCss(v.customCss);
  if (customCss) {
    parts.push("/* 사용자 추가 커스텀 CSS */\n");
    parts.push(customCss);
    parts.push("\n");
  }

  const cssText = parts.filter(Boolean).join("");
  document.getElementById("cssOutput").textContent = cssText;
  const preview = document.getElementById("cssOutputPreview");
  if (preview) {
    const firstLine =
      cssText.trim().split("\n")[0] || "/* PandaTV Chat Overlay */";
    preview.textContent = firstLine;
  }
}

function copyCSS() {
  const css = document.getElementById("cssOutput").textContent;

  function onCopied() {
    const btn = document.getElementById("copyBtn");
    let msg = "복사 완료!";
    if (customIconDataUrl) {
      if (customIconDataUrl.startsWith("data:")) {
        const sizeKB = Math.round(customIconDataUrl.length / 1024);
        if (sizeKB > 200) {
          msg = `복사 완료! (아이콘 ${sizeKB}KB — 100KB 이하 권장)`;
        } else {
          msg = "복사 완료! (아이콘 포함)";
        }
      } else if (
        customIconDataUrl.startsWith("http://localhost") ||
        customIconDataUrl.startsWith("file://")
      ) {
        msg = "복사 완료! (로컬 URL — OBS에서 안 보일 수 있음)";
      } else {
        msg = "복사 완료! (아이콘 URL 포함)";
      }
    }
    if (btn) {
      btn.textContent = msg;
      btn.classList.add("copied");
    }
    setTimeout(() => {
      if (btn) {
        btn.textContent = "CSS 복사";
        btn.classList.remove("copied");
      }
    }, 3000);
  }

  // clipboard API 사용 가능하면 사용, 아니면 execCommand fallback (file:// 지원)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(css)
      .then(onCopied)
      .catch(() => {
        if (fallbackCopy(css)) onCopied();
        else onCopyFailed();
      });
  } else {
    if (fallbackCopy(css)) onCopied();
    else onCopyFailed();
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;left:-9999px;top:-9999px;";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  return ok;
}

function onCopyFailed() {
  const btn = document.getElementById("copyBtn");
  if (btn) {
    btn.textContent = "복사 실패 — 수동 복사해주세요";
    btn.classList.add("copied");
  }
  setTimeout(() => {
    if (btn) {
      btn.textContent = "CSS 복사";
      btn.classList.remove("copied");
    }
  }, 4000);
}
