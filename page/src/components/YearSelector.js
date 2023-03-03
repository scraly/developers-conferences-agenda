import React from 'react';

import { IonIcon } from '@ionic/react';
import { caretBackCircle, caretForwardCircle } from 'ionicons/icons';

import 'styles/YearSelector.css';

const YearSelector = ({ year, onChange }) => {
	return (
		<div className="yearNavigator">
			<IonIcon icon={caretBackCircle} onClick={() => onChange(year - 1)} />
			<h2 className="bigYearLabel">{year}</h2>
			<IonIcon icon={caretForwardCircle} onClick={() => onChange(year + 1)} />
		</div>
	);
};

export default YearSelector;
