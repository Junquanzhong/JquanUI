import { initDrawers } from '../modules/drawer.mjs';
        
// 确保在 DOM 加载完成后再初始化
document.addEventListener('DOMContentLoaded', () => {
    initDrawers();
});