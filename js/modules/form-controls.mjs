// form-controls.mjs

// =============================================
//    辅助函数 (Helper Functions)
// =============================================
//import { msg } from './msg.mjs'; // 【核心更新】导入外部消息模块
/**
 * 简单的防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} - 防抖后的函数
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// =============================================
//    1. 自定义单选下拉 (CustomSelect) - 正确版本
// =============================================
export class CustomSelect {
  constructor(element) {
    this.component = element;
    this.trigger = this.component.querySelector('.select-trigger'); // 单选类名
    this.optionsList = this.component.querySelector('.select-options'); // 单选类名
    this.options = this.component.querySelectorAll('.select-option'); // 单选类名
    this.hiddenInput = this.component.querySelector('input[type="hidden"]');
    this.placeholder = this.trigger.querySelector('.select-placeholder'); // 单选类名
    
    this.isActive = false;
    this.currentIndex = -1;
    
    this.init();
  }

  init() {
    this.trigger.addEventListener('click', () => this.toggle());
    this.options.forEach(option => option.addEventListener('click', (e) => this.selectOption(e)));
    this.component.addEventListener('keydown', (e) => this.handleKeydown(e));
    document.addEventListener('click', (e) => this.handleClickOutside(e));
    
    // 初始化已选项（如果有）
    const initialOption = this.component.querySelector('.select-option.is-selected');
    if (initialOption) {
        this.selectOption({ target: initialOption, stopPropagation: () => {} });
    }
  }
  
  toggle() {
    this.isActive = !this.isActive;
    this.component.classList.toggle('is-active', this.isActive);
    this.component.classList.toggle('is-focused', this.isActive);

    if (this.isActive) {
      const selected = this.component.querySelector('.select-option.is-selected');
      this.currentIndex = selected ? Array.from(this.options).indexOf(selected) : -1;
    }
  }
  
  selectOption(e) {
    e.stopPropagation();
    const option = e.target;
    const value = option.dataset.value;
    const text = option.innerText;

    this.hiddenInput.value = value;
    this.placeholder.innerText = text;

    this.options.forEach(opt => opt.classList.remove('is-selected'));
    option.classList.add('is-selected');

    this.isActive = false;
    this.updateState();
  }
  
  handleKeydown(e) {
    if (!this.isActive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      this.toggle();
      return;
    }
    if (!this.isActive) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.currentIndex = (this.currentIndex + 1) % this.options.length;
      this.updateHighlight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.currentIndex = (this.currentIndex - 1 + this.options.length) % this.options.length;
      this.updateHighlight();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (this.options[this.currentIndex]) {
        this.selectOption({ target: this.options[this.currentIndex], stopPropagation: () => {} });
      }
    } else if (e.key === 'Escape') {
      this.toggle();
    }
  }

  updateHighlight() {
    this.options.forEach(opt => opt.classList.remove('is-highlighted'));
    if (this.options[this.currentIndex]) {
      this.options[this.currentIndex].classList.add('is-highlighted');
      this.options[this.currentIndex].scrollIntoView({ block: 'nearest' });
    }
  }
  
  handleClickOutside(e) {
    if (this.isActive && !this.component.contains(e.target)) {
      this.toggle();
    }
  }
  
  updateState() {
    this.component.classList.toggle('is-active', this.isActive);
    this.component.classList.toggle('is-focused', this.isActive);
  }
}


// =============================================
//    2. 自定义多选下拉 (CustomMultiSelect) - 正确版本
// =============================================
export class CustomMultiSelect {
  constructor(element) {
    this.component = element;
    // --- ✅ 第一步：先从 data-* 属性读取所有原始值 ---//
    const rawPlaceholder = this.component.dataset.placeholder;
    const rawMaxTags = this.component.dataset.maxTags;
    const rawValidationMessage = this.component.dataset.validationMessage;
    
    // --- ✅ 第二步：处理原始值，并构建最终的配置对象 ---
    const maxTagsValue = parseInt(rawMaxTags, 10) || Infinity;
    // --- 核心：从 data-* 属性读取配置 ---
    this.config = {
        placeholder: rawPlaceholder || '请选择选项...',
      maxTags: maxTagsValue,
      // ✅ 现在可以安全地使用处理过的 maxTagsValue 变量
      validationMessage: rawValidationMessage || `最多只能选择 ${maxTagsValue} 个选项。`
    };
    // --- ✅ 第三步：继续执行后续的初始化逻辑 ---
    this.trigger = this.component.querySelector('.multi-select-trigger');
    this.optionsList = this.component.querySelector('.multi-select-options');
    this.options = this.component.querySelectorAll('.multi-select-option');
    this.hiddenInput = this.component.querySelector('input[type="hidden"]');
    this.tagsList = this.component.querySelector('.selected-tags-list');
    this.placeholder = this.component.querySelector('.multi-select-placeholder');
    this.selectedValues = new Set();
    this.isActive = false;
    this.init();
  }

  init() {
    this.placeholder.textContent = this.config.placeholder;
    this.trigger.addEventListener('click', (e) => {
      if (e.target.classList.contains('tag-remove-button')) return;
      this.toggle();
    });
    this.options.forEach(option => {
      option.addEventListener('click', (e) => this.toggleOption(e));
    });
    
    this.tagsList.addEventListener('click', (e) => {
      if (e.target.classList.contains('tag-remove-button')) {
        const valueToRemove = e.target.dataset.value;
        if (valueToRemove) {
          this.removeTag(valueToRemove);
        }
      }
    });
    document.addEventListener('click', (e) => this.handleClickOutside(e));
  }
  
  toggle() {
    this.isActive = !this.isActive;
    this.updateState();
  }

  toggleOption(e) {
    e.stopPropagation();
    const option = e.target;
    const value = option.dataset.value;
    // --- 新增：验证逻辑 ---
    if (this.selectedValues.has(value)) {
      this.selectedValues.delete(value);
      option.classList.remove('is-selected');
    } else {
        if (this.selectedValues.size >= this.config.maxTags) {
            alert(this.config.validationMessage); // 或者使用更优雅的提示方式
            //msg.error(`最多只能选择 ` + maxTagsValue + `个选项。`)
            return; // 阻止继续添加
        }
      this.selectedValues.add(value);
      option.classList.add('is-selected');
    }
    this.updateUI();
  }

  removeTag(value) {
    this.selectedValues.delete(value);
    this.component.querySelector(`.multi-select-option[data-value="${value}"]`)?.classList.remove('is-selected');
    this.updateUI();
  }

  updateUI() {
    this.tagsList.innerHTML = '';
    this.selectedValues.forEach(value => {
      const optionEl = this.component.querySelector(`.multi-select-option[data-value="${value}"]`);
      if (optionEl) {
        const tag = document.createElement('li');
        tag.className = 'selected-tag';
        
        const tagText = document.createElement('span');
        tagText.className = 'tag-text';
        tagText.textContent = optionEl.innerText;

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'tag-remove-button';
        removeButton.innerHTML = '&times;';
        removeButton.dataset.value = value;
        
        tag.appendChild(tagText);
        tag.appendChild(removeButton);
        this.tagsList.appendChild(tag);
      }
    });

    this.placeholder.style.display = this.selectedValues.size > 0 ? 'none' : 'block';
    this.hiddenInput.value = Array.from(this.selectedValues).join(',');
  }

  handleClickOutside(e) {
    if (this.isActive && !this.component.contains(e.target)) {
      this.toggle();
    }
  }
  
  updateState() {
    this.component.classList.toggle('is-active', this.isActive);
    this.component.classList.toggle('is-focused', this.isActive);
  }
}


// =============================================
//    3. 标签输入框 (TagInput) - 正确版本
// =============================================
export class TagInput {
  constructor(element) {
    this.component = element;
    this.input = this.component.querySelector('.tag-input-field');
    this.tagsList = this.component.querySelector('.tag-list');
    this.hiddenInput = this.component.querySelector('input[type="hidden"]');
    
    // --- ✅ 核心：从 data-* 属性读取配置，保持与其他组件一致 ---
    const rawPlaceholder = this.component.dataset.placeholder;
    const rawMaxTags = this.component.dataset.maxTags;
    const rawAllowDuplicates = this.component.dataset.allowDuplicates;
    
    this.config = {
      placeholder: rawPlaceholder || '输入后按回车添加...',
      allowDuplicates: rawAllowDuplicates === 'true', // 字符串转布尔值
      maxTags: parseInt(rawMaxTags, 10) || Infinity,
      separatorKeys: ['Enter', ','], // 固定为回车和逗号
    };
    this.tags = [];
    this.init();
  }
  init() {
    this.input.placeholder = this.config.placeholder;
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.input.addEventListener('input', debounce(() => this.adjustInputWidth(), 100));
    this.tagsList.addEventListener('click', (e) => {
      if (e.target.classList.contains('tag-remove')) {
        this.removeTag(e.target.dataset.index);
      }
    });
    this.adjustInputWidth();
  }
  
  handleKeydown(e) {
    const { key } = e;
    if (this.config.separatorKeys.includes(key)) {
      e.preventDefault();
      this.addTag(this.input.value.trim());
    } else if (key === 'Backspace' && this.input.value === '' && this.tags.length > 0) {
      this.removeTag(this.tags.length - 1);
    }
  }
  addTag(tagText) {
    if (!tagText) return;
    if (this.tags.length >= this.config.maxTags) {
        // 可以在这里集成 msg.mjs 来显示错误
        alert(`最多只能添加 ${this.config.maxTags} 个标签。`);
        return;
    }
    if (!this.config.allowDuplicates && this.tags.includes(tagText)) {
        // 可以在这里集成 msg.mjs 来显示错误
        alert(`标签 "${tagText}" 已存在。`);
        return;
    }
    
    this.tags.push(tagText);
    this.input.value = '';
    this.renderTags();
    this.adjustInputWidth();
  }
  removeTag(index) {
    this.tags.splice(index, 1);
    this.renderTags();
    this.adjustInputWidth();
  }
  renderTags() {
    this.tagsList.innerHTML = this.tags.map((tag, index) => `
      <li class="tag">
        <span class="tag-text">${this.escapeHtml(tag)}</span>
        <button type="button" class="tag-remove" data-index="${index}">&times;</button>
      </li>
    `).join('');
    this.hiddenInput.value = this.tags.join(',');
  }
  adjustInputWidth() {
    const sizer = document.createElement('span');
    sizer.style.visibility = 'hidden';
    sizer.style.position = 'absolute';
    sizer.style.whiteSpace = 'pre';
    sizer.textContent = this.input.value || this.input.placeholder;
    document.body.appendChild(sizer);
    this.input.style.width = `${sizer.offsetWidth + 2}px`;
    document.body.removeChild(sizer);
  }
  
  // 简单的 HTML 转义，防止 XSS
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
// =============================================
//    4. 自动完成输入框
// =============================================
export class AutoComplete {
    constructor(element) {
        this.component = element;
        this.input = this.component.querySelector('.autocomplete-input');
        this.suggestionsList = this.component.querySelector('.autocomplete-suggestions');
        this.hiddenInput = this.component.querySelector('input[type="hidden"]');
        this.allSuggestions = [];
        this.isActive = false;
        this.currentIndex = -1;
        this.config = {
            minQueryLength: parseInt(this.component.dataset.minQueryLength, 10) || 1,
            valueProperty: this.component.dataset.valueProperty || 'id',
            textProperty: this.component.dataset.textProperty || 'name'
        };
        this.init();
    }
    init() {
        if (this.component.dataset.localData) {
            try {
                this.allSuggestions = JSON.parse(this.component.dataset.localData);
            } catch (e) {
                console.error('AutoComplete: Failed to parse local data.', e);
            }
        }
        this.input.addEventListener('input', debounce(() => this.handleInput(), 300));
        this.input.addEventListener('focus', () => this.handleInput());
        this.component.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.suggestionsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-item')) {
                this.selectSuggestion(e.target);
            }
        });
        document.addEventListener('click', (e) => this.handleClickOutside(e));
    }
    handleInput() {
        const query = this.input.value.trim();
        if (query.length < this.config.minQueryLength) {
            this.closeSuggestions();
            return;
        }
        const filteredSuggestions = this.allSuggestions.filter(item => {
            const text = item[this.config.textProperty].toString().toLowerCase();
            return text.includes(query.toLowerCase());
        });
        this.renderSuggestions(filteredSuggestions);
    }
    renderSuggestions(suggestions) {
        this.suggestionsList.innerHTML = ''; // 清空
        if (suggestions.length === 0) {
            this.closeSuggestions();
            return;
        }
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.className = 'suggestion-item';
            li.textContent = suggestion[this.config.textProperty];
            li.dataset.value = suggestion[this.config.valueProperty];
            this.suggestionsList.appendChild(li);
        });
        this.openSuggestions();
    }
    
    openSuggestions() {
        this.isActive = true;
        this.currentIndex = -1;
        this.component.classList.add('is-active');
    }
    closeSuggestions() {
        this.isActive = false;
        this.currentIndex = -1;
        this.component.classList.remove('is-active');
    }
    selectSuggestion(itemElement) {
        const value = itemElement.dataset.value;
        const text = itemElement.textContent;
        this.input.value = text;
        this.hiddenInput.value = value;
        this.closeSuggestions();
    }
    handleKeydown(e) {
        if (!this.isActive) return;
        const items = this.suggestionsList.querySelectorAll('.suggestion-item');
        if (items.length === 0) return;
        let newIndex = this.currentIndex;
        switch (e.key) {
            case 'ArrowDown': e.preventDefault(); newIndex = (this.currentIndex + 1) % items.length; break;
            case 'ArrowUp': e.preventDefault(); newIndex = (this.currentIndex - 1 + items.length) % items.length; break;
            case 'Enter': e.preventDefault(); if (this.currentIndex > -1) this.selectSuggestion(items[this.currentIndex]); return;
            case 'Escape': this.closeSuggestions(); return;
            default: return;
        }
        if (this.currentIndex > -1) items[this.currentIndex].classList.remove('is-highlighted');
        this.currentIndex = newIndex;
        if (this.currentIndex > -1) {
            items[this.currentIndex].classList.add('is-highlighted');
            items[this.currentIndex].scrollIntoView({ block: 'nearest' });
        }
    }
    handleClickOutside(e) {
        if (!this.component.contains(e.target)) {
            this.closeSuggestions();
        }
    }
}
// =============================================
//    5. 文件上传器
// =============================================
/**
 * 用途：一个现代化的拖拽式文件上传区域，取代浏览器默认的 <input type="file">，提供更好的视觉反馈和交互。
 * 核心功能：
 * 拖放（Drag & Drop） 文件到指定区域。
 * 点击区域触发文件选择对话框。
 * 显示文件列表（名称、大小、类型）。
 * 进度条 显示上传进度。
 * 图片文件的 缩略图预览。
 * 移除已选择的文件。
 * 文件类型和大小的客户端验证。
 */

