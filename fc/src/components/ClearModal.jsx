import PropTypes from 'prop-types';

CleareModal.propTypes = {
  onClearModalClose: PropTypes.func,
  onClearList: PropTypes.func,
  isClearModalClose: PropTypes.bool,
};
export default function CleareModal({
  onClearModalClose,
  isClearModalClose,
  onClearList,
}) {
  return (
    <div className={isClearModalClose ? 'backdrop clicked' : 'backdrop'}>
      <div className="modal delete-modal ">
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClearModalClose}
        >
          X
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
