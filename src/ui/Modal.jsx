import React, { useEffect } from 'react';
import ReactModal from 'react-modal';

export default function Modal({ isOpen, onRequestClose, title, children, actions = null, maxWidth = 'max-w-xl' }) {
  useEffect(() => {
    try { ReactModal.setAppElement('#root'); } catch {}
  }, []);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{ overlay: { zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.6)' } }}
      className={`fixed inset-0 flex items-center justify-center p-4`}
    >
      <div className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} mx-auto`}> 
        {(title || onRequestClose) && (
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            {onRequestClose && (
              <button onClick={onRequestClose} className="text-gray-400 hover:text-gray-600" aria-label="close">✕</button>
            )}
          </div>
        )}
        <div className="p-5">
          {children}
        </div>
        {actions && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
            {actions}
          </div>
        )}
      </div>
    </ReactModal>
  );
}

