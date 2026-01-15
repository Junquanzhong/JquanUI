import { Tabs } from '../modules/tabs.mjs'
import PasswordGenerator from '../modules/PasswordGenerator.mjs';
import { initCodeHighlighter } from '../modules/code-block.mjs';
import { init } from '../modules/jit-engine.mjs';
new Tabs('#demo', {
    mode: 'fade',
    duration: 400,
    autoHeight: true, // 此时高度由内容自然撑开
})
// 初始化 JIT 引擎
init({});

// 实例化时，showStrength 默认为 false
new PasswordGenerator({
        passwordInputId: 'pwd',
        generateBtnId: 'gen-pwd-btn',
        injectTarget: {
            element: '#login-form',
            position: 'beforeend'
        }
});
// 代码块
// 初始化代码高亮
initCodeHighlighter({
    showLineNumbers: true, // 显示行号
});