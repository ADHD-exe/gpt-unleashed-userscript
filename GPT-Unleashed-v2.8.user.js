// ==UserScript==
// @name         GPT-Unleashed
// @namespace    https://openai.com/
// @version      2.8.26
// @description  Customize ChatGPT background, bubbles, embedded blocks, composer, sidebar, alignment, and font with a bottom-right launcher.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_info
// ==/UserScript==

(function () {
  'use strict';

  const SCRIPT_VERSION = '2.8.26';
  if (window.__rabbitChatGptThemeV28) return;
  window.__rabbitChatGptThemeV28 = { version: SCRIPT_VERSION };

  const STORAGE_KEY = 'rabbit_chatgpt_theme_settings_v28';
  const PROMPTS_KEY = 'rabbit_chatgpt_saved_prompts_v1';
  const GLOBAL_FILES_KEY = 'rabbit_global_files';
  const SAVED_THEMES_KEY = 'rabbit_chatgpt_saved_themes_v1';
  const PENDING_PROMPT_KEY = 'rabbit_chatgpt_pending_prompt_v1';
  const PENDING_PROMPT_MAX_AGE_MS = 10 * 60 * 1000;
  const STYLE_ID = 'rabbit-chatgpt-theme-style-v28';
  const PANEL_ID = 'rabbit-chatgpt-theme-panel-v28';
  const PANEL_OPEN_TOP = 36;
  const PANEL_OPEN_RIGHT = 18;
  const PANEL_PAGES = new Set(['home', 'themes', 'layout', 'font', 'prompts', 'settings', 'ui-theme']);
  const AUXILIARY_UI_PATTERN = /\b(toolbar|actions|avatar|icon|sidebar|drawer|modal|dialog|popover|tooltip|toast|banner|menu|search|launcher|artifact|interpreter|notebook|canvas|status|alert|attachment|upload|footer|header)\b/;
  const COMPOSER_EXCLUSION_PATTERN = /\b(search|sidebar|drawer|modal|dialog|popover|tooltip|toast|banner|menu|launcher|artifact|interpreter|notebook|canvas|status|alert)\b/;

  const LAUNCHER_ICON_UP = 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2264%22%20height=%2264%22%20viewBox=%220%200%2024%2024%22%3E%3Cpath%20fill=%22black%22%20d=%22M6%204h12v2H6zm5%2010v6h2v-6h5l-6-6l-6%206z%22%3E%3C/path%3E%3C/svg%3E';
  const COMPOSER_PROMPT_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M9.812 1.238a1 1 0 0 1 .73 1.11l-.023.115-3.106 11.591a1 1 0 0 1-1.956-.403l.024-.114L8.587 1.946a1 1 0 0 1 1.225-.708M4.707 4.293a1 1 0 0 1 0 1.414L2.414 8l2.293 2.293a1 1 0 1 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414l3-3a1 1 0 0 1 1.414 0m6.586 0a1 1 0 0 1 1.32-.083l.094.083 3 3a1 1 0 0 1 .083 1.32l-.083.094-3 3a1 1 0 0 1-1.497-1.32l.083-.094L13.586 8l-2.293-2.293a1 1 0 0 1 0-1.414"/></svg>';
  const COMPOSER_ENHANCE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="m12 3l-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></svg>';
  const LAUNCHER_ICON_DOWN = 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2264%22%20height=%2264%22%20viewBox=%220%200%2024%2024%22%3E%3Cpath%20fill=%22black%22%20d=%22M6%2018h12v2H6zm5-14v6H6l6%206l6-6h-5V4z%22%3E%3C/path%3E%3C/svg%3E';
  const LAUNCHER_ICON_EMBLEM = 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2264%22%20height=%2264%22%20viewBox=%220%200%2024%2024%22%3E%3Cg%20fill=%22none%22%20stroke=%22black%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%20stroke-width=%221.5%22%3E%3Cpath%20d=%22M11.745%2014.85L6.905%2012V7c0-2.21%201.824-4%204.076-4c1.397%200%202.63.69%203.365%201.741%22%3E%3C/path%3E%3Cpath%20d=%22M9.6%2019.18A4.1%204.1%200%200%200%2013.02%2021c2.25%200%204.076-1.79%204.076-4v-5L12.16%209.097%22%3E%3C/path%3E%3Cpath%20d=%22M9.452%2013.5V7.67l4.412-2.5c1.95-1.105%204.443-.45%205.569%201.463a3.93%203.93%200%200%201%20.076%203.866%22%3E%3C/path%3E%3Cpath%20d=%22M4.49%2013.5a3.93%203.93%200%200%200%20.075%203.866c1.126%201.913%203.62%202.568%205.57%201.464l4.412-2.5l.096-5.596%22%3E%3C/path%3E%3Cpath%20d=%22M17.096%2017.63a4.09%204.09%200%200%200%203.357-1.996c1.126-1.913.458-4.36-1.492-5.464l-4.413-2.5l-5.059%202.755%22%3E%3C/path%3E%3Cpath%20d=%22M6.905%206.37a4.09%204.09%200%200%200-3.358%201.996c-1.126%201.914-.458%204.36%201.492%205.464l4.413%202.5l5.048-2.75%22%3E%3C/path%3E%3C/g%3E%3C/svg%3E';

  const defaults = {
    pageBg: '#000000',
    pageText: '#f0f0f0',

    userBubbleBg: '#000418',
    userBubbleText: '#0093DB',

    assistantBubbleBg: '#00C001',
    assistantBubbleText: '#00FF75',

    embedBg: '#0D0800',
    embedText: '#F4F7F4',

    composerBg: '#000000',
    composerText: '#F9F06B',

    sidebarBg: '#000000',
    sidebarText: '#99C1F1',
    sidebarHover: '#62A0EA',
    sidebarHoverText: '#000313',

    chatTextAlign: 'left',
    chatFontFamily: 'inherit',
    userFontSize: 15,
    assistantFontSize: 15,
    sidebarFontSize: 14,

    bubbleRadius: 22,
    bubbleMaxWidth: 860,
    bubblePaddingY: 14,
    bubblePaddingX: 18,
    layoutEditEnabled: true,
    layoutWheelAdjustEnabled: true,
    layoutTrackFillEnabled: true,
    layoutSliderSkinEnabled: true,
    layoutAdvancedControlsEnabled: true,
    layoutEmbedAlignmentLock: true,

    featureThemeEnabled: true,
    featureFontEnabled: true,
    hideGptWarning: true,
    themePageEnabled: true,
    themeUserBubbleEnabled: true,
    themeAssistantBubbleEnabled: true,
    themeEmbedEnabled: true,
    themeComposerEnabled: true,
    themeSidebarEnabled: true,
    selectedThemePresetId: 'builtin-default',
    uiMatchThemeEnabled: true,
    panelOpacityEnabled: true,
    panelOpacity: 0.92,
    panelPage: 'home',
    panelUiBg: '#000900',
    panelUiBubble: '#002b1b',
    panelUiFont: '#00ff75',
    panelUiOutline: '#00fddf',
    panelUiButton: '#0a6600',

    panelHidden: false,
    launcherHiddenUntilHover: true,
    moveGuiDragEnabled: false,
    panelLeft: null,
    panelTop: null,

    updateRawUrl: '',
    autoCheckUpdates: true
  };

  const COLOR_KEYS = [
    'pageBg',
    'pageText',
    'userBubbleBg',
    'userBubbleText',
    'assistantBubbleBg',
    'assistantBubbleText',
    'embedBg',
    'embedText',
    'composerBg',
    'composerText',
    'sidebarBg',
    'sidebarText',
    'sidebarHover',
    'sidebarHoverText',
    'panelUiBg',
    'panelUiBubble',
    'panelUiFont',
    'panelUiOutline',
    'panelUiButton'
  ];
  const THEME_SETTING_KEYS = [
    'themePageEnabled',
    'themeUserBubbleEnabled',
    'themeAssistantBubbleEnabled',
    'themeEmbedEnabled',
    'themeComposerEnabled',
    'themeSidebarEnabled',
    'pageBg',
    'pageText',
    'userBubbleBg',
    'userBubbleText',
    'assistantBubbleBg',
    'assistantBubbleText',
    'embedBg',
    'embedText',
    'composerBg',
    'composerText',
    'sidebarBg',
    'sidebarText',
    'sidebarHover',
    'sidebarHoverText'
  ];
  const BUILTIN_THEME_PRESETS = [
    { id: 'builtin-default', name: 'Default Theme', theme: { pageBg: defaults.pageBg, pageText: defaults.pageText, userBubbleBg: defaults.userBubbleBg, userBubbleText: defaults.userBubbleText, assistantBubbleBg: defaults.assistantBubbleBg, assistantBubbleText: defaults.assistantBubbleText, embedBg: defaults.embedBg, embedText: defaults.embedText, composerBg: defaults.composerBg, composerText: defaults.composerText, sidebarBg: defaults.sidebarBg, sidebarText: defaults.sidebarText, sidebarHover: defaults.sidebarHover, sidebarHoverText: defaults.sidebarHoverText } },
    { id: 'builtin-midnight-oled', name: 'Midnight OLED', theme: { pageBg: '#000000', pageText: '#f4f8ff', userBubbleBg: '#0e1628', userBubbleText: '#d8e7ff', assistantBubbleBg: '#121212', assistantBubbleText: '#f1f1f1', embedBg: '#111827', embedText: '#dbeafe', composerBg: '#0b1220', composerText: '#e2e8f0', sidebarBg: '#030712', sidebarText: '#cbd5e1', sidebarHover: '#60a5fa', sidebarHoverText: '#dbeafe' } },
    { id: 'builtin-dracula', name: 'Dracula', theme: { pageBg: '#282a36', pageText: '#f8f8f2', userBubbleBg: '#44475a', userBubbleText: '#f8f8f2', assistantBubbleBg: '#6272a4', assistantBubbleText: '#f8f8f2', embedBg: '#1f2230', embedText: '#bd93f9', composerBg: '#343746', composerText: '#ff79c6', sidebarBg: '#21222c', sidebarText: '#f8f8f2', sidebarHover: '#8be9fd', sidebarHoverText: '#282a36' } },
    { id: 'builtin-nord', name: 'Nord', theme: { pageBg: '#2e3440', pageText: '#eceff4', userBubbleBg: '#4c566a', userBubbleText: '#eceff4', assistantBubbleBg: '#3b4252', assistantBubbleText: '#d8dee9', embedBg: '#434c5e', embedText: '#88c0d0', composerBg: '#3b4252', composerText: '#e5e9f0', sidebarBg: '#2b303b', sidebarText: '#d8dee9', sidebarHover: '#81a1c1', sidebarHoverText: '#eceff4' } },
    { id: 'builtin-github-dark', name: 'GitHub Dark', theme: { pageBg: '#0d1117', pageText: '#c9d1d9', userBubbleBg: '#21262d', userBubbleText: '#e6edf3', assistantBubbleBg: '#161b22', assistantBubbleText: '#c9d1d9', embedBg: '#30363d', embedText: '#c9d1d9', composerBg: '#0f141b', composerText: '#e6edf3', sidebarBg: '#010409', sidebarText: '#c9d1d9', sidebarHover: '#58a6ff', sidebarHoverText: '#0d1117' } },
    { id: 'builtin-solarized-dark', name: 'Solarized Dark', theme: { pageBg: '#002b36', pageText: '#93a1a1', userBubbleBg: '#073642', userBubbleText: '#eee8d5', assistantBubbleBg: '#0b3a46', assistantBubbleText: '#93a1a1', embedBg: '#0f414b', embedText: '#b58900', composerBg: '#08333d', composerText: '#2aa198', sidebarBg: '#001f27', sidebarText: '#93a1a1', sidebarHover: '#268bd2', sidebarHoverText: '#fdf6e3' } },
    { id: 'builtin-catppuccin-mocha', name: 'Catppuccin Mocha', theme: { pageBg: '#1e1e2e', pageText: '#cdd6f4', userBubbleBg: '#45475a', userBubbleText: '#cdd6f4', assistantBubbleBg: '#313244', assistantBubbleText: '#cdd6f4', embedBg: '#585b70', embedText: '#f9e2af', composerBg: '#313244', composerText: '#89dceb', sidebarBg: '#181825', sidebarText: '#bac2de', sidebarHover: '#89b4fa', sidebarHoverText: '#1e1e2e' } },
    { id: 'builtin-notion-light', name: 'Notion Light', theme: { pageBg: '#f7f6f3', pageText: '#37352f', userBubbleBg: '#e9e5dc', userBubbleText: '#2f2d28', assistantBubbleBg: '#ffffff', assistantBubbleText: '#37352f', embedBg: '#efebe4', embedText: '#5b5a56', composerBg: '#ffffff', composerText: '#2f2d28', sidebarBg: '#fbfaf8', sidebarText: '#5f5b53', sidebarHover: '#2f76db', sidebarHoverText: '#ffffff' } },
    { id: 'builtin-synthwave-neon', name: 'Synthwave Neon', theme: { pageBg: '#120422', pageText: '#f5d9ff', userBubbleBg: '#2b0d4d', userBubbleText: '#ff9de2', assistantBubbleBg: '#1a1336', assistantBubbleText: '#9efcff', embedBg: '#220a3d', embedText: '#f9ff66', composerBg: '#2d0f45', composerText: '#a9ff68', sidebarBg: '#0a0318', sidebarText: '#d8b7ff', sidebarHover: '#54f7ff', sidebarHoverText: '#120422' } }
  ];

  const NUMERIC_RANGES = {
    bubbleRadius: { min: 6, max: 40 },
    bubbleMaxWidth: { min: 260, max: 1200 },
    bubblePaddingY: { min: 6, max: 28 },
    bubblePaddingX: { min: 8, max: 40 },
    panelOpacity: { min: 0.05, max: 1 },
    userFontSize: { min: 4, max: 32 },
    assistantFontSize: { min: 4, max: 32 },
    sidebarFontSize: { min: 4, max: 28 }
  };

  let settings = loadSettings();
  let prompts = loadPrompts();
  let savedThemes = loadSavedThemes();
  let floatingPromptEventsBound = false;
  let saveTimer = null;
  let refreshTimer = null;
  let mutationObserver = null;
  let observerPaused = false;
  let notificationTimer = null;
  function clampNumber(value, min, max, fallback) {
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    return Math.min(max, Math.max(min, num));
  }

  function sanitizeColor(value, fallback) {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    if (typeof CSS !== 'undefined' && CSS.supports && CSS.supports('color', trimmed)) {
      return trimmed;
    }
    return fallback;
  }

  function sanitizeHexColor(value, fallback) {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(trimmed);
    if (!match) return fallback;
    const hex = match[1].length === 3
      ? match[1].split('').map((char) => char + char).join('')
      : match[1];
    return `#${hex.toUpperCase()}`;
  }

  function sanitizeFontFamily(value) {
    if (typeof value !== 'string') return defaults.chatFontFamily;
    const cleaned = value.replace(/[;{}]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleaned) return 'inherit';
    return cleaned;
  }

  function normalizeSettings(input) {
    const merged = { ...defaults, ...(input || {}) };
    if (typeof merged.sidebarHover !== 'string' && typeof input?.sidebarLink === 'string') {
      merged.sidebarHover = input.sidebarLink;
    }

    for (const key of COLOR_KEYS) {
      merged[key] = sanitizeHexColor(merged[key], defaults[key]);
    }

    merged.chatFontFamily = sanitizeFontFamily(merged.chatFontFamily);

    if (!['left', 'center', 'right'].includes(merged.chatTextAlign)) {
      merged.chatTextAlign = defaults.chatTextAlign;
    }

    for (const [key, range] of Object.entries(NUMERIC_RANGES)) {
      merged[key] = clampNumber(merged[key], range.min, range.max, defaults[key]);
    }

    merged.featureThemeEnabled = !!merged.featureThemeEnabled;
    merged.featureFontEnabled = !!merged.featureFontEnabled;
    merged.hideGptWarning = !!merged.hideGptWarning;
    merged.themePageEnabled = !!merged.themePageEnabled;
    merged.themeUserBubbleEnabled = !!merged.themeUserBubbleEnabled;
    merged.themeAssistantBubbleEnabled = !!merged.themeAssistantBubbleEnabled;
    merged.themeEmbedEnabled = !!merged.themeEmbedEnabled;
    merged.themeComposerEnabled = !!merged.themeComposerEnabled;
    merged.themeSidebarEnabled = !!merged.themeSidebarEnabled;
    merged.panelOpacityEnabled = !!merged.panelOpacityEnabled;
    merged.layoutEditEnabled = !!merged.layoutEditEnabled;
    merged.layoutWheelAdjustEnabled = !!merged.layoutWheelAdjustEnabled;
    merged.layoutTrackFillEnabled = !!merged.layoutTrackFillEnabled;
    merged.layoutSliderSkinEnabled = !!merged.layoutSliderSkinEnabled;
    merged.layoutAdvancedControlsEnabled = !!merged.layoutAdvancedControlsEnabled;
    merged.layoutEmbedAlignmentLock = !!merged.layoutEmbedAlignmentLock;
    merged.codeSyntaxHighlightEnabled = !!merged.codeSyntaxHighlightEnabled;
    merged.uiMatchThemeEnabled = !!merged.uiMatchThemeEnabled;
    merged.panelPage = PANEL_PAGES.has(merged.panelPage) ? merged.panelPage : defaults.panelPage;
    merged.selectedThemePresetId = typeof merged.selectedThemePresetId === 'string' ? merged.selectedThemePresetId : defaults.selectedThemePresetId;

    merged.panelHidden = !!merged.panelHidden;
    merged.launcherHiddenUntilHover = !!merged.launcherHiddenUntilHover;
    merged.moveGuiDragEnabled = !!merged.moveGuiDragEnabled;
    merged.autoCheckUpdates = merged.autoCheckUpdates !== false;
    merged.updateRawUrl = typeof merged.updateRawUrl === 'string' ? merged.updateRawUrl.trim() : defaults.updateRawUrl;
    merged.panelLeft = Number.isFinite(merged.panelLeft) ? merged.panelLeft : null;
    merged.panelTop = Number.isFinite(merged.panelTop) ? merged.panelTop : null;

    return merged;
  }

  function applySettingUpdate(key, value) {
    if (COLOR_KEYS.includes(key)) {
      return sanitizeHexColor(value, defaults[key]);
    }
    if (Object.prototype.hasOwnProperty.call(NUMERIC_RANGES, key)) {
      const range = NUMERIC_RANGES[key];
      return clampNumber(value, range.min, range.max, defaults[key]);
    }
    if ([
      'featureThemeEnabled',
      'featureFontEnabled',
      'hideGptWarning',
      'themePageEnabled',
      'themeUserBubbleEnabled',
      'themeAssistantBubbleEnabled',
      'themeEmbedEnabled',
      'themeComposerEnabled',
      'themeSidebarEnabled',
      'panelOpacityEnabled',
      'layoutEditEnabled',
      'layoutWheelAdjustEnabled',
      'layoutTrackFillEnabled',
      'layoutSliderSkinEnabled',
      'layoutAdvancedControlsEnabled',
      'layoutEmbedAlignmentLock',
      'codeSyntaxHighlightEnabled',
      'uiMatchThemeEnabled',
      'autoCheckUpdates'
    ].includes(key)) {
      return !!value;
    }
    if (key === 'chatTextAlign') {
      return ['left', 'center', 'right'].includes(value) ? value : defaults.chatTextAlign;
    }
    if (key === 'chatFontFamily') {
      return sanitizeFontFamily(value);
    }
    if (key === 'panelPage') {
      return PANEL_PAGES.has(value) ? value : defaults.panelPage;
    }
    if (key === 'updateRawUrl') {
      return typeof value === 'string' ? value.trim() : defaults.updateRawUrl;
    }
    return value;
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return normalizeSettings(null);
      return normalizeSettings(JSON.parse(raw));
    } catch {
      return normalizeSettings(null);
    }
  }

  function saveSettings() {
    settings = normalizeSettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function scheduleSaveSettings() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      saveSettings();
    }, 140);
  }

  function loadPrompts() {
    try {
      const raw = localStorage.getItem(PROMPTS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item, index) => normalizePrompt(item, `Prompt ${index + 1}`)).filter(Boolean);
    } catch {
      return [];
    }
  }

  function savePrompts() {
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
  }

  function getThemeSnapshotFromSettings(sourceSettings = settings) {
    const snapshot = {};
    THEME_SETTING_KEYS.forEach((key) => {
      snapshot[key] = sourceSettings[key];
    });
    return snapshot;
  }

  function normalizeThemeSnapshot(input) {
    const current = normalizeSettings(settings);
    const merged = normalizeSettings({ ...current, ...(input || {}) });
    return getThemeSnapshotFromSettings(merged);
  }

  function renderColorControl(key) {
    const colorValue = sanitizeHexColor(settings[key], defaults[key]);
    return `
      <span class="rabbit-color-control">
        <input type="color" data-key="${key}" value="${escapeHtml(colorValue)}">
        <input
          type="text"
          class="rabbit-color-hex"
          data-color-text-key="${key}"
          value="${escapeHtml(colorValue)}"
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
          placeholder="#RRGGBB"
        >
      </span>
    `;
  }

  function syncColorControls(panel, key, value) {
    const normalized = sanitizeHexColor(value, defaults[key]);
    panel.querySelectorAll(`input[type="color"][data-key="${key}"]`).forEach((input) => {
      if (input instanceof HTMLInputElement) input.value = normalized;
    });
    panel.querySelectorAll(`input[data-color-text-key="${key}"]`).forEach((input) => {
      if (input instanceof HTMLInputElement) input.value = normalized;
    });
  }

  function loadSavedThemes() {
    try {
      const raw = localStorage.getItem(SAVED_THEMES_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item, index) => {
          if (!item || typeof item !== 'object') return null;
          const name = String(item.name || `Saved Theme ${index + 1}`).trim().slice(0, 64);
          if (!name) return null;
          const id = typeof item.id === 'string' && item.id.trim()
            ? item.id.trim()
            : `saved_${Date.now()}_${Math.random().toString(16).slice(2)}`;
          return { id, name, theme: normalizeThemeSnapshot(item.theme || item.settings || {}) };
        })
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  function saveSavedThemes() {
    localStorage.setItem(SAVED_THEMES_KEY, JSON.stringify(savedThemes));
  }

  function getThemePresets() {
    const builtins = BUILTIN_THEME_PRESETS.map((item) => ({
      id: item.id,
      name: item.name,
      source: 'builtin',
      theme: normalizeThemeSnapshot(item.theme || {})
    }));
    const customs = savedThemes.map((item) => ({
      id: item.id,
      name: item.name,
      source: 'saved',
      theme: normalizeThemeSnapshot(item.theme || {})
    }));
    return [...builtins, ...customs];
  }

  function getThemePresetById(presetId) {
    if (!presetId) return null;
    return getThemePresets().find((item) => item.id === presetId) || null;
  }

  function derivePanelUiColorsFromTheme(theme) {
    const safeTheme = normalizeThemeSnapshot(theme || {});
    return {
      panelUiBg: safeTheme.sidebarBg,
      panelUiBubble: safeTheme.assistantBubbleBg,
      panelUiFont: safeTheme.pageText,
      panelUiOutline: safeTheme.sidebarHover,
      panelUiButton: safeTheme.userBubbleBg
    };
  }

  function getActiveThemeSnapshot() {
    return getThemeSnapshotFromSettings(settings);
  }

  function applyThemePresetToSettings(themePreset) {
    if (!themePreset || !themePreset.theme) return false;
    const normalizedTheme = normalizeThemeSnapshot(themePreset.theme);
    const nextSettings = { ...settings, ...normalizedTheme, selectedThemePresetId: themePreset.id };
    if (settings.uiMatchThemeEnabled) {
      Object.assign(nextSettings, derivePanelUiColorsFromTheme(normalizedTheme));
    }
    settings = normalizeSettings(nextSettings);
    return true;
  }

  function renderThemeSelect(panel, selectedId = '') {
    const select = panel.querySelector('[data-role="theme-select"]');
    if (!(select instanceof HTMLSelectElement)) return;
    const presets = getThemePresets();
    const savedSet = new Set(savedThemes.map((item) => item.id));
    const selectedThemeId = selectedId || settings.selectedThemePresetId || defaults.selectedThemePresetId;
    select.innerHTML = '';
    presets.forEach((preset) => {
      const option = document.createElement('option');
      option.value = preset.id;
      const suffix = savedSet.has(preset.id) ? ' (Saved)' : ' (Preset)';
      option.textContent = `${preset.name}${suffix}`;
      if (selectedThemeId === preset.id) option.selected = true;
      select.appendChild(option);
    });
    if (!select.value && presets[0]) {
      select.value = presets[0].id;
    }
  }

  function normalizePrompt(item, fallbackTitle) {
    if (!item) return null;

    const rawText = typeof item === 'string'
      ? item
      : (item.text ?? item.prompt ?? item.value ?? '');
    const text = String(rawText || '').trim();
    if (!text) return null;

    const rawTitle = typeof item === 'object'
      ? (item.title ?? item.name ?? item.label)
      : '';
    const title = String(rawTitle || fallbackTitle || text.split('\n')[0] || 'Prompt').trim().slice(0, 80);

    const id = typeof item === 'object' && item.id
      ? String(item.id)
      : `p_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const favorite = typeof item === 'object' ? !!item.favorite : false;
    const pinned = typeof item === 'object' ? !!item.pinned : false;
    const type = typeof item === 'object' && (item.type === 'ai' || item.type === 'user')
      ? item.type
      : 'user';
    const createdAt = typeof item === 'object' && typeof item.createdAt === 'string'
      ? item.createdAt
      : new Date().toISOString();
    const rawTags = typeof item === 'object' ? item.tags : [];
    const tags = Array.isArray(rawTags)
      ? rawTags.map((tag) => String(tag || '').trim().toLowerCase()).filter(Boolean).slice(0, 24)
      : String(rawTags || '').split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 24);
    const expanded = typeof item === 'object' ? !!item.expanded : false;

    return { id, title, text, favorite, pinned, type, createdAt, tags, expanded };
  }

  function parseTagsInput(input) {
    return String(input || '')
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 24);
  }

  function showNotification(message) {
    const text = String(message || '').trim();
    if (!text) return;
    let toast = document.getElementById('rabbit-global-notification');
    if (!(toast instanceof HTMLElement)) {
      toast = document.createElement('div');
      toast.id = 'rabbit-global-notification';
      toast.style.cssText = `
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 2147483646;
        max-width: min(420px, calc(100vw - 24px));
        padding: 10px 12px;
        border-radius: 10px;
        background: var(--rabbit-panel-bubble, #002b1b);
        color: var(--rabbit-panel-font, #00ff75);
        border: 1px solid var(--rabbit-panel-outline, #00fddf);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        font: 12px/1.4 system-ui, sans-serif;
        pointer-events: none;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 160ms ease, transform 160ms ease;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    if (notificationTimer) clearTimeout(notificationTimer);
    notificationTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(6px)';
    }, 1700);
  }

  function createDialogo({ message, type = 'alert', title = 'Notice', actions = null } = {}) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 2147483647;
        background: rgba(0,0,0,0.55);
        display: flex; align-items: center; justify-content: center;
        padding: 16px;
      `;

      const card = document.createElement('div');
      card.style.cssText = `
        background: var(--rabbit-panel-bg, #000900);
        color: var(--rabbit-panel-font, #00ff75);
        border: 1px solid var(--rabbit-panel-outline, #00fddf);
        border-radius: 12px;
        padding: 20px;
        max-width: 420px;
        width: 100%;
        font: 13px/1.4 system-ui, sans-serif;
        box-shadow: 0 16px 44px rgba(0,0,0,0.5);
      `;
      card.onclick = (event) => event.stopPropagation();

      const titleEl = document.createElement('div');
      titleEl.style.cssText = 'font-weight: 700; font-size: 14px; margin-bottom: 10px;';
      titleEl.textContent = title;

      const msgEl = document.createElement('p');
      msgEl.style.cssText = 'margin: 0 0 16px 0; opacity: 0.88; font-size: 12px; line-height: 1.5;';
      msgEl.textContent = String(message || '');

      const footer = document.createElement('div');
      footer.style.cssText = 'display: flex; gap: 8px; justify-content: flex-end;';

      const close = (value) => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 180);
        resolve(value);
      };

      overlay.addEventListener('click', () => close(false));

      const buttons = actions || (type === 'confirm'
        ? [
            { label: 'Cancel', style: 'secondary', value: false },
            { label: 'Confirm', style: 'primary', value: true }
          ]
        : [{ label: 'OK', style: 'primary', value: true }]);

      buttons.forEach((btn) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.textContent = btn.label;
        el.style.cssText = `
          appearance: none;
          border: 1px solid var(--rabbit-panel-outline, #00fddf);
          background: ${btn.style === 'primary'
            ? 'var(--rabbit-panel-btn, #0a6600)'
            : btn.style === 'danger'
            ? '#6b0000'
            : 'transparent'};
          color: var(--rabbit-panel-font, #00ff75);
          border-radius: 8px;
          padding: 6px 14px;
          cursor: pointer;
          font-size: 12px;
          min-height: 28px;
        `;
        el.onclick = () => close(btn.value !== undefined ? btn.value : true);
        footer.appendChild(el);
      });

      card.appendChild(titleEl);
      card.appendChild(msgEl);
      card.appendChild(footer);
      overlay.appendChild(card);
      document.body.appendChild(overlay);

      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 180ms ease';
      requestAnimationFrame(() => { overlay.style.opacity = '1'; });
      setTimeout(() => footer.lastChild?.focus(), 50);
    });
  }

  function createCustomTooltip(el, text, position = 'top') {
    if (!el || !text || el.dataset.rabbitTooltipBound === '1') return;
    el.dataset.rabbitTooltipBound = '1';

    const show = () => {
      el._tooltipEl?.remove();
      const tip = document.createElement('div');
      tip.style.cssText = `
        position: fixed;
        z-index: 2147483646;
        background: var(--rabbit-panel-bubble, #002b1b);
        color: var(--rabbit-panel-font, #00ff75);
        border: 1px solid var(--rabbit-panel-outline, #00fddf);
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 11px;
        line-height: 1.3;
        max-width: 220px;
        pointer-events: none;
        white-space: pre-wrap;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        opacity: 0;
        transition: opacity 120ms ease;
      `;
      tip.textContent = typeof text === 'object' ? (text.text || '') : text;
      document.body.appendChild(tip);
      el._tooltipEl = tip;

      const margin = 6;
      const rect = el.getBoundingClientRect();
      const tw = tip.offsetWidth;
      const th = tip.offsetHeight;
      let top;
      let left;
      if (position === 'top') {
        top = rect.top - th - margin;
        left = rect.left + rect.width / 2 - tw / 2;
      } else if (position === 'bottom') {
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2 - tw / 2;
      } else if (position === 'left') {
        top = rect.top + rect.height / 2 - th / 2;
        left = rect.left - tw - margin;
      } else {
        top = rect.top + rect.height / 2 - th / 2;
        left = rect.right + margin;
      }

      left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
      top = Math.max(8, Math.min(top, window.innerHeight - th - 8));
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
      requestAnimationFrame(() => { tip.style.opacity = '1'; });
    };

    const hide = () => {
      if (el._tooltipEl) {
        el._tooltipEl.remove();
        el._tooltipEl = null;
      }
    };

    el.addEventListener('mouseenter', show);
    el.addEventListener('mouseleave', hide);
    el.addEventListener('mousedown', hide);
    el.addEventListener('focus', show);
    el.addEventListener('blur', hide);
  }

  function getAllPromptTags() {
    const tags = new Set();
    prompts.forEach((item) => {
      (item?.tags || []).forEach((tag) => tags.add(String(tag || '').trim().toLowerCase()));
    });
    return [...tags].sort((a, b) => a.localeCompare(b));
  }

  function importPromptsFromPayload(payload, sourceLabel = 'Imported Prompt') {
    const toAdd = [];

    if (Array.isArray(payload)) {
      payload.forEach((item, idx) => {
        const normalized = normalizePrompt(item, `${sourceLabel} ${idx + 1}`);
        if (normalized) toAdd.push(normalized);
      });
    } else if (payload && typeof payload === 'object') {
      if (Array.isArray(payload.prompts)) {
        payload.prompts.forEach((item, idx) => {
          const normalized = normalizePrompt(item, `${sourceLabel} ${idx + 1}`);
          if (normalized) toAdd.push(normalized);
        });
      } else {
        const normalized = normalizePrompt(payload, sourceLabel);
        if (normalized) toAdd.push(normalized);
      }
    } else if (typeof payload === 'string') {
      const text = payload.trim();
      if (text.includes('\n---\n')) {
        text.split('\n---\n').forEach((chunk, idx) => {
          const normalized = normalizePrompt(chunk.trim(), `${sourceLabel} ${idx + 1}`);
          if (normalized) toAdd.push(normalized);
        });
      } else {
        const normalized = normalizePrompt(text, sourceLabel);
        if (normalized) toAdd.push(normalized);
      }
    }

    if (!toAdd.length) return 0;
    prompts = [...prompts, ...toAdd];
    savePrompts();
    renderFloatingPinnedPrompts();
    return toAdd.length;
  }

  function exportPromptsAsJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: SCRIPT_VERSION,
      prompts: Array.isArray(prompts) ? prompts : []
    };
    const filename = `gpt-unleashed-prompts-${formatTimestampForFilename(new Date())}.json`;
    downloadTextFile(filename, JSON.stringify(payload, null, 2), 'application/json');
  }

  function filterPromptsBySearch(query, mode, activeTags = []) {
    const normalizedQuery = String(query || '').trim().toLowerCase();
    const normalizedMode = mode === 'favorites' ? 'favorites' : 'all';
    const normalizedTags = Array.isArray(activeTags)
      ? activeTags.map((tag) => String(tag || '').trim().toLowerCase()).filter(Boolean)
      : [];
    const source = normalizedMode === 'favorites' ? getFavoritePrompts() : prompts;
    return source.filter((item) => {
      const title = String(item?.title || '').toLowerCase();
      const text = String(item?.text || '').toLowerCase();
      const tags = Array.isArray(item?.tags) ? item.tags.map((tag) => String(tag || '').toLowerCase()) : [];
      const queryMatch = !normalizedQuery || title.includes(normalizedQuery) || text.includes(normalizedQuery) || tags.some((tag) => tag.includes(normalizedQuery));
      const tagMatch = !normalizedTags.length || normalizedTags.every((tag) => tags.includes(tag));
      return queryMatch && tagMatch;
    });
  }

  function setPendingPrompt(text) {
    if (!text) return;
    sessionStorage.setItem(PENDING_PROMPT_KEY, JSON.stringify({
      text: String(text),
      createdAt: Date.now()
    }));
  }

  function getPendingPromptText() {
    const raw = sessionStorage.getItem(PENDING_PROMPT_KEY);
    if (!raw) return '';

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.text !== 'string') {
        sessionStorage.removeItem(PENDING_PROMPT_KEY);
        return '';
      }

      const createdAt = Number(parsed.createdAt);
      if (Number.isFinite(createdAt) && (Date.now() - createdAt) > PENDING_PROMPT_MAX_AGE_MS) {
        sessionStorage.removeItem(PENDING_PROMPT_KEY);
        return '';
      }

      return parsed.text.trim();
    } catch {
      // Drop legacy raw-string pending prompts to avoid stale auto-inserts on later visits.
      sessionStorage.removeItem(PENDING_PROMPT_KEY);
      return '';
    }
  }

  function clearPendingPrompt() {
    sessionStorage.removeItem(PENDING_PROMPT_KEY);
  }

  function consumePendingPromptIfReady(inputs) {
    const pending = getPendingPromptText();
    if (!pending) return;
    for (const input of inputs) {
      if (insertPromptIntoComposer(pending, input)) {
        clearPendingPrompt();
        break;
      }
    }
  }

  function insertPromptIntoComposer(text, preferredInput = null) {
    const inputs = preferredInput ? [preferredInput] : getComposerInputCandidates();
    for (const input of inputs) {
      if (!(input instanceof HTMLElement)) continue;
      if (input.matches('textarea')) {
        input.value = text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
        return true;
      }
      if (input.getAttribute('contenteditable') === 'true') {
        input.textContent = text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
        return true;
      }
    }
    return false;
  }

  function findNewChatTrigger() {
    const selectors = [
      'button[aria-label="New chat"]',
      'a[aria-label="New chat"]',
      '[data-testid="new-chat-button"]',
      'nav a[href="/"]',
      'nav a[href="/?"]',
      'nav a[href="/?model="]'
    ];
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      if (node instanceof HTMLElement) return node;
    }

    const candidates = [...document.querySelectorAll('a, button')];
    return candidates.find((node) => {
      if (!(node instanceof HTMLElement)) return false;
      const text = (node.textContent || '').toLowerCase();
      return text.includes('new chat') || text.includes('new conversation');
    }) || null;
  }

  function startNewChatWithPrompt(text) {
    if (!text) return;
    setPendingPrompt(text);

    const trigger = findNewChatTrigger();
    if (trigger) {
      trigger.click();
      scheduleRefresh(200);
      return;
    }

    const target = `${location.origin}/`;
    location.href = target;
  }

  function renderPromptsList(panel) {
    const list = panel.querySelector('[data-role="prompt-list"]');
    if (!list) return;

    list.innerHTML = '';

    if (!prompts.length) {
      const empty = document.createElement('div');
      empty.className = 'rabbit-note';
      empty.textContent = 'No saved prompts yet.';
      list.appendChild(empty);
      return;
    }

    const sections = [
      { key: 'pinned', label: 'Pinned Prompts', items: prompts.filter((item) => item?.pinned) },
      { key: 'user', label: 'User Prompts', items: prompts.filter((item) => item && item.type !== 'ai') },
      { key: 'ai', label: 'AI Prompts', items: prompts.filter((item) => item?.type === 'ai') }
    ];

    sections.forEach((section) => {
      if (!section.items.length) return;
      const heading = document.createElement('div');
      heading.className = 'rabbit-prompt-section-title';
      heading.textContent = `${section.label} (${section.items.length})`;
      list.appendChild(heading);

      section.items.forEach((prompt) => {
      const item = document.createElement('div');
      item.className = 'rabbit-prompt-item';
      if (prompt.pinned) item.classList.add('is-pinned');

      const title = document.createElement('div');
      title.className = 'rabbit-prompt-title';
      title.textContent = prompt.title;

      const snippet = document.createElement('div');
      snippet.className = 'rabbit-prompt-snippet';
      const isExpanded = !!prompt.expanded;
      snippet.textContent = isExpanded ? prompt.text : (prompt.text.length > 160 ? `${prompt.text.slice(0, 160)}…` : prompt.text);

      const tags = document.createElement('div');
      tags.className = 'rabbit-prompt-tags';
      if (Array.isArray(prompt.tags) && prompt.tags.length) {
        tags.textContent = `Tags: ${prompt.tags.join(', ')}`;
      }

      const actions = document.createElement('div');
      actions.className = 'rabbit-prompt-actions';

      const insertBtn = document.createElement('button');
      insertBtn.type = 'button';
      insertBtn.dataset.action = 'prompt-insert';
      insertBtn.dataset.promptId = prompt.id;
      insertBtn.textContent = 'Insert';

      const newChatBtn = document.createElement('button');
      newChatBtn.type = 'button';
      newChatBtn.dataset.action = 'prompt-new-chat';
      newChatBtn.dataset.promptId = prompt.id;
      newChatBtn.textContent = 'New Chat';

      const favoriteBtn = document.createElement('button');
      favoriteBtn.type = 'button';
      favoriteBtn.dataset.action = 'prompt-favorite-toggle';
      favoriteBtn.dataset.promptId = prompt.id;
      favoriteBtn.textContent = prompt.favorite ? '★ Favorite' : '☆ Favorite';

      const pinBtn = document.createElement('button');
      pinBtn.type = 'button';
      pinBtn.dataset.action = 'prompt-pin-toggle';
      pinBtn.dataset.promptId = prompt.id;
      pinBtn.textContent = prompt.pinned ? 'Unpin' : 'Pin';

      const reviewBtn = document.createElement('button');
      reviewBtn.type = 'button';
      reviewBtn.dataset.action = 'prompt-review';
      reviewBtn.dataset.promptId = prompt.id;
      reviewBtn.textContent = 'Review';
      const expandBtn = document.createElement('button');
      expandBtn.type = 'button';
      expandBtn.dataset.action = 'prompt-expand-toggle';
      expandBtn.dataset.promptId = prompt.id;
      expandBtn.textContent = isExpanded ? 'Collapse' : 'Expand';

      const enhanceBtn = document.createElement('button');
      enhanceBtn.type = 'button';
      enhanceBtn.dataset.action = 'prompt-enhance';
      enhanceBtn.dataset.promptId = prompt.id;
      enhanceBtn.textContent = 'Enhance with AI';

      actions.appendChild(insertBtn);
      actions.appendChild(newChatBtn);
      actions.appendChild(favoriteBtn);
      actions.appendChild(pinBtn);
      actions.appendChild(reviewBtn);
      actions.appendChild(expandBtn);
      actions.appendChild(enhanceBtn);

      item.appendChild(title);
      item.appendChild(snippet);
      item.appendChild(tags);
      item.appendChild(actions);
      list.appendChild(item);
      });
    });
    applyCustomTooltips(panel);

    panel.querySelectorAll('.rabbit-prompt-actions button').forEach((btn) => {
      if (!(btn instanceof HTMLButtonElement)) return;
      const action = btn.dataset.action;
      const tips = {
        'prompt-insert': 'Insert into composer',
        'prompt-new-chat': 'Start new chat with this prompt',
        'prompt-favorite-toggle': 'Toggle favorite',
        'prompt-pin-toggle': 'Pin to floating card',
        'prompt-review': 'Review full prompt',
        'prompt-expand-toggle': 'Expand/collapse',
        'prompt-enhance': 'Enhance with AI'
      };
      if (tips[action]) createCustomTooltip(btn, tips[action], 'top');
    });
  }

  function loadGlobalFiles() {
    try {
      const parsed = JSON.parse(localStorage.getItem(GLOBAL_FILES_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveGlobalFiles(files) {
    localStorage.setItem(GLOBAL_FILES_KEY, JSON.stringify(Array.isArray(files) ? files : []));
  }

  function renderGlobalFilesList(panel) {
    const list = panel.querySelector('#rabbit-global-files-list');
    if (!(list instanceof HTMLElement)) return;
    const stored = loadGlobalFiles();
    if (!stored.length) {
      list.textContent = 'No files attached.';
      return;
    }
    list.innerHTML = '';
    stored.forEach((file) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:6px;margin:3px 0;font-size:11px;';
      row.innerHTML = `<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${escapeHtml(file.name || 'file')}</span>`;
      const del = document.createElement('button');
      del.type = 'button';
      del.textContent = '✕';
      del.style.cssText = 'flex-shrink:0;font-size:10px;padding:2px 5px;';
      del.onclick = async () => {
        const ok = await createDialogo({
          message: `Remove "${file.name || 'this file'}"?`,
          type: 'confirm',
          title: 'Remove File'
        });
        if (!ok) return;
        const updated = loadGlobalFiles().filter((item) => item.id !== file.id);
        saveGlobalFiles(updated);
        renderGlobalFilesList(panel);
        showNotification(`Removed "${file.name || 'file'}".`);
      };
      row.appendChild(del);
      list.appendChild(row);
    });
  }

  function buildPromptEnhanceInstruction(promptText) {
    const source = String(promptText || '').trim();
    if (!source) return '';
    return [
      'Please improve the following prompt for clarity, specificity, and output quality.',
      'Return only the improved prompt text (no explanation).',
      '',
      '--- ORIGINAL PROMPT ---',
      source
    ].join('\n');
  }

  function getPrimaryComposerInput() {
    const inputs = getComposerInputCandidates();
    return inputs.length ? inputs[0] : null;
  }

  function getComposerDraftText(input) {
    if (input instanceof HTMLTextAreaElement) {
      return String(input.value || '').trim();
    }
    if (input instanceof HTMLElement && input.getAttribute('contenteditable') === 'true') {
      return String(input.textContent || '').trim();
    }
    return '';
  }

  function getFavoritePrompts() {
    return prompts.filter((item) => item && item.favorite);
  }

  function formatPromptTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown time';
    return date.toLocaleString();
  }

  function renderFloatingPinnedPrompts() {
    document.querySelectorAll('.rabbit-prompt-float').forEach((node) => node.remove());
    const pinned = prompts.filter((item) => item?.pinned);
    if (!pinned.length) return;

    pinned.forEach((prompt, index) => {
      const card = document.createElement('div');
      card.className = 'rabbit-prompt-float';
      card.dataset.promptId = prompt.id;
      card.style.top = `${80 + (index * 170)}px`;
      card.style.right = '16px';
      card.innerHTML = `
        <div class="rabbit-prompt-float-head">
          <strong>${escapeHtml(prompt.title)}</strong>
          <button type="button" data-action="float-hide" data-prompt-id="${escapeHtml(prompt.id)}">Hide</button>
        </div>
        <div class="rabbit-prompt-float-body">${escapeHtml(prompt.text.length > 200 ? `${prompt.text.slice(0, 200)}…` : prompt.text)}</div>
        <div class="rabbit-prompt-float-actions">
          <button type="button" data-action="float-prev" data-prompt-id="${escapeHtml(prompt.id)}">Previous</button>
          <button type="button" data-action="float-next" data-prompt-id="${escapeHtml(prompt.id)}">Next</button>
          <button type="button" data-action="float-review" data-prompt-id="${escapeHtml(prompt.id)}">Review</button>
          <button type="button" data-action="float-unpin" data-prompt-id="${escapeHtml(prompt.id)}">Unpin</button>
        </div>
      `;
      document.body.appendChild(card);
      makeFloatingPromptDraggable(card, card.querySelector('.rabbit-prompt-float-head'));
    });
  }

  function refreshPromptViews() {
    const panel = document.getElementById(PANEL_ID);
    if (panel instanceof HTMLElement) {
      renderPromptsList(panel);
      renderGlobalFilesList(panel);
    }
    renderFloatingPinnedPrompts();
  }

  function openPromptReviewModal(promptItem) {
    if (!promptItem) return;
    document.querySelectorAll('.rabbit-prompt-review-overlay').forEach((node) => node.remove());
    const overlay = document.createElement('div');
    overlay.className = 'rabbit-prompt-review-overlay';
    overlay.innerHTML = `
      <div class="rabbit-prompt-review-card">
        <div class="rabbit-prompt-review-head">
          <strong>${escapeHtml(promptItem.title)}</strong>
          <div style="display:flex;gap:6px;">
            <button type="button" data-action="prompt-review-insert" data-prompt-id="${escapeHtml(promptItem.id)}">Insert</button>
            <button type="button" data-action="prompt-review-close">Close</button>
          </div>
        </div>
        <div class="rabbit-prompt-review-meta">
          <span>Type: ${escapeHtml(promptItem.type || 'user')}</span>
          <span>Created: ${escapeHtml(formatPromptTime(promptItem.createdAt))}</span>
        </div>
        <pre class="rabbit-prompt-review-text">${escapeHtml(promptItem.text || '')}</pre>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function bindFloatingPromptEvents() {
    if (floatingPromptEventsBound) return;
    floatingPromptEventsBound = true;
    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.classList.contains('rabbit-prompt-review-overlay')) {
        target.remove();
        return;
      }
      const btn = target.closest('button[data-action^="float-"], button[data-action="prompt-review-close"], button[data-action="prompt-review-insert"]');
      if (!(btn instanceof HTMLButtonElement)) return;
      const action = btn.dataset.action || '';
      if (action === 'prompt-review-close') {
        btn.closest('.rabbit-prompt-review-overlay')?.remove();
        return;
      }
      if (action === 'prompt-review-insert') {
        const pid = btn.dataset.promptId || '';
        const item = prompts.find((prompt) => prompt.id === pid);
        if (item && insertPromptIntoComposer(item.text)) {
          btn.closest('.rabbit-prompt-review-overlay')?.remove();
        }
        return;
      }
      const promptId = btn.dataset.promptId || '';
      const pinned = prompts.filter((item) => item?.pinned);
      if (!pinned.length) return;
      const idx = pinned.findIndex((item) => item.id === promptId);
      const currentIndex = idx >= 0 ? idx : 0;
      if (action === 'float-hide') {
        const card = btn.closest('.rabbit-prompt-float');
        if (card instanceof HTMLElement) card.style.display = 'none';
        return;
      }
      if (action === 'float-unpin') {
        prompts = prompts.map((item) => item.id === promptId ? { ...item, pinned: false } : item);
        savePrompts();
        refreshPromptViews();
        return;
      }
      if (action === 'float-review') {
        const promptItem = prompts.find((item) => item.id === promptId);
        openPromptReviewModal(promptItem);
        return;
      }
      if (action === 'float-next' || action === 'float-prev') {
        const nextIndex = action === 'float-next'
          ? (currentIndex + 1) % pinned.length
          : (currentIndex - 1 + pinned.length) % pinned.length;
        const nextPrompt = pinned[nextIndex];
        if (!nextPrompt) return;
        const targetCard = document.querySelector(`.rabbit-prompt-float[data-prompt-id="${nextPrompt.id}"]`);
        if (targetCard instanceof HTMLElement) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          targetCard.style.outline = '2px solid var(--rabbit-panel-outline)';
          setTimeout(() => {
            targetCard.style.outline = '';
          }, 800);
        } else {
          openPromptReviewModal(nextPrompt);
        }
      }
    });
  }

  function closeComposerPromptMenus() {
    document.querySelectorAll('.rabbit-composer-prompt-menu').forEach((menu) => {
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('.rabbit-composer-code-btn[aria-expanded="true"]').forEach((btn) => {
      btn.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.rabbit-composer-prompt-overlay').forEach((overlay) => overlay.remove());
  }

  function openPromptEditorPanel() {
    const panel = makePanel();
    if (!(panel instanceof HTMLElement)) return;
    settings.panelHidden = false;
    setActivePage(panel, 'prompts');
    updatePanelHiddenState(panel);
    saveSettings();
  }

  function openComposerPromptExplorer(input, mode = 'all') {
    closeComposerPromptMenus();

    const overlay = document.createElement('div');
    overlay.className = 'rabbit-composer-prompt-overlay';
    overlay.innerHTML = `
      <div class="rabbit-composer-prompt-dialog" role="dialog" aria-modal="true" aria-label="Prompt explorer">
        <div class="rabbit-composer-prompt-header">
          <strong>Prompt Explorer</strong>
          <button type="button" data-action="composer-explorer-close">Close</button>
        </div>
        <div class="rabbit-composer-prompt-toolbar">
          <input type="search" data-role="composer-explorer-search" placeholder="Search prompts by title or text...">
          <input type="text" data-role="composer-explorer-tag-filter" placeholder="Filter tags (comma-separated)">
          <div class="rabbit-composer-prompt-actions-inline">
            <button type="button" data-action="composer-explorer-expand-all">Expand</button>
            <button type="button" data-action="composer-explorer-toggle-favorites">Favorites</button>
            <button type="button" data-action="composer-explorer-import">Import</button>
            <button type="button" data-action="composer-explorer-export">Export</button>
            <button type="button" data-action="composer-explorer-create">Create</button>
            <button type="button" data-action="composer-explorer-enhance-draft">Enhance Draft</button>
          </div>
        </div>
        <div class="rabbit-composer-prompt-results" data-role="composer-explorer-results"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const searchInput = overlay.querySelector('[data-role="composer-explorer-search"]');
    const tagInput = overlay.querySelector('[data-role="composer-explorer-tag-filter"]');
    const results = overlay.querySelector('[data-role="composer-explorer-results"]');
    let activeMode = mode === 'favorites' ? 'favorites' : 'all';
    let expandedAll = false;

    const renderResults = () => {
      if (!(results instanceof HTMLElement)) return;
      const query = searchInput instanceof HTMLInputElement ? searchInput.value : '';
      const tagFilters = tagInput instanceof HTMLInputElement ? parseTagsInput(tagInput.value) : [];
      const filtered = filterPromptsBySearch(query, activeMode, tagFilters);
      results.innerHTML = '';
      if (!filtered.length) {
        const empty = document.createElement('div');
        empty.className = 'rabbit-composer-menu-empty';
        empty.textContent = 'No prompts matched your search.';
        results.appendChild(empty);
        return;
      }
      filtered.forEach((prompt) => {
        const row = document.createElement('div');
        row.className = 'rabbit-composer-prompt-result';
        row.innerHTML = `
          <div class="rabbit-composer-prompt-result-text">
            <div class="rabbit-composer-prompt-result-title"></div>
            <div class="rabbit-composer-prompt-result-snippet"></div>
            <div class="rabbit-composer-prompt-result-tags"></div>
          </div>
          <div class="rabbit-composer-prompt-result-actions">
            <button type="button" data-action="composer-explorer-insert" data-prompt-id="${escapeHtml(prompt.id)}">Insert</button>
            <button type="button" data-action="composer-explorer-new-chat" data-prompt-id="${escapeHtml(prompt.id)}">New Chat</button>
            <button type="button" data-action="composer-explorer-enhance-item" data-prompt-id="${escapeHtml(prompt.id)}">Enhance</button>
          </div>
        `;
        const titleNode = row.querySelector('.rabbit-composer-prompt-result-title');
        const snippetNode = row.querySelector('.rabbit-composer-prompt-result-snippet');
        const tagsNode = row.querySelector('.rabbit-composer-prompt-result-tags');
        if (titleNode) titleNode.textContent = prompt.title;
        if (snippetNode) snippetNode.textContent = expandedAll ? prompt.text : (prompt.text.length > 160 ? `${prompt.text.slice(0, 160)}…` : prompt.text);
        if (tagsNode) tagsNode.textContent = Array.isArray(prompt.tags) && prompt.tags.length ? `#${prompt.tags.join(' #')}` : '';
        results.appendChild(row);
      });
    };

    overlay.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target === overlay) {
        overlay.remove();
        return;
      }
      const btn = target.closest('button[data-action]');
      if (!(btn instanceof HTMLButtonElement)) return;
      const action = btn.dataset.action;
      if (action === 'composer-explorer-close') {
        overlay.remove();
        return;
      }
      if (action === 'composer-explorer-toggle-favorites') {
        activeMode = activeMode === 'favorites' ? 'all' : 'favorites';
        btn.textContent = activeMode === 'favorites' ? 'All' : 'Favorites';
        renderResults();
        return;
      }
      if (action === 'composer-explorer-expand-all') {
        expandedAll = !expandedAll;
        btn.textContent = expandedAll ? 'Collapse' : 'Expand';
        renderResults();
        return;
      }
      if (action === 'composer-explorer-export') {
        exportPromptsAsJson();
        showNotification('Prompts exported successfully.');
        return;
      }
      if (action === 'composer-explorer-create') {
        overlay.remove();
        openPromptEditorPanel();
        return;
      }
      if (action === 'composer-explorer-enhance-draft') {
        const draft = getComposerDraftText(input);
        const enhancedInstruction = buildPromptEnhanceInstruction(draft);
        if (!enhancedInstruction) return;
        insertPromptIntoComposer(enhancedInstruction, input);
        overlay.remove();
        return;
      }
      if (action === 'composer-explorer-import') {
        const picker = document.createElement('input');
        picker.type = 'file';
        picker.accept = '.txt,.json';
        picker.addEventListener('change', () => {
          const file = picker.files && picker.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            let payload = result;
            try { payload = JSON.parse(result); } catch { /* plain text */ }
            const added = importPromptsFromPayload(payload, file.name || 'Imported Prompt');
            if (added) showNotification(`Imported ${added} prompt(s).`);
            renderResults();
          };
          reader.readAsText(file);
        }, { once: true });
        picker.click();
        return;
      }
      if (action === 'composer-explorer-insert') {
        const promptItem = prompts.find((item) => item.id === btn.dataset.promptId);
        if (!promptItem) return;
        insertPromptIntoComposer(promptItem.text, input);
        overlay.remove();
        return;
      }
      if (action === 'composer-explorer-new-chat') {
        const promptItem = prompts.find((item) => item.id === btn.dataset.promptId);
        if (!promptItem) return;
        overlay.remove();
        startNewChatWithPrompt(promptItem.text);
        return;
      }
      if (action === 'composer-explorer-enhance-item') {
        const promptItem = prompts.find((item) => item.id === btn.dataset.promptId);
        if (!promptItem) return;
        const enhancedInstruction = buildPromptEnhanceInstruction(promptItem.text);
        if (!enhancedInstruction) return;
        insertPromptIntoComposer(enhancedInstruction, input);
        overlay.remove();
      }
    });

    if (searchInput instanceof HTMLInputElement) {
      searchInput.addEventListener('input', renderResults);
      setTimeout(() => searchInput.focus(), 10);
    }
    if (tagInput instanceof HTMLInputElement) {
      const allTags = getAllPromptTags();
      if (allTags.length) {
        tagInput.title = `Available tags: ${allTags.join(', ')}`;
      }
      tagInput.addEventListener('input', renderResults);
    }
    renderResults();
  }

  function buildComposerPromptMenu(menu, mode, input, nativePlusBtn = null) {
    if (!(menu instanceof HTMLElement)) return;
    menu.innerHTML = '';

    const makeActionButton = (label, action, promptId = '') => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rabbit-composer-menu-item';
      btn.dataset.action = action;
      if (promptId) btn.dataset.promptId = promptId;
      btn.textContent = label;
      return btn;
    };

    const normalizedMode = mode === 'all' ? 'all' : mode === 'favorites' ? 'favorites' : 'all';

    const toggleBtnLabel = normalizedMode === 'favorites'
      ? 'View All Prompts'
      : 'View Favorite Prompts';
    const toggleBtnAction = normalizedMode === 'favorites'
      ? 'composer-menu-all'
      : 'composer-menu-favorites';
    menu.appendChild(makeActionButton(toggleBtnLabel, toggleBtnAction));
    if (nativePlusBtn instanceof HTMLElement) {
      menu.appendChild(makeActionButton('Open File/Tool Menu (+)', 'composer-menu-native-plus'));
    }

    const source = normalizedMode === 'favorites' ? getFavoritePrompts() : prompts;
    const listWrap = document.createElement('div');
    listWrap.className = 'rabbit-composer-menu-list';

    if (!source.length) {
      const empty = document.createElement('div');
      empty.className = 'rabbit-composer-menu-empty';
      empty.textContent = normalizedMode === 'favorites' ? 'No favorite prompts yet.' : 'No saved prompts yet.';
      listWrap.appendChild(empty);
    } else {
      source.slice(0, 18).forEach((prompt) => {
        const btn = makeActionButton(prompt.title, 'composer-menu-insert', prompt.id);
        btn.title = prompt.text;
        listWrap.appendChild(btn);
      });
    }
    menu.appendChild(listWrap);
    menu.appendChild(makeActionButton('Search / Expand Prompt List', 'composer-menu-explore'));
    menu.appendChild(makeActionButton('Create New Prompt', 'composer-menu-create'));
    menu.appendChild(makeActionButton('Enhance Current Prompt with AI', 'composer-menu-enhance'));
    menu.appendChild(makeActionButton('Export Prompts (JSON)', 'composer-menu-export'));
    menu.appendChild(makeActionButton('Import Prompts (File)', 'composer-menu-import'));

    menu.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'composer-menu-favorites') {
          buildComposerPromptMenu(menu, 'favorites', input, nativePlusBtn);
          menu.classList.add('open');
          return;
        }
        if (action === 'composer-menu-all') {
          buildComposerPromptMenu(menu, 'all', input, nativePlusBtn);
          menu.classList.add('open');
          return;
        }
        if (action === 'composer-menu-create') {
          closeComposerPromptMenus();
          openPromptEditorPanel();
          return;
        }
        if (action === 'composer-menu-native-plus') {
          if (nativePlusBtn instanceof HTMLElement) {
            nativePlusBtn.dataset.rabbitBypassPromptMenu = '1';
            setTimeout(() => {
              delete nativePlusBtn.dataset.rabbitBypassPromptMenu;
            }, 220);
            nativePlusBtn.click();
          }
          closeComposerPromptMenus();
          return;
        }
        if (action === 'composer-menu-enhance') {
          const draft = getComposerDraftText(input);
          const enhancedInstruction = buildPromptEnhanceInstruction(draft);
          if (!enhancedInstruction) {
            closeComposerPromptMenus();
            return;
          }
          insertPromptIntoComposer(enhancedInstruction, input);
          closeComposerPromptMenus();
          return;
        }
        if (action === 'composer-menu-explore') {
          openComposerPromptExplorer(input, normalizedMode);
          return;
        }
        if (action === 'composer-menu-export') {
          exportPromptsAsJson();
          showNotification('Prompts exported successfully.');
          closeComposerPromptMenus();
          return;
        }
        if (action === 'composer-menu-import') {
          const picker = document.createElement('input');
          picker.type = 'file';
          picker.accept = '.txt,.json';
          picker.addEventListener('change', () => {
            const file = picker.files && picker.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              const result = typeof reader.result === 'string' ? reader.result : '';
              let payload = result;
              try { payload = JSON.parse(result); } catch { /* plain text */ }
              const added = importPromptsFromPayload(payload, file.name || 'Imported Prompt');
              showNotification(`Imported ${added} prompt(s).`);
              buildComposerPromptMenu(menu, normalizedMode, input, nativePlusBtn);
              menu.classList.add('open');
            };
            reader.readAsText(file);
          }, { once: true });
          picker.click();
          return;
        }
        if (action === 'composer-menu-insert') {
          const promptId = btn.dataset.promptId;
          const promptItem = prompts.find((item) => item.id === promptId);
          if (!promptItem) return;
          insertPromptIntoComposer(promptItem.text, input);
          closeComposerPromptMenus();
        }
      });
    });
  }

  function findComposerAttachButton(shell) {
    if (!(shell instanceof HTMLElement)) return null;
    const candidates = [...shell.querySelectorAll('button, [role="button"]')].filter((node) => node instanceof HTMLElement);
    const isVisibleCandidate = (el) => {
      if (!(el instanceof HTMLElement)) return false;
      const elRect = el.getBoundingClientRect();
      return !(elRect.width === 0 && elRect.height === 0);
    };

    for (const el of candidates) {
      if (!(el instanceof HTMLElement)) continue;
      if (!isVisibleCandidate(el)) continue;
      const elRect = el.getBoundingClientRect();
      if (elRect.width === 0 && elRect.height === 0) continue;
      const text = (el.textContent || '').trim();
      const aria = ((el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || '')).toLowerCase();
      const dataTestId = (el.getAttribute('data-testid') || '').toLowerCase();
      const className = (el.className || '').toString().toLowerCase();
      if (
        text === '+'
        || /attach|upload|add file|plus/.test(aria)
        || /composer-plus|attach|upload|add-file/.test(dataTestId)
        || /composer-plus|attach|upload|add-file/.test(className)
      ) {
        return el;
      }
    }

    const leftMostButton = candidates
      .filter((el) => isVisibleCandidate(el))
      .filter((el) => {
        if (!(el instanceof HTMLElement)) return false;
        const rect = el.getBoundingClientRect();
        return !(rect.width === 0 && rect.height === 0);
      })
      .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)[0];
    if (leftMostButton instanceof HTMLElement) return leftMostButton;

    return null;
  }

  function findComposerPromptAnchor(shell, input) {
    if (!(shell instanceof HTMLElement)) return null;
    const plusButton = shell.querySelector('#composer-plus-btn, [data-testid="composer-plus-btn"]');
    if (plusButton instanceof HTMLElement && plusButton.parentElement instanceof HTMLElement) {
      return { container: plusButton.parentElement, anchor: plusButton };
    }

    const attachBtn = findComposerAttachButton(shell);
    if (attachBtn instanceof HTMLElement && attachBtn.parentElement instanceof HTMLElement) {
      return { container: attachBtn.parentElement, anchor: attachBtn };
    }

    const anchorSelectors = [
      'button[data-testid*="send"]',
      'button[aria-label*="Send" i]',
      'button[title*="Send" i]',
      'button[data-testid*="composer"]',
      '[class*="send"] button',
      '[class*="composer"] button',
      '[class*="toolbar"] button',
      '[class*="actions"] button'
    ];

    for (const selector of anchorSelectors) {
      const candidate = shell.querySelector(selector);
      if (!(candidate instanceof HTMLElement)) continue;
      const container = candidate.parentElement;
      if (container instanceof HTMLElement) {
        return { container, anchor: candidate };
      }
    }

    if (input instanceof HTMLElement && input.parentElement instanceof HTMLElement) {
      return { container: input.parentElement, anchor: input.nextElementSibling || shell.firstElementChild };
    }

    return { container: shell, anchor: shell.firstElementChild };
  }

  function positionComposerPromptMenu(menu, btn) {
    if (!(menu instanceof HTMLElement) || !(btn instanceof HTMLElement)) return;
    const margin = 8;
    const rect = btn.getBoundingClientRect();
    menu.style.visibility = 'hidden';
    menu.classList.add('open');
    const menuRect = menu.getBoundingClientRect();
    menu.classList.remove('open');
    menu.style.visibility = '';

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const maxLeft = Math.max(margin, viewportWidth - menuRect.width - margin);
    const maxTop = Math.max(margin, viewportHeight - menuRect.height - margin);
    const preferredLeft = rect.left;
    const preferredTop = rect.bottom + margin;
    const left = Math.min(maxLeft, Math.max(margin, preferredLeft));
    const top = Math.min(maxTop, Math.max(margin, preferredTop));

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }

  function placePromptDockNearAttach(shell, dock) {
    if (!(shell instanceof HTMLElement) || !(dock instanceof HTMLElement)) return;
    const anchorData = findComposerPromptAnchor(shell, null);
    if (anchorData?.container instanceof HTMLElement) {
      const existingBtn = anchorData.container.querySelector('[data-testid="composer-button-prompts"]');
      if (existingBtn instanceof HTMLElement && existingBtn !== dock) {
        existingBtn.closest('.rabbit-composer-prompt-dock')?.remove();
      }
      if (anchorData.anchor instanceof Node) {
        anchorData.container.insertBefore(dock, anchorData.anchor);
      } else {
        anchorData.container.appendChild(dock);
      }
      return;
    }

    const toolbar = shell.querySelector('[class*="toolbar"], [class*="actions"], [data-testid*="composer"]');
    if (toolbar instanceof HTMLElement) {
      toolbar.prepend(dock);
      return;
    }

    shell.prepend(dock);
  }

  let lastClickedPromptBtn = null;

  function bindComposerPromptMenuToPlus(shell, input) {
    const anchorData = findComposerPromptAnchor(shell, input);
    const nativePlusBtn = anchorData?.anchor instanceof HTMLButtonElement ? anchorData.anchor : null;
    if (!(nativePlusBtn instanceof HTMLButtonElement)) return false;

    const originalLabel = nativePlusBtn.getAttribute('aria-label') || nativePlusBtn.getAttribute('title') || '';
    nativePlusBtn.classList.add('rabbit-composer-code-btn', 'rabbit-composer-merged-plus-btn');
    nativePlusBtn.dataset.testid = 'composer-button-prompts';
    nativePlusBtn.setAttribute('aria-label', originalLabel ? `${originalLabel} + Prompts` : 'Prompts and tools');
    nativePlusBtn.setAttribute('title', originalLabel ? `${originalLabel} + Prompts` : 'Prompts and tools');
    nativePlusBtn.setAttribute('aria-haspopup', 'menu');
    nativePlusBtn.setAttribute('aria-expanded', 'false');
    if (nativePlusBtn.dataset.rabbitPromptIconApplied !== '1') {
      nativePlusBtn.dataset.rabbitPromptIconApplied = '1';
      nativePlusBtn.innerHTML = `<span class="rabbit-composer-code-btn-icon" aria-hidden="true">${COMPOSER_PROMPT_ICON}</span>`;
    }

    let menu = document.getElementById(`rabbit-composer-prompt-menu-${nativePlusBtn.dataset.rabbitPromptMenuId || ''}`);
    if (!(menu instanceof HTMLElement)) {
      const menuId = `rabbit-composer-prompt-menu-${Math.random().toString(36).slice(2, 10)}`;
      nativePlusBtn.dataset.rabbitPromptMenuId = menuId.slice('rabbit-composer-prompt-menu-'.length);
      menu = document.createElement('div');
      menu.id = menuId;
      menu.className = 'rabbit-composer-prompt-menu';
      menu.setAttribute('role', 'menu');
      menu.setAttribute('aria-hidden', 'true');
      menu.dataset.triggerId = menuId;
      document.body.appendChild(menu);
      nativePlusBtn.setAttribute('aria-controls', menuId);
    }

    if (nativePlusBtn.dataset.bound === '1') return true;
    nativePlusBtn.dataset.bound = '1';

    const onPromptButtonActivate = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (nativePlusBtn.dataset.rabbitBypassPromptMenu === '1') return;
      lastClickedPromptBtn = nativePlusBtn;
      const opening = !menu.classList.contains('open');
      closeComposerPromptMenus();
      if (!opening) return;
      positionComposerPromptMenu(menu, nativePlusBtn);
      buildComposerPromptMenu(menu, 'all', input, nativePlusBtn);
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      nativePlusBtn.setAttribute('aria-expanded', 'true');
    };

    nativePlusBtn.addEventListener('mousedown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      onPromptButtonActivate(event);
    });

    nativePlusBtn.addEventListener('click', (event) => {
      if (nativePlusBtn.dataset.rabbitBypassPromptMenu === '1') return;
      event.preventDefault();
      event.stopPropagation();
    });

    return true;
  }

  function ensureComposerPromptDock(shell, input) {
    if (!(shell instanceof HTMLElement)) return;
    if (!(input instanceof HTMLElement)) return;
    const anchorData = findComposerPromptAnchor(shell, input);
    const anchorContainer = anchorData?.container instanceof HTMLElement ? anchorData.container : null;
    if (anchorContainer?.querySelector('.rabbit-composer-prompt-dock')) return;
    if (!anchorContainer && shell.querySelector(':scope > .rabbit-composer-prompt-dock')) return;

    const dock = document.createElement('div');
    dock.className = 'rabbit-composer-prompt-dock';

    const pill = document.createElement('div');
    pill.className = 'rabbit-composer-pill-container';

    const enhanceBtn = document.createElement('button');
    enhanceBtn.type = 'button';
    enhanceBtn.className = 'rabbit-composer-code-btn rabbit-composer-ai-btn';
    enhanceBtn.setAttribute('data-testid', 'composer-button-ai-enhance');
    enhanceBtn.setAttribute('aria-label', 'Enhance prompt');
    enhanceBtn.setAttribute('title', 'Enhance current prompt with AI');
    enhanceBtn.innerHTML = `<span class="rabbit-composer-code-btn-icon" aria-hidden="true">${COMPOSER_ENHANCE_ICON}</span>`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rabbit-composer-code-btn';
    btn.setAttribute('data-testid', 'composer-button-prompts');
    btn.setAttribute('aria-label', 'Prompts');
    btn.setAttribute('title', 'Prompts');
    btn.setAttribute('aria-haspopup', 'menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `<span class="rabbit-composer-code-btn-icon" aria-hidden="true">${COMPOSER_PROMPT_ICON}</span>`;
    pill.appendChild(enhanceBtn);
    pill.appendChild(btn);
    dock.appendChild(pill);

    const menuId = `rabbit-menu-${Math.random().toString(36).slice(2, 9)}`;
    const menu = document.createElement('div');
    menu.id = menuId;
    menu.className = 'rabbit-composer-prompt-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-hidden', 'true');
    dock.appendChild(menu);
    btn.setAttribute('aria-controls', menuId);

    if (anchorContainer instanceof HTMLElement) {
      if (anchorData?.anchor instanceof Node && anchorData.anchor.parentNode === anchorContainer) {
        anchorContainer.insertBefore(dock, anchorData.anchor);
      } else {
        anchorContainer.appendChild(dock);
      }
    } else {
      placePromptDockNearAttach(shell, dock);
    }

    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (menu.classList.contains('open')) {
        closeComposerPromptMenus();
        return;
      }

      closeComposerPromptMenus();
      positionComposerPromptMenu(menu, btn);
      buildComposerPromptMenu(menu, 'all', input);
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');
    });

    enhanceBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeComposerPromptMenus();
      const draft = getComposerDraftText(input);
      const enhancedInstruction = buildPromptEnhanceInstruction(draft);
      if (!enhancedInstruction) {
        showNotification('Type a prompt in the composer first.');
        return;
      }
      insertPromptIntoComposer(enhancedInstruction, input);
    });
  }

  async function checkForUserscriptUpdate({ openInstall = false, silent = false } = {}) {
    const configuredUrl = (settings.updateRawUrl || '').trim();
    const fallbackUrl = (typeof GM_info === 'object' && GM_info && GM_info.script && (GM_info.script.downloadURL || GM_info.script.updateURL)) || '';
    const rawUrl = configuredUrl || fallbackUrl;

    if (!rawUrl) {
      const message = 'Set a GitHub Raw userscript URL in Settings > Updates first.';
      if (!silent) {
        showNotification(message);
        await createDialogo({ message, title: 'Update Check' });
      }
      return { ok: false, message };
    }

    try {
      const response = await fetch(`${rawUrl}${rawUrl.includes('?') ? '&' : '?'}_=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const source = await response.text();
      const match = source.match(/@version\s+([^\s]+)/);
      const remoteVersion = match ? match[1].trim() : '';
      const localVersion = SCRIPT_VERSION;
      const parseVersion = (value) => String(value || '').split('.').map((part) => Number.parseInt(part, 10)).filter((n) => Number.isFinite(n));
      const remoteParts = parseVersion(remoteVersion);
      const localParts = parseVersion(localVersion);
      const maxLen = Math.max(remoteParts.length, localParts.length, 3);
      let comparison = 0;
      for (let i = 0; i < maxLen; i += 1) {
        const a = remoteParts[i] || 0;
        const b = localParts[i] || 0;
        if (a > b) { comparison = 1; break; }
        if (a < b) { comparison = -1; break; }
      }

      if (comparison > 0) {
        const message = `Update available: ${localVersion} → ${remoteVersion}`;
        if (!silent) {
          const wantsInstall = openInstall || await createDialogo({
            message: `${message}\n\nOpen the GitHub Raw install page now?`,
            type: 'confirm',
            title: 'Update Available'
          });
          if (wantsInstall) window.open(rawUrl, '_blank', 'noopener,noreferrer');
        }
        return { ok: true, hasUpdate: true, message, rawUrl, remoteVersion, localVersion };
      }

      const message = comparison === 0
        ? `You are up to date (${localVersion}).`
        : `Installed version (${localVersion}) is newer than remote (${remoteVersion || 'unknown'}).`;
      if (!silent) {
        showNotification(message);
        await createDialogo({ message, title: 'Update Check' });
      }
      return { ok: true, hasUpdate: false, message, rawUrl, remoteVersion, localVersion };
    } catch (error) {
      const message = `Update check failed: ${error instanceof Error ? error.message : String(error)}`;
      if (!silent) {
        showNotification(message);
        await createDialogo({ message, title: 'Update Check' });
      }
      return { ok: false, message };
    }
  }


  function renderDeleteChatsList(panel) {
    const list = panel.querySelector('[data-role="delete-chats-list"]');
    if (!(list instanceof HTMLElement)) return;
    const chats = getSidebarChatItems();
    list.innerHTML = '';
    if (!chats.length) {
      const empty = document.createElement('div');
      empty.className = 'rabbit-note';
      empty.textContent = 'No chats found in the sidebar.';
      list.appendChild(empty);
      return;
    }

    chats.forEach((chat, index) => {
      const row = document.createElement('label');
      row.className = 'rabbit-chat-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.role = 'delete-chat-check';
      checkbox.dataset.chatHref = chat.href;
      checkbox.dataset.chatIndex = String(index);

      const title = document.createElement('span');
      title.textContent = chat.title;
      title.title = chat.href;

      row.appendChild(checkbox);
      row.appendChild(title);
      list.appendChild(row);
    });
  }

  function setDeleteChatsModalOpen(panel, open) {
    const modal = panel.querySelector('[data-role="delete-chats-modal"]');
    if (!(modal instanceof HTMLElement)) return;
    modal.classList.toggle('open', !!open);
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) renderDeleteChatsList(panel);
  }

  function renderExportChatsList(panel) {
    const list = panel.querySelector('[data-role="export-chats-list"]');
    if (!(list instanceof HTMLElement)) return;
    const chats = getSidebarChatItems();
    list.innerHTML = '';
    if (!chats.length) {
      const empty = document.createElement('div');
      empty.className = 'rabbit-note';
      empty.textContent = 'No chats found in the sidebar.';
      list.appendChild(empty);
      return;
    }

    chats.forEach((chat, index) => {
      const row = document.createElement('label');
      row.className = 'rabbit-chat-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.role = 'export-chat-check';
      checkbox.dataset.chatHref = chat.href;
      checkbox.dataset.chatIndex = String(index);

      const title = document.createElement('span');
      title.textContent = chat.title;
      title.title = chat.href;

      row.appendChild(checkbox);
      row.appendChild(title);
      list.appendChild(row);
    });
  }

  function setExportChatsModalOpen(panel, open) {
    const modal = panel.querySelector('[data-role="export-chats-modal"]');
    if (!(modal instanceof HTMLElement)) return;
    modal.classList.toggle('open', !!open);
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) renderExportChatsList(panel);
  }

  function formatTimestampForFilename(date) {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}`;
  }

  function sanitizeFilename(value) {
    return value.replace(/[^a-z0-9_-]+/gi, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  }

  function downloadTextFile(filename, content, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 800);
  }

  function extractMessageText(target) {
    if (!(target instanceof HTMLElement)) return '';
    const text = (target.innerText || target.textContent || '').trim();
    return text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  function extractChatMarkdownFromDocument(doc, chatUrl = location.href) {
    const titleRaw = (doc.title || 'ChatGPT Chat').replace(/\s*\\|\\s*ChatGPT.*$/i, '').trim();
    const title = titleRaw || 'ChatGPT Chat';
    const timestamp = new Date();
    const lines = [
      `# ${title}`,
      '',
      `- Exported: ${timestamp.toISOString()}`,
      `- URL: ${chatUrl}`,
      ''
    ];

    const roleRoots = doc.querySelectorAll('[data-message-author-role]');
    roleRoots.forEach((root) => {
      if (!(root instanceof HTMLElement)) return;
      const role = root.getAttribute('data-message-author-role');
      if (role !== 'user' && role !== 'assistant') return;
      const target = findBestMessageContent(root) || root;
      const text = extractMessageText(target);
      if (!text) return;
      lines.push(`## ${role === 'user' ? 'User' : 'Assistant'}`, '', text, '', '---', '');
    });

    if (lines.length <= 5) {
      lines.push('No message content could be parsed from this page.', '');
    }

    return {
      title,
      content: lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
    };
  }

  function exportChatAsMarkdown() {
    const { title, content } = extractChatMarkdownFromDocument(document, location.href);
    const timestamp = new Date();
    const filenameBase = sanitizeFilename(title) || 'ChatGPT-Chat';
    const filename = `${filenameBase}-${formatTimestampForFilename(timestamp)}.md`;
    downloadTextFile(filename, content, 'text/markdown');
  }

  async function exportChatByHref(chat) {
    const url = chat?.href;
    if (!url) return false;
    try {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const { title, content } = extractChatMarkdownFromDocument(doc, url);
      const filenameBase = sanitizeFilename(chat.title || title) || sanitizeFilename(title) || 'ChatGPT-Chat';
      const filename = `${filenameBase}-${formatTimestampForFilename(new Date())}.md`;
      downloadTextFile(filename, content, 'text/markdown');
      return true;
    } catch {
      return false;
    }
  }

  function exportScriptAndSettings() {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: SCRIPT_VERSION,
      settings: normalizeSettings(settings),
      prompts: Array.isArray(prompts) ? prompts : [],
      scriptSource: null
    };

    if (typeof GM_info !== 'undefined' && GM_info && GM_info.script && GM_info.script.source) {
      payload.scriptSource = GM_info.script.source;
    }

    const filename = `GPT-Unleashed-${SCRIPT_VERSION}-backup.json`;
    downloadTextFile(filename, JSON.stringify(payload, null, 2), 'application/json');
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function getSidebarChatItems() {
    const anchors = [...document.querySelectorAll('nav a[href*="/c/"], aside a[href*="/c/"], div[data-testid*="sidebar"] a[href*="/c/"]')];
    const seen = new Set();
    const items = [];
    anchors.forEach((anchor) => {
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.href || anchor.getAttribute('href') || '';
      if (!href || seen.has(href)) return;
      const row = resolveSidebarRowFromAnchor(anchor);
      if (!(row instanceof HTMLElement)) return;
      const title = (anchor.textContent || anchor.getAttribute('title') || 'Untitled chat').trim();
      seen.add(href);
      items.push({ href, title: title || 'Untitled chat', row, anchor });
    });
    return items;
  }

  function resolveSidebarRowFromAnchor(anchor) {
    if (!(anchor instanceof HTMLElement)) return null;
    const initialRow = anchor.closest('li, [role="listitem"], [data-testid*="history-item"], [data-testid*="conversation"], [data-testid*="thread"], [data-sidebar-chat-row], div');
    if (!(initialRow instanceof HTMLElement)) return null;
    if (findMenuButtonForRow(initialRow)) return initialRow;

    let current = initialRow.parentElement;
    let depth = 0;
    while (current && depth < 8) {
      if (findMenuButtonForRow(current)) return current;
      current = current.parentElement;
      depth += 1;
    }
    return initialRow;
  }

  function findMenuButtonForRow(row) {
    if (!(row instanceof HTMLElement)) return null;
    const selectors = [
      'button[data-testid*="options"]',
      'button[data-testid*="menu"]',
      'button[aria-haspopup="menu"]',
      'button[aria-label*="Options"]',
      'button[aria-label*="options"]',
      'button[aria-label*="More"]',
      'button[aria-label*="more"]'
    ];
    for (const selector of selectors) {
      const btn = row.querySelector(selector);
      if (btn instanceof HTMLButtonElement) return btn;
    }
    const allButtons = [...row.querySelectorAll('button')];
    return allButtons.find((btn) => btn instanceof HTMLButtonElement && (
      (btn.getAttribute('aria-label') || '').toLowerCase().includes('more')
      || (btn.getAttribute('aria-label') || '').toLowerCase().includes('option')
      || btn.getAttribute('aria-haspopup') === 'menu'
    )) || null;
  }

  function isElementVisible(node) {
    if (!(node instanceof HTMLElement)) return false;
    const style = getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = node.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function findOpenMenuRoot() {
    const menu = [...document.querySelectorAll('[role="menu"]')]
      .find((node) => node instanceof HTMLElement && isElementVisible(node));
    if (menu instanceof HTMLElement) return menu;
    return [...document.querySelectorAll(
      '[data-radix-menu-content], [data-radix-popper-content-wrapper], [data-state="open"][role], [cmdk-list-sizer]'
    )]
      .find((node) => node instanceof HTMLElement && isElementVisible(node)) || null;
  }

  function findDeleteMenuAction(menuRoot) {
    if (!(menuRoot instanceof HTMLElement)) return null;
    const scope = menuRoot;
    const candidates = [...scope.querySelectorAll('[role="menuitem"], button, div[role="button"]')];
    return candidates.find((node) => {
      if (!(node instanceof HTMLElement) || !isElementVisible(node)) return false;
      const text = (node.textContent || '').trim().toLowerCase();
      const aria = (node.getAttribute('aria-label') || '').trim().toLowerCase();
      const variant = (node.getAttribute('data-variant') || '').trim().toLowerCase();
      return text === 'delete'
        || text.includes('delete chat')
        || text.includes('delete conversation')
        || text.includes('remove')
        || aria.includes('delete')
        || aria.includes('remove')
        || variant.includes('destructive');
    }) || null;
  }

  function findConfirmDeleteAction() {
    const openDialog = [...document.querySelectorAll('[role="alertdialog"], [role="dialog"]')]
      .find((node) => node instanceof HTMLElement && isElementVisible(node));
    if (!(openDialog instanceof HTMLElement)) return null;
    const scope = openDialog;
    const candidates = [...scope.querySelectorAll('button, [role="button"]')];
    return candidates.find((node) => {
      if (!(node instanceof HTMLElement) || !isElementVisible(node)) return false;
      const text = (node.textContent || '').trim().toLowerCase();
      const aria = (node.getAttribute('aria-label') || '').trim().toLowerCase();
      const isCancel = text.includes('cancel') || aria.includes('cancel') || text.includes('keep');
      if (isCancel) return false;
      return text === 'delete'
        || text === 'confirm'
        || text.includes('yes, delete')
        || text.includes('delete')
        || text.includes('remove')
        || aria.includes('confirm')
        || aria.includes('delete')
        || aria.includes('remove');
    }) || null;
  }

  function robustClick(node) {
    if (!(node instanceof HTMLElement)) return;
    node.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    node.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    node.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    node.click();
  }

  async function deleteChatFromSidebarItem(item) {
    const fallbackItem = item?.href
      ? getSidebarChatItems().find((chat) => chat.href === item.href)
      : null;
    const targetItem = fallbackItem || item;
    const row = targetItem?.row;
    if (!(row instanceof HTMLElement)) return false;
    row.scrollIntoView({ block: 'nearest' });
    await sleep(80);
    const menuButton = findMenuButtonForRow(row);
    if (!(menuButton instanceof HTMLElement)) return false;
    robustClick(menuButton);
    await sleep(240);
    const menuRoot = findOpenMenuRoot();
    if (!(menuRoot instanceof HTMLElement)) return false;
    const deleteAction = findDeleteMenuAction(menuRoot);
    if (!(deleteAction instanceof HTMLElement)) return false;
    robustClick(deleteAction);
    await sleep(260);
    const confirm = findConfirmDeleteAction();
    if (confirm instanceof HTMLElement) {
      robustClick(confirm);
    }
    await sleep(320);
    return true;
  }

  function removeSidebarDeleteButton(row) {
    if (!(row instanceof HTMLElement)) return;
    row.querySelectorAll('.rabbit-sidebar-delete-btn').forEach((btn) => btn.remove());
  }

  function isSidebarRowTooCompact(row) {
    if (!(row instanceof HTMLElement)) return true;
    const rect = row.getBoundingClientRect();
    if (rect.width <= 140) return true;
    const rowText = (row.textContent || '').replace(/\s+/g, ' ').trim();
    return rowText.length <= 2;
  }

  function ensureSidebarDeleteButtons() {
    const items = getSidebarChatItems();
    items.forEach((item) => {
      const row = item.row;
      if (!(row instanceof HTMLElement)) return;
      const menuButton = findMenuButtonForRow(row);
      if (!(menuButton instanceof HTMLElement) || !menuButton.parentElement) {
        removeSidebarDeleteButton(row);
        return;
      }
      if (isSidebarRowTooCompact(row)) {
        removeSidebarDeleteButton(row);
        return;
      }
      if (row.querySelector('.rabbit-sidebar-delete-btn')) return;
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'rabbit-sidebar-delete-btn';
      deleteBtn.title = 'Delete chat';
      deleteBtn.setAttribute('aria-label', 'Delete chat');
      deleteBtn.textContent = '🗑';
      deleteBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const ok = await createDialogo({
          message: `Delete "${item.title}"? This cannot be undone.`,
          type: 'confirm',
          title: 'Delete Chat'
        });
        if (!ok) return;
        await deleteChatFromSidebarItem(item);
        showNotification(`Deleted "${item.title}".`);
        scheduleRefresh(120);
      });
      menuButton.parentElement.insertBefore(deleteBtn, menuButton);
    });
  }


  function isScrollableElement(element) {
    if (!(element instanceof HTMLElement)) return false;
    const style = getComputedStyle(element);
    const overflowY = style.overflowY || '';
    if (overflowY === 'hidden') return false;
    return element.scrollHeight - element.clientHeight > 8;
  }

  function findScrollableAncestor(node) {
    let current = node instanceof HTMLElement ? node : null;
    while (current && current !== document.body && current !== document.documentElement) {
      if (current.id === PANEL_ID) {
        current = current.parentElement;
        continue;
      }
      if (isScrollableElement(current)) return current;
      current = current.parentElement;
    }
    return null;
  }

  function getChatScrollContainer() {
    const messageNode = document.querySelector('[data-message-author-role]');
    if (messageNode) {
      const scrollable = findScrollableAncestor(messageNode);
      if (scrollable) return scrollable;
    }

    const explicitSelectors = [
      '[data-testid="conversation-container"]',
      '[data-testid="conversation-turns"]',
      'div[class*="react-scroll-to-bottom"]'
    ];

    for (const selector of explicitSelectors) {
      const candidate = document.querySelector(selector);
      if (candidate && isScrollableElement(candidate)) {
        return candidate;
      }
    }

    const main = document.querySelector('main') || document.querySelector('[role="main"]');
    if (main) {
      const scrollable = findScrollableAncestor(main);
      if (scrollable) return scrollable;
      if (isScrollableElement(main)) return main;
    }

    return document.scrollingElement || document.documentElement;
  }

  function scrollChatToTop() {
    const firstMessage = document.querySelector('[data-message-author-role]');
    if (firstMessage instanceof HTMLElement) {
      firstMessage.scrollIntoView({ block: 'start', behavior: 'auto' });
      return;
    }

    const container = getChatScrollContainer();
    if (!container) return;
    if (container === document.body || container === document.documentElement) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    container.scrollTo({ top: 0, behavior: 'auto' });
  }

  function scrollChatToBottom() {
    const roleRoots = document.querySelectorAll('[data-message-author-role]');
    const lastMessage = roleRoots.length ? roleRoots[roleRoots.length - 1] : null;
    if (lastMessage instanceof HTMLElement) {
      lastMessage.scrollIntoView({ block: 'end', behavior: 'auto' });
      return;
    }

    const container = getChatScrollContainer();
    if (!container) return;
    const target = Math.max(0, container.scrollHeight - container.clientHeight);
    if (container === document.body || container === document.documentElement) {
      window.scrollTo({ top: target, behavior: 'auto' });
      return;
    }
    container.scrollTo({ top: target, behavior: 'auto' });
  }


  function ensureStyleTag() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      const root = document.head || document.documentElement;
      if (root) root.appendChild(style);
    }
    return style;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function cssFontFamilyValue() {
    const raw = (settings.chatFontFamily || '').trim();
    if (!raw || raw.toLowerCase() === 'inherit') return 'inherit';
    return raw;
  }

  function applyStyles() {
    const panelOpacity = settings.panelOpacityEnabled ? settings.panelOpacity : 1;
    const hiddenOpacity = Math.max(0.12, Math.min(0.6, panelOpacity * 0.35 + 0.08));
    const themeEnabled = settings.featureThemeEnabled;
    const fontValue = settings.featureFontEnabled ? cssFontFamilyValue() : 'inherit';
    const userFontSize = settings.featureFontEnabled ? `${settings.userFontSize}px` : 'inherit';
    const assistantFontSize = settings.featureFontEnabled ? `${settings.assistantFontSize}px` : 'inherit';
    const sidebarFontSize = settings.featureFontEnabled ? `${settings.sidebarFontSize}px` : 'inherit';
    const pageBg = settings.themePageEnabled ? settings.pageBg : 'initial';
    const pageText = settings.themePageEnabled ? settings.pageText : 'inherit';
    const userBubbleBg = settings.themeUserBubbleEnabled ? settings.userBubbleBg : 'transparent';
    const userBubbleText = settings.themeUserBubbleEnabled ? settings.userBubbleText : 'inherit';
    const assistantBubbleBg = settings.themeAssistantBubbleEnabled ? settings.assistantBubbleBg : 'transparent';
    const assistantBubbleText = settings.themeAssistantBubbleEnabled ? settings.assistantBubbleText : 'inherit';
    const embedBg = settings.themeEmbedEnabled ? settings.embedBg : 'transparent';
    const embedText = settings.themeEmbedEnabled ? settings.embedText : 'inherit';
    const composerBg = settings.themeComposerEnabled ? settings.composerBg : 'transparent';
    const composerText = settings.themeComposerEnabled ? settings.composerText : 'inherit';
    const sidebarBg = settings.themeSidebarEnabled ? settings.sidebarBg : 'transparent';
    const sidebarText = settings.themeSidebarEnabled ? settings.sidebarText : 'inherit';
    const sidebarHover = settings.themeSidebarEnabled ? settings.sidebarHover : 'inherit';
    const sidebarHoverText = settings.themeSidebarEnabled ? settings.sidebarHoverText : 'inherit';
    const matchedUi = settings.uiMatchThemeEnabled
      ? derivePanelUiColorsFromTheme(getActiveThemeSnapshot())
      : null;
    const panelUiBg = matchedUi ? matchedUi.panelUiBg : settings.panelUiBg;
    const panelUiBubble = matchedUi ? matchedUi.panelUiBubble : settings.panelUiBubble;
    const panelUiFont = matchedUi ? matchedUi.panelUiFont : settings.panelUiFont;
    const panelUiOutline = matchedUi ? matchedUi.panelUiOutline : settings.panelUiOutline;
    const panelUiButton = matchedUi ? matchedUi.panelUiButton : settings.panelUiButton;
    const warningVisibilityCss = settings.hideGptWarning ? `
      [data-rabbit-warning-hidden="1"] {
        display: none !important;
      }
    ` : '';
    const embedAlignmentCss = settings.layoutEmbedAlignmentLock ? `
      .rabbit-embed-scope pre,
      .rabbit-embed-scope pre *,
      .rabbit-embed-scope blockquote,
      .rabbit-embed-scope blockquote *,
      .rabbit-embed-scope details,
      .rabbit-embed-scope details *,
      .rabbit-embed-scope table,
      .rabbit-embed-scope table *,
      .rabbit-embed-scope th,
      .rabbit-embed-scope td,
      .rabbit-embed-scope :not(pre) > code,
      .rabbit-embed-scope p code,
      .rabbit-embed-scope li code,
      .rabbit-embed-scope span code {
        text-align: initial !important;
      }
    ` : `
      .rabbit-embed-scope pre,
      .rabbit-embed-scope pre *,
      .rabbit-embed-scope blockquote,
      .rabbit-embed-scope blockquote *,
      .rabbit-embed-scope details,
      .rabbit-embed-scope details *,
      .rabbit-embed-scope table,
      .rabbit-embed-scope th,
      .rabbit-embed-scope td,
      .rabbit-embed-scope :not(pre) > code,
      .rabbit-embed-scope p code,
      .rabbit-embed-scope li code,
      .rabbit-embed-scope span code {
        text-align: var(--rabbit-chat-text-align) !important;
      }
    `;

    const embeddedThemeCss = settings.themeEmbedEnabled ? `
      .rabbit-embed-scope pre,
      .rabbit-embed-scope blockquote,
      .rabbit-embed-scope table,
      .rabbit-embed-scope details {
        background: var(--rabbit-embed-bg) !important;
        color: var(--rabbit-embed-text) !important;
        border: 1px solid rgba(255,255,255,0.10) !important;
        border-radius: 12px !important;
        box-shadow: none !important;
      }

      .rabbit-embed-scope pre,
      .rabbit-embed-scope pre *:not([class*="token"]):not([class*="hljs-"]),
      .rabbit-embed-scope blockquote,
      .rabbit-embed-scope blockquote *,
      .rabbit-embed-scope table,
      .rabbit-embed-scope table *,
      .rabbit-embed-scope details,
      .rabbit-embed-scope details * {
        color: var(--rabbit-embed-text) !important;
      }

      .rabbit-embed-scope :not(pre) > code,
      .rabbit-embed-scope p code,
      .rabbit-embed-scope li code,
      .rabbit-embed-scope span code {
        background: var(--rabbit-embed-bg) !important;
        color: var(--rabbit-embed-text) !important;
        border: 1px solid rgba(255,255,255,0.10) !important;
        border-radius: 8px !important;
        padding: 0.12em 0.35em !important;
        box-shadow: none !important;
      }
    ` : `
      .rabbit-embed-scope pre,
      .rabbit-embed-scope blockquote,
      .rabbit-embed-scope table,
      .rabbit-embed-scope details,
      .rabbit-embed-scope :not(pre) > code,
      .rabbit-embed-scope p code,
      .rabbit-embed-scope li code,
      .rabbit-embed-scope span code {
        background: initial !important;
        color: initial !important;
        border: initial !important;
        box-shadow: initial !important;
      }

      .rabbit-embed-scope pre *,
      .rabbit-embed-scope blockquote *,
      .rabbit-embed-scope table *,
      .rabbit-embed-scope details * {
        color: initial !important;
      }
    `;

    const themeCss = themeEnabled ? `
      html, body, #__next, main {
        background: var(--rabbit-page-bg) !important;
        color: var(--rabbit-page-text) !important;
      }

      body,
      main,
      [role="main"],
      [data-testid*="conversation"],
      [data-testid*="thread"],
      [class*="conversation"],
      [class*="thread"] {
        background-color: var(--rabbit-page-bg) !important;
        color: var(--rabbit-page-text) !important;
      }

      body *:not(input):not(textarea):not(select):not(button):not(svg):not(path) {
        border-color: rgba(255,255,255,0.08);
      }

      a {
        color: #8dc6ff !important;
      }

      /* =========================
         SIDEBAR
         ========================= */

      body > div nav:first-of-type,
      nav[aria-label*="Chat history"],
      nav[aria-label*="chat history"],
      nav[aria-label*="sidebar"],
      [data-testid*="sidebar-header"],
      [data-testid*="sidebar-footer"],
      [data-testid*="sidebar-minimized"],
      [data-testid*="sidebar"] > div,
      aside[class*="sidebar"],
      aside[data-testid*="sidebar"],
      div[data-testid*="sidebar"],
      div[data-slot="sidebar"],
      div[data-panel="sidebar"],
      div[class*="sidebar"][class*="open"],
      div[class*="sidebar"][class*="closed"],
      div[class*="sidebar"][class*="panel"],
      div[class*="left"][class*="panel"],
      div[class*="left"][class*="rail"] {
        background: var(--rabbit-sidebar-bg) !important;
        color: var(--rabbit-sidebar-text) !important;
      }

      body > div nav:first-of-type *,
      nav[aria-label*="Chat history"] *,
      nav[aria-label*="chat history"] *,
      nav[aria-label*="sidebar"] *,
      [data-testid*="sidebar-header"] *,
      [data-testid*="sidebar-footer"] *,
      [data-testid*="sidebar-minimized"] *,
      [data-testid*="sidebar"] > div *,
      aside[class*="sidebar"] *,
      aside[data-testid*="sidebar"] *,
      div[data-testid*="sidebar"] *,
      div[data-slot="sidebar"] *,
      div[data-panel="sidebar"] *,
      div[class*="sidebar"][class*="open"] *,
      div[class*="sidebar"][class*="closed"] *,
      div[class*="sidebar"][class*="panel"] *,
      div[class*="left"][class*="panel"] *,
      div[class*="left"][class*="rail"] * {
        color: var(--rabbit-sidebar-text) !important;
      }

      body > div nav:first-of-type a:hover,
      body > div nav:first-of-type button:hover,
      [aria-label*="Open sidebar"]:hover,
      [aria-label*="Close sidebar"]:hover,
      aside[class*="sidebar"] a:hover,
      aside[class*="sidebar"] button:hover,
      aside[data-testid*="sidebar"] a:hover,
      aside[data-testid*="sidebar"] button:hover,
      div[data-testid*="sidebar"] a:hover,
      div[data-testid*="sidebar"] button:hover,
      div[class*="sidebar"][class*="open"] a:hover,
      div[class*="sidebar"][class*="open"] button:hover,
      div[class*="sidebar"][class*="panel"] a:hover,
      div[class*="sidebar"][class*="panel"] button:hover,
      div[class*="left"][class*="panel"] a:hover,
      div[class*="left"][class*="panel"] button:hover,
      div[class*="left"][class*="rail"] a:hover,
      div[class*="left"][class*="rail"] button:hover {
        background: var(--rabbit-sidebar-hover) !important;
        color: var(--rabbit-sidebar-hover-text) !important;
      }

      body > div nav:first-of-type a:hover *,
      body > div nav:first-of-type button:hover *,
      [aria-label*="Open sidebar"]:hover *,
      [aria-label*="Close sidebar"]:hover *,
      aside[class*="sidebar"] a:hover *,
      aside[class*="sidebar"] button:hover *,
      aside[data-testid*="sidebar"] a:hover *,
      aside[data-testid*="sidebar"] button:hover *,
      div[data-testid*="sidebar"] a:hover *,
      div[data-testid*="sidebar"] button:hover *,
      div[class*="sidebar"][class*="open"] a:hover *,
      div[class*="sidebar"][class*="open"] button:hover *,
      div[class*="sidebar"][class*="panel"] a:hover *,
      div[class*="sidebar"][class*="panel"] button:hover *,
      div[class*="left"][class*="panel"] a:hover *,
      div[class*="left"][class*="panel"] button:hover *,
      div[class*="left"][class*="rail"] a:hover *,
      div[class*="left"][class*="rail"] button:hover * {
        color: var(--rabbit-sidebar-hover-text) !important;
      }

      body > div nav:first-of-type a,
      [aria-label*="Open sidebar"],
      [aria-label*="Close sidebar"],
      nav[aria-label*="Chat history"] a,
      nav[aria-label*="chat history"] a,
      nav[aria-label*="sidebar"] a,
      aside[class*="sidebar"] a,
      aside[data-testid*="sidebar"] a,
      div[data-testid*="sidebar"] a,
      div[data-slot="sidebar"] a,
      div[data-panel="sidebar"] a,
      div[class*="sidebar"][class*="open"] a,
      div[class*="sidebar"][class*="closed"] a,
      div[class*="sidebar"][class*="panel"] a,
      div[class*="left"][class*="panel"] a,
      div[class*="left"][class*="rail"] a {
        color: var(--rabbit-sidebar-text) !important;
      }

      /* =========================
         COMPOSER
         ========================= */

      .rabbit-composer-shell {
        display: flex !important;
        align-items: stretch !important;
        background: var(--rabbit-composer-bg) !important;
        border-color: rgba(255,255,255,0.12) !important;
        box-shadow: 0 10px 26px rgba(0,0,0,0.34) !important;
        border-radius: 24px !important;
        transform: none !important;
        margin-bottom: 0 !important;
        min-height: 64px !important;
        max-height: min(52vh, 460px) !important;
        overflow: visible !important;
        position: relative !important;
        z-index: 2147483644 !important;
        padding-top: 8px !important;
        padding-bottom: 8px !important;
        padding-left: 14px !important;
        padding-right: 14px !important;
        backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(255,255,255,0.14) !important;
      }

      .rabbit-composer-shell > div,
      .rabbit-composer-shell [class*="inner"],
      .rabbit-composer-shell [class*="container"],
      .rabbit-composer-shell [class*="wrapper"] {
        background: transparent !important;
      }

      .rabbit-composer-shell .rabbit-composer-input,
      .rabbit-composer-shell textarea,
      .rabbit-composer-shell [contenteditable="true"] {
        align-self: center !important;
        width: 100% !important;
        background: transparent !important;
        color: var(--rabbit-composer-text) !important;
        caret-color: var(--rabbit-composer-text) !important;
        border-color: transparent !important;
        box-shadow: none !important;
        min-height: 42px !important;
        max-height: min(42vh, 360px) !important;
        height: auto !important;
        overflow-y: auto !important;
        resize: none !important;
        padding-top: 8px !important;
        padding-bottom: 8px !important;
        margin: 0 !important;
      }

      .rabbit-composer-shell .rabbit-composer-input *,
      .rabbit-composer-shell textarea *,
      .rabbit-composer-shell [contenteditable="true"] * {
        color: var(--rabbit-composer-text) !important;
      }

      .rabbit-composer-shell textarea::placeholder {
        color: color-mix(in srgb, var(--rabbit-composer-text) 60%, transparent) !important;
      }

      .rabbit-composer-shell button,
      .rabbit-composer-shell svg,
      .rabbit-composer-shell span {
        color: inherit;
        vertical-align: middle !important;
      }

      .rabbit-composer-prompt-dock {
        position: relative;
        display: inline-flex;
        align-items: center;
        margin-right: 8px;
        z-index: 2147483645;
        pointer-events: auto;
        flex: 0 0 auto;
      }

      .rabbit-composer-pill-container {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 4px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.2);
        background: color-mix(in srgb, var(--rabbit-composer-bg) 55%, #111);
      }

      .rabbit-composer-code-btn {
        appearance: none;
        border: 1px solid rgba(255,255,255,0.26);
        background: color-mix(in srgb, var(--rabbit-composer-bg) 45%, #111);
        color: var(--rabbit-composer-text);
        border-radius: 999px;
        width: 30px;
        height: 30px;
        padding: 0;
        font-size: 12px;
        line-height: 1;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 2147483646;
        pointer-events: auto;
      }

      .rabbit-composer-ai-btn {
        width: 26px;
        height: 26px;
        color: color-mix(in srgb, var(--rabbit-composer-text) 84%, #ffd54f 16%);
      }

      .rabbit-composer-code-btn-icon {
        width: 14px;
        height: 14px;
        line-height: 1;
        display: inline-flex;
      }

      .rabbit-composer-code-btn-icon svg {
        width: 14px;
        height: 14px;
        display: block;
      }

      .rabbit-composer-prompt-menu {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 2147483646;
        display: none;
        min-width: 220px;
        max-width: min(340px, 70vw);
        max-height: min(50vh, 340px);
        overflow: auto;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 10px;
        background: color-mix(in srgb, var(--rabbit-composer-bg) 80%, #101018);
        box-shadow: 0 14px 30px rgba(0,0,0,0.42);
        padding: 6px;
      }

      .rabbit-composer-prompt-menu.open {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .rabbit-composer-menu-item {
        appearance: none;
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 7px;
        background: rgba(255,255,255,0.05);
        color: var(--rabbit-composer-text);
        text-align: left;
        padding: 6px 8px;
        font-size: 12px;
        cursor: pointer;
      }

      .rabbit-composer-menu-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 2px;
      }

      .rabbit-composer-menu-empty {
        padding: 4px 6px;
        font-size: 11px;
        opacity: 0.78;
      }

      /* =========================
         COMPOSER LAYOUT OVERRIDES
         ========================= */

      [data-rabbit-warning-hidden="1"],
      .rabbit-composer-shell ~ div,
      .rabbit-composer-shell + div {
        display: none !important;
      }

      .rabbit-composer-shell {
        flex-direction: column !important;
        overflow: hidden !important;
        border-radius: 18px !important;
        gap: 0 !important;
        padding: 0 !important;
      }

      .rabbit-composer-shell .rabbit-composer-input,
      .rabbit-composer-shell textarea,
      .rabbit-composer-shell [contenteditable="true"] {
        border-radius: 18px 18px 0 0 !important;
        padding: 14px 16px 10px 16px !important;
        min-height: 52px !important;
      }

      .rabbit-composer-shell > div:last-child,
      .rabbit-composer-shell [class*="bottom"],
      .rabbit-composer-shell [class*="toolbar"],
      .rabbit-composer-shell [class*="footer"],
      .rabbit-composer-shell [class*="actions"]:last-child {
        background: color-mix(in srgb, var(--rabbit-composer-bg) 70%, #000) !important;
        border-radius: 0 0 18px 18px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 4px 10px !important;
        margin: 0 !important;
        border-top: 1px solid rgba(255,255,255,0.08) !important;
        min-height: 36px !important;
      }

      .rabbit-composer-prompt-dock {
        align-self: center !important;
        margin: 0 4px 0 0 !important;
      }

      main > div:last-child:not([class*="conversation"]):not([class*="thread"]):not([role]),
      body > div > div:last-child > p,
      body > div > div:last-child > span,
      [class*="below-composer"],
      [class*="disclaimer"],
      [class*="warning-text"],
      footer p,
      footer span {
        display: none !important;
      }

      footer:empty,
      footer:has(> :only-child[data-rabbit-warning-hidden]) {
        display: none !important;
      }

      .rabbit-composer-toolbar-row {
        background: color-mix(in srgb, var(--rabbit-composer-bg) 85%, #0a0a0a) !important;
        border-top: 1px solid rgba(255,255,255,0.08) !important;
      }

      .rabbit-composer-toolbar-row * {
        color: var(--rabbit-composer-text) !important;
      }

      .rabbit-composer-prompt-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        background: rgba(0, 0, 0, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }

      .rabbit-composer-prompt-dialog {
        width: min(760px, 96vw);
        max-height: min(80vh, 760px);
        overflow: hidden;
        background: color-mix(in srgb, var(--rabbit-composer-bg) 82%, #0f1116);
        color: var(--rabbit-composer-text);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        box-shadow: 0 18px 44px rgba(0,0,0,0.48);
      }

      .rabbit-composer-prompt-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .rabbit-composer-prompt-toolbar {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        gap: 8px;
      }

      .rabbit-composer-prompt-actions-inline {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .rabbit-composer-prompt-results {
        border: 1px solid rgba(255,255,255,0.14);
        border-radius: 10px;
        padding: 8px;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .rabbit-composer-prompt-result {
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 8px;
        padding: 8px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
        background: rgba(255,255,255,0.03);
      }

      .rabbit-composer-prompt-result-title {
        font-size: 12px;
        font-weight: 700;
      }

      .rabbit-composer-prompt-result-snippet {
        font-size: 11px;
        opacity: 0.82;
        white-space: pre-wrap;
      }

      .rabbit-composer-prompt-result-tags {
        font-size: 10px;
        opacity: 0.72;
        margin-top: 4px;
      }

      .rabbit-composer-prompt-result-actions {
        display: flex;
        gap: 6px;
        flex-shrink: 0;
      }

      /* =========================
         MESSAGE BUBBLES
         ========================= */

      .rabbit-msg-target {
        max-width: min(100%, var(--rabbit-bubble-max-width)) !important;
        width: min(100%, var(--rabbit-bubble-max-width)) !important;
        inline-size: min(100%, var(--rabbit-bubble-max-width)) !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
        border-radius: var(--rabbit-bubble-radius) !important;
        padding: var(--rabbit-bubble-padding-y) var(--rabbit-bubble-padding-x) !important;
        box-shadow:
          0 1px 0 rgba(255,255,255,0.03) inset,
          0 8px 24px rgba(0,0,0,0.22) !important;
        overflow: hidden !important;
        position: relative !important;
      }

      .rabbit-msg-user {
        background: var(--rabbit-user-bubble-bg) !important;
        color: var(--rabbit-user-bubble-text) !important;
        margin-left: auto !important;
        margin-right: 0 !important;
      }

      .rabbit-msg-assistant {
        background: var(--rabbit-assistant-bubble-bg) !important;
        color: var(--rabbit-assistant-bubble-text) !important;
        margin-left: 0 !important;
        margin-right: auto !important;
      }

      .rabbit-msg-user,
      .rabbit-msg-user p,
      .rabbit-msg-user span:not([class*="token"]):not([class*="hljs"]),
      .rabbit-msg-user li,
      .rabbit-msg-user ul,
      .rabbit-msg-user ol,
      .rabbit-msg-user strong,
      .rabbit-msg-user em,
      .rabbit-msg-user div {
        color: var(--rabbit-user-bubble-text) !important;
      }

      .rabbit-msg-assistant,
      .rabbit-msg-assistant p,
      .rabbit-msg-assistant span:not([class*="token"]):not([class*="hljs"]),
      .rabbit-msg-assistant li,
      .rabbit-msg-assistant ul,
      .rabbit-msg-assistant ol,
      .rabbit-msg-assistant strong,
      .rabbit-msg-assistant em,
      .rabbit-msg-assistant div {
        color: var(--rabbit-assistant-bubble-text) !important;
      }

      .rabbit-msg-assistant h1,
      .rabbit-msg-assistant h2,
      .rabbit-msg-assistant h3,
      .rabbit-msg-assistant h4,
      .rabbit-msg-assistant h5,
      .rabbit-msg-assistant h6,
      .rabbit-msg-assistant [role="heading"] {
        color: var(--rabbit-assistant-bubble-text) !important;
      }

      .rabbit-msg-target > div,
      .rabbit-msg-target > div > div,
      .rabbit-msg-target [class*="markdown"],
      .rabbit-msg-target [class*="prose"] {
        background: transparent !important;
      }

      /* =========================
         EMBEDDED CONTENT
         ========================= */

       .rabbit-embed-scope [class*="code-block"],
       .rabbit-embed-scope [class*="codeBlock"],
       .rabbit-embed-scope [class*="code_"],
       .rabbit-embed-scope [class*="card"],
       .rabbit-embed-scope [class*="preview"],
       .rabbit-embed-scope [class*="embed"],
       .rabbit-embed-scope [class*="quote"],
       .rabbit-embed-scope [class*="blockquote"] {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
      }

      ${embeddedThemeCss}

       .rabbit-embed-scope pre {
        padding: 12px !important;
        overflow: auto !important;
      }

       .rabbit-embed-scope pre > code,
       .rabbit-embed-scope pre code,
       .rabbit-embed-scope pre > div,
       .rabbit-embed-scope pre div {
        background: transparent !important;
        color: var(--rabbit-embed-text) !important;
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
      }

       .rabbit-embed-scope blockquote {
        border-left: 3px solid rgba(255,255,255,0.22) !important;
        padding: 10px 12px !important;
      }

    ` : '';

    ensureStyleTag().textContent = `
      :root {
        --rabbit-page-bg: ${pageBg};
        --rabbit-page-text: ${pageText};

        --rabbit-user-bubble-bg: ${userBubbleBg};
        --rabbit-user-bubble-text: ${userBubbleText};

        --rabbit-assistant-bubble-bg: ${assistantBubbleBg};
        --rabbit-assistant-bubble-text: ${assistantBubbleText};

        --rabbit-embed-bg: ${embedBg};
        --rabbit-embed-text: ${embedText};

        --rabbit-composer-bg: ${composerBg};
        --rabbit-composer-text: ${composerText};

        --rabbit-sidebar-bg: ${sidebarBg};
        --rabbit-sidebar-text: ${sidebarText};
        --rabbit-sidebar-hover: ${sidebarHover};
        --rabbit-sidebar-hover-text: ${sidebarHoverText};

        --rabbit-chat-text-align: ${settings.chatTextAlign};
        --rabbit-chat-font-family: ${fontValue};
        --rabbit-user-font-size: ${userFontSize};
        --rabbit-assistant-font-size: ${assistantFontSize};
        --rabbit-sidebar-font-size: ${sidebarFontSize};

        --rabbit-bubble-radius: ${settings.bubbleRadius}px;
        --rabbit-bubble-max-width: ${settings.bubbleMaxWidth}px;
        --rabbit-bubble-padding-y: ${settings.bubblePaddingY}px;
        --rabbit-bubble-padding-x: ${settings.bubblePaddingX}px;

        --rabbit-panel-opacity: ${panelOpacity};
        --rabbit-panel-opacity-hidden: ${hiddenOpacity};
      }

      ${themeCss}

      /* =========================
         Global chat font + alignment
         ========================= */

      .rabbit-msg-target,
      .rabbit-msg-target *,
      .rabbit-composer-shell,
      .rabbit-composer-shell *,
      [role="main"],
      [role="main"] article,
      [role="main"] article *,
      [data-testid*="conversation"],
      [data-testid*="conversation"] * {
        font-family: var(--rabbit-chat-font-family) !important;
      }

      body > div nav:first-of-type,
      body > div nav:first-of-type *,
      nav[aria-label*="Chat history"],
      nav[aria-label*="Chat history"] *,
      nav[aria-label*="chat history"],
      nav[aria-label*="chat history"] *,
      nav[aria-label*="sidebar"],
      nav[aria-label*="sidebar"] *,
      aside[class*="sidebar"],
      aside[class*="sidebar"] *,
      aside[data-testid*="sidebar"],
      aside[data-testid*="sidebar"] *,
      div[data-testid*="sidebar"],
      div[data-testid*="sidebar"] *,
      div[data-slot="sidebar"],
      div[data-slot="sidebar"] *,
      div[data-panel="sidebar"],
      div[data-panel="sidebar"] *,
      div[class*="sidebar"][class*="open"],
      div[class*="sidebar"][class*="open"] *,
      div[class*="sidebar"][class*="closed"],
      div[class*="sidebar"][class*="closed"] *,
      div[class*="sidebar"][class*="panel"],
      div[class*="sidebar"][class*="panel"] *,
      div[class*="left"][class*="panel"],
      div[class*="left"][class*="panel"] *,
      div[class*="left"][class*="rail"],
      div[class*="left"][class*="rail"] * {
        font-size: var(--rabbit-sidebar-font-size) !important;
      }

      .rabbit-msg-target,
      .rabbit-msg-target p,
      .rabbit-msg-target li,
      .rabbit-msg-target ul,
      .rabbit-msg-target ol,
      .rabbit-msg-target div,
      .rabbit-msg-target span,
      .rabbit-msg-target h1,
      .rabbit-msg-target h2,
      .rabbit-msg-target h3,
      .rabbit-msg-target h4,
      .rabbit-msg-target h5,
      .rabbit-msg-target h6,
      .rabbit-composer-shell,
      .rabbit-composer-shell textarea,
      .rabbit-composer-shell [contenteditable="true"] {
        text-align: var(--rabbit-chat-text-align) !important;
      }

      ${embedAlignmentCss}

      ${warningVisibilityCss}

      .rabbit-msg-user,
      .rabbit-msg-user *,
      .rabbit-composer-shell .rabbit-composer-input,
      .rabbit-composer-shell .rabbit-composer-input *,
      .rabbit-composer-shell textarea,
      .rabbit-composer-shell textarea *,
      .rabbit-composer-shell [contenteditable="true"],
      .rabbit-composer-shell [contenteditable="true"] * {
        font-size: var(--rabbit-user-font-size) !important;
      }

      .rabbit-msg-assistant,
      .rabbit-msg-assistant *,
      .rabbit-msg-assistant h1,
      .rabbit-msg-assistant h2,
      .rabbit-msg-assistant h3,
      .rabbit-msg-assistant h4,
      .rabbit-msg-assistant h5,
      .rabbit-msg-assistant h6,
      .rabbit-msg-assistant [role="heading"] {
        font-size: var(--rabbit-assistant-font-size) !important;
      }

      /* =========================
         THEME EDITOR
         ========================= */

      #${PANEL_ID} {
        --rabbit-panel-bg: ${panelUiBg};
        --rabbit-panel-bubble: ${panelUiBubble};
        --rabbit-panel-font: ${panelUiFont};
        --rabbit-panel-outline: ${panelUiOutline};
        --rabbit-panel-btn: ${panelUiButton};
        position: fixed;
        top: ${PANEL_OPEN_TOP}px;
        right: ${PANEL_OPEN_RIGHT}px;
        width: 322px;
        max-height: calc(100vh - 52px);
        overflow: auto;
        z-index: 2147483647;
        background: var(--rabbit-panel-bg);
        color: var(--rabbit-panel-font);
        border: 1px solid var(--rabbit-panel-outline);
        border-radius: 14px;
        box-shadow: 0 16px 44px rgba(0,0,0,0.40);
        font: 12px/1.26 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        opacity: var(--rabbit-panel-opacity);
        transition:
          opacity 160ms ease,
          background 160ms ease,
          border-color 160ms ease,
          box-shadow 160ms ease,
          transform 160ms ease;
      }

      #${PANEL_ID}.rabbit-panel-hidden {
        top: auto !important;
        left: auto !important;
        right: 12px !important;
        bottom: 400px !important;
        width: auto !important;
        max-width: calc(100vw - 24px);
        max-height: none !important;
        overflow: visible !important;
        border-radius: 999px !important;
        opacity: var(--rabbit-panel-opacity-hidden);
        background: transparent;
        border: none;
        box-shadow: none;
        padding: 0;
      }

      #${PANEL_ID}.rabbit-panel-hidden:hover {
        opacity: 0.8;
      }

      #${PANEL_ID}.rabbit-panel-hidden .rabbit-panel-body {
        display: none;
      }

      #${PANEL_ID}.rabbit-panel-hidden .rabbit-panel-header {
        display: none;
      }

      #${PANEL_ID} .rabbit-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        padding: 8px 10px;
        border-bottom: 1px solid var(--rabbit-panel-outline);
        user-select: none;
        cursor: move;
        background: var(--rabbit-panel-bubble);
        border-radius: 14px 14px 0 0;
      }

      #${PANEL_ID} .rabbit-panel-title {
        font-size: 12px;
        font-weight: 700;
      }

      #${PANEL_ID} .rabbit-panel-actions {
        display: flex;
        gap: 5px;
        flex-shrink: 0;
      }

      #${PANEL_ID} .rabbit-panel-launcher {
        display: none;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 6px;
      }

      #${PANEL_ID}.rabbit-panel-hidden .rabbit-panel-launcher {
        display: flex;
      }

      #${PANEL_ID}.rabbit-panel-hidden.rabbit-launcher-hidden-until-hover .rabbit-panel-launcher {
        opacity: 0;
        pointer-events: none;
      }

      #${PANEL_ID}.rabbit-panel-hidden.rabbit-launcher-hidden-until-hover:hover .rabbit-panel-launcher,
      #${PANEL_ID}.rabbit-panel-hidden.rabbit-launcher-hidden-until-hover:focus-within .rabbit-panel-launcher {
        opacity: 1;
        pointer-events: auto;
      }

      @media (hover: none), (pointer: coarse) {
        #${PANEL_ID}.rabbit-panel-hidden.rabbit-launcher-hidden-until-hover .rabbit-panel-launcher {
          opacity: 1;
          pointer-events: auto;
        }
      }

      #${PANEL_ID} .rabbit-launcher-btn {
        width: 48px;
        height: 48px;
        border: none;
        background-color: var(--rabbit-panel-font);
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        -webkit-mask-position: center;
        mask-position: center;
        -webkit-mask-size: contain;
        mask-size: contain;
        padding: 0;
        cursor: pointer;
        transition: transform 140ms ease, filter 140ms ease, opacity 140ms ease, background-color 140ms ease;
      }

      #${PANEL_ID} .rabbit-launcher-btn.rabbit-launcher-emblem {
        width: 72px;
        height: 72px;
      }

      #${PANEL_ID} .rabbit-panel-launcher .rabbit-launcher-btn[data-action="scroll-top"] {
        -webkit-mask-image: url(${LAUNCHER_ICON_UP});
        mask-image: url(${LAUNCHER_ICON_UP});
      }

      #${PANEL_ID} .rabbit-panel-launcher .rabbit-launcher-btn[data-action="scroll-bottom"] {
        -webkit-mask-image: url(${LAUNCHER_ICON_DOWN});
        mask-image: url(${LAUNCHER_ICON_DOWN});
      }

      #${PANEL_ID} .rabbit-panel-launcher .rabbit-launcher-btn[data-action="toggle"] {
        -webkit-mask-image: url(${LAUNCHER_ICON_EMBLEM});
        mask-image: url(${LAUNCHER_ICON_EMBLEM});
      }

      #${PANEL_ID} .rabbit-launcher-btn:hover {
        transform: translateY(-1px) scale(1.02);
      }

      #${PANEL_ID} .rabbit-launcher-btn:active {
        transform: translateY(1px) scale(0.98);
      }

      #${PANEL_ID} .rabbit-launcher-btn:focus-visible {
        outline: 2px solid var(--rabbit-panel-outline);
        outline-offset: 3px;
        border-radius: 999px;
      }

      #${PANEL_ID} .rabbit-panel-actions button,
      #${PANEL_ID} .rabbit-actions-row button,
      #${PANEL_ID} .rabbit-nav-grid button,
      #${PANEL_ID} .rabbit-prompt-actions button {
        appearance: none;
        border: 1px solid var(--rabbit-panel-outline);
        background: var(--rabbit-panel-btn);
        color: var(--rabbit-panel-font);
        border-radius: 8px;
        padding: 3px 7px;
        min-height: 24px;
        cursor: pointer;
        font-size: 11px;
      }

      #${PANEL_ID} select,
      #${PANEL_ID} input[type="text"] {
        appearance: none;
        border: 1px solid var(--rabbit-panel-outline);
        background: var(--rabbit-panel-bubble);
        color: var(--rabbit-panel-font);
        border-radius: 8px;
        padding: 3px 7px;
        min-height: 24px;
        font-size: 11px;
      }

      #${PANEL_ID} select {
        cursor: pointer;
      }

      #${PANEL_ID} .rabbit-panel-body {
        padding: 6px;
      }

      #${PANEL_ID} .rabbit-page {
        display: none;
      }

      #${PANEL_ID} .rabbit-page.active {
        display: block;
      }

      #${PANEL_ID} .rabbit-nav-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
      }

      #${PANEL_ID} .rabbit-nav-grid button {
        padding: 8px 10px;
        font-weight: 600;
      }

      #${PANEL_ID} .rabbit-group {
        margin-bottom: 6px;
        padding: 6px 7px;
        background: var(--rabbit-panel-bubble);
        border: 1px solid var(--rabbit-panel-outline);
        border-radius: 9px;
      }

      #${PANEL_ID} .rabbit-group-title {
        font-weight: 700;
        font-size: 11px;
        margin-bottom: 4px;
      }

      #${PANEL_ID} .rabbit-row {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 6px;
        margin: 4px 0;
      }

      #${PANEL_ID} .rabbit-row span:first-child {
        font-size: 11px;
        line-height: 1.15;
      }

      #${PANEL_ID} .rabbit-font-row {
        grid-template-columns: 1fr;
        gap: 5px;
      }

      #${PANEL_ID} .rabbit-font-row input[type="text"] {
        width: 100%;
        box-sizing: border-box;
      }

      #${PANEL_ID} input[type="color"] {
        width: 30px;
        height: 22px;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
      }

      #${PANEL_ID} .rabbit-color-control {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      #${PANEL_ID} .rabbit-color-hex {
        width: 84px;
        box-sizing: border-box;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
        text-transform: uppercase;
      }

      #${PANEL_ID} input[type="range"] {
        width: 96px;
      }

      #${PANEL_ID} textarea {
        width: 100%;
        min-height: 84px;
        resize: vertical;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.04);
        color: #fff;
        padding: 6px 8px;
        font-size: 11px;
        box-sizing: border-box;
      }

      #${PANEL_ID} .rabbit-range-wrap {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      #${PANEL_ID} .rabbit-edit-link {
        font-size: 10px;
        opacity: 0.8;
        cursor: pointer;
        text-transform: uppercase;
      }

      #${PANEL_ID} .rabbit-edit-link:hover {
        opacity: 1;
      }

      #${PANEL_ID} .rabbit-layout-slider-skin input[type="range"] {
        --rabbit-layout-track-fill: 100%;
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        width: 104px;
      }

      #${PANEL_ID} .rabbit-layout-slider-skin input[type="range"]::-webkit-slider-runnable-track {
        height: 5px;
        border-radius: 10px;
        background: linear-gradient(to right,
          var(--rabbit-panel-font) 0%,
          var(--rabbit-panel-font) var(--rabbit-layout-track-fill),
          rgba(255,255,255,0.2) var(--rabbit-layout-track-fill),
          rgba(255,255,255,0.2) 100%);
      }

      #${PANEL_ID} .rabbit-layout-slider-skin input[type="range"]::-moz-range-track {
        height: 5px;
        border-radius: 10px;
        background: linear-gradient(to right,
          var(--rabbit-panel-font) 0%,
          var(--rabbit-panel-font) var(--rabbit-layout-track-fill),
          rgba(255,255,255,0.2) var(--rabbit-layout-track-fill),
          rgba(255,255,255,0.2) 100%);
      }

      #${PANEL_ID} .rabbit-layout-slider-skin input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 10px;
        height: 20px;
        margin-top: -8px;
        border-radius: 10px;
        border: 2px solid var(--rabbit-panel-bg);
        background: var(--rabbit-panel-font);
      }

      #${PANEL_ID} .rabbit-layout-slider-skin input[type="range"]::-moz-range-thumb {
        width: 10px;
        height: 20px;
        border-radius: 10px;
        border: 2px solid var(--rabbit-panel-bg);
        background: var(--rabbit-panel-font);
      }

      #${PANEL_ID} .rabbit-range-wrap span {
        font-size: 11px;
        min-width: 34px;
        text-align: right;
      }

      #${PANEL_ID} .rabbit-actions-row {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
        margin-top: 5px;
      }

      #${PANEL_ID} .rabbit-prompt-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      #${PANEL_ID} .rabbit-prompt-section-title {
        margin-top: 6px;
        font-size: 10px;
        opacity: 0.9;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      #${PANEL_ID} .rabbit-prompt-item {
        border: 1px solid var(--rabbit-panel-outline);
        background: var(--rabbit-panel-bubble);
        border-radius: 8px;
        padding: 6px 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      #${PANEL_ID} .rabbit-prompt-item.is-pinned {
        border-color: #ffd54f;
        box-shadow: 0 0 0 1px rgba(255, 213, 79, 0.25) inset;
      }

      #${PANEL_ID} .rabbit-prompt-title {
        font-weight: 700;
        font-size: 11px;
      }

      #${PANEL_ID} .rabbit-prompt-snippet {
        font-size: 10px;
        opacity: 0.78;
        white-space: pre-wrap;
      }

      #${PANEL_ID} .rabbit-prompt-tags {
        font-size: 10px;
        opacity: 0.68;
      }

      #${PANEL_ID} .rabbit-prompt-actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      #${PANEL_ID} .rabbit-note {
        margin-top: 4px;
        font-size: 10px;
        line-height: 1.2;
        opacity: 0.72;
      }

      .rabbit-prompt-float {
        position: fixed;
        z-index: 2147483644;
        width: min(320px, calc(100vw - 20px));
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.22);
        background: rgba(16, 18, 28, 0.94);
        color: #eaf2ff;
        box-shadow: 0 8px 24px rgba(0,0,0,0.45);
      }

      .rabbit-prompt-float-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 7px 9px;
        border-bottom: 1px solid rgba(255,255,255,0.16);
        cursor: move;
        gap: 8px;
      }

      .rabbit-prompt-float-head strong {
        font-size: 11px;
      }

      .rabbit-prompt-float-body {
        padding: 8px 9px;
        font-size: 11px;
        line-height: 1.35;
        max-height: 120px;
        overflow: auto;
        white-space: pre-wrap;
      }

      .rabbit-prompt-float-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 0 9px 9px;
      }

      .rabbit-prompt-float button {
        font-size: 10px;
        border-radius: 7px;
      }

      .rabbit-prompt-review-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483645;
        background: rgba(0, 0, 0, 0.62);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;
      }

      .rabbit-prompt-review-card {
        width: min(760px, calc(100vw - 16px));
        max-height: min(82vh, 760px);
        overflow: auto;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.22);
        background: #10131f;
        color: #eaf2ff;
        padding: 12px;
      }

      .rabbit-prompt-review-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }

      .rabbit-prompt-review-meta {
        margin-top: 8px;
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        font-size: 11px;
        opacity: 0.86;
      }

      .rabbit-prompt-review-text {
        margin-top: 10px;
        white-space: pre-wrap;
        font-size: 12px;
        line-height: 1.45;
      }

      .rabbit-toast-notification {
        position: fixed;
        right: 14px;
        bottom: 14px;
        z-index: 2147483646;
        background: var(--rabbit-panel-bg, #000900);
        color: var(--rabbit-panel-font, #00ff75);
        border: 1px solid var(--rabbit-panel-outline, #00fddf);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 12px;
        box-shadow: 0 10px 28px rgba(0,0,0,0.45);
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 160ms ease, transform 160ms ease;
        pointer-events: none;
      }

      .rabbit-toast-notification.show {
        opacity: 1;
        transform: translateY(0);
      }

      #${PANEL_ID} .rabbit-modal {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.5);
      }

      #${PANEL_ID} .rabbit-modal.open {
        display: flex;
      }

      #${PANEL_ID} .rabbit-modal-card {
        width: min(560px, calc(100vw - 24px));
        max-height: min(78vh, 640px);
        overflow: auto;
        background: var(--rabbit-panel-bg);
        border: 1px solid var(--rabbit-panel-outline);
        border-radius: 12px;
        padding: 10px;
      }

      #${PANEL_ID} .rabbit-chat-list {
        max-height: 45vh;
        overflow: auto;
        border: 1px solid var(--rabbit-panel-outline);
        border-radius: 8px;
        padding: 6px;
        margin: 8px 0;
      }

      #${PANEL_ID} .rabbit-chat-item {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 8px;
        margin: 4px 0;
        align-items: center;
      }

      .rabbit-sidebar-delete-btn {
        border: 1px solid currentColor;
        border-radius: 6px;
        background: transparent;
        color: inherit;
        min-width: 24px;
        height: 24px;
        font-size: 12px;
        cursor: pointer;
      }
    `;
  }

  function getPanelTitle(page) {
    switch (page) {
      case 'themes':
        return 'Themes';
      case 'layout':
        return 'Layout';
      case 'font':
        return 'Font';
      case 'prompts':
        return 'Prompts';
      case 'settings':
        return 'Settings';
      case 'ui-theme':
        return 'UI Theme';
      default:
        return 'GPT-Unleashed';
    }
  }

  function updatePanelHeader(panel) {
    if (!panel) return;
    const title = panel.querySelector('[data-role="panel-title"]');
    const homeBtn = panel.querySelector('[data-action="nav-home"]');
    const toggle = panel.querySelector('[data-role="panel-toggle"]');
    if (title) {
      title.textContent = settings.panelHidden ? 'GPT-Unleashed' : getPanelTitle(settings.panelPage);
    }

    if (homeBtn) {
      homeBtn.style.display = (!settings.panelHidden && settings.panelPage !== 'home') ? 'inline-flex' : 'none';
    }

    if (toggle) {
      toggle.textContent = settings.panelHidden ? 'Open' : 'Minimize';
    }

  }

  function setActivePage(panel, page, shouldSave = true) {
    if (!panel) return;
    const nextPage = PANEL_PAGES.has(page) ? page : 'home';
    settings.panelPage = nextPage;

    panel.querySelectorAll('.rabbit-page').forEach((node) => {
      const active = node.getAttribute('data-page') === nextPage;
      node.classList.toggle('active', active);
    });

    if (nextPage === 'prompts') {
      renderPromptsList(panel);
      renderGlobalFilesList(panel);
    }

    applyCustomTooltips(panel);
    updatePanelHeader(panel);
    if (shouldSave) scheduleSaveSettings();
  }

  function updatePanelHiddenState(panel) {
    if (!panel) return;
    panel.classList.toggle('rabbit-panel-hidden', !!settings.panelHidden);
    panel.classList.toggle('rabbit-launcher-hidden-until-hover', !!settings.launcherHiddenUntilHover);

    const header = panel.querySelector('.rabbit-panel-header');
    if (header) {
      header.style.cursor = settings.panelHidden ? 'default' : 'move';
    }

    updatePanelHeader(panel);
  }

  function ensurePanelOnscreen(panel) {
    if (!panel || settings.panelHidden) return;
    const rect = panel.getBoundingClientRect();
    if (!Number.isFinite(rect.width) || rect.width <= 0) return;

    const padding = 8;
    const maxLeft = Math.max(padding, window.innerWidth - rect.width - padding);
    const maxTop = Math.max(padding, window.innerHeight - rect.height - padding);
    let changed = false;

    if (rect.left < padding || rect.right > window.innerWidth - padding) {
      const nextLeft = Math.min(Math.max(rect.left, padding), maxLeft);
      panel.style.left = `${nextLeft}px`;
      panel.style.right = 'auto';
      settings.panelLeft = nextLeft;
      changed = true;
    }

    if (rect.top < padding || rect.bottom > window.innerHeight - padding) {
      const nextTop = Math.min(Math.max(rect.top, padding), maxTop);
      panel.style.top = `${nextTop}px`;
      settings.panelTop = nextTop;
      changed = true;
    }

    if (changed) saveSettings();
  }

  const LAYOUT_SLIDER_KEYS = new Set(['bubbleRadius', 'bubbleMaxWidth', 'bubblePaddingY', 'bubblePaddingX']);

  function updateLayoutControls(panel) {
    if (!panel) return;
    const layoutPage = panel.querySelector('[data-page="layout"]');
    if (!(layoutPage instanceof HTMLElement)) return;

    layoutPage.classList.toggle('rabbit-layout-slider-skin', !!settings.layoutSliderSkinEnabled);

    layoutPage.querySelectorAll('[data-layout-advanced]').forEach((node) => {
      if (node instanceof HTMLElement) node.style.display = settings.layoutAdvancedControlsEnabled ? '' : 'none';
    });

    layoutPage.querySelectorAll('input[type="range"][data-key]').forEach((node) => {
      if (!(node instanceof HTMLInputElement)) return;
      if (!LAYOUT_SLIDER_KEYS.has(node.dataset.key || '')) return;
      const min = Number(node.min) || 0;
      const max = Number(node.max) || 100;
      const value = Number(node.value);
      const ratio = max === min ? 0 : ((value - min) / (max - min)) * 100;
      node.style.setProperty('--rabbit-layout-track-fill', settings.layoutTrackFillEnabled ? `${ratio}%` : '100%');

      const wrap = node.closest('.rabbit-range-wrap');
      if (!(wrap instanceof HTMLElement)) return;
      let editBtn = wrap.querySelector('[data-action="layout-edit"]');
      if (!editBtn) {
        editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.dataset.action = 'layout-edit';
        editBtn.dataset.key = node.dataset.key || '';
        editBtn.className = 'rabbit-edit-link';
        editBtn.textContent = 'Edit';
        wrap.appendChild(editBtn);
      }
      editBtn.style.display = settings.layoutEditEnabled ? '' : 'none';
    });
  }

  function updateUiThemeControls(panel) {
    if (!panel) return;
    const uiPage = panel.querySelector('[data-page="ui-theme"]');
    if (!(uiPage instanceof HTMLElement)) return;
    const lockManualColors = !!settings.uiMatchThemeEnabled;
    uiPage.querySelectorAll('input[type="color"][data-key^="panelUi"]').forEach((node) => {
      if (!(node instanceof HTMLInputElement)) return;
      node.disabled = lockManualColors;
    });
  }

  function applyPageOptionTooltips(panel) {
    if (!panel) return;
    const homeTips = {
      'nav-themes': 'Open color controls for page, bubbles, embeds, composer, and sidebar.',
      'nav-layout': 'Open controls for alignment, radius, width, padding, and slider behavior.',
      'nav-font': 'Adjust font family and font sizes across chat and sidebar.',
      'nav-prompts': 'Manage saved prompts and insert them into chats quickly.',
      'export-chat': 'Select one or more chats from the sidebar and export them as Markdown files.',
      'delete-chats-open': 'Select and delete sidebar chats from a checklist.',
      'nav-settings': 'Open feature toggles, panel options, and userscript export.'
    };
    const layoutTips = {
      chatTextAlign: 'Sets chat text alignment for conversation content.',
      bubbleRadius: 'Controls the roundness of message bubble corners.',
      bubbleMaxWidth: 'Sets the maximum width for message bubbles.',
      bubblePaddingY: 'Adds vertical space inside message bubbles.',
      bubblePaddingX: 'Adds horizontal space inside message bubbles.',
      layoutEditEnabled: 'Shows an Edit button to type exact slider values.',
      layoutWheelAdjustEnabled: 'Allows mouse-wheel nudging on layout sliders.',
      layoutTrackFillEnabled: 'Displays filled track progress for each layout slider.',
      layoutSliderSkinEnabled: 'Uses custom slider visuals on the Layout page.',
      layoutAdvancedControlsEnabled: 'Shows or hides advanced layout utility controls.',
      layoutEmbedAlignmentLock: "Keeps embedded blocks at their native alignment even if chat alignment changes."
    };
    const layoutActionTips = {
      reset: 'Restore all settings to defaults.',
      export: 'Copy current settings JSON to clipboard.',
      import: 'Paste settings JSON to import and apply it.'
    };
    const themeActionTips = {
      'theme-save': 'Save the current color/toggle configuration as a reusable theme.',
      'theme-export': 'Download the current theme as JSON.',
      'theme-import': 'Import a theme JSON payload and apply it.'
    };
    const settingsTips = {
      featureThemeEnabled: 'Enable or disable all theme color styling applied by the script.',
      featureFontEnabled: 'Enable or disable script-managed chat and sidebar font settings.',
      hideGptWarning: 'Hide the ChatGPT warning line at the bottom of the page.',
      launcherHiddenUntilHover: 'When enabled, the minimized launcher stays hidden until you hover over its area.',
      moveGuiDragEnabled: 'Enables click-and-drag repositioning for the panel header and minimized launcher emblem.',
      codeSyntaxHighlightEnabled: 'Turn syntax highlighting colors for embedded code blocks on or off.',
      uiMatchThemeEnabled: 'Use the currently selected theme to automatically style the panel UI colors.'
    };
    const settingsActionTips = {
      'nav-ui-theme': 'Open panel UI color controls.'
    };

    panel.querySelectorAll('[data-page="home"] button[data-action]').forEach((btn) => {
      if (!(btn instanceof HTMLButtonElement)) return;
      const tip = homeTips[btn.dataset.action || ''];
      if (tip) {
        btn.title = tip;
        createCustomTooltip(btn, tip, 'left');
      }
    });

    panel.querySelectorAll('.rabbit-panel-actions button').forEach((btn) => {
      if (!(btn instanceof HTMLButtonElement)) return;
      const action = btn.dataset.action;
      if (action === 'toggle') createCustomTooltip(btn, 'Minimize panel', 'bottom');
      if (action === 'nav-home') createCustomTooltip(btn, 'Home', 'bottom');
    });

    panel.querySelectorAll('[data-page="layout"] [data-key]').forEach((control) => {
      if (!(control instanceof HTMLElement)) return;
      const key = control.dataset.key || '';
      const tip = layoutTips[key];
      if (!tip) return;
      control.title = tip;
      const row = control.closest('.rabbit-row');
      if (row instanceof HTMLElement) {
        row.title = tip;
        const label = row.querySelector('span');
        if (label instanceof HTMLElement) label.title = tip;
      }
    });

    panel.querySelectorAll('[data-page="layout"] button[data-action]').forEach((btn) => {
      if (!(btn instanceof HTMLButtonElement)) return;
      const tip = layoutActionTips[btn.dataset.action || ''];
      if (tip) btn.title = tip;
    });

    panel.querySelectorAll('[data-page="themes"] button[data-action]').forEach((btn) => {
      if (!(btn instanceof HTMLButtonElement)) return;
      const tip = themeActionTips[btn.dataset.action || ''];
      if (tip) btn.title = tip;
    });

    panel.querySelectorAll('[data-page="settings"] [data-key]').forEach((control) => {
      if (!(control instanceof HTMLElement)) return;
      const key = control.dataset.key || '';
      const tip = settingsTips[key];
      if (!tip) return;
      control.title = tip;
      const row = control.closest('.rabbit-row');
      if (row instanceof HTMLElement) {
        row.title = tip;
        const label = row.querySelector('span');
        if (label instanceof HTMLElement) label.title = tip;
      }
    });

    panel.querySelectorAll('[data-page="themes"] [data-key]').forEach((control) => {
      if (!(control instanceof HTMLElement)) return;
      const key = control.dataset.key || '';
      const tip = settingsTips[key];
      if (!tip) return;
      control.title = tip;
      const row = control.closest('.rabbit-row');
      if (row instanceof HTMLElement) {
        row.title = tip;
        const label = row.querySelector('span');
        if (label instanceof HTMLElement) label.title = tip;
      }
    });

    panel.querySelectorAll('[data-page="settings"] button[data-action]').forEach((btn) => {
      if (!(btn instanceof HTMLButtonElement)) return;
      const tip = settingsActionTips[btn.dataset.action || ''];
      if (tip) btn.title = tip;
    });
  }

  function applyCustomTooltips(panel) {
    if (!(panel instanceof HTMLElement)) return;

    panel.querySelectorAll('.rabbit-nav-grid button').forEach((btn) => {
      const tips = {
        'nav-themes': 'Customize colors',
        'nav-layout': 'Adjust bubble layout',
        'nav-font': 'Change fonts',
        'nav-prompts': 'Manage saved prompts',
        'export-chat': 'Export chat as Markdown',
        'delete-chats-open': 'Delete sidebar chats',
        'nav-settings': 'Script settings'
      };
      const action = btn.dataset.action || '';
      if (tips[action]) createCustomTooltip(btn, tips[action], 'left');
    });

    panel.querySelectorAll('.rabbit-panel-actions button').forEach((btn) => {
      const action = btn.dataset.action || '';
      if (action === 'toggle') createCustomTooltip(btn, 'Minimize panel', 'bottom');
      if (action === 'nav-home') createCustomTooltip(btn, 'Home', 'bottom');
    });

    panel.querySelectorAll('.rabbit-prompt-actions button').forEach((btn) => {
      const tips = {
        'prompt-insert': 'Insert into composer',
        'prompt-new-chat': 'Start new chat with this prompt',
        'prompt-favorite-toggle': 'Toggle favorite',
        'prompt-pin-toggle': 'Pin to floating card',
        'prompt-review': 'Review full prompt',
        'prompt-expand-toggle': 'Expand/collapse',
        'prompt-enhance': 'Enhance with AI'
      };
      const action = btn.dataset.action || '';
      if (tips[action]) createCustomTooltip(btn, tips[action], 'top');
    });
  }

  function makePanel() {
    let panel = document.getElementById(PANEL_ID);
    if (panel) return panel;

    if (!document.body) {
      setTimeout(makePanel, 80);
      return null;
    }

    panel = document.createElement('div');
    panel.id = PANEL_ID;

    panel.innerHTML = `
      <div class="rabbit-panel-launcher" aria-label="GPT-Unleashed Launcher">
        <button type="button" class="rabbit-launcher-btn rabbit-launcher-up" data-action="scroll-top" aria-label="Scroll to top" title="Scroll to top"></button>
        <button type="button" class="rabbit-launcher-btn rabbit-launcher-emblem" data-action="toggle" aria-label="Open GPT-Unleashed" title="Open GPT-Unleashed"></button>
        <button type="button" class="rabbit-launcher-btn rabbit-launcher-down" data-action="scroll-bottom" aria-label="Scroll to bottom" title="Scroll to bottom"></button>
      </div>
      <div class="rabbit-panel-header">
        <div class="rabbit-panel-title" data-role="panel-title">GPT-Unleashed</div>
        <div class="rabbit-panel-actions">
          <button type="button" data-action="nav-home">Home</button>
          <button type="button" data-action="toggle" data-role="panel-toggle">${settings.panelHidden ? 'Open' : 'Minimize'}</button>
        </div>
      </div>
      <div class="rabbit-panel-body">
        <div class="rabbit-page" data-page="home">
          <div class="rabbit-group">
            <div class="rabbit-group-title">Navigate</div>
            <div class="rabbit-nav-grid">
              <button type="button" data-action="nav-themes">Themes</button>
              <button type="button" data-action="nav-layout">Layout</button>
              <button type="button" data-action="nav-font">Font</button>
              <button type="button" data-action="nav-prompts">Prompts</button>
              <button type="button" data-action="export-chat">Export Chat</button>
              <button type="button" data-action="delete-chats-open">Delete Chats</button>
              <button type="button" data-action="nav-settings">Settings</button>
            </div>
            <div class="rabbit-note">Select a section or export the current chat as a Markdown file.</div>
          </div>
        </div>

        <div class="rabbit-page" data-page="themes">
          <div class="rabbit-group">
            <div class="rabbit-group-title">Theme Manager</div>
            <label class="rabbit-row">
              <span>Enable theme styling</span>
              <input type="checkbox" data-key="featureThemeEnabled" ${settings.featureThemeEnabled ? 'checked' : ''}>
            </label>
            <label class="rabbit-row rabbit-font-row">
              <span>Saved themes</span>
              <select data-role="theme-select"></select>
            </label>
            <label class="rabbit-row rabbit-font-row">
              <span>Theme name</span>
              <input type="text" data-role="theme-name" placeholder="My custom theme">
            </label>
            <div class="rabbit-actions-row">
              <button type="button" data-action="theme-save">Save Theme</button>
              <button type="button" data-action="theme-export">Export Theme</button>
              <button type="button" data-action="theme-import">Import Theme</button>
            </div>
            <div class="rabbit-note">Choose any preset, save your own variants, or import/export JSON files.</div>
          </div>

          <div class="rabbit-group">
            <div class="rabbit-group-title">Page</div>
            <label class="rabbit-row">
              <span>Enable section</span>
              <input type="checkbox" data-key="themePageEnabled" ${settings.themePageEnabled ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Background</span>
              ${renderColorControl('pageBg')}
            </label>
            <label class="rabbit-row">
              <span>Text</span>
              ${renderColorControl('pageText')}
            </label>
          </div>

          <div class="rabbit-group">
            <div class="rabbit-group-title">Your Bubble</div>
            <label class="rabbit-row">
              <span>Enable section</span>
              <input type="checkbox" data-key="themeUserBubbleEnabled" ${settings.themeUserBubbleEnabled ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Bubble background</span>
              ${renderColorControl('userBubbleBg')}
            </label>
            <label class="rabbit-row">
              <span>Font color</span>
              ${renderColorControl('userBubbleText')}
            </label>
          </div>

          <div class="rabbit-group">
            <div class="rabbit-group-title">ChatGPT Bubble</div>
            <label class="rabbit-row">
              <span>Enable section</span>
              <input type="checkbox" data-key="themeAssistantBubbleEnabled" ${settings.themeAssistantBubbleEnabled ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Bubble background</span>
              ${renderColorControl('assistantBubbleBg')}
            </label>
            <label class="rabbit-row">
              <span>Font color</span>
              ${renderColorControl('assistantBubbleText')}
            </label>
          </div>

          <div class="rabbit-group">
            <div class="rabbit-group-title">Embedded Content</div>
            <label class="rabbit-row">
              <span>Enable section</span>
              <input type="checkbox" data-key="themeEmbedEnabled" ${settings.themeEmbedEnabled ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Background</span>
              ${renderColorControl('embedBg')}
            </label>
            <label class="rabbit-row">
              <span>Font color</span>
              ${renderColorControl('embedText')}
            </label>
          </div>

          <div class="rabbit-group">
            <div class="rabbit-group-title">Composer</div>
            <label class="rabbit-row">
              <span>Enable section</span>
              <input type="checkbox" data-key="themeComposerEnabled" ${settings.themeComposerEnabled ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Bubble background</span>
              ${renderColorControl('composerBg')}
            </label>
            <label class="rabbit-row">
              <span>Input text</span>
              ${renderColorControl('composerText')}
            </label>
          </div>

          <div class="rabbit-group">
            <div class="rabbit-group-title">Sidebar</div>
            <label class="rabbit-row">
              <span>Enable section</span>
              <input type="checkbox" data-key="themeSidebarEnabled" ${settings.themeSidebarEnabled ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Background</span>
              ${renderColorControl('sidebarBg')}
            </label>
            <label class="rabbit-row">
              <span>Text</span>
              ${renderColorControl('sidebarText')}
            </label>
            <label class="rabbit-row">
              <span>Hover color</span>
              ${renderColorControl('sidebarHover')}
            </label>
            <label class="rabbit-row">
              <span>Hover font color</span>
              ${renderColorControl('sidebarHoverText')}
            </label>
          </div>
        </div>

        <div class="rabbit-page" data-page="layout">
          <div class="rabbit-group">
            <div class="rabbit-group-title">Layout</div>
            <label class="rabbit-row">
              <span>Alignment</span>
              <select data-key="chatTextAlign">
                <option value="left" ${settings.chatTextAlign === 'left' ? 'selected' : ''}>Left</option>
                <option value="center" ${settings.chatTextAlign === 'center' ? 'selected' : ''}>Center</option>
                <option value="right" ${settings.chatTextAlign === 'right' ? 'selected' : ''}>Right</option>
              </select>
            </label>
            <label class="rabbit-row">
              <span>Embedded text isn't effected by alignment changes</span>
              <input type="checkbox" data-key="layoutEmbedAlignmentLock" ${settings.layoutEmbedAlignmentLock ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Corner radius</span>
              <span class="rabbit-range-wrap">
                <input type="range" min="6" max="40" step="1" data-key="bubbleRadius" value="${settings.bubbleRadius}">
                <span data-val="bubbleRadius">${settings.bubbleRadius}px</span>
              </span>
            </label>

            <label class="rabbit-row">
              <span>Max width</span>
              <span class="rabbit-range-wrap">
                <input type="range" min="260" max="1200" step="10" data-key="bubbleMaxWidth" value="${settings.bubbleMaxWidth}">
                <span data-val="bubbleMaxWidth">${settings.bubbleMaxWidth}px</span>
              </span>
            </label>

            <label class="rabbit-row">
              <span>Padding Y</span>
              <span class="rabbit-range-wrap">
                <input type="range" min="6" max="28" step="1" data-key="bubblePaddingY" value="${settings.bubblePaddingY}">
                <span data-val="bubblePaddingY">${settings.bubblePaddingY}px</span>
              </span>
            </label>

            <label class="rabbit-row">
              <span>Padding X</span>
              <span class="rabbit-range-wrap">
                <input type="range" min="8" max="40" step="1" data-key="bubblePaddingX" value="${settings.bubblePaddingX}">
                <span data-val="bubblePaddingX">${settings.bubblePaddingX}px</span>
              </span>
            </label>

            <div class="rabbit-group-title">Slider UX</div>
            <label class="rabbit-row">
              <span>Inline Edit button</span>
              <input type="checkbox" data-key="layoutEditEnabled" ${settings.layoutEditEnabled ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Mouse-wheel adjust</span>
              <input type="checkbox" data-key="layoutWheelAdjustEnabled" ${settings.layoutWheelAdjustEnabled ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Filled slider track</span>
              <input type="checkbox" data-key="layoutTrackFillEnabled" ${settings.layoutTrackFillEnabled ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Custom slider style</span>
              <input type="checkbox" data-key="layoutSliderSkinEnabled" ${settings.layoutSliderSkinEnabled ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Show advanced controls</span>
              <input type="checkbox" data-key="layoutAdvancedControlsEnabled" ${settings.layoutAdvancedControlsEnabled ? 'checked' : ''}>
            </label>

            <div class="rabbit-actions-row" data-layout-advanced>
              <button type="button" data-action="reset">Reset</button>
              <button type="button" data-action="export">Export</button>
              <button type="button" data-action="import">Import</button>
            </div>

            <div class="rabbit-note">Layout settings control bubble size and spacing.</div>
          </div>
        </div>

        <div class="rabbit-page" data-page="font">
          <div class="rabbit-group">
            <div class="rabbit-group-title">Font</div>
            <label class="rabbit-row rabbit-font-row">
              <span>Font family</span>
              <input type="text" data-key="chatFontFamily" value="${escapeHtml(settings.chatFontFamily)}" placeholder='Example: Inter, Arial, sans-serif'>
            </label>
            <div class="rabbit-note">Use an installed font name, or a fallback stack like "Segoe UI, Arial, sans-serif".</div>
            <label class="rabbit-row">
              <span>User responses + input bar</span>
              <span class="rabbit-range-wrap">
                <input type="range" min="4" max="32" step="1" data-key="userFontSize" value="${settings.userFontSize}">
                <span data-val="userFontSize">${settings.userFontSize}px</span>
              </span>
            </label>
            <label class="rabbit-row">
              <span>ChatGPT responses + headings</span>
              <span class="rabbit-range-wrap">
                <input type="range" min="4" max="32" step="1" data-key="assistantFontSize" value="${settings.assistantFontSize}">
                <span data-val="assistantFontSize">${settings.assistantFontSize}px</span>
              </span>
            </label>
            <label class="rabbit-row">
              <span>Sidebar font size</span>
              <span class="rabbit-range-wrap">
                <input type="range" min="4" max="28" step="1" data-key="sidebarFontSize" value="${settings.sidebarFontSize}">
                <span data-val="sidebarFontSize">${settings.sidebarFontSize}px</span>
              </span>
            </label>
          </div>
        </div>

        <div class="rabbit-page" data-page="prompts">
          <div class="rabbit-group">
            <div class="rabbit-group-title">Saved Prompts</div>
            <div class="rabbit-actions-row">
              <button type="button" data-action="prompt-open-explorer">Search / Expand Prompt List</button>
              <button type="button" data-action="prompt-open-favorites">View Favorite Prompts</button>
              <button type="button" data-action="prompt-enhance-current">Enhance Current Prompt with AI</button>
            </div>
            <div class="rabbit-prompt-list" data-role="prompt-list"></div>
          </div>

          <div class="rabbit-group">
            <div class="rabbit-group-title">Add Prompt</div>
            <label class="rabbit-row rabbit-font-row">
              <span>Title</span>
              <input type="text" data-role="prompt-title" placeholder="Prompt title">
            </label>
            <label class="rabbit-row rabbit-font-row">
              <span>Prompt text</span>
              <textarea data-role="prompt-text" placeholder="Type or paste a prompt..."></textarea>
            </label>
            <label class="rabbit-row rabbit-font-row">
              <span>Prompt type</span>
              <select data-role="prompt-type">
                <option value="user">User Prompt</option>
                <option value="ai">AI Prompt</option>
              </select>
              <span>Tags</span>
              <input type="text" data-role="prompt-tags" placeholder="productivity, coding, writing">
            </label>
            <div class="rabbit-actions-row">
              <button type="button" data-action="prompt-add">Save Prompt</button>
              <button type="button" data-action="prompt-insert-draft">Insert Now</button>
              <button type="button" data-action="prompt-enhance-draft">Enhance Draft</button>
            </div>
          </div>

          <div class="rabbit-group">
            <div class="rabbit-group-title">Attached Files</div>
            <div id="rabbit-global-files-list" class="rabbit-note">No files attached.</div>
            <div class="rabbit-actions-row">
              <button type="button" data-action="file-add">Add File</button>
              <button type="button" data-action="file-clear-all">Clear All</button>
            </div>
            <input type="file" id="rabbit-file-input" style="display:none" multiple>
          </div>

          <div class="rabbit-group">
            <div class="rabbit-group-title">Import Prompts</div>
            <label class="rabbit-row rabbit-font-row">
              <span>From file</span>
              <input type="file" data-action="prompt-file" accept=".txt,.json">
            </label>
            <label class="rabbit-row rabbit-font-row">
              <span>From URL</span>
              <input type="text" data-role="prompt-url" placeholder="https://example.com/prompts.json">
            </label>
            <div class="rabbit-actions-row">
              <button type="button" data-action="prompt-export-json">Export Prompts (JSON)</button>
              <button type="button" data-action="prompt-import-file">Import Prompts (File)</button>
              <button type="button" data-action="prompt-fetch">Fetch URL</button>
              <button type="button" data-action="prompt-export">Export JSON</button>
            </div>
            <div class="rabbit-note">Supports JSON arrays of {title,text} or plain text.</div>
            <div class="rabbit-note" data-role="prompt-status"></div>
          </div>
        </div>

        <div class="rabbit-page" data-page="settings">
          <div class="rabbit-group">
            <div class="rabbit-group-title">Features</div>
            <label class="rabbit-row">
              <span>Theme styling</span>
              <input type="checkbox" data-key="featureThemeEnabled" ${settings.featureThemeEnabled ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Font override</span>
              <input type="checkbox" data-key="featureFontEnabled" ${settings.featureFontEnabled ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Hide GPT warning</span>
              <input type="checkbox" data-key="hideGptWarning" ${settings.hideGptWarning ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Hide launcher until hover</span>
              <input type="checkbox" data-key="launcherHiddenUntilHover" ${settings.launcherHiddenUntilHover ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Move GUI by click + drag</span>
              <input type="checkbox" data-key="moveGuiDragEnabled" ${settings.moveGuiDragEnabled ? 'checked' : ''}>
            </label>
          </div>

          <div class="rabbit-group">
            <div class="rabbit-group-title">UI Theme</div>
            <div class="rabbit-actions-row">
              <button type="button" data-action="nav-ui-theme">Edit UI Colors</button>
            </div>
            <div class="rabbit-note">Customize the panel UI palette.</div>
          </div>

          <div class="rabbit-group">
            <div class="rabbit-group-title">Panel Opacity</div>
            <label class="rabbit-row">
              <span>Enabled</span>
              <input type="checkbox" data-key="panelOpacityEnabled" ${settings.panelOpacityEnabled ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Opacity</span>
              <span class="rabbit-range-wrap">
                <input type="range" min="0.05" max="1" step="0.05" data-key="panelOpacity" value="${settings.panelOpacity}">
                <span data-val="panelOpacity">${settings.panelOpacity.toFixed(2)}</span>
              </span>
            </label>
            <div class="rabbit-note">Lower opacity makes the panel more transparent.</div>
          </div>

          <div class="rabbit-group">
            <div class="rabbit-group-title">Updates</div>
            <label class="rabbit-row rabbit-font-row">
              <span>GitHub Raw URL</span>
              <input type="text" data-key="updateRawUrl" value="${escapeHtml(settings.updateRawUrl)}" placeholder="https://raw.githubusercontent.com/<user>/<repo>/<branch>/GPT-Unleashed-v2.8.user.js">
            </label>
            <label class="rabbit-row">
              <span>Auto-check on load</span>
              <input type="checkbox" data-key="autoCheckUpdates" ${settings.autoCheckUpdates ? 'checked' : ''}>
            </label>
            <div class="rabbit-actions-row">
              <button type="button" data-action="check-update">Check for Updates</button>
              <button type="button" data-action="install-from-raw">Install from Raw</button>
            </div>
            <div class="rabbit-note">Uses your GitHub Raw URL and compares @version before opening install.</div>
          </div>

          <div class="rabbit-group">
            <div class="rabbit-group-title">Export</div>
            <div class="rabbit-actions-row">
              <button type="button" data-action="export-script-settings">Export Userscript & Settings</button>
            </div>
            <div class="rabbit-note">Downloads the script source plus your settings.</div>
          </div>
        </div>

        <div class="rabbit-page" data-page="ui-theme">
          <div class="rabbit-group">
            <div class="rabbit-group-title">Panel UI Colors</div>
            <label class="rabbit-row">
              <span>Match Theme</span>
              <input type="checkbox" data-key="uiMatchThemeEnabled" ${settings.uiMatchThemeEnabled ? 'checked' : ''}>
            </label>
            <label class="rabbit-row">
              <span>Background</span>
              ${renderColorControl('panelUiBg')}
            </label>
            <label class="rabbit-row">
              <span>Bubbles</span>
              ${renderColorControl('panelUiBubble')}
            </label>
            <label class="rabbit-row">
              <span>Font</span>
              ${renderColorControl('panelUiFont')}
            </label>
            <label class="rabbit-row">
              <span>Outlines</span>
              ${renderColorControl('panelUiOutline')}
            </label>
            <label class="rabbit-row">
              <span>Buttons</span>
              ${renderColorControl('panelUiButton')}
            </label>
          </div>
        </div>

      </div>
      <div class="rabbit-modal" data-role="delete-chats-modal" aria-hidden="true">
        <div class="rabbit-modal-card">
          <div class="rabbit-group-title">Delete Chats</div>
          <div class="rabbit-note">Select chats to remove from the sidebar.</div>
          <div class="rabbit-chat-list" data-role="delete-chats-list"></div>
          <div class="rabbit-actions-row">
            <button type="button" data-action="delete-chats-select-all">Select all</button>
            <button type="button" data-action="delete-chats-unselect-all">Unselect all</button>
            <button type="button" data-action="delete-chats-confirm">Delete Selected</button>
            <button type="button" data-action="delete-chats-close">Close</button>
          </div>
        </div>
      </div>
      <div class="rabbit-modal" data-role="export-chats-modal" aria-hidden="true">
        <div class="rabbit-modal-card">
          <div class="rabbit-group-title">Export Chats</div>
          <div class="rabbit-note">Select one or more chats to download as Markdown files.</div>
          <div class="rabbit-chat-list" data-role="export-chats-list"></div>
          <div class="rabbit-actions-row">
            <button type="button" data-action="export-chats-select-all">Select all</button>
            <button type="button" data-action="export-chats-unselect-all">Unselect all</button>
            <button type="button" data-action="export-chats-confirm">Export Selected</button>
            <button type="button" data-action="export-chats-close">Close</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    if (!settings.panelHidden) {
      if (typeof settings.panelLeft === 'number') {
        panel.style.left = `${settings.panelLeft}px`;
        panel.style.right = 'auto';
      }
      if (typeof settings.panelTop === 'number') {
        panel.style.top = `${settings.panelTop}px`;
      }
    }

    setActivePage(panel, settings.panelPage, false);
    updatePanelHiddenState(panel);
    ensurePanelOnscreen(panel);
    applyPageOptionTooltips(panel);
    updateLayoutControls(panel);
    updateUiThemeControls(panel);
    renderThemeSelect(panel);
    renderGlobalFilesList(panel);
    applyCustomTooltips(panel);

    panel.addEventListener('input', (event) => {
      const t = event.target;
      if (!(t instanceof HTMLElement)) return;

      const key = t.dataset.key;
      if (!key) return;

      if (t instanceof HTMLInputElement) {
        const value = t.type === 'checkbox' ? t.checked : (t.type === 'range' ? Number(t.value) : t.value);
        settings[key] = applySettingUpdate(key, value);
      } else if (t instanceof HTMLSelectElement) {
        settings[key] = applySettingUpdate(key, t.value);
      } else {
        return;
      }

      const readout = panel.querySelector(`[data-val="${key}"]`);
      if (readout) {
        if (key === 'panelOpacity') {
          readout.textContent = Number(settings[key]).toFixed(2);
        } else {
          readout.textContent = `${settings[key]}px`;
        }
      }

      if (key === 'chatTextAlign' || LAYOUT_SLIDER_KEYS.has(key) || key.startsWith('layout')) {
        updateLayoutControls(panel);
      }

      if (key === 'launcherHiddenUntilHover') {
        updatePanelHiddenState(panel);
      }

      if (key === 'uiMatchThemeEnabled') {
        if (settings.uiMatchThemeEnabled) {
          Object.assign(settings, derivePanelUiColorsFromTheme(getActiveThemeSnapshot()));
          ['panelUiBg', 'panelUiBubble', 'panelUiFont', 'panelUiOutline', 'panelUiButton'].forEach((uiKey) => {
            syncColorControls(panel, uiKey, settings[uiKey]);
          });
        }
        updateUiThemeControls(panel);
      }

      if (key.startsWith('panelUi') && settings.uiMatchThemeEnabled) {
        settings.uiMatchThemeEnabled = false;
        const matchToggle = panel.querySelector('input[data-key="uiMatchThemeEnabled"]');
        if (matchToggle instanceof HTMLInputElement) matchToggle.checked = false;
        updateUiThemeControls(panel);
      }
      if (COLOR_KEYS.includes(key)) {
        syncColorControls(panel, key, settings[key]);
      }

      if (settings.uiMatchThemeEnabled && THEME_SETTING_KEYS.includes(key)) {
        Object.assign(settings, derivePanelUiColorsFromTheme(getActiveThemeSnapshot()));
        ['panelUiBg', 'panelUiBubble', 'panelUiFont', 'panelUiOutline', 'panelUiButton'].forEach((uiKey) => {
          syncColorControls(panel, uiKey, settings[uiKey]);
        });
      }

      scheduleSaveSettings();
      applyStyles();
      scheduleRefresh(60);
    });

    panel.addEventListener('wheel', (event) => {
      if (!settings.layoutWheelAdjustEnabled) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const row = target.closest('.rabbit-row');
      if (!(row instanceof HTMLElement)) return;
      if (!row.closest('[data-page="layout"]')) return;
      const slider = row.querySelector('input[type="range"][data-key]');
      if (!(slider instanceof HTMLInputElement)) return;
      if (!LAYOUT_SLIDER_KEYS.has(slider.dataset.key || '')) return;

      const step = Number(slider.step) || 1;
      const min = Number(slider.min);
      const max = Number(slider.max);
      const current = Number(slider.value);
      const next = current - Math.sign(event.deltaY) * (step * 2);
      slider.value = String(clampNumber(next, Number.isFinite(min) ? min : current, Number.isFinite(max) ? max : current, current));
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      event.preventDefault();
    }, { passive: false });

    panel.addEventListener('change', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target instanceof HTMLInputElement && target.dataset.colorTextKey) {
        const key = target.dataset.colorTextKey;
        if (!COLOR_KEYS.includes(key)) return;
        const nextValue = sanitizeHexColor(target.value, settings[key]);
        settings[key] = applySettingUpdate(key, nextValue);
        syncColorControls(panel, key, settings[key]);
        scheduleSaveSettings();
        applyStyles();
        scheduleRefresh(60);
        return;
      }

      if (target instanceof HTMLSelectElement && target.dataset.role === 'theme-select') {
        const presetId = target.value;
        if (!presetId) return;
        const preset = getThemePresets().find((item) => item.id === presetId);
        if (!preset) return;
        if (!applyThemePresetToSettings(preset)) return;
        saveSettings();
        panel.remove();
        applyStyles();
        makePanel();
        scheduleRefresh(80);
      }
    });

    let suppressLauncherToggleClick = false;

    panel.addEventListener('click', async (event) => {
      const btn = event.target.closest('button');
      if (!btn) return;

      const action = btn.dataset.action;

      if (action === 'nav-home') {
        settings.panelHidden = false;
        setActivePage(panel, 'home');
        updatePanelHiddenState(panel);
      }

      if (action === 'nav-themes') {
        settings.panelHidden = false;
        setActivePage(panel, 'themes');
        updatePanelHiddenState(panel);
      }

      if (action === 'nav-layout') {
        settings.panelHidden = false;
        setActivePage(panel, 'layout');
        updatePanelHiddenState(panel);
      }

      if (action === 'nav-font') {
        settings.panelHidden = false;
        setActivePage(panel, 'font');
        updatePanelHiddenState(panel);
      }

      if (action === 'nav-prompts') {
        settings.panelHidden = false;
        setActivePage(panel, 'prompts');
        updatePanelHiddenState(panel);
      }

      if (action === 'nav-settings') {
        settings.panelHidden = false;
        setActivePage(panel, 'settings');
        updatePanelHiddenState(panel);
      }

      if (action === 'nav-ui-theme') {
        settings.panelHidden = false;
        setActivePage(panel, 'ui-theme');
        updatePanelHiddenState(panel);
      }

      if (action === 'scroll-top') {
        scrollChatToTop();
      }

      if (action === 'scroll-bottom') {
        scrollChatToBottom();
      }

      if (action === 'toggle') {
        if (btn.closest('.rabbit-panel-launcher') && suppressLauncherToggleClick) {
          suppressLauncherToggleClick = false;
          return;
        }
        settings.panelHidden = !settings.panelHidden;
        saveSettings();

        if (!settings.panelHidden) {
          setActivePage(panel, 'home');
          if (typeof settings.panelLeft === 'number') {
            panel.style.left = `${settings.panelLeft}px`;
            panel.style.right = 'auto';
          } else {
            panel.style.right = `${PANEL_OPEN_RIGHT}px`;
            panel.style.left = 'auto';
          }
          if (typeof settings.panelTop === 'number') {
            panel.style.top = `${settings.panelTop}px`;
          } else {
            panel.style.top = `${PANEL_OPEN_TOP}px`;
          }
          panel.style.bottom = 'auto';
        }

        updatePanelHiddenState(panel);
      }

      if (action === 'theme-save') {
        const input = panel.querySelector('[data-role="theme-name"]');
        const enteredName = input instanceof HTMLInputElement ? input.value.trim() : '';
        const name = (enteredName || `Custom Theme ${savedThemes.length + 1}`).slice(0, 64);
        const snapshot = getThemeSnapshotFromSettings(settings);
        const existingIndex = savedThemes.findIndex((item) => item.name.toLowerCase() === name.toLowerCase());
        const id = existingIndex >= 0 ? savedThemes[existingIndex].id : `saved_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        const nextTheme = { id, name, theme: snapshot };
        if (existingIndex >= 0) {
          savedThemes[existingIndex] = nextTheme;
        } else {
          savedThemes.push(nextTheme);
        }
        saveSavedThemes();
        renderThemeSelect(panel, id);
        if (input instanceof HTMLInputElement) input.value = name;
      }

      if (action === 'theme-export') {
        const payload = {
          exportedAt: new Date().toISOString(),
          version: SCRIPT_VERSION,
          theme: getThemeSnapshotFromSettings(settings)
        };
        const filename = `gpt-unleashed-theme-${formatTimestampForFilename(new Date())}.json`;
        downloadTextFile(filename, JSON.stringify(payload, null, 2), 'application/json');
      }

      if (action === 'theme-import') {
        const raw = prompt('Paste a theme JSON payload:');
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          const importedTheme = parsed && typeof parsed === 'object' && parsed.theme ? parsed.theme : parsed;
          const normalized = normalizeThemeSnapshot(importedTheme);
          settings = normalizeSettings({ ...settings, ...normalized });
          saveSettings();
          panel.remove();
          applyStyles();
          makePanel();
          scheduleRefresh(80);
        } catch {
          showNotification('Invalid theme JSON.');
          await createDialogo({ message: 'Invalid theme JSON.', title: 'Import Theme' });
        }
      }

      if (action === 'reset') {
        settings = normalizeSettings(null);
        saveSettings();
        panel.remove();
        applyStyles();
        makePanel();
        scheduleRefresh(60);
      }

      if (action === 'export') {
        const data = JSON.stringify(settings, null, 2);
        navigator.clipboard.writeText(data).then(() => {
          btn.textContent = 'Copied';
          setTimeout(() => { btn.textContent = 'Export'; }, 1200);
        }).catch(() => {
          prompt('Copy your theme JSON:', data);
        });
      }

      if (action === 'import') {
        const raw = prompt('Paste exported theme JSON:');
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          settings = normalizeSettings({ ...defaults, ...parsed });
          saveSettings();
          panel.remove();
          applyStyles();
          makePanel();
          scheduleRefresh(80);
        } catch {
          showNotification('Invalid JSON.');
          await createDialogo({ message: 'Invalid JSON.', title: 'Import Settings' });
        }
      }

      if (action === 'layout-edit') {
        const key = btn.dataset.key || '';
        if (!LAYOUT_SLIDER_KEYS.has(key)) return;
        const input = panel.querySelector(`input[type="range"][data-key="${key}"]`);
        if (!(input instanceof HTMLInputElement)) return;
        const min = Number(input.min);
        const max = Number(input.max);
        const entered = prompt(`Enter a value for ${key} (${input.min} - ${input.max}):`, input.value);
        if (entered == null) return;
        const parsed = Number(entered);
        if (!Number.isFinite(parsed)) return;
        const next = clampNumber(parsed, Number.isFinite(min) ? min : parsed, Number.isFinite(max) ? max : parsed, parsed);
        input.value = String(next);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }

      if (action === 'prompt-add') {
        const titleInput = panel.querySelector('[data-role="prompt-title"]');
        const textInput = panel.querySelector('[data-role="prompt-text"]');
        const typeInput = panel.querySelector('[data-role="prompt-type"]');
        const tagsInput = panel.querySelector('[data-role="prompt-tags"]');
        const status = panel.querySelector('[data-role="prompt-status"]');
        const title = titleInput instanceof HTMLInputElement ? titleInput.value.trim() : '';
        const text = textInput instanceof HTMLTextAreaElement ? textInput.value.trim() : '';
        const type = typeInput instanceof HTMLSelectElement && typeInput.value === 'ai' ? 'ai' : 'user';
        const tags = tagsInput instanceof HTMLInputElement ? parseTagsInput(tagsInput.value) : [];
        const normalized = normalizePrompt({ title, text, type, tags }, title || 'Prompt');
        if (!normalized) {
          if (status) status.textContent = 'Add a title and prompt text first.';
          return;
        }
        prompts = [...prompts, normalized];
        savePrompts();
        if (titleInput) titleInput.value = '';
        if (textInput) textInput.value = '';
        if (typeInput instanceof HTMLSelectElement) typeInput.value = 'user';
        if (tagsInput) tagsInput.value = '';
        if (status) status.textContent = `Saved "${normalized.title}".`;
        showNotification(`Saved "${normalized.title}".`);
        refreshPromptViews();
      }

      if (action === 'prompt-insert-draft') {
        const textInput = panel.querySelector('[data-role="prompt-text"]');
        const status = panel.querySelector('[data-role="prompt-status"]');
        const text = textInput instanceof HTMLTextAreaElement ? textInput.value.trim() : '';
        if (!text) {
          if (status) status.textContent = 'Type a prompt to insert.';
          return;
        }
        if (insertPromptIntoComposer(text)) {
          if (status) status.textContent = 'Inserted into the current chat.';
        } else {
          if (status) status.textContent = 'Could not find an active composer.';
        }
      }

      if (action === 'prompt-enhance-draft') {
        const textInput = panel.querySelector('[data-role="prompt-text"]');
        const status = panel.querySelector('[data-role="prompt-status"]');
        const text = textInput instanceof HTMLTextAreaElement ? textInput.value.trim() : '';
        if (!text) {
          if (status) status.textContent = 'Type a prompt to enhance first.';
          return;
        }
        const enhancedInstruction = buildPromptEnhanceInstruction(text);
        if (insertPromptIntoComposer(enhancedInstruction)) {
          if (status) status.textContent = 'Enhancement instruction inserted into the composer.';
        } else if (status) {
          status.textContent = 'Could not find an active composer.';
        }
      }

      if (action === 'prompt-insert') {
        const promptId = btn.dataset.promptId;
        const promptItem = prompts.find((item) => item.id === promptId);
        const status = panel.querySelector('[data-role="prompt-status"]');
        if (!promptItem) return;
        if (insertPromptIntoComposer(promptItem.text)) {
          if (status) status.textContent = `Inserted "${promptItem.title}".`;
        } else {
          if (status) status.textContent = 'Could not find an active composer.';
        }
      }

      if (action === 'prompt-new-chat') {
        const promptId = btn.dataset.promptId;
        const promptItem = prompts.find((item) => item.id === promptId);
        const status = panel.querySelector('[data-role="prompt-status"]');
        if (!promptItem) return;
        if (status) status.textContent = `Starting new chat with "${promptItem.title}"...`;
        startNewChatWithPrompt(promptItem.text);
      }

      if (action === 'prompt-favorite-toggle') {
        const promptId = btn.dataset.promptId;
        const promptIndex = prompts.findIndex((item) => item.id === promptId);
        const status = panel.querySelector('[data-role="prompt-status"]');
        if (promptIndex < 0) return;
        const nextFavorite = !prompts[promptIndex].favorite;
        prompts = prompts.map((item, index) => {
          if (index !== promptIndex) return item;
          return { ...item, favorite: nextFavorite };
        });
        savePrompts();
        renderPromptsList(panel);
        if (status) status.textContent = `${nextFavorite ? 'Added' : 'Removed'} "${prompts[promptIndex].title}" ${nextFavorite ? 'to' : 'from'} favorites.`;
      }

      if (action === 'prompt-pin-toggle') {
        const promptId = btn.dataset.promptId;
        const promptIndex = prompts.findIndex((item) => item.id === promptId);
        const status = panel.querySelector('[data-role="prompt-status"]');
        if (promptIndex < 0) return;
        const nextPinned = !prompts[promptIndex].pinned;
        prompts = prompts.map((item, index) => {
          if (index !== promptIndex) return item;
          return { ...item, pinned: nextPinned };
        });
        savePrompts();
        refreshPromptViews();
        if (status) status.textContent = `${nextPinned ? 'Pinned' : 'Unpinned'} "${prompts[promptIndex].title}".`;
      }

      if (action === 'prompt-review') {
        const promptId = btn.dataset.promptId;
        const promptItem = prompts.find((item) => item.id === promptId);
        if (!promptItem) return;
        openPromptReviewModal(promptItem);
      }

      if (action === 'prompt-expand-toggle') {
        const promptId = btn.dataset.promptId;
        const promptIndex = prompts.findIndex((item) => item.id === promptId);
        if (promptIndex < 0) return;
        const nextExpanded = !prompts[promptIndex].expanded;
        prompts = prompts.map((item, index) => (index === promptIndex ? { ...item, expanded: nextExpanded } : item));
        savePrompts();
        renderPromptsList(panel);
      }

      if (action === 'prompt-enhance') {
        const promptId = btn.dataset.promptId;
        const promptItem = prompts.find((item) => item.id === promptId);
        const status = panel.querySelector('[data-role="prompt-status"]');
        if (!promptItem) return;
        const enhancedInstruction = buildPromptEnhanceInstruction(promptItem.text);
        if (insertPromptIntoComposer(enhancedInstruction)) {
          if (status) status.textContent = `Enhancement instruction inserted for "${promptItem.title}".`;
        } else if (status) {
          status.textContent = 'Could not find an active composer.';
        }
      }

      if (action === 'prompt-open-explorer' || action === 'prompt-open-favorites') {
        const preferredInput = getPrimaryComposerInput();
        const mode = action === 'prompt-open-favorites' ? 'favorites' : 'all';
        openComposerPromptExplorer(preferredInput, mode);
      }

      if (action === 'prompt-enhance-current') {
        const status = panel.querySelector('[data-role="prompt-status"]');
        const input = getPrimaryComposerInput();
        const draft = getComposerDraftText(input);
        const enhancedInstruction = buildPromptEnhanceInstruction(draft);
        if (!enhancedInstruction) {
          if (status) status.textContent = 'Type a prompt in the composer first.';
          return;
        }
        if (insertPromptIntoComposer(enhancedInstruction, input)) {
          if (status) status.textContent = 'Enhancement instruction inserted into the composer.';
        } else if (status) {
          status.textContent = 'Could not find an active composer.';
        }
      }

      if (action === 'prompt-export-json') {
        const status = panel.querySelector('[data-role="prompt-status"]');
        exportPromptsAsJson();
        if (status) status.textContent = 'Exported prompts as JSON.';
      }

      if (action === 'prompt-import-file') {
        const fileInput = panel.querySelector('input[type="file"][data-action="prompt-file"]');
        if (fileInput instanceof HTMLInputElement) {
          fileInput.click();
        }
      }

      if (action === 'prompt-fetch') {
        const urlInput = panel.querySelector('[data-role="prompt-url"]');
        const status = panel.querySelector('[data-role="prompt-status"]');
        const url = urlInput instanceof HTMLInputElement ? urlInput.value.trim() : '';
        if (!url) {
          if (status) status.textContent = 'Enter a URL to fetch.';
          return;
        }
        if (status) status.textContent = 'Fetching...';
        fetch(url).then((resp) => {
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          return resp.text();
        }).then((text) => {
          let payload = text;
          try {
            payload = JSON.parse(text);
          } catch {
            // treat as plain text
          }
          const added = importPromptsFromPayload(payload, 'URL Prompt');
          renderPromptsList(panel);
          renderGlobalFilesList(panel);
          renderFloatingPinnedPrompts();
          if (added) showNotification(`Imported ${added} prompt(s).`);
          if (status) status.textContent = added ? `Imported ${added} prompt(s).` : 'No prompts found.';
        }).catch((err) => {
          if (status) status.textContent = `Fetch failed: ${err.message}`;
        });
      }

      if (action === 'prompt-export') {
        exportPromptsAsJson();
        showNotification('Prompts exported successfully.');
      }

      if (action === 'file-add') {
        const input = panel.querySelector('#rabbit-file-input');
        if (input instanceof HTMLInputElement) input.click();
      }

      if (action === 'file-clear-all') {
        const ok = await createDialogo({
          message: 'Remove all attached files?',
          type: 'confirm',
          title: 'Clear Files'
        });
        if (!ok) return;
        localStorage.removeItem(GLOBAL_FILES_KEY);
        renderGlobalFilesList(panel);
        showNotification('All files cleared.');
      }

      if (action === 'export-chat') {
        setExportChatsModalOpen(panel, true);
      }

      if (action === 'check-update') {
        checkForUserscriptUpdate({ openInstall: false, silent: false });
        return;
      }

      if (action === 'install-from-raw') {
        checkForUserscriptUpdate({ openInstall: true, silent: false });
        return;
      }

      if (action === 'export-script-settings') {
        exportScriptAndSettings();
      }

      if (action === 'delete-chats-open') {
        setDeleteChatsModalOpen(panel, true);
      }

      if (action === 'delete-chats-close') {
        setDeleteChatsModalOpen(panel, false);
      }

      if (action === 'export-chats-close') {
        setExportChatsModalOpen(panel, false);
      }

      if (action === 'delete-chats-select-all' || action === 'delete-chats-unselect-all') {
        const checked = action === 'delete-chats-select-all';
        panel.querySelectorAll('[data-role="delete-chat-check"]').forEach((node) => {
          if (node instanceof HTMLInputElement) node.checked = checked;
        });
      }

      if (action === 'export-chats-select-all' || action === 'export-chats-unselect-all') {
        const checked = action === 'export-chats-select-all';
        panel.querySelectorAll('[data-role="export-chat-check"]').forEach((node) => {
          if (node instanceof HTMLInputElement) node.checked = checked;
        });
      }

      if (action === 'delete-chats-confirm') {
        const checks = [...panel.querySelectorAll('[data-role="delete-chat-check"]')]
          .filter((node) => node instanceof HTMLInputElement && node.checked);
        const allChats = getSidebarChatItems();
        const byHref = new Map(allChats.map((chat) => [chat.href, chat]));
        const selectedChats = checks
          .map((node) => {
            const href = String(node.dataset.chatHref || '');
            if (href && byHref.has(href)) return byHref.get(href);
            const idx = Number(node.dataset.chatIndex);
            if (Number.isFinite(idx) && idx >= 0 && idx < allChats.length) return allChats[idx];
            return null;
          })
          .filter((chat) => !!chat);

        if (!selectedChats.length) {
          showNotification('Select at least one chat to delete.');
          return;
        }

        const ok = await createDialogo({
          message: `Delete ${selectedChats.length} selected chat(s)? This cannot be undone.`,
          type: 'confirm',
          title: 'Delete Chats'
        });
        if (!ok) return;
        (async () => {
          let deletedCount = 0;
          for (const chat of selectedChats) {
            const ok = await deleteChatFromSidebarItem(chat);
            if (ok) deletedCount += 1;
            await sleep(180);
          }
          showNotification(`Deleted ${deletedCount} chat(s).`);
          setDeleteChatsModalOpen(panel, false);
          scheduleRefresh(140);
        })();
      }

      if (action === 'export-chats-confirm') {
        const checks = [...panel.querySelectorAll('[data-role="export-chat-check"]')]
          .filter((node) => node instanceof HTMLInputElement && node.checked);
        const allChats = getSidebarChatItems();
        const byHref = new Map(allChats.map((chat) => [chat.href, chat]));
        const selectedChats = checks
          .map((node) => {
            const href = String(node.dataset.chatHref || '');
            if (href && byHref.has(href)) return byHref.get(href);
            const idx = Number(node.dataset.chatIndex);
            if (Number.isFinite(idx) && idx >= 0 && idx < allChats.length) return allChats[idx];
            return null;
          })
          .filter((chat) => !!chat);

        if (!selectedChats.length) {
          showNotification('Select at least one chat to export.');
          return;
        }

        (async () => {
          let exportedCount = 0;
          for (const chat of selectedChats) {
            const ok = await exportChatByHref(chat);
            if (ok) exportedCount += 1;
            await sleep(120);
          }
          showNotification(`Exported ${exportedCount} of ${selectedChats.length} chat(s).`);
          setExportChatsModalOpen(panel, false);
        })();
      }
    });

    panel.addEventListener('change', (event) => {
      const t = event.target;
      if (!(t instanceof HTMLInputElement)) return;
      if (t.id === 'rabbit-file-input') {
        const files = [...(t.files || [])];
        if (!files.length) return;
        (async () => {
          const stored = JSON.parse(localStorage.getItem(GLOBAL_FILES_KEY) || '[]');
          for (const file of files) {
            const data = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(file);
            });
            stored.push({
              id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
              name: file.name,
              type: file.type,
              size: file.size,
              data
            });
          }
          localStorage.setItem(GLOBAL_FILES_KEY, JSON.stringify(stored));
          renderGlobalFilesList(panel);
          showNotification(`Added ${files.length} file(s).`);
          t.value = '';
        })();
        return;
      }
      if (t.dataset.action !== 'prompt-file') return;

      const status = panel.querySelector('[data-role="prompt-status"]');
      const file = t.files && t.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        let payload = result;
        try {
          payload = JSON.parse(result);
        } catch {
          // treat as plain text
        }
        const added = importPromptsFromPayload(payload, file.name || 'File Prompt');
        renderPromptsList(panel);
        renderFloatingPinnedPrompts();
        if (added) showNotification(`Imported ${added} prompt(s).`);
        if (status) status.textContent = added ? `Imported ${added} prompt(s).` : 'No prompts found.';
        t.value = '';
      };
      reader.onerror = () => {
        if (status) status.textContent = 'Failed to read file.';
        t.value = '';
      };
      reader.readAsText(file);
    });

    const deleteModal = panel.querySelector('[data-role="delete-chats-modal"]');
    if (deleteModal instanceof HTMLElement) {
      deleteModal.addEventListener('click', (event) => {
        if (event.target === deleteModal) {
          setDeleteChatsModalOpen(panel, false);
        }
      });
    }

    const exportModal = panel.querySelector('[data-role="export-chats-modal"]');
    if (exportModal instanceof HTMLElement) {
      exportModal.addEventListener('click', (event) => {
        if (event.target === exportModal) {
          setExportChatsModalOpen(panel, false);
        }
      });
    }

    bindFloatingPromptEvents();
    renderFloatingPinnedPrompts();
    makeDraggable(panel, panel.querySelector('.rabbit-panel-header'));
    makeLauncherDraggable(panel, panel.querySelector('.rabbit-panel-launcher .rabbit-launcher-emblem'), () => {
      suppressLauncherToggleClick = true;
    });
    return panel;
  }

  function makeDraggable(panel, handle) {
    if (!panel || !handle) return;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    handle.addEventListener('mousedown', (e) => {
      if (!settings.moveGuiDragEnabled) return;
      if (settings.panelHidden) return;
      if (e.target.closest('button')) return;

      const rect = panel.getBoundingClientRect();
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;

      panel.style.left = `${rect.left}px`;
      panel.style.top = `${rect.top}px`;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    });

    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;

      const nextLeft = Math.max(8, startLeft + (e.clientX - startX));
      const nextTop = Math.max(8, startTop + (e.clientY - startY));

      panel.style.left = `${nextLeft}px`;
      panel.style.top = `${nextTop}px`;

      settings.panelLeft = nextLeft;
      settings.panelTop = nextTop;
    });

    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      saveSettings();
    });
  }

  function makeFloatingPromptDraggable(card, handle) {
    if (!(card instanceof HTMLElement) || !(handle instanceof HTMLElement)) return;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    handle.addEventListener('mousedown', (event) => {
      if (event.target instanceof HTMLElement && event.target.closest('button')) return;
      const rect = card.getBoundingClientRect();
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      card.style.left = `${rect.left}px`;
      card.style.top = `${rect.top}px`;
      card.style.right = 'auto';
      const onMouseMove = (moveEvent) => {
        if (!dragging) return;
        card.style.left = `${Math.max(6, startLeft + (moveEvent.clientX - startX))}px`;
        card.style.top = `${Math.max(6, startTop + (moveEvent.clientY - startY))}px`;
      };
      const onMouseUp = () => {
        dragging = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  function makeLauncherDraggable(panel, launcherButton, onDragEnd) {
    if (!(panel instanceof HTMLElement) || !(launcherButton instanceof HTMLElement)) return;

    let holding = false;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let holdTimer = null;
    let draggedDistance = 0;

    launcherButton.addEventListener('mousedown', (event) => {
      if (!settings.moveGuiDragEnabled) return;
      if (event.button !== 0) return;
      const rect = panel.getBoundingClientRect();
      holding = true;
      dragging = false;
      draggedDistance = 0;
      startX = event.clientX;
      startY = event.clientY;
      startLeft = rect.left;
      startTop = rect.top;

      holdTimer = window.setTimeout(() => {
        if (!holding) return;
        dragging = true;
      }, 160);
    });

    window.addEventListener('mousemove', (event) => {
      if (!holding) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      draggedDistance = Math.max(draggedDistance, Math.hypot(dx, dy));

      if (!dragging && draggedDistance >= 7) {
        dragging = true;
      }
      if (!dragging) return;

      const panelRect = panel.getBoundingClientRect();
      const maxLeft = Math.max(8, window.innerWidth - panelRect.width - 8);
      const maxTop = Math.max(8, window.innerHeight - panelRect.height - 8);
      const nextLeft = Math.min(maxLeft, Math.max(8, startLeft + dx));
      const nextTop = Math.min(maxTop, Math.max(8, startTop + dy));

      panel.style.setProperty('left', `${nextLeft}px`, 'important');
      panel.style.setProperty('top', `${nextTop}px`, 'important');
      panel.style.setProperty('right', 'auto', 'important');
      panel.style.setProperty('bottom', 'auto', 'important');

      settings.panelLeft = nextLeft;
      settings.panelTop = nextTop;
      event.preventDefault();
    });

    window.addEventListener('mouseup', () => {
      if (!holding) return;
      holding = false;
      if (holdTimer !== null) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
      if (!dragging) return;
      dragging = false;
      saveSettings();
      if (typeof onDragEnd === 'function') onDragEnd();
    });
  }

  function getRoleFromNode(node) {
    if (!(node instanceof HTMLElement)) return null;

    const selfRole = node.getAttribute('data-message-author-role');
    if (selfRole === 'user' || selfRole === 'assistant') return selfRole;

    const roleParent = node.closest('[data-message-author-role]');
    if (roleParent) {
      const role = roleParent.getAttribute('data-message-author-role');
      if (role === 'user' || role === 'assistant') return role;
    }

    return null;
  }

  function getElementHintText(node) {
    if (!(node instanceof HTMLElement)) return '';

    return [
      node.id || '',
      typeof node.className === 'string' ? node.className : '',
      node.getAttribute('data-testid') || '',
      node.getAttribute('data-test-id') || '',
      node.getAttribute('data-qa') || '',
      node.getAttribute('aria-label') || '',
      node.getAttribute('placeholder') || '',
      node.getAttribute('data-placeholder') || '',
      node.getAttribute('role') || ''
    ].join(' ').toLowerCase();
  }

  function isAuxiliaryUiNode(node) {
    if (!(node instanceof HTMLElement)) return false;
    if (node.matches('[role="alert"], [role="status"], [role="dialog"], [aria-live], [aria-modal="true"]')) {
      return true;
    }
    return AUXILIARY_UI_PATTERN.test(getElementHintText(node));
  }

  function hasEmbeddedContent(node) {
    if (!(node instanceof HTMLElement)) return false;
    return !!node.querySelector(
      'pre, code, table, blockquote, details, summary, .katex, [class*="code"], [class*="table"], [class*="quote"], [class*="markdown"]'
    );
  }

  function looksLikeMessageContent(node) {
    if (!(node instanceof HTMLElement)) return false;

    const text = (node.textContent || '').trim();
    const hasText = text.length >= 2;
    const hasEmbed = hasEmbeddedContent(node);
    if (!hasText && !hasEmbed) return false;

    const tag = node.tagName.toLowerCase();
    if (['button', 'svg', 'path', 'nav', 'form', 'textarea', 'input', 'select', 'option', 'label'].includes(tag)) return false;
    if (node.closest('button, nav, form, dialog, [role="dialog"], [aria-modal="true"]')) return false;
    if (isAuxiliaryUiNode(node)) return false;
    if (node.querySelector('textarea, input, select, [role="alert"], [role="status"], [role="dialog"], [aria-live]')) return false;
    if (node.querySelectorAll('button').length > 2) return false;

    return true;
  }

  function scoreCandidate(node) {
    if (!(node instanceof HTMLElement)) return -Infinity;
    if (isAuxiliaryUiNode(node)) return -Infinity;

    const classText = `${node.className || ''}`.toLowerCase();
    const textLen = (node.textContent || '').trim().length;
    const hasBlocks = !!node.querySelector('pre, code, blockquote, ul, ol, table, details');
    const hasEmbed = hasEmbeddedContent(node);

    let score = 0;

    if (classText.includes('markdown')) score += 60;
    if (classText.includes('prose')) score += 40;
    if (classText.includes('message')) score += 25;
    if (node.querySelector('p')) score += 10;
    if (hasBlocks) score += 16;
    if (hasEmbed) score += 12;

    score += Math.min(40, Math.floor(textLen / 30));

    if (classText.includes('toolbar')) score -= 60;
    if (classText.includes('actions')) score -= 60;
    if (classText.includes('avatar')) score -= 60;
    if (classText.includes('icon')) score -= 40;
    if (classText.includes('artifact')) score -= 180;
    if (classText.includes('tool')) score -= 180;
    if (classText.includes('interpreter')) score -= 180;
    if (classText.includes('notebook')) score -= 180;
    if (classText.includes('canvas')) score -= 120;
    if (classText.includes('status')) score -= 120;
    if (classText.includes('alert')) score -= 120;

    const tag = node.tagName.toLowerCase();
    if (tag === 'pre' || tag === 'code' || tag === 'blockquote' || tag === 'table' || tag === 'details') {
      score -= 150;
    }

    return score;
  }

  function wrapContentNode(node, roleRoot) {
    if (!(node instanceof HTMLElement)) return node;
    let current = node;
    let depth = 0;

    while (current && current !== roleRoot && depth < 6) {
      const tag = current.tagName.toLowerCase();
      if (!['pre', 'code', 'blockquote', 'table', 'details'].includes(tag)) {
        break;
      }
      current = current.parentElement;
      depth += 1;
    }

    if (!(current instanceof HTMLElement)) return node;

    let expandable = current;
    let hops = 0;
    while (expandable.parentElement && expandable.parentElement !== roleRoot && hops < 5) {
      const parent = expandable.parentElement;
      if (!(parent instanceof HTMLElement)) break;
      if (!looksLikeMessageContent(parent)) break;
      if (isAuxiliaryUiNode(parent)) break;
      if (parent.querySelectorAll('button').length > 2) break;
      expandable = parent;
      hops += 1;
    }

    return expandable;
  }

  function findBestMessageContent(roleRoot) {
    if (!(roleRoot instanceof HTMLElement)) return null;

    const role = roleRoot.getAttribute('data-message-author-role');
    if (role !== 'user' && role !== 'assistant') return null;

    const preferred = roleRoot.querySelector('.markdown, [class*="markdown"], .prose, [class*="prose"]');
    if (preferred instanceof HTMLElement && looksLikeMessageContent(preferred)) {
      return preferred;
    }

    let nodes = roleRoot.querySelectorAll('div, article, section, pre, blockquote, table, details');
    let count = nodes.length;

    if (count === 0) {
      nodes = [roleRoot];
      count = 1;
    }

    if (count > 140 && nodes instanceof NodeList) {
      const step = Math.ceil(count / 140);
      const sampled = [];
      for (let i = 0; i < count; i += step) {
        sampled.push(nodes[i]);
      }
      nodes = sampled;
    }

    let best = null;
    let bestScore = -Infinity;

    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) continue;
      if (!looksLikeMessageContent(node)) continue;

      const cls = `${node.className || ''}`.toLowerCase();
      if (cls.includes('toolbar') || cls.includes('actions') || cls.includes('composer')) continue;

      const score = scoreCandidate(node);
      if (score > bestScore) {
        bestScore = score;
        best = node;
      }
    }

    if (!best) return null;

    const wrapped = wrapContentNode(best, roleRoot);
    return wrapped instanceof HTMLElement ? wrapped : best;
  }

  function applyClassesToTarget(target, role) {
    if (!target.classList.contains('rabbit-msg-target')) {
      target.classList.add('rabbit-msg-target');
    }

    if (role === 'user') {
      target.classList.add('rabbit-msg-user');
      target.classList.remove('rabbit-msg-assistant');
    } else if (role === 'assistant') {
      target.classList.add('rabbit-msg-assistant');
      target.classList.remove('rabbit-msg-user');
    }
  }

  function pruneOldTargets(validTargets, validScopes) {
    document.querySelectorAll('.rabbit-msg-target').forEach((el) => {
      if (validTargets.has(el)) return;
      el.classList.remove('rabbit-msg-target', 'rabbit-msg-user', 'rabbit-msg-assistant');
    });

    document.querySelectorAll('.rabbit-embed-scope').forEach((el) => {
      if (validScopes.has(el)) return;
      el.classList.remove('rabbit-embed-scope');
    });
  }

  function refreshMessageStyling() {
    const roleRoots = document.querySelectorAll('[data-message-author-role]');
    const validTargets = new Set();
    const validScopes = new Set();

    roleRoots.forEach((root) => {
      if (!(root instanceof HTMLElement)) return;
      if (!root.isConnected) return;

      const role = root.getAttribute('data-message-author-role');
      if (role !== 'user' && role !== 'assistant') return;

      const target = findBestMessageContent(root);
      if (!target) return;

      root.classList.add('rabbit-embed-scope');
      applyClassesToTarget(target, role);
      validScopes.add(root);
      validTargets.add(target);
    });

    pruneOldTargets(validTargets, validScopes);
  }

  function getComposerInputCandidates() {
    const nodes = [
      ...document.querySelectorAll('textarea'),
      ...document.querySelectorAll('[contenteditable="true"]')
    ];

    const ranked = nodes.map((node) => {
      if (!(node instanceof HTMLElement)) return false;
      if (!node.isConnected) return false;
      if (node.closest(`#${PANEL_ID}`)) return false;
      if (node.closest('[data-message-author-role]')) return false;
      if (node.closest('dialog, [role="dialog"], [aria-modal="true"]')) return false;

      const rect = node.getBoundingClientRect();
      if (rect.width < 120 || rect.height < 18) return false;

      const hintText = [
        getElementHintText(node),
        getElementHintText(node.parentElement),
        getElementHintText(node.closest('form')),
        getElementHintText(node.closest('footer'))
      ].join(' ');

      if (COMPOSER_EXCLUSION_PATTERN.test(hintText)) return false;
      if (node.getAttribute('role') === 'searchbox') return false;
      if (node.closest('nav, aside, header')) return false;

      const labelText = [
        node.getAttribute('aria-label') || '',
        node.getAttribute('placeholder') || '',
        node.getAttribute('data-placeholder') || ''
      ].join(' ').toLowerCase();

      let score = 0;
      if (node.closest('form')) score += 25;
      if (node.closest('footer')) score += 22;
      if (/(ask|message|prompt|chatgpt|send)/.test(labelText)) score += 42;
      if (rect.bottom >= window.innerHeight * 0.58) score += 24;
      if (rect.top >= window.innerHeight * 0.25) score += 8;
      if (hintText.includes('composer')) score += 30;
      if (hintText.includes('prompt')) score += 18;
      if (hintText.includes('editor')) score += 8;

      return { node, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score);

    if (!ranked.length) return [];
    const bestScore = ranked[0].score;
    return ranked.filter((entry) => entry.score >= bestScore - 18).map((entry) => entry.node);
  }

  function scoreComposerShell(candidate, input, depth) {
    if (!(candidate instanceof HTMLElement) || !(input instanceof HTMLElement)) return -Infinity;
    if (!candidate.contains(input)) return -Infinity;
    if (candidate.id === PANEL_ID || candidate.closest(`#${PANEL_ID}`)) return -Infinity;

    const tag = candidate.tagName.toLowerCase();
    if (tag === 'nav' || tag === 'aside' || tag === 'header') return -Infinity;

    const classText = `${candidate.className || ''}`.toLowerCase();
    if (COMPOSER_EXCLUSION_PATTERN.test(classText)) return -Infinity;

    const rect = candidate.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();

    if (rect.width < 120 || rect.height < 24) return -Infinity;

    let score = 80 - depth * 8;

    if (tag === 'form') score += 14;
    if (classText.includes('composer')) score += 30;
    if (classText.includes('prompt')) score += 24;
    if (classText.includes('input')) score += 12;
    if (classText.includes('editor')) score += 10;

    const widthOvershoot = rect.width - inputRect.width;
    if (widthOvershoot > inputRect.width * 0.8) score -= 40;
    if (rect.width > window.innerWidth * 0.96) score -= 60;
    if (rect.height > window.innerHeight * 0.35) score -= 50;

    const style = getComputedStyle(candidate);
    const radius = parseFloat(style.borderRadius) || 0;
    if (radius >= 14) score += 10;

    return score;
  }

  function findComposerShellForInput(input) {
    if (!(input instanceof HTMLElement)) return null;

    const ancestors = [];
    let node = input;
    let depth = 0;

    while (node && node !== document.body && depth < 8) {
      ancestors.push({ node, depth });
      node = node.parentElement;
      depth += 1;
    }

    let best = null;
    let bestScore = -Infinity;

    for (const entry of ancestors) {
      const score = scoreComposerShell(entry.node, input, entry.depth);
      if (score > bestScore) {
        bestScore = score;
        best = entry.node;
      }
    }

    if (best instanceof HTMLElement) return best;
    return input.parentElement || input;
  }

  function clearComposerClasses() {
    document.querySelectorAll('.rabbit-composer-prompt-dock').forEach((el) => el.remove());
    closeComposerPromptMenus();
    document.querySelectorAll('.rabbit-composer-shell').forEach((el) => {
      el.classList.remove('rabbit-composer-shell');
    });
    document.querySelectorAll('.rabbit-composer-input').forEach((el) => {
      el.classList.remove('rabbit-composer-input');
    });
  }

  function refreshComposerStyling() {
    clearComposerClasses();

    const inputs = getComposerInputCandidates();
    for (const input of inputs) {
      const shell = findComposerShellForInput(input);
      if (shell instanceof HTMLElement) {
        shell.classList.add('rabbit-composer-shell');
        ensureComposerPromptDock(shell, input);
      }
      input.classList.add('rabbit-composer-input');
    }

    if (inputs.length) {
      consumePendingPromptIfReady(inputs);
    }
  }

  function refreshGptWarningVisibility() {
    if (!(document.body instanceof HTMLElement)) return;
    document.querySelectorAll('[data-rabbit-warning-hidden="1"]').forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      if (settings.hideGptWarning) return;
      el.removeAttribute('data-rabbit-warning-hidden');
      el.style.removeProperty('display');
    });
    if (!settings.hideGptWarning) return;

    const warningNeedles = [
      'chatgpt can make mistakes',
      'check important info'
    ];
    const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const matched = new Set();

    let node = textWalker.nextNode();
    while (node) {
      const text = (node.textContent || '').toLowerCase();
      if (warningNeedles.every((needle) => text.includes(needle))) {
        const owner = node.parentElement;
        if (owner instanceof HTMLElement) {
          const shell = owner.closest('footer, div, p, span');
          if (shell instanceof HTMLElement) matched.add(shell);
          const footer = owner.closest('footer');
          if (footer instanceof HTMLElement) matched.add(footer);
        }
      }
      node = textWalker.nextNode();
    }

    matched.forEach((el) => {
      el.setAttribute('data-rabbit-warning-hidden', '1');
      el.style.setProperty('display', 'none', 'important');
    });
  }

  function fixComposerLayout() {
    document.querySelectorAll('.rabbit-composer-shell').forEach((shell) => {
      if (!(shell instanceof HTMLElement)) return;
      if (shell.dataset.layoutFixed === '1') return;

      const children = [...shell.children].filter((child) => child instanceof HTMLElement);
      const inputChild = children.find((child) =>
        child.querySelector('textarea, [contenteditable="true"]')
      );
      const toolbarChildren = children.filter((child) => child !== inputChild);

      if (!inputChild || !toolbarChildren.length) return;

      shell.dataset.layoutFixed = '1';

      const toolbar = document.createElement('div');
      toolbar.className = 'rabbit-composer-toolbar-row';
      toolbar.style.cssText = `
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 4px 10px !important;
        background: color-mix(in srgb, var(--rabbit-composer-bg, #000) 70%, #000) !important;
        border-top: 1px solid rgba(255,255,255,0.08) !important;
        border-radius: 0 0 18px 18px !important;
        min-height: 36px !important;
        margin: 0 !important;
      `;

      toolbarChildren.forEach((child) => toolbar.appendChild(child));
      shell.appendChild(toolbar);
      inputChild.style.borderRadius = '18px 18px 0 0';
    });

    document.querySelectorAll('main > div, body > div > main > div').forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      if (el.closest('.rabbit-composer-shell')) return;
      if (el.closest('[data-message-author-role]')) return;

      const text = (el.textContent || '').toLowerCase();
      const rect = el.getBoundingClientRect();
      if (
        rect.bottom > window.innerHeight - 80 &&
        rect.top > window.innerHeight - 100 &&
        (text.includes('make mistakes') || text.includes('check important') || text === '')
      ) {
        el.style.setProperty('display', 'none', 'important');
      }
    });
  }

  function pauseObserver() {
    observerPaused = true;
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
  }

  function resumeObserver() {
    observerPaused = false;
    observeDom();
  }

  function refreshAllStyling() {
    pauseObserver();
    try {
      refreshMessageStyling();
      refreshComposerStyling();
      refreshGptWarningVisibility();
      ensureSidebarDeleteButtons();
      fixComposerLayout();
    } finally {
      resumeObserver();
    }
  }

  function scheduleRefresh(delay = 140) {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      refreshTimer = null;
      refreshAllStyling();
    }, delay);
  }

  function observeDom() {
    if (mutationObserver || observerPaused) return;

    mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;

        const nodes = [...mutation.addedNodes, ...mutation.removedNodes];
        for (const node of nodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.id === PANEL_ID || node.closest?.(`#${PANEL_ID}`)) continue;
          scheduleRefresh(140);
          return;
        }
      }
    });

    mutationObserver.observe(document.documentElement, {
      subtree: true,
      childList: true
    });
  }

  function addMenuCommands() {
    if (typeof GM_registerMenuCommand !== 'function') return;

    GM_registerMenuCommand('Open Theme Editor', () => {
      const panel = makePanel();
      settings.panelHidden = false;
      setActivePage(panel, 'themes');
      saveSettings();

      if (typeof settings.panelLeft === 'number') {
        panel.style.left = `${settings.panelLeft}px`;
        panel.style.right = 'auto';
      } else {
        panel.style.right = `${PANEL_OPEN_RIGHT}px`;
        panel.style.left = 'auto';
      }

      if (typeof settings.panelTop === 'number') {
        panel.style.top = `${settings.panelTop}px`;
      } else {
        panel.style.top = `${PANEL_OPEN_TOP}px`;
      }

      panel.style.bottom = 'auto';
      updatePanelHiddenState(panel);
    });

    GM_registerMenuCommand('Check Script Updates', () => {
      checkForUserscriptUpdate({ openInstall: false, silent: false });
    });

    GM_registerMenuCommand('Install from GitHub Raw', () => {
      checkForUserscriptUpdate({ openInstall: true, silent: false });
    });

    GM_registerMenuCommand('Reset Theme Editor', () => {
      settings = normalizeSettings(null);
      saveSettings();
      applyStyles();
      const panel = document.getElementById(PANEL_ID);
      if (panel) panel.remove();
      makePanel();
      scheduleRefresh(120);
    });
  }

  function init() {
    if (!document.body || !document.documentElement) {
      setTimeout(init, 80);
      return;
    }
    applyStyles();
    makePanel();
    bindFloatingPromptEvents();
    renderFloatingPinnedPrompts();
    refreshAllStyling();
    observeDom();
    addMenuCommands();

    if (settings.autoCheckUpdates) {
      setTimeout(() => {
        checkForUserscriptUpdate({ openInstall: false, silent: true });
      }, 1800);
    }

    window.addEventListener('resize', () => {
      const panel = document.getElementById(PANEL_ID);
      if (!panel || settings.panelHidden) return;
      ensurePanelOnscreen(panel);
      scheduleRefresh(80);
    });

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest('.rabbit-composer-prompt-dock')) return;
      if (target.closest('.rabbit-composer-prompt-menu')) return;
      closeComposerPromptMenus();
    });

    scheduleRefresh(220);

    setTimeout(() => {
      const panel = document.getElementById(PANEL_ID);
      if (!panel) {
        makePanel();
      } else {
        ensurePanelOnscreen(panel);
      }
      if (!document.getElementById(STYLE_ID)) applyStyles();
    }, 1200);
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
