import {useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

const YearPage = () => {
  const {year} = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    return navigate(`/${year}/calendar`);
  }, [navigate, year]);
};

export default YearPage;
