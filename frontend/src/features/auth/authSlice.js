import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Load stored user data if present
const storedUser = localStorage.getItem('shopnest_user')
  ? JSON.parse(localStorage.getItem('shopnest_user'))
  : null;

const initialState = {
  user: storedUser,
  loading: false,
  error: null,
  successMessage: null,
  pendingVerificationEmail: localStorage.getItem('shopnest_pending_email') || null,
};

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('shopnest_pending_email', email);
      return { email, message: response.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      const userData = {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role || 'user',
      };
      localStorage.setItem('shopnest_user', JSON.stringify(userData));
      localStorage.removeItem('shopnest_pending_email');
      return userData;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Invalid or expired OTP');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role || 'user',
      };
      localStorage.setItem('shopnest_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout', {});
    } catch (err) {
      // Continue clearing local state regardless
    }
    localStorage.removeItem('shopnest_user');
    return null;
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send reset OTP');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/reset-password', { email, otp, newPassword });
      return response.data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Password reset failed');
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/user/profile', profileData);
      const updatedUser = {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      };
      localStorage.setItem('shopnest_user', JSON.stringify(updatedUser));
      return { user: updatedUser, message: response.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Profile update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setPendingVerificationEmail: (state, action) => {
      state.pendingVerificationEmail = action.payload;
      localStorage.setItem('shopnest_pending_email', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingVerificationEmail = action.payload.email;
        state.successMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.pendingVerificationEmail = null;
        state.successMessage = 'Account verified successfully!';
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.successMessage = action.payload.message || 'Profile updated successfully!';
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthError, clearSuccessMessage, setPendingVerificationEmail } = authSlice.actions;
export default authSlice.reducer;
