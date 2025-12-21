// modal.mjs (修复版 - 修复原子类操作错误)

/**
 * @typedef {object} ModalOptions
 * @property {'dialog' | 'form' | 'image'} type - 模态框类型。
 * @property {HTMLElement | string | function} content - 模态框内容。
 * @property {object} [imageOptions] - 图片查看器选项。
 * @property {string | string[]} imageOptions.src - 图片地址。
 * @property {string} [imageOptions.currentSrc] - 当前显示的图片地址。
 * @property {boolean} [showCloseButton=true] - 是否显示关闭按钮。
 * @property {boolean} [closeOnBackdropClick=true] - 是否在点击遮罩时关闭。
 * @property {'fade' | 'slideFromTop' | 'zoomIn'} [animation='fade'] - 动画效果。
 * @property {number} [backdropOpacity=0.5] - 遮罩透明度。
 * @property {object} [classes] - 自定义 CSS 类名。
 * @property {function} [onOpen] - 打开回调。
 * @property {function} [onClose] - 关闭回调。
 */

const DEFAULT_OPTIONS = {
    type: 'dialog',
    showCloseButton: true,
    closeOnBackdropClick: true,
    animation: 'fade',
    backdropOpacity: 0.5,
    classes: {},
    imageOptions: {
        src: '',
        currentSrc: null,
    },
    onOpen: null,
    onClose: null,
};

class ModalManager {
    constructor() {
        this.modalElement = null;
        this.backdropElement = null;
        this.contentElement = null;
        this.closeButtonElement = null;
        this.isOpen = false;
        this.options = {};
        this._isClosing = false;
        this._onCloseCallback = null;
        
        // 原子类样式配置 - 每个类名单独定义
        this._atomicClasses = {
            backdrop: 'fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-300',
            modal: {
                dialog: 'relative max-w-4xl max-h-screen w-96 h-auto m-auto p-4 bg-white bg-opacity-90 rounded-lg overflow-hidden transition-all duration-300',
                form: 'relative max-w-4xl max-h-screen w-96 h-auto m-auto p-4 bg-white bg-opacity-90 rounded-lg overflow-hidden transition-all duration-300',
                image: 'relative max-w-4xl max-h-screen w-4/5 h-auto m-auto p-4 bg-transparent rounded-lg overflow-hidden transition-all duration-300'
            },
            content: 'w-full',
            closeButton: 'absolute top-4 right-4 z-50 text-2xl font-bold cursor-pointer text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover-bg-opacity-70 transition-all duration-200',
            imageContainer: 'flex items-center justify-center relative overflow-hidden cursor-move bg-transparent',
            image: 'max-w-full max-h-full transition-all duration-300',
            galleryNav: 'absolute top-1/2 transform translate-y-1/2 z-40 bg-black bg-opacity-50 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold hover-bg-opacity-70 transition-all duration-200',
            prevButton: 'left-4',
            nextButton: 'right-4',
            galleryCounter: 'absolute bottom-4 left-1/2 transform translate-x-1/2 z-40 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium',
            galleryDisabledOpacity: 'opacity-30',
            galleryDisabledCursor: 'cursor-not-allowed',
            galleryDisabledHover: 'hover:bg-opacity-50',
        };
    }

    /**
     * 打开模态框
     */
    open(options) {
        if (this.isOpen || this._isClosing) {
            console.warn("模态框正在运行或关闭中");
            return;
        }

        this.options = this._mergeOptions(options);
        this._onCloseCallback = this.options.onClose;
        this._createModalStructure();
        this._attachEventListeners();
        this._lockBodyScroll();
        document.body.appendChild(this.backdropElement);

        // 触发入场动画
        this._animateIn();
        
        this.isOpen = true;

        if (typeof this.options.onOpen === 'function') {
            this.options.onOpen.call(this, this.modalElement);
        }
    }

    /**
     * 关闭模态框
     */
    close() {
        if (!this.isOpen || this._isClosing || !this.backdropElement) {
            return;
        }
        this._isClosing = true;

        // 立即移除所有事件监听器，防止重复触发
        this._removeEventListeners();

        const handleClose = () => {
            this._unlockBodyScroll();
            
            // 安全移除 DOM 元素
            if (this.backdropElement?.parentNode) {
                this.backdropElement.parentNode.removeChild(this.backdropElement);
            }
            
            this.isOpen = false;
            this._isClosing = false;
            
            // 执行关闭回调
            if (typeof this._onCloseCallback === 'function') {
                this._onCloseCallback.call(this);
            }
            
            // 清理引用
            this._cleanup();
        };

        // 触发出场动画
        this._animateOut(handleClose);
    }

    /**
     * 强制立即关闭（无动画）
     */
    forceClose() {
        if (!this.isOpen) return;
        
        this._removeEventListeners();
        this._unlockBodyScroll();
        
        if (this.backdropElement?.parentNode) {
            this.backdropElement.parentNode.removeChild(this.backdropElement);
        }
        
        this.isOpen = false;
        this._isClosing = false;
        
        if (typeof this._onCloseCallback === 'function') {
            this._onCloseCallback.call(this);
        }
        
        this._cleanup();
    }

    /**
     * 合并配置选项
     * @private
     */
    _mergeOptions(userOptions) {
        const options = { ...DEFAULT_OPTIONS };
        
        // 深度合并 classes
        if (userOptions.classes) {
            options.classes = { ...this._atomicClasses, ...userOptions.classes };
        } else {
            options.classes = { ...this._atomicClasses };
        }
        
        // 合并其他选项
        for (const key in userOptions) {
            if (key !== 'classes' && key !== 'imageOptions') {
                options[key] = userOptions[key];
            }
        }
        
        // 合并 imageOptions
        if (userOptions.imageOptions) {
            options.imageOptions = { 
                ...DEFAULT_OPTIONS.imageOptions, 
                ...userOptions.imageOptions 
            };
        }
        
        return options;
    }

    /**
     * 创建模态框 DOM 结构
     * @private
     */
    _createModalStructure() {
        // 创建遮罩层
        this.backdropElement = document.createElement('div');
        this.backdropElement.className = this.options.classes.backdrop;
        this.backdropElement.style.backgroundColor = `rgba(0, 0, 0, ${this.options.backdropOpacity})`;

        // 创建模态框容器
        this.modalElement = document.createElement('div');
        this.modalElement.className = this._getModalClassByType();

        // 设置初始动画状态
        this._setInitialAnimationState();

        // 创建内容区域
        this.contentElement = document.createElement('div');
        this.contentElement.className = this.options.classes.content;

        // 根据类型创建内容
        if (this.options.type === 'image') {
            this._createImageContent();
        } else {
            this._createGenericContent();
        }

        // 创建关闭按钮
        if (this.options.showCloseButton) {
            this.closeButtonElement = document.createElement('button');
            this.closeButtonElement.className = this.options.classes.closeButton;
            this.closeButtonElement.innerHTML = '&times;';
            this.closeButtonElement.setAttribute('aria-label', '关闭');
            this.closeButtonElement.setAttribute('type', 'button');
            this.modalElement.appendChild(this.closeButtonElement);
        }

        this.modalElement.appendChild(this.contentElement);
        this.backdropElement.appendChild(this.modalElement);
    }
    /**
     * 根据模态框类型获取对应的 CSS 类名
     * @private
     */
    _getModalClassByType() {
        const { type } = this.options;
        
        // 默认使用对话框样式
        let modalClass = this.options.classes.modal.dialog;
        
        switch (type) {
            case 'form':
                modalClass = this.options.classes.modal.form;
                break;
            case 'image':
                modalClass = this.options.classes.modal.image;
                break;
            case 'dialog':
            default:
                modalClass = this.options.classes.modal.dialog;
                break;
        }
        
        return modalClass;
    }
    /**
     * 设置初始动画状态
     * @private
     */
    _setInitialAnimationState() {
        // 重置所有可能的变换
        this.modalElement.style.transform = '';
        this.modalElement.style.opacity = '';
        this.backdropElement.style.opacity = '0';

        switch (this.options.animation) {
            case 'fade':
                this.modalElement.style.opacity = '0';
                break;
            case 'slideFromTop':
                this.modalElement.style.transform = 'translateY(-100%)';
                break;
            case 'zoomIn':
                this.modalElement.style.transform = 'scale(0.8)';
                this.modalElement.style.opacity = '0';
                break;
        }
    }

    /**
     * 执行入场动画
     * @private
     */
    _animateIn() {
        requestAnimationFrame(() => {
            this.backdropElement.style.opacity = '1';
            
            switch (this.options.animation) {
                case 'fade':
                    this.modalElement.style.opacity = '1';
                    break;
                case 'slideFromTop':
                    this.modalElement.style.transform = 'translateY(0)';
                    break;
                case 'zoomIn':
                    this.modalElement.style.transform = 'scale(1)';
                    this.modalElement.style.opacity = '1';
                    break;
            }
        });
    }

    /**
     * 执行出场动画
     * @private
     */
    _animateOut(onComplete) {
        // 设置超时备用，确保一定会关闭
        const timeoutId = setTimeout(() => {
            onComplete();
        }, 400);

        requestAnimationFrame(() => {
            this.backdropElement.style.opacity = '0';
            
            switch (this.options.animation) {
                case 'fade':
                    this.modalElement.style.opacity = '0';
                    break;
                case 'slideFromTop':
                    this.modalElement.style.transform = 'translateY(-100%)';
                    break;
                case 'zoomIn':
                    this.modalElement.style.transform = 'scale(0.8)';
                    this.modalElement.style.opacity = '0';
                    break;
            }

            // 监听动画结束
            const onAnimationEnd = () => {
                clearTimeout(timeoutId);
                onComplete();
            };

            // 使用较短的时间监听动画结束
            setTimeout(onAnimationEnd, 300);
        });
    }

