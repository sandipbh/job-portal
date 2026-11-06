"use client";
import { useState } from "react";

const WidgetToFilterBox = ({
  selectedJobs = [], setSelectedJobs,
  selectedLocation = [], setSelectedLocation,
  selectedExperience = [], setSelectedExperience,
  selectedQualification = [], setSelectedQualification,
  selectedGender = [], setSelectedGender,
  selectedCategory = [], setSelectedCategory,
  selectedRating = [], setSelectedRating,
  verifiedCandidate = false,
  setVerifiedCandidate,
  searchTerm = "", setSearchTerm,
  location = "", setLocation,
  jobOptions = [],
  locationOptions = [],
  ratingOptions = [],
  categoryOptions = []
}) => {
  const [openFilter, setOpenFilter] = useState(null);

  const experienceOptions = ["1", "2", "3", "4", "5+"];

  const qualificationOptions = [
    "10th",
    "12th",
    "Graduate/Diploma",
    "Post Graduate/Master's",
    "Doctorate/PhD"
  ];

  const genderOptions = ["Male", "Female", "Both"];

  const handleCheckbox = (value, selected, setSelected) => {
    setSelected(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  };

  const renderFilter = (title, options, selected, setSelected, key) => (
    <div className="filter-dropdown" key={key}>
      <button
        type="button"
        className="filter-btn"
        onClick={() => setOpenFilter(openFilter === key ? null : key)}
      >
        <span>{title}</span>
        {selected.length > 0 && ` (${selected.length})`}
        <span
          className={`la la-angle-down filter-arrow ${openFilter === key ? "open" : ""
            }`}
        ></span>
      </button>

      {openFilter === key && (
        <div className="filter-menu">
          {options.length > 0 ? (
            options.map((option) => (
              <label key={option} className="filter-option">
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() =>
                    handleCheckbox(option, selected, setSelected)
                  }
                />
                <span>{option}</span>
              </label>
            ))
          ) : (
            <div className="text-muted small p-2">No options available</div>
          )}

          <div className="filter-actions">
            <button
              type="button"
              className="clear-btn"
              onClick={() => setSelected([])}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const clearAllFilters = () => {
    setSearchTerm?.("");
    setLocation?.("");
    setSelectedJobs?.([]);
    setSelectedLocation?.([]);
    setSelectedExperience?.([]);
    setSelectedQualification?.([]);
    setSelectedGender?.([]);
    setSelectedCategory?.([]);
    setSelectedRating?.([]);
    setOpenFilter(null);
    setVerifiedCandidate?.(false);
  };

  const totalFilters =
    selectedJobs.length +
    selectedLocation.length +
    selectedExperience.length +
    selectedQualification.length +
    selectedGender.length +
    selectedCategory.length +
    selectedRating.length; +
      (verifiedCandidate ? 1 : 0);

  return (
    <div className="job-bar-filter">
      <div className="filters-header">
        <h5>☰ Filters</h5>
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
            type="button"
            className="candidate-filter-clear-btn"
            onClick={clearAllFilters}
          >
            <span className="la la-refresh"></span>
            <span className="txt-clear">Clear Filters</span>
          </button>
        </div>
      </div>

      <div className="applicant-filter-bar">
        {renderFilter("Select Job", jobOptions, selectedJobs, setSelectedJobs, "job")}
        {renderFilter("Location", locationOptions, selectedLocation, setSelectedLocation, "location")}
        {renderFilter("Experience", experienceOptions, selectedExperience, setSelectedExperience, "experience")}
        {renderFilter("Qualification", qualificationOptions, selectedQualification, setSelectedQualification, "qualification")}
        {renderFilter("Gender", genderOptions, selectedGender, setSelectedGender, "gender")}
        {renderFilter("Rating", ratingOptions, selectedRating, setSelectedRating, "rating")}
        <label className="filter-option">
          <input
            type="checkbox"
            checked={verifiedCandidate}
            onChange={(e) => setVerifiedCandidate(e.target.checked)}
          />
          <small className="ms-2">Verified Candidate</small>
        </label>
      </div>

      {totalFilters > 0 && (
        <div className="mt-2">
          <small className="text-muted">{totalFilters} filters selected</small>
        </div>
      )}
    </div>
  );
};

export default WidgetToFilterBox;