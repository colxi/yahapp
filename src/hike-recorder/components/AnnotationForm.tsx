import { useEffect, useState } from 'react';

interface Props {
  initialTitle?: string;
  initialNote?: string;
  titlePlaceholder: string;
  submitLabel: string;
  showDelete?: boolean;
  onSubmit: (values: { title?: string; note?: string }) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function AnnotationForm({
  initialTitle,
  initialNote,
  titlePlaceholder,
  submitLabel,
  showDelete,
  onSubmit,
  onCancel,
  onDelete,
}: Props) {
  const [title, setTitle] = useState(initialTitle ?? '');
  const [note, setNote] = useState(initialNote ?? '');

  useEffect(() => setTitle(initialTitle ?? ''), [initialTitle]);
  useEffect(() => setNote(initialNote ?? ''), [initialNote]);

  return (
    <form
      className="annotation-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title: title || undefined, note: note || undefined });
      }}
    >
      <label className="form-field">
        <span className="form-field__label">Title</span>
        <input
          type="text"
          className="form-field__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={titlePlaceholder}
          maxLength={120}
          autoFocus
        />
      </label>
      <label className="form-field">
        <span className="form-field__label">Note</span>
        <textarea
          className="form-field__input form-field__input--multiline"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note (water source, view, hazard, …)"
          rows={3}
          maxLength={2_000}
        />
      </label>
      <div className="annotation-form__actions">
        {showDelete && onDelete && (
          <button type="button" className="button button--danger" onClick={onDelete}>
            Delete
          </button>
        )}
        <button type="button" className="button button--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
