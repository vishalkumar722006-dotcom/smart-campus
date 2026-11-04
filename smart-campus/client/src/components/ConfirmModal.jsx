import React from 'react';

const ConfirmModal = ({ 
  isOpen, open, title, message, onConfirm, onCancel, loading,
  confirmText, confirmLabel, confirmClass, confirmStyle, cancelLabel
}) => {
  const visible = isOpen !== undefined ? isOpen : (open !== false && open !== undefined ? !!open : false);
  if (!visible) return null;

  const label = confirmLabel || confirmText || 'Confirm';
  const cancelLbl = cancelLabel || 'Cancel';
  
  let btnStyle = {};
  let btnClass = 'btn btn-danger';
  if (confirmClass) {
    btnClass = confirmClass.startsWith('btn ') ? confirmClass : `btn ${confirmClass}`;
  } else if (confirmStyle === 'primary') {
    btnClass = 'btn btn-primary';
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-light)', lineHeight: 1.6 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel} disabled={loading}>{cancelLbl}</button>
          <button className={btnClass} onClick={onConfirm} disabled={loading}>
            {loading ? '⏳ Processing...' : label}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
