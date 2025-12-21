// ============================================
// File: src/api/expenseApi.ts
// API service layer for expense operations
// ============================================

import axios, { AxiosInstance, AxiosError } from 'axios';

// Types
interface Expense {
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
  family?: string;
}

interface ExpenseInput {
  description: string;
  amount: number;
  category?: string;
  lang?: string;
  date?: string;
}

// Removed unused ChatResponse and ApiResponse interfaces

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Request Interceptor - Add Auth Token
// ============================================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor - Handle Errors
// ============================================
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data: any = error.response.data;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden:', data.message);
          break;
        case 404:
          console.error('Not found:', data.message);
          break;
        case 500:
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API Error:', data.message);
      }

      return Promise.reject(data.message || data.error || 'An error occurred');
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error:', error.message);
      return Promise.reject('Network error. Please check your connection.');
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
      return Promise.reject(error.message);
    }
  }
);

// ============================================
// CHAT API ENDPOINTS
// ============================================

/**
 * Log expense via chat with natural language
 * POST /api/chat/expense
 */
export const logExpenseByChat = async (message: string) => {
  try {
    const response = await apiClient.post('/chat/expense', { message });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Chat about expenses - ask questions
 * POST /api/chat/query
 */
export const chatAboutExpenses = async (message: string) => {
  try {
    const response = await apiClient.post('/chat/query', { message });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// EXPENSE CRUD ENDPOINTS
// ============================================

/**
 * Add a new expense
 * POST /api/expenses
 */
export const addExpense = async (expenseData: ExpenseInput): Promise<any> => {
  try {
    const response = await apiClient.post('/expenses', expenseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all expenses for logged-in user
 * GET /api/expenses
 */
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const response = await apiClient.get<Expense[]>('/expenses');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all family expenses
 * GET /api/expenses/family
 */
export const getFamilyExpenses = async (): Promise<Expense[]> => {
  try {
    const response = await apiClient.get<Expense[]>('/expenses/family');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an expense
 * PUT /api/expenses/:id
 */
export const updateExpense = async (id: string, data: Partial<ExpenseInput>): Promise<Expense> => {
  try {
    const response = await apiClient.put<Expense>(`/expenses/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete an expense
 * DELETE /api/expenses/:id
 */
export const deleteExpense = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get expense statistics
 */
export const getExpenseStats = async (viewMode: 'personal' | 'family' = 'personal') => {
  try {
    const expenses = viewMode === 'family' 
      ? await getFamilyExpenses() 
      : await getExpenses();

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthTotal = expenses
      .filter(exp => new Date(exp.date) >= monthStart)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const weekTotal = expenses
      .filter(exp => new Date(exp.date) >= weekAgo)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const categoryBreakdown: Record<string, number> = {};
    expenses.forEach(exp => {
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
    });

    return {
      total,
      monthTotal,
      weekTotal,
      count: expenses.length,
      categoryBreakdown,
      expenses,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get expenses by date range
 */
export const getExpensesByDateRange = async (
  startDate: Date, 
  endDate: Date,
  viewMode: 'personal' | 'family' = 'personal'
): Promise<Expense[]> => {
  try {
    const expenses = viewMode === 'family' 
      ? await getFamilyExpenses() 
      : await getExpenses();

    return expenses.filter(exp => {
      const expenseDate = new Date(exp.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get expenses by category
 */
export const getExpensesByCategory = async (
  category: string,
  viewMode: 'personal' | 'family' = 'personal'
): Promise<Expense[]> => {
  try {
    const expenses = viewMode === 'family' 
      ? await getFamilyExpenses() 
      : await getExpenses();

    return expenses.filter(exp => exp.category === category);
  } catch (error) {
    throw error;
  }
};

/**
 * Search expenses by description
 */
export const searchExpenses = async (
  searchTerm: string,
  viewMode: 'personal' | 'family' = 'personal'
): Promise<Expense[]> => {
  try {
    const expenses = viewMode === 'family' 
      ? await getFamilyExpenses() 
      : await getExpenses();

    return expenses.filter(exp => 
      exp.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Export expenses to CSV
 */
export const exportExpensesToCSV = (expenses: Expense[]): string => {
  const headers = ['Date', 'Description', 'Amount', 'Category', 'User'];
  const rows = expenses.map(exp => [
    new Date(exp.date).toLocaleDateString(),
    exp.description,
    exp.amount,
    exp.category,
    exp.user?.name || 'Unknown'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Download CSV file
 */
export const downloadCSV = (expenses: Expense[], filename?: string) => {
  const csv = exportExpensesToCSV(expenses);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `expenses-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Batch delete expenses
 */
export const batchDeleteExpenses = async (ids: string[]): Promise<void> => {
  try {
    await Promise.all(ids.map(id => deleteExpense(id)));
  } catch (error) {
    throw error;
  }
};

/**
 * Get today's expenses
 */
export const getTodayExpenses = async (viewMode: 'personal' | 'family' = 'personal'): Promise<Expense[]> => {
  try {
    const expenses = viewMode === 'family' 
      ? await getFamilyExpenses() 
      : await getExpenses();

    const today = new Date();
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.toDateString() === today.toDateString();
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get this month's expenses
 */
export const getThisMonthExpenses = async (viewMode: 'personal' | 'family' = 'personal'): Promise<Expense[]> => {
  try {
    const expenses = viewMode === 'family' 
      ? await getFamilyExpenses() 
      : await getExpenses();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return expenses.filter(exp => new Date(exp.date) >= monthStart);
  } catch (error) {
    throw error;
  }
};

// ============================================
// ERROR HANDLING HELPER
// ============================================

/**
 * Check if error is authentication error
 */
export const isAuthError = (error: any): boolean => {
  return error?.response?.status === 401;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Export the axios instance for advanced usage
export { apiClient };

// Named exports object
const expenseApiExports = {
  // Chat endpoints
  logExpenseByChat,
  chatAboutExpenses,
  
  // CRUD endpoints
  addExpense,
  getExpenses,
  getFamilyExpenses,
  updateExpense,
  deleteExpense,
  
  // Utility functions
  getExpenseStats,
  getExpensesByDateRange,
  getExpensesByCategory,
  searchExpenses,
  exportExpensesToCSV,
  downloadCSV,
  batchDeleteExpenses,
  getTodayExpenses,
  getThisMonthExpenses,
  
  // Error helpers
  isAuthError,
  getErrorMessage,
};

export default expenseApiExports;