import React from 'react';

interface ConfirmModalProps {
  title?: string;
  message?: string;
  confirmLabel?: string;
  /** 'destructive' = red button (deletes). 'primary' = themed gold/primary (role changes). */
  confirmVariant?: 'destructive' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  title = 'Are you sure?',
  message = 'Are you sure you want to delete this item?',
  confirmLabel = 'Yes, Delete',
  confirmVariant = 'destructive',
  onConfirm,
  onCancel,
}: ConfirmModalProps) => (
  <div
    className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
    onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
  >
    <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-sm p-6 text-center">
      <p className="font-heading text-base font-semibold text-foreground mb-2">{title}</p>
      <p className="text-sm text-muted-foreground mb-6">{message}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onCancel}
          className="btn-outline-gold text-sm px-6"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
            confirmVariant === 'primary'
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-destructive text-white hover:bg-destructive/90'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
