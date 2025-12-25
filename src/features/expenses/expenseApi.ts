// ============================================
// File: src/api/expenseApi.ts
// API service layer - Updated to work with existing backend
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
  date?: string;
}

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const REQUEST_TIMEOUT = 30000;

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
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data: any = error.response.data;

      switch (status) {
        case 401:
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
      console.error('Network error:', error.message);
      return Promise.reject('Network error. Please check your connection.');
    } else {
      console.error('Request error:', error.message);
      return Promise.reject(error.message);
    }
  }
);

// ============================================
// AI CHAT API - Uses your backend aiChatRoutes
// ============================================

/**
 * Log expense via chat - uses backend AI
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
 * Chat about expenses - query processing
 * This uses client-side logic since you don't have a query endpoint
 */
export const chatAboutExpenses = async (message: string) => {
  try {
    const lowerMsg = message.toLowerCase();
    const familyExpenses = await getFamilyExpenses();
    
    let responseMessage = '';
    let context: any = {};

    // Today's expenses
    if (lowerMsg.includes('today')) {
      const today = new Date();
      const todayExpenses = familyExpenses.filter((exp: any) => {
        const expDate = new Date(exp.date);
        return expDate.toDateString() === today.toDateString();
      });
      const total = todayExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
      responseMessage = `Today you've spent ₹${total.toLocaleString()} across ${todayExpenses.length} expenses.`;
      context.recentExpenses = todayExpenses.slice(0, 5);
    }
    // Recent expenses
    else if (lowerMsg.includes('recent')) {
      const recent = familyExpenses.slice(0, 10);
      const total = recent.reduce((sum: number, exp: any) => sum + exp.amount, 0);
      responseMessage = `Your recent 10 expenses total ₹${total.toLocaleString()}.`;
      context.recentExpenses = recent;
    }
    // Category breakdown
    else if (lowerMsg.includes('category') || lowerMsg.includes('breakdown')) {
      const breakdown: { [key: string]: number } = {};
      familyExpenses.forEach((exp: any) => {
        breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
      });
      const sorted = Object.entries(breakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
      
      responseMessage = 'Your top spending categories:\n' + 
        sorted.map(([cat, amt]) => `• ${cat}: ₹${amt.toLocaleString()}`).join('\n');
    }
    // Total spending
    else if (lowerMsg.includes('total') || lowerMsg.includes('spent')) {
      const total = familyExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
      responseMessage = `Your total spending is ₹${total.toLocaleString()} across ${familyExpenses.length} expenses.`;
    }
    // This month
    else if (lowerMsg.includes('month')) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthExpenses = familyExpenses.filter((exp: any) => new Date(exp.date) >= monthStart);
      const total = monthExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
      responseMessage = `This month you've spent ₹${total.toLocaleString()} across ${monthExpenses.length} expenses.`;
    }
    else {
      responseMessage = "I can help you with:\n• Today's expenses\n• Recent expenses\n• Category breakdown\n• Total spending\n• This month's expenses";
    }

    return {
      success: true,
      message: responseMessage,
      context,
      language: {
        name: 'English',
        code: 'en',
      },
    };
  } catch (error) {
    throw error;
  }
};

// ============================================
// EXPENSE CRUD ENDPOINTS (Your existing backend)
// ============================================

export const addExpense = async (expenseData: ExpenseInput): Promise<any> => {
  try {
    const response = await apiClient.post('/expenses', expenseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const response = await apiClient.get<Expense[]>('/expenses');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFamilyExpenses = async (): Promise<Expense[]> => {
  try {
    const response = await apiClient.get<Expense[]>('/expenses/family');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateExpense = async (id: string, data: Partial<ExpenseInput>): Promise<Expense> => {
  try {
    const response = await apiClient.put<Expense>(`/expenses/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

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

export const getExpenseStats = async (viewMode: 'personal' | 'family' = 'personal') => {
  try {
    const expenses = viewMode === 'family' ? await getFamilyExpenses() : await getExpenses();

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

export const exportExpensesToCSV = (expenses: Expense[]): string => {
  const headers = ['Date', 'Description', 'Amount', 'Category', 'User'];
  const rows = expenses.map(exp => [
    new Date(exp.date).toLocaleDateString(),
    exp.description,
    exp.amount,
    exp.category,
    exp.user?.name || 'Unknown'
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

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

export const isAuthError = (error: any): boolean => {
  return error?.response?.status === 401;
};

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

export { apiClient };

const expenseApiExports = {
  logExpenseByChat,
  chatAboutExpenses,
  addExpense,
  getExpenses,
  getFamilyExpenses,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  exportExpensesToCSV,
  downloadCSV,
  isAuthError,
  getErrorMessage,
};

export default expenseApiExports;