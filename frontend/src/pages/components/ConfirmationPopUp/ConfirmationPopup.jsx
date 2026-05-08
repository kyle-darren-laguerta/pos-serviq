import React from 'react';
import './ConfirmationPopup.css';

const ConfirmationPopup = ({ isOpen, message, onConfirm, onCancel }) => {
  // If the popup is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3>⚠️ Please Confirm</h3>
        <p>{message}</p>
        
        <div className="popup-actions">
          <button className="popup-btn cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="popup-btn confirm-btn" onClick={onConfirm}>
            Yes, Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;