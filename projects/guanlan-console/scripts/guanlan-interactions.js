(function () {
  function setState(element, state) {
    if (element) element.dataset.state = state;
  }

  function setupNavigationFlyouts() {
    var groups = Array.from(document.querySelectorAll('.gl-nav-group'));
    var closeDelay = 140;

    function closeAll(except) {
      groups.forEach(function (group) {
        if (group === except) return;
        var menu = group.querySelector('.gl-flyout-menu');
        var trigger = group.querySelector('.gl-nav-icon');
        if (menu) {
          menu.hidden = true;
          menu.classList.add('hidden');
        }
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        setState(group, 'closed');
      });
    }

    groups.forEach(function (group) {
      var menu = group.querySelector('.gl-flyout-menu');
      var trigger = group.querySelector('.gl-nav-icon');
      if (!menu) return;
      var closeTimer = null;

      function cancelClose() {
        if (closeTimer !== null) {
          window.clearTimeout(closeTimer);
          closeTimer = null;
        }
      }

      function setOpen(open) {
        cancelClose();
        if (open) closeAll(group);
        menu.hidden = !open;
        menu.classList.toggle('hidden', !open);
        if (trigger) trigger.setAttribute('aria-expanded', String(open));
        setState(group, open ? 'open' : 'closed');
      }

      function scheduleClose() {
        cancelClose();
        closeTimer = window.setTimeout(function () {
          setOpen(false);
        }, closeDelay);
      }

      setOpen(false);
      group.addEventListener('mouseenter', function () { setOpen(true); });
      group.addEventListener('mouseleave', scheduleClose);
      menu.addEventListener('mouseenter', function () {
        cancelClose();
        setOpen(true);
      });
      group.addEventListener('focusin', function () { setOpen(true); });
      group.addEventListener('focusout', function () {
        cancelClose();
        window.setTimeout(function () {
          if (!group.contains(document.activeElement)) scheduleClose();
        }, 0);
      });
    });
  }

  function setupFeatureNavigation() {
    document.querySelectorAll('.gl-flyout-menu').forEach(function (menu) {
      var title = menu.querySelector('.gl-flyout-menu-title');
      if (!title) return;
      var linkSets = {
        Administration: [
          ['model-designer.html', 'ph-brackets-curly', 'Model schema'],
          ['media-library.html', 'ph-images', 'Media library'],
          ['permissions.html', 'ph-key', 'Permissions'],
          ['review-queue.html', 'ph-checks', 'Review queue'],
          ['audit-log.html', 'ph-clock-counter-clockwise', 'Audit log'],
          ['notifications.html', 'ph-bell-ringing', 'Notifications'],
          ['recycle-bin.html', 'ph-trash', 'Recycle bin'],
          ['task-center.html', 'ph-list-checks', 'Task center'],
          ['profile.html', 'ph-user-circle', 'Personal profile']
        ],
        Content: [
          ['import-export.html', 'ph-arrows-left-right', 'Import & export']
        ]
      };
      var links = linkSets[title.textContent.trim()];
      if (!links) return;
      links.forEach(function (item) {
        if (menu.querySelector('a[href="' + item[0] + '"]')) return;
        var link = document.createElement('a');
        link.href = item[0];
        link.className = 'gl-flyout-menu-link';
        link.setAttribute('role', 'menuitem');
        link.innerHTML = '<i class="ph ' + item[1] + '"></i>' + item[2];
        menu.appendChild(link);
      });
    });
  }

  function syncBulkSelection(scope) {
    var root = scope || document;
    var rows = Array.from(root.querySelectorAll('[data-gl-row-select]'));
    var selectedRows = rows.filter(function (checkbox) {
      return checkbox.checked;
    });
    var selectAll = root.querySelector('[data-gl-select-all]');
    var bulkBar = document.querySelector('[data-gl-bulk-bar]');
    var count = selectedRows.length;
    var actionLabel = count === 1 ? '1 item' : count + ' items';

    if (selectAll) {
      selectAll.checked = rows.length > 0 && count === rows.length;
      selectAll.indeterminate = count > 0 && count < rows.length;
      selectAll.setAttribute('aria-checked', selectAll.indeterminate ? 'mixed' : String(selectAll.checked));
    }

    rows.forEach(function (checkbox) {
      setState(checkbox.closest('[data-gl-row]'), checkbox.checked ? 'selected' : 'idle');
    });

    if (!bulkBar) return;
    setState(bulkBar, count > 0 ? 'selected' : 'empty');
    var selectedCount = bulkBar.querySelector('[data-gl-selected-count]');
    if (selectedCount) selectedCount.textContent = count + ' selected';
    bulkBar.querySelectorAll('[data-gl-bulk-action]').forEach(function (action) {
      action.disabled = count === 0;
    });
    var feedback = bulkBar.querySelector('[data-gl-bulk-feedback]');
    if (feedback && count === 0) feedback.textContent = 'Select items to enable bulk actions.';
    if (feedback && count > 0) feedback.textContent = actionLabel + ' ready for a bulk action.';
  }

  document.addEventListener('click', function (event) {
    var reloadAction = event.target.closest('[data-gl-reload]');
    if (reloadAction) {
      window.location.reload();
      return;
    }

    var filter = event.target.closest('[data-gl-filter]');
    if (filter) {
      var target = document.querySelector(filter.getAttribute('data-gl-filter'));
      if (target) {
        var open = target.dataset.state === 'open';
        var nextOpen = !open;
        setState(target, nextOpen ? 'open' : 'closed');
        setState(filter, nextOpen ? 'open' : 'closed');
        target.hidden = !nextOpen;
        target.classList.toggle('hidden', !nextOpen);
        filter.setAttribute('aria-expanded', String(nextOpen));
      }
    }

    var bulkAction = event.target.closest('[data-gl-bulk-action]');
    if (bulkAction && !bulkAction.disabled) {
      var bulkBar = bulkAction.closest('[data-gl-bulk-bar]');
      var selectedCount = bulkBar && bulkBar.querySelector('[data-gl-selected-count]');
      var feedback = bulkBar && bulkBar.querySelector('[data-gl-bulk-feedback]');
      var actionName = bulkAction.getAttribute('data-gl-bulk-action');
      if (feedback) {
        feedback.textContent = actionName + ' queued for ' + (selectedCount ? selectedCount.textContent.replace(' selected', '') : 'selected') + '.';
      }
    }
  });

  document.addEventListener('change', function (event) {
    var selectAll = event.target.closest('[data-gl-select-all]');
    if (selectAll) {
      var table = selectAll.closest('table');
      if (table) {
        table.querySelectorAll('[data-gl-row-select]').forEach(function (checkbox) {
          checkbox.checked = selectAll.checked;
        });
        syncBulkSelection(table);
      }
      return;
    }

    var rowSelect = event.target.closest('[data-gl-row-select]');
    if (rowSelect) syncBulkSelection(rowSelect.closest('table') || document);
  });

  setupNavigationFlyouts();
  setupFeatureNavigation();
  syncBulkSelection(document);
})();
