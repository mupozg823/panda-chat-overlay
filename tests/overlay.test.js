"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
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

test("preview source and inline duplicate both keep nick/id/separator styling aligned", () => {
  const previewSource = read("scripts/preview.js");
  const settingsHtml = read("overlay-settings.html");

  for (const source of [previewSource, settingsHtml]) {
    assert.match(source, /querySelectorAll\(["']\.message__id["']\)/);
    assert.match(source, /querySelectorAll\(["']\.mr-1["']\)/);
    assert.match(source, /separator\.style\.color = .*nickColor/);
    assert.match(source, /separator\.style\.fontWeight = .*["']400["']/);
    assert.match(source, /text\.style\.fontWeight = .*["']400["']/);
    assert.match(source, /style\.width = .*["']fit-content["']/);
  }
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
  assert.match(settingsHtml, /<span class="mr-1 inline-block w-max align-text-bottom">/);
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
  assert.match(wrapperScript, /querySelectorAll\(":scope > li\.message__wrapper"\)/);
});
