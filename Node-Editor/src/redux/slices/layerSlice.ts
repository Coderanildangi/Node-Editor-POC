import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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

// Export actions and reducer
export const { incrementLayer, decrementLayer, setChildNodeCount } = layerSlice.actions;
export default layerSlice.reducer;
