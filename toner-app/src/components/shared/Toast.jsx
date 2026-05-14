import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={18} className="text-success" />,
    error: <XCircle size={18} className="text-error" />,
    info: <Info size={18} className="text-info" />
  };

  return (
    <div className={`toast toast-${type} animate-in`}>
      <div className="toast-content">
        {icons[type]}
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="toast-close">
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
