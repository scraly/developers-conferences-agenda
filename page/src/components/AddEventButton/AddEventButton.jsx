import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AddEventForm from 'components/AddEventForm/AddEventForm';
import 'styles/AddEventButton.css';

const AddEventButton = () => {
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
        onClick={handleOpenForm}
        className="add-event-button"
        title="Add New Event"
        aria-label="Add New Event"
      >
        <Plus size={20} />
        <span className="add-event-text">Add Event</span>
      </button>
      
      <AddEventForm 
        isOpen={isFormOpen} 
        onClose={handleCloseForm}
      />
    </>
  );
};

export default AddEventButton;