export class FileUploader {
    constructor(element) {
        this.component = element;
        this.uploadArea = this.component.querySelector('.upload-area');
        this.fileInput = this.component.querySelector('.file-input');
        this.fileList = this.component.querySelector('.file-list');
        this.hiddenInput = this.component.querySelector('input[type="hidden"]');
        
        this.files = new Map(); // 使用 Map 存储文件对象和其状态
        this.config = {
            action: this.component.dataset.action || '#',
            multiple: this.component.dataset.multiple === 'true',
            maxFiles: parseInt(this.component.dataset.maxFiles, 10) || 5,
            maxSize: this._parseSize(this.component.dataset.maxSize || '5MB'),
            accept: this.component.dataset.accept || '*'
        };
        
        this.init();
    }
    init() {
        this.setupEventListeners();
        this.updatePlaceholder();
    }
    
    setupEventListeners() {
        // 点击上传区域触发文件选择
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        // 文件选择变化
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
        // 拖放事件
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('is-dragover');
        });
        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('is-dragover');
        });
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('is-dragover');
            this.handleFiles(e.dataTransfer.files);
        });
    }
    handleFiles(fileList) {
        const newFiles = Array.from(fileList);
        
        if (!this.config.multiple) {
            this.clearAllFiles();
        }
        for (const file of newFiles) {
            if (this.files.size >= this.config.maxFiles) {
                alert(`最多只能上传 ${this.config.maxFiles} 个文件。`);
                break;
            }
            if (file.size > this.config.maxSize) {
                alert(`文件 "${file.name}" 大小超过 ${this._formatSize(this.config.maxSize)} 限制。`);
                continue;
            }
            const fileId = Date.now() + Math.random(); // 简单的唯一ID
            this.files.set(fileId, {
                file: file,
                status: 'pending', // pending, uploading, success, error
                progress: 0
            });
            this.renderFileItem(fileId, file);
            this.uploadFile(fileId); // 自动上传
        }
        this.updatePlaceholder();
    }
    renderFileItem(fileId, file) {
        const li = document.createElement('li');
        li.className = 'file-item';
        li.dataset.fileId = fileId;
        const preview = document.createElement('div');
        preview.className = 'file-item-preview';
        // 检查是否为图片并创建预览
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.className = 'file-item-preview';
            li.appendChild(img);
        } else {
            preview.innerHTML = this._getFileIcon(file.type);
            li.appendChild(preview);
        }
        const details = document.createElement('div');
        details.className = 'file-item-details';
        details.innerHTML = `
            <div class="file-item-name">${this._escapeHtml(file.name)}</div>
            <div class="file-item-size">${this._formatSize(file.size)}</div>
        `;
        li.appendChild(details);
        const status = document.createElement('div');
        status.className = 'file-item-status status-pending';
        status.textContent = '等待中';
        li.appendChild(status);
        
        const progressBar = document.createElement('div');
        progressBar.className = 'upload-progress-bar';
        li.appendChild(progressBar);
        const removeBtn = document.createElement('button');
        removeBtn.className = 'file-item-remove';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', () => this.removeFile(fileId));
        li.appendChild(removeBtn);
        this.fileList.appendChild(li);
    }
    async uploadFile(fileId) {
        const fileEntry = this.files.get(fileId);
        if (!fileEntry) return;
        const itemEl = this.fileList.querySelector(`[data-file-id="${fileId}"]`);
        const statusEl = itemEl.querySelector('.file-item-status');
        const progressBar = itemEl.querySelector('.upload-progress-bar');
        fileEntry.status = 'uploading';
        statusEl.className = 'file-item-status status-uploading';
        statusEl.textContent = '上传中...';
        // --- 模拟上传过程 ---
        // 实际应用中，这里应该是使用 FormData 和 fetch/XMLHttpRequest 的真实请求
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress > 100) progress = 100;
                fileEntry.progress = progress;
                progressBar.style.width = `${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                    fileEntry.status = Math.random() > 0.1 ? 'success' : 'error'; // 模拟偶尔失败
                    if (fileEntry.status === 'success') {
                        statusEl.className = 'file-item-status status-success';
                        statusEl.textContent = '成功';
                        this.updateHiddenInput();
                    } else {
                        statusEl.className = 'file-item-status status-error';
                        statusEl.textContent = '失败';
                    }
                    resolve();
                }
            }, 200);
        });
    }
    removeFile(fileId) {
        this.files.delete(fileId);
        const itemEl = this.fileList.querySelector(`[data-file-id="${fileId}"]`);
        if (itemEl) {
            // 如果是图片，释放创建的 URL
            const img = itemEl.querySelector('img');
            if (img) URL.revokeObjectURL(img.src);
            itemEl.remove();
        }
        this.updatePlaceholder();
        this.updateHiddenInput();
    }
    clearAllFiles() {
        this.files.forEach((_, fileId) => this.removeFile(fileId));
        this.files.clear();
    }
    
    updatePlaceholder() {
        const isFull = !this.config.multiple || this.files.size >= this.config.maxFiles;
        this.uploadArea.classList.toggle('is-disabled', isFull);
    }
    
    updateHiddenInput() {
        const successfulFiles = Array.from(this.files.values())
            .filter(entry => entry.status === 'success')
            .map(entry => entry.file.name); // 通常提交文件名或服务器返回的ID
        this.hiddenInput.value = successfulFiles.join(',');
    }
    
    // --- 辅助函数 ---
    _parseSize(sizeStr) {
        const units = { 'B': 1, 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024 };
        const [size, unit] = sizeStr.toUpperCase().match(/\d+|\w+/g);
        return parseInt(size, 10) * (units[unit] || 1);
    }
    _formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    _getFileIcon(mimeType) {
        const iconMap = {
            'application/pdf': '<i class="bx bxs-file-pdf"></i>',
            'application/msword': '<i class="bx bxs-file-doc"></i>',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '<i class="bx bxs-file-doc"></i>',
            // ...可以添加更多类型
        };
        return iconMap[mimeType] || '<i class="bx bxs-file"></i>';
    }
    
    _escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}
// =============================================
//    6. 日期/时间选择器
// =============================================
/**
 * 用途：提供一个用户友好的日历界面来选择日期，或一个时间滚轮来选择时间，避免用户手动输入各种格式的日期字符串。
 * 核心功能：
 * 显示月历视图。
 * 高亮显示今天和选中的日期。
 * 快速切换月份/年份。
 * 限制可选日期范围（如，只能选今天之后的日期）。
 * 支持选择日期范围。
 */

// =============================================
//    7. 评分器
// =============================================
/**
 * 用途：允许用户通过点击星星来进行评分，直观且富于交互性。
 * 核心功能：
 * 渲染一组星星图标。
 * 鼠标悬停时显示“预览”状态。
 * 点击设置评分。
 * 支持只读模式，仅显示评分。
 * 支持半星评分（如果需要）。
 */
export class Rater {
    constructor(element) {
        this.component = element;
        this.hiddenInput = this.component.querySelector('input[type="hidden"]');
        
        this.config = {
            max: parseInt(this.component.dataset.max) || 5,
            allowHalf: this.component.dataset.allowHalf === 'true',
            readonly: this.component.dataset.readonly === 'true',
        };
        
        this.starIcon = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
        
        // currentRating 是内部状态，hoverRating 用于悬停预览
        this.currentRating = parseFloat(this.hiddenInput.value) || 0;
        this.hoverRating = 0;
        
        this.init();
    }
    init() {
        // 只渲染一次DOM结构
        this.renderStars();
        // 如果不是只读，才绑定事件
        if (!this.config.readonly) {
            this.setupEventListeners();
        }
    }
    /**
     * 渲染星星的DOM结构，此函数只在初始化时调用一次。
     */
    renderStars() {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'rater-stars';
        
        for (let i = 1; i <= this.config.max; i++) {
            const starWrapper = document.createElement('div');
            starWrapper.className = 'rater-star-wrapper';
            starWrapper.dataset.value = i;
            
            // 背景星（灰色）
            const bgStar = document.createElement('div');
            bgStar.className = 'rater-star rater-star-bg';
            bgStar.innerHTML = this.starIcon;
            
            // 前景星（黄色/高亮色）
            const fgStar = document.createElement('div');
            fgStar.className = 'rater-star rater-star-fg';
            fgStar.innerHTML = this.starIcon;
            
            starWrapper.appendChild(bgStar);
            starWrapper.appendChild(fgStar);
            starsContainer.appendChild(starWrapper);
        }
        
        // 初始化组件内部结构，避免重复清空
        if (this.component.children.length > 1) { // 如果已经有hidden input之外的内容，则清空重建
            this.component.innerHTML = '';
        }
        this.component.appendChild(this.hiddenInput);
        this.component.appendChild(starsContainer);
        
        // 初始化时更新星星显示
        this.updateStarsDisplay(this.currentRating);
    }
    
    /**
     * 根据评分更新所有星星的视觉效果。
     * @param {number} rating - 用于显示的评分（可以是currentRating或hoverRating）。
     */
    updateStarsDisplay(rating) {
        const starFgElements = this.component.querySelectorAll('.rater-star-fg');
        starFgElements.forEach((star, index) => {
            const starValue = index + 1;
            let fillPercentage = 0;
            
            // 【修复核心】修正计算逻辑
            if (rating >= starValue) {
                fillPercentage = 100;
            } else if (rating > starValue - 1) {
                fillPercentage = (rating - (starValue - 1)) * 100;
            }
            
            star.style.clipPath = `inset(0 ${100 - fillPercentage}% 0 0)`;
        });
    }
    setupEventListeners() {
        const starsContainer = this.component.querySelector('.rater-stars');
        
        starsContainer.addEventListener('mouseleave', () => {
            this.hoverRating = 0;
            this.updateStarsDisplay(this.currentRating);
        });
        
        starsContainer.addEventListener('mousemove', (e) => {
            const starWrapper = e.target.closest('.rater-star-wrapper');
            if (!starWrapper) return;
            
            const rect = starWrapper.getBoundingClientRect();
            const percentage = (e.clientX - rect.left) / rect.width;
            const starValue = parseInt(starWrapper.dataset.value);
            
            let hoverRating = starValue - 1; // 基础值
            if (this.config.allowHalf) {
                // 【优化】更平滑的半星判断
                if (percentage > 0.75) {
                    hoverRating += 1;
                } else if (percentage > 0.25) {
                    hoverRating += 0.5;
                }
            } else {
                hoverRating = percentage > 0.5 ? starValue : starValue - 1;
            }
            
            this.hoverRating = Math.min(Math.max(0, hoverRating), this.config.max);
            this.updateStarsDisplay(this.hoverRating);
        });
        
        starsContainer.addEventListener('click', (e) => {
            // 点击时，将当前悬停的评分设置为最终评分
            if (this.hoverRating > 0) {
                this.setRating(this.hoverRating);
            }
        });
    }
    /**
     * 设置最终的评分。
     * @param {number} rating - 要设置的评分。
     */
    setRating(rating) {
        this.currentRating = Math.min(Math.max(0, rating), this.config.max);
        this.hiddenInput.value = this.currentRating;
        // 触发 change 事件，方便外部监听
        this.hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
        // 更新显示
        this.updateStarsDisplay(this.currentRating);
    }
}
// =============================================
//    8. 步进器/数值输入器
// =============================================
/**
 * 用途：一个增强版的数字输入框，带有加减按钮，方便用户精确调整数值。
 * 核心功能：
 * 加/减按钮，点击时改变 input 的值。
 * 支持长按按钮持续增减。
 * 限制最小值和最大值。
 * 支持步进值。
 * 防止输入非数字字符。
 */


// =============================================
//    9. 统一初始化函数 (Initialize All)
// =============================================
/**
 * 初始化页面上所有已标记的表单控件
 */
export function initializeFormControls() {
  // 初始化单选下拉
  document.querySelectorAll('.custom-select-component').forEach(el => new CustomSelect(el));

  // 初始化多选下拉
  document.querySelectorAll('.custom-multi-select-component').forEach(el => new CustomMultiSelect(el));
  
  // 初始化标签输入框
  document.querySelectorAll('.tag-input-component').forEach(el => new TagInput(el));

  // 初始化自动完成输入框
  document.querySelectorAll('.autocomplete-component').forEach(el => new AutoComplete(el));

  // 初始化文件上传器
  document.querySelectorAll('.file-uploader-component').forEach(el => new FileUploader(el));

  // 初始化评分器
  document.querySelectorAll('.rater-component').forEach(el => new Rater(el));
}
