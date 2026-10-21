import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const storedCartItems = localStorage.getItem('shopnest_cart')
  ? JSON.parse(localStorage.getItem('shopnest_cart'))
  : [];

const storedShippingAddress = localStorage.getItem('shopnest_shipping')
  ? JSON.parse(localStorage.getItem('shopnest_shipping'))
  : {
      address: '',
      city: '',
      postalCode: '',
      country: '',
    };

const storedPaymentMethod = localStorage.getItem('shopnest_payment_method') || 'Razorpay';

const initialState = {
  cartItems: storedCartItems,
  shippingAddress: storedShippingAddress,
  paymentMethod: storedPaymentMethod,
  loading: false,
  error: null,
};

// Sync server cart when logged in
export const fetchServerCart = createAsyncThunk(
  'cart/fetchServerCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cart');
      const items = (response.data.items || []).map((item) => ({
        product: item.product._id || item.product,
        name: item.product.name,
        image: item.product.image,
        price: item.product.price,
        countInStock: item.product.countInStock,
        quantity: item.quantity,
      }));
      localStorage.setItem('shopnest_cart', JSON.stringify(items));
      return items;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Could not fetch cart');
    }
  }
);

// Add to server cart
export const addToServerCart = createAsyncThunk(
  'cart/addToServerCart',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart', { productId, quantity });
      const items = (response.data.items || []).map((item) => ({
        product: item.product._id || item.product,
        name: item.product.name,
        image: item.product.image,
        price: item.product.price,
        countInStock: item.product.countInStock,
        quantity: item.quantity,
      }));
      localStorage.setItem('shopnest_cart', JSON.stringify(items));
      return items;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Could not update cart');
    }
  }
);

// Remove from server cart
export const removeFromServerCart = createAsyncThunk(
  'cart/removeFromServerCart',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cart/${productId}`);
      const items = (response.data.items || []).map((item) => ({
        product: item.product._id || item.product,
        name: item.product.name,
        image: item.product.image,
        price: item.product.price,
        countInStock: item.product.countInStock,
        quantity: item.quantity,
      }));
      localStorage.setItem('shopnest_cart', JSON.stringify(items));
      return items;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Could not remove item from cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCartLocal: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x.product === item.product);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.product === existItem.product ? item : x
        );
      } else {
        state.cartItems.push(item);
      }
      localStorage.setItem('shopnest_cart', JSON.stringify(state.cartItems));
    },
    removeFromCartLocal: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x.product !== action.payload);
      localStorage.setItem('shopnest_cart', JSON.stringify(state.cartItems));
    },
    updateQuantityLocal: (state, action) => {
      const { product, quantity } = action.payload;
      const target = state.cartItems.find((x) => x.product === product);
      if (target) {
        target.quantity = quantity;
      }
      localStorage.setItem('shopnest_cart', JSON.stringify(state.cartItems));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shopnest_shipping', JSON.stringify(action.payload));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('shopnest_payment_method', action.payload);
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('shopnest_cart');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServerCart.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.loading = false;
      })
      .addCase(addToServerCart.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.loading = false;
      })
      .addCase(addToServerCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeFromServerCart.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.loading = false;
      });
  },
});

export const {
  addToCartLocal,
  removeFromCartLocal,
  updateQuantityLocal,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
