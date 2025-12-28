// js/i18n.mjs - v2.0.0
import { get, set, on } from "./localStorage.mjs";

let translations = {};
let currentLang = "en";
let config = {};

/**
 * 初始化 i18n
 * @param {Object} userConfig 配置对象
 * @param {string} userConfig.mode - 'json' (默认) 或 'tag'
 */
export function initI18n(userConfig) {
  config = {
    storageKey: "language",
    urlParamKey: "lg",
    debug: false,
    mode: "json", // 新增参数：默认使用 JSON 模式
    languages: ["en", "zh"], // 默认语言列表
    defaultLanguage: "en",
    ...userConfig,
  };
  
  const { languages, defaultLanguage, storageKey, urlParamKey } = config;

  function determineLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get(urlParamKey);
    if (urlLang && languages.includes(urlLang)) {
      if (config.debug) console.log(`[I18n Debug] Language from URL: ${urlLang}`);
      set(storageKey, urlLang);
      return urlLang;
    }
    const storedLang = get(storageKey);
    if (storedLang && languages.includes(storedLang)) {
      if (config.debug) console.log(`[I18n Debug] Language from storage: ${storedLang}`);
      return storedLang;
    }
    const browserLang = navigator.language.split("-")[0];
    if (languages.includes(browserLang)) {
      if (config.debug) console.log(`[I18n Debug] Language from browser: ${browserLang}`);
      return browserLang;
    }
    return defaultLanguage;
  }

  // 仅在 JSON 模式下加载文件
  async function loadTranslations(lang) {
    if (config.mode !== 'json') return; // TAG 模式不需要加载
    
    if (translations[lang]) return;
    try {
      const response = await fetch(`./locales/${lang}.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      translations[lang] = await response.json();
      if (config.debug) console.log(`[I18n Debug] Loaded translations for '${lang}'.`);
    } catch (error) {
      console.error(`[I18n Error] Could not load translations for '${lang}':`, error);
      translations[lang] = {};
    }
  }

  // 更新 DOM 的核心逻辑
  function updateDOM(lang) {
    // 1. 处理 Title
    const titleEl = document.querySelector("title");
    if (titleEl) {
      // 尝试匹配 data-lang-zh 属性
      const titleText = titleEl.getAttribute(`data-lang-${lang}`);
      if (titleText) document.title = titleText;
    }

    // 2. 根据模式分流
    if (config.mode === 'json') {
      // JSON 模式：查找 data-i18n-key 并替换文本
      document.querySelectorAll("[data-i18n-key]").forEach((el) => {
        const key = el.getAttribute("data-i18n-key");
        if (key) el.textContent = t(key);
      });
    } else if (config.mode === 'tag') {
      // TAG 模式：查找所有 data-lang 属性
      // 逻辑：如果 data-lang 等于当前语言，显示；否则隐藏
      document.querySelectorAll("[data-lang]").forEach((el) => {
        const targetLang = el.getAttribute("data-lang");
        if (targetLang === lang) {
            // 移除 display: none，恢复默认显示方式 (block, inline, flex 等由 CSS 决定)
            el.style.display = ""; 
        } else {
            el.style.display = "none";
        }
      });
    }
  }

  // 设置语言的主函数
  async function setLanguageInternal(lang, saveToStorage = true, updateUrl = true) {
    if (!languages.includes(lang)) {
      console.error(`[I18n Error] Language "${lang}" is not supported.`);
      return;
    }

    document.documentElement.lang = lang;

    // 可以在这里处理 active 类，但为了解耦，建议在 UI 组件(app.js)中处理视觉反馈
    // 仅保留最基础的 active 标记
    document.querySelectorAll('[id^="lang-"]').forEach((btn) => btn.classList.remove("active"));
    const activeBtn = document.getElementById(`lang-${lang}`);
    if (activeBtn) activeBtn.classList.add("active");

    // 异步加载翻译 (如果是 TAG 模式，这里会直接返回)
    await loadTranslations(lang);
    
    // 更新页面内容
    updateDOM(lang);

    // 持久化与 URL 更新
    if (saveToStorage) set(storageKey, lang);
    if (updateUrl) {
      const url = new URL(window.location);
      if (url.searchParams.get(urlParamKey) !== lang) {
        url.searchParams.set(urlParamKey, lang);
        window.history.replaceState({}, "", url);
      }
    }

    currentLang = lang;
    
    // 触发自定义事件，供外部监听
    window.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { language: lang } })
    );
    
    if (config.debug) console.log(`[I18n Debug] Language set to "${lang}" (Mode: ${config.mode}).`);
  }

  // 监听 Storage 变化（多标签页同步）
  on(storageKey, (newLang) => {
    if (newLang && newLang !== currentLang) {
      setLanguageInternal(newLang, false, false);
    }
  });

  // 启动
  setLanguageInternal(determineLanguage());
  
  // 导出 setLanguage 给外部使用
  // 注意：这里将内部函数赋值给外部可见的 export 变量是不行的，
  // 我们需要把 setLanguageInternal 赋给一个模块级变量或者直接作为 export 导出。
  // 为了不破坏下面的 export 结构，我们在 init 内部把 setLanguageInternal 挂载到 window 或者通过闭包返回是不够的。
  // 最好的方式是重构导出。但在不大幅修改结构的情况下，我将 setLanguageInternal 赋值给外部导出的引用是行不通的（ESM特性）。
  // **修正方案**：将 setLanguageInternal 提升到 initI18n 外部，或者在 initI18n 内部修改一个模块级的 export 变量（也不行）。
  // **最佳修正**：使用一个模块作用域的引用，如下所示：
  _globalSetLanguage = setLanguageInternal;
}

// 模块级变量，用于中转 setLanguage
let _globalSetLanguage = async () => { console.warn("I18n not initialized"); };

// 导出供外部调用的 setLanguage
export async function setLanguage(lang, saveToStorage = true, updateUrl = true) {
    return _globalSetLanguage(lang, saveToStorage, updateUrl);
}

// JSON 模式下的翻译函数
export function t(key, variables = {}) {
  // Tag 模式下调用 t() 可能没有意义，但也允许返回 key 防止报错
  if (config.mode === 'tag') return key;

  const lang = document.documentElement.lang || currentLang;
  let translation =
    translations[lang]?.[key] ||
    translations[config.defaultLanguage]?.[key] ||
    key;
  if (typeof translation === "object" && variables.count !== undefined) {
    const rule = new Intl.PluralRules(lang).select(variables.count);
    translation = translation[rule] || translation.other || key;
  }
  return translation.replace(/{{(\w+)}}/g, (match, varName) =>
    variables[varName] !== undefined ? variables[varName] : match
  );
}
