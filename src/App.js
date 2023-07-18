import './App.css';
import Main from './Main';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import axios from 'axios';

function App() {

  return (
    <div className='App'>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Main />
      </LocalizationProvider>
    </div>
  );
}

export default App;
