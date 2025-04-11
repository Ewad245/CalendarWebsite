import React, { useEffect, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { EventInput } from '@fullcalendar/core'
import { User } from '../src/interfaces/type'


const CalendarComponent: React.FC = () => {

    const [events, setEvents] = useState<EventInput[]>();
    const [nameOfUsers, setNameOfUsers] = useState<string[]>();

    useEffect(() => {
        // async function getEvents() {
        //     const response = await fetch('https://localhost:7179/api/DataOnly_APIaCheckIn');
        //     if (response.ok) {
        //         const data = await response.json();

        //         const eventList: EventInput[] = [];

        //         data.forEach((item: User) => {
        //             const adjustedStart = new Date(item.inAt);
        //             adjustedStart.setHours(adjustedStart.getHours() + 7);

        //             const adjustedEnd = new Date(item.outAt);
        //             adjustedEnd.setHours(adjustedEnd.getHours() + 7);

        //             eventList.push({
        //                 id: item.id?.toString(),
        //                 title: "Giờ vào",
        //                 start: adjustedStart,
        //                 extendedProps: {
        //                     description: 'Vào lúc: ' + adjustedStart.toString()
        //                 },
        //                 className: "bg-green-500 text-black rounded px-2"
        //             });

        //             eventList.push({
        //                 id: item.id?.toString() + '-out',
        //                 title: "Giờ ra",
        //                 start: adjustedEnd,
        //                 extendedProps: {
        //                     description: 'Ra lúc: ' + adjustedEnd.toString()
        //                 },
        //                 className: "bg-red-300 text-black rounded px-2"
        //             });
        //         });

        //         setEvents(eventList);

        //     }
        // }
        // getEvents();
        async function getAllUserName() {
            const response = await fetch('https://localhost:7179/api/DataOnly_APIaCheckIn/GetAllUsersName');
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setNameOfUsers(data);
            }
        }
        getAllUserName();
    }, []);

    async function findUserById(): Promise<void> {
        const userId = document.getElementById('userIdField') as HTMLSelectElement;
        const selectedValue: string = userId.value;
        const valueBeforeDash = selectedValue.split('-')[0];
        const response = await fetch('https://localhost:7179/api/DataOnly_APIaCheckIn/GetUserByUserId?userId=' + valueBeforeDash);
        if (response.ok) {
            const data = await response.json();

            const eventList: EventInput[] = [];

            data.forEach((item: User) => {
                const adjustedStart = new Date(item.inAt);
                adjustedStart.setHours(adjustedStart.getHours() + 7);

                const adjustedEnd = new Date(item.outAt);
                adjustedEnd.setHours(adjustedEnd.getHours() + 7);

                eventList.push({
                    id: item.id?.toString(),
                    title: "Giờ vào",
                    start: adjustedStart,
                    extendedProps: {
                        description: 'Vào lúc: ' + adjustedStart.toString()
                    },
                    className: "bg-green-500 text-black rounded px-2"
                });

                eventList.push({
                    id: item.id?.toString() + '-out',
                    title: "Giờ ra",
                    start: adjustedEnd,
                    extendedProps: {
                        description: 'Ra lúc: ' + adjustedEnd.toString()
                    },
                    className: "bg-red-400 text-black rounded px-2"
                });
            });

            setEvents(eventList);

        }
    }


    return (
        <div>
            <>
                <select id='userIdField' className="mb-6 border-2 border-gray-300 rounded-2xl p-2 bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-200">
                    {nameOfUsers?.map((item) =>
                        <option>{item}</option>
                    )}
                </select>
                <button onClick={findUserById} className='ml-2 bg-sky-500 hover:bg-sky-700 pt-2 pb-2 pl-4 pr-4 cursor-pointer rounded-2xl text-amber-50'>Find</button>
            </>
            { events?.length ?
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                    }}

                    editable={true}
                    locale="vi"
                    events={events}
                    eventDidMount={function (info) {
                        const tooltip = document.createElement('div');
                        tooltip.innerHTML = info.event.extendedProps.description; // Show description
                        tooltip.style.position = 'absolute';

                        tooltip.style.backgroundColor = 'transparent';
                        tooltip.style.marginTop = '2%'
                        tooltip.style.padding = '5px';
                        tooltip.style.border = '1px solid black';
                        tooltip.style.borderRadius = '5px'
                        tooltip.style.display = 'none'; // Initially hidden

                        info.el.addEventListener('mouseover', () => {
                            tooltip.style.display = 'block';
                            tooltip.style.left = `${info.el.getBoundingClientRect().left}px`;
                            tooltip.style.top = `${info.el.getBoundingClientRect().top - tooltip.offsetHeight}px`;
                            document.body.appendChild(tooltip);
                        });

                        info.el.addEventListener('mouseout', () => {
                            tooltip.style.display = 'none';
                            if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
                        });
                    }}
                /> 
                : <p>Please choose one person</p> 
            }

        </div>
    );
};

export default CalendarComponent;
