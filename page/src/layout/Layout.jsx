import Header from 'components/Header/Header';
import {Outlet} from 'react-router-dom';

function Layout() {
  return (
    <>
      <Header />
      <main>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </>
  );
}

export default Layout;
