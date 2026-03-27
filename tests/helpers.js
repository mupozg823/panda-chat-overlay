"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { Buffer } = require("node:buffer");

const projectRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function hexToRgb(hex) {
  const value = String(hex || "")
    .replace("#", "")
    .trim();
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value;
  const int = Number.parseInt(normalized, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function createCssGeneratorSandbox() {
  const outputs = {
    cssOutput: { textContent: "" },
    cssOutputPreview: { textContent: "" },
  };

  const sandbox = {
    console,
    customIconDataUrl: "",
    RANK_BADGES: [],
    URLSearchParams,
    btoa(value) {
      return Buffer.from(String(value), "binary").toString("base64");
    },
    atob(value) {
      return Buffer.from(String(value), "base64").toString("binary");
    },
    encodeURIComponent,
    decodeURIComponent,
    escape,
    unescape,
    getTargetThemes(compatTheme) {
      return compatTheme === "all"
        ? [
            "default",
            "kakaotalk",
            "neon",
            "box",
            "roundbox",
            "balloon",
            "board",
          ]
        : [compatTheme];
    },
    hexToRgb,
    document: {
      getElementById(id) {
        return outputs[id] || null;
      },
    },
    window: {
      location: {
        origin: "http://127.0.0.1:4173",
        pathname: "/overlay-settings.html",
      },
    },
  };

  vm.createContext(sandbox);
  vm.runInContext(read("scripts/css-generator.js"), sandbox, {
    filename: "scripts/css-generator.js",
  });

  return { sandbox, outputs };
}

function createSampleValues(overrides = {}) {
  return {
    bubbleColor: "#111111",
    bubbleOpacity: 55,
    borderRadius: 16,
    blurAmount: 6,
    donationColor: "#222222",
    donationOpacity: 60,
    donationImgSize: 32,
    noticeColor: "#333333",
    noticeOpacity: 50,
    noticeTextColor: "#f1f1f1",
    nameBubbleColor: "#444444",
    nameBubbleOpacity: 50,
    nameUseGradient: false,
    nameGradStart: "#ff99aa",
    nameGradEnd: "#aa99ff",
    nickColor: "#123456",
    textColor: "#654321",
    fontSize: 16,
    textShadow: false,
    nickBold: false,
    textBold: false,
    nickLetterSpacing: 0,
    textLetterSpacing: 0,
    hideImg: false,
    hideEnd: false,
    hideNav: true,
    hideIcon: false,
    preventFade: true,
    noAnimation: true,
    badgeOpacity: 100,
    badgeScale: 100,
    badgeGrayscale: 0,
    bubbleTail: false,
    bubbleTailSize: 6,
    animationType: "none",
    donationImgRadius: 0,
    donationImgBorder: 0,
    donationImgShadow: 0,
    fontFamily: "'Jeju Gothic', sans-serif",
    messageStyle: "fullBubble",
    runtimeLayout: "auto",
    chatGap: 3,
    paddingX: 12,
    twoLine: false,
    nickIcon: "",
    iconPlacement: "nickname",
    iconSize: 16,
    avatarBgColor: "#ffffff",
    avatarBgOpacity: 100,
    avatarBorderColor: "#ffffff",
    avatarBorderWidth: 0,
    avatarShadow: 0,
    avatarOffsetX: 0,
    avatarOffsetY: 0,
    avatarFrameSize: 0,
    avatarFrameShape: "circle",
    customIconUrl: "",
    useGradient: false,
    gradStart: "#ffeeee",
    gradEnd: "#eeddff",
    gradDirection: "135deg",
    hideNotice: false,
    hideDonation: false,
    donationFontSize: 14,
    noticeFontSize: 14,
    heartAmountColor: "#ff6677",
    nameFrameEnabled: false,
    nameFrameColor1: "#ffffff",
    nameFrameColor2: "#eeeeee",
    nameFrameOpacity: 50,
    nameFramePadding: 4,
    nameFrameRadius: 12,
    donationUseGradient: false,
    donationGradStart: "#ffd1dc",
    donationGradEnd: "#ffc0cb",
    donationGlow: false,
    donationGlowColor: "#ffffff",
    donationGlowSize: 0,
    donationDecoLine: false,
    donationDecoColor: "#ffffff",
    noticeAccentLine: false,
    noticeAccentColor: "#ffffff",
    noticeAccentWidth: 0,
    compatTheme: "default",
    compatMode: "stable",
    resetInner: true,
    themeReset: true,
    chatAlign: "left",
    borderWidth: 0,
    borderColor: "#ffffff",
    boxShadowSize: 0,
    boxShadowColor: "#000000",
    textShadowSize: 2,
    textShadowColor: "#000000",
    lineHeight: 1.45,
    maxWidth: 90,
    paddingY: 4,
    containerPadding: 8,
    separatorText: ": ",
    nickFontSize: 13,
    namePaddingX: 0,
    splitTextPaddingX: 0,
    splitTextPaddingY: 0,
    splitTextOffsetX: -1,
    donationTextColor: "#dddddd",
    donationRadius: 0,
    noticeRadius: 0,
    capsuleRadius: 16,
    textBgColor: "#000000",
    textBgOpacity: 0,
    textBgRadius: 0,
    textBgPadding: 0,
    textBgBlur: 0,
    customCss: "",
    hideId: true,
    donationGap: 0,
    maxMessages: 0,
    textStroke: false,
    textStrokeSize: 1,
    textStrokeColor: "#000000",
    useRankBadge: false,
    rankBadgeSize: 16,
    rankBadgeIcons: {},
    useRankAvatar: false,
    rankAvatarImages: {},
    ...overrides,
  };
}

module.exports = {
  createCssGeneratorSandbox,
  createSampleValues,
  projectRoot,
  read,
};
