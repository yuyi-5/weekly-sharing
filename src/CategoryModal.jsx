import { useState, useEffect } from 'react'
import { X, Folder, Palette, Terminal, Paperclip, Hash, Briefcase, Code, PenTool, BookOpen } from 'lucide-react'

const ICON_OPTIONS = [
    { value: 'folder', icon: Folder },
    { value: 'palette', icon: Palette },
    { value: 'terminal', icon: Terminal },
    { value: 'paperclip', icon: Paperclip },
    { value: 'hash', icon: Hash },
    { value: 'briefcase', icon: Briefcase },
    { value: 'code', icon: Code },
    { value: 'pentool', icon: PenTool },
    { value: 'bookopen', icon: BookOpen },
]

export default function CategoryModal({ category, onClose, onSave, onDelete }) {
    const emptyForm = { label: '', iconName: 'folder', colorClass: 'cat-other' }
    const [form, setForm] = useState(emptyForm)

    useEffect(() => {
        if (category) {
            setForm({ label: category.label, iconName: category.iconName || 'folder', colorClass: category.colorClass || 'cat-other' })
        } else {
            setForm(emptyForm)
        }
    }, [category])

    function handleSubmit(e) {
        e.preventDefault()
        if (!form.label.trim()) return
        onSave({ ...form, label: form.label.trim() })
        onClose()
    }

    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal" role="dialog" aria-modal="true" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2>{category ? '編輯分類' : '新增分類'}</h2>
                    <button type="button" className="modal-close" onClick={onClose} aria-label="關閉">
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">分類名稱 *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="例如：設計、開發、行銷..."
                            value={form.label}
                            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">選擇圖示</label>
                        <div className="icon-picker">
                            {ICON_OPTIONS.map(opt => {
                                const Icon = opt.icon
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        className={`icon-option ${form.iconName === opt.value ? 'selected' : ''}`}
                                        onClick={() => setForm(f => ({ ...f, iconName: opt.value }))}
                                        title={opt.value}
                                    >
                                        <Icon size={18} strokeWidth={2} />
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="form-actions" style={{ justifyContent: category ? 'space-between' : 'flex-end', marginTop: '12px' }}>
                        {category ? (
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                onClick={() => {
                                    if (confirm(`確定要刪除分類「${category.label}」嗎？相關的文章將會被歸類為「其他」。`)) {
                                        onDelete(category.id)
                                        onClose()
                                    }
                                }}
                            >
                                刪除分類
                            </button>
                        ) : <div />}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>取消</button>
                            <button type="submit" className="btn btn-primary">
                                {category ? '儲存變更' : '新增分類'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
