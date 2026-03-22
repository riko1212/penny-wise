import { useState, useEffect, useCallback } from 'react';
import TopicList from './TopicList';
import FormAddCategory from './FormAddCategory';
import DeleteModal from './DeleteModal';
import { SidebarSkeleton } from './Skeleton';
import { showToast } from '../utils/toast';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useLanguage } from '../context/LanguageContext';
import apiFetch from '../utils/apiFetch';
import type { Category } from '../types';

interface SidebarProps {
    onCategorySelect: (cat: string) => void;
    userId: number;
    type: 'INCOME' | 'EXPENSE';
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

export default function Sidebar({ onCategorySelect, userId, type, mobileOpen, onMobileClose }: SidebarProps) {
    const { t } = useLanguage();
    const [categories, setCategories] = useState<Category[]>([]);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [loading, setLoading] = useState(false);
    const [collapsed, setCollapsed] = useState(
        () => localStorage.getItem('sidebarCollapsed') === 'true'
    );

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', collapsed);
    }, [collapsed]);

    useEffect(() => {
        const onResize = () => { if (window.innerWidth <= 768) setCollapsed(false); };
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        setLoading(true);
        apiFetch(`/api/categories?userId=${userId}&type=${type}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch categories');
                return res.json();
            })
            .then(setCategories)
            .catch(() => showToast('error', t('sidebar.failedLoad')))
            .finally(() => setLoading(false));
    }, [userId, type]);

    function handleAddCategory(categoryName: string): void {
        apiFetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: categoryName, userId, type }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to add category');
                return res.json();
            })
            .then((savedCategory: Category) => {
                setCategories((prev) => [...prev, savedCategory]);
                setShowAddCategory(false);
            })
            .catch(() => showToast('error', t('sidebar.failedAdd')));
    }

    function handleDeleteClick(category: Category): void {
        setCategoryToDelete(category);
    }

    function handleRenameCategory(category: Category, newName: string): void {
        apiFetch(`/api/categories/${category.id}?userId=${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to rename category');
                return res.json();
            })
            .then((updated: Category) => {
                setCategories((prev) =>
                    prev.map((c) => (c.id === updated.id ? updated : c))
                );
            })
            .catch(() => showToast('error', t('sidebar.failedRename')));
    }

    function handleConfirmDelete(): void {
        if (!categoryToDelete) return;
        apiFetch(`/api/categories/${categoryToDelete.id}?userId=${userId}`, {
            method: 'DELETE',
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to delete category');
                setCategories((prev) =>
                    prev.filter((c) => c.id !== categoryToDelete.id)
                );
                setCategoryToDelete(null);
            })
            .catch(() => showToast('error', t('sidebar.failedDelete')));
    }

    const handleCloseCategoryDelete = useCallback(() => setCategoryToDelete(null), []);

    useEscapeKey(handleCloseCategoryDelete, categoryToDelete !== null);

    function handleCategorySelect(category: Category): void {
        onCategorySelect(category.name);
    }

    return (
        <>
            {mobileOpen && <div className="sidebar-backdrop" onClick={onMobileClose} />}
            <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}${mobileOpen ? ' sidebar--mobile-open' : ''}`}>
                <button type="button" className="sidebar-mobile-close" onClick={onMobileClose} aria-label="Close">✕</button>
                <button
                    type="button"
                    className="sidebar-toggle"
                    onClick={() => setCollapsed((c) => !c)}
                    title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
                >
                    {collapsed ? '›' : '‹'}
                </button>

                {!collapsed && (
                    <>
                        {loading && <SidebarSkeleton />}
                        <TopicList
                            categories={categories}
                            onDelete={handleDeleteClick}
                            onRename={handleRenameCategory}
                            onSelect={handleCategorySelect}
                        />
                        {showAddCategory && (
                            <FormAddCategory onAddCategory={handleAddCategory} />
                        )}
                        <button
                            onClick={() => setShowAddCategory((prev) => !prev)}
                            type="button"
                            className={!showAddCategory ? 'add-category-btn' : 'add-category-btn close'}
                        >
                            {!showAddCategory ? t('sidebar.addCategory') : t('sidebar.close')}
                        </button>
                    </>
                )}
            </aside>
            <DeleteModal
                isOpen={categoryToDelete !== null}
                onDeleteModalClose={handleCloseCategoryDelete}
                onItemDelete={handleConfirmDelete}
            />
        </>
    );
}
