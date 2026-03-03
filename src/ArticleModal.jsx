import { useState, useEffect } from 'react'
import { X, Bookmark, Star, CheckCircle, Calendar } from 'lucide-react'

export default function ArticleModal({ article, categories, onClose, onSave }) {
    const emptyForm = {
        url: '',
        title: '',
        description: '',
        category: categories && categories.length > 0 ? categories[0].id : 'other',
        tags: '',
        status: 'unread',
        meetingMonth: '',
    }

    const [form, setForm] = useState(emptyForm)

    useEffect(() => {
        if (article) {
            setForm({
                url: article.url,
                title: article.title,
                description: article.description,
                category: article.category || (categories && categories.length > 0 ? categories[0].id : 'other'),
                tags: article.tags.join(', '),
                status: article.status,
                meetingMonth: article.meetingMonth || '',
            })
        } else {
            setForm(emptyForm)
        }
    }, [article, categories])

    function set(key, value) { setForm(f => ({ ...f, [key]: value })) }

    function handleSubmit(e) {
        e.preventDefault()
        if (!form.url.trim() || !form.title.trim()) return
        const data = {
            ...form,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            meetingMonth: form.status === 'shared' ? form.meetingMonth : '',
        }
        onSave(data)
        onClose()
    }

    // Close on overlay click
    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal" role="dialog" aria-modal="true">
                <div className="modal-header">
                    <h2>{article ? '編輯文章' : '新增文章'}</h2>
                    <button className="modal-close" onClick={onClose} aria-label="關閉">
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    {/* URL */}
                    <div className="form-group">
                        <label className="form-label">文章網址 *</label>
                        <input
                            type="url"
                            className="form-input"
                            placeholder="https://example.com/article"
                            value={form.url}
                            onChange={e => set('url', e.target.value)}
                            required
                        />
                    </div>

                    {/* Title */}
                    <div className="form-group">
                        <label className="form-label">標題 *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="文章標題"
                            value={form.title}
                            onChange={e => set('title', e.target.value)}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">摘要</label>
                        <textarea
                            className="form-textarea"
                            placeholder="這篇文章的重點是…"
                            value={form.description}
                            onChange={e => set('description', e.target.value)}
                        />
                    </div>

                    {/* Category + Tags */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">分類</label>
                            <div className="select-wrapper">
                                <select
                                    className="form-select"
                                    value={form.category}
                                    onChange={e => set('category', e.target.value)}
                                >
                                    {categories?.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">標籤（逗號分隔）</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="React, AI, 設計"
                                value={form.tags}
                                onChange={e => set('tags', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="form-group">
                        <label className="form-label">狀態</label>
                        <div className="status-picker">
                            {[
                                { value: 'unread', label: '待讀', icon: Bookmark, cls: 'sel-unread' },
                                { value: 'toshare', label: '待分享', icon: Star, cls: 'sel-toshare' },
                                { value: 'shared', label: '已分享', icon: CheckCircle, cls: 'sel-shared' },
                            ].map(s => {
                                const Icon = s.icon
                                return (
                                    <button
                                        key={s.value}
                                        type="button"
                                        className={`status-option ${form.status === s.value ? s.cls : ''}`}
                                        onClick={() => {
                                            if (s.value === 'shared' && !form.meetingMonth) {
                                                const d = new Date()
                                                setForm(f => ({ ...f, status: s.value, meetingMonth: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}` }))
                                            } else {
                                                set('status', s.value)
                                            }
                                        }}
                                    >
                                        <Icon size={14} strokeWidth={2} style={{ marginBottom: 4 }} />
                                        {s.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Meeting Month (shown only when shared) */}
                    {form.status === 'shared' && (
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={14} strokeWidth={2} /> 分享於哪次週會
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div className="select-wrapper">
                                    <select
                                        className="form-select"
                                        value={form.meetingMonth ? form.meetingMonth.split('-')[0] : new Date().getFullYear()}
                                        onChange={e => {
                                            const y = e.target.value;
                                            const m = form.meetingMonth ? form.meetingMonth.split('-')[1] : String(new Date().getMonth() + 1).padStart(2, '0');
                                            set('meetingMonth', `${y}-${m}`)
                                        }}
                                    >
                                        <option value="">選擇年份</option>
                                        {[...Array(5)].map((_, i) => {
                                            const year = new Date().getFullYear() - 2 + i;
                                            return <option key={year} value={year}>{year} 年</option>
                                        })}
                                    </select>
                                </div>
                                <div className="select-wrapper">
                                    <select
                                        className="form-select"
                                        value={form.meetingMonth ? form.meetingMonth.split('-')[1] : String(new Date().getMonth() + 1).padStart(2, '0')}
                                        onChange={e => {
                                            const m = e.target.value;
                                            const y = form.meetingMonth ? form.meetingMonth.split('-')[0] : String(new Date().getFullYear());
                                            set('meetingMonth', `${y}-${m}`)
                                        }}
                                    >
                                        <option value="">選擇月份</option>
                                        {[...Array(12)].map((_, i) => {
                                            const month = String(i + 1).padStart(2, '0');
                                            return <option key={month} value={month}>{i + 1} 月</option>
                                        })}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>取消</button>
                        <button type="submit" className="btn btn-primary">
                            {article ? '儲存變更' : '新增文章'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}