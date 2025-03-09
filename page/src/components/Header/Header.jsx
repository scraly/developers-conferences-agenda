import ViewSelector from 'components/ViewSelector/ViewSelector';
import './Header.css';
import YearSelector from 'components/YearSelector/YearSelector';
import {Filter} from 'lucide-react';

const Header = () => {
  return (
    <header id="header">
      <div className="container">
        <h1>Developer Conferences Agenda</h1>
        <div>
          <YearSelector />
          <ViewSelector />
        </div>
      </div>
      <button
        type="button"
        id="filters-button"
        onClick={() => document.querySelector('#filters').setAttribute('open', true)}
        data-tooltip="Filters"
        data-placement="right"
      >
        <Filter size="24px" />
      </button>
    </header>
  );
};

export default Header;
