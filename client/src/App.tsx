import { useCallback, useEffect, useState } from 'react';
import CreateDocumentForm from './CreateDocumentForm';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import DocumentList from './DocumentList';
import { ApiError, bulkDeleteDocuments, createDocument, fetchDocuments } from './api';
import type { Doc } from './types';

const GENERIC_ERROR = 'Something went wrong. Please try again.';
const LOCKED_ERROR = 'Some documents were locked before the delete occurred. Nothing was deleted.';

export default function App() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDocuments(await fetchDocuments());
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (title: string) => {
    setError(null);
    try {
      await createDocument(title);
      await load();
    } catch {
      setError(GENERIC_ERROR);
    }
  };

  const handleDeleteSelected = () => {
    setError(null);
    setConfirmingDelete(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmingDelete(false);
    try {
      await bulkDeleteDocuments(selectedIds);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 409 ? LOCKED_ERROR : GENERIC_ERROR);
    } finally {
      setSelectedIds([]);
      await load();
    }
  };

  return (
    <main className="app">
      <header className="app-header">
        <h1>Documents</h1>
        <button
          type="button"
          className="danger"
          onClick={handleDeleteSelected}
          disabled={selectedIds.length === 0}
        >
          Delete selected{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
        </button>
      </header>

      <CreateDocumentForm onCreate={handleCreate} />

      {error && <p className="status error">{error}</p>}
      {loading ? (
        <p className="status">Loading documents…</p>
      ) : (
        <DocumentList
          documents={documents}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}

      {confirmingDelete && (
        <DeleteConfirmDialog
          documents={documents.filter((doc) => selectedIds.includes(doc.id))}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </main>
  );
}
