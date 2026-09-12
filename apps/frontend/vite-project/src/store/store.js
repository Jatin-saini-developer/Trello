import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './dashboardSlice.js';

const store = configureStore({
    reducer: {
        dashboard: dashboardReducer,
    },
});

export default store;
