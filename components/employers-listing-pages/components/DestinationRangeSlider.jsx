"use client";

import { useEffect, useState } from "react";
import Slider from "rc-slider";

import { useDispatch, useSelector } from "react-redux";
import { addDestination } from "../../../features/filter/employerFilterSlice";

const DestinationRangeSlider = () => {
  const { destination } = useSelector((state) => state.employerFilter);
  const [getDestination, setDestination] = useState({
    min: destination.min,
    max: destination.max,
  });

  const dispatch = useDispatch();

  // destination handler
  const handleOnChange = (value) => {
    const updated = {
      min: value[0],
      max: value[1],
    };

    dispatch(addDestination(updated));
  };

  // destination dispatch
  useEffect(() => {
    setDestination(destination);
  });

  return (
    <div className="range-slider-one">
      <Slider
        min={0}
        range
        max={100}
        value={[getDestination.min, getDestination.max]}
        onChange={(value) => handleOnChange(value)}
      />
      <div className="input-outer">
        <div className="amount-outer">
          <span className="area-amount">{getDestination.max}</span>
          km
        </div>
      </div>
    </div>
  );
};

export default DestinationRangeSlider;
