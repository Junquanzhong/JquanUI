// js/theme-switcher.js

// 立即执行函数，确保函数在全局作用域中可用
(function() {
    class ThemeManager {
        constructor() {
            this.currentTheme = 'default';
            this.themeMap = {
                '': '默认',
                'dark': '深色',
                'red': '红色',
                'blue': '蓝色',
                'green': '绿色',
                'purple': '紫色',
                'orange': '橙色',
                'pink': '粉色'
            };
            this.init();
        }

        init() {
            // 从localStorage恢复主题
            const savedTheme = localStorage.getItem('jquanui-theme');
            if (savedTheme) {
                this.setTheme(savedTheme);
            }
        }

        setTheme(theme) {
            // 更新body类
            document.body.className = theme ? `theme-${theme}` : '';
            this.currentTheme = theme || 'default';
            
            // 保存到localStorage
            localStorage.setItem('jquanui-theme', this.currentTheme);
            
            // 触发主题变化事件
            this.dispatchThemeChange();
            
            // 更新显示
            this.updateThemeDisplay();
            
            console.log(`主题已切换到: ${this.getThemeName()}`);
        }

        getTheme() {
            return this.currentTheme;
        }

        getThemeName() {
            return this.themeMap[this.currentTheme] || '默认';
        }

        dispatchThemeChange() {
            const event = new CustomEvent('themechange', {
                detail: {
                    theme: this.currentTheme,
                    themeName: this.getThemeName()
                }
            });
            document.dispatchEvent(event);
        }

        updateThemeDisplay() {
            const displayElement = document.getElementById('current-theme-display');
            if (displayElement) {
                displayElement.textContent = `当前主题：${this.getThemeName()}`;
            }
        }

        // 自动检测系统主题
        detectSystemTheme() {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
            if (prefersDark.matches) {
                this.setTheme('dark');
            } else {
                this.setTheme('');
            }
        }

        // 监听系统主题变化
        watchSystemTheme() {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (e.matches) {
                    this.setTheme('dark');
                } else {
                    this.setTheme('');
                }
            });
        }
    }

    // 创建全局主题管理器实例
    const themeManager = new ThemeManager();

    // 🚨 关键：将函数挂载到window对象，使其在HTML中可用
    window.setTheme = function(theme) {
        themeManager.setTheme(theme);
    };

    window.getCurrentTheme = function() {
        return themeManager.getTheme();
    };

    // 监听主题变化事件
    document.addEventListener('themechange', (e) => {
        console.log(`主题已切换到：${e.detail.themeName} (${e.detail.theme})`);
        // 可以在这里执行主题变化后的回调逻辑
    });

    // 页面加载完成后的初始化
    document.addEventListener('DOMContentLoaded', function() {
        console.log('主题管理器已初始化');
        console.log('可用函数: setTheme(theme), getCurrentTheme()');
    });

})();
