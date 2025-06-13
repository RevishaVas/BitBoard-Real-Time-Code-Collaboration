import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { apiSlice } from './slices/apiSlice';

const store = configureStore({
  reducer: {
    // Your RTK Query API slice (for backend communication)
    [apiSlice.reducerPath]: apiSlice.reducer,

    // Your custom auth slice that holds currentUser, etc.
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),

  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
