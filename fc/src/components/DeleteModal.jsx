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
