import React, { useState, useCallback, useMemo } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import api from './axiosConfig';
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css';


function DialogForm({open, setOpen, reservInfo, setReserveInfo, setReservations, reservations, showCalendar, setShowCalendar}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

  
    const localizer = momentLocalizer(moment, { moment: (date) => moment.tz(date, 'Asia/Tashkent') });

    const minTime = new Date();
    minTime.setHours(8, 0, 0); // Set the minimum time to display (e.g., 8:00 AM)

    const maxTime = new Date();
    maxTime.setHours(20, 0, 0); // Set the maximum time to display (e.g., 6:00 PM)

    const handleClose = () => {
        setTitle('')
        setDescription('')
        setOpen(false);
    };
  
    const createReservation = async (info) => {
        try {
            const response = await api.post("/reservations/", info , {
                headers: {
                'Content-Type': 'application/json',
                },
        });
    
        if (response.status === 200) {
            const data = await response.data;
            console.log("Reservation created successfully");
            console.log("Reservation ID:", data.reservation);
            setReservations((prevReservations) => [...prevReservations, data.reservation]);
            handleClose();
        } else {
        console.error("Reservation creation failed");
        }
    } catch (error) {
        console.error('Error creating reservation:', error);
    }
    }

    const handleSubmit = async () => {
      // Handle form submission logic


        if(!title || !description) return
        
        console.log(reservInfo)
        createReservation({
            room_id: reservInfo.room_id,
            from_time: reservInfo.from_time,
            to_time: reservInfo.to_time,
            reservation_date: reservInfo.reservation_date,
            title: title,
            description: description
        })
        

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

    const handleSelectSlot = ({ start, end }) => {
            // const title = window.prompt('New Event name')
            // const desc = window.prompt('Description')

            const today = new Date(start);
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;


            //setReserveInfo([...reservInfo, {from_time: start, to_time: end, reservation_date: formattedDate}])
            setReserveInfo((prevReservInfo) => ({
                ...prevReservInfo,
                from_time: (new Date(start)).toString(),
                to_time: (new Date(end)).toString(),
                reservation_date: formattedDate,
            }));

            setShowCalendar(false)
            // if (title) {
            //     console.log(reservInfo)
            //     createReservation({
            //         room_id: reservInfo.room_id,
            //         from_time: start,
            //         to_time: end,
            //         reservation_date: formattedDate,
            //         title: title,
            //         description: desc
            //     })
            //     //setEvents((prev) => [...prev, { start, end, title }])
            // }
        }
      
    
      const handleSelectEvent = useCallback(
        (event) => window.alert(event.title),
        []
      )
    
      const { defaultDate, scrollToTime } = useMemo(
        () => ({
          defaultDate: new Date(2015, 3, 12),
          scrollToTime: new Date(1970, 1, 1, 6),
        }),
        []
      )
  
    return (
      <div>
        <Dialog open={open} onClose={handleClose}
            maxWidth={showCalendar ? "100vw" : '50vw'}
            PaperProps={{
                style: {
                width: showCalendar ? '80vw' : '40vw', // Set the desired width
                height: showCalendar ? '100vh' : '40vh', // Set the desired height
                },
            }}
        >
            {showCalendar ? (
                <Calendar
                localizer={localizer}
                events={mapReserves()}
                min={minTime}
                max={maxTime}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                scrollToTime={scrollToTime}
                style={{ height: '100%', width: '100%' }}
              />
            ) : (
                <div>
                    <DialogTitle>Meeting Description</DialogTitle>
                    <DialogContent>
                        <TextField
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        margin="normal"
                        />
                        <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleSubmit} color="primary">Submit</Button>
                    </DialogActions>
                </div>
            )}    
        </Dialog>
      </div>
    );
  }
  
  export default DialogForm