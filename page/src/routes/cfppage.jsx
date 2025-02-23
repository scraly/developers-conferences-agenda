import Filters from 'components/Filters/Filters';
import CfpView from 'components/CfpView/CfpView';
import {useParams} from 'react-router-dom';

const CfpPage = () => {
  return (
    <>
      <Filters view="cfp" />
      <CfpView />
    </>
  );
};

export default CfpPage;
