import TopicItem from './TopicItem';
import type { Category } from '../types';

interface TopicListProps {
  categories: Category[];
  onDelete: (item: Category) => void;
  onRename: (item: Category, newName: string) => void;
  onSelect: (item: Category) => void;
}

export default function TopicList({ categories, onDelete, onRename, onSelect }: TopicListProps) {
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
