'use client'
import Timeline, {  TimelineHeaders } from 'react-calendar-timeline'
import 'react-calendar-timeline/style.css'
import '@/public/timeline.css'
import moment from 'moment'

const groups = [{ id: 1, title: 'group 1' }, { id: 2, title: 'group 2' }]

var items = [
  {
    id: 1,
    group: 1,
    title: 'item 1',
    start_time: moment().add(0, 'days').valueOf(),
    end_time: moment().add(2, 'days').valueOf()
  },
  {
    id: 2,
    group: 2,
    title: 'item 2',
    start_time: moment().add(-5, 'days').valueOf(),
    end_time: moment().add(40, 'days').valueOf()
  },
  {
    id: 3,
    group: 1,
    title: 'item 3',
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