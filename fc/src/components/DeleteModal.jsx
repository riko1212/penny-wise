import PropTypes from 'prop-types';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useLanguage } from '../context/LanguageContext';

DeleteModal.propTypes = {
  onDeleteModalClose: PropTypes.func,
  onItemDelete: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default function DeleteModal({ onDeleteModalClose, isOpen, onItemDelete }) {
  const { t } = useLanguage();
  useEscapeKey(onDeleteModalClose, isOpen);

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
