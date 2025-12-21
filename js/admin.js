// Select all navigation items and titles
const navItems = document.querySelectorAll('.nav-item');
const navTitles = document.querySelectorAll('.nav-title');
const navParents = document.querySelectorAll('.nav-items-parent');

// Function to handle active states and content loading
function handleNavClick(element, isTitle = false) {
    // Remove active class from all items
    navItems.forEach(nav => nav.classList.remove('active'));

    // Get the parent container
    const parent = element.closest('.nav-items-parent');

    if (parent) {
        // Toggle active class on parent when clicking title
        if (isTitle) {
            // Check if parent already has active class
            if (parent.classList.contains('active')) {
                // If active, remove it to collapse
                parent.classList.remove('active');
            } else {
                // If not active, remove active from all other parents first
                document.querySelectorAll('.nav-items-parent').forEach(p =>
                    p.classList.remove('active'));
                // Then add active to this parent to expand
                parent.classList.add('active');
            }
        } else {
            // Add active class to the clicked item
            element.classList.add('active');
            parent.classList.add('active');

            // Load the appropriate page
            const pageElement = element.querySelector('p');
            const pageName = pageElement ? pageElement.getAttribute('data-page') : 'overview';
            document.getElementById('content-frame').src = `html/${pageName}.html`;
        }
    }
}

// Add click event listeners to nav items
navItems.forEach(item => {
    item.addEventListener('click', function () {
        handleNavClick(this);
    });
});

// Add click event listeners to nav titles
navTitles.forEach(title => {
    title.addEventListener('click', function (e) {
        // Prevent event from bubbling to parent elements
        e.stopPropagation();
        handleNavClick(this, true);
    });
});
import { initTheme } from '../js/modules/theme.mjs'
document.addEventListener('DOMContentLoaded', () => {

    // 3. 调用 initTheme 函数并传入配置选项
    const themeManager = initTheme({
        // 指向包含主题切换按钮的容器选择器
        el: '#colorPalette',

        // 设置一个你希望在用户首次访问时看到的默认主题
        defaultTheme: 'theme-indigo',

        // (可选) 指向明暗切换按钮的选择器，默认是 '[data-luminance]'
        // darkModeToggleSelector: '[data-luminance]' 

        //是否同步iframe主题
        syncIframes: true,
    });

    // --- (可选) 你可以在这里利用返回的 themeManager 对象进行更多操作 ---

    // 监听主题变化并打印到控制台
    if (themeManager) {
        // 你可以创建一个自定义事件来监听变化，或者在按钮点击时调用
        // 这里仅作演示，展示如何使用API
        console.log('主题系统已初始化。');
        console.log('当前主题:', themeManager.getCurrentTheme());
        console.log('当前明暗模式:', themeManager.getCurrentLuminance());
    }
});
const themePickerTrigger = document.getElementById('themePickerTrigger');
const colorDotIndicator = themePickerTrigger.querySelector('.color-dot-indicator');
const themePickerDropdown = themePickerTrigger.parentElement;
// ===== 2. 下拉菜单交互 =====
themePickerTrigger.addEventListener('click', () => {
    themePickerDropdown.classList.toggle('open');
});

// 点击页面其他地方关闭下拉菜单
document.addEventListener('click', (e) => {
    if (!themePickerDropdown.contains(e.target)) {
        themePickerDropdown.classList.remove('open');
    }
});

