"use client";

import { useState } from "react";
import candidatesData from "../../../../../data/candidates";

const WidgetTopFilterBox = ({
  selectedJobs = [],
  setSelectedJobs,
  selectedLocation = [],
  setSelectedLocation,
  selectedExperience = [],
  setSelectedExperience,
  selectedQualification = [],
  setSelectedQualification,
  selectedGender = [],
  setSelectedGender,
  selectedCategory = [],
  setSelectedCategory,

  searchTerm,
  setSearchTerm,

}) => {
  const [openFilter, setOpenFilter] = useState(null);

  const jobOptions = [
    ...new Set(candidatesData.map((c) => c.designation)),
  ];

  const locationOptions = [
    ...new Set(candidatesData.map((c) => c.location)),
  ];

  const experienceOptions = [
    ...new Set(candidatesData.map((c) => c.experience)),
  ];

  const qualificationOptions = [
    ...new Set(candidatesData.map((c) => c.qualification)),
  ];

  const genderOptions = [
    ...new Set(candidatesData.map((c) => c.gender)),
  ];

  const categoryOptions = [
    ...new Set(candidatesData.map((c) => c.category)),
  ];
  const handleCheckbox = (
    value,
    selected = [],
    setSelected
  ) => {
    if (typeof setSelected !== "function") return;

    if (selected.includes(value)) {
      setSelected(
        selected.filter((item) => item !== value)
      );
    } else {
      setSelected([...selected, value]);
    }
  };

  const renderFilter = (
    title,
    options,
    selected,
    setSelected,
    key
  ) => (
    <div className="filter-dropdown">
      <button
        type="button"
        className="filter-btn"
        onClick={() =>
          setOpenFilter(
            openFilter === key ? null : key
          )
        }
      >
        <span>{title}</span>

        {selected.length > 0 &&
          ` (${selected.length})`}

        <span
          className={`la la-angle-down filter-arrow ${openFilter === key ? "open" : ""
            }`}
        ></span>

      </button>

      {openFilter === key && (
        <div className="filter-menu">
          {options.map((option) => (
            <label
              key={option}
              className="filter-option"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() =>
                  handleCheckbox(
                    option,
                    selected,
                    setSelected
                  )
                }
              />

              <span>{option}</span>
            </label>
          ))}

          <div className="filter-actions">
            <button
              type="button"
              className="clear-btn"
              onClick={() => setSelected([])}
            >
              Clear
            </button>
            <button
              type="button"
              className="apply-btn"
              onClick={() => setOpenFilter(null)}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
  return (
    <div className="job-bar-filter">
      <div className="filters-header">
        <h5>
          <span ></span>
          ☰ Filters
        </h5>
      </div>
      <div className="candidate-filter-bar">

        <div className="candidate-filter-search">
          <span className="candidate-filter-icon la la-search"></span>

          <input
            type="text"
            placeholder="Search Candidates..."
            className="candidate-filter-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="candidate-filter-actions">
          <button
            className="candidate-filter-clear-btn"
            onClick={() => {
              setSearchTerm("");
              setSelectedJobs([]);
              setSelectedLocation([]);
              setSelectedExperience([]);
              setSelectedQualification([]);
              setSelectedGender([]);
              setSelectedCategory([]);
            }}
          >
            <span className="la la-refresh"></span>
            Clear Filters
          </button>
        </div>

      </div>

      <div className="applicant-filter-bar">

        {renderFilter(
          "Select Job",
          jobOptions,
          selectedJobs,
          setSelectedJobs,
          "job"
        )}

        {renderFilter(
          "Location",
          locationOptions,
          selectedLocation,
          setSelectedLocation,
          "location"
        )}

        {renderFilter(
          "Experience",
          experienceOptions,
          selectedExperience,
          setSelectedExperience,
          "experience"
        )}

        {renderFilter(
          "Qualification",
          qualificationOptions,
          selectedQualification,
          setSelectedQualification,
          "qualification"
        )}
        {renderFilter(
          "Gender",
          genderOptions,
          selectedGender,
          setSelectedGender,
          "gender"
        )}

        {renderFilter(
          "Category",
          categoryOptions,
          selectedCategory,
          setSelectedCategory,
          "category"
        )}


      </div>
    </div>

  );
};

export default WidgetTopFilterBox;