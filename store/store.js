import { configureStore } from '@reduxjs/toolkit';
import imsDataReducer from './slices/gSheetData';

export const store = configureStore({
  reducer: {
    data: imsDataReducer,
  },
});
