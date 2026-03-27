"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const {
  createCssGeneratorSandbox,
  createSampleValues,
  read,
} = require("./helpers");

test("updateCSS emits message ID selectors for both widget DOM shapes", () => {
  const { sandbox, outputs } = createCssGeneratorSandbox();
  const values = createSampleValues();
  const css = sandbox.generateCssText(values);

  sandbox.updateCSS(values);

  assert.match(css, /ul\.default > li\.message__wrapper \.message__id/);
  assert.match(css, /ul > li\.default\.message__wrapper \.message__id/);
  assert.match(css, /width: fit-content !important;/);
  assert.match(css, /overflow-wrap: anywhere !important;/);
  assert.match(
    css,
    /\.message__text[\s\S]*?font-weight: 400 !important;/,
    "message text should emit an explicit non-bold default",
  );
  assert.equal(outputs.cssOutput.textContent, css);
});

test("runtime widget mode keeps separator visible for live line-break layouts", () => {
  const { sandbox } = createCssGeneratorSandbox();
  const values = createSampleValues({
    compatTheme: "box",
    messageStyle: "runtimeAuto",
    runtimeLayout: "chatLineBreak",
  });
  const css = sandbox.generateCssText(values);

  assert.match(
    css,
    /justify-content: flex-end !important;|justify-content: flex-start !important;|justify-content: unset !important;/,
  );
  assert.match(
    css,
    /\.message__nick > span:not\(\.message__name\):not\(\.message__text\):not\(\.message__id\)[\s\S]*?display: inline !important;/,
    "runtime line-break layouts should keep the separator visible like the live widget",
  );
  assert.match(
    css,
    /\.message__text[\s\S]*?margin-left: 0px !important;/,
    "runtime mode should not apply custom split offset",
  );
});

test("buildWrapperUrl serializes current values as config payload", () => {
  const { sandbox } = createCssGeneratorSandbox();
  const values = createSampleValues({
    compatTheme: "all",
    customCss: ".demo { color: red; }",
  });
  const url = sandbox.buildWrapperUrl(
    "https://p.pandahp.kr/chat/abc123",
    values,
  );
  const parsed = new URL(url);
  const configPayload = parsed.searchParams.get("config");

  assert.equal(parsed.origin, "http://127.0.0.1:4173");
  assert.equal(parsed.pathname, "/live-wrapper.html");
  assert.equal(
    parsed.searchParams.get("target"),
    "https://p.pandahp.kr/chat/abc123",
  );
  assert.ok(configPayload, "wrapper URL should carry serialized config");
  assert.equal(parsed.searchParams.get("css"), null);

  const decoded = JSON.parse(
    Buffer.from(configPayload, "base64").toString("utf8"),
  );
  assert.equal(decoded.compatTheme, "all");
  assert.equal(decoded.customCss, ".demo { color: red; }");
});

test("overlay settings exposes unified wrapper URL workflow", () => {
  const settingsHtml = read("overlay-settings.html");

  assert.match(settingsHtml, /id="wrapperTargetUrl"/);
  assert.match(settingsHtml, /OBS URL 복사/);
  assert.match(settingsHtml, /function syncWrapperHint\(\)/);
  assert.match(settingsHtml, /\.preview-header-controls input/);
  assert.match(settingsHtml, /syncApplyModeUI\(\);/);
  assert.doesNotMatch(
    settingsHtml,
    /option value="css".*CSS 복사해서 붙여넣기/,
  );
});

test("overlay settings keeps runtime widget parity controls internal", () => {
  const settingsHtml = read("overlay-settings.html");

  assert.doesNotMatch(settingsHtml, /data-style="runtimeAuto"/);
  assert.match(settingsHtml, /option value="runtimeAuto" hidden/);
  assert.match(
    settingsHtml,
    /id="runtimeLayoutRow" style="display:none !important;" hidden/,
  );
  assert.match(settingsHtml, /id="runtimeLayout"/);
  assert.match(
    settingsHtml,
    /function getMessageLayoutState\(v = getValues\(\)\)/,
  );
  assert.match(settingsHtml, /function syncMessageStyleUI\(\)/);
  assert.match(settingsHtml, /실제 위젯 기준/);
});

