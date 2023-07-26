import { Button, Box, Alert, TextField, Stack, Backdrop, CircularProgress, Typography, createTheme } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useState, useEffect, useRef } from 'react';
import DialogForm from './DialogForm'
import api from './axiosConfig';
import dayjs from 'dayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useSelector, useDispatch } from 'react-redux';
import { updateIsLoading, updateReservations, updateNewResInfo } from './reducers/rootSlice';

function Main() {
    const [roomId, setRoomId] = useState('2');
    const [showAlert, setShowAlert] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false)
    const [alertText, setAlertText] = useState('');
    //const [reservations, setReservations] = useState([])
    //const [reservInfo, setReservInfo] = useState({});
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    const reservations = useSelector((state) => state.reservations);
    const users = useSelector((state) => state.users);
    const isLoading = useSelector((state) => state.isLoading);


    const dispatch = useDispatch();
    


    useEffect(() => {

        dispatch(updateIsLoading(true))
        api.get(`/reservations?room_id=${roomId}`)
            .then((response) => response.data)
            .then((data) => {
                console.log(data); // Process the retrieved reservations data
                //setReservations(data)
                dispatch(updateReservations(data));
                dispatch(updateIsLoading(false))
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
                setAlertText('This time range has already been reserved')
                setShowAlert(true)
                return false; // Overlap detected, time range is not available
            }
        }
        
        setShowAlert(false)
        return true; // No overlap detected, time range is available
    };

    const formattedDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        //console.log(isTimeRangeAvailable(startTime.$d,endTime.$d))

        if(!startTime || !endTime){
            setAlertText('Please select a valid time range')
            setShowAlert(true)
            return
        }
        if(!isTimeRangeAvailable(startTime.$d,endTime.$d)) return

        console.log(startTime.$d.getHours().toString())

        dispatch(updateNewResInfo({
            room_id: roomId,
            from_time: startTime.$d.toString(),
            to_time: endTime.$d.toString(),
            reservation_date: formattedDate(new Date()),
        }));

        // setReservInfo({
        //     room_id: roomId,
        //     from_time: startTime.$d.toString(),
        //     to_time: endTime.$d.toString(),
        //     reservation_date: formattedDate(new Date()),
        // })
        setShowCalendar(false)
        setOpenDialog(true)
        
    };

    const ReservedTimes = () => {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                {reservations.filter((reservation) => reservation.date == formattedDate(new Date())).map((reservation) => (
                    <Typography>
                        <h3 style={{marginRight: '3vw'}} key={reservation.id}>
                            {String(new Date(reservation.from_time).getHours()).padStart(2, '0')}:
                            {String(new Date(reservation.from_time).getMinutes()).padStart(2, '0')}
                            {' - '}  
                            {String(new Date(reservation.to_time).getHours()).padStart(2, '0')}:
                            {String(new Date(reservation.to_time).getMinutes()).padStart(2, '0')}
                        </h3>   
                    </Typography>             
                ))}
            </Box>
        )
    }
    
    const CustomDate = () => {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const today = new Date().toLocaleDateString('en-US', options);

        return <Typography><h2>{today}</h2></Typography>
    }

    const handleCalendarClick = () => {
        // setReservInfo({
        //     room_id: roomId
        // })
        dispatch(updateNewResInfo({
            room_id: roomId
        }))

        setOpenDialog(true)
        setShowCalendar(true)
    }

    return (
        <Box sx={{backgroundColor: 'rgba(0, 0, 0, 0.6)', minHeight: '100%', width: '100%', display: 'flex'}}>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isLoading}
                >
                <CircularProgress color="inherit" />
            </Backdrop>
            <DialogForm showCalendar={showCalendar} setShowCalendar={(show) => setShowCalendar(show)} open={openDialog} setOpen={(newOpen) => setOpenDialog(newOpen)}/>
            <Box sx={{height: '100%', width: '70%', marginLeft: '1vw' }}>
                <Stack direction="row">
                    <Button onClick={handleCalendarClick} sx={{ p: '0px', m: '0px' }}>
                        <CalendarMonthIcon sx={{ fontSize: 160 }} />
                    </Button>
                    <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                        <Typography><h3>Today</h3></Typography>
                        <CustomDate />
                    </Box>
                </Stack>
                <Box sx={{position: 'absolute', bottom: '5vh'}}>
                        <Typography><h2>Conference Room #1</h2></Typography>
                        <Typography><h2>Reserved Times</h2></Typography>
                        <ReservedTimes />
                </Box>   
            </Box>
            <Box sx={{width: '30%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <Typography><h3>New reservation</h3></Typography>
                <Stack>
                    <Typography><p>Start</p></Typography>
                    <TimePicker
                        value={startTime}
                        onChange={(newValue) => setStartTime(newValue)}
                        clearable
                        ampm={false}
                        minTime={dayjs().hour(8).minute(0)}
                        maxTime={dayjs().hour(20).minute(0)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                sx={{
                                  svg: { color: '#fff' },
                                  input: { color: 'white' },
                                }}
                             />
                         )}

                    />
                    <Typography><p>End</p></Typography>
                    <TimePicker
                        value={endTime}
                        onChange={(newValue) => setEndTime(newValue)}
                        clearable
                        ampm={false}
                        minTime={dayjs().hour(8).minute(0)}
                        maxTime={dayjs().hour(20).minute(0)}
                    />
                    <Button variant="outlined" sx={{mt: '3vh'}}onClick={handleSubmit}>Reserve</Button>
                    {showAlert ? <Alert sx={{mt: '3vh'}} severity="error">{alertText}</Alert> : null}
                </Stack>       
            </Box>
        </Box>
    );
  }
  
  export default Main;