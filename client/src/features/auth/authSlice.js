import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '../../api/services.js';

const storedAuth = JSON.parse(localStorage.getItem('pansarAuth') || 'null');

const withApiError = (fn) => async (payload, { rejectWithValue }) => {
  try {
    return await fn(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Something went wrong');
  }
};

export const loginUser = createAsyncThunk('auth/login', withApiError(authApi.login));
export const registerUser = createAsyncThunk('auth/register', withApiError(authApi.register));
export const loadCurrentUser = createAsyncThunk('auth/me', withApiError(authApi.me));
export const saveProfile = createAsyncThunk('auth/profile', withApiError(authApi.updateProfile));

const persistAuth = (state) => {
  if (state.token && state.user) {
    localStorage.setItem(
      'pansarAuth',
      JSON.stringify({
        user: state.user,
        token: state.token,
      }),
    );
    return;
  }

  localStorage.removeItem('pansarAuth');
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedAuth?.user || null,
    token: storedAuth?.token || null,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      persistAuth(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        persistAuth(state);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        persistAuth(state);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        persistAuth(state);
      })
      .addCase(loadCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        persistAuth(state);
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        persistAuth(state);
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
