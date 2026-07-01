"use client";
import Applicants from "./Applicants";
import { useState, useEffect } from "react";
import WidgetToFilterBox from "./WidgetToFilterBox";
import Link from "next/link";
import candidatesData from "../../../../../data/candidates";


const WidgetContentBox = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedQualification, setSelectedQualification] = useState([]);
  const [selectedGender, setSelectedGender] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);

  const filteredCandidates = candidatesData.filter((candidate) => {
    const matchesJob =
      selectedJobs.length === 0 ||
      selectedJobs.includes(candidate.designation);

    const matchesLocation =
      selectedLocation.length === 0 ||
      selectedLocation.includes(candidate.location);

    const matchesExperience =
      selectedExperience.length === 0 ||
      selectedExperience.includes(candidate.experience);

    const matchesQualification =
      selectedQualification.length === 0 ||
      selectedQualification.includes(candidate.qualification);

    const matchesGender =
      selectedGender.length === 0 ||
      selectedGender.includes(candidate.gender);

    const matchesCategory =
      selectedCategory.length === 0 ||
      selectedCategory.includes(candidate.category);

    const matchesSearch =
      searchTerm === "" ||
      (candidate?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return (
      matchesSearch &&
      matchesJob &&
      matchesLocation &&
      matchesExperience &&
      matchesQualification &&
      matchesGender &&
      matchesCategory
    );
  });



  const [currentPage, setCurrentPage] = useState(1);

  const [jobsPerPage, setJobsPerPage] = useState(20);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCandidates.length / jobsPerPage)
  );
  const startIndex = (currentPage - 1) * jobsPerPage;

  const endIndex = startIndex + jobsPerPage;

  const currentJobs = filteredCandidates.slice(
    startIndex,
    endIndex
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedLocation,
    selectedJobs,
    selectedExperience,
    selectedQualification,
    selectedGender,
    selectedCategory,
  ])



  const PaginationControls = () => {
    const getPages = () => {
      const pages = [];
      const maxVisible = 5;

      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        start = 1;
        end = Math.min(totalPages, maxVisible);
      }

      if (currentPage >= totalPages - 2) {
        start = Math.max(1, totalPages - (maxVisible - 1));
        end = totalPages;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    };
    return (
      <div className="custom-pagination job-style">

        {/* Page Size */}
        <div className="page-size">
          <span>Show</span>
          <select
            value={jobsPerPage}
            onChange={(e) => {
              setJobsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={40}>40</option>
            <option value={60}>60</option>
            <option value={80}>80</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Controls */}
        <div className="page-controls">

          {/* First */}
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            «
          </button>

          {/* Prev */}
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ‹
          </button>

          {/* Pages */}
          {getPages().map((page) => (
            <button
              key={page}
              className={currentPage === page ? "active" : ""}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          {/* Next */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            ›
          </button>

          {/* Last */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            »
          </button>

        </div>
      </div>
    );
  };

  return (
    <div className="widget-content">
      <WidgetToFilterBox
        selectedJobs={selectedJobs}
        setSelectedJobs={setSelectedJobs}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedExperience={selectedExperience}
        setSelectedExperience={setSelectedExperience}
        selectedQualification={selectedQualification}
        setSelectedQualification={setSelectedQualification}
        selectedGender={selectedGender}
        setSelectedGender={setSelectedGender}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}

        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        location={location}
        setLocation={setLocation}
      />

      <div className="selected-filters">

        {selectedJobs.map((item) => (
          <span key={item} className="filter-tag">
            {item}
            <button
              className="tag-close"
              onClick={() =>
                setSelectedJobs(
                  selectedJobs.filter((s) => s !== item)
                )
              }
            >
              ×
            </button>
          </span>
        ))}

        {selectedLocation.map((item) => (
          <span key={item} className="filter-tag">
            {item}
            <button
              className="tag-close"
              onClick={() =>
                setSelectedLocation(
                  selectedLocation.filter((s) => s !== item)
                )
              }
            >
              ×
            </button>
          </span>
        ))}

        {selectedExperience.map((item) => (
          <span key={item} className="filter-tag">
            {item}
            <button
              className="tag-close"
              onClick={() =>
                setSelectedExperience(
                  selectedExperience.filter((s) => s !== item)
                )
              }
            >
              ×
            </button>
          </span>
        ))}

        {selectedQualification.map((item) => (
          <span key={item} className="filter-tag">
            {item}
            <button
              className="tag-close"
              onClick={() =>
                setSelectedQualification(
                  selectedQualification.filter((s) => s !== item)
                )
              }
            >
              ×
            </button>
          </span>
        ))}

        {selectedGender.map((item) => (
          <span key={item} className="filter-tag">
            {item}
            <button
              className="tag-close"
              onClick={() =>
                setSelectedGender(
                  selectedGender.filter((s) => s !== item)
                )
              }
            >
              ×
            </button>
          </span>
        ))}

        {selectedCategory.map((item) => (
          <span key={item} className="filter-tag">
            {item}
            <button
              className="tag-close"
              onClick={() =>
                setSelectedCategory(
                  selectedCategory.filter((s) => s !== item)
                )
              }
            >
              ×
            </button>
          </span>
        ))}

      </div>

      <div className="filter-summary">
        {selectedJobs.length +
          selectedLocation.length +
          selectedExperience.length +
          selectedQualification.length +
          selectedGender.length +
          selectedCategory.length}{" "}
        filters applied
      </div>

      <div className="table-header-actions">
        <PaginationControls />
      </div>

      <div className="row">
        {currentJobs.length > 0 ? (
          <Applicants candidates={currentJobs} />
        ) : (
          <div className="col-12 text-center py-5">
            <h5>No applicants found</h5>
          </div>
        )}
        <Applicants candidates={currentJobs} />
      </div>
      <PaginationControls />
    </div>
  );
};

export default WidgetContentBox;
