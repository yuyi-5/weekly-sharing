import { useState } from 'react'
import { useArticles } from './useArticles'
import ArticleCard, { CategoryIcon } from './ArticleCard'
import ArticleModal from './ArticleModal'
import CategoryModal from './CategoryModal'
import { BookOpen, Library, Search, Plus, ListFilter, Bookmark, Star, CheckCircle, SearchX, Inbox, Folder, Settings2 } from 'lucide-react'

const STATUS_FILTERS = [
    { value: 'all', label: '全部狀態', icon: ListFilter },
    { value: 'unread', label: '待讀', icon: Bookmark },
    { value: 'toshare', label: '待分享', icon: Star },
    { value: 'shared', label: '已分享', icon: CheckCircle },
]

export default function App() {
    const {
        filtered, counts,
        categories, addCategory, updateCategory, deleteCategory,
        search, setSearch,
        filterCategory, setFilterCategory,
        filterStatus, setFilterStatus,
        addArticle, updateArticle, deleteArticle,
    } = useArticles()

    const [modalOpen, setModalOpen] = useState(false)
    const [editingArticle, setEditingArticle] = useState(null)
    
    const [catModalOpen, setCatModalOpen] = useState(false)
    const [editingCat, setEditingCat] = useState(null)

    function openAdd() { setEditingArticle(null); setModalOpen(true) }
    function openEdit(article) { setEditingArticle(article); setModalOpen(true) }
    function closeModal() { setModalOpen(false); setEditingArticle(null) }

    function openAddCategory() { setEditingCat(null); setCatModalOpen(true) }
    function openEditCategory(cat, e) {
        e.stopPropagation(); // prevent selecting the category filter
        setEditingCat(cat); 
        setCatModalOpen(true) 
    }
    function closeCatModal() { setCatModalOpen(false); setEditingCat(null) }

    function handleSave(data) {
        if (editingArticle) {
            updateArticle(editingArticle.id, data)
        } else {
            addArticle(data)
        }
    }

    function handleSaveCategory(data) {
        if (editingCat) {
            updateCategory(editingCat.id, data)
        } else {
            addCategory(data.label)
            // Note: addCategory currently creates a default icon/color inside useArticles. 
            // We should ideally pass all data. Let's assume addCategory only takes label for now, or we can update useArticles.
            // Let's call updateCategory immediately if we need iconName, but it's better to modify useArticles. 
            // For now let's just leave it and modify useArticles to accept data.
        }
    }

    function handleStatusChange(id, newStatus) {
        updateArticle(id, { status: newStatus })
    }

    const activeFilterLabel = () => {
        const cat = filterCategory === 'all' ? '全部' : categories.find(c => c.id === filterCategory)?.label || '全部'
        const st = STATUS_FILTERS.find(f => f.value === filterStatus)?.label || '全部'
        if (filterCategory === 'all' && filterStatus === 'all') return '所有文章'
        if (filterCategory === 'all') return st
        if (filterStatus === 'all') return cat
        return `${cat} · ${st}`
    }

    return (
        <div className="app-layout">
            {/* ── Header ── */}
            <header className="header">
                <div className="header-logo">
                    <div className="logo-icon"><Library size={18} strokeWidth={2.5} color="var(--surface)" /></div>
                    <h1>KeepShare</h1>
                </div>

                <div className="header-search">
                    <span className="search-icon"><Search size={16} strokeWidth={2} /></span>
                    <input
                        type="search"
                        placeholder="搜尋文章標題、描述、標籤…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <button className="btn-add" onClick={openAdd}>
                    <Plus size={16} strokeWidth={2.5} /> 新增文章
                </button>
            </header>

            {/* ── Main ── */}
            <div className="main-content">
                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '10px' }}>
                            <h3>分類</h3>
                            <button 
                                onClick={openAddCategory} 
                                title="新增分類"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <Plus size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                        <button
                            className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterCategory('all')}
                        >
                            <span className="filter-btn-icon"><Folder size={16} strokeWidth={2} /></span> 全部分類
                            <span className="filter-count">{counts.all || 0}</span>
                        </button>
                        {categories.map(c => (
                            <button
                                key={c.id}
                                className={`filter-btn category-item ${filterCategory === c.id ? 'active' : ''}`}
                                onClick={() => setFilterCategory(c.id)}
                            >
                                <span className="filter-btn-icon"><CategoryIcon name={c.iconName} size={16} /></span> 
                                <span style={{ flex: 1, textAlign: 'left' }}>{c.label}</span>
                                <span 
                                    className="edit-cat-btn" 
                                    onClick={(e) => openEditCategory(c, e)}
                                    title="編輯分類"
                                >
                                    <Settings2 size={12} strokeWidth={2} />
                                </span>
                                <span className="filter-count">
                                    {counts[c.id] || 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="sidebar-section">
                        <h3>狀態</h3>
                        {STATUS_FILTERS.map(f => {
                            const Icon = f.icon;
                            return (
                                <button
                                    key={f.value}
                                    className={`filter-btn ${filterStatus === f.value ? 'active' : ''}`}
                                    onClick={() => setFilterStatus(f.value)}
                                >
                                    <span className="filter-btn-icon"><Icon size={16} strokeWidth={2} /></span> {f.label}
                                    <span className="filter-count">
                                        {f.value === 'all' ? counts.all || 0 : counts[f.value] || 0}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Content */}
                <main className="content-panel">
                    <div className="content-header">
                        <h2>{activeFilterLabel()}</h2>
                        <span className="result-count">{filtered.length} 篇文章</span>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                {search ? <SearchX size={48} strokeWidth={1} color="var(--text-muted)" /> : <Inbox size={48} strokeWidth={1} color="var(--text-muted)" />}
                            </div>
                            <h3>{search ? '找不到相關文章' : '還沒有文章'}</h3>
                            <p>
                                {search
                                    ? `沒有符合「${search}」的文章，試試其他關鍵字`
                                    : '點擊右上角「新增文章」來收藏第一篇！'}
                            </p>
                            {!search && (
                                <button className="btn btn-primary" onClick={openAdd} style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Plus size={16} strokeWidth={2.5} /> 新增文章
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="article-grid">
                            {filtered.map(article => (
                                <ArticleCard
                                    key={article.id}
                                    article={article}
                                    categories={categories}
                                    onEdit={openEdit}
                                    onDelete={deleteArticle}
                                    onStatusChange={handleStatusChange}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Article Modal */}
            {modalOpen && (
                <ArticleModal
                    article={editingArticle}
                    categories={categories}
                    onClose={closeModal}
                    onSave={handleSave}
                />
            )}

            {/* Category Modal */}
            {catModalOpen && (
                <CategoryModal
                    category={editingCat}
                    onClose={closeCatModal}
                    onSave={handleSaveCategory}
                    onDelete={(id) => {
                        deleteCategory(id);
                        if (filterCategory === id) setFilterCategory('all');
                    }}
                />
            )}
        </div>
    )
}