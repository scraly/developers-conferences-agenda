import Header from 'components/Header/Header';
import {Outlet} from 'react-router-dom';

function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
