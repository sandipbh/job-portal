"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import jobs from "../../../../../data/job-featured.js";
import Image from "next/image.js";


import {
  statusOptions,
  jobTypeOptions,
  experienceOptions,
  dateOptions,
} from "../../../../../data/jobFilters";

const JobListingsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);

  const [showStatus, setShowStatus] = useState(false);
  const [showJobType, setShowJobType] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [location, setLocation] = useState("");

  const handleCheckbox = (value, selected, setSelected) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm === "" ||
      (job?.jobTitle || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesLocation =
      location === "" ||
      (job?.location || "")
        .toLowerCase()
        .includes(location.toLowerCase());

    const matchesExperience =
      selectedExperience.length === 0 ||
      selectedExperience.includes(job?.experience);

    const matchesDate =
      selectedDates.length === 0 ||
      selectedDates.includes(job?.created_at);

    const matchesJobType =
      selectedJobTypes.length === 0 ||
      job?.jobType?.some((type) =>
        selectedJobTypes.includes(type.type)
      );

    return (
      matchesSearch &&
      matchesLocation &&
      matchesExperience &&
      matchesDate &&
      matchesJobType
    );
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [jobsPerPage, setJobsPerPage] = useState(20);
  const totalPages = Math.ceil(
    filteredJobs.length / jobsPerPage
  );

  const startIndex = (currentPage - 1) * jobsPerPage;

  const endIndex = startIndex + jobsPerPage;

  const currentJobs = filteredJobs.slice(
    startIndex,
    endIndex
  );


  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    location,
    selectedStatus,
    selectedJobTypes,
    selectedExperience,
    selectedDates,
  ]);

  const PaginationControls = () => (
    <div className="custom-pagination">
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

      <div className="page-controls">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(1)}
        >
          <i className="la la-angle-double-left"></i>
        </button>

        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          <i className="la la-angle-left"></i>
        </button>

        <div className="page-box">
          Page {currentPage} of {totalPages || 1}
        </div>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          <i className="la la-angle-right"></i>
        </button>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(totalPages)}
        >
          <i className="la la-angle-double-right"></i>
        </button>
      </div>
    </div>
  );

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>Responses to your jobs and NVites will appear here</h4>
      </div>


      <div className="widget-content">
        <div className="filters-header">
          <h5>
            <span className="la la-filter"></span> Filters
          </h5>
        </div>
        <div className="job-filter-bar">


          {/* TOP ROW */}
          <div className="filter-top-row">

            <div className="filter-search search-input-wrapper">
              <span className="la la-search search-icon"></span>
              <input
                type="text"
                placeholder="Search by Title/Ref Code/Job ID..."
                className="form-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-search location-input-wrapper">
              <span className="la la-map-marker location-icon"></span>

              <input
                type="text"
                placeholder="Location"
                className="form-control"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

          </div>

          <div className="filter-bottom-row">
            {/* Status */}
            <div className="filter-dropdown">
              <button
                className="filter-btn"
                onClick={() => {
                  setShowStatus(!showStatus);
                  setShowJobType(false);
                  setShowExperience(false);
                  setShowDate(false);
                }}
              >
                Status
                {selectedStatus.length > 0 &&
                  ` (${selectedStatus.length})`}
                <span
                  className={`la la-angle-down filter-arrow ${showStatus ? "open" : ""
                    }`}
                ></span>
              </button>

              {showStatus && (
                <div className="filter-menu">
                  <h6>Status</h6>

                  {statusOptions.map((status) => (
                    <label key={status}>
                      <input
                        type="checkbox"
                        checked={selectedStatus.includes(status)}
                        onChange={() =>
                          handleCheckbox(
                            status,
                            selectedStatus,
                            setSelectedStatus
                          )
                        }
                      />
                      {status}
                    </label>
                  ))}

                  <div className="filter-actions">
                    <button
                      className="clear-btn"
                      onClick={() => setSelectedStatus([])}
                    >
                      Clear
                    </button>

                    <button
                      className="apply-btn"
                      onClick={() => setShowStatus(false)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Job Type */}
            <div className="filter-dropdown">
              <button
                className="filter-btn"
                onClick={() => setShowJobType(!showJobType)}
              >
                Job Type

                {selectedJobTypes.length > 0 &&
                  ` (${selectedJobTypes.length})`}
                <span
                  className={`la la-angle-down filter-arrow ${showJobType ? "open" : ""
                    }`}
                ></span>
              </button>
              {showJobType && (
                <div className="filter-menu">
                  <h6>Job Type</h6>

                  {jobTypeOptions.map((type) => (
                    <label key={type}>
                      <input
                        type="checkbox"
                        checked={selectedJobTypes.includes(type)}
                        onChange={() =>
                          handleCheckbox(
                            type,
                            selectedJobTypes,
                            setSelectedJobTypes
                          )
                        }
                      />
                      {type}
                    </label>
                  ))}

                  <div className="filter-actions">
                    <button
                      className="clear-btn"
                      onClick={() => setSelectedJobTypes([])}
                    >
                      Clear
                    </button>

                    <button
                      className="apply-btn"
                      onClick={() => setShowJobType(false)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Experience */}
            <div className="filter-dropdown">
              <button
                className="filter-btn"
                onClick={() =>
                  setShowExperience(!showExperience)

                }
              >
                Experience
                {selectedExperience.length > 0 &&
                  ` (${selectedExperience.length})`}
                <span
                  className={`la la-angle-down filter-arrow ${showExperience ? "open" : ""
                    }`}
                ></span>

              </button>

              {showExperience && (
                <div className="filter-menu">
                  <h6>Experience</h6>

                  {experienceOptions.map((exp) => (
                    <label key={exp}>
                      <input
                        type="checkbox"
                        checked={selectedExperience.includes(exp)}
                        onChange={() =>
                          handleCheckbox(
                            exp,
                            selectedExperience,
                            setSelectedExperience
                          )
                        }
                      />
                      {exp}
                    </label>
                  ))}
                  <div className="filter-actions">
                    <button
                      className="clear-btn"
                      onClick={() => setSelectedExperience([])}
                    >
                      Clear
                    </button>

                    <button
                      className="apply-btn"
                      onClick={() => setShowExperience(false)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>



            {/* Date */}
            <div className="filter-dropdown">
              <button
                className="filter-btn"
                onClick={() => setShowDate(!showDate)}
              >
                Date Posted
                {selectedDates.length > 0 &&
                  ` (${selectedDates.length})`}
                <span
                  className={`la la-angle-down filter-arrow ${showDate ? "open" : ""
                    }`}
                ></span>
              </button>

              {showDate && (
                <div className="filter-menu">
                  <h6>Date Posted</h6>

                  {dateOptions.map((date) => (
                    <label key={date}>
                      <input
                        type="checkbox"
                        checked={selectedDates.includes(date)}
                        onChange={() =>
                          handleCheckbox(
                            date,
                            selectedDates,
                            setSelectedDates
                          )
                        }
                      />
                      {date}
                    </label>
                  ))}
                  <div className="filter-actions">
                    <button
                      className="clear-btn"
                      onClick={() => setSelectedDates([])}
                    >
                      Clear
                    </button>

                    <button
                      className="apply-btn"
                      onClick={() => setShowDate(false)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="search-btn-wrapper">
              <button
                className="clear-all-btn"
                onClick={() => {
                  setSearchTerm("");
                  setLocation("");
                  setSelectedStatus([]);
                  setSelectedJobTypes([]);
                  setSelectedExperience([]);
                  setSelectedDates([]);
                }}
              >
                <span className="la la-refresh"></span>
                Clear Filters
              </button>

              <button className="theme-btn btn-style-one">
                <span className="la la-search"></span>
                Search
              </button>
            </div>

          </div>
        </div>


        <div className="selected-filters">

          {selectedStatus.map((item) => (
            <span key={item} className="filter-tag">
              {item}
              <button
                className="tag-close"
                onClick={() =>
                  setSelectedStatus(
                    selectedStatus.filter((s) => s !== item)
                  )
                }
              >
                ×
              </button>
            </span>
          ))}

          {selectedJobTypes.map((item) => (
            <span key={item} className="filter-tag">
              {item}
              <button
                className="tag-close"
                onClick={() =>
                  setSelectedJobTypes(
                    selectedJobTypes.filter((s) => s !== item)
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

          {selectedDates.map((item) => (
            <span key={item} className="filter-tag">
              {item}
              <button
                className="tag-close"
                onClick={() =>
                  setSelectedDates(
                    selectedDates.filter((s) => s !== item)
                  )
                }
              >
                ×
              </button>
            </span>
          ))}

        </div>
        {/* <div className="chosen-outer">
      
          <select className="chosen-single form-select">
            <option>Last 6 Months</option>
            <option>Last 12 Months</option>
            <option>Last 16 Months</option>
            <option>Last 24 Months</option>
            <option>Last 5 year</option>
          </select>
        </div> */}
      </div>


      {/* End filter top bar */}

      {/* Start table widget content */}
      <div className="widget-content">
        <div className="filter-summary">
          {selectedStatus.length +
            selectedJobTypes.length +
            selectedExperience.length +
            selectedDates.length}{" "}
          filters applied
        </div>
        <div className="table-outer">
          <div className="table-header-actions">
            <PaginationControls />
          </div>

          <table className="default-table manage-job-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Applications</th>
                <th>Created & Expired</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentJobs.map((item) => (
                <tr key={item.id}>
                  <td>
                    {/* <!-- Job Block --> */}
                    <div className="job-block">
                      <div className="inner-box">
                        <div className="content">
                          <span className="company-logo">
                            <Image
                              width={50}
                              height={49}
                              src={item.logo}
                              alt="logo"
                            />
                          </span>
                          <h4>
                            <Link href={`/job-single-v3/${item.id}`}>
                              {item.jobTitle}
                            </Link>
                          </h4>
                          <ul className="job-info">
                            <li>
                              <span className="icon flaticon-briefcase"></span>
                              Segment
                            </li>
                            <li>
                              <span className="icon flaticon-map-locator"></span>
                              London, UK
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="applied">
                    <a href="#">3+ Applied</a>
                  </td>
                  <td>
                    October 27, 2017 <br />
                    April 25, 2011
                  </td>
                  <td className="status">Active</td>
                  <td>
                    <div className="option-box">
                      <ul className="option-list">
                        <li>
                          <button data-text="View Aplication">
                            <span className="la la-eye"></span>
                          </button>
                        </li>
                        <li>
                          <Link
                            href={`/employers-dashboard/post-jobs?jobId=${item.id}`}
                          >
                            <button data-text="Edit Job">
                              <span className="la la-pencil"></span>
                            </button>
                          </Link>
                        </li>
                        <li>
                          <button data-text="Delete Aplication">
                            <span className="la la-trash"></span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationControls />
        </div>


      </div>
      {/* End table widget content */}
    </div >
  );
};

export default JobListingsTable;
