import React from "react";
import "../styles/toolbar.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { incrementLayer, decrementLayer, setChildNodeCount } from "../redux/slices/layerSlice";
import DarkMode from "./darkmode";

const Toolbar: React.FC = () => {
  const dispatch = useDispatch();
  const layerCount = useSelector((state: RootState) => state.layers.layerCount);
  const childNodeCount = useSelector((state: RootState) => state.layers.childNodeCount);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10);
    dispatch(setChildNodeCount(count));
    console.log(`Child nodes updated to: ${count}`);
  };

  return (
    <div className="toolbar">
      <button onClick={() => dispatch(incrementLayer())}>+ Add Layer</button>
      <span className="layer-count">Layers: {layerCount}</span>
      <button onClick={() => dispatch(decrementLayer())} disabled={layerCount === 0}>
        - Remove Layer
      </button>
      <div className="slider-container">
        <label htmlFor="child-slider">Child Nodes: {childNodeCount}</label>
        <input
          id="child-slider"
          type="range"
          min="1"
          max="10"
          value={childNodeCount}
          onChange={handleSliderChange}
        />
      </div>
      <DarkMode />
    </div>
  );
};

export default Toolbar;
