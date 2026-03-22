import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

TopicItem.propTypes = {
  item: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default function TopicItem({ item, onDelete, onClick, className }) {
  const { tc } = useLanguage();
  const handleDelete = () => {
    onDelete(item);
  };

  return (
    <li className={`sidebar-item ${className}`} onClick={onClick}>
      <div className="sidebar-link">
        {tc(item.name)}
        <button
          type="button"
          className="sidebar-item-delete"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>
    </li>
  );
}
