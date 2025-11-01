import { configureStore } from '@reduxjs/toolkit';
import imsDataReducer from './slices/gSheetData';
import masterDataReducer from './slices/masterDataSlice';
import plantDataReducer from './slices/plantDataSlice';
import stockDataReducer from './slices/liveStockDataSlice';
import formResponsesReducer from './slices/formResponsesSlice';
import damageStockDataReducer from './slices/damageItemsEntriesSlice';
import salesOrderDataReducer from './slices/salesOrderDataSlice';
import stockFGDataReducer from './slices/stockFGData';

export const store = configureStore({
  reducer: {
    data: imsDataReducer,
    masterData: masterDataReducer,
    plantData: plantDataReducer,
    liveStockData: stockDataReducer,
    formResponses: formResponsesReducer,
    damageStock: damageStockDataReducer,
    salesOrder: salesOrderDataReducer,
    stockFGData: stockFGDataReducer,
  },
});
