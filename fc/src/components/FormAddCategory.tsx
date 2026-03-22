import React, { useState } from 'react';
import Button from './Button';
import { useLanguage } from '../context/LanguageContext';

interface FormAddCategoryProps {
    onAddCategory: (name: string) => void;
}

export default function FormAddCategory({ onAddCategory }: FormAddCategoryProps) {
    const { t } = useLanguage();
    const [categoryName, setCategoryName] = useState('');

    function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
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
