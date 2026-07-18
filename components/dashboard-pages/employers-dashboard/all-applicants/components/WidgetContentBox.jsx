"use client";

//import candidatesData from "../../../../../data/candidates";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import WidgetTopFilterBox from "./WidgetTopFilterBox";
import ApplicantCard from "./ApplicantCard";
//import jobs from "../../../../../data/job-featured";

import { useSearchParams } from "next/navigation";

const WidgetContentBox = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");

  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedQualification, setSelectedQualification] = useState([]);
  const [selectedGender, setSelectedGender] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [candidates, setCandidates] = useState([]);


  const [selectedJobs, setSelectedJobs] = useState([]);

  const searchParams = useSearchParams();

  const jobId = Number(searchParams.get("jobId"));

  const status = searchParams.get("status");

  const getDefaultTab = () => {
    switch (status) {
      case "Shortlisted":
        return 1;
      case "Maybe":
        return 2;
      case "Rejected":
        return 3;
      default:
        return 0;
    }
  };

  const [jobList, setJobList] = useState([]);

  useEffect(() => {
    getJobList();
  }, [jobId]);

  const getJobList = async () => {
    try {
      const response = await fetch(`/api/emp-job-applied-list?JobPostId=${jobId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const result = await response.json();

      const listData = result?.data;
      // console.log('listData  ', listData)

      if (listData) {

        setCandidates(listData);

      }
    } catch (error) {
      console.error(error);
    }
  };
  const selectedJob = candidates.find(job => job.jobId === jobId);


  const jobCandidates = candidates.filter(
    candidate => candidate.jobId === jobId
  );

  const filteredCandidates = candidates.filter((candidate) => {
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


  const updateCandidateStatus = (id, status) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === id
          ? { ...candidate, status }
          : candidate
      )
    );
  };

  const updateCandidateCallStatus = (id, callStatus) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === id
          ? { ...candidate, callStatus }
          : candidate
      )
    );
  };

  const updateCandidateComments = (id, comments) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === id
          ? { ...candidate, comments }
          : candidate
      )
    );
  };

  const handleStatus = (id, ttype) => {
    updateCandidateStatus(id, ttype);
  };
  const handleCallStatus = (id, ttype) => {
    updateCandidateCallStatus(id, ttype);
  };



  const handleShortlist = (id) => {
    updateCandidateStatus(id, "Shortlisted");
  };

  const handleMaybe = (id) => {
    updateCandidateStatus(id, "Maybe");
  };

  const handleReject = (id) => {
    updateCandidateStatus(id, "Rejected");
  };

  const handleDelete = (id) => {
    setCandidates((prev) =>
      prev.filter((candidate) => candidate.id !== id)
    );
  };

  const shortlistedCandidates = filteredCandidates.filter(
    candidate => candidate.status === "Shortlisted"
  );

  const rejectedCandidates = filteredCandidates.filter(
    (candidate) => candidate.status === "Rejected"
  );

  const maybeCandidates = filteredCandidates.filter(
    candidate => candidate.status === "Maybe"
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

  const currentShortlisted = shortlistedCandidates.slice(
    startIndex,
    endIndex
  );

  const currentRejected = rejectedCandidates.slice(
    startIndex,
    endIndex
  );
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

        <Tabs defaultIndex={getDefaultTab()}>
          <div className="aplicants-upper-bar">
            <h6>{jobId > 0 ? candidates[0]?.jobTitle : ""} </h6>

            <TabList className="aplicantion-status tab-buttons clearfix">
              <Tab className="tab-btn totals">
                Total(s): {filteredCandidates.length}
              </Tab>

              <Tab className="tab-btn approved">
                Shortlisted ({shortlistedCandidates.length})
              </Tab>

              <Tab className="tab-btn " style={{ color: "#ff9800 !important" }}>
                Maybe ({maybeCandidates.length})
              </Tab>

              <Tab className="tab-btn rejected">
                Rejected(s) {rejectedCandidates.length}
              </Tab>
            </TabList>
          </div>

          <div className="tabs-content">
            <TabPanel>
              <div className="row">
                {currentJobs.length === 0 ? (
                  <div className="col-12 text-center py-5">
                    <h5>No applicants found</h5>
                  </div>
                ) : (
                  currentJobs.map((candidate) => (
                    <ApplicantCard
                      key={candidate.id}
                      candidate={candidate}
                      onUpdateStatus={handleStatus}
                      onUpdateCallStatus={handleCallStatus}
                      // onShortlist={handleShortlist}
                      // onMaybe={handleMaybe}
                      // onReject={handleReject}
                      onDelete={handleDelete}
                      onUpdateComments={updateCandidateComments}
                    />
                  ))
                )}
              </div>
            </TabPanel>
            {/* End total applicants */}

            <TabPanel>
              <div className="row">
                {currentShortlisted.map((candidate) => (
                  <ApplicantCard
                    key={candidate.id}
                    candidate={candidate}
                    onShortlist={handleShortlist}
                    onMaybe={handleMaybe}
                    onReject={handleReject}
                    onDelete={handleDelete}
                    onUpdateComments={updateCandidateComments}
                  />
                ))}
              </div>
            </TabPanel>
            {/* End approved applicants */}

            <TabPanel>
              <div className="row">
                {maybeCandidates.map((candidate) => (
                  <ApplicantCard
                    key={candidate.id}
                    candidate={candidate}
                    onShortlist={handleShortlist}
                    onMaybe={handleMaybe}
                    onReject={handleReject}
                    onDelete={handleDelete}
                    onUpdateComments={updateCandidateComments}
                  />
                ))}
              </div>
            </TabPanel>

            <TabPanel>
              <div className="row">
                {currentRejected.map((candidate) => (
                  <ApplicantCard
                    key={candidate.id}
                    candidate={candidate}
                    onShortlist={handleShortlist}
                    onMaybe={handleMaybe}
                    onReject={handleReject}
                    onDelete={handleDelete}
                    onUpdateComments={updateCandidateComments}
                  />
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
