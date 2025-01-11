import Filters from "components/Filters/Filters";
import MapView from "components/MapView/MapView";
import YearSelector from "components/YearSelector/YearSelector";
import { createSearchParams, useNavigate, useParams, useSearchParams } from "react-router-dom";

export const MapPage = () => {
    const {year} = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    return (
        <div className="dcaGrid">
          <Filters/>
          <div className="dcaContent">
            <YearSelector
              isMap={true}
              onChange={year => {
                navigate(`/${year}/map?${createSearchParams(searchParams)}`);
              }}
              view="map"

              year={parseInt(year, 10)}
            />

            <MapView year={year} />
        </div>
      </div>
    );
}