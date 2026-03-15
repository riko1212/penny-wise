import { useState, useEffect, useCallback } from 'react';
import TopicList from './TopicList.jsx';
import FormAddCategory from './FormAddCategory.jsx';
import DeleteModal from './DeleteModal.jsx';
import PropTypes from 'prop-types';
import { SidebarSkeleton } from './Skeleton.jsx';

Sidebar.propTypes = {
    onCategorySelect: PropTypes.func.isRequired,
    userId: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['INCOME', 'EXPENSE']).isRequired,
};

export default function Sidebar({ onCategorySelect, userId, type }) {
    const [categories, setCategories] = useState([]);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
            .catch(() => setError('Failed to load categories.'))
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
            .catch(() => setError('Failed to add category.'));
    }

    function handleDeleteClick(category) {
        setCategoryToDelete(category);
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
            .catch(() => setError('Failed to delete category.'));
    }

    const handleCloseCategoryDelete = useCallback(() => setCategoryToDelete(null), []);

    useEffect(() => {
        if (categoryToDelete === null) return;
        const handleKeyDown = (e) => { if (e.key === 'Escape') handleCloseCategoryDelete(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [categoryToDelete, handleCloseCategoryDelete]);

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
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? '›' : '‹'}
                </button>

                {!collapsed && (
                    <>
                        {loading && <SidebarSkeleton />}
                        {error && <p className="api-error">{error}</p>}
                        <TopicList
                            categories={categories}
                            onDelete={handleDeleteClick}
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
                            {!showAddCategory ? 'Add category' : 'Close'}
                        </button>
                    </>
                )}
            </aside>
            <DeleteModal
                isDeleteModalClose={categoryToDelete === null}
                onDeleteModalClose={handleCloseCategoryDelete}
                onItemDelete={handleConfirmDelete}
            />
        </>
    );
}
