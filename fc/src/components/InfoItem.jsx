import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, X, Calendar } from 'lucide-react';
import { formatUAH } from '../utils/format';

InfoItem.propTypes = {
  onDeleteItemId: PropTypes.func,
  onUpdateItemData: PropTypes.func,
  item: PropTypes.object.isRequired,
};

export default function InfoItem({ onDeleteItemId, item, onUpdateItemData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTopic, setEditedTopic] = useState(item.topic);
  const [editedIncome, setEditedIncome] = useState(item.income);
  const [editedDate, setEditedDate] = useState(
    new Date(item.date).toISOString().slice(0, 10)
  );

  useEffect(() => {
    setEditedTopic(item.topic);
    setEditedIncome(item.income);
    setEditedDate(new Date(item.date).toISOString().slice(0, 10));
  }, [item]);

  function isToday(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateFromTimestamp = new Date(date);
    const timestampDate = new Date(
      dateFromTimestamp.getFullYear(),
      dateFromTimestamp.getMonth(),
      dateFromTimestamp.getDate()
    );
    return today.getTime() === timestampDate.getTime();
  }

  function handleSave() {
    const updatedItem = {
      ...item,
      topic: editedTopic,
      income: editedIncome,
      date: new Date(editedDate).getTime(),
    };
    onUpdateItemData(item.id, updatedItem);
    setIsEditing(false);
  }

  return (
    <li className="info-item">
      <div className="info-item-wrap">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editedTopic}
              onChange={(e) => setEditedTopic(e.target.value)}
              className="form-input form-input-edit"
            />
            <input
              type="number"
              value={editedIncome}
              onChange={(e) => setEditedIncome(e.target.value)}
              className="form-input form-input-edit"
            />
            <div className="date-input-wrap">
              <Calendar size={15} className="date-input-icon" />
              <input
                type="date"
                value={editedDate}
                onChange={(e) => setEditedDate(e.target.value)}
                className="form-input form-input-edit"
              />
            </div>
          </>
        ) : (
          <>
            <p className="info-item-text">{item.topic}:</p>
            <p className="info-item-count">{formatUAH(item.income)}</p>
            <p className="info-item-data">
              <Calendar size={13} style={{ opacity: 0.5, verticalAlign: 'middle', marginRight: 4 }} />
              {isToday(item.date)
                ? 'Today'
                : new Date(item.date).toLocaleDateString('uk-UA')}
            </p>
          </>
        )}
      </div>
      <div className="info-icons">
        {isEditing ? (
          <>
            <button
              type="button"
              className="info-icon-btn info-icon-btn--save"
              onClick={handleSave}
              title="Save"
            >
              <Check size={16} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className="info-icon-btn info-icon-btn--cancel"
              onClick={() => setIsEditing(false)}
              title="Cancel"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <button
            type="button"
            className="info-icon-btn info-icon-btn--edit"
            onClick={() => setIsEditing(true)}
            title="Edit"
          >
            <Pencil size={15} strokeWidth={2} />
          </button>
        )}
        <button
          type="button"
          className="info-icon-btn info-icon-btn--delete"
          onClick={() => onDeleteItemId(item.id)}
          title="Delete"
        >
          <Trash2 size={15} strokeWidth={2} />
        </button>
      </div>
    </li>
  );
}
