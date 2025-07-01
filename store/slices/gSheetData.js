import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Define both URLs
const masterImsAPI = "https://script.google.com/macros/s/AKfycbxDcz6zbGv2o5R2us9Sm9UbrX8OCbO7LakqV_0rf6GaxfL9vFmDyDZKnrv9ZVca8p9oLA/exec";
const liveStockAPI = "https://script.google.com/macros/s/AKfycbxnnkkjOo5tAHHIKwucr6GrB2pBY4S0PrLUFBMwDkPaImpeGuRvFCDadzfAiq-E_LEeag/exec";

// Fetch data from masterImsAPI
export const fetchMasterData = createAsyncThunk('data/fetchMasterData', async () => {
  const res = await fetch(masterImsAPI);
  if (!res.ok) throw new Error('Failed to fetch data from masterImsAPI');
  return await res.json();
});

// Fetch data from liveStockAPI
export const fetchStockData = createAsyncThunk('data/fetchStockData', async () => {
  const res = await fetch(liveStockAPI);
  if (!res.ok) throw new Error('Failed to fetch data from liveStockAPI');
  return await res.json();
});

const userSlice = createSlice({
  name: 'data',
  initialState: {
    masterData: null,
    stockData: null,
    loading1: false,
    loading2: false,
    error1: null,
    error2: null,
  },
  reducers: {
    updateMasterItem(state, action) {
      const updatedItem = action.payload;
      state.masterData = state.masterData.map(item =>
        item.item_code === updatedItem.item_code ? updatedItem : item
      );
    },
  },

  extraReducers: (builder) => {
    builder
      // Data 1
      .addCase(fetchMasterData.pending, (state) => {
        state.loading1 = true;
        state.error1 = null;
      })
      .addCase(fetchMasterData.fulfilled, (state, action) => {
        state.loading1 = false;
        state.masterData = action.payload;
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.loading1 = false;
        state.error1 = action.error.message;
      })

      // Data 2
      .addCase(fetchStockData.pending, (state) => {
        state.loading2 = true;
        state.error2 = null;
      })
      .addCase(fetchStockData.fulfilled, (state, action) => {
        state.loading2 = false;
        state.stockData = action.payload;
      })
      .addCase(fetchStockData.rejected, (state, action) => {
        state.loading2 = false;
        state.error2 = action.error.message;
      });
  },
});

export default userSlice.reducer;
export const { updateMasterItem } = userSlice.actions;