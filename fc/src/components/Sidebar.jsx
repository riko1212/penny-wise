import { useState, useEffect } from 'react';
import TopicList from './TopicList.jsx';
import FormAddCategory from './FormAddCategory.jsx';
import PropTypes from 'prop-types';

Sidebar.propTypes = {
    onCategorySelect: PropTypes.func.isRequired,
    userId: PropTypes.number.isRequired,
};

export default function Sidebar({ onCategorySelect, userId }) {
    const [categories, setCategories] = useState([]);
    const [showAddCategory, setShowAddCategory] = useState(false);

    useEffect(() => {
        fetch(`/api/categories?userId=${userId}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch categories');
                return res.json();
            })
            .then(setCategories)
            .catch((err) => console.error('Fetch categories error:', err));
    }, [userId]);

    function handleAddCategory(categoryName) {
        fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: categoryName, userId }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to add category');
                return res.json();
            })
            .then((savedCategory) => {
                setCategories((prev) => [...prev, savedCategory]);
                setShowAddCategory(false);
            })
            .catch((err) => console.error('Add category error:', err));
    }

    function handleDeleteCategory(categoryToDelete) {
        fetch(`/api/categories/${categoryToDelete.id}?userId=${userId}`, {
            method: 'DELETE',
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to delete category');
                setCategories((prev) =>
                    prev.filter((category) => category.id !== categoryToDelete.id)
                );
            })
            .catch((err) => console.error('Delete category error:', err));
    }

    function handleCategorySelect(category) {
        onCategorySelect(category.name);
    }

    return (
        <aside className="sidebar">
            <TopicList
                categories={categories}
                onDelete={handleDeleteCategory}
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
        </aside>
    );
}
