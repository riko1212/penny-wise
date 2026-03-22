import TopicItem from './TopicItem';
import PropTypes from 'prop-types';

TopicList.propTypes = {
  categories: PropTypes.array.isRequired,
  onDelete: PropTypes.func,
  onRename: PropTypes.func,
  onSelect: PropTypes.func,
};

export default function TopicList({ categories, onDelete, onRename, onSelect }) {
  return (
    <ul className="sidebar-list">
      {categories.map((item) => (
        <TopicItem
          onDelete={onDelete}
          onRename={onRename}
          item={item}
          key={item.id}
          onClick={() => onSelect(item)}
        />
      ))}
    </ul>
  );
}
