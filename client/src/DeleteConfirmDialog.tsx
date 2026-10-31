import { useEffect, useRef } from 'react';
import type { Doc } from './types';

interface DeleteConfirmDialogProps {
  documents: Doc[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({ documents, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const hasLocked = documents.some((doc) => doc.lockedBy !== null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="delete-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2 id="delete-dialog-title">Delete {documents.length} document(s)?</h2>
      {hasLocked ? (
        <p className="status warning">Your selection includes locked documents, which can't be deleted. Deselect them to continue.</p>
      ) : (
        <p>This cannot be undone.</p>
      )}
      <ul>
        {documents.map((doc) => (
          <li key={doc.id}>
            {doc.title} {doc.lockedBy && <span className="lock">Locked by {doc.lockedBy}</span>}
          </li>
        ))}
      </ul>
      <div className="dialog-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="danger" disabled={hasLocked} onClick={onConfirm}>
          Delete
        </button>
      </div>
    </dialog>
  );
}
