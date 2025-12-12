import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface BudgetState {
  budget: any;
  status: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budget: null,
  status: null,
  isLoading: false,
  error: null,
};

export const setBudget = createAsyncThunk(
  'budget/set',
  async (data: { limit: number; period: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/budgets', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getBudgetStatus = createAsyncThunk(
  'budget/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/budgets');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budget/update',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/budgets/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budget/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/budgets/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budget = action.payload;
      })
      .addCase(setBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getBudgetStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBudgetStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = action.payload;
      })
      .addCase(getBudgetStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.budget = action.payload;
      })
      .addCase(deleteBudget.fulfilled, (state) => {
        state.budget = null;
        state.status = null;
      });
  },
});

export const { clearError } = budgetSlice.actions;
export default budgetSlice.reducer;
