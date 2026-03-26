"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const htmlFiles = ["overlay-settings.html", "index.html"];

function walkJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseScript(code, filename) {
  try {
    new vm.Script(code, { filename });
  } catch (error) {
    throw new Error(`${filename}: ${error.message}`);
  }
}

function parseInlineScripts(htmlPath) {
  const source = fs.readFileSync(htmlPath, "utf8");
  const regex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  let index = 0;
  while ((match = regex.exec(source))) {
    if (/\bsrc\s*=/.test(match[1])) continue;
    const code = match[2].trim();
    if (!code) continue;
    parseScript(code, `${path.relative(projectRoot, htmlPath)}#inline-script-${++index}`);
  }
}

const jsFiles = walkJsFiles(projectRoot);
for (const filePath of jsFiles) {
  parseScript(
    fs.readFileSync(filePath, "utf8"),
    path.relative(projectRoot, filePath),
  );
}

for (const relativeHtmlPath of htmlFiles) {
  parseInlineScripts(path.join(projectRoot, relativeHtmlPath));
}

console.log(
  `Syntax OK: ${jsFiles.length} JS files, ${htmlFiles.length} HTML files with inline scripts`,
);
