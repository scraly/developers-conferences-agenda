import Filters from "components/Filters/Filters";
import CfpView from "components/CfpView/CfpView";
import YearSelector from "components/YearSelector/YearSelector";
import { createSearchParams, useNavigate, useParams, useSearchParams } from "react-router-dom";

export function CfpPage() {
    const {year} = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    return (
        <div className="dcaGrid">
          <Filters
            view="cfp"
          />
          <div className="dcaContent">
            <YearSelector
              isMap={false}
              year={parseInt(year, 10)}
              onChange={year => {
                navigate(`/${year}/cfp?${createSearchParams(searchParams)}`);
              }}
              view="cfp"
            />

            <CfpView year={year} />
        </div>
      </div>
    );
}