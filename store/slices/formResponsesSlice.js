import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch and filter Google Sheets data by brand
// masterSlice.js
export const fetchFormResponses = createAsyncThunk(
  'sheet/fetchFormResponses',
  async (thunkAPI) => {
    try {
      const res = await fetch(`/api/form-responses-stock-data`);
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
    formResponses: [],
    loading: false,
    error: null,
  },

  reducers: {

    setFormResponses: (state, action) => {
      state.formResponses = action.payload;
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
      state.formResponses = [];
      state.loading = false;
      state.error = null;
    },

    addResponseToResponses: (state, action) => {
      // console.log("Master::", state.masterData);
      state.formResponses.push(...action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchFormResponses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormResponses.fulfilled, (state, action) => {
        state.loading = false;
        state.formResponses = action.payload;
      })
      .addCase(fetchFormResponses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFormResponses, setLoading, setError, clearSheetData, addResponseToResponses, } = masterSlice.actions;

export default masterSlice.reducer;