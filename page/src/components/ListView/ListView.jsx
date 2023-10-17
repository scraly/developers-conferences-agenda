import 'styles/ListView.css';

import EventDisplay from '../EventDisplay/EventDisplay';

import { getYearEvents } from 'utils';

const ListView = ({year}) => {
    let events = getYearEvents(year)

    return <div className="listView">
        <div className="eventsGridDisplay">
            {events.map((e, i) => (<EventDisplay key={`ev_${i}`} {...e} />))}
        </div>
    </div>;
};

export default ListView;
