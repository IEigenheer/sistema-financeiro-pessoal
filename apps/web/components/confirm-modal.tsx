'use client';

import { Modal } from './modal';

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal({
  open,
  title = 'Confirmar exclusão',
  message,
  confirmLabel = 'Sim, excluir',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal
      title={title}
      open={open}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} type="button">
            Cancelar
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            type="button"
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px 0' }}>
        <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>🗑️</span>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.4 }}>
          {message}
        </p>
      </div>
    </Modal>
  );
}
