import PropTypes from 'prop-types';
import { useEscapeKey } from '../hooks/useEscapeKey';

DeleteModal.propTypes = {
  onDeleteModalClose: PropTypes.func,
  onItemDelete: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default function DeleteModal({ onDeleteModalClose, isOpen, onItemDelete }) {
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
        <p className="modal-text">Sure?</p>
        <div className="modal-btns">
          <button type="button" className="btn" onClick={onItemDelete}>
            Yep
          </button>
          <button type="button" className="btn" onClick={onDeleteModalClose}>
            Nope
          </button>
        </div>
      </div>
    </div>
  );
}
