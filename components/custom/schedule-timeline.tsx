'use client'
import Timeline, { TimelineHeaders } from 'react-calendar-timeline'
import 'react-calendar-timeline/style.css'
import '@/public/timeline.css'
import moment from 'moment'
import { Button } from '../ui/button'
import DialogUi from '../ui/dialog'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Plus } from 'lucide-react'
import { Input } from '../ui/input'
import { initActor } from '@/lib/canisters'

export const ScheduleTimeline = () => {
    const [groups, setGroups] = useState<any[]>([]);
    const [timelines, setTimelines] = useState<any[]>([]);
    const [idProject, setIdProject] = useState<any>(null)
    const [isDialogOpen, setDialogOpen] = useState<boolean>(false)
    const [formData, setFormData]: any = useState({
        title: '',
        startDate: '',
        endDate: '',
    })

    const defaultTimeStart: any = moment().add(0, 'days').valueOf()
    const defaultTimeEnd: any = moment().add(31, 'days').valueOf()

    const getTimeline = async (id: any) => {
        const actorProject_ = await initActor('project')
        const dataTimeline = await actorProject_.getProjectTimelines(parseFloat(id))
        console.log(dataTimeline);

        const newGroups: any[] = [];
        const newTimelines: any[] = [];
        
        dataTimeline.ok.forEach((tl: any, index: number) => {
            const groupId = index + 1;

            newGroups.push({
                id: groupId,
                title: tl.title 
            });

            newTimelines.push({
                id: groupId,
                group: groupId,
                start_time: moment(Number(tl.startDate)).valueOf(),
                end_time: moment(Number(tl.endDate)).valueOf()
            });
        });
        setGroups(newGroups);
        setTimelines(newTimelines);
    }
    useEffect(() => {
        const id: any = localStorage.getItem('project_id')
        setIdProject(id)
        getTimeline(id)
    }, [])
    const handleChange = (e: any) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }
    const handleDate = (date: any): number => {
        const [year, month, day] = date.split('-').map(Number)
        const newDate = new Date(year, month - 1, day)
        return newDate.getTime()
    }
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            formData.startDate = handleDate(formData.startDate)
            formData.endDate = handleDate(formData.endDate)

            const actor = await initActor('project')
            await actor.createTimeline(parseFloat(idProject), formData)
            alert('Success Create Timeline...')
            getTimeline(idProject)
        } catch (error) {
            console.log(error);
            
            alert('Failed Register User...');
        }
    }


    return (
        <div className='bg-white rounded-lg mt-5 p-2'>
            <Button variant={'black'} onClick={() => setDialogOpen(true)} className='mb-2'>
                <Plus />
                Add Timeline
            </Button>
            <DialogUi open={isDialogOpen} onOpenChange={setDialogOpen} title='Timeline'
                content={
                    <Card>
                        <CardHeader className="space-y-1.5 rounded-t-lg border-b border-gray-300 bg-gray-100 px-5 py-4 text-base/5 font-semibold text-black">
                            <h3>Add New Timeline Event</h3>
                            <p className="text-sm/tight font-medium text-gray-700">
                                Fill out the details below to create a new event in the project timeline.
                            </p>
                        </CardHeader>
                        <CardContent className='max-h-[60vh] overflow-auto'>
                            <form className="space-y-5 p-3" onSubmit={handleSubmit}>
                                <div className="space-y-2.5">
                                    <label className="block font-semibold leading-tight text-black">
                                        Title
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Design Prototype.."
                                        name='title'
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block font-semibold leading-tight text-black">
                                        Date Start
                                    </label>
                                    <Input
                                        type="date"
                                        name='startDate'
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block font-semibold leading-tight text-black">
                                        Date End
                                    </label>
                                    <Input
                                        type="date"
                                        name='endDate'
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <Button
                                        variant={'outline-general'}
                                        size={'large'}
                                        onClick={() => setDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant={'black'}
                                        size={'large'}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                }
            />
            <Timeline
                className='rounded-lg overflow-hidden'
                groups={groups}
                items={timelines}
                defaultTimeStart={defaultTimeStart}
                defaultTimeEnd={defaultTimeEnd}
            />
        </div>
    )
}