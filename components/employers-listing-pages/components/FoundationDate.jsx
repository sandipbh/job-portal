"use client";

import { useEffect, useState } from "react";
import Slider from "rc-slider";

import { useDispatch, useSelector } from "react-redux";
import { addFoundationDate } from "../../../features/filter/employerFilterSlice";

const FoundationDate = () => {
  const { foundationDate: getGoundationDate } =
    useSelector((state) => state.employerFilter) || {};
  const [foundationDate, setFoundationDate] = useState({
    min: getGoundationDate.min,
    max: getGoundationDate.max,
  });

  const dispath = useDispatch();

  const handleOnChange = (value) => {
    const updated = {
      min: value[0],
      max: value[1],
    };

    dispath(addFoundationDate(updated));
  };

  useEffect(() => {
    setFoundationDate(getGoundationDate);
  }, [setFoundationDate, getGoundationDate]);

  return (
    <div className="range-slider-one salary-range">
      <Slider
        range
        min={1900}
        max={2028}
        value={[foundationDate.min, foundationDate.max]}
        onChange={(value) => handleOnChange(value)}
      />
      <div className="input-outer">
        <div className="amount-outer">
          <span className="d-inline-flex align-items-center">
            <span className="min">{foundationDate.min}</span>
            <span className="max ms-2">{foundationDate.max}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default FoundationDate;
