import Filters from 'components/Filters/Filters'
import CfpCompanionView from 'components/CfpCompanionView/CfpCompanionView'
import YearSelector from 'components/YearSelector/YearSelector'
import { createSearchParams, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useCfpCompanionEvents } from 'app.hooks'

export const CfpCompanionPage = () => {
  const { year } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const events = useCfpCompanionEvents()

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

        <CfpCompanionView events={events} />
      </div>
    </div>
  )
}