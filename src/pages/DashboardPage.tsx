import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import {
  LayoutDashboard,
  TrendingDown,
  Wallet,
  CreditCard,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Activity,
  Users,
  ShoppingCart,
  Home,
  Utensils,
  Car,
  Heart,
  Zap,
  MoreHorizontal
} from 'lucide-react';
import { getExpenses } from '../features/expenses/expenseSlice';
import { getBudgetStatus } from '../features/budget/budgetSlice';
import { getFamilyTotalSpending } from '../features/family/familySlice';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { expenses, isLoading: expensesLoading } = useSelector((state: RootState) => state.expenses);
  const { status: budgetStatus, isLoading: budgetsLoading } = useSelector((state: RootState) => state.budget);
  const { family, isLoading: familyLoading } = useSelector((state: RootState) => state.family);
  const { user } = useSelector((state: RootState) => state.auth);

  const [timeFilter, setTimeFilter] = useState('month');
  const [totalFamilySpending, setTotalFamilySpending] = useState(0);

  useEffect(() => {
    // Fetch all necessary data
    dispatch(getExpenses());
    dispatch(getBudgetStatus()).then((result: any) => {
      console.log('Budget Status Result:', result.payload);
    });
    
    if (user?.hasFamily) {
      dispatch(getFamilyTotalSpending()).then((result: any) => {
        if (result.payload) {
          setTotalFamilySpending(result.payload.total || 0);
        }
      });
    }
  }, [dispatch, user]);

  // Debug log to see budget structure
  useEffect(() => {
    console.log('Budget Status:', budgetStatus);
  }, [budgetStatus]);

  // Helper function to get date range based on filter
  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    
    switch(timeFilter) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return { start, end: now };
  };

  // Filter expenses by date range
  const getFilteredExpenses = () => {
    const { start, end } = getDateRange();
    return expenses?.filter((expense: any) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= start && expenseDate <= end;
    }) || [];
  };

  const filteredExpenses = getFilteredExpenses();

  // Calculate total spent
  // Use API's spent value if available, otherwise calculate from expenses
  const totalSpent = budgetStatus?.spent || filteredExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

  // Calculate total budget from budgetStatus
  // API returns: { budget: 25000, period: "monthly", spent: 9186, remaining: 15814, status: "Within limit" }
  const totalBudget = (() => {
    if (!budgetStatus) return 0;
    
    // If it's an array of budgets
    if (Array.isArray(budgetStatus)) {
      return budgetStatus.reduce((sum: number, b: any) => sum + (b.budget || b.limit || 0), 0);
    }
    
    // If it's the status object with budget property (your case)
    if (budgetStatus.budget) {
      return budgetStatus.budget;
    }
    
    // If it has limit property (fallback)
    if (budgetStatus.limit) {
      return budgetStatus.limit;
    }
    
    return 0;
  })();

  // Calculate remaining budget - use API value if available
  const remainingBudget = budgetStatus?.remaining ?? (totalBudget - totalSpent);

  // Get category breakdown
  const getCategoryBreakdown = () => {
    const categoryMap: { [key: string]: number } = {};
    
    filteredExpenses.forEach((expense: any) => {
      const category = expense.category || 'Others';
      categoryMap[category] = (categoryMap[category] || 0) + expense.amount;
    });

    const breakdown = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount: amount as number,
      percentage: totalSpent > 0 ? ((amount as number / totalSpent) * 100) : 0,
      color: getCategoryColor(category)
    }));

    return breakdown.sort((a, b) => b.amount - a.amount);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Food': 'bg-green-500',
      'Transport': 'bg-blue-500',
      'Bills': 'bg-yellow-500',
      'Healthcare': 'bg-red-500',
      'Entertainment': 'bg-purple-500',
      'Shopping': 'bg-pink-500',
      'Education': 'bg-indigo-500',
      'Others': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'Food': Utensils,
      'Transport': Car,
      'Healthcare': Heart,
      'Bills': Zap,
      'Shopping': ShoppingCart,
      'Entertainment': Activity,
      'Home': Home,
      'Others': MoreHorizontal
    };
    return icons[category] || MoreHorizontal;
  };

  const getCategoryIconColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Food': 'text-green-600 bg-green-100',
      'Transport': 'text-blue-600 bg-blue-100',
      'Healthcare': 'text-red-600 bg-red-100',
      'Bills': 'text-yellow-600 bg-yellow-100',
      'Shopping': 'text-pink-600 bg-pink-100',
      'Entertainment': 'text-purple-600 bg-purple-100',
      'Home': 'text-indigo-600 bg-indigo-100',
      'Others': 'text-gray-600 bg-gray-100'
    };
    return colors[category] || 'text-gray-600 bg-gray-100';
  };

  // Get monthly comparison (last 6 months)
  const getMonthlyComparison = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthExpenses = expenses?.filter((exp: any) => {
        const expDate = new Date(exp.date);
        return expDate >= monthStart && expDate <= monthEnd;
      }) || [];
      
      const total = monthExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
      
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        amount: total
      });
    }
    
    return months;
  };

  // Get recent expenses (last 5)
  const getRecentExpenses = () => {
    const sorted = [...(expenses || [])].sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted.slice(0, 5);
  };

  // Calculate previous period spending for comparison
  const getPreviousPeriodSpending = () => {
    const { start } = getDateRange();
    const duration = Date.now() - start.getTime();
    const previousStart = new Date(start.getTime() - duration);
    
    const previousExpenses = expenses?.filter((expense: any) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= previousStart && expenseDate < start;
    }) || [];
    
    return previousExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
  };

  const previousSpending = getPreviousPeriodSpending();
  const spendingChange = previousSpending > 0 
    ? (((totalSpent - previousSpending) / previousSpending) * 100).toFixed(0)
    : '0';

  const categoryBreakdown = getCategoryBreakdown();
  const monthlyComparison = getMonthlyComparison();
  const recentExpenses = getRecentExpenses();

  const stats = [
    {
      title: 'Total Budget',
      value: `₹${totalBudget.toLocaleString()}`,
      change: '+5%',
      trend: 'up',
      icon: Wallet,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Total Spent',
      value: `₹${totalSpent.toLocaleString()}`,
      change: `${spendingChange}%`,
      trend: parseFloat(spendingChange) > 0 ? 'up' : 'down',
      icon: TrendingDown,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      title: 'Remaining',
      value: `₹${remainingBudget.toLocaleString()}`,
      change: totalBudget > 0 ? `${((remainingBudget / totalBudget) * 100).toFixed(0)}%` : '0%',
      trend: remainingBudget >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Transactions',
      value: filteredExpenses.length.toString(),
      change: '+18%',
      trend: 'up',
      icon: CreditCard,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  const calculateBudgetPercentage = () => {
    if (totalBudget === 0) return 0;
    return (totalSpent / totalBudget) * 100;
  };

  const maxAmount = Math.max(...monthlyComparison.map(m => m.amount), 1);

  // Download Reports Function
  const handleDownloadReport = () => {
    // Generate CSV report
    const generateCSV = () => {
      const headers = ['Date', 'Description', 'Category', 'Amount'];
      const rows = filteredExpenses.map((exp: any) => [
        new Date(exp.date).toLocaleDateString(),
        exp.description,
        exp.category,
        exp.amount
      ]);

      let csvContent = headers.join(',') + '\n';
      rows.forEach((row: any[]) => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
      });

      // Add summary
      csvContent += '\n';
      csvContent += `Total Budget,${totalBudget}\n`;
      csvContent += `Total Spent,${totalSpent}\n`;
      csvContent += `Remaining,${remainingBudget}\n`;

      return csvContent;
    };

    // Create and download CSV
    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fileName = `expense_report_${timeFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (expensesLoading || budgetsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                <LayoutDashboard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600 text-sm md:text-base">
                  Welcome back, {user?.name}! Here's your financial overview
                </p>
              </div>
            </div>
            
            {/* Time Filter */}
            <div className="flex gap-2 bg-white rounded-xl p-1 shadow-md">
              {['week', 'month', 'year'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition capitalize ${
                    timeFilter === filter
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Budget Progress */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Target className="w-6 h-6 text-indigo-600" />
                Budget Progress
              </h2>
              <span className="text-sm text-gray-500 capitalize">{timeFilter}ly</span>
            </div>

            {totalBudget > 0 ? (
              <>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">₹{totalSpent.toLocaleString()} spent</span>
                    <span className="text-2xl font-bold text-gray-900">{calculateBudgetPercentage().toFixed(1)}%</span>
                  </div>
                  <div className="relative w-full bg-gray-200 rounded-full h-8 overflow-hidden shadow-inner">
                    <div
                      className={`h-full transition-all duration-700 ease-out rounded-full flex items-center justify-end pr-3 ${
                        calculateBudgetPercentage() >= 100
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : calculateBudgetPercentage() >= 80
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500'
                      }`}
                      style={{ width: `${Math.min(calculateBudgetPercentage(), 100)}%` }}
                    >
                      {calculateBudgetPercentage() > 15 && (
                        <span className="text-white text-sm font-bold">
                          {calculateBudgetPercentage().toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>₹0</span>
                    <span>₹{totalBudget.toLocaleString()}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No budget set yet. Create a budget to track your spending!</p>
              </div>
            )}

            {/* Monthly Spending Chart */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Spending Trend</h3>
              {maxAmount > 1 ? (
                <div className="flex items-end justify-between gap-2 h-40">
                  {monthlyComparison.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-t-lg relative group cursor-pointer hover:bg-gray-200 transition">
                        <div
                          className="bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500 relative"
                          style={{ height: `${(data.amount / maxAmount) * 140}px` }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                            ₹{data.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{data.month}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No spending data available yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-indigo-600" />
              By Category
            </h2>
            {categoryBreakdown.length > 0 ? (
              <div className="space-y-4">
                {categoryBreakdown.slice(0, 6).map((cat, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                      <span className="text-sm font-bold text-gray-900">₹{cat.amount.toLocaleString()}</span>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${cat.color} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{cat.percentage.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No expenses to categorize yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Activity className="w-6 h-6 text-indigo-600" />
              Recent Transactions
            </h2>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense: any) => {
                const Icon = getCategoryIcon(expense.category);
                const iconColor = getCategoryIconColor(expense.category);
                
                return (
                  <div
                    key={expense._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`${iconColor} p-3 rounded-xl`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{expense.description}</p>
                        <p className="text-sm text-gray-500">
                          {expense.category} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Expense</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No transactions yet</p>
              <p className="text-sm">Start adding expenses to see them here</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/expenses'}
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition flex flex-col items-center gap-3 group"
          >
            <div className="bg-white bg-opacity-20 p-3 rounded-xl group-hover:scale-110 transition">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="font-semibold">Add Expense</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/family'}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition flex flex-col items-center gap-3 group"
          >
            <div className="bg-white bg-opacity-20 p-3 rounded-xl group-hover:scale-110 transition">
              <Users className="w-6 h-6" />
            </div>
            <span className="font-semibold">View Family</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/budget'}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition flex flex-col items-center gap-3 group"
          >
            <div className="bg-white bg-opacity-20 p-3 rounded-xl group-hover:scale-110 transition">
              <Target className="w-6 h-6" />
            </div>
            <span className="font-semibold">Set Budget</span>
          </button>
          
          <button 
            onClick={handleDownloadReport}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition flex flex-col items-center gap-3 group"
          >
            <div className="bg-white bg-opacity-20 p-3 rounded-xl group-hover:scale-110 transition">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <span className="font-semibold">Download Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;