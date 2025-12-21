/**
 * 智能密码输入框组件 (ESM Module - Integrated with msg.mjs)
 *
 * @version 6.2.0
 * @author GLM-4.6
 *
 * @description
 * 高度可配置的密码生成组件。此版本 (v6.2.0) 已集成外部的 msg.mjs 消息系统，
 * 实现了UI反馈与组件逻辑的解耦。在复制和应用密码时，将使用统一的 msg 样式。
 *
 * @dependencies
 * - zxcvbn: (可选) 如果启用 showStrength，则必须在 HTML 中先于此脚本加载。
 * - msg.mjs: (必须) 用于显示统一的操作反馈消息。
 * - TailwindCSS: (需要由开发者引入以处理样式)。
 */
import { msg } from './msg.mjs'; // 【核心更新】导入外部消息模块

// --- 默认配置 ---
const DEFAULT_CONFIG = {
    // 【核心参数化】自定义核心元素的ID
    passwordInputId: 'password-generator-widget-password-input',
    generateBtnId: 'password-generator-widget-generate-btn',
    
    // 【核心参数化】UI面板的注入配置
    injectUI: true,
    injectTarget: {
        element: null,
        position: 'beforeend',
    },

    // 其他配置
    passwordLength: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    lengthRange: { min: 8, max: 32 },
    showStrength: false,
    charSets: {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    },
};

// --- 主组件类 ---
class PasswordGenerator {
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        
        const dashIndex = this.config.passwordInputId.lastIndexOf('-');
        this.idPrefix = dashIndex !== -1 ? this.config.passwordInputId.substring(0, dashIndex) : 'password-generator-widget';

        if (this.config.showStrength && typeof zxcvbn === 'undefined') {
            msg.error('密码生成器：showStrength 为 true，但未加载 zxcvbn 库。');
        }

