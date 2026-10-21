import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  products: [],
  page: 1,
  pages: 1,
  total: 0,
  product: null,
  loading: false,
  error: null,
  success: false,
};

// Fetch product catalog with search, filter, sort & pagination
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (queryParams.keyword) params.append('keyword', queryParams.keyword);
      if (queryParams.category && queryParams.category !== 'All') params.append('category', queryParams.category);
      if (queryParams.minPrice) params.append('minPrice', queryParams.minPrice);
      if (queryParams.maxPrice) params.append('maxPrice', queryParams.maxPrice);
      if (queryParams.sort) params.append('sort', queryParams.sort);
      if (queryParams.page) params.append('page', queryParams.page);
      if (queryParams.limit) params.append('limit', queryParams.limit || 9);

      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Fetch single product details
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch product details');
    }
  }
);

// Admin: Create product
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create product');
    }
  }
);

// Admin: Update product
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update product');
    }
  }
);

// Admin: Delete product
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete product');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductDetails: (state) => {
      state.product = null;
    },
    resetProductStatus: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
        state.total = action.payload.total || 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Admin: Create
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Admin: Update
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.products.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Admin: Delete
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearProductDetails, resetProductStatus } = productSlice.actions;
export default productSlice.reducer;
