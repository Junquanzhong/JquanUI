import { initCodeHighlighter } from '../modules/code-block.mjs';
import { Tabs } from '../modules/tabs.mjs'
import modalManager from '../modules/modal.mjs';

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

// --- 对话框示例 ---
document.getElementById('btn-dialog').addEventListener('click', () => {
    modalManager.open({
        type: 'dialog',
        content: (container) => {
            container.innerHTML = `
                        <div class="text-center">
                            <h2 class="text-2xl font-bold mb-4">操作确认</h2>
                            <p class="mb-6">你确定要执行此操作吗？此操作无法撤销。</p>
                            <div class="flex justify-center space-x-4">
                                <button class="confirm-btn bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">确认</button>
                                <button class="cancel-btn bg-gray-300 text-white px-6 py-2 rounded hover:bg-gray-400">取消</button>
                            </div>
                        </div>
                    `;
            container.querySelector('.confirm-btn').addEventListener('click', () => {
                alert('已确认！');
                modalManager.close();
            });
            container.querySelector('.cancel-btn').addEventListener('click', () => {
                modalManager.close();
            });
        },
        animation: 'zoomIn'
    });
});

// --- 表单示例 ---
document.getElementById('btn-form').addEventListener('click', () => {
    const formContent = `
                <form class="space-y-4">
                    <h2 class="text-xl font-semibold">用户注册</h2>
                    <div>
                        <label for="username" class="block text-sm font-medium text-gray-700">用户名</label>
                        <input type="text" id="username" name="username" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700">邮箱</label>
                        <input type="email" id="email" name="email" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <button type="submit" class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">提交</button>
                </form>
            `;
    modalManager.open({
        type: 'form',
        content: formContent,
        animation: 'slideFromTop',
        onOpen: (modalEl) => {
            const form = modalEl.querySelector('form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('表单已提交 (模拟)！');
                modalManager.close();
            });
        }
    });
});

// --- 单张图片示例 ---
document.getElementById('btn-single-image').addEventListener('click', () => {
    modalManager.open({
        type: 'image',
        imageOptions: {
            src: 'https://picsum.photos/seed/modal1/800/600.jpg'
        },
        animation: 'fade'
    });
});

// --- 图片画廊示例 ---
document.getElementById('btn-gallery').addEventListener('click', () => {
    modalManager.open({
        type: 'image',
        animation: 'fade',
        imageOptions: {
            src: [
                'https://picsum.photos/seed/gallery1/800/600.jpg',
                'https://picsum.photos/seed/gallery2/1200/900.jpg',
                'https://picsum.photos/seed/gallery3/900/700.jpg'
            ],
            //currentSrc: 'https://picsum.photos/seed/gallery2/1200/900.jpg' // 从第二张开始
        }
    });
});
