"use strict";

let customIconDataUrl = "";
let rankBadgeIcons = {};

let _iconInputTimer = null;
let _iconRequestSeq = 0;

function filterPresets(cat) {
  hydrateDashboardBindings();
  currentPresetCategory = cat;
  document.querySelectorAll(".preset-cat-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.cat === cat);
  });
  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.setAttribute(
      "data-hidden",
      cat === "all"
        ? "false"
        : btn.getAttribute("data-cat") !== cat
          ? "true"
          : "false",
    );
  });
  syncPhaseDashboard();
}

function resetToDefault() {
  applyTheme("pink");
  switchPhase("design");
}

function applyTheme(name) {
  currentTheme = name;
  const t = themes[name];
  syncThemeSelectionUI();

  setVal("bubbleColor", t.bubbleColor);
  setVal("bubbleHex", t.bubbleColor);
  setRange("bubbleOpacity", Math.min(t.bubbleOpacity, 100));
  setRange("borderRadius", Math.min(t.borderRadius, 50));
  setRange("blurAmount", t.blurAmount);
  setVal("donationColor", t.donationColor);
  setVal("donationHex", t.donationColor);
  setRange("donationOpacity", t.donationOpacity);
  setRange("donationImgSize", t.donationImgSize);
  setVal("noticeColor", t.noticeColor);
  setVal("noticeHex", t.noticeColor);
  setRange("noticeOpacity", t.noticeOpacity);
  setVal("noticeTextColor", t.noticeTextColor);
  setVal("noticeTextHex", t.noticeTextColor);
  setVal("nameBubbleColor", t.nameBubbleColor);
  setVal("nameBubbleHex", t.nameBubbleColor);
  setRange("nameBubbleOpacity", t.nameBubbleOpacity);
  setToggle("nameUseGradient", t.nameUseGradient);
  setVal("nameGradStart", t.nameGradStart);
  setVal("nameGradStartHex", t.nameGradStart);
  setVal("nameGradEnd", t.nameGradEnd);
  setVal("nameGradEndHex", t.nameGradEnd);
  setVal("nickColor", t.nickColor);
  setVal("nickHex", t.nickColor);
  setVal("textColor", t.textColor);
  setVal("textHex", t.textColor);
  setRange("fontSize", t.fontSize);
  setToggle("textShadow", t.textShadow);
  setToggle("nickBold", t.nickBold);
  setToggle("hideImg", t.hideImg);
  setToggle("hideEnd", t.hideEnd);
  setToggle("hideNav", t.hideNav);
  setToggle("hideIcon", t.hideIcon);
  setToggle("preventFade", t.preventFade);
  setToggle("noAnimation", t.noAnimation);
  setSelect("fontFamily", t.fontFamily);
  setSelect("messageStyle", t.messageStyle || "fullBubble");
  setRange("chatGap", t.chatGap);
  setRange("paddingX", t.paddingX);
  setToggle("twoLine", t.twoLine);
  setSelect("nickIcon", t.nickIcon);
  setSelect("iconPlacement", t.iconPlacement || "nickSlot");
  setRange("iconSize", t.iconSize);
  document.getElementById("avatarBgColor").value = t.avatarBgColor || "#ffffff";
  document.getElementById("avatarBgHex").value = t.avatarBgColor || "#ffffff";
  setRange(
    "avatarBgOpacity",
    t.avatarBgOpacity != null ? t.avatarBgOpacity : 90,
  );
  document.getElementById("avatarBorderColor").value =
    t.avatarBorderColor || "#ffffff";
  document.getElementById("avatarBorderHex").value =
    t.avatarBorderColor || "#ffffff";
  setRange(
    "avatarBorderWidth",
    t.avatarBorderWidth != null ? t.avatarBorderWidth : 2,
  );
  setRange("avatarShadow", t.avatarShadow != null ? t.avatarShadow : 16);
  setRange("avatarOffsetX", t.avatarOffsetX != null ? t.avatarOffsetX : 0);
  setRange("avatarOffsetY", t.avatarOffsetY != null ? t.avatarOffsetY : 0);
  setRange(
    "avatarFrameSize",
    t.avatarFrameSize != null ? t.avatarFrameSize : 0,
  );
  setSelect("avatarFrameShape", t.avatarFrameShape || "circle");
  customIconDataUrl = t.customIconUrl || "";
  document.getElementById("customIconUrl").value = "";
  syncIconPanelState();
  if (customIconDataUrl) {
    document.getElementById("iconPreviewImg").src = customIconDataUrl;
    document.getElementById("iconPreviewRow").style.display = "flex";
  } else {
    document.getElementById("iconPreviewImg").removeAttribute("src");
    document.getElementById("iconPreviewRow").style.display = "none";
  }
  setToggle("useGradient", t.useGradient);
  setVal("gradStart", t.gradStart);
  setVal("gradStartHex", t.gradStart);
  setVal("gradEnd", t.gradEnd);
  setVal("gradEndHex", t.gradEnd);
  setSelect("gradDirection", t.gradDirection);
  setToggle("hideNotice", t.hideNotice);
  setToggle("hideDonation", t.hideDonation);
  setVal("heartAmountColor", t.heartAmountColor);
  setVal("heartAmountHex", t.heartAmountColor);
  setSelect("compatTheme", t.compatTheme);
  setSelect("compatMode", t.compatMode);
  setToggle("resetInner", t.resetInner);
  setToggle("themeReset", t.themeReset);
  setSelect("chatAlign", t.chatAlign || "left");

  setRange("borderWidth", t.borderWidth || 0);
  setVal("borderColor", t.borderColor || "#ffffff");
  setVal("borderColorHex", t.borderColor || "#ffffff");
  setRange("boxShadowSize", t.boxShadowSize || 0);
  setVal("boxShadowColor", t.boxShadowColor || "#000000");
  setVal("boxShadowColorHex", t.boxShadowColor || "#000000");
  setRange("textShadowSize", t.textShadowSize || 2);
  setVal("textShadowColor", t.textShadowColor || "#000000");
  setVal("textShadowColorHex", t.textShadowColor || "#000000");
  setRange("lineHeight", Math.round((t.lineHeight || 1.45) * 100));
  setRange("maxWidth", t.maxWidth || 90);
  setRange("paddingY", t.paddingY !== undefined ? t.paddingY : 4);
  setRange("containerPadding", t.containerPadding || 10);
  document.getElementById("separatorText").value =
    t.separatorText !== undefined ? t.separatorText : ": ";
  setRange("nickFontSize", t.nickFontSize || 0);
  setRange("namePaddingX", t.namePaddingX || 0);
  setRange("splitTextPaddingX", t.splitTextPaddingX || 0);
  setRange("splitTextPaddingY", t.splitTextPaddingY || 0);
  setRange(
    "splitTextOffsetX",
    t.splitTextOffsetX !== undefined ? t.splitTextOffsetX : -1,
  );
  setVal("donationTextColor", t.donationTextColor || t.textColor);
  setVal("donationTextHex", t.donationTextColor || t.textColor);
  setRange("donationRadius", t.donationRadius || 0);
  setRange("noticeRadius", t.noticeRadius || 0);
  setRange(
    "capsuleRadius",
    Math.min(t.capsuleRadius !== undefined ? t.capsuleRadius : 50, 50),
  );

  setVal("textBgColor", t.textBgColor || "#000000");
  setVal("textBgHex", t.textBgColor || "#000000");
  setRange("textBgOpacity", t.textBgOpacity || 0);
  setRange("textBgRadius", t.textBgRadius !== undefined ? t.textBgRadius : 4);
  setRange(
    "textBgPadding",
    t.textBgPadding !== undefined ? t.textBgPadding : 2,
  );

  setToggle("textBold", t.textBold);
  setRange("nickLetterSpacing", t.nickLetterSpacing || 0);
  setRange("textLetterSpacing", t.textLetterSpacing || 0);
  setRange("donationFontSize", t.donationFontSize || 0);
  setRange("noticeFontSize", t.noticeFontSize || 0);

  updatePresetHelper();
  syncLayoutPhase();
  update();
}

