import { initCodeHighlighter } from '../modules/code-block.mjs';
import { Tabs } from '../modules/tabs.mjs'
import { init } from '../modules/jit-engine.mjs';
// 初始化 JIT 引擎
init({});

// 代码块
initCodeHighlighter({
    showLineNumbers: true, // 显示行号
    langLabel: false,  // 是否显示语言标签
});

//选项卡
new Tabs('#demo', {
    mode: 'fade',
    duration: 400,
    autoHeight: true, // 此时高度由内容自然撑开
})
new Tabs('#demo1', {
    mode: 'fade',
    duration: 400,
    autoHeight: true, // 此时高度由内容自然撑开
})



// 如果你需要在某些时候停止监听（例如页面卸载时），可以调用：
// window.addEventListener('unload', stopListening);