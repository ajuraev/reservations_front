import * as React from 'react';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { useSelector, useDispatch } from 'react-redux';
import { updateNewResInfo } from './reducers/rootSlice';
import { useState } from 'react';

function AutoComplete({setInvalidEmails}) {
    const users = useSelector((state) => state.users)
    const newResInfo = useSelector((state) => state.newResInfo)
    const dispatch = useDispatch();

    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // check if email is valid
    const isEmailValid = (email) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    const handleChange = (event, newValue) => {

        setError(false);
        setInvalidEmails(false)
        setErrorMessage("");

        for (let email of newValue) {
            if (!isEmailValid(email)) {
                setError(true);
                setInvalidEmails(true)
                setErrorMessage("Invalid Email");
                break; // exit the loop once we find an invalid email
            }
        }

        dispatch(updateNewResInfo({
            ...newResInfo,
            participants: newValue
          }))
    }

 
    return (
        <Autocomplete
            multiple
            id="tags-filled"
            options={users.map((option) => option.Email)}
            freeSolo
            onChange={handleChange}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
            }
            renderInput={(params) => (
            <TextField
                {...params}
                error={error}
                helperText={errorMessage}
                variant="filled"
                label="Participants"
                placeholder="New Participant"
            />
            )}
        />
    )
}

export default AutoComplete