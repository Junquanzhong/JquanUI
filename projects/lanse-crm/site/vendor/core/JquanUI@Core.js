// I LOVE CODING
// 🚀 JquanUI Runtime Atomic CSS Engine - 全量生产级架构版 (The Architect Edition)
// 全量 CSS 字典无删减 | 极致性能 CSSOM 注入 | 语义化主题系统 | 原生加载器引擎

(function () {

    const ENGINE_VERSION = '4.70.0';
    const CACHE_KEY = `jquan_runtime_cache_v${ENGINE_VERSION}`;
    const MAX_RUNTIME_RULES = 3000;
    const MAX_CACHE_BYTES = 1500000;

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

    function hexToRgbChannels(hex) {
        if (typeof hex !== 'string' || !/^#[0-9a-fA-F]{3,8}$/.test(hex)) return null;
        let value = hex.slice(1);
        if (value.length === 3 || value.length === 4) value = [...value].map(c => c + c).join('');
        if (value.length !== 6 && value.length !== 8) return null;
        return `${parseInt(value.slice(0, 2), 16)} ${parseInt(value.slice(2, 4), 16)} ${parseInt(value.slice(4, 6), 16)}`;
    }

    // 🛡️ Jquan v4.62 —— CSS 注入防线
    // 任意值（arbitrary value）来自 class 属性，可能由用户输入拼接而来。
    // 一旦允许 `}` / 顶层 `;` 逃逸，攻击者即可闭合当前规则块并注入任意选择器，
    // 配合 url() 还能做数据外泄。此处以词法级校验做第一道闸，insertRule 是第二道闸。
    function decodeCssEscapes(value) {
        return String(value == null ? '' : value).replace(/\\([0-9a-fA-F]{1,6})(?:[ \t\r\n])?/g, (_, hex) => {
            const codePoint = Number.parseInt(hex, 16);
            return codePoint > 0 && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : '';
        });
    }

    function hasUnsafeLegacyCssSyntax(value) {
        const normalized = decodeCssEscapes(value);
        return /(?:expression\s*\(|(?:^|[\s;(])(?:-moz-binding|behavior|-ms-behavior)\s*:|(?:^|[\s(])javascript\s*:)/i.test(normalized);
    }

    function isSafeArbitraryValue(value) {
        const src = String(value == null ? '' : value);
        if (!src) return true;
        if (hasUnsafeLegacyCssSyntax(src)) return false;
        if (/@(?:import|charset|namespace|use)\b/i.test(decodeCssEscapes(src))) return false;
        if (/<\s*\/?\s*(?:style|script|iframe)/i.test(src)) return false;
        if (src.includes('/*') || src.includes('*/')) return false;
        let quote = '';
        let escaped = false;
        let paren = 0;
        let bracket = 0;
        for (const char of src) {
            if (quote) {
                if (escaped) escaped = false;
                else if (char === '\\') escaped = true;
                else if (char === quote) quote = '';
                continue;
            }
            if (char === '"' || char === "'") { quote = char; continue; }
            if (char === '(') { paren++; continue; }
            if (char === ')') { paren--; if (paren < 0) return false; continue; }
            if (char === '[') { bracket++; continue; }
            if (char === ']') { bracket--; if (bracket < 0) return false; continue; }
            if (char === '{' || char === '}') return false;
            if (char === ';' && paren === 0 && bracket === 0) return false;
        }
        return quote === '' && paren === 0 && bracket === 0;
    }

    // 任意选择器/条件片段（[&>*]:、has-[...]、supports-[...] 等）的安全校验
    function isSafeArbitraryFragment(fragment) {
        const src = String(fragment == null ? '' : fragment);
        if (/[{};]/.test(src)) return false;
        if (src.includes('/*') || src.includes('*/')) return false;
        if (/<\s*\/?\s*(?:style|script|iframe)/i.test(src)) return false;
        if (hasUnsafeLegacyCssSyntax(src)) return false;
        if (/@(?:import|charset|namespace|use)\b/i.test(decodeCssEscapes(src))) return false;
        return true;
    }

    function isSafeArbitraryProperty(property) {
        return !/^(?:-moz-binding|behavior|-ms-behavior)$/i.test(String(property || '').trim());
    }

    // CSS 具名颜色全集 —— 用于任意值类型判定（区分 text-[red] 与 text-[10px]）
    const NAMED_CSS_COLORS = new Set(('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue ' +
        'blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue ' +
        'darkcyan darkgoldenrod darkgray darkgrey darkgreen darkkhaki darkmagenta darkolivegreen darkorange darkorchid ' +
        'darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink ' +
        'deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold ' +
        'goldenrod gray grey green greenyellow honeydew hotpink indianred indigo ivory khaki lavender lavenderblush ' +
        'lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgrey lightgreen ' +
        'lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime ' +
        'limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen ' +
        'mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin ' +
        'navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise ' +
        'palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue ' +
        'saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow ' +
        'springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen ' +
        'transparent currentcolor canvas canvastext linktext visitedtext activetext buttonface buttontext buttonborder ' +
        'field fieldtext highlight highlighttext selecteditem selecteditemtext mark marktext graytext accentcolor ' +
        'accentcolortext').split(' '));

    // 归一化 alpha 修饰符：/50 → 50%，/[0.63] → 63%，/[13%] → 13%
    function normalizeAlphaModifier(alphaValue) {
        let raw = String(alphaValue == null ? '' : alphaValue).trim();
        if (!raw) return null;
        if (raw.startsWith('[') && raw.endsWith(']')) {
            raw = raw.slice(1, -1).replace(/_/g, ' ').trim();
            if (!raw) return null;
            if (raw.endsWith('%')) {
                const percent = Number.parseFloat(raw);
                return Number.isFinite(percent) && percent >= 0 && percent <= 100 ? percent : null;
            }
            const fraction = Number.parseFloat(raw);
            if (!Number.isFinite(fraction) || fraction < 0 || fraction > 1 || !/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(raw)) return null;
            return Number((fraction * 100).toFixed(4));
        }
        if (raw.endsWith('%')) raw = raw.slice(0, -1);
        const percent = Number.parseFloat(raw);
        return Number.isFinite(percent) && percent >= 0 && percent <= 100 ? percent : null;
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

    const maxWidthSpacing = Object.assign({}, spacing, {
        'xs': '20rem', 'sm': '24rem', 'md': '28rem', 'lg': '32rem', 'xl': '36rem',
        '2xl': '42rem', '3xl': '48rem', '4xl': '56rem', '5xl': '64rem', '6xl': '72rem',
        '7xl': '80rem', 'prose': '65ch', 'none': 'none'
    });

    const safeAreaOffsetScale = Object.fromEntries([
        ['DEFAULT', '0px'],
        ...Object.entries(spacing).filter(([, value]) => /^-?(?:\d+|\d*\.\d+)(?:px|rem)$/.test(value))
    ]);
    const safeAreaValue = (side, offset = '0px') => {
        const inset = `env(safe-area-inset-${side}, 0px)`;
        return offset === '0px' ? inset : `calc(${inset} + ${offset})`;
    };
    const safeAreaValues = (sides, offset) => sides.map(side => safeAreaValue(side, offset)).join('; ');

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
    const standardContainerSizes = new Set([...Object.keys(containers), ...Object.keys(breakpoints)]);
    const transformCompose = 'translateX(var(--jquan-translate-x,0)) translateY(var(--jquan-translate-y,0)) rotateX(var(--jquan-rotate-x,0)) rotateY(var(--jquan-rotate-y,0)) rotateZ(var(--jquan-rotate-z,var(--jquan-rotate,0))) skewX(var(--jquan-skew-x,0)) skewY(var(--jquan-skew-y,0)) scaleX(var(--jquan-scale-x,1)) scaleY(var(--jquan-scale-y,1))';
    const transformComposeGpu = 'translate3d(var(--jquan-translate-x,0), var(--jquan-translate-y,0), var(--jquan-translate-z,0)) rotateX(var(--jquan-rotate-x,0)) rotateY(var(--jquan-rotate-y,0)) rotateZ(var(--jquan-rotate-z,var(--jquan-rotate,0))) skewX(var(--jquan-skew-x,0)) skewY(var(--jquan-skew-y,0)) scaleX(var(--jquan-scale-x,1)) scaleY(var(--jquan-scale-y,1))';
    const normalizeAngleValue = v => /^-?(?:\d+|\d*\.\d+)$/.test(String(v).trim()) ? `${v}deg` : v;
    const isSafeFluidCSSValue = value => {
        const normalized = String(value ?? '').trim();
        return normalized && !/[{};\r\n]/.test(normalized) ? normalized : null;
    };
    const normalizeFluidValue = value => {
        if (typeof value === 'string') {
            const normalized = isSafeFluidCSSValue(value);
            return normalized && /^clamp\(.+\)$/i.test(normalized) ? normalized : null;
        }
        const parts = Array.isArray(value)
            ? (value.length === 3 ? value : null)
            : (value && typeof value === 'object' ? [value.min, value.preferred, value.max] : null);
        if (!parts) return null;
        const normalized = parts.map(isSafeFluidCSSValue);
        return normalized.every(Boolean) ? `clamp(${normalized.join(', ')})` : null;
    };
    const buildContainerRule = selector => [
        `${selector} { width: 100%; }`,
        ...Object.values(breakpoints).map(width => `@media (min-width: ${width}) { ${selector} { max-width: ${width}; } }`)
    ].join('\n');
    function normalizeContainerName(value) {
        const name = String(value == null ? '' : value).trim();
        return /^[A-Za-z_][A-Za-z0-9_-]*$/.test(name) ? name : null;
    }

    function normalizeContainerCondition(value) {
        const candidate = String(value == null ? '' : value).trim();
        const bracketed = candidate.startsWith('[') && candidate.endsWith(']');
        const condition = bracketed ? candidate.slice(1, -1).replace(/_/g, ' ').trim() : candidate;
        if (!condition || !isSafeArbitraryFragment(condition)) return null;
        if (!bracketed) {
            const width = containers[condition] || breakpoints[condition];
            return width && isSafeArbitraryFragment(width) ? `min-width: ${width}` : null;
        }
        return /^(?:(?:min|max)-(?:width|height)\s*:|(?:width|height)\s*(?:[<>]=?|=))/i.test(condition)
            ? condition
            : `min-width: ${condition}`;
    }

    function isExplicitContainerCondition(value) {
        const source = String(value == null ? '' : value).trim();
        if (!source.startsWith('[') || !source.endsWith(']')) return false;
        const condition = source.slice(1, -1).replace(/_/g, ' ').trim();
        return !!condition && isSafeArbitraryFragment(condition);
    }

    function buildContainerQuery(size, name = '') {
        const condition = normalizeContainerCondition(size);
        if (!condition) return null;
        const containerName = name ? normalizeContainerName(name) : '';
        if (name && !containerName) return null;
        return `@container ${containerName ? `${containerName} ` : ''}(${condition})`;
    }

    function resolveContainerVariant(variant) {
        if (!variant.startsWith('@')) return null;
        const source = variant.slice(1);
        if (!source) return { invalid: true };
        if (source.startsWith('[') && source.endsWith(']')) {
            const query = buildContainerQuery(source);
            return query ? { container: query } : { invalid: true };
        }
        const slashAt = findTopLevelSlash(source);
        if (slashAt < 0) {
            const query = buildContainerQuery(source);
            return query ? { container: query } : { invalid: true };
        }
        const left = source.slice(0, slashAt);
        const right = source.slice(slashAt + 1);
        const leftIsCondition = isExplicitContainerCondition(left);
        const rightIsCondition = isExplicitContainerCondition(right);
        if (leftIsCondition && !rightIsCondition) {
            const query = buildContainerQuery(left, right);
            return query ? { container: query } : { invalid: true };
        }
        if (rightIsCondition && !leftIsCondition) {
            const query = buildContainerQuery(right, left);
            return query ? { container: query } : { invalid: true };
        }
        const leftAsSize = normalizeContainerCondition(left);
        const rightAsSize = normalizeContainerCondition(right);
        let query = null;
        if (leftAsSize && (!rightAsSize || (standardContainerSizes.has(left) && !standardContainerSizes.has(right)))) {
            query = buildContainerQuery(left, right);
        } else if (rightAsSize && (!leftAsSize || (standardContainerSizes.has(right) && !standardContainerSizes.has(left)))) {
            query = buildContainerQuery(right, left);
        } else if (leftAsSize && rightAsSize) {
            // 当两个自定义词都能解析为阈值时，尺寸在前的推荐语法优先。
            query = buildContainerQuery(left, right);
        }
        return query ? { container: query } : { invalid: true };
    }
    const hasVariantAliases = {
        checked: ':checked',
        disabled: ':disabled',
        enabled: ':enabled',
        focus: ':focus',
        hover: ':hover',
        invalid: ':invalid',
        valid: ':valid',
        required: ':required',
        optional: ':optional',
        selected: ':checked',
        open: '[open]'
    };

    function normalizeHasCondition(value) {
        if (!value) return '*';
        if (value.startsWith('[') && value.endsWith(']')) {
            const inner = value.slice(1, -1).replace(/_/g, ' ');
            return isSafeArbitraryFragment(inner) ? inner : null;
        }
        return hasVariantAliases[value] || (isSafeArbitraryFragment(value) ? value : null);
    }

    function unwrapVariantValue(value) {
        if (value.startsWith('[') && value.endsWith(']')) {
            const inner = value.slice(1, -1).replace(/_/g, ' ');
            return isSafeArbitraryFragment(inner) ? inner : null;
        }
        return isSafeArbitraryFragment(value) ? value : null;
    }

    function normalizeLanguageRange(value) {
        const language = String(value == null ? '' : value).trim();
        return /^[a-z0-9*-]+$/i.test(language) ? language : null;
    }

    function normalizeArbitraryAtRule(value) {
        const normalized = value.replace(/_/g, ' ');
        if (!isSafeArbitraryFragment(normalized)) return null;
        const functionalMatch = normalized.match(/^@([a-z-]+)\((.*)\)$/i);
        return functionalMatch ? `@${functionalMatch[1]} (${functionalMatch[2]})` : normalized;
    }

    function resolveDynamicVariant(variant) {
        if (variant === '*') return { selector: '& > *' };
        if (variant === '**') return { selector: '& *' };
        const attributeVariant = (prefix, mode) => {
            if (!variant.startsWith(prefix)) return null;
            const rawCondition = variant.slice(prefix.length);
            if (!rawCondition) return null;
            const bracketed = rawCondition.startsWith('[') && rawCondition.endsWith(']');
            const condition = bracketed
                ? rawCondition.slice(1, -1).replace(/_/g, ' ')
                : `${rawCondition}${mode === 'aria' ? '="true"' : ''}`;
            // 🛡️ v4.62：属性条件同样来自 class 字符串，需拦截选择器逃逸
            if (!isSafeArbitraryFragment(condition) || condition.includes(']')) return { invalid: true };
            const attribute = `[${mode}-${condition}]`;
            if (prefix.startsWith('group-')) return { selector: `.group${attribute} &` };
            if (prefix.startsWith('peer-')) return { selector: `.peer${attribute} ~ &` };
            return { selector: `&${attribute}` };
        };
        const attributeResult = attributeVariant('group-aria-', 'aria')
            || attributeVariant('peer-aria-', 'aria')
            || attributeVariant('group-data-', 'data')
            || attributeVariant('peer-data-', 'data')
            || attributeVariant('aria-', 'aria')
            || attributeVariant('data-', 'data');
        if (attributeResult) return attributeResult;
        if (variant.startsWith('has-')) {
            const condition = normalizeHasCondition(variant.slice(4));
            return condition ? { selector: `&:has(${condition})` } : { invalid: true };
        }
        if (variant.startsWith('group-has-')) {
            const condition = normalizeHasCondition(variant.slice(10));
            return condition ? { selector: `.group:has(${condition}) &` } : { invalid: true };
        }
        if (variant.startsWith('peer-has-')) {
            const condition = normalizeHasCondition(variant.slice(9));
            return condition ? { selector: `.peer:has(${condition}) ~ &` } : { invalid: true };
        }
        if (variant.startsWith('max-') || variant.startsWith('min-')) {
            const mode = variant.startsWith('max-') ? 'max' : 'min';
            const rawSize = variant.slice(4);
            const size = unwrapVariantValue(rawSize);
            const width = size === null ? null : (breakpoints[size] || (rawSize.startsWith('[') && rawSize.endsWith(']') ? size : null));
            if (width) return { media: mode === 'max' ? `@media (width < ${width})` : `@media (width >= ${width})` };
        }
        if (variant.startsWith('supports-[') && variant.endsWith(']')) {
            const condition = unwrapVariantValue(variant.slice(9));
            return condition ? { atRule: `@supports (${condition})` } : { invalid: true };
        }
        if (variant.startsWith('media-[') && variant.endsWith(']')) {
            const condition = unwrapVariantValue(variant.slice(6));
            return condition ? { atRule: `@media (${condition})` } : { invalid: true };
        }
        if (variant.startsWith('not-lang-') || variant.startsWith('lang-')) {
            const negated = variant.startsWith('not-lang-');
            const rawLanguage = variant.slice(negated ? 9 : 5);
            if (rawLanguage) {
                const language = normalizeLanguageRange(unwrapVariantValue(rawLanguage));
                if (language) return { selector: negated ? `&:not(:lang(${language}))` : `&:lang(${language})` };
                return { invalid: true };
            }
        }
        if (variant.startsWith('[') && variant.endsWith(']')) {
            const arbitraryVariant = variant.slice(1, -1);
            if (arbitraryVariant.startsWith('@')) {
                const atRule = normalizeArbitraryAtRule(arbitraryVariant);
                return atRule ? { atRule } : { invalid: true };
            }
        }
        return null;
    }

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
        'user-valid': ':user-valid', 'user-invalid': ':user-invalid',
        'open': ':is([open], :popover-open)', 'details-open': '[open]',
        'popover-open': ':popover-open', 'modal': ':modal', 'inert': '[inert]',
        // 伪元素
        'before': '::before', 'after': '::after',
        'placeholder': '::placeholder', 'selection': '::selection',
        'marker': '::marker', 'file': '::file-selector-button',
        'first-line': '::first-line', 'first-letter': '::first-letter',
        'backdrop': '::backdrop',
        'scrollbar': '::-webkit-scrollbar',
        'scrollbar-track': '::-webkit-scrollbar-track',
        'scrollbar-thumb': '::-webkit-scrollbar-thumb',
        'scrollbar-corner': '::-webkit-scrollbar-corner',
        // 群组/关联
        'group-hover': '.group:hover &', 'group-focus': '.group:focus &',
        'group-active': '.group:active &', 'group-visited': '.group:visited &',
        'peer-checked': '.peer:checked ~ &', 'peer-focus': '.peer:focus ~ &',
        'peer-hover': '.peer:hover ~ &', 'peer-disabled': '.peer:disabled ~ &',
        'peer-invalid': '.peer:invalid ~ &', 'peer-placeholder-shown': '.peer:placeholder-shown ~ &',
        // 媒体查询 / 暗色策略
        'dark': { selector: '.dark &', fallbackSelector: ':root:not(.light) &', fallbackMedia: '@media (prefers-color-scheme: dark)' },
        'dark-media': '@media (prefers-color-scheme: dark)',
        'light': '@media (prefers-color-scheme: light)',
        'print': '@media print',
        'motion-safe': '@media (prefers-reduced-motion: no-preference)',
        'motion-reduce': '@media (prefers-reduced-motion: reduce)',
        'contrast-more': '@media (prefers-contrast: more)',
        'contrast-less': '@media (prefers-contrast: less)',
        'landscape': '@media (orientation: landscape)',
        'portrait': '@media (orientation: portrait)',
        'hover-hover': '@media (hover: hover)',
        'hover-none': '@media (hover: none)',
        'any-hover-hover': '@media (any-hover: hover)',
        'any-hover-none': '@media (any-hover: none)',
        'pointer-fine': '@media (pointer: fine)',
        'pointer-coarse': '@media (pointer: coarse)',
        'pointer-none': '@media (pointer: none)',
        'any-pointer-fine': '@media (any-pointer: fine)',
        'any-pointer-coarse': '@media (any-pointer: coarse)',
        'forced-colors': '@media (forced-colors: active)',
        'transparency-reduce': '@media (prefers-reduced-transparency: reduce)',
        'starting': { atRule: '@starting-style' },
        // 方向
        'ltr': '[dir="ltr"] &', 'rtl': '[dir="rtl"] &',
        // 支持 dark 类名模式
        'dark-class': '.dark &'
    };
    for (const size of Object.keys(containers)) variants[`@${size}`] = { container: buildContainerQuery(size) };

    // ==========================================
    // §5. 主题配置注入与 0ms 动态主题引擎 (The Variables Switcher)
    // ==========================================
    let colors = JSON.parse(JSON.stringify(baseColors));
    let semanticThemes = {};
    let activeThemeName = 'default';
    let configInitialized = false;
    let debugConflictTracking = false;
    let cascadeLayersEnabled = false;
    let runtimeBooted = false;
    let lateConfigApplied = false;
    let customKeyframesCSS = '';
    let bridgedConfig = window.JQUAN_CONFIG;
    const acceptsLateConfig = !(window.JquanUI && window.JquanUI.config) && !bridgedConfig;

    function installLateConfigBridge() {
        const descriptor = Object.getOwnPropertyDescriptor(window, 'JQUAN_CONFIG');
        if (descriptor && !descriptor.configurable) return;
        Object.defineProperty(window, 'JQUAN_CONFIG', {
            configurable: true,
            enumerable: true,
            get() { return bridgedConfig; },
            set(value) {
                bridgedConfig = value;
                if (runtimeBooted && acceptsLateConfig && !lateConfigApplied && value && typeof value === 'object') {
                    lateConfigApplied = true;
                    applyLateConfig();
                }
            }
        });
    }

    function parseColorToRGB(val) {
        if (!val) return val;
        if (typeof val === 'string') {
            if (val.startsWith('#')) return hexToRgb(val);
            const match = val.trim().match(/^rgba?\(([^)]+)\)$/i);
            if (match && !match[1].includes('/')) {
                const parts = match[1].includes(',')
                    ? match[1].split(',').map(part => part.trim())
                    : match[1].trim().split(/\s+/);
                if (parts.length === 3 && parts.every(part => /^-?(?:\d+|\d*\.\d+)$/.test(part))) return parts.join(' ');
            }
        }
        return val;
    }

    function isRgbChannelValue(value) {
        return typeof value === 'string' && /^[0-9.]+(?:\s*,\s*|\s+)[0-9.]+(?:\s*,\s*|\s+)[0-9.]+$/.test(value.trim());
    }

    function toCssColor(value) {
        if (typeof value !== 'string') return value;
        const normalized = hexToRgb(value.trim());
        if (isRgbChannelValue(normalized)) return `rgb(${normalized.split(/[\s,]+/).filter(Boolean).join(' ')})`;
        return normalized;
    }

    function applyColorAlpha(value, alphaValue) {
        const alpha = typeof alphaValue === 'number' ? alphaValue : normalizeAlphaModifier(alphaValue);
        if (!Number.isFinite(alpha) || alpha < 0 || alpha > 100) return null;
        const normalized = hexToRgb(value);
        if (isRgbChannelValue(normalized)) {
            const parts = normalized.split(/[\s,]+/).filter(Boolean);
            return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${Number((alpha / 100).toFixed(4))})`;
        }
        if (normalized === 'transparent' || normalized === 'inherit') return normalized;
        return `color-mix(in ${colorMixSpaceFor(normalized)}, ${toCssColor(normalized)} ${Number(alpha.toFixed(4))}%, transparent)`;
    }

    function colorMixSpaceFor(value) {
        const source = String(value || '').trim().toLowerCase();
        if (/^oklch\(/.test(source)) return 'oklch';
        if (/^oklab\(/.test(source)) return 'oklab';
        if (/^lch\(/.test(source)) return 'lch';
        if (/^lab\(/.test(source)) return 'lab';
        if (/^color\(\s*display-p3\b/.test(source)) return 'display-p3';
        if (/^color\(\s*(?:rec2020|a98-rgb|prophoto-rgb)\b/.test(source)) return source.match(/^color\(\s*([a-z0-9-]+)/)[1];
        return 'srgb';
    }

    function modernizeShadowValue(value) {
        return String(value).replace(/rgb\(var\(--jquan-shadow-color\)\s*\/\s*([0-9.]+)\)/g, (_, opacityValue) => {
            const percentage = Number.parseFloat(opacityValue) * 100;
            return `color-mix(in srgb, var(--jquan-shadow-color-css, rgb(var(--jquan-shadow-color))) ${percentage}%, transparent)`;
        });
    }

    function buildConfiguredKeyframes(keyframes) {
        if (!keyframes || typeof keyframes !== 'object') return '';
        const blocks = [];
        for (const [name, frames] of Object.entries(keyframes)) {
            if (!/^[a-zA-Z_][\w-]*$/.test(name) || !frames || typeof frames !== 'object') continue;
            const steps = [];
            for (const [step, declarations] of Object.entries(frames)) {
                if (!/^(?:(?:from|to)|(?:\d+(?:\.\d+)?%))(?:\s*,\s*(?:(?:from|to)|(?:\d+(?:\.\d+)?%)))*$/i.test(step)) continue;
                let body = '';
                if (typeof declarations === 'string') {
                    if (/[{}]/.test(declarations)) continue;
                    body = declarations.trim().replace(/;?$/, ';');
                } else if (declarations && typeof declarations === 'object') {
                    body = Object.entries(declarations).map(([property, value]) => {
                        const cssProperty = property.startsWith('--') ? property : property.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
                        if (!/^(?:--[\w-]+|[a-z-]+)$/.test(cssProperty) || /[{};]/.test(String(value))) return '';
                        return `${cssProperty}: ${value};`;
                    }).filter(Boolean).join(' ');
                }
                if (body) steps.push(`${step} { ${body} }`);
            }
            if (steps.length > 0) blocks.push(`@keyframes ${name} { ${steps.join(' ')} }`);
        }
        return blocks.join('\n');
    }

    function initConfig() {
        if (configInitialized) return;
        configInitialized = true;

        const userConfig = (window.JquanUI && window.JquanUI.config) || window.JQUAN_CONFIG || {};
        userConfig.customUtilities = userConfig.customUtilities || {};
        debugConflictTracking = !!(userConfig.debug?.trackConflicts || userConfig.diagnostics?.trackConflicts);
        cascadeLayersEnabled = userConfig.cascadeLayers === true;

        // 1. 初始化基础主题颜色
        if (userConfig.theme?.colors) {
            for (const [k, v] of Object.entries(userConfig.theme.colors)) {
                if (typeof v === 'string') colors[k] = parseColorToRGB(v);
                else if (typeof v === 'object') {
                    colors[k] = colors[k] || {};
                    for (const [shade, hex] of Object.entries(v)) colors[k][shade] = parseColorToRGB(hex);
                }
            }
        }
        if (userConfig.theme?.extend?.colors) {
            for (const [k, v] of Object.entries(userConfig.theme.extend.colors)) {
                if (typeof v === 'string') colors[k] = parseColorToRGB(v);
                else if (typeof v === 'object') {
                    colors[k] = colors[k] || {};
                    for (const [shade, colorVal] of Object.entries(v)) colors[k][shade] = parseColorToRGB(colorVal);
                }
            }
        }

        // 2. 初始化排版与断点
        if (userConfig.theme?.extend?.fontFamily) {
            for (const [k, v] of Object.entries(userConfig.theme.extend.fontFamily)) {
                const fontStr = Array.isArray(v) ? v.map(f => (f.includes(' ') && !f.includes('"') && !f.includes("'")) ? `"${f}"` : f).join(', ') : v;
                userConfig.customUtilities[`font-${k}`] = { css: 'font-family', val: fontStr };
            }
        }
        if (userConfig.theme?.extend?.spacing) Object.assign(spacing, userConfig.theme.extend.spacing);
        const configuredContainers = Object.assign({}, userConfig.theme?.containers || {}, userConfig.theme?.extend?.containers || {});
        for (const [name, threshold] of Object.entries(configuredContainers)) {
            if (normalizeContainerName(name) && typeof threshold === 'string' && isSafeArbitraryFragment(threshold)) containers[name] = threshold.trim();
        }
        const baseFluid = userConfig.theme?.fluid || {};
        const extendedFluid = userConfig.theme?.extend?.fluid || {};
        const fluidSpacing = Object.assign({}, baseFluid.spacing || {}, extendedFluid.spacing || {});
        for (const [name, value] of Object.entries(fluidSpacing)) {
            if (!/^[a-zA-Z][\w-]*$/.test(name)) continue;
            const fluidValue = normalizeFluidValue(value);
            if (!fluidValue) continue;
            const key = `fluid-${name}`;
            spacing[key] = fluidValue;
            heightSpacing[key] = fluidValue;
            maxWidthSpacing[key] = fluidValue;
            safeAreaOffsetScale[key] = fluidValue;
        }
        const fluidFontSize = Object.assign({}, baseFluid.fontSize || {}, extendedFluid.fontSize || {});
        for (const [name, definition] of Object.entries(fluidFontSize)) {
            if (!/^[a-zA-Z][\w-]*$/.test(name)) continue;
            const fluidValue = normalizeFluidValue(definition);
            if (!fluidValue) continue;
            const lineHeight = definition && !Array.isArray(definition) && typeof definition === 'object'
                ? isSafeFluidCSSValue(definition.lineHeight)
                : null;
            userConfig.customUtilities[`text-fluid-${name}`] = lineHeight
                ? { css: ['font-size', 'line-height'], val: `${fluidValue}; ${lineHeight}` }
                : { css: 'font-size', val: fluidValue };
        }
        if (userConfig.theme?.extend?.breakpoints) Object.assign(breakpoints, userConfig.theme.extend.breakpoints);
        for (const [bp, width] of Object.entries(breakpoints)) variants[bp] = { media: `@media (min-width: ${width})` };
        for (const size of Object.keys(containers)) {
            const query = buildContainerQuery(size);
            if (query) variants[`@${size}`] = { container: query };
        }
        const configuredKeyframes = Object.assign({}, userConfig.theme?.keyframes || {}, userConfig.theme?.extend?.keyframes || {});
        customKeyframesCSS = buildConfiguredKeyframes(configuredKeyframes);
        const configuredAnimations = Object.assign({}, userConfig.theme?.animation || {}, userConfig.theme?.extend?.animation || {});
        for (const [name, value] of Object.entries(configuredAnimations)) {
            if (/^[a-zA-Z_][\w-]*$/.test(name) && typeof value === 'string' && value.trim()) {
                userConfig.customUtilities[`animate-${name}`] = { css: 'animation', val: value.trim() };
            }
        }

        // 3. 语义化主题（默认主题）
        semanticThemes = userConfig.theme?.semantic || {};
        for (const key of Object.keys(semanticThemes)) colors[key] = `var(--color-${key}-css)`;

        // 4. 合并静态自定义字典
        const customUtilities = userConfig.customUtilities || {};
        for (const [utilName, utilDef] of Object.entries(customUtilities)) dictionary[utilName] = utilDef;

        // 4.1 @apply / shortcut 组合类
        const shortcuts = userConfig.shortcuts || userConfig.theme?.shortcuts || {};
        for (const [name, shortcut] of Object.entries(shortcuts)) {
            dictionary[name] = { raw: selector => buildShortcutRule(selector, shortcut, name) };
        }

        // 🚀 5. 挂载外置插件系统 (The Ecosystem Boot)
        if (userConfig.plugins && Array.isArray(userConfig.plugins)) {
            executePlugins(userConfig.plugins);
        }
        
    }

    function resolveColorDirect(name) {
        if (!name) return null;
        if (['transparent', 'current', 'inherit', 'white', 'black'].includes(name)) {
            const staticMap = { 'transparent': 'transparent', 'current': 'currentColor', 'inherit': 'inherit', 'white': '255 255 255', 'black': '0 0 0' };
            return staticMap[name];
        }
        if (/^#[0-9a-fA-F]{3,8}$/.test(name)) return name;
        if (colors[name]) return typeof colors[name] === 'string' ? colors[name] : colors[name]['DEFAULT'] || colors[name]['500'];

        const parts = name.split('-');
        let shade = parts.pop();
        let colorName = parts.join('-');
        
        if (!colors[colorName]) { colorName = name; shade = 'DEFAULT'; }
        const colorObj = colors[colorName];
        if (!colorObj) return null;
        
        return typeof colorObj === 'string' ? colorObj : colorObj[shade] || colorObj['500'];
    }

    // 独立化生成变量：支持传入特定主题的 semantic 覆盖 (v4.1 容错升级)
    function generateThemeVariables(specificSemantic = null) {
        let lightVars = '';
        let darkVars = '';

        for (const [colorName, val] of Object.entries(colors)) {
            if (typeof val === 'string') {
                if (['transparent', 'current', 'inherit'].includes(val)) continue;
                let rgbStr = hexToRgbChannels(val) || parseColorToRGB(val);
                lightVars += `--${colorName}: ${rgbStr};\n--${colorName}-hue-500: ${rgbStr};\n--${colorName}-500: ${rgbStr};\n`;
            } else if (typeof val === 'object') {
                for (const [shade, shadeVal] of Object.entries(val)) {
                    let rgbStr = hexToRgbChannels(shadeVal) || parseColorToRGB(shadeVal);
                    lightVars += `--${colorName}-${shade}: ${rgbStr};\n`;
                    if (shade === 'DEFAULT') lightVars += `--${colorName}: ${rgbStr};\n`;
                }
                if (val['500']) lightVars += `--${colorName}-hue-500: ${parseColorToRGB(val['500'])};\n`;
            }
        }

        const targetSemantic = specificSemantic || semanticThemes;
        for (const [key, value] of Object.entries(targetSemantic)) {
            // 🚀 Jquan 容错修正：支持直接传字符串，不需要强制区分 light/dark
            let lightVal = typeof value === 'string' ? value : value.light;
            let darkVal = typeof value === 'string' ? value : value.dark;
            
            const lightHex = resolveColorDirect(lightVal);
            const darkHex = resolveColorDirect(darkVal);
            
            if (lightHex) {
                const lightValue = hexToRgb(lightHex);
                lightVars += `--color-${key}: ${lightValue};\n--color-${key}-css: ${toCssColor(lightValue)};\n`;
            }

            if (darkHex) {
                const darkValue = hexToRgb(darkHex);
                darkVars += `--color-${key}: ${darkValue};\n--color-${key}-css: ${toCssColor(darkValue)};\n`;
            }
        }

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
    // §6. 🚀 Jquan Plugin System (动态插件网关 API)
    // ==========================================
    const dynamicPluginMatchers = [];
    const pluginComponentCSS = [];
    const installedPlugins = new Map();
    const pluginBehaviors = [];
    const pluginScanHooks = [];

    function normalizePlugin(plugin) {
        if (typeof plugin === 'function') {
            return {
                name: plugin.pluginName || plugin.name || `anonymous-plugin-${installedPlugins.size + 1}`,
                version: plugin.version || '0.0.0',
                requires: plugin.requires || [],
                install: plugin
            };
        }
        if (plugin && typeof plugin.install === 'function') {
            return {
                name: plugin.name || `anonymous-plugin-${installedPlugins.size + 1}`,
                version: plugin.version || '0.0.0',
                requires: Array.isArray(plugin.requires) ? plugin.requires : [],
                install: plugin.install,
                meta: plugin
            };
        }
        return null;
    }

    function registerPluginBehavior(pluginName, behavior) {
        if (!behavior || typeof behavior.selector !== 'string' || typeof behavior.setup !== 'function') return;
        pluginBehaviors.push({
            pluginName,
            selector: behavior.selector,
            setup: behavior.setup,
            initialized: new WeakMap(),
            nodes: new Set()
        });
    }

    function teardownBehaviorNode(behavior, node) {
        if (!behavior.initialized.has(node)) return;
        const teardown = behavior.initialized.get(node);
        if (typeof teardown === 'function') {
            try { teardown(); } catch (e) { console.error(`[JquanUI] Plugin behavior teardown failed (${behavior.pluginName} -> ${behavior.selector})`, e); }
        }
        behavior.initialized.delete(node);
        behavior.nodes.delete(node);
    }

    function teardownPluginNodeTree(root) {
        if (!root || pluginBehaviors.length === 0) return;
        pluginBehaviors.forEach(behavior => {
            if (root.matches && root.matches(behavior.selector)) teardownBehaviorNode(behavior, root);
            if (root.querySelectorAll) root.querySelectorAll(behavior.selector).forEach(node => teardownBehaviorNode(behavior, node));
        });
    }

    function runPluginBehaviors(root) {
        if (!root || pluginBehaviors.length === 0) return;
        pluginBehaviors.forEach(behavior => {
            const targets = [];
            if (root.matches && root.matches(behavior.selector)) targets.push(root);
            if (root.querySelectorAll) root.querySelectorAll(behavior.selector).forEach(node => targets.push(node));

            targets.forEach(node => {
                if (behavior.initialized.has(node)) return;
                try {
                    const teardown = behavior.setup(node, {
                        pluginName: behavior.pluginName,
                        resolve: resolveUtility,
                        compile(classNames) {
                            if (!classNames) return;
                            const list = typeof classNames === 'string'
                                ? classStringToTokens(classNames)
                                : classNames;
                            if (Array.isArray(list) && list.length > 0) compileAndInject(new Set(list), true);
                        },
                        theme(path) {
                            return path.split('.').reduce((o, i) => (o ? o[i] : null), { colors, spacing, breakpoints, containers });
                        }
                    });
                    behavior.initialized.set(node, typeof teardown === 'function' ? teardown : true);
                    behavior.nodes.add(node);
                } catch (e) {
                    console.error(`[JquanUI] Plugin behavior setup failed (${behavior.pluginName} -> ${behavior.selector})`, e);
                }
            });
        });
    }

    function runPluginScanHooks(root) {
        if (!root || pluginScanHooks.length === 0) return;
        pluginScanHooks.forEach(hook => {
            try {
                hook.handler(root, {
                    pluginName: hook.pluginName,
                    compile(classNames) {
                        if (!classNames) return;
                        const list = typeof classNames === 'string'
                            ? classStringToTokens(classNames)
                            : classNames;
                        if (Array.isArray(list) && list.length > 0) compileAndInject(new Set(list), true);
                    },
                        theme(path) {
                            return path.split('.').reduce((o, i) => (o ? o[i] : null), { colors, spacing, breakpoints, containers });
                    }
                });
            } catch (e) {
                console.error(`[JquanUI] Plugin scan hook failed (${hook.pluginName})`, e);
            }
        });
    }

    const dynamicStyleAttributes = new Set([
        'class', 'dir', 'lang', 'hidden', 'inert', 'open', 'popover',
        'disabled', 'checked', 'selected', 'required', 'readonly', 'multiple'
    ]);

    function shouldScanAttribute(attributeName) {
        if (pluginBehaviors.length > 0 || pluginScanHooks.length > 0) return true;
        const name = String(attributeName || '').toLowerCase();
        return dynamicStyleAttributes.has(name) || name.startsWith('data-') || name.startsWith('aria-');
    }

    function executePlugins(plugins) {
        const newlyInstalled = [];
        plugins.forEach(rawPlugin => {
            const plugin = normalizePlugin(rawPlugin);
            if (!plugin) {
                console.warn('[JquanUI] Invalid plugin skipped.', rawPlugin);
                return;
            }
            if (installedPlugins.has(plugin.name)) return;

            const missingDependencies = plugin.requires.filter(dep => !installedPlugins.has(dep));
            if (missingDependencies.length > 0) {
                throw new Error(`[JquanUI] Plugin "${plugin.name}" requires: ${missingDependencies.join(', ')}`);
            }

            const pluginAPI = {
                pluginName: plugin.name,
                version: plugin.version,
                addUtilities(utils) {
                    Object.assign(dictionary, utils);
                },
                matchUtilities(matchers) {
                    for (const [prefix, fn] of Object.entries(matchers)) {
                        dynamicPluginMatchers.push({ prefix, fn, pluginName: plugin.name });
                    }
                },
                addComponents(components) {
                    if (typeof components === 'string') pluginComponentCSS.push(components);
                    else if (Array.isArray(components)) components.filter(item => typeof item === 'string').forEach(item => pluginComponentCSS.push(item));
                },
                addBase(css) {
                    if (typeof css === 'string') preflight += '\n' + css;
                },
                addVariant(name, def) {
                    variants[name] = def;
                },
                addBehaviors(behaviors) {
                    const list = Array.isArray(behaviors) ? behaviors : [behaviors];
                    list.forEach(behavior => registerPluginBehavior(plugin.name, behavior));
                },
                onScan(handler) {
                    if (typeof handler === 'function') pluginScanHooks.push({ pluginName: plugin.name, handler });
                },
                theme(path) {
                    return path.split('.').reduce((o, i) => (o ? o[i] : null), { colors, spacing, breakpoints, containers });
                }
            };

            try {
                const teardown = plugin.install(pluginAPI);
                installedPlugins.set(plugin.name, {
                    name: plugin.name,
                    version: plugin.version,
                    requires: plugin.requires.slice(),
                    teardown: typeof teardown === 'function' ? teardown : null
                });
                newlyInstalled.push(plugin.name);
            } catch (e) {
                console.error(`[JquanUI] Plugin Execution Failed: ${plugin.name}`, e);
                throw e;
            }
        });
        return newlyInstalled;
    }

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
        'container': { raw: selector => buildContainerRule(selector) },
        'visible': { css: 'visibility', val: 'visible' },
        'invisible': { css: 'visibility', val: 'hidden' },
        'collapse': { css: 'visibility', val: 'collapse' },
        'box-border': { css: 'box-sizing', val: 'border-box' },
        'box-content': { css: 'box-sizing', val: 'content-box' },
        'content-visible': { css: 'content-visibility', val: 'visible' },
        'content-hidden': { css: 'content-visibility', val: 'hidden' },
        'content-auto': { css: 'content-visibility', val: 'auto' },
        'content-none': { css: ['--jquan-content', 'content'], val: 'none; var(--jquan-content)' },
        'content-empty': { css: ['--jquan-content', 'content'], val: '""; var(--jquan-content)' },

        // 7.2 尺寸
        'w': { css: 'width', scale: spacing },
        'h': { css: 'height', scale: heightSpacing },
        'size': { css: 'width, height', scale: spacing },
        'min-w': { css: 'min-width', scale: spacing },
        'min-h': { css: 'min-height', scale: heightSpacing },
        'max-w': { css: 'max-width', scale: maxWidthSpacing },
        'max-h': { css: 'max-height', scale: heightSpacing },
        'is': { css: 'inline-size', scale: spacing },
        'bs': { css: 'block-size', scale: heightSpacing },
        'min-is': { css: 'min-inline-size', scale: spacing },
        'max-is': { css: 'max-inline-size', scale: maxWidthSpacing },
        'min-bs': { css: 'min-block-size', scale: heightSpacing },
        'max-bs': { css: 'max-block-size', scale: heightSpacing },
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
        'inset-safe': { css: ['top', 'right', 'bottom', 'left'], scale: safeAreaOffsetScale, fn: value => safeAreaValues(['top', 'right', 'bottom', 'left'], value) },
        'top-safe': { css: 'top', scale: safeAreaOffsetScale, fn: value => safeAreaValue('top', value) },
        'right-safe': { css: 'right', scale: safeAreaOffsetScale, fn: value => safeAreaValue('right', value) },
        'bottom-safe': { css: 'bottom', scale: safeAreaOffsetScale, fn: value => safeAreaValue('bottom', value) },
        'left-safe': { css: 'left', scale: safeAreaOffsetScale, fn: value => safeAreaValue('left', value) },
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
        'overflow-clip-margin': { css: 'overflow-clip-margin' },
        'overflow-clip-margin-content': { css: 'overflow-clip-margin', val: 'content-box' },
        'overflow-clip-margin-border': { css: 'overflow-clip-margin', val: 'border-box' },
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
        'scrollbar-gutter-auto': { css: 'scrollbar-gutter', val: 'auto' },
        'scrollbar-gutter-stable': { css: 'scrollbar-gutter', val: 'stable' },
        'scrollbar-gutter-stable-both-edges': { css: 'scrollbar-gutter', val: 'stable both-edges' },
        'overflow-anchor-auto': { css: 'overflow-anchor', val: 'auto' },
        'overflow-anchor-none': { css: 'overflow-anchor', val: 'none' },

        // 7.5.1 内容可见性与布局隔离（现代长列表性能基础）
        'content-visibility-visible': { css: 'content-visibility', val: 'visible' },
        'content-visibility-auto': { css: 'content-visibility', val: 'auto' },
        'content-visibility-hidden': { css: 'content-visibility', val: 'hidden' },
        'contain-inline-size': { css: 'contain', val: 'inline-size' },
        'contain-style': { css: 'contain', val: 'style' },
        'contain-intrinsic-size': { css: 'contain-intrinsic-size' },

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
        'grid-cols': { css: 'grid-template-columns', fn: (v, isArb) => {if (isArb) return v;return v === 'none' ? 'none' : `repeat(${v}, minmax(0, 1fr))`;}},
        'grid-rows': { css: 'grid-template-rows', fn: (v, isArb) => {if (isArb) return v;return v === 'none' ? 'none' : `repeat(${v}, minmax(0, 1fr))`;}},
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
        'p-safe': { css: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'], scale: safeAreaOffsetScale, fn: value => safeAreaValues(['top', 'right', 'bottom', 'left'], value) },
        'px-safe': { css: ['padding-left', 'padding-right'], scale: safeAreaOffsetScale, fn: value => safeAreaValues(['left', 'right'], value) },
        'py-safe': { css: ['padding-top', 'padding-bottom'], scale: safeAreaOffsetScale, fn: value => safeAreaValues(['top', 'bottom'], value) },
        'pt-safe': { css: 'padding-top', scale: safeAreaOffsetScale, fn: value => safeAreaValue('top', value) },
        'pr-safe': { css: 'padding-right', scale: safeAreaOffsetScale, fn: value => safeAreaValue('right', value) },
        'pb-safe': { css: 'padding-bottom', scale: safeAreaOffsetScale, fn: value => safeAreaValue('bottom', value) },
        'pl-safe': { css: 'padding-left', scale: safeAreaOffsetScale, fn: value => safeAreaValue('left', value) },
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
        'font-kerning-auto': { css: 'font-kerning', val: 'auto' },
        'font-kerning-none': { css: 'font-kerning', val: 'none' },
        'font-kerning-normal': { css: 'font-kerning', val: 'normal' },
        'font-optical-sizing-auto': { css: 'font-optical-sizing', val: 'auto' },
        'font-optical-sizing-none': { css: 'font-optical-sizing', val: 'none' },
        'font-palette-normal': { css: 'font-palette', val: 'normal' },
        'font-palette-light': { css: 'font-palette', val: 'light' },
        'font-palette-dark': { css: 'font-palette', val: 'dark' },
        'font-synthesis-auto': { css: 'font-synthesis', val: 'auto' },
        'font-synthesis-none': { css: 'font-synthesis', val: 'none' },
        'font-synthesis-weight': { css: 'font-synthesis', val: 'weight' },
        'font-synthesis-style': { css: 'font-synthesis', val: 'style' },
        'font-synthesis-small-caps': { css: 'font-synthesis', val: 'small-caps' },
        'font-variant-ligatures-normal': { css: 'font-variant-ligatures', val: 'normal' },
        'font-variant-ligatures-none': { css: 'font-variant-ligatures', val: 'none' },
        'font-variant-ligatures-common': { css: 'font-variant-ligatures', val: 'common-ligatures' },
        'font-variant-ligatures-no-common': { css: 'font-variant-ligatures', val: 'no-common-ligatures' },
        'font-variant-ligatures-discretionary': { css: 'font-variant-ligatures', val: 'discretionary-ligatures' },
        'font-variant-ligatures-historical': { css: 'font-variant-ligatures', val: 'historical-ligatures' },
        'font-variant-position-normal': { css: 'font-variant-position', val: 'normal' },
        'font-variant-position-sub': { css: 'font-variant-position', val: 'sub' },
        'font-variant-position-super': { css: 'font-variant-position', val: 'super' },
        'font-variant-east-asian-normal': { css: 'font-variant-east-asian', val: 'normal' },
        'font-variant-east-asian-jis78': { css: 'font-variant-east-asian', val: 'jis78' },
        'font-variant-east-asian-proportional': { css: 'font-variant-east-asian', val: 'proportional-width' },
        'font-language': { css: 'font-language-override' },
        'font-feature': { css: 'font-feature-settings' },
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
        'text-md': { css: ['font-size', 'line-height'], val: '1rem; 1.5rem' },
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
        'text-rendering-auto': { css: 'text-rendering', val: 'auto' },
        'text-rendering-optimize-speed': { css: 'text-rendering', val: 'optimizeSpeed' },
        'text-rendering-optimize-legibility': { css: 'text-rendering', val: 'optimizeLegibility' },
        'text-rendering-geometric-precision': { css: 'text-rendering', val: 'geometricPrecision' },
        'initial-letter-normal': { css: 'initial-letter', val: 'normal' },
        'text-combine-none': { css: 'text-combine-upright', val: 'none' },
        'text-combine-all': { css: 'text-combine-upright', val: 'all' },
        'text-orientation-mixed': { css: 'text-orientation', val: 'mixed' },
        'text-orientation-upright': { css: 'text-orientation', val: 'upright' },
        'text-orientation-sideways': { css: 'text-orientation', val: 'sideways' },
        'white-space-collapse-collapse': { css: 'white-space-collapse', val: 'collapse' },
        'white-space-collapse-preserve': { css: 'white-space-collapse', val: 'preserve' },
        'white-space-collapse-preserve-breaks': { css: 'white-space-collapse', val: 'preserve-breaks' },

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
        'decoration-skip-ink-auto': { css: 'text-decoration-skip-ink', val: 'auto' },
        'decoration-skip-ink-none': { css: 'text-decoration-skip-ink', val: 'none' },
        'decoration-skip-ink-all': { css: 'text-decoration-skip-ink', val: 'all' },
        'emphasis-none': { css: 'text-emphasis', val: 'none' },
        'emphasis-filled': { css: 'text-emphasis-style', val: 'filled' },
        'emphasis-open': { css: 'text-emphasis-style', val: 'open' },
        'emphasis-dot': { css: 'text-emphasis-style', val: 'dot' },
        'emphasis-circle': { css: 'text-emphasis-style', val: 'circle' },
        'emphasis-double-circle': { css: 'text-emphasis-style', val: 'double-circle' },
        'emphasis-triangle': { css: 'text-emphasis-style', val: 'triangle' },
        'emphasis-sesame': { css: 'text-emphasis-style', val: 'sesame' },
        'emphasis-color-current': { css: 'text-emphasis-color', val: 'currentColor' },
        'emphasis-position-over': { css: 'text-emphasis-position', val: 'over' },
        'emphasis-position-under': { css: 'text-emphasis-position', val: 'under' },
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
        'underline-position-auto': { css: 'text-underline-position', val: 'auto' },
        'underline-position-under': { css: 'text-underline-position', val: 'under' },
        'underline-position-left': { css: 'text-underline-position', val: 'left' },

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
        'break-anywhere': { css: 'overflow-wrap', val: 'anywhere' },
        'break-all': { css: 'word-break', val: 'break-all' },
        'break-auto-phrase': { css: 'word-break', val: 'auto-phrase' },
        'break-keep': { css: 'word-break', val: 'keep-all' },
        'font-size-adjust-none': { css: 'font-size-adjust', val: 'none' },
        'font-size-adjust-from-font': { css: 'font-size-adjust', val: 'from-font' },
        'line-break-auto': { css: 'line-break', val: 'auto' },
        'line-break-loose': { css: 'line-break', val: 'loose' },
        'line-break-normal': { css: 'line-break', val: 'normal' },
        'line-break-strict': { css: 'line-break', val: 'strict' },
        'line-break-anywhere': { css: 'line-break', val: 'anywhere' },
        'hyphens-none': { css: 'hyphens', val: 'none' },
        'hyphens-manual': { css: 'hyphens', val: 'manual' },
        'hyphens-auto': { css: 'hyphens', val: 'auto' },

        'text-wrap': { css: 'text-wrap', val: 'wrap' },
        'text-nowrap': { css: 'text-wrap', val: 'nowrap' },
        'text-balance': { css: 'text-wrap', val: 'balance' },
        'text-pretty': { css: 'text-wrap', val: 'pretty' },
        'text-wrap-stable': { css: 'text-wrap', val: 'stable' },
        'text-autospace-normal': { css: 'text-autospace', val: 'normal' },
        'text-autospace-none': { css: 'text-autospace', val: 'none' },
        'text-autospace-ideograph-alpha': { css: 'text-autospace', val: 'ideograph-alpha' },
        'text-autospace-ideograph-numeric': { css: 'text-autospace', val: 'ideograph-numeric' },
        'text-spacing-trim-normal': { css: 'text-spacing-trim', val: 'normal' },
        'text-spacing-trim-space-all': { css: 'text-spacing-trim', val: 'space-all' },
        'text-spacing-trim-space-first': { css: 'text-spacing-trim', val: 'space-first' },
        'hyphenate-character-auto': { css: 'hyphenate-character', val: 'auto' },
        'hyphenate-character-none': { css: 'hyphenate-character', val: 'none' },
        'ruby-position-over': { css: 'ruby-position', val: 'over' },
        'ruby-position-under': { css: 'ruby-position', val: 'under' },
        'ruby-position-inter-character': { css: 'ruby-position', val: 'inter-character' },
        'ruby-align-space-around': { css: 'ruby-align', val: 'space-around' },
        'text-box-trim-none': { css: 'text-box-trim', val: 'none' },
        'text-box-trim-both': { css: 'text-box-trim', val: 'trim-both' },
        'text-box-trim-start': { css: 'text-box-trim', val: 'trim-start' },
        'text-box-trim-end': { css: 'text-box-trim', val: 'trim-end' },
        'text-box-edge-auto': { css: 'text-box-edge', val: 'auto' },
        'text-box-edge-cap': { css: 'text-box-edge', val: 'cap alphabetic' },
        'text-box-edge-ex': { css: 'text-box-edge', val: 'ex alphabetic' },
        'interpolate-size-numeric-only': { css: 'interpolate-size', val: 'numeric-only' },
        'interpolate-size-allow-keywords': { css: 'interpolate-size', val: 'allow-keywords' },
        'box-decoration-slice': { css: 'box-decoration-break', val: 'slice' },
        'box-decoration-clone': { css: 'box-decoration-break', val: 'clone' },

        'indent': { css: 'text-indent', scale: spacing },

        // 文字阴影：保留少量语义档位，复杂值使用 text-shadow-[...]
        'text-shadow': { css: 'text-shadow', values: {
            'none': 'none',
            'sm': '0 1px 2px rgb(0 0 0 / 0.15)',
            'md': '0 2px 4px rgb(0 0 0 / 0.2)',
            'lg': '0 4px 8px rgb(0 0 0 / 0.25)'
        } },

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
        'border-bs': { css: 'border-block-start-color', color: true },
        'border-be': { css: 'border-block-end-color', color: true },
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
        'border-gradient-to-t': { css: '--jquan-border-gradient', val: 'linear-gradient(to top, var(--jquan-gradient-stops))', decoration: 'border-gradient' },
        'border-gradient-to-tr': { css: '--jquan-border-gradient', val: 'linear-gradient(to top right, var(--jquan-gradient-stops))', decoration: 'border-gradient' },
        'border-gradient-to-r': { css: '--jquan-border-gradient', val: 'linear-gradient(to right, var(--jquan-gradient-stops))', decoration: 'border-gradient' },
        'border-gradient-to-br': { css: '--jquan-border-gradient', val: 'linear-gradient(to bottom right, var(--jquan-gradient-stops))', decoration: 'border-gradient' },
        'border-gradient-to-b': { css: '--jquan-border-gradient', val: 'linear-gradient(to bottom, var(--jquan-gradient-stops))', decoration: 'border-gradient' },
        'border-gradient-to-bl': { css: '--jquan-border-gradient', val: 'linear-gradient(to bottom left, var(--jquan-gradient-stops))', decoration: 'border-gradient' },
        'border-gradient-to-l': { css: '--jquan-border-gradient', val: 'linear-gradient(to left, var(--jquan-gradient-stops))', decoration: 'border-gradient' },
        'border-gradient-to-tl': { css: '--jquan-border-gradient', val: 'linear-gradient(to top left, var(--jquan-gradient-stops))', decoration: 'border-gradient' },

        // --- 3. 环渐变 (提取为变量) ---
        'ring-gradient-to-t': { css: '--jquan-ring-gradient', val: 'linear-gradient(to top, var(--jquan-gradient-stops))', decoration: 'ring-gradient' },
        'ring-gradient-to-tr': { css: '--jquan-ring-gradient', val: 'linear-gradient(to top right, var(--jquan-gradient-stops))', decoration: 'ring-gradient' },
        'ring-gradient-to-r': { css: '--jquan-ring-gradient', val: 'linear-gradient(to right, var(--jquan-gradient-stops))', decoration: 'ring-gradient' },
        'ring-gradient-to-br': { css: '--jquan-ring-gradient', val: 'linear-gradient(to bottom right, var(--jquan-gradient-stops))', decoration: 'ring-gradient' },
        'ring-gradient-to-b': { css: '--jquan-ring-gradient', val: 'linear-gradient(to bottom, var(--jquan-gradient-stops))', decoration: 'ring-gradient' },
        'ring-gradient-to-bl': { css: '--jquan-ring-gradient', val: 'linear-gradient(to bottom left, var(--jquan-gradient-stops))', decoration: 'ring-gradient' },
        'ring-gradient-to-l': { css: '--jquan-ring-gradient', val: 'linear-gradient(to left, var(--jquan-gradient-stops))', decoration: 'ring-gradient' },
        'ring-gradient-to-tl': { css: '--jquan-ring-gradient', val: 'linear-gradient(to top left, var(--jquan-gradient-stops))', decoration: 'ring-gradient' },

        // --- 4. 文字渐变前置件 ---
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
        'border-bs-w': { css: 'border-block-start-width', scale: borders },
        'border-be-w': { css: 'border-block-end-width', scale: borders },
        'border-solid': { css: 'border-style', val: 'solid' },
        'border-dashed': { css: 'border-style', val: 'dashed' },
        'border-dotted': { css: 'border-style', val: 'dotted' },
        'border-double': { css: 'border-style', val: 'double' },
        'border-hidden': { css: 'border-style', val: 'hidden' },
        'border-none': { css: 'border-style', val: 'none' },
        'border-bs-solid': { css: 'border-block-start-style', val: 'solid' },
        'border-bs-dashed': { css: 'border-block-start-style', val: 'dashed' },
        'border-bs-dotted': { css: 'border-block-start-style', val: 'dotted' },
        'border-bs-double': { css: 'border-block-start-style', val: 'double' },
        'border-be-solid': { css: 'border-block-end-style', val: 'solid' },
        'border-be-dashed': { css: 'border-block-end-style', val: 'dashed' },
        'border-be-dotted': { css: 'border-block-end-style', val: 'dotted' },
        'border-be-double': { css: 'border-block-end-style', val: 'double' },

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
        'ring': { css: ['--jquan-ring-width', 'box-shadow'], values: {
            '0': '0px', '1': '1px', '2': '2px', 'DEFAULT': '3px', '4': '4px', '8': '8px'
        }, fn: v => `${v}; var(--jquan-ring-offset-shadow), var(--jquan-ring-shadow), var(--jquan-shadow)` },
        'ring-inset': { css: ['--jquan-ring-inset', 'box-shadow'], val: 'inset; var(--jquan-ring-offset-shadow), var(--jquan-ring-shadow), var(--jquan-shadow)' },
        'ring-offset': { css: ['--jquan-ring-offset-width', 'box-shadow'], values: {
            '0': '0px', '1': '1px', '2': '2px', '4': '4px', '8': '8px'
        }, fn: v => `${v}; var(--jquan-ring-offset-shadow), var(--jquan-ring-shadow), var(--jquan-shadow)` },

        // 🚀 Jquan v10.0.3 阴影系统 (仅输出变量，彻底解决与 ring 的层级覆盖冲突！)
        'shadow': { css: ['--jquan-shadow', '--jquan-shadow', 'box-shadow'], values: {
            'sm': '0 1px 2px 0 rgb(var(--jquan-shadow-color) / 0.05)',
            'DEFAULT': '0 1px 3px 0 rgb(var(--jquan-shadow-color) / 0.1), 0 1px 2px -1px rgb(var(--jquan-shadow-color) / 0.1)',
            'md': '0 4px 6px -1px rgb(var(--jquan-shadow-color) / 0.1), 0 2px 4px -2px rgb(var(--jquan-shadow-color) / 0.1)',
            'lg': '0 10px 15px -3px rgb(var(--jquan-shadow-color) / 0.1), 0 4px 6px -4px rgb(var(--jquan-shadow-color) / 0.1)',
            'xl': '0 20px 25px -5px rgb(var(--jquan-shadow-color) / 0.1), 0 8px 10px -6px rgb(var(--jquan-shadow-color) / 0.1)',
            '2xl': '0 25px 50px -12px rgb(var(--jquan-shadow-color) / 0.25)',
            'inner': 'inset 0 2px 4px 0 rgb(var(--jquan-shadow-color) / 0.05)',
            'none': '0 0 #0000'
        }, fn: v => `${v}; ${modernizeShadowValue(v)}; var(--jquan-ring-offset-shadow), var(--jquan-ring-shadow), var(--jquan-shadow)` },

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
        'transform': { css: 'transform', val: transformCompose },
        'transform-cpu': { css: 'transform', val: transformCompose },
        'transform-gpu': { css: 'transform', val: transformComposeGpu },
        'transform-none': { css: 'transform', val: 'none' },

        'translate-x': { css: ['--jquan-translate-x', 'transform'], scale: spacing, fn: v => `${v}; ${transformCompose}` },
        'translate-y': { css: ['--jquan-translate-y', 'transform'], scale: spacing, fn: v => `${v}; ${transformCompose}` },
        'translate-z': { css: '--jquan-translate-z', scale: spacing },

        'rotate': { css: ['--jquan-rotate', 'transform'], values: { '0': '0deg', '1': '1deg', '2': '2deg', '3': '3deg', '6': '6deg', '12': '12deg', '45': '45deg', '90': '90deg', '180': '180deg' }, fn: v => `${v}; ${transformCompose}` },
        'rotate-x': { css: ['--jquan-rotate-x', 'transform'], values: { '0': '0deg', '1': '1deg', '2': '2deg', '3': '3deg', '6': '6deg', '12': '12deg', '45': '45deg', '90': '90deg', '180': '180deg' }, fn: v => `${normalizeAngleValue(v)}; ${transformCompose}` },
        'rotate-y': { css: ['--jquan-rotate-y', 'transform'], values: { '0': '0deg', '1': '1deg', '2': '2deg', '3': '3deg', '6': '6deg', '12': '12deg', '45': '45deg', '90': '90deg', '180': '180deg' }, fn: v => `${normalizeAngleValue(v)}; ${transformCompose}` },
        'rotate-z': { css: ['--jquan-rotate-z', 'transform'], values: { '0': '0deg', '1': '1deg', '2': '2deg', '3': '3deg', '6': '6deg', '12': '12deg', '45': '45deg', '90': '90deg', '180': '180deg' }, fn: v => `${normalizeAngleValue(v)}; ${transformCompose}` },

        'scale': { css: ['--jquan-scale-x', '--jquan-scale-y', 'transform'], values: { '0': '0', '50': '.5', '75': '.75', '90': '.9', '95': '.95', '100': '1', '105': '1.05', '110': '1.1', '125': '1.25', '150': '1.5' }, fn: v => `${v}; ${v}; ${transformCompose}` },
        'scale-x': { css: ['--jquan-scale-x', 'transform'], values: { '0': '0', '50': '.5', '75': '.75', '90': '.9', '95': '.95', '100': '1', '105': '1.05', '110': '1.1', '125': '1.25', '150': '1.5' }, fn: v => `${v}; ${transformCompose}` },
        'scale-y': { css: ['--jquan-scale-y', 'transform'], values: { '0': '0', '50': '.5', '75': '.75', '90': '.9', '95': '.95', '100': '1', '105': '1.05', '110': '1.1', '125': '1.25', '150': '1.5' }, fn: v => `${v}; ${transformCompose}` },

        'skew-x': { css: ['--jquan-skew-x', 'transform'], values: { '0': '0deg', '1': '1deg', '2': '2deg', '3': '3deg', '6': '6deg', '12': '12deg' }, fn: v => `${v}; ${transformCompose}` },
        'skew-y': { css: ['--jquan-skew-y', 'transform'], values: { '0': '0deg', '1': '1deg', '2': '2deg', '3': '3deg', '6': '6deg', '12': '12deg' }, fn: v => `${v}; ${transformCompose}` },

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
        'animation-timeline': { css: 'animation-timeline' },
        'animation-range': { css: 'animation-range' },
        'timeline-scope': { css: 'timeline-scope' },
        'scroll-timeline-name': { css: 'scroll-timeline-name' },
        'scroll-timeline-axis': { css: 'scroll-timeline-axis' },
        'view-timeline-name': { css: 'view-timeline-name' },
        'view-timeline-axis': { css: 'view-timeline-axis' },

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
        'scrollbar-color': { css: 'scrollbar-color' },
        'scrollbar-color-auto': { css: 'scrollbar-color', val: 'auto' },
        
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
        'resize-inline': { css: 'resize', val: 'inline' },
        'resize-block': { css: 'resize', val: 'block' },

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
        'scroll-mi': { css: 'scroll-margin-inline', scale: spacing },
        'scroll-mbs': { css: 'scroll-margin-block-start', scale: spacing },
        'scroll-mbe': { css: 'scroll-margin-block-end', scale: spacing },
        'scroll-p': { css: 'scroll-padding', scale: spacing },
        'scroll-px': { css: ['scroll-padding-left', 'scroll-padding-right'], scale: spacing },
        'scroll-py': { css: ['scroll-padding-top', 'scroll-padding-bottom'], scale: spacing },
        'scroll-pt': { css: 'scroll-padding-top', scale: spacing },
        'scroll-pr': { css: 'scroll-padding-right', scale: spacing },
        'scroll-pb': { css: 'scroll-padding-bottom', scale: spacing },
        'scroll-pl': { css: 'scroll-padding-left', scale: spacing },
        'scroll-ps': { css: 'scroll-padding-inline-start', scale: spacing },
        'scroll-pe': { css: 'scroll-padding-inline-end', scale: spacing },
        'scroll-pi': { css: 'scroll-padding-inline', scale: spacing },
        'scroll-pbs': { css: 'scroll-padding-block-start', scale: spacing },
        'scroll-pbe': { css: 'scroll-padding-block-end', scale: spacing },

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

        // 7.17.1 现代渲染与锚点定位
        'image-rendering-auto': { css: 'image-rendering', val: 'auto' },
        'image-rendering-crisp-edges': { css: 'image-rendering', val: 'crisp-edges' },
        'image-rendering-pixelated': { css: 'image-rendering', val: 'pixelated' },
        'text-size-adjust-auto': { css: 'text-size-adjust', val: 'auto' },
        'text-size-adjust-none': { css: 'text-size-adjust', val: 'none' },
        'anchor-none': { css: 'anchor-name', val: 'none' },
        'anchor-name': { css: 'anchor-name' },
        'position-anchor': { css: 'position-anchor' },
        'position-try-fallbacks': { css: 'position-try-fallbacks' },
        'view-transition-name-none': { css: 'view-transition-name', val: 'none' },
        'view-transition-name': { css: 'view-transition-name' },
        'view-transition-class-none': { css: 'view-transition-class', val: 'none' },
        'view-transition-class': { css: 'view-transition-class' },

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
        'image-orientation-from-image': { css: 'image-orientation', val: 'from-image' },
        'image-orientation-none': { css: 'image-orientation', val: 'none' },
        'image-resolution-from-image': { css: 'image-resolution', val: 'from-image' },
        'image-resolution-snap': { css: 'image-resolution', val: 'snap' },
        'object-view-box': { css: 'object-view-box' },

        // 7.18.1 形状与路径定位
        'shape-none': { css: 'shape-outside', val: 'none' },
        'shape-margin': { css: 'shape-margin' },
        'shape-image-threshold': { css: 'shape-image-threshold' },
        'offset-path': { css: 'offset-path' },
        'offset-distance': { css: 'offset-distance' },
        'offset-rotate-auto': { css: 'offset-rotate', val: 'auto' },
        'offset-rotate-reverse': { css: 'offset-rotate', val: 'reverse' },
        'offset-anchor': { css: 'offset-anchor' },

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
        'border-image-source': { css: 'border-image-source' },
        'border-image-slice': { css: 'border-image-slice' },
        'border-image-width': { css: 'border-image-width' },
        'border-image-outset': { css: 'border-image-outset' },
        'border-image-repeat-stretch': { css: 'border-image-repeat', val: 'stretch' },
        'border-image-repeat-repeat': { css: 'border-image-repeat', val: 'repeat' },
        'border-image-repeat-round': { css: 'border-image-repeat', val: 'round' },
        'border-image-repeat-space': { css: 'border-image-repeat', val: 'space' },

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
        'empty-cells-show': { css: 'empty-cells', val: 'show' },
        'empty-cells-hide': { css: 'empty-cells', val: 'hide' },
        'tab-size': { css: 'tab-size' },

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
        'shape-rendering-auto': { css: 'shape-rendering', val: 'auto' },
        'shape-rendering-optimize-speed': { css: 'shape-rendering', val: 'optimizeSpeed' },
        'shape-rendering-crisp-edges': { css: 'shape-rendering', val: 'crispEdges' },
        'shape-rendering-geometric-precision': { css: 'shape-rendering', val: 'geometricPrecision' },
        'color-rendering-auto': { css: 'color-rendering', val: 'auto' },
        'color-rendering-optimize-speed': { css: 'color-rendering', val: 'optimizeSpeed' },
        'color-interpolation-srgb': { css: 'color-interpolation', val: 'sRGB' },
        'color-interpolation-auto': { css: 'color-interpolation', val: 'auto' },
        'color-interpolation-filters-linear-rgb': { css: 'color-interpolation-filters', val: 'linearRGB' },
        'color-interpolation-filters-srgb': { css: 'color-interpolation-filters', val: 'sRGB' },
        'text-anchor-start': { css: 'text-anchor', val: 'start' },
        'text-anchor-middle': { css: 'text-anchor', val: 'middle' },
        'text-anchor-end': { css: 'text-anchor', val: 'end' },
        'dominant-baseline-auto': { css: 'dominant-baseline', val: 'auto' },
        'dominant-baseline-middle': { css: 'dominant-baseline', val: 'middle' },
        'dominant-baseline-central': { css: 'dominant-baseline', val: 'central' },
        'dominant-baseline-hanging': { css: 'dominant-baseline', val: 'hanging' },
        'baseline-shift-baseline': { css: 'baseline-shift', val: 'baseline' },
        'baseline-shift-sub': { css: 'baseline-shift', val: 'sub' },
        'baseline-shift-super': { css: 'baseline-shift', val: 'super' },
        'marker-start-none': { css: 'marker-start', val: 'none' },
        'marker-mid-none': { css: 'marker-mid', val: 'none' },
        'marker-end-none': { css: 'marker-end', val: 'none' },

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
        'container-name': { css: 'container-name', fn: v => v },
        'container-name-none': { css: 'container-name', val: 'none' },

        // =============================================
        // 7.24 外观与表单
        // =============================================
        'appearance-none': { css: 'appearance', val: 'none' },
        'appearance-auto': { css: 'appearance', val: 'auto' },
        'field-sizing-content': { css: 'field-sizing', val: 'content' },
        'field-sizing-fixed': { css: 'field-sizing', val: 'fixed' },
        'color-scheme-normal': { css: 'color-scheme', val: 'normal' },
        'color-scheme-light': { css: 'color-scheme', val: 'light' },
        'color-scheme-dark': { css: 'color-scheme', val: 'dark' },
        'color-scheme-only-light': { css: 'color-scheme', val: 'only light' },
        'color-scheme-only-dark': { css: 'color-scheme', val: 'only dark' },
        'caret-auto': { css: 'caret-color', val: 'auto' },
        'caret-current': { css: 'caret-color', val: 'currentColor' },
        'caret-inherit': { css: 'caret-color', val: 'inherit' },

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
        'page-break-before-auto': { css: 'page-break-before', val: 'auto' },
        'page-break-before-always': { css: 'page-break-before', val: 'always' },
        'page-break-before-avoid': { css: 'page-break-before', val: 'avoid' },
        'page-break-after-auto': { css: 'page-break-after', val: 'auto' },
        'page-break-after-always': { css: 'page-break-after', val: 'always' },
        'page-break-after-avoid': { css: 'page-break-after', val: 'avoid' },
        'page-break-inside-auto': { css: 'page-break-inside', val: 'auto' },
        'page-break-inside-avoid': { css: 'page-break-inside', val: 'avoid' },
        'orphans': { css: 'orphans' },
        'widows': { css: 'widows' },

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
        'mask-mode-match-source': { css: ['mask-mode', '-webkit-mask-mode'], val: 'match-source; match-source' },
        'mask-mode-alpha': { css: ['mask-mode', '-webkit-mask-mode'], val: 'alpha; alpha' },
        'mask-mode-luminance': { css: ['mask-mode', '-webkit-mask-mode'], val: 'luminance; luminance' },
        'mask-type-alpha': { css: 'mask-type', val: 'alpha' },
        'mask-type-luminance': { css: 'mask-type', val: 'luminance' },
        'mask-composite-add': { css: ['mask-composite', '-webkit-mask-composite'], val: 'add; add' },
        'mask-composite-subtract': { css: ['mask-composite', '-webkit-mask-composite'], val: 'subtract; subtract' },
        'mask-composite-intersect': { css: ['mask-composite', '-webkit-mask-composite'], val: 'intersect; intersect' },
        'mask-composite-exclude': { css: ['mask-composite', '-webkit-mask-composite'], val: 'exclude; exclude' },
        'mask-position': { css: ['mask-position', '-webkit-mask-position'] },
        'mask-origin-border': { css: ['mask-origin', '-webkit-mask-origin'], val: 'border-box; border-box' },
        'mask-origin-padding': { css: ['mask-origin', '-webkit-mask-origin'], val: 'padding-box; padding-box' },
        'mask-origin-content': { css: ['mask-origin', '-webkit-mask-origin'], val: 'content-box; content-box' },
        // =============================================
        // 7.26.2 书写模式 (Writing Mode) - 国际化与竖排版引擎
        // =============================================
        'writing-horizontal': { css: 'writing-mode', val: 'horizontal-tb' },
        'writing-vertical-rl': { css: 'writing-mode', val: 'vertical-rl' },
        'writing-vertical-lr': { css: 'writing-mode', val: 'vertical-lr' },
        'direction-ltr': { css: 'direction', val: 'ltr' },
        'direction-rtl': { css: 'direction', val: 'rtl' },
        'paint-order-normal': { css: 'paint-order', val: 'normal' },
        'paint-order-fill': { css: 'paint-order', val: 'fill' },
        'paint-order-stroke': { css: 'paint-order', val: 'stroke' },
        'paint-order-markers': { css: 'paint-order', val: 'markers' },
        'fill-rule-nonzero': { css: 'fill-rule', val: 'nonzero' },
        'fill-rule-evenodd': { css: 'fill-rule', val: 'evenodd' },
        'clip-rule-nonzero': { css: 'clip-rule', val: 'nonzero' },
        'clip-rule-evenodd': { css: 'clip-rule', val: 'evenodd' },
        'vector-effect-none': { css: 'vector-effect', val: 'none' },
        'vector-effect-non-scaling-stroke': { css: 'vector-effect', val: 'non-scaling-stroke' },
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
    // 8. 核心：解析单个工具类 → CSS 声明 (v4.0 融入插件通道)
    // =============================================

    function resolveColor(name) {
        if (!name) return null;
        let alphaValue = null;
        const slashIdx = name.indexOf('/');
        if (slashIdx > -1) {
            alphaValue = name.slice(slashIdx + 1);
            name = name.slice(0, slashIdx);
        }
        
        const colorValue = resolveColorDirect(name);
        if (!colorValue) return null;
        if (alphaValue !== null) return applyColorAlpha(colorValue, alphaValue);
        if (colorValue === 'transparent' || colorValue === 'currentColor' || colorValue === 'inherit') return colorValue;
        return toCssColor(colorValue);
    }

    function resolveColorChannels(name) {
        if (!name) return null;
        const slashIdx = name.indexOf('/');
        if (slashIdx > -1) name = name.slice(0, slashIdx);
        const colorVal = resolveColorDirect(name);
        if (!colorVal) return null;
        const rgb = hexToRgbChannels(colorVal) || hexToRgb(colorVal);
        if (isRgbChannelValue(rgb)) {
            return rgb.split(/[\s,]+/).filter(Boolean).slice(0, 3).join(' ');
        }
        return null;
    }

    function splitDeclarationValues(value) {
        const values = [];
        let current = '';
        let quote = '';
        let depth = 0;
        let escaped = false;
        for (const char of String(value)) {
            if (quote) {
                current += char;
                if (escaped) escaped = false;
                else if (char === '\\') escaped = true;
                else if (char === quote) quote = '';
                continue;
            }
            if (char === '"' || char === "'") {
                quote = char;
                current += char;
            } else if (char === '(' || char === '[') {
                depth++;
                current += char;
            } else if (char === ')' || char === ']') {
                depth = Math.max(0, depth - 1);
                current += char;
            } else if (char === ';' && depth === 0) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        if (current.trim() || values.length === 0) values.push(current.trim());
        return values;
    }

    function buildDeclarations(props, val, isImportant) {
        const importantStr = isImportant ? ' !important' : '';
        // 🚀 Jquan 修复：杜绝参数直接变异 (避免底层 V8 引擎去优化)，严谨映射多属性
        let propList = props;
        
        if (typeof propList === 'string') {
            if (propList.includes(',')) {
                propList = propList.split(',').map(p => p.trim());
            } else {
                return `${propList}: ${val}${importantStr};`;
            }
        }
        
        if (Array.isArray(propList)) {
            if (propList.length === 1) return `${propList[0]}: ${val}${importantStr};`;
            const splitValues = splitDeclarationValues(val);
            const vals = splitValues.length > 1 ? splitValues : propList.map(() => val);
            return propList.map((p, i) => `${p}: ${vals[i] !== undefined ? vals[i] : vals[0]}${importantStr};`).join(' ');
        }
        
        return `${propList}: ${val}${importantStr};`;
    }

    function extractRuleBody(cssRule) {
        const start = cssRule.indexOf('{');
        const end = cssRule.lastIndexOf('}');
        if (start === -1 || end === -1 || end <= start) return '';
        return cssRule.slice(start + 1, end).trim();
    }

    function isSingleRuleForSelector(cssRule, selector) {
        const trimmed = String(cssRule || '').trim();
        if (!trimmed.startsWith(`${selector} {`)) return false;
        let depth = 0;
        for (let i = 0; i < trimmed.length; i++) {
            const char = trimmed[i];
            if (char === '{') depth++;
            else if (char === '}') {
                depth--;
                if (depth === 0 && i !== trimmed.length - 1) return false;
            }
        }
        return depth === 0;
    }

    function splitTopLevelCssRules(cssText) {
        const rules = [];
        let start = 0;
        let depth = 0;
        let quote = '';
        let escaped = false;
        const source = String(cssText || '').trim();
        for (let i = 0; i < source.length; i++) {
            const char = source[i];
            if (quote) {
                if (escaped) escaped = false;
                else if (char === '\\') escaped = true;
                else if (char === quote) quote = '';
                continue;
            }
            if (char === '"' || char === "'") {
                quote = char;
                continue;
            }
            if (char === '{') depth++;
            else if (char === '}') {
                depth--;
                if (depth === 0) {
                    const rule = source.slice(start, i + 1).trim();
                    if (rule) rules.push(rule);
                    start = i + 1;
                }
            }
        }
        const tail = source.slice(start).trim();
        if (tail) rules.push(tail);
        return rules.length > 0 ? rules : (source ? [source] : []);
    }

    const activeShortcuts = new Set();
    function buildShortcutRule(selector, shortcut, shortcutName, depth = 0) {
        if (depth > 4 || activeShortcuts.has(shortcutName)) return '';
        activeShortcuts.add(shortcutName);
        try {
            const tokens = Array.isArray(shortcut) ? shortcut : classStringToTokens(String(shortcut));
            const rules = [];
            const baseDecls = [];
            tokens.forEach(token => {
                if (!token || token === shortcutName) return;
                const result = resolveUtility(token);
                if (!result || !result.css) return;
                const tokenSelector = `.${escapeSelector(token)}`;
                if (isSingleRuleForSelector(result.css, tokenSelector)) {
                    baseDecls.push(extractRuleBody(result.css));
                } else {
                    rules.push(result.css.replace(new RegExp(`${tokenSelector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'), selector));
                }
            });
            if (baseDecls.length > 0) rules.unshift(`${selector} { ${baseDecls.filter(Boolean).join(' ')} }`);
            return rules.join('\n');
        } finally {
            activeShortcuts.delete(shortcutName);
        }
    }

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
        'justify': 'justify-content', 'justify-items': 'justify-items', 'justify-self': 'justify-self', 'items': 'align-items', 'align-content': 'align-content', 'self': 'align-self', 'place': 'place-content', 'place-items': 'place-items', 'place-self': 'place-self',
        'pos': 'position', 'z': 'z-index', 'inset': ['top', 'right', 'bottom', 'left'], 'inset-x': ['left', 'right'], 'inset-y': ['top', 'bottom'], 'top': 'top', 'right': 'right', 'bottom': 'bottom', 'left': 'left', 'float': 'float', 'clear': 'clear',
        'opacity': 'opacity', 'shadow': ['--jquan-shadow', 'box-shadow'], 'ring': ['--jquan-ring-width', 'box-shadow'], 'ring-offset': ['--jquan-ring-offset-width', 'box-shadow'], 'blend': 'mix-blend-mode', 'filter': 'filter', 'backdrop': 'backdrop-filter', 'cursor': 'cursor', 'select': 'user-select', 'pointer': 'pointer-events', 'resize': 'resize', 'visible': 'visibility', 'object': 'object-fit', 'object-pos': 'object-position',
        'transition': 'transition', 'duration': 'transition-duration', 'delay': 'transition-delay', 'ease': 'transition-timing-function', 'transform': 'transform', 'origin': 'transform-origin', 'font': 'font',
        'fill': 'fill', 'stroke': 'stroke', 'stroke-w': 'stroke-width', 'overflow': 'overflow', 'overflow-x': 'overflow-x', 'overflow-y': 'overflow-y',
        'clip': 'clip-path', 'mask': ['mask-image', '-webkit-mask-image'], 'mask-size': ['mask-size', '-webkit-mask-size'], 'mask-pos': ['mask-position', '-webkit-mask-position']
    };

    // =============================================
    // 8.0 Jquan v4.62 任意值类型系统（Arbitrary Value Type System）
    // 说明：`text-` / `bg-` / `border-` 等前缀天生多语义（颜色 / 长度 / 图像…）。
    //      旧版只按"是否像颜色"做二分，导致 text-[10px] 被写成 color: 10px。
    //      这里引入显式数据类型提示 + 值形态分类器，做到与 tw 同级的消歧能力。
    // =============================================
    const ARBITRARY_TYPE_HINTS = new Set([
        'length', 'color', 'number', 'integer', 'percentage', 'url', 'image',
        'position', 'angle', 'time', 'ratio', 'family-name', 'string',
        'size', 'line-width', 'shadow', 'variable'
    ]);

    // 剥离 `length:` / `color:` 等数据类型提示前缀
    function splitArbitraryTypeHint(value) {
        const source = String(value == null ? '' : value);
        const matched = source.match(/^([a-z][a-z-]*):([\s\S]+)$/i);
        if (matched && ARBITRARY_TYPE_HINTS.has(matched[1].toLowerCase())) {
            return { hint: matched[1].toLowerCase(), value: matched[2].trim() };
        }
        return { hint: null, value: source };
    }

    const LENGTH_UNIT_PATTERN = /^-?(?:\d+|\d*\.\d+)(?:px|rem|em|ex|ch|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|svw|svh|lvw|lvh|dvw|dvh|cm|mm|in|pt|pc|q|cqw|cqh|cqi|cqb|cqmin|cqmax)$/i;

    // 背景位置关键字 —— 用于 bg-[center] / bg-[top_left] 的语义归位
    const BG_POSITION_KEYWORDS = new Set(['center', 'top', 'bottom', 'left', 'right',
        'top left', 'top right', 'bottom left', 'bottom right',
        'left top', 'right top', 'left bottom', 'right bottom', 'left center', 'right center',
        'center center', 'center top', 'center bottom']);

    // font 简写里除族名外的成分关键字（font-style / font-variant / font-weight / font-stretch / 系统字体）
    const FONT_SHORTHAND_KEYWORDS = new Set([
        'italic', 'oblique', 'small-caps', 'bold', 'bolder', 'lighter',
        'ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed',
        'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded',
        'caption', 'icon', 'menu', 'message-box', 'small-caption', 'status-bar'
    ]);

    // 判断任意值是否为纯 font-family 列表：
    // 逗号分隔的每一段都必须是引号字符串或标识符族名，且不含字号/行高/字重等简写成分
    function isFontFamilyList(value) {
        const raw = String(value == null ? '' : value).trim();
        if (!raw || raw.indexOf('/') !== -1) return false;
        const segments = raw.split(',');
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i].trim();
            if (!segment) return false;
            if (/^["'][^"']*["']$/.test(segment)) continue;
            // 未加引号的族名允许空格分词（Noto Sans），但每个词必须是纯标识符
            const words = segment.split(/\s+/);
            for (let j = 0; j < words.length; j++) {
                const word = words[j];
                if (!/^-?[A-Za-z_][A-Za-z0-9_-]*$/.test(word)) return false;
                if (FONT_SHORTHAND_KEYWORDS.has(word.toLowerCase())) return false;
            }
        }
        return true;
    }

    // 值形态分类器：把任意值归到一个 CSS 数据类型
    function classifyArbitraryValue(value) {
        const raw = String(value == null ? '' : value).trim();
        if (!raw) return 'unknown';
        if (/^var\(/i.test(raw)) return 'variable';
        if (/^url\(/i.test(raw)) return 'url';
        if (/(?:^|\s|,)(?:linear|radial|conic|repeating-linear|repeating-radial|repeating-conic)-gradient\(/i.test(raw)) return 'image';
        if (/^(?:image|image-set|cross-fade|element|paint)\(/i.test(raw)) return 'image';
        if (/^#[0-9a-f]{3,8}$/i.test(raw)) return 'color';
        if (/^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|device-cmyk|light-dark)\(/i.test(raw)) return 'color';
        if (NAMED_CSS_COLORS.has(raw.toLowerCase())) return 'color';
        if (BG_POSITION_KEYWORDS.has(raw.toLowerCase())) return 'position';
        if (/^(?:calc|clamp|min|max)\(/i.test(raw)) return 'length';
        if (LENGTH_UNIT_PATTERN.test(raw)) return 'length';
        if (/^-?(?:\d+|\d*\.\d+)%$/.test(raw)) return 'percentage';
        if (/^-?(?:\d+|\d*\.\d+)(?:deg|rad|grad|turn)$/i.test(raw)) return 'angle';
        if (/^-?(?:\d+|\d*\.\d+)(?:s|ms)$/i.test(raw)) return 'time';
        if (/^-?(?:\d+|\d*\.\d+)$/.test(raw)) return 'number';
        if (/^["']/.test(raw)) return 'string';
        // 单一族名（Inter / "Noto Sans", sans-serif）与 font 简写（700 1rem/1.5 sans-serif）
        // 必须区分：前者是 font-family，后者只能落在 font 简写上
        if (isFontFamilyList(raw)) return 'family-name';
        return 'unknown';
    }


    // 前缀 × 类型 → CSS 属性 的路由表。
    // 值可为：属性名 / 属性名数组 / { css, selector }
    //        / false（显式拒绝，避免产出垃圾声明）
    //        / true（放行给旧决策链处理，用于 ring 这类需要复合 box-shadow 的词条）
    const arbitraryTypeRoutes = {
        'text': {
            color: 'color', length: 'font-size', percentage: 'font-size', size: 'font-size',
            // 字号/颜色之外的形态对 text- 没有任何合法语义，直接拒绝而不是写出废声明
            url: false, image: false, angle: false, time: false, position: false
        },
        'bg': {
            color: 'background-color', url: 'background-image', image: 'background-image',
            length: 'background-size', size: 'background-size', percentage: 'background-size',
            position: 'background-position'
        },
        'border': { color: 'border-color', length: 'border-width', 'line-width': 'border-width' },
        'border-t': { color: 'border-top-color', length: 'border-top-width', 'line-width': 'border-top-width' },
        'border-r': { color: 'border-right-color', length: 'border-right-width', 'line-width': 'border-right-width' },
        'border-b': { color: 'border-bottom-color', length: 'border-bottom-width', 'line-width': 'border-bottom-width' },
        'border-l': { color: 'border-left-color', length: 'border-left-width', 'line-width': 'border-left-width' },
        'border-x': { color: ['border-left-color', 'border-right-color'], length: ['border-left-width', 'border-right-width'], 'line-width': ['border-left-width', 'border-right-width'] },
        'border-y': { color: ['border-top-color', 'border-bottom-color'], length: ['border-top-width', 'border-bottom-width'], 'line-width': ['border-top-width', 'border-bottom-width'] },
        'border-s': { color: 'border-inline-start-color', length: 'border-inline-start-width', 'line-width': 'border-inline-start-width' },
        'border-e': { color: 'border-inline-end-color', length: 'border-inline-end-width', 'line-width': 'border-inline-end-width' },
        'border-bs': { color: 'border-block-start-color', length: 'border-block-start-width', 'line-width': 'border-block-start-width' },
        'border-be': { color: 'border-block-end-color', length: 'border-block-end-width', 'line-width': 'border-block-end-width' },
        'outline': { color: 'outline-color', length: 'outline-width', 'line-width': 'outline-width', number: 'outline-width' },
        'decoration': { color: 'text-decoration-color', length: 'text-decoration-thickness', 'line-width': 'text-decoration-thickness', number: 'text-decoration-thickness' },
        'stroke': { color: 'stroke', length: 'stroke-width', number: 'stroke-width', percentage: 'stroke-width' },
        'divide': {
            color: { css: 'border-color', selector: '& > :not([hidden]) ~ :not([hidden])' },
            // 长度值唯一的合理语义是分割线宽度（旧版会产出 border-color: 2px 这种废声明）
            length: { css: 'border-width', selector: '& > :not([hidden]) ~ :not([hidden])' },
            'line-width': { css: 'border-width', selector: '& > :not([hidden]) ~ :not([hidden])' },
            number: { css: 'border-width', selector: '& > :not([hidden]) ~ :not([hidden])' }
        },
        // ring 宽度需要与 --jquan-ring-shadow / box-shadow 联动，交回旧链保持物理引擎完整
        'ring': { color: '--jquan-ring-color', length: true, 'line-width': true, number: true },
        'ring-offset': { color: '--jquan-ring-offset-color', length: true, 'line-width': true, number: true },
        // unknown 放行给旧链的 font 简写：font-[700_1rem/1.5_sans-serif] 只能落在 font 上
        'font': { number: 'font-weight', integer: 'font-weight', 'family-name': 'font-family', string: 'font-family', unknown: true },
        'caret': { color: 'caret-color' },
        'accent': { color: 'accent-color' },
        'placeholder': { color: { css: 'color', selector: '&::placeholder' } }
    };

    // 依据前缀与类型解析路由。
    // 命中 → { css, selector }；显式拒绝 → 'REJECT'；未命中或放行 → null（交回旧决策链）
    function resolveArbitraryRoute(prefix, type, hint) {
        const routes = arbitraryTypeRoutes[prefix];
        if (!routes) return null;
        // 用户显式写了数据类型提示，但该前缀不支持这个类型 → 这是书写错误，拒绝而非猜测
        if (hint) {
            if (routes[hint] === undefined) return 'REJECT';
            if (routes[hint] === false) return 'REJECT';
            if (routes[hint] === true) return null;
            const hinted = routes[hint];
            if (typeof hinted === 'string' || Array.isArray(hinted)) return { css: hinted, selector: null };
            return { css: hinted.css, selector: hinted.selector || null };
        }
        const route = routes[type];
        if (route === undefined) return null;
        if (route === false) return 'REJECT';
        if (route === true) return null;
        if (typeof route === 'string') return { css: route, selector: null };
        if (Array.isArray(route)) return { css: route, selector: null };
        return { css: route.css, selector: route.selector || null };
    }

    // 判断路由属性与词条原属性是否同源（用于决定能否复用原词条的 fn）
    function arraysShareProps(routeProps, entryProps) {
        const a = Array.isArray(routeProps) ? routeProps : [routeProps];
        const b = Array.isArray(entryProps) ? entryProps : [entryProps];
        return a.some(prop => b.indexOf(prop) !== -1);
    }

    // 行高修饰符刻度（text-sm/6、text-[10px]/[1.2]）
    const lineHeightModifierScale = {
        'none': '1', 'tight': '1.25', 'snug': '1.375', 'normal': '1.5', 'relaxed': '1.625', 'loose': '2',
        '3': '.75rem', '4': '1rem', '5': '1.25rem', '6': '1.5rem', '7': '1.75rem',
        '8': '2rem', '9': '2.25rem', '10': '2.5rem'
    };

    function resolveLineHeightModifier(modifier) {
        if (!modifier) return null;
        if (modifier.startsWith('[') && modifier.endsWith(']')) {
            const inner = modifier.slice(1, -1).replace(/_/g, ' ').trim();
            return inner && isSafeArbitraryValue(inner) ? inner : null;
        }
        if (lineHeightModifierScale[modifier] !== undefined) return lineHeightModifierScale[modifier];
        if (/^\d+(?:\.\d+)?$/.test(modifier)) return `calc(0.25rem * ${modifier})`;
        return null;
    }

    // 找出最后一个"顶层" `/`（不在 [] / () / 引号内），用于切分修饰符
    function findTopLevelSlash(source) {
        let bracket = 0;
        let paren = 0;
        let quote = '';
        let escaped = false;
        let found = -1;
        const str = String(source || '');
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            if (quote) {
                if (escaped) escaped = false;
                else if (char === '\\') escaped = true;
                else if (char === quote) quote = '';
                continue;
            }
            if (char === '"' || char === "'") { quote = char; continue; }
            if (char === '[') { bracket++; continue; }
            if (char === ']') { bracket = Math.max(0, bracket - 1); continue; }
            if (char === '(') { paren++; continue; }
            if (char === ')') { paren = Math.max(0, paren - 1); continue; }
            if (char === '/' && bracket === 0 && paren === 0) found = i;
        }
        return found;
    }

    // =============================================
    // 8.1 JIT 任意值解析辅助函数
    // =============================================
    function isFunctionCall(value) {
        return value.includes('calc(') || 
            value.includes('minmax(') || 
            value.includes('repeat(') || 
            value.includes('clamp(') || 
            value.includes('url(') ||
            value.includes('var(') ||
            value.includes('linear-gradient(') ||
            value.includes('radial-gradient(');
    }

    function cleanArbitraryValue(rawValue) {
        if (rawValue.startsWith('url(')) {
            return rawValue;
        }
        // 🚀 Jquan v4.62：`\_` 视为字面下划线，避免 content-['a\_b'] 被误转成空格
        const unescape = str => str.replace(/\\?_/g, m => (m.length === 2 ? '_' : ' '));
        // 如果是函数调用，保留原始格式但替换下划线为空格
        if (isFunctionCall(rawValue)) {
            return unescape(rawValue);
        }
        // 其他情况，将下划线转换为空格
        return unescape(rawValue);
    }

    function splitClassSegments(raw) {
        const segments = [];
        let current = '';
        let bracketDepth = 0;
        let parenDepth = 0;
        let quote = '';
        let escaped = false;
        for (const char of raw) {
            if (quote) {
                current += char;
                if (escaped) escaped = false;
                else if (char === '\\') escaped = true;
                else if (char === quote) quote = '';
                continue;
            }
            if (char === '"' || char === "'") { quote = char; current += char; continue; }
            if (char === '[') bracketDepth++;
            else if (char === ']') bracketDepth = Math.max(0, bracketDepth - 1);
            else if (char === '(') parenDepth++;
            else if (char === ')') parenDepth = Math.max(0, parenDepth - 1);
            if (char === ':' && bracketDepth === 0 && parenDepth === 0) {
                segments.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        segments.push(current);
        return segments;
    }
    
    // =============================================
    // 8. 核心：解析单个工具类 → CSS 声明 (v4.1 - Jquan JIT 修复版)
    // =============================================

    function resolveUtility(className) {
        let raw = className;
        let variantPrefixes = [];
        let mediaQueries = [];
        let containerQueries = [];
        let atRules = [];
        let selectorWraps = [];
        let fallbackSelectorWraps = [];
        let fallbackMediaQueries = [];
        let fallbackAtRules = [];
        let hasFallbackRule = false;
        let isImportant = false;

        if (raw.startsWith('!')) { isImportant = true; raw = raw.slice(1); }
        const segments = splitClassSegments(raw);
        let cleanUtil = segments.pop();
        variantPrefixes = segments;

        if (cleanUtil.startsWith('!')) { isImportant = true; cleanUtil = cleanUtil.slice(1); }
        // 🚀 Jquan v4.62：对齐 tw v4 的后缀 important 语法（p-4!），同时保留旧的前置 !p-4
        if (cleanUtil.endsWith('!')) { isImportant = true; cleanUtil = cleanUtil.slice(0, -1); }

        let isNegative = false;
        if (cleanUtil.startsWith('-')) { isNegative = true; cleanUtil = cleanUtil.slice(1); }

        // 🚀 Jquan v4.62：斜杠修饰符词法化（仅作用于字号 → 行高复合语法）。
        // 颜色 alpha（text-red-500/50）由 resolveColor 自行消费斜杠，这里不能抢；
        // 分数刻度（w-1/2）更不能被切走。因此只在"头部确实是一个字号工具"时才剥离。
        let sizeModifier = null;
        {
            const slashAt = findTopLevelSlash(cleanUtil);
            if (slashAt > 0 && slashAt < cleanUtil.length - 1) {
                const head = cleanUtil.slice(0, slashAt);
                const tail = cleanUtil.slice(slashAt + 1);
                const headEntry = dictionary[head];
                const isStaticFontSize = headEntry && !headEntry.raw
                    && (Array.isArray(headEntry.css) ? headEntry.css : [headEntry.css]).includes('font-size');
                const isArbitraryFontSize = /^text-\[.+\]$/.test(head);
                if (isStaticFontSize || isArbitraryFontSize) {
                    sizeModifier = tail;
                    cleanUtil = head;
                }
            }
        }

        let entry = null;
        let valueKey = null;
        let bestPrefix = '';
        let finalValue = null;

                // 🚀 1. JIT 任意值解析引擎绝对优先 (JIT Engine First!) - [Jquan v4.5 核心修复]
        // 🚀 Jquan v4.62：新增 prefix-(--var) 简写（等价于 prefix-[var(--var)]），对齐 tw v4
        const cssVarShorthand = cleanUtil.match(/^([a-z][a-z0-9]*(?:-[a-z0-9]+)*)-\((--[A-Za-z0-9_-]+)\)$/);
        if (cssVarShorthand) cleanUtil = `${cssVarShorthand[1]}-[var(${cssVarShorthand[2]})]`;

        const fullArbitraryMatch = cleanUtil.match(/^\[([a-z-][a-z0-9-]*|--[a-z0-9-_]+):(.+)\]$/i);
        const arbMatch = cleanUtil.match(/^([a-z][a-z0-9]*(?:-[a-z0-9]+)*)-\[(.+)\]$/);
        if (fullArbitraryMatch) {
            const arbitraryProp = fullArbitraryMatch[1];
            const arbitraryValue = cleanArbitraryValue(fullArbitraryMatch[2]);
            // 🛡️ v4.62 P0：任意属性值必须通过注入防线，否则整条类丢弃
            if (!isSafeArbitraryProperty(arbitraryProp) || !isSafeArbitraryValue(arbitraryValue)) return null;
            entry = arbitraryProp === 'content'
                ? { css: ['--jquan-content', 'content'], val: `${arbitraryValue}; var(--jquan-content)` }
                : { css: arbitraryProp, val: arbitraryValue };
            valueKey = 'JIT_FULL_ARB';
            bestPrefix = arbitraryProp;
        }
        if (!entry && arbMatch) {
            bestPrefix = arbMatch[1];
            let rawValue = arbMatch[2];

            // 🚀 Jquan v4.62：先剥离数据类型提示（length: / color: / image: …），再做值清洗
            const hintSplit = splitArbitraryTypeHint(rawValue);
            const typeHint = hintSplit.hint;
            rawValue = hintSplit.value;

            // 🚀 Jquan 修复 1：严格声明 arbitraryValue，杜绝 ReferenceError 引擎崩溃
            let arbitraryValue = cleanArbitraryValue(rawValue);

            // 修复 calc() 内运算符缺少空格的问题
            if (!rawValue.startsWith('url(') && arbitraryValue.includes('calc(')) {
                arbitraryValue = arbitraryValue.replace(/calc\(([^)]*)\)/g, (_, inner) => {
                    const fixed = inner.replace(/([0-9%a-zA-Z])([+\-])([0-9%a-zA-Z(])/g, '$1 $2 $3');
                    return `calc(${fixed})`;
                });
            }

            // 🛡️ v4.62 P0：任意值注入防线
            if (!isSafeArbitraryValue(arbitraryValue)) return null;

            const valueType = classifyArbitraryValue(arbitraryValue);
            let jitCssProps = null;
            let jitSelector = null;

            // 🚀 v4.62 P0：类型路由优先 —— 解决 text-[10px] 被写成 color 的语义错误
            const route = resolveArbitraryRoute(bestPrefix, valueType, typeHint);
            if (route === 'REJECT') return null;
            if (route) {
                jitCssProps = Array.isArray(route.css) ? route.css : [route.css];
                jitSelector = route.selector;
            }
            // 背景特化处理 - 修复 bg-[#1e293b] 问题
            else if (bestPrefix === 'content') {
                jitCssProps = ['--jquan-content', 'content'];
            }
            else if (bestPrefix === 'bg') {
                if (arbitraryValue.startsWith('url(') || arbitraryValue.includes('gradient(')) {
                    jitCssProps = ['background-image'];
                } else if (/^(#|rgb|rgba|hsl|hsla|[a-z]+$)/.test(arbitraryValue)) {
                    jitCssProps = ['background-color'];
                } else {
                    jitCssProps = ['background'];
                }
            }
            // raw 复合工具不接受 prefix-[...] 伪任意值，避免生成错误选择器语义
            else if (dictionary[bestPrefix] && dictionary[bestPrefix].raw) {
                jitCssProps = null;
            }
            // 智能颜色探针
            else if (/^(#|rgb|rgba|hsl|hsla|transparent|currentColor)/.test(arbitraryValue) &&
                    dictionary[bestPrefix] && dictionary[bestPrefix].color) {
                jitCssProps = Array.isArray(dictionary[bestPrefix].css) ?
                            dictionary[bestPrefix].css :
                            [dictionary[bestPrefix].css];
            }
            // 对于 grid-cols 等需要特殊处理的前缀
            else if (bestPrefix === 'grid-cols' || bestPrefix === 'grid-rows') {
                jitCssProps = [bestPrefix === 'grid-cols' ? 'grid-template-columns' : 'grid-template-rows'];
            }
            else if (bestPrefix === 'shadow' && dictionary.shadow && dictionary.shadow.css) {
                jitCssProps = dictionary.shadow.css;
            }
            // 借用 jitPropMap
            else if (jitPropMap[bestPrefix]) {
                jitCssProps = Array.isArray(jitPropMap[bestPrefix]) ? 
                            jitPropMap[bestPrefix] : 
                            [jitPropMap[bestPrefix]];
            } 
            // 兜底查系统字典
            else if (dictionary[bestPrefix] && dictionary[bestPrefix].css) {
                jitCssProps = Array.isArray(dictionary[bestPrefix].css) ? 
                            dictionary[bestPrefix].css : 
                            [dictionary[bestPrefix].css];
            } 
            // CSS 原生变量
            else if (bestPrefix.startsWith('--')) {
                jitCssProps = [bestPrefix];
            }

            if (jitCssProps) {
                // 🚀 Jquan 修复 2：将未定义的幽灵变量 prefix 统一替换为正确的 bestPrefix
                const originalEntry = dictionary[bestPrefix];
                // 如果原词条有 fn（如 grid-cols），优先用 fn 处理任意值
                if (bestPrefix === 'content') {
                    entry = { css: jitCssProps, val: `${arbitraryValue}; var(--jquan-content)` };
                } else if (route && originalEntry && typeof originalEntry.fn === 'function'
                            && !arraysShareProps(jitCssProps, originalEntry.css)) {
                    // 🚀 v4.62：类型路由改写了目标属性（如 text-[10px] → font-size），
                    // 此时原词条的 fn（面向 color 等其它语义）不再适用，直接用裸值。
                    entry = { css: jitCssProps, val: arbitraryValue };
                } else if (originalEntry && typeof originalEntry.fn === 'function') {
                    const resolvedVal = originalEntry.fn(arbitraryValue, true);
                    entry = { css: jitCssProps, val: resolvedVal };
                } else {
                    entry = { css: jitCssProps, val: arbitraryValue };
                }
                // 🚀 v4.62：类型路由可携带子选择器（divide-[red] / placeholder-[red]）
                if (jitSelector) entry = Object.assign({}, entry, { selector: jitSelector });
                else if (originalEntry && originalEntry.selector) entry = Object.assign({}, entry, { selector: originalEntry.selector });
                valueKey = 'JIT_ARB';
            } else if (dictionary[bestPrefix]) {
                // 🚀 Jquan 修复 3：同样替换幽灵变量 prefix，清理残留赋值
                if (!dictionary[bestPrefix].raw) {
                    entry = dictionary[bestPrefix];
                    valueKey = null;
                }
            }
        }

        // 2. 静态字典与前缀推导 (没有 [] 包裹的常规流程)
        if (!entry) {
            bestPrefix = '';
            if (dictionary[cleanUtil]) { 
                entry = dictionary[cleanUtil]; 
                valueKey = 'DEFAULT'; 
                bestPrefix = cleanUtil; 
            }
            if (!entry) {
                for (const key in dictionary) {
                    if (dictionary[key].raw) continue;
                    if (cleanUtil.startsWith(key + '-') && key.length > bestPrefix.length) {
                        bestPrefix = key;
                    }
                }
                if (!bestPrefix && /^shadow-/.test(cleanUtil)) {
                    bestPrefix = 'shadow';
                }
                if (bestPrefix) { 
                    entry = dictionary[bestPrefix]; 
                    valueKey = cleanUtil.slice(bestPrefix.length + 1); 
                }
            }
        }

        // 3. 外部插件动态路由层 (Plugins Gateway)
        if (!entry && dynamicPluginMatchers.length > 0) {
            for (const matcher of dynamicPluginMatchers) {
                if (cleanUtil.startsWith(matcher.prefix + '-')) {
                    let dynamicValue = cleanUtil.slice(matcher.prefix.length + 1);
                    if (dynamicValue.startsWith('[') && dynamicValue.endsWith(']')) {
                        let rawValue = dynamicValue.slice(1, -1);
                        dynamicValue = cleanArbitraryValue(rawValue);
                    }
                    const generatedRule = matcher.fn(dynamicValue); 
                    if (generatedRule && generatedRule.css) {
                        entry = generatedRule;
                        bestPrefix = matcher.prefix;
                        valueKey = 'PLUGIN_GEN';
                        if (generatedRule.val) finalValue = generatedRule.val;
                        break;
                    }
                }
            }
        }

        if (!entry) return null;

        // 🚀 Jquan v3.7 防御性方括号剥离 — 杜绝残留的 [...] 被 fn 误处理
        if (valueKey && typeof valueKey === 'string') {
            const bracketMatch = valueKey.match(/^\[(.+)\]$/);
            if (bracketMatch) {
                // valueKey 本身就是 [xxx]，直接作为任意值
                let realValue = bracketMatch[1]; // 已去掉 []
                // 还原下划线空格
                if (!realValue.startsWith('url(') && 
                    !realValue.includes('calc(') && 
                    !realValue.includes('minmax(')) {
                    realValue = realValue.replace(/_/g, ' ');
                }
                
                // 如果原来 finalValue 还没设置，直接设置为真实值；否则覆盖（安全起见）
                finalValue = realValue;
                valueKey = 'JIT_ARB_FALLBACK';
                // 如果 entry.css 为数组，保留；若为字符串且是颜色处理，保持
                // 不需要修改 entry.css，因为 buildDeclarations 会直接使用 finalValue
            }
        }

        // 4. 真实属性值计算引擎 (仅限 finalValue 还没被 JIT 引擎或上面方括号剥离赋值的情况)
        if (finalValue === null) {
            if (entry.val !== undefined) {
                finalValue = entry.val;
            } else if (entry.color && valueKey) {
                const colorVal = resolveColor(valueKey);
                if (colorVal) finalValue = colorVal;
                else {
                    const isBorderWidth = /^(border(-(t|r|b|l|x|y|s|e))?)$/.test(bestPrefix);
                    if (isBorderWidth && borders[valueKey]) {
                        const sideMap = { 'border': 'border-width', 'border-t': 'border-top-width', 'border-r': 'border-right-width', 'border-b': 'border-bottom-width', 'border-l': 'border-left-width', 'border-x': ['border-left-width', 'border-right-width'], 'border-y': ['border-top-width', 'border-bottom-width'], 'border-s': 'border-inline-start-width', 'border-e': 'border-inline-end-width' };
                        entry = { css: sideMap[bestPrefix], scale: borders };
                        finalValue = borders[valueKey];
                    }
                }
            } else if ((bestPrefix === 'ring' || bestPrefix === 'ring-offset') && valueKey && entry.values && entry.values[valueKey] === undefined) {
                const colorVal = resolveColor(valueKey);
                if (colorVal) {
                    entry = { css: bestPrefix === 'ring' ? '--jquan-ring-color' : '--jquan-ring-offset-color', color: true };
                    finalValue = colorVal;
                }
            } else if (bestPrefix === 'shadow' && valueKey && entry.values && entry.values[valueKey] === undefined) {
                const colorChannels = resolveColorChannels(valueKey);
                const colorValue = resolveColor(valueKey);
                if (colorValue) {
                    entry = { css: ['--jquan-shadow-color', '--jquan-shadow-color-css', 'box-shadow'] };
                    finalValue = `${colorChannels || '0 0 0'}; ${colorValue}; var(--jquan-ring-offset-shadow), var(--jquan-ring-shadow), var(--jquan-shadow)`;
                }
            } else if (entry.fn && valueKey) {
                let mappedVal = null;
                if (entry.scale && entry.scale[valueKey] !== undefined) mappedVal = entry.scale[valueKey];
                else if (entry.values && entry.values[valueKey] !== undefined) mappedVal = entry.values[valueKey];
                finalValue = entry.fn(mappedVal !== null ? mappedVal : valueKey, false);
            } else if (entry.values && valueKey) {
                finalValue = entry.values[valueKey];
            } else if (entry.scale && valueKey) {
                finalValue = entry.scale[valueKey];
            }
        }

        // 光环系统补丁
        if ((finalValue === undefined || finalValue === null) && (bestPrefix === 'ring' || bestPrefix === 'ring-offset')) {
            const colorVal = resolveColor(valueKey);
            if (colorVal) {
                entry = { css: bestPrefix === 'ring' ? '--jquan-ring-color' : '--jquan-ring-offset-color', color: true };
                finalValue = colorVal;
            }
        }

        if ((finalValue === undefined || finalValue === null) && bestPrefix === 'shadow') {
            const colorChannels = resolveColorChannels(valueKey);
            const colorValue = resolveColor(valueKey);
            if (colorValue) {
                entry = { css: ['--jquan-shadow-color', '--jquan-shadow-color-css', 'box-shadow'] };
                finalValue = `${colorChannels || '0 0 0'}; ${colorValue}; var(--jquan-ring-offset-shadow), var(--jquan-ring-shadow), var(--jquan-shadow)`;
            }
        }

        if ((finalValue === undefined || finalValue === null) && !entry.raw) return null;

        // 🚀 Jquan v4.62 P0-3：消费斜杠修饰符 —— 字号/行高复合语法（text-sm/6、text-[10px]/[1.2]）
        if (sizeModifier !== null) {
            const lineHeight = resolveLineHeightModifier(sizeModifier);
            if (lineHeight === null) return null;
            const cssList = Array.isArray(entry.css) ? entry.css.slice() : [entry.css];
            const lhIndex = cssList.indexOf('line-height');
            if (lhIndex !== -1) {
                const values = splitDeclarationValues(finalValue);
                const filled = cssList.map((_, i) => (values[i] !== undefined ? values[i] : values[0]));
                filled[lhIndex] = lineHeight;
                entry = Object.assign({}, entry, { css: cssList });
                finalValue = filled.join('; ');
            } else {
                cssList.push('line-height');
                entry = Object.assign({}, entry, { css: cssList });
                finalValue = `${finalValue}; ${lineHeight}`;
            }
        }

        // 负值逻辑推导
        if (isNegative && typeof finalValue === 'string') {
            if (finalValue.match(/^[0-9]/)) finalValue = '-' + finalValue;
            else if (finalValue.startsWith('-')) finalValue = finalValue.slice(1);
        }

        if (bestPrefix === 'from') {
            entry = { css: ['--jquan-gradient-from', '--jquan-gradient-stops'] };
            finalValue = `${finalValue}; var(--jquan-gradient-from), var(--jquan-gradient-to, transparent)`;
        } else if (bestPrefix === 'via') {
            entry = { css: ['--jquan-gradient-via', '--jquan-gradient-stops'] };
            finalValue = `${finalValue}; var(--jquan-gradient-from), var(--jquan-gradient-via, transparent), var(--jquan-gradient-to, transparent)`;
        } else if (bestPrefix === 'to') {
            entry = { css: ['--jquan-gradient-to', '--jquan-gradient-stops'] };
            finalValue = `${finalValue}; var(--jquan-gradient-from), var(--jquan-gradient-to)`;
        } else if (bestPrefix === 'shadow-color') {
            const shadowChannels = resolveColorChannels(valueKey);
            const shadowColor = resolveColor(valueKey);
            if (!shadowColor) return null;
            entry = { css: ['--jquan-shadow-color', '--jquan-shadow-color-css', 'box-shadow'] };
            finalValue = `${shadowChannels || '0 0 0'}; ${shadowColor}; var(--jquan-ring-offset-shadow), var(--jquan-ring-shadow), var(--jquan-shadow)`;
        } else if (Array.isArray(entry.css) && entry.css[0] === '--jquan-shadow' && entry.css.includes('box-shadow')) {
            const shadowValues = splitDeclarationValues(finalValue);
            if (shadowValues.length < 3) finalValue = `${finalValue}; ${modernizeShadowValue(finalValue)}; var(--jquan-ring-offset-shadow), var(--jquan-ring-shadow), var(--jquan-shadow)`;
        } else if (Array.isArray(entry.css) && entry.css[0] === '--jquan-ring-width' && entry.css[1] === 'box-shadow') {
            finalValue = `${finalValue}; var(--jquan-ring-offset-shadow), var(--jquan-ring-shadow), var(--jquan-shadow)`;
        } else if (Array.isArray(entry.css) && entry.css[0] === '--jquan-ring-offset-width' && entry.css[1] === 'box-shadow') {
            finalValue = `${finalValue}; var(--jquan-ring-offset-shadow), var(--jquan-ring-shadow), var(--jquan-shadow)`;
        }

        let escapedClass = escapeSelector(className);
        let baseSelector = `.${escapedClass}`;
        if (entry.selector) baseSelector = entry.selector.replace('&', baseSelector);

        for (const variant of variantPrefixes) {
            const variantDef = variants[variant] || resolveDynamicVariant(variant);
            if (!variantDef) {
                if (variant.startsWith('@')) {
                    const containerVariant = resolveContainerVariant(variant);
                    if (!containerVariant || containerVariant.invalid) return null;
                    containerQueries.push(containerVariant.container);
                    continue;
                }
                if (variant.startsWith('[') && variant.endsWith(']')) {
                    const customSelector = variant.slice(1, -1).replace(/_/g, ' ');
                    // 🛡️ v4.62 P0-1：任意选择器变体同样是注入面，含 { } ; 的一律丢弃
                    if (!isSafeArbitraryFragment(customSelector)) return null;
                    const wrap = sel => customSelector.includes('&') ? customSelector.replace(/&/g, sel) : `${sel}${customSelector}`;
                    selectorWraps.push(wrap);
                    fallbackSelectorWraps.push(wrap);
                }
                continue;
            }
            if (variantDef.invalid) return null;
            if (typeof variantDef === 'string') {
                const wrap = variantDef.includes('&') ? (sel => variantDef.replace('&', sel)) : (sel => `${sel}${variantDef}`);
                selectorWraps.push(wrap);
                fallbackSelectorWraps.push(wrap);
                continue;
            }
            if (variantDef.media) mediaQueries.push(variantDef.media);
            if (variantDef.media && !variantDef.fallbackMedia) fallbackMediaQueries.push(variantDef.media);
            if (variantDef.container) containerQueries.push(variantDef.container);
            if (variantDef.atRule) {
                atRules.push(variantDef.atRule);
                fallbackAtRules.push(variantDef.atRule);
            }
            if (variantDef.selector) {
                const selectorFn = variantDef.selector;
                const wrap = sel => typeof selectorFn === 'function' ? selectorFn(sel) : selectorFn.replace('&', sel);
                selectorWraps.push(wrap);
                if (!variantDef.fallbackSelector) fallbackSelectorWraps.push(wrap);
            }
            if (variantDef.fallbackSelector) {
                hasFallbackRule = true;
                const fallbackSelector = variantDef.fallbackSelector;
                fallbackSelectorWraps.push(sel => typeof fallbackSelector === 'function' ? fallbackSelector(sel) : fallbackSelector.replace('&', sel));
            }
            if (variantDef.fallbackMedia) {
                hasFallbackRule = true;
                fallbackMediaQueries.push(variantDef.fallbackMedia);
            }
        }

        let finalSelector = baseSelector;
        for (const wrap of selectorWraps) finalSelector = wrap(finalSelector);

        const buildRuleForSelector = selector => {
            if (entry.raw) {
                return typeof entry.raw === 'function' ? entry.raw(selector, finalValue, { className, isImportant }) : entry.raw;
            }
            // 滤镜隐式管道自动追加
            let filterAppend = '';
            const cssPropsArr = Array.isArray(entry.css) ? entry.css : [entry.css];
            if (cssPropsArr.some(p => p.startsWith('--jquan-') && ['blur', 'brightness', 'contrast', 'drop-shadow', 'grayscale', 'hue-rotate', 'invert', 'saturate', 'sepia'].includes(p.replace('--jquan-', '')))) {
                const filterStr = 'var(--jquan-blur) var(--jquan-brightness) var(--jquan-contrast) var(--jquan-grayscale) var(--jquan-hue-rotate) var(--jquan-invert) var(--jquan-saturate) var(--jquan-sepia) var(--jquan-drop-shadow)';
                filterAppend = isImportant ? ` filter: ${filterStr} !important;` : ` filter: ${filterStr};`;
            } else if (cssPropsArr.some(p => p.startsWith('--jquan-backdrop-'))) {
                const backdropStr = 'var(--jquan-backdrop-blur) var(--jquan-backdrop-brightness) var(--jquan-backdrop-contrast) var(--jquan-backdrop-grayscale) var(--jquan-backdrop-hue-rotate) var(--jquan-backdrop-invert) var(--jquan-backdrop-opacity) var(--jquan-backdrop-saturate) var(--jquan-backdrop-sepia)';
                filterAppend = isImportant ? ` backdrop-filter: ${backdropStr} !important; -webkit-backdrop-filter: ${backdropStr} !important;` : ` backdrop-filter: ${backdropStr}; -webkit-backdrop-filter: ${backdropStr};`;
            }

            const generatesPseudoContent = variantPrefixes.some(variant => variant === 'before' || variant === 'after');
            const contentDefault = generatesPseudoContent && !cssPropsArr.includes('content')
                ? `content: var(--jquan-content, "")${isImportant ? ' !important' : ''}; `
                : '';
            const declarations = contentDefault + buildDeclarations(entry.css, finalValue, isImportant) + filterAppend;
            let rule = `${selector} { ${declarations} }`;
            if (entry.decoration === 'border-gradient') {
                rule += `\n${selector} { position: relative; border-color: transparent; }\n${selector}::after { content: ""; position: absolute; inset: -2px; border-radius: inherit; padding: 2px; background: var(--jquan-border-gradient); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }`;
            } else if (entry.decoration === 'ring-gradient') {
                rule += `\n${selector} { position: relative; }\n${selector}::before { content: ""; position: absolute; inset: calc(-1 * var(--jquan-ring-width, 4px)); border-radius: inherit; background: var(--jquan-ring-gradient); z-index: -2; pointer-events: none; filter: blur(2px); opacity: 0.8; }`;
            }
            return rule;
        };

        const wrapAtRules = (rule, cqList, mqList, arbitraryAtRules = []) => {
            for (const cq of cqList) rule = `${cq} { ${rule} }`;
            for (const mq of mqList) rule = `${mq} { ${rule} }`;
            for (const atRule of arbitraryAtRules) rule = `${atRule} { ${rule} }`;
            return rule;
        };

        let cssRule = buildRuleForSelector(finalSelector);
        cssRule = wrapAtRules(cssRule, containerQueries, mediaQueries, atRules);

        if (hasFallbackRule) {
            let fallbackSelector = baseSelector;
            for (const wrap of fallbackSelectorWraps) fallbackSelector = wrap(fallbackSelector);
            const fallbackRule = wrapAtRules(buildRuleForSelector(fallbackSelector), containerQueries, fallbackMediaQueries, fallbackAtRules);
            cssRule = `${cssRule}\n${fallbackRule}`;
        }

        return { className, css: cssRule, mediaQuery: mediaQueries.length > 0 ? mediaQueries : null };
    }

    // =============================================
    // 9. CSS 选择器转义 (Jquan v3.7 架构级修复)
    // =============================================
    function escapeSelector(str) {
        let escaped = str.replace(/^(-?)([0-9])/, (match, sign, digit) => {
            return `${sign}\\3${digit} `;
        });
        // 🚀 Jquan 核心修复：# 符号在 CSS 选择器中是 ID 标识符，绝对必须转义！
        // 同步增加对 #、&、"、' 的转义支持，完美适配所有的 JIT 任意值
        escaped = escaped.replace(/([\/\[\]:!%.@,(){}+>~=*^$|#"&'])/g, '\\$1');
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
    let preflight = `
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
    --jquan-shadow-color-css: rgb(0 0 0);
    --jquan-ring-offset-shadow: var(--jquan-ring-inset) 0 0 0 var(--jquan-ring-offset-width) var(--jquan-ring-offset-color);
    --jquan-ring-shadow: var(--jquan-ring-inset) 0 0 0 calc(var(--jquan-ring-width, 0px) + var(--jquan-ring-offset-width)) var(--jquan-ring-color);
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
    --jquan-shadow-color-css: rgb(0 0 0);
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
    --jquan-gradient-via: transparent;
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
    // 13. 渲染隔离层 (Variables & Rules) & 水合缓存引擎
    // =============================================
    function canUseConstructableStylesheets() {
        const config = window.JQUAN_CONFIG || (window.JquanUI && window.JquanUI.config) || {};
        return config.constructableStylesheets !== false
            && typeof window.CSSStyleSheet === 'function'
            && typeof window.CSSStyleSheet.prototype.replaceSync === 'function'
            && 'adoptedStyleSheets' in document;
    }

    function adoptSheet(root, sheet) {
        if (!root || !sheet || !('adoptedStyleSheets' in root)) return false;
        try {
            const sheets = Array.from(root.adoptedStyleSheets || []);
            if (!sheets.includes(sheet)) root.adoptedStyleSheets = sheets.concat(sheet);
            return true;
        } catch (e) { return false; }
    }

    function removeAdoptedSheet(root, sheet) {
        if (!root || !sheet || !('adoptedStyleSheets' in root)) return false;
        try {
            root.adoptedStyleSheets = Array.from(root.adoptedStyleSheets || []).filter(item => item !== sheet);
            return true;
        } catch (e) { return false; }
    }

    function createStyleTarget(id) {
        if (canUseConstructableStylesheets()) {
            try {
                const sheet = new window.CSSStyleSheet();
                const target = {
                    id,
                    mode: 'constructable',
                    sheet,
                    _textContent: '',
                    set textContent(value) {
                        this._textContent = value || '';
                        this.sheet.replaceSync(this._textContent);
                    },
                    get textContent() { return this._textContent; },
                    adopt(root) { return adoptSheet(root, this.sheet); },
                    detach(root) { return removeAdoptedSheet(root, this.sheet); }
                };
                if (target.adopt(document)) return target;
            } catch (e) { /* fall through to the CSP-compatible style element */ }
        }

        const element = document.createElement('style');
        element.id = id;
        document.head.appendChild(element);
        return {
            id,
            mode: 'style',
            element,
            get sheet() { return element.sheet; },
            get textContent() { return element.textContent; },
            set textContent(value) { element.textContent = value || ''; },
            adopt() { return false; },
            detach() { return false; }
        };
    }

    // 🚀 双引擎标签分离：一个管变量（主题），一个管规则（类名），彻底解耦
    const themeStyleEl = createStyleTarget('jquan-css-theme-vars');
    const styleEl = createStyleTarget('jquan-css-runtime');

    let processedClasses = new Set();
    let sheetInitialized = false;
    let dynamicRules = []; 
    let dynamicRuleRecords = [];
    let baseRuleCount = 0;
    const debugState = {
        scans: 0,
        hydrate: 'pending',
        lastCacheBytes: 0,
        lastPersistAt: null,
        insertedRules: 0,
        unresolvedClasses: [],
        failedRules: [],
        conflicts: [],
        scanDurations: [],
        queueDurations: [],
        resolveCount: 0,
        cacheHydrateMs: 0,
        slowestResolve: null,
        prefetchCount: 0,
        prefetchResolved: 0,
        prefetchSkipped: 0,
        prefetchBytes: 0
    };

    function runtimeNow() {
        return typeof performance !== 'undefined' && typeof performance.now === 'function'
            ? performance.now()
            : Date.now();
    }

    function rememberDuration(list, value, limit = 40) {
        list.push(Number(value.toFixed(2)));
        if (list.length > limit) list.splice(0, list.length - limit);
    }

    function rememberDebugItem(list, item, limit = 80) {
        list.push(Object.assign({ at: Date.now() }, item));
        if (list.length > limit) list.splice(0, list.length - limit);
    }

    // 🚀 Jquan P8 修复：将函数也转换为字符串计算，杜绝插件修改导致的缓存不更新！
    function getConfigHash() {
        const conf = window.JquanUI?.config || window.JQUAN_CONFIG || {};
        const str = JSON.stringify(conf, (key, val) => typeof val === 'function' ? val.toString() : val);
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
        return hash.toString(36);
    }

    // 🚀 [修正版] 变体组剥洋葱算法 (占位符掩护法，完美兼容 JIT)
    function expandVariantGroups(str) {
        if (!str || !str.includes('(')) return str;
        const arbitaryValues = [];
        let maskedStr = str.replace(/\[(.*?)]/g, (match) => {
            arbitaryValues.push(match);
            return `__JQUAN_ARB_${arbitaryValues.length - 1}__`;
        });

        let expanded = maskedStr;
        let previous;
        do {
            previous = expanded;
            expanded = expanded.replace(/([^\s(]+?:)\(\s*([^)]+?)\s*\)/g, (match, prefix, content) => {
                return content.trim().split(/\s+/).map(cls => `${prefix}${cls}`).join(' ');
            });
        } while (expanded !== previous);

        arbitaryValues.forEach((val, index) => {
            expanded = expanded.replace(`__JQUAN_ARB_${index}__`, val);
        });
        return expanded;
    }

    function classStringToTokens(classString) {
        if (typeof classString !== 'string') return [];
        return expandVariantGroups(classString).split(/\s+/).filter(Boolean);
    }

    function conflictKeyForClass(className) {
        const util = className.split(':').pop().replace(/^!/, '');
        if (/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden|contents|flow-root|table|inline-table)$/.test(util)) return 'display';
        if (/^(static|fixed|absolute|relative|sticky)$/.test(util)) return 'position';
        if (/^overflow(-[xy])?-/.test(util)) return util.startsWith('overflow-x-') ? 'overflow-x' : util.startsWith('overflow-y-') ? 'overflow-y' : 'overflow';
        if (/^-?p[trblxyse]?[-\[]/.test(util)) return util.match(/^-?(p[trblxyse]?)/)[1];
        if (/^-?m[trblxyse]?[-\[]/.test(util)) return util.match(/^-?(m[trblxyse]?)/)[1];
        if (/^(w|min-w|max-w|h|min-h|max-h|size)-/.test(util)) return util.match(/^(w|min-w|max-w|h|min-h|max-h|size)-/)[1];
        if (/^-?(top|right|bottom|left|inset|inset-x|inset-y)-/.test(util)) return util.match(/^-?(top|right|bottom|left|inset|inset-x|inset-y)-/)[1];
        if (/^text-/.test(util)) return /^text-(left|center|right|justify|start|end)$/.test(util) ? 'text-align' : 'text';
        if (/^bg-/.test(util) && !/^bg-(gradient|clip|origin|repeat|no-repeat|auto|cover|contain|fixed|local|scroll|center|top|bottom|left|right)/.test(util)) return 'background-color';
        if (/^border(-(t|r|b|l|x|y|s|e))?-\d/.test(util) || /^border-\d/.test(util)) return util.match(/^border-(t|r|b|l|x|y|s|e)/)?.[0] || 'border-width';
        if (/^rounded/.test(util)) return util.match(/^rounded-(t|r|b|l|tl|tr|bl|br|ss|se|es|ee)/)?.[0] || 'rounded';
        if (/^shadow($|-)/.test(util)) return 'shadow';
        if (/^ring($|-\d|-\[)/.test(util)) return 'ring-width';
        return null;
    }

    function detectClassConflicts(tokens, node) {
        const seen = new Map();
        tokens.forEach(cls => {
            const key = conflictKeyForClass(cls);
            if (!key) return;
            if (!seen.has(key)) {
                seen.set(key, cls);
                return;
            }
            const previous = seen.get(key);
            if (previous !== cls) {
                rememberDebugItem(debugState.conflicts, {
                    group: key,
                    classes: [previous, cls],
                    className: node && node.getAttribute ? node.getAttribute('class') : ''
                });
            }
            seen.set(key, cls);
        });
    }

    function collectClassTokens(node, targetSet) {
        if (!node || !targetSet) return;
        let tokens = [];
        if (node.getAttribute) {
            tokens = classStringToTokens(node.getAttribute('class'));
        } else if (node.classList) {
            tokens = Array.from(node.classList);
        }
        tokens.forEach(cls => targetSet.add(cls));
        if (debugConflictTracking && tokens.length > 1) detectClassConflicts(tokens, node);
    }

    function hydrateFromCache() {
        const startedAt = runtimeNow();
        try {
            const cacheRaw = localStorage.getItem(CACHE_KEY);
            if (!cacheRaw) { debugState.hydrate = 'miss'; debugState.cacheHydrateMs = runtimeNow() - startedAt; return false; }
            
            const cache = JSON.parse(cacheRaw);
            const currentHash = getConfigHash(); // 使用安全的 Hash 计算器
            if (cache.v !== ENGINE_VERSION || cache.hash !== currentHash || !Array.isArray(cache.classes) || !Array.isArray(cache.rules) || cache.classes.length > MAX_RUNTIME_RULES || cache.rules.length > MAX_RUNTIME_RULES || cacheRaw.length > MAX_CACHE_BYTES || cache.rules.some(rule => typeof rule !== 'string' || /<\/?style/i.test(rule))) {
                localStorage.removeItem(CACHE_KEY);
                debugState.hydrate = 'invalid';
                debugState.cacheHydrateMs = runtimeNow() - startedAt;
                return false;
            }
            processedClasses = new Set(cache.classes);
            dynamicRules = cache.rules || [];
            debugState.hydrate = 'hit';
            debugState.cacheHydrateMs = runtimeNow() - startedAt;
            return true;
        } catch (e) { debugState.hydrate = 'error'; debugState.cacheHydrateMs = runtimeNow() - startedAt; return false; }
    }
    let saveCacheTimer = null;
    function buildCacheData() {
        const hash = getConfigHash();
        let classes = Array.from(processedClasses).slice(-MAX_RUNTIME_RULES);
        let rules = dynamicRules.slice(-MAX_RUNTIME_RULES);
        let cacheData = { v: ENGINE_VERSION, hash, classes, rules };
        while (JSON.stringify(cacheData).length > MAX_CACHE_BYTES && rules.length > 0) {
            const dropCount = Math.max(1, Math.ceil(rules.length * 0.15));
            rules = rules.slice(dropCount);
            classes = classes.slice(dropCount);
            cacheData = { v: ENGINE_VERSION, hash, classes, rules };
        }
        return cacheData;
    }

    function persistToCache() {
        if (saveCacheTimer) clearTimeout(saveCacheTimer);
        saveCacheTimer = setTimeout(() => {
            try {
                const cacheData = buildCacheData();
                const cacheJson = JSON.stringify(cacheData);
                localStorage.setItem(CACHE_KEY, cacheJson);
                debugState.lastCacheBytes = cacheJson.length;
                debugState.lastPersistAt = Date.now();
            } catch (e) {}
        }, 1200);
    }

    const CASCADE_LAYER_ORDER = '@layer jquan-reset, jquan-theme, jquan-components, jquan-utilities;';

    function renderThemeStyles(specificSemantic = null) {
        const css = generateThemeVariables(specificSemantic);
        if (!cascadeLayersEnabled) return css;
        return `${CASCADE_LAYER_ORDER}\n${css ? `@layer jquan-theme { ${css} }` : ''}`;
    }

    function renderBaseStyles(pluginInjections = '') {
        const keyframes = globalKeyframes + (customKeyframesCSS ? `\n${customKeyframesCSS}` : '');
        if (!cascadeLayersEnabled) return preflight + pluginInjections + cssVariablesInit + keyframes;
        const resetLayer = `@layer jquan-reset { ${preflight}\n${cssVariablesInit} }`;
        const componentsLayer = pluginInjections ? `\n@layer jquan-components { ${pluginInjections} }` : '';
        return `${CASCADE_LAYER_ORDER}\n${resetLayer}${componentsLayer}\n${keyframes}`;
    }

    function renderUtilityRule(rule) {
        return cascadeLayersEnabled ? `@layer jquan-utilities { ${rule} }` : rule;
    }

    // Jquan v4.63：原子类的最终结果不能依赖 DOM/class 扫描顺序。
    // 先按层和变体排序，再按 CSS 属性拓扑排序，保证 shorthand 在 longhand 之前。
    const CASCADE_PROPERTY_ORDER = [
        'all', 'content', 'position', 'inset', 'inset-inline', 'inset-block', 'top', 'right', 'bottom', 'left', 'z-index',
        'margin', 'margin-inline', 'margin-block', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'box-sizing', 'display', 'visibility', 'float', 'clear', 'isolation', 'aspect-ratio',
        'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height',
        'flex', 'flex-flow', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis',
        'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row', 'gap', 'column-gap', 'row-gap',
        'justify-content', 'justify-items', 'justify-self', 'align-content', 'align-items', 'align-self', 'place-content', 'place-items', 'place-self',
        'overflow', 'overflow-x', 'overflow-y', 'overscroll-behavior', 'padding', 'padding-inline', 'padding-block',
        'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'font', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-align', 'color',
        'background', 'background-color', 'background-image', 'background-size', 'background-position',
        'border', 'border-width', 'border-style', 'border-color', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
        'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
        'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
        'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
        'outline', 'outline-width', 'outline-color', 'opacity', 'box-shadow', 'filter', 'backdrop-filter',
        'transform', 'transform-origin', 'transition', 'animation', 'cursor', 'pointer-events'
    ];
    const CASCADE_PROPERTY_RANK = new Map(CASCADE_PROPERTY_ORDER.map((property, index) => [property, index]));
    const CASCADE_PHYSICAL_GROUPS = [
        { all: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'], inline: ['margin-left', 'margin-right'], block: ['margin-top', 'margin-bottom'], base: 'margin', inlineBase: 'margin-inline', blockBase: 'margin-block' },
        { all: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'], inline: ['padding-left', 'padding-right'], block: ['padding-top', 'padding-bottom'], base: 'padding', inlineBase: 'padding-inline', blockBase: 'padding-block' },
        { all: ['top', 'right', 'bottom', 'left'], inline: ['left', 'right'], block: ['top', 'bottom'], base: 'inset', inlineBase: 'inset-inline', blockBase: 'inset-block' }
    ];
    const CASCADE_BORDER_GROUPS = [
        { all: ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'], inline: ['border-left-width', 'border-right-width'], block: ['border-top-width', 'border-bottom-width'], base: 'border-width' },
        { all: ['border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style'], inline: ['border-left-style', 'border-right-style'], block: ['border-top-style', 'border-bottom-style'], base: 'border-style' },
        { all: ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'], inline: ['border-left-color', 'border-right-color'], block: ['border-top-color', 'border-bottom-color'], base: 'border-color' }
    ];

    function cascadePropertyRank(property) {
        return CASCADE_PROPERTY_RANK.has(property) ? CASCADE_PROPERTY_RANK.get(property) : 9000;
    }

    function rulePropertyRank(rule) {
        const properties = [];
        const declarationPattern = /(?:^|[;{]\s*)(--[A-Za-z0-9_-]+|-[A-Za-z0-9_-]+|[A-Za-z][A-Za-z0-9-]*)\s*:/g;
        let match;
        while ((match = declarationPattern.exec(String(rule || '')))) properties.push(match[1]);
        if (properties.length === 0) return 10000;

        const propertySet = new Set(properties);
        for (const group of CASCADE_PHYSICAL_GROUPS) {
            if (group.all.every(property => propertySet.has(property))) return cascadePropertyRank(group.base);
            if (group.inline.every(property => propertySet.has(property))) return cascadePropertyRank(group.inlineBase);
            if (group.block.every(property => propertySet.has(property))) return cascadePropertyRank(group.blockBase);
        }
        for (const group of CASCADE_BORDER_GROUPS) {
            if (group.all.every(property => propertySet.has(property))) return cascadePropertyRank(group.base);
            if (group.inline.every(property => propertySet.has(property))) return cascadePropertyRank(group.base);
            if (group.block.every(property => propertySet.has(property))) return cascadePropertyRank(group.base);
        }
        return Math.min(...properties.map(cascadePropertyRank));
    }

    function ruleAtRuleRank(rule) {
        const source = String(rule || '').trim();
        if (/^@starting-style\b/i.test(source)) return 500;
        if (/^@container\b/i.test(source)) return 400;
        if (/^@media\b/i.test(source)) return 300;
        if (/^@supports\b/i.test(source)) return 200;
        if (/^@layer\b/i.test(source)) return 150;
        return /(?:\\:|:hover|:focus|:active|:visited|:disabled|:checked|:has\(|\[[^\]]+\])/.test(source) ? 100 : 0;
    }

    function ruleMediaRank(rule) {
        const match = String(rule || '').match(/(?:min-width|width\s*>=)\s*:?\s*(\d+(?:\.\d+)?)(px|rem|em)?/i);
        return match ? Number(match[1]) * (match[2] === 'rem' || match[2] === 'em' ? 16 : 1) : 0;
    }

    function makeRuleOrder(className, rule) {
        return {
            important: /!important\b/.test(String(rule || '')) ? 1 : 0,
            atRule: ruleAtRuleRank(rule),
            media: ruleMediaRank(rule),
            property: rulePropertyRank(rule),
            selector: String(rule || '').slice(0, String(rule || '').indexOf('{')).trim(),
            className: String(className || ''),
            rule: String(rule || '')
        };
    }

    function compareRuleOrder(left, right) {
        for (const key of ['important', 'atRule', 'media', 'property']) {
            if (left[key] !== right[key]) return left[key] - right[key];
        }
        const selectorOrder = left.selector.localeCompare(right.selector);
        if (selectorOrder !== 0) return selectorOrder;
        const classOrder = left.className.localeCompare(right.className);
        return classOrder !== 0 ? classOrder : left.rule.localeCompare(right.rule);
    }

    // 🛡️ Jquan v4.62 P0-1：缓存回填改走 CSSOM
    // 旧版把缓存规则用 textContent 字符串拼回 <style>，等于绕过了浏览器解析器这道闸——
    // 一旦历史缓存里存在越界规则（或 localStorage 被同源脚本改写），会被原样信任。
    // 现在 base 走 textContent（它由引擎自身生成，可信），缓存规则逐条 insertRule：
    // 非法规则会被解析器直接抛错丢弃，且不会污染后续规则。
    function injectRulesViaCSSOM(rules) {
        const sheet = styleEl.sheet;
        if (!sheet) return rules.slice();
        const accepted = [];
        const records = rules
            .filter(rule => typeof rule === 'string' && rule.trim())
            .map(rule => ({ rule, order: makeRuleOrder('', rule) }))
            .sort((left, right) => compareRuleOrder(left.order, right.order));
        dynamicRuleRecords = [];
        records.forEach((record, index) => {
            try {
                sheet.insertRule(record.rule, baseRuleCount + index);
                accepted.push(record.rule);
                dynamicRuleRecords.push(record);
            } catch (e) {
                rememberDebugItem(debugState.failedRules, { className: '(cache)', css: record.rule, message: e.message });
            }
        });
        return accepted;
    }

    function injectBase() {
        if (sheetInitialized) return;
        sheetInitialized = true;
        initConfig();

        // 1. 初始化并隔离主题变量标签
        themeStyleEl.textContent = renderThemeStyles();

        // 2. 整合插件注入的基础和组件样式
        let pluginInjections = '';
        if (pluginComponentCSS.length > 0) pluginInjections = '\n/* 🔌 Plugin Components */\n' + pluginComponentCSS.join('\n');

        const isHydrated = hydrateFromCache();
        const baseCSS = renderBaseStyles(pluginInjections);

        styleEl.textContent = baseCSS;
        baseRuleCount = styleEl.sheet && styleEl.sheet.cssRules ? styleEl.sheet.cssRules.length : 0;
        if (isHydrated && dynamicRules.length > 0) {
            // 只保留被浏览器解析器接受的规则，非法项同步从缓存快照中剔除
            dynamicRules = injectRulesViaCSSOM(dynamicRules);
            if (typeof console !== 'undefined') console.log('%c⚡ JquanUI Warm Start%c Loaded from Cache (0ms parsing)', 'background: #10b981; color: white; padding: 2px 6px; border-radius: 4px;', 'color: #10b981;');
        }
    }

    function refreshBaseStyles() {
        if (!sheetInitialized) return;
        let pluginInjections = '';
        if (pluginComponentCSS.length > 0) pluginInjections = '\n/* Plugin Components */\n' + pluginComponentCSS.join('\n');
        styleEl.textContent = renderBaseStyles(pluginInjections);
        baseRuleCount = styleEl.sheet && styleEl.sheet.cssRules ? styleEl.sheet.cssRules.length : 0;
        // 同上：已生成的工具类规则统一走 CSSOM 回填，不再字符串拼接
        if (dynamicRules.length > 0) dynamicRules = injectRulesViaCSSOM(dynamicRules);
    }

    function applyLateConfig() {
        configInitialized = false;
        colors = JSON.parse(JSON.stringify(baseColors));
        semanticThemes = {};
        processedClasses.clear();
        dynamicRules = [];
        dynamicRuleRecords = [];
        baseRuleCount = 0;
        classQueue.clear();
        pendingNodes.clear();
        if (typeof debugState !== 'undefined') {
            debugState.unresolvedClasses = [];
            debugState.failedRules = [];
            debugState.conflicts = [];
        }
        try { localStorage.removeItem(CACHE_KEY); } catch (e) {}
        initConfig();
        themeStyleEl.textContent = renderThemeStyles();
        refreshBaseStyles();
        if (document.documentElement) fullScan();
    }

    function processSafelist() {
        const config = window.JquanUI?.config || window.JQUAN_CONFIG || {};
        let safelist = config.safelist || [];
        if (!Array.isArray(safelist)) safelist = [safelist];
        if (safelist.length === 0) return;
        let safeClasses = [];
        safelist.forEach(item => {
            if (typeof item === 'string') safeClasses.push(...classStringToTokens(item));
        });
        if (safeClasses.length > 0) compileAndInject(new Set(safeClasses), true);
    }

    function extractClasses(root) {
        const allClasses = new Set();
        collectClassTokens(root, allClasses);
        const elements = root.querySelectorAll('[class]');
        elements.forEach(el => collectClassTokens(el, allClasses));
        return allClasses;
    }

    const scheduleIdle = window.requestIdleCallback || function(cb) {
        const start = Date.now();
        return setTimeout(() => cb({ didTimeout: false, timeRemaining: () => Math.max(0, 50 - (Date.now() - start)) }), 1);
    };

    const classQueue = new Set();
    let isProcessingQueue = false;
    const CHUNK_SIZE = 40;

    function insertDynamicRule(sheet, renderedRule, className) {
        const record = { rule: renderedRule, order: makeRuleOrder(className, renderedRule) };
        let index = dynamicRuleRecords.findIndex(existing => compareRuleOrder(record.order, existing.order) < 0);
        if (index < 0) index = dynamicRuleRecords.length;
        sheet.insertRule(renderedRule, baseRuleCount + index);
        dynamicRuleRecords.splice(index, 0, record);
        dynamicRules.splice(index, 0, renderedRule);
    }

    function resolveAndInsertClass(cls, budget = null) {
        if (processedClasses.has(cls)) return { status: 'processed', ruleCount: 0, bytes: 0 };
        if (budget && runtimeNow() - budget.startedAt >= budget.timeoutMs) return { status: 'timeout', ruleCount: 0, bytes: 0 };

        const resolveStartedAt = runtimeNow();
        const result = resolveUtility(cls);
        const resolveDurationMs = Number((runtimeNow() - resolveStartedAt).toFixed(2));
        if (!debugState.slowestResolve || resolveDurationMs > debugState.slowestResolve.durationMs) {
            debugState.slowestResolve = { className: cls, durationMs: resolveDurationMs };
        }

        if (!result || !result.css) {
            processedClasses.add(cls);
            rememberDebugItem(debugState.unresolvedClasses, { className: cls });
            return { status: 'unresolved', ruleCount: 0, bytes: 0 };
        }

        const renderedRules = splitTopLevelCssRules(result.css).map(renderUtilityRule);
        const bytes = renderedRules.reduce((total, rule) => total + cssByteLength(rule), 0);
        if (budget && (bytes > budget.remainingBytes || runtimeNow() - budget.startedAt >= budget.timeoutMs)) {
            return { status: runtimeNow() - budget.startedAt >= budget.timeoutMs ? 'timeout' : 'budget', ruleCount: 0, bytes };
        }

        processedClasses.add(cls);
        let insertedCount = 0;
        renderedRules.forEach(renderedRule => {
            try {
                insertDynamicRule(styleEl.sheet, renderedRule, cls);
                debugState.insertedRules++;
                insertedCount++;
            } catch (e) {
                rememberDebugItem(debugState.failedRules, { className: cls, css: renderedRule, message: e.message });
                console.warn(`[JquanUI] Rule insertion failed for "${cls}":`, renderedRule, e.message);
            }
        });
        return { status: 'resolved', ruleCount: insertedCount, bytes };
    }

    function processQueueChunk(deadline, drainAll = false) {
        const startedAt = runtimeNow();
        if (!styleEl.sheet) return;
        const iterator = classQueue.values();
        let processedCount = 0;
        let injectedThisFrame = false;

        while (true) {
            const { value: cls, done } = iterator.next();
            if (done) break;
            classQueue.delete(cls);

            if (!processedClasses.has(cls)) {
                debugState.resolveCount++;
                const result = resolveAndInsertClass(cls);
                if (result.ruleCount > 0) injectedThisFrame = true;
                processedCount++;
            }
            if (!drainAll && (processedCount >= CHUNK_SIZE || (deadline && deadline.timeRemaining() <= 1))) break;
        }

        if (injectedThisFrame) persistToCache();
        rememberDuration(debugState.queueDurations, runtimeNow() - startedAt);
        if (classQueue.size > 0) scheduleIdle(processQueueChunk);
        else isProcessingQueue = false;
    }

    function compileAndInject(classes, isSync = false) {
        let hasNew = false;
        classes.forEach(cls => {
            if (!processedClasses.has(cls)) { classQueue.add(cls); hasNew = true; }
        });
        if (!hasNew) return;
        if (isSync) { processQueueChunk({ timeRemaining: () => 999 }, true); return; }
        if (classQueue.size <= 20) { processQueueChunk({ timeRemaining: () => 999 }); return; }
        if (!isProcessingQueue) { isProcessingQueue = true; scheduleIdle(processQueueChunk); }
    }

    function normalizePrefetchClasses(classNames) {
        const values = typeof classNames === 'string' ? [classNames] : classNames;
        if (!values || typeof values[Symbol.iterator] !== 'function') return [];
        const tokens = new Set();
        for (const value of values) {
            if (typeof value !== 'string') continue;
            classStringToTokens(value).forEach(token => tokens.add(token));
        }
        return Array.from(tokens);
    }

    function cssByteLength(value) {
        const text = String(value || '');
        if (typeof TextEncoder === 'function') return new TextEncoder().encode(text).length;
        return text.length;
    }

    function prefetch(classNames, options = {}) {
        injectBase();
        const requested = normalizePrefetchClasses(classNames);
        const maxClasses = Number.isFinite(Number(options.maxClasses)) ? Math.max(0, Math.floor(Number(options.maxClasses))) : 100;
        const maxBytes = Number.isFinite(Number(options.maxBytes)) ? Math.max(0, Math.floor(Number(options.maxBytes))) : 100000;
        const timeoutMs = Number.isFinite(Number(options.timeoutMs)) ? Math.max(0, Number(options.timeoutMs)) : 50;
        const candidates = requested.slice(0, maxClasses);
        const skipped = requested.slice(maxClasses).map(className => ({ className, reason: 'max-classes' }));
        const startedAt = runtimeNow();
        const budget = { startedAt, timeoutMs, remainingBytes: maxBytes };
        const accepted = [];
        let ruleCount = 0;
        let bytes = 0;
        let reason = skipped.length > 0 ? 'max-classes' : null;

        for (let index = 0; index < candidates.length; index++) {
            const cls = candidates[index];
            if (!processedClasses.has(cls)) debugState.resolveCount++;
            const result = resolveAndInsertClass(cls, budget);
            if (result.status === 'resolved' || result.status === 'unresolved' || result.status === 'processed') {
                accepted.push(cls);
                ruleCount += result.ruleCount;
                bytes += result.bytes;
                budget.remainingBytes = Math.max(0, budget.remainingBytes - result.bytes);
                if (result.status === 'resolved') debugState.prefetchResolved++;
            } else {
                reason = result.status === 'timeout' ? 'timeout' : 'max-bytes';
                candidates.slice(index).forEach(className => skipped.push({ className, reason }));
                break;
            }
        }

        const durationMs = Number((runtimeNow() - startedAt).toFixed(2));
        debugState.prefetchCount++;
        debugState.prefetchSkipped += skipped.length;
        debugState.prefetchBytes += bytes;
        if (ruleCount > 0) persistToCache();
        return {
            requested,
            accepted,
            skipped,
            ruleCount,
            bytes,
            durationMs,
            maxClasses,
            maxBytes,
            timeoutMs,
            reason,
            truncated: skipped.length > 0
        };
    }

    function fullScan() {
        const startedAt = runtimeNow();
        debugState.scans++;
        injectBase();
        processSafelist(); 
        scanRuntimeRoot(document.documentElement, true);
        rememberDuration(debugState.scanDurations, runtimeNow() - startedAt);
    }

    function scanRuntimeRoot(root, isSync = true) {
        if (!root || typeof root.querySelectorAll !== 'function') return 0;
        const classes = extractClasses(root);
        compileAndInject(classes, isSync);
        runPluginBehaviors(root);
        runPluginScanHooks(root);
        return classes.size;
    }

    function getCacheSnapshot() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            return raw ? { exists: true, bytes: raw.length } : { exists: false, bytes: 0 };
        } catch (e) {
            return { exists: false, bytes: 0, error: e.message };
        }
    }

    function buildMetricsSnapshot(cacheData = getCacheSnapshot()) {
        const scanDurations = debugState.scanDurations;
        const queueDurations = debugState.queueDurations;
        const performanceReport = {
            lastScanMs: scanDurations.at(-1) || 0,
            maxScanMs: Math.max(0, ...scanDurations),
            averageScanMs: scanDurations.length ? Number((scanDurations.reduce((sum, value) => sum + value, 0) / scanDurations.length).toFixed(2)) : 0,
            lastQueueMs: queueDurations.at(-1) || 0,
            maxQueueMs: Math.max(0, ...queueDurations),
            averageQueueMs: queueDurations.length ? Number((queueDurations.reduce((sum, value) => sum + value, 0) / queueDurations.length).toFixed(2)) : 0,
            cacheHydrateMs: Number(debugState.cacheHydrateMs.toFixed(2)),
            budgets: { scanMs: 16, queueMs: 8 },
            warnings: []
        };
        if (performanceReport.maxScanMs > performanceReport.budgets.scanMs) performanceReport.warnings.push('scan-budget-exceeded');
        if (performanceReport.maxQueueMs > performanceReport.budgets.queueMs) performanceReport.warnings.push('queue-budget-exceeded');
        return {
            version: ENGINE_VERSION,
            scans: debugState.scans,
            totalResolves: debugState.resolveCount,
            processedClassCount: processedClasses.size,
            dynamicRuleCount: dynamicRules.length,
            insertedRuleCount: debugState.insertedRules,
            unresolvedClassCount: debugState.unresolvedClasses.length,
            failedRuleCount: debugState.failedRules.length,
            queueSize: classQueue.size,
            isProcessingQueue,
            cacheHitRate: debugState.hydrate === 'hit' ? 1 : 0,
            cacheHydrate: debugState.hydrate,
            cacheHydrateMs: Number(debugState.cacheHydrateMs.toFixed(2)),
            cacheBytes: cacheData.bytes,
            slowestResolve: debugState.slowestResolve ? Object.assign({}, debugState.slowestResolve) : null,
            prefetchCount: debugState.prefetchCount,
            prefetchResolved: debugState.prefetchResolved,
            prefetchSkipped: debugState.prefetchSkipped,
            prefetchBytes: debugState.prefetchBytes,
            performance: performanceReport
        };
    }

    function buildDebugReport(options = {}) {
        if (options && options.track === true && !debugConflictTracking) {
            debugConflictTracking = true;
            debugState.conflicts = [];
            if (document.documentElement) fullScan();
        }
        const config = window.JquanUI?.config || window.JQUAN_CONFIG || {};
        const cacheData = getCacheSnapshot();
        const metrics = buildMetricsSnapshot(cacheData);
        const performanceReport = Object.assign({ resolveCount: metrics.totalResolves }, metrics.performance);
        return {
            version: ENGINE_VERSION,
            sheetInitialized,
            scans: debugState.scans,
            queueSize: classQueue.size,
            isProcessingQueue,
            processedClassCount: processedClasses.size,
            dynamicRuleCount: dynamicRules.length,
            insertedRuleCount: debugState.insertedRules,
            unresolvedClassCount: debugState.unresolvedClasses.length,
            failedRuleCount: debugState.failedRules.length,
            conflictCount: debugState.conflicts.length,
            conflictTracking: debugConflictTracking,
            unresolvedClasses: debugState.unresolvedClasses.slice(),
            failedRules: debugState.failedRules.slice(),
            conflicts: debugState.conflicts.slice(),
            cache: {
                key: CACHE_KEY,
                hydrate: debugState.hydrate,
                exists: cacheData.exists,
                bytes: cacheData.bytes,
                lastPersistBytes: debugState.lastCacheBytes,
                lastPersistAt: debugState.lastPersistAt,
                maxRules: MAX_RUNTIME_RULES,
                maxBytes: MAX_CACHE_BYTES,
                error: cacheData.error || null
            },
            plugins: {
                installed: Array.from(installedPlugins.keys()),
                dynamicMatchers: dynamicPluginMatchers.length,
                behaviors: pluginBehaviors.length,
                scanHooks: pluginScanHooks.length
            },
            configHash: getConfigHash(),
            hasConfig: !!(window.JquanUI?.config || window.JQUAN_CONFIG),
            safelistCount: Array.isArray(config.safelist) ? config.safelist.length : (config.safelist ? 1 : 0)
            , performance: performanceReport
            , metrics
        };
    }

    // =============================================
    // 14. MutationObserver 实时监听
    // =============================================
    let observer = null;
    let rafId = null;
    let pendingNodes = new Set();
    const adoptedRootStates = new WeakMap();

    function flushNodeSet(nodes, isSync = false) {
        const classes = new Set();
        nodes.forEach(node => {
            collectClassTokens(node, classes);
            if (node.querySelectorAll) {
                node.querySelectorAll('[class]').forEach(el => collectClassTokens(el, classes));
            }
            runPluginBehaviors(node);
            runPluginScanHooks(node);
        });
        nodes.clear();
        compileAndInject(classes, isSync);
    }

    function flushPendingNodes(isSync = false) {
        flushNodeSet(pendingNodes, isSync);
    }

    function processObservedMutations(mutations, nodes, schedule) {
        let needsScan = false;
        for (const mutation of mutations) {
            if (mutation.type === 'attributes') {
                if (!shouldScanAttribute(mutation.attributeName)) continue;
                nodes.add(mutation.target);
                needsScan = true;
            }
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { nodes.add(node); needsScan = true; }
                });
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === 1 && !node.isConnected) teardownPluginNodeTree(node);
                });
            }
        }
        if (needsScan) schedule();
    }

    function scheduleScan() {
        if (document.readyState === 'loading') {
            flushPendingNodes(true);
            return;
        }
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            flushPendingNodes(false);
        });
    }

    function startObserver() {
        if (observer) return;
        observer = new MutationObserver(mutations => processObservedMutations(mutations, pendingNodes, scheduleScan));
        observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
    }

    function stopObserver() {
        if (observer) { observer.disconnect(); observer = null; }
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        pendingNodes.clear();
    }

    function scheduleAdoptedRootScan(state) {
        if (!state.active || state.rafId) return;
        state.rafId = requestAnimationFrame(() => {
            state.rafId = null;
            if (state.active) flushNodeSet(state.pendingNodes, false);
        });
    }

    function observeAdoptedRoot(root, state) {
        if (state.observer || typeof MutationObserver !== 'function') return;
        state.observer = new MutationObserver(mutations => {
            if (!state.active) return;
            processObservedMutations(mutations, state.pendingNodes, () => scheduleAdoptedRootScan(state));
        });
        state.observer.observe(root, { childList: true, subtree: true, attributes: true });
    }

    function adoptRuntimeRoot(root, options = {}) {
        if (!root || styleEl.mode !== 'constructable') return false;
        const shouldScan = options.scan !== false;
        const shouldObserve = options.observe !== false;
        const themeAdopted = themeStyleEl.adopt(root);
        const runtimeAdopted = styleEl.adopt(root);
        if (!themeAdopted || !runtimeAdopted) {
            if (themeAdopted) themeStyleEl.detach(root);
            if (runtimeAdopted) styleEl.detach(root);
            return false;
        }

        if (root === document) {
            if (shouldScan && document.documentElement) fullScan();
            if (shouldObserve) startObserver();
            return true;
        }

        let state = adoptedRootStates.get(root);
        if (!state) {
            state = { active: true, observer: null, rafId: null, pendingNodes: new Set() };
            adoptedRootStates.set(root, state);
        } else {
            state.active = true;
        }
        if (shouldScan) scanRuntimeRoot(root, true);
        if (shouldObserve) observeAdoptedRoot(root, state);
        return true;
    }

    function detachRuntimeRoot(root) {
        if (!root || styleEl.mode !== 'constructable') return false;
        if (root === document) stopObserver();
        const state = root === document ? null : adoptedRootStates.get(root);
        if (state) {
            state.active = false;
            if (state.observer) state.observer.disconnect();
            if (state.rafId) cancelAnimationFrame(state.rafId);
            state.pendingNodes.clear();
            teardownPluginNodeTree(root);
            adoptedRootStates.delete(root);
        }
        const themeDetached = themeStyleEl.detach(root);
        const runtimeDetached = styleEl.detach(root);
        return themeDetached && runtimeDetached;
    }

    function getAdoptionStatus(root = document) {
        const sheets = root && 'adoptedStyleSheets' in root ? Array.from(root.adoptedStyleSheets || []) : [];
        const sheetCount = [themeStyleEl.sheet, styleEl.sheet].filter(sheet => sheet && sheets.includes(sheet)).length;
        const state = root && root !== document ? adoptedRootStates.get(root) : null;
        return {
            adopted: styleEl.mode === 'constructable' && sheetCount === 2,
            observed: root === document ? !!observer : !!(state && state.active && state.observer),
            styleMode: styleEl.mode,
            sheetCount
        };
    }

    // =============================================
    // 15. 支持 <script> 标签上的 data 属性配置
    // =============================================
    function autoConfig() {
        const scriptTag = document.currentScript || document.querySelector('script[data-jquan-css]');
        if (!scriptTag) return;
        const darkMode = scriptTag.getAttribute('data-dark-mode');
        if (darkMode === 'media') variants['dark'] = { media: '@media (prefers-color-scheme: dark)' };
        else if (darkMode === 'class') variants['dark'] = '.dark &';
        else if (darkMode === 'both') variants['dark'] = { selector: '.dark &', fallbackSelector: ':root:not(.light) &', fallbackMedia: '@media (prefers-color-scheme: dark)' };
        const prefix = scriptTag.getAttribute('data-prefix');
        if (prefix) {
            const newDict = {};
            for (const [key, val] of Object.entries(dictionary)) newDict[prefix + key] = val;
            Object.assign(dictionary, newDict);
        }
    }

    // =============================================
    // 16. 初始化执行
    // =============================================
    let readyDispatched = false;
    function markReady() {
        if (readyDispatched) return;
        readyDispatched = true;
        const root = document.documentElement;
        if (root) {
            if (root.classList && typeof root.classList.add === 'function') root.classList.add('jquan-ready');
            if (typeof root.setAttribute === 'function') root.setAttribute('data-jquan-ready', ENGINE_VERSION);
        }
        setTimeout(() => {
            if (!document.dispatchEvent) return;
            let event = null;
            if (typeof CustomEvent === 'function') {
                event = new CustomEvent('jquan:ready', { detail: { version: ENGINE_VERSION } });
            } else if (document.createEvent) {
                event = document.createEvent('CustomEvent');
                event.initCustomEvent('jquan:ready', false, false, { version: ENGINE_VERSION });
            }
            if (event) document.dispatchEvent(event);
        }, 0);
    }

    installLateConfigBridge();
    autoConfig();
    injectBase();
    startObserver();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { fullScan(); markReady(); });
    } else {
        fullScan(); markReady();
    }

    // =============================================
    // §17. 暴露公共 API (Jquan 终极暴露模式)
    // =============================================
    window.JquanUI = window.JquanUI || {};
    
    Object.assign(window.JquanUI, {
        scan: fullScan,
        compile(classNames) {
            if (typeof classNames === 'string') classNames = classStringToTokens(classNames);
            injectBase();
            compileAndInject(new Set(classNames));
        },
        adopt: adoptRuntimeRoot,
        detach: detachRuntimeRoot,
        getAdoptionStatus,
        styleMode: styleEl.mode,
        getStyleSheet() { return styleEl.sheet || null; },
        addSafelist(classNames) {
            if (typeof classNames === 'string') classNames = [classNames];
            let safeClasses = [];
            classNames.forEach(item => { if (typeof item === 'string') safeClasses.push(...classStringToTokens(item)); });
            injectBase();
            compileAndInject(new Set(safeClasses)); 
        },
        // 🚀 动态切换主题引擎
        setTheme(themeName) {
            const config = window.JquanUI?.config || window.JQUAN_CONFIG || {};
            const themesDef = config.themes || {};
            if (themesDef[themeName] && themesDef[themeName].semantic) {
                // 仅重新生成 CSS 变量，瞬间替换 `<style id="jquan-theme-vars">`
                themeStyleEl.textContent = renderThemeStyles(themesDef[themeName].semantic);
                activeThemeName = themeName;
                if (typeof console !== 'undefined') console.log(`[JquanUI] Theme swapped to: ${themeName} 🎨`);
            } else if (themeName === 'default') {
                themeStyleEl.textContent = renderThemeStyles(semanticThemes);
                activeThemeName = 'default';
            }
        },
        // 🚀 动态挂载插件
        use(plugin) {
            const installed = executePlugins([plugin]);
            if (installed.length === 0) return false;
            if (sheetInitialized) refreshBaseStyles();
            if (document.documentElement) {
                runPluginBehaviors(document.documentElement);
                runPluginScanHooks(document.documentElement);
            }
            if (sheetInitialized) fullScan();
            return true;
        },
        expandSyntax: expandVariantGroups,
        getProcessedClasses() { return new Set(processedClasses); },
        isReady() { return readyDispatched; },
        clearCache() { localStorage.removeItem(CACHE_KEY); if (typeof console !== 'undefined') console.log('[JquanUI] Cache cleared manually.'); },
        debug(options) { return buildDebugReport(options); },
        diagnose(options) { return buildDebugReport(options); },
        getMetrics() { return buildMetricsSnapshot(); },
        prefetch,
        stop: stopObserver,
        start: startObserver,
        resolve: resolveUtility,
        resolveColor,
        addUtility(name, def) { dictionary[name] = def; },
        addColor(name, value) { colors[name] = value; },
        addVariant(name, def) { variants[name] = def; },
        addBreakpoint(name, minWidth) { variants[name] = { media: `@media (min-width: ${minWidth})` }; },
        hasPlugin(name) {
            return installedPlugins.has(name);
        },
        getInstalledPlugins() {
            return Array.from(installedPlugins.values()).map(plugin => ({
                name: plugin.name,
                version: plugin.version,
                requires: plugin.requires.slice()
            }));
        },
        enhance(root = document.documentElement) {
            if (!root) return;
            injectBase();
            runPluginBehaviors(root);
            runPluginScanHooks(root);
            const classes = extractClasses(root);
            compileAndInject(classes, true);
        },
        destroy() {
            stopObserver();
            pluginBehaviors.forEach(behavior => {
                Array.from(behavior.nodes).forEach(node => teardownBehaviorNode(behavior, node));
            });
            installedPlugins.forEach(plugin => {
                if (typeof plugin.teardown === 'function') {
                    try { plugin.teardown(); } catch (e) { console.error(`[JquanUI] Plugin teardown failed (${plugin.name})`, e); }
                }
            });
        },
        version: `${ENGINE_VERSION} (Enterprise Plugin Lifecycle)`,
        runtimeConfig: () => ({ colors, spacing, breakpoints, containers }) // 改为函数以支持热获取
    });
    runtimeBooted = true;

    // =============================================
    // 18. Jquan 专属启动日志
    // =============================================
    if (typeof console !== 'undefined') {
        console.log(
            '%c欢迎使用 JquanUI%c 原子 CSS 引擎 · https://cssui.jquan.win/',
            'background: #4f46e5; color: white; padding: 3px 8px; border-radius: 4px 0 0 4px; font-weight: bold;',
            'color: #4f46e5; font-weight: 600;'
        );
        console.log(
            `%c⚡ JquanUI Runtime v${ENGINE_VERSION} %c Ecosystem & Theme Engine Active %c ! `,
            'background: #4f46e5; color: white; padding: 3px 8px; border-radius: 4px 0 0 4px; font-weight: bold;',
            'background: #1e1b4b; color: #c7d2fe; padding: 3px 8px; font-weight: normal;',
            'background: #e11d48; color: white; padding: 3px 6px; border-radius: 0 4px 4px 0; font-weight: bold;'
        );
    }

})();
