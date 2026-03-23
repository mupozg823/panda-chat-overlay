"use strict";

const phaseOrder = ["preset", "design", "advanced"];
const phaseMeta = {
  preset: { label: "프리셋", icon: "🎨", note: "프리셋을 선택하세요" },
  design: {
    label: "디자인",
    icon: "✏️",
    note: "말풍선, 레이아웃, 아이콘을 조정합니다",
  },
  advanced: {
    label: "고급",
    icon: "⚙️",
    note: "후원, 배지, 표시 설정을 조정합니다",
  },
};

function updatePresetHelper() {
  const preset = themeDescriptions[currentTheme] || {
    label: currentTheme,
    text: "현재 프리셋 설명을 불러오지 못했습니다.",
    load: "light",
  };
  const loadLabels = {
    light: "",
    medium: " · 부하 중간",
    heavy: " · 부하 높음 (blur)",
  };
  const loadSuffix = loadLabels[preset.load] || "";
  document.getElementById("presetHelperTitle").textContent = preset.label;
  document.getElementById("presetHelperText").textContent =
    preset.text + loadSuffix;
}

function hydrateDashboardBindings() {
  document.querySelectorAll(".phase-btn").forEach((btn) => {
    if (!btn.dataset.phase) {
      const match = (btn.getAttribute("onclick") || "").match(
        /switchPhase\('([^']+)'\)/,
      );
      if (match) btn.dataset.phase = match[1];
    }
  });
  document.querySelectorAll(".layout-card").forEach((card) => {
    if (!card.dataset.style) {
      const match = (card.getAttribute("onclick") || "").match(
        /selectLayout\('([^']+)'\)/,
      );
      if (match) card.dataset.style = match[1];
    }
  });
  document.querySelectorAll(".theme-btn").forEach((btn) => {
    if (!btn.dataset.theme) {
      const match = (btn.getAttribute("onclick") || "").match(
        /applyTheme\('([^']+)'\)/,
      );
      if (match) btn.dataset.theme = match[1];
    }
  });
  document.querySelectorAll(".preset-cat-btn").forEach((btn) => {
    if (!btn.dataset.cat) {
      const match = (btn.getAttribute("onclick") || "").match(
        /filterPresets\('([^']+)'\)/,
      );
      if (match) btn.dataset.cat = match[1];
    }
  });
}

function syncPhaseDashboard() {
  hydrateDashboardBindings();
  const phase = getCurrentPhase();
  const meta = phaseMeta[phase] || phaseMeta.preset;
  const phaseIndex = Math.max(0, phaseOrder.indexOf(phase));
  const v = getValues();
  const preset = themeDescriptions[currentTheme] || { label: currentTheme };
  const layoutSummary = getLayoutSummary(v);
  const layoutNote = getIconPlacementLabel(v.iconPlacement);
  const designNote = `${presetCategoryLabels[currentPresetCategory] || "기본"} 카테고리`;
  const detailValue = `${getCompatThemeLabel(v.compatTheme)} · ${getSelectText("compatMode")}`;
  const detailNote = getSavedSettingsLabel();

  const overviewLabel = document.getElementById("phaseOverviewLabel");
  const overviewTitle = document.getElementById("phaseOverviewTitle");
  const overviewText = document.getElementById("phaseOverviewText");
  if (overviewLabel) overviewLabel.textContent = "현재 단계";
  if (overviewTitle) overviewTitle.textContent = `${meta.icon} ${meta.label}`;
  if (overviewText) overviewText.textContent = meta.note;

  const prevBtn = document.getElementById("phasePrevBtn");
  const nextBtn = document.getElementById("phaseNextBtn");
  if (prevBtn) prevBtn.disabled = phaseIndex === 0;
  if (nextBtn) {
    if (phaseIndex === phaseOrder.length - 1) {
      nextBtn.textContent = "CSS 복사하기";
    } else {
      const nextMeta = phaseMeta[phaseOrder[phaseIndex + 1]];
      nextBtn.textContent = `${nextMeta.icon} ${nextMeta.label}`;
    }
  }

  const layoutValueEl = document.getElementById("phaseLayoutValue");
  const layoutNoteEl = document.getElementById("phaseLayoutNote");
  const designValueEl = document.getElementById("phaseDesignValue");
  const designNoteEl = document.getElementById("phaseDesignNote");
  const detailValueEl = document.getElementById("phaseDetailValue");
  const detailNoteEl = document.getElementById("phaseDetailNote");
  if (layoutValueEl) layoutValueEl.textContent = layoutSummary;
  if (layoutNoteEl) layoutNoteEl.textContent = layoutNote;
  if (designValueEl) designValueEl.textContent = preset.label;
  if (designNoteEl) designNoteEl.textContent = designNote;
  if (detailValueEl) detailValueEl.textContent = detailValue;
  if (detailNoteEl) detailNoteEl.textContent = detailNote;

  const layoutPhaseSummary = document.getElementById("layoutPhaseSummary");
  const designPhaseSummary = document.getElementById("designPhaseSummary");
  const detailPhaseSummary = document.getElementById("detailPhaseSummary");
  if (layoutPhaseSummary)
    layoutPhaseSummary.textContent = `현재 구성: ${layoutSummary} · ${layoutNote}`;
  if (designPhaseSummary)
    designPhaseSummary.textContent = `현재 프리셋: ${preset.label} · ${designNote}`;
  if (detailPhaseSummary)
    detailPhaseSummary.textContent = `현재 설정: ${detailValue} · ${detailNote}`;

  document.querySelectorAll(".phase-summary-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.phaseCard === phase);
  });
}

