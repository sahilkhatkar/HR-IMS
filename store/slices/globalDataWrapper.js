// store/slices/globalDataWrapper.ts
import { createAsyncThunk } from '@reduxjs/toolkit';

import { fetchDamageStockResponses } from './damageItemsEntriesSlice';
import { fetchMasterData } from './masterDataSlice';
import { fetchPlantData } from './plantDataSlice';
import { fetchSalesOrderData } from './salesOrderDataSlice';
import { setFormResponses } from './formResponsesSlice';
import { setLiveStockData } from './liveStockDataSlice';
import { fetchStockFGData } from './stockFGData';

export const refreshAllData = createAsyncThunk(
    'global/refreshAllData',
    async (_, { dispatch }) => {

        await Promise.all([
            // dispatch(setFormResponses()),
            // dispatch(setLiveStockData()),

            dispatch(fetchDamageStockResponses()),
            dispatch(fetchPlantData()),
            dispatch(fetchMasterData()),
            dispatch(fetchSalesOrderData()),
            dispatch(fetchStockFGData()),
        ]);
    }
);
