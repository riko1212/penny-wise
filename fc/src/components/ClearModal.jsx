import PropTypes from 'prop-types';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useLanguage } from '../context/LanguageContext';

ClearModal.propTypes = {
  onClearModalClose: PropTypes.func,
  onClearList: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default function ClearModal({ onClearModalClose, isOpen, onClearList }) {
  const { t } = useLanguage();
  useEscapeKey(onClearModalClose, isOpen);

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
