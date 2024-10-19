import EventDisplay from 'components/EventDisplay/EventDisplay';
import ReactModal from 'react-modal';
import '../../styles/EventModal.css';
import EventCount from 'components/EventCount/EventCount';

ReactModal.setAppElement('#root');

const EventModal = ({isOpen, closeModal, events, selectedDateOrMonth}) => {
  return (
    <>
      <style>
        {`
          body {
            overflow: ${isOpen && 'hidden'};
          }
        `}
      </style>
      <ReactModal
        isOpen={isOpen}
        onRequestClose={closeModal}
        className={`modal-container ${isOpen && 'scale-full'}`}
      >
        <div className="modal-header">
          <div>
            <h2>{selectedDateOrMonth && `${selectedDateOrMonth}`}</h2>
            <EventCount events={events}/>
          </div>
          <button onClick={closeModal} className="close-button">
            X
          </button>
        </div>
        <div className="modal-body">
          {events.length ? (
            events.map(event => (
              <EventDisplay key={event.date[0] * Math.random() * 100} {...event} />
            ))
          ) : (
            <p>No events found</p>
          )}
        </div>
      </ReactModal>
    </>
  );
};

export default EventModal;
