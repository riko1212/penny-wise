import React, { useState, useRef, useEffect } from 'react';
import { X, Pencil, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { Category } from '../types';

interface TopicItemProps {
  item: Category;
  onDelete: (item: Category) => void;
  onRename: (item: Category, newName: string) => void;
  onClick: () => void;
  className?: string;
}

export default function TopicItem({ item, onDelete, onRename, onClick, className }: TopicItemProps) {
  const { tc } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startEdit(e: React.MouseEvent): void {
    e.stopPropagation();
    setValue(item.name);
    setEditing(true);
  }

  function handleSave(e: React.MouseEvent | React.KeyboardEvent): void {
    e.stopPropagation();
    const trimmed = value.trim();
    if (trimmed && trimmed !== item.name) {
      onRename(item, trimmed);
    }
    setEditing(false);
  }

  function handleCancel(e: React.MouseEvent | React.KeyboardEvent): void {
    e.stopPropagation();
    setValue(item.name);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'Enter') handleSave(e);
    if (e.key === 'Escape') handleCancel(e);
  }

  if (editing) {
    return (
      <li className={`sidebar-item ${className}`}>
        <div className="sidebar-link sidebar-link--editing">
          <input
            ref={inputRef}
            className="sidebar-rename-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            maxLength={50}
          />
          <button
            type="button"
            className="sidebar-item-action sidebar-item-action--save"
            onClick={handleSave}
            title="Save"
          >
            <Check size={14} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            className="sidebar-item-action sidebar-item-action--cancel"
            onClick={handleCancel}
            title="Cancel"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className={`sidebar-item ${className}`} onClick={onClick}>
      <div className="sidebar-link">
        <span className="sidebar-item-name">{tc(item.name)}</span>
        <div className="sidebar-item-actions">
          <button
            type="button"
            className="sidebar-item-action"
            onClick={startEdit}
            title="Rename"
          >
            <Pencil size={13} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="sidebar-item-action sidebar-item-action--delete"
            onClick={(e) => { e.stopPropagation(); onDelete(item); }}
            title="Delete"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </li>
  );
}
