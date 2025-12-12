// ============================================
// File: src/pages/ExpenseChatPage.tsx
// Multilingual Chat Interface for Expense Logging
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  logExpenseByChat, 
  chatAboutExpenses,
  getFamilyExpenses,
  clearChatResponse,
  clearError 
} from '../features/expenses/expenseSlice';
import { 
  Send, 
  Loader2, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  Globe, 
  Sparkles,
  ArrowLeft,
  List
} from 'lucide-react';

interface RootState {
  expenses: {
    expenses: any[];
    familyExpenses: any[];
    isLoading: boolean;
    error: string | null;
    chatResponse: string | null;
  };
  auth: {
    user: any;
  };
}

interface Message {
  id: number;
  type: 'user' | 'bot' | 'error';
  text: string;
  timestamp: Date;
  expense?: any;
  parsedData?: any;
  language?: any;
  context?: any;
}

const ExpenseChatPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Redux state
  const { familyExpenses, isLoading, error, chatResponse } = useSelector(
    (state: RootState) => state.expenses
  );
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Local state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    todayTotal: 0,
    count: 0
  });
  const [detectedLanguage, setDetectedLanguage] = useState('English');

  useEffect(() => {
    // Fetch initial stats
    dispatch(getFamilyExpenses() as any);
    
    // Add welcome message
    setMessages([{
      id: Date.now(),
      type: 'bot',
      text: 'Hi! I can help you track expenses in any language. Try: "500 rupees for food" or "आज ₹300 खाने पर खर्च किया"',
      timestamp: new Date(),
    }]);

    return () => {
      dispatch(clearChatResponse());
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    // Calculate stats from Redux state
    if (familyExpenses.length > 0) {
      const total = familyExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
      const today = new Date();
      const todayExpenses = familyExpenses.filter((e: any) => {
        const expDate = new Date(e.date);
        return expDate.toDateString() === today.toDateString();
      });
      const todayTotal = todayExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

      setStats({ total, todayTotal, count: familyExpenses.length });
    }
  }, [familyExpenses]);

  useEffect(() => {
    // Handle chat response from Redux
    if (chatResponse) {
      const botMessage: Message = {
        id: Date.now(),
        type: 'bot',
        text: chatResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      dispatch(clearChatResponse());
    }
  }, [chatResponse, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText;
    setInputText('');

    try {
      // Determine if it's an expense or query
      const isExpense = /\d+|spend|spent|paid|bought|purchase|₹/i.test(messageText);
      
      if (isExpense) {
        const result = await dispatch(logExpenseByChat(messageText) as any).unwrap();
        
        // Add bot response
        const botMessage: Message = {
          id: Date.now() + 1,
          type: 'bot',
          text: result.message,
          timestamp: new Date(),
          expense: result.expense,
          parsedData: result.parsedData,
          language: result.language,
        };
        setMessages(prev => [...prev, botMessage]);

        // Update stats
        if (result.familyTotal !== undefined) {
          setStats(prev => ({
            total: result.familyTotal,
            todayTotal: prev.todayTotal + result.expense.amount,
            count: prev.count + 1,
          }));
        }

        // Update detected language
        if (result.language?.name) {
          setDetectedLanguage(result.language.name);
        }

        // Refresh family expenses
        dispatch(getFamilyExpenses() as any);
      } else {
        const result = await dispatch(chatAboutExpenses(messageText) as any).unwrap();
        
        // Add bot response
        const botMessage: Message = {
          id: Date.now() + 1,
          type: 'bot',
          text: result.message,
          timestamp: new Date(),
          context: result.context,
          language: result.language,
        };
        setMessages(prev => [...prev, botMessage]);

        // Update detected language
        if (result.language?.name) {
          setDetectedLanguage(result.language.name);
        }
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'error',
        text: error || 'Failed to process message',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { text: "Today's total", action: 'Show me today\'s expenses', icon: '📅' },
    { text: 'Recent expenses', action: 'Show recent expenses', icon: '📋' },
    { text: 'Category breakdown', action: 'Show spending by category', icon: '📊' },
    { text: 'Add ₹500 food', action: '₹500 for food', icon: '🍽️' },
    { text: 'Add ₹100 transport', action: '₹100 for transport', icon: '🚗' },
    { text: 'Total spending', action: 'What is my total spending?', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/expenses')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to expense list"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  AI Expense Chat
                  <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full">
                    Multilingual
                  </span>
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {user?.name} • {detectedLanguage}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/expenses')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">View List</span>
            </button>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Total Spent</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">₹{stats.total.toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-1">Family expenses</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Today</span>
              </div>
              <p className="text-2xl font-bold text-green-700">₹{stats.todayTotal.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">Daily spending</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Expenses</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">{stats.count}</p>
              <p className="text-xs text-purple-600 mt-1">Total entries</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white overflow-y-auto p-6 space-y-4">
          {messages.length > 0 && messages[0].type === 'bot' && (
            <div className="mb-6">
              <div className="flex justify-start mb-6">
                <div className="max-w-2xl rounded-2xl px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                  <p className="text-sm leading-relaxed text-gray-700">{messages[0].text}</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Quick Actions
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {quickActions.map((qa, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputText(qa.action);
                        setTimeout(handleSendMessage, 100);
                      }}
                      className="px-3 py-2 bg-white hover:bg-blue-50 text-left text-gray-700 rounded-lg text-sm font-medium transition-all border border-gray-200 hover:border-blue-300 hover:shadow-sm flex items-center gap-2"
                    >
                      <span className="text-lg">{qa.icon}</span>
                      <span className="flex-1">{qa.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.slice(1).map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md rounded-2xl px-4 py-3 ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                    : msg.type === 'error'
                    ? 'bg-red-50 text-red-700 border-2 border-red-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                
                {msg.expense && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="opacity-80">Amount:</span>
                        <span className="font-bold">₹{msg.expense.amount}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="opacity-80">Category:</span>
                        <span className="font-semibold">{msg.expense.category}</span>
                      </div>
                    </div>
                  </div>
                )}

                {msg.parsedData && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs opacity-70">
                    {msg.parsedData.confidence && (
                      <span>Confidence: {Math.round(msg.parsedData.confidence * 100)}%</span>
                    )}
                    {msg.parsedData.parser && (
                      <span className="uppercase text-[10px]">{msg.parsedData.parser}</span>
                    )}
                  </div>
                )}

                {msg.context?.recentExpenses && msg.context.recentExpenses.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs font-semibold mb-2 text-gray-600">Recent Expenses:</p>
                    <div className="space-y-1">
                      {msg.context.recentExpenses.map((exp: any, idx: number) => (
                        <div key={idx} className="text-xs flex justify-between items-center bg-white/50 px-2 py-1 rounded">
                          <span className="truncate flex-1">{exp.description}</span>
                          <span className="font-semibold ml-2">₹{exp.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs opacity-60 mt-2">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2 border border-gray-200">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Processing your message...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-b-2xl shadow-lg p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type in any language: '500 for food' or 'खाने के लिए 500' or 'ഭക്ഷണത്തിന് 500'"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <p className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Multilingual AI • English, Hindi, Malayalam, Tamil, Telugu, Kannada
            </p>
            <p className="opacity-60">Press Enter to send</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseChatPage;