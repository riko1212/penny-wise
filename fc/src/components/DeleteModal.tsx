import { useEffect } from 'react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useLanguage } from '../context/LanguageContext';

interface DeleteModalProps {
  onDeleteModalClose: () => void;
  onItemDelete: () => void;
  isOpen: boolean;
}

export default function DeleteModal({ onDeleteModalClose, isOpen, onItemDelete }: DeleteModalProps) {
  const { t } = useLanguage();
  useEscapeKey(onDeleteModalClose, isOpen);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <div className={isOpen ? 'backdrop' : 'backdrop clicked'}>
      <div className="modal delete-modal">
        <button
          type="button"
          className="modal-close-btn"
          onClick={onDeleteModalClose}
        >
          ✕
        </button>
        <p className="modal-text">{t('modal.sure')}</p>
        <div className="modal-btns">
          <button type="button" className="btn" onClick={onItemDelete}>
            {t('modal.yep')}
          </button>
          <button type="button" className="btn" onClick={onDeleteModalClose}>
            {t('modal.nope')}
          </button>
        </div>
      </div>
    </div>
  );
}
