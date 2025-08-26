import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch and filter Google Sheets data by brand
// masterSlice.js
export const fetchPlantData = createAsyncThunk(
  'sheet/fetchPlantData',
  async (thunkAPI) => {
    try {
      const res = await fetch(`/api/plant-data`);
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
    plantData: [],
    loading: false,
    error: null,
  },

  reducers: {

    setSheetData: (state, action) => {
      state.plantData = action.payload;
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
      .addCase(fetchPlantData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlantData.fulfilled, (state, action) => {
        state.loading = false;
        state.plantData = action.payload;
      })
      .addCase(fetchPlantData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSheetData, setLoading, setError } = masterSlice.actions;

export default masterSlice.reducer;