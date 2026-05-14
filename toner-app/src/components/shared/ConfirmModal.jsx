import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'danger' }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content animate-in" style={{ maxWidth: '400px' }}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: variant === 'danger' ? '#fee2e2' : '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <AlertTriangle size={24} color={variant === 'danger' ? '#ef4444' : '#f59e0b'} />
          </div>
          <button onClick={onCancel} className="btn-icon"><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center', padding: '0 1rem 1.5rem 1rem' }}>
          <h2 style={{ marginBottom: '0.8rem', fontSize: '1.25rem' }}>{title}</h2>
          <p style={{ color: '#64748b', lineHeight: 1.5 }}>{message}</p>
        </div>

        <div className="modal-footer" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem', borderTop: '1px solid #eee', paddingTop: '1.2rem' }}>
          <button onClick={onCancel} className="btn-secondary">
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={variant === 'danger' ? 'btn-reset' : 'btn-primary'}
            style={{ padding: '0.8rem' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
