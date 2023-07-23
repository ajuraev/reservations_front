// reducers/exampleSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reservations: [],
  newResInfo: {},
  token: null,
  users: [],
  isLoading: false
};

const rootSlice = createSlice({
  name: 'root',
  initialState,
  reducers: {
    updateReservations: (state, action) => {
      state.reservations = action.payload;
    },
    addToReservations: (state, action) => {
      state.reservations = [...state.reservations, action.payload];
    },
    updateNewResInfo: (state, action) => {
      state.newResInfo = action.payload;
    },
    updateToken: (state, action) => {
      state.token = action.payload;
    },
    updateUsers: (state, action) => {
      state.users = action.payload
    },
    updateIsLoading: (state, action) => {
      state.isLoading = action.payload
    }
  },
});

export const { updateIsLoading,updateUsers,updateReservations, updateNewResInfo, addToReservations, updateToken } = rootSlice.actions;
export default rootSlice.reducer;
