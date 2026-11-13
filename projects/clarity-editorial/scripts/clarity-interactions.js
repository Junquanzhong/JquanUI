(function () {
  function ready(callback) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', callback, { once: true });
    else callback();
  }

  function initFlyouts() {
    document.querySelectorAll('[data-ce-menu]').forEach(function (group) {
      var trigger = group.querySelector('[data-ce-menu-trigger]');
      var menu = group.querySelector('[data-ce-menu-panel]');
      if (!trigger || !menu) return;
      var closeTimer = null;
      var setOpen = function (open) {
        window.clearTimeout(closeTimer);
        menu.setAttribute('data-state', open ? 'open' : 'closed');
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      };
      var scheduleClose = function () {
        window.clearTimeout(closeTimer);
        closeTimer = window.setTimeout(function () { setOpen(false); }, 140);
      };
      trigger.addEventListener('mouseenter', function () { setOpen(true); });
      trigger.addEventListener('focus', function () { setOpen(true); });
      trigger.addEventListener('click', function (event) {
        if (window.matchMedia('(max-width: 767px)').matches) {
          event.preventDefault();
          setOpen(menu.getAttribute('data-state') !== 'open');
        }
      });
      group.addEventListener('mouseenter', function () { window.clearTimeout(closeTimer); });
      group.addEventListener('mouseleave', scheduleClose);
      menu.addEventListener('focusout', function (event) {
        if (!group.contains(event.relatedTarget)) scheduleClose();
      });
    });
  }

  function initSearch() {
    var search = document.querySelector('[data-ce-search]');
    if (!search) return;
    search.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      var value = search.value.trim();
      if (value) window.location.href = 'blog.html?search=' + encodeURIComponent(value);
    });
  }

  function initFeedback() {
    document.querySelectorAll('[data-ce-feedback]').forEach(function (button) {
      button.addEventListener('click', function () {
        var original = button.textContent;
        button.textContent = button.getAttribute('data-ce-feedback') || 'Saved';
        button.setAttribute('aria-live', 'polite');
        window.setTimeout(function () { button.textContent = original; }, 1600);
      });
    });
  }

  function makePopover(trigger, options) {
    if (!trigger || !window.JquanUIComponents || !JquanUIComponents.popoverApi) return null;
    var root = document.createElement('div');
    root.setAttribute('jq-popover', '');
    root.setAttribute('data-popover-pos', options.position || 'bottom');
    root.setAttribute('data-popover-offset', '12');
    root.setAttribute('data-popover-autofocus', 'false');
    root.setAttribute('data-popover-trigger', 'click');
    root.setAttribute('data-popover-align', options.align || 'center');
    root.className = 'relative inline-flex';
    trigger.setAttribute('jq-popover-trigger', '');
    trigger.parentNode.insertBefore(root, trigger);
    root.appendChild(trigger);

    var panel = document.createElement('div');
    panel.setAttribute('jq-popover-panel', '');
    panel.setAttribute('aria-label', options.label || 'Menu');
    panel.className = 'ce-popover-panel' + (options.scroll ? ' ce-popover-panel-scroll' : '');
    panel.innerHTML = (options.title ? '<p class="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">' + options.title + '</p>' : '') + options.items.map(function (item) {
      if (item.type === 'divider') return '<div class="my-1 border-t border-line"></div>';
      return '<a class="flex items-center justify-between gap-4 px-3 py-2.5 text-muted transition-colors hover:bg-primary/5 hover:text-primary" href="' + item.href + '" role="menuitem"><span class="flex items-center gap-3"><i class="ph ' + item.icon + '"></i>' + item.label + '</span>' + (item.meta ? '<span class="text-xs text-faint">' + item.meta + '</span>' : '') + '</a>';
    }).join('');
    root.appendChild(panel);

    var handle = JquanUIComponents.popoverApi.mount(root, { autoFocus: false });
    if (!handle) return null;
    var closeTimer = null;
    var clearClose = function () {
      window.clearTimeout(closeTimer);
    };
    var openMenu = function () {
      clearClose();
      handle.open();
    };
    var scheduleClose = function () {
      clearClose();
      closeTimer = window.setTimeout(function () { handle.close(); }, 420);
    };
    var alignPanel = function () {
      if (options.position !== 'right' || options.align !== 'end') return;
      var triggerRect = trigger.getBoundingClientRect();
      var panelRect = panel.getBoundingClientRect();
      var panelHeight = panel.offsetHeight || panelRect.height;
      var panelWidth = panel.offsetWidth || panelRect.width;
      var padding = 8;
      var top = Math.max(padding, Math.min(
        triggerRect.bottom - panelHeight,
        window.innerHeight - panelHeight - padding
      ));
      var left = Math.max(padding, Math.min(
        triggerRect.right + (options.offset || 12),
        window.innerWidth - panelWidth - padding
      ));
      panel.style.top = Math.round(top) + 'px';
      panel.style.left = Math.round(left) + 'px';
      panel.style.transformOrigin = 'left bottom';
      var arrow = panel.querySelector('[data-popover-arrow]');
      if (arrow) {
        var triggerCenter = triggerRect.top + triggerRect.height / 2;
        arrow.style.top = Math.max(8, Math.min(panelHeight - 8, triggerCenter - top)) + 'px';
        arrow.style.marginTop = '-5px';
      }
    };
    var alignAfterOpen = function () {
      window.requestAnimationFrame(alignPanel);
    };
    trigger.addEventListener('mouseenter', openMenu);
    trigger.addEventListener('focus', openMenu);
    panel.addEventListener('mouseenter', clearClose);
    panel.addEventListener('mouseleave', scheduleClose);
    root.addEventListener('mouseleave', scheduleClose);
    root.addEventListener('jquan:popover:open', alignAfterOpen);
    window.addEventListener('resize', function () { window.requestAnimationFrame(alignPanel); });
    window.addEventListener('scroll', function () { window.requestAnimationFrame(alignPanel); }, true);
    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!handle.state()) handle.open();
    }, true);
    return handle;
  }

  function initHeaderMenus() {
    makePopover(document.querySelector('.ce-header a[href="profile.html"]'), {
      label: 'Account menu',
      title: 'Danny Figueros',
      position: 'bottom',
      items: [
        { href: 'profile.html', icon: 'ph-user', label: 'Profile settings' },
        { href: 'media-library.html', icon: 'ph-image-square', label: 'My assets' },
        { href: 'articles.html', icon: 'ph-clock-counter-clockwise', label: 'Recent drafts', meta: '12' },
        { type: 'divider' },
        { href: 'login.html', icon: 'ph-sign-out', label: 'Sign out' }
      ]
    });
    makePopover(document.querySelector('.ce-header button[aria-label="Create"]'), {
      label: 'Create menu',
      title: 'Create',
      position: 'bottom',
      items: [
        { href: 'article-detail.html', icon: 'ph-file-plus', label: 'New article' },
        { href: 'media-library.html', icon: 'ph-upload-simple', label: 'Upload asset' },
        { href: 'author-detail.html', icon: 'ph-user-plus', label: 'Invite author' }
      ]
    });
    makePopover(document.querySelector('.ce-sidebar > a.ce-nav-icon[title="Menu"]'), {
      label: 'Workspace menu',
      title: 'Workspace',
      position: 'right',
      align: 'end',
      scroll: true,
      items: [
        { href: 'articles.html', icon: 'ph-images', label: 'Articles gallery' },
        { href: 'blog.html', icon: 'ph-newspaper', label: 'Blog layout' },
        { href: 'media-library.html', icon: 'ph-aperture', label: 'Media library' },
        { href: 'profile.html', icon: 'ph-sliders-horizontal', label: 'Settings' }
      ]
    });
  }

  function initMediaPicker() {
    var root = document.querySelector('[data-ce-media-picker]');
    if (!root || !window.JquanUIComponents || !JquanUIComponents.mediaPickerApi) return;
    var image = function (url, title, description) { return { type: 'image', url: url, title: title, description: description, size: 420000 }; };
    var items = [
      image('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80', 'Quiet workspace', 'editorial cover'),
      image('https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=900&q=80', 'Blueberry study', 'food series'),
      image('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80', 'Open architecture', 'places'),
      image('https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80', 'Bridge in blue', 'city notes'),
      image('https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80', 'Market table', 'still life'),
      image('https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=900&q=80', 'Studio session', 'process')
    ];
    JquanUIComponents.mediaPickerApi.mount(root, {
      multiple: true,
      selected: ['media-0'],
      items: items,
      classes: {
        root: 'grid gap-4',
        toolbar: 'flex flex-wrap items-center gap-3',
        actions: 'flex flex-wrap items-center gap-2',
        segment: 'inline-flex items-center gap-1 border border-line bg-white p-1',
        segmentButton: 'inline-flex h-9 items-center justify-center px-3 text-sm text-muted transition-colors',
        segmentButtonActive: 'bg-primary text-white',
        search: 'ce-input max-w-[240px] py-2.5',
        body: 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_250px]',
        surface: 'border border-line bg-white p-4 shadow-subtle',
        grid: 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3',
        list: 'grid gap-3',
        card: 'grid gap-3 border border-line bg-white p-3 text-left transition-colors hover:border-primary/50',
        cardActive: 'border-primary bg-primary/5',
        thumb: 'grid h-32 place-items-center overflow-hidden bg-surface-soft',
        meta: 'grid gap-1',
        title: 'text-sm font-medium text-ink',
        desc: 'text-xs text-muted',
        badge: 'inline-flex h-6 items-center border border-line bg-surface-soft px-2 text-[11px] text-muted',
        empty: 'border border-dashed border-line bg-surface-soft p-8 text-center text-sm text-muted',
        selectedList: 'grid gap-2',
        selectedItem: 'border border-line bg-surface-soft px-3 py-2 text-sm text-muted'
      }
    });
  }

  ready(function () {
    initFlyouts();
    initSearch();
    initHeaderMenus();
    initFeedback();
    initMediaPicker();
  });
})();
