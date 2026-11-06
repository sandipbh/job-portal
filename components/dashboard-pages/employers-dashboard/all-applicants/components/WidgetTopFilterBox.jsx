
"use client";
import { useState } from "react";

const WidgetToFilterBox = ({
  selectedJobs = [], setSelectedJobs,
  selectedLocation = [], setSelectedLocation,
  selectedExperience = [], setSelectedExperience,
  selectedQualification = [], setSelectedQualification,
  selectedGender = [], setSelectedGender,
  selectedRating = [], setSelectedRating,
  verifiedCandidate = false, setVerifiedCandidate,
  searchTerm = "", setSearchTerm,
  jobOptions = [], locationOptions = []
}) => {
  const [openFilter, setOpenFilter] = useState(null);

  const experienceOptions = ["1", "2", "3", "4", "5+"];
  const qualificationOptions = ["10th", "12th", "Graduate/Diploma", "Post Graduate/Master's", "Doctorate/PhD"];
  const genderOptions = ["Male", "Female", "Both"];
  const ratingOptions = ["5", "4", "3", "2", "1"];

  const filters = [
    { key: "job", title: "Select Job", options: jobOptions, selected: selectedJobs, setter: setSelectedJobs },
    { key: "location", title: "Location", options: locationOptions, selected: selectedLocation, setter: setSelectedLocation },
    { key: "experience", title: "Experience", options: experienceOptions, selected: selectedExperience, setter: setSelectedExperience },
    { key: "qualification", title: "Qualification", options: qualificationOptions, selected: selectedQualification, setter: setSelectedQualification },
    { key: "gender", title: "Gender", options: genderOptions, selected: selectedGender, setter: setSelectedGender },
    { key: "rating", title: "Rating", options: ratingOptions, selected: selectedRating, setter: setSelectedRating }
  ];

  const handleCheckbox = (value, selected, setter) => {
    if (typeof setter !== "function") return;
    const current = Array.isArray(selected) ? selected : [];
    setter(current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
  };

  const clearAllFilters = () => {
    setSearchTerm?.("");
    setSelectedJobs?.([]);
    setSelectedLocation?.([]);
    setSelectedExperience?.([]);
    setSelectedQualification?.([]);
    setSelectedGender?.([]);
    setSelectedRating?.([]);
    setVerifiedCandidate?.(false);
    setOpenFilter(null);
  };

  const totalFilters = filters.reduce((total, filter) => total + filter.selected.length, 0) + (verifiedCandidate ? 1 : 0);

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
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="candidate-filter-actions">
          <button type="button" className="candidate-filter-clear-btn" onClick={clearAllFilters}>
            <span className="la la-refresh"></span>
            <span className="txt-clear">Clear Filters</span>
          </button>
        </div>
      </div>

      <div className="applicant-filter-bar">
        {filters.map(filter => (
          <div className="filter-dropdown" key={filter.key}>
            <button
              type="button"
              className="filter-btn"
              onClick={() => setOpenFilter(openFilter === filter.key ? null : filter.key)}
            >
              <span>{filter.title}</span>
              {filter.selected.length > 0 && ` (${filter.selected.length})`}
              <span className={`la la-angle-down filter-arrow ${openFilter === filter.key ? "open" : ""}`}></span>
            </button>

            {openFilter === filter.key && (
              <div className="filter-menu">
                {filter.options.length > 0 ? (
                  filter.options.map(option => (
                    <label key={option} className="filter-option">
                      <input
                        type="checkbox"
                        className="me-2"
                        checked={filter.selected.includes(option)}
                        onChange={() => handleCheckbox(option, filter.selected, filter.setter)}
                      />
                      <span>{option}</span>
                    </label>
                  ))
                ) : (
                  <div className="text-muted small p-2">No options available</div>
                )}

                <div className="filter-actions">
                  <button type="button" className="clear-btn" onClick={() => filter.setter?.([])}>
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        <label className="filter-option verified-filter">
          <input
            type="checkbox"
            className="me-2"
            checked={Boolean(verifiedCandidate)}
            onChange={e => setVerifiedCandidate?.(e.target.checked)}
          />
          <span>Verified Candidate</span>
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
