(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        seed: 0,
        instances: new Map(),
        stylesInjected: false
    };

    const defaults = {
        url: '',
        method: 'POST',
        fieldName: 'file',
        multiple: true,
        autoUpload: true,
        dragDrop: true,
        paste: true,
        accept: '',
        maxFiles: 0,
        maxSize: 0,
        headers: {},
        data: {},
        withCredentials: false,
        disabled: false,
        parallel: 2,
        chunked: false,
        chunkSize: 2 * 1024 * 1024,
        preview: true,
        listType: 'list',
        request: null,
        chunkRequest: null,
        transformResponse: null,
        itemRender: null,
        onBeforeAdd: null,
        onChange: null,
        onSuccess: null,
        onError: null,
        onRemove: null,
        onPreview: null
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-upload-${runtime.seed}`;
    }

    function injectStyles() {
        if (runtime.stylesInjected) return;
        runtime.stylesInjected = true;
        const style = document.createElement('style');
        style.id = 'jquanui-upload-styles';
        style.textContent = `
[jq-upload]{
  display:grid;
  gap:12px;
}
[jq-upload-toolbar]{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:8px;
}
[jq-upload-toolbar] button{
  height:34px;
  border:1px solid rgb(203 213 225 / 1);
  border-radius:10px;
  background:#fff;
  color:rgb(15 23 42 / 1);
  padding:0 12px;
}
[jq-upload-dropzone]{
  display:grid;
  place-items:center;
  min-height:140px;
  padding:20px;
  border:1.5px dashed rgb(148 163 184 / 1);
  border-radius:16px;
  background:rgb(248 250 252 / 1);
  color:rgb(71 85 105 / 1);
  cursor:pointer;
  text-align:center;
}
[jq-upload-dropzone][data-dragover="true"]{
  border-color:rgb(var(--primary-hue-500, 59 130 246) / 1);
  background:rgb(239 246 255 / 1);
}
[jq-upload-list]{
  display:grid;
  gap:8px;
}
[jq-upload-item]{
  display:grid;
  grid-template-columns:auto minmax(0,1fr) 140px auto;
  gap:10px;
  align-items:center;
  padding:10px 12px;
  border:1px solid rgb(226 232 240 / 1);
  border-radius:12px;
  background:#fff;
}
[jq-upload-thumb]{
  width:48px;
  height:48px;
  border-radius:10px;
  overflow:hidden;
  background:rgb(241 245 249 / 1);
  display:grid;
  place-items:center;
  color:rgb(100 116 139 / 1);
  font-size:12px;
}
[jq-upload-thumb] img{
  width:100%;
  height:100%;
  object-fit:cover;
}
[jq-upload-meta]{
  min-width:0;
  display:grid;
  gap:4px;
}
[jq-upload-name]{
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
[jq-upload-extra]{
  color:rgb(100 116 139 / 1);
  font-size:12px;
}
[jq-upload-progress]{
  width:140px;
  height:8px;
  border-radius:999px;
  background:rgb(226 232 240 / 1);
  overflow:hidden;
}
[jq-upload-progress] span{
  display:block;
  height:100%;
  background:rgb(var(--primary-hue-500, 59 130 246) / 1);
}
[jq-upload-actions]{
  display:flex;
  gap:6px;
}
[jq-upload-actions] button{
  height:30px;
  border:1px solid rgb(203 213 225 / 1);
  border-radius:8px;
  background:#fff;
  padding:0 10px;
}
        `;
        document.head.appendChild(style);
    }

    function resolveElement(target) {
        if (typeof target === 'string') return document.querySelector(target) || document.getElementById(target.replace(/^#/, ''));
        return target instanceof HTMLElement ? target : null;
    }

    function normalizeOptions(input) {
        const merged = Object.assign({}, defaults, input || {});
        merged.parallel = Math.max(1, Number(merged.parallel) || 2);
        merged.maxFiles = Math.max(0, Number(merged.maxFiles) || 0);
        merged.maxSize = Math.max(0, Number(merged.maxSize) || 0);
        merged.chunkSize = Math.max(256 * 1024, Number(merged.chunkSize) || defaults.chunkSize);
        merged.multiple = merged.multiple !== false;
        merged.autoUpload = merged.autoUpload !== false;
        merged.dragDrop = merged.dragDrop !== false;
        merged.preview = merged.preview !== false;
        merged.paste = merged.paste !== false;
        return merged;
    }

    function isImage(file) {
        return /^image\//.test(file.type || '');
    }

    function createFileRecord(file) {
        return {
            id: `jq-file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'ready',
            progress: 0,
            response: null,
            error: null,
            previewUrl: null,
            chunks: [],
            uploadedChunks: 0,
            retries: 0
        };
    }

    function formatSize(size) {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    function revokePreview(item) {
        if (item.previewUrl) {
            URL.revokeObjectURL(item.previewUrl);
            item.previewUrl = null;
        }
    }

    function renderItem(record, item) {
        if (typeof record.options.itemRender === 'function') {
            return record.options.itemRender(item, record);
        }
        const thumb = item.previewUrl ? `<img src="${item.previewUrl}" alt="${escapeHtml(item.name)}">` : '<span>FILE</span>';
        const extra = `${formatSize(item.size)} · ${item.status}${item.error ? ` · ${escapeHtml(item.error.message || item.error)}` : ''}`;
        const actions = [];
        if (record.options.preview && item.previewUrl) actions.push(`<button type="button" data-action="preview" data-id="${item.id}">Preview</button>`);
        if (item.status === 'error') actions.push(`<button type="button" data-action="retry" data-id="${item.id}">Retry</button>`);
        if (item.status === 'ready') actions.push(`<button type="button" data-action="upload" data-id="${item.id}">Upload</button>`);
        actions.push(`<button type="button" data-action="remove" data-id="${item.id}">${item.status === 'uploading' ? 'Cancel' : 'Remove'}</button>`);
        return `
<div jq-upload-item data-id="${item.id}">
  <div jq-upload-thumb>${thumb}</div>
  <div jq-upload-meta>
    <div jq-upload-name>${escapeHtml(item.name)}</div>
    <div jq-upload-extra>${extra}</div>
  </div>
  <div jq-upload-progress><span style="width:${item.progress}%;"></span></div>
  <div jq-upload-actions>${actions.join('')}</div>
</div>`;
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, token => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[token]));
    }

    function wait(ms) {
        return new Promise(resolve => window.setTimeout(resolve, ms));
    }

    function getRetryDelay(attempt) {
        const safeAttempt = Math.max(0, Number(attempt) || 0);
        const base = Math.min(8000, 400 * (2 ** safeAttempt));
        const jitter = Math.round(Math.random() * 250);
        return base + jitter;
    }

    function render(record) {
        const { element, options, files } = record;
        element.setAttribute('jq-upload', '');
        const listHtml = files.map(item => renderItem(record, item)).join('');
        element.innerHTML = `
<input type="file" data-role="input" style="display:none;" ${options.multiple ? 'multiple' : ''} ${options.accept ? `accept="${options.accept}"` : ''}>
<div jq-upload-toolbar>
  <button type="button" data-action="pick"${options.disabled ? ' disabled' : ''}>Choose</button>
  <button type="button" data-action="upload-all"${options.disabled ? ' disabled' : ''}>Upload All</button>
  <button type="button" data-action="clear"${options.disabled ? ' disabled' : ''}>Clear</button>
</div>
<div jq-upload-dropzone data-role="dropzone" ${options.disabled ? 'aria-disabled="true"' : ''}>Click, drag, or paste files here</div>
<div jq-upload-list>${listHtml}</div>
        `;
        bind(record);
    }

    function emit(record) {
        if (typeof record.options.onChange === 'function') record.options.onChange(record.files.slice());
    }

    function bind(record) {
        const input = record.element.querySelector('[data-role="input"]');
        const dropzone = record.element.querySelector('[data-role="dropzone"]');

        input.onchange = () => {
            addFiles(record.id, Array.from(input.files || []));
            input.value = '';
        };

        record.element.onclick = event => {
            const actionNode = event.target.closest('[data-action]');
            if (!actionNode) return;
            const action = actionNode.getAttribute('data-action');
            const fileId = actionNode.getAttribute('data-id');
            if (action === 'pick') input.click();
            if (action === 'upload-all') flushQueue(record.id);
            if (action === 'clear') createHandle(record.id).clear();
            if (action === 'remove') removeFile(record.id, fileId);
            if (action === 'retry') retryFile(record.id, fileId);
            if (action === 'upload') uploadSingle(record.id, fileId);
            if (action === 'preview') previewFile(record.id, fileId);
        };

        dropzone.onclick = () => {
            if (record.options.disabled) return;
            input.click();
        };

        if (record.options.dragDrop) {
            ['dragenter', 'dragover'].forEach(type => {
                dropzone.addEventListener(type, event => {
                    event.preventDefault();
                    dropzone.setAttribute('data-dragover', 'true');
                });
            });
            ['dragleave', 'drop'].forEach(type => {
                dropzone.addEventListener(type, event => {
                    event.preventDefault();
                    dropzone.setAttribute('data-dragover', 'false');
                });
            });
            dropzone.ondrop = event => {
                if (record.options.disabled) return;
                addFiles(record.id, Array.from(event.dataTransfer?.files || []));
            };
        }

        if (record.options.paste) {
            dropzone.onpaste = event => {
                if (record.options.disabled) return;
                const files = Array.from(event.clipboardData?.files || []);
                if (files.length) addFiles(record.id, files);
            };
        }
    }

    function mount(target, inputOptions = {}) {
        injectStyles();
        const element = resolveElement(target);
        if (!element) throw new Error('[JquanUI upload] Container not found.');
        const id = element.id || nextId();
        element.id = id;
        const options = normalizeOptions(inputOptions);
        const record = {
            id,
            element,
            options,
            files: [],
            active: 0
        };
        runtime.instances.set(id, record);
        render(record);
        return createHandle(id);
    }

    async function preparePreview(item, options) {
        if (!options.preview || !isImage(item.file) || item.previewUrl) return;
        item.previewUrl = URL.createObjectURL(item.file);
    }

    function validateFile(record, file) {
        if (record.options.maxSize && file.size > record.options.maxSize) {
            return `File too large: ${file.name}`;
        }
        if (record.options.maxFiles && record.files.length >= record.options.maxFiles) {
            return 'Maximum file count exceeded.';
        }
        return '';
    }

    async function addFiles(target, files) {
        const record = runtime.instances.get(target);
        if (!record) return null;
        for (const file of files) {
            if (typeof record.options.onBeforeAdd === 'function') {
                const allowed = await Promise.resolve(record.options.onBeforeAdd(file, record.files.slice()));
                if (allowed === false) continue;
            }
            const error = validateFile(record, file);
            const item = createFileRecord(file);
            if (error) {
                item.status = 'error';
                item.error = new Error(error);
            } else {
                await preparePreview(item, record.options);
            }
            record.files.push(item);
        }
        render(record);
        emit(record);
        if (record.options.autoUpload) flushQueue(record.id);
        return createHandle(record.id);
    }

    function buildChunks(item, options) {
        const chunks = [];
        const chunkSize = Number(options.chunkSize) || defaults.chunkSize;
        const total = Math.ceil(item.file.size / chunkSize);
        for (let index = 0; index < total; index += 1) {
            const start = index * chunkSize;
            const end = Math.min(start + chunkSize, item.file.size);
            chunks.push({
                index,
                total,
                blob: item.file.slice(start, end),
                start,
                end,
                uploaded: false
            });
        }
        return chunks;
    }

    async function requestUpload(record, item) {
        if (record.options.chunked) {
            return requestChunkedUpload(record, item);
        }
        if (typeof record.options.request === 'function') {
            return record.options.request(item, record);
        }
        const http = JquanUIComponents.httpApi;
        if (http && typeof http.postForm === 'function' && record.options.url) {
            const data = Object.assign({}, record.options.data);
            data[record.options.fieldName] = item.file;
            return http.postForm(record.options.url, data, {
                method: record.options.method,
                headers: record.options.headers,
                credentials: record.options.withCredentials ? 'include' : 'same-origin'
            });
        }
        const form = new FormData();
        Object.entries(record.options.data || {}).forEach(([key, value]) => form.append(key, value));
        form.append(record.options.fieldName, item.file);
        const response = await fetch(record.options.url, {
            method: record.options.method || 'POST',
            body: form,
            headers: record.options.headers,
            credentials: record.options.withCredentials ? 'include' : 'same-origin'
        });
        const data = await response.text();
        if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
        return { data, status: response.status, headers: {} };
    }

    async function requestChunkedUpload(record, item) {
        item.chunks = item.chunks.length ? item.chunks : buildChunks(item, record.options);
        const uploader = typeof record.options.chunkRequest === 'function'
            ? record.options.chunkRequest
            : defaultChunkRequest;
        for (let i = 0; i < item.chunks.length; i += 1) {
            const chunk = item.chunks[i];
            if (chunk.uploaded) continue;
            const response = await uploader(record, item, chunk);
            chunk.uploaded = true;
            item.uploadedChunks += 1;
            item.progress = Math.round((item.uploadedChunks / item.chunks.length) * 100);
            render(record);
            item.response = response;
        }
        return item.response;
    }

    async function defaultChunkRequest(record, item, chunk) {
        const http = JquanUIComponents.httpApi;
        const form = new FormData();
        Object.entries(record.options.data || {}).forEach(([key, value]) => form.append(key, value));
        form.append(record.options.fieldName, chunk.blob, item.name);
        form.append('chunkIndex', String(chunk.index));
        form.append('chunkTotal', String(chunk.total));
        form.append('fileName', item.name);
        if (http && typeof http.postForm === 'function' && record.options.url) {
            const payload = {};
            for (const [key, value] of form.entries()) payload[key] = value;
            return http.postForm(record.options.url, payload, {
                method: record.options.method,
                headers: record.options.headers,
                credentials: record.options.withCredentials ? 'include' : 'same-origin'
            });
        }
        const response = await fetch(record.options.url, {
            method: record.options.method || 'POST',
            body: form,
            headers: record.options.headers,
            credentials: record.options.withCredentials ? 'include' : 'same-origin'
        });
        const data = await response.text();
        if (!response.ok) throw new Error(`Chunk upload failed: ${response.status}`);
        return { data, status: response.status, headers: {} };
    }

    async function runUpload(record, item) {
        record.active += 1;
        item.status = 'uploading';
        item.progress = Math.max(item.progress, 8);
        render(record);
        try {
            let response = await requestUpload(record, item);
            if (typeof record.options.transformResponse === 'function') {
                response = await record.options.transformResponse(response, item, record);
            }
            item.status = 'success';
            item.progress = 100;
            item.response = response;
            item.error = null;
            if (typeof record.options.onSuccess === 'function') record.options.onSuccess(item, response, record.files.slice());
        } catch (error) {
            item.status = 'error';
            item.error = error;
            item.progress = 0;
            if (typeof record.options.onError === 'function') record.options.onError(item, error, record.files.slice());
        } finally {
            record.active -= 1;
            render(record);
            emit(record);
            flushQueue(record.id);
        }
    }

    async function flushQueue(target) {
        const record = runtime.instances.get(target);
        if (!record) return null;
        const ready = record.files.filter(item => item.status === 'ready');
        while (record.active < record.options.parallel && ready.length) {
            const item = ready.shift();
            runUpload(record, item);
        }
        return createHandle(record.id);
    }

    function uploadSingle(target, fileId) {
        const record = runtime.instances.get(target);
        if (!record) return null;
        const item = record.files.find(file => file.id === fileId);
        if (!item || item.status !== 'ready') return createHandle(record.id);
        runUpload(record, item);
        return createHandle(record.id);
    }

    function retryFile(target, fileId) {
        const record = runtime.instances.get(target);
        if (!record) return null;
        const item = record.files.find(file => file.id === fileId);
        if (!item) return null;
        const attempt = item.retries;
        item.status = 'retrying';
        item.error = null;
        item.progress = 0;
        item.retries += 1;
        item.chunks = [];
        item.uploadedChunks = 0;
        render(record);
        wait(getRetryDelay(attempt)).then(() => {
            const latest = record.files.find(file => file.id === fileId);
            if (!latest) return;
            latest.status = 'ready';
            render(record);
            uploadSingle(record.id, fileId);
        });
        return createHandle(record.id);
    }

    function previewFile(target, fileId) {
        const record = runtime.instances.get(target);
        if (!record) return null;
        const item = record.files.find(file => file.id === fileId);
        if (!item) return null;
        if (typeof record.options.onPreview === 'function') {
            record.options.onPreview(item, record.files.slice());
        } else if (item.previewUrl) {
            window.open(item.previewUrl, '_blank', 'noopener,noreferrer');
        }
        return item;
    }

    function removeFile(target, fileId) {
        const record = runtime.instances.get(target);
        if (!record) return false;
        const index = record.files.findIndex(item => item.id === fileId);
        if (index < 0) return false;
        const [removed] = record.files.splice(index, 1);
        revokePreview(removed);
        render(record);
        emit(record);
        if (typeof record.options.onRemove === 'function') record.options.onRemove(removed, record.files.slice());
        return true;
    }

    function createHandle(id) {
        const record = runtime.instances.get(id);
        if (!record) return null;
        return {
            id,
            files() {
                return record.files.slice();
            },
            add(files) {
                return addFiles(id, Array.isArray(files) ? files : [files]);
            },
            upload() {
                return flushQueue(id);
            },
            retry(fileId) {
                return retryFile(id, fileId);
            },
            preview(fileId) {
                return previewFile(id, fileId);
            },
            clear() {
                record.files.forEach(revokePreview);
                record.files = [];
                render(record);
                emit(record);
                return true;
            },
            remove(fileId) {
                return removeFile(id, fileId);
            },
            update(patch = {}) {
                record.options = normalizeOptions(Object.assign({}, record.options, patch));
                render(record);
                return this;
            },
            destroy() {
                record.files.forEach(revokePreview);
                runtime.instances.delete(id);
                if (record.element) record.element.innerHTML = '';
                return true;
            }
        };
    }

    const uploadApi = {
        mount(target, options = {}) {
            return mount(target, options);
        },
        get(target) {
            const element = resolveElement(target);
            if (element?.id) return createHandle(element.id);
            return runtime.instances.get(target) ? createHandle(target) : null;
        },
        destroy(target) {
            const handle = this.get(target);
            return handle ? handle.destroy() : false;
        }
    };

    JquanUIComponents.uploadApi = uploadApi;

    JquanUIComponents.upload = {
        name: 'jquanui-upload',
        version: '2.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-upload], [data-jq-upload]',
                setup(node) {
                    mount(node, {
                        url: node.getAttribute('data-upload-url') || '',
                        multiple: node.getAttribute('data-upload-multiple') !== 'false',
                        autoUpload: node.getAttribute('data-upload-auto') !== 'false',
                        accept: node.getAttribute('data-upload-accept') || '',
                        paste: node.getAttribute('data-upload-paste') !== 'false',
                        chunked: node.getAttribute('data-upload-chunked') === 'true'
                    });
                    return () => {
                        if (node.id) uploadApi.destroy(node.id);
                    };
                }
            });
        }
    };
})(window);
