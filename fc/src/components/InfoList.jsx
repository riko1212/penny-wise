import { useState } from 'react';
import PropTypes from 'prop-types';
import InfoItem from './InfoItem';

InfoList.propTypes = {
    items: PropTypes.array.isRequired,
    onDeleteModalOpen: PropTypes.func.isRequired,
    onUpdateItemData: PropTypes.func.isRequired,
    onClearModal: PropTypes.func.isRequired,
    isDeleteModalClose: PropTypes.bool.isRequired,
};

export default function InfoList({
                                     items,
                                     setItems,
                                     onDeleteModalOpen,
                                     onUpdateItemData,
                                     onClearModal,
                                     isDeleteModalClose,
                                 }) {
    console.log('items', items);
    const [sortBy, setSortBy] = useState('order');
    let sortedItems = [...items];

    switch (sortBy) {
        case 'description':
            sortedItems.sort((a, b) => a.type.localeCompare(b.type));
            break;
        case 'highest':
            sortedItems.sort((a, b) => b.amount - a.amount);
            break;
        case 'lowest':
            sortedItems.sort((a, b) => a.amount - b.amount);
            break;
        case 'first':
            sortedItems.sort((a, b) => a.date - b.date);
            break;
        case 'last':
            sortedItems.sort((a, b) => b.date - a.date);
            break;
        default:
            break;
    }

    function handleDeleteItem(id) {
        const updatedItems = items.filter((item) => item.id !== id);
        setItems(updatedItems);
    }

    function handleUpdateItem(id, newType, newAmount, newDate) {
        const updatedItems = items.map((item) =>
            item.id === id
                ? {
                    ...items,
                    date: new Date(newDate).getTime(),
                }
                : item
        );
        setItems(updatedItems);
    }

    return (
        <>
            <ul className="info-list">
                {sortedItems.length === 0 ? (
                    <p>No transactions found.</p>
                ) : (
                    sortedItems.map((item) => (
                        <InfoItem
                            item={{
                                ...item
                            }}
                            key={item.id}
                            onDeleteModalOpen={onDeleteModalOpen}
                            onDeleteItemId={handleDeleteItem}
                            onUpdateItemData={handleUpdateItem}
                            isDeleteModalClose={isDeleteModalClose}
                        />
                    ))
                )}
            </ul>

            <div className="info-actions">
                <div className="info-sorting">
                    <label className="info-sort-text" htmlFor="sort-select">
                        Sort by:
                    </label>
                    <select
                        className="info-sort-select btn"
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="order">order</option>
                        <option value="highest">from highest</option>
                        <option value="lowest">from lowest</option>
                        <option value="description">description</option>
                        <option value="first">from first</option>
                        <option value="last">from last</option>
                    </select>
                </div>
                <button className="btn" onClick={onClearModal}>
                    Clear list
                </button>
            </div>
        </>
    );
}