function syncIconPanelState() {
  const rawIcon = document.getElementById("nickIcon").value;
  const hasIcon = rawIcon !== "";
  const isCustomSource = rawIcon === "__custom_img__";
  const panel = document.getElementById("customIconPanel");
  const sourceRow = document.getElementById("customIconSourceRow");
  const previewRow = document.getElementById("iconPreviewRow");

  if (panel) panel.style.display = hasIcon ? "block" : "none";
  if (sourceRow) sourceRow.style.display = isCustomSource ? "flex" : "none";
  if (previewRow)
    previewRow.style.display =
      isCustomSource && customIconDataUrl ? "flex" : "none";
}

function onCustomIconInput() {
  clearTimeout(_iconInputTimer);
  _iconInputTimer = setTimeout(_doCustomIconInput, 400);
}

function isLatestCustomIconRequest(requestId, url) {
  return (
    requestId === _iconRequestSeq &&
    document.getElementById("nickIcon").value === "__custom_img__" &&
    document.getElementById("customIconUrl").value.trim() === url
  );
}

function _doCustomIconInput() {
  const url = document.getElementById("customIconUrl").value.trim();
  if (!url) return;
  const requestId = ++_iconRequestSeq;
  // URL을 base64로 변환 시도 (OBS 호환성을 위해)
  if (url.startsWith("data:")) {
    if (!isLatestCustomIconRequest(requestId, url)) return;
    customIconDataUrl = url;
    document.getElementById("iconPreviewImg").src = url;
    document.getElementById("iconPreviewRow").style.display = "flex";
    update();
    return;
  }
  // 외부 URL → fetch로 base64 변환 시도
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.blob();
    })
    .then((blob) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        if (!isLatestCustomIconRequest(requestId, url)) return;
        customIconDataUrl = e.target.result;
        document.getElementById("iconPreviewImg").src = customIconDataUrl;
        document.getElementById("iconPreviewRow").style.display = "flex";
        update();
      };
      reader.readAsDataURL(blob);
    })
    .catch(() => {
      // CORS 등으로 변환 실패 시 원본 URL 사용
      if (!isLatestCustomIconRequest(requestId, url)) return;
      customIconDataUrl = url;
      document.getElementById("iconPreviewImg").src = url;
      document.getElementById("iconPreviewRow").style.display = "flex";
      update();
    });
}

function onCustomIconFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    customIconDataUrl = e.target.result;
    document.getElementById("iconPreviewImg").src = customIconDataUrl;
    document.getElementById("iconPreviewRow").style.display = "flex";
    document.getElementById("customIconUrl").value = "";
    update();
  };
  reader.readAsDataURL(file);
}

// === 등급별 배지 ===
function initRankBadgeUI() {
  const grid = document.getElementById("rankBadgeGrid");
  if (!grid) return;
  grid.innerHTML = "";
  RANK_BADGES.forEach((rank) => {
    const saved = rankBadgeIcons[rank.key] || {};
    const type = saved.type || "emoji";
    const emoji = saved.emoji || rank.defaultEmoji;
    const url = saved.url || "";
    const row = document.createElement("div");
    row.style.cssText =
      "display:flex;align-items:center;gap:8px;padding:6px 8px;background:#1a1a2e;border-radius:8px;";

    const badge = document.createElement("span");
    badge.style.cssText =
      "width:18px;height:18px;border-radius:50%;background:" +
      rank.color +
      ";display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:bold;flex-shrink:0;";
    badge.textContent = rank.key.toUpperCase().charAt(0);
    row.appendChild(badge);

    const label = document.createElement("span");
    label.style.cssText = "width:52px;font-size:12px;color:#ccc;flex-shrink:0;";
    label.textContent = rank.label;
    row.appendChild(label);

    const sel = document.createElement("select");
    sel.id = "rankType_" + rank.key;
    sel.style.cssText =
      "background:#2a2a4a;border:1px solid #3a3a5a;border-radius:5px;color:#ddd;font-size:11px;padding:2px 4px;width:70px;";
    [
      ["default", "기본"],
      ["emoji", "이모지"],
      ["image", "이미지"],
      ["hide", "숨김"],
    ].forEach(function (opt) {
      const o = document.createElement("option");
      o.value = opt[0];
      o.textContent = opt[1];
      if (opt[0] === type) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function () {
      onRankBadgeChange(rank.key);
    });
    row.appendChild(sel);

    const emojiInput = document.createElement("input");
    emojiInput.type = "text";
    emojiInput.id = "rankEmoji_" + rank.key;
    emojiInput.value = emoji;
    emojiInput.maxLength = 4;
    emojiInput.style.cssText =
      "width:36px;background:#2a2a4a;border:1px solid #3a3a5a;border-radius:5px;color:#ddd;font-size:14px;padding:2px;text-align:center;" +
      (type === "emoji" ? "" : "display:none;");
    emojiInput.addEventListener("change", function () {
      onRankBadgeChange(rank.key);
    });
    row.appendChild(emojiInput);

    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.id = "rankUrl_" + rank.key;
    urlInput.placeholder = "이미지 URL";
    urlInput.value = url;
    urlInput.style.cssText =
      "flex:1;min-width:0;background:#2a2a4a;border:1px solid #3a3a5a;border-radius:5px;color:#ddd;font-size:11px;padding:2px 6px;" +
      (type === "image" ? "" : "display:none;");
    urlInput.addEventListener("change", function () {
      onRankBadgeChange(rank.key);
    });
    row.appendChild(urlInput);

    grid.appendChild(row);
  });
}

function onRankBadgeChange(key) {
  const type = document.getElementById("rankType_" + key).value;
  const emojiInput = document.getElementById("rankEmoji_" + key);
  const urlInput = document.getElementById("rankUrl_" + key);
  emojiInput.style.display = type === "emoji" ? "" : "none";
  urlInput.style.display = type === "image" ? "" : "none";
  rankBadgeIcons[key] = {
    type: type,
    emoji: emojiInput.value.trim(),
    url: urlInput.value.trim(),
  };
  update();
}

function onRankBadgeToggle() {
  const on = document.getElementById("useRankBadge").classList.contains("on");
  document.getElementById("rankBadgePanel").style.display = on
    ? "block"
    : "none";
  if (on && !document.getElementById("rankBadgeGrid").children.length) {
    initRankBadgeUI();
  }
  update();
}
