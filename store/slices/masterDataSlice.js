import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch and filter Google Sheets data by brand
// masterSlice.js
export const fetchMasterData = createAsyncThunk(
  'sheet/fetchMasterData',
  async (thunkAPI) => {
    try {
      const res = await fetch(`/api/master-data`);
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
    masterData: [],
    loading: false,
    error: null,
  },

  reducers: {

    setSheetData: (state, action) => {
      state.masterData = action.payload;
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
      state.masterData = [];
      state.loading = false;
      state.error = null;
    },

    updateMasterItem(state, action) {
      const updatedItem = action.payload;
      state.masterData = state.masterData.map(item =>
        item.item_code === updatedItem.item_code ? updatedItem : item
      );
    },

    addItemsToMasterData: (state, action) => {
      // console.log("Master::", state.masterData);
      state.masterData.push(...action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterData.fulfilled, (state, action) => {
        state.loading = false;
        state.masterData = action.payload;
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSheetData, setLoading, setError, clearSheetData, updateMasterItem, addItemsToMasterData, } = masterSlice.actions;

export default masterSlice.reducer;