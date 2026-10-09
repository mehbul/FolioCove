function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const unit = bytes < 1024 * 1024 ? 'KB' : 'MB';
  const amount = bytes / (unit === 'KB' ? 1024 : 1024 * 1024);
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${unit}`;
}

// Filenames are untrusted. Keep them in text/attribute values, never HTML.
export function createFileSelectionView(container, { onMove, onRemove }) {
  const summary = document.createElement('p');
  summary.className = 'file-selection-summary';
  const hint = document.createElement('p');
  hint.className = 'file-selection-hint';
  const rows = document.createElement('div');
  rows.className = 'selected-file-list';
  const announcement = document.createElement('p');
  announcement.className = 'file-order-announcement';
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  container.append(summary, hint, rows, announcement);

  return {
    render(selected, { canOrder = false, needsAnother = false, message = '' } = {}) {
      summary.hidden = hint.hidden = selected.length === 0;
      summary.textContent = selected.length
        ? `${selected.length} ${selected.length === 1 ? 'file' : 'files'} · ${formatSize(selected.reduce((total, file) => total + file.size, 0))} total`
        : '';
      hint.textContent = needsAnother
        ? 'Add another PDF to merge.'
        : canOrder && selected.length > 1 ? 'Files will be processed from top to bottom. Use Move up or Move down to change the order.' : '';
      hint.hidden = !hint.textContent;
      announcement.textContent = message;
      rows.innerHTML = '';

      selected.forEach((file, index) => {
        const row = document.createElement('div');
        row.className = 'file';
        const main = document.createElement('div');
        main.className = 'file-main';
        const icon = document.createElement('span');
        icon.setAttribute('aria-hidden', 'true');
        const details = document.createElement('div');
        details.className = 'file-details';
        const name = document.createElement('div');
        name.className = 'file-name';
        name.id = `selected-file-name-${index}`;
        name.textContent = file.name;
        name.title = file.name;
        const size = document.createElement('div');
        size.className = 'file-size';
        size.textContent = `${canOrder ? `${index + 1} of ${selected.length} · ` : ''}${formatSize(file.size)}`;
        details.append(name, size);
        main.append(icon, details);

        const actions = document.createElement('div');
        actions.className = 'file-actions';
        if (canOrder) {
          for (const [action, label, delta, disabled] of [
            ['up', 'Move up', -1, index === 0],
            ['down', 'Move down', 1, index === selected.length - 1]
          ]) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'file-move';
            button.dataset.act = action;
            button.textContent = label;
            button.setAttribute('aria-label', `${label}: ${file.name}`);
            button.disabled = disabled;
            button.onclick = () => { if (!container.inert) onMove(index, delta); };
            actions.append(button);
          }
        }
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'remove';
        remove.dataset.act = 'remove';
        remove.textContent = '×';
        remove.setAttribute('aria-label', 'Remove file');
        remove.setAttribute('aria-describedby', name.id);
        remove.title = `Remove ${file.name}`;
        remove.onclick = () => { if (!container.inert) onRemove(index); };
        actions.append(remove);
        row.append(main, actions);
        rows.append(row);
      });
    },
    focus(index, action) {
      const row = rows.children[index];
      const control = row?.querySelector(`[data-act="${action}"]:not(:disabled)`)
        || row?.querySelector('button:not(:disabled)');
      control?.focus({ preventScroll: true });
    }
  };
}
