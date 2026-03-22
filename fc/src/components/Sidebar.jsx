import { useState, useEffect, useCallback } from 'react';
import TopicList from './TopicList.jsx';
import FormAddCategory from './FormAddCategory.jsx';
import DeleteModal from './DeleteModal.jsx';
import PropTypes from 'prop-types';
import { SidebarSkeleton } from './Skeleton.jsx';
import { showToast } from '../utils/toast';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useLanguage } from '../context/LanguageContext';

Sidebar.propTypes = {
    onCategorySelect: PropTypes.func.isRequired,
    userId: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['INCOME', 'EXPENSE']).isRequired,
};

export default function Sidebar({ onCategorySelect, userId, type }) {
    const { t } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [collapsed, setCollapsed] = useState(
        () => localStorage.getItem('sidebarCollapsed') === 'true'
    );

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', collapsed);
    }, [collapsed]);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/categories?userId=${userId}&type=${type}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch categories');
                return res.json();
            })
            .then(setCategories)
            .catch(() => showToast('error', t('sidebar.failedLoad')))
            .finally(() => setLoading(false));
    }, [userId, type]);

    function handleAddCategory(categoryName) {
        fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: categoryName, userId, type }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to add category');
                return res.json();
            })
            .then((savedCategory) => {
                setCategories((prev) => [...prev, savedCategory]);
                setShowAddCategory(false);
            })
            .catch(() => showToast('error', t('sidebar.failedAdd')));
    }

    function handleDeleteClick(category) {
        setCategoryToDelete(category);
    }

    function handleRenameCategory(category, newName) {
        fetch(`/api/categories/${category.id}?userId=${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to rename category');
                return res.json();
            })
            .then((updated) => {
                setCategories((prev) =>
                    prev.map((c) => (c.id === updated.id ? updated : c))
                );
            })
            .catch(() => showToast('error', t('sidebar.failedRename')));
    }

    function handleConfirmDelete() {
        fetch(`/api/categories/${categoryToDelete.id}?userId=${userId}`, {
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

    function handleCategorySelect(category) {
        onCategorySelect(category.name);
    }

    return (
        <>
            <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
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
