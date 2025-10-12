import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import EditEventForm from 'components/EditEventForm/EditEventForm';
import './EditEventButton.css';

const EditEventButton = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return (
    <>
      <button
        aria-label="Edit Existing Event"
        className="edit-event-button"
        onClick={handleOpenForm}
        title="Edit Existing Event"
      >
        <Edit size={20} />
        <span className="add-event-text">Edit event</span>
      </button>
      <EditEventForm 
        isOpen={isFormOpen} 
        onClose={handleCloseForm}
      />
    </>
  );
};

export default EditEventButton;
