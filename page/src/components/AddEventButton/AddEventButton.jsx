import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AddEventForm from 'components/AddEventForm/AddEventForm';
import { useTranslation } from 'contexts/LanguageContext';
import 'styles/AddEventButton.css';

const AddEventButton = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { t } = useTranslation();

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return (
    <>
      <button
        aria-label={t('addEvent.button')}
        className="add-event-button"
        onClick={handleOpenForm}
        title={t('addEvent.button')}
      >
        <Plus size={20} />
        <span className="add-event-text">{t('addEvent.button')}</span>
      </button>
      
      <AddEventForm 
        isOpen={isFormOpen} 
        onClose={handleCloseForm}
      />
    </>
  );
};

export default AddEventButton;