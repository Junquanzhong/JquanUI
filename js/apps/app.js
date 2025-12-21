import { onThemeChange } from '../modules/iframe-theme-listener.mjs';
// 调用 onThemeChange，并传入一个回调函数
const stopListening = onThemeChange(({ theme, luminance }) => {
    //console.log('iframe 主题已更新:', { theme, luminance });

    const body = document.body;
    
    // 清除所有旧的主题类
    body.className = body.className.replace(/theme-\S+/g, '').trim();

    // 应用新的主题类和明暗模式类
    body.classList.add(theme);
    if (luminance === 'dark') {
        body.classList.add('theme-dark');
    }
});