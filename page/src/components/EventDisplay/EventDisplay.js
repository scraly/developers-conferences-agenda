import 'styles/EventDisplay.css';

const EventDisplay = ({name, hyperlink, location, misc}) => {
  return (
    <div className="eventCell">
      <b>{name}</b>
      <a href={hyperlink}>{new URL(hyperlink).hostname}</a>
      <span>{location}</span>
      <p dangerouslySetInnerHTML={{__html: misc}}></p>
    </div>
  );
};

export default EventDisplay;
