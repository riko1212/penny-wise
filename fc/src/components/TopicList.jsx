import TopicItem from './TopicItem';
import PropTypes from 'prop-types';

TopicList.propTypes = {
  categories: PropTypes.array.isRequired,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func,
};

export default function TopicList({ categories, onDelete, onSelect }) {
  return (
    <ul className="sidebar-list">
      {categories.map((item) => (
        <TopicItem
          onDelete={onDelete}
          item={item}
          key={item.id}
          onClick={() => onSelect(item)}
        />
      ))}
    </ul>
  );
}
