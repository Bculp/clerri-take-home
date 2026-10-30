import { useCallback, useEffect, useState } from 'react';
import CreateDocumentForm from './CreateDocumentForm';
import DocumentList from './DocumentList';
import { bulkDeleteDocuments, createDocument, fetchDocuments } from './api';
import type { Doc } from './types';

const GENERIC_ERROR = 'Something went wrong. Please try again.';

export default function App() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} document(s)? This cannot be undone.`)) {
      return;
    }

    setError(null);
    try {
      await bulkDeleteDocuments(selectedIds);
    } catch {
      setError(GENERIC_ERROR);
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
    </main>
  );
}
