import React, { useState, useCallback, useMemo } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, Backdrop, CircularProgress, DialogActions, TextField } from '@mui/material';
import api from './axiosConfig';
import Calendar from './Calendar';
import { useSelector, useDispatch } from 'react-redux';
import { updateIsLoading, updateNewResInfo, updateReservations, addToReservations } from './reducers/rootSlice';
import AutoComplete from './AutoComplete';

function DialogForm({open, setOpen, showCalendar, setShowCalendar}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [invalidEmails, setInvalidEmails] = useState(false)

    const reservations = useSelector((state) => state.reservations);
    const newResInfo = useSelector((state) => state.newResInfo)
    const isLoading = useSelector((state) => state.isLoading)

    const token = useSelector((state) => state.token)

    const dispatch = useDispatch();


    const handleClose = () => {
        setTitle('')
        setDescription('')
        dispatch(updateNewResInfo({
          room_id: newResInfo.room_id
        }))
        //setShowCalendar(true)
        setOpen(false);
    };

    const handleCloseButton = () => {
      setTitle('')
      setDescription('')
      dispatch(updateNewResInfo({
        room_id: newResInfo.room_id
      }))
      setShowCalendar(true)
      //setOpen(false);
  };
  
    const createReservation = async (info) => {
      try {
        dispatch(updateIsLoading(true))
        const response = await api.post("/reservations/", info , {
            headers: {
            'Content-Type': 'application/json',
            },
        });
  
        if (response.status === 200) {
            const data = await response.data;
            console.log("Reservation created successfully");
            console.log("Reservation ID:", data.reservation);
            //setReservations((prevReservations) => [...prevReservations, data.reservation]);
            dispatch(addToReservations(data.reservation));
            dispatch(updateIsLoading(false))

            handleClose();
        } else {
          dispatch(updateIsLoading(false))
          console.error("Reservation creation failed");
        }
    } catch (error) {
      dispatch(updateIsLoading(false))
      console.error('Error creating reservation:', error);
      }
    }

    const handleSubmit = async () => {
      // Handle form submission logic
        if(!title || !description || invalidEmails) return
        
        console.log(newResInfo)
        createReservation({
            room_id: newResInfo.room_id,
            from_time: newResInfo.from_time,
            to_time: newResInfo.to_time,
            reservation_date: newResInfo.reservation_date,
            participants: newResInfo.participants ? newResInfo.participants : [],
            title: title,
            description: description,
            access_token: token 
        })
        

    };

    return (
      <div>
        <Dialog open={open} onClose={handleClose}
            maxWidth={showCalendar ? "100vw" : '50vw'}
            PaperProps={{
                style: {
                maxWidth: showCalendar ? null : '50vw',
                width: showCalendar ? '80vw' : null, // Set the desired width
                height: showCalendar ? '100vh' : null, // Set the desired height
                },
            }}
        >
            {showCalendar ? (
                <Calendar setShowCalendar={setShowCalendar}/>
            ) : (
                <div>
                  <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={isLoading}
                    >
                    <CircularProgress color="inherit" />
                  </Backdrop>
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
                      <AutoComplete setInvalidEmails={setInvalidEmails}/>
                  </DialogContent>
                  <DialogActions>
                      <Button onClick={handleCloseButton}>Cancel</Button>
                      <Button onClick={handleSubmit} color="primary">Submit</Button>
                  </DialogActions>
                </div>
            )}    
        </Dialog>
      </div>
    );
  }
  
  export default DialogForm