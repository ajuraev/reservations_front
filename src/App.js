import './App.css';
import Main from './Main';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'

function App() {

  // Set the desired timezone
const timezone = 'Asia/Tashkent';

// Configure dayjs with the timezone
dayjs.extend(utc)
dayjs.extend(tz)
dayjs.tz.setDefault(timezone);
  
  return (
    <div className='App'>
      <LocalizationProvider dateAdapter={AdapterDayjs} locale="en">
        <Main />
      </LocalizationProvider>
    </div>
  );
}

export default App;
