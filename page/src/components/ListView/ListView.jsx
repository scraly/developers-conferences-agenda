import 'styles/ListView.css';

import EventDisplay from '../EventDisplay/EventDisplay';
import {filterEvents} from '../../utils';
import {useCustomContext} from 'app.context';

import { getYearEvents } from 'utils';

const ListView = ({year}) => {
    let events = getYearEvents(year)
    const {userState} = useCustomContext()
    events = filterEvents(events, userState.filters.callForPapers, userState.filters.query)

    return <div className="listView">
        <div className="eventsGridDisplay">
            {events.map((e, i) => (<EventDisplay key={`ev_${i}`} {...e} />))}
        </div>
    </div>;
};

export default ListView;
