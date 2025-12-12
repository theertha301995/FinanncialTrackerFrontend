import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface FamilyState {
  family: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: FamilyState = {
  family: null,
  isLoading: false,
  error: null,
};

export const getFamily = createAsyncThunk(
  'family/get',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/family');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createFamily = createAsyncThunk(
  'family/create',
  async (name: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/family', { name });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const joinFamily = createAsyncThunk(
  'family/join',
  async (inviteCode: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/family/join', { inviteCode });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getInviteCode = createAsyncThunk(
  'family/getInviteCode',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/family/invite-code');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const regenerateInviteCode = createAsyncThunk(
  'family/regenerateCode',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/family/regenerate-code');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getFamilyTotalSpending = createAsyncThunk(
  'family/totalSpending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/family/total');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Family
      .addCase(getFamily.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFamily.fulfilled, (state, action) => {
        state.isLoading = false;
        state.family = action.payload;
      })
      .addCase(getFamily.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Family
      .addCase(createFamily.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createFamily.fulfilled, (state, action) => {
        state.isLoading = false;
        state.family = action.payload.family;
      })
      .addCase(createFamily.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Join Family
      .addCase(joinFamily.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(joinFamily.fulfilled, (state, action) => {
        state.isLoading = false;
        state.family = action.payload.family;
      })
      .addCase(joinFamily.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = familySlice.actions;
export default familySlice.reducer;