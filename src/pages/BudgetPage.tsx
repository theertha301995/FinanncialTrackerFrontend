import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import {
  setBudget,
  getBudgetStatus,
  updateBudget,
  deleteBudget,
  clearError
} from '../features/budget/budgetSlice';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Edit2,
  Trash2,
  Save,
  X,
  TrendingDown,
  Calendar,
  PieChart,
  Target,
  Sparkles,
  Activity,
  BarChart3,
  Clock,
  Wallet
} from 'lucide-react';

const BudgetManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { budget, status, isLoading, error } = useSelector(
    (state: RootState) => state.budget
  );

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    limit: '',
    period: 'monthly'
  });

  useEffect(() => {
    dispatch(getBudgetStatus());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [error, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { limit: Number(formData.limit), period: formData.period };
    
    if (isEditing && budget) {
      await dispatch(updateBudget({ id: budget._id, data }));
      setIsEditing(false);
    } else {
      await dispatch(setBudget(data));
      setIsCreating(false);
    }
    
    setFormData({ limit: '', period: 'monthly' });
    dispatch(getBudgetStatus());
  };

  const handleEdit = () => {
    setFormData({
      limit: status?.budget?.toString() || '',
      period: status?.period || 'monthly'
    });
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      if (budget?._id) {
        await dispatch(deleteBudget(budget._id));
        dispatch(getBudgetStatus());
      }
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setFormData({ limit: '', period: 'monthly' });
  };

  const getStatusColor = () => {
    if (!status) return 'bg-gray-100';
    const percentage = (status.spent / status.budget) * 100;
    if (percentage >= 100) return 'bg-red-50 border-red-200';
    if (percentage >= 80) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getProgressColor = () => {
    if (!status) return 'bg-gray-400';
    const percentage = (status.spent / status.budget) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const calculatePercentage = () => {
    if (!status) return 0;
    return Math.min((status.spent / status.budget) * 100, 100);
  };

  const getDailyAverage = () => {
    if (!status) return 0;
    const daysInPeriod = status.period === 'daily' ? 1 : status.period === 'weekly' ? 7 : 30;
    return status.spent / daysInPeriod;
  };

  const getProjectedSpending = () => {
    if (!status) return 0;
    const daysInPeriod = status.period === 'daily' ? 1 : status.period === 'weekly' ? 7 : 30;
    const dailyAvg = getDailyAverage();
    return dailyAvg * daysInPeriod;
  };

  const getAdvice = () => {
    if (!status) return null;
    const percentage = (status.spent / status.budget) * 100;
    
    if (percentage >= 100) {
      return {
        type: 'danger',
        icon: <AlertCircle className="w-5 h-5" />,
        title: 'Budget Exceeded',
        message: 'You have exceeded your budget. Consider reviewing your expenses and adjusting your spending habits.'
      };
    } else if (percentage >= 80) {
      return {
        type: 'warning',
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Approaching Limit',
        message: 'You are nearing your budget limit. Try to reduce non-essential expenses for the remainder of this period.'
      };
    } else if (percentage <= 50) {
      return {
        type: 'success',
        icon: <Sparkles className="w-5 h-5" />,
        title: 'Great Job!',
        message: 'You are well within your budget. Keep up the good spending habits!'
      };
    }
    return {
      type: 'info',
      icon: <Activity className="w-5 h-5" />,
      title: 'On Track',
      message: 'Your spending is balanced. Continue monitoring to stay within budget.'
    };
  };

  const advice = getAdvice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Budget Management</h1>
              <p className="text-gray-600 text-sm md:text-base">Track, analyze, and optimize your family finances</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center gap-3 shadow-sm animate-pulse">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Budget Status */}
          <div className="lg:col-span-2 space-y-6">
            {isLoading && !status ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading budget status...</p>
              </div>
            ) : status && !isCreating && !isEditing ? (
              <>
                {/* Status Cards */}
                <div className={`bg-white rounded-2xl shadow-xl p-6 border-2 ${getStatusColor()} transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <PieChart className="w-6 h-6 text-indigo-600" />
                      Budget Overview
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 shadow-sm border border-indigo-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-indigo-600" />
                        <p className="text-sm text-indigo-700 font-semibold">Total Budget</p>
                      </div>
                      <p className="text-3xl font-bold text-indigo-900">₹{status.budget.toFixed(2)}</p>
                      <p className="text-xs text-indigo-600 mt-1 capitalize flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {status.period}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 shadow-sm border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-orange-600" />
                        <p className="text-sm text-orange-700 font-semibold">Spent</p>
                      </div>
                      <p className="text-3xl font-bold text-orange-900">₹{status.spent.toFixed(2)}</p>
                      <p className="text-xs text-orange-600 mt-1">{calculatePercentage().toFixed(1)}% of budget</p>
                    </div>

                    <div className={`bg-gradient-to-br ${status.remaining < 0 ? 'from-red-50 to-red-100 border-red-200' : 'from-green-50 to-green-100 border-green-200'} rounded-xl p-4 shadow-sm border`}>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className={`w-4 h-4 ${status.remaining < 0 ? 'text-red-600' : 'text-green-600'}`} />
                        <p className={`text-sm font-semibold ${status.remaining < 0 ? 'text-red-700' : 'text-green-700'}`}>
                          {status.remaining < 0 ? 'Overspent' : 'Remaining'}
                        </p>
                      </div>
                      <p className={`text-3xl font-bold ${status.remaining < 0 ? 'text-red-900' : 'text-green-900'}`}>
                        ₹{Math.abs(status.remaining).toFixed(2)}
                      </p>
                      <p className={`text-xs mt-1 ${status.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>{status.status}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-700 font-semibold flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Progress
                      </span>
                      <span className="font-bold text-gray-900 text-lg">{calculatePercentage().toFixed(1)}%</span>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                      <div
                        className={`h-full ${getProgressColor()} transition-all duration-700 ease-out rounded-full flex items-center justify-end pr-2`}
                        style={{ width: `${calculatePercentage()}%` }}
                      >
                        {calculatePercentage() > 10 && (
                          <span className="text-white text-xs font-bold">{calculatePercentage().toFixed(0)}%</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {status.remaining < 0 && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-red-100 to-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 shadow-sm">
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-red-900 text-lg">⚠️ Budget Exceeded!</p>
                        <p className="text-sm text-red-800 mt-1">You've overspent by <span className="font-bold">₹{Math.abs(status.remaining).toFixed(2)}</span>. Review your expenses immediately.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Insights Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Clock className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-gray-800">Daily Average</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">₹{getDailyAverage().toFixed(2)}</p>
                    <p className="text-sm text-gray-600 mt-1">Per day spending rate</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-gray-800">Projected Total</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">₹{getProjectedSpending().toFixed(2)}</p>
                    <p className="text-sm text-gray-600 mt-1">If trend continues</p>
                  </div>
                </div>
              </>
            ) : !status && !isCreating ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-dashed border-gray-300">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-12 h-12 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Budget Set</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start tracking your expenses by creating your first budget. Set limits and monitor your spending in real-time.
                </p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition font-semibold shadow-lg text-lg"
                >
                  Create Your First Budget
                </button>
              </div>
            ) : null}

            {/* Create/Edit Form */}
            {(isCreating || isEditing) && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 p-3 rounded-xl">
                    <Save className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {isEditing ? 'Edit Budget' : 'Create New Budget'}
                  </h3>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Budget Limit (₹)
                    </label>
                    <input
                      type="number"
                      name="limit"
                      value={formData.limit}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Budget Period
                    </label>
                    <select
                      name="period"
                      value={formData.period}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
                  >
                    <Save className="w-5 h-5" />
                    {isLoading ? 'Saving...' : isEditing ? 'Update Budget' : 'Create Budget'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Advice & Tips */}
          <div className="space-y-6">
            {advice && status && (
              <div className={`rounded-2xl shadow-xl p-6 border-2 ${
                advice.type === 'danger' ? 'bg-red-50 border-red-300' :
                advice.type === 'warning' ? 'bg-yellow-50 border-yellow-300' :
                advice.type === 'success' ? 'bg-green-50 border-green-300' :
                'bg-blue-50 border-blue-300'
              }`}>
                <div className={`flex items-center gap-3 mb-4 ${
                  advice.type === 'danger' ? 'text-red-600' :
                  advice.type === 'warning' ? 'text-yellow-600' :
                  advice.type === 'success' ? 'text-green-600' :
                  'text-blue-600'
                }`}>
                  {advice.icon}
                  <h3 className="font-bold text-lg">{advice.title}</h3>
                </div>
                <p className={`text-sm ${
                  advice.type === 'danger' ? 'text-red-800' :
                  advice.type === 'warning' ? 'text-yellow-800' :
                  advice.type === 'success' ? 'text-green-800' :
                  'text-blue-800'
                }`}>
                  {advice.message}
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Money Tips</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Track every expense, no matter how small</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Review your budget weekly to stay on track</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Set aside 20% for savings before spending</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Avoid impulse purchases by waiting 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Use cash for discretionary spending</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6" />
                <h3 className="font-bold text-lg">Quick Stats</h3>
              </div>
              {status && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="opacity-90">Budget Period</span>
                    <span className="font-bold capitalize">{status.period}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-90">Days Tracked</span>
                    <span className="font-bold">
                      {status.period === 'daily' ? '1' : status.period === 'weekly' ? '7' : '30'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-90">Avg per Day</span>
                    <span className="font-bold">₹{getDailyAverage().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white border-opacity-30">
                    <span className="opacity-90">Budget Health</span>
                    <span className="font-bold">{calculatePercentage() < 80 ? '✓ Good' : calculatePercentage() < 100 ? '⚠ Fair' : '✗ Poor'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetManagement;