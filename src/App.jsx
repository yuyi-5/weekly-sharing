import { useState, useMemo, useEffect } from 'react'
import { useArticles } from './useArticles'
import ArticleCard, { CategoryIcon } from './ArticleCard'
import ArticleModal from './ArticleModal'
import CategoryModal from './CategoryModal'
import ConfirmModal from './ConfirmModal'
import { BookOpen, Library, Search, Plus, ListFilter, Bookmark, Star, CheckCircle, SearchX, Inbox, Folder, Settings2 } from 'lucide-react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableCategoryItem, SortableStatusItem } from './SortableSidebarItem'

const STATUS_FILTERS = [
    { value: 'all', label: '全部狀態', icon: ListFilter },
    { value: 'unread', label: '待閱讀', icon: Bookmark },
    { value: 'read', label: '已閱讀', icon: BookOpen },
    { value: 'toshare', label: '待分享', icon: Star },
    { value: 'shared', label: '已分享', icon: CheckCircle },
]

export default function App() {
    const {
        filtered, counts, loading,
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

    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [articleToDeleteId, setArticleToDeleteId] = useState(null)

    const [categoryOrder, setCategoryOrder] = useState(() => {
        const saved = localStorage.getItem('categoryOrder');
        return saved ? JSON.parse(saved) : [];
    });

    const [statusOrder, setStatusOrder] = useState(() => {
        const saved = localStorage.getItem('statusOrder');
        return saved ? JSON.parse(saved) : STATUS_FILTERS.map(f => f.value);
    });

    const sortedCategories = useMemo(() => {
        const sorted = [...categories];
        sorted.sort((a, b) => {
            const idxA = categoryOrder.indexOf(a.id);
            const idxB = categoryOrder.indexOf(b.id);
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
        });
        return sorted;
    }, [categories, categoryOrder]);

    const sortedStatuses = useMemo(() => {
        const sorted = [...STATUS_FILTERS];
        sorted.sort((a, b) => {
            const idxA = statusOrder.indexOf(a.value);
            const idxB = statusOrder.indexOf(b.value);
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
        });
        return sorted;
    }, [statusOrder]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Requires 5px of movement before dragging starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEndCategories(event) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setCategoryOrder((prev) => {
                const currentOrder = prev.length ? prev : categories.map(c => c.id);
                // Ensure all categories are in currentOrder before moving
                const fullOrder = [...new Set([...currentOrder, ...categories.map(c => c.id)])];
                const oldIndex = fullOrder.indexOf(active.id);
                const newIndex = fullOrder.indexOf(over.id);
                const newOrder = arrayMove(fullOrder, oldIndex, newIndex);
                localStorage.setItem('categoryOrder', JSON.stringify(newOrder));
                return newOrder;
            });
        }
    }

    function handleDragEndStatuses(event) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setStatusOrder((prev) => {
                const oldIndex = prev.indexOf(active.id);
                const newIndex = prev.indexOf(over.id);
                const newOrder = arrayMove(prev, oldIndex, newIndex);
                localStorage.setItem('statusOrder', JSON.stringify(newOrder));
                return newOrder;
            });
        }
    }

    function openAdd() { setEditingArticle(null); setModalOpen(true) }
    function openEdit(article) { setEditingArticle(article); setModalOpen(true) }
    function closeModal() { setModalOpen(false); setEditingArticle(null) }

    function openAddCategory() { setEditingCat(null); setCatModalOpen(true) }
    function openEditCategory(cat, e) {
        e?.stopPropagation(); // prevent selecting the category filter
        setEditingCat(cat);
        setCatModalOpen(true)
    }
    function closeCatModal() { setCatModalOpen(false); setEditingCat(null) }

    function openConfirmDelete(id) {
        setArticleToDeleteId(id)
        setConfirmModalOpen(true)
    }

    function closeConfirmDelete() {
        setConfirmModalOpen(false)
        setArticleToDeleteId(null)
    }

    function handleConfirmDelete() {
        if (articleToDeleteId) {
            deleteArticle(articleToDeleteId)
            closeConfirmDelete()
        }
    }

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
            addCategory(data)
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
                        
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEndCategories}
                        >
                            <SortableContext
                                items={sortedCategories.map(c => c.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {sortedCategories.map(c => (
                                    <SortableCategoryItem
                                        key={c.id}
                                        category={c}
                                        activeId={filterCategory}
                                        onClick={() => setFilterCategory(c.id)}
                                        onEdit={openEditCategory}
                                        count={counts[c.id]}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>

                    <div className="sidebar-section">
                        <h3>狀態</h3>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEndStatuses}
                        >
                            <SortableContext
                                items={sortedStatuses.map(s => s.value)}
                                strategy={verticalListSortingStrategy}
                            >
                                {sortedStatuses.map(f => (
                                    <SortableStatusItem
                                        key={f.value}
                                        status={f}
                                        activeId={filterStatus}
                                        onClick={() => setFilterStatus(f.value)}
                                        count={f.value === 'all' ? counts.all : counts[f.value]}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                </aside>

                {/* Content */}
                <main className="content-panel">
                    <div className="content-header">
                        <h2>{activeFilterLabel()}</h2>
                        <span className="result-count">{loading ? '' : `${filtered.length} 篇文章`}</span>
                    </div>

                    {loading ? (
                        <div className="empty-state">
                            <div className="loading-spinner" />
                            <p style={{ color: 'var(--text-muted)', marginTop: 16 }}>載入中…</p>
                        </div>
                    ) : filtered.length === 0 ? (
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
                                    onDelete={openConfirmDelete}
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

            {/* Confirm Delete Modal */}
            {confirmModalOpen && (
                <ConfirmModal
                    title="刪除文章"
                    message="確定要刪除此文章嗎？"
                    onConfirm={handleConfirmDelete}
                    onCancel={closeConfirmDelete}
                    confirmText="刪除"
                />
            )}
        </div>
    )
}
