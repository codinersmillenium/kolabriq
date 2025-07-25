'use client'
import Timeline, {  TimelineHeaders } from 'react-calendar-timeline'
import 'react-calendar-timeline/style.css'
import '@/public/timeline.css'
import moment from 'moment'

const groups = [{ id: 1, title: 'Burhan Armain' }, { id: 2, title: 'Muh Hisyam' }]

var items = [
  {
    id: 1,
    group: 1,
    title: 'Analisa system',
    start_time: moment().add(0, 'days').valueOf(),
    end_time: moment().add(8, 'days').valueOf()
  },
  {
    id: 2,
    group: 2,
    title: 'Create core App',
    start_time: moment().add(-5, 'days').valueOf(),
    end_time: moment().add(40, 'days').valueOf()
  },
  {
    id: 3,
    group: 1,
    title: 'Design UI/UX',
    start_time: moment().add(-5, 'days').valueOf(),
    end_time: moment().add(-2, 'days').valueOf()
  }
]

export const ScheduleTimeline = () => {
    const defaultTimeStart: any = moment().add(0, 'days').valueOf()
    const defaultTimeEnd: any = moment().add(31, 'days').valueOf()
    return (
        <div>
            <Timeline
            groups={groups}
            items={items}
            defaultTimeStart={defaultTimeStart}
            defaultTimeEnd={defaultTimeEnd}
            />
        </div>
    )
}