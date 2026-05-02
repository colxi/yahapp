import { useEffect, useState } from 'react';

interface Props {
  initialName: string;
  initialDescription?: string;
  submitLabel: string;
  onSubmit: (values: { name: string; description?: string }) => void;
  onCancel?: () => void;
}

export function HikeMetadataForm({
  initialName,
  initialDescription,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? '');

  useEffect(() => setName(initialName), [initialName]);
  useEffect(() => setDescription(initialDescription ?? ''), [initialDescription]);

  return (
    <form
      className="hike-meta-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, description: description || undefined });
      }}
    >
      <label className="form-field">
        <span className="form-field__label">Title</span>
        <input
          type="text"
          className="form-field__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sunday loop"
          maxLength={120}
          autoFocus
        />
      </label>
      <label className="form-field">
        <span className="form-field__label">Description</span>
        <textarea
          className="form-field__input form-field__input--multiline"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Anything you want to remember about this hike."
          rows={3}
          maxLength={2_000}
        />
      </label>
      <div className="hike-meta-form__actions">
        {onCancel && (
          <button type="button" className="button button--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="button">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
