import PropTypes from 'prop-types';

TopicItem.propTypes = {
  item: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default function TopicItem({ item, onDelete, onClick, className }) {
  const handleDelete = () => {
    onDelete(item);
  };

  return (
    <li className={`sidebar-item ${className}`} onClick={onClick}>
      <div className="sidebar-link">
        {item.name}
        <button
          type="button"
          className="sidebar-item-delete"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          +
        </button>
      </div>
    </li>
  );
}
