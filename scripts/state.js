"use strict";

let _updateCssTimer = null;

// Undo/Redo 히스토리
const _undoStack = [];
const _redoStack = [];
let _undoRestoring = false;
const UNDO_MAX = 50;
const LOCAL_SETTINGS_KEY = "panda_chat_overlay_saved_state_v1";
const LOCAL_SETTINGS_META_KEY = "panda_chat_overlay_saved_meta_v1";

function _captureState() {
  const inputs = {};
  document
    .querySelectorAll(
      ".settings-panel input, .settings-panel select, .css-output-area textarea",
    )
    .forEach((el) => {
      if (el.type === "file") return;
      if (!el.id) return;
      inputs[el.id] = el.type === "checkbox" ? el.checked : el.value;
    });
  document.querySelectorAll(".toggle-switch").forEach((el) => {
    inputs["__toggle_" + el.id] = el.classList.contains("on");
  });
  inputs["__currentTheme"] = currentTheme;
  inputs["__customIconDataUrl"] = customIconDataUrl;
  inputs["__rankBadgeIcons"] = JSON.stringify(rankBadgeIcons);
  return JSON.stringify(inputs);
}

function _restoreState(json) {
  _undoRestoring = true;
  const inputs = JSON.parse(json);
  Object.entries(inputs).forEach(([key, val]) => {
    if (key === "__customIconDataUrl") {
      customIconDataUrl = val;
      return;
    }
    if (key === "__rankBadgeIcons") {
      try {
        rankBadgeIcons = JSON.parse(val);
      } catch (e) {}
      return;
    }
    if (key === "__currentTheme") {
      currentTheme = val;
      return;
    }
    if (key.startsWith("__toggle_")) {
      const el = document.getElementById(key.slice(9));
      if (el) {
        val ? el.classList.add("on") : el.classList.remove("on");
      }
      return;
    }
    const el = document.getElementById(key);
    if (!el) return;
    if (el.type === "checkbox") el.checked = val;
    else el.value = val;
  });
  // 아이콘 패널 및 미리보기 동기화
  if (customIconDataUrl) {
    const previewImg = document.getElementById("iconPreviewImg");
    if (previewImg) previewImg.src = customIconDataUrl;
  } else {
    const previewImg = document.getElementById("iconPreviewImg");
    const previewRow = document.getElementById("iconPreviewRow");
    if (previewImg) previewImg.removeAttribute("src");
    if (previewRow) previewRow.style.display = "none";
  }
  syncIconPanelState();
  // 등급 배지 패널 동기화
  const rankOn = document
    .getElementById("useRankBadge")
    .classList.contains("on");
  document.getElementById("rankBadgePanel").style.display = rankOn
    ? "block"
    : "none";
  if (rankOn) initRankBadgeUI();
  const v = getValues();
  syncThemeSelectionUI();
  syncLayoutPhase();
  updatePresetHelper();
  updatePreview(v);
  clearTimeout(_updateCssTimer);
  _updateCssTimer = setTimeout(() => updateCSS(v), 80);
  syncSavedSettingsState();
  syncPhaseDashboard();
  _undoRestoring = false;
}

function _pushUndo() {
  if (_undoRestoring) return;
  const state = _captureState();
  if (_undoStack.length > 0 && _undoStack[_undoStack.length - 1] === state)
    return;
  _undoStack.push(state);
  if (_undoStack.length > UNDO_MAX) _undoStack.shift();
  _redoStack.length = 0;
}

function undo() {
  if (_undoStack.length < 2) return;
  _redoStack.push(_undoStack.pop());
  _restoreState(_undoStack[_undoStack.length - 1]);
}

function redo() {
  if (_redoStack.length === 0) return;
  const state = _redoStack.pop();
  _undoStack.push(state);
  _restoreState(state);
}

function update() {
  const v = getValues();
  // 미리보기는 즉시 반영 (인라인 스타일 — 가벼움)
  updatePreview(v);

  // CSS 생성은 debounce 80ms (문자열 조합 — 무거움)
  clearTimeout(_updateCssTimer);
  _updateCssTimer = setTimeout(() => updateCSS(v), 80);

  // Undo 스택에 상태 저장
  _pushUndo();
  syncPhaseDashboard();
}

