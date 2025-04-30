import { useState } from 'react';
import TopicItem from './TopicItem';
import PropTypes from 'prop-types';

TopicList.propTypes = {
  categories: PropTypes.array.isRequired,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func,
};

export default function TopicList({ categories, onDelete, onSelect }) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleTabClick = (index, category) => {
    setActiveTabIndex(index);
    onSelect(category);
  };

  return (
    <ul className="sidebar-list">
      {categories.map((item, index) => (
        <TopicItem
          onDelete={onDelete}
          item={item}
          key={item.id}
          onClick={() => handleTabClick(index, item)}
          className={index === activeTabIndex ? 'active' : ''}
        />
      ))}
    </ul>
  );
}
