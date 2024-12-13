import EventCount from 'components/EventCount/EventCount';
import EventDisplay from 'components/EventDisplay/EventDisplay';
import {useEffect} from 'react';
import ReactModal from 'react-modal';
import 'styles/EventModal.css';

ReactModal.setAppElement('#root');

const EventModal = ({isOpen, closeModal, events, selectedDateOrMonth}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isOpen]);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={closeModal}
      className={`modal-container ${isOpen && 'scale-full'}`}
    >
      <div className="modal-header">
        <div>
          <h2>{selectedDateOrMonth && `${selectedDateOrMonth}`}</h2>
          <EventCount events={events} />
        </div>
        <button onClick={closeModal} className="close-button">
          X
        </button>
      </div>
      <div className="modal-body">
        {events.length ? (
          events.map(event => <EventDisplay key={event.date[0] * Math.random() * 100} {...event} />)
        ) : (
          <p>No events found</p>
        )}
      </div>
    </ReactModal>
  );
};

export default EventModal;
