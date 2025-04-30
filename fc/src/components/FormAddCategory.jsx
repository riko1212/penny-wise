import { useState } from 'react';
import Button from './Button';
import PropTypes from 'prop-types';

FormAddCategory.propTypes = {
    onAddCategory: PropTypes.func.isRequired,
};

export default function FormAddCategory({ onAddCategory }) {
    const [categoryName, setCategoryName] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        if (!categoryName.trim()) return;

        onAddCategory(categoryName); // ✅ передаємо рядок
        setCategoryName('');
    }

    return (
        <form className="form-add-category" onSubmit={handleSubmit}>
            <label htmlFor="add-category" className="add-category-text">
                Category name
            </label>
            <input
                id="add-category"
                type="text"
                className="add-category-input"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
            />
            <Button type="submit" className="submit-category">
                Add
            </Button>
        </form>
    );
}
