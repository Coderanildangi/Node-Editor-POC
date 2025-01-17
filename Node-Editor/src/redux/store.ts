import { configureStore } from "@reduxjs/toolkit";
import layerReducer from "./slices/layerSlice"; // Import the slice reducer

// Configure the store
const store = configureStore({
  reducer: {
    layers: layerReducer, // Add the slice reducer
  },
});

// Export the store and types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;