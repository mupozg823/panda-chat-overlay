"use strict";

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

function setPreviewThemeClass(previewChat, theme) {
  previewChat.className = `preview-chat ${theme}`;
  previewChat.querySelectorAll(".preview-item").forEach((item) => {
    widgetThemes.forEach((themeName) => item.classList.remove(themeName));
    item.classList.add(theme);
  });
}

function clearPreviewClickTargets(root) {
  if (!root) return;
  root.querySelectorAll(".preview-click-target").forEach((el) => el.remove());
}

function createPreviewClickTarget(
  root,
  { label, left, top, width, height, iconStyle = false },
) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `preview-click-target${iconStyle ? " is-icon" : ""}`;
  btn.dataset.feType = "avatar";
  btn.dataset.feLabel = label;
  btn.setAttribute("aria-label", `${label} 편집`);
  btn.style.left = `${Math.max(Math.round(left), 0)}px`;
  btn.style.top = `${Math.max(Math.round(top), 0)}px`;
  btn.style.width = `${Math.max(Math.round(width), 24)}px`;
  btn.style.height = `${Math.max(Math.round(height), 24)}px`;
  root.appendChild(btn);
  return btn;
}

function syncPreviewAvatarTarget(
  item,
  nameEl,
  v,
  {
    hasAvatar,
    avatarAsLeft,
    layeredMode,
    avatarSize,
    avatarOffsetX,
    avatarOffsetY,
    paddingX,
    paddingY,
  },
) {
  clearPreviewClickTargets(item);
  if (!hasAvatar) return;

  item.style.position = "relative";

  if (avatarAsLeft) {
    const avatarLeft = (layeredMode ? 0 : paddingX) + avatarOffsetX;
    const avatarTop = (layeredMode ? 0 : paddingY) + avatarOffsetY;
    createPreviewClickTarget(item, {
      label: "아바타",
      left: avatarLeft - 6,
      top: avatarTop - 6,
      width: avatarSize + 12,
      height: avatarSize + 12,
    });
    return;
  }

  if (!nameEl) return;
  const itemRect = item.getBoundingClientRect();
  const nameRect = nameEl.getBoundingClientRect();
  const hotspotSize = Math.max(v.iconSize + 14, 28);
  createPreviewClickTarget(item, {
    label: "아이콘",
    left: nameRect.left - itemRect.left - hotspotSize + 6,
    top: nameRect.top - itemRect.top + (nameRect.height - hotspotSize) / 2,
    width: hotspotSize,
    height: hotspotSize,
    iconStyle: true,
  });
}

