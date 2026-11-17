import Filters from 'components/Filters/Filters'
import CfpCompanionView from 'components/CfpCompanionView/CfpCompanionView'
import YearSelector from 'components/YearSelector/YearSelector'
import { createSearchParams, useNavigate, useParams, useSearchParams } from 'react-router-dom'

export const CfpCompanionPage = () => {
  const { year } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  return (
    <div className="dcaGrid">
      <Filters view="cfp-companion" />
      <div className="dcaContent">
        <YearSelector
          isMap={false}
          onChange={nextYear => {
            navigate(`/${nextYear}/cfp-companion?${createSearchParams(searchParams)}`)
          }}
          view="cfp-companion"
          year={parseInt(year, 10)}
        />

        <CfpCompanionView />
      </div>
    </div>
  )
}