function getValues() {
  const v = {
    bubbleColor: document.getElementById("bubbleColor").value,
    bubbleOpacity: +document.getElementById("bubbleOpacity").value,
    borderRadius: +document.getElementById("borderRadius").value,
    blurAmount: +document.getElementById("blurAmount").value,
    donationColor: document.getElementById("donationColor").value,
    donationOpacity: +document.getElementById("donationOpacity").value,
    donationImgSize: +document.getElementById("donationImgSize").value,
    noticeColor: document.getElementById("noticeColor").value,
    noticeOpacity: +document.getElementById("noticeOpacity").value,
    noticeTextColor: document.getElementById("noticeTextColor").value,
    nameBubbleColor: document.getElementById("nameBubbleColor").value,
    nameBubbleOpacity: +document.getElementById("nameBubbleOpacity").value,
    nameUseGradient: getToggle("nameUseGradient"),
    nameGradStart: document.getElementById("nameGradStart").value,
    nameGradEnd: document.getElementById("nameGradEnd").value,
    nickColor: document.getElementById("nickColor").value,
    textColor: document.getElementById("textColor").value,
    fontSize: +document.getElementById("fontSize").value,
    textShadow: getToggle("textShadow"),
    nickBold: getToggle("nickBold"),
    textBold: getToggle("textBold"),
    nickLetterSpacing: +document.getElementById("nickLetterSpacing").value,
    textLetterSpacing: +document.getElementById("textLetterSpacing").value,
    hideImg: getToggle("hideImg"),
    hideEnd: getToggle("hideEnd"),
    hideNav: getToggle("hideNav"),
    hideIcon: getToggle("hideIcon"),
    preventFade: getToggle("preventFade"),
    noAnimation: getToggle("noAnimation"),
    fontFamily: document.getElementById("fontFamily").value,
    messageStyle: document.getElementById("messageStyle").value,
    chatGap: +document.getElementById("chatGap").value,
    paddingX: +document.getElementById("paddingX").value,
    twoLine: getToggle("twoLine"),
    nickIcon: document.getElementById("nickIcon").value,
    iconPlacement: document.getElementById("iconPlacement").value,
    iconSize: +document.getElementById("iconSize").value,
    avatarBgColor: document.getElementById("avatarBgColor").value,
    avatarBgOpacity: +document.getElementById("avatarBgOpacity").value,
    avatarBorderColor: document.getElementById("avatarBorderColor").value,
    avatarBorderWidth: +document.getElementById("avatarBorderWidth").value,
    avatarShadow: +document.getElementById("avatarShadow").value,
    avatarOffsetX: +document.getElementById("avatarOffsetX").value,
    avatarOffsetY: +document.getElementById("avatarOffsetY").value,
    avatarFrameSize: +document.getElementById("avatarFrameSize").value,
    avatarFrameShape: document.getElementById("avatarFrameShape").value,
    customIconUrl: customIconDataUrl,
    useGradient: getToggle("useGradient"),
    gradStart: document.getElementById("gradStart").value,
    gradEnd: document.getElementById("gradEnd").value,
    gradDirection: document.getElementById("gradDirection").value,
    hideNotice: getToggle("hideNotice"),
    hideDonation: getToggle("hideDonation"),
    donationFontSize: +document.getElementById("donationFontSize").value,
    noticeFontSize: +document.getElementById("noticeFontSize").value,
    heartAmountColor: document.getElementById("heartAmountColor").value,
    nameFrameEnabled: getToggle("nameFrameEnabled"),
    nameFrameColor1: document.getElementById("nameFrameColor1").value,
    nameFrameColor2: document.getElementById("nameFrameColor2").value,
    nameFrameOpacity: +document.getElementById("nameFrameOpacity").value,
    nameFramePadding: +document.getElementById("nameFramePadding").value,
    nameFrameRadius: +document.getElementById("nameFrameRadius").value,
    donationUseGradient: getToggle("donationUseGradient"),
    donationGradStart: document.getElementById("donationGradStart").value,
    donationGradEnd: document.getElementById("donationGradEnd").value,
    donationGlow: getToggle("donationGlow"),
    donationGlowColor: document.getElementById("donationGlowColor").value,
    donationGlowSize: +document.getElementById("donationGlowSize").value,
    donationDecoLine: getToggle("donationDecoLine"),
    donationDecoColor: document.getElementById("donationDecoColor").value,
    noticeAccentLine: getToggle("noticeAccentLine"),
    noticeAccentColor: document.getElementById("noticeAccentColor").value,
    noticeAccentWidth: +document.getElementById("noticeAccentWidth").value,
    compatTheme: document.getElementById("compatTheme").value,
    compatMode: "stable", // full-injection 고정값
    resetInner: true, // full-injection 고정값
    themeReset: true, // full-injection 고정값
    chatAlign: document.getElementById("chatAlign").value,
    borderWidth: +document.getElementById("borderWidth").value,
    borderColor: document.getElementById("borderColor").value,
    boxShadowSize: +document.getElementById("boxShadowSize").value,
    boxShadowColor: document.getElementById("boxShadowColor").value,
    textShadowSize: +document.getElementById("textShadowSize").value,
    textShadowColor: document.getElementById("textShadowColor").value,
    lineHeight: +document.getElementById("lineHeight").value / 100,
    maxWidth: +document.getElementById("maxWidth").value,
    paddingY: +document.getElementById("paddingY").value,
    containerPadding: +document.getElementById("containerPadding").value,
    separatorText: document.getElementById("separatorText").value,
    nickFontSize: +document.getElementById("nickFontSize").value,
    namePaddingX: +document.getElementById("namePaddingX").value,
    splitTextPaddingX: +document.getElementById("splitTextPaddingX").value,
    splitTextPaddingY: +document.getElementById("splitTextPaddingY").value,
    splitTextOffsetX: +document.getElementById("splitTextOffsetX").value,
    donationTextColor: document.getElementById("donationTextColor").value,
    donationRadius: +document.getElementById("donationRadius").value,
    noticeRadius: +document.getElementById("noticeRadius").value,
    capsuleRadius: +document.getElementById("capsuleRadius").value,
    textBgColor: document.getElementById("textBgColor").value,
    textBgOpacity: +document.getElementById("textBgOpacity").value,
    textBgRadius: +document.getElementById("textBgRadius").value,
    textBgPadding: +document.getElementById("textBgPadding").value,
    textBgBlur: +document.getElementById("textBgBlur").value,
    customCss: document.getElementById("customCss").value,
    useRankBadge: getToggle("useRankBadge"),
    rankBadgeSize: +document.getElementById("rankBadgeSize").value,
    rankBadgeIcons: JSON.parse(JSON.stringify(rankBadgeIcons)),
  };
  if (v.nickIcon === "__local_character__") {
    v.nickIcon = "__custom_img__";
    v.customIconUrl = DEFAULT_PRINCESS_AVATAR;
  }
  return v;
}

