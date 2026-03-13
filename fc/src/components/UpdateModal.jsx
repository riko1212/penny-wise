export default function UpdateModal({
  onModalClose,
  isModalClose,
  onUpdateList,
  itemToUpdate,
}) {
  return (
    <div className={isModalClose ? 'backdrop clicked' : 'backdrop'}>
      <div className="modal update-modal ">
        <button
          type="button"
          className="modal-close-btn"
          onClick={onModalClose}
        >
          X
        </button>
        <input
          type="text"
          name="user-text"
          className="form-input"
          placeholder="Enter type"
          value={itemToUpdate.topic}
        />
        <input
          type="number"
          name="user-sum"
          className="form-input"
          placeholder="Enter sum"
          value={itemToUpdate.income}
        />
        <input
          type="text"
          name="user-date"
          className="form-input"
          placeholder="Enter date"
          value={itemToUpdate.date}
        />
        <div className="modal-btns">
          <button type="button" className="btn" onClick={onUpdateList}>
            OK
          </button>
          <button type="button" className="btn" onClick={onModalClose}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
