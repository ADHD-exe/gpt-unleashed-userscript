# GPT-Unleashed Userscript

GPT-Unleashed is a Tampermonkey/Greasemonkey userscript for ChatGPT that adds a full customization and productivity layer on top of the default UI.

It adds:

- full theme controls (page, user/assistant bubbles, embedded blocks, composer, sidebar)
- font controls (family + independent font sizes)
- layout controls (alignment, width, radius, padding, slider behavior)
- prompt management (save/import/export/search/tags/favorites/pinning)
- one-click prompt insertion and new-chat prompt handoff
- chat export to Markdown (single or batch from sidebar)
- sidebar chat deletion helper
- UI panel theming and launcher controls
- userscript backup/export and update checking

## Compatibility

The script is designed for:

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`

## Installation

1. Install a userscript manager in your browser (Tampermonkey is recommended).
2. Open `GPT-Unleashed-v2.8.user.js` from this repository.
3. Install it through your userscript manager.
4. Open ChatGPT and wait for the page to finish loading.

The script injects a launcher in the bottom-right corner:

- **Up arrow**: scroll chat to top
- **Center emblem**: open/minimize GPT-Unleashed panel
- **Down arrow**: scroll chat to bottom

## Getting Started

1. Click the center launcher button to open the panel.
2. Use the page buttons:
   - **Themes**
   - **Layout**
   - **Font**
   - **Prompts**
   - **Export Chat**
   - **Delete Chats**
   - **Settings**
3. Changes apply live and are saved locally.

## Features

### 1) Theme System

You can theme each major UI area independently:

- Page background + text
- User message bubble background + text
- Assistant bubble background + text
- Embedded content background + text (code blocks/tables/quotes/etc.)
- Composer background + text
- Sidebar background + text + hover colors

You also get built-in presets:

- Default Theme
- Midnight OLED
- Dracula
- Nord
- GitHub Dark
- Solarized Dark
- Catppuccin Mocha
- Notion Light
- Synthwave Neon

You can also:

- save your own theme presets
- import a theme JSON
- export your current theme JSON

### 2) Layout Controls

Layout page controls:

- Chat alignment: left / center / right
- Bubble corner radius
- Bubble max width
- Bubble vertical padding
- Bubble horizontal padding
- Optional embedded-content alignment lock

Advanced layout options:

- show/hide direct numeric edit button
- wheel-based slider nudging
- filled slider track rendering
- custom slider styling
- toggle advanced layout controls visibility

### 3) Font Controls

Font page controls:

- custom font family value (e.g. `Inter, Arial, sans-serif`)
- user message font size
- assistant message font size
- sidebar font size

### 4) Prompt Management

Prompt system includes:

- create and store prompts
- sections for pinned, user, and AI prompts
- per-prompt actions:
  - Insert
  - New Chat
  - Favorite toggle
  - Pin/Unpin
  - Review modal
  - Expand/Collapse
  - Enhance with AI (inserts an enhancement instruction)
- import prompts from:
  - local `.txt` or `.json`
  - remote URL
- export prompts as timestamped JSON
- tag parsing/filtering support
- floating pinned prompt cards with:
  - hide
  - previous/next
  - review
  - unpin

#### Composer Prompt Explorer

The composer integration adds a prompt dock and explorer with:

- search by title/text
- tag filters
- favorites mode toggle
- expand/collapse prompt previews
- import/export
- create shortcut (opens prompts page)
- insert into active composer
- start new chat with selected prompt
- enhance selected prompt or current draft

### 5) Chat Export

You can export chats as Markdown:

- single-chat export from current conversation context
- multi-chat export by selecting sidebar chats
- exports include title, timestamp, URL, and message sections

### 6) Sidebar Chat Deletion Helper

The Delete Chats page lets you:

- load available sidebar chats
- select/unselect all
- delete selected chats (with confirmation)

### 7) Settings & UI Controls

Global toggles/settings include:

- Enable Theme Feature
- Enable Font Feature
- Hide “ChatGPT can make mistakes” warning footer
- Hide launcher until hover
- Enable drag-to-move panel/launcher
- Code syntax highlight toggle for embeds
- Panel opacity enable + value
- UI colors for panel itself
- Match panel UI colors to active theme

### 8) Update Checking

Update controls in Settings:

- custom GitHub Raw URL field for your script source
- auto-check updates toggle
- manual **Check for Updates** button
- optional install flow from raw URL if a newer version is found

If no URL is configured, the script attempts to use userscript metadata download/update URLs when available.

### 9) Backup / Portability

You can export a complete backup JSON containing:

- current settings
- saved prompts
- script version
- script source (if available via userscript manager metadata)

## Tampermonkey Menu Commands

The script also registers userscript manager menu commands:

- Open Theme Editor
- Check Script Updates
- Install from GitHub Raw
- Reset Theme Editor

## Data Storage

The script stores state in browser storage:

- settings in `localStorage`
- prompts/themes in `localStorage`
- pending new-chat prompt handoff in `sessionStorage`

All configuration is local to your browser profile.

## How “New Chat with Prompt” Works

1. Prompt text is staged in temporary session storage.
2. Script triggers ChatGPT “New chat” navigation/button.
3. After composer is detected on the new page, prompt is auto-inserted.
4. Pending prompt expires automatically after a short timeout window.

## Recommended Usage Flow

1. Pick a built-in theme preset first.
2. Fine-tune colors per surface in Themes page.
3. Adjust layout + font for readability.
4. Build a prompt library with tags/favorites/pinning.
5. Configure update URL and enable auto-check.
6. Export a full backup JSON after major changes.

## Troubleshooting

### Panel not visible

- Hover bottom-right (launcher may be set to hidden until hover).
- Use userscript menu → **Open Theme Editor**.
- Disable other UI-modifying extensions to test for conflicts.

### Prompt insert does nothing

- Ensure ChatGPT composer is visible and focused on the active tab.
- Retry after page fully loads.
- Open Prompt Explorer and use Insert from there.

### Batch export/deletion misses chats

- Scroll sidebar to load older chats first.
- Re-open Export/Delete modal after loading more history.

### Update check fails

- Verify the raw URL points to the `.user.js` file.
- Ensure the URL is publicly reachable.
- Retry with manual “Check for Updates”.

## Security Notes

- Importing prompts/themes from external URLs trusts that source content.
- Only use trusted URLs and inspect imported data when possible.
- Script backup export can include your prompt library and settings—treat backup files as sensitive.

## Development Notes

Main script file:

- `GPT-Unleashed-v2.8.user.js`

Current README is documentation-only and does not alter runtime behavior.
