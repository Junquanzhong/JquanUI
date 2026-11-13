(function () {
  function classes() {
    return {
      surface: 'gl-form-section',
      panel: 'gl-panel p-5 sm:p-6',
      action: 'gl-action-soft',
      control: 'gl-input',
      rowList: 'grid gap-3',
      row: 'grid items-center gap-3 rounded-2xl border border-line/80 bg-white/65 p-3 xl:grid-cols-[24px_minmax(0,1fr)_150px_112px_minmax(140px,180px_auto)]',
      checkboxWrap: 'inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white/75 px-3 text-sm font-bold text-muted',
      danger: 'inline-flex items-center justify-center gap-2 rounded-xl border border-rose/25 bg-rose/5 px-3 py-2 text-xs font-bold text-rose transition-colors hover:border-rose/45 hover:bg-rose/10',
      help: 'text-xs text-muted'
    };
  }

  function enhanceDesignerSelects(root) {
    if (!window.JquanUIComponents || !JquanUIComponents.selectApi) return;
    root.querySelectorAll('select[jq-collection-field-type]').forEach(function (select) {
      if (select.hasAttribute('data-jq-select')) return;
      select.setAttribute('data-jq-select', '');
      select.setAttribute('data-select-searchable', 'false');
      select.setAttribute('data-select-clearable', 'false');
      JquanUIComponents.selectApi.mount(select);
    });
  }

  function enhanceDesignerRows(root, handle) {
    root.querySelectorAll('[data-field-id]').forEach(function (row) {
      if (!row.matches('div[data-field-id]') || row.hasAttribute('data-gl-drag-ready')) return;
      row.setAttribute('data-gl-drag-ready', '');
      row.draggable = true;
      var grip = document.createElement('span');
      grip.className = 'grid size-8 place-items-center rounded-lg bg-primary/10 text-primary';
      grip.setAttribute('aria-label', 'Drag to reorder');
      grip.innerHTML = '<i class="ph ph-dots-six-vertical"></i>';
      row.insertBefore(grip, row.firstChild);
    });
    root.querySelectorAll('[data-gl-drag-ready]').forEach(function (row) {
      row.addEventListener('dragstart', function () {
        root.dataset.draggingField = row.getAttribute('data-field-id');
        row.classList.add('opacity-60');
      });
      row.addEventListener('dragend', function () {
        delete root.dataset.draggingField;
        row.classList.remove('opacity-60');
      });
      row.addEventListener('dragover', function (event) {
        event.preventDefault();
        row.classList.add('ring-2', 'ring-primary/20');
      });
      row.addEventListener('dragleave', function () {
        row.classList.remove('ring-2', 'ring-primary/20');
      });
      row.addEventListener('drop', function (event) {
        event.preventDefault();
        row.classList.remove('ring-2', 'ring-primary/20');
        var from = root.dataset.draggingField;
        var to = row.getAttribute('data-field-id');
        if (!from || !to || from === to) return;
        var fields = handle.state().fields.slice();
        var sourceIndex = fields.findIndex(function (field) { return field.id === from; });
        var targetIndex = fields.findIndex(function (field) { return field.id === to; });
        if (sourceIndex < 0 || targetIndex < 0) return;
        var moved = fields.splice(sourceIndex, 1)[0];
        fields.splice(targetIndex, 0, moved);
        handle.setFields(fields);
        window.setTimeout(function () {
          enhanceDesignerSelects(root);
          enhanceDesignerRows(root, handle);
        }, 0);
      });
    });
  }

  function mountFieldDesigner() {
    var root = document.querySelector('[data-gl-field-designer]');
    if (!root || !JquanUIComponents.collectionFieldDesignerApi) return;
    var handle = JquanUIComponents.collectionFieldDesignerApi.mount(root, {
      fields: [
        { id: 'title', name: 'title', type: 'text', required: true, defaultValue: '' },
        { id: 'summary', name: 'summary', type: 'textarea', required: true, defaultValue: '' },
        { id: 'cover_image', name: 'cover_image', type: 'relation', required: false, defaultValue: 'media' },
        { id: 'published_at', name: 'published_at', type: 'date', required: false, defaultValue: '' }
      ],
      classes: classes()
    });
    function enhance() {
      enhanceDesignerSelects(root);
      enhanceDesignerRows(root, handle);
    }
    root.addEventListener('jquan:collection-field-designer:change', function () {
      window.setTimeout(enhance, 0);
    });
    enhance();
  }

  function setupUrlAssets() {
    var root = document.querySelector('[data-gl-url-assets]');
    if (!root) return;
    var form = root.querySelector('[data-gl-url-form]');
    var input = root.querySelector('[data-gl-url-input]');
    var list = root.querySelector('[data-gl-url-list]');
    if (!form || !input || !list) return;

    function addAsset(url) {
      var value = String(url || '').trim();
      if (!/^https?:\/\//i.test(value)) return;
      var card = document.createElement('article');
      card.className = 'gl-media-asset';
      card.innerHTML = '<div class="gl-media-asset-preview"><img src="' + value.replace(/"/g, '&quot;') + '" alt="URL media preview"><i class="ph ph-image-square"></i></div><div class="min-w-0"><p class="truncate text-sm font-bold text-ink">' + value.replace(/[&<>"']/g, '') + '</p><p class="mt-1 text-xs text-muted">URL asset · ready</p></div><button type="button" class="gl-icon-button text-rose" data-gl-url-remove title="Remove URL asset"><i class="ph ph-trash"></i></button>';
      list.appendChild(card);
    }

    function submitUrl() {
      addAsset(input.value);
      input.value = '';
    }
    if (form.tagName === 'FORM') {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        submitUrl();
      });
    } else {
      var submitButton = form.querySelector('[data-gl-url-submit]');
      if (submitButton) submitButton.addEventListener('click', submitUrl);
    }
    list.addEventListener('click', function (event) {
      var remove = event.target.closest('[data-gl-url-remove]');
      if (remove) remove.closest('.gl-media-asset').remove();
    });
  }

  function mountArticleUpload() {
    var root = document.querySelector('[data-gl-upload]');
    if (!root || !JquanUIComponents.uploadApi) return;
    if (root.hasAttribute('data-upload-mounted')) return;
    root.setAttribute('data-upload-mounted', '');

    JquanUIComponents.uploadApi.mount(root, {
      multiple: true,
      autoUpload: false,
      accept: 'image/*,.pdf,.doc,.docx,.zip',
      paste: true,
      preview: true,
      maxFiles: 12,
      request: function (item) {
        return new Promise(function (resolve) {
          window.setTimeout(function () {
            resolve({
              status: 200,
              data: {
                url: 'demo://guanlan/' + encodeURIComponent(item.name)
              }
            });
          }, 520);
        });
      },
      onPreview: function (item) {
        if (item.previewUrl) window.open(item.previewUrl, '_blank', 'noopener,noreferrer');
      }
    });
  }

  function mountAdvancedComponents() {
    var permissionRoot = document.querySelector('[data-gl-permission-matrix]');
    if (permissionRoot && JquanUIComponents.permissionMatrixApi) {
      JquanUIComponents.permissionMatrixApi.mount(permissionRoot, {
        columns: [
          { key: 'view', label: 'View' },
          { key: 'create', label: 'Create' },
          { key: 'edit', label: 'Edit' },
          { key: 'publish', label: 'Publish' },
          { key: 'delete', label: 'Delete' }
        ],
        rows: [
          { key: 'content', label: 'Content library' },
          { key: 'models', label: 'Model schema' },
          { key: 'media', label: 'Media library' },
          { key: 'analytics', label: 'Analytics' },
          { key: 'settings', label: 'Configuration' }
        ],
        values: {
          content: { view: true, create: true, edit: true, publish: true, delete: false },
          models: { view: true, create: false, edit: true, publish: false, delete: false },
          media: { view: true, create: true, edit: true, publish: false, delete: false },
          analytics: { view: true },
          settings: { view: true }
        },
        classes: {
          root: 'grid gap-4',
          surface: 'gl-form-section',
          toolbar: 'flex flex-wrap gap-2',
          action: 'gl-action-soft',
          tableWrap: 'overflow-x-auto rounded-2xl border border-line/80',
          table: 'min-w-full border-collapse bg-white/60 text-sm',
          th: 'border-b border-line bg-surface-soft/80 px-4 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-muted',
          td: 'border-b border-line/70 px-4 py-3 text-muted',
          rowLabel: 'font-bold text-ink',
          checkbox: 'size-4 accent-primary',
          help: 'text-xs text-muted'
        }
      });
    }

    var assignerRoot = document.querySelector('[data-gl-role-assigner]');
    if (assignerRoot && JquanUIComponents.roleMemberAssignerApi) {
      JquanUIComponents.roleMemberAssignerApi.mount(assignerRoot, {
        roles: [
          { key: 'admin', label: 'Admin' },
          { key: 'editor', label: 'Editor' },
          { key: 'reviewer', label: 'Reviewer' }
        ],
        members: [
          { id: 'mina', name: 'Mina Chen', meta: 'mina@guanlan.co' },
          { id: 'alex', name: 'Alex Wu', meta: 'alex@guanlan.co' },
          { id: 'sam', name: 'Sam Rivera', meta: 'sam@guanlan.co' }
        ],
        assignments: { admin: ['mina'], editor: ['alex', 'sam'], reviewer: ['alex'] },
        classes: {
          root: 'grid gap-4 xl:grid-cols-[190px_minmax(0,1fr)]',
          sidebar: 'grid content-start gap-2 rounded-2xl border border-line bg-white/65 p-3',
          role: 'inline-flex min-h-10 items-center justify-start rounded-xl border border-line bg-white/75 px-3 text-sm font-bold text-muted',
          roleActive: 'border-primary/20 bg-primary/10 text-primary',
          panel: 'grid gap-4 rounded-2xl border border-line bg-white/65 p-4',
          grid: 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3',
          member: 'grid gap-2 rounded-2xl border border-line bg-white/60 p-4',
          memberActive: 'border-primary/20 bg-primary/5',
          title: 'text-sm font-black text-ink',
          meta: 'text-xs text-muted',
          action: 'gl-action-soft px-3 py-2 text-xs'
        }
      });
    }

    var mediaRoot = document.querySelector('[data-gl-media-picker]');
    if (mediaRoot && JquanUIComponents.mediaPickerApi) {
      JquanUIComponents.mediaPickerApi.mount(mediaRoot, {
        multiple: true,
        selected: ['media-1'],
        items: [
          { id: 'media-1', type: 'image', title: 'Regional map', url: 'https://images.unsplash.com/photo-1524666041070-9d87656c25bb?auto=format&fit=crop&w=600&q=80', size: 240000, description: 'Campaign cover' },
          { id: 'media-2', type: 'image', title: 'Operations desk', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=600&q=80', size: 180000, description: 'Editorial asset' },
          { id: 'media-3', type: 'file', title: 'Brand guidelines.pdf', size: 1400000, description: 'Reference file' }
        ],
        classes: {
          root: 'grid gap-4',
          toolbar: 'flex flex-wrap items-center gap-3',
          segment: 'inline-flex items-center gap-1 rounded-xl border border-line bg-white/70 p-1 shadow-soft',
          segmentButton: 'inline-flex min-h-9 items-center justify-center rounded-lg px-3 text-xs font-bold text-muted transition-colors',
          segmentButtonActive: 'bg-primary text-white',
          search: 'gl-input max-w-xs',
          body: 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]',
          surface: 'rounded-2xl border border-line bg-white/60 p-4',
          grid: 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3',
          list: 'grid gap-3',
          card: 'grid gap-3 rounded-2xl border border-line bg-white/65 p-3 text-left transition-colors',
          cardActive: 'border-primary/30 bg-primary/5',
          thumb: 'grid h-28 place-items-center overflow-hidden rounded-xl bg-canvas-cool',
          meta: 'grid gap-1',
          title: 'text-sm font-black text-ink',
          desc: 'text-xs text-muted',
          badge: 'gl-chip',
          empty: 'rounded-2xl border border-dashed border-line bg-white/45 p-8 text-center text-sm text-muted',
          selectedList: 'grid gap-2',
          selectedItem: 'rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-sm font-bold text-ink'
        }
      });
    }

    var reviewRoot = document.querySelector('[data-gl-review-queue]');
    if (reviewRoot && JquanUIComponents.reviewQueuePanelApi) {
      JquanUIComponents.reviewQueuePanelApi.mount(reviewRoot, {
        items: [
          { id: 'review-article', title: 'Q3 Regional Growth Report', meta: 'Article · Mina Chen', body: '新增区域增长报告，包含封面、摘要和 4 个正文段落。', status: 'pending' },
          { id: 'review-product', title: 'Atlas Analytics Suite', meta: 'Product · Alex Wu', body: '产品资料已更新，等待运营团队确认定价和公开范围。', status: 'pending' },
          { id: 'review-announcement', title: 'September workspace update', meta: 'Announcement · Sam Rivera', body: '团队公告准备发布到全部区域工作区。', status: 'pending' }
        ],
        classes: {
          root: 'grid gap-3',
          item: 'grid gap-4 rounded-2xl border border-line/80 bg-white/65 p-4 transition-colors data-[status=approved]:border-mint/30 data-[status=rejected]:border-rose/30',
          head: 'flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between',
          title: 'text-sm font-black text-ink',
          meta: 'text-xs text-muted',
          body: 'text-sm leading-6 text-muted',
          actions: 'flex flex-wrap gap-2',
          action: 'gl-action-soft px-3 py-2 text-xs'
        }
      });
    }

    var auditRoot = document.querySelector('[data-gl-audit-timeline]');
    if (auditRoot && JquanUIComponents.auditTimelineApi) {
      JquanUIComponents.auditTimelineApi.mount(auditRoot, {
        items: [
          { id: 'audit-1', title: 'Published content', actor: 'Mina Chen', target: 'Q3 Regional Growth Report', time: 'Today, 09:42', description: 'Changed status from Review to Published and synced the public content endpoint.' },
          { id: 'audit-2', title: 'Updated role policy', actor: 'Alex Wu', target: 'Editor role', time: 'Yesterday, 16:18', description: 'Granted edit access to the media library and removed delete access.' },
          { id: 'audit-3', title: 'Imported records', actor: 'System', target: 'products-september.csv', time: 'Sep 16, 14:06', description: 'Imported 128 records. 4 rows need manual review.' },
          { id: 'audit-4', title: 'Changed model schema', actor: 'Mina Chen', target: 'Article collection', time: 'Sep 15, 11:24', description: 'Added cover_image relation and made summary required.' }
        ],
        classes: {
          root: 'grid gap-3',
          item: 'grid gap-2 rounded-2xl border border-line/80 bg-white/65 p-4',
          head: 'flex flex-wrap items-center justify-between gap-3',
          title: 'text-sm font-black text-ink',
          time: 'text-xs text-muted',
          meta: 'text-xs font-bold text-primary',
          desc: 'text-sm leading-6 text-muted'
        }
      });
    }

    var notificationRoot = document.querySelector('[data-gl-notification-center]');
    if (notificationRoot && JquanUIComponents.notificationCenterPanelApi) {
      JquanUIComponents.notificationCenterPanelApi.mount(notificationRoot, {
        items: [
          { id: 'notice-1', title: 'Approval request', meta: '2 minutes ago · Content', body: 'Q3 Regional Growth Report is ready for your review.', unread: true },
          { id: 'notice-2', title: 'Import completed', meta: '48 minutes ago · System', body: 'products-september.csv imported 124 of 128 records.', unread: true },
          { id: 'notice-3', title: 'New workspace member', meta: 'Yesterday · Workspace', body: 'Jordan Lee joined the Guanlan Operations workspace.', unread: false }
        ],
        classes: {
          root: 'grid gap-3',
          item: 'grid gap-3 rounded-2xl border border-line/80 bg-white/65 p-4',
          itemUnread: 'border-primary/20 bg-primary/5',
          head: 'flex flex-wrap items-center justify-between gap-3',
          title: 'text-sm font-black text-ink',
          meta: 'text-xs text-muted',
          body: 'text-sm leading-6 text-muted',
          actions: 'flex flex-wrap gap-2',
          action: 'gl-action-soft px-3 py-2 text-xs'
        }
      });
    }

    var taskRoot = document.querySelector('[data-gl-task-inbox]');
    if (taskRoot && JquanUIComponents.taskInboxApi) {
      JquanUIComponents.taskInboxApi.mount(taskRoot, {
        items: [
          { id: 'task-1', title: 'Review 4 imported records', meta: 'Data quality · Due today', description: 'Resolve rows with missing category or owner before publishing.', status: 'pending' },
          { id: 'task-2', title: 'Approve article cover', meta: 'Content · Due today', description: 'Confirm the final cover image for Q3 Regional Growth Report.', status: 'pending' },
          { id: 'task-3', title: 'Invite regional editor', meta: 'Workspace · Tomorrow', description: 'Complete the invitation for the APAC editorial team.', status: 'pending' }
        ],
        classes: {
          root: 'grid gap-3',
          item: 'grid gap-3 rounded-2xl border border-line/80 bg-white/65 p-4',
          head: 'flex flex-wrap items-center justify-between gap-3',
          title: 'text-sm font-black text-ink',
          meta: 'text-xs text-muted',
          desc: 'text-sm leading-6 text-muted',
          actions: 'flex flex-wrap gap-2',
          action: 'gl-action-soft px-3 py-2 text-xs'
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    mountFieldDesigner();
    mountArticleUpload();
    setupUrlAssets();
    mountAdvancedComponents();
  });
})();
