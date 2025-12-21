// ============================================
// File: src/pages/ExpensePage.tsx
// Complete Expense Management Page with Redux Integration
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getExpenses, 
  getFamilyExpenses, 
  addExpense, 
  updateExpense, 
  deleteExpense,
  clearError 
} from '../features/expenses/expenseSlice';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Calendar,
  DollarSign,
  TrendingUp,
  PieChart,
  Download,
  Users,
  User,
  AlertCircle,
  X
} from 'lucide-react';
import ExpenseModal from '../components/ExpenseModal';

interface RootState {
  expenses: {
    expenses: any[];
    familyExpenses: any[];
    isLoading: boolean;
    error: string | null;
  };
  auth: {
    user: any;
  };
}

const ExpensePage: React.FC = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const { expenses, familyExpenses, isLoading, error } = useSelector(
    (state: RootState) => state.expenses
  );
  
  // Local UI state
  const [viewMode, setViewMode] = useState<'personal' | 'family'>('personal');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [showError, setShowError] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    monthTotal: 0,
    weekTotal: 0,
    categoryBreakdown: {} as Record<string, number>
  });

  const categories = [
    { name: 'All', value: 'all', color: 'gray' },
    { name: 'Food', value: 'Food', color: 'orange', icon: '🍽️' },
    { name: 'Transport', value: 'Transport', color: 'blue', icon: '🚗' },
    { name: 'Shopping', value: 'Shopping', color: 'purple', icon: '🛍️' },
    { name: 'Bills', value: 'Bills', color: 'red', icon: '💡' },
    { name: 'Entertainment', value: 'Entertainment', color: 'pink', icon: '🎬' },
    { name: 'Health', value: 'Health', color: 'green', icon: '⚕️' },
    { name: 'Education', value: 'Education', color: 'indigo', icon: '📚' },
    { name: 'Other', value: 'Other', color: 'gray', icon: '📦' },
  ];

  // Fetch expenses on mount and when view mode changes
  useEffect(() => {
    if (viewMode === 'family') {
      dispatch(getFamilyExpenses() as any);
    } else {
      dispatch(getExpenses() as any);
    }
  }, [dispatch, viewMode]);

  // Calculate stats when data changes - using useCallback to fix dependency warning
  const calculateStats = useCallback(() => {
    const data = viewMode === 'family' ? familyExpenses : expenses;
    const total = data.reduce((sum: number, exp: any) => sum + exp.amount, 0);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthTotal = data
      .filter((exp: any) => new Date(exp.date) >= monthStart)
      .reduce((sum: number, exp: any) => sum + exp.amount, 0);

    const weekTotal = data
      .filter((exp: any) => new Date(exp.date) >= weekAgo)
      .reduce((sum: number, exp: any) => sum + exp.amount, 0);

    const categoryBreakdown: Record<string, number> = {};
    data.forEach((exp: any) => {
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
    });

    setStats({ total, monthTotal, weekTotal, categoryBreakdown });
  }, [viewMode, familyExpenses, expenses]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleAddExpense = async (expenseData: any) => {
    try {
      await dispatch(addExpense(expenseData) as any).unwrap();
      setShowAddModal(false);
      // Refresh the appropriate list
      if (viewMode === 'family') {
        dispatch(getFamilyExpenses() as any);
      } else {
        dispatch(getExpenses() as any);
      }
    } catch (error: any) {
      console.error('Failed to add expense:', error);
    }
  };

  const handleUpdateExpense = async (id: string, data: any) => {
    try {
      await dispatch(updateExpense({ id, data }) as any).unwrap();
      setShowEditModal(false);
      setEditingExpense(null);
    } catch (error: any) {
      console.error('Failed to update expense:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await dispatch(deleteExpense(id) as any).unwrap();
    } catch (error: any) {
      console.error('Failed to delete expense:', error);
    }
  };

  const filteredExpenses = () => {
    const data = viewMode === 'family' ? familyExpenses : expenses;
    return data.filter((exp: any) => {
      const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const exportToCSV = () => {
    const data = filteredExpenses();
    const csv = [
      ['Date', 'Description', 'Amount', 'Category', 'User'],
      ...data.map((exp: any) => [
        new Date(exp.date).toLocaleDateString(),
        exp.description,
        exp.amount,
        exp.category,
        exp.user?.name || 'Unknown'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.icon || '📦';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Expense Management</h1>
          <p className="text-gray-600">Track and manage your expenses efficiently</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Spent</span>
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">₹{stats.total.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">This Month</span>
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">₹{stats.monthTotal.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Current month</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">This Week</span>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">₹{stats.weekTotal.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Expenses</span>
              <PieChart className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{filteredExpenses().length}</p>
            <p className="text-xs text-gray-500 mt-1">Total entries</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('personal')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  viewMode === 'personal'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <User className="w-4 h-4" />
                My Expenses
              </button>
              <button
                onClick={() => setViewMode('family')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  viewMode === 'family'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users className="w-4 h-4" />
                Family Expenses
              </button>
            </div>

            <div className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 font-medium shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedCategory === cat.value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        {Object.keys(stats.categoryBreakdown).length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              Spending by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.categoryBreakdown).map(([category, amount]) => {
                const percentage = ((amount / stats.total) * 100).toFixed(1);
                return (
                  <div key={category} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                      <span className="font-semibold text-gray-700">{category}</span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">₹{amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{percentage}% of total</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expenses Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading expenses...</p>
              </div>
            ) : filteredExpenses().length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No expenses found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Try adjusting your filters or add a new expense
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    {viewMode === 'family' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                    )}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses().map((expense: any) => (
                    <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">{expense.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {getCategoryIcon(expense.category)} {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ₹{expense.amount.toLocaleString()}
                      </td>
                      {viewMode === 'family' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {expense.user?.name || 'Unknown'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingExpense(expense);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <ExpenseModal
          categories={categories.filter(c => c.value !== 'all')}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddExpense}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingExpense && (
        <ExpenseModal
          expense={editingExpense}
          categories={categories.filter(c => c.value !== 'all')}
          onClose={() => {
            setShowEditModal(false);
            setEditingExpense(null);
          }}
          onSave={(data) => handleUpdateExpense(editingExpense._id, data)}
        />
      )}

      {/* Error Toast */}
      {showError && error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-up">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={() => {
              setShowError(false);
              dispatch(clearError());
            }}
            className="ml-2 hover:bg-red-600 rounded p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpensePage;