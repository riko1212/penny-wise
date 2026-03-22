import { useEffect } from 'react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useLanguage } from '../context/LanguageContext';

interface ClearModalProps {
  onClearModalClose: () => void;
  onClearList: () => void;
  isOpen: boolean;
}

export default function ClearModal({ onClearModalClose, isOpen, onClearList }: ClearModalProps) {
  const { t } = useLanguage();
  useEscapeKey(onClearModalClose, isOpen);

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
          onClick={onClearModalClose}
        >
          ✕
        </button>
        <p className="modal-text">{t('modal.sure')}</p>
        <div className="modal-btns">
          <button type="button" className="btn" onClick={onClearList}>
            {t('modal.yep')}
          </button>
          <button type="button" className="btn" onClick={onClearModalClose}>
            {t('modal.nope')}
          </button>
        </div>
      </div>
    </div>
  );
}
