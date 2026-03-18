import PropTypes from 'prop-types';
import { useEscapeKey } from '../hooks/useEscapeKey';

ClearModal.propTypes = {
  onClearModalClose: PropTypes.func,
  onClearList: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default function ClearModal({ onClearModalClose, isOpen, onClearList }) {
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
        <p className="modal-text">Sure?</p>
        <div className="modal-btns">
          <button type="button" className="btn" onClick={onClearList}>
            Yep
          </button>
          <button type="button" className="btn" onClick={onClearModalClose}>
            Nope
          </button>
        </div>
      </div>
    </div>
  );
}
