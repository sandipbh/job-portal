"use client";

import { useEffect, useState } from "react";
import Slider from "rc-slider";

import { useDispatch, useSelector } from "react-redux";
import { addSalary } from "../../../features/filter/filterSlice";

const SalaryRangeSlider = () => {
  const { jobList } = useSelector((state) => state.filter);
  const [salary, setSalary] = useState({
    min: jobList.salary.min,
    max: jobList.salary.max,
  });

  const dispatch = useDispatch();

  const handleOnChange = (value) => {
    const updated = {
      min: value[0],
      max: value[1],
    };
    dispatch(addSalary(updated));
  };

  useEffect(() => {
    setSalary({
      min: jobList.salary.min,
      max: jobList.salary.max,
    });
  }, [setSalary, jobList]);

  return (
    <div className="range-slider-one salary-range">
      <Slider
        min={0}
        range
        max={2000}
        value={[salary.min, salary.max]}
        onChange={(value) => handleOnChange(value)}
      />
      <div className="input-outer">
        <div className="amount-outer">
          <span className="d-inline-flex align-items-center">
            <span className="min">${salary.min}</span>
            <span className="max ms-2">${salary.max}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SalaryRangeSlider;
