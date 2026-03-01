// store/index.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import wishlistReducer from "./slices/wishlistSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    wishlist: wishlistReducer
  },
  
});

export default store;