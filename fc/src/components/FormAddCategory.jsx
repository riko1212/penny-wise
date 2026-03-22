import { useState } from 'react';
import Button from './Button';
import PropTypes from 'prop-types';
import { useLanguage } from '../context/LanguageContext';

FormAddCategory.propTypes = {
    onAddCategory: PropTypes.func.isRequired,
};

export default function FormAddCategory({ onAddCategory }) {
    const { t } = useLanguage();
    const [categoryName, setCategoryName] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        if (!categoryName.trim()) return;

        onAddCategory(categoryName);
        setCategoryName('');
    }

    return (
        <form className="form-add-category" onSubmit={handleSubmit}>
            <label htmlFor="add-category" className="add-category-text">
                {t('form.categoryName')}
            </label>
            <input
                id="add-category"
                type="text"
                className="add-category-input"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
            />
            <Button type="submit" className="submit-category">
                {t('form.add')}
            </Button>
        </form>
    );
}
