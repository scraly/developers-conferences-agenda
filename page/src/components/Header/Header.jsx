import ViewSelector from 'components/ViewSelector/ViewSelector';
import './Header.css';
import YearSelector from 'components/YearSelector/YearSelector';

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
    </header>
  );
};

export default Header;
