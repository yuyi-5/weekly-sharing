import { X, Calendar, PenLine, Trash2, RefreshCw } from 'lucide-react'
import { CategoryIcon } from './ArticleCard'

const STATUS_CYCLE = ['unread', 'read', 'toshare', 'shared']

function getDomain(url) {
    try { return new URL(url).hostname.replace('www.', '') }
    catch { return url }
}

export default function ArticleViewModal({ article, categories, onClose, onEdit, onDelete, onStatusChange }) {
    if (!article) return null;

    const categoryInfo = categories?.find(c => c.id === article.category) || { label: '其他', iconName: 'paperclip', colorClass: 'cat-other' }

    function handleCycleStatus() {
        const idx = STATUS_CYCLE.indexOf(article.status)
        const nextStatus = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
        onStatusChange?.(article.id, nextStatus)
    }

    function handleDelete() {
        onDelete?.(article.id)
        onClose()
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-article-view" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0, paddingRight: '16px' }}>
                        <div className="card-favicon" style={{ flexShrink: 0, marginTop: '2px' }}>
                            {article.url && (
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${new URL(article.url).hostname}&sz=64`}
                                    alt=""
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            )}
                            <CategoryIcon name={categoryInfo.iconName} size={24} strokeWidth={2} />
                        </div>
                        {/* Title is now a clickable link */}
                        <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="modal-title-link"
                            title={article.title}
                        >
                            {article.title}
                        </a>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="關閉">
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Article Info */}
                <div className="modal-article-meta">
                    {article.tags.length > 0 && (
                        <div className="meta-item-group">
                            {article.tags.map(tag => (
                                <span key={tag} className="tag">#{tag}</span>
                            ))}
                        </div>
                    )}
                    <span className={`cat-badge ${categoryInfo.colorClass} meta-item`}>
                        {categoryInfo.label}
                    </span>
                    {article.status === 'shared' && article.meetingMonth && (
                        <span className="meeting-tag meta-item">
                            <Calendar size={12} strokeWidth={2.5} />
                            {formatMeetingMonth(article.meetingMonth)}
                        </span>
                    )}
                </div>

                {/* Content - Scrollable */}
                <div className="modal-body modal-article-content">
                    <p>{article.description}</p>
                </div>

                {/* Footer - Icon buttons only */}
                <div className="modal-footer modal-footer-icons">
                    <button
                        className="modal-icon-btn"
                        onClick={handleCycleStatus}
                        aria-label="切換狀態"
                        title="切換狀態"
                    >
                        <RefreshCw size={17} strokeWidth={1.8} />
                    </button>
                    <button
                        className="modal-icon-btn"
                        onClick={() => { onEdit(article); onClose(); }}
                        aria-label="編輯文章"
                        title="編輯文章"
                    >
                        <PenLine size={17} strokeWidth={1.8} />
                    </button>
                    <button
                        className="modal-icon-btn modal-icon-btn--danger"
                        onClick={handleDelete}
                        aria-label="刪除文章"
                        title="刪除文章"
                    >
                        <Trash2 size={17} strokeWidth={1.8} />
                    </button>
                </div>
            </div>
        </div>
    )
}

function formatMeetingMonth(ym) {
    if (!ym) return ''
    const [y, m] = ym.split('-')
    return `${y}年${parseInt(m)}月週會`
}
