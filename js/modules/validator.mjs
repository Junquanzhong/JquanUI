/**
 * JquanUI Validator
 * 纯逻辑校验库，不绑定 UI
 * @author Gemini-3-Pro
 * @version 1.0.0
 * @license MIT
 */

const RULES = {
    required: (v) => v !== null && v !== undefined && v !== '',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    minLength: (v, len) => String(v).length >= len,
    maxLength: (v, len) => String(v).length <= len,
    number: (v) => !isNaN(parseFloat(v)) && isFinite(v),
    phone: (v) => /^1[3-9]\d{9}$/.test(v) // 简易中国手机号正则
};

export const Validator = {
    /**
     * 校验单个值
     * @param {Any} value - 待校验值
     * @param {String|Function} rule - 规则名 或 自定义函数
     * @param {Any} param - 规则参数 (如 minLength 的长度)
     * @returns {Boolean}
     */
    check(value, rule, param) {
        if (typeof rule === 'function') {
            return rule(value, param);
        }
        if (RULES[rule]) {
            return RULES[rule](value, param);
        }
        console.warn(`[Validator] Unknown rule: ${rule}`);
        return true;
    },

    /**
     * 批量校验对象
     * @param {Object} data - 表单数据 { name: '...', age: 10 }
     * @param {Object} schema - 规则配置 { name: ['required'], age: ['number', ['minLength', 18]] }
     * @returns {Object} { valid: boolean, errors: { field: ruleName } }
     */
    validate(data, schema) {
        const errors = {};
        let isValid = true;

        for (const [field, rules] of Object.entries(schema)) {
            for (const ruleItem of rules) {
                let ruleName, ruleParam;
                
                if (Array.isArray(ruleItem)) {
                    [ruleName, ruleParam] = ruleItem;
                } else {
                    ruleName = ruleItem;
                }

                if (!this.check(data[field], ruleName, ruleParam)) {
                    isValid = false;
                    errors[field] = ruleName; // 记录失败的规则
                    break; // 只要有一个规则失败，该字段即失败
                }
            }
        }

        return { valid: isValid, errors };
    }
};
