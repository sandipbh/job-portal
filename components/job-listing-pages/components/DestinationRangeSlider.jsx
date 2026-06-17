"use client";

import { useEffect, useState } from "react";
import Slider from "rc-slider";

import { useDispatch, useSelector } from "react-redux";
import { addDestination } from "../../../features/filter/filterSlice";

const DestinationRangeSlider = () => {
  const { jobList } = useSelector((state) => state.filter);

  const [destination, setDestination] = useState({
    min: jobList.destination.min,
    max: jobList.destination.max,
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

  useEffect(() => {
    setDestination({
      min: jobList.destination.min,
      max: jobList.destination.max,
    });
  }, [setDestination, jobList]);

  return (
    <div className="range-slider-one">
      <Slider
        min={0}
        range
        max={100}
        value={[destination.min, destination.max]}
        onChange={(value) => handleOnChange(value)}
      />
      <div className="input-outer">
        <div className="amount-outer">
          <span className="area-amount">{destination.max}</span>
          km
        </div>
      </div>
    </div>
  );
};

export default DestinationRangeSlider;
