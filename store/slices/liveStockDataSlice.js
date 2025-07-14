import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch and filter Google Sheets data by brand
export const fetchLiveStockData = createAsyncThunk(
  'sheet/fetchLiveStockData',
  async (thunkAPI) => {
    try {
      const res = await fetch(`/api/live-stock-data`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch');

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch sheet data');
    }
  }
);


const masterSlice = createSlice({
  name: 'sheet',
  initialState: {
    stockData: [],
    loading: false,
    error: null,
  },

  reducers: {

    setLiveStockData: (state, action) => {
      state.stockData = action.payload;
      state.error = null;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearSheetData: (state) => {
      state.stockData = [];
      state.loading = false;
      state.error = null;
    },

    // updateMasterItem(state, action) {
    //   const updatedItem = action.payload;
    //   state.stockData = state.stockData.map(item =>
    //     item.item_code === updatedItem.item_code ? updatedItem : item
    //   );
    // },

    // addItemsToMasterData: (state, action) => {
    //   // console.log("Master::", state.stockData);
    //   state.stockData.push(...action.payload);
    // },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveStockData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLiveStockData.fulfilled, (state, action) => {
        state.loading = false;
        state.stockData = action.payload;
      })
      .addCase(fetchLiveStockData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setLiveStockData, setLoading, setError, clearSheetData, updateMasterItem, addItemsToMasterData, } = masterSlice.actions;

export default masterSlice.reducer;