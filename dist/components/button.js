(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    JquanUIComponents.button = {
        name: 'jquanui-button',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addComponents([
                `
[jq-button]{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:.5rem;
  border-radius:.5rem;
  border:1px solid rgb(var(--color-border, 226 232 240) / 1);
  background:rgb(var(--color-surface, 255 255 255) / 1);
  color:rgb(var(--color-text, 15 23 42) / 1);
  min-height:2.5rem;
  padding:.625rem 1rem;
  font-weight:600;
  line-height:1;
  cursor:pointer;
  user-select:none;
  transition:background-color .2s ease,color .2s ease,border-color .2s ease,box-shadow .2s ease,transform .12s ease;
}
[jq-button]:hover{
  background:rgb(var(--color-surface-hover, 248 250 252) / 1);
}
[jq-button]:focus-visible{
  outline:none;
  box-shadow:0 0 0 3px rgb(var(--color-primary, 59 130 246) / .22);
}
[jq-button][data-state="loading"]{
  pointer-events:none;
  opacity:.72;
}
[jq-button][disabled],
[jq-button][aria-disabled="true"]{
  pointer-events:none;
  opacity:.5;
}
[jq-button][data-variant="primary"]{
  background:rgb(var(--color-primary, 59 130 246) / 1);
  border-color:rgb(var(--color-primary, 59 130 246) / 1);
  color:rgb(var(--color-primary-foreground, 255 255 255) / 1);
}
[jq-button][data-variant="primary"]:hover{
  background:rgb(var(--color-primary-hover, 37 99 235) / 1);
  border-color:rgb(var(--color-primary-hover, 37 99 235) / 1);
}
[jq-button][data-variant="ghost"]{
  background:transparent;
  border-color:transparent;
}
[jq-button][data-size="sm"]{
  min-height:2rem;
  padding:.5rem .75rem;
  font-size:.875rem;
}
[jq-button][data-size="lg"]{
  min-height:3rem;
  padding:.75rem 1.25rem;
  font-size:1rem;
}
                `
            ]);

            api.addBehaviors({
                selector: '[jq-button]',
                setup(node) {
                    if (!node.hasAttribute('type') && node.tagName === 'BUTTON') {
                        node.setAttribute('type', 'button');
                    }

                    if (!node.hasAttribute('data-variant')) {
                        node.setAttribute('data-variant', 'default');
                    }

                    if (!node.hasAttribute('data-size')) {
                        node.setAttribute('data-size', 'md');
                    }

                    const syncDisabledState = () => {
                        const disabled = node.hasAttribute('disabled') || node.getAttribute('aria-disabled') === 'true';
                        node.setAttribute('data-state', disabled ? 'disabled' : (node.getAttribute('data-state') || 'idle'));
                    };

                    syncDisabledState();

                    const onClick = event => {
                        if (node.getAttribute('aria-disabled') === 'true' || node.hasAttribute('disabled')) {
                            event.preventDefault();
                            event.stopImmediatePropagation();
                        }
                    };

                    node.addEventListener('click', onClick);

                    return () => {
                        node.removeEventListener('click', onClick);
                    };
                }
            });
        }
    };
})(window);
