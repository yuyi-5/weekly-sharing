import React from 'react'
import { X, AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = '確認', cancelText = '取消' }) {
    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) onCancel()
    }

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal" role="dialog" aria-modal="true" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button type="button" className="modal-close" onClick={onCancel} aria-label="關閉">
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="modal-content" style={{ padding: '0 20px 20px', textAlign: 'center' }}>
                    <AlertTriangle size={48} strokeWidth={1.5} color="var(--danger)" style={{ marginBottom: '16px' }} />
                    <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-sub)' }}>{message}</p>
                </div>

                <div className="form-actions" style={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button type="button" className="btn btn-primary danger" onClick={onConfirm} style={{ background: 'var(--danger)' }}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
