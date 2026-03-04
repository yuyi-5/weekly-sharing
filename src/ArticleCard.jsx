import { useState } from 'react'
import { Bookmark, Star, CheckCircle, Calendar, RefreshCw, PenLine, Trash2, Hash, Palette, Terminal, Paperclip, Folder, Briefcase, Code, PenTool, BookOpen } from 'lucide-react'

const STATUS_LABELS = { unread: '待閱讀', read: '已閱讀', toshare: '待分享', shared: '已分享' }
const STATUS_CLASSES = { unread: 'badge-unread', read: 'badge-read', toshare: 'badge-toshare', shared: 'badge-shared' }
const STATUS_ICONS = {
    unread: <Bookmark size={12} strokeWidth={2.5} />,
    read: <BookOpen size={12} strokeWidth={2.5} />,
    toshare: <Star size={12} strokeWidth={2.5} />,
    shared: <CheckCircle size={12} strokeWidth={2.5} />
}

export const CategoryIcon = ({ name, size = 16, strokeWidth = 2 }) => {
    switch (name) {
        case 'palette': return <Palette size={size} strokeWidth={strokeWidth} />;
        case 'terminal': return <Terminal size={size} strokeWidth={strokeWidth} />;
        case 'paperclip': return <Paperclip size={size} strokeWidth={strokeWidth} />;
        case 'folder': return <Folder size={size} strokeWidth={strokeWidth} />;
        case 'briefcase': return <Briefcase size={size} strokeWidth={strokeWidth} />;
        case 'code': return <Code size={size} strokeWidth={2.5} />;
        case 'pentool': return <PenTool size={size} strokeWidth={2.5} />;
        case 'bookopen': return <BookOpen size={size} strokeWidth={2.5} />;
        default: return <Hash size={size} strokeWidth={2.5} />;
    }
}

function getDomain(url) {
    try { return new URL(url).hostname.replace('www.', '') }
    catch { return url }
}

function getFaviconUrl(url) {
    try {
        const { hostname } = new URL(url)
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
    } catch { return null }
}

export default function ArticleCard({ article, categories, onEdit, onDelete, onStatusChange }) {
    const [faviconError, setFaviconError] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const faviconSrc = getFaviconUrl(article.url)

    const categoryInfo = categories?.find(c => c.id === article.category) || { label: '其他', iconName: 'paperclip', colorClass: 'cat-other' }

    return (
        <div className="article-card">
            {/* Header */}
            <div className="card-header">
                <div className="card-favicon">
                    {faviconSrc && !faviconError ? (
                        <img
                            src={faviconSrc}
                            alt=""
                            onError={() => setFaviconError(true)}
                        />
                    ) : (
                        <CategoryIcon name={categoryInfo.iconName} size={18} strokeWidth={2} />
                    )}
                </div>
                <div className="card-meta">
                    <div className="card-domain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{getDomain(article.url)}</span>
                        {article.status === 'shared' && article.meetingMonth && (
                            <span className="meeting-tag">
                                <Calendar size={12} strokeWidth={2.5} />
                                {formatMeetingMonth(article.meetingMonth)}
                            </span>
                        )}
                    </div>
                    <a
                        className="card-link"
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div className="card-title">{article.title}</div>
                    </a>
                </div>
            </div>

            {/* Description */}
            {article.description && (
                <div
                    className={`card-desc-wrapper ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? '點擊收起' : '點擊展開'}
                >
                    <p className="card-desc">
                        {article.description}
                    </p>
                    {!isExpanded && <div className="card-desc-fade" />}
                </div>
            )}

            {/* Tags */}
            {article.tags.length > 0 && (
                <div className="card-tags">
                    {article.tags.map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="card-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
                    <span className={`badge ${STATUS_CLASSES[article.status] || 'badge-unread'}`}>
                        {STATUS_ICONS[article.status] || <Bookmark size={12} strokeWidth={2.5} />}
                        {STATUS_LABELS[article.status] || '待閱讀'}
                    </span>
                    <span className={`cat-badge ${categoryInfo.colorClass}`}>
                        {categoryInfo.label}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="card-actions">
                        {/* Status cycle */}
                        <button
                            className="icon-btn"
                            title="切換狀態"
                            onClick={() => onStatusChange(article.id, cycleStatus(article.status))}
                        >
                            <RefreshCw size={14} strokeWidth={2.5} />
                        </button>
                        <button className="icon-btn" title="編輯" onClick={() => onEdit(article)}>
                            <PenLine size={14} strokeWidth={2.5} />
                        </button>
                        <button
                            className="icon-btn danger"
                            title="刪除"
                            onClick={() => onDelete(article.id)}
                        >
                            <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function cycleStatus(current) {
    const order = ['unread', 'read', 'toshare', 'shared'];
    const currentIndex = order.indexOf(current);
    const nextIndex = (currentIndex + 1) % order.length;
    return order[nextIndex];
}

function formatMeetingMonth(ym) {
    if (!ym) return ''
    const [y, m] = ym.split('-')
    return `${y}年${parseInt(m)}月週會`
}