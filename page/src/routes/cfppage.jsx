import Filters from 'components/Filters/Filters';
import CfpView from 'components/CfpView/CfpView';

const CfpPage = () => {
  return (
    <>
      <Filters view="cfp" />
      <div className="container">
        <CfpView />
      </div>
    </>
  );
};

export default CfpPage;
