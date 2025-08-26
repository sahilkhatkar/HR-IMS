import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch and filter Google Sheets data by brand
// masterSlice.js
export const fetchDamageStockResponses = createAsyncThunk(
  'sheet/fetchDamageStockResponses',
  async (thunkAPI) => {
    try {
      const res = await fetch(`/api/damage-stock-entries-data`);
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
    damageStockResponses: [],
    loading: false,
    error: null,
  },

  reducers: {

    setDamageStockResponses: (state, action) => {
      state.damageStockResponses = action.payload;
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
      state.damageStockResponses = [];
      state.loading = false;
      state.error = null;
    },

    addDamageStockResponses: (state, action) => {
      // console.log("Master::", state.masterData);
      state.damageStockResponses.push(...action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDamageStockResponses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDamageStockResponses.fulfilled, (state, action) => {
        state.loading = false;
        state.damageStockResponses = action.payload;
      })
      .addCase(fetchDamageStockResponses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setDamageStockResponses, setLoading, setError, clearSheetData, addDamageStockResponses, } = masterSlice.actions;

export default masterSlice.reducer;