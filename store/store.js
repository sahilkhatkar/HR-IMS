import { configureStore } from '@reduxjs/toolkit';
import imsDataReducer from './slices/gSheetData';
import masterDataReducer from './slices/masterDataSlice';
import stockDataReducer from './slices/liveStockDataSlice';
import formResponsesReducer from './slices/formResponsesSlice';
import damageStockDataReducer from './slices/damageItemsEntriesSlice';

export const store = configureStore({
  reducer: {
    data: imsDataReducer,
    masterData: masterDataReducer,
    liveStockData: stockDataReducer,
    formResponses: formResponsesReducer,
    damageStock: damageStockDataReducer,
  },
});
