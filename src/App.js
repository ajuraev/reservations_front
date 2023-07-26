import './App.css';
import Main from './Main';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import { useGoogleLogin } from '@react-oauth/google';
import api from './axiosConfig';
import { useDispatch, useSelector } from 'react-redux';
import { updateToken, updateUsers } from './reducers/rootSlice';
import { useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Button } from '@mui/material';

const theme = createTheme({
  typography: {
    fontFamily: [
      'Montserrat',
      'Roboto',
    ].join(','),
  },

  
});

function App() {
  const token = useSelector((state) => state.token);

  const dispatch = useDispatch();

  const timezone = 'Asia/Tashkent';

  dayjs.extend(utc)
  dayjs.extend(tz)
  dayjs.tz.setDefault(timezone);


  useEffect(() => {
    const retrievedToken = JSON.parse(localStorage.getItem('token'));

    console.log(retrievedToken)
    if (retrievedToken) {
      api.post('/verify/', retrievedToken)
      .then(response => {
        console.log(response)
        if (response.data.users) {
          console.log(response.data.users)
          dispatch(updateUsers(response.data.users))
          dispatch(updateToken(retrievedToken))
        }
      })
      .catch(error => console.error(`Error: ${error}`));
    
    } else {
      console.log('No token found in localStorage');
    }
  }, []);
  

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/contacts.other.readonly https://www.googleapis.com/auth/calendar.events',
    onSuccess: async (codeResponse) => {
        console.log(codeResponse);
        const tokens = await api.post(
            '/auth/google', {
                code: codeResponse.code,
            });

        console.log(tokens.data);

        api.post(`/user/emails/`,{
          'access_token': tokens.data.token,
          'client_id' : tokens.data.client_id,
          'refresh_token' : tokens.data.refresh_token,
          'client_secret' : tokens.data.client_secret
        })
        .then(response => {
          console.log(response.data.users)
          dispatch(updateUsers(response.data.users))
          dispatch(updateToken(tokens.data))
          localStorage.setItem('token', JSON.stringify(tokens.data));

        })
    },
    onError: errorResponse => console.log(errorResponse),
  });

  return (
    <ThemeProvider theme={theme}>
      <div className='App'>
        {token ? (
          <LocalizationProvider dateAdapter={AdapterDayjs} locale="en">
            <Main />
          </LocalizationProvider>
        ) : (
          <Box sx={{backgroundColor: 'rgba(0, 0, 0, 0.6)', minHeight: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Button variant="contained" onClick={googleLogin}>Login</Button>
          </Box>
          )
        } 
      </div>
    </ThemeProvider>
)

}

export default App;
