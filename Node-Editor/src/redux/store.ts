import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state
interface LayerState {
  layerCount: number;
  childNodeCount: number;
}

const initialState: LayerState = {
  layerCount: 0,
  childNodeCount: 1,
};

// Create a slice
const layerSlice = createSlice({
  name: "layers",
  initialState,
  reducers: {
    incrementLayer: (state) => {
      state.layerCount += 1;
    },
    decrementLayer: (state) => {
      if (state.layerCount > 0) {
        state.layerCount -= 1;
      }
    },
    setChildNodeCount: (state, action: PayloadAction<number>) => {
      state.childNodeCount = action.payload;
    },
  },
});

// Export actions
export const { incrementLayer, decrementLayer, setChildNodeCount } = layerSlice.actions;

// Configure the store
const store = configureStore({
  reducer: {
    layers: layerSlice.reducer,
  },
});

// Export the store and types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
