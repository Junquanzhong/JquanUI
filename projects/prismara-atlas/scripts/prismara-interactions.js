(function () {
  'use strict';
  const lifecycle = new AbortController();
  const listen = (node, name, handler) => node?.addEventListener(name, handler, { signal: lifecycle.signal });
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const cleanup = [];
  const themeMenus = Array.from(document.querySelectorAll('[data-theme-menu]'));
  document.querySelectorAll('[data-theme-choice]').forEach(button => listen(button, 'click', () => {
    PrismaraTheme.setPreference(button.dataset.themeChoice);
    const menu = button.closest('[data-theme-menu]');
    if (menu) { menu.open = false; menu.querySelector('summary').focus(); }
  }));
  listen(document, 'pointerdown', event => themeMenus.forEach(menu => { if (!menu.contains(event.target)) menu.open = false; }));
  listen(document, 'keydown', event => {
    if (event.key !== 'Escape') return;
    themeMenus.forEach(menu => {
      if (!menu.open) return;
      const hadFocus = menu.contains(document.activeElement);
      menu.open = false;
      if (hadFocus) menu.querySelector('summary').focus();
    });
  });
  const carouselRoot = document.querySelector('#hero-carousel');
  let carousel = null;
  if (carouselRoot && window.JquanUIComponents?.carouselApi) {
    const selectors = Array.from(document.querySelectorAll('[data-carousel-page]'));
    const focusScope = carouselRoot.closest('[data-hero]') || carouselRoot;
    let activeIndex = 0;
    let focused = false;
    function refreshPlayback() {
      carousel?.setAutoplay(!focused && !reducedMotion.matches);
    }
    function markCurrent(index) {
      activeIndex = index;
      selectors.forEach((button, offset) => button.setAttribute('aria-pressed', String(index === offset)));
    }
    carousel = JquanUIComponents.carouselApi.mount(carouselRoot, {
      interval: 6500, speed: reducedMotion.matches ? 0 : 520,
      autoplay: !reducedMotion.matches, arrows: false, indicators: false,
      infinite: true, adaptiveHeight: false, drag: true,
      onChange: markCurrent
    });
    JquanUI.use(JquanUIComponents.carousel);
    selectors.forEach((button, index) => listen(button, 'click', () => carousel.goTo(index)));
    listen(focusScope, 'focusin', () => { focused = true; refreshPlayback(); });
    listen(focusScope, 'focusout', (event) => {
      if (!focusScope.contains(event.relatedTarget)) { focused = false; refreshPlayback(); }
    });
    // The component exposes aria-hidden; keep inactive article links out of Tab order too.
    const syncFocus = () => carouselRoot.querySelectorAll('[jq-carousel-slide]').forEach((slide) => {
      slide.inert = slide.getAttribute('aria-hidden') === 'true';
    });
    const focusObserver = new MutationObserver(syncFocus);
    focusObserver.observe(carouselRoot, { attributes: true, subtree: true, attributeFilter: ['aria-hidden'] });
    syncFocus();
    const preferenceChange = () => {
      carousel.update({ speed: reducedMotion.matches ? 0 : 520, startIndex: activeIndex, autoplay: false });
      syncFocus(); refreshPlayback();
    };
    reducedMotion.addEventListener('change', preferenceChange);
    refreshPlayback();
    cleanup.push(() => {
      reducedMotion.removeEventListener('change', preferenceChange);
      focusObserver.disconnect();
      carouselRoot.removeAttribute('jq-carousel');
      carousel.destroy();
    });
  }

  // The hero owns the pointer boundary; the decorative canvas never captures input.
  const canvas = document.querySelector('[data-pet="dog"]');
  if (canvas && canvas.getContext('2d')) {
    const context = canvas.getContext('2d');
    const hero = canvas.closest('[data-hero]');
    const motionButton = document.querySelector('[data-motion-toggle]');
    const fog = Array.from(document.querySelectorAll('[data-ambient-fog]'));
    const pet = PrismaraMotion.createPet();
    const pointer = { inside: false, x: 0, y: 0 };
    let paused = false, inView = true, frame = 0, last = 0, width = 0, height = 0, phase = 1.2;
    let furColor, tailColor, detailColor, toyColor, earthColor;
    function readPalette() {
      const colors = getComputedStyle(document.documentElement);
      furColor = colors.getPropertyValue('--color-pet-fur-css').trim() || '#14B8A6';
      tailColor = colors.getPropertyValue('--color-pet-tail-css').trim() || '#0D9488';
      detailColor = colors.getPropertyValue('--color-action-ink-css').trim() || '#0F766E';
      toyColor = colors.getPropertyValue('--color-pet-toy-css').trim() || '#BD8D36';
      earthColor = colors.getPropertyValue('--color-pet-earth-css').trim() || '#8C7962';
    }
    readPalette();
    listen(window, 'prismara:themechange', () => { readPalette(); draw(phase); });
    function updatePointer(event) {
      if (event.pointerType === 'touch' || paused || reducedMotion.matches) return;
      const rect = canvas.getBoundingClientRect();
      pointer.inside = true;
      pointer.x = Math.max(0, Math.min(width, event.clientX - rect.left));
      pointer.y = Math.max(0, Math.min(height, event.clientY - rect.top));
    }
    function draw(time, elapsed = 0) {
      if (!width || !height) return;
      context.clearRect(0, 0, width, height);
      const pose = PrismaraMotion.stepPet(pet, width, height, time, elapsed, pointer);
      canvas.dataset.petState = pose.state;
      canvas.dataset.petAction = pose.action;
      canvas.dataset.petPosition = `${Math.round(pose.x)},${Math.round(pose.y)}`;
      canvas.dataset.petFacing = String(pose.facing);
      canvas.dataset.petHeadHits = String(pose.headHits);
      canvas.dataset.petGround = String(Math.round(pose.groundY));
      PrismaraPetRenderer.draw(context, pose, {fur:furColor,tail:tailColor,detail:detailColor,toy:toyColor,earth:earthColor});
    }

    function tick(stamp) {
      if (stamp - last >= 1000 / 30) {
        const elapsed = Math.min(stamp - last, 100) / 1000;
        phase += elapsed; last = stamp;
        draw(phase, elapsed);
      }
      frame = requestAnimationFrame(tick);
    }
    function refreshMotion() {
      cancelAnimationFrame(frame); frame = 0; last = performance.now();
      const moving = !paused && !reducedMotion.matches && inView && !document.hidden;
      if (!moving) pointer.inside = false;
      fog.forEach(node => node.classList.toggle('animate-mist-drift', moving));
      canvas.dataset.motionState = moving ? 'running' : 'paused';
      motionButton.textContent = reducedMotion.matches ? '背景动效已关闭' : paused ? '播放背景动效' : '暂停背景动效';
      motionButton.setAttribute('aria-pressed', String(paused || reducedMotion.matches));
      motionButton.disabled = reducedMotion.matches;
      draw(phase);
      if (moving) frame = requestAnimationFrame(tick);
    }
    const resize = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(phase);
    });
    resize.observe(canvas);
    const visibility = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; refreshMotion(); });
    visibility.observe(canvas);
    listen(hero, 'pointerenter', updatePointer);
    listen(hero, 'pointermove', updatePointer);
    listen(hero, 'pointerleave', () => { pointer.inside = false; });
    listen(hero, 'pointercancel', () => { pointer.inside = false; });
    listen(motionButton, 'click', () => { paused = !paused; refreshMotion(); });
    listen(document, 'visibilitychange', refreshMotion);
    reducedMotion.addEventListener('change', refreshMotion);
    refreshMotion();
    cleanup.push(() => { cancelAnimationFrame(frame); resize.disconnect(); visibility.disconnect(); reducedMotion.removeEventListener('change', refreshMotion); });
  }

  const search = document.querySelector('[data-prismara-search], [data-app-search]');
  if (search) {
    const items = Array.from(document.querySelectorAll('[data-library-item], [data-app-item]'));
    const filters = Array.from(document.querySelectorAll('[data-prismara-filter], [data-app-filter]'));
    const count = document.querySelector('[data-search-count], [data-app-count]');
    const empty = document.querySelector('[data-search-empty], [data-app-empty]');
    const unit = search.matches('[data-app-search]') ? '个应用' : '篇记录';
    const filterValue = (button) => button.dataset.prismaraFilter || button.dataset.appFilter;
    let activeFilter = 'all';
    function applyFilter() {
      const query = search.value.trim().toLocaleLowerCase();
      let visibleArticles = 0;
      items.forEach((item) => {
        const matches = (activeFilter === 'all' || (item.dataset.libraryFilter || item.dataset.appCategory) === activeFilter) &&
          (!query || item.dataset.searchText.toLocaleLowerCase().includes(query));
        item.hidden = !matches;
        item.classList.toggle('hidden', !matches);
        if (matches && item.tagName === 'ARTICLE') visibleArticles += 1;
      });
      count.textContent = `找到 ${visibleArticles} ${unit}`;
      empty.classList.toggle('hidden', visibleArticles !== 0);
      filters.forEach((button) => button.setAttribute('aria-pressed', String(filterValue(button) === activeFilter)));
    }
    function reset() { search.value = ''; activeFilter = 'all'; applyFilter(); search.focus(); }
    search.value = new URLSearchParams(location.search).get('q') || '';
    listen(search, 'input', applyFilter);
    listen(search.closest('form'), 'submit', (event) => { event.preventDefault(); applyFilter(); });
    filters.forEach((button) => listen(button, 'click', () => { activeFilter = filterValue(button); applyFilter(); }));
    listen(document.querySelector('[data-clear-search], [data-clear-app-search]'), 'click', reset);
    listen(document.querySelector('[data-reset-search], [data-reset-app-search]'), 'click', reset);
    applyFilter();
  }

  const tagRecords = Array.from(document.querySelectorAll('[data-tag-record]'));
  if (tagRecords.length) {
    const choices = Array.from(document.querySelectorAll('[data-tag-choice]'));
    const applyTag = (value, updateURL = false) => {
      let total = 0;
      tagRecords.forEach(record => {
        const visible = !value || JSON.parse(record.dataset.tagValues).includes(value);
        record.hidden = !visible;
        record.classList.toggle('hidden', !visible);
        if (visible) total += 1;
      });
      choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tagChoice === value)));
      document.querySelector('[data-tag-title]').textContent = value ? `#${value}` : '全部主题';
      document.querySelector('[data-tag-count]').textContent = `找到 ${total} 篇记录`;
      document.querySelector('[data-tag-empty]').classList.toggle('hidden', total !== 0);
      if (updateURL) {
        const url = new URL(location.href);
        if (value) url.searchParams.set('tag', value); else url.searchParams.delete('tag');
        try { history.replaceState(null, '', url); } catch {}
      }
    };
    choices.forEach(button => listen(button, 'click', () => applyTag(button.dataset.tagChoice, true)));
    listen(document.querySelector('[data-tag-reset]'), 'click', () => applyTag('', true));
    applyTag(new URLSearchParams(location.search).get('tag') || '');
  }

  const toc = Array.from(document.querySelectorAll('[data-toc]'));
  if (toc.length) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
      if (visible) toc.forEach((link) => {
        if (link.hash === `#${visible.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-100px 0px -55% 0px' });
    toc.forEach((link) => { const section = document.querySelector(link.hash); if (section) observer.observe(section); });
    cleanup.push(() => observer.disconnect());
  }
  listen(document.querySelector('[data-copy-link]'), 'click', async () => {
    const status = document.querySelector('[data-copy-status]');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(location.href);
      status.textContent = '文章链接已复制';
    } catch { status.textContent = `请复制浏览器地址栏中的链接：${location.href}`; }
  });
  const copyContact = document.querySelector('[data-copy-contact]');
  listen(copyContact, 'click', async () => {
    const status = document.querySelector('[data-contact-status]');
    const value = copyContact.dataset.copyContact;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      status.textContent = '微信号已复制，可以去微信添加。';
    } catch { status.textContent = `未能自动复制，请选中上方微信号手动复制：${value}`; }
  });
  listen(window, 'pagehide', (event) => {
    if (event.persisted) return;
    cleanup.forEach((dispose) => dispose());
    lifecycle.abort();
  });
})();
