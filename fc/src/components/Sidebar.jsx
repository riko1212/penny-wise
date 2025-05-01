import { useState, useEffect } from 'react';
import TopicList from './TopicList.jsx';
import FormAddCategory from './FormAddCategory.jsx';
import PropTypes from 'prop-types';

export default function Sidebar({ onCategorySelect }) {
    const [categories, setCategories] = useState([]);
    const [showAddCategory, setShowAddCategory] = useState(false);

    // Завантаження всіх категорій з бекенду при старті
    useEffect(() => {
        fetch('http://localhost:8080/api/categories')
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(setCategories)
            .catch((err) => console.error('Fetch error:', err));
    }, []);

    // Додавання нової категорії
    function handleAddCategory(categoryName) {
        const newCategory = { name: categoryName };
        console.log(JSON.stringify(newCategory))

        fetch('http://localhost:8080/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCategory),
        })
            .then((res) => {
                console.log('Response status:', res.status); // Дивимося на код статусу
                if (!res.ok) throw new Error('Failed to add category');
                return res.json();
            })
            .then((savedCategory) => {
                console.log('Saved category:', savedCategory); // Логуємо результат
                setCategories((prev) => [...prev, savedCategory]);
                setShowAddCategory(false);
            })
            .catch((err) => console.error('Add category error:', err));
    }

    // Видалення категорії
    function handleDeleteCategory(categoryToDelete) {
        fetch(`http://localhost:8080/api/categories/${categoryToDelete.id}`, {
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

    // Вибір категорії
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