    /**
     * 创建通用内容
     * @private
     */
    _createGenericContent() {
        const { content } = this.options;
        
        if (typeof content === 'function') {
            const contentNode = content(this.contentElement);
            if (contentNode && contentNode instanceof HTMLElement) {
                this.contentElement.innerHTML = '';
                this.contentElement.appendChild(contentNode);
            }
        } else if (typeof content === 'string') {
            this.contentElement.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.contentElement.innerHTML = '';
            this.contentElement.appendChild(content);
        } else {
            this.contentElement.innerHTML = '<p class="text-red-500">无效的内容类型</p>';
        }
    }

    /**
     * 创建图片内容
     * @private
     */
    _createImageContent() {
        const { src, currentSrc } = this.options.imageOptions;
        const imageSrcs = Array.isArray(src) ? src : [src];
        let currentIndex = 0;

        if (currentSrc) {
            const foundIndex = imageSrcs.findIndex(s => s === currentSrc);
            if (foundIndex !== -1) {
                currentIndex = foundIndex;
            } else {
                // 如果指定的图片不在列表中，使用第一张并给出警告
                console.warn(`指定的图片 ${currentSrc} 不在图片列表中，使用第一张图片`);
                currentIndex = 0;
            }
        } else {
            // 如果没有指定 currentSrc，默认使用第一张图片
            currentIndex = 0;
        }

        // 应用图片容器样式 - 使用安全的类名拼接
        this.contentElement.className = this._combineClasses([
            this.options.classes.content,
            this.options.classes.imageContainer
        ]);
        this.modalElement.style.cursor = 'grab';

        const imgElement = document.createElement('img');
        imgElement.src = imageSrcs[currentIndex];
        imgElement.alt = 'Modal Image';
        imgElement.className = this.options.classes.image;
        imgElement.draggable = false;

        this.contentElement.appendChild(imgElement);
        
        // 设置图片查看器
        if (imageSrcs.length > 1) {
            this._setupImageGallery(imgElement, imageSrcs, currentIndex);
        } else {
            this._setupSingleImage(imgElement);
        }
    }

    /**
     * 安全地组合多个类名
     * @private
     */
    _combineClasses(classNames) {
        return classNames
            .filter(className => className && className.trim())
            .map(className => className.trim())
            .join(' ');
    }

    /**
     * 设置单张图片交互
     * @private
     */
    _setupSingleImage(imgElement) {
        let scale = 1;
        let isPanning = false;
        let startX = 0, startY = 0;
        let translateX = 0, translateY = 0;

        const handleWheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY * -0.001;
            const newScale = Math.max(0.5, Math.min(3, scale + delta));
            
            if (newScale !== scale) {
                scale = newScale;
                imgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            }
        };

        const handleMouseDown = (e) => {
            if (scale > 1) {
                isPanning = true;
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
                this.modalElement.style.cursor = 'grabbing';
            }
        };

        const handleMouseMove = (e) => {
            if (!isPanning) return;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            imgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        };

        const handleMouseUp = () => {
            isPanning = false;
            this.modalElement.style.cursor = 'grab';
        };

        // 绑定事件
        this.contentElement.addEventListener('wheel', handleWheel, { passive: false });
        this.contentElement.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        // 保存清理函数
        this._imageCleanup = () => {
            this.contentElement.removeEventListener('wheel', handleWheel);
            this.contentElement.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }

