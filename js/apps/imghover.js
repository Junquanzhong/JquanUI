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
    duration: 500
})
new Tabs('#demo-1', {
    trigger: 'click',
    swipeable: true,
    lazy: false,
    animation: 'slide',
    duration: 500
})