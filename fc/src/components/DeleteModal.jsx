import { useEffect } from 'react';
import PropTypes from 'prop-types';

DeleteModal.propTypes = {
  onDeleteModalClose: PropTypes.func,
  onItemDelete: PropTypes.func,
  isDeleteModalClose: PropTypes.bool,
};

export default function DeleteModal({
  onDeleteModalClose,
  isDeleteModalClose,
  onItemDelete,
}) {
  useEffect(() => {
    if (isDeleteModalClose) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onDeleteModalClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeleteModalClose, onDeleteModalClose]);

  return (
    <div className={isDeleteModalClose ? 'backdrop clicked' : 'backdrop'}>
      <div className="modal delete-modal ">
        <button
          type="button"
          className="modal-close-btn"
          onClick={onDeleteModalClose}
        >
          X
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
