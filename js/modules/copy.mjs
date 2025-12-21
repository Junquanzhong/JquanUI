// copy.mjs - 纯ESM复制功能模块
// 本组件逻辑部分由GLM-4.6生成，UI部分由JquanUI V3.0设计
// 1. 从外部导入 msg 模块
//    请确保路径 './msg.js' 是正确的
import { msg } from './msg.mjs';
/**
 * 核心复制函数，优先使用现代API
 * @param {string} str
 * @returns {Promise<boolean>}
 */
const copyToClipboard = async (str) => {
    if (!str) return false;
    try {
        await navigator.clipboard.writeText(str);
        return true;
    } catch (err) {
        console.warn('navigator.clipboard API 失败，回退到 execCommand：', err);
        return fallbackCopy(str);
    }
};

const fallbackCopy = (str) => {
    // ... (此函数保持不变) ...
    return new Promise((resolve) => {
        const el = document.createElement("textarea");
        el.value = str;
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(el);
        resolve(successful);
    });
};

/**
 * 复制任意文本
 * @param {string} text
 */
export const copyText = async (text) => {
    if (typeof text !== 'string' || text.trim() === '') {
        // 2. 使用导入的 msg
        msg.warning('复制内容不能为空');
        return false;
    }
    const success = await copyToClipboard(text.trim());
    if (success) {
        // 2. 使用导入的 msg
        msg.success('复制成功');
    } else {
        // 2. 使用导入的 msg
        msg.error('复制失败');
    }
    return success;
};

/**
 * 复制指定选择器或DOM元素的文本内容
 * @param {string | HTMLElement} target
 */
export const copyElement = async (target) => {
    let element;
    if (typeof target === 'string') {
        element = document.querySelector(target);
        if (!element) {
            // 2. 使用导入的 msg
            msg.error(`未找到选择器 "${target}" 对应的元素`);
            return false;
        }
    } else if (target instanceof HTMLElement) {
        element = target;
    } else {
        // 2. 使用导入的 msg
        msg.error('无效的复制目标，需要是选择器字符串或DOM元素');
        return false;
    }
    
    const text = element.value || element.textContent || element.innerText;
    if (!text || text.trim() === '') {
        // 2. 使用导入的 msg
        msg.warning('目标元素没有可复制的内容');
        return false;
    }
    
    return await copyText(text.trim());
};


/**
 * 初始化函数，扫描并绑定具有特定属性的元素
 */
export const initCopyButtons = () => {
    document.querySelectorAll('[data-copy-text]').forEach(el => {
        const text = el.getAttribute('data-copy-text');
        if (text) {
            el.addEventListener('click', () => copyText(text));
            el.style.cursor = 'pointer';
        }
    });

    document.querySelectorAll('[data-copy-selector]').forEach(el => {
        const selector = el.getAttribute('data-copy-selector');
        if (selector) {
            el.addEventListener('click', () => copyElement(selector));
            el.style.cursor = 'pointer';
        }
    });
};