function saveSettings() {
  const state = _captureState();
  const blob = new Blob([state], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const now = new Date();
  const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  a.download = `panda_chat_overlay_${ts}.json`;
  a.click();
  URL.revokeObjectURL(url);
  setSettingsStatus(`파일 저장 완료 · ${ts}`);
}

function loadSettingsFromBrowser() {
  try {
    const state = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (!state) {
      setSettingsStatus("브라우저 저장본이 없습니다.", true);
      return;
    }
    _restoreState(state);
    _pushUndo();
    const raw = localStorage.getItem(LOCAL_SETTINGS_META_KEY);
    if (raw) {
      const meta = JSON.parse(raw);
      setSettingsStatus(
        `브라우저 저장본 불러오기 완료 · ${meta.savedAt || "시간 정보 없음"}`,
      );
    } else {
      setSettingsStatus("브라우저 저장본 불러오기 완료");
    }
  } catch (err) {
    console.error("브라우저 불러오기 실패:", err);
    setSettingsStatus("브라우저 불러오기 실패", true);
  }
}

function loadSettings(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      _restoreState(e.target.result);
      _pushUndo();
      setSettingsStatus(`파일 불러오기 완료 · ${file.name}`);
    } catch (err) {
      console.error("설정 불러오기 실패:", err);
      setSettingsStatus("파일 불러오기 실패", true);
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}
