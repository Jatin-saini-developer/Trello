import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './dashboardSlice.js';
import boardReducer from './boardSlice.js';

const store = configureStore({
    reducer: {
        dashboard: dashboardReducer,
        board: boardReducer,
    },
});

export default store;
