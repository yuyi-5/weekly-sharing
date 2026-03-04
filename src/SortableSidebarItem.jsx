import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CategoryIcon } from './ArticleCard';
import { Settings2 } from 'lucide-react';

export function SortableCategoryItem({ category, activeId, onClick, onEdit, count }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: isDragging ? 'relative' : 'static',
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <button
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`filter-btn category-item ${activeId === category.id ? 'active' : ''}`}
            onClick={onClick}
        >
            <span className="filter-btn-icon"><CategoryIcon name={category.iconName} size={16} /></span>
            <span style={{ flex: 1, textAlign: 'left' }}>{category.label}</span>
            <span
                className="edit-cat-btn"
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking edit
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit(category, e);
                }}
                title="編輯分類"
            >
                <Settings2 size={12} strokeWidth={2} />
            </span>
            <span className="filter-count">
                {count || 0}
            </span>
        </button>
    );
}

export function SortableStatusItem({ status, activeId, onClick, count }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: status.value });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: isDragging ? 'relative' : 'static',
        zIndex: isDragging ? 999 : 'auto',
    };

    const Icon = status.icon;

    return (
        <button
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`filter-btn ${activeId === status.value ? 'active' : ''}`}
            onClick={onClick}
        >
            <span className="filter-btn-icon"><Icon size={16} strokeWidth={2} /></span> {status.label}
            <span className="filter-count">
                {count || 0}
            </span>
        </button>
    );
}