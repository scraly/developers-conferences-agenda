import Filters from 'components/Filters/Filters';
import ListView from 'components/ListView/ListView';

const ListPage = () => {
  return (
    <>
      <Filters view="list" />
      <div className="container">
        <ListView />
      </div>
    </>
  );
};

export default ListPage;
