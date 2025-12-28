// js/i18n.mjs - v3.0.2 (Debug & Path Fix)
import { get, set, on } from "./localStorage.mjs";

class I18n {
  constructor() {
    this.translations = {};
    this.currentLang = "en";
    this.isInitialized = false;
    this.observer = null;
    
    this.config = {
      storageKey: "language",  // 存储语言的 localStorage 键名
      urlParamKey: "lg",  // URL 参数键名，用于指定语言
      debug: true, // 默认开启调试，方便排查
      mode: "json",  // 翻译模式：json 或 tag
      languages: ["en", "zh"],  // 支持的语言列表
      defaultLanguage: "en",  // 默认语言
      localesPath: "../locales",  // 翻译文件所在目录
      autoObserve: true,  // 是否自动监听 localStorage 变化
    };

    this.t = this.t.bind(this);
    this.setLanguage = this.setLanguage.bind(this);
  }

  async init(userConfig = {}) {
    if (this.isInitialized) return;
    this.config = { ...this.config, ...userConfig };
    
    const lang = this._determineLanguage();
    
    on(this.config.storageKey, (newLang) => {
      if (newLang && newLang !== this.currentLang && this.config.languages.includes(newLang)) {
        this.setLanguage(newLang, false, false);
      }
    });

    if (this.config.autoObserve && typeof window !== 'undefined') {
      this._startObserver();
    }

    await this.setLanguage(lang, true, true);
    this.isInitialized = true;
    this._log("Ready.");
  }

  t(key, variables = {}) {
    if (this.config.mode === 'tag') return key;
    const lang = this.currentLang;
    
    // 安全获取翻译
    let translation = this._getNestedValue(this.translations[lang], key);
    
    // Fallback 到默认语言
    if (!translation && lang !== this.config.defaultLanguage) {
      translation = this._getNestedValue(this.translations[this.config.defaultLanguage], key);
    }
    
    // 如果找不到翻译，返回 Key 本身
    if (!translation) {
        // 可选：开发模式下标记缺失的 Key
        // if (this.config.debug) console.warn(`[I18n] Missing key: ${key}`);
        return key;
    }

    // 复数处理
    if (typeof translation === "object" && variables.count !== undefined) {
      const rule = new Intl.PluralRules(lang).select(variables.count);
      translation = translation[rule] || translation.other || key;
    }

    // 如果仍是对象（如父节点），返回 Key
    if (typeof translation === "object") return key;

    // 变量插值
    return String(translation).replace(/{{(\w+)}}/g, (_, varName) => {
      const value = variables[varName];
      return value !== undefined ? this._escapeHtml(String(value)) : `{{${varName}}}`;
    });
  }

  async setLanguage(lang, saveToStorage = true, updateUrl = true) {
    if (!this.config.languages.includes(lang)) {
      console.error(`[I18n] Not supported: ${lang}`);
      return;
    }

    if (this.config.mode === 'json') {
      await this._loadTranslations(lang);
      // 预加载默认语言作为备用
      if (lang !== this.config.defaultLanguage) {
        await this._loadTranslations(this.config.defaultLanguage);
      }
    }

    this.currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = this._isRtl(lang) ? "rtl" : "ltr";

    this._updateActiveState(lang);
    
    // 强制 UI 更新
    this.updateDOM(); 

    if (saveToStorage) set(this.config.storageKey, lang);
    if (updateUrl) {
      const url = new URL(window.location);
      if (url.searchParams.get(this.config.urlParamKey) !== lang) {
        url.searchParams.set(this.config.urlParamKey, lang);
        window.history.replaceState({}, "", url);
      }
    }
    
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: { language: lang } }));
  }

  updateDOM(rootElement = document) {
    // 1. 暂停 Observer 防止死循环
    if (this.observer) this.observer.disconnect();

    try {
        const titleEl = document.querySelector("title");
        if (titleEl) {
            const titleText = titleEl.getAttribute(`data-lang-${this.currentLang}`);
            if (titleText) document.title = titleText;
        }

        if (this.config.mode === 'json') {
            this._updateJsonMode(rootElement);
        } else {
            this._updateTagMode(rootElement);
        }
    } catch (e) {
        console.error("[I18n] Update DOM failed:", e);
    }

    // 2. 恢复 Observer
    if (this.config.autoObserve && this.observer) {
        this.observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  _updateJsonMode(root) {
    // 文本翻译
    root.querySelectorAll("[data-i18n-key]").forEach(el => {
      const key = el.getAttribute("data-i18n-key");
      const paramsRaw = el.getAttribute("data-i18n-params");
      let params = {};
      try { if (paramsRaw) params = JSON.parse(paramsRaw.replace(/'/g, '"')); } catch(e) {}
      
      const newText = this.t(key, params);
      // 只在内容变化时更新，避免无意义的 DOM 操作
      if (el.textContent !== newText) {
          el.textContent = newText;
      }
    });

    // 属性翻译
    root.querySelectorAll("[data-i18n-attr]").forEach(el => {
      const config = el.getAttribute("data-i18n-attr");
      config.split(';').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (attr && key) {
          const newVal = this.t(key);
          if (el.getAttribute(attr) !== newVal) {
              el.setAttribute(attr, newVal);
          }
        }
      });
    });
  }

  _updateTagMode(root) {
    root.querySelectorAll("[data-lang]").forEach(el => {
      el.style.display = el.getAttribute("data-lang") === this.currentLang ? "" : "none";
    });
  }

  async _loadTranslations(lang) {
    // 如果已经加载过且不为空，直接返回
    if (this.translations[lang] && Object.keys(this.translations[lang]).length > 0) return;

    try {
      // 路径处理：移除末尾斜杠，确保路径拼接正确
      const basePath = this.config.localesPath.replace(/\/+$/, ''); 
      const url = `${basePath}/${lang}.json`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      
      this.translations[lang] = await res.json();
      this._log(`Loaded: ${lang}`);
    } catch (error) {
      console.error(`[I18n Error] Failed to load "${lang}" from "${this.config.localesPath}". check your "localesPath" config.`, error);
      // 加载失败时初始化为空对象，防止报错
      this.translations[lang] = {}; 
    }
  }

  _getNestedValue(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
  }

  _determineLanguage() {
    const { urlParamKey, storageKey, languages, defaultLanguage } = this.config;
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get(urlParamKey);
    if (urlLang && languages.includes(urlLang)) return urlLang;
    const storedLang = get(storageKey);
    if (storedLang && languages.includes(storedLang)) return storedLang;
    const browserLang = navigator.language.split("-")[0];
    if (languages.includes(browserLang)) return browserLang;
    return defaultLanguage;
  }

  _updateActiveState(lang) {
    document.querySelectorAll('[data-i18n-switcher]').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    const target = document.querySelector(`[data-i18n-switcher="${lang}"]`);
    if (target) {
        target.classList.add('active');
        target.setAttribute('aria-pressed', 'true');
    }
  }

  _startObserver() {
    this.observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      mutations.forEach(m => {
        if (m.type === 'childList' && m.addedNodes.length > 0) shouldUpdate = true;
      });
      if (shouldUpdate) this.updateDOM();
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  _isRtl(lang) { return ["ar", "he", "fa", "ur"].includes(lang); }
  
  _escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }
  
  _log(...args) { if (this.config.debug) console.log("[I18n]", ...args); }
}

export const i18n = new I18n();
export const initI18n = i18n.init.bind(i18n);
export const setLanguage = i18n.setLanguage.bind(i18n);
export const t = i18n.t;
