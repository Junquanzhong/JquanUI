import { initCodeHighlighter } from '../modules/code-block.mjs';
import { Tabs } from '../modules/tabs.mjs'

// 代码块
initCodeHighlighter({
    copyButtonText: 'Copy',
    copiedButtonText: 'Copied!',
    copiedTextDuration: 3000, // 3秒
    showLinesByDefault: true // 不显示行号
    // showLinesByDefault 保持 true，因为我们大部分都需要
});

//选项卡
new Tabs('#demo', {
    trigger: 'click',
    swipeable: true,
    lazy: false,
    animation: 'slide',
    duration: 500,
    itemCLS: 'tabs-item',
    activeCLS: 'tabs-active',
    navCLS: 'tabs-nav',
    contentCLS: 'tabs-content',
    trackCLS: 'tabs-track',
    panelCLS: 'tabs-panel'
})
new Tabs('#demo1', {
    trigger: 'click',
    swipeable: true,
    lazy: false,
    animation: 'slide',
    duration: 500,
    itemCLS: 'tabs-item',
    activeCLS: 'tabs-active',
    navCLS: 'tabs-nav',
    contentCLS: 'tabs-content',
    trackCLS: 'tabs-track',
    panelCLS: 'tabs-panel'
})



// 如果你需要在某些时候停止监听（例如页面卸载时），可以调用：
// window.addEventListener('unload', stopListening);