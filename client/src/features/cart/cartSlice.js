import { createSlice } from '@reduxjs/toolkit';

const storedCart = JSON.parse(localStorage.getItem('pansarCart') || '[]');

const persistCart = (items) => {
  localStorage.setItem('pansarCart', JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: storedCart,
  },
  reducers: {
    addToCart(state, action) {
      const product = action.payload.product || action.payload;
      const quantity = action.payload.quantity || 1;
      const existing = state.items.find((item) => item.product === product._id);

      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, product.stock);
      } else {
        state.items.push({
          product: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.image?.url || '',
          unit: product.unit,
          stock: product.stock,
          quantity: Math.min(quantity, product.stock),
        });
      }

      persistCart(state.items);
    },
    updateQuantity(state, action) {
      const item = state.items.find((cartItem) => cartItem.product === action.payload.product);

      if (item) {
        item.quantity = Math.min(
          Math.max(Number(action.payload.quantity), 1),
          item.stock || Number.MAX_SAFE_INTEGER,
        );
      }

      persistCart(state.items);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((item) => item.product !== action.payload);
      persistCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      persistCart(state.items);
    },
  },
});

export const { addToCart, clearCart, removeFromCart, updateQuantity } = cartSlice.actions;
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export default cartSlice.reducer;
