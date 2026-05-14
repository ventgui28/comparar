import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X, Undo, ShoppingCart, Settings } from 'lucide-react';

const Toast = ({ message, type = 'success', action, onAction, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // 5 seconds for interactive toasts
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={20} style={{ color: '#22c55e' }} />,
    error: <XCircle size={20} style={{ color: '#ef4444' }} />,
    info: <Info size={20} style={{ color: '#3b82f6' }} />
  };

  const actionIcons = {
    undo: <Undo size={14} />,
    cart: <ShoppingCart size={14} />,
    edit: <Settings size={14} />
  };

  return (
    <div className={`toast-card toast-${type} animate-slide-in`}>
      <div className="toast-body">
        <div className="toast-icon">{icons[type]}</div>
        <div className="toast-text-content">
          <p className="toast-message">{message}</p>
          {action && (
            <button 
              className="toast-action-btn"
              onClick={() => {
                onAction();
                onClose();
              }}
            >
              {actionIcons[action.icon] || null}
              <span>{action.label}</span>
            </button>
          )}
        </div>
        <button onClick={onClose} className="toast-close-btn">
          <X size={16} />
        </button>
      </div>
      <div className="toast-progress-container">
        <div className="toast-progress-bar" />
      </div>
    </div>
  );
};

export default Toast;
