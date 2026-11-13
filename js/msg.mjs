// 本组件逻辑部分由GLM-4.6生成，UI部分由JquanUI V3.0设计
// 消息的唯一ID计数器
let msgIdCounter = 0;
// 存储所有消息的实例，方便查找和移除
const msgInstances = new Map();
// 消息的默认配置
const defaultOptions = {
    timeout: 3000,  //延时关闭时间
    autoClose: true,  //是否自动关闭，默认true,注意在type为loading的时候自动关闭为false
    showClose: false, //是否显示关闭图标，默认为false不显示
    content: '这是一条提示消息',  //提示的内容
    onClose: null, //关闭的回调函数
};
function ensureOptions(options) {
    return typeof options === 'string' ? { content: options } : options;
}
// 1. 创建一个唯一的消息容器
function createMsgContainer() {
    let container = document.getElementById('msg-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'msg-container';
        // 确保消息本身可以被点击
        container.style.pointerEvents = 'none';
        document.body.appendChild(container);
    }
    return container;
}
// 2. 创建单个消息的DOM元素 (使用你提供的结构)
function createMsgElement(id, type, options) {
    const msgEl = document.createElement('span');
    // 使用你提供的精确的类名
    msgEl.className = 'px-4 py-2 text-black bg-white rounded-lg shadow-lg fixed top-4 left-1/2 -translate-x-1/2 z-base';
    // 恢复鼠标交互
    msgEl.style.pointerEvents = 'auto';
    // 图标路径映射 (请确保路径正确)
    const iconPath = `../images/${type}.svg`;
    // 创建图标元素
    const icon = document.createElement('img');
    icon.className = 'w-4 h-4 mt--0.5 mr-1';
    icon.src = iconPath;
    icon.alt = `${type} icon`;
    // 如果是loading，加上旋转动画
    if (type === 'loading') {
        msgEl.setAttribute('data-msg-type', 'loading')
    }
    // 创建内容文本节点
    const content = document.createTextNode(options.content);
    // 组装DOM
    msgEl.appendChild(icon);
    msgEl.appendChild(content);
    // 如果需要显示关闭按钮
    if (options.showClose) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'tags rounded-3xl h-5 w-5 ml-2'; // 增加ml-2让按钮和文字有点间距
        msgEl.setAttribute('data-msg-close', 'true');
        closeBtn.innerHTML = '×';
        closeBtn.onclick = (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            closeMsg(id);
        };
        msgEl.appendChild(closeBtn);
    }
    return msgEl;
}
// 3. 关闭消息的逻辑 (带淡出效果)
function closeMsg(id) {
    const msgInstance = msgInstances.get(id);
    if (!msgInstance) return;
    const msgEl = msgInstance.element;
    // 添加一个离开动画的类（这个类需要你在CSS里定义）
    msgEl.style.opacity = '0';
    msgEl.style.transform = 'translateX(-50%) translateY(-20px)';
    // 动画结束后，从DOM和Map中移除
    setTimeout(() => {
        if (msgEl.parentNode) {
            msgEl.parentNode.removeChild(msgEl);
        }
        if (msgInstance.onClose) {
            msgInstance.onClose();
        }
        msgInstances.delete(id);
    }, 300); // 假设动画时长为300ms
}
// 4. 主要的show函数
function show(type, options) {
    msgIdCounter++;
    const id = msgIdCounter;
    const finalOptions = { ...defaultOptions, ...options };
    // ✅ 在这里加入调试代码
    //console.log('传递给 createMsgElement 的 finalOptions 是:', finalOptions);
    // loading 类型默认不自动关闭
    if (type === 'loading' && options.autoClose === undefined) {
        finalOptions.autoClose = false;
    }
    const container = createMsgContainer();
    const msgEl = createMsgElement(id, type, finalOptions);
    // 添加入场动画
    msgEl.style.opacity = '0';
    msgEl.style.transform = 'translateX(-50%) translateY(-20px)';
    msgEl.style.transition = 'all 0.3s ease-out';
    container.appendChild(msgEl);
    // 触发浏览器重绘以启动过渡动画
    requestAnimationFrame(() => {
        msgEl.style.opacity = '1';
        msgEl.style.transform = 'translateX(-50%) translateY(0)';
    });
    // 保存实例信息
    msgInstances.set(id, { element: msgEl, onClose: finalOptions.onClose });
    // 设置自动关闭定时器
    if (finalOptions.autoClose && finalOptions.timeout > 0) {
        setTimeout(() => {
            closeMsg(id);
        }, finalOptions.timeout);
    }
    // 返回一个可以手动关闭的函数
    return () => closeMsg(id);
}
// 5. 导出 `msg` 对象
export const msg = {
    info: (options) => show('info', ensureOptions(options)),
    success: (options) => show('success', ensureOptions(options)), // ✅ 使用辅助函数
    warning: (options) => show('warning', ensureOptions(options)), // ✅ 使用辅助函数
    error: (options) => show('error', ensureOptions(options)),     // ✅ 使用辅助函数
    loading: (options) => show('loading', ensureOptions(options)), // ✅ 使用辅助函数
    show: (options) => {
        if (options && options.type) {
            return show(options.type, ensureOptions(options)); // 这里也用一下更保险
        }
        console.error('使用 msg.show() 时必须提供 type 参数');
    }
};