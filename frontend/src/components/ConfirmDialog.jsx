import { useEffect, useRef } from 'react';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="dialog-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </button>
        <button type="button" className="btn btn-danger-solid" onClick={onConfirm} disabled={busy}>
          {busy ? 'Deleting…' : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
