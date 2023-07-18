import { Button, Box, Alert } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useState, useEffect, useRef } from 'react';
import api from './axiosConfig';



function Main() {
    const [roomId, setRoomId] = useState('1');
    const [showAlert, setShowAlert] = useState(false);
    const [alertText, setAlertText] = useState('');
    const [reservations, setReservations] = useState([])
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);


    useEffect(() => {
        api.get(`/reservations/${roomId}`)
            .then((response) => response.data)
            .then((data) => {
                console.log(data); // Process the retrieved reservations data
                setReservations(data)
            })
            .catch((error) => {
            console.error("Error fetching room reservations:", error);
            });
    }, []);


    const isTimeRangeAvailable = (startTime, endTime) => {
        // Check if startTime is before endTime
        if (startTime >= endTime) {
            setAlertText('Please select a valid time range')
            setShowAlert(true)
            return false; // Invalid time range
        }
        // Iterate through each existing reservation
        for (const reservation of reservations) {
            const reservationStartTime = new Date(reservation.from_time);
            const reservationEndTime = new Date(reservation.to_time);
        
            // Check for overlap condition
            if (
            (startTime >= reservationStartTime && startTime < reservationEndTime) ||
            (endTime > reservationStartTime && endTime <= reservationEndTime) ||
            (startTime <= reservationStartTime && endTime >= reservationEndTime)
            ) {
            setAlertText('This time range has already been reserved')
            setShowAlert(true)
            return false; // Overlap detected, time range is not available
            }
        }
        
        setShowAlert(false)
        return true; // No overlap detected, time range is available
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');

        const formattedDate = `${year}/${month}/${day}`;

        //console.log(isTimeRangeAvailable(startTime.$d,endTime.$d))

        if(!startTime || !endTime){
            setAlertText('Please select a valid time range')
            setShowAlert(true)
            return
        }
        if(!isTimeRangeAvailable(startTime.$d,endTime.$d)) return

        console.log(startTime.$d.getHours().toString())

        try {
            const response = await api.post("/reservations/", {
                room_id: roomId,
                from_time: startTime.$d.toString(),
                to_time: endTime.$d.toString(),
                reservation_date: formattedDate,
                }, {
                headers: {
                'Content-Type': 'application/json',
                },
            });
        
            if (response.status === 200) {
                const data = await response.data;
                console.log("Reservation created successfully");
                console.log("Reservation ID:", data.reservation);
                setReservations((prevReservations) => [...prevReservations, data.reservation]);
            } else {
            console.error("Reservation creation failed");
            }
        } catch (error) {
            console.error('Error creating reservation:', error);
        }
    };

    const ReservedTimes = () => {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                {reservations.map((reservation) => (
                    <p key={reservation.id}>
                        {String(new Date(reservation.from_time).getHours()).padStart(2, '0')}:
                        {String(new Date(reservation.from_time).getMinutes()).padStart(2, '0')} - 
                        {String(new Date(reservation.to_time).getHours()).padStart(2, '0')}:
                        {String(new Date(reservation.to_time).getMinutes()).padStart(2, '0')}
                    </p>                
                ))}
            </Box>
        )
    }
    
    const CustomDate = () => {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const today = new Date().toLocaleDateString('en-US', options);

        return <h4>{today}</h4>
    }

    return (
        <Box sx={{minHeight: '100%', width: '100%', display: 'flex'}}>
            <Box sx={{height: '100%', width: '80%'}}>
                <h2>Today</h2>
                <CustomDate />
                <h4>Room #1</h4>
                <h4>Reserved Times</h4>
                <ReservedTimes />
            </Box>
            <Box sx={{width: '20%'}}>
                <h4>New reservation</h4>
                <p>Start</p>
                <TimePicker
                    value={startTime}
                    onChange={(newValue) => setStartTime(newValue)}
                    clearable
                    ampm={false}
                    label="24 hours" 
                />
                <p>End</p>
                <TimePicker
                    value={endTime}
                    onChange={(newValue) => setEndTime(newValue)}
                    clearable
                    ampm={false}
                    label="24 hours"
                    
                />
                <Button onClick={handleSubmit}>Reserve</Button>
                {showAlert ? <Alert severity="error">{alertText}</Alert> : null}
            </Box>
        </Box>
    );
  }
  
  export default Main;