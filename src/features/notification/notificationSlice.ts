// src/features/notifications/notificationSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

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

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

export const getNotifications = createAsyncThunk(
  'notifications/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markAsSeen = createAsyncThunk(
  'notifications/markAsSeen',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/seen`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as seen');
    }
  }
);

export const markAllAsSeen = createAsyncThunk(
  'notifications/markAllAsSeen',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.put('/notifications/mark-all-seen');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as seen');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Notifications
      .addCase(getNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Unread Count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count;
      })
      // Mark as Seen
      .addCase(markAsSeen.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          (n) => n._id === action.payload.notification._id
        );
        if (index !== -1) {
          state.notifications[index].seen = true;
        }
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      // Mark All as Seen
      .addCase(markAllAsSeen.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.seen = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { clearError } = notificationSlice.actions;
export default notificationSlice.reducer;