    /**
     * 设置图片画廊
     * @private
     */
    _setupImageGallery(imgElement, imageSrcs, initialIndex) {
        let currentIndex = initialIndex;
        let scale = 1;

        // 创建上一张按钮
        const prevButton = document.createElement('button');
        prevButton.className = this._combineClasses([
            this.options.classes.galleryNav,
            this.options.classes.prevButton
        ]);
        prevButton.innerHTML = '‹';
        prevButton.setAttribute('aria-label', '上一张');
        prevButton.setAttribute('type', 'button');

        // 创建下一张按钮
        const nextButton = document.createElement('button');
        nextButton.className = this._combineClasses([
            this.options.classes.galleryNav,
            this.options.classes.nextButton
        ]);
        nextButton.innerHTML = '›';
        nextButton.setAttribute('aria-label', '下一张');
        nextButton.setAttribute('type', 'button');

        // 创建计数器
        const counterElement = document.createElement('div');
        counterElement.className = this.options.classes.galleryCounter;
        counterElement.textContent = `${currentIndex + 1} / ${imageSrcs.length}`;

        // 添加到模态框
        this.modalElement.appendChild(prevButton);
        this.modalElement.appendChild(nextButton);
        this.modalElement.appendChild(counterElement);

        // 更新按钮状态 - 修复类名操作
        const updateButtonStates = () => {
            const disabledClasses = [
                this.options.classes.galleryDisabledOpacity,
                this.options.classes.galleryDisabledCursor,
                this.options.classes.galleryDisabledHover
            ];

            // 上一张按钮状态
            if (currentIndex === 0) {
                disabledClasses.forEach(className => {
                    if (className) prevButton.classList.add(className);
                });
            } else {
                disabledClasses.forEach(className => {
                    if (className) prevButton.classList.remove(className);
                });
            }

            // 下一张按钮状态
            if (currentIndex === imageSrcs.length - 1) {
                disabledClasses.forEach(className => {
                    if (className) nextButton.classList.add(className);
                });
            } else {
                disabledClasses.forEach(className => {
                    if (className) nextButton.classList.remove(className);
                });
            }

            // 更新计数器
            counterElement.textContent = `${currentIndex + 1} / ${imageSrcs.length}`;
        };

        const showImage = (index) => {
            if (index < 0 || index >= imageSrcs.length) return;
            
            currentIndex = index;
            imgElement.style.opacity = '0';
            
            setTimeout(() => {
                imgElement.src = imageSrcs[currentIndex];
                imgElement.style.transform = 'scale(1)';
                scale = 1;
                imgElement.style.opacity = '1';
                updateButtonStates();
            }, 150);
        };

        // 按钮点击事件
        const handlePrevClick = () => {
            if (currentIndex > 0) {
                showImage(currentIndex - 1);
            }
        };

        const handleNextClick = () => {
            if (currentIndex < imageSrcs.length - 1) {
                showImage(currentIndex + 1);
            }
        };

        // 键盘导航
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                handlePrevClick();
            } else if (e.key === 'ArrowRight') {
                handleNextClick();
            } else if (e.key === 'Escape') {
                this.close();
            }
        };

                // 绑定事件
        prevButton.addEventListener('click', handlePrevClick);
        nextButton.addEventListener('click', handleNextClick);
        document.addEventListener('keydown', handleKeyDown);

        // 初始更新按钮状态
        updateButtonStates();

        // 保存清理函数
        this._imageCleanup = () => {
            prevButton.removeEventListener('click', handlePrevClick);
            nextButton.removeEventListener('click', handleNextClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }

    /**
     * 附加事件监听器
     * @private
     */
    _attachEventListeners() {
        // ESC 键关闭
        this._handleKeydown = (e) => {
            if (e.key === 'Escape' && this.isOpen && !this._isClosing) {
                this.close();
            }
        };
        document.addEventListener('keydown', this._handleKeydown);

        // 关闭按钮点击
        if (this.closeButtonElement) {
            this._handleCloseClick = () => this.close();
            this.closeButtonElement.addEventListener('click', this._handleCloseClick);
        }

        // 遮罩层点击关闭
        if (this.options.closeOnBackdropClick) {
            this._handleBackdropClick = (e) => {
                if (e.target === this.backdropElement && !this._isClosing) {
                    this.close();
                }
            };
            this.backdropElement.addEventListener('click', this._handleBackdropClick);
        }
    }

    /**
     * 移除事件监听器
     * @private
     */
    _removeEventListeners() {
        if (this._handleKeydown) {
            document.removeEventListener('keydown', this._handleKeydown);
        }
        if (this.closeButtonElement && this._handleCloseClick) {
            this.closeButtonElement.removeEventListener('click', this._handleCloseClick);
        }
        if (this.backdropElement && this._handleBackdropClick) {
            this.backdropElement.removeEventListener('click', this._handleBackdropClick);
        }
        if (this._imageCleanup) {
            this._imageCleanup();
        }
    }

    /**
     * 清理资源
     * @private
     */
    _cleanup() {
        this.modalElement = null;
        this.backdropElement = null;
        this.contentElement = null;
        this.closeButtonElement = null;
        this.options = {};
        this._onCloseCallback = null;
        
        // 清理事件引用
        this._handleKeydown = null;
        this._handleCloseClick = null;
        this._handleBackdropClick = null;
        this._imageCleanup = null;
    }

    /**
     * 锁定页面滚动
     * @private
     */
    _lockBodyScroll() {
        document.body.style.overflow = 'hidden';
    }

    /**
     * 解锁页面滚动
     * @private
     */
    _unlockBodyScroll() {
        document.body.style.overflow = '';
    }
}

// 导出单例实例
const modalManager = new ModalManager();
export default modalManager;

