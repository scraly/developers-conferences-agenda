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
        aria-label="Add New Event"
        className="add-event-button"
        onClick={handleOpenForm}
        title="Add New Event"
      >
        <Plus size={20} />
        <span className="add-event-text">Add event/CFP</span>
      </button>
      
      <AddEventForm 
        isOpen={isFormOpen} 
        onClose={handleCloseForm}
      />
    </>
  );
};

export default AddEventButton;