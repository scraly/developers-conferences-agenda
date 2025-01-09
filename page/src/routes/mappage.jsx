import Filters from "components/Filters/Filters";
import MapView from "components/MapView/MapView";
import YearSelector from "components/YearSelector/YearSelector";
import { createSearchParams, useNavigate, useParams, useSearchParams } from "react-router-dom";

export function MapPage() {
    const {year} = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    return (
        <div className="dcaGrid">
          <Filters
            view="map"
          />
          <div className="dcaContent">
            <YearSelector
              isMap={true}
              year={parseInt(year, 10)}
              onChange={year => {
                navigate(`/${year}/map?${createSearchParams(searchParams)}`);
              }}

              view="map"
            />

            <MapView year={year} />
        </div>
      </div>
    );
}