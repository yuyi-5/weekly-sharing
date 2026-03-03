import { useState, useEffect, useMemo } from 'react'

const STORAGE_KEY = 'weekly-articles-v1'
const CATEGORIES_KEY = 'weekly-categories-v2' // change key to reset/migrate categories

const SAMPLE_ARTICLES = [
    {
        id: '1',
        url: 'https://uxdesign.cc/the-most-important-rule-in-ux-design-7f3db5747e38',
        title: 'The Most Important Rule in UX Design',
        description: '探討 UX 設計中最核心的原則：以用戶為中心，如何在每一個設計決策背後保持對用戶需求的深刻理解。',
        category: 'uiux',
        tags: ['UX', '設計原則'],
        status: 'toshare',
        meetingMonth: '',
        createdAt: new Date('2026-02-15').toISOString(),
    },
    {
        id: '2',
        url: 'https://vercel.com/blog/ai-sdk-3-generative-ui',
        title: 'Introducing AI SDK 3.0 and Generative UI',
        description: 'Vercel 推出 AI SDK 3.0，讓開發者可以用 React Server Components 建立 Generative UI，讓 AI 直接輸出互動式元件而不只是文字。',
        category: 'tech',
        tags: ['AI', 'React', 'Vercel'],
        status: 'shared',
        meetingMonth: '2026-02',
        createdAt: new Date('2026-02-01').toISOString(),
    },
    {
        id: '3',
        url: 'https://www.nngroup.com/articles/dark-mode-users/',
        title: 'Dark Mode vs. Light Mode: Which Is Better?',
        description: 'Nielsen Norman Group 的研究結論，探討在哪些情境下 Dark Mode 或 Light Mode 對使用者更有利，以及對閱讀可讀性的影響。',
        category: 'uiux',
        tags: ['暗色模式', '可讀性', 'NNG'],
        status: 'unread',
        meetingMonth: '',
        createdAt: new Date('2026-03-01').toISOString(),
    },
]

const DEFAULT_CATEGORIES = [
    { id: 'uiux', label: 'UI/UX', iconName: 'palette', colorClass: 'cat-uiux' },
    { id: 'tech', label: '科技', iconName: 'terminal', colorClass: 'cat-tech' },
    { id: 'other', label: '其他', iconName: 'paperclip', colorClass: 'cat-other' }
]

function loadArticles() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) return JSON.parse(stored)
    } catch { }
    return SAMPLE_ARTICLES
}

function saveArticles(articles) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(articles)) } catch { }
}

function loadCategories() {
    try {
        const stored = localStorage.getItem(CATEGORIES_KEY)
        if (stored) return JSON.parse(stored)
        // Migration from v1
        const oldStored = localStorage.getItem('weekly-categories-v1')
        if (oldStored) {
            const oldCats = JSON.parse(oldStored)
            return oldCats.map(c => ({
                ...c,
                iconName: c.id === 'uiux' ? 'palette' : c.id === 'tech' ? 'terminal' : 'folder'
            }))
        }
    } catch { }
    return DEFAULT_CATEGORIES
}

function saveCategories(cats) {
    try { localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats)) } catch { }
}

export function useArticles() {
    const [articles, setArticles] = useState(loadArticles)
    const [categories, setCategories] = useState(loadCategories)
    const [search, setSearch] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => { saveArticles(articles) }, [articles])
    useEffect(() => { saveCategories(categories) }, [categories])

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return articles.filter(a => {
            const matchesSearch = !q ||
                a.title.toLowerCase().includes(q) ||
                a.description.toLowerCase().includes(q) ||
                a.url.toLowerCase().includes(q) ||
                a.tags.some(t => t.toLowerCase().includes(q))
            const matchesCat = filterCategory === 'all' || a.category === filterCategory
            const matchesStatus = filterStatus === 'all' || a.status === filterStatus
            return matchesSearch && matchesCat && matchesStatus
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }, [articles, search, filterCategory, filterStatus])

    const counts = useMemo(() => {
        const c = { all: articles.length }
        articles.forEach(a => {
            c[a.category] = (c[a.category] || 0) + 1
            c[a.status] = (c[a.status] || 0) + 1
        })
        return c
    }, [articles])

    function addArticle(data) {
        const article = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }
        setArticles(prev => [article, ...prev])
    }

    function updateArticle(id, data) {
        setArticles(prev => prev.map(a => a.id === id ? { ...a, ...data } : a))
    }

    function deleteArticle(id) {
        setArticles(prev => prev.filter(a => a.id !== id))
    }

    function addCategory(data) {
        const id = 'cat_' + Date.now().toString()
        const newCat = typeof data === 'string' 
            ? { id, label: data, iconName: 'folder', colorClass: 'cat-other' }
            : { id, label: data.label, iconName: data.iconName || 'folder', colorClass: data.colorClass || 'cat-other' };
        setCategories(prev => [...prev, newCat])
    }

    function updateCategory(id, data) {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
    }

    function deleteCategory(id) {
        setCategories(prev => prev.filter(c => c.id !== id))
        // Optionally update articles using this category to 'other' or something
        setArticles(prev => prev.map(a => a.category === id ? { ...a, category: 'other' } : a))
    }

    return {
        articles, filtered, counts,
        categories, addCategory, updateCategory, deleteCategory,
        search, setSearch,
        filterCategory, setFilterCategory,
        filterStatus, setFilterStatus,
        addArticle, updateArticle, deleteArticle,
    }
}