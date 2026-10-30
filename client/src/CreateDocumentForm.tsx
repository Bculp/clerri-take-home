import { useState } from 'react';

interface CreateDocumentFormProps {
  onCreate: (title: string) => Promise<void>;
}

export default function CreateDocumentForm({ onCreate }: CreateDocumentFormProps) {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmed = title.trim();
    if (!trimmed) return;

    setSubmitting(true);
    await onCreate(trimmed);
    setSubmitting(false);
    setTitle('');
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <label htmlFor="new-document-title">New document</label>
      <input
        id="new-document-title"
        value={title}
        placeholder="e.g. Q4 Vendor Agreement"
        onChange={(event) => setTitle(event.target.value)}
      />
      <button type="submit" disabled={submitting || !title.trim()}>
        Create
      </button>
    </form>
  );
}
