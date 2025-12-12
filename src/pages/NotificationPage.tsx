import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import { 
  getNotifications, 
  markAsSeen, 
  markAllAsSeen,
  getUnreadCount 
} from '../features/notification/notificationSlice';

interface Notification {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  message: string;
  expenseId?: string;
  date: string;
  seen: boolean;
}

const NotificationsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, isLoading } = useSelector(
    (state: RootState) => state.notifications
  );
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    // Initial load
    dispatch(getNotifications());
    dispatch(getUnreadCount());

    // Poll for new notifications every 10 seconds
    const interval = setInterval(() => {
      dispatch(getNotifications());
      dispatch(getUnreadCount());
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleMarkAsSeen = async (notificationId: string) => {
    try {
      await dispatch(markAsSeen(notificationId)).unwrap();
      // Refresh both notifications and count
      dispatch(getNotifications());
      dispatch(getUnreadCount());
    } catch (error) {
      console.error('Failed to mark as seen:', error);
    }
  };

  const handleMarkAllAsSeen = async () => {
    try {
      await dispatch(markAllAsSeen()).unwrap();
      // Refresh both notifications and count
      dispatch(getNotifications());
      dispatch(getUnreadCount());
    } catch (error) {
      console.error('Failed to mark all as seen:', error);
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter((n: Notification) => !n.seen)
    : notifications;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getNotificationIcon = (message: string) => {
    if (message.includes('added') || message.includes('created')) {
      return '💰';
    }
    if (message.includes('updated') || message.includes('modified')) {
      return '✏️';
    }
    if (message.includes('deleted') || message.includes('removed')) {
      return '🗑️';
    }
    if (message.includes('joined')) {
      return '👋';
    }
    return '🔔';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsSeen}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === 'unread'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-gray-600">
                {filter === 'unread' 
                  ? "You're all caught up!" 
                  : 'When family members add expenses, you\'ll see notifications here'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification: Notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow relative ${
                  !notification.seen ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      !notification.seen ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {getNotificationIcon(notification.message)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`text-sm ${
                            !notification.seen ? 'font-semibold text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {notification.user?.name || 'Unknown User'}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.date)}
                            </span>
                          </div>
                        </div>

                        {/* Mark as read button */}
                        {!notification.seen && (
                          <button
                            onClick={() => handleMarkAsSeen(notification._id)}
                            className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>

                      {/* View Expense Link */}
                      {notification.expenseId && (
                        <button
                          onClick={() => {
                            window.location.href = `/expenses`;
                          }}
                          className="mt-2 text-xs text-blue-600 hover:underline"
                        >
                          View expenses →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Unread indicator dot */}
                  {!notification.seen && (
                    <div className="absolute top-4 right-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats Footer */}
        {notifications.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Total: {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </span>
              <span>
                {notifications.filter((n: Notification) => n.seen).length} read • {unreadCount} unread
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;