function updatePreview(v) {
  syncRangeDisplays(v);

  const previewTheme = getActivePreviewTheme(v);
  const bubbleBackground = buildBubbleBackground(v);
  const nameBubbleBackground = buildNameBubbleBackground(v);
  const donationBackground = buildAlphaColor(
    v.donationColor,
    v.donationOpacity,
  );
  const noticeBackground = buildAlphaColor(v.noticeColor, v.noticeOpacity);
  const shadow = buildShadow(v.textShadow, v.textShadowSize, v.textShadowColor);
  const effectiveBorderRadius = v.borderRadius >= 50 ? 999 : v.borderRadius;
  const effectiveDonationRadius =
    v.donationRadius > 0 ? v.donationRadius : effectiveBorderRadius;
  const effectiveNoticeRadius =
    v.noticeRadius > 0 ? v.noticeRadius : effectiveBorderRadius;
  const effectiveNickFontSize =
    v.nickFontSize > 0 ? v.nickFontSize : v.fontSize;
  const effectiveCapsuleRadius = v.capsuleRadius >= 50 ? 999 : v.capsuleRadius;
  const effectiveBorder =
    v.borderWidth > 0 ? `${v.borderWidth}px solid ${v.borderColor}` : "none";
  const effectiveBoxShadow =
    v.boxShadowSize > 0
      ? `0 ${Math.ceil(v.boxShadowSize / 2)}px ${v.boxShadowSize}px ${buildAlphaColor(v.boxShadowColor, 40)}`
      : "none";
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
  const previewChat = document.getElementById("previewChat");
  const previewMeta = document.getElementById("previewMeta");

  syncPreviewThemeControl(v);
  const previewSuffix =
    v.compatTheme === "all"
      ? ` / 미리보기 테마: ${themeLabels[previewTheme]}${previewThemeOverride === "auto" ? " (자동)" : ""}`
      : "";
  previewMeta.textContent = `CSS 대상: ${themeLabels[v.compatTheme]}${previewSuffix}`;
  previewChat.style.gap = `${v.chatGap}px`;
  previewChat.style.padding = `${v.containerPadding}px`;
  previewChat.style.fontFamily = v.fontFamily;
  const alignVal = v.chatAlign === "right" ? "flex-end" : "flex-start";
  previewChat.style.alignItems = alignVal;
  setPreviewThemeClass(previewChat, previewTheme);

  previewChat.querySelectorAll("li.message__wrapper").forEach((item) => {
    const box = item.querySelector(".message__box");
    const nick = item.querySelector(".message__nick");
    const name = item.querySelector(".message__name");
    const separator = item.querySelector(".message__separator");
    const text = item.querySelector(".message__text");

    const fullBubbleAvatar = !layeredMode && avatarAsLeft;
    clearPreviewClickTargets(item);
    item.style.display = "block";
    item.style.position =
      layeredMode || fullBubbleAvatar || hasAvatar ? "relative" : "static";
    item.style.background = layeredMode ? "transparent" : bubbleBackground;
    item.style.borderRadius = layeredMode ? "0" : `${effectiveBorderRadius}px`;
    item.style.padding = layeredMode
      ? `0 0 0 ${avatarInset}px`
      : fullBubbleAvatar
        ? `${v.paddingY}px ${v.paddingX}px ${v.paddingY}px ${avatarInset + v.paddingX}px`
        : `${v.paddingY}px ${v.paddingX}px`;
    item.style.width = layeredMode ? "auto" : "max-content";
    item.style.maxWidth = `${v.maxWidth}%`;
    item.style.border = layeredMode ? "none" : effectiveBorder;
    item.style.boxShadow = layeredMode ? "none" : effectiveBoxShadow;
    item.style.backdropFilter = layeredMode
      ? "none"
      : v.blurAmount > 0
        ? `blur(${v.blurAmount}px)`
        : "none";
    item.style.webkitBackdropFilter = layeredMode
      ? "none"
      : v.blurAmount > 0
        ? `blur(${v.blurAmount}px)`
        : "none";
    item.style.fontSize = `${v.fontSize}px`;
    item.style.lineHeight = `${v.lineHeight}`;
    item.style.color = v.textColor;
    item.style.alignSelf = alignVal;
    item.style.textAlign = v.chatAlign === "right" ? "right" : "left";

    box.style.display = "block";
    box.style.position = "relative";
    box.style.zIndex = avatarAsLeft && layeredMode ? "1" : "";
    box.style.background = "transparent";
    box.style.border = "none";
    box.style.boxShadow = "none";
    box.style.padding = "0";
    box.style.margin = "0";
    box.style.filter = "none";
    box.style.backdropFilter = "none";
    box.style.webkitBackdropFilter = "none";

    nick.style.display = layeredMode || v.twoLine ? "block" : "inline";
    nick.style.padding = "0";
    nick.style.margin = "0";
    nick.style.color = v.textColor;
    nick.style.textShadow = shadow;
    nick.style.lineHeight = `${v.lineHeight}`;

    name.style.color = v.nickColor;
    name.style.fontSize = `${effectiveNickFontSize}px`;
    name.style.fontWeight = v.nickBold ? "700" : "400";
    name.style.textShadow = shadow;
    name.style.marginRight = "0";
    name.style.display = layeredMode ? "inline-flex" : "inline";
    name.style.alignItems = layeredMode ? "center" : "";
    name.style.minHeight = layeredMode ? `${avatarSize}px` : "";
    name.style.padding = layeredMode ? `0 ${effectiveNamePaddingX}px` : "0";
    name.style.borderRadius = layeredMode ? `${effectiveCapsuleRadius}px` : "0";
    name.style.background = layeredMode ? nameBubbleBackground : "transparent";
    name.style.boxShadow = layeredMode ? effectiveBoxShadow : "none";

    separator.textContent = v.separatorText;
    separator.style.display =
      layeredMode || v.twoLine || !v.separatorText ? "none" : "inline";
    separator.style.color = v.textColor;
    separator.style.textShadow = shadow;

    text.style.display = layeredMode || v.twoLine ? "block" : "inline";
    text.style.marginTop = splitMode
      ? "0px"
      : capsuleMode
        ? "4px"
        : v.twoLine
          ? "2px"
          : "0";
    text.style.marginLeft = layeredMode
      ? `${effectiveSplitTextOffsetX}px`
      : "0";
    text.style.color = v.textColor;
    text.style.textShadow = shadow;
    const hasTextBg = v.textBgOpacity > 0;
    const textBg = hasTextBg
      ? buildAlphaColor(v.textBgColor, v.textBgOpacity)
      : "transparent";
    if (splitMode) {
      text.style.background = bubbleBackground;
      text.style.boxShadow = effectiveBoxShadow;
      text.style.padding = `${effectiveSplitTextPaddingY}px ${effectiveSplitTextPaddingX}px`;
      text.style.borderRadius = `${effectiveBorderRadius}px`;
      text.style.backdropFilter =
        v.blurAmount > 0 ? `blur(${v.blurAmount}px)` : "none";
      text.style.webkitBackdropFilter =
        v.blurAmount > 0 ? `blur(${v.blurAmount}px)` : "none";
    } else if (hasTextBg) {
      text.style.background = textBg;
      text.style.boxShadow = "none";
      text.style.padding = `${v.textBgPadding}px ${v.textBgPadding + 2}px`;
      text.style.borderRadius = `${v.textBgRadius}px`;
      text.style.backdropFilter = "none";
      text.style.webkitBackdropFilter = "none";
    } else {
      text.style.background = "transparent";
      text.style.boxShadow = "none";
      text.style.padding = "0";
      text.style.borderRadius = "0";
      text.style.backdropFilter = "none";
      text.style.webkitBackdropFilter = "none";
    }
    text.style.border = "none";

    item.querySelectorAll("div.mr-1").forEach((wrap) => {
      const hideBadge = v.hideIcon || (v.nickIcon && v.nickIcon !== "");
      wrap.style.display = hideBadge ? "none" : "inline-block";
    });

    syncPreviewAvatarTarget(item, name, v, {
      hasAvatar,
      avatarAsLeft,
      layeredMode,
      avatarSize,
      avatarOffsetX,
      avatarOffsetY,
      paddingX: v.paddingX,
      paddingY: v.paddingY,
    });
  });

  previewChat.querySelectorAll("li.heart__wrapper").forEach((item) => {
    const shell = item.querySelector(".haert__image");
    const image = item.querySelector('img[alt="heart_image"]');

    item.style.display = v.hideDonation ? "none" : "block";
    if (v.hideDonation) return;

    item.style.alignSelf = alignVal;
    item.style.background = donationBackground;
    item.style.borderRadius = `${effectiveDonationRadius}px`;
    item.style.padding = `${v.paddingY}px ${v.paddingX}px`;
    item.style.width = "max-content";
    item.style.maxWidth = `${v.maxWidth}%`;
    item.style.border = effectiveBorder;
    item.style.boxShadow = effectiveBoxShadow;
    item.style.backdropFilter =
      v.blurAmount > 0 ? `blur(${v.blurAmount}px)` : "none";
    item.style.webkitBackdropFilter =
      v.blurAmount > 0 ? `blur(${v.blurAmount}px)` : "none";

    shell.style.display = "flex";
    shell.style.flexDirection = "column";
    shell.style.alignItems = "flex-start";
    shell.style.gap = "8px";
    shell.style.background = "transparent";
    shell.style.border = "none";
    shell.style.boxShadow = "none";
    shell.style.padding = "0";
    shell.style.margin = "0";

    if (image) {
      image.style.display = v.hideImg ? "none" : "block";
      image.style.width = `${v.donationImgSize}px`;
      image.style.height = `${v.donationImgSize}px`;
    }

    item.querySelectorAll(".heart__text").forEach((text) => {
      text.style.color = v.donationTextColor;
      text.style.fontSize = `${Math.max(v.fontSize - 1, 11)}px`;
      text.style.textShadow = shadow;
      text.style.background = "transparent";
      text.style.border = "none";
      text.style.boxShadow = "none";
      text.style.padding = "0";
    });

    const amount = item.querySelector(".mx-1");
    if (amount) {
      amount.style.color = v.heartAmountColor;
      amount.style.fontWeight = "700";
    }
  });

  previewChat.querySelectorAll("li.chat__notice--list").forEach((item) => {
    const noticeText = item.querySelector(".notice__text");

    item.style.display = v.hideNotice ? "none" : "block";
    if (v.hideNotice) return;

    item.style.alignSelf = alignVal;
    item.style.background = noticeBackground;
    item.style.borderRadius = `${effectiveNoticeRadius}px`;
    item.style.padding = `${v.paddingY}px ${v.paddingX}px`;
    item.style.width = "max-content";
    item.style.maxWidth = `${v.maxWidth}%`;
    item.style.border = effectiveBorder;
    item.style.boxShadow = effectiveBoxShadow;
    item.style.backdropFilter =
      v.blurAmount > 0 ? `blur(${v.blurAmount}px)` : "none";
    item.style.webkitBackdropFilter =
      v.blurAmount > 0 ? `blur(${v.blurAmount}px)` : "none";

    noticeText.style.display = "inline";
    noticeText.style.color = v.noticeTextColor;
    noticeText.style.fontSize = `${Math.max(v.fontSize - 1, 11)}px`;
    noticeText.style.textShadow = shadow;
  });

  let iconStyle = document.getElementById("nickIconStyle");
  if (!iconStyle) {
    iconStyle = document.createElement("style");
    iconStyle.id = "nickIconStyle";
    document.head.appendChild(iconStyle);
  }

  if (avatarAsLeft && hasCustomAvatar) {
    iconStyle.textContent = `#previewChat li.message__wrapper::before {
      content: '' !important;
      position: absolute;
      left: ${(layeredMode ? 0 : v.paddingX) + avatarOffsetX}px;
      top: ${(layeredMode ? 0 : v.paddingY) + avatarOffsetY}px;
      width: ${avatarSize}px;
      height: ${avatarSize}px;
      display: block;
      box-sizing: border-box;
      z-index: 2;
      pointer-events: none;
      background-color: ${avatarFrame.background};
      background-image: url('${escapeForCssUrl(v.customIconUrl)}');
      background-size: ${avatarFrame.imageFit};
      background-repeat: no-repeat;
      background-position: center;
      border-radius: ${avatarFrame.radius};
      border: ${avatarFrame.border};
      box-shadow: ${avatarFrame.shadow};
    }
    #previewChat .message__name::before { content: none !important; }`;
  } else if (avatarAsLeft && hasEmojiAvatar) {
    iconStyle.textContent = `#previewChat li.message__wrapper::before {
      content: '${escapeForCssContent(v.nickIcon)}' !important;
      position: absolute;
      left: ${(layeredMode ? 0 : v.paddingX) + avatarOffsetX}px;
      top: ${(layeredMode ? 0 : v.paddingY) + avatarOffsetY}px;
      width: ${avatarSize}px;
      height: ${avatarSize}px;
      display: flex;
      box-sizing: border-box;
      z-index: 2;
      pointer-events: none;
      align-items: center;
      justify-content: center;
      font-size: ${v.iconSize}px;
      line-height: 1;
      background: ${avatarFrame.background};
      border-radius: ${avatarFrame.radius};
      border: ${avatarFrame.border};
      box-shadow: ${avatarFrame.shadow};
    }
    #previewChat .message__name::before { content: none !important; }`;
  } else if (v.nickIcon === "__custom_img__" && v.customIconUrl) {
    iconStyle.textContent = `#previewChat li.message__wrapper::before { content: none !important; }
    #previewChat .message__name::before {
      content: '' !important;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: ${v.iconSize}px;
      height: ${v.iconSize}px;
      background-color: ${avatarFrame.background};
      background-image: url('${escapeForCssUrl(v.customIconUrl)}');
      background-size: ${avatarFrame.imageFit};
      background-repeat: no-repeat;
      background-position: center;
      vertical-align: -3px;
      margin-right: 4px;
      border-radius: ${avatarFrame.radius};
      border: ${avatarFrame.border};
      box-shadow: ${avatarFrame.shadow};
    }
    #previewChat .message__nick::before { content: none !important; }`;
  } else if (v.nickIcon && v.nickIcon !== "__custom_img__") {
    iconStyle.textContent = `#previewChat li.message__wrapper::before { content: none !important; }
    #previewChat .message__name::before {
      content: '${escapeForCssContent(v.nickIcon)}' !important;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: ${v.iconSize}px;
      height: ${v.iconSize}px;
      font-size: ${v.iconSize}px;
      line-height: 1;
      margin-right: 4px;
      vertical-align: -2px;
      background: ${avatarFrame.background};
      border-radius: ${avatarFrame.radius};
      border: ${avatarFrame.border};
      box-shadow: ${avatarFrame.shadow};
    }
    #previewChat .message__nick::before { content: none !important; }`;
  } else {
    iconStyle.textContent =
      "#previewChat li.message__wrapper::before { content: none !important; } #previewChat .message__nick::before { content: none !important; } #previewChat .message__name::before { content: none !important; }";
  }
}
