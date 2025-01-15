import Filters from "components/Filters/Filters";
import ListView from "components/ListView/ListView";
import YearSelector from "components/YearSelector/YearSelector";
import { createSearchParams, useNavigate, useParams, useSearchParams } from "react-router-dom";

export const ListPage = () => {
    const {year} = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    return (
        <div className="dcaGrid">
          <Filters/>
          <div className="dcaContent">
            <YearSelector
              isMap={false}
              onChange={year => {
                navigate(`/${year}/list?${createSearchParams(searchParams)}`);
              }}
              view="list"
              year={parseInt(year, 10)}
            />

            <ListView year={year} />
        </div>
      </div>
    );
}