# CLAUDE.md

## Project Overview

PandaTV Chat Overlay — a CSS styling and customization tool for OBS Studio browser sources that display PandaTV (Korean streaming platform) chat messages. Provides a ready-to-use CSS stylesheet and an interactive visual generator for broadcasters.

**Tech stack:** Pure HTML5, CSS3, vanilla JavaScript. Zero dependencies, no build system, no Node.js.

## Repository Structure

```
├── 팬더TV_채팅_오버레이.css          # Production CSS for OBS browser source
├── 팬더TV_채팅_오버레이_설정기.html  # Visual CSS generator (single-page app)
├── README.md                          # Project docs (Korean)
├── CLAUDE.md                          # This file
└── .gitignore
```

### Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `팬더TV_채팅_오버레이.css` | Static CSS stylesheet users paste into OBS. Supports all 7 PandaTV chat themes (default, kakaotalk, neon, box, roundbox, balloon, board). Uses `!important` to override 11 inline style properties. | ~156 |
| `팬더TV_채팅_오버레이_설정기.html` | Self-contained HTML file with embedded CSS and JavaScript. Two-panel UI: left panel for settings, right panel for live preview + generated CSS output. | ~1261 |

## Architecture & Key Concepts

### CSS Override Strategy
PandaTV's chat widget is a Next.js SSR app (`p.pandahp.kr/chat/{hash}`) that applies inline styles. The CSS uses `!important` on 11 properties to override them: `color`, `font-size`, `text-shadow`, `width`, `display`, `flex-direction`, `align-items`, `transition`, `font-family`, `text-align`, `fill`.

### Theme System
- **CSS file:** Targets 7 PandaTV built-in themes via selectors like `[class*="theme-name"]`
- **Generator:** Has 6 preset themes (pink, character, dark, neon, glass, minimal) stored as JavaScript objects with 30+ parameters each

### Generator JavaScript Functions
- `applyTheme(name)` — Applies a preset theme to all form controls
- `update()` — Main function: reads all UI values, updates preview and CSS output
- `getValues()` — Collects current UI state into a values object
- `updatePreview(v)` — Applies styling to the live preview panel
- `updateCSS(v)` — Generates the OBS-ready CSS string
- `copyCSS()` — Copies generated CSS to clipboard with user feedback
- `toggleSwitch(id)` — Toggles boolean settings
- `onColorInput()` / `onHexInput()` — Syncs color picker and hex text input

### Icon System
Nickname icons use CSS `::before` pseudo-elements. Supports 10 built-in emoji options plus custom images via URL or file upload.

## Development Workflow

### No Build Step Required
Files are served as-is. To work on the project:
1. Open `팬더TV_채팅_오버레이_설정기.html` directly in a browser
2. Edit CSS/HTML/JS and refresh to see changes
3. Test generated CSS output in OBS browser source

### Testing
No automated test suite. Testing is manual:
- Open the HTML generator in a modern browser
- Verify theme presets apply correctly
- Check that generated CSS works with all 7 PandaTV themes
- Test color pickers, sliders, toggles, and icon options
- Verify "CSS 복사" (copy) button works

### Filenames
Source files use Korean names (UTF-8). Be careful with encoding when committing or referencing these files in shell commands — quote filenames properly.

## Code Conventions

- **No frameworks or dependencies** — keep it vanilla HTML/CSS/JS
- **CSS:** Uses `!important` extensively (required to override PandaTV inline styles). Follows BEM-like naming (`.section-title`, `.control-label`, `.preview-msg`)
- **JavaScript:** ES6, functional style, DOM manipulation via `getElementById`/`querySelectorAll`, inline event handlers (`onclick`, `oninput`, `onchange`)
- **HTML:** Semantic HTML5 tags (`header`, `nav`, `main`)
- **Font:** 'Noto Sans KR' from Google Fonts as primary
- **Language:** UI and documentation are in Korean

## Common Pitfalls

- **Inline style overrides:** Any CSS targeting PandaTV chat elements must use `!important` to take effect
- **Korean filenames:** Always quote filenames in shell commands to handle UTF-8 characters
- **Single-file architecture:** The HTML generator is fully self-contained (no external JS/CSS imports beyond Google Fonts). Keep it that way — do not split into separate files
- **Theme coverage:** CSS changes must work across all 7 PandaTV themes, not just the default
- **Fade-out prevention:** The `.hide__opacity` class must remain disabled to prevent chat messages from disappearing

## License

MIT
