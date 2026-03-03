import { useState, useEffect, useMemo } from 'react'
import { supabase } from './supabase'

const DEFAULT_CATEGORIES = [
    { id: 'uiux', label: 'UI/UX', iconName: 'palette', colorClass: 'cat-uiux' },
    { id: 'tech', label: '科技', iconName: 'terminal', colorClass: 'cat-tech' },
    { id: 'other', label: '其他', iconName: 'paperclip', colorClass: 'cat-other' },
]

// Map from DB snake_case to app camelCase
function mapArticle(row) {
    return {
        id: row.id,
        url: row.url,
        title: row.title,
        description: row.description,
        category: row.category,
        tags: row.tags || [],
        status: row.status,
        meetingMonth: row.meeting_month,
        createdAt: row.created_at,
    }
}

function mapCategory(row) {
    return {
        id: row.id,
        label: row.label,
        iconName: row.icon_name,
        colorClass: row.color_class,
    }
}

export function useArticles() {
    const [articles, setArticles] = useState([])
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')

    // ── Initial load ──────────────────────────────────────────────
    useEffect(() => {
        async function fetchAll() {
            setLoading(true)
            const [{ data: arts }, { data: cats }] = await Promise.all([
                supabase.from('articles').select('*').order('created_at', { ascending: false }),
                supabase.from('categories').select('*').order('created_at', { ascending: true }),
            ])
            if (arts) setArticles(arts.map(mapArticle))
            if (cats && cats.length > 0) setCategories(cats.map(mapCategory))
            setLoading(false)
        }
        fetchAll()
    }, [])

    // ── Derived state ─────────────────────────────────────────────
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
        })
    }, [articles, search, filterCategory, filterStatus])

    const counts = useMemo(() => {
        const c = { all: articles.length }
        articles.forEach(a => {
            c[a.category] = (c[a.category] || 0) + 1
            c[a.status] = (c[a.status] || 0) + 1
        })
        return c
    }, [articles])

    // ── Articles CRUD ─────────────────────────────────────────────
    async function addArticle(data) {
        const row = {
            id: Date.now().toString(),
            url: data.url,
            title: data.title,
            description: data.description || '',
            category: data.category,
            tags: data.tags || [],
            status: data.status,
            meeting_month: data.meetingMonth || '',
            created_at: new Date().toISOString(),
        }
        const { data: inserted, error } = await supabase
            .from('articles').insert(row).select().single()
        if (!error && inserted) {
            setArticles(prev => [mapArticle(inserted), ...prev])
        }
    }

    async function updateArticle(id, data) {
        const patch = {}
        if (data.url !== undefined) patch.url = data.url
        if (data.title !== undefined) patch.title = data.title
        if (data.description !== undefined) patch.description = data.description
        if (data.category !== undefined) patch.category = data.category
        if (data.tags !== undefined) patch.tags = data.tags
        if (data.status !== undefined) patch.status = data.status
        if (data.meetingMonth !== undefined) patch.meeting_month = data.meetingMonth

        const { data: updated, error } = await supabase
            .from('articles').update(patch).eq('id', id).select().single()
        if (!error && updated) {
            setArticles(prev => prev.map(a => a.id === id ? mapArticle(updated) : a))
        }
    }

    async function deleteArticle(id) {
        const { error } = await supabase.from('articles').delete().eq('id', id)
        if (!error) {
            setArticles(prev => prev.filter(a => a.id !== id))
        }
    }

    // ── Categories CRUD ───────────────────────────────────────────
    async function addCategory(data) {
        const row = {
            id: 'cat_' + Date.now().toString(),
            label: typeof data === 'string' ? data : data.label,
            icon_name: typeof data === 'string' ? 'folder' : (data.iconName || 'folder'),
            color_class: typeof data === 'string' ? 'cat-other' : (data.colorClass || 'cat-other'),
        }
        const { data: inserted, error } = await supabase
            .from('categories').insert(row).select().single()
        if (!error && inserted) {
            setCategories(prev => [...prev, mapCategory(inserted)])
        }
    }

    async function updateCategory(id, data) {
        const patch = {}
        if (data.label !== undefined) patch.label = data.label
        if (data.iconName !== undefined) patch.icon_name = data.iconName
        if (data.colorClass !== undefined) patch.color_class = data.colorClass

        const { data: updated, error } = await supabase
            .from('categories').update(patch).eq('id', id).select().single()
        if (!error && updated) {
            setCategories(prev => prev.map(c => c.id === id ? mapCategory(updated) : c))
        }
    }

    async function deleteCategory(id) {
        const { error } = await supabase.from('categories').delete().eq('id', id)
        if (!error) {
            setCategories(prev => prev.filter(c => c.id !== id))
            setArticles(prev =>
                prev.map(a => a.category === id ? { ...a, category: 'other' } : a)
            )
        }
    }

    return {
        articles, filtered, counts, loading,
        categories, addCategory, updateCategory, deleteCategory,
        search, setSearch,
        filterCategory, setFilterCategory,
        filterStatus, setFilterStatus,
        addArticle, updateArticle, deleteArticle,
    }
}