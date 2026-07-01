"use client";

import candidatesData from "../../../../../data/candidates";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import WidgetTopFilterBox from "./WidgetTopFilterBox";

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
  const totalPages = Math.ceil(
    filteredCandidates.length / jobsPerPage
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

  const approvedCandidates = filteredCandidates.filter(
    (candidate) => candidate.status === "Approved"
  );

  const rejectedCandidates = filteredCandidates.filter(
    (candidate) => candidate.status === "Rejected"
  );

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
  };
  return (
    <div className="widget-content">
      <div className="tabs-box">
        <WidgetTopFilterBox
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

        <Tabs>
          <div className="aplicants-upper-bar">
            <h6>Senior Product Designer</h6>

            <TabList className="aplicantion-status tab-buttons clearfix">
              <Tab className="tab-btn totals">
                Total(s): {filteredCandidates.length}
              </Tab>

              <Tab className="tab-btn approved">
                Approved: {approvedCandidates.length}
              </Tab>

              <Tab className="tab-btn rejected">
                Rejected(s): {rejectedCandidates.length}
              </Tab>
            </TabList>
          </div>

          <div className="tabs-content">
            <TabPanel>
              <div className="row">
                {filteredCandidates.length === 0 ? (
                  <div className="col-12 text-center py-5">
                    <h5>No applicants found</h5>
                  </div>
                ) : (
                  currentJobs.map((candidate) => (
                    <div
                      className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                      key={candidate.id}
                    >

                      <div className="inner-box">
                        <div className="content">
                          <figure className="image">
                            <Image
                              width={90}
                              height={90}
                              src={candidate.avatar}
                              alt="candidates"
                            />
                          </figure>
                          <h4 className="name">
                            <Link href={`/candidates-single-v1/${candidate.id}`}>
                              {candidate.name}
                            </Link>
                          </h4>

                          <ul className="candidate-info">
                            <li className="designation">
                              {candidate.designation}
                            </li>
                            <li>
                              <span className="icon flaticon-map-locator"></span>{" "}
                              {candidate.location}
                            </li>
                            <li>
                              <span className="icon flaticon-money"></span> $
                              {candidate.hourlyRate} / hour
                            </li>
                          </ul>
                          {/* End candidate-info */}

                          <ul className="post-tags">
                            {candidate.tags.map((val, i) => (
                              <li key={i}>
                                <a href="#">{val}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {/* End content */}

                        <div className="option-box">
                          <ul className="option-list">
                            <li>
                              <button data-text="View Aplication">
                                <span className="la la-eye"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Approve Aplication">
                                <span className="la la-check"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Reject Aplication">
                                <span className="la la-times-circle"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Delete Aplication">
                                <span className="la la-trash"></span>
                              </button>
                            </li>
                          </ul>
                        </div>
                        {/* End admin options box */}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabPanel>
            {/* End total applicants */}

            <TabPanel>
              <div className="row">
                {currentJobs.map((candidate) => (
                  <div
                    className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                    key={candidate.id}
                  >
                    <div className="inner-box">
                      <div className="content">
                        <figure className="image">
                          <Image
                            width={90}
                            height={90}
                            src={candidate.avatar}
                            alt="candidates"
                          />
                        </figure>
                        <h4 className="name">
                          <Link href={`/candidates-single-v1/${candidate.id}`}>
                            {candidate.name}
                          </Link>
                        </h4>

                        <ul className="candidate-info">
                          <li className="designation">
                            {candidate.designation}
                          </li>
                          <li>
                            <span className="icon flaticon-map-locator"></span>{" "}
                            {candidate.location}
                          </li>
                          <li>
                            <span className="icon flaticon-money"></span> $
                            {candidate.hourlyRate} / hour
                          </li>
                        </ul>
                        {/* End candidate-info */}

                        <ul className="post-tags">
                          {candidate.tags.map((val, i) => (
                            <li key={i}>
                              <a href="#">{val}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* End content */}

                      <div className="option-box">
                        <ul className="option-list">
                          <li>
                            <button data-text="View Aplication">
                              <span className="la la-eye"></span>
                            </button>
                          </li>
                          <li>
                            <button data-text="Approve Aplication">
                              <span className="la la-check"></span>
                            </button>
                          </li>
                          <li>
                            <button data-text="Reject Aplication">
                              <span className="la la-times-circle"></span>
                            </button>
                          </li>
                          <li>
                            <button data-text="Delete Aplication">
                              <span className="la la-trash"></span>
                            </button>
                          </li>
                        </ul>
                      </div>
                      {/* End admin options box */}
                    </div>
                  </div>
                ))}
              </div>
            </TabPanel>
            {/* End approved applicants */}

            <TabPanel>
              <div className="row">
                {currentJobs.map((candidate) => (
                  <div
                    className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                    key={candidate.id}
                  >
                    <div className="inner-box">
                      <div className="content">
                        <figure className="image">
                          <Image
                            width={90}
                            height={90}
                            src={candidate.avatar}
                            alt="candidates"
                          />
                        </figure>
                        <h4 className="name">
                          <Link href={`/candidates-single-v1/${candidate.id}`}>
                            {candidate.name}
                          </Link>
                        </h4>

                        <ul className="candidate-info">
                          <li className="designation">
                            {candidate.designation}
                          </li>
                          <li>
                            <span className="icon flaticon-map-locator"></span>{" "}
                            {candidate.location}
                          </li>
                          <li>
                            <span className="icon flaticon-money"></span> $
                            {candidate.hourlyRate} / hour
                          </li>
                        </ul>
                        {/* End candidate-info */}

                        <ul className="post-tags">
                          {candidate.tags.map((val, i) => (
                            <li key={i}>
                              <a href="#">{val}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* End content */}

                      <div className="option-box">
                        <ul className="option-list">
                          <li>
                            <button data-text="View Aplication">
                              <span className="la la-eye"></span>
                            </button>
                          </li>
                          <li>
                            <button data-text="Approve Aplication">
                              <span className="la la-check"></span>
                            </button>
                          </li>
                          <li>
                            <button data-text="Reject Aplication">
                              <span className="la la-times-circle"></span>
                            </button>
                          </li>
                          <li>
                            <button data-text="Delete Aplication">
                              <span className="la la-trash"></span>
                            </button>
                          </li>
                        </ul>
                      </div>
                      {/* End admin options box */}
                    </div>
                  </div>
                ))}
              </div>
            </TabPanel>

            {/* End rejected applicants */}
          </div>
        </Tabs>
        <PaginationControls />
      </div>
    </div>
  );
};

export default WidgetContentBox;
