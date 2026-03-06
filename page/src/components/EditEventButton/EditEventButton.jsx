import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import EditEventForm from 'components/EditEventForm/EditEventForm';
import { useTranslation } from 'contexts/LanguageContext';
import './EditEventButton.css';

const EditEventButton = () => {
  const { t } = useTranslation();
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
        aria-label={t('editEvent.button')}
        className="edit-event-button"
        onClick={handleOpenForm}
        title={t('editEvent.button')}
      >
        <Edit size={20} />
        <span className="add-event-text">{t('editEvent.button')}</span>
      </button>
      <EditEventForm 
        isOpen={isFormOpen} 
        onClose={handleCloseForm}
      />
    </>
  );
};

export default EditEventButton;
