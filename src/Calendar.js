import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment'
import { useSelector, useDispatch } from 'react-redux';
import React, { useCallback, useState, useEffect,  useMemo } from 'react';
import { DialogTitle, DialogContent, TextField, Button, DialogActions, Dialog, Typography } from '@mui/material';

import { updateNewResInfo, updateReservations, addToReservations } from './reducers/rootSlice';

const MyCustomToolbar = ({ date, view, views, label, onView, onNavigate }) => {
    
  
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Custom toolbar buttons on the left */}
        <div>
          <button onClick={() => onNavigate('TODAY')}>Today</button>
          <button onClick={() => onNavigate('PREV')}>Back</button>
          <button onClick={() => onNavigate('NEXT')}>Next</button>
        </div>
  
        {/* Display the current date and view label in the center */}
        <span>{label}</span>
  
        {/* Custom toolbar buttons on the right */}
        <div>
          {/* Add any other custom buttons you want on the right side */}
          {/* For example, you can have a button for creating events or other actions */}
        </div>
  
        {/* Navigation buttons */}
        <div>
          <button onClick={() => onView(Views.MONTH)}>Month</button>
          <button onClick={() => onView(Views.WEEK)}>Week</button>
          <button onClick={() => onView(Views.DAY)}>Day</button>
        </div>
        
      </div>
    );
  };
  

function MyCalendar({setShowCalendar}) {
    const [currentView, setCurrentView] = useState(Views.MONTH);
    const [date, setDate] = useState(null)
    const [showEvent, setShowEvent] = useState(false)
    const [selectedRes, setSelectedRes] = useState(null)
    const localizer = momentLocalizer(moment, { moment: (date) => moment.tz(date, 'Asia/Tashkent') });
    const reservations = useSelector((state) => state.reservations);
    const newResInfo = useSelector((state) => state.newResInfo)
    const dispatch = useDispatch();

    const formattedDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
    
    const isTimeRangeAvailable = (startTime, endTime) => {
        // Check if startTime is before endTime
        if (startTime >= endTime) {
            //setAlertText('Please select a valid time range')
            //setShowAlert(true)
            return false; // Invalid time range
        }

        const startDate = formattedDate(new Date(startTime))


        // Iterate through each existing reservation
        for (const reservation of reservations) {
            const reservationStartTime = new Date(reservation.from_time);
            const reservationEndTime = new Date(reservation.to_time);
            
            if(reservation.date != startDate){
                continue
            }
            // Check for overlap condition
            if (
            (startTime >= reservationStartTime && startTime < reservationEndTime) ||
            (endTime > reservationStartTime && endTime <= reservationEndTime) ||
            (startTime <= reservationStartTime && endTime >= reservationEndTime)
            ) {
                //setAlertText('This time range has already been reserved')
                //setShowAlert(true)
                return false; // Overlap detected, time range is not available
            }
        }
        
        //setShowAlert(false)
        return true; // No overlap detected, time range is available
    };

    const mapReserves  = () => {
        console.log(reservations)
        const edited = reservations.map(reservation => ({
            id: reservation.id,
            title: reservation.title,
            start: new Date(reservation.from_time),
            end: new Date(reservation.to_time)
          }));

          console.log(edited)
          return edited
    }

    const handleNavigate = (action) => {
        // Handle navigation actions like "PREV", "NEXT", "TODAY"
        // and update the date state accordingly
        //const newDate = Navigate[action](date, view, views);
        //onNavigate(newDate);
        setDate(action)
      };

    const handleSelectSlot = ({ start, end }) => {
        if (currentView === Views.MONTH) {
            setDate(start)

            setCurrentView(Views.DAY);
            // You can also scroll to the selected time within the day view
            // by passing the start time of the selected slot to the scrollToTime prop
        } else {
            if(!isTimeRangeAvailable(new Date(start),new Date(end))){
                return
            }

            // Handle slot selection in the week or day view
            const today = new Date(start);
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;

            dispatch(updateNewResInfo({
              ...newResInfo,
              from_time: (new Date(start)).toString(),
              to_time: (new Date(end)).toString(),
              reservation_date: formattedDate,
            }))

            setShowCalendar(false)
            //console.log('Slot selected:', start, end);
        }
    }
      
    const findRes = (event) => {
        const reservation = reservations.find(res => res.id === event.id);

        if (reservation) {
            return reservation
        } else {
            console.log(`Reservation with id ${event.id} not found.`);
        }
    }
    const handleEventClose = () => {
        setShowEvent(false);
    };

    const handleViewChange = (view) => {
        setCurrentView(view);
    };

    const handleSelectEvent = (event) => {
        // Handle event selection here
        console.log('Event selected:', event);
        setSelectedRes(findRes(event))
        setShowEvent(true)
    };

    const formattedRange = (from_time, to_time) => {
        return `${String(new Date(from_time).getHours()).padStart(2, '0')}:${String(new Date(from_time).getMinutes()).padStart(2, '0')} - ${String(new Date(to_time).getHours()).padStart(2, '0')}:${String(new Date(to_time).getMinutes()).padStart(2, '0')}`;
    }
    

    const Participants = ({reservation}) => {
        console.log(reservation)
        if (reservation.participants && reservation.participants.length > 0) {
            return (
                <div>
                    {reservation.participants.map((participant, index) => 
                        <Typography><p key={index}>{participant.email}</p></Typography>
                    )}
                </div>
            );
        } else {
            return <Typography><h5>No participants</h5></Typography>
        }
    }

        return (
            <div style={{minHeight: '100%'}}>
                    <Calendar
                        localizer={localizer}
                        events={mapReserves()}
                        min={new Date().setHours(8,0,0)}
                        max={new Date().setHours(20,0,0)}
                        onView={handleViewChange}
                        selectable
                        onSelectEvent={handleSelectEvent}
                        onSelectSlot={handleSelectSlot}
                        onNavigate={handleNavigate}
                        view={currentView} // Set the current view of the calendar
                        date={date}
                        components={{
                            // Use the custom toolbar component
                            toolbar: MyCustomToolbar,
                        }}
                        style={{ height: '100%', width: '100%' }}
                    />
                    {showEvent ? (
                        <Dialog open={showEvent} onClose={handleEventClose}
                            PaperProps={{
                                style: {
                                width: '40vw', 
                                height: '75vh', 
                                },
                            }}>
                            <DialogTitle>
                                <Typography><h4>Title: {selectedRes.title}</h4></Typography>
                                
                            </DialogTitle>
                            <DialogContent>
                                <Typography><h4>Date: {selectedRes.date}</h4></Typography>
                                <Typography><h4>Description: {selectedRes.description}</h4></Typography>
                                <Typography><h4>Time range: {formattedRange(selectedRes.from_time, selectedRes.to_time)}</h4></Typography>
                                <Typography><h4>Participants:</h4></Typography>
                                <Participants reservation={selectedRes}/>
                            </DialogContent>
                        </Dialog>
                    ) : null}
            </div>
        );
        
  }
  
  export default MyCalendar;