test("overlay settings presents splitLayers as card styling in user-facing copy", () => {
  const settingsHtml = read("overlay-settings.html");
  const presetSource = read("scripts/presets.js");

  assert.match(settingsHtml, /전체 말풍선 \/ 캡슐형 \/ 카드형/);
  assert.match(settingsHtml, /layout-card-name">카드형</);
  assert.match(settingsHtml, /option value="splitLayers">본문 카드형</);
  assert.match(settingsHtml, /게이밍 카드형/);
  assert.match(settingsHtml, /클린 카드형/);
  assert.match(presetSource, /splitLayers: "본문 카드형"/);
});

test("overlay settings surfaces recommended presets before tuned variants", () => {
  const settingsHtml = read("overlay-settings.html");

  assert.match(settingsHtml, /const tunedPresetNames = new Set\(\[/);
  assert.match(settingsHtml, /방송용 튜닝형/);
  assert.match(settingsHtml, /바로 사용 추천/);

  const basicSafeIndex = settingsHtml.indexOf("applyTheme('studioFlat')");
  const basicTunedIndex = settingsHtml.indexOf("applyTheme('reference')");
  assert.ok(
    basicSafeIndex >= 0 &&
      basicTunedIndex >= 0 &&
      basicSafeIndex < basicTunedIndex,
    "basic safe presets should appear before tuned presets",
  );

  const cuteSafeIndex = settingsHtml.indexOf("applyTheme('whiteMinimal')");
  const cuteTunedIndex = settingsHtml.indexOf("applyTheme('princess')");
  assert.ok(
    cuteSafeIndex >= 0 && cuteTunedIndex >= 0 && cuteSafeIndex < cuteTunedIndex,
    "cute safe presets should appear before tuned presets",
  );
});

test("split-layer presets are redesigned as widget-safe card variants", () => {
  const sandbox = { console };
  vm.createContext(sandbox);
  vm.runInContext(
    `${read("scripts/presets.js")}\nthis.__themes = themes;`,
    sandbox,
    { filename: "scripts/presets.js" },
  );
  const themes = sandbox.__themes;

  for (const name of ["princess", "princess2", "cleanSplit", "gamingSplit"]) {
    const preset = themes[name];
    assert.ok(preset, `${name} preset should exist`);
    assert.equal(
      preset.messageStyle,
      "nameCapsule",
      `${name} should no longer depend on splitLayers`,
    );
    assert.equal(
      preset.splitTextOffsetX,
      -1,
      `${name} should not rely on custom split offset`,
    );
    assert.ok(
      preset.textBgOpacity > 0,
      `${name} should use body card styling instead of structural split layout`,
    );
  }
});

test("dense capsule presets are tuned for broadcast readability", () => {
  const sandbox = { console };
  vm.createContext(sandbox);
  vm.runInContext(
    `${read("scripts/presets.js")}\nthis.__themes = themes;`,
    sandbox,
    { filename: "scripts/presets.js" },
  );
  const themes = sandbox.__themes;

  assert.ok(themes.reference.maxWidth <= 84);
  assert.ok(themes.reference.paddingX <= 14);
  assert.ok(themes.reference.chatGap <= 6);

  assert.ok(themes.princess.maxWidth >= 76);
  assert.ok(themes.princess.textBgPadding <= 8);
  assert.ok(themes.princess.namePaddingX <= 12);

  assert.ok(themes.princess2.avatarFrameSize <= 40);
  assert.ok(themes.princess2.lineHeight >= 1.4);
  assert.ok(themes.princess2.textBgPadding <= 5);
});

test("settings HTML keeps nick/id/separator styling aligned", () => {
  const settingsHtml = read("overlay-settings.html");

  assert.match(settingsHtml, /resolveRuntimeWidgetLayout/);
  assert.match(settingsHtml, /runtimeMode/);
  assert.match(settingsHtml, /indentationMode/);
  assert.match(settingsHtml, /querySelectorAll\(["']\.message__id["']\)/);
  assert.match(settingsHtml, /querySelectorAll\(["']\.mr-1["']\)/);
  assert.match(settingsHtml, /separator\.style\.color = .*nickColor/);
  assert.match(settingsHtml, /separator\.style\.fontWeight = .*["']400["']/);
  assert.match(settingsHtml, /separator\.style\.display =[\s\S]*runtimeMode/);
  assert.match(settingsHtml, /text\.style\.fontWeight = .*["']400["']/);
  assert.match(settingsHtml, /text\.style\.marginLeft =[\s\S]*runtimeMode/);
  assert.match(settingsHtml, /style\.width = .*["']fit-content["']/);
});

test("overlay settings preview sample uses valid nick markup and includes masked IDs", () => {
  const settingsHtml = read("overlay-settings.html");
  const messageIdMatches = settingsHtml.match(/class="message__id"/g) || [];
  assert.ok(
    messageIdMatches.length >= 3,
    "preview sample should include multiple message__id spans",
  );
  assert.doesNotMatch(
    settingsHtml,
    /<p class="message__nick[\s\S]*?<div class="mr-1 inline-block w-max align-text-bottom">/,
    "preview sample should not nest a block badge wrapper inside p.message__nick",
  );
  assert.match(settingsHtml, /<div class="message__nick hide__opacity">/);
  assert.match(
    settingsHtml,
    /<span class="mr-1 inline-block w-max align-text-bottom">/,
  );
  assert.match(settingsHtml, /\(happy\*\*\*\)/);
  assert.match(settingsHtml, /\(rui\*\*\*\)/);
  assert.match(settingsHtml, /\(ram\*\*\*\)/);
});

test("live wrapper proxies the widget into a same-origin iframe and installs DOM repair hooks", () => {
  const serveSource = read("scripts/serve.js");
  const wrapperHtml = read("live-wrapper.html");
  const wrapperScript = read("scripts/live-wrapper.js");

  assert.match(serveSource, /const upstreamOrigin = new URL\(/);
  assert.match(serveSource, /function proxyRequest\(req, res\)/);
  assert.match(serveSource, /if \(error\) \{\s*proxyRequest\(req, res\);/);

  assert.match(wrapperHtml, /id="widgetFrame"/);
  assert.match(wrapperHtml, /scripts\/css-generator\.js/);
  assert.match(wrapperHtml, /scripts\/live-wrapper\.js/);

  assert.match(wrapperScript, /url\.hostname !== "p\.pandahp\.kr"/);
  assert.match(wrapperScript, /config: params\.get\("config"\) \|\| ""/);
  assert.match(wrapperScript, /resolveUserCss/);
  assert.match(wrapperScript, /generateCssText\(parsed\)/);
  assert.match(wrapperScript, /MutationObserver/);
  assert.match(wrapperScript, /fixNickElement/);
  assert.match(
    wrapperScript,
    /querySelectorAll\(":scope > li\.message__wrapper"\)/,
  );
  assert.match(read("scripts/css-generator.js"), /resolveWrapperTargetUrl/);
  assert.match(
    read("scripts/css-generator.js"),
    /const defaultText = "OBS URL 복사"/,
  );
});

test("live simulator script exists and exposes required functions", () => {
  const simSource = read("scripts/live-simulator.js");

  assert.match(simSource, /function simCreateChatMessage\(\)/);
  assert.match(simSource, /function simCreateDonation\(\)/);
  assert.match(simSource, /function simCreateNotice\(\)/);
  assert.match(simSource, /function simStart\(\)/);
  assert.match(simSource, /function simStop\(\)/);
  assert.match(simSource, /function simToggle\(\)/);
  assert.match(simSource, /function simClear\(\)/);
  assert.match(simSource, /function simSetSpeed\(/);
  assert.match(simSource, /function simUpdateCss\(\)/);
});

test("live simulator DOM uses actual PandaTV structure with RE data", () => {
  const simSource = read("scripts/live-simulator.js");

  assert.match(simSource, /message__wrapper/);
  assert.match(simSource, /message__nick/);
  assert.match(simSource, /message__name/);
  assert.match(simSource, /message__text/);
  assert.match(simSource, /haert__image/);
  assert.match(simSource, /heart__text/);
  assert.match(simSource, /chat__notice--list/);
  assert.match(simSource, /notice__text/);
  assert.match(simSource, /message__id/);
  assert.match(simSource, /display:none/);
  assert.match(simSource, /_simGenerateTextShadow/);
  assert.match(simSource, /_simNickColor/);
  assert.match(simSource, /SIM_LEVELS/);

  assert.doesNotMatch(simSource, /message__box/);
});

test("overlay settings includes simulator panel and script", () => {
  const settingsHtml = read("overlay-settings.html");

  assert.match(settingsHtml, /id="simPanel"/);
  assert.match(settingsHtml, /id="simContainer"/);
  assert.match(settingsHtml, /id="simChat"/);
  assert.match(settingsHtml, /id="simCssInjection"/);
  assert.match(settingsHtml, /id="simPlayBtn"/);
  assert.match(settingsHtml, /id="simSpeedRange"/);
  assert.match(settingsHtml, /scripts\/live-simulator\.js/);
  assert.match(settingsHtml, /simUpdateCss\(\)/);
});
