(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const overlayPreset = JquanUIComponents.overlayPreset || { classes: {} };

    const runtime = {
        seed: 0,
        stack: [],
        instances: new Map()
    };

    const defaultImageOptions = {
        src: [],
        startIndex: 0,
        loop: false,
        zoom: true,
        minZoom: 1,
        maxZoom: 3,
        zoomStep: 0.2
    };

    const defaultFormOptions = {
        schema: [],
        values: {},
        validator: null,
        submitText: 'Submit',
        cancelText: 'Cancel',
        showCancel: true,
        closeOnSubmit: true,
        noValidate: false,
        submitVariant: 'primary',
        attributes: {}
    };

    const defaultClasses = {
        root: 'jq-modal-root fixed inset-0 flex p-4 opacity-0 transition-opacity duration-200',
        rootModal: 'items-center justify-center',
        rootDrawerLeft: 'items-stretch justify-start p-0',
        rootDrawerRight: 'items-stretch justify-end p-0',
        rootDrawerTop: 'items-start justify-center p-0',
        rootDrawerBottom: 'items-end justify-center p-0',
        backdrop: `jq-modal-backdrop ${overlayPreset.classes.backdrop || 'absolute inset-0 bg-slate-950/60 backdrop-blur-sm'}`,
        panel: `jq-modal-panel relative flex flex-col max-w-full overflow-hidden ${overlayPreset.classes.surface || 'pointer-events-auto border border-slate-200 bg-white text-slate-900 shadow-2xl'} opacity-0 transition duration-200`,
        panelModal: `${overlayPreset.classes.panelRadiusLg || 'rounded-3xl'} max-h-[92vh]`,
        panelDrawer: 'min-h-screen',
        panelDrawerLeft: 'rounded-r-3xl',
        panelDrawerRight: 'rounded-l-3xl',
        panelDrawerTop: 'rounded-b-3xl',
        panelDrawerBottom: 'rounded-t-3xl',
        header: 'jq-modal-header grid gap-1 px-5 pt-5',
        headerHidden: 'hidden',
        title: 'jq-modal-title m-0 text-xl font-bold leading-tight',
        description: `jq-modal-description m-0 ${overlayPreset.classes.description || 'text-[13px] leading-5 text-slate-500 break-words'}`,
        close: `jq-modal-close absolute top-3.5 right-3.5 ${overlayPreset.classes.softClose || 'inline-flex items-center justify-center w-9 h-9 rounded-full border-0 bg-slate-900/5 text-slate-700 cursor-pointer'}`,
        body: 'jq-modal-body px-5 py-5 overflow-auto',
        bodyImage: 'jq-modal-body relative flex items-center justify-center min-h-80 p-3 bg-slate-950',
        footer: 'jq-modal-footer flex items-center justify-end gap-3 px-5 pb-5 flex-wrap',
        footerHidden: 'hidden',
        footerCustom: 'flex items-center gap-3 flex-wrap w-full justify-end',
        field: 'jq-modal-field grid gap-2',
        fieldLabel: 'text-sm font-semibold leading-5',
        checkboxRow: 'inline-flex items-center gap-3',
        input: 'w-full min-h-11 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900',
        checkbox: 'w-4 h-4',
        help: overlayPreset.classes.description || 'text-[13px] leading-5 text-slate-500 break-words',
        form: 'jq-modal-form grid gap-4',
        imageStage: 'relative flex items-center justify-center w-full h-full overflow-hidden cursor-grab',
        image: 'jq-modal-image max-w-full max-h-[78vh] object-contain transition-transform duration-150',
        imageCounter: 'absolute left-1/2 bottom-3 -translate-x-1/2 px-2.5 py-1 rounded-full bg-slate-950/60 text-white text-xs',
        imageNav: 'absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-0 bg-slate-950/60 text-white cursor-pointer'
    };

    const defaults = {
        type: 'dialog',
        title: '',
        description: '',
        content: '',
        footer: null,
        actions: [],
        form: null,
        showCloseButton: true,
        closeOnBackdropClick: true,
        closeOnEscape: true,
        lockScroll: true,
        trapFocus: true,
        animation: 'zoom',
        size: 'md',
        surface: 'modal',
        placement: 'right',
        className: '',
        backdropClassName: '',
        zIndex: 2147483400,
        beforeClose: null,
        imageOptions: defaultImageOptions,
        onOpen: null,
        onClose: null,
        onDestroy: null,
        onUpdate: null,
        classes: {},
        onSubmit: null
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-modal-${runtime.seed}`;
    }

    function normalizeOptions(options) {
        if (typeof options === 'string') {
            return Object.assign({}, defaults, {
                content: options,
                imageOptions: Object.assign({}, defaultImageOptions),
                form: null
            });
        }

        const merged = Object.assign({}, defaults, options || {});
        merged.imageOptions = Object.assign({}, defaultImageOptions, (options && options.imageOptions) || {});
        merged.classes = Object.assign({}, defaultClasses, (options && options.classes) || {});
        merged.form = merged.type === 'form'
            ? Object.assign({}, defaultFormOptions, (options && options.form) || {})
            : (merged.form ? Object.assign({}, defaultFormOptions, merged.form) : null);

        if (merged.type === 'drawer') merged.surface = 'drawer';
        if (merged.surface !== 'drawer') merged.surface = 'modal';
        if (merged.type !== 'form' && merged.type !== 'image') merged.type = 'dialog';

        return merged;
    }

    function mergeClasses() {
        return Array.from(arguments).flatMap(value => String(value || '').split(/\s+/).filter(Boolean)).join(' ');
    }

    function isPromiseLike(value) {
        return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
    }

    function updateStackState() {
        runtime.stack.forEach((instance, index) => {
            const isTop = index === runtime.stack.length - 1;

            instance.root.setAttribute('data-modal-active', isTop ? 'true' : 'false');
            instance.root.setAttribute('aria-hidden', isTop ? 'false' : 'true');
        });
    }

    function renderContent(target, content, context) {
        target.innerHTML = '';
        if (content == null) return;
        if (typeof content === 'function') {
            const result = content(context);
            renderContent(target, result, context);
            return;
        }
        if (typeof content === 'string') {
            target.innerHTML = content;
            return;
        }
        if (content instanceof Node) {
            target.appendChild(content);
            return;
        }
        target.textContent = String(content);
    }

    function collectFormData(form) {
        const data = new FormData(form);
        const output = {};
        for (const [key, value] of data.entries()) {
            if (Object.prototype.hasOwnProperty.call(output, key)) {
                if (Array.isArray(output[key])) output[key].push(value);
                else output[key] = [output[key], value];
            } else {
                output[key] = value;
            }
        }
        return output;
    }

    function setButtonBusy(button, busy, busyText) {
        if (!button) return;
        if (busy) {
            if (!button.dataset.originalText) button.dataset.originalText = button.textContent || '';
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            button.setAttribute('data-state', 'loading');
            if (busyText) button.textContent = busyText;
            return;
        }
        if (button.dataset.restoreDisabled === 'true') {
            button.disabled = true;
        } else {
            button.disabled = false;
        }
        button.removeAttribute('aria-busy');
        button.setAttribute('data-state', 'idle');
        if (button.dataset.originalText) button.textContent = button.dataset.originalText;
    }

    function setModalBusy(instance, busy, busyText) {
        instance.isBusy = !!busy;
        instance.panel.setAttribute('aria-busy', busy ? 'true' : 'false');
        instance.footer.querySelectorAll('button').forEach(button => {
            if (button.getAttribute('data-keep-enabled') === 'true') return;
            if (busy) setButtonBusy(button, true, button.getAttribute('data-busy-text') || busyText || '');
            else setButtonBusy(button, false);
        });
    }

    async function runBeforeClose(instance, reason) {
        if (typeof instance.options.beforeClose !== 'function') return true;
        try {
            const result = instance.options.beforeClose({
                reason,
                instance: createHandle(instance.id),
                root: instance.root,
                panel: instance.panel,
                form: instance.formElement
            });
            return isPromiseLike(result) ? await result !== false : result !== false;
        } catch (error) {
            return false;
        }
    }

    function getSurfaceWidth(options) {
        if (options.surface === 'drawer') {
            switch (options.size) {
                case 'sm': return 'min(22rem, 100vw)';
                case 'lg': return 'min(38rem, 100vw)';
                case 'xl': return 'min(48rem, 100vw)';
                case 'full': return '100vw';
                case 'md':
                default:
                    return 'min(30rem, 100vw)';
            }
        }

        switch (options.type === 'image' ? 'image' : options.size) {
            case 'sm': return 'min(24rem, calc(100vw - 2rem))';
            case 'lg': return 'min(56rem, calc(100vw - 2rem))';
            case 'xl': return 'min(72rem, calc(100vw - 2rem))';
            case 'full': return 'min(96vw, 96rem)';
            case 'image': return 'min(96vw, 88rem)';
            case 'md':
            default:
                return 'min(40rem, calc(100vw - 2rem))';
        }
    }

    function getSurfaceClass(options) {
        if (options.surface === 'drawer') {
            const placement = options.placement || 'right';
            return mergeClasses(
                options.classes.panel,
                options.classes.panelDrawer,
                placement === 'left' && options.classes.panelDrawerLeft,
                placement === 'right' && options.classes.panelDrawerRight,
                placement === 'top' && options.classes.panelDrawerTop,
                placement === 'bottom' && options.classes.panelDrawerBottom,
                options.className
            );
        }
        return mergeClasses(options.classes.panel, options.classes.panelModal, options.className);
    }

    function getRootClass(options) {
        if (options.surface === 'drawer') {
            const placement = options.placement || 'right';
            return mergeClasses(
                options.classes.root,
                placement === 'left' && options.classes.rootDrawerLeft,
                placement === 'right' && options.classes.rootDrawerRight,
                placement === 'top' && options.classes.rootDrawerTop,
                placement === 'bottom' && options.classes.rootDrawerBottom,
                options.backdropClassName
            );
        }
        return mergeClasses(options.classes.root, options.classes.rootModal, options.backdropClassName);
    }

    function getAnimationStyles(instance, phase) {
        const animation = instance.options.animation;
        if (instance.options.surface === 'drawer') {
            const placement = instance.options.placement;
            if (phase === 'enter') return { opacity: '1', transform: 'translate3d(0,0,0)' };
            if (placement === 'left') return { opacity: '1', transform: 'translate3d(-24px,0,0)' };
            if (placement === 'top') return { opacity: '1', transform: 'translate3d(0,-24px,0)' };
            if (placement === 'bottom') return { opacity: '1', transform: 'translate3d(0,24px,0)' };
            return { opacity: '1', transform: 'translate3d(24px,0,0)' };
        }
        if (animation === 'fade') {
            return phase === 'enter' ? { opacity: '1', transform: 'translate3d(0,0,0) scale(1)' } : { opacity: '0', transform: 'translate3d(0,0,0) scale(.98)' };
        }
        if (animation === 'slide') {
            return phase === 'enter' ? { opacity: '1', transform: 'translate3d(0,0,0) scale(1)' } : { opacity: '0', transform: 'translate3d(0,16px,0) scale(1)' };
        }
        return phase === 'enter' ? { opacity: '1', transform: 'translate3d(0,0,0) scale(1)' } : { opacity: '0', transform: 'translate3d(0,8px,0) scale(.96)' };
    }

    function applyStructureStyles(instance) {
        const options = instance.options;
        const root = instance.root;
        const backdrop = instance.backdrop;
        const panel = instance.panel;
        const isDrawer = options.surface === 'drawer';

        root.className = getRootClass(options);
        root.setAttribute('data-modal-type', options.type);
        root.setAttribute('data-modal-surface', options.surface);
        root.dataset.modalSurface = options.surface;
        root.dataset.modalPlacement = options.placement || 'center';
        root.dataset.modalSize = options.size || 'md';
        root.style.opacity = root.style.opacity || '0';

        backdrop.className = options.classes.backdrop;

        panel.style.width = getSurfaceWidth(options);
        panel.style.opacity = panel.style.opacity || '0';
        panel.style.maxWidth = '';
        panel.style.maxHeight = '';
        panel.style.height = '';
        panel.style.minHeight = '';

        if (isDrawer) {
            const vertical = options.placement === 'top' || options.placement === 'bottom';
            panel.style.height = vertical ? 'min(72vh, 48rem)' : '100vh';
            panel.style.maxHeight = '100vh';
            panel.style.transform = panel.style.transform || `translate3d(${options.placement === 'left' ? '-24px' : options.placement === 'right' ? '24px' : '0'},${options.placement === 'top' ? '-24px' : options.placement === 'bottom' ? '24px' : '0'},0)`;
            if (vertical) {
                panel.style.width = '100%';
                panel.style.maxWidth = 'none';
            } else {
                panel.style.minHeight = '100vh';
            }
        } else {
            panel.style.maxHeight = 'min(92vh, 100%)';
            panel.style.transform = panel.style.transform || 'translate3d(0,8px,0) scale(.96)';
        }

        panel.className = getSurfaceClass(options);
    }

    function createStructure(instance) {
        const options = instance.options;
        const root = document.createElement('div');
        const backdrop = document.createElement('div');
        const panel = document.createElement('section');
        const header = document.createElement('div');
        const body = document.createElement('div');
        const footer = document.createElement('div');

        root.className = getRootClass(options);
        root.setAttribute('data-jq-modal', '');
        root.setAttribute('data-modal-id', instance.id);

        backdrop.className = options.classes.backdrop;
        backdrop.setAttribute('data-modal-backdrop', 'true');

        panel.className = getSurfaceClass(options);
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('data-modal-panel', 'true');

        header.className = options.classes.header;

        body.className = options.type === 'image' ? options.classes.bodyImage : options.classes.body;

        footer.className = options.classes.footer;

        root.appendChild(backdrop);
        root.appendChild(panel);
        panel.appendChild(header);
        panel.appendChild(body);
        panel.appendChild(footer);

        instance.root = root;
        instance.backdrop = backdrop;
        instance.panel = panel;
        instance.header = header;
        instance.body = body;
        instance.footer = footer;
        applyStructureStyles(instance);
    }

    function buildActionButton(action, instance) {
        const button = document.createElement('button');
        button.type = action.submit ? 'submit' : 'button';
        button.setAttribute('jq-button', '');
        button.setAttribute('data-variant', action.variant || 'default');
        button.textContent = action.text || action.label || 'Action';
        if (action.className) button.className = action.className;
        if (action.disabled) {
            button.disabled = true;
            button.dataset.restoreDisabled = 'true';
        }
        if (action.keepEnabled) button.setAttribute('data-keep-enabled', 'true');
        if (action.loadingText) button.setAttribute('data-busy-text', action.loadingText);
        if (action.submit && instance.formElement) button.setAttribute('form', instance.formElement.id);

        button.addEventListener('click', async event => {
            if (action.submit) return;
            if (instance.isBusy) return;

            let result;
            if (typeof action.onClick === 'function') {
                result = action.onClick(event, createHandle(instance.id));
            }
            if (isPromiseLike(result)) {
                setButtonBusy(button, true, action.loadingText || 'Processing...');
                setModalBusy(instance, true);
                try {
                    result = await result;
                } finally {
                    setModalBusy(instance, false);
                    setButtonBusy(button, false);
                }
            }

            if (result === false) return;
            if (action.close !== false) await requestClose(instance.id, action.closeReason || 'action');
        });

        return button;
    }

    function renderHeader(instance) {
        const { options, header, panel } = instance;
        header.innerHTML = '';
        header.className = options.title || options.description ? options.classes.header : mergeClasses(options.classes.header, options.classes.headerHidden);

        if (options.title || options.description) {
            if (options.title) {
                const title = document.createElement('h3');
                title.id = `${instance.id}-title`;
                title.className = options.classes.title;
                title.textContent = options.title;
                header.appendChild(title);
                panel.setAttribute('aria-labelledby', title.id);
            } else {
                panel.removeAttribute('aria-labelledby');
            }

            if (options.description) {
                const desc = document.createElement('p');
                desc.id = `${instance.id}-description`;
                desc.className = options.classes.description;
                desc.textContent = options.description;
                header.appendChild(desc);
                panel.setAttribute('aria-describedby', desc.id);
            } else {
                panel.removeAttribute('aria-describedby');
            }
        } else {
            panel.removeAttribute('aria-labelledby');
            panel.removeAttribute('aria-describedby');
        }

        if (options.showCloseButton) {
            const closeButton = document.createElement('button');
            closeButton.type = 'button';
            closeButton.className = options.classes.close;
            closeButton.setAttribute('aria-label', 'Close modal');
            closeButton.textContent = 'x';
            closeButton.addEventListener('click', () => requestClose(instance.id, 'closeButton'));
            panel.appendChild(closeButton);
            instance.closeButton = closeButton;
        }
    }

    function renderSchemaField(field, values = {}, classes = defaultClasses) {
        const wrapper = document.createElement('label');
        wrapper.className = classes.field;
        wrapper.setAttribute('data-field', '');

        const type = field.type || 'text';
        const name = field.name || '';
        const labelText = field.label || '';
        const value = Object.prototype.hasOwnProperty.call(values, name) ? values[name] : field.value;

        if (labelText && type !== 'checkbox' && type !== 'hidden') {
            const label = document.createElement('span');
            label.className = classes.fieldLabel;
            label.textContent = labelText;
            wrapper.appendChild(label);
        }

        let input;

        if (type === 'textarea') {
            input = document.createElement('textarea');
            input.value = value != null ? String(value) : '';
            input.rows = Number(field.rows) || 4;
        } else if (type === 'select') {
            input = document.createElement('select');
            (field.options || []).forEach(option => {
                const item = document.createElement('option');
                if (typeof option === 'object') {
                    item.value = option.value;
                    item.textContent = option.label || option.value;
                    if (option.disabled) item.disabled = true;
                } else {
                    item.value = option;
                    item.textContent = option;
                }
                if (String(item.value) === String(value)) item.selected = true;
                input.appendChild(item);
            });
        } else if (type === 'checkbox') {
            const row = document.createElement('span');
            row.className = classes.checkboxRow;
            input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = Boolean(value);
            row.appendChild(input);
            const text = document.createElement('span');
            text.textContent = labelText || field.text || '';
            row.appendChild(text);
            wrapper.appendChild(row);
        } else {
            input = document.createElement('input');
            input.type = type;
            if (type !== 'checkbox' && value != null) input.value = String(value);
        }

        input.name = name;
        if (field.id) input.id = field.id;
        if (field.placeholder) input.placeholder = field.placeholder;
        if (field.required) input.required = true;
        if (field.disabled) input.disabled = true;
        if (field.readonly) input.readOnly = true;
        if (field.min != null) input.min = String(field.min);
        if (field.max != null) input.max = String(field.max);
        if (field.step != null) input.step = String(field.step);
        if (field.pattern) input.pattern = field.pattern;
        if (field.multiple && input.tagName === 'SELECT') input.multiple = true;
        if (field.initialFocus) input.setAttribute('data-modal-initial-focus', 'true');
        if (field.matchField) input.setAttribute('data-rule-match', String(field.matchField));
        if (field.rules) input.setAttribute('data-rules', JSON.stringify(field.rules));
        input.className = input.type === 'checkbox' ? classes.checkbox : classes.input;

        if (type !== 'checkbox') wrapper.appendChild(input);
        if (field.help) {
            const help = document.createElement('small');
            help.className = classes.help;
            help.textContent = field.help;
            wrapper.appendChild(help);
        }
        const error = document.createElement('div');
        error.setAttribute('data-field-error', '');
        wrapper.appendChild(error);
        return wrapper;
    }

    function renderFormBody(instance) {
        const form = document.createElement('form');
        const formOptions = instance.options.form || defaultFormOptions;
        form.id = `${instance.id}-form`;
        form.className = instance.options.classes.form;
        form.noValidate = formOptions.noValidate === true;

        Object.entries(formOptions.attributes || {}).forEach(([key, value]) => {
            if (value != null) form.setAttribute(key, String(value));
        });

        if (Array.isArray(formOptions.schema) && formOptions.schema.length > 0) {
            formOptions.schema.forEach(field => {
                if (!field || !field.name && field.type !== 'hidden') return;
                form.appendChild(renderSchemaField(field, formOptions.values || {}, instance.options.classes));
            });
        } else {
            renderContent(form, instance.options.content, {
                instance: createHandle(instance.id),
                panel: instance.panel,
                body: instance.body,
                root: instance.root,
                form
            });
        }

        instance.body.innerHTML = '';
        instance.body.appendChild(form);
        instance.formElement = form;
    }

    function buildFormValidatorOptions(formOptions) {
        if (formOptions && formOptions.validator === false) return null;
        const validatorOptions = Object.assign({}, formOptions?.validator || {});
        if (!validatorOptions.schema && Array.isArray(formOptions?.schema) && formOptions.schema.length > 0) {
            validatorOptions.schema = formOptions.schema.reduce((acc, field) => {
                if (!field || !field.name) return acc;
                const rules = [];
                if (field.required) rules.push({ type: field.type === 'checkbox' ? 'checked' : 'required' });
                if (field.type === 'email') rules.push({ type: 'email' });
                if (field.type === 'url') rules.push({ type: 'url' });
                if (field.type === 'number') rules.push({ type: 'number' });
                if (field.min != null) rules.push({ type: 'min', min: field.min });
                if (field.max != null) rules.push({ type: 'max', max: field.max });
                if (field.minLength != null) rules.push({ type: 'minLength', minLength: field.minLength });
                if (field.maxLength != null) rules.push({ type: 'maxLength', maxLength: field.maxLength });
                if (field.pattern) rules.push({ type: 'pattern', pattern: field.pattern });
                if (field.matchField) rules.push({ type: 'match', field: field.matchField });
                if (Array.isArray(field.rules)) rules.push(...field.rules);
                if (rules.length) acc[field.name] = rules;
                return acc;
            }, {});
        }
        return validatorOptions;
    }

    function updateImageTransform(instance) {
        if (!instance.imageElement) return;
        instance.imageElement.style.transform = `translate(${instance.imageState.translateX}px, ${instance.imageState.translateY}px) scale(${instance.imageState.scale})`;
    }

    function syncGalleryState(instance) {
        if (!instance.imageState || !instance.imageCounter) return;
        const state = instance.imageState;
        instance.imageCounter.textContent = `${state.currentIndex + 1} / ${state.sources.length}`;
        const atStart = state.currentIndex === 0;
        const atEnd = state.currentIndex === state.sources.length - 1;
        if (instance.prevButton) instance.prevButton.disabled = atStart && !instance.options.imageOptions.loop;
        if (instance.nextButton) instance.nextButton.disabled = atEnd && !instance.options.imageOptions.loop;
    }

    function showImage(instance, nextIndex) {
        const state = instance.imageState;
        if (!state) return;
        const lastIndex = state.sources.length - 1;
        let index = nextIndex;
        if (instance.options.imageOptions.loop) {
            if (index < 0) index = lastIndex;
            if (index > lastIndex) index = 0;
        }
        if (index < 0 || index > lastIndex) return;
        state.currentIndex = index;
        state.scale = 1;
        state.translateX = 0;
        state.translateY = 0;
        instance.imageElement.src = state.sources[index];
        updateImageTransform(instance);
        syncGalleryState(instance);
    }

    function renderImageBody(instance) {
        const body = instance.body;
        body.innerHTML = '';

        const sources = (Array.isArray(instance.options.imageOptions.src) ? instance.options.imageOptions.src : [instance.options.imageOptions.src]).filter(Boolean);
        const startIndex = Math.max(0, Math.min(Number(instance.options.imageOptions.startIndex) || 0, Math.max(0, sources.length - 1)));

        const stage = document.createElement('div');
        stage.className = instance.options.classes.imageStage;

        const image = document.createElement('img');
        image.className = instance.options.classes.image;
        image.alt = instance.options.title || 'Modal image';
        image.draggable = false;
        stage.appendChild(image);
        body.appendChild(stage);

        const counter = document.createElement('div');
        counter.className = instance.options.classes.imageCounter;
        body.appendChild(counter);

        instance.imageElement = image;
        instance.imageCounter = counter;
        instance.imageState = {
            sources,
            currentIndex: startIndex,
            scale: 1,
            translateX: 0,
            translateY: 0
        };

        if (sources.length > 1) {
            const prev = document.createElement('button');
            const next = document.createElement('button');
            [prev, next].forEach(button => {
                button.type = 'button';
                button.className = instance.options.classes.imageNav;
            });
            prev.textContent = '<';
            prev.setAttribute('aria-label', 'Previous image');
            prev.classList.add('left-3');
            next.textContent = '>';
            next.setAttribute('aria-label', 'Next image');
            next.classList.add('right-3');
            prev.addEventListener('click', () => showImage(instance, instance.imageState.currentIndex - 1));
            next.addEventListener('click', () => showImage(instance, instance.imageState.currentIndex + 1));
            body.appendChild(prev);
            body.appendChild(next);
            instance.prevButton = prev;
            instance.nextButton = next;
        }

        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let originX = 0;
        let originY = 0;

        const onWheel = event => {
            if (instance.options.imageOptions.zoom === false) return;
            event.preventDefault();
            const state = instance.imageState;
            const step = Number(instance.options.imageOptions.zoomStep) || defaultImageOptions.zoomStep;
            const minZoom = Number(instance.options.imageOptions.minZoom) || defaultImageOptions.minZoom;
            const maxZoom = Number(instance.options.imageOptions.maxZoom) || defaultImageOptions.maxZoom;
            const nextScale = Math.max(minZoom, Math.min(maxZoom, state.scale + (event.deltaY < 0 ? step : -step)));
            state.scale = Number(nextScale.toFixed(2));
            if (state.scale <= 1) {
                state.translateX = 0;
                state.translateY = 0;
            }
            updateImageTransform(instance);
        };

        const onPointerDown = event => {
            if (instance.imageState.scale <= 1) return;
            isDragging = true;
            startX = event.clientX;
            startY = event.clientY;
            originX = instance.imageState.translateX;
            originY = instance.imageState.translateY;
            stage.style.cursor = 'grabbing';
        };

        const onPointerMove = event => {
            if (!isDragging) return;
            instance.imageState.translateX = originX + (event.clientX - startX);
            instance.imageState.translateY = originY + (event.clientY - startY);
            updateImageTransform(instance);
        };

        const onPointerUp = () => {
            isDragging = false;
            stage.style.cursor = instance.imageState.scale > 1 ? 'grab' : 'default';
        };

        stage.addEventListener('wheel', onWheel, { passive: false });
        stage.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        instance.imageCleanup = () => {
            stage.removeEventListener('wheel', onWheel);
            stage.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        showImage(instance, startIndex);
    }

    function renderDialogBody(instance) {
        renderContent(instance.body, instance.options.content, {
            instance: createHandle(instance.id),
            panel: instance.panel,
            body: instance.body,
            root: instance.root
        });
    }

    function ensureDefaultFormActions(instance) {
        const formOptions = instance.options.form || defaultFormOptions;
        if (Array.isArray(instance.options.actions) && instance.options.actions.length > 0) return instance.options.actions;
        const actions = [];
        if (formOptions.showCancel !== false) {
            actions.push({
                text: formOptions.cancelText || 'Cancel',
                variant: 'default',
                onClick() { return true; }
            });
        }
        actions.push({
            text: formOptions.submitText || 'Submit',
            variant: formOptions.submitVariant || 'primary',
            submit: true,
            keepEnabled: false,
            close: false,
            loadingText: 'Submitting...'
        });
        return actions;
    }

    function renderFooter(instance) {
        const footer = instance.footer;
        footer.innerHTML = '';

        const actions = instance.options.type === 'form'
            ? ensureDefaultFormActions(instance)
            : (Array.isArray(instance.options.actions) ? instance.options.actions : []);

        actions.forEach(action => footer.appendChild(buildActionButton(action, instance)));

        if (instance.options.footer != null) {
            const customFooter = document.createElement('div');
            customFooter.className = instance.options.classes.footerCustom;
            renderContent(customFooter, instance.options.footer, {
                instance: createHandle(instance.id),
                panel: instance.panel,
                footer,
                root: instance.root
            });
            footer.appendChild(customFooter);
        }

        footer.className = footer.childNodes.length > 0 && instance.options.type !== 'image'
            ? instance.options.classes.footer
            : mergeClasses(instance.options.classes.footer, instance.options.classes.footerHidden);
    }

    function renderModal(instance) {
        if (instance.closeButton && instance.closeButton.parentNode) {
            instance.closeButton.parentNode.removeChild(instance.closeButton);
            instance.closeButton = null;
        }
        if (instance.imageCleanup) {
            instance.imageCleanup();
            instance.imageCleanup = null;
        }
        instance.imageElement = null;
        instance.imageCounter = null;
        instance.prevButton = null;
        instance.nextButton = null;
        instance.imageState = null;
        instance.formElement = null;

        renderHeader(instance);

        if (instance.options.type === 'image') renderImageBody(instance);
        else if (instance.options.type === 'form') renderFormBody(instance);
        else renderDialogBody(instance);

        renderFooter(instance);

        if (typeof instance.options.onUpdate === 'function' && instance.hasRendered) {
            instance.options.onUpdate(createHandle(instance.id));
        }
        instance.hasRendered = true;
    }

    function focusFirst(instance) { instance.overlay?.focus(); }

    function overlayOptions(instance) {
        return {
            trapFocus: instance.options.trapFocus !== false,
            lockScroll: instance.options.lockScroll !== false,
            closeOnEscape: instance.options.closeOnEscape !== false,
            zIndex: instance.options.zIndex,
            autoFocus: false
        };
    }

    function bindEvents(instance) {
        const onBackdropClick = async event => {
            if (!instance.options.closeOnBackdropClick) return;
            if (event.target === instance.root || event.target === instance.backdrop) {
                await requestClose(instance.id, 'backdrop');
            }
        };

        const onKeyDown = async event => {
            if (!instance.overlay?.isTop() || event.defaultPrevented) return;

            if (instance.options.type === 'image' && instance.imageState) {
                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    showImage(instance, instance.imageState.currentIndex - 1);
                }
                if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    showImage(instance, instance.imageState.currentIndex + 1);
                }
            }


        };

        instance.root.addEventListener('click', onBackdropClick);
        document.addEventListener('keydown', onKeyDown, true);

        let formCleanup = null;
        if (instance.formElement) {
            const formRef = instance.formElement;
            const formOptions = instance.options.form || defaultFormOptions;
            const validatorApi = JquanUIComponents.formValidatorApi;
            const validatorOptions = buildFormValidatorOptions(formOptions);
            if (validatorOptions) {
                // Modal owns submission; validation must never navigate the document.
                const onSuccess = validatorOptions.onSuccess;
                validatorOptions.onSuccess = context => { onSuccess?.(context); return false; };
                validatorOptions.nativeValidation = false;
            }
            const validatorHandle = validatorApi && validatorOptions ? validatorApi.mount(formRef, validatorOptions) : null;
            // Prevent the declarative behavior from replacing this configured handle.
            if (validatorHandle) formRef.removeAttribute('data-jq-validate');
            let active = true;
            const onSubmit = async event => {
                event.preventDefault();
                if (instance.isBusy) return;
                const current = () => active && runtime.instances.get(instance.id) === instance && instance.formElement === formRef && !instance.isClosing;

                if (validatorHandle) {
                    const validation = await validatorHandle.validate();
                    if (!current() || !validation.valid || instance.isBusy) return;
                }
                if (!current()) return;

                const payload = validatorHandle && typeof validatorHandle.values === 'function'
                    ? validatorHandle.values()
                    : collectFormData(formRef);
                let result = true;

                if (typeof instance.options.onSubmit === 'function') {
                    setModalBusy(instance, true, 'Submitting...');
                    try {
                        result = instance.options.onSubmit({
                            event,
                            form: formRef,
                            data: payload,
                            values: payload,
                            instance: createHandle(instance.id)
                        });
                        if (isPromiseLike(result)) result = await result;
                    } finally {
                        if (current()) setModalBusy(instance, false);
                    }
                }

                if (!current()) return;
                if (result === false) return;
                if (instance.options.form && instance.options.form.closeOnSubmit === false) return;
                await requestClose(instance.id, 'submit');
            };

            formRef.addEventListener('submit', onSubmit);
            formCleanup = () => {
                active = false;
                formRef.removeEventListener('submit', onSubmit);
                validatorHandle?.destroy();
                setModalBusy(instance, false);
            };
        }

        instance.cleanupEvents = () => {
            instance.root.removeEventListener('click', onBackdropClick);
            document.removeEventListener('keydown', onKeyDown, true);
            if (formCleanup) formCleanup();
        };
    }

    function createHandle(id) {
        const owner = runtime.instances.get(id);
        if (!owner) return null;
        if (owner.handle) return owner.handle;
        return owner.handle = {
            id,
            state() {
                const instance = runtime.instances.get(id);
                return { id, destroyed: !instance, isClosing: !!instance?.isClosing, busy: !!instance?.isBusy, closePending: !!instance?.closePending, isTop: !!instance?.overlay?.isTop() };
            },
            close(reason) { return requestClose(id, reason || 'api'); },
            destroy() { return destroyModal(id, 'destroy'); },
            update(next) { return updateModal(id, next); },
            patch(next) { return patchModal(id, next); },
            setBusy(busy, busyText) {
                const instance = runtime.instances.get(id);
                if (!instance) return false;
                setModalBusy(instance, busy, busyText);
                return true;
            },
            getFormData() {
                const instance = runtime.instances.get(id);
                if (!instance || !instance.formElement) return null;
                return collectFormData(instance.formElement);
            },
            element() {
                const instance = runtime.instances.get(id);
                return instance ? instance.root : null;
            }
        };
    }

    function openModal(options) {
        const manager = JquanUIComponents.overlayManagerApi;
        if (!manager) throw new Error('[JquanUI modal] Load overlayManager.js before opening Modal.');
        const instance = {
            id: nextId(),
            options: normalizeOptions(options),
            isBusy: false,
            isClosing: false,
            hasRendered: false,
            root: null,
            backdrop: null,
            panel: null,
            header: null,
            body: null,
            footer: null,
            closeButton: null,
            formElement: null,
            imageElement: null,
            imageCounter: null,
            imageCleanup: null,
            imageState: null,
            prevButton: null,
            nextButton: null,
            cleanupEvents: null,
            previouslyFocused: document.activeElement instanceof HTMLElement ? document.activeElement : null
        };

        runtime.instances.set(instance.id, instance);
        createHandle(instance.id);
        createStructure(instance);
        renderModal(instance);
        bindEvents(instance);
        runtime.instances.set(instance.id, instance);
        runtime.stack.push(instance);

        document.body.appendChild(instance.root);
        try {
            instance.overlay = manager.open({
                ...overlayOptions(instance), element: instance.root, panel: instance.panel,
                initialFocus: '[data-modal-initial-focus]', returnFocus: instance.previouslyFocused,
                onRequestClose: reason => requestClose(instance.id, reason),
                onClose: reason => { if (runtime.instances.has(instance.id)) destroyModal(instance.id, reason); }
            });
        } catch (error) { finalizeDestroy(instance, 'invalid'); throw error; }
        updateStackState();

        const enter = getAnimationStyles(instance, 'enter');
        instance.enterFrame = requestAnimationFrame(() => {
            if (!runtime.instances.has(instance.id) || instance.isClosing) return;
            instance.root.style.opacity = '1';
            instance.panel.style.opacity = enter.opacity;
            instance.panel.style.transform = enter.transform;
            focusFirst(instance);
            if (typeof instance.options.onOpen === 'function') {
                instance.options.onOpen(createHandle(instance.id));
            }
        });

        return createHandle(instance.id);
    }

    function applyOptionPatch(instance, patch) {
        const merged = Object.assign({}, instance.options, patch || {});
        if (patch && patch.imageOptions) merged.imageOptions = Object.assign({}, instance.options.imageOptions || {}, patch.imageOptions);
        if (patch && patch.form) merged.form = Object.assign({}, instance.options.form || defaultFormOptions, patch.form);
        instance.options = normalizeOptions(merged);
        instance.closeGeneration = (instance.closeGeneration || 0) + 1;
        instance.overlay?.update(overlayOptions(instance));
    }

    function refreshBindings(instance) {
        if (instance.cleanupEvents) instance.cleanupEvents();
        bindEvents(instance);
    }

    function updateModal(id, next) {
        const instance = runtime.instances.get(id);
        if (!instance || instance.isClosing) return null;
        applyOptionPatch(instance, next);
        applyStructureStyles(instance);
        renderModal(instance);
        if (runtime.instances.get(id) !== instance) return null;
        refreshBindings(instance);
        return createHandle(id);
    }

    function patchModal(id, next) {
        const instance = runtime.instances.get(id);
        if (!instance || instance.isClosing) return null;
        instance.closeGeneration = (instance.closeGeneration || 0) + 1;
        const patch = next || {};
        if (patch.title !== undefined) instance.options.title = patch.title;
        if (patch.description !== undefined) instance.options.description = patch.description;
        if (patch.content !== undefined) instance.options.content = patch.content;
        if (patch.footer !== undefined) instance.options.footer = patch.footer;
        if (patch.actions !== undefined) instance.options.actions = patch.actions;
        if (patch.form !== undefined) instance.options.form = Object.assign({}, instance.options.form || defaultFormOptions, patch.form);
        if (patch.imageOptions !== undefined) instance.options.imageOptions = Object.assign({}, instance.options.imageOptions || defaultImageOptions, patch.imageOptions);
        if (patch.className !== undefined || patch.backdropClassName !== undefined || patch.surface !== undefined || patch.placement !== undefined || patch.size !== undefined) {
            return updateModal(id, patch);
        }
        applyStructureStyles(instance);
        renderModal(instance);
        if (runtime.instances.get(id) !== instance) return null;
        refreshBindings(instance);
        return createHandle(id);
    }

    function requestClose(id, reason) {
        const instance = runtime.instances.get(id);
        if (!instance || instance.isClosing || instance.isBusy) return Promise.resolve(false);
        if (instance.closePending) return instance.closePending;
        const generation = instance.closeGeneration || 0;
        const pending = Promise.resolve().then(() => runtime.instances.get(id) === instance && !instance.isBusy && runBeforeClose(instance, reason || 'api')).then(allowed => {
            if (!allowed || runtime.instances.get(id) !== instance || generation !== (instance.closeGeneration || 0) || instance.isBusy) return false;
            return closeModal(id, reason || 'api');
        }, () => false);
        instance.closePending = pending;
        pending.finally(() => { if (instance.closePending === pending) instance.closePending = null; });
        return pending;
    }

    function finalizeDestroy(instance, reason) {
        if (runtime.instances.get(instance.id) !== instance) return;
        runtime.instances.delete(instance.id);
        cancelAnimationFrame(instance.enterFrame);
        clearTimeout(instance.closeTimer);
        if (instance.cleanupEvents) instance.cleanupEvents();
        if (instance.imageCleanup) instance.imageCleanup();
        if (instance.root.parentNode) instance.root.parentNode.removeChild(instance.root);

        runtime.instances.delete(instance.id);
        runtime.stack = runtime.stack.filter(item => item.id !== instance.id);
        const overlay = instance.overlay;
        instance.overlay = null;
        updateStackState();
        overlay?.close(reason);

        try { instance.options.onClose?.(instance.handle, reason); }
        finally { instance.options.onDestroy?.(instance.handle, reason); }
    }

    function closeModal(id, reason) {
        const instance = runtime.instances.get(id);
        if (!instance || instance.isClosing) return false;
        instance.isClosing = true;

        const leave = getAnimationStyles(instance, 'leave');
        instance.root.style.opacity = '0';
        instance.panel.style.opacity = leave.opacity;
        instance.panel.style.transform = leave.transform;

        instance.closeTimer = window.setTimeout(() => {
            if (!runtime.instances.has(id)) return;
            finalizeDestroy(instance, reason || 'api');
        }, 180);

        return true;
    }

    function destroyModal(id, reason) {
        const instance = runtime.instances.get(id);
        if (!instance) return false;
        instance.isClosing = true;
        finalizeDestroy(instance, reason || 'destroy');
        return true;
    }

    function resolveInstance(target) {
        if (!target) return null;
        if (typeof target === 'string') {
            if (runtime.instances.has(target)) return runtime.instances.get(target);
            for (const instance of runtime.instances.values()) {
                if (instance.root.matches(target) || instance.panel.matches(target)) return instance;
            }
            const found = document.querySelector(target);
            return found ? resolveInstance(found) : null;
        }
        for (const instance of runtime.instances.values()) {
            if (instance.root === target || instance.panel === target || instance.root.contains(target) || instance.panel.contains(target)) return instance;
        }
        return null;
    }

    function closeAll() {
        Array.from(runtime.instances.keys()).reverse().forEach(id => {
            requestClose(id, 'closeAll');
        });
        return true;
    }

    function alertModal(message, options = {}) {
        return openModal(Object.assign({}, options, {
            title: options.title || 'Notice',
            content: options.content || message,
            actions: options.actions || [{ text: options.okText || 'OK', variant: options.okVariant || 'primary' }]
        }));
    }

    function confirmModal(message, options = {}) {
        return new Promise(resolve => {
            let settled = false;
            const settle = value => {
                if (settled) return;
                settled = true;
                resolve(value);
            };

            openModal(Object.assign({}, options, {
                title: options.title || 'Confirm',
                content: options.content || message,
                closeOnBackdropClick: options.closeOnBackdropClick !== undefined ? options.closeOnBackdropClick : false,
                actions: [
                    {
                        text: options.cancelText || 'Cancel',
                        variant: options.cancelVariant || 'default',
                        onClick() { settle(false); }
                    },
                    {
                        text: options.confirmText || 'Confirm',
                        variant: options.confirmVariant || 'primary',
                        onClick() { settle(true); }
                    }
                ],
                onClose(handle, reason) {
                    if (typeof options.onClose === 'function') options.onClose(handle, reason);
                    settle(false);
                }
            }));
        });
    }

    function drawerModal(options = {}) {
        return openModal(Object.assign({}, options, {
            surface: 'drawer',
            type: options.type === 'form' || options.type === 'image' ? options.type : 'dialog'
        }));
    }

    function promiseModal(promiseLike, states = {}) {
        const loadingState = Object.assign({
            title: 'Processing',
            description: '',
            content: states.loadingContent || '',
            closeOnBackdropClick: false,
            closeOnEscape: false,
            actions: []
        }, states.loading || {});

        const handle = openModal(loadingState);

        return Promise.resolve(promiseLike).then(result => {
            const successState = Object.assign({ title: 'Completed', description: '', actions: [{ text: 'OK', variant: 'primary' }] }, states.success || {});
            if (states.success === false) {
                handle.close('promiseSuccess');
            } else {
                handle.update(successState);
            }
            return result;
        }).catch(error => {
            const errorState = Object.assign({ title: 'Failed', description: error && error.message ? error.message : 'Operation failed', actions: [{ text: 'Close', variant: 'default' }] }, states.error || {});
            if (states.error === false) {
                handle.close('promiseError');
            } else {
                handle.update(errorState);
            }
            throw error;
        });
    }

    const modalApi = {
        open(options) { return openModal(options); },
        drawer(options) { return drawerModal(options); },
        alert(message, options) { return alertModal(message, options); },
        confirm(message, options) { return confirmModal(message, options); },
        promise(promiseLike, states) { return promiseModal(promiseLike, states); },
        close(target) {
            const instance = resolveInstance(target);
            return instance ? requestClose(instance.id, 'api') : false;
        },
        destroy(target) {
            const instance = resolveInstance(target);
            return instance ? destroyModal(instance.id, 'apiDestroy') : false;
        },
        update(target, next) {
            const instance = resolveInstance(target);
            return instance ? updateModal(instance.id, next) : null;
        },
        patch(target, next) {
            const instance = resolveInstance(target);
            return instance ? patchModal(instance.id, next) : null;
        },
        closeAll() { return closeAll(); },
        getOpenCount() { return runtime.stack.length; }
    };

    JquanUIComponents.modalApi = modalApi;

    JquanUIComponents.modal = {
        name: 'jquanui-modal',
        version: '2.1.0',
        requires: ['jquanui-overlay-manager'],
        install(api) {
            api.addBehaviors({
                selector: '[jq-modal-trigger]',
                setup(node) {
                    if (node.tagName === 'BUTTON' && !node.hasAttribute('type')) node.setAttribute('type', 'button');

                    const onClick = event => {
                        event.preventDefault();
                        const targetSelector = node.getAttribute('data-modal-target');
                        const contentType = node.getAttribute('data-modal-type') || 'dialog';
                        const surface = node.getAttribute('data-modal-surface') || (contentType === 'drawer' ? 'drawer' : 'modal');
                        const title = node.getAttribute('data-modal-title') || '';
                        const description = node.getAttribute('data-modal-description') || '';

                        let content = node.getAttribute('data-modal-content') || '';
                        let imageOptions = {};

                        if (contentType === 'image') {
                            imageOptions = {
                                src: (node.getAttribute('data-modal-images') || '').split(',').map(item => item.trim()).filter(Boolean),
                                startIndex: Number(node.getAttribute('data-modal-start-index')) || 0,
                                loop: node.getAttribute('data-modal-loop') === 'true'
                            };
                        } else if (targetSelector) {
                            const target = document.querySelector(targetSelector);
                            if (target) content = target.innerHTML;
                        }

                        modalApi.open({
                            type: contentType === 'drawer' ? 'dialog' : contentType,
                            surface,
                            placement: node.getAttribute('data-modal-placement') || 'right',
                            title,
                            description,
                            content,
                            imageOptions
                        });
                    };

                    node.addEventListener('click', onClick);
                    return () => node.removeEventListener('click', onClick);
                }
            });
        }
    };
})(window);
