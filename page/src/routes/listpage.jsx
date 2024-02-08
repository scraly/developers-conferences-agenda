import Filters from "components/Filters/Filters";
import ListView from "components/ListView/ListView";
import ViewSelector from "components/ViewSelector/ViewSelector";
import YearSelector from "components/YearSelector/YearSelector";
import { createSearchParams, useNavigate, useParams, useSearchParams } from "react-router-dom";

export function ListPage() {
    const {year} = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    return (
        <div className="dcaGrid">
          <Filters/>
          <div className="dcaContent">
            <YearSelector
              isMap={false}
              year={parseInt(year, 10)}
              onChange={year => {
                navigate(`/${year}/list?${createSearchParams(searchParams)}`);
              }}
            />

            <ViewSelector selected={'list'}/>

            <ListView year={year} />
        </div>
      </div>
    );
}