        this.init();
    }

    init() {
        this.cacheDOM();
        if (!this.dom.passwordInput || !this.dom.generateBtn) {
            msg.error(`密码生成器：未找到 ID 为 #${this.config.passwordInputId} 或 #${this.config.generateBtnId} 的必要 DOM 元素。`);
            return;
        }

        if (this.config.injectUI && !this.dom.generatorPanel) {
            this.injectUI();
            this.cacheDOM();
        }

        this.attachEvents();
        this.currentPassword = this.generatePassword();
    }
    
    injectUI() {
        let targetElement = this.dom.generateBtn.parentElement;

        if (this.config.injectTarget.element) {
            if (typeof this.config.injectTarget.element === 'string') {
                targetElement = document.querySelector(this.config.injectTarget.element);
            } else {
                targetElement = this.config.injectTarget.element;
            }
        }

        if (!targetElement) {
            msg.error("密码生成器：无法找到合适的目标来注入 UI 面板。", this.config.injectTarget);
            return;
        }

        if (getComputedStyle(targetElement).position === 'static') {
            targetElement.style.position = 'relative';
        }
        
        const panelHTML = this.getPanelHTMLTemplate();
        targetElement.insertAdjacentHTML(this.config.injectTarget.position, panelHTML);
        //console.log(`密码生成器 v6.2.0：UI 面板已注入到`, targetElement);
    }
    
    getPanelHTMLTemplate() {
        const ids = {
            panel: this.id('generator-panel'),
            password: this.id('generated-password'),
            copy: this.id('copy-btn'),
            lengthSlider: this.id('password-length'),
            lengthValue: this.id('length-value'),
            advanced: this.id('advanced-options'),
            toggleAdvanced: this.id('toggle-advanced'),
            options: {
                uppercase: this.id('uppercase'),
                lowercase: this.id('lowercase'),
                numbers: this.id('numbers'),
                symbols: this.id('symbols')
            },
            regenerate: this.id('regenerate-btn'),
            apply: this.id('apply-btn'),
        };
        
        return `
            <!-- 生成器面板 - 由 PasswordGenerator.mjs v6.2.0 动态注入 -->
            <div class="relative">
                <div id="${ids.panel}" class="hidden z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl p-5 absolute">
                    <div class="space-y-4">
                        <!-- 密码显示 -->
                        <div class="flex items-center space-x-2 p-3 bg-gray-100 rounded-md">
                                                            <span id="${ids.password}" class="flex-1 font-mono text-sm text-gray-800 break-all"></span>
                                                            <button id="${ids.copy}" class="p-1 text-gray-500 hover-text-primary transition-colors center"
                                                            title="复制密码" aria-label="复制生成的密码"><i class="bxr bx-copy text-gray hover-text-green-500"></i>
                                                            </button>
                                                        </div>
                                                    
                                                    <!-- 高级选项 -->
                                                    <div id="${ids.advanced}"
                                                        class="slide-down">
                                                        <div class="space-y-3">
                                                            <div>
                                                                <label class="text-sm font-medium text-gray-700">密码长度:
                                                                    <span id="${ids.lengthValue}"
                                                                        class="text-primary">16</span>
                                                                    </label>
                                                                    <input type="range" id="${ids.lengthSlider}" min="8" max="32" value="16" class="w-full mt-1 h-1">
                                                            </div>
                                                            <div class="space-y-2">
                                                                <div class="flex items-center justify-between"><label
                                                                        for="${ids.options.uppercase}"
                                                                        class="text-sm text-gray-700">包含大写字母
                                                                        (A-Z)</label><input type="checkbox"
                                                                        id="${ids.options.uppercase}" checked
                                                                        class="rounded border-surface text-primary focus-ring-primary">
                                                                </div>
                                                                <div class="flex items-center justify-between"><label
                                                                        for="${ids.options.lowercase}"
                                                                        class="text-sm text-gray-700">包含小写字母</label><input
                                                                        type="checkbox"
                                                                        id="${ids.options.lowercase}" checked
                                                                        class="rounded border-surface text-primary focus-ring-primary">
                                                                </div>
                                                                <div class="flex items-center justify-between"><label
                                                                        for="${ids.options.numbers}"
                                                                        class="text-sm text-gray-700">包含数字
                                                                        (0-9)</label><input type="checkbox"
                                                                        id="${ids.options.numbers}" checked
                                                                        class="rounded border-surface text-primary focus-ring-primary">
                                                                </div>
                                                                <div class="flex items-center justify-between"><label
                                                                        for="${ids.options.symbols}"
                                                                        class="text-sm text-gray-700">包含特殊符号
                                                                        (!@#$...)</label><input type="checkbox"
                                                                        id="${ids.options.symbols}" checked
                                                                        class="rounded border-surface text-primary focus-ring-primary">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <!-- 操作按钮 -->
                                                    <div class="flex center-y space-y-2 pt-2 border-t border-surface">
                                                        <button type="button" id="${ids.toggleAdvanced}" class="text-sm text-primary hover-border-primary text-left w-full border-none">+高级选项</button>
                                                        <div class="flex w-full space-x-3">
                                                            <button type="button" id="${ids.regenerate}" class="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover-bg-gray-300 transition-all transform">重新生成</button>
                                                            <button type="button" id="${ids.apply}" class="flex-1 px-4 py-2 text-white bg-primary rounded-md hover-bg-primary transition-all transform">应用此密码</button>
                                                        </div>
                                                    </div>
                    </div>
                </div>
            </div>
        `;
    }

    id(suffix) {
        if (suffix.includes('-')) {
            return suffix;
        }
        return `${this.idPrefix}-${suffix}`;
    }

    cacheDOM() {
        this.dom = {
            passwordInput: document.getElementById(this.config.passwordInputId),
            generateBtn: document.getElementById(this.config.generateBtnId),
            generatorPanel: document.getElementById(this.id('generator-panel')),
            generatedPasswordEl: document.getElementById(this.id('generated-password')),
            copyBtn: document.getElementById(this.id('copy-btn')),
            applyBtn: document.getElementById(this.id('apply-btn')),
            regenerateBtn: document.getElementById(this.id('regenerate-btn')),
            lengthSlider: document.getElementById(this.id('password-length')),
            lengthValueEl: document.getElementById(this.id('length-value')),
            advancedOptionsDiv: document.getElementById(this.id('advanced-options')),
            toggleAdvancedBtn: document.getElementById(this.id('toggle-advanced')),
            options: {
                uppercase: document.getElementById(this.id('uppercase')),
                lowercase: document.getElementById(this.id('lowercase')),
                numbers: document.getElementById(this.id('numbers')),
                symbols: document.getElementById(this.id('symbols'))
            }
        };
        this.currentPassword = '';
        this.isAdvancedOpen = false;
    }
    
    // 【已移除】showToast 方法，因为已集成 msg.mjs
    // showToast(message, type = 'success') { ... }

    generatePassword() {
        let charset = '';
        if (this.dom.options.uppercase?.checked) charset += this.config.charSets.uppercase;
        if (this.dom.options.lowercase?.checked) charset += this.config.charSets.lowercase;
        if (this.dom.options.numbers?.checked) charset += this.config.charSets.numbers;
        if (this.dom.options.symbols?.checked) charset += this.config.charSets.symbols;
        if (!charset) charset += this.config.charSets.lowercase;
        let password = '';
        const length = parseInt(this.dom.lengthSlider?.value || this.config.passwordLength);
        for (let i = 0; i < length; i++) password += charset.charAt(Math.floor(Math.random() * charset.length));
        return password;
    }

    updatePasswordDisplay() {
        this.currentPassword = this.generatePassword();
        if (this.dom.generatedPasswordEl) {
            this.dom.generatedPasswordEl.textContent = this.currentPassword;
        }
    }

    closePanelWithAnimation() {
        if (!this.dom.generatorPanel) return;
        this.dom.generatorPanel.classList.add('hidden');
    }

    attachEvents() {
        if (!this.dom.generateBtn || !this.dom.generatorPanel) {
            msg.error('密码生成器：未找到核心按钮或面板，无法附加事件。');
            return;
        }

        this.dom.generateBtn.addEventListener('click', () => {
            const isHidden = this.dom.generatorPanel.classList.contains('hidden');
            if (isHidden) {
                this.dom.generatorPanel.classList.remove('hidden');
                this.updatePasswordDisplay();
            } else {
                this.closePanelWithAnimation();
            }
        });

        if (this.dom.regenerateBtn) {
            this.dom.regenerateBtn.addEventListener('click', () => this.updatePasswordDisplay());
        }

        if (this.dom.applyBtn) {
            this.dom.applyBtn.addEventListener('click', () => {
                if (this.currentPassword && this.dom.passwordInput) {
                    this.dom.passwordInput.value = this.currentPassword;
                    this.closePanelWithAnimation();
                    // 【核心更新】使用 msg.success
                    msg.success('密码已成功应用！');
                }
            });
        }

        if (this.dom.copyBtn) {
            this.dom.copyBtn.addEventListener('click', () => {
                if (this.currentPassword) {
                    navigator.clipboard.writeText(this.currentPassword).then(() => {
                        // 【核心更新】使用 msg.success 并关闭面板
                        msg.success('复制成功');
                        this.closePanelWithAnimation();
                    }).catch(err => {
                        // 【核心更新】使用 msg.error 提供错误反馈
                        //console.error('复制失败: ', err);
                        msg.error('复制失败，请手动复制');
                    });
                }
            });
        }
        
        if (this.dom.lengthSlider && this.dom.lengthValueEl) {
            this.dom.lengthSlider.addEventListener('input', (e) => {
                this.dom.lengthValueEl.textContent = e.target.value;
            });
        }
        
        Object.values(this.dom.options).forEach(option => {
            if (option) {
                option.addEventListener('change', () => this.updatePasswordDisplay());
            }
        });

        if (this.dom.toggleAdvancedBtn && this.dom.advancedOptionsDiv) {
            this.dom.toggleAdvancedBtn.addEventListener('click', () => {
                this.isAdvancedOpen = !this.isAdvancedOpen;
                this.dom.advancedOptionsDiv.classList.toggle('slide-down-open');
                this.dom.toggleAdvancedBtn.textContent = this.isAdvancedOpen ? '- 收起选项' : '+ 高级选项';
            });
        }

        document.addEventListener('click', (e) => {
            if (!this.dom.generatorPanel || !this.dom.generateBtn) return;
            const isClickInside = this.dom.generatorPanel.contains(e.target) || this.dom.generateBtn.contains(e.target);
            if (!isClickInside && !this.dom.generatorPanel.classList.contains('hidden')) {
                this.closePanelWithAnimation();
            }
        });
    }

    getValue() {
        return this.dom.passwordInput ? this.dom.passwordInput.value : '';
    }
}

export default PasswordGenerator;
