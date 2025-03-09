import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

const IndexPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    return navigate(`/${new Date().getFullYear()}`);
  }, [navigate]);
};

export default IndexPage;