function syncRangeDisplays(v) {
  const valueMap = {
    bubbleOpacityVal: `${v.bubbleOpacity}%`,
    borderRadiusVal: v.borderRadius >= 50 ? "max" : `${v.borderRadius}px`,
    blurAmountVal: `${v.blurAmount}px`,
    donationOpacityVal: `${v.donationOpacity}%`,
    donationImgSizeVal: `${v.donationImgSize}px`,
    nameBubbleOpacityVal: `${v.nameBubbleOpacity}%`,
    noticeOpacityVal: `${v.noticeOpacity}%`,
    fontSizeVal: `${v.fontSize}px`,
    chatGapVal: `${v.chatGap}px`,
    paddingXVal: `${v.paddingX}px`,
    iconSizeVal: `${v.iconSize}px`,
    avatarBgOpacityVal: `${v.avatarBgOpacity}%`,
    avatarBorderWidthVal: `${v.avatarBorderWidth}px`,
    avatarShadowVal: `${v.avatarShadow}px`,
    avatarOffsetXVal: `${v.avatarOffsetX}px`,
    avatarOffsetYVal: `${v.avatarOffsetY}px`,
    avatarFrameSizeVal:
      v.avatarFrameSize > 0 ? `${v.avatarFrameSize}px` : "auto",
    borderWidthVal: `${v.borderWidth}px`,
    boxShadowSizeVal: `${v.boxShadowSize}px`,
    textShadowSizeVal: `${v.textShadowSize}px`,
    lineHeightVal: v.lineHeight.toFixed(2),
    maxWidthVal: `${v.maxWidth}%`,
    paddingYVal: `${v.paddingY}px`,
    containerPaddingVal: `${v.containerPadding}px`,
    nickFontSizeVal: v.nickFontSize === 0 ? "auto" : `${v.nickFontSize}px`,
    namePaddingXVal: v.namePaddingX === 0 ? "auto" : `${v.namePaddingX}px`,
    splitTextPaddingXVal:
      v.splitTextPaddingX === 0 ? "auto" : `${v.splitTextPaddingX}px`,
    splitTextPaddingYVal:
      v.splitTextPaddingY === 0 ? "auto" : `${v.splitTextPaddingY}px`,
    splitTextOffsetXVal:
      v.splitTextOffsetX < 0 ? "auto" : `${v.splitTextOffsetX}px`,
    donationRadiusVal:
      v.donationRadius === 0 ? "auto" : `${v.donationRadius}px`,
    noticeRadiusVal: v.noticeRadius === 0 ? "auto" : `${v.noticeRadius}px`,
    capsuleRadiusVal: v.capsuleRadius >= 50 ? "max" : `${v.capsuleRadius}px`,
    textBgOpacityVal: `${v.textBgOpacity}%`,
    textBgRadiusVal: `${v.textBgRadius}px`,
    textBgPaddingVal: `${v.textBgPadding}px`,
    rankBadgeSizeVal: `${v.rankBadgeSize}px`,
  };

  Object.entries(valueMap).forEach(([id, text]) => {
    document.getElementById(id).textContent = text;
  });

  // 배경 흐림 CPU 부하 경고
  const blurWarn = document.getElementById("blurWarning");
  if (blurWarn) blurWarn.style.display = v.blurAmount >= 12 ? "" : "none";

  // 구분자 커스텀 안내
  const sepNote = document.getElementById("separatorNote");
  if (sepNote)
    sepNote.style.display =
      v.separatorText !== ": " && v.separatorText !== "" ? "" : "none";
}

function setVal(id, val) {
  document.getElementById(id).value = val;
}

function setRange(id, val) {
  document.getElementById(id).value = val;
}

function toggleSwitch(id) {
  document.getElementById(id).classList.toggle("on");
  if (id === "useRankBadge") onRankBadgeToggle();
  else update();
}

function onColorInput(el, hexId) {
  document.getElementById(hexId).value = el.value;
  update();
}

function switchPhase(phase) {
  hydrateDashboardBindings();
  document.querySelectorAll(".phase-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.phase === phase);
  });
  document.querySelectorAll(".phase-content").forEach((panel) => {
    panel.classList.toggle(
      "active",
      panel.dataset.phase === phase || panel.id === `phase-${phase}`,
    );
  });
  syncPhaseDashboard();
}

function selectLayout(style) {
  document.getElementById("messageStyle").value = style;
  document.querySelectorAll(".layout-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.style === style);
  });
  update();
}
