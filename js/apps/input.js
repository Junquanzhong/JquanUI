import { Tabs } from '../modules/tabs.mjs'
import PasswordGenerator from '../modules/PasswordGenerator.mjs';
import { initCodeHighlighter } from '../modules/code-block.mjs';
new Tabs('#demo', {
    trigger: 'click',
    swipeable: true,
    animation: 'slide',
    duration: 500,
    itemCLS: 'tabs-item',
    activeCLS: 'tabs-active',
    navCLS: 'tabs-nav',
    contentCLS: 'tabs-content',
    trackCLS: 'tabs-track',
    panelCLS: 'tabs-panel'
})


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
initCodeHighlighter({
    copyButtonText: 'Copy',
    copiedButtonText: 'Copied!',
    copiedTextDuration: 3000, // 3秒
    showLinesByDefault: true // 不显示行号
    // showLinesByDefault 保持 true，因为我们大部分都需要
});