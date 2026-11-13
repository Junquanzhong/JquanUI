// I LOVE CODING
// 🚀 JquanUI Runtime Atomic CSS Engine v3.6 - 全量生产级架构版 (The Architect Edition)
// 全量 CSS 字典无删减 | 极致性能 CSSOM 注入 | 语义化主题系统 | 原生加载器引擎

(function () {

    // ==========================================
    // §1. 工具函数
    // ==========================================

    function hexToRgb(hex) {
        if (typeof hex !== 'string' || !hex.startsWith('#')) return hex;
        let h = hex.replace('#', '');
        if (h.length === 3) h = [...h].map(c => c + c).join('');
        if (h.length === 6) return `${parseInt(h.substring(0, 2), 16)} ${parseInt(h.substring(2, 4), 16)} ${parseInt(h.substring(4, 6), 16)}`;
        return hex;
    }

    function escapeClassName(className) {
        return className.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&');
    }

    // ==========================================
    // §2. 色彩系统
    // ==========================================

    const baseColors = {
        inherit: 'inherit', current: 'currentColor', transparent: 'transparent',
        black: '0 0 0', white: '255 255 255',
        slate: { 50: '248 250 252', 100: '241 245 249', 200: '226 232 240', 300: '203 213 225', 400: '148 163 184', 500: '100 116 139', 600: '71 85 105', 700: '51 65 85', 800: '30 41 59', 900: '15 23 42', 950: '2 6 23' },
        gray: { 50: '249 250 251', 100: '243 244 246', 200: '229 231 235', 300: '209 213 219', 400: '156 163 175', 500: '107 114 128', 600: '75 85 99', 700: '55 65 81', 800: '31 41 55', 900: '17 24 39', 950: '3 7 18' },
        zinc: { 50: '250 250 250', 100: '244 244 245', 200: '228 228 231', 300: '212 212 216', 400: '161 161 170', 500: '113 113 122', 600: '82 82 91', 700: '63 63 70', 800: '39 39 42', 900: '24 24 27', 950: '9 9 11' },
        neutral: { 50: '250 250 250', 100: '245 245 245', 200: '229 229 229', 300: '212 212 212', 400: '163 163 163', 500: '115 115 115', 600: '82 82 82', 700: '64 64 64', 800: '38 38 38', 900: '23 23 23', 950: '10 10 10' },
        stone: { 50: '250 250 249', 100: '245 245 244', 200: '231 229 228', 300: '214 211 209', 400: '168 162 158', 500: '120 113 108', 600: '87 83 78', 700: '68 64 60', 800: '41 37 36', 900: '28 25 23', 950: '12 10 9' },
        red: { 50: '254 242 242', 100: '254 226 226', 200: '254 202 202', 300: '252 165 165', 400: '248 113 113', 500: '239 68 68', 600: '220 38 38', 700: '185 28 28', 800: '153 27 27', 900: '127 29 29', 950: '69 10 10' },
        orange: { 50: '255 247 237', 100: '255 237 213', 200: '254 215 170', 300: '253 186 116', 400: '251 146 60', 500: '249 115 22', 600: '234 88 12', 700: '194 65 12', 800: '154 52 18', 900: '124 45 18', 950: '67 20 7' },
        amber: { 50: '255 251 235', 100: '254 243 199', 200: '253 230 138', 300: '252 211 77', 400: '251 191 36', 500: '245 158 11', 600: '217 119 6', 700: '180 83 9', 800: '146 64 14', 900: '120 53 15', 950: '69 26 3' },
        yellow: { 50: '254 252 232', 100: '254 249 195', 200: '254 240 138', 300: '253 224 71', 400: '250 204 21', 500: '234 179 8', 600: '202 138 4', 700: '161 98 7', 800: '133 77 14', 900: '113 63 18', 950: '66 32 6' },
        lime: { 50: '247 254 231', 100: '236 252 203', 200: '217 249 157', 300: '190 242 100', 400: '163 230 53', 500: '132 204 22', 600: '101 163 13', 700: '77 124 15', 800: '63 98 18', 900: '54 83 20', 950: '26 46 5' },
        green: { 50: '240 253 244', 100: '220 252 231', 200: '187 247 208', 300: '134 239 172', 400: '74 222 128', 500: '34 197 94', 600: '22 163 74', 700: '21 128 61', 800: '22 101 52', 900: '20 83 45', 950: '5 46 22' },
        emerald: { 50: '236 253 245', 100: '209 250 229', 200: '167 243 208', 300: '110 231 183', 400: '52 211 153', 500: '16 185 129', 600: '5 150 105', 700: '4 120 87', 800: '6 95 70', 900: '6 78 59', 950: '2 44 34' },
        teal: { 50: '240 253 250', 100: '204 251 241', 200: '153 246 228', 300: '94 234 212', 400: '45 212 191', 500: '20 184 166', 600: '13 148 136', 700: '15 118 110', 800: '17 94 89', 900: '19 78 74', 950: '4 47 46' },
        cyan: { 50: '236 254 255', 100: '207 250 254', 200: '165 243 252', 300: '103 232 249', 400: '34 211 238', 500: '6 182 212', 600: '8 145 178', 700: '14 116 144', 800: '21 94 117', 900: '22 78 99', 950: '8 51 68' },
        sky: { 50: '240 249 255', 100: '224 242 254', 200: '186 230 253', 300: '125 211 252', 400: '56 189 248', 500: '14 165 233', 600: '2 132 199', 700: '3 105 161', 800: '7 89 133', 900: '12 74 110', 950: '8 47 73' },
        blue: { 50: '239 246 255', 100: '219 234 254', 200: '191 219 254', 300: '147 197 253', 400: '96 165 250', 500: '59 130 246', 600: '37 99 235', 700: '29 78 216', 800: '30 64 175', 900: '30 58 138', 950: '23 37 84' },
        indigo: { 50: '238 242 255', 100: '224 231 255', 200: '199 210 254', 300: '165 180 252', 400: '129 140 248', 500: '99 102 241', 600: '79 70 229', 700: '67 56 202', 800: '55 48 163', 900: '49 46 129', 950: '30 27 75' },
        violet: { 50: '245 243 255', 100: '237 233 254', 200: '221 214 254', 300: '196 181 253', 400: '167 139 250', 500: '139 92 246', 600: '124 58 237', 700: '109 40 217', 800: '91 33 182', 900: '76 29 149', 950: '46 16 101' },
        purple: { 50: '250 245 255', 100: '243 232 255', 200: '233 213 255', 300: '216 180 254', 400: '192 132 252', 500: '168 85 247', 600: '147 51 234', 700: '126 34 206', 800: '107 33 168', 900: '88 28 135', 950: '59 7 100' },
        fuchsia: { 50: '253 244 255', 100: '250 232 255', 200: '245 208 254', 300: '240 171 252', 400: '232 121 249', 500: '217 70 239', 600: '192 38 211', 700: '162 28 175', 800: '134 25 143', 900: '112 26 117', 950: '74 4 78' },
        pink: { 50: '253 242 248', 100: '252 231 243', 200: '251 207 232', 300: '249 168 212', 400: '244 114 182', 500: '236 72 153', 600: '219 39 119', 700: '190 24 93', 800: '157 23 77', 900: '131 24 67', 950: '80 7 36' },
        rose: { 50: '255 241 242', 100: '255 228 230', 200: '254 205 211', 300: '253 164 175', 400: '251 113 133', 500: '244 63 94', 600: '225 29 72', 700: '190 18 60', 800: '159 18 57', 900: '136 19 55', 950: '76 5 25' },
        placergold: { 50: '254 252 232', 100: '254 249 195', 200: '254 240 138', 300: '253 224 71', 400: '250 204 21', 500: '234 179 8', 600: '202 138 4', 700: '161 98 7', 800: '133 77 14', 900: '113 63 18' },
        coralorange: { 50: '255 248 242', 100: '255 235 220', 200: '255 213 189', 300: '255 182 147', 400: '255 145 99', 500: '255 127 80', 600: '230 102 58', 700: '191 77 42', 800: '153 59 32', 900: '122 47 26' },
        cherrypink: { 50: '255 247 249', 100: '255 232 237', 200: '255 207 214', 300: '255 171 186', 400: '255 128 152', 500: '255 107 129', 600: '230 82 105', 700: '191 61 82', 800: '153 47 65', 900: '122 37 52' },
        goldenmarigold: { 50: '255 251 235', 100: '255 243 199', 200: '255 230 138', 300: '255 211 77', 400: '255 191 36', 500: '255 165 2', 600: '230 138 0', 700: '191 103 0', 800: '153 77 0', 900: '122 61 0' },
        tomatored: { 50: '255 245 242', 100: '255 228 222', 200: '255 202 191', 300: '255 165 147', 400: '255 120 99', 500: '255 99 72', 600: '230 74 50', 700: '191 55 37', 800: '153 42 29', 900: '122 34 23' },
        watermelonred: { 50: '255 244 245', 100: '255 227 229', 200: '255 199 203', 300: '255 160 169', 400: '255 113 128', 500: '255 71 87', 600: '230 50 67', 700: '191 37 52', 800: '153 29 41', 900: '122 23 33' },
        mintgreen: { 50: '240 254 247', 100: '220 252 236', 200: '187 247 215', 300: '134 239 185', 400: '74 222 148', 500: '123 237 159', 600: '34 197 110', 700: '21 155 85', 800: '17 122 67', 900: '14 98 54' },
        skyazure: { 50: '240 248 255', 100: '224 240 254', 200: '186 222 253', 300: '125 193 252', 400: '56 159 248', 500: '112 161 255', 600: '14 133 233', 700: '3 105 199', 800: '7 89 166', 900: '12 74 138' },
        jadegreen: { 50: '237 253 243', 100: '216 250 231', 200: '175 244 208', 300: '114 234 172', 400: '46 213 128', 500: '46 213 115', 600: '22 163 94', 700: '18 128 74', 800: '17 101 59', 900: '15 83 48' },
        dodgerblue: { 50: '239 246 255', 100: '219 234 254', 200: '191 219 254', 300: '147 197 253', 400: '96 165 250', 500: '30 144 255', 600: '25 110 235', 700: '21 88 216', 800: '22 69 175', 900: '22 57 138' },
        royalblue: { 50: '239 241 254', 100: '224 228 253', 200: '199 206 251', 300: '165 178 249', 400: '129 146 247', 500: '55 66 250', 600: '49 46 229', 700: '43 38 202', 800: '37 33 163', 900: '33 30 129' },
        peace: { 50: '248 250 252', 100: '241 245 249', 200: '226 232 240', 300: '203 213 225', 400: '168 184 200', 500: '164 176 190', 600: '115 128 145', 700: '82 94 110', 800: '58 67 80', 900: '42 49 58' },
        graphite: { 50: '249 250 251', 100: '243 244 246', 200: '229 231 235', 300: '209 213 219', 400: '156 163 175', 500: '87 96 111', 600: '75 85 99', 700: '55 65 81', 800: '39 48 60', 900: '28 35 44' },
        silvergray: { 50: '249 250 251', 100: '243 244 246', 200: '229 231 235', 300: '209 213 219', 400: '156 163 175', 500: '116 125 140', 600: '88 97 112', 700: '64 72 85', 800: '45 51 60', 900: '32 37 44' },
        midnight: { 50: '248 250 252', 100: '241 245 249', 200: '226 232 240', 300: '203 213 225', 400: '148 163 184', 500: '47 53 66', 600: '30 36 48', 700: '20 24 32', 800: '14 17 23', 900: '9 11 16' },
        mistwhite: { 50: '255 255 255', 100: '250 251 252', 200: '245 246 248', 300: '235 238 242', 400: '220 225 232', 500: '223 228 234', 600: '190 197 207', 700: '153 161 173', 800: '122 129 139', 900: '98 103 111' },
        snowwhite: { 50: '255 255 255', 100: '252 253 254', 200: '249 250 252', 300: '243 244 247', 400: '232 234 239', 500: '241 242 246', 600: '209 211 217', 700: '173 176 184', 800: '139 142 149', 900: '111 114 120' },
        cloudgray: { 50: '255 255 255', 100: '250 251 252', 200: '245 246 248', 300: '235 238 242', 400: '220 225 232', 500: '206 214 224', 600: '173 184 197', 700: '139 150 167', 800: '111 120 134', 900: '89 96 107' }
    };

    // ==========================================
    // §3. 度量系统
    // ==========================================

    const spacing = {
        '0': '0px', 'px': '1px',
        '0.5': '0.125rem', '1': '0.25rem', '1.5': '0.375rem', '2': '0.5rem', '2.5': '0.625rem',
        '3': '0.75rem', '3.5': '0.875rem', '4': '1rem', '5': '1.25rem', '6': '1.5rem',
        '7': '1.75rem', '8': '2rem', '9': '2.25rem', '10': '2.5rem', '11': '2.75rem',
        '12': '3rem', '14': '3.5rem', '16': '4rem', '20': '5rem', '24': '6rem',
        '28': '7rem', '32': '8rem', '36': '9rem', '40': '10rem', '44': '11rem',
        '48': '12rem', '52': '13rem', '56': '14rem', '60': '15rem', '64': '16rem',
        '72': '18rem', '80': '20rem', '96': '24rem',
        'auto': 'auto',
        '1/2': '50%', '1/3': '33.333333%', '2/3': '66.666667%',
        '1/4': '25%', '2/4': '50%', '3/4': '75%',
        '1/5': '20%', '2/5': '40%', '3/5': '60%', '4/5': '80%',
        '1/6': '16.666667%', '2/6': '33.333333%', '3/6': '50%', '4/6': '66.666667%', '5/6': '83.333333%',
        '1/12': '8.333333%', '2/12': '16.666667%', '3/12': '25%', '4/12': '33.333333%', '5/12': '41.666667%',
        '6/12': '50%', '7/12': '58.333333%', '8/12': '66.666667%', '9/12': '75%', '10/12': '83.333333%', '11/12': '91.666667%',
        'full': '100%', 'screen': '100vw', 'svw': '100svw', 'lvw': '100lvw', 'dvw': '100dvw',
        'min': 'min-content', 'max': 'max-content', 'fit': 'fit-content'
    };

    const heightSpacing = Object.assign({}, spacing, {
        'screen': '100vh', 'svh': '100svh', 'lvh': '100lvh', 'dvh': '100dvh'
    });

    const opacity = {
        '0': '0', '5': '0.05', '10': '0.1', '15': '0.15', '20': '0.2', '25': '0.25',
        '30': '0.3', '35': '0.35', '40': '0.4', '45': '0.45', '50': '0.5',
        '55': '0.55', '60': '0.6', '65': '0.65', '70': '0.7', '75': '0.75',
        '80': '0.8', '85': '0.85', '90': '0.9', '95': '0.95', '100': '1'
    };

    const borders = { '0': '0px', '1': '1px', '2': '2px', '4': '4px', '8': '8px', 'DEFAULT': '1px' };

    const radius = {
        'none': '0px', 'sm': '0.125rem', 'DEFAULT': '0.25rem', 'md': '0.375rem',
        'lg': '0.5rem', 'xl': '0.75rem', '2xl': '1rem', '3xl': '1.5rem', 'full': '9999px'
    };

    const shadows = {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'none': '0 0 #0000'
    };

    const blurs = {
        'none': '0', 'sm': '4px', 'DEFAULT': '8px', 'md': '12px',
        'lg': '16px', 'xl': '24px', '2xl': '40px', '3xl': '64px'
    };

    const durations = { '0': '0s', '75': '75ms', '100': '100ms', '150': '150ms', '200': '200ms', '300': '300ms', '500': '500ms', '700': '700ms', '1000': '1000ms' };

    const breakpoints = { 'sm': '640px', 'md': '768px', 'lg': '1024px', 'xl': '1280px', '2xl': '1536px', '3xl': '1920px', '4xl': '2560px' };
    const containers = { 'sm': '24rem', 'md': '28rem', 'lg': '32rem', 'xl': '36rem', '2xl': '42rem', '3xl': '48rem', '4xl': '56rem' };

    // ==========================================
    // §4. 变体系统（状态修饰符）
    // ==========================================

    const variants = {
        // 伪类
        'hover': ':hover', 'focus': ':focus', 'focus-within': ':focus-within',
        'focus-visible': ':focus-visible', 'active': ':active', 'visited': ':visited',
        'target': ':target', 'first': ':first-child', 'last': ':last-child',
        'only': ':only-child', 'odd': ':nth-child(odd)', 'even': ':nth-child(even)',
        'first-of-type': ':first-of-type', 'last-of-type': ':last-of-type',
        'only-of-type': ':only-of-type',
        'empty': ':empty',
        // 表单相关
        'checked': ':checked', 'indeterminate': ':indeterminate', 'default': ':default',
        'disabled': ':disabled', 'enabled': ':enabled',
        'required': ':required', 'optional': ':optional',
        'valid': ':valid', 'invalid': ':invalid',
        'in-range': ':in-range', 'out-of-range': ':out-of-range',
        'read-only': ':read-only', 'read-write': ':read-write',
        'placeholder-shown': ':placeholder-shown', 'autofill': ':autofill',
        // 伪元素
        'before': '::before', 'after': '::after',
        'placeholder': '::placeholder', 'selection': '::selection',
        'marker': '::marker', 'file': '::file-selector-button',
        'first-line': '::first-line', 'first-letter': '::first-letter',
        'backdrop': '::backdrop',
        // 群组/关联
        'group-hover': '.group:hover &', 'group-focus': '.group:focus &',
        'group-active': '.group:active &', 'group-visited': '.group:visited &',
        'peer-checked': '.peer:checked ~ &', 'peer-focus': '.peer:focus ~ &',
        'peer-hover': '.peer:hover ~ &', 'peer-disabled': '.peer:disabled ~ &',
        'peer-invalid': '.peer:invalid ~ &', 'peer-placeholder-shown': '.peer:placeholder-shown ~ &',
        // 媒体查询
        'dark': '@media (prefers-color-scheme: dark)',
        'light': '@media (prefers-color-scheme: light)',
        'print': '@media print',
        'motion-safe': '@media (prefers-reduced-motion: no-preference)',
        'motion-reduce': '@media (prefers-reduced-motion: reduce)',
        'contrast-more': '@media (prefers-contrast: more)',
        'contrast-less': '@media (prefers-contrast: less)',
        'landscape': '@media (orientation: landscape)',
        'portrait': '@media (orientation: portrait)',
        // 方向
        'ltr': '[dir="ltr"] &', 'rtl': '[dir="rtl"] &',
        // 支持 dark 类名模式
        'dark-class': '.dark &'
    };

    // ==========================================
    // §5. 主题配置注入 (Jquan 架构升级 v10.2 - 延迟挂载机制)
    // ==========================================
    let colors = JSON.parse(JSON.stringify(baseColors));
    let semanticThemes = {};
    let configInitialized = false;

    function parseColorToRGB(val) {
        if (!val) return val;
        if (typeof val === 'string') {
            if (val.startsWith('#')) return hexToRgb(val);
            if (val.toLowerCase().startsWith('rgb')) {
                const match = val.match(/rgba?\(([^)]+)\)/);
                if (match) return match[1].split(',').map(s => s.trim()).slice(0, 3).join(' ');
            }
        }
        return val;
    }

    // 核心修复：将配置读取动作延迟到 DOM 扫描前的一瞬间，确保不错过任何用户配置
    function initConfig() {
        if (configInitialized) return;
        configInitialized = true;

        const userConfig = (window.JquanUI && window.JquanUI.config) || window.JQUAN_CONFIG || {};
        userConfig.customUtilities = userConfig.customUtilities || {};

        if (userConfig.theme) {
            if (userConfig.theme.colors) {
                for (const [k, v] of Object.entries(userConfig.theme.colors)) {
                    if (typeof v === 'string') colors[k] = parseColorToRGB(v);
                    else if (typeof v === 'object') {
                        colors[k] = colors[k] || {};
                        for (const [shade, hex] of Object.entries(v)) colors[k][shade] = parseColorToRGB(hex);
                    }
                }
            }

            if (userConfig.theme.extend) {
                if (userConfig.theme.extend.colors) {
                    for (const [k, v] of Object.entries(userConfig.theme.extend.colors)) {
                        if (typeof v === 'string') colors[k] = parseColorToRGB(v);
                        else if (typeof v === 'object') {
                            colors[k] = colors[k] || {};
                            for (const [shade, colorVal] of Object.entries(v)) colors[k][shade] = parseColorToRGB(colorVal);
                        }
                    }
                }
                
                if (userConfig.theme.extend.fontFamily) {
                    for (const [k, v] of Object.entries(userConfig.theme.extend.fontFamily)) {
                        const fontStr = Array.isArray(v) 
                            ? v.map(f => (f.includes(' ') && !f.includes('"') && !f.includes("'")) ? `"${f}"` : f).join(', ') 
                            : v;
                        userConfig.customUtilities[`font-${k}`] = { css: 'font-family', val: fontStr };
                    }
                }

                if (userConfig.theme.extend.spacing) Object.assign(spacing, userConfig.theme.extend.spacing);
                if (userConfig.theme.extend.breakpoints) Object.assign(breakpoints, userConfig.theme.extend.breakpoints);
            }
        }

        for (const [bp, width] of Object.entries(breakpoints)) {
            variants[bp] = { media: `@media (min-width: ${width})` };
        }

        semanticThemes = userConfig.theme?.semantic || {};
        for (const key of Object.keys(semanticThemes)) {
            colors[key] = `var(--color-${key})`; 
        }

        // 统一在此处合并自定义字典，不再放在全局底部
        const customUtilities = userConfig.customUtilities || {};
        for (const [utilName, utilDef] of Object.entries(customUtilities)) {
            dictionary[utilName] = utilDef;
        }
        
        if(window.JquanUI) {
            window.JquanUI.runtimeConfig = { colors, spacing, breakpoints };
        }
    }

    function resolveColorDirect(name) {
        if (!name) return null;
        if (name === 'transparent') return 'transparent';
        if (name === 'current') return 'currentColor';
        if (name === 'inherit') return 'inherit';
        if (name === 'white') return '255 255 255';
        if (name === 'black') return '0 0 0';
        if (/^#[0-9a-fA-F]{3,8}$/.test(name)) return name;

        if (colors[name]) {
            const exactMatch = colors[name];
            return typeof exactMatch === 'string' ? exactMatch : exactMatch['DEFAULT'] || exactMatch['500'];
        }

        const parts = name.split('-');
        let shade = parts.pop();
        let colorName = parts.join('-');
        
        if (!colors[colorName]) {
            colorName = name;
            shade = 'DEFAULT'; 
        }
        
        const colorObj = colors[colorName];
        if (!colorObj) return null;
        
        return typeof colorObj === 'string' ? colorObj : colorObj[shade] || colorObj['500'];
    }

    function generateThemeVariables() {
        let lightVars = '';
        let darkVars = '';

        // [Jquan 降维打击] 全量颜色变量化引擎：将字典颜色自动泵入全局 :root，供外部独立的 ex 组件肆意消费
        for (const [colorName, val] of Object.entries(colors)) {
            if (typeof val === 'string') {
                if (['transparent', 'current', 'inherit'].includes(val)) continue;
                let rgbStr = parseColorToRGB(val);
                lightVars += `--${colorName}: ${rgbStr};\n`;
                // 智能桥接你旧版 ex 组件的习惯别名
                lightVars += `--${colorName}-hue-500: ${rgbStr};\n`;
                lightVars += `--${colorName}-500: ${rgbStr};\n`;
            } else if (typeof val === 'object') {
                for (const [shade, shadeVal] of Object.entries(val)) {
                    let rgbStr = parseColorToRGB(shadeVal);
                    lightVars += `--${colorName}-${shade}: ${rgbStr};\n`;
                    if (shade === 'DEFAULT') {
                        lightVars += `--${colorName}: ${rgbStr};\n`;
                    }
                }
                // 如果存在 500 色阶，自动为其创建 -hue-500 别名，拯救旧版的按钮和背景
                if (val['500']) {
                    let rgbStr = parseColorToRGB(val['500']);
                    lightVars += `--${colorName}-hue-500: ${rgbStr};\n`;
                }
            }
        }

        // 处理语义化主题 (semanticThemes)
        for (const [key, value] of Object.entries(semanticThemes)) {
            const lightHex = resolveColorDirect(value.light);
            const darkHex = resolveColorDirect(value.dark);
            if (lightHex && lightHex.startsWith('#')) lightVars += `--color-${key}: ${hexToRgb(lightHex)};\n`;
            else if (lightHex) lightVars += `--color-${key}: ${lightHex};\n`;
            if (darkHex && darkHex.startsWith('#')) darkVars += `--color-${key}: ${hexToRgb(darkHex)};\n`;
            else if (darkHex) darkVars += `--color-${key}: ${darkHex};\n`;
        }

        // 哪怕你没有设置 semanticThemes，基础的 lightVars 此时也装满了全量颜色表！
        if(!lightVars && !darkVars) return '';
        
        return `
            :root { ${lightVars} }
            .dark { ${darkVars} }
            @media (prefers-color-scheme: dark) {
                :root:not(.light) { ${darkVars} }
            }
        `;
    }

    // ==========================================
    // §6. 自定义CSS追加 API (已合并至 initConfig 内处理)
    // ==========================================

    // ==========================================
    // §7. 核心字典 — 全量无删减，前缀全部改为 jquan
    // ==========================================
    const dictionary = {
        // 7.1 容器与显示
        'block': { css: 'display', val: 'block' },
        'inline-block': { css: 'display', val: 'inline-block' },
        'inline': { css: 'display', val: 'inline' },
        'flex': { css: 'display', val: 'flex' },
        'inline-flex': { css: 'display', val: 'inline-flex' },
        'grid': { css: 'display', val: 'grid' },
        'inline-grid': { css: 'display', val: 'inline-grid' },
        'table': { css: 'display', val: 'table' },
        'inline-table': { css: 'display', val: 'inline-table' },
        'contents': { css: 'display', val: 'contents' },
        'hidden': { css: 'display', val: 'none' },
        'list-item': { css: 'display', val: 'list-item' },
        'flow-root': { css: 'display', val: 'flow-root' },
        'ruby': { css: 'display', val: 'ruby' },
        'ruby-base': { css: 'display', val: 'ruby-base' },
        'ruby-text': { css: 'display', val: 'ruby-text' },
        'ruby-base-container': { css: 'display', val: 'ruby-base-container' },
        'ruby-text-container': { css: 'display', val: 'ruby-text-container' },
        'table-caption': { css: 'display', val: 'table-caption' },
        'table-cell': { css: 'display', val: 'table-cell' },
        'table-column': { css: 'display', val: 'table-column' },
        'table-column-group': { css: 'display', val: 'table-column-group' },
        'table-footer-group': { css: 'display', val: 'table-footer-group' },
        'table-header-group': { css: 'display', val: 'table-header-group' },
        'table-row': { css: 'display', val: 'table-row' },
        'table-row-group': { css: 'display', val: 'table-row-group' },
        'visible': { css: 'visibility', val: 'visible' },
        'invisible': { css: 'visibility', val: 'hidden' },
        'collapse': { css: 'visibility', val: 'collapse' },
        'box-border': { css: 'box-sizing', val: 'border-box' },
        'box-content': { css: 'box-sizing', val: 'content-box' },
        'content-visible': { css: 'content-visibility', val: 'visible' },
        'content-hidden': { css: 'content-visibility', val: 'hidden' },
        'content-auto': { css: 'content-visibility', val: 'auto' },

        // 7.2 尺寸
        'w': { css: 'width', scale: spacing },
        'h': { css: 'height', scale: heightSpacing },
        'size': { css: 'width, height', scale: spacing },
        'min-w': { css: 'min-width', scale: spacing },
        'min-h': { css: 'min-height', scale: heightSpacing },
        'max-w': { css: 'max-width', scale: Object.assign({}, spacing, {
            'xs': '20rem', 'sm': '24rem', 'md': '28rem', 'lg': '32rem', 'xl': '36rem',
            '2xl': '42rem', '3xl': '48rem', '4xl': '56rem', '5xl': '64rem', '6xl': '72rem',
            '7xl': '80rem', 'prose': '65ch', 'none': 'none'
        }) },
        'max-h': { css: 'max-height', scale: heightSpacing },
        'aspect-auto': { css: 'aspect-ratio', val: 'auto' },
        'aspect-square': { css: 'aspect-ratio', val: '1 / 1' },
        'aspect-video': { css: 'aspect-ratio', val: '16 / 9' },
        'aspect-4/3': { css: 'aspect-ratio', val: '4 / 3' },
        'aspect-3/2': { css: 'aspect-ratio', val: '3 / 2' },

        // 7.3 定位与层级
        'static': { css: 'position', val: 'static' },
        'fixed': { css: 'position', val: 'fixed' },
        'absolute': { css: 'position', val: 'absolute' },
        'relative': { css: 'position', val: 'relative' },
        'sticky': { css: 'position', val: 'sticky' },
        'top': { css: 'top', scale: spacing },
        'right': { css: 'right', scale: spacing },
        'bottom': { css: 'bottom', scale: spacing },
        'left': { css: 'left', scale: spacing },
        'inset': { css: 'inset', scale: spacing },
        'inset-x': { css: ['left', 'right'], scale: spacing },
        'inset-y': { css: ['top', 'bottom'], scale: spacing },
        'start': { css: 'inset-inline-start', scale: spacing },
        'end': { css: 'inset-inline-end', scale: spacing },
        'inset-inline': { css: 'inset-inline', scale: spacing },
        'inset-block': { css: 'inset-block', scale: spacing },
        'inset-inline-start': { css: 'inset-inline-start', scale: spacing },
        'inset-inline-end': { css: 'inset-inline-end', scale: spacing },
        'inset-block-start': { css: 'inset-block-start', scale: spacing },
        'inset-block-end': { css: 'inset-block-end', scale: spacing },
        'z': { css: 'z-index', values: { '0': '0', '10': '10', '20': '20', '30': '30', '40': '40', '50': '50', '60': '60', '70': '70', '80': '80', '90': '90', '100': '100', 'auto': 'auto' } },
        'isolate': { css: 'isolation', val: 'isolate' },
        'isolation-auto': { css: 'isolation', val: 'auto' },

        // 7.4 溢出与浮动
        'overflow-auto': { css: 'overflow', val: 'auto' },
        'overflow-hidden': { css: 'overflow', val: 'hidden' },
        'overflow-visible': { css: 'overflow', val: 'visible' },
        'overflow-scroll': { css: 'overflow', val: 'scroll' },
        'overflow-clip': { css: 'overflow', val: 'clip' },
        'overflow-x-auto': { css: 'overflow-x', val: 'auto' },
        'overflow-x-hidden': { css: 'overflow-x', val: 'hidden' },
        'overflow-x-visible': { css: 'overflow-x', val: 'visible' },
        'overflow-x-scroll': { css: 'overflow-x', val: 'scroll' },
        'overflow-x-clip': { css: 'overflow-x', val: 'clip' },
        'overflow-y-auto': { css: 'overflow-y', val: 'auto' },
        'overflow-y-hidden': { css: 'overflow-y', val: 'hidden' },
        'overflow-y-visible': { css: 'overflow-y', val: 'visible' },
        'overflow-y-scroll': { css: 'overflow-y', val: 'scroll' },
        'overflow-y-clip': { css: 'overflow-y', val: 'clip' },
        'float-right': { css: 'float', val: 'right' },
        'float-left': { css: 'float', val: 'left' },
        'float-none': { css: 'float', val: 'none' },
        'float-start': { css: 'float', val: 'inline-start' },
        'float-end': { css: 'float', val: 'inline-end' },
        'clear-left': { css: 'clear', val: 'left' },
        'clear-right': { css: 'clear', val: 'right' },
        'clear-both': { css: 'clear', val: 'both' },
        'clear-none': { css: 'clear', val: 'none' },
        'clear-start': { css: 'clear', val: 'inline-start' },
        'clear-end': { css: 'clear', val: 'inline-end' },
        'clearfix': { css: ['content', 'display', 'clear'], val: '""; block; both', selector: '&::after' },
        'overscroll-auto': { css: 'overscroll-behavior', val: 'auto' },
        'overscroll-contain': { css: 'overscroll-behavior', val: 'contain' },
        'overscroll-none': { css: 'overscroll-behavior', val: 'none' },
        'overscroll-x-auto': { css: 'overscroll-behavior-x', val: 'auto' },
        'overscroll-x-contain': { css: 'overscroll-behavior-x', val: 'contain' },
        'overscroll-x-none': { css: 'overscroll-behavior-x', val: 'none' },
        'overscroll-y-auto': { css: 'overscroll-behavior-y', val: 'auto' },
        'overscroll-y-contain': { css: 'overscroll-behavior-y', val: 'contain' },
        'overscroll-y-none': { css: 'overscroll-behavior-y', val: 'none' },

        // 7.5 Flex 布局
        'flex-row': { css: 'flex-direction', val: 'row' },
        'flex-row-reverse': { css: 'flex-direction', val: 'row-reverse' },
        'flex-col': { css: 'flex-direction', val: 'column' },
        'flex-col-reverse': { css: 'flex-direction', val: 'column-reverse' },
        'flex-wrap': { css: 'flex-wrap', val: 'wrap' },
        'flex-wrap-reverse': { css: 'flex-wrap', val: 'wrap-reverse' },
        'flex-nowrap': { css: 'flex-wrap', val: 'nowrap' },
        'flex-1': { css: 'flex', val: '1 1 0%' },
        'flex-auto': { css: 'flex', val: '1 1 auto' },
        'flex-initial': { css: 'flex', val: '0 1 auto' },
        'flex-none': { css: 'flex', val: 'none' },
        'grow': { css: 'flex-grow', values: { 'DEFAULT': '1', '0': '0' } },
        'grow-0': { css: 'flex-grow', val: '0' },
        'shrink': { css: 'flex-shrink', values: { 'DEFAULT': '1', '0': '0' } },
        'shrink-0': { css: 'flex-shrink', val: '0' },
        'basis': { css: 'flex-basis', scale: spacing },
        'order': { css: 'order', values: {
            'first': '-9999', 'last': '9999', 'none': '0',
            '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6',
            '7': '7', '8': '8', '9': '9', '10': '10', '11': '11', '12': '12'
        }},

        // 7.6 Grid 布局
        'equal': { css: ['display', 'grid-template-columns'], fn: (v, isArb) => isArb ? `grid; ${v}` : `grid; repeat(${v}, minmax(0, 1fr))` },
        'grid-cols': { css: 'grid-template-columns', fn: (v, isArb) => isArb ? v : (v === 'none' ? 'none' : `repeat(${v}, minmax(0, 1fr))`) },
        'grid-rows': { css: 'grid-template-rows', fn: (v, isArb) => isArb ? v : (v === 'none' ? 'none' : `repeat(${v}, minmax(0, 1fr))`) },
        'col-span': { css: 'grid-column', fn: (v, isArb) => isArb ? v : (v === 'full' ? '1 / -1' : `span ${v} / span ${v}`) },
        'col-start': { css: 'grid-column-start', values: { '1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9','10':'10','11':'11','12':'12','13':'13','auto':'auto' } },
        'col-end': { css: 'grid-column-end', values: { '1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9','10':'10','11':'11','12':'12','13':'13','auto':'auto' } },
        'col-auto': { css: 'grid-column', val: 'auto' },
        'row-span': { css: 'grid-row', fn: (v, isArb) => isArb ? v : (v === 'full' ? '1 / -1' : `span ${v} / span ${v}`) },
        'row-start': { css: 'grid-row-start', values: { '1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','auto':'auto' } },
        'row-end': { css: 'grid-row-end', values: { '1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','auto':'auto' } },
        'row-auto': { css: 'grid-row', val: 'auto' },
        'grid-flow-row': { css: 'grid-auto-flow', val: 'row' },
        'grid-flow-col': { css: 'grid-auto-flow', val: 'column' },
        'grid-flow-dense': { css: 'grid-auto-flow', val: 'dense' },
        'grid-flow-row-dense': { css: 'grid-auto-flow', val: 'row dense' },
        'grid-flow-col-dense': { css: 'grid-auto-flow', val: 'column dense' },
        'auto-cols-auto': { css: 'grid-auto-columns', val: 'auto' },
        'auto-cols-min': { css: 'grid-auto-columns', val: 'min-content' },
        'auto-cols-max': { css: 'grid-auto-columns', val: 'max-content' },
        'auto-cols-fr': { css: 'grid-auto-columns', val: 'minmax(0, 1fr)' },
        'auto-rows-auto': { css: 'grid-auto-rows', val: 'auto' },
        'auto-rows-min': { css: 'grid-auto-rows', val: 'min-content' },
        'auto-rows-max': { css: 'grid-auto-rows', val: 'max-content' },
        'auto-rows-fr': { css: 'grid-auto-rows', val: 'minmax(0, 1fr)' },

        // 7.7 对齐
        'justify-normal': { css: 'justify-content', val: 'normal' },
        'justify-start': { css: 'justify-content', val: 'flex-start' },
        'justify-end': { css: 'justify-content', val: 'flex-end' },
        'justify-center': { css: 'justify-content', val: 'center' },
        'justify-between': { css: 'justify-content', val: 'space-between' },
        'justify-around': { css: 'justify-content', val: 'space-around' },
        'justify-evenly': { css: 'justify-content', val: 'space-evenly' },
        'justify-stretch': { css: 'justify-content', val: 'stretch' },
        'justify-items-start': { css: 'justify-items', val: 'start' },
        'justify-items-end': { css: 'justify-items', val: 'end' },
        'justify-items-center': { css: 'justify-items', val: 'center' },
        'justify-items-stretch': { css: 'justify-items', val: 'stretch' },
        'justify-self-auto': { css: 'justify-self', val: 'auto' },
        'justify-self-start': { css: 'justify-self', val: 'start' },
        'justify-self-end': { css: 'justify-self', val: 'end' },
        'justify-self-center': { css: 'justify-self', val: 'center' },
        'justify-self-stretch': { css: 'justify-self', val: 'stretch' },
        'items-start': { css: 'align-items', val: 'flex-start' },
        'items-end': { css: 'align-items', val: 'flex-end' },
        'items-center': { css: 'align-items', val: 'center' },
        'items-baseline': { css: 'align-items', val: 'baseline' },
        'items-stretch': { css: 'align-items', val: 'stretch' },
        'content-normal': { css: 'align-content', val: 'normal' },
        'content-start': { css: 'align-content', val: 'flex-start' },
        'content-end': { css: 'align-content', val: 'flex-end' },
        'content-center': { css: 'align-content', val: 'center' },
        'content-between': { css: 'align-content', val: 'space-between' },
        'content-around': { css: 'align-content', val: 'space-around' },
        'content-evenly': { css: 'align-content', val: 'space-evenly' },
        'content-baseline': { css: 'align-content', val: 'baseline' },
        'content-stretch': { css: 'align-content', val: 'stretch' },
        'self-auto': { css: 'align-self', val: 'auto' },
        'self-start': { css: 'align-self', val: 'flex-start' },
        'self-end': { css: 'align-self', val: 'flex-end' },
        'self-center': { css: 'align-self', val: 'center' },
        'self-stretch': { css: 'align-self', val: 'stretch' },
        'self-baseline': { css: 'align-self', val: 'baseline' },
        'place-content-start': { css: 'place-content', val: 'start' },
        'place-content-end': { css: 'place-content', val: 'end' },
        'place-content-center': { css: 'place-content', val: 'center' },
        'place-content-between': { css: 'place-content', val: 'space-between' },
        'place-content-around': { css: 'place-content', val: 'space-around' },
        'place-content-evenly': { css: 'place-content', val: 'space-evenly' },
        'place-content-baseline': { css: 'place-content', val: 'baseline' },
        'place-content-stretch': { css: 'place-content', val: 'stretch' },
        'place-items-start': { css: 'place-items', val: 'start' },
        'place-items-end': { css: 'place-items', val: 'end' },
        'place-items-center': { css: 'place-items', val: 'center' },
        'place-items-baseline': { css: 'place-items', val: 'baseline' },
        'place-items-stretch': { css: 'place-items', val: 'stretch' },
        'place-self-auto': { css: 'place-self', val: 'auto' },
        'place-self-start': { css: 'place-self', val: 'start' },
        'place-self-end': { css: 'place-self', val: 'end' },
        'place-self-center': { css: 'place-self', val: 'center' },
        'place-self-stretch': { css: 'place-self', val: 'stretch' },
        'gap': { css: 'gap', scale: spacing },
        'gap-x': { css: 'column-gap', scale: spacing },
        'gap-y': { css: 'row-gap', scale: spacing },

        // 7.8 间距
        'p': { css: 'padding', scale: spacing },
        'px': { css: ['padding-left', 'padding-right'], scale: spacing },
        'py': { css: ['padding-top', 'padding-bottom'], scale: spacing },
        'pt': { css: 'padding-top', scale: spacing },
        'pr': { css: 'padding-right', scale: spacing },
        'pb': { css: 'padding-bottom', scale: spacing },
        'pl': { css: 'padding-left', scale: spacing },
        'ps': { css: 'padding-inline-start', scale: spacing },
        'pe': { css: 'padding-inline-end', scale: spacing },
        'pi': { css: 'padding-inline', scale: spacing },
        'pb-block': { css: 'padding-block', scale: spacing },
        'pbs': { css: 'padding-block-start', scale: spacing },
        'pbe': { css: 'padding-block-end', scale: spacing },
        'm': { css: 'margin', scale: spacing },
        'mx': { css: ['margin-left', 'margin-right'], scale: spacing },
        'my': { css: ['margin-top', 'margin-bottom'], scale: spacing },
        'mt': { css: 'margin-top', scale: spacing },
        'mr': { css: 'margin-right', scale: spacing },
        'mb': { css: 'margin-bottom', scale: spacing },
        'ml': { css: 'margin-left', scale: spacing },
        'ms': { css: 'margin-inline-start', scale: spacing },
        'me': { css: 'margin-inline-end', scale: spacing },
        'mi': { css: 'margin-inline', scale: spacing },
        'mb-block': { css: 'margin-block', scale: spacing },
        'mbs': { css: 'margin-block-start', scale: spacing },
        'mbe': { css: 'margin-block-end', scale: spacing },

        // space-x / space-y
        'space-x': { css: '--jquan-space-x-reverse', scale: spacing, fn: v => `0; margin-right: calc(${v} * var(--jquan-space-x-reverse)); margin-left: calc(${v} * calc(1 - var(--jquan-space-x-reverse)))`, selector: '& > :not([hidden]) ~ :not([hidden])' },
        'space-y': { css: '--jquan-space-y-reverse', scale: spacing, fn: v => `0; margin-bottom: calc(${v} * var(--jquan-space-y-reverse)); margin-top: calc(${v} * calc(1 - var(--jquan-space-y-reverse)))`, selector: '& > :not([hidden]) ~ :not([hidden])' },
        'space-x-reverse': { css: '--jquan-space-x-reverse', val: '1', selector: '& > :not([hidden]) ~ :not([hidden])' },
        'space-y-reverse': { css: '--jquan-space-y-reverse', val: '1', selector: '& > :not([hidden]) ~ :not([hidden])' },

        // 7.9 字体与排版
        'font-sans': { css: 'font-family', val: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
        'font-serif': { css: 'font-family', val: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' },
        'font-mono': { css: 'font-family', val: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
        // 小型大写字母
        'small-caps': { css: 'font-variant-caps', val: 'small-caps' },
        'all-small-caps': { css: 'font-variant-caps', val: 'all-small-caps' },
        'titling-caps': { css: 'font-variant-caps', val: 'titling-caps' },

        // 单词间距 (Word Spacing) - 与 tracking (letter-spacing) 配合使用
        'word-spacing-tighter': { css: 'word-spacing', val: '-0.05em' },
        'word-spacing-tight': { css: 'word-spacing', val: '-0.025em' },
        'word-spacing-normal': { css: 'word-spacing', val: '0em' },
        'word-spacing-wide': { css: 'word-spacing', val: '0.025em' },
        'word-spacing-wider': { css: 'word-spacing', val: '0.05em' },
        'word-spacing-widest': { css: 'word-spacing', val: '0.1em' },
        // 尺寸
        'text-xs': { css: ['font-size', 'line-height'], val: '0.75rem; 1rem' },
        'text-sm': { css: ['font-size', 'line-height'], val: '0.875rem; 1.25rem' },
        'text-base': { css: ['font-size', 'line-height'], val: '1rem; 1.5rem' },
        'text-lg': { css: ['font-size', 'line-height'], val: '1.125rem; 1.75rem' },
        'text-xl': { css: ['font-size', 'line-height'], val: '1.25rem; 1.75rem' },
        'text-2xl': { css: ['font-size', 'line-height'], val: '1.5rem; 2rem' },
        'text-3xl': { css: ['font-size', 'line-height'], val: '1.875rem; 2.25rem' },
        'text-4xl': { css: ['font-size', 'line-height'], val: '2.25rem; 2.5rem' },
        'text-5xl': { css: ['font-size', 'line-height'], val: '3rem; 1' },
        'text-6xl': { css: ['font-size', 'line-height'], val: '3.75rem; 1' },
        'text-7xl': { css: ['font-size', 'line-height'], val: '4.5rem; 1' },
        'text-8xl': { css: ['font-size', 'line-height'], val: '6rem; 1' },
        'text-9xl': { css: ['font-size', 'line-height'], val: '8rem; 1' },

        'font-thin': { css: ['font-weight','--wght'], val: '100;100' },
        'font-extralight': { css: ['font-weight','--wght'], val: '200;200' },
        'font-light': { css: ['font-weight','--wght'], val: '300;300' },
        'font-normal': { css: ['font-weight','--wght'], val: '400;400' },
        'font-medium': { css: ['font-weight','--wght'], val: '500;500' },
        'font-semibold': { css: ['font-weight','--wght'], val: '600;600' },
        'font-bold': { css: ['font-weight','--wght'], val: '700;700' },
        'font-extrabold': { css: ['font-weight','--wght'], val: '800;800' },
        'font-black': { css: ['font-weight','--wght'], val: '900;900' },

        'italic': { css: 'font-style', val: 'italic' },
        'not-italic': { css: 'font-style', val: 'normal' },

        'antialiased': { css: ['-webkit-font-smoothing', '-moz-osx-font-smoothing'], val: 'antialiased; grayscale' },
        'subpixel-antialiased': { css: ['-webkit-font-smoothing', '-moz-osx-font-smoothing'], val: 'auto; auto' },

        'normal-nums': { css: 'font-variant-numeric', val: 'normal' },
        'ordinal': { css: 'font-variant-numeric', val: 'ordinal' },
        'slashed-zero': { css: 'font-variant-numeric', val: 'slashed-zero' },
        'lining-nums': { css: 'font-variant-numeric', val: 'lining-nums' },
        'oldstyle-nums': { css: 'font-variant-numeric', val: 'oldstyle-nums' },
        'proportional-nums': { css: 'font-variant-numeric', val: 'proportional-nums' },
        'tabular-nums': { css: 'font-variant-numeric', val: 'tabular-nums' },
        'diagonal-fractions': { css: 'font-variant-numeric', val: 'diagonal-fractions' },
        'stacked-fractions': { css: 'font-variant-numeric', val: 'stacked-fractions' },

        'tracking-tighter': { css: 'letter-spacing', val: '-0.05em' },
        'tracking-tight': { css: 'letter-spacing', val: '-0.025em' },
        'tracking-normal': { css: 'letter-spacing', val: '0em' },
        'tracking-wide': { css: 'letter-spacing', val: '0.025em' },
        'tracking-wider': { css: 'letter-spacing', val: '0.05em' },
        'tracking-widest': { css: 'letter-spacing', val: '0.1em' },

        'leading-none': { css: 'line-height', val: '1' },
        'leading-tight': { css: 'line-height', val: '1.25' },
        'leading-snug': { css: 'line-height', val: '1.375' },
        'leading-normal': { css: 'line-height', val: '1.5' },
        'leading-relaxed': { css: 'line-height', val: '1.625' },
        'leading-loose': { css: 'line-height', val: '2' },
        'leading-3': { css: 'line-height', val: '.75rem' },
        'leading-4': { css: 'line-height', val: '1rem' },
        'leading-5': { css: 'line-height', val: '1.25rem' },
        'leading-6': { css: 'line-height', val: '1.5rem' },
        'leading-7': { css: 'line-height', val: '1.75rem' },
        'leading-8': { css: 'line-height', val: '2rem' },
        'leading-9': { css: 'line-height', val: '2.25rem' },
        'leading-10': { css: 'line-height', val: '2.5rem' },

        'text-left': { css: 'text-align', val: 'left' },
        'text-center': { css: 'text-align', val: 'center' },
        'text-right': { css: 'text-align', val: 'right' },
        'text-justify': { css: 'text-align', val: 'justify' },
        'text-start': { css: 'text-align', val: 'start' },
        'text-end': { css: 'text-align', val: 'end' },
        'text-justify-inter-character': { css: 'text-justify', val: 'inter-character' },
        'text-align-last-justify': { css: 'text-align-last', val: 'justify' },

        'align-baseline': { css: 'vertical-align', val: 'baseline' },
        'align-top': { css: 'vertical-align', val: 'top' },
        'align-middle': { css: 'vertical-align', val: 'middle' },
        'align-bottom': { css: 'vertical-align', val: 'bottom' },
        'align-text-top': { css: 'vertical-align', val: 'text-top' },
        'align-text-bottom': { css: 'vertical-align', val: 'text-bottom' },
        'align-sub': { css: 'vertical-align', val: 'sub' },
        'align-super': { css: 'vertical-align', val: 'super' },

        'underline': { css: 'text-decoration-line', val: 'underline' },
        'overline': { css: 'text-decoration-line', val: 'overline' },
        'line-through': { css: 'text-decoration-line', val: 'line-through' },
        'no-underline': { css: 'text-decoration-line', val: 'none' },
        'decoration-solid': { css: 'text-decoration-style', val: 'solid' },
        'decoration-double': { css: 'text-decoration-style', val: 'double' },
        'decoration-dotted': { css: 'text-decoration-style', val: 'dotted' },
        'decoration-dashed': { css: 'text-decoration-style', val: 'dashed' },
        'decoration-wavy': { css: 'text-decoration-style', val: 'wavy' },
        'decoration-auto': { css: 'text-decoration-thickness', val: 'auto' },
        'decoration-from-font': { css: 'text-decoration-thickness', val: 'from-font' },
        'decoration-0': { css: 'text-decoration-thickness', val: '0px' },
        'decoration-1': { css: 'text-decoration-thickness', val: '1px' },
        'decoration-2': { css: 'text-decoration-thickness', val: '2px' },
        'decoration-4': { css: 'text-decoration-thickness', val: '4px' },
        'decoration-8': { css: 'text-decoration-thickness', val: '8px' },
        'decoration': { css: 'text-decoration-color', color: true },
        'underline-offset-auto': { css: 'text-underline-offset', val: 'auto' },
        'underline-offset-0': { css: 'text-underline-offset', val: '0px' },
        'underline-offset-1': { css: 'text-underline-offset', val: '1px' },
        'underline-offset-2': { css: 'text-underline-offset', val: '2px' },
        'underline-offset-4': { css: 'text-underline-offset', val: '4px' },
        'underline-offset-8': { css: 'text-underline-offset', val: '8px' },

        'uppercase': { css: 'text-transform', val: 'uppercase' },
        'lowercase': { css: 'text-transform', val: 'lowercase' },
        'capitalize': { css: 'text-transform', val: 'capitalize' },
        'normal-case': { css: 'text-transform', val: 'none' },

        'truncate': { css: ['overflow', 'text-overflow', 'white-space'], val: 'hidden; ellipsis; nowrap' },
        'text-ellipsis': { css: 'text-overflow', val: 'ellipsis' },
        'text-clip': { css: 'text-overflow', val: 'clip' },
        'whitespace-normal': { css: 'white-space', val: 'normal' },
        'whitespace-nowrap': { css: 'white-space', val: 'nowrap' },
        'whitespace-pre': { css: 'white-space', val: 'pre' },
        'whitespace-pre-line': { css: 'white-space', val: 'pre-line' },
        'whitespace-pre-wrap': { css: 'white-space', val: 'pre-wrap' },
        'whitespace-break-spaces': { css: 'white-space', val: 'break-spaces' },
        'break-normal': { css: ['overflow-wrap', 'word-break'], val: 'normal; normal' },
        'break-words': { css: 'overflow-wrap', val: 'break-word' },
        'break-all': { css: 'word-break', val: 'break-all' },
        'break-keep': { css: 'word-break', val: 'keep-all' },
        'hyphens-none': { css: 'hyphens', val: 'none' },
        'hyphens-manual': { css: 'hyphens', val: 'manual' },
        'hyphens-auto': { css: 'hyphens', val: 'auto' },

        'text-wrap': { css: 'text-wrap', val: 'wrap' },
        'text-nowrap': { css: 'text-wrap', val: 'nowrap' },
        'text-balance': { css: 'text-wrap', val: 'balance' },
        'text-pretty': { css: 'text-wrap', val: 'pretty' },

        'indent': { css: 'text-indent', scale: spacing },

        'line-clamp': { css: ['overflow', 'display', '-webkit-box-orient', '-webkit-line-clamp'], fn: v => `hidden; -webkit-box; vertical; ${v}` },
        'line-clamp-none': { css: ['-webkit-line-clamp', 'overflow', 'display'], val: 'unset; visible; block' },

        // 7.10 颜色
        'bg': { css: 'background-color', color: true },
        'text': { css: 'color', color: true },
        'border': { css: 'border-color', color: true },
        'border-light': { css: 'border-color', val: 'rgb(var(--gray-100))' },
        'border-strong': { css: 'border-color', val: 'rgb(var(--gray-300))' },
        'border-t': { css: 'border-top-color', color: true },
        'border-r': { css: 'border-right-color', color: true },
        'border-b': { css: 'border-bottom-color', color: true },
        'border-l': { css: 'border-left-color', color: true },
        'border-x': { css: ['border-left-color', 'border-right-color'], color: true },
        'border-y': { css: ['border-top-color', 'border-bottom-color'], color: true },
        'border-s': { css: 'border-inline-start-color', color: true },
        'border-e': { css: 'border-inline-end-color', color: true },
        'accent': { css: 'accent-color', color: true },
        'accent-auto': { css: 'accent-color', val: 'auto' },
        'caret': { css: 'caret-color', color: true },
        'caret-transparent': { css: 'caret-color', val: 'transparent' },
        'shadow-color': { css: '--jquan-shadow-color', color: true },
        'outline': { css: 'outline-color', color: true },
        // [Jquan v10.0.3 核心修复] 移除这里错乱的 ring 宽度函数，并显式占位色彩系统
        'ring-color': { css: '--jquan-ring-color', color: true },
        'ring-offset-color': { css: '--jquan-ring-offset-color', color: true },
        'divide': { css: 'border-color', color: true, selector: '& > :not([hidden]) ~ :not([hidden])' },
        'opacity': { css: 'opacity', scale: opacity },

        // 7.11 渐变宇宙 (Jquan V4.3 - 致敬经典，吸收老版本变量拼装逻辑)
        
        // --- 1. 背景渐变 ---
        'bg-gradient-to-t': { css: 'background-image', val: 'linear-gradient(to top, var(--jquan-gradient-stops))' },
        'bg-gradient-to-tr': { css: 'background-image', val: 'linear-gradient(to top right, var(--jquan-gradient-stops))' },
        'bg-gradient-to-r': { css: 'background-image', val: 'linear-gradient(to right, var(--jquan-gradient-stops))' },
        'bg-gradient-to-br': { css: 'background-image', val: 'linear-gradient(to bottom right, var(--jquan-gradient-stops))' },
        'bg-gradient-to-b': { css: 'background-image', val: 'linear-gradient(to bottom, var(--jquan-gradient-stops))' },
        'bg-gradient-to-bl': { css: 'background-image', val: 'linear-gradient(to bottom left, var(--jquan-gradient-stops))' },
        'bg-gradient-to-l': { css: 'background-image', val: 'linear-gradient(to left, var(--jquan-gradient-stops))' },
        'bg-gradient-to-tl': { css: 'background-image', val: 'linear-gradient(to top left, var(--jquan-gradient-stops))' },
        'bg-none': { css: 'background-image', val: 'none' },

        // --- 2. 边框渐变 (提取为变量，配合底层的圆角 Mask 技术) ---
        'border-gradient-to-t': { css: '--jquan-border-gradient', val: 'linear-gradient(to top, var(--jquan-gradient-stops))' },
        'border-gradient-to-tr': { css: '--jquan-border-gradient', val: 'linear-gradient(to top right, var(--jquan-gradient-stops))' },
        'border-gradient-to-r': { css: '--jquan-border-gradient', val: 'linear-gradient(to right, var(--jquan-gradient-stops))' },
        'border-gradient-to-br': { css: '--jquan-border-gradient', val: 'linear-gradient(to bottom right, var(--jquan-gradient-stops))' },
        'border-gradient-to-b': { css: '--jquan-border-gradient', val: 'linear-gradient(to bottom, var(--jquan-gradient-stops))' },
        'border-gradient-to-bl': { css: '--jquan-border-gradient', val: 'linear-gradient(to bottom left, var(--jquan-gradient-stops))' },
        'border-gradient-to-l': { css: '--jquan-border-gradient', val: 'linear-gradient(to left, var(--jquan-gradient-stops))' },
        'border-gradient-to-tl': { css: '--jquan-border-gradient', val: 'linear-gradient(to top left, var(--jquan-gradient-stops))' },

        // --- 3. 环渐变 (提取为变量) ---
        'ring-gradient-to-t': { css: '--jquan-ring-gradient', val: 'linear-gradient(to top, var(--jquan-gradient-stops))' },
        'ring-gradient-to-tr': { css: '--jquan-ring-gradient', val: 'linear-gradient(to top right, var(--jquan-gradient-stops))' },
        'ring-gradient-to-r': { css: '--jquan-ring-gradient', val: 'linear-gradient(to right, var(--jquan-gradient-stops))' },
        'ring-gradient-to-br': { css: '--jquan-ring-gradient', val: 'linear-gradient(to bottom right, var(--jquan-gradient-stops))' },
        'ring-gradient-to-b': { css: '--jquan-ring-gradient', val: 'linear-gradient(to bottom, var(--jquan-gradient-stops))' },
        'ring-gradient-to-bl': { css: '--jquan-ring-gradient', val: 'linear-gradient(to bottom left, var(--jquan-gradient-stops))' },
        'ring-gradient-to-l': { css: '--jquan-ring-gradient', val: 'linear-gradient(to left, var(--jquan-gradient-stops))' },
        'ring-gradient-to-tl': { css: '--jquan-ring-gradient', val: 'linear-gradient(to top left, var(--jquan-gradient-stops))' },

        // --- 4. 文字渐变前置件 ---
        'bg-clip-text': { css: '-webkit-background-clip', val: 'text' },
        'text-transparent': { css: 'color', val: 'transparent' },

        // --- 5. 颜色节点捕获 ---
        'from': { css: '--jquan-gradient-from', color: true },
        'via': { css: '--jquan-gradient-via', color: true },
        'to': { css: '--jquan-gradient-to', color: true },

        'bg-auto': { css: 'background-size', val: 'auto' },
        'bg-cover': { css: 'background-size', val: 'cover' },
        'bg-contain': { css: 'background-size', val: 'contain' },
        'bg-fixed': { css: 'background-attachment', val: 'fixed' },
        'bg-local': { css: 'background-attachment', val: 'local' },
        'bg-scroll': { css: 'background-attachment', val: 'scroll' },
        'bg-center': { css: 'background-position', val: 'center' },
        'bg-top': { css: 'background-position', val: 'top' },
        'bg-bottom': { css: 'background-position', val: 'bottom' },
        'bg-left': { css: 'background-position', val: 'left' },
        'bg-right': { css: 'background-position', val: 'right' },
        'bg-left-top': { css: 'background-position', val: 'left top' },
        'bg-left-bottom': { css: 'background-position', val: 'left bottom' },
        'bg-right-top': { css: 'background-position', val: 'right top' },
        'bg-right-bottom': { css: 'background-position', val: 'right bottom' },
        'bg-repeat': { css: 'background-repeat', val: 'repeat' },
        'bg-no-repeat': { css: 'background-repeat', val: 'no-repeat' },
        'bg-repeat-x': { css: 'background-repeat', val: 'repeat-x' },
        'bg-repeat-y': { css: 'background-repeat', val: 'repeat-y' },
        'bg-repeat-round': { css: 'background-repeat', val: 'round' },
        'bg-repeat-space': { css: 'background-repeat', val: 'space' },
        'bg-origin-border': { css: 'background-origin', val: 'border-box' },
        'bg-origin-padding': { css: 'background-origin', val: 'padding-box' },
        'bg-origin-content': { css: 'background-origin', val: 'content-box' },
        'bg-clip-border': { css: 'background-clip', val: 'border-box' },
        'bg-clip-padding': { css: 'background-clip', val: 'padding-box' },
        'bg-clip-content': { css: 'background-clip', val: 'content-box' },
        'bg-clip-text': { css: ['-webkit-background-clip', 'background-clip'], val: 'text; text' },

        // =============================================
        // 7.12 边框 (border-width / style / radius / outline / ring)
        // =============================================
        'border-w': { css: 'border-width', scale: borders },
        'border-t-w': { css: 'border-top-width', scale: borders },
        'border-r-w': { css: 'border-right-width', scale: borders },
        'border-b-w': { css: 'border-bottom-width', scale: borders },
        'border-l-w': { css: 'border-left-width', scale: borders },
        'border-x-w': { css: ['border-left-width', 'border-right-width'], scale: borders },
        'border-y-w': { css: ['border-top-width', 'border-bottom-width'], scale: borders },
        'border-s-w': { css: 'border-inline-start-width', scale: borders },
        'border-e-w': { css: 'border-inline-end-width', scale: borders },
        'border-solid': { css: 'border-style', val: 'solid' },
        'border-dashed': { css: 'border-style', val: 'dashed' },
        'border-dotted': { css: 'border-style', val: 'dotted' },
        'border-double': { css: 'border-style', val: 'double' },
        'border-hidden': { css: 'border-style', val: 'hidden' },
        'border-none': { css: 'border-style', val: 'none' },

        'rounded': { css: 'border-radius', scale: radius },
        'rounded-t': { css: ['border-top-left-radius', 'border-top-right-radius'], scale: radius },
        'rounded-r': { css: ['border-top-right-radius', 'border-bottom-right-radius'], scale: radius },
        'rounded-b': { css: ['border-bottom-right-radius', 'border-bottom-left-radius'], scale: radius },
        'rounded-l': { css: ['border-top-left-radius', 'border-bottom-left-radius'], scale: radius },
        'rounded-tl': { css: 'border-top-left-radius', scale: radius },
        'rounded-tr': { css: 'border-top-right-radius', scale: radius },
        'rounded-br': { css: 'border-bottom-right-radius', scale: radius },
        'rounded-bl': { css: 'border-bottom-left-radius', scale: radius },
        'rounded-s': { css: ['border-start-start-radius', 'border-end-start-radius'], scale: radius },
        'rounded-e': { css: ['border-start-end-radius', 'border-end-end-radius'], scale: radius },
        'rounded-ss': { css: 'border-start-start-radius', scale: radius },
        'rounded-se': { css: 'border-start-end-radius', scale: radius },
        'rounded-es': { css: 'border-end-start-radius', scale: radius },
        'rounded-ee': { css: 'border-end-end-radius', scale: radius },

        // outline
        'outline-none': { css: ['outline', 'outline-offset'], val: '2px solid transparent; 2px' },
        'outline-w': { css: 'outline-width', scale: borders },
        'outline-solid': { css: 'outline-style', val: 'solid' },
        'outline-dashed': { css: 'outline-style', val: 'dashed' },
        'outline-dotted': { css: 'outline-style', val: 'dotted' },
        'outline-double': { css: 'outline-style', val: 'double' },
        'outline-hidden': { css: 'outline-style', val: 'hidden' },
        'outline-offset': { css: 'outline-offset', scale: spacing },

        // 🚀 Jquan v10.0.3 光环系统 (仅输出变量，阴影拼装交给底层垫片)
        'ring': { css: '--jquan-ring-width', values: {
            '0': '0px', '1': '1px', '2': '2px', 'DEFAULT': '3px', '4': '4px', '8': '8px'
        }},
        'ring-inset': { css: '--jquan-ring-inset', val: 'inset' },
        'ring-offset': { css: '--jquan-ring-offset-width', values: {
            '0': '0px', '1': '1px', '2': '2px', '4': '4px', '8': '8px'
        }},

        // 🚀 Jquan v10.0.3 阴影系统 (仅输出变量，彻底解决与 ring 的层级覆盖冲突！)
        'shadow': { css: '--jquan-shadow', values: {
            'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
            'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
            'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
            'none': '0 0 #0000'
        }},

        // =============================================
        // 7.13 分割线 (divide)
        // =============================================
        'divide-x': { css: '--jquan-divide-x-reverse', scale: borders, fn: v => `0; border-right-width: calc(${v} * var(--jquan-divide-x-reverse)); border-left-width: calc(${v} * calc(1 - var(--jquan-divide-x-reverse)))`, selector: '& > :not([hidden]) ~ :not([hidden])' },
        'divide-y': { css: '--jquan-divide-y-reverse', scale: borders, fn: v => `0; border-bottom-width: calc(${v} * var(--jquan-divide-y-reverse)); border-top-width: calc(${v} * calc(1 - var(--jquan-divide-y-reverse)))`, selector: '& > :not([hidden]) ~ :not([hidden])' },
        'divide-x-reverse': { css: '--jquan-divide-x-reverse', val: '1', selector: '& > :not([hidden]) ~ :not([hidden])' },
        'divide-y-reverse': { css: '--jquan-divide-y-reverse', val: '1', selector: '& > :not([hidden]) ~ :not([hidden])' },
        'divide-solid': { css: 'border-style', val: 'solid', selector: '& > :not([hidden]) ~ :not([hidden])' },
        'divide-dashed': { css: 'border-style', val: 'dashed', selector: '& > :not([hidden]) ~ :not([hidden])' },
        'divide-dotted': { css: 'border-style', val: 'dotted', selector: '& > :not([hidden]) ~ :not([hidden])' },
        'divide-double': { css: 'border-style', val: 'double', selector: '& > :not([hidden]) ~ :not([hidden])' },
        'divide-none': { css: 'border-style', val: 'none', selector: '& > :not([hidden]) ~ :not([hidden])' },

        // =============================================
        // 7.14 滤镜 (filter / backdrop-filter)
        // =============================================
        'blur': { css: '--jquan-blur', fn: v => `blur(${v})`, scale: blurs },
        'brightness': { css: '--jquan-brightness', values: { '0': 'brightness(0)', '50': 'brightness(.5)', '75': 'brightness(.75)', '90': 'brightness(.9)', '95': 'brightness(.95)', '100': 'brightness(1)', '105': 'brightness(1.05)', '110': 'brightness(1.1)', '125': 'brightness(1.25)', '150': 'brightness(1.5)', '200': 'brightness(2)' } },
        'contrast': { css: '--jquan-contrast', values: { '0': 'contrast(0)', '50': 'contrast(.5)', '75': 'contrast(.75)', '100': 'contrast(1)', '125': 'contrast(1.25)', '150': 'contrast(1.5)', '200': 'contrast(2)' } },
        'drop-shadow': { css: '--jquan-drop-shadow', values: {
            'sm': 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.05))',
            'DEFAULT': 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.06))',
            'md': 'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))',
            'lg': 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))',
            'xl': 'drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08))',
            '2xl': 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))',
            'none': 'drop-shadow(0 0 #0000)'
        }},
        'grayscale': { css: '--jquan-grayscale', values: { 'DEFAULT': 'grayscale(100%)', '0': 'grayscale(0)' } },
        'hue-rotate': { css: '--jquan-hue-rotate', values: { '0': 'hue-rotate(0deg)', '15': 'hue-rotate(15deg)', '30': 'hue-rotate(30deg)', '60': 'hue-rotate(60deg)', '90': 'hue-rotate(90deg)', '180': 'hue-rotate(180deg)' } },
        'invert': { css: '--jquan-invert', values: { 'DEFAULT': 'invert(100%)', '0': 'invert(0)' } },
        'saturate': { css: '--jquan-saturate', values: { '0': 'saturate(0)', '50': 'saturate(.5)', '100': 'saturate(1)', '150': 'saturate(1.5)', '200': 'saturate(2)' } },
        'sepia': { css: '--jquan-sepia', values: { 'DEFAULT': 'sepia(100%)', '0': 'sepia(0)' } },

        'backdrop-blur': { css: '--jquan-backdrop-blur', fn: v => `blur(${v})`, scale: blurs }, //毛玻璃
        'backdrop-brightness': { css: '--jquan-backdrop-brightness', values: { '0': 'brightness(0)', '50': 'brightness(.5)', '75': 'brightness(.75)', '100': 'brightness(1)', '125': 'brightness(1.25)', '150': 'brightness(1.5)', '200': 'brightness(2)' } },
        'backdrop-contrast': { css: '--jquan-backdrop-contrast', values: { '0': 'contrast(0)', '50': 'contrast(.5)', '75': 'contrast(.75)', '100': 'contrast(1)', '125': 'contrast(1.25)', '150': 'contrast(1.5)', '200': 'contrast(2)' } },
        'backdrop-grayscale': { css: '--jquan-backdrop-grayscale', values: { 'DEFAULT': 'grayscale(100%)', '0': 'grayscale(0)' } },
        'backdrop-hue-rotate': { css: '--jquan-backdrop-hue-rotate', values: { '0': 'hue-rotate(0deg)', '15': 'hue-rotate(15deg)', '30': 'hue-rotate(30deg)', '60': 'hue-rotate(60deg)', '90': 'hue-rotate(90deg)', '180': 'hue-rotate(180deg)' } },
        'backdrop-invert': { css: '--jquan-backdrop-invert', values: { 'DEFAULT': 'invert(100%)', '0': 'invert(0)' } },
        'backdrop-opacity': { css: '--jquan-backdrop-opacity', values: { '0': 'opacity(0)', '25': 'opacity(.25)', '50': 'opacity(.5)', '75': 'opacity(.75)', '100': 'opacity(1)' } },
        'backdrop-saturate': { css: '--jquan-backdrop-saturate', values: { '0': 'saturate(0)', '50': 'saturate(.5)', '100': 'saturate(1)', '150': 'saturate(1.5)', '200': 'saturate(2)' } },
        'backdrop-sepia': { css: '--jquan-backdrop-sepia', values: { 'DEFAULT': 'sepia(100%)', '0': 'sepia(0)' } },
        
        // 隐式触发 filter 的复合属性类 (Jquan 优化)
        'filter': { css: 'filter', val: 'var(--jquan-blur) var(--jquan-brightness) var(--jquan-contrast) var(--jquan-grayscale) var(--jquan-hue-rotate) var(--jquan-invert) var(--jquan-saturate) var(--jquan-sepia) var(--jquan-drop-shadow)' },
        'filter-none': { css: 'filter', val: 'none' },
        'backdrop-filter': { css: 'backdrop-filter', val: 'var(--jquan-backdrop-blur) var(--jquan-backdrop-brightness) var(--jquan-backdrop-contrast) var(--jquan-backdrop-grayscale) var(--jquan-backdrop-hue-rotate) var(--jquan-backdrop-invert) var(--jquan-backdrop-opacity) var(--jquan-backdrop-saturate) var(--jquan-backdrop-sepia)' },
        'backdrop-filter-none': { css: 'backdrop-filter', val: 'none' },

        // =============================================
        // 7.15 变换 (transform / translate / scale / rotate / skew / origin / 3D)
        // =============================================
        // Jquan 优化: 让修改任何 translate 等自动应用复合的 transform，但不破坏原有结构。
        'transform': { css: 'transform', val: 'translateX(var(--jquan-translate-x,0)) translateY(var(--jquan-translate-y,0)) rotate(var(--jquan-rotate,0)) skewX(var(--jquan-skew-x,0)) skewY(var(--jquan-skew-y,0)) scaleX(var(--jquan-scale-x,1)) scaleY(var(--jquan-scale-y,1))' },
        'transform-cpu': { css: 'transform', val: 'translateX(var(--jquan-translate-x,0)) translateY(var(--jquan-translate-y,0)) rotate(var(--jquan-rotate,0)) skewX(var(--jquan-skew-x,0)) skewY(var(--jquan-skew-y,0)) scaleX(var(--jquan-scale-x,1)) scaleY(var(--jquan-scale-y,1))' },
        'transform-gpu': { css: 'transform', val: 'translate3d(var(--jquan-translate-x,0), var(--jquan-translate-y,0), 0) rotate(var(--jquan-rotate,0)) skewX(var(--jquan-skew-x,0)) skewY(var(--jquan-skew-y,0)) scaleX(var(--jquan-scale-x,1)) scaleY(var(--jquan-scale-y,1))' },
        'transform-none': { css: 'transform', val: 'none' },

        'translate-x': { css: ['--jquan-translate-x', 'transform'], scale: spacing, fn: v => `${v}; translateX(var(--jquan-translate-x,0)) translateY(var(--jquan-translate-y,0)) rotate(var(--jquan-rotate,0)) skewX(var(--jquan-skew-x,0)) skewY(var(--jquan-skew-y,0)) scaleX(var(--jquan-scale-x,1)) scaleY(var(--jquan-scale-y,1))` },
        'translate-y': { css: ['--jquan-translate-y', 'transform'], scale: spacing, fn: v => `${v}; translateX(var(--jquan-translate-x,0)) translateY(var(--jquan-translate-y,0)) rotate(var(--jquan-rotate,0)) skewX(var(--jquan-skew-x,0)) skewY(var(--jquan-skew-y,0)) scaleX(var(--jquan-scale-x,1)) scaleY(var(--jquan-scale-y,1))` },
        'translate-z': { css: '--jquan-translate-z', scale: spacing },

        'rotate': { css: ['--jquan-rotate', 'transform'], values: { '0': '0deg', '1': '1deg', '2': '2deg', '3': '3deg', '6': '6deg', '12': '12deg', '45': '45deg', '90': '90deg', '180': '180deg' }, fn: v => `${v}; translateX(var(--jquan-translate-x,0)) translateY(var(--jquan-translate-y,0)) rotate(var(--jquan-rotate,0)) skewX(var(--jquan-skew-x,0)) skewY(var(--jquan-skew-y,0)) scaleX(var(--jquan-scale-x,1)) scaleY(var(--jquan-scale-y,1))` },
        'rotate-x': { css: 'transform', fn: v => `rotateX(${v}deg)` },
        'rotate-y': { css: 'transform', fn: v => `rotateY(${v}deg)` },
        'rotate-z': { css: 'transform', fn: v => `rotateZ(${v}deg)` },

        'scale': { css: ['--jquan-scale-x', '--jquan-scale-y', 'transform'], values: { '0': '0', '50': '.5', '75': '.75', '90': '.9', '95': '.95', '100': '1', '105': '1.05', '110': '1.1', '125': '1.25', '150': '1.5' }, fn: v => `${v}; ${v}; translateX(var(--jquan-translate-x,0)) translateY(var(--jquan-translate-y,0)) rotate(var(--jquan-rotate,0)) skewX(var(--jquan-skew-x,0)) skewY(var(--jquan-skew-y,0)) scaleX(var(--jquan-scale-x,1)) scaleY(var(--jquan-scale-y,1))` },
        'scale-x': { css: ['--jquan-scale-x', 'transform'], values: { '0': '0', '50': '.5', '75': '.75', '90': '.9', '95': '.95', '100': '1', '105': '1.05', '110': '1.1', '125': '1.25', '150': '1.5' }, fn: v => `${v}; translateX(var(--jquan-translate-x,0)) translateY(var(--jquan-translate-y,0)) rotate(var(--jquan-rotate,0)) skewX(var(--jquan-skew-x,0)) skewY(var(--jquan-skew-y,0)) scaleX(var(--jquan-scale-x,1)) scaleY(var(--jquan-scale-y,1))` },
        'scale-y': { css: ['--jquan-scale-y', 'transform'], values: { '0': '0', '50': '.5', '75': '.75', '90': '.9', '95': '.95', '100': '1', '105': '1.05', '110': '1.1', '125': '1.25', '150': '1.5' }, fn: v => `${v}; translateX(var(--jquan-translate-x,0)) translateY(var(--jquan-translate-y,0)) rotate(var(--jquan-rotate,0)) skewX(var(--jquan-skew-x,0)) skewY(var(--jquan-skew-y,0)) scaleX(var(--jquan-scale-x,1)) scaleY(var(--jquan-scale-y,1))` },

        'skew-x': { css: ['--jquan-skew-x', 'transform'], values: { '0': '0deg', '1': '1deg', '2': '2deg', '3': '3deg', '6': '6deg', '12': '12deg' }, fn: v => `${v}; translateX(var(--jquan-translate-x,0)) translateY(var(--jquan-translate-y,0)) rotate(var(--jquan-rotate,0)) skewX(var(--jquan-skew-x,0)) skewY(var(--jquan-skew-y,0)) scaleX(var(--jquan-scale-x,1)) scaleY(var(--jquan-scale-y,1))` },
        'skew-y': { css: ['--jquan-skew-y', 'transform'], values: { '0': '0deg', '1': '1deg', '2': '2deg', '3': '3deg', '6': '6deg', '12': '12deg' }, fn: v => `${v}; translateX(var(--jquan-translate-x,0)) translateY(var(--jquan-translate-y,0)) rotate(var(--jquan-rotate,0)) skewX(var(--jquan-skew-x,0)) skewY(var(--jquan-skew-y,0)) scaleX(var(--jquan-scale-x,1)) scaleY(var(--jquan-scale-y,1))` },

        'origin-center': { css: 'transform-origin', val: 'center' },
        'origin-top': { css: 'transform-origin', val: 'top' },
        'origin-top-right': { css: 'transform-origin', val: 'top right' },
        'origin-right': { css: 'transform-origin', val: 'right' },
        'origin-bottom-right': { css: 'transform-origin', val: 'bottom right' },
        'origin-bottom': { css: 'transform-origin', val: 'bottom' },
        'origin-bottom-left': { css: 'transform-origin', val: 'bottom left' },
        'origin-left': { css: 'transform-origin', val: 'left' },
        'origin-top-left': { css: 'transform-origin', val: 'top left' },

        // 3D
        'perspective-none': { css: 'perspective', val: 'none' },
        'perspective': { css: 'perspective', values: { '100': '100px', '200': '200px', '300': '300px', '500': '500px', '600': '600px', '700': '700px', '800': '800px', '1000': '1000px', '1200': '1200px' } },
        'perspective-origin-center': { css: 'perspective-origin', val: 'center' },
        'perspective-origin-top': { css: 'perspective-origin', val: 'top' },
        'perspective-origin-top-right': { css: 'perspective-origin', val: 'top right' },
        'perspective-origin-right': { css: 'perspective-origin', val: 'right' },
        'perspective-origin-bottom-right': { css: 'perspective-origin', val: 'bottom right' },
        'perspective-origin-bottom': { css: 'perspective-origin', val: 'bottom' },
        'perspective-origin-bottom-left': { css: 'perspective-origin', val: 'bottom left' },
        'perspective-origin-left': { css: 'perspective-origin', val: 'left' },
        'perspective-origin-top-left': { css: 'perspective-origin', val: 'top left' },
        'transform-3d': { css: 'transform-style', val: 'preserve-3d' },
        'transform-flat': { css: 'transform-style', val: 'flat' },
        'backface-visible': { css: 'backface-visibility', val: 'visible' },
        'backface-hidden': { css: 'backface-visibility', val: 'hidden' },

        // =============================================
        // 7.16 过渡与动画 (transition / animation) - 🚀 核心已内置加载器原生动画字典
        // =============================================
        'transition': { css: 'transition-property', val: 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter' },
        'transition-none': { css: 'transition-property', val: 'none' },
        'transition-all': { css: 'transition-property', val: 'all' },
        'transition-colors': { css: 'transition-property', val: 'color, background-color, border-color, text-decoration-color, fill, stroke' },
        'transition-opacity': { css: 'transition-property', val: 'opacity' },
        'transition-shadow': { css: 'transition-property', val: 'box-shadow' },
        'transition-transform': { css: 'transition-property', val: 'transform' },
        'duration': { css: 'transition-duration', scale: durations },
        'delay': { css: 'transition-delay', scale: durations },
        'ease-linear': { css: 'transition-timing-function', val: 'linear' },
        'ease-in': { css: 'transition-timing-function', val: 'cubic-bezier(0.4, 0, 1, 1)' },
        'ease-out': { css: 'transition-timing-function', val: 'cubic-bezier(0, 0, 0.2, 1)' },
        'ease-in-out': { css: 'transition-timing-function', val: 'cubic-bezier(0.4, 0, 0.2, 1)' },

        'animate-none': { css: 'animation', val: 'none' },
        'animate-spin': { css: 'animation', val: 'jquan-spin 1s linear infinite' },
        'animate-ping': { css: 'animation', val: 'jquan-ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' },
        'animate-pulse': { css: 'animation', val: 'jquan-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' },
        'animate-bounce': { css: 'animation', val: 'jquan-bounce 1s infinite' },
        
        // [Jquan Native Loaders] - 告别外部 Hack，真正成为 JquanUI 的原生能力！
        'animate-wave': { css: 'animation', val: 'jquan-loader-wave 1s ease-in-out infinite' },
        'animate-slide': { css: 'animation', val: 'jquan-loader-slide 1.5s ease-in-out infinite' },
        'animate-fill': { css: 'animation', val: 'jquan-loader-fill 1.5s ease-in-out infinite alternate' },
        'animate-morph': { css: 'animation', val: 'jquan-loader-morph 2s ease-in-out infinite' }, // 🚀 第 8 个加载器新增

        'animation-duration': { css: 'animation-duration', scale: durations },
        'animation-delay': { css: 'animation-delay', scale: durations },
        'animation-ease-linear': { css: 'animation-timing-function', val: 'linear' },
        'animation-ease-in': { css: 'animation-timing-function', val: 'cubic-bezier(0.4, 0, 1, 1)' },
        'animation-ease-out': { css: 'animation-timing-function', val: 'cubic-bezier(0, 0, 0.2, 1)' },
        'animation-ease-in-out': { css: 'animation-timing-function', val: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        'animation-fill-none': { css: 'animation-fill-mode', val: 'none' },
        'animation-fill-forwards': { css: 'animation-fill-mode', val: 'forwards' },
        'animation-fill-backwards': { css: 'animation-fill-mode', val: 'backwards' },
        'animation-fill-both': { css: 'animation-fill-mode', val: 'both' },
        'animation-dir-normal': { css: 'animation-direction', val: 'normal' },
        'animation-dir-reverse': { css: 'animation-direction', val: 'reverse' },
        'animation-dir-alternate': { css: 'animation-direction', val: 'alternate' },
        'animation-dir-alternate-reverse': { css: 'animation-direction', val: 'alternate-reverse' },
        'animation-iterate-infinite': { css: 'animation-iteration-count', val: 'infinite' },
        'animation-iterate-once': { css: 'animation-iteration-count', val: '1' },
        'animation-iterate-twice': { css: 'animation-iteration-count', val: '2' },
        'animation-running': { css: 'animation-play-state', val: 'running' },
        'animation-paused': { css: 'animation-play-state', val: 'paused' },

        // =============================================
        // 7.17 交互 (cursor / pointer-events / select / resize / scroll / touch / will-change)
        // =============================================
        'cursor-auto': { css: 'cursor', val: 'auto' },
        'cursor-default': { css: 'cursor', val: 'default' },
        'cursor-pointer': { css: 'cursor', val: 'pointer' },
        'cursor-wait': { css: 'cursor', val: 'wait' },
        'cursor-text': { css: 'cursor', val: 'text' },
        'cursor-move': { css: 'cursor', val: 'move' },
        'cursor-help': { css: 'cursor', val: 'help' },
        'cursor-not-allowed': { css: 'cursor', val: 'not-allowed' },
        'cursor-none': { css: 'cursor', val: 'none' },
        'cursor-context-menu': { css: 'cursor', val: 'context-menu' },
        'cursor-progress': { css: 'cursor', val: 'progress' },
        'cursor-cell': { css: 'cursor', val: 'cell' },
        'cursor-crosshair': { css: 'cursor', val: 'crosshair' },
        'cursor-vertical-text': { css: 'cursor', val: 'vertical-text' },
        'cursor-alias': { css: 'cursor', val: 'alias' },
        'cursor-copy': { css: 'cursor', val: 'copy' },
        'cursor-no-drop': { css: 'cursor', val: 'no-drop' },
        'cursor-grab': { css: 'cursor', val: 'grab' },
        'cursor-grabbing': { css: 'cursor', val: 'grabbing' },
        'cursor-all-scroll': { css: 'cursor', val: 'all-scroll' },
        'cursor-col-resize': { css: 'cursor', val: 'col-resize' },
        'cursor-row-resize': { css: 'cursor', val: 'row-resize' },
        'cursor-n-resize': { css: 'cursor', val: 'n-resize' },
        'cursor-e-resize': { css: 'cursor', val: 'e-resize' },
        'cursor-s-resize': { css: 'cursor', val: 's-resize' },
        'cursor-w-resize': { css: 'cursor', val: 'w-resize' },
        'cursor-ne-resize': { css: 'cursor', val: 'ne-resize' },
        'cursor-nw-resize': { css: 'cursor', val: 'nw-resize' },
        'cursor-se-resize': { css: 'cursor', val: 'se-resize' },
        'cursor-sw-resize': { css: 'cursor', val: 'sw-resize' },
        'cursor-ew-resize': { css: 'cursor', val: 'ew-resize' },
        'cursor-ns-resize': { css: 'cursor', val: 'ns-resize' },
        'cursor-nesw-resize': { css: 'cursor', val: 'nesw-resize' },
        'cursor-nwse-resize': { css: 'cursor', val: 'nwse-resize' },
        'cursor-zoom-in': { css: 'cursor', val: 'zoom-in' },
        'cursor-zoom-out': { css: 'cursor', val: 'zoom-out' },

        // 滚动条样式控制 (支持 Firefox 及 现代 Chrome/Safari)
        'scrollbar-none': { css: ['scrollbar-width', '-webkit-scrollbar'], val: 'none; display: none' },
        'scrollbar-thin': { css: 'scrollbar-width', val: 'thin' },
        'scrollbar-auto': { css: 'scrollbar-width', val: 'auto' },
        
        // 系统级色彩模式适配 (让原生滚动条、表单控件自动变黑)
        'scheme-normal': { css: 'color-scheme', val: 'normal' },
        'scheme-light': { css: 'color-scheme', val: 'light' },
        'scheme-dark': { css: 'color-scheme', val: 'dark' },

        'pointer-events-none': { css: 'pointer-events', val: 'none' },
        'pointer-events-auto': { css: 'pointer-events', val: 'auto' },

        'select-none': { css: 'user-select', val: 'none' },
        'select-text': { css: 'user-select', val: 'text' },
        'select-all': { css: 'user-select', val: 'all' },
        'select-auto': { css: 'user-select', val: 'auto' },

        'resize-none': { css: 'resize', val: 'none' },
        'resize': { css: 'resize', val: 'both' },
        'resize-x': { css: 'resize', val: 'horizontal' },
        'resize-y': { css: 'resize', val: 'vertical' },

        'scroll-auto': { css: 'scroll-behavior', val: 'auto' },
        'scroll-smooth': { css: 'scroll-behavior', val: 'smooth' },
        'snap-none': { css: 'scroll-snap-type', val: 'none' },
        'snap-x': { css: 'scroll-snap-type', val: 'x var(--jquan-scroll-snap-strictness)' },
        'snap-y': { css: 'scroll-snap-type', val: 'y var(--jquan-scroll-snap-strictness)' },
        'snap-both': { css: 'scroll-snap-type', val: 'both var(--jquan-scroll-snap-strictness)' },
        'snap-mandatory': { css: '--jquan-scroll-snap-strictness', val: 'mandatory' },
        'snap-proximity': { css: '--jquan-scroll-snap-strictness', val: 'proximity' },
        'snap-start': { css: 'scroll-snap-align', val: 'start' },
        'snap-end': { css: 'scroll-snap-align', val: 'end' },
        'snap-center': { css: 'scroll-snap-align', val: 'center' },
        'snap-align-none': { css: 'scroll-snap-align', val: 'none' },
        'snap-normal': { css: 'scroll-snap-stop', val: 'normal' },
        'snap-always': { css: 'scroll-snap-stop', val: 'always' },

        'scroll-m': { css: 'scroll-margin', scale: spacing },
        'scroll-mx': { css: ['scroll-margin-left', 'scroll-margin-right'], scale: spacing },
        'scroll-my': { css: ['scroll-margin-top', 'scroll-margin-bottom'], scale: spacing },
        'scroll-mt': { css: 'scroll-margin-top', scale: spacing },
        'scroll-mr': { css: 'scroll-margin-right', scale: spacing },
        'scroll-mb': { css: 'scroll-margin-bottom', scale: spacing },
        'scroll-ml': { css: 'scroll-margin-left', scale: spacing },
        'scroll-ms': { css: 'scroll-margin-inline-start', scale: spacing },
        'scroll-me': { css: 'scroll-margin-inline-end', scale: spacing },
        'scroll-p': { css: 'scroll-padding', scale: spacing },
        'scroll-px': { css: ['scroll-padding-left', 'scroll-padding-right'], scale: spacing },
        'scroll-py': { css: ['scroll-padding-top', 'scroll-padding-bottom'], scale: spacing },
        'scroll-pt': { css: 'scroll-padding-top', scale: spacing },
        'scroll-pr': { css: 'scroll-padding-right', scale: spacing },
        'scroll-pb': { css: 'scroll-padding-bottom', scale: spacing },
        'scroll-pl': { css: 'scroll-padding-left', scale: spacing },
        'scroll-ps': { css: 'scroll-padding-inline-start', scale: spacing },
        'scroll-pe': { css: 'scroll-padding-inline-end', scale: spacing },

        'touch-auto': { css: 'touch-action', val: 'auto' },
        'touch-none': { css: 'touch-action', val: 'none' },
        'touch-pan-x': { css: 'touch-action', val: 'pan-x' },
        'touch-pan-left': { css: 'touch-action', val: 'pan-left' },
        'touch-pan-right': { css: 'touch-action', val: 'pan-right' },
        'touch-pan-y': { css: 'touch-action', val: 'pan-y' },
        'touch-pan-up': { css: 'touch-action', val: 'pan-up' },
        'touch-pan-down': { css: 'touch-action', val: 'pan-down' },
        'touch-pinch-zoom': { css: 'touch-action', val: 'pinch-zoom' },
        'touch-manipulation': { css: 'touch-action', val: 'manipulation' },

        'will-change-auto': { css: 'will-change', val: 'auto' },
        'will-change-scroll': { css: 'will-change', val: 'scroll-position' },
        'will-change-contents': { css: 'will-change', val: 'contents' },
        'will-change-transform': { css: 'will-change', val: 'transform' },

        // =============================================
        // 7.18 对象适配 (object-fit / object-position)
        // =============================================
        'object-contain': { css: 'object-fit', val: 'contain' },
        'object-cover': { css: 'object-fit', val: 'cover' },
        'object-fill': { css: 'object-fit', val: 'fill' },
        'object-none': { css: 'object-fit', val: 'none' },
        'object-scale-down': { css: 'object-fit', val: 'scale-down' },
        'object-bottom': { css: 'object-position', val: 'bottom' },
        'object-center': { css: 'object-position', val: 'center' },
        'object-left': { css: 'object-position', val: 'left' },
        'object-left-bottom': { css: 'object-position', val: 'left bottom' },
        'object-left-top': { css: 'object-position', val: 'left top' },
        'object-right': { css: 'object-position', val: 'right' },
        'object-right-bottom': { css: 'object-position', val: 'right bottom' },
        'object-right-top': { css: 'object-position', val: 'right top' },
        'object-top': { css: 'object-position', val: 'top' },

        // =============================================
        // 7.19 表格 (table-layout / caption / border-collapse / border-spacing)
        // =============================================
        'table-auto': { css: 'table-layout', val: 'auto' },
        'table-fixed': { css: 'table-layout', val: 'fixed' },
        'caption-top': { css: 'caption-side', val: 'top' },
        'caption-bottom': { css: 'caption-side', val: 'bottom' },
        'border-collapse': { css: 'border-collapse', val: 'collapse' },
        'border-separate': { css: 'border-collapse', val: 'separate' },
        'border-spacing': { css: 'border-spacing', scale: spacing },
        'border-spacing-x': { css: '--jquan-border-spacing-x', scale: spacing },
        'border-spacing-y': { css: '--jquan-border-spacing-y', scale: spacing },

        // =============================================
        // 7.20 列表 (list-style)
        // =============================================
        'list-none': { css: 'list-style-type', val: 'none' },
        'list-disc': { css: 'list-style-type', val: 'disc' },
        'list-decimal': { css: 'list-style-type', val: 'decimal' },
        'list-square': { css: 'list-style-type', val: 'square' },
        'list-circle': { css: 'list-style-type', val: 'circle' },
        'list-alpha': { css: 'list-style-type', val: 'lower-alpha' },
        'list-roman': { css: 'list-style-type', val: 'lower-roman' },
        'list-inside': { css: 'list-style-position', val: 'inside' },
        'list-outside': { css: 'list-style-position', val: 'outside' },
        'list-image-none': { css: 'list-style-image', val: 'none' },

        // =============================================
        // 7.21 SVG
        // =============================================
        'fill-none': { css: 'fill', val: 'none' },
        'fill-current': { css: 'fill', val: 'currentColor' },
        'fill': { css: 'fill', color: true },
        'stroke-none': { css: 'stroke', val: 'none' },
        'stroke-current': { css: 'stroke', val: 'currentColor' },
        'stroke': { css: 'stroke', color: true },
        'stroke-w': { css: 'stroke-width', values: { '0': '0', '1': '1', '2': '2' } },
        'stroke-linecap-butt': { css: 'stroke-linecap', val: 'butt' },
        'stroke-linecap-round': { css: 'stroke-linecap', val: 'round' },
        'stroke-linecap-square': { css: 'stroke-linecap', val: 'square' },
        'stroke-linejoin-arcs': { css: 'stroke-linejoin', val: 'arcs' },
        'stroke-linejoin-bevel': { css: 'stroke-linejoin', val: 'bevel' },
        'stroke-linejoin-miter': { css: 'stroke-linejoin', val: 'miter' },
        'stroke-linejoin-round': { css: 'stroke-linejoin', val: 'round' },

        // =============================================
        // 7.22 混合模式 (mix-blend / bg-blend)
        // =============================================
        'mix-blend-normal': { css: 'mix-blend-mode', val: 'normal' },
        'mix-blend-multiply': { css: 'mix-blend-mode', val: 'multiply' },
        'mix-blend-screen': { css: 'mix-blend-mode', val: 'screen' },
        'mix-blend-overlay': { css: 'mix-blend-mode', val: 'overlay' },
        'mix-blend-darken': { css: 'mix-blend-mode', val: 'darken' },
        'mix-blend-lighten': { css: 'mix-blend-mode', val: 'lighten' },
        'mix-blend-color-dodge': { css: 'mix-blend-mode', val: 'color-dodge' },
        'mix-blend-color-burn': { css: 'mix-blend-mode', val: 'color-burn' },
        'mix-blend-hard-light': { css: 'mix-blend-mode', val: 'hard-light' },
        'mix-blend-soft-light': { css: 'mix-blend-mode', val: 'soft-light' },
        'mix-blend-difference': { css: 'mix-blend-mode', val: 'difference' },
        'mix-blend-exclusion': { css: 'mix-blend-mode', val: 'exclusion' },
        'mix-blend-hue': { css: 'mix-blend-mode', val: 'hue' },
        'mix-blend-saturation': { css: 'mix-blend-mode', val: 'saturation' },
        'mix-blend-color': { css: 'mix-blend-mode', val: 'color' },
        'mix-blend-luminosity': { css: 'mix-blend-mode', val: 'luminosity' },
        'mix-blend-plus-darker': { css: 'mix-blend-mode', val: 'plus-darker' },
        'mix-blend-plus-lighter': { css: 'mix-blend-mode', val: 'plus-lighter' },

        'bg-blend-normal': { css: 'background-blend-mode', val: 'normal' },
        'bg-blend-multiply': { css: 'background-blend-mode', val: 'multiply' },
        'bg-blend-screen': { css: 'background-blend-mode', val: 'screen' },
        'bg-blend-overlay': { css: 'background-blend-mode', val: 'overlay' },
        'bg-blend-darken': { css: 'background-blend-mode', val: 'darken' },
        'bg-blend-lighten': { css: 'background-blend-mode', val: 'lighten' },
        'bg-blend-color-dodge': { css: 'background-blend-mode', val: 'color-dodge' },
        'bg-blend-color-burn': { css: 'background-blend-mode', val: 'color-burn' },
        'bg-blend-hard-light': { css: 'background-blend-mode', val: 'hard-light' },
        'bg-blend-soft-light': { css: 'background-blend-mode', val: 'soft-light' },
        'bg-blend-difference': { css: 'background-blend-mode', val: 'difference' },
        'bg-blend-exclusion': { css: 'background-blend-mode', val: 'exclusion' },
        'bg-blend-hue': { css: 'background-blend-mode', val: 'hue' },
        'bg-blend-saturation': { css: 'background-blend-mode', val: 'saturation' },
        'bg-blend-color': { css: 'background-blend-mode', val: 'color' },
        'bg-blend-luminosity': { css: 'background-blend-mode', val: 'luminosity' },

        // =============================================
        // 7.23 容器查询 (container)
        // =============================================
        'container-type-normal': { css: 'container-type', val: 'normal' },
        'container-type-size': { css: 'container-type', val: 'size' },
        'container-type-inline-size': { css: 'container-type', val: 'inline-size' },

        // =============================================
        // 7.24 外观与表单
        // =============================================
        'appearance-none': { css: 'appearance', val: 'none' },
        'appearance-auto': { css: 'appearance', val: 'auto' },

        // columns
        'columns': { css: 'columns', values: {
            '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10', '11': '11', '12': '12', 'auto': 'auto',
            '3xs': '16rem', '2xs': '18rem', 'xs': '20rem', 'sm': '24rem', 'md': '28rem', 'lg': '32rem', 'xl': '36rem', '2xl': '42rem', '3xl': '48rem', '4xl': '56rem', '5xl': '64rem', '6xl': '72rem', '7xl': '80rem'
        }},
        'break-after-auto': { css: 'break-after', val: 'auto' },
        'break-after-avoid': { css: 'break-after', val: 'avoid' },
        'break-after-all': { css: 'break-after', val: 'all' },
        'break-after-avoid-page': { css: 'break-after', val: 'avoid-page' },
        'break-after-page': { css: 'break-after', val: 'page' },
        'break-after-left': { css: 'break-after', val: 'left' },
        'break-after-right': { css: 'break-after', val: 'right' },
        'break-after-column': { css: 'break-after', val: 'column' },
        'break-before-auto': { css: 'break-before', val: 'auto' },
        'break-before-avoid': { css: 'break-before', val: 'avoid' },
        'break-before-all': { css: 'break-before', val: 'all' },
        'break-before-avoid-page': { css: 'break-before', val: 'avoid-page' },
        'break-before-page': { css: 'break-before', val: 'page' },
        'break-before-left': { css: 'break-before', val: 'left' },
        'break-before-right': { css: 'break-before', val: 'right' },
        'break-before-column': { css: 'break-before', val: 'column' },
        'break-inside-auto': { css: 'break-inside', val: 'auto' },
        'break-inside-avoid': { css: 'break-inside', val: 'avoid' },
        'break-inside-avoid-page': { css: 'break-inside', val: 'avoid-page' },
        'break-inside-avoid-column': { css: 'break-inside', val: 'avoid-column' },

        // =============================================
        // 7.25 打印
        // =============================================
        'print-color-adjust-auto': { css: ['-webkit-print-color-adjust', 'print-color-adjust'], val: 'economy; economy' },
        'print-color-adjust-exact': { css: ['-webkit-print-color-adjust', 'print-color-adjust'], val: 'exact; exact' },
        
        // =============================================
        // 7.26 响应式自动网格 (Auto Grid) - 完美兼容老版架构
        // =============================================
        'auto-grid-fill': { css: 'grid-template-columns', val: 'repeat(auto-fill, minmax(var(--min-column-width, 250px), 1fr))' },
        'auto-grid-fit': { css: 'grid-template-columns', val: 'repeat(auto-fit, minmax(var(--min-column-width, 250px), 1fr))' },
        'auto-grid-xs': { css: '--min-column-width', val: '120px' },
        'auto-grid-sm': { css: '--min-column-width', val: '200px' },
        'auto-grid-md': { css: '--min-column-width', val: '250px' },
        'auto-grid-lg': { css: '--min-column-width', val: '300px' },
        'auto-grid-xl': { css: '--min-column-width', val: '380px' },
        'auto-grid-2xl': { css: '--min-column-width', val: '480px' },
        
        // =============================================
        // 7.26.1 遮罩与裁剪 (Mask & Clip-path) - 现代 UI 必备
        // =============================================
        'clip-auto': { css: 'clip-path', val: 'auto' },
        'clip-circle': { css: 'clip-path', val: 'circle(50% at 50% 50%)' },
        'clip-ellipse': { css: 'clip-path', val: 'ellipse(50% 50% at 50% 50%)' },
        'mask-none': { css: ['mask-image', '-webkit-mask-image'], val: 'none; none' },
        'mask-repeat': { css: ['mask-repeat', '-webkit-mask-repeat'], val: 'repeat; repeat' },
        'mask-no-repeat': { css: ['mask-repeat', '-webkit-mask-repeat'], val: 'no-repeat; no-repeat' },
        'mask-contain': { css: ['mask-size', '-webkit-mask-size'], val: 'contain; contain' },
        'mask-cover': { css: ['mask-size', '-webkit-mask-size'], val: 'cover; cover' },
        // =============================================
        // 7.26.2 书写模式 (Writing Mode) - 国际化与竖排版引擎
        // =============================================
        'writing-horizontal': { css: 'writing-mode', val: 'horizontal-tb' },
        'writing-vertical-rl': { css: 'writing-mode', val: 'vertical-rl' },
        'writing-vertical-lr': { css: 'writing-mode', val: 'vertical-lr' },
        'direction-ltr': { css: 'direction', val: 'ltr' },
        'direction-rtl': { css: 'direction', val: 'rtl' },
        // =============================================
        // 7.26.3 渲染性能边界 (CSS Containment) - P8 级重绘调优
        // =============================================
        'contain-none': { css: 'contain', val: 'none' },
        'contain-strict': { css: 'contain', val: 'strict' },
        'contain-content': { css: 'contain', val: 'content' },
        'contain-size': { css: 'contain', val: 'size' },
        'contain-layout': { css: 'contain', val: 'layout' },
        'contain-paint': { css: 'contain', val: 'paint' },


        // =============================================
        // 7.27 杂项
        // =============================================
        'sr-only': { css: ['position', 'width', 'height', 'padding', 'margin', 'overflow', 'clip', 'white-space', 'border-width'], val: 'absolute; 1px; 1px; 0; -1px; hidden; rect(0, 0, 0, 0); nowrap; 0' },
        'not-sr-only': { css: ['position', 'width', 'height', 'padding', 'margin', 'overflow', 'clip', 'white-space'], val: 'static; auto; auto; 0; 0; visible; auto; normal' },
        'forced-color-adjust-auto': { css: 'forced-color-adjust', val: 'auto' },
        'forced-color-adjust-none': { css: 'forced-color-adjust', val: 'none' },
    };
    // ==================== dictionary 结束 ====================


    // =============================================
    // 8. 核心：解析单个工具类 → CSS 声明
    // =============================================

    /**
     * 将颜色名称和透明度（如果有）转换为合法的 CSS 颜色值
     * [Jquan 修正版] 确保 R G B 数字组返回包裹的 rgb()
     */
        function resolveColor(name) {
        if (!name) return null;
        let opacity = null;
        const slashIdx = name.indexOf('/');
        if (slashIdx > -1) {
            opacity = name.slice(slashIdx + 1);
            name = name.slice(0, slashIdx);
        }
        
        let hex = resolveColorDirect(name);
        if (!hex) return null;

        if (typeof hex === 'string' && hex.startsWith('var(')) {
            return opacity ? `rgb(${hex} / ${parseFloat(opacity) / 100})` : `rgb(${hex})`;
        }

        let rgb = hexToRgb(hex);

        // [Jquan 终极兼容性修复] 强制转换为传统 rgba(r, g, b, a) 格式，防止浏览器底层静默吞掉新语法
        if (typeof rgb === 'string' && /^[0-9.]+(\s*,\s*|\s+)[0-9.]+(\s*,\s*|\s+)[0-9.]+$/.test(rgb.trim())) {
            const parts = rgb.split(/[\s,]+/).filter(Boolean);
            if (opacity) {
                return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${parseFloat(opacity) / 100})`;
            } else {
                return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
            }
        }

        if (rgb === 'transparent' || rgb === 'currentColor' || rgb === 'inherit') {
            return rgb;
        }

        return rgb;
    }

    /**
     * 将 css 属性和值组合成声明块字符串
     * [Jquan 架构级支持] 增加对 !important 的处理
     */
    function buildDeclarations(props, val, isImportant) {
        const importantStr = isImportant ? ' !important' : '';
        if (typeof props === 'string') {
            if (props.includes(',')) {
                props = props.split(',').map(p => p.trim());
            } else {
                return `${props}: ${val}${importantStr};`;
            }
        }
        if (Array.isArray(props)) {
            const vals = val.includes(';') ? val.split(';').map(v => v.trim()) : props.map(() => val);
            return props.map((p, i) => `${p}: ${vals[i] || vals[0]}${importantStr};`).join(' ');
        }
        return `${props}: ${val}${importantStr};`;
    }
    // =============================================
    // 🚀 Jquan Singularity JIT Engine: 任意值属性映射字典
    // =============================================

    const jitPropMap = {
        'w': 'width', 'h': 'height', 'size': ['width', 'height'],
        'min-w': 'min-width', 'max-w': 'max-width', 'min-h': 'min-height', 'max-h': 'max-height', 'min-s': ['min-width', 'min-height'], 'max-s': ['max-width', 'max-height'],
        'm': 'margin', 'mt': 'margin-top', 'mb': 'margin-bottom', 'ml': 'margin-left', 'mr': 'margin-right', 'mx': ['margin-left', 'margin-right'], 'my': ['margin-top', 'margin-bottom'],
        'p': 'padding', 'pt': 'padding-top', 'pb': 'padding-bottom', 'pl': 'padding-left', 'pr': 'padding-right', 'px': ['padding-left', 'padding-right'], 'py': ['padding-top', 'padding-bottom'],
        'fs': 'font-size', 'fw': 'font-weight', 'lh': 'line-height', 'leading': 'line-height', 'ls': 'letter-spacing', 'tracking': 'letter-spacing', 'word-spacing': 'word-spacing',
        'c': 'color', 'text': 'color', 'align': 'text-align', 'align-v': 'vertical-align', 'decoration': 'text-decoration', 'indent': 'text-indent', 'whitespace': 'white-space', 'break': 'word-break', 'content': 'content',
        'bg-c': 'background-color', 'bg-img': 'background-image', 'bg-size': 'background-size', 'bg-pos': 'background-position', 'bg-rep': 'background-repeat', 'bg-att': 'background-attachment', 'bg-clip': 'background-clip',
        'border': 'border-width', 'border-c': 'border-color', 'border-s': 'border-style', 'border-t': 'border-top-width', 'border-b': 'border-bottom-width', 'border-l': 'border-left-width', 'border-r': 'border-right-width', 'border-x': ['border-left-width', 'border-right-width'], 'border-y': ['border-top-width', 'border-bottom-width'],
        'rounded': 'border-radius', 'rounded-t': ['border-top-left-radius', 'border-top-right-radius'], 'rounded-b': ['border-bottom-left-radius', 'border-bottom-right-radius'], 'rounded-l': ['border-top-left-radius', 'border-bottom-left-radius'], 'rounded-r': ['border-top-right-radius', 'border-bottom-right-radius'], 'rounded-tl': 'border-top-left-radius', 'rounded-tr': 'border-top-right-radius', 'rounded-bl': 'border-bottom-left-radius', 'rounded-br': 'border-bottom-right-radius',
        'outline': 'outline', 'outline-o': 'outline-offset', 'outline-w': 'outline-width', 'outline-c': 'outline-color',
        'd': 'display', 'flex': 'flex', 'dir': 'flex-direction', 'wrap': 'flex-wrap', 'basis': 'flex-basis', 'grow': 'flex-grow', 'shrink': 'flex-shrink', 'order': 'order',
        'equal': ['display', 'grid-template-columns'], 'grid-cols': 'grid-template-columns', 'grid-rows': 'grid-template-rows', 'col': 'grid-column', 'row': 'grid-row', 'gap': 'gap', 'gap-x': 'column-gap', 'gap-y': 'row-gap',
        'justify': 'justify-content', 'justify-items': 'justify-items', 'justify-self': 'justify-self', 'items': 'align-items', 'content': 'align-content', 'self': 'align-self', 'place': 'place-content', 'place-items': 'place-items', 'place-self': 'place-self',
        'pos': 'position', 'z': 'z-index', 'inset': ['top', 'right', 'bottom', 'left'], 'inset-x': ['left', 'right'], 'inset-y': ['top', 'bottom'], 'top': 'top', 'right': 'right', 'bottom': 'bottom', 'left': 'left', 'float': 'float', 'clear': 'clear',
        'opacity': 'opacity', 'shadow': '--jquan-shadow', 'ring': '--jquan-ring-width', 'ring-offset': '--jquan-ring-offset-width', 'blend': 'mix-blend-mode', 'filter': 'filter', 'backdrop': 'backdrop-filter', 'cursor': 'cursor', 'select': 'user-select', 'pointer': 'pointer-events', 'resize': 'resize', 'visible': 'visibility', 'object': 'object-fit', 'object-pos': 'object-position',
        'transition': 'transition', 'duration': 'transition-duration', 'delay': 'transition-delay', 'ease': 'transition-timing-function', 'transform': 'transform', 'origin': 'transform-origin',
        'fill': 'fill', 'stroke': 'stroke', 'stroke-w': 'stroke-width', 'overflow': 'overflow', 'overflow-x': 'overflow-x', 'overflow-y': 'overflow-y',
        // 🚀 Jquan v3.7 扩充：JIT 高级渲染控制通道
        'clip': 'clip-path', 'mask': ['mask-image', '-webkit-mask-image'], 'mask-size': ['mask-size', '-webkit-mask-size'], 'mask-pos': ['mask-position', '-webkit-mask-position']
    };
    /**
     * 将单个原子类名解析为 { selector, css }
     */
    function resolveUtility(className) {
        let raw = className;
        let variantPrefixes = [];
        let mediaQueries = [];
        let containerQueries = [];
        let selectorWraps = [];
        let isImportant = false;

        // [Jquan 升级] 解析头部 !important
        if (raw.startsWith('!')) {
            isImportant = true;
            raw = raw.slice(1);
        }

        const segments = raw.split(':');
        let cleanUtil = segments.pop();
        variantPrefixes = segments;

        // [Jquan 升级] 解析变体后的 !important, 例如 hover:!bg-red-500
        if (cleanUtil.startsWith('!')) {
            isImportant = true;
            cleanUtil = cleanUtil.slice(1);
        }

        let isNegative = false;
        if (cleanUtil.startsWith('-')) {
            isNegative = true;
            cleanUtil = cleanUtil.slice(1);
        }

        let entry = null;
        let valueKey = null;
        let bestPrefix = '';

        if (dictionary[cleanUtil]) {
            entry = dictionary[cleanUtil];
            valueKey = 'DEFAULT';
            bestPrefix = cleanUtil;
        }

        if (!entry) {
            for (const key in dictionary) {
                if (cleanUtil.startsWith(key + '-') && key.length > bestPrefix.length) {
                    bestPrefix = key;
                }
            }
            if (bestPrefix) {
                entry = dictionary[bestPrefix];
                valueKey = cleanUtil.slice(bestPrefix.length + 1);
            }
        }

                let arbitraryValue = null;
        
        // 🚀 Jquan 升级版管线: 完美融入外挂 JIT 的正则与智能匹配
        const arbMatch = cleanUtil.match(/^([a-z0-9-]+?)-?\[(.+)]$/);
        if (arbMatch) {
            const prefix = arbMatch[1];
            let rawValue = arbMatch[2];
            
            // 1. 值处理: 只有非 url() 才替换下划线，保护 background-image 的链接
            arbitraryValue = rawValue.startsWith('url(') ? rawValue : rawValue.replace(/_/g, ' ');

            // 2. 核心：从外挂 JIT 移植过来的智能属性映射
            let jitCssProps = null;
            if (prefix === 'bg') {
                if (arbitraryValue.startsWith('url(') || arbitraryValue.includes('gradient(')) jitCssProps = ['background-image'];
                else if (/^(#|rgb|hsl|[a-z]+$)/.test(arbitraryValue)) jitCssProps = ['background-color'];
                else jitCssProps = ['background'];
            } else if (jitPropMap[prefix]) {
                jitCssProps = Array.isArray(jitPropMap[prefix]) ? jitPropMap[prefix] : [jitPropMap[prefix]];
            } else if (prefix.startsWith('--')) {
                jitCssProps = [prefix];
            }

            // 3. 构建虚拟字典词条以“欺骗”后续的原生解析管线
            if (jitCssProps) {
                entry = { css: jitCssProps, val: arbitraryValue }; 
                bestPrefix = prefix;
                valueKey = 'JIT_ARB';
            } else if (dictionary[prefix]) {
                // 降级回滚：查找核心大字典里的原生指令
                entry = dictionary[prefix];
                bestPrefix = prefix;
                valueKey = null;
            }
        }

        if (!entry) return null;

        let finalValue = null;

        if (entry.val !== undefined) {
            finalValue = entry.val;
        } else if (arbitraryValue) {
            if (entry.color) {
                finalValue = arbitraryValue;
            } else if (entry.fn) {
                // [Jquan 架构级修复] 向所有 fn 传递 isArbitrary = true，防止像 grid-cols 这种属性被错误地强制套用公式
                finalValue = entry.fn(arbitraryValue, true);
            } else {
                finalValue = arbitraryValue;
            }
        } else if (entry.color && valueKey) {
            const colorVal = resolveColor(valueKey);
            if (colorVal) {
                finalValue = colorVal;
            } else {
                // [Jquan 智能修正] 如果是 border-{width} 或 border-{side}-{width} 被误认为是 color，在这里修正回来
                const isBorderWidth = /^(border(-[trblxys e]+)?)$/.test(bestPrefix);
                if (isBorderWidth && borders[valueKey]) {
                    const sideMap = { 'border': 'border-width', 'border-t': 'border-top-width', 'border-r': 'border-right-width', 'border-b': 'border-bottom-width', 'border-l': 'border-left-width', 'border-x': ['border-left-width', 'border-right-width'], 'border-y': ['border-top-width', 'border-bottom-width'], 'border-s': 'border-inline-start-width', 'border-e': 'border-inline-end-width' };
                    entry = { css: sideMap[bestPrefix], scale: borders };
                    finalValue = borders[valueKey];
                }
            }
        } else if (entry.fn && valueKey) {
            // 🚀 Jquan v10.1.0 架构修复: 同时探查 scale 和 values 映射池！
            // 解决 rotate-6 和 scale-110 遗漏映射问题，杜绝恐怖的 110倍放大 或 语法失效！
            let mappedVal = null;
            if (entry.scale && entry.scale[valueKey] !== undefined) mappedVal = entry.scale[valueKey];
            else if (entry.values && entry.values[valueKey] !== undefined) mappedVal = entry.values[valueKey];
            
            finalValue = entry.fn(mappedVal !== null ? mappedVal : valueKey);
        } else if (entry.values && valueKey) {
            finalValue = entry.values[valueKey];
        } else if (entry.scale && valueKey) {
            finalValue = entry.scale[valueKey];
        }

        // 🚀 Jquan v10.0.3 终极补丁：智能分离 ring 的【宽度】与【颜色】
        // 当引擎读到 ring-blue-500 时，在 widths 里查不到 'blue-500' 的尺寸，它就会在这里自动降维，被作为“颜色”捕获！
        if ((finalValue === undefined || finalValue === null) && (bestPrefix === 'ring' || bestPrefix === 'ring-offset')) {
            const colorVal = resolveColor(valueKey);
            if (colorVal) {
                entry = { css: bestPrefix === 'ring' ? '--jquan-ring-color' : '--jquan-ring-offset-color', color: true };
                finalValue = colorVal;
            }
        }

        if (finalValue === undefined || finalValue === null) return null;

        if (finalValue === undefined || finalValue === null) return null;

        if (isNegative && typeof finalValue === 'string') {
            if (finalValue.match(/^[0-9]/)) {
                finalValue = '-' + finalValue;
            } else if (finalValue.startsWith('-')) {
                finalValue = finalValue.slice(1);
            }
        }

        // 🚀 Jquan V3.8: 显式全量滤镜组装 (The Explicit Optics Interceptor)
        // 抛弃容易引起作用域混淆的中间变量，直接将滤镜管道展开并拼装，带来极致的开发者调试体验！
        let filterAppend = '';
        const cssPropsArr = Array.isArray(entry.css) ? entry.css : [entry.css];
        
        if (cssPropsArr.some(p => p.startsWith('--jquan-') && ['blur', 'brightness', 'contrast', 'drop-shadow', 'grayscale', 'hue-rotate', 'invert', 'saturate', 'sepia'].includes(p.replace('--jquan-', '')))) {
            // 显式全量挂载光学滤镜管道
            const filterStr = 'var(--jquan-blur) var(--jquan-brightness) var(--jquan-contrast) var(--jquan-grayscale) var(--jquan-hue-rotate) var(--jquan-invert) var(--jquan-saturate) var(--jquan-sepia) var(--jquan-drop-shadow)';
            filterAppend = isImportant ? ` filter: ${filterStr} !important;` : ` filter: ${filterStr};`;
        } else if (cssPropsArr.some(p => p.startsWith('--jquan-backdrop-'))) {
            // 显式全量挂载背景毛玻璃滤镜管道
            const backdropStr = 'var(--jquan-backdrop-blur) var(--jquan-backdrop-brightness) var(--jquan-backdrop-contrast) var(--jquan-backdrop-grayscale) var(--jquan-backdrop-hue-rotate) var(--jquan-backdrop-invert) var(--jquan-backdrop-opacity) var(--jquan-backdrop-saturate) var(--jquan-backdrop-sepia)';
            filterAppend = isImportant ? ` backdrop-filter: ${backdropStr} !important; -webkit-backdrop-filter: ${backdropStr} !important;` : ` backdrop-filter: ${backdropStr}; -webkit-backdrop-filter: ${backdropStr};`;
        }

        // 无缝追加到声明块的末尾
        const declarations = buildDeclarations(entry.css, finalValue, isImportant) + filterAppend;

        let escapedClass = escapeSelector(className);
        let baseSelector = `.${escapedClass}`;

        if (entry.selector) {
            baseSelector = entry.selector.replace('&', baseSelector);
        }

        for (const variant of variantPrefixes) {
            const variantDef = variants[variant];
            
            // 1. 任意自定义变体 (例如 [nth-child(3)] 或 [&_img])
            if (!variantDef) {
                if (variant.startsWith('[') && variant.endsWith(']')) {
                    const customSelector = variant.slice(1, -1).replace(/_/g, ' ');
                    // 🚀 Jquan 核心修复: 支持包含 & 的父级/同级嵌套变体
                    selectorWraps.push(sel => customSelector.includes('&') ? customSelector.replace(/&/g, sel) : `${sel}${customSelector}`);
                }
                continue;
            }

            // 2. [Jquan v10.0.2 核心修复] 兼容字符串格式的变体定义
            if (typeof variantDef === 'string') {
                if (variantDef.includes('&')) {
                    // 处理像 '.group:hover &' 这样的高级字符串
                    selectorWraps.push(sel => variantDef.replace('&', sel));
                } else {
                    // 处理像 ':hover' 或 '::before' 这样的普通伪类
                    selectorWraps.push(sel => `${sel}${variantDef}`);
                }
                continue;
            }

            // 3. 对象格式的变体定义 (媒体查询、容器查询、自定义 selector 函数)
            if (variantDef.media) {
                mediaQueries.push(variantDef.media);
            }
            if (variantDef.container) {
                containerQueries.push(variantDef.container);
            }
            if (variantDef.selector) {
                const selectorFn = variantDef.selector;
                selectorWraps.push(sel => typeof selectorFn === 'function' ? selectorFn(sel) : selectorFn.replace('&', sel));
            }
        }

        let finalSelector = baseSelector;
        for (const wrap of selectorWraps) {
            finalSelector = wrap(finalSelector);
        }

        let cssRule = `${finalSelector} { ${declarations} }`;

        for (const mq of mediaQueries) {
            cssRule = `${mq} { ${cssRule} }`;
        }

        for (const cq of containerQueries) {
            cssRule = `${cq} { ${cssRule} }`;
        }

        return {
            className,
            css: cssRule,
            mediaQuery: mediaQueries.length > 0 ? mediaQueries : null,
        };
    }

    // =============================================
    // 9. CSS 选择器转义 (Jquan v3.7 架构级修复)
    // =============================================
    function escapeSelector(str) {
        // 1. 终极修复：处理以数字开头，或者以负号紧跟数字开头的类名
        // 例如: "2xl" -> "\32 xl", "-2xl" -> "-\32 xl"
        let escaped = str.replace(/^(-?)([0-9])/, (match, sign, digit) => {
            return `${sign}\\3${digit} `;
        });

        // 2. 原有逻辑：转义 CSS 特殊字符 (如 hover: ! [] / 等)
        escaped = escaped.replace(/([\/\[\]:!#%.@,(){}+>~=*^$|])/g, '\\$1');

        return escaped;
    }

    // =============================================
    // 10. 全局 Keyframes（动画）[Jquan 品牌化 - 内置加载器帧]
    // =============================================
    const globalKeyframes = `
@keyframes jquan-spin { to { transform: rotate(360deg); } }
@keyframes jquan-ping { 75%, 100% { transform: scale(2); opacity: 0; } }
@keyframes jquan-pulse { 50% { opacity: .5; } }
@keyframes jquan-bounce {
    0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
    50% { transform: translateY(0); animation-timing-function: cubic-bezier(0,0,0.2,1); }
}
@keyframes jquan-loader-slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
}
@keyframes jquan-loader-fill {
    0% { transform: scaleY(0); }
    100% { transform: scaleY(1); }
}
@keyframes jquan-loader-wave {
    0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
    50% { transform: scaleY(1); opacity: 1; }
}
@keyframes jquan-loader-morph {
    0% { border-radius: 20%; transform: rotate(0deg); }
    50% { border-radius: 50%; transform: rotate(180deg); }
    100% { border-radius: 20%; transform: rotate(360deg); }
}
`;

    // =============================================
    // 11. 全局 Reset / Preflight (Jquan V4.4 注入光环与阴影物理引擎)
    // =============================================
    const preflight = `
*, ::before, ::after { box-sizing: border-box; border-width: 0; border-style: solid; border-color: currentColor; }
html { line-height: 1.5; -webkit-text-size-adjust: 100%; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-feature-settings: normal; font-variation-settings: normal; -webkit-tap-highlight-color: transparent; }
body { margin: 0; line-height: inherit; }
hr { height: 0; color: inherit; border-top-width: 1px; }
abbr:where([title]) { text-decoration: underline dotted; }
a { color: inherit; text-decoration: inherit; }
b, strong { font-weight: bolder; }
code, kbd, samp, pre { font-family: ui-monospace, monospace; font-size: 1em; }
small { font-size: 80%; }
sub, sup { font-size: 75%; line-height: 0; position: relative; vertical-align: baseline; }
sub { bottom: -0.25em; }
sup { top: -0.5em; }
table { text-indent: 0; border-color: inherit; border-collapse: collapse; }
button, input, optgroup, select, textarea { font-family: inherit; font-size: 100%; font-weight: inherit; line-height: inherit; color: inherit; margin: 0; padding: 0; }
button, select { text-transform: none; }
button, [type='button'], [type='reset'], [type='submit'] { -webkit-appearance: button; background-color: transparent; background-image: none; }
:-moz-focusring { outline: auto; }
:-moz-ui-invalid { box-shadow: none; }
progress { vertical-align: baseline; }
::-webkit-inner-spin-button, ::-webkit-outer-spin-button { height: auto; }
[type='search'] { -webkit-appearance: textfield; outline-offset: -2px; }
::-webkit-search-decoration { -webkit-appearance: none; }
::-webkit-file-upload-button { -webkit-appearance: button; font: inherit; }
summary { display: list-item; }
blockquote, dl, dd, h1, h2, h3, h4, h5, h6, hr, figure, p, pre { margin: 0; }
fieldset { margin: 0; padding: 0; }
legend { padding: 0; }
ol, ul, menu { list-style: none; margin: 0; padding: 0; }
dialog { padding: 0; }
textarea { resize: vertical; }
input::placeholder, textarea::placeholder { opacity: 1; color: #9ca3af; }
button, [role="button"] { cursor: pointer; }
:disabled { cursor: default; }
img, svg, video, canvas, audio, iframe, embed, object { display: block; vertical-align: middle; }
img, video { max-width: 100%; height: auto; }
[hidden] { display: none; }

/* --- JquanUI V4.3 渐变宇宙核心拼装 --- */
[class*="-gradient-to-"] { --jquan-gradient-from: transparent; --jquan-gradient-to: transparent; --jquan-gradient-stops: var(--jquan-gradient-from), var(--jquan-gradient-to); }
[class*="via-"] { --jquan-gradient-stops: var(--jquan-gradient-from), var(--jquan-gradient-via), var(--jquan-gradient-to); }
[class*="border-gradient-to-"] { position: relative; border-color: transparent !important; }
[class*="border-gradient-to-"]::after { content: ""; position: absolute; inset: -2px; border-radius: inherit; padding: 2px; background: var(--jquan-border-gradient); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
[class*="ring-gradient-to-"] { position: relative; }
[class*="ring-gradient-to-"]::before { content: ""; position: absolute; inset: calc(-1 * var(--ring-width, 4px)); border-radius: inherit; background: var(--jquan-ring-gradient); z-index: -2; pointer-events: none; filter: blur(2px); opacity: 0.8; }

/* --- 🚀 JquanUI V4.4 阴影与光环物理重组引擎 --- */
*, ::before, ::after {
    /* 1. 初始化所有默认变量，防止空值导致 CSS 语法崩溃 */
    --jquan-ring-inset: ;
    --jquan-ring-offset-width: 0px;
    --jquan-ring-offset-color: #fff;
    --jquan-ring-color: rgb(59 130 246 / 0.5); /* 默认 Tailwind 蓝色光环 */
    --jquan-ring-offset-shadow: 0 0 #0000;
    --jquan-ring-shadow: 0 0 #0000;
    --jquan-shadow: 0 0 #0000;
}

/* 2. 只要类名里包含 ring 或 shadow，立即启动三层阴影动态计算引擎！ */
[class*="ring"], [class*="shadow"] {
    --jquan-ring-offset-shadow: var(--jquan-ring-inset) 0 0 0 var(--jquan-ring-offset-width) var(--jquan-ring-offset-color);
    --jquan-ring-shadow: var(--jquan-ring-inset) 0 0 0 calc(var(--jquan-ring-width, 0px) + var(--jquan-ring-offset-width)) var(--jquan-ring-color);
    /* 核心：将偏移层、主环层、常规阴影层完美重叠！ */
    box-shadow: var(--jquan-ring-offset-shadow), var(--jquan-ring-shadow), var(--jquan-shadow) !important;
}
`;

        // =============================================
    // 12. CSS 变量初始化 [Jquan 优化全部前缀为 jquan]
    // =============================================
    const cssVariablesInit = `
:root {
    --jquan-ring-inset: ;
    --jquan-ring-offset-width: 0px;
    --jquan-ring-offset-color: #fff;
    --jquan-ring-color: rgb(59 130 246 / 0.5);
    --jquan-ring-shadow: 0 0 #0000;
    --jquan-shadow: 0 0 #0000;
    --jquan-shadow-color: 0 0 0;
    --jquan-scroll-snap-strictness: proximity;
    --jquan-border-spacing-x: 0;
    --jquan-border-spacing-y: 0;
    --jquan-translate-x: 0;
    --jquan-translate-y: 0;
    --jquan-rotate: 0;
    --jquan-skew-x: 0;
    --jquan-skew-y: 0;
    --jquan-scale-x: 1;
    --jquan-scale-y: 1;
    --jquan-gradient-from: transparent;
    --jquan-gradient-to: transparent;
    --jquan-gradient-stops: var(--jquan-gradient-from), var(--jquan-gradient-to);
    --jquan-space-x-reverse: 0;
    --jquan-space-y-reverse: 0;
    --jquan-divide-x-reverse: 0;
    --jquan-divide-y-reverse: 0;
    --jquan-blur: ;
    --jquan-brightness: ;
    --jquan-contrast: ;
    --jquan-grayscale: ;
    --jquan-hue-rotate: ;
    --jquan-invert: ;
    --jquan-saturate: ;
    --jquan-sepia: ;
    --jquan-drop-shadow: ;
    --jquan-backdrop-blur: ;
    --jquan-backdrop-brightness: ;
    --jquan-backdrop-contrast: ;
    --jquan-backdrop-grayscale: ;
    --jquan-backdrop-hue-rotate: ;
    --jquan-backdrop-invert: ;
    --jquan-backdrop-opacity: ;
    --jquan-backdrop-saturate: ;
    --jquan-backdrop-sepia: ;
    
    /* 🚀 Jquan V3.7: 滤镜复合总线管道，用于智能隐式挂载！ */
    --jquan-filter: var(--jquan-blur) var(--jquan-brightness) var(--jquan-contrast) var(--jquan-grayscale) var(--jquan-hue-rotate) var(--jquan-invert) var(--jquan-saturate) var(--jquan-sepia) var(--jquan-drop-shadow);
    --jquan-backdrop-filter: var(--jquan-backdrop-blur) var(--jquan-backdrop-brightness) var(--jquan-backdrop-contrast) var(--jquan-backdrop-grayscale) var(--jquan-backdrop-hue-rotate) var(--jquan-backdrop-invert) var(--jquan-backdrop-opacity) var(--jquan-backdrop-saturate) var(--jquan-backdrop-sepia);
}
`;

    // =============================================
    // 13. O(1) 极致性能样式注入 (CSSOM API)
    // =============================================
    const styleEl = document.createElement('style');
    styleEl.id = 'jquan-css-runtime';
    document.head.appendChild(styleEl);

    const processedClasses = new Set();
    let sheetInitialized = false;
    function injectBase() {
        if (sheetInitialized) return;
        sheetInitialized = true;
        
        // [Jquan 架构修复] 确保在第一次注入样式前，已经完整挂载了用户的配置！
        initConfig();
        
        // 拼接基础预设与语义化变量
        const baseCSS = preflight + cssVariablesInit + generateThemeVariables() + globalKeyframes;
        styleEl.textContent = baseCSS;
    }

    function extractClasses(root) {
        const allClasses = new Set();
        const elements = root.querySelectorAll('[class]');
        elements.forEach(el => {
            el.classList.forEach(cls => allClasses.add(cls));
        });
        if (root.classList) {
            root.classList.forEach(cls => allClasses.add(cls));
        }
        return allClasses;
    }

    function compileAndInject(classes) {
        if (!styleEl.sheet) return; // 确保表已挂载
        
        const sheet = styleEl.sheet;

        classes.forEach(cls => {
            if (processedClasses.has(cls)) return;
            processedClasses.add(cls);

            const result = resolveUtility(cls);
            if (result && result.css) {
                try {
                    // [Jquan 极致性能优化] 直接对 CSSOM 进行 insertRule 操作
                    sheet.insertRule(result.css, sheet.cssRules.length);
                } catch (e) {
                    // console.warn(`[JquanUI] Rule insertion failed: ${result.css}`, e);
                }
            }
        });
    }

    function fullScan() {
        injectBase();
        const classes = extractClasses(document.documentElement);
        compileAndInject(classes);
    }

    // =============================================
    // 14. MutationObserver 实时监听
    // =============================================
    let observer = null;
    let rafId = null;
    let pendingNodes = new Set();

    function scheduleScan() {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            const classes = new Set();
            pendingNodes.forEach(node => {
                if (node.classList) {
                    node.classList.forEach(cls => classes.add(cls));
                }
                if (node.querySelectorAll) {
                    node.querySelectorAll('[class]').forEach(el => {
                        el.classList.forEach(cls => classes.add(cls));
                    });
                }
            });
            pendingNodes.clear();
            compileAndInject(classes);
        });
    }

    function startObserver() {
        if (observer) return;

        observer = new MutationObserver(mutations => {
            let needsScan = false;

            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    pendingNodes.add(mutation.target);
                    needsScan = true;
                }
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element
                            pendingNodes.add(node);
                            needsScan = true;
                        }
                    });
                }
            }

            if (needsScan) {
                scheduleScan();
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class'],
        });
    }

    function stopObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    // =============================================
    // 15. 初始化执行
    // =============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            fullScan();
            startObserver();
        });
    } else {
        fullScan();
        startObserver();
    }

    // =============================================
    // §16. 暴露公共 API (Jquan 安全暴露模式)
    // =============================================
    window.JquanUI = window.JquanUI || {};
    
    Object.assign(window.JquanUI, {
        scan: fullScan,
        compile(classNames) {
            if (typeof classNames === 'string') {
                classNames = classNames.split(/\s+/).filter(Boolean);
            }
            injectBase();
            compileAndInject(new Set(classNames));
        },
        getProcessedClasses() {
            return new Set(processedClasses);
        },
        stop: stopObserver,
        start: startObserver,
        resolve: resolveUtility,
        resolveColor,
        addUtility(name, def) {
            dictionary[name] = def;
        },
        addColor(name, value) {
            colors[name] = value;
        },
        addVariant(name, def) {
            variants[name] = def;
        },
        addBreakpoint(name, minWidth) {
            variants[name] = { media: `@media (min-width: ${minWidth})` };
        },
        version: '3.6 (The Architect Edition - Native Loaders)',
        // [Jquan 优化] 使用 runtimeConfig 暴露引擎内部最终合并的配置，避免覆盖用户原始 config
        runtimeConfig: {
            colors,
            spacing,
            breakpoints: Object.fromEntries(
                Object.entries(variants).filter(([, v]) => v.media && v.media.includes('min-width'))
            ),
        }
    });

    // =============================================
    // 17. 支持 <script> 标签上的 data 属性配置
    // =============================================
    (function autoConfig() {
        const scriptTag = document.currentScript || document.querySelector('script[data-jquan-css]');
        if (!scriptTag) return;

        const darkMode = scriptTag.getAttribute('data-dark-mode');
        if (darkMode === 'media') {
            variants['dark'] = { media: '@media (prefers-color-scheme: dark)' };
        }

        const prefix = scriptTag.getAttribute('data-prefix');
        if (prefix) {
            const newDict = {};
            for (const [key, val] of Object.entries(dictionary)) {
                newDict[prefix + key] = val;
            }
            Object.assign(dictionary, newDict);
        }
    })();

    // =============================================
    // 18. Jquan 专属启动日志
    // =============================================
    if (typeof console !== 'undefined') {
        console.log(
            '%c⚡ JquanUI Runtime v3.6 %c Enterprise Native Loaders Loaded %c ! ',
            'background: #4f46e5; color: white; padding: 3px 8px; border-radius: 4px 0 0 4px; font-weight: bold;',
            'background: #1e1b4b; color: #c7d2fe; padding: 3px 8px; font-weight: normal;',
            'background: #e11d48; color: white; padding: 3px 6px; border-radius: 0 4px 4px 0; font-weight: bold;'
        );
    }

})();