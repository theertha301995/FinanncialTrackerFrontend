// ============================================
// File: src/store/slices/expenseSlice.ts
// Fully typed + fixed version
// ============================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as expenseAPI from './expenseApi';

// -----------------------------
// Types
// -----------------------------

export interface Expense {
  _id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

// API response types
interface AddExpenseResponse {
  expense: Expense;
  message?: string;
}

interface LogExpenseResponse {
  success: boolean;
  expense?: Expense;
  message?: string;
  parsedData?: any;
  familyTotal?: number;
  language?: string;
}

interface ChatResponse {
  success: boolean;
  message: string;
  context?: any;
  language?: string;
}

interface ExpenseState {
  expenses: Expense[];
  familyExpenses: Expense[];
  isLoading: boolean;
  error: string | null;
  chatResponse: string | null;
}

// -----------------------------
// Initial State
// -----------------------------

const initialState: ExpenseState = {
  expenses: [],
  familyExpenses: [],
  isLoading: false,
  error: null,
  chatResponse: null,
};

// -----------------------------
// Async Thunks (typed)
// -----------------------------

export const addExpense = createAsyncThunk<
  AddExpenseResponse,
  {
    description: string;
    amount: number;
    category?: string;
    lang?: string;
    date?: string;
  }
>('expenses/add', async (expenseData, { rejectWithValue }) => {
  try {
    return await expenseAPI.addExpense(expenseData);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add expense');
  }
});

export const logExpenseByChat = createAsyncThunk<LogExpenseResponse, string>(
  'expenses/logByChat',
  async (message, { rejectWithValue }) => {
    try {
      return await expenseAPI.logExpenseByChat(message) as LogExpenseResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to log expense');
    }
  }
);

export const chatAboutExpenses = createAsyncThunk<ChatResponse, string>(
  'expenses/chat',
  async (message, { rejectWithValue }) => {
    try {
      return await expenseAPI.chatAboutExpenses(message) as ChatResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Chat failed');
    }
  }
);

export const getExpenses = createAsyncThunk<Expense[]>(
  'expenses/getAll',
  async (_, { rejectWithValue }) => {
    try {
      return await expenseAPI.getExpenses();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expenses');
    }
  }
);

export const getFamilyExpenses = createAsyncThunk<Expense[]>(
  'expenses/getFamily',
  async (_, { rejectWithValue }) => {
    try {
      return await expenseAPI.getFamilyExpenses();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch family expenses');
    }
  }
);

export const updateExpense = createAsyncThunk<
  Expense,
  { id: string; data: Partial<Expense> }
>('expenses/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await expenseAPI.updateExpense(id, data);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update expense');
  }
});

export const deleteExpense = createAsyncThunk<string, string>(
  'expenses/delete',
  async (id, { rejectWithValue }) => {
    try {
      await expenseAPI.deleteExpense(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete expense');
    }
  }
);

// -----------------------------
// Slice
// -----------------------------

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearChatResponse: (state) => {
      state.chatResponse = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // -----------------------------
    // Add Expense
    // -----------------------------
    builder.addCase(addExpense.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(addExpense.fulfilled, (state, action) => {
      state.isLoading = false;
      state.expenses.unshift(action.payload.expense); // fully typed
    });

    builder.addCase(addExpense.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // -----------------------------
    // Log Expense by Chat
    // -----------------------------
    builder.addCase(logExpenseByChat.fulfilled, (state, action) => {
      state.isLoading = false;

      if (action.payload.expense) {
        const exists = state.expenses.find((e) => e._id === action.payload.expense!._id);
        if (!exists) state.expenses.unshift(action.payload.expense);
      }

      state.chatResponse = action.payload.message || null;
    });

    builder.addCase(logExpenseByChat.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // -----------------------------
    // Chat About Expenses
    // -----------------------------
    builder.addCase(chatAboutExpenses.fulfilled, (state, action) => {
      state.isLoading = false;
      state.chatResponse = action.payload.message;
    });

    builder.addCase(chatAboutExpenses.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // -----------------------------
    // Get Expenses
    // -----------------------------
    builder.addCase(getExpenses.fulfilled, (state, action) => {
      state.isLoading = false;
      state.expenses = action.payload;
    });

    builder.addCase(getExpenses.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // -----------------------------
    // Get Family Expenses
    // -----------------------------
    builder.addCase(getFamilyExpenses.fulfilled, (state, action) => {
      state.isLoading = false;
      state.familyExpenses = action.payload;
    });

    // -----------------------------
    // Update Expense
    // -----------------------------
    builder.addCase(updateExpense.fulfilled, (state, action) => {
      const updated = action.payload;

      // update in main list
      const idx = state.expenses.findIndex((e) => e._id === updated._id);
      if (idx !== -1) state.expenses[idx] = updated;

      // update in family list
      const fIdx = state.familyExpenses.findIndex((e) => e._id === updated._id);
      if (fIdx !== -1) state.familyExpenses[fIdx] = updated;
    });

    // -----------------------------
    // Delete Expense
    // -----------------------------
    builder.addCase(deleteExpense.fulfilled, (state, action) => {
      state.expenses = state.expenses.filter((e) => e._id !== action.payload);
      state.familyExpenses = state.familyExpenses.filter((e) => e._id !== action.payload);
    });
  },
});

// -----------------------------
// Export
// -----------------------------

export const { clearChatResponse, clearError } = expenseSlice.actions;
export default expenseSlice.reducer;
