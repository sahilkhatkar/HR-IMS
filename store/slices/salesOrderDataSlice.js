import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch and filter Google Sheets data by brand
export const fetchSalesOrderData = createAsyncThunk(
  'sheet/fetchSalesOrderData',
  async (thunkAPI) => {
    try {
      const res = await fetch(`/api/sales-order-data`);
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
    salesOrder: [],
    loading: false,
    error: null,
  },

  reducers: {

    setSalesOrderData: (state, action) => {
      state.salesOrder = action.payload;
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

  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesOrderData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesOrderData.fulfilled, (state, action) => {
        state.loading = false;
        state.salesOrder = action.payload;
      })
      .addCase(fetchSalesOrderData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSalesOrderData, setLoading, setError, } = masterSlice.actions;

export default masterSlice.reducer;