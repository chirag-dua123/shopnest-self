import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  currentOrder: null,
  orders: [],
  myOrders: [],
  loading: false,
  error: null,
  success: false,
  paymentLoading: false,
  paymentSuccess: false,
};

// Create a new order
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to place order');
    }
  }
);

// Get order details by ID
export const getOrderDetails = createAsyncThunk(
  'orders/getOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch order details');
    }
  }
);

// Get logged-in user order history
export const getMyOrders = createAsyncThunk(
  'orders/getMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/myorders');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// Admin: Get all orders
export const getAllOrders = createAsyncThunk(
  'orders/getAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch all orders');
    }
  }
);

// Admin: Update order status
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${orderId}`, { status });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update order status');
    }
  }
);

// Payment: Create Razorpay Order
export const createRazorpayPayment = createAsyncThunk(
  'orders/createRazorpayPayment',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.post('/payment/razorpay-order', { orderId });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to initialize payment gateway');
    }
  }
);

// Payment: Verify Razorpay Signature
export const verifyRazorpayPayment = createAsyncThunk(
  'orders/verifyRazorpayPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/payment/verify', paymentData);
      return response.data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Payment verification failed');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.currentOrder = null;
      state.success = false;
      state.error = null;
      state.paymentSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Order Details
      .addCase(getOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // My Orders
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrders = action.payload;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Admin: All Orders
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Admin: Update Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        if (state.currentOrder && state.currentOrder._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
        state.orders = state.orders.map((o) =>
          o._id === action.payload._id ? action.payload : o
        );
      })
      // Verify Payment
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.paymentLoading = true;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.paymentSuccess = true;
        state.currentOrder = action.payload;
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
